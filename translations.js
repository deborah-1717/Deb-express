// Complete translations
const translations = {
    en: {
        heroTitle: "Freshly Baked With Love",
        heroSubtitle: "Experience the finest handcrafted pastries, cakes, and snacks made fresh daily with premium ingredients.",
        signInTitle: "Sign In",
        signInDesc: "Already have an account?",
        signInBtn: "Sign In",
        joinTitle: "Join Experience",
        joinDesc: "New customer? Create account",
        joinBtn: "Join Now",
    
      
        featuresTitle: "Why Choose Us?",
        feature1Title: "Fresh Ingredients",
        feature1Desc: "Premium quality ingredients sourced daily for the perfect taste.",
        howTitle: "How It Works",
        step1Title: "Browse",
        step1Desc: "Explore our delicious menu",
        step2Title: "Add to Cart",
        step2Desc: "Select your favorites",
        step3Title: "Sign In",
        step3Desc: "Login required at checkout",
        step4Title: "WhatsApp Order",
        step4Desc: "Confirm via WhatsApp",
        menuTitle: "Our Menu 🍰",
        cartTitle: "Your Cart",
        totalLabel: "Total:",
        checkoutBtnText: "Proceed to Checkout",
        searchPlaceholder: "Search for pastries, cakes, snacks...",
        allItems: "All Items",
        cakes: "Cakes",
        pastries: "Pastries",
        savory: "Savory",
        drinks: "Drinks"
    },
    fr: {
        heroTitle: "Fraîchement cuit avec amour",
        heroSubtitle: "Découvrez nos pâtisseries artisanales fraîches chaque jour.",
        signInTitle: "Se connecter",
        signInDesc: "Déjà un compte?",
        signInBtn: "Connexion",
        joinTitle: "Rejoindre",
        joinDesc: "Nouveau client? Créer un compte",
        joinBtn: "Rejoindre",
       
        featuresTitle: "Pourquoi nous choisir?",
        feature1Title: "Ingrédients frais",
        feature1Desc: "Ingrédients de qualité premium.",
        howTitle: "Comment ça marche",
        step1Title: "Parcourir",
        step1Desc: "Explorez notre menu",
        step2Title: "Ajouter",
        step2Desc: "Sélectionnez",
        step3Title: "Connexion",
        step3Desc: "Connexion requise",
        step4Title: "WhatsApp",
        step4Desc: "Confirmez",
        menuTitle: "Notre Menu 🍰",
        cartTitle: "Votre Panier",
        totalLabel: "Total:",
        checkoutBtnText: "Payer",
        searchPlaceholder: "Rechercher...",
        allItems: "Tous",
        cakes: "Gâteaux",
        pastries: "Viennoiseries",
        savory: "Salé",
        drinks: "Boissons"
    },
    es: {
        heroTitle: "Horneado con amor",
        heroSubtitle: "Pasteles y bocadillos artesanales frescos cada día.",
        signInTitle: "Iniciar sesión",
        signInDesc: "¿Ya tienes cuenta?",
        signInBtn: "Iniciar",
        joinTitle: "Unirse",
        joinDesc: "¿Nuevo cliente? Crear cuenta",
        joinBtn: "Unirse",
       
        featuresTitle: "¿Por qué elegirnos?",
        feature1Title: "Ingredientes frescos",
        feature1Desc: "Ingredientes de calidad premium.",
        howTitle: "Cómo funciona",
        step1Title: "Explorar",
        step1Desc: "Explora nuestro menú",
        step2Title: "Añadir",
        step2Desc: "Selecciona",
        step3Title: "Iniciar",
        step3Desc: "Inicio requerido",
        step4Title: "WhatsApp",
        step4Desc: "Confirma",
        menuTitle: "Nuestro Menú 🍰",
        cartTitle: "Tu Carrito",
        totalLabel: "Total:",
        checkoutBtnText: "Pagar",
        searchPlaceholder: "Buscar...",
        allItems: "Todos",
        cakes: "Pasteles",
        pastries: "Bollería",
        savory: "Salado",
        drinks: "Bebidas"
    },
    yo: {
        heroTitle: "Ti tuntun pẹlu ifẹ",
        heroSubtitle: "Awọn akara, keki, ati ounjẹ tuntun lojoojumọ.",
        signInTitle: "Wọle",
        signInDesc: "Ṣe o ni akọọlẹ?",
        signInBtn: "Wọle",
        joinTitle: "Darapọ",
        joinDesc: "Alabara tuntun? Ṣẹda akọọlẹ",
        joinBtn: "Darapọ",
      
        featuresTitle: "Kini idi ti o fi yan wa?",
        feature1Title: "Awọn eroja tuntun",
        feature1Desc: "Awọn eroja didara julọ.",
        howTitle: "Bi o ṣe n ṣiṣẹ",
        step1Title: "Wo",
        step1Desc: "Wo akojọ wa",
        step2Title: "Fi sinu",
        step2Desc: "Yan awọn ayanfẹ",
        step3Title: "Wọle",
        step3Desc: "Wọle nilo",
        step4Title: "WhatsApp",
        step4Desc: "Jẹrisi",
        menuTitle: "Akojọ Wa 🍰",
        cartTitle: "Kẹkẹ Rẹ",
        totalLabel: "Lapapọ:",
        checkoutBtnText: "Tọsi isanwo",
        searchPlaceholder: "Wa akara...",
        allItems: "Gbogbo",
        cakes: "Keki",
        pastries: "Bọli",
        savory: "Ounjẹ",
        drinks: "Ohun mimu"
    },
    pcm: {
        heroTitle: "Fresh bread with love",
        heroSubtitle: "Fresh pastries, cakes, and snacks wey we make everyday.",
        signInTitle: "Sign In",
        signInDesc: "You get account?",
        signInBtn: "Sign In",
        joinTitle: "Join",
        joinDesc: "New customer? Create account",
        joinBtn: "Join",
      
        
        featuresTitle: "Why you go choose us?",
        feature1Title: "Fresh Ingredients",
        feature1Desc: "We use fresh things.",
        howTitle: "How e take work",
        step1Title: "Browse",
        step1Desc: "Look menu",
        step2Title: "Add to cart",
        step2Desc: "Select your choice",
        step3Title: "Sign In",
        step3Desc: "Login required",
        step4Title: "WhatsApp",
        step4Desc: "Confirm",
        menuTitle: "Our Menu 🍰",
        cartTitle: "Your Cart",
        totalLabel: "Total:",
        checkoutBtnText: "Checkout",
        searchPlaceholder: "Search...",
        allItems: "All",
        cakes: "Cakes",
        pastries: "Pastries",
        savory: "Savory",
        drinks: "Drinks"
    }
};

