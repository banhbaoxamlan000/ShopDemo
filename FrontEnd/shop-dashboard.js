document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize AOS and Feather icons
    AOS.init();
    feather.replace();

    // Load shop info
    try {
        const response = await fetch("http://localhost:8080/shop/info", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok && data.result && data.result.shopResponse) {
            const shop = data.result.shopResponse;
            
            // Avatar
            const avatarImg = document.getElementById('shopAvatarSidebar');
            if (avatarImg) {
                try {
                    const avatarRes = await fetch("http://localhost:8080/shop/avatar", {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (avatarRes.ok) {
                        const blob = await avatarRes.blob();
                        avatarImg.src = URL.createObjectURL(blob);
                    } else {
                        throw new Error("Avatar not found");
                    }
                } catch {
                    avatarImg.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                }
            }
            
            // Shop name
            const nameDiv = document.getElementById('shopNameSidebar');
            if (nameDiv) {
                nameDiv.textContent = shop.shopName || "Shop Name";
            }
            
            // Shop type
            const typeDiv = document.getElementById('shopTypeSidebar');
            if (typeDiv) {
                typeDiv.textContent = shop.type || "";
            }
        }
    } catch (err) {
        console.error('Error loading shop info:', err);
    }

    // Setup navigation
    const menuItems = [
        { text: 'Products', href: 'shop-products.html' },
        { text: 'Orders', href: 'shop-orders.html' }
    ];
    
    menuItems.forEach(menuItem => {
        const menuElement = Array.from(document.querySelectorAll('.sidebar .flex.items-center span')).find(span => span.textContent.trim() === menuItem.text);
        if (menuElement) {
            menuElement.parentElement.addEventListener('click', function () {
                window.location.href = menuItem.href;
            });
        }
    });

    // Load products
    try {
        const response = await fetch("http://localhost:8080/shop/items", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (response.ok && data.code === 1 && Array.isArray(data.result)) {
            const productsList = document.getElementById("productsList");
            if (!productsList) return;
            
            productsList.innerHTML = "";
            
            // Update Total Products count
            const totalProductsDiv = document.getElementById("totalProductsCount");
            if (totalProductsDiv) {
                totalProductsDiv.textContent = data.result.length;
            }
            
            // Update Active Products count
            const activeProductsCount = data.result.filter(item => item.quantity > 0).length;
            const activeProductsDiv = document.getElementById("activeProductsCount");
            if (activeProductsDiv) {
                activeProductsDiv.textContent = activeProductsCount;
            }
            
            if (data.result.length === 0) {
                productsList.innerHTML = '<div class="text-gray-400 text-center w-full py-8">No products found.</div>';
                return;
            }
            
            for (const item of data.result) {
                // Fetch image
                let imgUrl = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                if (item.imageID) {
                    try {
                        const imgRes = await fetch(`http://localhost:8080/item/image/${item.imageID}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (imgRes.ok) {
                            const blob = await imgRes.blob();
                            imgUrl = URL.createObjectURL(blob);
                        }
                    } catch (err) {
                        console.error('Error loading product image:', err);
                    }
                }
                
                productsList.innerHTML += `
                <div class="product-card bg-white rounded-xl shadow-sm p-4 flex flex-col items-center" data-aos="fade-up">
                    <img src="${imgUrl}" alt="Product Image" class="w-32 h-32 object-cover rounded-lg mb-3 border">
                    <h3 class="font-semibold text-lg text-gray-800 mb-1">${item.name || 'Unnamed Product'}</h3>
                    <div class="text-gray-500 text-sm mb-1">Price: <span class="font-bold text-indigo-600">${(item.price || 0).toLocaleString()}₫</span></div>
                    <div class="text-gray-500 text-sm mb-1">Quantity: <span class="font-bold">${item.quantity || 0}</span></div>
                    <div class="flex gap-3 text-sm text-gray-400">
                        <span>Rate: ${Number(item.rate || 0).toFixed(1)}</span>
                        <span>Liked: ${item.liked || 0}</span>
                    </div>
                </div>
                `;
            }
            
            // Re-render feather icons after adding new content
            feather.replace();
        } else {
            console.error('Error loading products:', data.message || 'Unknown error');
            const productsList = document.getElementById("productsList");
            if (productsList) {
                productsList.innerHTML = '<div class="text-red-500 text-center w-full py-8">Error loading products. Please try again.</div>';
            }
        }
    } catch (err) {
        console.error('Error loading products:', err);
        const productsList = document.getElementById("productsList");
        if (productsList) {
            productsList.innerHTML = '<div class="text-red-500 text-center w-full py-8">Error loading products. Please try again.</div>';
        }
    }
});
