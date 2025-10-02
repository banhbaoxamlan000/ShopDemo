// Status list mapping (1-based codes)
const STATUS_LIST = ['TO SHIP','TO RECEIVE','COMPLETED','CANCELLED','RETURN REFUND'];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'register-shop.html'; return; }

    // Load sidebar shop info
    const roleOk = await ensureSellerRole(token);
    if (!roleOk) { window.location.href = 'register-shop.html'; return; }
    await loadShopSidebar(token);

    // Sidebar navigation (Dashboard, Products)
    try {
        var dashMenu = Array.from(document.querySelectorAll('.sidebar .flex.items-center span')).find(span => span.textContent.trim() === 'Dashboard');
        if (dashMenu) {
            dashMenu.parentElement.addEventListener('click', function () {
                window.location.href = 'shop-dashboard.html';
            });
        }
        var productsMenu = Array.from(document.querySelectorAll('.sidebar .flex.items-center span')).find(span => span.textContent.trim() === 'Products');
        if (productsMenu) {
            productsMenu.parentElement.addEventListener('click', function () {
                window.location.href = 'shop-products.html';
            });
        }
    } catch {}

    const listEl = document.getElementById('ordersList');
    const tabsEl = document.getElementById('orderTabs');
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyDateFilter');
    const clearFilterBtn = document.getElementById('clearDateFilter');

    listEl.innerHTML = '<div class="text-sm text-gray-500">Loading...</div>';

    let allOrders = [];
    let currentFilter = { status: 'ALL', startDate: null, endDate: null };

    try {
        const res = await fetch('http://localhost:8080/shop/order', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        allOrders = (data && data.code === 1 && Array.isArray(data.result)) ? data.result : [];
        window.__shopOrders = allOrders; // expose for later refresh

        if (allOrders.length === 0) {
            listEl.innerHTML = '<div class="text-center text-gray-500 py-12">No orders yet.</div>';
            return;
        }

        initializeDateDefaults();

        function setActiveTab(tab){
            if (!tabsEl) return;
            tabsEl.querySelectorAll('.order-tab').forEach(btn => {
                if (btn.getAttribute('data-tab') === tab) {
                    btn.classList.add('bg-indigo-50','text-indigo-700','border-indigo-300');
                } else {
                    btn.classList.remove('bg-indigo-50','text-indigo-700','border-indigo-300');
                }
            });
        }

        function filterOrders() {
            let filtered = allOrders;
            if (currentFilter.status !== 'ALL') {
                filtered = filtered.filter(o => (o.orderStatus || '').toUpperCase() === currentFilter.status);
            }
            if (currentFilter.startDate || currentFilter.endDate) {
                filtered = filtered.filter(order => {
                    if (!order.date) return false;
                    const d = new Date(order.date);
                    if (currentFilter.startDate && d < currentFilter.startDate) return false;
                    if (currentFilter.endDate && d > currentFilter.endDate) return false;
                    return true;
                });
            }
            return filtered;
        }

        function renderOrders(){
            const filtered = filterOrders();
            if (filtered.length === 0) {
                listEl.innerHTML = '<div class="text-center text-gray-500 py-12">No orders found with current filters.</div>';
            } else {
                listEl.innerHTML = filtered.map(order => renderOrderCard(order)).join('');
                loadOrderItemImages(filtered);
            }
        }

        if (tabsEl) {
            tabsEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.order-tab');
                if (!btn) return;
                currentFilter.status = btn.getAttribute('data-tab');
                setActiveTab(currentFilter.status);
                renderOrders();
            });
        }

        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                const s = startDateEl.value ? new Date(startDateEl.value) : null;
                const e = endDateEl.value ? new Date(endDateEl.value) : null;
                if (e) e.setHours(23,59,59,999);
                currentFilter.startDate = s; currentFilter.endDate = e;
                renderOrders();
            });
        }
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                startDateEl.value = ''; endDateEl.value = '';
                currentFilter.startDate = null; currentFilter.endDate = null;
                renderOrders();
            });
        }

        setActiveTab('ALL');
        renderOrders();
    } catch (e) {
        listEl.innerHTML = '<div class="text-center text-red-500 py-12">Error loading orders.</div>';
    }
});

