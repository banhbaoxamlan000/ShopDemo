// Render sản phẩm theo danh sách products
async function renderProducts(products, targetId, filterState = {}) {
	const productsGrid = document.getElementById(targetId);
	if (!productsGrid) return;
	productsGrid.innerHTML = '';
	if (!products || products.length === 0) {
		productsGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">No products found.</div>';
		return;
	}
	// Render products với async handling tốt hơn - sử dụng Promise.all để tránh race condition
	const renderPromises = products.map(async (product) => {
		// Apply filters
		if (filterState.priceMin && product.price < Number(filterState.priceMin)) return null;
		if (filterState.priceMax && product.price > Number(filterState.priceMax)) return null;
		if (filterState.rate && product.rate < Number(filterState.rate)) return null;
		if (filterState.city && product.city && product.city !== filterState.city) return null;

		let imageUrl = "https://placehold.co/120x120?text=No+Image";
		if (product.itemID) {
			try {
				console.log(`Loading cover image for itemID: ${product.itemID}`);
				const res = await fetch(`http://localhost:8080/item/coverImage/${product.itemID}`);
				if (res.ok) {
					const blob = await res.blob();
					if (blob && blob.size > 0) {
						imageUrl = URL.createObjectURL(blob);
						console.log(`Cover image loaded for itemID: ${product.itemID}`);
					}
				} else {
					console.warn(`Failed to load cover image for itemID: ${product.itemID}, status: ${res.status}`);
				}
			} catch (error) {
				console.warn('Error loading cover image for itemID:', product.itemID, error);
			}
		} else {
			console.warn('No itemID found for product:', product);
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
				  <span>Rate: ${Number(product.rate).toFixed(1)}</span>
				</span>
			  </div>
			  ${product.city ? `<div class="text-xs text-gray-500 mt-1">City: ${product.city}</div>` : ""}
			</div>
		`;
		card.addEventListener('click', function() {
			window.location.href = `product-detail.html?id=${product.itemID}`;
		});
		return card;
	});

	// Chờ tất cả cards được tạo rồi mới append vào DOM
	const cards = await Promise.all(renderPromises);
	cards.forEach(card => {
		if (card) {
			productsGrid.appendChild(card);
		}
	});
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
				
				// Gọi API để load products theo subcategory
				if (selectedSubcategory) {
					console.log("Selected subcategory:", selectedSubcategory);
					loadSubcategoryProducts(selectedCategory, selectedSubcategory);
				} else {
					// Nếu bỏ chọn subcategory, load lại products theo category chính
					if (selectedCategory) {
						loadCategoryProducts(selectedCategory);
					}
				}
			});
		});
	}

	// Hàm load subcategory theo category
	function loadSubcategories(categoryName) {
		selectedCategory = categoryName; // Set selected category
		console.log("loadSubcategories called with:", categoryName);
		
		// Lấy token mới để đảm bảo token còn hiệu lực
		const currentToken = localStorage.getItem('token');
		console.log("Using token:", currentToken ? "Token exists" : "No token");
		
		const requestBody = { name: categoryName, detail: "" };
		console.log("Subcategories API request body:", JSON.stringify(requestBody));
		
		return fetch("http://localhost:8080/category/detail", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + currentToken
			},
			body: JSON.stringify(requestBody)
		})
		.then(res => {
			console.log("Subcategories API response status:", res.status);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			return res.json();
		})
		.then(data => {
			console.log("Subcategories API response data:", data);
			subcategories = (data.result || []).map(item => item.result);
			console.log("Processed subcategories:", subcategories);
			
			if (!subcategories.includes(selectedSubcategory)) {
				selectedSubcategory = '';
			}
			renderFilterUI();
		})
		.catch(err => {
			console.error("Error in loadSubcategories:", err);
			if (err.message.includes('401') || err.message.includes('403')) {
				console.error("Token may be invalid or expired");
			}
			subcategories = [];
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

		// Hiển thị category section dựa trên query params và selectedCategory
		let categorySection = '';
		if (categoryQueryParam) {
			// Có category query từ URL - hiển thị category với subcategories
			categorySection = `
				<ul class="category-list mb-6">
					<li class="font-bold text-lg text-black mb-2 category-main" style="list-style:none;">
						${categoryQueryParam}
						<ul class="subcategory-list mt-2 ml-3">${subListHTML}</ul>
					</li>
				</ul>
			`;
		} else if (selectedCategory && subcategories.length > 0) {
			// Có selectedCategory từ dropdown và có subcategories - hiển thị cả dropdown và subcategories
			categorySection = `
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Filter by Category</label>
					<select id="categorySelect" class="border rounded px-2 py-1 w-full">
						<option value="">-- All Categories --</option>
					</select>
				</div>
				<ul class="category-list mb-6">
					<li class="font-bold text-lg text-black mb-2 category-main" style="list-style:none;">
						${selectedCategory}
						<ul class="subcategory-list mt-2 ml-3">${subListHTML}</ul>
					</li>
				</ul>
			`;
		} else if (!categoryQueryParam && !searchQueryParam) {
			// Không có query nào - hiển thị category selector
			categorySection = `
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Select Category</label>
					<select id="categorySelect" class="border rounded px-2 py-1 w-full">
						<option value="">-- Choose category --</option>
					</select>
				</div>
			`;
		} else {
			// Có search query nhưng không có category - hiển thị category selector để user có thể filter
			categorySection = `
				<div class="mb-4">
					<label class="block text-sm font-medium mb-1">Filter by Category</label>
					<select id="categorySelect" class="border rounded px-2 py-1 w-full">
						<option value="">-- All Categories --</option>
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

		// Gắn sự kiện chọn category nếu có category selector
		const categorySelect = document.getElementById("categorySelect");
		if (categorySelect) {
			console.log("Loading categories from API /category/name (no token required)");
			fetch("http://localhost:8080/category/name", {
				method: "GET"
				// Không cần Authorization header
			})
			.then(res => {
				console.log("Category API response status:", res.status);
				return res.json();
			})
			.then(data => {
				console.log("Category API response data:", data);
				
				// Xử lý response với cấu trúc: { "code": 1, "result": [{"result": "Books & Stationery"}, ...] }
				const categories = data.result || [];
				const placeholderText = searchQueryParam ? "-- All Categories --" : "-- Choose category --";
				
				// Xử lý categories - mỗi item có thuộc tính "result"
				let categoryOptions = '';
				if (categories.length > 0) {
					categoryOptions = categories.map(cat => {
						const name = cat.result; // Lấy giá trị từ thuộc tính "result"
						console.log("Category:", cat, "-> Name:", name);
						return `<option value="${name}">${name}</option>`;
					}).join('');
				}
				
				console.log("Final category options:", categoryOptions);
				categorySelect.innerHTML = `<option value="">${placeholderText}</option>` + categoryOptions;
				if (selectedCategory) categorySelect.value = selectedCategory;
			})
			.catch(err => {
				console.error("Error loading categories:", err);
				categorySelect.innerHTML = `<option value="">-- Error loading categories --</option>`;
			});

			categorySelect.addEventListener("change", (e) => {
				selectedCategory = e.target.value;
				console.log("Category selected from dropdown:", selectedCategory);
				
				if (selectedCategory) {
					console.log("Loading subcategories for:", selectedCategory);
					loadSubcategories(selectedCategory).then(() => {
						console.log("Subcategories loaded:", subcategories);
						// Đảm bảo UI được render lại với subcategories
						renderFilterUI();
					}).catch(err => {
						console.error("Error loading subcategories:", err);
					});
				} else {
					subcategories = [];
					selectedSubcategory = '';
					renderFilterUI();
				}
				if (options.onCategoryChange) options.onCategoryChange(selectedCategory);
			});
		}

		// Apply filter button
		const applyFilterBtn = document.getElementById("applyFilterBtn");
		if (applyFilterBtn) {
			applyFilterBtn.onclick = async function() {
				// Lấy giá trị từ các input
				filterState.priceMin = document.getElementById('priceMin').value;
				filterState.priceMax = document.getElementById('priceMax').value;
				filterState.city = document.getElementById('cityFilter').value;
				filterState.rate = document.getElementById('rateFilter').value;

				console.log("Apply filter clicked with:", filterState);

				// Xây dựng query parameters cho API /shopee/search
				const searchParams = new URLSearchParams();
				
				// Thêm search query nếu có
				const urlParams = new URLSearchParams(window.location.search);
				const searchQuery = urlParams.get('search');
				if (searchQuery) {
					searchParams.set('search', searchQuery);
				}

				// Thêm category parameters
				if (selectedSubcategory) {
					searchParams.set('name', selectedCategory || '');
					searchParams.set('detail', selectedSubcategory);
				} else if (selectedCategory) {
					searchParams.set('name', selectedCategory);
					searchParams.set('detail', '');
				}

				// Thêm filter parameters
				if (filterState.priceMin) searchParams.set('minPrice', filterState.priceMin);
				if (filterState.priceMax) searchParams.set('maxPrice', filterState.priceMax);
				if (filterState.rate) searchParams.set('rate', filterState.rate);
				if (filterState.city) searchParams.set('city', filterState.city);

				console.log("Search API URL:", `http://localhost:8080/shopee/search?${searchParams.toString()}`);

				// Gọi API /shopee/search
				try {
					const token = localStorage.getItem('token');
					const response = await fetch(`http://localhost:8080/shopee/search?${searchParams.toString()}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							...(token ? { "Authorization": `Bearer ${token}` } : {})
						}
					});

					console.log("Search API response status:", response.status);
					const data = await response.json();
					console.log("Search API response data:", data);

					// Render kết quả
					const container = document.getElementById("search-results");
					if (container && data.code === 1 && Array.isArray(data.result)) {
						console.log("Found filtered products:", data.result.length);
						await renderProducts(data.result, "search-results", filterState);
					} else {
						console.log("No filtered products found");
						container.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">No products found matching your filters.</div>';
					}
				} catch (error) {
					console.error("Error applying filters:", error);
					const container = document.getElementById("search-results");
					if (container) {
						container.innerHTML = `<div class="col-span-full text-center text-red-500 text-lg">Error applying filters: ${error.message}</div>`;
					}
				}
			};
		}

		// Gắn event cho subcategory list
		const subList = target.querySelector('.subcategory-list');
		if (subList) {
			attachSubcategoryEvents(subList, false);
		}
	}

	// Fetch cities rồi render UI ban đầu
	console.log("search-category.js - Starting to load cities and render filter UI");
	fetch('https://provinces.open-api.vn/api/p/')
		.then(res => {
			console.log("Cities API response status:", res.status);
			return res.json();
		})
		.then(data => {
			cities = Array.isArray(data) ? data : [];
			console.log("Cities loaded:", cities.length);
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
					loadSubcategories(categoryQueryParam).then(() => {
						loadCategoryProducts(categoryQueryParam);
					});
				} else if (selectedCategory) {
					loadSubcategories(selectedCategory);
				}
			}
		})
		.catch(err => {
			console.error("Lỗi load filter:", err);
			// Vẫn render filter UI ngay cả khi không load được cities
			cities = [];
			renderFilterUI();
		});

	// Export renderFilterBar function to global scope
	window.renderFilterBar = renderFilterBar;

	// Hàm load products theo subcategory
	function loadSubcategoryProducts(categoryName, subcategoryName) {
		const container = document.getElementById("search-results");
		if (!container) {
			console.log("Container search-results không tồn tại");
			return;
		}

		const currentToken = localStorage.getItem('token');
		console.log("Fetching products for subcategory:", categoryName, "->", subcategoryName);
		
		// Sử dụng API /shopee/category với format đúng cho subcategory
		const requestBody = {
			"name": categoryName,
			"detail": subcategoryName
		};
		console.log("Subcategory request body:", JSON.stringify(requestBody));
		
		fetch("http://localhost:8080/shopee/category", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + currentToken
			},
			body: JSON.stringify(requestBody)
		})
		.then(res => {
			console.log("API /shopee/category (subcategory) response status:", res.status);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			return res.json();
		})
		.then(async data => {
			console.log("API /shopee/category (subcategory) response data:", data);
			if (data.code === 1 && Array.isArray(data.result)) {
				console.log("Found subcategory products:", data.result.length);
				await renderProducts(data.result, "search-results");
			} else {
				console.log("No subcategory products found or invalid response:", data);
				container.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">Không có sản phẩm trong subcategory này.</div>';
			}
		})
		.catch(err => {
			console.error("Lỗi load subcategory products:", err);
			container.innerHTML = `<div class="col-span-full text-center text-red-500 text-lg">Có lỗi khi tải sản phẩm subcategory: ${err.message}</div>`;
		});
	}

	// Hàm load products theo category
	function loadCategoryProducts(categoryName) {
		const container = document.getElementById("search-results");
		if (!container) {
			console.log("Container search-results không tồn tại");
			return;
		}

		const currentToken = localStorage.getItem('token');
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
				"Authorization": "Bearer " + currentToken
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
		.then(async data => {
			console.log("API /shopee/category response data:", data);
			if (data.code === 1 && Array.isArray(data.result)) {
				console.log("Found products:", data.result.length);
				await renderProducts(data.result, "search-results");
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
