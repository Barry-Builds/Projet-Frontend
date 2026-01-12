const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
const APP_CONFIG = {
    CART_STORAGE_KEY: 'oldstyle-cart',
    NOTIFICATION_TIMEOUT: 3000,
    ANIMATION_DURATION: 300
};


function initializeCartAndPayment() {
    
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    const continueShoppingBtn = document.getElementById('continueShopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', closeCart);
    }
    
    const closePaymentBtn = document.getElementById('closePayment');
    if (closePaymentBtn) {
        closePaymentBtn.addEventListener('click', closePaymentModal);
    }
    
    const checkoutBtns = document.querySelectorAll('.checkout-btn');
    checkoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (cart.length === 0) {
                showNotification('Votre panier est vide', 'error');
                return;
            }
            openPaymentModal();
        });
    });
    
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            value = value.replace(/\D/g, '');
            value = value.substring(0, 16);
            const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = formatted;
        });
    }
    
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 1) {
                const firstDigit = value[0];
                if (firstDigit !== '0' && firstDigit !== '1') {
                    value = '';
                    e.target.value = value;
                    return;
                }
            }
            
            if (value.length >= 2) {
                const month = value.substring(0, 2);
                if (month[0] === '0') {
                    
                    if (month === '00') {
                        value = '';
                        e.target.value = value;
                        return;
                    }
                } else if (month[0] === '1') {
                    
                    if (parseInt(month[1]) > 2) {
                        value = value.substring(0, 1);
                    }
                }
            }
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
        
        expiryDateInput.addEventListener('blur', function(e) {
            const value = e.target.value;
            if (value.length === 5) { 
                const month = parseInt(value.substring(0, 2));
                const year = parseInt(value.substring(3, 5));
                
                const now = new Date();
                const currentMonth = now.getMonth() + 1; 
                const currentYear = parseInt(now.getFullYear().toString().substring(2)); 
                
                if (month < 1 || month > 12) {
                    e.target.value = '';
                    showNotification('Le mois doit être entre 01 et 12', 'error');
                    return;
                }
                
                if (year < currentYear) {
                    e.target.value = '';
                    showNotification('L\'année d\'expiration doit être supérieure ou égale à l\'année en cours', 'error');
                    return;
                }
                
                if (year === currentYear && month <= currentMonth) {
                    e.target.value = '';
                    showNotification('La date d\'expiration doit être valide', 'error');
                    return;
                }
            }
        });
    }
    
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.substring(0, 3);
        });
    }
    
    const zipCodeInput = document.getElementById('zipCode');
    if (zipCodeInput) {
        zipCodeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.substring(0, 7);
        });
    }
    
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }
    
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
}



