// profile.js
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token"); // token lưu khi login
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Xử lý search form
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Initialize header profile and cart
    initializeHeaderProfile(token);
    initializeCartDropdown();

    try {
        const response = await fetch("http://localhost:8080/users/myInfo", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (data.code !== 1) {
            throw new Error("Failed to fetch user info");
        }

        const user = data.result;

        // Update sidebar info
    document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-username").textContent = user.username ? `@${user.username}` : "";

        // Fetch avatar from backend (blob)
        try {
            const avatarRes = await fetch("http://localhost:8080/users/avatar", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (avatarRes.ok) {
                const blob = await avatarRes.blob();
                if (blob && blob.size > 0) {
                    document.getElementById("profile-picture").src = URL.createObjectURL(blob);
                } else {
                    document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
                }
            } else {
                document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
            }
        } catch (e) {
            document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
        }

        // Update form fields
            document.getElementById("first-name").value = user.firstName || "";
            document.getElementById("last-name").value = user.lastName || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("phone").value = user.phone || "";
            document.getElementById("birthday").value = user.dob || "";
            document.getElementById("username").value = user.username || "";

            // Xử lý cập nhật thông tin cá nhân (bao gồm username)
            const profileForm = document.getElementById("profile-form");
            if (profileForm) {
                profileForm.addEventListener("submit", async function (e) {
                    e.preventDefault();
                    const firstName = document.getElementById("first-name").value.trim();
                    const lastName = document.getElementById("last-name").value.trim();
                    const email = document.getElementById("email").value.trim();
                    const phone = document.getElementById("phone").value.trim();
                    const dob = document.getElementById("birthday").value.trim();
                    const username = document.getElementById("username").value.trim();
                    const token = localStorage.getItem("token");
                    if (!token) {
                        alert("You are not logged in!");
                        return;
                    }
                    try {
                        const response = await fetch("http://localhost:8080/users/update", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                firstName,
                                lastName,
                                email,
                                phone,
                                dob,
                                username
                            })
                        });
                        const data = await response.json();
                            // Không hiển thị alert khi cập nhật thành công hoặc thất bại
                    } catch (error) {
                         // Không hiển thị alert khi lỗi kết nối
                    }
                });
            }

    } catch (error) {
        console.error("Error while loading profile:", error);
    }

    // Initialize header profile functionality - same as products.js
    function initializeHeaderProfile(token) {
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

    // Logout function
    window.logout = function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    };

    // Initialize cart dropdown functionality
    function initializeCartDropdown() {
        const cartIcon = document.getElementById('cartIcon');
        const cartMenu = document.getElementById('cartMenu');
        
        if (cartIcon && cartMenu) {
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                cartMenu.classList.toggle('hidden');
                if (!cartMenu.classList.contains('hidden')) {
                    loadCartDropdown();
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!cartIcon.contains(e.target) && !cartMenu.contains(e.target)) {
                    cartMenu.classList.add('hidden');
                }
            });
        }
    }

    // Load cart items for dropdown
    async function loadCartDropdown() {
        const headerCartItems = document.getElementById('cartItems');
        const headerCartTotal = document.getElementById('cartTotal');
        
        if (!headerCartItems || !headerCartTotal || !token) return;
        
        try {
            const response = await fetch("http://localhost:8080/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (response.ok && data.code === 1 && Array.isArray(data.result.itemCart)) {
                let total = 0;
                let itemCount = 0;
                let itemsHtml = '';
                
                for (const shop of data.result.itemCart) {
                    if (shop.items && shop.items.length > 0) {
                        for (const item of shop.items) {
                            itemCount += item.quantity || 1;
                            total += (item.price || 0) * (item.quantity || 1);
                            
                            let attributesText = '';
                            if (item.attributes && Array.isArray(item.attributes)) {
                                attributesText = item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
                            }
                            
                            // Lấy ảnh cover từ API
                            let imageUrl = 'https://via.placeholder.com/48';
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
                            
                            itemsHtml += `
                                <div class="flex items-center space-x-3 py-2">
                                    <img src="${imageUrl}" alt="${item.itemName || 'Product'}" class="w-12 h-12 rounded object-cover border">
                                    <div class="flex-1">
                                        <h5 class="text-sm font-medium text-gray-800">${item.itemName || 'Product'}</h5>
                                        ${attributesText ? `<p class="text-xs text-gray-500">${attributesText}</p>` : ''}
                                        <p class="text-sm text-indigo-600">$${item.price || 0} x ${item.quantity || 1}</p>
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
                
                if (itemCount === 0) {
                    itemsHtml = '<p class="text-sm text-gray-500">Your cart is empty</p>';
                }
                
                headerCartItems.innerHTML = itemsHtml;
                headerCartTotal.innerHTML = `
                    <span class="font-medium">Total: $${total.toFixed(2)}</span>
                    <span class="text-sm text-gray-500">(${itemCount} items)</span>
                `;
            } else {
                headerCartItems.innerHTML = '<p class="text-sm text-gray-500">Your cart is empty</p>';
                headerCartTotal.innerHTML = '<span class="font-medium">Total: $0</span>';
            }
        } catch (error) {
            console.error('Error loading header cart:', error);
            headerCartItems.innerHTML = '<p class="text-sm text-red-500">Error loading cart</p>';
            headerCartTotal.innerHTML = '<span class="font-medium">Total: $0</span>';
        }
    }
});


// Bỏ phần gửi mail, chỉ lưu email và điều hướng
document.addEventListener("DOMContentLoaded", function () {
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value;
            if (!email) {
                alert('User email not found!');
                return;
            }
            localStorage.setItem("resetEmail", email);
            localStorage.setItem("flow", "reset");
            // Gửi code xác thực qua API trước khi điều hướng
            try {
                await fetch("http://localhost:8080/users/reset-password", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: "", email: email })
                });
            } catch (error) {
                alert("Failed to send verification code!");
                return;
            }
            window.location.href = "verify-code.html";
        });
    }
});

document.getElementById("avatarInput").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file); // key phải là 'image' cho Spring

    try {
        const response = await fetch("http://localhost:8080/users/update/avatar", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok && data.code === 1) {
            // Reload avatar from backend, no alert
            try {
                const avatarRes = await fetch("http://localhost:8080/users/avatar", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (avatarRes.ok) {
                    const blob = await avatarRes.blob();
                    if (blob && blob.size > 0) {
                        document.getElementById("profile-picture").src = URL.createObjectURL(blob);
                    } else {
                        document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
                    }
                } else {
                    document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
                }
            } catch (e) {
                document.getElementById("profile-picture").src = "https://placehold.co/150x150?text=Avatar";
            }
        } else {
            alert(data.result || "Failed to change avatar!");
        }
    } catch (error) {
        alert("Cannot connect to the server!");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/users/myInfo", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Nếu token hết hạn hoặc không hợp lệ, điều hướng về login
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();
        if (data.code !== 1) {
            throw new Error("Failed to fetch user info");
        }

        const user = data.result;

        document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;

        document.getElementById("first-name").value = user.firstName || "";
        document.getElementById("last-name").value = user.lastName || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("birthday").value = user.dob || "";

    // ...existing code...

    } catch (error) {
        window.location.href = "login.html";
    }
});

// Cart dropdown logic removed - no cart icon in header