# Old Style - E-Commerce Vintage

## Présentation

**Old Style** est une boutique e-commerce spécialisée dans la vente de vêtements et accessoires vintage haut de gamme. Le site propose une expérience d'achat complète avec catalogue produit, panier persistant et système de paiement.

## Technologies Utilisées

- **HTML5** - Structure et sémantique
- **CSS3** - Mise en page responsive et animations
- **JavaScript** - Logique applicative côté client
- **LocalStorage** - Persistance du panier

## Structure du Projet

Projet Front End/
├── index.html              # Page d'accueil
├── pages/
│   ├── vetements.html      # Catalogue vêtements
│   ├── accessoires.html    # Catalogue accessoires
│   ├── contact.html        # Formulaire contact
│   ├── privacy.html        # Politique de confidentialité
│   └── cgv.html            # Conditions générales de vente
├── style/
│   ├── styles.css          # Styles principaux
│   └── payment-styles.css  # Styles du système de paiement
├── js/
│   └── script.js           # Logique applicative
└── images/                 # Ressources visuelles (28 images)

## Fonctionnalités Principales

### 1. Catalogue Produits
- **27 produits uniques** répartis en deux catégories
- **12 vêtements** : chemises, pantalons, pulls, costumes
- **15 accessoires** : chaussures, cravates, ceintures, montres, chapeaux, gants
- Descriptions détaillées et spécifications pour chaque article

### 2. Système de Filtrage
- **Vêtements** : Filtrage par catégorie et gamme de prix
- **Accessoires** : Filtrage par type et gamme de prix
- Mise à jour en temps réel de l'affichage

### 3. Panier d'Achat
- Ajout/suppression d'articles
- Sélection de tailles
- Calcul automatique du total
- Livraison gratuite dès 100€
- Frais de livraison de 10€ en dessous
- **Persistance via LocalStorage** - Le panier reste sauvegardé après fermeture du navigateur

### 4. Paiement Simulé
- Formulaire de paiement complet
- Validation des champs (nom, adresse, code postal, numéro de carte, CVV, expiration)
- Confirmation de commande avec adresse de livraison

### 5. Sections Informatives
- **Page d'accueil** : Présentations et meilleures ventes (12 produits en avant)
- **À propos** : Présentation de la marque et ses valeurs
- **Newsletter** : Inscription avec validation email
- **Mentions légales** : Politique de confidentialité et CGV

### Gestion des Images
- Système de chemins dynamique qui s'adapte au répertoire actuel
- Fonctionne sur index.html (`images/`) et pages subdirectory (`../images/`)
- 28 images locales pour une performance optimale

### Logique du Panier
- Variable globale `basePath` détecte la location et ajuste les chemins
- Les produits sont stockés avec toutes les propriétés (taille, quantité, prix)
- Mise à jour du badge de comptage en temps réel

### Système de Filtrage Avancé
- Les vêtements filtrés par `category` (chemises, pantalons, pulls, costumes)
- Les accessoires filtrés par `type` (chaussures, cravates, etc.)
- Les filtres de prix supportent les limites ouvertes (ex: "150€+" sans maximum)

## Données Produits

Chaque produit contient :
- **ID unique**
- **Nom et description** (textes uniques, non génériques)
- **Catégorie** (vêtements ou accessoires)
- **Type** (sous-catégorie pour les filtres)
- **Prix** en euros
- **Image** locale
- **Détails** (matière, entretien, etc.)
- **Tailles disponibles**
- **Badge optionnel** (ex: "Nouveau", "Promo")
- **Flag featured** (pour les meilleures ventes)

## Navigation

- **Header sticky** - Navigation toujours visible en haut
- **Menu mobile** - Adapté aux petits écrans
- **Panier latéral** - Accessible depuis n'importe quelle page
- **Modales** - Détails produit et formulaire de paiement
- **Scroll smooth** - Navigation fluide

## Couleurs & Thème

- **Primaire** : #1a1a1a (noir profond)
- **Accent** : #d4af37 (or - Old Money)
- **Secondaire** : #2d2d2d (gris foncé)
- **Texte** : #e8e8e8 (gris clair)
- Thème dark elegant avec touches dorées

## Accessibilité

- Attributs `aria-label` et `role` pour les lecteurs d'écran
- Formulaires avec labels associés
- Messages d'erreur avec `role="alert"`
- Navigation au clavier possible
- Contraste suffisant pour la lisibilité

## Utilisation

### Lancer le Site
1. Ouvrir `index.html` dans un navigateur web
2. Aucune installation ou serveur requis - fonctionne directement

### Ajouter un Article au Panier
1. Cliquer sur un produit pour voir les détails
2. Sélectionner une taille
3. Définir la quantité
4. Cliquer "Ajouter au panier"

### Passer Commande
1. Cliquer sur le bouton "Commander" dans le panier
2. Remplir le formulaire de paiement
3. Valider - Confirmation affichée avec adresse de livraison

## Performance

- **Chargement instant** - Pas de requêtes serveur
- **Images optimisées** - Format JPG compressé
- **CSS minifiée** - Pas de dépendances externes
- **JavaScript léger** - Code pur

## Limitations

- Paiement simulé
- Contact formulaire non fonctionnel côté serveur
- Pas de base de données - données statiques

## Améliorations Futures

- Base de données (MySQL) pour les produits et traiter les commandes
- Authentification utilisateur
- Historique commandes
- Intégration paiement réelle
- Système d'avis clients