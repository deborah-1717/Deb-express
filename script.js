// Google Sheet CSV URL for reading products from cloud
// Google Sheet CSV URL for reading products from cloud
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2hych5HgL65398qWIvKnIxNvhrTymsbyxUNEloaQfxQOJiubIe_VADWmWW-rCkUuQOxbY0kHbyBPp/pub?output=csv';
// Global variables
let products = [];
let cart = [];
let currentUser = null;
let selectedRating = 0;
const WHATSAPP_NUMBER = "2348061308703";

// Language function
function setLanguage(lang) {
    localStorage.setItem('debkam_lang', lang);
    location.reload();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    loadCartCount();
    loadReviews();
    checkUserStatus();
    updateFloatingCheckoutBar();
    setupEventListeners();
    fixFloatingButton();
});

// Force fix floating button style
function fixFloatingButton() {
    var btn = document.getElementById('floatingCheckoutBar');
    if (btn) {
        btn.style.cssText = 'display: none; position: fixed; bottom: 80px; right: 20px; background: #25D366; width: 50px; height: 50px; border-radius: 50%; z-index: 99999; box-shadow: 0 2px 10px rgba(0,0,0,0.2); cursor: pointer; text-align: center;';
        
        var icon = btn.querySelector('i');
        if (icon) {
            icon.style.cssText = 'font-size: 20px; line-height: 50px; color: white;';
        }
        
        var badge = document.getElementById('floatingItemCount');
        if (badge) {
            badge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; font-size: 10px; font-weight: bold; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;';
        }
    }
}