const products = [
    {
        id: 1,
        name: "Chemise Oxford Blanc Pur",
        category: "chemises",
        price: 95,
        image: "images/image1.jpg",
        description: "Chemise Oxford intemporelle en coton blanc impeccable",
        details: "Coton égyptien 100% premium. Col button-down classique. Cufflinks compatibles. La pièce maîtresse d'une garde-robe d'exception.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 2,
        name: "Chemise à Carreaux Écossaise",
        category: "chemises",
        price: 88,
        image: "images/image2.jpg",
        description: "Chemise tartan écossais authentique - Style heritage",
        details: "Laine peignée 80%, coton 20%. Motif tartan Royal Stuart. Poches plaquées renforcées. Incontournable du dresscode britannique.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        featured: true
    },
    {
        id: 3,
        name: "Chemise Velours Côtelé Bordeaux",
        category: "chemises",
        price: 92,
        image: "images/image3.jpg",
        description: "Chemise velours côtelé couleur bordeaux sophistiquée",
        details: "Velours de coton premium 14 points. Teinte bordeaux profonde et riche. Parfaite pour automne et hiver. Élégance sans effort.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        id: 4,
        name: "Pantalon Chino Beige Premium",
        category: "pantalons",
        price: 125,
        image: "images/image4.jpg",
        description: "Pantalon chino beige clair - Coupe impeccable",
        details: "98% coton, 2% élasthane. Ceinture intégrée invisible. Plis marqués. La référence du chino de luxe. Versatile et intemporel.",
        sizes: ["28", "30", "32", "34", "36", "38", "40"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 5,
        name: "Pantalon Smoking Noir Classique",
        category: "pantalons",
        price: 180,
        image: "images/image5.jpg",
        description: "Pantalon smoking avec bande de soie noire",
        details: "Laine italienne tissée serrée. Bande de soie authentique sur le côté. Coupe slim vintage. Pour les soirs de gala.",
        sizes: ["28", "30", "32", "34", "36", "38"]
    },
    {
        id: 6,
        name: "Pantalon Flanelle Gris Anthracite",
        category: "pantalons",
        price: 115,
        image: "images/image6.jpg",
        description: "Pantalon flanelle gris anthracite - Douceur premium",
        details: "Flanelle peignée 100% laine. Gris anthracite profond. Très chaud et doux. Idéal pour bureau et occasions formelles.",
        sizes: ["28", "30", "32", "34", "36", "38"]
    },
    {
        id: 7,
        name: "Pull Laine Mérinos Écru",
        category: "pulls",
        price: 140,
        image: "images/image7.jpg",
        description: "Pull laine mérinos écru - Confort inégalé",
        details: "100% mérinos extrafine 18 microns. Hypoallergénique. Thermorégulant naturel. Douceur incomparable contre la peau.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 8,
        name: "Pull Laine Mérinos Bleu Marine",
        category: "pulls",
        price: 138,
        image: "images/image8.jpg",
        description: "Pull mérinos bleu marine - Classique intemporel",
        details: "100% laine mérinos premium. Bleu marine profond et riche. Encolure ronde classique. Perfection incarnée.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        id: 9,
        name: "Pull Cachemire Col Châle",
        category: "pulls",
        price: 250,
        image: "images/image9.jpg",
        description: "Pull cachemire avec col châle - Luxe absolu",
        details: "100% cachemire du Cachemire. Col châle enveloppant. Épaisseur 12gg. L'essence même de l'élégance.",
        sizes: ["S", "M", "L", "XL"],
        badge: "Exclusif"
    },
    {
        id: 10,
        name: "Costume Gris Anthracite Trois Pièces",
        category: "costumes",
        price: 550,
        image: "images/image10.jpg",
        description: "Costume trois pièces complet gris anthracite",
        details: "Laine italienne tissée fine. Veste, pantalon, gilet. Doublure soie. Coupe sartoriale britannique. Perfection absolue.",
        sizes: ["36", "38", "40", "42", "44", "46"],
        badge: "Luxe",
        featured: true
    },
    {
        id: 11,
        name: "Costume Bleu Marine Roi",
        category: "costumes",
        price: 520,
        image: "images/image11.jpg",
        description: "Costume bleu marine roi prestige",
        details: "Laine tissée fine 110s. Bleu marine intense. Veste 2-boutons, ceinture pantalon intégrée. Pour les hommes exigeants.",
        sizes: ["36", "38", "40", "42", "44", "46"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 12,
        name: "Costume Bordeaux Velours",
        category: "costumes",
        price: 480,
        image: "images/image12.jpg",
        description: "Costume velours côtelé couleur bordeaux",
        details: "Velours de coton premium. Teinte bordeaux somptueux. Édition limitée. Pour les soirées prestigieuses.",
        sizes: ["38", "40", "42", "44"]
    },
    {
        id: 13,
        name: "Chaussures Oxford Cuir Marron Cognac",
        category: "accessoires",
        type: "chaussures",
        price: 320,
        image: "images/image13.jpg",
        description: "Chaussures Oxford en cuir marron cognac",
        details: "Cuir pleine fleur vieilli. Semelle cuir cousue Goodyear. Finition cirée manuelle. Best-seller depuis une décennie.",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 14,
        name: "Chaussures Oxford Noir Brillant",
        category: "accessoires",
        type: "chaussures",
        price: 330,
        image: "images/image14.jpg",
        description: "Chaussures Oxford noir poli brillant",
        details: "Cuir lisse haut de gamme. Poli miroir. Semelle en cuir. Incontournable pour soirées formelles.",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"],
        featured: true
    },
    {
        id: 15,
        name: "Bottines Chelsea Marron Riche",
        category: "accessoires",
        type: "chaussures",
        price: 280,
        image: "images/image15.jpg",
        description: "Bottines Chelsea marron riche élastiquées",
        details: "Cuir pleine fleur marron riche. Bandes élastiques côtés. Talon chaussette. Polyvalentes et raffinées.",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"]
    },
    {
        id: 16,
        name: "Cravate Soie Bordeaux Unie",
        category: "accessoires",
        type: "cravates",
        price: 65,
        image: "images/image16.jpg",
        description: "Cravate soie bordeaux unie luxe",
        details: "100% soie italienne 7 plis. Bordeaux profond. Fermeture anglaise. Nœud classique impeccable.",
        sizes: ["Unique"],
        badge: "Best-seller"
    },
    {
        id: 17,
        name: "Cravate Soie Motif Géométrique",
        category: "accessoires",
        type: "cravates",
        price: 68,
        image: "images/image17.jpg",
        description: "Cravate soie motif géométrique discret",
        details: "100% soie premium. Motif géométrique subtil. Largeur classique. Pour hommes de style affirmé.",
        sizes: ["Unique"]
    },
    {
        id: 18,
        name: "Cravate Laine Tartan Écossais",
        category: "accessoires",
        type: "cravates",
        price: 55,
        image: "images/image18.jpg",
        description: "Cravate laine tartan écossais authentique",
        details: "Laine peignée 100%. Tartan écossais classique. Texture riche et élégante. Heritage britannique.",
        sizes: ["Unique"]
    },
    {
        id: 19,
        name: "Ceinture Cuir Marron Pleine Fleur",
        category: "accessoires",
        type: "ceintures",
        price: 85,
        image: "images/image19.jpg",
        description: "Ceinture cuir marron pleine fleur",
        details: "Cuir pleine fleur vieilli. Boucle laiton massif. Piqûres renforcées. Héritage pour des générations.",
        sizes: ["S", "M", "L", "XL"],
        badge: "Best-seller"
    },
    {
        id: 20,
        name: "Ceinture Cuir Noir Classique",
        category: "accessoires",
        type: "ceintures",
        price: 78,
        image: "images/image20.jpg",
        description: "Ceinture cuir noir classique poli",
        details: "Cuir noir poli. Boucle acier inoxydable. Pérennité garantie. L'essentiel de l'élégance.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 21,
        name: "Ceinture Cuir Réversible Marron Noir",
        category: "accessoires",
        type: "ceintures",
        price: 95,
        image: "images/image21.jpg",
        description: "Ceinture cuir réversible marron et noir",
        details: "Cuir réversible 2 en 1. Boucle interchangeable. Versatile et intelligente. Investissement malin.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 22,
        name: "Montre Classique Boîtier Or 18 Carats",
        category: "accessoires",
        type: "montres",
        price: 420,
        image: "images/image22.jpg",
        description: "Montre classique boîtier or 18 carats",
        details: "Boîtier or 18 carats. Verre saphir. Mouvement quartz suisse. Design intemporel années 70.",
        sizes: ["Unique"],
        badge: "Exclusif",
        featured: true
    },
    {
        id: 23,
        name: "Montre Acier Inoxydable Prestige",
        category: "accessoires",
        type: "montres",
        price: 280,
        image: "images/image23.jpg",
        description: "Montre acier inoxydable prestige",
        details: "Boîtier acier brossé 316L. Verre saphir antireflet. Mouvement quartz fiable. Symbole d'intemporalité.",
        sizes: ["Unique"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 24,
        name: "Chapeau Fedora Feutre Noir Premium",
        category: "accessoires",
        type: "chapeaux",
        price: 95,
        image: "images/image24.jpg",
        description: "Chapeau fedora feutre noir premium",
        details: "Feutre 100% laine peignée. Ruban soie authentique. Intérieur cuir. Style intemporel garanti.",
        sizes: ["S", "M", "L", "XL"],
        badge: "Populaire",
        featured: true
    },
    {
        id: 25,
        name: "Chapeau Fedora Gris Taupe Subtil",
        category: "accessoires",
        type: "chapeaux",
        price: 92,
        image: "images/image25.jpg",
        description: "Chapeau fedora gris taupe subtil",
        details: "Feutre gris taupe premium. Teinte rare et sophistiquée. Élégance discrète. Pour connaisseurs.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 26,
        name: "Gants Cuir Cachemire Marron",
        category: "accessoires",
        type: "gants",
        price: 125,
        image: "images/image26.jpg",
        description: "Gants cuir doublés cachemire marron",
        details: "Cuir de chèvre souple. Doublure cachemire 100%. Couture française. Douceur et chaleur absolues.",
        sizes: ["S", "M", "L", "XL"],
        badge: "Best-seller",
        featured: true
    },
    {
        id: 27,
        name: "Gants Laine Mérinos Noir",
        category: "accessoires",
        type: "gants",
        price: 75,
        image: "images/image27.jpg",
        description: "Gants laine mérinos noir",
        details: "100% mérinos extrafine. Noir profond. Thermorégulant naturel. Très chauds et élégants.",
        sizes: ["S", "M", "L", "XL"]
    }
];



let cart = JSON.parse(localStorage.getItem(APP_CONFIG.CART_STORAGE_KEY)) || [];
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.add('active');
    } else {
        cartCount.textContent = '';
        cartCount.classList.remove('active');
    }
    cartCount.setAttribute('aria-label', `${totalItems} article${totalItems > 1 ? 's' : ''} dans le panier`);
}
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartShipping = document.getElementById('cartShipping');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        cartTotal.textContent = '0.00€';
        if (cartShipping) cartShipping.style.display = 'none';
        return;
    }
    let totalPrice = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        return `
            <div class="cart-item" role="listitem">
                <div class="cart-item-image">
                    <img src="${basePath}${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-size">Taille: ${item.size}</div>
                    <div class="cart-item-price">${itemTotal.toFixed(2)}€</div>
                    <small style="opacity: 0.6;">Quantité: ${item.quantity}</small>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})" aria-label="Retirer ${item.name} du panier">Retirer</button>
            </div>
        `;
    }).join('');
    cartTotal.textContent = totalPrice.toFixed(2) + '€';
    
    if (cartShipping) {
        if (totalPrice < 100) {
            cartShipping.style.display = 'block';
            const totalWithShipping = totalPrice + 10;
            cartTotal.textContent = totalWithShipping.toFixed(2) + '€';
        } else {
            cartShipping.style.display = 'none';
            cartTotal.textContent = totalPrice.toFixed(2) + '€';
        }
    }
}
function addToCart(product, size, quantity) {
    
    if (!product || !size || quantity < 1) {
        showNotification('Erreur: Données invalides', 'error');
        return;
    }
    const existingItem = cart.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }
    
    try {
        localStorage.setItem(APP_CONFIG.CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error);
        showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        try {
            localStorage.setItem(APP_CONFIG.CART_STORAGE_KEY, JSON.stringify(cart));
            updateCartCount();
            renderCart();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}



function renderProducts(productsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur avec l'ID ${containerId} non trouvé`);
        return;
    }
    if (productsToShow.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 40px;">Aucun produit trouvé</p>';
        return;
    }
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card" role="listitem">
            <div class="product-image">
                <img src="${basePath}${product.image}" alt="${product.name} - ${product.description}">
                ${product.badge ? `<div class="product-badge" aria-label="Badge: ${product.badge}">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category" aria-label="Catégorie: ${product.category}">${capitalizeFirst(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price" aria-label="Prix: ${product.price.toFixed(2)} euros">${product.price.toFixed(2)}€</span>
                    <button class="view-btn" onclick="openProductModal(${product.id})" aria-label="Voir plus de détails sur ${product.name}">
                        Voir plus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}



let currentProduct = null;
let selectedSize = null;
function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) {
        showNotification('Produit non trouvé', 'error');
        return;
    }
    selectedSize = null;
    document.getElementById('modalImage').src = basePath + currentProduct.image;
    document.getElementById('modalImage').alt = `${currentProduct.name} - ${currentProduct.description}`;
    document.getElementById('modalTitle').textContent = currentProduct.name;
    document.getElementById('modalDescription').textContent = currentProduct.description;
    document.getElementById('modalPrice').textContent = currentProduct.price.toFixed(2) + '€';
    document.getElementById('modalDetails').textContent = currentProduct.details;
    
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = currentProduct.sizes.map(size => `
        <button class="size-option" onclick="selectSize('${size}', event)" aria-label="Sélectionner la taille ${size}">${size}</button>
    `).join('');
    document.getElementById('quantity').value = 1;
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
}
function selectSize(size, event) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
    });
    event.target.classList.add('selected');
    event.target.setAttribute('aria-pressed', 'true');
}
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentProduct = null;
    selectedSize = null;
}



function openCart() {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}



function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    const bgColor = {
        'success': 'var(--success-color)',
        'error': '#d32f2f',
        'info': 'var(--info-color)',
        'warning': 'var(--warning-color)'
    }[type] || 'var(--success-color)';
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 5001;
        animation: slideIn ${APP_CONFIG.ANIMATION_DURATION}ms ease-out;
        max-width: 400px;
        text-align: center;
    `;
    notif.setAttribute('role', 'alert');
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = `slideOut ${APP_CONFIG.ANIMATION_DURATION}ms ease-out`;
        setTimeout(() => notif.remove(), APP_CONFIG.ANIMATION_DURATION);
    }, APP_CONFIG.NOTIFICATION_TIMEOUT);
}



