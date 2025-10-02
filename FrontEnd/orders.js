document.addEventListener('DOMContentLoaded', async () => {
    // Validate token khi trang load (auto refresh nếu cần)
    const isValid = await tokenManager.validateTokenOnLoad();
    if (!isValid) {
        return; // Đã redirect về login
    }

    // Load sidebar profile info and avatar
    await loadUserProfile();

    const listEl = document.getElementById('ordersList');
    const tabsEl = document.getElementById('orderTabs');
    listEl.innerHTML = '<div class="text-sm text-gray-500">Loading...</div>';

    try {
        const res = await tokenManager.apiCall('http://localhost:8080/users/order', {
            method: 'GET'
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        const allOrders = (data && data.code === 1 && Array.isArray(data.result)) ? data.result : [];

        if (allOrders.length === 0) {
            listEl.innerHTML = '<div class="text-center text-gray-500 py-12">No orders yet.</div>';
            return;
        }

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

        function renderByTab(tab){
            let filtered = allOrders;
            if (tab !== 'ALL') {
                filtered = allOrders.filter(o => (o.orderStatus || '').toUpperCase() === tab);
            }
            if (filtered.length === 0) {
                listEl.innerHTML = '<div class="text-center text-gray-500 py-12">No orders in this status.</div>';
            } else {
                listEl.innerHTML = filtered.map(order => renderOrderCard(order)).join('');
                // After HTML is injected, load images for items
                loadOrderItemImages(filtered);
            }
            setActiveTab(tab);
        }

        // Initialize events
        if (tabsEl) {
            tabsEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.order-tab');
                if (!btn) return;
                const tab = btn.getAttribute('data-tab');
                renderByTab(tab);
            });
        }

        // Default tab
        renderByTab('ALL');
    } catch (e) {
        listEl.innerHTML = '<div class="text-center text-red-500 py-12">Error loading orders.</div>';
    }
});

async function loadUserProfile() {
    try {
        const res = await tokenManager.apiCall('http://localhost:8080/users/myInfo', {
            method: 'GET'
        });
        const data = await res.json();
        if (data && data.code === 1 && data.result) {
            const user = data.result;
            const nameEl = document.getElementById('profile-name');
            const usernameEl = document.getElementById('profile-username');
            if (nameEl) nameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
            if (usernameEl) usernameEl.textContent = user.username ? `@${user.username}` : '';
        }
    } catch {}

    // Load avatar
    try {
        const avatarImg = document.getElementById('profile-picture');
        if (!avatarImg) return;
        const res = await tokenManager.apiCall('http://localhost:8080/users/avatar', {
            method: 'GET'
        });
        if (res.ok) {
            const blob = await res.blob();
            if (blob && blob.size > 0) {
                avatarImg.src = URL.createObjectURL(blob);
            }
        }
    } catch {}
}

