// Render sản phẩm theo danh sách products
function renderProducts(products, targetId, filterState = {}) {
	const productsGrid = document.getElementById(targetId);
	if (!productsGrid) return;
	productsGrid.innerHTML = '';
	if (!products || products.length === 0) {
		productsGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">No products found.</div>';
		return;
	}
	(async () => {
		for (const product of products) {
			if (filterState.priceMin && product.price < Number(filterState.priceMin)) continue;
			if (filterState.priceMax && product.price > Number(filterState.priceMax)) continue;
			if (filterState.rate && product.rate < Number(filterState.rate)) continue;
			if (filterState.city && product.city && product.city !== filterState.city) continue;

			let imageUrl = "https://placehold.co/120x120?text=No+Image";
			if (product.imageID) {
				try {
					const res = await fetch(`http://localhost:8080/item/image/${product.imageID}`);
					if (res.ok) {
						const blob = await res.blob();
						if (blob && blob.size > 0) {
							imageUrl = URL.createObjectURL(blob);
						}
					}
				} catch {}
			}

			const card = document.createElement('div');
			card.className = "product-card bg-white rounded-lg shadow-sm border p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition";
			card.innerHTML = `
				<img src="${imageUrl}" alt="${product.name}" class="w-24 h-24 object-cover rounded mb-3" />
				<div class="text-center">
				  <h3 class="font-semibold text-lg text-gray-800 mb-1">${product.name}</h3>
				  <div class="text-indigo-600 font-bold text-base mb-1">$${product.price}</div>
				  <div class="text-sm text-teal-600 font-semibold">Quantity: ${product.quantity}</div>
				  <div class="flex flex-col items-center justify-center mt-2">
					<span class="flex items-center justify-center gap-1 text-orange-500 font-semibold text-base">
					  <svg xmlns="http://www.w3.org/2000/svg" class="inline-block" width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
					  <span>Rate: ${product.rate}</span>
					</span>
				  </div>
				  ${product.city ? `<div class="text-xs text-gray-500 mt-1">City: ${product.city}</div>` : ""}
				</div>
			`;
			card.addEventListener('click', function() {
				window.location.href = `product-detail.html?id=${product.itemID}`;
			});
			productsGrid.appendChild(card);
		}
	})();
}
// Render filterBar gồm category, subcategory, city, price, rate, nút Apply Filter
// Sử dụng: renderFilterBar(targetElementId, options)
// options: {
//   selectedCategory, selectedSubcategory, filterState, onFilter, onCategoryChange
// }
function renderFilterBar(targetElementId, options = {}) {
	const token = localStorage.getItem('token');
	const target = document.getElementById(targetElementId);
	if (!target) return;

	let cities = [];
	let subcategories = [];
	let selectedCategory = options.selectedCategory || '';
	let selectedSubcategory = options.selectedSubcategory || '';
	let filterState = options.filterState || { priceMin: '', priceMax: '', city: '', rate: '' };

	// Helper: render sub list HTML (expanded = true => all, false => first 5)
	function renderSubListHTML(expanded) {
		const list = expanded ? subcategories : subcategories.slice(0, 5);
		const html = list.map(subcat => {
			const isSelected = (selectedSubcategory && selectedSubcategory === subcat);
			const selStyle = isSelected ? 'background: rgba(99,102,241,0.12); font-weight:600; padding:4px 6px; border-radius:6px;' : '';
			return `<li class="subcategory-item text-gray-800 font-normal mb-1 cursor-pointer" style="list-style:none; ${selStyle}">${subcat}</li>`;
		}).join('');
		const toggleNeeded = subcategories.length > (expanded ? 0 : 5);
		const toggleBtn = toggleNeeded ? `<li class="toggle-subcategory text-indigo-600 cursor-pointer text-sm mt-2" style="list-style:none;" data-expanded="${expanded}">${expanded ? 'Show less...' : 'Show more...'}</li>` : '';
		return html + toggleBtn;
	}

	// Gắn event cho subcategory + toggle
	function attachSubcategoryEvents(subList, expanded) {
		// Toggle show more/less
		const toggleBtn = subList.querySelector('.toggle-subcategory');
		if (toggleBtn) {
			toggleBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				const newExpanded = toggleBtn.getAttribute('data-expanded') === 'true' ? false : true;
				subList.innerHTML = renderSubListHTML(newExpanded);
				attachSubcategoryEvents(subList, newExpanded);
			});
		}

		// Chọn subcategory
		subList.querySelectorAll('.subcategory-item').forEach(item => {
			item.addEventListener('click', function(e) {
				e.stopPropagation();
				const clicked = item.textContent.trim();
				selectedSubcategory = (selectedSubcategory === clicked) ? '' : clicked;
				subList.innerHTML = renderSubListHTML(expanded);
				attachSubcategoryEvents(subList, expanded);
			});
		});
	}

	// Hàm load subcategory theo category
	function loadSubcategories(categoryName) {
		return fetch("http://localhost:8080/category/detail", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			},
			body: JSON.stringify({ name: categoryName, detail: "" })
		})
		.then(res => res.json())
		.then(data => {
			subcategories = (data.result || []).map(item => item.result);
			if (!subcategories.includes(selectedSubcategory)) {
				selectedSubcategory = '';
			}
			renderFilterUI();
		});
	}

	// Render filter UI
	function renderFilterUI() {
		const subListHTML = renderSubListHTML(false);


		// Lấy searchQuery và categoryQuery
		const urlParams = new URLSearchParams(window.location.search);
		const categoryQueryParam = urlParams.get('category');
		const searchQueryParam = urlParams.get('search');

		// Nếu chỉ có searchQuery (không có categoryQuery), ẩn hoàn toàn phần category
		let categorySection = '';
		if (categoryQueryParam) {
			categorySection = `
				<ul class="category-list mb-6">
					<li class="font-bold text-lg text-black mb-2 category-main" style="list-style:none;">
						${categoryQueryParam}
						<ul class="subcategory-list mt-2 ml-3">${subListHTML}</ul>
					</li>
				</ul>
			`;
		} else if (!categoryQueryParam && !searchQueryParam) {
			categorySection = `
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Select Category</label>
					<select id="categorySelect" class="border rounded px-2 py-1 w-full">
						<option value="">-- Choose category --</option>
					</select>
				</div>
			`;
		}

		target.innerHTML = `
			<div class="bg-white rounded-xl shadow p-4 mb-6">
				${categorySection}
				<h3 class="font-bold text-lg mb-4">Filter Products</h3>
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Price Range</label>
					<div class="flex gap-2">
						<input type="number" min="0" id="priceMin" placeholder="Min" class="border rounded px-2 py-1 w-20" value="${filterState.priceMin}" />
						<span>-</span>
						<input type="number" min="0" id="priceMax" placeholder="Max" class="border rounded px-2 py-1 w-20" value="${filterState.priceMax}" />
					</div>
				</div>
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">City</label>
					<select id="cityFilter" class="border rounded px-2 py-1 w-full">
						<option value="">Cities</option>
						${cities.map(city => `<option value="${city.name}">${city.name}</option>`).join('')}
					</select>
				</div>
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Min Rate</label>
					<input type="number" min="0" max="5" id="rateFilter" placeholder="Min rate" class="border rounded px-2 py-1 w-32" value="${filterState.rate}" />
				</div>
				<button id="applyFilterBtn" class="bg-indigo-600 text-white px-4 py-2 rounded font-semibold w-full">Apply Filter</button>
			</div>
		`;

		// Nếu chưa có categoryQuery thì gắn sự kiện chọn category
		if (!categoryQueryParam) {
			const categorySelect = document.getElementById("categorySelect");
			if (categorySelect) {
				fetch("http://localhost:8080/category/name", {
					method: "GET",
					headers: { "Authorization": "Bearer " + token }
				})
				.then(res => res.json())
				.then(data => {
					const categories = data.result || [];
					categorySelect.innerHTML = `<option value="">-- Choose category --</option>` +
						categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
					if (selectedCategory) categorySelect.value = selectedCategory;
				});

				categorySelect.addEventListener("change", (e) => {
					selectedCategory = e.target.value;
					if (selectedCategory) {
						loadSubcategories(selectedCategory);
					} else {
						subcategories = [];
						selectedSubcategory = '';
						renderFilterUI();
					}
					if (options.onCategoryChange) options.onCategoryChange(selectedCategory);
				});
			}
		}

		// Apply filter button
		const applyFilterBtn = document.getElementById("applyFilterBtn");
		if (applyFilterBtn) {
			applyFilterBtn.onclick = function() {
				filterState.priceMin = document.getElementById('priceMin').value;
				filterState.priceMax = document.getElementById('priceMax').value;
				filterState.city = document.getElementById('cityFilter').value;
				filterState.rate = document.getElementById('rateFilter').value;

				if (selectedSubcategory) {
					const params = new URLSearchParams();
					params.set('category', selectedSubcategory);
					if (options.searchQuery) params.set('search', options.searchQuery);
					window.location.href = `products.html?${params.toString()}`;
					return;
				}
				if (options.onFilter) options.onFilter({ selectedCategory, selectedSubcategory, filterState });
			};
		}

		// Gắn event cho subcategory list
		const subList = target.querySelector('.subcategory-list');
		if (subList) {
			attachSubcategoryEvents(subList, false);
		}
	}

	// Fetch cities rồi render UI ban đầu
	fetch('https://provinces.open-api.vn/api/p/')
		.then(res => res.json())
		.then(data => {
			cities = Array.isArray(data) ? data : [];
			renderFilterUI();
		// Chỉ xử lý nếu đang ở products.html và có category query
		if (window.location.pathname.includes("products.html")) {
			const urlParams = new URLSearchParams(window.location.search);
			const categoryQueryParam = urlParams.get('category');
			const searchQueryParam = urlParams.get('search');
			
			console.log("search-category.js - categoryQueryParam:", categoryQueryParam);
			console.log("search-category.js - searchQueryParam:", searchQueryParam);
			
			// Xử lý category query (không quan tâm search query)
			if (categoryQueryParam) {
				console.log("Loading category products for:", categoryQueryParam);
				loadSubcategories(categoryQueryParam);
				loadCategoryProducts(categoryQueryParam);
			} else if (selectedCategory) {
				loadSubcategories(selectedCategory);
			}
		}
		})
		.catch(err => console.error("Lỗi load filter:", err));

	// Hàm load products theo category
	function loadCategoryProducts(categoryName) {
		const container = document.getElementById("search-results");
		if (!container) {
			console.log("Container search-results không tồn tại");
			return;
		}

		console.log("Fetching products for category:", categoryName);
		
		// Sử dụng API /shopee/category với format đúng
		const requestBody = {
			"name": categoryName,
			"detail": ""
		};
		console.log("Request body:", JSON.stringify(requestBody));
		
		fetch("http://localhost:8080/shopee/category", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			},
			body: JSON.stringify(requestBody)
		})
		.then(res => {
			console.log("API /shopee/category response status:", res.status);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			return res.json();
		})
		.then(data => {
			console.log("API /shopee/category response data:", data);
			if (data.code === 1 && Array.isArray(data.result)) {
				console.log("Found products:", data.result.length);
				renderProducts(data.result, "search-results");
			} else {
				console.log("No products found or invalid response:", data);
				container.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">Không có sản phẩm trong category này.</div>';
			}
		})
		.catch(err => {
			console.error("Lỗi load category products:", err);
			container.innerHTML = `<div class="col-span-full text-center text-red-500 text-lg">Có lỗi khi tải sản phẩm: ${err.message}</div>`;
		});
	}
}