async function ensureSellerRole(token){
    try {
        const response = await fetch('http://localhost:8080/shop/info', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        let data; try { data = await response.json(); } catch { data = null; }
        if (response.ok && data && data.result && data.result.shopResponse) return true;
        if (response.status === 401 || response.status === 403) return false;
        return false;
    } catch { return false; }
}

async function loadShopSidebar(token){
    try {
        const response = await fetch('http://localhost:8080/shop/info', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok && data.result && data.result.shopResponse) {
            const shop = data.result.shopResponse;
            const avatarImg = document.getElementById('shopAvatarSidebar');
            if (avatarImg) {
                try {
                    const imgRes = await fetch('http://localhost:8080/shop/avatar', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (imgRes.ok) {
                        const blob = await imgRes.blob();
                        avatarImg.src = URL.createObjectURL(blob);
                    }
                } catch {}
            }
            const nameDiv = document.getElementById('shopNameSidebar');
            if (nameDiv) nameDiv.textContent = shop.shopName || 'Shop Name';
            const typeDiv = document.getElementById('shopTypeSidebar');
            if (typeDiv) typeDiv.textContent = shop.type || '';
        }
    } catch {}
}

function renderOrderCard(order){
    const dateStr = formatDate(order.date);
    const addr = order.addressResponse || {};
    const status = (order.orderStatus || '').toLowerCase();
    const statusClass = getStatusClass(status);
    const itemsHtml = Array.isArray(order.items) ? order.items.map(it => `
        <div class="flex justify-between items-start py-3">
            <div class="flex items-center gap-3">
                <img src="https://via.placeholder.com/56" alt="${it.itemName || 'Item'}" class="w-14 h-14 rounded object-cover border" data-order-item-id="${it.itemID}">
                <div>
                    <div class="font-medium text-gray-900">${it.itemName || 'Item'}</div>
                    ${it.attributes && it.attributes.length ? `<div class=\"text-xs text-gray-500\">${it.attributes.map(a => `${a.name}: ${a.value}`).join(', ')}</div>` : ''}
                    <div class="text-xs text-gray-500">Qty: ${it.quantity || 1}</div>
                </div>
            </div>
            <div class="text-indigo-600 font-semibold">$${(it.price || 0).toFixed(2)}</div>
        </div>
    `).join('') : '';

    return `
        <div class="rounded-lg border overflow-hidden bg-white shadow-sm">
            <div class="px-4 py-2 bg-indigo-50 flex justify-between items-center">
                <div class="font-semibold text-gray-900">Order #${order.orderID || 'N/A'}</div>
                <div class="text-sm text-gray-500">${dateStr}</div>
            </div>
            <div class="p-4">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-sm text-gray-600">Status:</span>
                    <span class="text-xs px-2 py-0.5 rounded ${statusClass}">${order.orderStatus || ''}</span>
                    <span class="ml-3 text-sm text-gray-600">Delivery:</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">${order.delivery || ''}</span>
                </div>
                <div class="divide-y rounded">${itemsHtml}</div>
                <div class="mt-3 pt-3 border-t text-right font-semibold text-gray-900">Total: $${(order.total || 0).toFixed(2)}</div>
                <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    <div class="font-medium text-gray-800 mb-1">Ship to</div>
                    <div>${addr.phone || ''}</div>
                    <div>${[addr.detail, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}</div>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                    ${renderActionButtons(order)}
                </div>
            </div>
        </div>
    `;
}

function getStatusClass(status){
    if (status.includes('to ship')) return 'bg-yellow-100 text-yellow-800';
    if (status.includes('to receive')) return 'bg-blue-100 text-blue-800';
    if (status.includes('completed')) return 'bg-green-100 text-green-800';
    if (status.includes('cancelled')) return 'bg-red-100 text-red-800';
    if (status.includes('return')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
}

function renderActionButtons(order){
    const current = (order.orderStatus || '').toUpperCase();
    const id = order.orderID;
    const disabled = id ? '' : 'opacity-50 cursor-not-allowed';
    const tip = id ? '' : 'title="Missing orderID from API"';
    // Shop can only move forward: TO SHIP -> TO RECEIVE -> COMPLETED
    if (current === 'TO SHIP') {
        return `<button ${tip} class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 ${disabled}" onclick="updateOrderStatus(${id}, 2)">UPDATE TO RECEIVE</button>`;
    }
    if (current === 'TO RECEIVE') {
        return `<button ${tip} class="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 ${disabled}" onclick="updateOrderStatus(${id}, 3)">UPDATE TO COMPLETED</button>`;
    }
    // COMPLETED or others -> no action for shop
    return '';
}

async function updateOrderStatus(orderID, statusCode){
    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }
        if (!orderID) { showErrorMessage('Order ID is missing. Cannot update.'); return; }
        const res = await fetch('http://localhost:8080/users/order', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderID: String(orderID), statusCode })
        });
        if (res.ok) {
            // simple feedback and reload list
            showSuccessMessage('Order status updated');
            location.reload();
        } else {
            const txt = await res.text();
            showErrorMessage('Failed to update: ' + txt);
        }
    } catch (e) {
        console.error('Update status error:', e);
        showErrorMessage('Error updating order status');
    }
}

// Toast notifications (same style as add-to-cart)
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="check-circle" class="w-5 h-5 mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    if (window.feather) feather.replace();
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="alert-circle" class="w-5 h-5 mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    if (window.feather) feather.replace();
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 5000);
}

async function loadOrderItemImages(orders){
    try {
        const idsSet = new Set();
        orders.forEach(o => (o.items || []).forEach(it => { if (it.itemID) idsSet.add(it.itemID); }));
        const ids = Array.from(idsSet);
        for (const id of ids) {
            try {
                const res = await fetch(`http://localhost:8080/item/coverImage/${id}`);
                if (res.ok) {
                    const blob = await res.blob();
                    if (blob && blob.size > 0) {
                        const url = URL.createObjectURL(blob);
                        document.querySelectorAll(`img[data-order-item-id="${id}"]`).forEach(img => { img.src = url; });
                    }
                }
            } catch {}
        }
    } catch {}
}

function formatDate(iso){
    if (!iso) return '';
    try { const d = new Date(iso); return d.toLocaleString(); } catch { return iso; }
}

function initializeDateDefaults(){
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const s = document.getElementById('startDate');
    const e = document.getElementById('endDate');
    if (s) s.value = startDate.toISOString().split('T')[0];
    if (e) e.value = endDate.toISOString().split('T')[0];
}


