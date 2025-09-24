// Fetch and render product details
document.addEventListener("DOMContentLoaded", () => {
	// Get itemID from URL param
	const urlParams = new URLSearchParams(window.location.search);
	const itemID = urlParams.get("id");
	if (!itemID) return;

	const token = localStorage.getItem("token");

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
	fetch(`http://localhost:8080/shopee/item/${itemID}`, {
		method: "GET",
		headers: token ? { "Authorization": `Bearer ${token}` } : {}
	})
		.then(res => res.json())
		.then(async (data) => {
			if (data.code !== 1 || !data.result || !data.result.item) return;
			const item = data.result.item;
			const shop = data.result.shop;
			const variants = data.result.variantResponses || [];

			// Map product name
			const nameEl = document.getElementById('product-name');
			if (nameEl) nameEl.textContent = item.name;

			// Map price
			const priceEl = document.getElementById('product-price');
			if (priceEl) priceEl.textContent = `$${item.price}`;

			// Map quantity - đặt mặc định là 1
			const qtyInput = document.getElementById('product-quantity');
			if (qtyInput) qtyInput.value = 1;

			// Hiển thị quantity available
			const quantityAvailableEl = document.getElementById('quantity-available');
			let currentQuantity = item.quantity || 0;
			
			function updateQuantityDisplay() {
				if (quantityAvailableEl) {
					quantityAvailableEl.textContent = `${currentQuantity} pieces available`;
				}
			}
			
			// Khởi tạo hiển thị quantity available
			updateQuantityDisplay();

			// Sửa lại layout quantity: chỉ có 1 nút '-' và 1 nút '+'
			if (qtyInput) {
				// Tạo container mới cho quantity nếu chưa có
				let customQtyWrap = document.getElementById('custom-qty-wrap');
				if (!customQtyWrap) {
					customQtyWrap = document.createElement('div');
					customQtyWrap.id = 'custom-qty-wrap';
					customQtyWrap.className = 'flex items-center gap-2 mt-2';
					qtyInput.parentElement.insertBefore(customQtyWrap, qtyInput);
				}

				// Xóa các nút cũ nếu có
				customQtyWrap.innerHTML = '';

				const minusBtn = document.createElement('button');
				minusBtn.type = 'button';
				minusBtn.textContent = '-';
				minusBtn.className = 'qty-minus w-10 h-10 flex items-center justify-center border rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl';

				const plusBtn = document.createElement('button');
				plusBtn.type = 'button';
				plusBtn.textContent = '+';
				plusBtn.className = 'qty-plus w-10 h-10 flex items-center justify-center border rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl';

				qtyInput.className = 'w-16 h-10 text-center border font-semibold text-lg rounded-lg';

				customQtyWrap.appendChild(minusBtn);
				customQtyWrap.appendChild(qtyInput);
				customQtyWrap.appendChild(plusBtn);

				minusBtn.onclick = function() {
					let val = parseInt(qtyInput.value) || 1;
					if (val > 1) qtyInput.value = val - 1;
				};
				plusBtn.onclick = function() {
					let val = parseInt(qtyInput.value) || 1;
					if (val < currentQuantity) qtyInput.value = val + 1;
				};
				qtyInput.oninput = function() {
					let val = parseInt(qtyInput.value) || 1;
					if (val < 1) qtyInput.value = 1;
					else if (val > currentQuantity) qtyInput.value = currentQuantity;
				};
			}
			//

			// Map description
			const descEl = document.getElementById('product-description');
			if (descEl) descEl.textContent = item.description || 'No description.';


			// Map product rating
			const ratingEl = document.getElementById('product-rating');
			const ratingCountEl = document.getElementById('rating-count');
			if (ratingEl) {
				const stars = Math.round(item.rate || 0);
				ratingEl.innerHTML = '';
				for (let i = 0; i < 5; i++) {
					ratingEl.innerHTML += `
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${i < stars ? '#f59e0b' : '#e5e7eb'}" viewBox="0 0 20 20" class="inline-block align-middle">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
						</svg>
					`;
				}
				// Hiển thị số rate
				ratingEl.innerHTML += `<span class=\"ml-2 text-base font-semibold text-gray-800\">${item.rate ? item.rate.toFixed(1) : '0.0'}</span>`;
			}
				// Hiển thị số lượng ratings (ưu tiên từ reviews)
			if (ratingCountEl) {
					const reviewsCount = Array.isArray(data.result.reviewResponseSet) ? data.result.reviewResponseSet.length : 0;
					ratingCountEl.textContent = reviewsCount ? `(${reviewsCount} reviews)` : (item.ratingCount ? `(${item.ratingCount} reviews)` : '');
				}

				// =========================
				// Render Reviews từ API
				// =========================
				(function renderReviewsSection(){
					// Lấy dữ liệu reviews từ response
					const reviews = Array.isArray(data.result.reviewResponseSet) ? data.result.reviewResponseSet : [];
					const avgRatingEl = document.getElementById('average-rating');
					const avgStarsEl = document.getElementById('average-rating-stars');
					const reviewsListEl = document.getElementById('reviews-list');
					const loadMoreBtn = document.getElementById('load-more-reviews');
					const barEls = {
						1: document.getElementById('star-1-bar'),
						2: document.getElementById('star-2-bar'),
						3: document.getElementById('star-3-bar'),
						4: document.getElementById('star-4-bar'),
						5: document.getElementById('star-5-bar')
					};

					// Không có khu vực reviews trong DOM thì bỏ qua
					if (!avgRatingEl || !avgStarsEl || !reviewsListEl || !loadMoreBtn) return;

					// Tính toán thống kê
					const counts = {1:0,2:0,3:0,4:0,5:0};
					reviews.forEach(r => { const s = Math.round(Number(r.rate)||0); if (s>=1 && s<=5) counts[s]++; });
					const total = reviews.length;
					const sum = reviews.reduce((acc, r) => acc + (Number(r.rate)||0), 0);
					const avg = total ? (sum / total) : 0;

					// Hiển thị điểm trung bình
					avgRatingEl.textContent = avg.toFixed(1);
					avgStarsEl.innerHTML = '';
					const fullStars = Math.round(avg);
					const starRow = document.createElement('div');
					starRow.className = 'flex items-center';
					for (let i=0;i<5;i++) {
						starRow.innerHTML += `
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="${i < fullStars ? '#f59e0b' : '#e5e7eb'}" viewBox="0 0 20 20" class="inline-block align-middle">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
							</svg>
						`;
					}
					avgStarsEl.appendChild(starRow);
					const countNote = document.createElement('div');
					countNote.className = 'text-sm text-gray-500';
					countNote.textContent = total ? `${total} reviews` : 'No reviews yet';
					avgStarsEl.appendChild(countNote);

					// Thanh phân bố sao
					for (let s=1; s<=5; s++) {
						const el = barEls[s];
						if (!el) continue;
						const percent = total ? Math.round((counts[s] / total) * 100) : 0;
						el.innerHTML = `<div class="bg-yellow-400 h-2.5 rounded-full" style="width:${percent}%"></div>`;
					}

					// Phân trang danh sách đánh giá (mặc định 5 dòng/lần)
					const PAGE_SIZE = 5;
					let rendered = 0;

					function formatDate(d){
						try {
							if (!d) return '';
							const dt = new Date(d);
							if (isNaN(dt.getTime())) return '';
							return dt.toLocaleDateString();
						} catch { return ''; }
					}

					async function loadReviewImageSrc(idOrUrl) {
						try {
							if (!idOrUrl) return null;
							if (typeof idOrUrl === 'string' && /^https?:\/\//i.test(idOrUrl)) return idOrUrl;
							const res = await fetch(`http://localhost:8080/item/image/${idOrUrl}`);
							if (res.ok) {
								const blob = await res.blob();
								if (blob && blob.size > 0) return URL.createObjectURL(blob);
							}
						} catch {}
						return null;
					}

					async function renderBatch(){
						const slice = reviews.slice(rendered, rendered + PAGE_SIZE);
						for (const r of slice) {
							const row = document.createElement('div');
							row.className = 'p-4 border rounded-lg';
							const stars = Math.round(Number(r.rate)||0);
							let starsHtml = '';
							for (let i=0;i<5;i++) {
								starsHtml += `
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${i < stars ? '#f59e0b' : '#e5e7eb'}" viewBox="0 0 20 20" class="inline-block align-middle mr-0.5">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
									</svg>`;
							}
							row.innerHTML = `
								<div class="flex items-start justify-between">
									<div>
										<div class="font-semibold text-gray-800">${(r.username||'User')}</div>
										<div class="text-sm text-gray-500">${formatDate(r.date)}</div>
									</div>
									<div class="flex items-center">${starsHtml}</div>
								</div>
								<div class="mt-2 text-gray-700">${(r.feedback||'')}</div>
								<div class="mt-3 flex gap-2 flex-wrap" data-review-images></div>
							`;
							reviewsListEl.appendChild(row);
							// Render images
							try {
								const pics = Array.isArray(r.pictureID) ? r.pictureID : [];
								if (pics.length) {
									const container = row.querySelector('[data-review-images]');
									const urls = await Promise.all(pics.map(p => loadReviewImageSrc(p)));
									urls.filter(Boolean).forEach(u => {
										const img = document.createElement('img');
										img.src = u;
										img.className = 'w-16 h-16 object-cover rounded border';
										container.appendChild(img);
									});
								}
							} catch {}
						}

						rendered += slice.length;
						if (rendered >= total) {
							loadMoreBtn.classList.add('hidden');
						} else {
							loadMoreBtn.classList.remove('hidden');
						}
					}

					// Khởi tạo danh sách
					reviewsListEl.innerHTML = '';
						if (total === 0) {
							reviewsListEl.innerHTML = '<div class="text-gray-500">No reviews yet.</div>';
						loadMoreBtn.classList.add('hidden');
					} else {
						renderBatch();
						loadMoreBtn.onclick = function(){ renderBatch(); };
					}
				})();
			// Map product attributes và xử lý variant selection
			const attributesContainer = document.getElementById("product-attributes-container");
			let selectedAttributes = {}; // lưu lựa chọn của user

			// Hàm tìm variant dựa trên attributes được chọn
			function findSelectedVariant() {
				if (!variants || variants.length === 0) return null;
				
				const selectedValues = Object.values(selectedAttributes);
				const attributeNames = Object.keys(selectedAttributes);
				
				// Chỉ tìm variant khi đã chọn đủ tất cả loại attributes có trong sản phẩm
				if (selectedValues.length === 0) return null;
				
				// Lấy danh sách tất cả attribute names từ item
				const allAttributeNames = [];
				if (item.attributeResponses && item.attributeResponses.length > 0) {
					const attrMap = {};
					item.attributeResponses.forEach(function(attr) {
						if (!attrMap[attr.name]) {
							attrMap[attr.name] = true;
							allAttributeNames.push(attr.name);
						}
					});
				}
				
				// Chỉ tìm variant khi đã chọn đủ tất cả loại attributes
				if (attributeNames.length < allAttributeNames.length) {
					return null;
				}
				
				return variants.find(variant => {
					return selectedValues.every(value => 
						variant.attributeValue.includes(value)
					);
				});
			}

			// Hàm kiểm tra xem đã chọn đủ attributes chưa
			function isAllAttributesSelected() {
				if (!item.attributeResponses || item.attributeResponses.length === 0) return true;
				
				const allAttributeNames = [];
				const attrMap = {};
				item.attributeResponses.forEach(function(attr) {
					if (!attrMap[attr.name]) {
						attrMap[attr.name] = true;
						allAttributeNames.push(attr.name);
					}
				});
				
				const selectedAttributeNames = Object.keys(selectedAttributes);
				return selectedAttributeNames.length >= allAttributeNames.length;
			}

			// Hàm cập nhật thông tin sản phẩm khi chọn variant
			function updateProductInfo(variant) {
				const isFullySelected = isAllAttributesSelected();
				
				if (variant && isFullySelected) {
					// Cập nhật giá từ variant khi đã chọn đủ attributes
					if (priceEl) {
						priceEl.textContent = `$${variant.price}`;
					}
					// Cập nhật quantity từ variant
					currentQuantity = variant.quantity;
					updateQuantityDisplay();
					
					// Cập nhật ảnh variant nếu có
					updateVariantImage(variant.variantID);
				} else {
					// Hiển thị thông tin sản phẩm gốc khi chưa chọn đủ attributes hoặc bỏ chọn
					if (priceEl) {
						priceEl.textContent = `$${item.price}`;
					}
					currentQuantity = item.quantity || 0;
					updateQuantityDisplay();
					
					// Reset ảnh về ảnh gốc của sản phẩm
					resetToOriginalImages();
					
					// Reset quantity input về 1 nếu vượt quá số lượng available
					const qtyInput = document.getElementById('product-quantity');
					if (qtyInput && parseInt(qtyInput.value) > currentQuantity) {
						qtyInput.value = 1;
					}
				}
			}

			// Hàm cập nhật ảnh variant
			async function updateVariantImage(variantID) {
				try {
					const token = localStorage.getItem('token');
					const response = await fetch(`http://localhost:8080/variant/${variantID}`, {
						method: 'GET',
						headers: token ? { "Authorization": `Bearer ${token}` } : {}
					});
					
					if (response.ok) {
						// Kiểm tra content-type để xử lý đúng
						const contentType = response.headers.get('content-type');
						
						if (contentType && contentType.includes('application/json')) {
							// API trả về JSON
							const data = await response.json();
							if (data.code === 1 && data.result && data.result.imageID) {
								// Cập nhật ảnh chính từ imageID
								const mainImage = document.getElementById('main-image');
								if (mainImage) {
									try {
										const imgRes = await fetch(`http://localhost:8080/item/image/${data.result.imageID}`);
										if (imgRes.ok) {
											const blob = await imgRes.blob();
											if (blob.size > 0) {
												mainImage.src = URL.createObjectURL(blob);
											}
										}
									} catch (error) {
										console.error('Error loading variant image:', error);
									}
								}
							}
						} else if (contentType && contentType.includes('image/')) {
							// API trả về ảnh trực tiếp
							const blob = await response.blob();
							if (blob.size > 0) {
								const mainImage = document.getElementById('main-image');
								if (mainImage) {
									mainImage.src = URL.createObjectURL(blob);
								}
							}
						} else {
							console.log('Variant API returned unknown format');
						}
					}
				} catch (error) {
					console.error('Error calling variant API:', error);
				}
			}

			// Hàm reset về ảnh gốc
			function resetToOriginalImages() {
				const mainImage = document.getElementById('main-image');
				const thumbnails = document.getElementById('thumbnails');
				if (mainImage && imageUrls && imageUrls.length > 0) {
					mainImage.src = imageUrls[0];
				}
				// Reset thumbnails nếu cần
			}

			if (attributesContainer) {
				attributesContainer.innerHTML = "";
				if (item.attributeResponses && item.attributeResponses.length > 0) {
						// Group attributes by name
						const attrMap = {};
						item.attributeResponses.forEach(function(attr) {
							if (!attrMap[attr.name]) attrMap[attr.name] = [];
							if (!attrMap[attr.name].includes(attr.value)) {
								attrMap[attr.name].push(attr.value);
							}
						});
						
						// Render each attribute group
						Object.keys(attrMap).forEach(function(name) {
							var values = attrMap[name];
							var row = document.createElement("div");
							row.className = "mb-3";
							var label = document.createElement("h3");
							label.className = "text-lg font-semibold text-gray-800 mb-2";
							label.textContent = name;
							row.appendChild(label);
							var optionsDiv = document.createElement("div");
							optionsDiv.className = "flex flex-wrap gap-2";
							values.forEach(function(val) {
								var btn = document.createElement("button");
								btn.textContent = val;
								btn.className = "attribute-option px-3 py-1 border rounded cursor-pointer";
								btn.onclick = function() {
									// Kiểm tra nếu đã được chọn thì bỏ chọn
									if (btn.classList.contains("selected")) {
										btn.classList.remove("selected");
										delete selectedAttributes[name];
									} else {
										// Bỏ chọn tất cả options khác trong cùng group
										Array.prototype.forEach.call(optionsDiv.querySelectorAll(".attribute-option"), function(el) {
											el.classList.remove("selected");
										});
										btn.classList.add("selected");
										selectedAttributes[name] = val;
									}
									
									// Cập nhật thông tin sản phẩm khi chọn/bỏ chọn attribute
									const selectedVariant = findSelectedVariant();
									updateProductInfo(selectedVariant);
								};
								optionsDiv.appendChild(btn);
							});
							row.appendChild(optionsDiv);
							attributesContainer.appendChild(row);
						});
				}
			}


			// Map shop info
			if (shop) {
				const shopNameEl = document.getElementById('shop-name');
				if (shopNameEl) shopNameEl.textContent = shop.shopName;

				// Lấy avatar shop
				const shopAvatarEl = document.getElementById('shop-avatar');
				if (shopAvatarEl && shop.shopID) {
					const token = localStorage.getItem('token');
					fetch('http://localhost:8080/shop/avatar', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
						},
						body: JSON.stringify({ pictureID: shop.shopID })
					})
					.then(res => res.ok ? res.blob() : null)
					.then(blob => {
						if (blob && blob.size > 0) {
							shopAvatarEl.src = URL.createObjectURL(blob);
						} else {
							shopAvatarEl.src = 'https://placehold.co/64x64?text=Shop';
						}
					});
				}

				const shopRatingEl = document.getElementById('shop-rating');
				if (shopRatingEl) {
					const stars = Math.round(shop.rate || 0);
					shopRatingEl.innerHTML = '';
					for (let i = 0; i < 5; i++) {
						shopRatingEl.innerHTML += `
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="${i < stars ? '#f59e0b' : '#e5e7eb'}" viewBox="0 0 20 20" class="inline-block align-middle">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.174 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
							</svg>
						`;
					}
					// Hiển thị số rate
					shopRatingEl.innerHTML += `<span class=\"ml-2 text-base font-semibold text-gray-800\">${shop.rate ? shop.rate.toFixed(1) : '0.0'}</span>`;
					// Hiển thị số lượng ratings
					if (shop.ratingCount) {
						shopRatingEl.innerHTML += `<span class=\"ml-2 text-sm text-gray-500\">(${shop.ratingCount} reviews)</span>`;
					}
					// Hiển thị số followers
					if (shop.followers) {
						shopRatingEl.innerHTML += `<span class=\"ml-2 text-sm text-blue-600\">${shop.followers} followers</span>`;
					}
				}

				// Xử lý click nút "Visit Store"
				const shopLinkBtn = document.getElementById('shop-link');
				if (shopLinkBtn && shop.shopID) {
					shopLinkBtn.onclick = function(e) {
						e.preventDefault();
						window.location.href = `shop-info.html?id=${shop.shopID}`;
					};
				} else if (shopLinkBtn) {
					// Nếu không có shopID, disable nút
					shopLinkBtn.disabled = true;
					shopLinkBtn.textContent = 'Shop not available';
					shopLinkBtn.classList.add('opacity-50', 'cursor-not-allowed');
				}
			}

			// Hiển thị ảnh sản phẩm
			const mainImage = document.getElementById('main-image');
			const thumbnails = document.getElementById('thumbnails');
			let imageIDs = item.imageID || item.images || [];
			if (!Array.isArray(imageIDs)) imageIDs = [imageIDs];

			const imageUrls = await Promise.all(
				imageIDs.map(async (imgId) => {
					try {
						const res = await fetch(`http://localhost:8080/item/image/${imgId}`);
						if (res.ok) {
							const blob = await res.blob();
							if (blob.size > 0) {
								return URL.createObjectURL(blob);
							}
						}
					} catch {}
					return 'https://via.placeholder.com/400x400?text=No+Image';
				})
			);

			if (mainImage && imageUrls.length > 0) {
				mainImage.src = imageUrls[0];
			}
			// Lightbox logic
			let currentLightboxIdx = 0;
			function showLightbox(idx) {
				currentLightboxIdx = idx;
				let lightbox = document.getElementById('product-lightbox');
				if (!lightbox) {
					lightbox = document.createElement('div');
					lightbox.id = 'product-lightbox';
					lightbox.style.position = 'fixed';
					lightbox.style.top = '0';
					lightbox.style.left = '0';
					lightbox.style.width = '100vw';
					lightbox.style.height = '100vh';
					lightbox.style.background = 'rgba(0,0,0,0.8)';
					lightbox.style.zIndex = '9999';
					lightbox.style.display = 'flex';
					lightbox.style.alignItems = 'center';
					lightbox.style.justifyContent = 'center';
					lightbox.innerHTML = `
						<button id="lightbox-close" style="position:absolute;top:32px;right:32px;font-size:2.5rem;color:white;background:none;border:none;cursor:pointer;z-index:10001">&times;</button>
						<button id="lightbox-prev" style="position:absolute;left:32px;top:50%;transform:translateY(-50%);width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,0.5);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10001;transition:background 0.2s;box-shadow:0 2px 8px #0006;">
							<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M26 10L16 20L26 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<img id="lightbox-img" src="" style="max-width:80vw;max-height:80vh;border-radius:1rem;box-shadow:0 4px 32px #0008;" />
						<button id="lightbox-next" style="position:absolute;right:32px;top:50%;transform:translateY(-50%);width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,0.5);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10001;transition:background 0.2s;box-shadow:0 2px 8px #0006;">
							<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14 10L24 20L14 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					`;
					// Keyboard navigation
					document.onkeydown = function(e) {
						if (!document.getElementById('product-lightbox')) return;
						if (e.key === 'ArrowLeft') {
							currentLightboxIdx = (currentLightboxIdx - 1 + imageUrls.length) % imageUrls.length;
							updateLightboxImg();
						} else if (e.key === 'ArrowRight') {
							currentLightboxIdx = (currentLightboxIdx + 1) % imageUrls.length;
							updateLightboxImg();
						} else if (e.key === 'Escape') {
							document.getElementById('product-lightbox').remove();
						}
					};
					// Hover effect for next/prev
					setTimeout(() => {
						const prevBtn = lightbox.querySelector('#lightbox-prev');
						const nextBtn = lightbox.querySelector('#lightbox-next');
						[prevBtn, nextBtn].forEach(btn => {
							btn.onmouseover = function() { btn.style.background = 'rgba(255,255,255,0.2)'; };
							btn.onmouseout = function() { btn.style.background = 'rgba(0,0,0,0.5)'; };
						});
					}, 0);
					document.body.appendChild(lightbox);
					lightbox.querySelector('#lightbox-close').onclick = () => {
						lightbox.remove();
						document.onkeydown = null;
					};
					lightbox.onclick = (e) => {
						if (e.target === lightbox) {
							lightbox.remove();
							document.onkeydown = null;
						}
					};
					lightbox.querySelector('#lightbox-prev').onclick = (e) => {
						e.stopPropagation();
						currentLightboxIdx = (currentLightboxIdx - 1 + imageUrls.length) % imageUrls.length;
						updateLightboxImg();
					};
					lightbox.querySelector('#lightbox-next').onclick = (e) => {
						e.stopPropagation();
						currentLightboxIdx = (currentLightboxIdx + 1) % imageUrls.length;
						updateLightboxImg();
					};
				}
				updateLightboxImg();
			}
			function updateLightboxImg() {
				const lightbox = document.getElementById('product-lightbox');
				if (lightbox) {
					const img = lightbox.querySelector('#lightbox-img');
					img.src = imageUrls[currentLightboxIdx];
				}
			}
			if (mainImage) {
				mainImage.onclick = function() {
					showLightbox(0);
				};
			}
			if (thumbnails) {
				thumbnails.innerHTML = '';
				imageUrls.forEach((url, idx) => {
					const thumb = document.createElement('img');
					thumb.src = url;
					thumb.className = 'w-16 h-16 object-cover rounded cursor-pointer border-2 m-1' + (idx === 0 ? ' border-red-500' : ' border-transparent');
					thumb.onclick = function() {
						mainImage.src = url;
						thumbnails.querySelectorAll('img').forEach((img, i) => {
							img.className = 'w-16 h-16 object-cover rounded cursor-pointer border-2 m-1' + (i === idx ? ' border-red-500' : ' border-transparent');
						});
						showLightbox(idx);
					};
					thumbnails.appendChild(thumb);
				});
			}

			// Re-render feather icons
			if (window.feather) feather.replace();

			// Xử lý chức năng Add to Cart
			const addToCartBtn = document.getElementById('add-to-cart-btn');
			if (addToCartBtn) {
				addToCartBtn.addEventListener('click', async function() {
					try {
						// Kiểm tra token trước khi thêm vào giỏ hàng
						const token = localStorage.getItem('token');
						if (!token) {
							showErrorMessage('Please login to add products to cart!');
							return;
						}
						
						// Lấy thông tin cần thiết
						const qtyInput = document.getElementById('product-quantity');
						const quantity = parseInt(qtyInput.value) || 1;
						
						// Kiểm tra xem sản phẩm có attributes không
						const hasAttributes = item.attributeResponses && item.attributeResponses.length > 0;
						
						// Tìm variant được chọn
						const selectedVariant = findSelectedVariant();
						let variantID = null;
						
						// Nếu sản phẩm có attributes, bắt buộc phải chọn đủ tất cả attributes
						if (hasAttributes) {
							// Kiểm tra xem đã chọn đủ tất cả attributes chưa
							const isFullySelected = isAllAttributesSelected();
							if (!isFullySelected) {
						showErrorMessage('Please select all product variants (color, size) before adding to cart.');
								return;
							}
							
							// Kiểm tra xem có variant tương ứng với lựa chọn không
							if (!selectedVariant) {
								showErrorMessage('Product not found with selected options. Please select again.');
								return;
							}
							variantID = selectedVariant.variantID;
						}
						
						// Chuẩn bị request body
						const requestBody = {
							variantID: variantID ? variantID.toString() : "",
							quantity: quantity.toString()
						};
						
						// Gọi API thêm vào giỏ hàng
						const response = await fetch(`http://localhost:8080/cart/${itemID}`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`
							},
							body: JSON.stringify(requestBody)
						});
						
						if (response.ok) {
							// Hiển thị thông báo thành công
						showSuccessMessage('Product added to cart successfully.');
							
							// Reload cart để hiển thị item mới
							if (typeof loadCart === 'function') {
								loadCart();
							}
							
							// Có thể thêm animation hoặc feedback khác
							addToCartBtn.innerHTML = `
								<i data-feather="check" class="w-5 h-5 mr-2"></i>
								Added!
							`;
							addToCartBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
							addToCartBtn.classList.add('bg-green-600', 'hover:bg-green-700');
							
							// Reset về trạng thái ban đầu sau 2 giây
							setTimeout(() => {
								addToCartBtn.innerHTML = `
									<i data-feather="shopping-cart" class="w-5 h-5 mr-2"></i>
									Add to Cart
								`;
								addToCartBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
								addToCartBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
								
								// Re-render feather icons
								if (window.feather) feather.replace();
							}, 2000);
							
						} else {
							// Hiển thị thông báo lỗi
							const errorData = await response.json();
						showErrorMessage('Error adding to cart: ' + (errorData.message || 'Unknown error'));
						}
						
					} catch (error) {
						console.error('Error adding to cart:', error);
						showErrorMessage('Connection error. Please try again.');
					}
				});
			}
			
			// Hàm hiển thị thông báo thành công
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
				
				// Tự động ẩn sau 3 giây
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
			
			// Hàm hiển thị thông báo lỗi
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
				
				// Tự động ẩn sau 5 giây
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

			// Handle Buy Now -> show inline checkout modal with selected item
			const buyNowBtn = document.getElementById('buy-now-btn');
			if (buyNowBtn) {
				buyNowBtn.addEventListener('click', () => {
					// Require selection if attributes exist
					const hasAttributes = item.attributeResponses && item.attributeResponses.length > 0;
					const selectedVariant = findSelectedVariant();
					if (hasAttributes && !isAllAttributesSelected()) {
						showErrorMessage('Please select all product variants before buying.');
						return;
					}
					if (hasAttributes && !selectedVariant) {
						showErrorMessage('Selected variant not available.');
						return;
					}

					const qtyInput = document.getElementById('product-quantity');
					const quantity = parseInt(qtyInput && qtyInput.value ? qtyInput.value : '1') || 1;

					const priceToUse = selectedVariant ? selectedVariant.price : item.price;
					openPDCheckoutModal({
						itemID,
						itemName: item.name,
						price: priceToUse,
						quantity,
						attributes: Object.keys(selectedAttributes).map(name => ({ name, value: selectedAttributes[name] })),
						shopID: shop && shop.shopID,
						shopName: shop && shop.shopName
					});
				});
			}

			// Quick checkout modal logic (reuse patterns from checkout.js)
			async function openPDCheckoutModal(selectedItem) {
				const modal = document.getElementById('pdCheckoutModal');
				const closeBtn = document.getElementById('pdCloseCheckout');
				const itemBox = document.getElementById('pdCheckoutItem');
				const subtotalEl = document.getElementById('pdSubtotal');
				const deliveryFeeEl = document.getElementById('pdDeliveryFee');
				const grandEl = document.getElementById('pdGrandTotal');
				const selectedAddrEl = document.getElementById('pdSelectedAddress');
				const placeBtn = document.getElementById('pdPlaceOrder');
				let selectedAddressId = null;

				// Render item line
				let imageUrl = 'https://via.placeholder.com/64';
				try {
					const imgRes = await fetch(`http://localhost:8080/item/coverImage/${selectedItem.itemID}`);
					if (imgRes.ok) {
						const blob = await imgRes.blob();
						if (blob && blob.size > 0) imageUrl = URL.createObjectURL(blob);
					}
				} catch {}

				itemBox.innerHTML = `
					<div class="py-3 px-3 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<img src="${imageUrl}" class="w-16 h-16 rounded object-cover border" />
							<div>
								<div class="font-medium text-gray-800">${selectedItem.itemName}</div>
								${selectedItem.attributes && selectedItem.attributes.length ? `<div class=\"text-xs text-gray-500\">${selectedItem.attributes.map(a=>`${a.name}: ${a.value}`).join(', ')}</div>` : ''}
								<div class="text-xs text-gray-500">Quantity: ${selectedItem.quantity}</div>
							</div>
						</div>
						<div class="font-semibold text-indigo-600">$${(selectedItem.price * selectedItem.quantity).toFixed(2)}</div>
					</div>
				`;

				const deliveryFee = 0; // both methods free
				subtotalEl.textContent = `$${(selectedItem.price * selectedItem.quantity).toFixed(2)}`;
				deliveryFeeEl.textContent = `$${deliveryFee.toFixed(2)}`;
				grandEl.textContent = `$${(selectedItem.price * selectedItem.quantity + deliveryFee).toFixed(2)}`;

				// Load addresses and set default first
				selectedAddressId = await loadPDAddresses(selectedAddrEl);

				modal.classList.remove('hidden');
				if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
				window.addEventListener('keydown', escClose);
				function escClose(e){ if(e.key==='Escape'){ modal.classList.add('hidden'); window.removeEventListener('keydown', escClose);} }

				// Open address manager
				const openAddrBtn = document.getElementById('pdManageAddressBtn');
				if (openAddrBtn) openAddrBtn.onclick = () => openPDAddressManager(selectedAddrEl);

				// Place order
				if (placeBtn) placeBtn.onclick = async () => {
					try {
						const token = localStorage.getItem('token');
						if (!token) { window.location.href = 'login.html'; return; }
						if (!selectedAddressId) { showErrorMessage('Please select a shipping address.'); return; }

						const radio = document.querySelector('input[name="pdDelivery"]:checked');
						const deliveryMap = { economy: 'Giao hàng tiết kiệm', fast: 'Giao hàng nhanh' };
						const delivery = deliveryMap[radio ? radio.value : 'economy'] || 'Giao hàng tiết kiệm';

						// Determine variantID again based on current selections
						const hasAttributes = (item.attributeResponses && item.attributeResponses.length > 0);
						const selVariant = hasAttributes ? findSelectedVariant() : null;
						const qtyInput = document.getElementById('product-quantity');
						const quantity = parseInt(qtyInput && qtyInput.value ? qtyInput.value : '1') || 1;

						const body = {
							itemID: String(selectedItem.itemID),
							variantID: selVariant && selVariant.variantID ? String(selVariant.variantID) : "",
							quantity: String(quantity),
							delivery: delivery,
							addressID: String(selectedAddressId)
						};

						placeBtn.disabled = true;
						const resp = await fetch('http://localhost:8080/users/order', {
							method: 'POST',
							headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
							body: JSON.stringify(body)
						});
						if (resp.ok) {
							modal.classList.add('hidden');
							showSuccessMessage('Order created successfully.');
						} else {
							showErrorMessage('Failed to create order.');
						}
					} catch (e) {
						showErrorMessage('Connection error.');
					} finally {
						placeBtn.disabled = false;
					}
				};
			}

			async function loadPDAddresses(targetEl){
				const token = localStorage.getItem('token');
				let addresses = [];
				try{
					const res = await fetch('http://localhost:8080/users/addresses', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }});
					if(res.ok){ const data = await res.json(); if(data.code===1) addresses = (data.result||[]).filter(a=>a.active===true); }
				}catch{}
				addresses.sort((a,b)=> (b.defaultAddress?1:0)-(a.defaultAddress?1:0));
				const a = addresses[0];
				if (!a) { targetEl.innerHTML = '<div class="text-sm text-gray-500">No address. Please add.</div>'; return null; }
				targetEl.innerHTML = `<div class="p-3 border rounded bg-gray-50"><div class="font-medium text-gray-800">${a.phone||''}</div><div class="text-sm text-gray-700">${a.detail||''}, ${a.ward||''}, ${a.district||''}, ${a.city||''}</div></div>`;
				return a.addressID;
			}

			// Address manager modal (select/add)
			async function openPDAddressManager(summaryEl){
				const modal = document.getElementById('pdAddressManager');
				const closeBtn = document.getElementById('pdCloseAddrManager');
				const cancelBtn = document.getElementById('pdCancelAddrMgr');
				const useBtn = document.getElementById('pdUseSelectedAddr');
				const selectTab = document.getElementById('pdSelectTab');
				const addTab = document.getElementById('pdAddTab');
				const selectPanel = document.getElementById('pdSelectPanel');
				const addPanel = document.getElementById('pdAddPanel');
				const listEl = document.getElementById('pdAddrList');
				const addForm = document.getElementById('pdAddAddrForm');

				const token = localStorage.getItem('token');
				let addresses = [];
				try{
					const res = await fetch('http://localhost:8080/users/addresses', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }});
					if(res.ok){ const data = await res.json(); if(data.code===1) addresses = (data.result||[]).filter(a=>a.active===true); }
				}catch{}
				addresses.sort((a,b)=> (b.defaultAddress?1:0)-(a.defaultAddress?1:0));

				function render(){
					listEl.innerHTML = addresses.map((a,idx)=>`
						<label class="flex items-start gap-3 p-3 border rounded border-gray-200">
							<input type="radio" name="pdShipAddr" value="${a.addressID}" ${idx===0?'checked':''} class="mt-1 text-indigo-600">
							<div>
								<div class="font-medium text-gray-800">${a.phone||''}</div>
								<div class="text-sm text-gray-700">${a.detail||''}, ${a.ward||''}, ${a.district||''}, ${a.city||''}</div>
								${a.defaultAddress?'<span class="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Default</span>':''}
							</div>
						</label>
					`).join('');
				}
				render();

				selectTab.onclick = () => { selectPanel.classList.remove('hidden'); addPanel.classList.add('hidden'); };
				addTab.onclick = () => { addPanel.classList.remove('hidden'); selectPanel.classList.add('hidden'); };

				if (addForm) {
					addForm.onsubmit = async (e) => {
						e.preventDefault();
						const body = { phone: pdAddrPhone.value, city: pdAddrCity.value, district: pdAddrDistrict.value, ward: pdAddrWard.value, detail: pdAddrDetail.value };
						try{
							const resp = await fetch('http://localhost:8080/users/addresses', { method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
							if (resp.ok) {
								addresses.unshift({ ...body, addressID: Date.now(), defaultAddress:false, active:true });
								render(); selectTab.click();
							}
						}catch{}
					};
				}

				modal.classList.remove('hidden');
				closeBtn.onclick = () => modal.classList.add('hidden');
				cancelBtn.onclick = () => modal.classList.add('hidden');
				useBtn.onclick = () => {
					const sel = document.querySelector('input[name="pdShipAddr"]:checked');
					if (!sel) { modal.classList.add('hidden'); return; }
					const id = parseInt(sel.value);
					const addr = addresses.find(a=>a.addressID===id);
					summaryEl.innerHTML = `<div class=\"p-3 border rounded bg-gray-50\"><div class=\"font-medium text-gray-800\">${addr.phone||''}</div><div class=\"text-sm text-gray-700\">${addr.detail||''}, ${addr.ward||''}, ${addr.district||''}, ${addr.city||''}</div></div>`;
					// Update selected address id for order
					const checkoutModal = document.getElementById('pdCheckoutModal');
					if (checkoutModal) {
						// store on element dataset to keep it accessible
						checkoutModal.dataset.selectedAddressId = String(id);
					}
					modal.classList.add('hidden');
				};
			}
		});
});

// Header avatar/profile logic
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
