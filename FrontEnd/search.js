document.addEventListener("DOMContentLoaded", async () => {
  // Xử lý search form từ header (nếu có)
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Điều hướng sang products.html kèm search query
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Nếu đang ở products.html thì render kết quả search
  if (window.location.pathname.includes("products.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search");
    const category = urlParams.get("category");
    const token = localStorage.getItem("token");

    const container = document.getElementById("search-results");
    // Nơi dành riêng cho thanh shop phía trên grid sản phẩm (nếu có)
    const shopBarEl = document.getElementById("shopBar");
    if (!container) return;

    console.log("search.js - search:", search, "category:", category);

    // Chỉ xử lý search query, không xử lý category query
    if (!search || category) {
      console.log("search.js - Skipping, no search query or category present");
      return; // Do nothing if no search query or a category is present
    }

    console.log("search.js - Processing search query:", search);

    try {
      const res = await fetch("http://localhost:8080/shopee/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ search })
      });

      const data = await res.json();
      console.log("search.js - API response:", data);
      
      if (data.code !== 1 || !data.result) {
        console.log("search.js - No results or invalid response:", data);
        container.innerHTML = `<p class="text-gray-500">No search results found.</p>`;
        return;
      }

      const items = data.result.itemResponse || [];
      const shops = data.result.shopResponses || [];

      console.log("search.js - Found items:", items.length, "shops:", shops.length);
      
      // Chỉ xóa nội dung items, giữ lại shop bar
      const existingItems = container.querySelectorAll('.product-card');
      existingItems.forEach(item => item.remove());

     // Render shop info theo dạng thanh ngang, đặt trên items
if (shops.length > 0) {
  // Bọc ngoài để canh giữa theo chiều ngang
  const shopSection = document.createElement("section");
  shopSection.className = "flex justify-center w-full mb-6";

  // Container cố định max width giống danh sách sản phẩm
  const shopContainer = document.createElement("div");
  shopContainer.className = "w-full max-w-screen-xl px-4";

  // Lấy shop đầu tiên hiển thị như Shopee
  const shop = shops[0];

  // Thanh thông tin shop full width
  const bar = document.createElement("div");
  bar.className = "w-full bg-white border rounded-xl shadow p-4 flex items-center gap-4";

  // Tạo avatar element với placeholder ban đầu
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold";
  avatarDiv.innerHTML = shop.shopName.charAt(0);

  bar.innerHTML = `
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="font-bold text-lg truncate">${shop.shopName}</span>
        <span class="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">Shopee Mall</span>
      </div>
      <div class="text-sm text-gray-500">${shop.shopUsername || ''}</div>
      <div class="text-xs text-gray-500">Followers: ${shop.followers || '0'} · Following: ${shop.following || '0'}</div>
    </div>
    <div class="hidden sm:flex items-center gap-8 text-sm text-gray-700">
      <div class="text-center">
        <div class="text-red-500 font-semibold">${shop.totalProduct || '0'}</div>
        <div class="text-gray-500">Products</div>
      </div>
      <div class="text-center">
        <div class="text-yellow-500 font-semibold">${Number(shop.rate || 0).toFixed(1)}</div>
        <div class="text-gray-500">Ratings</div>
      </div>
    </div>
    <button class="ml-auto whitespace-nowrap px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold">View Shop</button>
  `;

  // Chèn avatar vào đầu bar
  bar.insertBefore(avatarDiv, bar.firstChild);

  // Lấy avatar từ API nếu có shopID
  if (shop.shopID) {
    try {
      const avatarRes = await fetch("http://localhost:8080/shop/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          "pictureID": shop.shopID
        })
      });

      if (avatarRes.ok) {
        const avatarBlob = await avatarRes.blob();
        if (avatarBlob.size > 0) {
          const avatarUrl = URL.createObjectURL(avatarBlob);
          avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="${shop.shopName}" class="w-14 h-14 rounded-full object-cover" />`;
        }
      }
    } catch (err) {
      console.log("Failed to load shop avatar:", err);
    }
  }

  // Điều hướng tới trang shop
  bar.querySelector("button").onclick = () => {
    if (shop.shopID) {
      window.location.href = `shop-info.html?id=${shop.shopID}`;
    } else {
      console.log("Missing shopID, redirecting to home page");
      window.location.href = "index.html";
    }
  };

  shopContainer.appendChild(bar);
  shopSection.appendChild(shopContainer);
  // Nếu có vùng riêng cho shop bar thì gắn vào đó, tránh bị giới hạn bởi grid
  if (shopBarEl) {
    shopBarEl.innerHTML = "";
    shopBarEl.appendChild(shopSection);
  } else {
    container.appendChild(shopSection);
  }
}



      // Render items sau shop - sử dụng container có sẵn
      if (items.length > 0) {
        // Render items song song để tối ưu hiệu suất
        items.forEach(async (item) => {
          let imageUrl = "https://placehold.co/120x120?text=No+Image";
          if (item.itemID) {
            try {
              console.log(`Loading cover image for itemID: ${item.itemID}`);
              const imgRes = await fetch(`http://localhost:8080/item/coverImage/${item.itemID}`);
              if (imgRes.ok) {
                const blob = await imgRes.blob();
                if (blob.size > 0) {
                  imageUrl = URL.createObjectURL(blob);
                  console.log(`Cover image loaded for itemID: ${item.itemID}`);
                }
              } else {
                console.warn(`Failed to load cover image for itemID: ${item.itemID}, status: ${imgRes.status}`);
              }
            } catch (error) {
              console.warn('Error loading cover image for itemID:', item.itemID, error);
            }
          } else {
            console.warn('No itemID found for item:', item);
          }

          const card = document.createElement("div");
          card.className = "product-card bg-white rounded-lg shadow-sm border p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition";
          card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" class="w-24 h-24 object-cover rounded mb-3" />
            <div class="text-center">
              <h3 class="font-semibold text-lg text-gray-800 mb-1">${item.name}</h3>
              <div class="text-indigo-600 font-bold text-base mb-1">$${item.price}</div>
              <div class="text-sm text-teal-600 font-semibold">Quantity: ${item.quantity}</div>
              <div class="flex flex-col items-center justify-center mt-2">
                <span class="flex items-center justify-center gap-1 text-orange-500 font-semibold text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline-block" width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  <span>Rate: ${Number(item.rate).toFixed(1)}</span>
                </span>
              </div>
              ${item.city ? `<div class="text-xs text-gray-500 mt-1">City: ${item.city}</div>` : ""}
            </div>
          `;
          card.addEventListener("click", () => {
            window.location.href = `product-detail.html?id=${item.itemID}`;
          });
          container.appendChild(card);
        });
      }

      

      if (items.length === 0 && shops.length === 0) {
        container.innerHTML = `<p class="text-gray-500">No results.</p>`;
      }

      if (window.feather) feather.replace();
    } catch (err) {
      console.error("Search error:", err);
      container.innerHTML = `<p class="text-red-500">Error while searching.</p>`;
    }
  }
});