// Load products from cloud (Google Sheet) or local storage
async function loadProducts() {
    try {
        // Try to load from Google Sheet first (cloud)
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        products = [];
        
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
                products.push({
                    id: parseInt(cols[0]) || Date.now() + i,
                    name: cols[1] ? cols[1].replace(/"/g, '') : 'Product',
                    price: parseInt(cols[2]) || 0,
                    img: cols[3] ? cols[3].replace(/"/g, '') : 'assets/placeholder.webp',
                    desc: cols[4] ? cols[4].replace(/"/g, '') : '',
                    category: cols[5] ? cols[5].replace(/"/g, '') : 'other'
                });
            }
        }
        
        if (products.length > 0) {
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
    
    // Update UI if on shop page
    if (document.getElementById('productsGrid')) {
        renderProducts();
    }
    // Update UI if on homepage
    if (document.getElementById('productsPreview')) {
        displayFeaturedProducts();
    }
}

// Load products from local storage (fallback)
function loadProductsFromLocal() {
    const stored = localStorage.getItem('debkams_products');
    if (stored && JSON.parse(stored).length > 0) {
        products = JSON.parse(stored);
    } else {
        // Default products
        products = [
            { id:1, name:"Chocolate Fudge Cake", price:6000, img:"assets/13.webp", desc:"Rich chocolate fudge cake", category:"cakes" },
            { id:2, name:"Red Velvet", price:4000, img:"assets/14.webp", desc:"Classic red velvet", category:"cakes" },
            { id:3, name:"Birthday cake", price:25000, img:"assets/15.webp", desc:"Custom birthday cake", category:"cakes" },
            { id:4, name:"Spring rolls(10pcs)", price:4000, img:"assets/16.webp", desc:"Crispy spring rolls", category:"savory" },
            { id:5, name:"Chicken pie(6pcs)", price:9000, img:"assets/17.webp", desc:"Savory chicken pie", category:"savory" },
            { id:6, name:"Samosa(12pcs)", price:4000, img:"assets/18.webp", desc:"Spicy samosas", category:"savory" },
            { id:7, name:"Yoghurt", price:2500, img:"assets/21.webp", desc:"Creamy yoghurt", category:"drinks" },
            { id:8, name:"Fried Rice", price:5500, img:"assets/22.webp", desc:"Special fried rice", category:"savory" },
            { id:9, name:"Grilled Chicken", price:3500, img:"assets/23.webp", desc:"Spicy grilled chicken", category:"savory" },
            { id:10, name:"Chocolate Croissant (box of 3)", price:12000, img:"assets/24.webp", desc:"Buttery chocolate croissants", category:"pastries" },
            { id:11, name:"Cinnamon Rolls (box of 4)", price:12000, img:"assets/25.webp", desc:"Sweet cinnamon rolls", category:"pastries" },
            { id:12, name:"Meat Pie(6pcs)", price:6000, img:"assets/35.webp", desc:"Savory meat pie", category:"savory" },
            { id:13, name:"Chocolate Crunch Cake", price:8000, img:"assets/34.webp", desc:"Crunchy chocolate cake", category:"cakes" },
            { id:14, name:"Burger and Fries With Chicken (Combo)", price:12000, img:"assets/36.webp", desc:"Complete meal combo", category:"savory" }
        ];
        localStorage.setItem('debkams_products', JSON.stringify(products));
    }
    console.log(`📦 Loaded ${products.length} products from local storage`);
}

// Render products on shop page (assuming this function exists)
function renderProducts() {
    // This function should already exist in your shop-script.js
    if (typeof window.renderProducts === 'function') {
        window.renderProducts();
    }
}

function displayFeaturedProducts() {
    const previewContainer = document.getElementById('productsPreview');
    if (!previewContainer) return;
    
    const featured = products.slice(0, 4);
    previewContainer.innerHTML = featured.map(product => `
        <div class="preview-card">
            <img src="${product.img}" onerror="this.src='https://via.placeholder.com/200x150?text=Pastry'">
            <h4>${product.name}</h4>
            <div class="price">₦${product.price.toLocaleString()}</div>
            <button onclick="addToCartFromHome(${product.id})" class="btn-small">Add to Cart</button>
        </div>
    `).join('');
}

// Add to cart from homepage
function addToCartFromHome(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: 1 });
    }
    localStorage.setItem('debkams_cart', JSON.stringify(cart));
    loadCartCount();
    updateFloatingCheckoutBar();
    showNotification(`✅ ${product.name} added to cart!`, 'success');
}

function loadCart() {
    const stored = localStorage.getItem('debkams_cart');
    cart = stored ? JSON.parse(stored) : [];
}

function loadCartCount() {
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('navCartCount');
    if (badge) badge.textContent = count;
    const floatingCount = document.getElementById('floatingItemCount');
    if (floatingCount) floatingCount.textContent = count;
}

// FIXED: This function now only shows/hides, doesn't change shape
function updateFloatingCheckoutBar() {
    const bar = document.getElementById('floatingCheckoutBar');
    if (!bar) return;
    
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    if (cart.length > 0) {
        bar.style.display = 'block';
        fixFloatingButton(); // Re-apply circle style
    } else {
        bar.style.display = 'none';
    }
}

function checkUserStatus() {
    const user = localStorage.getItem('debkams_user');
    const logoutBtn = document.querySelector('.logout-btn-nav');
    const authCards = document.querySelector('.auth-section-home');
    
    if (user) {
        currentUser = JSON.parse(user);
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (authCards) authCards.style.display = 'none';
    } else {
        currentUser = null;
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (authCards) authCards.style.display = 'block';
    }
}

function setupEventListeners() {
    // Any additional event listeners
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== CHECKOUT LOGIN PROTECTION ==========

function checkoutWithLogin() {
    console.log('🔥 Checkout button clicked!');
    
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    
    if (!cart || cart.length === 0) {
        alert('❌ Your cart is empty! Add some items first.');
        return;
    }
    
    const userJson = localStorage.getItem('debkams_user');
    
    if (!userJson) {
        alert('🔐 LOGIN REQUIRED\n\nPlease sign in or create an account to complete your order.');
        sessionStorage.setItem('redirectAfterLogin', 'checkout');
        showSignInModal();
        return;
    }
    
    currentUser = JSON.parse(userJson);
    showCheckoutModal();
}

function showCheckoutModal() {
    const userJson = localStorage.getItem('debkams_user');
    
    if (!userJson) {
        alert('🔐 LOGIN REQUIRED!\n\nPlease sign in to checkout.');
        showSignInModal();
        return;
    }
    
    currentUser = JSON.parse(userJson);
    
    const nameField = document.getElementById('checkoutName');
    const phoneField = document.getElementById('checkoutPhone');
    const addressField = document.getElementById('checkoutAddress');
    
    if (nameField) nameField.value = currentUser.name || '';
    if (phoneField) phoneField.value = currentUser.phone || '';
    if (addressField) addressField.value = currentUser.address || '';
    
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    const products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
    
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || item.price) * item.quantity);
    }, 0);
    
    const summaryDiv = document.getElementById('orderSummary');
    if (summaryDiv) {
        if (cart.length === 0) {
            summaryDiv.innerHTML = '<p>Your cart is empty</p>';
        } else {
            summaryDiv.innerHTML = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `<div class="summary-item">${item.quantity}x ${product?.name || item.name} - ₦${((product?.price || item.price) * item.quantity).toLocaleString()}</div>`;
            }).join('');
        }
    }
    
    const orderTotal = document.getElementById('orderTotal');
    if (orderTotal) orderTotal.textContent = total.toLocaleString();
    
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const datetimeInput = document.getElementById('pickupTime');
    if (datetimeInput && !datetimeInput.value) {
        datetimeInput.value = now.toISOString().slice(0, 16);
    }
    
    const isPreorderCheckbox = document.getElementById('isPreorder');
    if (isPreorderCheckbox) isPreorderCheckbox.checked = false;
    const preorderFields = document.getElementById('preorderFields');
    if (preorderFields) preorderFields.style.display = 'none';
    
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('open');
}