function renderOrderCard(order) {
    const dateStr = formatDate(order.date);
    const addr = order.addressResponse || {};
    const status = (order.orderStatus || '').toLowerCase();
    const statusClass = status.includes('ship') ? 'bg-yellow-100 text-yellow-800' : status.includes('deliver') ? 'bg-green-100 text-green-800' : status.includes('cancel') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
    const statusUpper = (order.orderStatus || '').toUpperCase();
    const itemsHtml = Array.isArray(order.items) ? order.items.map(it => `
        <div class="flex justify-between items-start py-3">
            <div class="flex items-center gap-3">
                <img src="https://via.placeholder.com/56" alt="${it.itemName || 'Item'}" class="w-14 h-14 rounded object-cover border" data-order-item-id="${it.itemID}">
                <div>
                    <div class="font-medium text-gray-900">${it.itemName || 'Item'}</div>
                    ${it.attributes && it.attributes.length ? `<div class=\"text-xs text-gray-500\">${it.attributes.map(a=>`${a.name}: ${a.value}`).join(', ')}</div>` : ''}
                    <div class="text-xs text-gray-500">Qty: ${it.quantity || 1}</div>
                    ${statusUpper === 'COMPLETED' && (it.review === false || typeof it.review === 'undefined') ? `<div class=\"mt-2\"><button class=\"px-2.5 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700\" onclick=\"openReviewModal(${order.orderID || 'null'}, ${it.itemID || 'null'})\">REVIEW</button></div>` : ''}
                </div>
            </div>
            <div class="text-indigo-600 font-semibold">$${(it.price || 0).toFixed(2)}</div>
        </div>
    `).join('') : '';

    const hasPendingReview = Array.isArray(order.items) && order.items.some(it => it && it.review === false);
    const firstItemId = Array.isArray(order.items) && order.items.length ? order.items[0].itemID : null;
    let actionBtn = '';
    if (statusUpper === 'TO SHIP') {
        actionBtn = `<button class=\"px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700\" onclick=\"userCancelOrder(${order.orderID || 'null'}, '${statusUpper}')\">Cancel Order</button>`;
    } else if (statusUpper === 'COMPLETED') {
        const refundBtn = `<button class=\"px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700\" onclick=\"userReturnRefund(${order.orderID || 'null'}, '${statusUpper}')\">RETURN REFUND</button>`;
        // Per-item review buttons are shown next to each item; no bulk review button here
        actionBtn = refundBtn;
    }

    return `
        <div class="rounded-lg border overflow-hidden bg-white shadow-sm">
            <div class="px-4 py-2 bg-indigo-50 flex justify-between items-center">
                <div class="font-semibold text-gray-900">${order.shopName || 'Shop'}</div>
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
                ${actionBtn ? `<div class=\"mt-4 flex gap-2\">${actionBtn}</div>` : ''}
            </div>
        </div>
    `;
}

// Load product images for visible orders
async function loadOrderItemImages(orders) {
    try {
        const idsSet = new Set();
        orders.forEach(o => (o.items || []).forEach(it => { if (it.itemID) idsSet.add(it.itemID); }));
        const ids = Array.from(idsSet);
        // Fetch each image sequentially (simple and safe); could parallelize if needed
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

// Navigate to review for specific item (simple redirect to product detail with review flag)
function userGoToReview(itemID){
    if (!itemID) return;
    window.location.href = `product-detail.html?id=${itemID}&review=1`;
}

// ============== REVIEW LOGIC ==============
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        var r = Math.random()*16|0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let currentReviewOrder = null;
let currentReviewItem = null;

function openReviewModal(orderID, itemID){
    try {
        if (!orderID) return;
        currentReviewOrder = orderID;
        currentReviewItem = itemID || null;
        const modal = document.getElementById('reviewModal');
        const closeBtn = document.getElementById('closeReviewModal');
        const container = document.getElementById('reviewItemsContainer');
        const submitBtn = document.getElementById('submitReviewBtn');
        if (!modal || !container || !submitBtn) return;

        // Find the order data from current DOM cache by reading from rendered HTML is complex.
        // Simpler: fetch order list again and get that order's items to ensure we review all items.
        const token = localStorage.getItem('token');
        fetch('http://localhost:8080/users/order', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).then(r=>r.json()).then(d=>{
            const orders = (d && d.code===1 && Array.isArray(d.result)) ? d.result : [];
            const order = orders.find(o => String(o.orderID) === String(orderID));
            let items = (order && Array.isArray(order.items)) ? order.items : [];
            // If specific item requested, limit to that item only
            if (currentReviewItem) {
                items = items.filter(it => String(it.itemID) === String(currentReviewItem));
            } else {
                // Otherwise default to items that still need review; if none, show all
                const pending = items.filter(it => it && (it.review === false || typeof it.review === 'undefined'));
                items = pending.length ? pending : items;
            }
            container.innerHTML = items.map((it, idx) => `
                <div class=\"border rounded p-4\" data-item-id=\"${it.itemID}\"> 
                    <div class=\"flex items-center justify-between\"> 
                        <div class=\"font-medium text-gray-800\">${it.itemName || 'Item'} (#${it.itemID})</div>
                        <div class=\"flex items-center gap-1\"> 
                            ${[1,2,3,4,5].map(s=>`<button type=\"button\" class=\"star-btn\" data-star=\"${s}\" style=\"font-size:28px;color:#e5e7eb;line-height:1;\">★</button>`).join('')}
                            <input type=\"hidden\" class=\"star-value\" value=\"\" /> 
                        </div> 
                    </div> 
                    <textarea class=\"feedback-input mt-3 w-full border rounded p-2 text-sm\" placeholder=\"Write your review...\"></textarea> 
                    <div class=\"mt-3\"> 
                        <input type=\"file\" accept=\"image/*\" multiple class=\"review-images-input\" /> 
                        <div class=\"review-images-preview mt-2 flex gap-2 flex-wrap\"></div> 
                    </div> 
                </div> 
            `).join('');

            // Attach interactions
            container.querySelectorAll('.star-btn').forEach(btn => {
                btn.addEventListener('click', function(){
                    const wrap = this.closest('[data-item-id]');
                    const v = parseInt(this.getAttribute('data-star'));
                    wrap.querySelector('.star-value').value = String(v);
                    // Update visuals
                    wrap.querySelectorAll('.star-btn').forEach(b => {
                        const sv = parseInt(b.getAttribute('data-star'));
                        b.style.color = sv <= v ? '#f59e0b' : '#e5e7eb';
                    });
                });
            });
            container.querySelectorAll('.review-images-input').forEach(input => {
                input.addEventListener('change', function(){
                    const preview = this.parentNode.querySelector('.review-images-preview');
                    const files = Array.from(this.files || []);
                    preview.innerHTML = files.map(f => {
                        const url = URL.createObjectURL(f);
                        return `<img src=\"${url}\" class=\"w-16 h-16 object-cover rounded border\" />`;
                    }).join('');
                });
            });

            modal.classList.remove('hidden');
            closeBtn.onclick = () => modal.classList.add('hidden');
            window.addEventListener('keydown', escClose);
            function escClose(e){ if(e.key==='Escape'){ modal.classList.add('hidden'); window.removeEventListener('keydown', escClose);} }

            submitBtn.onclick = async function(){
                try {
                    const token = localStorage.getItem('token');
                    if (!token) { window.location.href = 'login.html'; return; }

                    // Build feedbacks array
                    const rows = Array.from(container.querySelectorAll('[data-item-id]'));
                    let feedbacks = [];
                    let allFiles = [];
                    let codes = [];
                    const used = new Set();

                    // Validate each row: require feedback, at least 1 image, and valid rate 1..5
                    for (const row of rows) {
                        const itemID = row.getAttribute('data-item-id');
                        const feedback = row.querySelector('.feedback-input').value.trim();
                        const rate = parseInt(row.querySelector('.star-value').value);
                        const fileInput = row.querySelector('.review-images-input');
                        const files = Array.from(fileInput && fileInput.files ? fileInput.files : []);

                        if (!feedback) { showErrorMessage('Please enter feedback for every item.'); return; }
                        if (!rate || rate < 1 || rate > 5) { showErrorMessage('Please select a valid rating (1-5) for every item.'); return; }
                        if (files.length === 0) { showErrorMessage('Each review must include at least one image.'); return; }

                        // Generate UUID for each selected image
                        const imgUUIDs = files.map(() => { let id; do { id = uuidv4(); } while (used.has(id)); used.add(id); return id; });
                        allFiles.push(...files);
                        codes.push(...imgUUIDs);
                        const imageRequests = imgUUIDs.map(u => ({ pictureID: u }));
                        feedbacks.push({ itemID: Number(itemID), feedback, imageRequests, rate });
                    }

                    const body = { orderID: Number(orderID), feedbacks };

                    // 1) Gọi API write review trước
                    const res = await fetch('http://localhost:8080/review/write', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        showErrorMessage('Review failed: ' + txt);
                        return;
                    }

                    // 2) Tải ảnh review lên server nếu có
                    if (allFiles.length > 0) {
                        const form = new FormData();
                        allFiles.forEach((f, idx) => { form.append('images', f); form.append('codes', codes[idx]); });
                        try {
                            const up = await fetch('http://localhost:8080/item/saveImages', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: form
                            });
                            if (!up.ok) {
                                const txt = await up.text();
                                showErrorMessage('Upload images failed: ' + txt);
                                return;
                            }
                        } catch(err) {
                            showErrorMessage('Cannot upload review images.');
                            return;
                        }
                    }

                    showSuccessMessage('Review submitted successfully');
                    document.getElementById('reviewModal').classList.add('hidden');
                    setTimeout(() => location.reload(), 800);
                } catch (e) {
                    showErrorMessage('Error submitting review');
                }
            };
        });
    } catch (e) {}
}