function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validateContactForm() {
    const form = document.getElementById('contactForm');
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const subject = document.getElementById('contactSubject');
    const message = document.getElementById('contactMessage');
    let isValid = true;
    
    if (name && name.value.trim().length < 2) {
        if (document.getElementById('nameError')) {
            document.getElementById('nameError').textContent = 'Le nom doit contenir au moins 2 caractères';
        }
        isValid = false;
    } else if (document.getElementById('nameError')) {
        document.getElementById('nameError').textContent = '';
    }
    
    if (email && !validateEmail(email.value)) {
        if (document.getElementById('emailError')) {
            document.getElementById('emailError').textContent = 'Veuillez entrer un email valide';
        }
        isValid = false;
    } else if (document.getElementById('emailError')) {
        document.getElementById('emailError').textContent = '';
    }
    
    if (subject && subject.value.trim().length < 3) {
        if (document.getElementById('subjectError')) {
            document.getElementById('subjectError').textContent = 'Le sujet doit contenir au moins 3 caractères';
        }
        isValid = false;
    } else if (document.getElementById('subjectError')) {
        document.getElementById('subjectError').textContent = '';
    }
    
    if (message && message.value.trim().length < 10) {
        if (document.getElementById('messageError')) {
            document.getElementById('messageError').textContent = 'Le message doit contenir au moins 10 caractères';
        }
        isValid = false;
    } else if (document.getElementById('messageError')) {
        document.getElementById('messageError').textContent = '';
    }
    return isValid;
}



