const ADMIN_PASSWORD = 'admin123';

function loadProducts() { return JSON.parse(localStorage.getItem('debkams_products') || '[]'); }
function saveProducts(p) { localStorage.setItem('debkams_products', JSON.stringify(p)); }
function loadOrders() { return JSON.parse(localStorage.getItem('debkams_orders') || '[]'); }
function loadUsers() { return JSON.parse(localStorage.getItem('debkams_users') || '[]'); }

function renderProducts() {
    const products = loadProducts();
    document.getElementById('totalProducts').textContent = products.length;
    const container = document.getElementById('productsListAdmin');
    if (!container) return;
    
    container.innerHTML = products.map(p => `
        <div class="admin-product-item">
            <img src="${p.img}" width="50">
            <div><strong>${p.name}</strong><br>₦${p.price}</div>
            <div><button onclick="editProduct(${p.id})">✏️</button> <button onclick="deleteProduct(${p.id})">🗑️</button></div>
        </div>
    `).join('');
}

window.addProduct = function() {
    const products = loadProducts();
    const newId = Date.now();
    products.push({
        id: newId,
        name: document.getElementById('newProductName')?.value || 'New Product',
        price: parseInt(document.getElementById('newProductPrice')?.value || 0),
        img: document.getElementById('newProductImage')?.value || 'assets/placeholder.jpg',
        desc: document.getElementById('newProductDesc')?.value || ''
    });
    saveProducts(products);
    renderProducts();
    ['newProductName', 'newProductPrice', 'newProductImage', 'newProductDesc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
};

window.editProduct = function(id) {
    let products = loadProducts();
    const p = products.find(p => p.id === id);
    if (!p) return;
    const newName = prompt('New name:', p.name);
    const newPrice = prompt('New price:', p.price);
    if (newName) p.name = newName;
    if (newPrice) p.price = parseInt(newPrice);
    saveProducts(products);
    renderProducts();
};

window.deleteProduct = function(id) {
    if (confirm('Delete product?')) {
        let products = loadProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderProducts();
    }
};

// ========== WHATSAPP STATUS UPDATE FUNCTIONS ==========
function sendWhatsAppMessage(phone, message) {
    if (!phone || phone === 'Not provided' || phone === '') {
        console.log('No phone number');
        return false;
    }
    let cleanPhone = phone.toString().replace(/\s/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '234' + cleanPhone.substring(1);
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
}

function updateOrderStatus(orderId, newStatus) {
    let orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id.toString() === orderId.toString());
    
    if (orderIndex !== -1) {
        const order = orders[orderIndex];
        const customerName = order.customerName || 'Customer';
        const customerPhone = order.customerPhone || '';
        
        orders[orderIndex].status = newStatus;
        localStorage.setItem('debkams_orders', JSON.stringify(orders));
        renderOrders();
        
        const statusMessages = {
            'Preparing': `👨‍🍳 Hello ${customerName},\n\nYour order #${orderId} is now being PREPARED! 🎂\n\nWe will notify you when it's ready.\n\n- Debkam's Pastry Palace`,
            'Ready': `✅ Hello ${customerName},\n\nYour order #${orderId} is READY for pickup/delivery! 🎉\n\nPlease come pick it up or expect delivery soon.\n\n- Debkam's Pastry Palace`,
            'Delivered': `🎉 Hello ${customerName},\n\nYour order #${orderId} has been DELIVERED! 🍰\n\nThank you for choosing Debkam's Pastry Palace!\n\nEnjoy your pastries! ✨`,
            'Cancelled': `❌ Hello ${customerName},\n\nYour order #${orderId} has been CANCELLED.\n\nPlease contact us for more information.\n\n- Debkam's Pastry Palace`
        };
        
        const message = statusMessages[newStatus] || `Your order #${orderId} status: ${newStatus}`;
        
        alert(`✅ Order #${orderId} updated to: ${newStatus}`);
        
        if (customerPhone) {
            sendWhatsAppMessage(customerPhone, message);
        } else {
            alert('⚠️ No phone number found. WhatsApp not sent.');
        }
    } else {
        alert('Order not found');
    }
}

function markAsPreparing(orderId) { updateOrderStatus(orderId, 'Preparing'); }
function markAsReady(orderId) { updateOrderStatus(orderId, 'Ready'); }
function markAsDelivered(orderId) { updateOrderStatus(orderId, 'Delivered'); }
function cancelOrder(orderId) {
    if (confirm('Cancel this order?')) {
        updateOrderStatus(orderId, 'Cancelled');
    }
}

function renderOrders() {
    const orders = loadOrders();
    document.getElementById('totalOrders').textContent = orders.length;
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders yet.</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const status = order.status || 'Pending';
        const customerName = order.customerName || 'Guest';
        
        return `
            <div class="order-card" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong>Order #${order.id}</strong>
                    <span style="background: ${status === 'Pending' ? '#ffc107' : status === 'Preparing' ? '#17a2b8' : status === 'Ready' ? '#28a745' : status === 'Delivered' ? '#6c757d' : '#dc3545'}; color:white; padding:4px 12px; border-radius:20px;">${status}</span>
                </div>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${order.total?.toLocaleString() || 0}</p>
                <p><strong>Delivery:</strong> ${order.delivery === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                <div style="margin:10px 0;">
                    <strong>Items:</strong>
                    ${order.items?.map(item => `<div>• ${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}</div>`).join('') || 'No items'}
                </div>
                <div style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap;">
                    ${status === 'Pending' ? `<button onclick="markAsPreparing(${order.id})" style="background:#17a2b8; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">🔧 Preparing</button>` : ''}
                    ${status === 'Preparing' ? `<button onclick="markAsReady(${order.id})" style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">✅ Ready</button>` : ''}
                    ${status === 'Ready' ? `<button onclick="markAsDelivered(${order.id})" style="background:#6c757d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">📦 Delivered</button>` : ''}
                    ${status !== 'Cancelled' && status !== 'Delivered' ? `<button onclick="cancelOrder(${order.id})" style="background:#dc3545; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">❌ Cancel</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderCustomers() {
    const users = loadUsers();
    document.getElementById('totalCustomers').textContent = users.length;
    const container = document.getElementById('customersList');
    if (!container) return;
    
    container.innerHTML = users.map(u => `
        <div class="customer-card" style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px;">
            <strong>${u.name}</strong><br>
            Email: ${u.email}<br>
            Phone: ${u.phone}<br>
            Address: ${u.address}
        </div>
    `).join('');
}

function adminLogin() {
    const pwd = document.getElementById('adminPassword')?.value;
    if (pwd === ADMIN_PASSWORD) {
        localStorage.setItem('debkams_admin', 'true');
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        renderProducts();
        renderOrders();
        renderCustomers();
    } else {
        alert('Wrong password');
    }
}

function adminLogout() {
    localStorage.removeItem('debkams_admin');
    location.reload();
}

// Reset all data function
function resetAllData() {
    if(confirm('⚠️ WARNING: This will delete ALL orders, users, products, and cart data!\n\nThis cannot be undone.\n\nAre you sure?')) {
        localStorage.clear();
        alert('All data cleared! The page will now reload.');
        location.reload();
    }
}

// Check auto-login
if (localStorage.getItem('debkams_admin') === 'true') {
    const loginDiv = document.getElementById('adminLogin');
    const dashboardDiv = document.getElementById('adminDashboard');
    if (loginDiv) loginDiv.style.display = 'none';
    if (dashboardDiv) dashboardDiv.style.display = 'block';
    renderProducts();
    renderOrders();
    renderCustomers();
}

// Event listeners
document.getElementById('adminLoginBtn')?.addEventListener('click', adminLogin);
document.getElementById('adminLogoutBtn')?.addEventListener('click', adminLogout);
document.getElementById('addProductBtn')?.addEventListener('click', addProduct);

// Make functions global
window.markAsPreparing = markAsPreparing;
window.markAsReady = markAsReady;
window.markAsDelivered = markAsDelivered;
window.cancelOrder = cancelOrder;
window.updateOrderStatus = updateOrderStatus;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.resetAllData = resetAllData;

// Tab switching
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        const tabId = tab.dataset.tab;
        document.getElementById(`${tabId}Tab`)?.classList.add('active');
        if (tabId === 'products') renderProducts();
        if (tabId === 'orders') renderOrders();
        if (tabId === 'customers') renderCustomers();
    });
});