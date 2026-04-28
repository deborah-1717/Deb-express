// Google Sheet Web App URL (for saving products to cloud)
const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwQzj76g1eN7IaAiHKwpvvbIgsSXBj6QN1WFbfM2I12N_r6GcG5FpR-6fWW3TJx1CxBjQ/exec';

// ImgBB API Key
const IMGBB_API_KEY = '4cb10b247ebaf9a859dab1c294901ade';

// Admin password
const ADMIN_PASSWORD = "admin123";
const WHATSAPP_NUMBER = "2348061308703"; // Your business WhatsApp

// DOM Elements
let adminLogin, adminDashboard;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    adminLogin = document.getElementById('adminLogin');
    adminDashboard = document.getElementById('adminDashboard');
    
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
    
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', adminLoginFunc);
    
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) addBtn.addEventListener('click', addProduct);
    
    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) orderSearch.addEventListener('input', loadOrders);
});

function adminLoginFunc() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        alert('❌ Wrong password!');
    }
}

function showDashboard() {
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
    loadStats();
    loadProducts();
    loadOrders();
    loadCustomers();
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

function switchTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    if (tabName === 'orders') loadOrders();
    if (tabName === 'customers') loadCustomers();
    if (tabName === 'products') loadProducts();
}

function loadStats() {
    const products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalCustomers').textContent = users.length;
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
    const container = document.getElementById('productsListAdmin');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products yet. Add some!</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <img src="${product.img}" onerror="this.src='https://via.placeholder.com/60'">
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p>₦${product.price.toLocaleString()}</p>
                <small>${product.category || 'Uncategorized'}</small>
            </div>
            <div class="admin-product-actions">
                <button onclick="deleteProduct(${product.id})" class="delete-btn">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// ========== IMAGE UPLOAD FUNCTIONS ==========

// Upload image to ImgBB cloud
async function uploadToImgBB(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.innerHTML = '📤 Uploading to cloud...';
    statusDiv.style.color = '#d4af37';
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('uploadedImageUrl').value = data.data.url;
            statusDiv.innerHTML = '✅ Image uploaded! Everyone will see it.';
            statusDiv.style.color = 'green';
        } else {
            statusDiv.innerHTML = '❌ Upload failed: ' + (data.error?.message || 'Unknown error');
            statusDiv.style.color = 'red';
        }
    } catch(error) {
        statusDiv.innerHTML = '❌ Error uploading. Check connection.';
        statusDiv.style.color = 'red';
    }
}

// Convert image to Base64 (fallback)
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Preview image before upload
function previewImage(input) {
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Updated addProduct function with cloud upload to Google Sheet
async function addProduct() {
    const name = document.getElementById('newProductName').value;
    const price = parseInt(document.getElementById('newProductPrice').value);
    const desc = document.getElementById('newProductDesc').value;
    const category = document.getElementById('newProductCategory').value;
    const cloudImageUrl = document.getElementById('uploadedImageUrl').value;
    const imageFile = document.getElementById('newProductImageFile').files[0];
    
    if (!name || !price) {
        alert('Please fill product name and price');
        return;
    }
    
    let finalImageUrl = 'assets/placeholder.webp';
    
    // Priority: Cloud URL > Base64 > Default
    if (cloudImageUrl) {
        finalImageUrl = cloudImageUrl;
    } else if (imageFile) {
        finalImageUrl = await imageToBase64(imageFile);
    }
    
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        img: finalImageUrl,
        desc: desc,
        category: category
    };
    
    // Save to Google Sheet (cloud) - for everyone to see
    try {
        await fetch(SHEET_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct)
        });
        console.log('✅ Product saved to Google Sheet cloud!');
    } catch(error) {
        console.log('⚠️ Cloud save failed:', error);
    }
    
    // Also save to localStorage (backup)
    const products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
    products.push(newProduct);
    localStorage.setItem('debkams_products', JSON.stringify(products));
    
    // Clear form
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductImageFile').value = '';
    document.getElementById('newProductDesc').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadedImageUrl').value = '';
    document.getElementById('uploadStatus').innerHTML = '';
    
    loadProducts();
    loadStats();
    alert('✅ Product added to cloud! Everyone will see it on refresh.');
    
    // Broadcast update to other tabs/windows
    localStorage.setItem('debkams_products_updated', Date.now().toString());
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Delete this product?')) {
        let products = JSON.parse(localStorage.getItem('debkams_products') || '[]');
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('debkams_products', JSON.stringify(products));
        loadProducts();
        loadStats();
        
        // Broadcast update
        localStorage.setItem('debkams_products_updated', Date.now().toString());
    }
}