function setupForms() {
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateContactForm()) {
                try {
                    
                    const contactData = {
                        name: document.getElementById('contactName').value,
                        email: document.getElementById('contactEmail').value,
                    };
                    
                    const subjectField = document.getElementById('contactSubject');
                    if (subjectField) {
                        contactData.subject = subjectField.value;
                    }
                    
                    const messageField = document.getElementById('contactMessage');
                    if (messageField) {
                        contactData.message = messageField.value;
                    }
                    console.log('Formulaire de contact valide:', contactData);
                    showNotification('Merci ! Nous vous recontacterons bientôt.', 'success');
                    this.reset();
                } catch (error) {
                    console.error('Erreur lors de l\'envoi:', error);
                    showNotification('Erreur lors de l\'envoi du formulaire', 'error');
                }
            } else {
                showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            }
        });
    }
    
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            if (validateEmail(email)) {
                try {
                    console.log('Email newsletter:', email);
                    showNotification('Inscription réussie ! Bienvenue dans notre newsletter.', 'success');
                    this.reset();
                    document.getElementById('newsletterError').textContent = '';
                } catch (error) {
                    console.error('Erreur lors de l\'inscription:', error);
                    showNotification('Erreur lors de l\'inscription', 'error');
                }
            } else {
                
                showNotification('Veuillez entrer un email valide', 'error');
            }
        });
    }
}



