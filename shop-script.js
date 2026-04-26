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
});

// Force reload products (for mobile fix)
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
    
    const total = (cart || []).reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    
    const count = (cart || []).reduce((sum, item) => sum + item.quantity, 0);
    
    const floatingTotal = document.getElementById('floatingTotal');
    const floatingItemCount = document.getElementById('floatingItemCount');
    
    if (floatingTotal) floatingTotal.textContent = `₦${total.toLocaleString()}`;
    if (floatingItemCount) floatingItemCount.textContent = count;
    
    bar.style.display = (cart && cart.length > 0) ? 'flex' : 'none';
}

// Direct checkout - FORCES LOGIN
function proceedToCheckoutDirect() {
    if (!cart || cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) sidebar.classList.remove('open');
    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.classList.remove('open');
    
    const user = localStorage.getItem('debkams_user');
    
    if (!user) {
        alert('🔐 Login Required!\n\nYou must sign in or create an account to checkout.');
        showSignInModal();
        return;
    }
    
    currentUser = JSON.parse(user);
    showCheckoutModal();
}

// Show checkout modal with pre-order options
function showCheckoutModal() {
    const user = localStorage.getItem('debkams_user');
    
    const nameField = document.getElementById('checkoutName');
    const phoneField = document.getElementById('checkoutPhone');
    const addressField = document.getElementById('checkoutAddress');
    
    if (user) {
        currentUser = JSON.parse(user);
        if (nameField) nameField.value = currentUser.name;
        if (phoneField) phoneField.value = currentUser.phone;
        if (addressField) addressField.value = currentUser.address || '';
    }
    
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
    if (orderTotal) orderTotal.textContent = total;
    
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

// Toggle pre-order fields
function togglePreorderFields() {
    const isPreorder = document.getElementById('isPreorder')?.checked || false;
    const preorderFields = document.getElementById('preorderFields');
    const pickupTime = document.getElementById('pickupTime');
    
    if (isPreorder) {
        if (preorderFields) preorderFields.style.display = 'block';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const preorderDate = document.getElementById('preorderDate');
        if (preorderDate) preorderDate.min = tomorrow.toISOString().split('T')[0];
        if (pickupTime) pickupTime.required = false;
    } else {
        if (preorderFields) preorderFields.style.display = 'none';
        if (pickupTime) pickupTime.required = true;
        setDefaultDateTime();
    }
}

// Load Products
function loadProducts() {
    console.log('Loading products...');
    const stored = localStorage.getItem('debkams_products');
    if (stored && JSON.parse(stored).length > 0) {
        products = JSON.parse(stored);
        console.log('Products loaded from storage:', products.length);
        // Verify categories exist
        let needsFix = false;
        products.forEach(p => {
            if (!p.category) {
                needsFix = true;
                console.log('Missing category for:', p.name);
            }
        });
        if (needsFix) {
            console.log('Fixing missing categories...');
            fixProductCategories();
        }
    } else {
        createDefaultProducts();
    }
    renderProducts();
}

function fixProductCategories() {
    products = products.map(p => {
        if (p.name.includes('Cake') || p.name.includes('Velvet') || p.name.includes('Birthday') || p.name.includes('Crunch')) {
            p.category = 'cakes';
        } else if (p.name.includes('Croissant') || p.name.includes('Cinnamon')) {
            p.category = 'pastries';
        } else if (p.name.includes('Spring') || p.name.includes('Pie') || p.name.includes('Samosa') || p.name.includes('Rice') || p.name.includes('Chicken') || p.name.includes('Burger') || p.name.includes('Meat')) {
            p.category = 'savory';
        } else if (p.name.includes('Yoghurt')) {
            p.category = 'drinks';
        } else {
            p.category = 'savory';
        }
        return p;
    });
    localStorage.setItem('debkams_products', JSON.stringify(products));
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
    console.log('Default products created');
}

// Render Products with enhanced debugging
function renderProducts() {
    console.log('Rendering products...');
    console.log('Current filter:', currentFilter);
    console.log('Total products:', products.length);
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let filtered = [...products];
    
    // Log each product's category for debugging
    products.forEach(p => {
        console.log(`Product: ${p.name}, Category: ${p.category}`);
    });
    
    // Apply category filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => {
            const matches = p.category === currentFilter;
            console.log(`Filtering ${p.name}: category=${p.category}, filter=${currentFilter}, matches=${matches}`);
            return matches;
        });
        console.log('Filtered count:', filtered.length);
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('productsGrid element not found!');
        return;
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results" style="text-align: center; padding: 40px;">
            <i class="fas fa-search" style="font-size: 48px; color: #999;"></i>
            <h3 style="margin: 20px 0;">No products found</h3>
            <p>Current filter: <strong>${currentFilter}</strong></p>
            <p>Total products in store: <strong>${products.length}</strong></p>
            <button onclick="filterCategory('all')" style="background: #d4af37; color: #1a1a1a; border: none; padding: 10px 20px; margin-top: 15px; border-radius: 5px; cursor: pointer;">
                Show All Items
            </button>
            <button onclick="window.forceReloadProducts()" style="background: #25D366; color: white; border: none; padding: 10px 20px; margin-top: 15px; margin-left: 10px; border-radius: 5px; cursor: pointer;">
                🔄 Fix Products
            </button>
        </div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        const cartItem = (cart || []).find(i => i.id === product.id);
        const quantity = cartItem?.quantity || 0;
        const categoryIcon = product.category === 'cakes' ? '🎂' : product.category === 'pastries' ? '🥐' : product.category === 'savory' ? '🍗' : '🥤';
        
        return `
            <div class="product-card">
                <div class="product-badge">${categoryIcon}</div>
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
    
    console.log('Products rendered:', filtered.length);
}

function filterCategory(category) {
    console.log('Filtering by category:', category);
    currentFilter = category;
    renderProducts();
    
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.toLowerCase();
        if (category === 'all' && (btnText.includes('all') || btnText === 'all items')) {
            btn.classList.add('active');
        } else if (category === 'cakes' && btnText.includes('cakes')) {
            btn.classList.add('active');
        } else if (category === 'pastries' && btnText.includes('pastries')) {
            btn.classList.add('active');
        } else if (category === 'savory' && btnText.includes('savory')) {
            btn.classList.add('active');
        } else if (category === 'drinks' && btnText.includes('drinks')) {
            btn.classList.add('active');
        }
    });
}

// Add to Cart
function addToCart(productId) {
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
    showNotification('Added to cart!', 'success');
}

function updateQuantity(productId, delta) {
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
}

function removeFromCart(productId) {
    if (!cart) cart = [];
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderProducts();
    updateCartUI();
    showNotification('Item removed', 'info');
}

function saveCart() {
    localStorage.setItem('debkams_cart', JSON.stringify(cart || []));
    updateCartUI();
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

function checkUserStatus() {
    const user = localStorage.getItem('debkams_user');
    const authBanner = document.getElementById('authBanner');
    
    if (user) {
        currentUser = JSON.parse(user);
        if (authBanner) authBanner.style.display = 'none';
    }
}

function showSignInModal() { 
    const modal = document.getElementById('signInModal');
    if (modal) modal.classList.add('open');
}

function showRegisterModal() { 
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.add('open');
}

// Submit Order with pre-order support
function submitOrder(event) {
    event.preventDefault();
    
    const delivery = document.getElementById('deliveryOption').value;
    const address = document.getElementById('checkoutAddress').value;
    const time = document.getElementById('pickupTime').value;
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    
    const isPreorder = document.getElementById('isPreorder')?.checked || false;
    const preorderDate = isPreorder ? document.getElementById('preorderDate')?.value : null;
    const preorderTime = isPreorder ? document.getElementById('preorderTime')?.value : null;
    const preorderMessage = isPreorder ? document.getElementById('preorderMessage')?.value : null;
    
    if (!name) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    if (!phone) {
        showNotification('Please enter your phone number', 'error');
        return;
    }
    
    if (isPreorder && !preorderDate) {
        showNotification('Please select a pre-order date', 'error');
        return;
    }
    
    let total = (cart || []).reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    
    const bankDetails = `
