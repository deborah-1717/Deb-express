// Global variables
let products = [];
let currentUser = null;
let selectedRating = 0;
const WHATSAPP_NUMBER = "2348061308703";

// Language function
function setLanguage(lang) {
    localStorage.setItem('debmkam_lang', lang);
    location.reload();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCartCount();
    loadReviews();
    checkUserStatus();
});

// Load products
function loadProducts() {
    const stored = localStorage.getItem('debkams_products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = [
            { id:1, name:"Chocolate Fudge Cake", price:6000, img:"assets/13.webp", desc:"Rich chocolate fudge cake" },
            { id:2, name:"Red Velvet", price:4000, img:"assets/14.webp", desc:"Classic red velvet" },
            { id:3, name:"Birthday cake", price:25000, img:"assets/15.webp", desc:"Custom birthday cake" },
            { id:4, name:"Spring rolls(10pcs)", price:4000, img:"assets/16.webp", desc:"Crispy spring rolls" },
            { id:5, name:"Chicken pie(6pcs)", price:9000, img:"assets/17.webp", desc:"Savory chicken pie" },
            { id:6, name:"Samosa(12pcs)", price:4000, img:"assets/18.webp", desc:"Spicy samosas" },
            { id:7, name:"Yoghurt", price:2500, img:"assets/21.webp", desc:"Creamy yoghurt" },
            { id:8, name:"Fried Rice", price:5500, img:"assets/22.webp", desc:"Special fried rice" },
            { id:9, name:"Grilled Chicken", price:3500, img:"assets/23.webp", desc:"Spicy grilled chicken" },
            { id:10, name:"Chocolate Croissant (box of 3)", price:12000, img:"assets/24.webp", desc:"Buttery chocolate croissants" },
            { id:11, name:"Cinnamon Rolls (box of 4)", price:12000, img:"assets/25.webp", desc:"Sweet cinnamon rolls" },
            { id:12, name:"Meat Pie(6pcs)", price:6000, img:"assets/35.webp", desc:"Savory meat pie" },
            { id:13, name:"Chocolate Crunch Cake", price:8000, img:"assets/34.webp", desc:"Crunchy chocolate cake" },
            { id:14, name:"Burger and Fries With Chicken (Combo)", price:12000, img:"assets/36.webp", desc:"Complete meal combo" }
        ];
        localStorage.setItem('debkams_products', JSON.stringify(products));
    }
    displayFeaturedProducts();
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
            <a href="shop.html" class="btn-small">Order Now</a>
        </div>
    `).join('');
}

function loadCartCount() {
    const cart = JSON.parse(localStorage.getItem('debkams_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('navCartCount');
    if (badge) badge.textContent = count;
}

function checkUserStatus() {
    const user = localStorage.getItem('debkams_user');
    if (user) {
        currentUser = JSON.parse(user);
    }
}

// Auth functions
function showSignInModal() {
    document.getElementById('signInModal').classList.add('open');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('open');
}

function closeModals() {
    document.getElementById('signInModal')?.classList.remove('open');
    document.getElementById('registerModal')?.classList.remove('open');
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
        window.location.href = 'shop.html';
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
    window.location.href = 'shop.html';
}




function goHome() {
    window.location.href = 'index.html';
}

// Copy bank details to clipboard
function copyBankDetails() {
    const bankText = `Bank: Opay\nAccount Name: DORIS SHOGADE AMAECHI\nAccount Number: 8087299383`;
    navigator.clipboard.writeText(bankText);
    alert('Bank details copied! 💰');
}

// Track Order
function trackOrder() {
    const orderNumber = document.getElementById('trackOrderNumber').value;
    if (!orderNumber) {
        alert('Please enter an order number');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const order = orders.find(o => o.id.toString() === orderNumber);
    
    const resultDiv = document.getElementById('trackResult');
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

function trackOrderPage() {
    const orderNumber = document.getElementById('trackInput').value;
    if (!orderNumber) {
        alert('Please enter an order number');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const order = orders.find(o => o.id.toString() === orderNumber);
    
    const resultDiv = document.getElementById('trackResultPage');
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

// Reviews
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
    document.getElementById('reviewModal').classList.add('open');
    
    // Setup star rating
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

// Make functions global
window.setLanguage = setLanguage;
window.showSignInModal = showSignInModal;
window.showRegisterModal = showRegisterModal;
window.closeModals = closeModals;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.login = login;
window.register = register;
window.continueAsGuest = continueAsGuest;
window.goHome = goHome;
window.copyBankDetails = copyBankDetails;
window.trackOrder = trackOrder;
window.trackOrderPage = trackOrderPage;
window.showReviewModal = showReviewModal;
window.closeReviewModal = closeReviewModal;
window.submitReview = submitReview;