function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const clothesContainer = document.getElementById('clothesProducts');
    const accessoriesContainer = document.getElementById('accessoriesProducts');
    function applyFilters() {
        
        if (clothesContainer) {
            
            let filtered = products.filter(p => p.category !== 'accessoires');
            if (categoryFilter && categoryFilter.value) {
                filtered = filtered.filter(p => p.category === categoryFilter.value);
            }
            if (priceFilter && priceFilter.value) {
                const [min, max] = priceFilter.value.split('-').map(Number);
                filtered = filtered.filter(p => p.price >= min && (max ? p.price <= max : true));
            }
            renderProducts(filtered, 'clothesProducts');
        } else if (accessoriesContainer) {
            
            let filtered = products.filter(p => p.category === 'accessoires');
            if (categoryFilter && categoryFilter.value) {
                filtered = filtered.filter(p => p.type === categoryFilter.value);
            }
            if (priceFilter && priceFilter.value) {
                const [min, max] = priceFilter.value.split('-').map(Number);
                filtered = filtered.filter(p => p.price >= min && (max ? p.price <= max : true));
            }
            renderProducts(filtered, 'accessoriesProducts');
        }
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
        categoryFilter.addEventListener('change', function() {
            this.blur(); 
        });
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
        priceFilter.addEventListener('change', function() {
            this.blur(); 
        });
    }
}