// Cancel order for user
async function userCancelOrder(orderID, currentStatus) {
    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }
        if (!orderID || orderID === 'null') { showErrorMessage('Order ID is missing.'); return; }

        if ((currentStatus || '').toUpperCase() !== 'TO SHIP') {
            showErrorMessage('The order has arrived at the shipping unit');
            return;
        }

        const res = await fetch('http://localhost:8080/users/order', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: String(orderID), statusCode: 4 }) // 4 = CANCELLED
        });
        if (res.ok) {
            showSuccessMessage('Order cancelled successfully');
            setTimeout(()=> location.reload(), 800);
        } else {
            const txt = await res.text();
            showErrorMessage('Cancel failed: ' + txt);
        }
    } catch (e) {
        console.error(e);
        showErrorMessage('Error cancelling order');
    }
}

// Return / Refund request for user (statusCode = 5)
async function userReturnRefund(orderID, currentStatus) {
    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }
        if (!orderID || orderID === 'null') { showErrorMessage('Order ID is missing.'); return; }

        if ((currentStatus || '').toUpperCase() !== 'COMPLETED') {
            showErrorMessage('Only completed orders are eligible for return/refund');
            return;
        }

        const res = await fetch('http://localhost:8080/users/order', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: String(orderID), statusCode: 5 }) // 5 = RETURN REFUND
        });
        if (res.ok) {
            showSuccessMessage('Return/Refund requested successfully');
            setTimeout(()=> location.reload(), 800);
        } else {
            const txt = await res.text();
            showErrorMessage('Request failed: ' + txt);
        }
    } catch (e) {
        console.error(e);
        showErrorMessage('Error requesting return/refund');
    }
}

// Toast helpers (same style as add-to-cart)
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

function formatDate(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch { return iso; }
}


