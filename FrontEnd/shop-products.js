document.addEventListener("DOMContentLoaded", async function () {
	// CATEGORY LOGIC: dynamic select for category name & detail
	const categoryNameSelect = document.getElementById("categoryNameSelect");
	const categoryDetailSelect = document.getElementById("categoryDetailSelect");

	async function fetchCategories() {
		if (!categoryNameSelect || categoryNameSelect.dataset.loaded === "true") return;
		const token = localStorage.getItem("token");
		if (!token) return;
		try {
			const response = await fetch("http://localhost:8080/category/name", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			});
			const data = await response.json();
			if (response.ok && data.code === 1 && Array.isArray(data.result)) {
				categoryNameSelect.innerHTML = '';
				const placeholder = document.createElement("option");
				placeholder.value = '';
				placeholder.textContent = 'Select category';
				placeholder.disabled = true;
				placeholder.selected = true;
				categoryNameSelect.appendChild(placeholder);
				data.result.forEach(item => {
					const option = document.createElement("option");
					option.value = item.name || item.result;
					option.textContent = item.name || item.result;
					categoryNameSelect.appendChild(option);
				});
				categoryNameSelect.dataset.loaded = "true";
			}
		} catch (err) {}
	}

	async function fetchCategoryDetails() {
		if (!categoryDetailSelect || categoryDetailSelect.dataset.loaded === "true") return;
		const selectedName = categoryNameSelect.value;
		if (!selectedName) return;
		const token = localStorage.getItem("token");
		if (!token) return;
		try {
			const response = await fetch("http://localhost:8080/category/detail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ name: selectedName, detail: "" })
			});
			const data = await response.json();
			if (response.ok && data.code === 1 && Array.isArray(data.result)) {
                categoryDetailSelect.innerHTML = '';
                const placeholder = document.createElement("option");
                placeholder.value = '';
                placeholder.textContent = 'Select category detail';
                placeholder.disabled = true;
                placeholder.selected = true;
                categoryDetailSelect.appendChild(placeholder);
                data.result.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.detail || item.result;
                    option.textContent = item.detail || item.result;
                    categoryDetailSelect.appendChild(option);
                });
                categoryDetailSelect.dataset.loaded = "true";
			}
		} catch (err) {}
	}

	if (categoryNameSelect) {
		await fetchCategories();
		categoryNameSelect.addEventListener("click", function() {
			// Remove 'disabled' from placeholder so dropdown can be opened
			if (categoryNameSelect.options.length > 0) {
				categoryNameSelect.options[0].disabled = true;
			}
			fetchCategories();
		});
		categoryNameSelect.addEventListener("change", function() {
			// Disable the placeholder after a category is selected
			if (categoryNameSelect.options.length > 0) {
				categoryNameSelect.options[0].disabled = true;
			}
			if (categoryDetailSelect) {
				categoryDetailSelect.innerHTML = '<option value="">Select category detail</option>';
				categoryDetailSelect.dataset.loaded = "false";
				fetchCategoryDetails();
			}
		});
	}
	if (categoryDetailSelect) {
		categoryDetailSelect.addEventListener("click", fetchCategoryDetails);
	}
	const token = localStorage.getItem("token");
	if (!token) return;
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
				// Luôn fetch avatar từ /shop/avatar kèm token
				fetch("http://localhost:8080/shop/avatar", {
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(res => {
                    if (!res.ok) throw new Error("Failed to fetch image");
					return res.blob();
				})
				.then(blob => {
					avatarImg.src = URL.createObjectURL(blob);
				})
				.catch(() => {
					avatarImg.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
				});
			}
			// Tên shop
			const nameDiv = document.getElementById('shopNameSidebar');
			if (nameDiv) {
				nameDiv.textContent = shop.shopName || "Shop Name";
			}
			// Loại shop
			const typeDiv = document.getElementById('shopTypeSidebar');
			if (typeDiv) {
				typeDiv.textContent = shop.type || "";
			}
		}
	} catch (err) {}
});