document.addEventListener('DOMContentLoaded', function() {
    try {
        
        const featuredProductsContainer = document.getElementById('featuredProducts');
        if (featuredProductsContainer) {
            renderProducts(products.filter(p => p.featured), 'featuredProducts');
        }
        const accessoriesProductsContainer = document.getElementById('accessoriesProducts');
        if (accessoriesProductsContainer) {
            renderProducts(products.filter(p => p.category === 'accessoires'), 'accessoriesProducts');
        }
        const clothesProductsContainer = document.getElementById('clothesProducts');
        if (clothesProductsContainer) {
            renderProducts(products.filter(p => p.category !== 'accessoires'), 'clothesProducts');
        }
        
        updateCartCount();
        renderCart();
        
        initializeCartAndPayment();
        
        const exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', function() {
                const clothesSection = document.querySelector('#vetements');
                if (clothesSection) {
                    clothesSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                if (!selectedSize) {
                    showNotification('Veuillez sélectionner une taille', 'error');
                    return;
                }
                const quantity = parseInt(document.getElementById('quantity').value);
                if (quantity < 1) {
                    showNotification('La quantité doit être au moins 1', 'error');
                    return;
                }
                addToCart(currentProduct, selectedSize, quantity);
                closeProductModal();
            });
        }
        const increaseQtyBtn = document.getElementById('increaseQty');
        if (increaseQtyBtn) {
            increaseQtyBtn.addEventListener('click', function() {
                const qty = document.getElementById('quantity');
                qty.value = parseInt(qty.value) + 1;
            });
        }
        const decreaseQtyBtn = document.getElementById('decreaseQty');
        if (decreaseQtyBtn) {
            decreaseQtyBtn.addEventListener('click', function() {
                const qty = document.getElementById('quantity');
                if (parseInt(qty.value) > 1) {
                    qty.value = parseInt(qty.value) - 1;
                }
            });
        }
        
        setupForms();
        setupFilters();
        console.log('Application initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors du chargement de l\'application', 'error');
    }
});



const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);



function openPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}
function closePaymentFlow() {
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.classList.remove('active');
    }
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.remove('active');
    }
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    cart = [];
    renderCart();
    
    window.location.href = 'index.html';
}



function handlePaymentSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvc = document.getElementById('cvc').value.trim();
    
    if (!fullName || !address || !city || !zipCode || !cardNumber || !expiryDate || !cvc) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const confirmationAddress = `
        ${address}<br>
        ${zipCode} ${city}<br>
        <strong>${fullName}</strong>
    `;
    const confirmationAddressElem = document.getElementById('confirmationAddress');
    if (confirmationAddressElem) {
        confirmationAddressElem.innerHTML = confirmationAddress;
    }
    
    closePaymentModal();
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.classList.add('active');
    }
}