function submitOrder(event) {
    event.preventDefault();
    
    const userJson = localStorage.getItem('debkams_user');
    if (!userJson) {
        alert('🔐 LOGIN REQUIRED!\n\nYou must sign in or create an account to place an order.');
        closeCheckoutModal();
        showSignInModal();
        return;
    }
    
    currentUser = JSON.parse(userJson);
    
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
    
    if (delivery === 'delivery' && !address) {
        alert('Please enter your delivery address');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    const products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    let total = cart.reduce((sum, item) => {
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
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = (product?.price || item.price) * item.quantity;
        message += `• ${item.quantity}x ${product?.name || item.name} = ₦${itemTotal.toLocaleString()}\n`;
    });
    message += `\nTOTAL: ₦${total.toLocaleString()}\n`;
    message += `\n🏦 BANK TRANSFER\nBank: Opay\nAccount: DORIS SHOGADE AMAECHI\nNumber: 8087299383`;
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const newOrder = {
        id: Date.now(),
        customerName: name,
        customerPhone: phone,
        customerEmail: currentUser.email,
        items: [...cart],
        total: total,
        delivery: delivery,
        address: address,
        status: 'Pending',
        orderDate: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('debkams_orders', JSON.stringify(orders));
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    localStorage.setItem('debkams_cart', JSON.stringify([]));
    
    loadCartCount();
    updateFloatingCheckoutBar();
    
    alert(`✅ Order placed successfully!\n\nOrder ID: ${newOrder.id}\n\nPlease complete payment via bank transfer and send proof of payment to our WhatsApp.`);
    
    closeCheckoutModal();
    
    if (confirm('Would you like to track your order?')) {
        window.location.href = 'track-order.html';
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('open');
}

function toggleAddressField() {
    const delivery = document.getElementById('deliveryOption').value;
    const addressGroup = document.getElementById('addressGroup');
    if (addressGroup) {
        addressGroup.style.display = delivery === 'delivery' ? 'block' : 'none';
    }
}

function togglePreorderFields() {
    const isPreorder = document.getElementById('isPreorder')?.checked || false;
    const preorderFields = document.getElementById('preorderFields');
    if (preorderFields) {
        preorderFields.style.display = isPreorder ? 'block' : 'none';
    }
}

function proceedToCheckout() {
    checkoutWithLogin();
}

function requireLoginForCheckout() {
    const user = localStorage.getItem('debkams_user');
    if (!user) {
        showLoginRequiredModal();
        return false;
    }
    return true;
}

function showLoginRequiredModal() {
    let modal = document.getElementById('loginRequiredModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginRequiredModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <span class="close-modal" onclick="closeLoginRequiredModal()">&times;</span>
                <i class="fas fa-lock" style="font-size: 48px; color: #d4af37; margin-bottom: 20px;"></i>
                <h3>Login Required</h3>
                <p>Please sign in or create an account to checkout.</p>
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button onclick="closeLoginRequiredModal(); showSignInModal();" style="flex: 1; background: #d4af37; color: #1a1a1a; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">Sign In</button>
                    <button onclick="closeLoginRequiredModal(); showRegisterModal();" style="flex: 1; background: transparent; color: #d4af37; border: 2px solid #d4af37; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">Register</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('open');
}

function closeLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) modal.classList.remove('open');
}

// Auth functions
function showSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) modal.classList.add('open');
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.add('open');
}