// ========== ORDER FUNCTIONS ==========

function loadOrders() {
    let orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const container = document.getElementById('ordersList');
    
    if (!container) return;
    
    orders.sort((a, b) => b.id - a.id);
    
    if (searchTerm) {
        orders = orders.filter(order => 
            order.customerName?.toLowerCase().includes(searchTerm) ||
            order.id?.toString().includes(searchTerm)
        );
    }
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">📭 No orders yet</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="admin-order-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="order-date">${new Date(order.orderDate).toLocaleString()}</span>
            </div>
            <div class="order-customer">
                <p><strong>👤 Customer:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>📞 Phone:</strong> ${order.customerPhone || 'N/A'}</p>
                <p><strong>📧 Email:</strong> ${order.customerEmail || 'N/A'}</p>
            </div>
            <div class="order-items">
                <strong>🛒 Items:</strong>
                <ul>
                    ${order.items.map(item => `<li>${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}</li>`).join('')}
                </ul>
            </div>
            <div class="order-footer">
                <p><strong>💰 Total:</strong> ₦${order.total.toLocaleString()}</p>
                <p><strong>🚚 Delivery:</strong> ${order.delivery === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                <p><strong>📍 Address:</strong> ${order.address || 'Pickup'}</p>
                <div class="order-status-select">
                    <label>📌 Status:</label>
                    <select onchange="updateOrderStatus(${order.id}, this.value, '${order.customerPhone}', '${order.customerName}')">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>🔪 Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>✅ Ready</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>🚚 Delivered</option>
                    </select>
                    <button onclick="sendManualWhatsApp('${order.customerPhone}', ${order.id}, '${order.status}')" class="whatsapp-notify-btn">
                        <i class="fab fa-whatsapp"></i> Send Update
                    </button>
                </div>
                ${order.notifications && order.notifications.length > 0 ? `
                    <div class="order-notifications">
                        <strong>📢 Update History:</strong>
                        <ul>
                            ${order.notifications.slice(-3).reverse().map(n => `
                                <li>${new Date(n.timestamp).toLocaleString()} - ${n.message}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Send WhatsApp notification
function sendWhatsAppNotification(customerPhone, orderId, status, customerName) {
    let phone = customerPhone.toString().replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.substring(1);
    if (!phone.startsWith('234')) phone = '234' + phone;
    
    let message = '';
    
    switch(status) {
        case 'Preparing':
            message = `🍰 *DEBKAM'S PASTRY PALACE* 🍰\n\nHello ${customerName},\n\nYour order *#${orderId}* is now being *PREPARED*! 🎂\n\nWe'll notify you once it's ready.\n\nThank you! ❤️`;
            break;
        case 'Ready':
            message = `🍰 *DEBKAM'S PASTRY PALACE* 🍰\n\nHello ${customerName},\n\nYour order *#${orderId}* is *READY*! ✅\n\nYou can now pick it up or expect delivery soon.\n\nThank you! 🎉`;
            break;
        case 'Delivered':
            message = `🍰 *DEBKAM'S PASTRY PALACE* 🍰\n\nHello ${customerName},\n\nYour order *#${orderId}* has been *DELIVERED*! 🚚\n\nEnjoy your pastries! Please leave a review.\n\nThank you! ❤️`;
            break;
        default:
            message = `🍰 *DEBKAM'S PASTRY PALACE* 🍰\n\nHello ${customerName},\n\nYour order *#${orderId}* status: *${status}*\n\nThank you for choosing Debkam's! ❤️`;
    }
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    saveNotificationToLocal(orderId, status, customerName);
}

// Send manual WhatsApp update
function sendManualWhatsApp(customerPhone, orderId, currentStatus) {
    let phone = customerPhone.toString().replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.substring(1);
    if (!phone.startsWith('234')) phone = '234' + phone;
    
    const message = `🍰 *DEBKAM'S PASTRY PALACE* 🍰\n\nYour order *#${orderId}* is currently: *${currentStatus}*\n\nTrack your order on our website.\n\nThank you!`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Save notification to localStorage
function saveNotificationToLocal(orderId, status, customerName) {
    let notifications = JSON.parse(localStorage.getItem('debkams_notifications') || '[]');
    
    notifications.push({
        id: Date.now(),
        orderId: orderId,
        message: `Order #${orderId} status updated to: ${status}`,
        status: status,
        timestamp: new Date().toISOString(),
        read: false
    });
    
    localStorage.setItem('debkams_notifications', JSON.stringify(notifications));
}

// Update order status with WhatsApp notification
function updateOrderStatus(orderId, newStatus, customerPhone, customerName) {
    const orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const oldStatus = order.status;
        order.status = newStatus;
        
        if (!order.notifications) order.notifications = [];
        order.notifications.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: `Order status updated from "${oldStatus}" to "${newStatus}"`
        });
        
        localStorage.setItem('debkams_orders', JSON.stringify(orders));
        
        if (customerPhone && customerPhone !== 'N/A') {
            sendWhatsAppNotification(customerPhone, orderId, newStatus, customerName);
        }
        
        loadOrders();
        alert(`✅ Order #${orderId} updated to "${newStatus}"\n📱 WhatsApp notification sent!`);
    }
}

// ========== CUSTOMER FUNCTIONS ==========

function loadCustomers() {
    const users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
    const container = document.getElementById('customersList');
    
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p>No registered customers yet</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="admin-customer-card">
            <div class="customer-icon">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="customer-info">
                <h4>${user.name}</h4>
                <p><i class="fas fa-envelope"></i> ${user.email}</p>
                <p><i class="fas fa-phone"></i> ${user.phone || 'N/A'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${user.address || 'N/A'}</p>
            </div>
            <button onclick="deleteCustomer(${user.id})" class="delete-customer-btn">🗑️ Delete</button>
        </div>
    `).join('');
}

function deleteCustomer(userId) {
    if (confirm('Delete this customer? This will also delete their orders!')) {
        let users = JSON.parse(localStorage.getItem('debkams_users') || '[]');
        let orders = JSON.parse(localStorage.getItem('debkams_orders') || '[]');
        
        const user = users.find(u => u.id === userId);
        
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('debkams_users', JSON.stringify(users));
        
        if (user) {
            orders = orders.filter(o => o.customerEmail !== user.email);
            localStorage.setItem('debkams_orders', JSON.stringify(orders));
        }
        
        loadCustomers();
        loadOrders();
        loadStats();
        alert('✅ Customer deleted');
    }
}

// Reset all data
function resetAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL products, orders, and customers! Are you sure?')) {
        if (confirm('Last chance! This cannot be undone. Delete everything?')) {
            localStorage.removeItem('debkams_products');
            localStorage.removeItem('debkams_orders');
            localStorage.removeItem('debkams_users');
            localStorage.removeItem('debkams_cart');
            localStorage.removeItem('debkams_user');
            localStorage.removeItem('debkams_notifications');
            
            alert('✅ All data has been reset! Page will reload.');
            location.reload();
        }
    }
}

// Make functions global
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.deleteCustomer = deleteCustomer;
window.resetAllData = resetAllData;
window.sendManualWhatsApp = sendManualWhatsApp;
window.previewImage = previewImage;
window.uploadToImgBB = uploadToImgBB;
