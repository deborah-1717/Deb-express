// Google Sheet CSV URL for reading products from cloud
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2hych5HgL65398qWIvKnIxNvhrTymsbyxUNEloaQfxQOJiubIe_VADWmWW-rCkUuQOxbY0kHbyBPp/pub?output=csv';

// Global Variables
let products = [];
let cart = [];
let currentUser = null;
let currentFilter = 'all';
const WHATSAPP_NUMBER = "2348061308703";
const ADMIN_EMAIL = "shogadeo@gmail.com";

// Initialize Shop
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    loadProducts();
    loadCart();
    checkUserStatus();
    setupEventListeners();
    setDefaultDateTime();
    updateFloatingCheckoutBar();
    
    const floatingBtn = document.getElementById('floatingCheckoutBar');
    console.log('Floating button found:', floatingBtn);
});

// ========== CHECKOUT WITH LOGIN ==========
window.checkoutWithLogin = function() {
    console.log('🔥 Checkout button clicked!');
    
    if (!cart || cart.length === 0) {
        alert('❌ Your cart is empty! Add some items first.');
        return;
    }
    
    console.log('Cart has', cart.length, 'items');
    
    const userJson = localStorage.getItem('debkams_user');
    console.log('User from localStorage:', userJson);
    
    if (!userJson) {
        alert('🔐 LOGIN REQUIRED\n\nPlease sign in or create an account to complete your order.');
        showSignInModal();
        return;
    }
    
    console.log('User logged in, showing checkout modal');
    currentUser = JSON.parse(userJson);
    showCheckoutModal();
};