function closeModals() {
    document.getElementById('signInModal')?.classList.remove('open');
    document.getElementById('registerModal')?.classList.remove('open');
    document.getElementById('checkoutModal')?.classList.remove('open');
    closeLoginRequiredModal();
}

function switchToRegister() {
    closeModals();
    showRegisterModal();
}

function switchToLogin() {
    closeModals();
    showSignInModal();
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('debkams_user', JSON.stringify(user));
        alert(`Welcome back ${user.name}!`);
        closeModals();
        
        const redirectTo = sessionStorage.getItem('redirectAfterLogin');
        if (redirectTo === 'checkout') {
            sessionStorage.removeItem('redirectAfterLogin');
            showCheckoutModal();
        } else if (redirectTo) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectTo;
        }
    } else {
        alert('Invalid email or password');
    }
}

function register() {
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
    
    alert('Registration successful! Welcome to Debkam\'s Pastry Palace!');
    closeModals();
    
    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
    if (redirectTo === 'checkout') {
        sessionStorage.removeItem('redirectAfterLogin');
        showCheckoutModal();
    } else if (redirectTo) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectTo;
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('debkams_user');
    localStorage.removeItem('debkams_cart');
    window.location.href = 'index.html';
}

function copyBankDetails() {
    const bankText = `Bank: Opay\nAccount Name: DORIS SHOGADE AMAECHI\nAccount Number: 8087299383`;
    navigator.clipboard.writeText(bankText);
    alert('Bank details copied! 💰');
}

function trackOrder() {
    const orderNumber = document.getElementById('trackOrderNumber').value;
    if (!orderNumber) {
        alert('Please enter an order number');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const order = orders.find(o => o.id.toString() === orderNumber);
    
    const resultDiv = document.getElementById('trackResult');
    if (resultDiv) {
        if (order) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="text-align:center;">
                    <i class="fas fa-check-circle" style="font-size:3rem; color:var(--gold);"></i>
                    <h3>Order #${order.id}</h3>
                    <p><strong>Status:</strong> <span class="order-status status-${order.status?.toLowerCase() || 'pending'}">${order.status || 'Pending'}</span></p>
                    <p><strong>Total:</strong> ₦${order.total}</p>
                    <p><strong>Delivery:</strong> ${order.delivery}</p>
                    <p><strong>Date:</strong> ${new Date(order.orderDate || order.date).toLocaleString()}</p>
                </div>
            `;
        } else {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="text-align:center; color:#dc3545;">
                    <i class="fas fa-times-circle" style="font-size:3rem;"></i>
                    <h3>Order Not Found</h3>
                    <p>Please check your order number and try again.</p>
                </div>
            `;
        }
    }
}

