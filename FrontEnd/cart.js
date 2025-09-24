document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("mainCartItems");
    const cartTotalEl = document.getElementById("mainCartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const selectedSet = new Set(); // cartItemID đã chọn
    let cartData = [];

    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    // Initialize header functionality
    initializeHeader();

    // Hàm fetch giỏ hàng từ backend
    async function fetchCart() {
        try {
            console.log("Fetching cart with token:", token);
            const response = await fetch("http://localhost:8080/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            console.log("Cart API response status:", response.status);
            const data = await response.json();
            console.log("Cart API response data:", data);
            
            if (response.ok && data.code === 1 && Array.isArray(data.result.itemCart)) {
                cartData = data.result.itemCart;
                console.log("Cart data loaded:", cartData);
                renderCart();
            } else {
                console.log("Cart is empty or error in response");
                cartItemsContainer.innerHTML = `<div class="text-center text-gray-500 py-8">Your cart is empty.</div>`;
                cartTotalEl.textContent = "$0";
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            cartItemsContainer.innerHTML = `<div class="text-center text-red-500 py-8">Error loading cart: ${error.message}</div>`;
            cartTotalEl.textContent = "$0";
        }
    }

    // Render giỏ hàng theo shop
    async function renderCart() {
        console.log("Rendering cart with data:", cartData);
        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (!cartData || cartData.length === 0) {
            console.log("No cart data to render");
            cartItemsContainer.innerHTML = `<div class="text-center text-gray-500 py-8">Your cart is empty.</div>`;
            return;
        }

        for (const shop of cartData) {
            if (!shop.items || shop.items.length === 0) continue;

            // Tạo container cho shop
            const shopContainer = document.createElement("div");
            shopContainer.className = "bg-white rounded-lg shadow border";
            
            // Shop header
            const shopHeader = document.createElement("div");
            shopHeader.className = "p-4 border-b bg-gray-50 rounded-t-lg";
            
            // Get shopID from first item
            const shopID = shop.items && shop.items.length > 0 ? shop.items[0].shopID : null;
            console.log('Shop ID:', shopID, 'for shop:', shop.shopName);
            
            shopHeader.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${shopID ? `<a href="shop-info.html?id=${shopID}" class="font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer">${shop.shopName}</a>` : `<h3 class="font-semibold text-gray-800">${shop.shopName}</h3>`}
                    </div>
                    <button class="text-blue-600 hover:underline text-sm">Chat with shop</button>
                </div>
            `;
            shopContainer.appendChild(shopHeader);

            // Items container
            const itemsContainer = document.createElement("div");
            itemsContainer.className = "divide-y";

            // Render từng item trong shop
            for (const item of shop.items) {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
                // Cộng vào tổng nếu item đang được chọn
                if (selectedSet.has(item.cartItemID)) total += itemTotal;

                // Lấy ảnh cover từ API
                let imageUrl = 'https://via.placeholder.com/80';
                try {
                    const imgResponse = await fetch(`http://localhost:8080/item/coverImage/${item.itemID}`);
                    if (imgResponse.ok) {
                        const blob = await imgResponse.blob();
                        if (blob.size > 0) {
                            imageUrl = URL.createObjectURL(blob);
                        }
                    }
                } catch (error) {
                    console.error('Error loading item image:', error);
                }

                // Tạo attributes string
                let attributesText = '';
                if (item.attributes && Array.isArray(item.attributes)) {
                    attributesText = item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
                }

                const itemRow = document.createElement("div");
                itemRow.className = "p-4 flex items-center gap-4";
                itemRow.setAttribute('data-cart-item-id', item.cartItemID);
                itemRow.innerHTML = `
                    <input type="checkbox" class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cart-check" ${selectedSet.has(item.cartItemID) ? 'checked' : ''} data-cart-item-id="${item.cartItemID}">
                    <img src="${imageUrl}" alt="${item.itemName || 'Product'}" class="w-20 h-20 rounded border object-cover">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${item.itemName || 'Product'}</h4>
                        ${attributesText ? `<p class="text-sm text-gray-500 mt-1">${attributesText}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="flex items-center gap-2">
                            <button class="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 quantity-btn" data-action="decrease" data-cart-item-id="${item.cartItemID}">-</button>
                            <span class="w-12 text-center quantity-display">${item.quantity || 1}</span>
                            <button class="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 quantity-btn" data-action="increase" data-cart-item-id="${item.cartItemID}">+</button>
                        </div>
                        <p class="font-semibold text-indigo-600 mt-2 item-total">$${itemTotal}</p>
                        <p class="hidden item-price">${item.price || 0}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button class="text-red-600 hover:underline text-sm" onclick="removeItem(${item.cartItemID})">Delete</button>
                    </div>
                `;
                itemsContainer.appendChild(itemRow);
                // checkbox change -> cập nhật set và tổng
                const checkbox = itemRow.querySelector('.cart-check');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        const id = item.cartItemID;
                        if (checkbox.checked) selectedSet.add(id); else selectedSet.delete(id);
                        updateCartTotalFromUI();
                        updateCheckoutState();
                    });
                }
                
                // Add event listeners for quantity buttons
                const quantityButtons = itemRow.querySelectorAll('.quantity-btn');
                quantityButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const cartItemID = parseInt(this.getAttribute('data-cart-item-id'));
                        const action = this.getAttribute('data-action');
                        const currentQuantitySpan = this.parentElement.querySelector('.quantity-display');
                        const currentQuantity = parseInt(currentQuantitySpan.textContent);
                        
                        let newQuantity;
                        if (action === 'increase') {
                            newQuantity = currentQuantity + 1;
                        } else if (action === 'decrease') {
                            newQuantity = currentQuantity - 1;
                        }
                        
                        if (newQuantity >= 1) {
                            updateQuantity(cartItemID, newQuantity);
                        }
                    });
                });
            }

            shopContainer.appendChild(itemsContainer);
            cartItemsContainer.appendChild(shopContainer);
        }

        cartTotalEl.textContent = `$${total.toFixed(2)}`;
        updateCheckoutState();
    }

    // Debounce timers for each cart item
    let updateTimeouts = {};

    // Track which items are currently being updated
    let updatingItems = new Set();

    // Hàm cập nhật số lượng với debounce cho từng item
    window.updateQuantity = async function(cartItemID, newQuantity) {
        if (newQuantity < 1) {
            // Don't allow quantity below 1
            return;
        }
        
        // Check if this item is already being updated
        if (updatingItems.has(cartItemID)) {
            return;
        }
        
        // Clear existing timeout for this specific item
        if (updateTimeouts[cartItemID]) {
            clearTimeout(updateTimeouts[cartItemID]);
        }
        
        // Update UI immediately for better UX
        updateQuantityUI(cartItemID, newQuantity);
        
        // Debounce API call for 500ms for this specific item
        updateTimeouts[cartItemID] = setTimeout(async () => {
            // Mark item as updating
            updatingItems.add(cartItemID);
            disableQuantityButtons(cartItemID, true);
            
            try {
                const response = await fetch(`http://localhost:8080/cart/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        cartItemID: cartItemID.toString(),
                        quantity: newQuantity.toString()
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.code === 1 && data.result) {
                        // Update cart total only, don't reload entire cart
                        updateCartTotal(data.result);
                    } else {
                        alert("Cannot update quantity!");
                        // Reload cart to revert changes
                        fetchCart();
                    }
                } else {
                    alert("Cannot update quantity!");
                    // Reload cart to revert changes
                    fetchCart();
                }
            } catch (error) {
                console.error("Error updating quantity:", error);
                alert("Connection error!");
                // Reload cart to revert changes
                fetchCart();
            } finally {
                // Mark item as no longer updating
                updatingItems.delete(cartItemID);
                disableQuantityButtons(cartItemID, false);
                
                // Clear timeout reference
                delete updateTimeouts[cartItemID];
            }
        }, 500);
    };

    // Helper function to disable/enable quantity buttons
    function disableQuantityButtons(cartItemID, disabled) {
        const itemRow = document.querySelector(`[data-cart-item-id="${cartItemID}"]`);
        if (itemRow) {
            const quantityButtons = itemRow.querySelectorAll('.quantity-btn');
            quantityButtons.forEach(button => {
                button.disabled = disabled;
                button.style.opacity = disabled ? '0.5' : '1';
                button.style.cursor = disabled ? 'not-allowed' : 'pointer';
            });
        }
    }

    // Helper function to update quantity in UI immediately
    function updateQuantityUI(cartItemID, newQuantity) {
        // Find the quantity span for this item and update it
        const quantitySpans = document.querySelectorAll(`[data-cart-item-id="${cartItemID}"] .quantity-display`);
        quantitySpans.forEach(span => {
            span.textContent = newQuantity;
        });
        
        // Update the total price for this item
        const itemRows = document.querySelectorAll(`[data-cart-item-id="${cartItemID}"]`);
        itemRows.forEach(row => {
            const priceElement = row.querySelector('.item-price');
            const totalElement = row.querySelector('.item-total');
            if (priceElement && totalElement) {
                const price = parseFloat(priceElement.textContent);
                const total = price * newQuantity;
                totalElement.textContent = `$${total}`;
            }
        });
        
        // Update cart total immediately
        updateCartTotalFromUI();
    }

    // Helper function to update cart total from current UI state
    function updateCartTotalFromUI() {
        let total = 0;
        // Tính lại tổng từ các hàng được chọn
        const rows = document.querySelectorAll('[data-cart-item-id]');
        rows.forEach(row => {
            const id = parseInt(row.getAttribute('data-cart-item-id'));
            if (!selectedSet.has(id)) return;
            const totalEl = row.querySelector('.item-total');
            if (!totalEl) return;
            const priceText = totalEl.textContent.replace('$', '');
            total += parseFloat(priceText) || 0;
        });
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
        updateCheckoutState();
    }

    // Helper function to update cart total from API response
    function updateCartTotal(cartData) {
        let total = 0;
        if (Array.isArray(cartData.itemCart)) {
            cartData.itemCart.forEach(shop => {
                if (shop.items && Array.isArray(shop.items)) {
                    shop.items.forEach(item => {
                        if (selectedSet.has(item.cartItemID)) {
                            total += (item.price || 0) * (item.quantity || 1);
                        }
                    });
                }
            });
        }
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
        updateCheckoutState();
    }

    function updateCheckoutState() {
        if (!checkoutBtn) return;
        checkoutBtn.disabled = selectedSet.size === 0;
    }

    // Handle Checkout: collect selected items and navigate
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (selectedSet.size === 0) return;

            // Gather selected items from current cartData
            const selectedItems = [];
            cartData.forEach(shop => {
                if (!Array.isArray(shop.items)) return;
                shop.items.forEach(item => {
                    if (selectedSet.has(item.cartItemID)) {
                        selectedItems.push({
                            cartItemID: item.cartItemID,
                            itemID: item.itemID,
                            itemName: item.itemName,
                            price: item.price,
                            quantity: item.quantity,
                            attributes: item.attributes || [],
                            shopID: item.shopID,
                            shopName: shop.shopName
                        });
                    }
                });
            });

            // Persist temporarily for checkout page
            try {
                sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
            } catch {}

            window.location.href = 'checkout.html';
        });
    }

    // Hàm xóa sản phẩm khỏi giỏ hàng
    window.removeItem = async function(cartItemID) {
        if (!confirm("Are you sure you want to remove this item?")) return;
        
        try {
            const response = await fetch(`http://localhost:8080/cart/${cartItemID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                // Reload cart
                fetchCart();
            } else {
                alert("Cannot remove item from cart!");
            }
        } catch (error) {
            alert("Connection error!");
        }
    };

    fetchCart();

    // Initialize header functionality (search, profile)
    function initializeHeader() {
        // Search functionality
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }

        // Profile functionality - same as products.js
        const headerProfile = document.getElementById('header-profile');
        if (headerProfile) {
            if (token) {
                // Avatar
                const avatarImg = document.createElement("img");
                avatarImg.id = "headerAvatar";
                avatarImg.className = "w-[60px] h-[60px] rounded-full border-2 border-indigo-500 cursor-pointer object-cover";
                avatarImg.alt = "Profile";
                avatarImg.src = "https://placehold.co/60x60?text=Avatar";
                headerProfile.appendChild(avatarImg);

                // Dropdown menu styled like index.js (top: 110px)
                const dropdown = document.createElement("div");
                dropdown.id = "headerProfileMenu";
                dropdown.className = "dropdown-menu";
                dropdown.style.position = "absolute";
                dropdown.style.right = "0";
                dropdown.style.top = "110px";
                dropdown.style.width = "160px";
                dropdown.style.background = "white";
                dropdown.style.borderRadius = "0.5rem";
                dropdown.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                dropdown.style.zIndex = "100";
                dropdown.style.display = "none";
                dropdown.innerHTML = `
                    <a href="profile.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Profile</a>
                    <a href="#" id="headerLogoutBtn" class="block px-4 py-2 text-red-600 hover:bg-gray-100">Logout</a>
                `;
                headerProfile.appendChild(dropdown);

                avatarImg.addEventListener("click", (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle("show");
                    dropdown.style.display = dropdown.classList.contains("show") ? "block" : "none";
                });
                document.addEventListener("click", (e) => {
                    if (!avatarImg.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove("show");
                        dropdown.style.display = "none";
                    }
                });

                dropdown.querySelector("#headerLogoutBtn").addEventListener("click", async (e) => {
                    e.preventDefault();
                    localStorage.removeItem("token");
                    window.location.href = "login.html";
                });

                // Lấy avatar từ backend
                fetch("http://localhost:8080/users/avatar", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).then(response => {
                    if (response.ok) {
                        return response.blob();
                    }
                    throw new Error('Failed to fetch avatar');
                }).then(blob => {
                    if (blob && blob.size > 0) {
                        avatarImg.src = URL.createObjectURL(blob);
                    }
                }).catch(error => {
                    console.error('Error loading avatar:', error);
                    // Keep default placeholder
                });
            } else {
                // User is not logged in
                headerProfile.innerHTML = `
                    <a href="login.html" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                    <a href="register.html" class="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Sign Up</a>
                `;
            }
        }
    }

    // Header cart functionality removed - no cart dropdown in header

    // Logout function
    window.logout = function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    };
});