// ========== SUBMIT ORDER WITH LOGIN CHECK ==========
window.submitOrder = function(event) {
    event.preventDefault();
    
    // LOGIN CHECK - THIS IS THE KEY FIX
    const user = localStorage.getItem('debkams_user');
    if (!user) {
        alert('🔐 LOGIN REQUIRED!\n\nYou must sign in or create an account to place an order.');
        closeCheckoutModal();
        showSignInModal();
        return;
    }
    
    const delivery = document.getElementById('deliveryOption').value;
    const address = document.getElementById('checkoutAddress').value;
    const time = document.getElementById('pickupTime').value;
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    
    const isPreorder = document.getElementById('isPreorder')?.checked || false;
    const preorderDate = isPreorder ? document.getElementById('preorderDate')?.value : null;
    const preorderTime = isPreorder ? document.getElementById('preorderTime')?.value : null;
    const preorderMessage = isPreorder ? document.getElementById('preorderMessage')?.value : null;
    
    if (!name || !phone) {
        alert('Please enter your name and phone number');
        return;
    }
    
    let total = (cart || []).reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    
    let message = `🍰 DEBKAM'S PASTRY PALACE - NEW ORDER 🍰\n\n`;
    message += `Customer: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Payment: Bank Transfer\n`;
    message += `Delivery: ${delivery === 'pickup' ? 'Pickup' : 'Delivery'}\n`;
    
    if (isPreorder) {
        message += `📅 PRE-ORDER: ${preorderDate} at ${preorderTime}\n`;
        if (preorderMessage) message += `🎁 Message: "${preorderMessage}"\n`;
    } else {
        if (delivery === 'delivery') message += `Address: ${address}\n`;
        message += `Time: ${new Date(time).toLocaleString()}\n`;
    }
    
    message += `\nORDER ITEMS:\n`;
    (cart || []).forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = (product?.price || item.price) * item.quantity;
        message += `• ${item.quantity}x ${product?.name} = ₦${itemTotal.toLocaleString()}\n`;
    });
    message += `\nTOTAL: ₦${total.toLocaleString()}\n`;
    message += `\n🏦 BANK TRANSFER\nBank: Opay\nAccount: DORIS SHOGADE AMAECHI\nNumber: 8087299383`;
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const newOrder = {
        id: Date.now(),
        customerName: name,
        customerPhone: phone,
        items: [...(cart || [])],
        total: total,
        delivery: delivery,
        status: 'Pending',
        orderDate: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('debkams_orders', JSON.stringify(orders));
    
    alert(`✅ Order placed! Your tracking code: ${newOrder.id}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    
    cart = [];
    saveCart();
    renderProducts();
    closeCheckoutModal();
    updateCartUI();
    
    sessionStorage.removeItem('redirectAfterLogin');
};

// Force reload products
window.forceReloadProducts = function() {
    const defaultProducts = [
        { id:1, name:"Chocolate Fudge Cake", price:6000, img:"https://picsum.photos/id/106/300/200", desc:"Rich chocolate fudge cake", category:"cakes" },
        { id:2, name:"Red Velvet", price:4000, img:"https://picsum.photos/id/132/300/200", desc:"Classic red velvet", category:"cakes" },
        { id:3, name:"Birthday cake", price:25000, img:"https://picsum.photos/id/125/300/200", desc:"Custom birthday cake", category:"cakes" },
        { id:4, name:"Spring rolls(10pcs)", price:4000, img:"https://picsum.photos/id/29/300/200", desc:"Crispy spring rolls", category:"savory" },
        { id:5, name:"Chicken pie(6pcs)", price:9000, img:"https://picsum.photos/id/117/300/200", desc:"Savory chicken pie", category:"savory" },
        { id:6, name:"Samosa(12pcs)", price:4000, img:"https://picsum.photos/id/130/300/200", desc:"Spicy samosas", category:"savory" },
        { id:7, name:"Yoghurt", price:2500, img:"https://picsum.photos/id/149/300/200", desc:"Creamy yoghurt", category:"drinks" },
        { id:8, name:"Fried Rice", price:5500, img:"https://picsum.photos/id/127/300/200", desc:"Special fried rice", category:"savory" },
        { id:9, name:"Grilled Chicken", price:3500, img:"https://picsum.photos/id/120/300/200", desc:"Spicy grilled chicken", category:"savory" },
        { id:10, name:"Chocolate Croissant (3pcs)", price:12000, img:"https://picsum.photos/id/40/300/200", desc:"Buttery chocolate croissants", category:"pastries" },
        { id:11, name:"Cinnamon Rolls (4pcs)", price:12000, img:"https://picsum.photos/id/36/300/200", desc:"Sweet cinnamon rolls", category:"pastries" },
        { id:12, name:"Meat Pie(6pcs)", price:6000, img:"https://picsum.photos/id/118/300/200", desc:"Savory meat pie", category:"savory" },
        { id:13, name:"Chocolate Crunch Cake", price:8000, img:"https://picsum.photos/id/109/300/200", desc:"Crunchy chocolate cake", category:"cakes" },
        { id:14, name:"Burger and Fries Combo", price:12000, img:"https://picsum.photos/id/115/300/200", desc:"Complete meal combo", category:"savory" }
    ];
    localStorage.setItem('debkams_products', JSON.stringify(defaultProducts));
    alert('Products reloaded! Page will refresh.');
    location.reload();
};

// Update floating checkout bar
function updateFloatingCheckoutBar() {
    const bar = document.getElementById('floatingCheckoutBar');
    if (!bar) return;
    
    const count = (cart || []).reduce((sum, item) => sum + item.quantity, 0);
    const floatingItemCount = document.getElementById('floatingItemCount');
    
    if (floatingItemCount) floatingItemCount.textContent = count;
    
    if (cart && cart.length > 0) {
        bar.style.display = 'flex';
        console.log('Floating bar shown, cart items:', count);
    } else {
        bar.style.display = 'none';
    }
}

// Show checkout modal with login check
function showCheckoutModal() {
    const user = localStorage.getItem('debkams_user');
    
    // Add login check here too
    if (!user) {
        alert('🔐 LOGIN REQUIRED!\n\nPlease sign in to checkout.');
        showSignInModal();
        return;
    }
    
    currentUser = JSON.parse(user);
    
    const nameField = document.getElementById('checkoutName');
    const phoneField = document.getElementById('checkoutPhone');
    const addressField = document.getElementById('checkoutAddress');
    
    if (nameField) nameField.value = currentUser.name;
    if (phoneField) phoneField.value = currentUser.phone;
    if (addressField) addressField.value = currentUser.address || '';
    
    const total = (cart || []).reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    
    const summaryDiv = document.getElementById('orderSummary');
    if (summaryDiv) {
        summaryDiv.innerHTML = (cart || []).map(item => {
            const product = products.find(p => p.id === item.id);
            return `<div class="summary-item">${item.quantity}x ${product?.name} - ₦${((product?.price || item.price) * item.quantity).toLocaleString()}</div>`;
        }).join('');
    }
    const orderTotal = document.getElementById('orderTotal');
    if (orderTotal) orderTotal.textContent = total.toLocaleString();
    
    if (!document.getElementById('pickupTime')?.value) {
        setDefaultDateTime();
    }
    
    const isPreorderCheckbox = document.getElementById('isPreorder');
    if (isPreorderCheckbox) isPreorderCheckbox.checked = false;
    const preorderFields = document.getElementById('preorderFields');
    if (preorderFields) preorderFields.style.display = 'none';
    
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('open');
}

// Login function
window.login = function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('debkams_user', JSON.stringify(user));
        currentUser = user;
        closeModals();
        alert(`✅ Welcome back ${user.name}!`);
        
        const authBanner = document.getElementById('authBanner');
        if (authBanner) authBanner.style.display = 'none';
        
        if (cart && cart.length > 0) {
            if (confirm('Would you like to complete your order now?')) {
                showCheckoutModal();
            }
        }
    } else {
        alert('❌ Invalid email or password');
    }
};

// Register function
window.register = function() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !phone || !address || !password) {
        alert('Please fill all fields');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    const newUser = { id: Date.now(), name, email, phone, address, password };
    users.push(newUser);
    localStorage.setItem('debkams_users', JSON.stringify(users));
    localStorage.setItem('debkams_user', JSON.stringify(newUser));
    currentUser = newUser;
    
    alert('✅ Registration successful! Welcome to Debkam\'s Pastry Palace!');
    closeModals();
    
    const authBanner = document.getElementById('authBanner');
    if (authBanner) authBanner.style.display = 'none';
    
    if (cart && cart.length > 0) {
        if (confirm('Would you like to complete your order now?')) {
            showCheckoutModal();
        }
    }
};

// Add to Cart
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!cart) cart = [];
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: 1 });
    }
    
    saveCart();
    renderProducts();
    updateCartUI();
    showNotification(`✅ ${product.name} added to cart!`, 'success');
};

window.updateQuantity = function(productId, delta) {
    if (!cart) cart = [];
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCart();
        renderProducts();
        updateCartUI();
    }
};

window.removeFromCart = function(productId) {
    if (!cart) cart = [];
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderProducts();
    updateCartUI();
    showNotification('Item removed', 'info');
};

function saveCart() {
    localStorage.setItem('debkams_cart', JSON.stringify(cart || []));
    updateFloatingCheckoutBar();
}

function loadCart() {
    const stored = localStorage.getItem('debkams_cart');
    cart = stored ? JSON.parse(stored) : [];
    console.log('Cart loaded:', cart.length, 'items');
    updateCartUI();
    updateFloatingCheckoutBar();
}

function updateCartUI() {
    if (!cart) cart = [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    const floatingCountEl = document.getElementById('floatingCartCount');
    if (cartCountEl) cartCountEl.textContent = count;
    if (floatingCountEl) floatingCountEl.textContent = count;
    
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart"><i class="fas fa-shopping-bag"></i><br>Your cart is empty</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${product?.name || item.name}</h4>
                        <p>₦${(product?.price || item.price).toLocaleString()}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="cart-remove" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    if (cartTotalSpan) cartTotalSpan.textContent = `₦${total.toLocaleString()}`;
    
    updateFloatingCheckoutBar();
}

// Load Products from Cloud (Google Sheet) or Local Storage
async function loadProducts() {
    console.log('Loading products from cloud...');
    
    try {
        // Try to load from Google Sheet first (cloud)
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        const cloudProducts = [];
        
        // Skip header row (start from index 1)
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            
            // Parse CSV (handles quoted values)
            let cols = [];
            let inQuote = false;
            let currentCol = '';
            
            for (let char of rows[i]) {
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    cols.push(currentCol);
                    currentCol = '';
                } else {
                    currentCol += char;
                }
            }
            cols.push(currentCol);
            
            if (cols.length >= 4 && cols[0]) {
                cloudProducts.push({
                    id: parseInt(cols[0]) || Date.now() + i,
                    name: cols[1] ? cols[1].replace(/"/g, '') : 'Product',
                    price: parseInt(cols[2]) || 0,
                    img: cols[3] ? cols[3].replace(/"/g, '') : 'https://picsum.photos/300/200?random=1',
                    desc: cols[4] ? cols[4].replace(/"/g, '') : '',
                    category: cols[5] ? cols[5].replace(/"/g, '') : 'other'
                });
            }
        }
        
        if (cloudProducts.length > 0) {
            products = cloudProducts;
            console.log(`✅ Loaded ${products.length} products from cloud (Google Sheet)`);
            // Save to localStorage as backup
            localStorage.setItem('debkams_products', JSON.stringify(products));
        } else {
            loadProductsFromLocal();
        }
    } catch (error) {
        console.log('Cloud load failed, using local products:', error);
        loadProductsFromLocal();
    }
    
    renderProducts();
}

// Load products from local storage (fallback)
function loadProductsFromLocal() {
    const stored = localStorage.getItem('debkams_products');
    if (stored && JSON.parse(stored).length > 0) {
        products = JSON.parse(stored);
        console.log(`📦 Loaded ${products.length} products from local storage`);
    } else {
        createDefaultProducts();
    }
}

function createDefaultProducts() {
    products = [
        { id:1, name:"Chocolate Fudge Cake", price:6000, img:"https://picsum.photos/id/106/300/200", desc:"Rich chocolate fudge cake", category:"cakes" },
        { id:2, name:"Red Velvet", price:4000, img:"https://picsum.photos/id/132/300/200", desc:"Classic red velvet", category:"cakes" },
        { id:3, name:"Birthday cake", price:25000, img:"https://picsum.photos/id/125/300/200", desc:"Custom birthday cake", category:"cakes" },
        { id:4, name:"Spring rolls(10pcs)", price:4000, img:"https://picsum.photos/id/29/300/200", desc:"Crispy spring rolls", category:"savory" },
        { id:5, name:"Chicken pie(6pcs)", price:9000, img:"https://picsum.photos/id/117/300/200", desc:"Savory chicken pie", category:"savory" },
        { id:6, name:"Samosa(12pcs)", price:4000, img:"https://picsum.photos/id/130/300/200", desc:"Spicy samosas", category:"savory" },
        { id:7, name:"Yoghurt", price:2500, img:"https://picsum.photos/id/149/300/200", desc:"Creamy yoghurt", category:"drinks" },
        { id:8, name:"Fried Rice", price:5500, img:"https://picsum.photos/id/127/300/200", desc:"Special fried rice", category:"savory" },
        { id:9, name:"Grilled Chicken", price:3500, img:"https://picsum.photos/id/120/300/200", desc:"Spicy grilled chicken", category:"savory" },
        { id:10, name:"Chocolate Croissant (3pcs)", price:12000, img:"https://picsum.photos/id/40/300/200", desc:"Buttery chocolate croissants", category:"pastries" },
        { id:11, name:"Cinnamon Rolls (4pcs)", price:12000, img:"https://picsum.photos/id/36/300/200", desc:"Sweet cinnamon rolls", category:"pastries" },
        { id:12, name:"Meat Pie(6pcs)", price:6000, img:"https://picsum.photos/id/118/300/200", desc:"Savory meat pie", category:"savory" },
        { id:13, name:"Chocolate Crunch Cake", price:8000, img:"https://picsum.photos/id/109/300/200", desc:"Crunchy chocolate cake", category:"cakes" },
        { id:14, name:"Burger and Fries Combo", price:12000, img:"https://picsum.photos/id/115/300/200", desc:"Complete meal combo", category:"savory" }
    ];
    localStorage.setItem('debkams_products', JSON.stringify(products));
}

function renderProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let filtered = [...products];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results">No products found</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        const cartItem = (cart || []).find(i => i.id === product.id);
        const quantity = cartItem?.quantity || 0;
        
        return `
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}" onerror="this.src='https://picsum.photos/300/200?random=1'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-price">₦${product.price.toLocaleString()}</div>
                    ${quantity > 0 ? `
                        <div class="product-quantity-control">
                            <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">-</button>
                            <span>${quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
                            <button class="remove-btn" onclick="removeFromCart(${product.id})">Remove</button>
                        </div>
                    ` : `
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

window.filterCategory = function(category) {
    currentFilter = category;
    renderProducts();
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category) || (category === 'all' && btn.textContent.toLowerCase().includes('all'))) {
            btn.classList.add('active');
        }
    });
};

// Helper Functions
window.toggleCart = function() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
};

window.showSignInModal = function() { 
    document.getElementById('signInModal')?.classList.add('open');
};

window.showRegisterModal = function() { 
    document.getElementById('registerModal')?.classList.add('open');
};

window.closeModals = function() { 
    document.getElementById('signInModal')?.classList.remove('open'); 
    document.getElementById('registerModal')?.classList.remove('open'); 
};

window.closeCheckoutModal = function() { 
    document.getElementById('checkoutModal')?.classList.remove('open'); 
};

window.switchToRegister = function() { closeModals(); showRegisterModal(); };
window.switchToLogin = function() { closeModals(); showSignInModal(); };
window.goHome = function() { window.location.href = 'index.html'; };
window.logout = function() { 
    localStorage.removeItem('debkams_user'); 
    localStorage.removeItem('debkams_cart'); 
    window.location.href = 'index.html'; 
};

window.toggleAddressField = function() {
    const delivery = document.getElementById('deliveryOption').value;
    const addressGroup = document.getElementById('addressGroup');
    if (addressGroup) addressGroup.style.display = delivery === 'delivery' ? 'block' : 'none';
};

window.copyBankDetails = function() {
    const bankText = `Bank: Opay\nAccount Name: DORIS SHOGADE AMAECHI\nAccount Number: 8087299383`;
    navigator.clipboard.writeText(bankText);
    alert('Bank details copied!');
};

window.togglePreorderFields = function() {
    const isPreorder = document.getElementById('isPreorder')?.checked || false;
    const preorderFields = document.getElementById('preorderFields');
    if (preorderFields) preorderFields.style.display = isPreorder ? 'block' : 'none';
};

window.setLanguage = function(lang) { 
    localStorage.setItem('debmkam_lang', lang); 
    location.reload(); 
};

function setDefaultDateTime() {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const datetimeInput = document.getElementById('pickupTime');
    if (datetimeInput && !datetimeInput.value) {
        datetimeInput.value = now.toISOString().slice(0, 16);
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function checkUserStatus() {
    const user = localStorage.getItem('debkams_user');
    const authBanner = document.getElementById('authBanner');
    if (user && authBanner) authBanner.style.display = 'none';
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderProducts);
}

console.log('Shop script loaded! Cloud sync active. Products load from Google Sheet.');
