// Kiểm tra query params và redirect nếu cần
const urlParams = new URLSearchParams(window.location.search);
const categoryQuery = urlParams.get('category');
const searchQuery = urlParams.get('search');
if (!categoryQuery && !searchQuery) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const token = localStorage.getItem('token');

    // Query params
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';

    // Search form và input - xử lý cả submit và keydown
    const searchForm = document.getElementById("searchForm");
    
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
        searchInput.value = searchQuery;
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
	const headerProfile = document.getElementById("header-profile");
	const token = localStorage.getItem("token");
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
			})
			.then(res => {
				if (res.ok) return res.blob();
				return null;
			})
			.then(blob => {
				if (blob && blob.size > 0) {
					avatarImg.src = URL.createObjectURL(blob);
				} else {
					avatarImg.src = "https://placehold.co/60x60?text=Avatar";
				}
			});
		} else {
			// Không có token, hiển thị nút Log in/Sign up
			const loginBtn = document.createElement("a");
			loginBtn.href = "login.html";
			loginBtn.className = "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium mr-2";
			loginBtn.textContent = "Log in";
			const signupBtn = document.createElement("a");
			signupBtn.href = "register.html";
			signupBtn.className = "px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 font-medium";
			signupBtn.textContent = "Sign up";
			headerProfile.appendChild(loginBtn);
			headerProfile.appendChild(signupBtn);
		}
	}
});

// Cart dropdown logic
document.addEventListener("DOMContentLoaded", () => {
	const cartIcon = document.getElementById("cartIcon");
	const cartMenu = document.getElementById("cartMenu");
	const viewCartBtn = document.getElementById("viewCartBtn");

	// Hàm load giỏ hàng từ API mới
	async function loadCart() {
		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			const response = await fetch("http://localhost:8080/cart", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.code === 1 && data.result && Array.isArray(data.result.itemCart)) {
					await renderCartItems(data.result.itemCart);
				}
			}
		} catch (error) {
			console.error("Error loading cart:", error);
		}
	}

	// Hàm render các item trong giỏ hàng
	async function renderCartItems(cartData) {
		const cartItemsDiv = document.getElementById("cartItems");
		const cartTotalDiv = document.getElementById("cartTotal");
		
		if (cartItemsDiv) cartItemsDiv.innerHTML = "";
		if (cartTotalDiv) cartTotalDiv.innerHTML = "";

		if (cartData.length === 0) {
			if (cartItemsDiv) {
				cartItemsDiv.innerHTML = `<p class="text-gray-500 text-sm">Your cart is empty.</p>`;
			}
			return;
		}

		let total = 0;
		let itemsToShow = [];

		// Flatten tất cả items từ các shop
		cartData.forEach(shop => {
			if (shop.items && Array.isArray(shop.items)) {
				shop.items.forEach(item => {
					itemsToShow.push(item);
				});
			}
		});

		// Chỉ hiển thị 3 items đầu tiên
		const itemsToRender = itemsToShow.slice(0, 3);
		
		for (const item of itemsToRender) {
			total += (item.price || 0) * (item.quantity || 1);
			
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

			// Tạo attributes string
			let attributesText = '';
			if (item.attributes && Array.isArray(item.attributes)) {
				attributesText = item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
			}

			if (cartItemsDiv) {
				cartItemsDiv.innerHTML += `
					<div class="flex items-center p-2 border-b">
						<img src="${imageUrl}" alt="${item.itemName || 'Product'}" class="w-12 h-12 rounded object-cover">
						<div class="ml-3 flex-1">
							<p class="text-sm font-medium">${item.itemName || 'Product'}</p>
							${attributesText ? `<p class="text-xs text-gray-400">${attributesText}</p>` : ''}
							<p class="text-xs text-gray-500">${item.quantity || 1} x $${item.price || 0}</p>
						</div>
					</div>
				`;
			}
		}

		// Hiển thị total
		if (cartTotalDiv) {
			cartTotalDiv.innerHTML = `
				<span class="text-sm font-medium">Total: $${total.toFixed(2)}</span>
			`;
		}
	}

	// Đóng dropdown khi click outside
	document.addEventListener("click", (e) => {
		if (!cartIcon.contains(e.target) && !cartMenu.contains(e.target)) {
			cartMenu.classList.add("hidden");
		}
	});

	if (viewCartBtn) {
		viewCartBtn.addEventListener("click", () => {
			window.location.href = "cart.html";
		});
	}

	// Load giỏ hàng khi page load
	loadCart();

	// Cập nhật cart icon click để reload cart
	if (cartIcon && cartMenu) {
		cartIcon.addEventListener("click", (e) => {
			e.preventDefault();
			cartMenu.classList.toggle("hidden");
			
			// Reload cart khi click vào icon
			if (!cartMenu.classList.contains("hidden")) {
				loadCart();
			}
		});
	}
});