// Get current language from localStorage or default to 'en'
let currentLang = localStorage.getItem('debmkam_lang') || 'en';

// Function to update all text on the page
function updatePageLanguage() {
    const t = translations[currentLang];
    if (!t) return;
    
    // Update Hero Section
    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) heroTitle.innerHTML = t.heroTitle;
    
    const heroSubtitle = document.querySelector('.hero-text p');
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    
    // Update Auth Cards
    const authTitles = document.querySelectorAll('.auth-card h3');
    if (authTitles.length >= 3) {
        authTitles[0].textContent = t.signInTitle;
        authTitles[1].textContent = t.joinTitle;
      
    }
    
    const authDescs = document.querySelectorAll('.auth-card p');
    if (authDescs.length >= 3) {
        authDescs[0].textContent = t.signInDesc;
        authDescs[1].textContent = t.joinDesc;
     
    }
    
    const authBtns = document.querySelectorAll('.btn-card');
    if (authBtns.length >= 3) {
        authBtns[0].textContent = t.signInBtn + " →";
        authBtns[1].textContent = t.joinBtn + " →";
      
    }
    
    // Update Features Section
    const featuresTitle = document.querySelector('#features .section-title');
    if (featuresTitle) featuresTitle.innerHTML = t.featuresTitle;
    
    const featureTitles = document.querySelectorAll('.feature-card h3');
    if (featureTitles.length >= 1) featureTitles[0].textContent = t.feature1Title;
    
    const featureDescs = document.querySelectorAll('.feature-card p');
    if (featureDescs.length >= 1) featureDescs[0].textContent = t.feature1Desc;
    
    // Update How It Works
    const howTitle = document.querySelector('.how-it-works .section-title');
    if (howTitle) howTitle.innerHTML = t.howTitle;
    
    const stepTitles = document.querySelectorAll('.step h3');
    if (stepTitles.length >= 4) {
        stepTitles[0].textContent = t.step1Title;
        stepTitles[1].textContent = t.step2Title;
        stepTitles[2].textContent = t.step3Title;
        stepTitles[3].textContent = t.step4Title;
    }
    
    const stepDescs = document.querySelectorAll('.step p');
    if (stepDescs.length >= 4) {
        stepDescs[0].textContent = t.step1Desc;
        stepDescs[1].textContent = t.step2Desc;
        stepDescs[2].textContent = t.step3Desc;
        stepDescs[3].textContent = t.step4Desc;
    }
    
    // Update Section Titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        if (title.innerText.includes("Signature") || title.innerText.includes("Our")) {
            // Skip - handled separately
        }
    });
    
    console.log('Language updated to:', currentLang);
}

// Language switching function
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('debmkam_lang', lang);
    updatePageLanguage();
    // Don't reload - just update the text
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePageLanguage();
});

// Make functions global
window.setLanguage = setLanguage;
window.updatePageLanguage = updatePageLanguage;