function trackOrderPage() {
    const orderNumber = document.getElementById('trackInput').value;
    if (!orderNumber) {
        alert('Please enter an order number');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const order = orders.find(o => o.id.toString() === orderNumber);
    
    const resultDiv = document.getElementById('trackResultPage');
    if (resultDiv) {
        if (order) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h3>Order #${order.id}</h3>
                <div class="track-timeline">
                    <div class="timeline-step ${order.status === 'Pending' ? 'active' : 'completed'}">
                        <i class="fas fa-receipt"></i>
                        <span>Order Placed</span>
                    </div>
                    <div class="timeline-step ${order.status === 'Preparing' ? 'active' : order.status === 'Ready' || order.status === 'Delivered' ? 'completed' : ''}">
                        <i class="fas fa-utensils"></i>
                        <span>Preparing</span>
                    </div>
                    <div class="timeline-step ${order.status === 'Ready' ? 'active' : order.status === 'Delivered' ? 'completed' : ''}">
                        <i class="fas fa-box"></i>
                        <span>Ready</span>
                    </div>
                    <div class="timeline-step ${order.status === 'Delivered' ? 'active' : ''}">
                        <i class="fas fa-check-circle"></i>
                        <span>Delivered</span>
                    </div>
                </div>
                <p><strong>Total:</strong> ₦${order.total}</p>
                <p><strong>Delivery:</strong> ${order.delivery}</p>
                <p><strong>Date:</strong> ${new Date(order.orderDate || order.date).toLocaleString()}</p>
            `;
        } else {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<p style="color:#dc3545;">Order not found. Please check your order number.</p>`;
        }
    }
    
    displayRecentOrders();
}

function displayRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const recentOrders = orders.slice(-5).reverse();
    const container = document.getElementById('recentOrdersList');
    
    if (container && recentOrders.length > 0) {
        container.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item" onclick="document.getElementById('trackInput').value='${order.id}'; trackOrderPage();">
                <span>Order #${order.id}</span>
                <span>₦${order.total}</span>
                <span class="order-status status-${order.status?.toLowerCase() || 'pending'}">${order.status || 'Pending'}</span>
            </div>
        `).join('');
    }
}

function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('debkams_reviews') || '[]');
    const reviewsGrid = document.getElementById('reviewsGrid');
    
    if (reviewsGrid && reviews.length > 0) {
        reviewsGrid.innerHTML = reviews.slice(-3).reverse().map(review => `
            <div class="review-card">
                <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                <p>"${review.text}"</p>
                <div class="reviewer">
                    <i class="fas fa-user-circle"></i>
                    <div>
                        <h4>${review.name}</h4>
                        <span>Verified Buyer</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) modal.classList.add('open');
    
    document.querySelectorAll('.stars-input i').forEach(star => {
        star.onclick = () => {
            const rating = parseInt(star.dataset.rating);
            selectedRating = rating;
            document.querySelectorAll('.stars-input i').forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('active');
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        };
    });
}

function closeReviewModal() {
    document.getElementById('reviewModal')?.classList.remove('open');
    selectedRating = 0;
}

function submitReview() {
    const name = document.getElementById('reviewName').value;
    const text = document.getElementById('reviewText').value;
    
    if (!name || !text || selectedRating === 0) {
        alert('Please fill all fields and select a rating');
        return;
    }
    
    const reviews = JSON.parse(localStorage.getItem('debkams_reviews') || '[]');
    reviews.push({ id: Date.now(), name, text, rating: selectedRating, date: new Date().toISOString() });
    localStorage.setItem('debkams_reviews', JSON.stringify(reviews));
    
    alert('Thank you for your review!');
    closeReviewModal();
    loadReviews();
}

// Make ALL functions global
window.setLanguage = setLanguage;
window.showSignInModal = showSignInModal;
window.showRegisterModal = showRegisterModal;
window.closeModals = closeModals;
window.closeCheckoutModal = closeCheckoutModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.login = login;
window.register = register;
window.goHome = goHome;
window.logout = logout;
window.copyBankDetails = copyBankDetails;
window.trackOrder = trackOrder;
window.trackOrderPage = trackOrderPage;
window.showReviewModal = showReviewModal;
window.closeReviewModal = closeReviewModal;
window.submitReview = submitReview;
window.requireLoginForCheckout = requireLoginForCheckout;
window.proceedToCheckout = proceedToCheckout;
window.closeLoginRequiredModal = closeLoginRequiredModal;
window.checkoutWithLogin = checkoutWithLogin;
window.addToCartFromHome = addToCartFromHome;
window.showCheckoutModal = showCheckoutModal;
window.submitOrder = submitOrder;
window.toggleAddressField = toggleAddressField;
window.togglePreorderFields = togglePreorderFields;
window.renderProducts = renderProducts;

console.log('Script loaded! checkoutWithLogin function available:', typeof checkoutWithLogin);