🏦 BANK TRANSFER DETAILS
Bank: Opay 
Account Name: DORIS SHOGADE AMAECHI
Account Number: 8087299383
Amount: ₦${total.toLocaleString()}
`;
    
    let message = `🍰 DEBKAM'S PASTRY PALACE - NEW ORDER 🍰\n\n`;
    message += `Customer: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Payment: Bank Transfer\n`;
    message += `Delivery: ${delivery === 'pickup' ? 'Pickup' : 'Delivery'}\n`;
    
    if (isPreorder) {
        message += `📅 PRE-ORDER: ${preorderDate} at ${preorderTime}\n`;
        if (preorderMessage) message += `🎁 Special Instructions: "${preorderMessage}"\n`;
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
    message += `\n${bankDetails}\n`;
    message += `Please confirm payment.`;
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const newOrder = {
        id: Date.now(),
        customerName: name,
        customerPhone: phone,
        items: [...(cart || [])],
        total: total,
        delivery: delivery,
        address: address,
        time: isPreorder ? preorderDate : time,
        isPreorder: isPreorder,
        preorderDate: preorderDate,
        preorderTime: preorderTime,
        preorderMessage: preorderMessage,
        paymentMethod: 'Bank Transfer',
        status: 'Pending',
        orderDate: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('debkams_orders', JSON.stringify(orders));
    
    const trackingCode = newOrder.id;
    showNotification(`✅ Order placed! Your tracking code: ${trackingCode}`, 'success');
    alert(`🎉 Order Confirmed!\n\nYour Tracking Code: ${trackingCode}\n\nSave this code to track your order.`);
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    
    cart = [];
    saveCart();
    renderProducts();
    
    closeCheckoutModal();
    toggleCart();
    
    showNotification('Order sent! Complete bank transfer and send proof via WhatsApp.', 'success');
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
}

function toggleAddressField() {
    const delivery = document.getElementById('deliveryOption').value;
    const addressGroup = document.getElementById('addressGroup');
    if (addressGroup) {
        addressGroup.style.display = delivery === 'delivery' ? 'block' : 'none';
    }
}

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
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function copyBankDetails() {
    const bankText = `Bank: Opay\nAccount Name: DORIS SHOGADE AMAECHI\nAccount Number: 8087299383`;
    navigator.clipboard.writeText(bankText);
    showNotification('Bank details copied! 💰', 'success');
}

function goHome() { window.location.href = 'index.html'; }

function logout() { 
    localStorage.removeItem('debkams_user'); 
    localStorage.removeItem('debkams_cart'); 
    window.location.href = 'index.html'; 
}

function closeModals() { 
    document.getElementById('signInModal')?.classList.remove('open'); 
    document.getElementById('registerModal')?.classList.remove('open'); 
}

function closeCheckoutModal() { document.getElementById('checkoutModal').classList.remove('open'); }
function switchToRegister() { closeModals(); showRegisterModal(); }
function switchToLogin() { closeModals(); showSignInModal(); }
function setLanguage(lang) { localStorage.setItem('debmkam_lang', lang); location.reload(); }

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('debkams_user', JSON.stringify(user));
        localStorage.removeItem('debkams_guest');
        currentUser = user;
        closeModals();
        showNotification(`Welcome back ${user.name}!`, 'success');
        const authBanner = document.getElementById('authBanner');
        if (authBanner) authBanner.style.display = 'none';
        showCheckoutModal();
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !phone || !address || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered!', 'error');
        return;
    }
    
    const newUser = { id: Date.now(), name, email, phone, address, password };
    users.push(newUser);
    localStorage.setItem('debkams_users', JSON.stringify(users));
    localStorage.setItem('debkams_user', JSON.stringify(newUser));
    localStorage.removeItem('debkams_guest');
    currentUser = newUser;
    
    showNotification('Registration successful! Welcome!', 'success');
    closeModals();
    const authBanner = document.getElementById('authBanner');
    if (authBanner) authBanner.style.display = 'none';
    showCheckoutModal();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderProducts);
    }
}

// Make functions global
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.proceedToCheckoutDirect = proceedToCheckoutDirect;
window.submitOrder = submitOrder;
window.filterCategory = filterCategory;
window.goHome = goHome;
window.logout = logout;
window.showSignInModal = showSignInModal;
window.showRegisterModal = showRegisterModal;
window.closeModals = closeModals;
window.closeCheckoutModal = closeCheckoutModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.login = login;
window.register = register;
window.setLanguage = setLanguage;
window.toggleAddressField = toggleAddressField;
window.copyBankDetails = copyBankDetails;
window.togglePreorderFields = togglePreorderFields;
window.forceReloadProducts = forceReloadProducts;

console.log('Shop script loaded successfully with checkout pre-order feature');