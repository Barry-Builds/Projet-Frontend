const assert = require('node:assert/strict');
const { readFile, readdir } = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { chromium } = require('playwright');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
};

let browser;
let origin;
let routes;
let pages;
const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = routes.get(pathname);
    if (!file) {
        response.writeHead(404).end();
        return;
    }
    try {
        const body = await readFile(file);
        response.writeHead(200, { 'Content-Type': contentTypes[path.extname(file)] });
        response.end(body);
    } catch {
        response.writeHead(500).end();
    }
});

before(async () => {
    routes = new Map([['/', path.join(root, 'index.html')], ['/index.html', path.join(root, 'index.html')]]);
    for (const folder of ['pages', 'style', 'js', 'images']) {
        const entries = await readdir(path.join(root, folder), { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && contentTypes[path.extname(entry.name)]) {
                routes.set('/' + folder + '/' + encodeURIComponent(entry.name), path.join(root, folder, entry.name));
            }
        }
    }
    pages = [...routes.keys()].filter(url => url.endsWith('.html'));
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    origin = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
});

after(async () => {
    await browser?.close();
    if (server.listening) {
        await new Promise(resolve => server.close(resolve));
    }
});

async function openPage(t, pathname) {
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    t.after(async () => {
        await page.close();
        assert.deepEqual(errors, [], 'Erreurs détectées dans le navigateur');
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' && message.location().url.startsWith(origin + '/')) {
            errors.push(message.text());
        }
    });
    page.on('response', response => {
        if (response.url().startsWith(origin + '/') && response.status() >= 400) {
            errors.push(response.status() + ' ' + response.url());
        }
    });
    await page.route('**/*', route => {
        if (route.request().url().startsWith(origin + '/')) {
            return route.continue();
        }
        return route.abort();
    });
    const response = await page.goto(origin + pathname);
    assert.equal(response.status(), 200);
    return page;
}

test('Les feuilles CSS peuvent être analysées', async () => {
    const styles = [...routes.values()].filter(file => file.endsWith('.css'));
    assert.ok(styles.length > 0);
    for (const file of styles) {
        postcss.parse(await readFile(file, 'utf8'), { from: file });
    }
});

test('Les pages chargent leurs ressources et leurs liens internes pointent vers une page existante', async t => {
    for (const pathname of pages) {
        await t.test(pathname, async t => {
            const page = await openPage(t, pathname);
            const { ids, links, brokenImages, styles } = await page.evaluate(() => ({
                ids: [...document.querySelectorAll('[id]')].map(element => element.id),
                links: [...document.querySelectorAll('a[href]')].map(anchor => anchor.href),
                brokenImages: [...document.images].filter(image => image.getAttribute('src') && image.naturalWidth === 0).map(image => image.src),
                styles: [...document.styleSheets].map(sheet => sheet.href).filter(Boolean),
            }));
            assert.equal(new Set(ids).size, ids.length, 'Les identifiants HTML doivent être uniques');
            assert.deepEqual(brokenImages, []);
            assert.ok(styles.some(url => url === origin + '/style/styles.css'));
            assert.ok(styles.some(url => url === origin + '/style/payment-styles.css'));
            for (const link of links) {
                const url = new URL(link);
                if (url.origin === origin) {
                    assert.ok(routes.has(url.pathname), 'Lien interne invalide : ' + link);
                    if (url.pathname === pathname && url.hash) {
                        assert.ok(ids.includes(decodeURIComponent(url.hash.slice(1))), 'Ancre introuvable : ' + link);
                    }
                }
            }
        });
    }
});

test('Les filtres combinent la catégorie et le prix, puis restaurent le catalogue', async t => {
    const page = await openPage(t, '/pages/vetements.html');
    const names = page.locator('#clothesProducts .product-name');
    const allProducts = await names.allTextContents();
    assert.ok(allProducts.length > 3);

    await page.selectOption('#categoryFilter', 'chemises');
    await page.selectOption('#priceFilter', '50-100');
    assert.deepEqual(await names.allTextContents(), [
        'Chemise Oxford Blanc Pur',
        'Chemise à Carreaux Écossaise',
        'Chemise Velours Côtelé Bordeaux',
    ]);

    await page.selectOption('#priceFilter', '200-');
    assert.equal(await page.locator('#clothesProducts').innerText(), 'Aucun produit trouvé');

    await page.selectOption('#categoryFilter', '');
    await page.selectOption('#priceFilter', '');
    assert.deepEqual(await names.allTextContents(), allProducts);
});

test('Le panier calcule la livraison, persiste après rechargement et permet le retrait', async t => {
    const page = await openPage(t, '/pages/vetements.html');
    const product = page.locator('.product-card').filter({ hasText: 'Chemise Oxford Blanc Pur' });
    const total = page.locator('#cartTotal');

    await product.locator('.view-btn').click();
    await page.locator('#addToCartBtn').click();
    assert.equal(await page.locator('#productModal').evaluate(modal => modal.classList.contains('active')), true);
    assert.equal(await page.locator('#cartCount').textContent(), '');
    await page.getByRole('button', { name: 'Sélectionner la taille M', exact: true }).click();
    await page.locator('#addToCartBtn').click();

    await page.locator('#cartBtn').click();
    assert.equal(await total.innerText(), '105.00€');
    assert.equal(await page.locator('#cartShipping').isVisible(), true);
    await page.locator('#cartOverlay').click({ position: { x: 5, y: 5 } });

    await product.locator('.view-btn').click();
    await page.getByRole('button', { name: 'Sélectionner la taille M', exact: true }).click();
    await page.locator('#addToCartBtn').click();
    await page.reload();
    assert.equal(await page.locator('#cartCount').innerText(), '2');

    await page.locator('#cartBtn').click();
    assert.equal(await page.locator('.cart-item').count(), 1);
    assert.equal(await total.innerText(), '190.00€');
    assert.equal(await page.locator('#cartShipping').isVisible(), false);
    await page.getByRole('button', { name: /Retirer Chemise Oxford/ }).click();
    assert.equal(await page.locator('#cartItems').innerText(), 'Votre panier est vide');
    assert.equal(await total.innerText(), '0.00€');
});

test('Le formulaire de contact refuse les champs invalides et se réinitialise après validation', async t => {
    const page = await openPage(t, '/pages/contact.html');
    const submit = page.locator('#contactForm button[type="submit"]');
    const name = page.locator('#contactName');
    const email = page.locator('#contactEmail');
    const message = page.locator('#contactMessage');

    await name.fill('C');
    await email.fill('invalide');
    await message.fill('Court');
    await submit.click();
    for (const id of ['nameError', 'emailError', 'messageError']) {
        assert.ok(await page.locator('#' + id).textContent());
    }
    assert.equal(await email.inputValue(), 'invalide');

    await name.fill('Camille');
    await email.fill('camille@example.com');
    await message.fill('Bonjour, cet article est-il disponible ?');
    await submit.click();
    assert.equal(await email.inputValue(), '');
    assert.equal(await page.locator('#emailError').textContent(), '');
    assert.equal(await page.getByText('Merci ! Nous vous recontacterons bientôt.').isVisible(), true);
});
