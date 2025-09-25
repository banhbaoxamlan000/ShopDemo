document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  /* ------------------------------
   *  Render sản phẩm & click card
   * ------------------------------ */
  const productGrid = document.querySelector(".product-results-grid");
  function renderProducts(products) {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    if (!products || products.length === 0) {
      productGrid.innerHTML =
        '<div class="col-span-full text-center text-gray-500 text-lg">No products found.</div>';
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "product-card bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition";
      card.dataset.itemId = product.itemID || product.id || product._id || "";
      card.innerHTML = `
        <img src="${product.image || "https://via.placeholder.com/120"}" alt="${
        product.name
      }" class="w-32 h-32 object-cover rounded-lg mb-3" />
        <div class="font-semibold text-lg text-gray-900 mb-1">${
          product.name
        }</div>
        <div class="text-pink-500 font-bold mb-1">${
          product.price ? "$" + product.price : ""
        }</div>
        <div class="text-gray-500 text-sm">${product.category || ""}</div>
      `;
      productGrid.appendChild(card);
    });
  }

  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (card && card.dataset.itemId) {
        window.location.href = `product-detail.html?id=${card.dataset.itemId}`;
      }
    });
  }
  window.renderProducts = renderProducts;

  /* ------------------------------
   *  Search
   * ------------------------------ */
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

  /* ------------------------------
   *  Category click
   * ------------------------------ */
  const categoryGrid = document.querySelector("#categories .grid, #categories .mt-10.grid");
  if (categoryGrid) {
    categoryGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".category-card[data-category-name]");
      if (card) {
        e.preventDefault();
        const catName = card.dataset.categoryName;
        if (catName) {
          window.location.href = `products.html?category=${encodeURIComponent(catName)}`;
        }
      }
    });
  }

  /* ------------------------------
   *  Featured Products
   * ------------------------------ */
  async function loadFeatured() {
    const featuredSection = document.querySelector(".py-12.bg-gray-50 .grid");
    if (!featuredSection) return;
    try {
      const res = await fetch("http://localhost:8080/shopee/main");
      const data = await res.json();
      if (data.code === 1 && Array.isArray(data.result)) {
        featuredSection.innerHTML = "";
        for (const item of data.result) {
          let imageUrl = "https://placehold.co/120x120?text=No+Image";
          try {
            const imgRes = await fetch(`http://localhost:8080/item/image/${item.imageID}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              if (blob.size > 0) {
                imageUrl = URL.createObjectURL(blob);
              }
            }
          } catch {}
          featuredSection.innerHTML += `
            <div class="product-card bg-white rounded-lg shadow-sm border p-4 flex flex-col items-center" data-item-id="${
              item.itemID || item.id || ""
            }">
              <img src="${imageUrl}" alt="${
            item.name
          }" class="w-24 h-24 object-cover rounded mb-3" />
              <div class="text-center">
                <h3 class="font-semibold text-lg text-gray-800 mb-1">${item.name}</h3>
                <div class="text-indigo-600 font-bold text-base mb-1">$${item.price}</div>
                <div class="text-sm text-teal-600 font-semibold">Quantity: ${
                  item.quantity
                }</div>
                <div class="flex items-center justify-center mt-2 gap-1 text-orange-500 font-semibold text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  <span>Rate: ${Number(item.rate).toFixed(1)}</span>
                </div>
              </div>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error("Cannot load featured products:", err);
    }
  }
  loadFeatured();

  /* ------------------------------
   *  Categories (Shop by Category)
   * ------------------------------ */
  async function loadCategories() {
    const categoryContainer = document.querySelector("#categories .grid, #categories .mt-10.grid");
    if (!categoryContainer) return;

    try {
      const res = await fetch("http://localhost:8080/category/name");
      const data = await res.json();
      if (!Array.isArray(data.result)) return;

      const categories = data.result;
      let shown = 12;

      const iconMap = {
        "books & stationery": "https://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/book-icon.png",
        "computer & accessories": "https://tse3.mm.bing.net/th/id/OIP.HunZDOnZqBIayX3qQp631QHaHa?rs=1&pid=ImgDetMain",
        "women clothes": "https://tse4.mm.bing.net/th/id/OIP.hyQxk6gNTJu6DsxbzweuSgHaHa?rs=1&pid=ImgDetMain",
        "consumer electronics": "https://cdn1.vectorstock.com/i/1000x1000/02/90/tv-icon-vector-13820290.jpg",
        "sport & outdoor": "https://static.vecteezy.com/system/resources/previews/012/377/742/original/black-soccer-ball-football-icon-sign-symbol-png.png",
        "mobile & gadgets": "https://www.graphicmore.com/wp-content/uploads/2018/01/Mobile-Icon-Design-Free-PSD-Download.jpg",
        "men clothes": "https://tse3.mm.bing.net/th/id/OIP.faUucbQ7ZB2oyBtn9qonbAHaHa?rs=1&pid=ImgDetMain",
        "automotive": "https://tse3.mm.bing.net/th/id/OIP.YELO58ZxtDtQySMbOGIr4QHaHa?rs=1&pid=ImgDetMain",
        beauty: "https://img.freepik.com/premium-vector/lipstick-icon_933463-3390.jpg",
        cameras: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=80&q=80"
      };

      function normalize(str) {
        return str.toLowerCase().replace(/\s+/g, " ").trim();
      }

      function renderCategories(count) {
        categoryContainer.innerHTML = "";
        categories.slice(0, count).forEach((cat) => {
          const name = cat.result || "No name";
          const key = normalize(name);
          const imgUrl = iconMap[key] || "https://via.placeholder.com/80";
          categoryContainer.innerHTML += `
            <a href="#" class="category-card bg-white rounded-lg overflow-hidden shadow-sm border transition" data-category-name="${name}">
              <div class="p-4 flex flex-col items-center">
                <div class="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden">
                  <img src="${imgUrl}" alt="${name}" class="w-full h-full object-contain" />
                </div>
                <h3 class="mt-4 text-sm font-medium text-gray-900 text-center">${name}</h3>
              </div>
            </a>
          `;
        });

        let moreBtn = categoryContainer.parentElement.querySelector(".show-more-category-btn");
        if (categories.length > count) {
          if (!moreBtn) {
            moreBtn = document.createElement("button");
            moreBtn.textContent = "Xem thêm";
            moreBtn.className =
              "show-more-category-btn mt-6 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium block mx-auto";
            categoryContainer.parentElement.appendChild(moreBtn);
          }
          moreBtn.onclick = () => {
            shown += 12;
            renderCategories(shown);
          };
        } else if (moreBtn) {
          moreBtn.remove();
        }
      }

      renderCategories(shown);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }
  loadCategories();

  /* ------------------------------
   *  Header Profile
   * ------------------------------ */
  const headerProfile = document.getElementById("header-profile");
  if (headerProfile) {
    if (token) {
      const avatarImg = document.createElement("img");
      avatarImg.id = "headerAvatar";
      avatarImg.className =
        "w-[60px] h-[60px] rounded-full border-2 border-indigo-500 cursor-pointer object-cover";
      avatarImg.alt = "Profile";
      avatarImg.src = "https://placehold.co/60x60?text=Avatar";
      headerProfile.appendChild(avatarImg);

      const dropdown = document.createElement("div");
      dropdown.id = "headerProfileMenu";
      dropdown.className = "dropdown-menu";
      dropdown.style.top = "110px";
      dropdown.innerHTML = `
        <a href="profile.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Profile</a>
        <a href="#" id="headerLogoutBtn" class="block px-4 py-2 text-red-600 hover:bg-gray-100">Logout</a>
      `;
      headerProfile.appendChild(dropdown);

      avatarImg.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });
      document.addEventListener("click", (e) => {
        if (!avatarImg.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove("show");
        }
      });

      dropdown.querySelector("#headerLogoutBtn").addEventListener("click", async (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "login.html";
      });

      fetch("http://localhost:8080/users/avatar", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (blob && blob.size > 0) {
            avatarImg.src = URL.createObjectURL(blob);
          }
        });
    } else {
      const loginBtn = document.createElement("a");
      loginBtn.href = "login.html";
      loginBtn.className =
        "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium mr-2";
      loginBtn.textContent = "Log in";
      const signupBtn = document.createElement("a");
      signupBtn.href = "register.html";
      signupBtn.className =
        "px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 font-medium";
      signupBtn.textContent = "Sign up";
      headerProfile.appendChild(loginBtn);
      headerProfile.appendChild(signupBtn);
    }
  }

  /* ------------------------------
   *  Logout ở nơi khác (nếu có)
   * ------------------------------ */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          localStorage.removeItem("token");
          window.location.href = "login.html";
        } else {
          const data = await response.json();
          alert("Lỗi khi đăng xuất: " + (data.message || response.status));
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("Cannot connect to the server!");
      }
    });
  }

  /* ------------------------------
   *  Cart dropdown
   * ------------------------------ */
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
