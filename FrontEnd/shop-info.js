// Lấy shopID từ query string
const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get("id");
const token = localStorage.getItem("token");

// Redirect về index nếu không có shopID
if (!shopID) {
console.log("Missing shopID, redirecting to home page");
	window.location.href = "index.html";
}

async function loadShopData() {
	try {
		const res = await fetch(`http://localhost:8080/shopee/shop/${shopID}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			}
		});
		const data = await res.json();
        if (data.code !== 1 || !data.result) throw new Error("Shop not found");
		const shop = data.result.shopResponse;
		// Set shop info
		document.getElementById("shopName").textContent = shop.shopName;
		document.getElementById("shopUsername").textContent = shop.shopUsername || "";
		document.getElementById("shopRate").textContent = shop.rate || "0";
		document.getElementById("shopTotalProduct").textContent = shop.totalProduct || "0";
		document.getElementById("shopFollowers").textContent = shop.followers || "0";
		document.getElementById("shopFollowing").textContent = shop.following || "0";
		document.getElementById("shopAvatar").textContent = shop.shopName?.charAt(0) || "S";

		// Load avatar của shop
		await loadShopAvatar(shop.shopID);

		// Render sản phẩm
		renderProducts(data.result.items || []);
		
		// Kiểm tra trạng thái follow sau khi đã load shop data
		setTimeout(() => {
			console.log("About to call checkFollowStatus");
			checkFollowStatus();
		}, 200);
	} catch (err) {
		console.error("Error loading shop data", err);
	}
}

// Hàm load avatar của shop
async function loadShopAvatar(shopID) {
	if (!shopID) return;
	
	try {
		const avatarRes = await fetch("http://localhost:8080/shop/avatar", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({
				"pictureID": shopID
			})
		});

		if (avatarRes.ok) {
			const avatarBlob = await avatarRes.blob();
			if (avatarBlob.size > 0) {
				const avatarUrl = URL.createObjectURL(avatarBlob);
				const avatarElement = document.getElementById("shopAvatar");
				avatarElement.innerHTML = `<img src="${avatarUrl}" alt="Shop Avatar" class="w-24 h-24 rounded-full object-cover" />`;
			}
		}
	} catch (err) {
        console.log("Failed to load shop avatar:", err);
	}
}

// Hàm kiểm tra trạng thái follow
async function checkFollowStatus() {
	if (!shopID || !token) {
		console.log("Missing shopID or token:", { shopID, token: !!token });
		return;
	}
	
	console.log("Checking follow status for shopID:", shopID);
	
	try {
		const response = await fetch("http://localhost:8080/user/follow", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({
				"followingId": shopID
			})
		});
		
		console.log("Response status:", response.status);
		
		if (response.ok) {
			const data = await response.json();
			console.log("API response:", data);
			if (data.code === 1) {
				console.log("Calling updateFollowButton with:", data.result);
				updateFollowButton(data.result);
			}
		} else {
			console.log("Response not ok:", response.status);
		}
	} catch (error) {
		console.log("Lỗi kiểm tra follow status:", error);
	}
}

// Hàm cập nhật nút follow/unfollow
function updateFollowButton(isFollowing) {
	console.log("updateFollowButton called with:", isFollowing);
	const button = document.getElementById("followButton");
	if (!button) {
		console.log("Button not found!");
		return;
	}
	
	console.log("Button found, current text:", button.textContent);
	
	if (isFollowing) {
		// Đã follow -> hiển thị nút Unfollow (màu đỏ)
		console.log("Setting button to Unfollow (red)");
		button.textContent = "Unfollow";
		button.className = "px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors";
		button.setAttribute('data-action', 'unfollow');
	} else {
        // Not followed -> show Follow button (blue)
		console.log("Setting button to Follow (blue)");
		button.textContent = "Follow";
		button.className = "px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold transition-colors";
		button.setAttribute('data-action', 'follow');
	}
	
	console.log("Button updated, new text:", button.textContent);
}

// Hàm follow shop
async function followShop() {
	if (!shopID || !token) return;
	
	try {
		const response = await fetch("http://localhost:8080/user/follow", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({
				"followingId": shopID
			})
		});
		
		if (response.ok) {
			const data = await response.json();
			if (data.code === 1) {
				// Follow thành công -> chuyển sang Unfollow
				updateFollowButton(true);
				// Tăng số followers
				const followersElement = document.getElementById("shopFollowers");
				if (followersElement) {
					const currentFollowers = parseInt(followersElement.textContent) || 0;
					followersElement.textContent = currentFollowers + 1;
				}
			}
		}
	} catch (error) {
		console.log("Lỗi follow shop:", error);
	}
}

// Hàm unfollow shop
async function unfollowShop() {
	if (!shopID || !token) return;
	
	try {
		const response = await fetch("http://localhost:8080/user/follow", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({
				"followingId": shopID
			})
		});
		
		if (response.ok) {
			const data = await response.json();
			if (data.code === 1) {
				// Unfollow thành công -> chuyển sang Follow
				updateFollowButton(false);
				// Giảm số followers
				const followersElement = document.getElementById("shopFollowers");
				if (followersElement) {
					const currentFollowers = parseInt(followersElement.textContent) || 0;
					followersElement.textContent = Math.max(0, currentFollowers - 1);
				}
			}
		}
	} catch (error) {
		console.log("Lỗi unfollow shop:", error);
	}
}

// Event handler cho nút follow/unfollow
function handleFollowButtonClick(e) {
	e.preventDefault();
	const action = e.target.getAttribute('data-action');
	
	if (action === 'follow') {
		followShop();
	} else if (action === 'unfollow') {
		unfollowShop();
	}
}

function renderProducts(products) {
	const grid = document.getElementById("productsGrid");
	grid.innerHTML = "";
	products.forEach(p => {
		const card = document.createElement("div");
		card.className = "bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer";
		const imageUrl = p.imageID ? `http://localhost:8080/item/image/${p.imageID}` : '/images/no-image.png';
		card.innerHTML = `
			<img src="${imageUrl}" alt="${p.name}" class="w-full h-40 object-cover rounded-t-lg">
			<div class="p-3">
				<div class="text-sm font-semibold line-clamp-2 mb-2">${p.name}</div>
				<div class="text-red-500 font-bold mb-1">₫${p.price?.toLocaleString() || "0"}</div>
				<div class="text-xs text-gray-500">Quantity: ${p.quantity || 0}</div>
				<div class="text-xs text-orange-500">Rate: ${p.rate || 0}</div>
			</div>
		`;
		card.onclick = () => {
			window.location.href = `product-detail.html?id=${p.itemID}`;
		};
		grid.appendChild(card);
	});
}

// Header functionality
document.addEventListener("DOMContentLoaded", () => {
	// Search form
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

	// Header Profile
	const headerProfile = document.getElementById("header-profile");
	if (headerProfile) {
		if (token) {
			// Avatar
			const avatarImg = document.createElement("img");
			avatarImg.id = "headerAvatar";
			avatarImg.className = "w-[60px] h-[60px] rounded-full border-2 border-indigo-500 cursor-pointer object-cover";
			avatarImg.alt = "Profile";
			avatarImg.src = "https://placehold.co/60x60?text=Avatar";
			headerProfile.appendChild(avatarImg);

			// Dropdown menu
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

			// Load user avatar
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

	// Cart dropdown
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

	// Initialize feather icons
	if (window.feather) feather.replace();
	
	// Thêm event listener cho follow button
	const followButton = document.getElementById("followButton");
	if (followButton) {
		followButton.addEventListener('click', handleFollowButtonClick);
		console.log("Follow button event listener added");
	}
});

loadShopData();

// Gọi trực tiếp để test
setTimeout(() => {
	console.log("Direct call to checkFollowStatus");
	checkFollowStatus();
}, 1000);