// Điều hướng sang shop-dashboard.html khi click vào Dashboard trong sidebar
document.addEventListener("DOMContentLoaded", async function () {
	// Sidebar navigation
	var dashboardMenu = Array.from(document.querySelectorAll('.sidebar .flex.items-center span')).find(span => span.textContent.trim() === 'Dashboard');
	if (dashboardMenu) {
		dashboardMenu.parentElement.addEventListener('click', function () {
			window.location.href = 'shop-dashboard.html';
		});
	}

	var ordersMenu = Array.from(document.querySelectorAll('.sidebar .flex.items-center span')).find(span => span.textContent.trim() === 'Orders');
	if (ordersMenu) {
		ordersMenu.parentElement.addEventListener('click', function () {
			window.location.href = 'shop-orders.html';
		});
	}

	// Multi-image upload instruction and preview
	var picturesInput = document.getElementById("itemPictures");
	if (picturesInput) {
		var instructionDiv = document.getElementById("itemPicturesInstruction");
		if (!instructionDiv) {
			instructionDiv = document.createElement("div");
			instructionDiv.id = "itemPicturesInstruction";
			instructionDiv.className = "mt-1 text-xs text-gray-500";
			instructionDiv.innerText = "Tip: To upload multiple images, hold Ctrl (Windows) or Command (Mac) while selecting files.";
			picturesInput.parentNode.insertBefore(instructionDiv, picturesInput.nextSibling);
		}
		var fileListDiv = document.getElementById("itemPicturesFileList");
		if (!fileListDiv) {
			fileListDiv = document.createElement("div");
			fileListDiv.id = "itemPicturesFileList";
			fileListDiv.className = "mt-2 flex gap-2 flex-wrap";
			picturesInput.parentNode.appendChild(fileListDiv);
		}
		picturesInput.addEventListener("change", function() {
			var html = "";
			if (picturesInput.files.length > 0) {
				for (let i = 0; i < picturesInput.files.length; i++) {
					const file = picturesInput.files[i];
					html += `<div class='border rounded p-1'><img src='${URL.createObjectURL(file)}' style='width:80px;height:80px;object-fit:cover;border-radius:8px;'/></div>`;
				}
			} else {
				html = "";
			}
			fileListDiv.innerHTML = html;
		});
	}

	// Cover image preview
	const coverInput = document.getElementById("itemCover");
	if (coverInput) {
		let coverPreviewDiv = document.getElementById("itemCoverPreview");
		if (!coverPreviewDiv) {
			coverPreviewDiv = document.createElement("div");
			coverPreviewDiv.id = "itemCoverPreview";
			coverPreviewDiv.className = "mt-2";
			coverInput.parentNode.appendChild(coverPreviewDiv);
		}
		coverInput.addEventListener("change", function() {
			let html = "";
			if (coverInput.files.length > 0) {
				const file = coverInput.files[0];
				html = `<img src='${URL.createObjectURL(file)}' style='width:120px;height:120px;object-fit:cover;border-radius:12px;'/>`;
			} else {
				html = "";
			}
			coverPreviewDiv.innerHTML = html;
		});
	}
	feather.replace();

	// UUID generator
	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	// Add itemDescription textarea if missing
	let descriptionInput = document.getElementById("itemDescription");
	if (!descriptionInput) {
		const nameInput = document.getElementById("itemName");
		if (nameInput) {
			descriptionInput = document.createElement("textarea");
			descriptionInput.id = "itemDescription";
			descriptionInput.className = "block w-full px-4 py-2 border rounded-lg mt-2";
			descriptionInput.placeholder = "Enter product description";
			descriptionInput.maxLength = 2000;
			descriptionInput.rows = 3;
			nameInput.parentNode.insertBefore(descriptionInput, nameInput.nextSibling);
		}
	}

	// Handle create item form submit
	const createItemForm = document.getElementById("createItemForm");
	if (createItemForm) {
		createItemForm.addEventListener("submit", async function(e) {
			e.preventDefault();
			const msgDiv = document.getElementById("createItemMsg");
			msgDiv.textContent = "";
			// Validate required fields
			const name = document.getElementById("itemName").value.trim();
			const price = Number(document.getElementById("itemPrice").value);
			const quantity = Number(document.getElementById("itemQuantity").value);
			const description = document.getElementById("itemDescription") ? document.getElementById("itemDescription").value.trim() : "";
			const picturesInput = document.getElementById("itemPictures");
			const coverInput = document.getElementById("itemCover");
			let error = "";
			if (!name) error += "Product name is required.\n";
			if (!price || price <= 0) error += "Product price must be greater than 0.\n";
			if (!quantity || quantity < 0) error += "Product quantity is required.\n";
			if (!picturesInput || picturesInput.files.length === 0) error += "At least one product image is required.\n";
			if (!coverInput || coverInput.files.length === 0) error += "Cover image is required.\n";
			const categoryName = document.getElementById("categoryNameSelect") ? document.getElementById("categoryNameSelect").value.trim() : "";
			const categoryDetailSelect = document.getElementById("categoryDetailSelect");
			const categoryDetailValue = categoryDetailSelect ? categoryDetailSelect.value.trim() : "";
			if (!categoryName) error += "Category is required.\n";
			if (categoryDetailSelect && !categoryDetailValue) error += "Category detail is required.\n";
			// Validate attribute groups
			const attributeGroups = document.querySelectorAll('#attributeList > div');
			for (let group of attributeGroups) {
				const nameInput = group.querySelector('input[type="text"]');
				if (!nameInput.value.trim()) error += "Attribute group name cannot be empty.\n";
				const valueInputs = group.querySelectorAll('.attribute-values input[type="text"]');
				let emptyValue = false;
				valueInputs.forEach(input => { if (!input.value.trim()) emptyValue = true; });
				if (emptyValue) error += "Attribute value cannot be empty.\n";
			}
			// Validate variants table
			const variantTable = document.getElementById('variantTable');
			if (variantTable) {
				const rows = variantTable.querySelectorAll('tbody tr');
				for (let row of rows) {
					const priceInput = row.querySelector('input[placeholder="Enter price"]');
					const stockInput = row.querySelector('input[placeholder="0"]');
					let priceValue = priceInput && priceInput.value ? priceInput.value.trim() : '';
					let priceNum = priceValue !== '' && !isNaN(priceValue) ? Number(priceValue) : null;
					if (priceNum === null || priceNum <= 0) error += "Variant price must be greater than 0.\n";
					let stockValue = stockInput && stockInput.value ? stockInput.value.trim() : '';
					let stockNum = stockValue !== '' && !isNaN(stockValue) ? Number(stockValue) : null;
					if (stockNum === null || stockNum < 0) error += "Variant stock is required.\n";
				}
			}
			if (error) {
				msgDiv.textContent = error.trim();
				msgDiv.className = "mt-2 text-sm text-red-600 whitespace-pre-line";
				return;
			}

			// --- UUID mapping for images ---
			// 1. Cover image
			let coverFile = coverInput && coverInput.files.length > 0 ? coverInput.files[0] : null;
			let coverUUID = coverFile ? uuidv4() : null;
			// 2. Product images
			let productFiles = Array.from(picturesInput.files);
			let productUUIDs = productFiles.map(() => uuidv4());
			// 3. Variant images
			let variantTableElem = document.getElementById('variantTable');
			let variants = [];
			let variantImageFiles = [];
			let variantImageUUIDs = [];
			if (variantTableElem) {
				const rows = variantTableElem.querySelectorAll('tbody tr');
				rows.forEach((row, idx) => {
					let variant = {};
					// Attribute mapping: [{name, value}]
					const valueCells = row.querySelectorAll('td');
					let attributes = [];
					const attributeGroups = document.querySelectorAll('#attributeList > div');
					let groupNames = [];
					attributeGroups.forEach(group => {
						const nameInput = group.querySelector('input[type="text"]');
						groupNames.push(nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Attribute');
					});
					let valueIdx = 0;
					for (let i = 0; i < valueCells.length; i++) {
						if (valueCells[i].querySelector('input[type="number"]')) break;
						attributes.push({
							name: groupNames[valueIdx] || `Attribute${valueIdx+1}`,
							value: valueCells[i].textContent.trim()
						});
						valueIdx++;
					}
					variant.attribute = attributes;
					// Quantity
					const stockInput = row.querySelector('input[placeholder="0"]');
					variant.quantity = stockInput && stockInput.value ? Number(stockInput.value) : 0;
					// Price
					const priceInput = row.querySelector('input[placeholder="Enter price"]');
					variant.price = priceInput && priceInput.value ? Number(priceInput.value) : 0;
					// SKU
					const skuInput = row.querySelector('input[placeholder="Enter SKU"]');
					variant.SKU = skuInput && skuInput.value ? skuInput.value.trim() : '';
					// Variant image
					const imageInput = row.querySelector('input[type="file"]');
					if (imageInput && imageInput.files.length > 0) {
						const file = imageInput.files[0];
						let uuid = uuidv4();
						variant.image = { pictureID: uuid };
						variantImageFiles.push(file);
						variantImageUUIDs.push(uuid);
					}
					variants.push(variant);
				});
			}

			// Build pictures array for payload
			let pictures = [];
			// Cover image
			if (coverUUID) pictures.push({ pictureID: coverUUID, type: "cover" });
			// Product images
			productUUIDs.forEach(uuid => pictures.push({ pictureID: uuid, type: "product" }));
			// Do NOT include variant image UUIDs in pictures array for create item

			const categoryDetail = document.getElementById("categoryDetailSelect") ? document.getElementById("categoryDetailSelect").value.trim() : "";
			const payload = {
				name,
				price,
				description,
				pictures,
				quantity,
				category: {
					name: categoryName,
					detail: categoryDetail
				},
				variants: Array.isArray(variants) ? variants : []
			};
			const token = localStorage.getItem("token");
			if (!token) {
				msgDiv.textContent = "You are not logged in!";
				msgDiv.className = "mt-2 text-sm text-red-600";
				return;
			}
			try {
				const response = await fetch("http://localhost:8080/shopee/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					},
					body: JSON.stringify(payload)
				});
				const data = await response.json();
				if (response.ok && data.code === 1) {
					// UPLOAD IMAGES AFTER PRODUCT CREATED
					// Prepare files and codes for upload
					let filesToUpload = [];
					let codesToUpload = [];
					// Cover image
					if (coverFile && coverUUID) {
						filesToUpload.push(coverFile);
						codesToUpload.push(coverUUID);
					}
					// Product images
					productFiles.forEach((file, idx) => {
						filesToUpload.push(file);
						codesToUpload.push(productUUIDs[idx]);
					});
					// Variant images
					variantImageFiles.forEach((file, idx) => {
						filesToUpload.push(file);
						codesToUpload.push(variantImageUUIDs[idx]);
					});
					if (filesToUpload.length > 0) {
						const formData = new FormData();
						filesToUpload.forEach((file, idx) => {
							formData.append('images', file);
							formData.append('codes', codesToUpload[idx]);
						});
						try {
							const imgRes = await fetch("http://localhost:8080/item/saveImages", {
								method: "POST",
								headers: {
									"Authorization": `Bearer ${token}`
								},
								body: formData
							});
							const imgData = await imgRes.json();
							if (imgRes.ok && imgData.code === 1) {
								// Images uploaded successfully
							}
						} catch (err) {}
					}
					msgDiv.textContent = "Product created successfully!";
					msgDiv.className = "mt-2 text-sm text-green-600";
					setTimeout(function() {
						window.location.reload();
					}, 1200);
				} else {
					msgDiv.textContent = data.message || "Failed to create product!";
					msgDiv.className = "mt-2 text-sm text-red-600";
				}
			} catch (err) {
				msgDiv.textContent = "Cannot connect to server!";
				msgDiv.className = "mt-2 text-sm text-red-600";
			}
		});
	}

	// ATTRIBUTE LOGIC & VARIANT GENERATION
	function generateVariants() {
		const attributeGroups = document.querySelectorAll('#attributeList > div');
		let valuesArr = [];
		attributeGroups.forEach(group => {
			const values = Array.from(group.querySelectorAll('.attribute-values input[type="text"]'))
				.map(input => input.value.trim()).filter(v => v);
			if (values.length) valuesArr.push(values);
		});
		let variants = [];
		if (valuesArr.length === 1) {
			variants = valuesArr[0].map(v => [v]);
		} else if (valuesArr.length === 2) {
			for (let v1 of valuesArr[0]) {
				for (let v2 of valuesArr[1]) {
					variants.push([v1, v2]);
				}
			}
		}
		renderVariantTable(variants, valuesArr);
	}

	function renderVariantTable(variants, valuesArr) {
		const variantTable = document.getElementById('variantTable');
		if (!variantTable) return;
		if (!variants.length && valuesArr.length > 0 && valuesArr[0].length > 0) {
			let html = '<table class="min-w-full border text-sm bg-gray-50"><thead><tr>';
			html += `<th class="border px-2 py-1">${document.querySelector('#attributeList > div label').textContent || 'Attribute'}</th>`;
			html += '<th class="border px-2 py-1">Price *</th>';
			html += '<th class="border px-2 py-1">Stock *</th>';
			html += '<th class="border px-2 py-1">SKU</th>';
			html += '</tr></thead><tbody>';
			for (let v of valuesArr[0]) {
				html += '<tr>';
				html += `<td class="border px-2 py-1">${v}</td>`;
				html += `<td class="border px-2 py-1"><input type="number" class="border rounded px-2 py-1 w-24" placeholder="Enter price" required></td>`;
				html += `<td class="border px-2 py-1"><input type="number" class="border rounded px-2 py-1 w-16" placeholder="0" required></td>`;
				html += `<td class="border px-2 py-1"><input type="text" class="border rounded px-2 py-1 w-32" placeholder="Enter SKU"></td>`;
				html += '</tr>';
			}
			html += '</tbody></table>';
			variantTable.innerHTML = html;
			return;
		}
		if (!variants.length) {
			variantTable.innerHTML = '<div class="text-gray-400">No variants to display.</div>';
			return;
		}
		let html = '<div style="overflow-x:auto; max-width:100%;"><table class="min-w-full border text-sm bg-gray-50" style="width:100%; table-layout:fixed;"><thead><tr>';
		const attributeGroups = document.querySelectorAll('#attributeList > div');
		let groupNames = [];
		attributeGroups.forEach(group => {
			const nameInput = group.querySelector('input[type="text"]');
			groupNames.push(nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Attribute');
		});
		if (valuesArr.length === 1) {
			html += `<th class="border px-2 py-1" style="width:120px;">${groupNames[0] || 'Attribute'}</th>`;
		} else if (valuesArr.length === 2) {
			html += `<th class="border px-2 py-1" style="width:120px;">${groupNames[0] || 'Attribute 1'}</th>`;
			html += `<th class="border px-2 py-1" style="width:120px;">${groupNames[1] || 'Attribute 2'}</th>`;
		}
		html += '<th class="border px-2 py-1" style="width:140px;">Price *</th>';
		html += '<th class="border px-2 py-1" style="width:100px;">Stock *</th>';
		html += '<th class="border px-2 py-1" style="width:140px;">SKU</th>';
		html += '<th class="border px-2 py-1" style="width:170px;">Variant Image</th>';
		html += '</tr></thead><tbody>';
		for (let i = 0; i < variants.length; i++) {
			let variant = variants[i];
			html += '<tr>';
			for (let v of variant) {
				html += `<td class="border px-2 py-1" style="word-break:break-word;">${v}</td>`;
			}
			html += `<td class="border px-2 py-1"><input type="number" class="border rounded px-2 py-1" style="width:100%; min-width:80px;" placeholder="Enter price" required></td>`;
			html += `<td class="border px-2 py-1"><input type="number" class="border rounded px-2 py-1" style="width:100%; min-width:60px;" placeholder="0" required></td>`;
			html += `<td class="border px-2 py-1"><input type="text" class="border rounded px-2 py-1" style="width:100%; min-width:100px;" placeholder="Enter SKU"></td>`;
			html += `<td class="border px-2 py-1"><input type="file" accept="image/*" class="variant-image-input" data-variant-idx="${i}" style="width:100%;"></td>`;
			html += '</tr>';
		}
		html += '</tbody></table></div>';
		variantTable.innerHTML = html;
	}

	// Re-generate variants whenever attribute values change
	document.getElementById('attributeList').addEventListener('input', generateVariants);
	document.getElementById('addAttributeBtn').addEventListener('click', function() {
		setTimeout(generateVariants, 100);
	});

	// Attribute group creation logic
	const attributeList = document.getElementById("attributeList");
	const addAttributeBtn = document.getElementById("addAttributeBtn");
	let attributeGroupCount = 0;
	function createAttributeGroup() {
		const MAX_ATTRIBUTE_GROUP = 2;
		if (attributeGroupCount >= MAX_ATTRIBUTE_GROUP) return;
		attributeGroupCount++;
		const groupDiv = document.createElement("div");
		groupDiv.className = "border rounded-lg p-4 mb-4 bg-gray-50 relative";
		const removeGroupBtn = document.createElement("button");
		removeGroupBtn.type = "button";
		removeGroupBtn.className = "absolute top-2 right-2 text-gray-400 hover:text-red-500";
		removeGroupBtn.title = "Delete group";
		removeGroupBtn.innerHTML = '<i data-feather="x"></i>';
		removeGroupBtn.onclick = function () {
			groupDiv.remove();
			attributeGroupCount--;
			if (attributeGroupCount < MAX_ATTRIBUTE_GROUP) addAttributeBtn.style.display = "";
			generateVariants();
		};
		groupDiv.appendChild(removeGroupBtn);
		const label = document.createElement("label");
		label.className = "block text-sm font-semibold text-gray-700 mb-2";
		label.textContent = "Attribute Group Name";
		groupDiv.appendChild(label);
		const nameDiv = document.createElement("div");
		nameDiv.className = "mb-2";
		const nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.className = "block w-full px-4 py-2 border rounded-lg";
		nameInput.maxLength = 14;
		nameInput.placeholder = "Enter attribute name (eg: Color)";
		nameInput.required = true;
		nameDiv.appendChild(nameInput);
		const nameError = document.createElement("div");
		nameError.className = "input-error mt-1 text-xs text-red-600";
		nameError.style.display = "none";
		nameDiv.appendChild(nameError);
		groupDiv.appendChild(nameDiv);
		const valuesDiv = document.createElement("div");
		valuesDiv.className = "flex flex-col gap-2 mb-2 attribute-values";
		function createValueInput() {
			const valueRow = document.createElement("div");
			valueRow.className = "flex flex-col items-start gap-1";
			const valueInputRow = document.createElement("div");
			valueInputRow.className = "flex items-center gap-2";
			const valueInput = document.createElement("input");
			valueInput.type = "text";
			valueInput.className = "block px-4 py-2 border rounded-lg flex-1";
			valueInput.maxLength = 30;
			valueInput.placeholder = "Enter value (eg: Red, White, Blue,...)";
			valueInput.required = true;
			valueInput.style.minWidth = "220px";
			valueInput.style.width = "300px";
			valueInputRow.appendChild(valueInput);
			const addValueBtn = document.createElement("button");
			addValueBtn.type = "button";
			addValueBtn.className = "add-value px-2 py-1 border rounded text-indigo-600 border-indigo-400 hover:bg-indigo-50";
			addValueBtn.textContent = "+";
			valueInputRow.appendChild(addValueBtn);
			const removeValueBtn = document.createElement("button");
			removeValueBtn.type = "button";
			removeValueBtn.className = "remove-value px-2 py-1 border rounded text-red-600 border-red-400 hover:bg-red-50";
			removeValueBtn.textContent = "🗑";
			valueInputRow.appendChild(removeValueBtn);
			valueRow.appendChild(valueInputRow);
			const valueError = document.createElement("div");
			valueError.className = "input-error mt-1 text-xs text-red-600";
			valueError.style.display = "none";
			valueRow.appendChild(valueError);
			valueInput.addEventListener("input", function () {
				if (!valueInput.value.trim()) {
					valueError.textContent = "This field cannot be empty!";
					valueError.style.display = "block";
				} else {
					valueError.textContent = "";
					valueError.style.display = "none";
				}
			});
			setTimeout(() => {
				if (!valueInput.value.trim()) {
					valueError.textContent = "This field cannot be empty!";
					valueError.style.display = "block";
				}
			}, 0);
			addValueBtn.onclick = function () {
				valuesDiv.appendChild(createValueInput());
				updateRemoveButtons();
			};
			removeValueBtn.onclick = function () {
				if (valuesDiv.childElementCount > 1) {
					valueRow.remove();
					updateRemoveButtons();
					generateVariants();
				}
			};
			return valueRow;
		}
	// Nếu muốn mặc định 2 value thì dùng dòng dưới, còn mặc định 1 value thì bỏ dòng này
		valuesDiv.appendChild(createValueInput());
		function updateRemoveButtons() {
			const rows = valuesDiv.querySelectorAll('.remove-value');
			rows.forEach(btn => btn.disabled = false);
			if (valuesDiv.childElementCount === 1) {
				valuesDiv.querySelector('.remove-value').disabled = true;
			}
		}
		updateRemoveButtons();
		groupDiv.appendChild(valuesDiv);
		attributeList.appendChild(groupDiv);
		if (attributeGroupCount >= MAX_ATTRIBUTE_GROUP) addAttributeBtn.style.display = "none";
		feather.replace();
		nameInput.addEventListener('input', function() {
			if (!nameInput.value.trim()) {
				nameError.textContent = "This field cannot be empty!";
				nameError.style.display = "block";
			} else {
				nameError.textContent = "";
				nameError.style.display = "none";
			}
		});
		setTimeout(() => {
			if (!nameInput.value.trim()) {
				nameError.textContent = "This field cannot be empty!";
				nameError.style.display = "block";
			}
		}, 0);
		valuesDiv.querySelectorAll('input[type="text"]').forEach(input => {
			if (!input.value.trim()) {
				const errorDiv = input.parentNode.querySelector('.input-error');
				if (errorDiv) {
					errorDiv.textContent = "This field cannot be empty!";
					errorDiv.style.display = "block";
				}
			}
		});
	}
	if (addAttributeBtn && attributeList) {
		// Improve Add Attribute Group button style
		addAttributeBtn.className = "px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition flex items-center gap-2 text-lg mb-2";
		addAttributeBtn.innerHTML = '<i data-feather="plus"></i> Add Attribute Group';
		feather.replace();
		addAttributeBtn.onclick = createAttributeGroup;
	}

	// Improve Create Product button style
	const createProductBtn = document.querySelector('#createItemForm button[type="submit"]');
	if (createProductBtn) {
		createProductBtn.className = "w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700 transition flex items-center justify-center gap-2 text-xl mt-4";
		createProductBtn.innerHTML = '<i data-feather="check"></i> Create Product';
		feather.replace();
	}
});
