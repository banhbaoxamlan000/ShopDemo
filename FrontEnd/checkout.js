document.addEventListener('DOMContentLoaded', async () => {
    const itemsEl = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const grandTotalEl = document.getElementById('grandTotal');
    const selectedAddressSummary = document.getElementById('selectedAddressSummary');

    // Toast notification functions
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
        
        // Re-render feather icons
        if (window.feather) feather.replace();
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
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
        
        // Re-render feather icons
        if (window.feather) feather.replace();
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    let items = [];
    try {
        const raw = sessionStorage.getItem('checkoutItems');
        items = JSON.parse(raw) || [];
    } catch {}

    if (!Array.isArray(items) || items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Render items grouped by shop
    itemsEl.innerHTML = '';
    let subtotal = 0;
    const shopMap = new Map();
    for (const it of items) {
        const key = it.shopID || it.shopName || 'unknown';
        if (!shopMap.has(key)) {
            shopMap.set(key, { shopID: it.shopID, shopName: it.shopName || 'Shop', items: [] });
        }
        shopMap.get(key).items.push(it);
    }

    for (const [, group] of shopMap) {
        const shopBox = document.createElement('div');
        shopBox.className = 'mb-4 rounded border bg-white';
        const shopHeaderLink = group.shopID ? `href="shop-info.html?id=${group.shopID}" class="hover:text-indigo-600"` : '';
        shopBox.innerHTML = `
            <div class="p-3 border-b bg-gray-50 font-medium text-gray-800">
                <a ${shopHeaderLink}>${group.shopName || 'Shop'}</a>
            </div>
        `;
        const list = document.createElement('div');
        list.className = 'divide-y';

        for (const it of group.items) {
            const line = (it.price || 0) * (it.quantity || 1);
            subtotal += line;

            let imageUrl = 'https://via.placeholder.com/64';
            try {
                const imgRes = await fetch(`http://localhost:8080/item/coverImage/${it.itemID}`);
                if (imgRes.ok) {
                    const blob = await imgRes.blob();
                    if (blob && blob.size > 0) {
                        imageUrl = URL.createObjectURL(blob);
                    }
                }
            } catch {}

            const row = document.createElement('div');
            row.className = 'py-3 px-3 flex items-center justify-between';
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${imageUrl}" alt="${it.itemName || 'Product'}" class="w-16 h-16 rounded object-cover border" />
                    <div>
                        <div class="font-medium text-gray-800">${it.itemName || 'Product'}</div>
                        ${Array.isArray(it.attributes) && it.attributes.length ? `<div class=\"text-xs text-gray-500\">${it.attributes.map(a => `${a.name}: ${a.value}`).join(', ')}</div>` : ''}
                        <div class="text-xs text-gray-500">Quantity: ${it.quantity || 1}</div>
                    </div>
                </div>
                <div class="font-semibold text-indigo-600">$${line.toFixed(2)}</div>
            `;
            list.appendChild(row);
        }

        shopBox.appendChild(list);
        itemsEl.appendChild(shopBox);
    }

    // Delivery selection
    let deliveryFee = 0; // both delivery methods are free
    function recalcTotals() {
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        deliveryFeeEl.textContent = `$${deliveryFee.toFixed(2)}`;
        grandTotalEl.textContent = `$${(subtotal + deliveryFee).toFixed(2)}`;
    }
    document.querySelectorAll('input[name="delivery"]').forEach(r => {
        r.addEventListener('change', () => {
            deliveryFee = 0;
            recalcTotals();
        });
    });
    recalcTotals();

    // Load addresses - show default first
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    let addresses = [];
    let userChangedAddress = false; // Theo dõi xem người dùng có thay đổi địa chỉ từ mặc định không
    try {
        const res = await fetch('http://localhost:8080/users/addresses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.code === 1 && Array.isArray(data.result)) {
                addresses = data.result.filter(a => a.active === true);
            }
        }
        // Sort default first
        addresses.sort((a,b)=> (b.defaultAddress?1:0) - (a.defaultAddress?1:0));
        // Hiển thị địa chỉ mặc định ngay từ đầu
        const defaultAddress = addresses.find(addr => addr.defaultAddress === true) || addresses[0];
        updateSelectedAddressSummary(defaultAddress);
    } catch (e) {
        selectedAddressSummary.innerHTML = '<div class="text-sm text-red-500">Error loading addresses.</div>';
    }

    // Add Address modal behavior
    // Address Manager (select + add)
    const manageBtn = document.getElementById('manageAddressBtn');
    const managerModal = document.getElementById('addressManagerModal');
    const closeManager = document.getElementById('closeAddressManager');
    const cancelManager = document.getElementById('cancelAddressManager');
    const confirmSelect = document.getElementById('confirmSelectAddress');
    const selectTabBtn = document.getElementById('selectTabBtn');
    const addTabBtn = document.getElementById('addTabBtn');
    const selectPanel = document.getElementById('selectPanel');
    const addPanel = document.getElementById('addPanel');
    const selectList = document.getElementById('addressSelectList');
    const addForm = document.getElementById('addAddressForm');

    function openManager() {
        if (!managerModal) return;
        renderAddressSelectList();
        managerModal.classList.remove('hidden');
    }
    function closeManagerModal() { if (managerModal) managerModal.classList.add('hidden'); }
    if (manageBtn) manageBtn.addEventListener('click', openManager);
    if (closeManager) closeManager.addEventListener('click', closeManagerModal);
    if (cancelManager) cancelManager.addEventListener('click', closeManagerModal);

    if (selectTabBtn && addTabBtn && selectPanel && addPanel) {
        selectTabBtn.addEventListener('click', () => {
            selectPanel.classList.remove('hidden');
            addPanel.classList.add('hidden');
            selectTabBtn.classList.add('bg-indigo-50','text-indigo-700');
            addTabBtn.classList.remove('bg-indigo-50','text-indigo-700');
        });
        addTabBtn.addEventListener('click', () => {
            addPanel.classList.remove('hidden');
            selectPanel.classList.add('hidden');
            addTabBtn.classList.add('bg-indigo-50','text-indigo-700');
            selectTabBtn.classList.remove('bg-indigo-50','text-indigo-700');
        });
    }

    function renderAddressSelectList() {
        if (!selectList) return;
        if (!Array.isArray(addresses)) addresses = [];
        selectList.innerHTML = addresses.map((a, idx)=>`
            <label class="flex items-start gap-3 p-3 border rounded ${a.defaultAddress ? 'bg-indigo-50 border-indigo-300' : 'border-gray-200'}">
                <input type="radio" name="shipAddressSelect" value="${a.addressID}" ${idx===0?'checked':''} class="mt-1 text-indigo-600">
                <div>
                    <div class="font-medium text-gray-800">${a.phone || ''}</div>
                    <div class="text-sm text-gray-700">${a.detail || ''}, ${a.ward || ''}, ${a.district || ''}, ${a.city || ''}</div>
                    ${a.defaultAddress ? '<span class="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Default</span>' : ''}
                </div>
            </label>
        `).join('');

        // Highlight selected row on change
        function updateSelectionHighlight() {
            const labels = selectList.querySelectorAll('label');
            labels.forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                if (input && input.checked) {
                    label.classList.add('bg-indigo-50');
                    label.classList.remove('border-gray-200');
                    label.classList.add('border-indigo-300');
                } else {
                    // Keep default badge style for defaultAddress, but remove active highlight
                    label.classList.remove('bg-indigo-50');
                    label.classList.remove('border-indigo-300');
                    label.classList.add('border-gray-200');
                }
            });
        }
        selectList.querySelectorAll('input[name="shipAddressSelect"]').forEach(r => {
            r.addEventListener('change', updateSelectionHighlight);
        });
        // Initial state
        updateSelectionHighlight();
    }

    if (confirmSelect) {
        confirmSelect.addEventListener('click', () => {
            const selected = document.querySelector('input[name="shipAddressSelect"]:checked');
            if (!selected) { closeManagerModal(); return; }
            const id = parseInt(selected.value);
            const addr = addresses.find(a => a.addressID === id) || null;
            updateSelectedAddressSummary(addr);
            userChangedAddress = true; // Đánh dấu người dùng đã thay đổi địa chỉ
            closeManagerModal();
        });
    }

    function updateSelectedAddressSummary(addr) {
        if (!selectedAddressSummary) return;
        if (!addr) {
            selectedAddressSummary.innerHTML = '<div class="text-sm text-gray-500">No address selected.</div>';
            return;
        }
        const isDefault = addr.defaultAddress === true;
        selectedAddressSummary.innerHTML = `
            <div class="p-3 border rounded bg-gray-50">
                <div class="font-medium text-gray-800">${addr.phone || ''}</div>
                <div class="text-sm text-gray-700">${addr.detail || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.city || ''}</div>
                ${isDefault ? '<div class="text-xs text-indigo-600 mt-1">Default Address</div>' : ''}
            </div>
        `;
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) { window.location.href = 'login.html'; return; }
            const body = {
                phone: document.getElementById('addrPhone').value,
                city: document.getElementById('addrCity').value,
                district: document.getElementById('addrDistrict').value,
                ward: document.getElementById('addrWard').value,
                detail: document.getElementById('addrDetail').value
            };
            try {
                const resp = await fetch('http://localhost:8080/users/addresses', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                if (resp.ok) {
                    // Append the new address locally and switch back to select tab
                    const added = await resp.json().catch(()=>null);
                    // If backend doesn't return the address, push from form
                    const newAddr = (added && added.result) || { ...body, addressID: Date.now(), defaultAddress: false, active: true };
                    addresses.unshift(newAddr);
                    renderAddressSelectList();
                    selectTabBtn.click();
                }
            } catch {}
        });
    }

    // Xử lý đặt hàng
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            // Lấy phương thức giao hàng đã chọn
            const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
            if (!selectedDelivery) {
                showErrorMessage('Please select a delivery method');
                return;
            }

            // Xử lý địa chỉ giao hàng
            let addressID = null;
            
            if (userChangedAddress) {
                // Nếu người dùng đã thay đổi địa chỉ từ modal, lấy địa chỉ đã chọn
                const selectedAddress = document.querySelector('input[name="shipAddressSelect"]:checked');
                if (selectedAddress) {
                    addressID = parseInt(selectedAddress.value);
                } else {
                    showErrorMessage('Please select a shipping address');
                    return;
                }
            } else {
                // Nếu người dùng không thay đổi địa chỉ, gửi null để backend tự động sử dụng địa chỉ mặc định
                addressID = null;
            }

            // Chuẩn bị dữ liệu gửi API
            let cartItemIDs = [];
            
            // Xử lý cartItemID - có thể là Set hoặc array
            items.forEach(item => {
                if (item.cartItemID !== undefined) {
                    if (item.cartItemID instanceof Set) {
                        cartItemIDs.push(...Array.from(item.cartItemID));
                    } else if (Array.isArray(item.cartItemID)) {
                        cartItemIDs.push(...item.cartItemID);
                    } else {
                        cartItemIDs.push(item.cartItemID);
                    }
                }
            });
            
            const orderData = {
                cartItemID: cartItemIDs,
                delivery: selectedDelivery.value,
                addressID: addressID
            };

            // Debug: Log order data
            console.log('Order data:', orderData);
            console.log('Items:', items);
            console.log('CartItemIDs:', cartItemIDs);
            console.log('User changed address:', userChangedAddress);
            console.log('AddressID:', addressID);
            
            // Kiểm tra nếu cartItemIDs rỗng
            if (cartItemIDs.length === 0) {
                showErrorMessage('No items selected for checkout');
                return;
            }

            try {
                // Disable nút để tránh click nhiều lần
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Processing...';

                const response = await fetch('http://localhost:8080/cart/order', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.code === 1) {
                        // Xóa dữ liệu checkout khỏi session storage
                        sessionStorage.removeItem('checkoutItems');
                        showSuccessMessage('Order placed successfully!');
                        // Chuyển hướng đến trang orders
                        setTimeout(() => {
                            window.location.href = 'orders.html';
                        }, 1500);
                    } else {
                        showErrorMessage('Order failed: ' + (result.message || 'An error occurred'));
                    }
                } else {
                    const errorText = await response.text();
                    console.log('Error response:', errorText);
                    console.log('Request body sent:', JSON.stringify(orderData));
                    showErrorMessage('Order failed: ' + response.status + ' - ' + response.statusText);
                }
            } catch (error) {
                console.error('Error placing order:', error);
                showErrorMessage('An error occurred while placing the order. Please try again.');
            } finally {
                // Khôi phục nút
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
        });
    }
});


