document.addEventListener("DOMContentLoaded", async function () {
    // Add instruction for selecting multiple files and preview
    var picturesInput = document.getElementById("itemPictures");
    if (picturesInput) {
        // Instruction
        var instructionDiv = document.getElementById("itemPicturesInstruction");
        if (!instructionDiv) {
            instructionDiv = document.createElement("div");
            instructionDiv.id = "itemPicturesInstruction";
            instructionDiv.className = "mt-1 text-xs text-gray-500";
            instructionDiv.innerText = "Tip: To upload multiple images, hold down the Ctrl (Windows) or Command (Mac) key while selecting files.";
            picturesInput.parentNode.insertBefore(instructionDiv, picturesInput.nextSibling);
        }
        // Preview
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
                html = Array.from(picturesInput.files).map(function(f) {
                    var url = URL.createObjectURL(f);
                    return `<div style='display:inline-block'><img src='${url}' alt='${f.name}' style='width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee;margin-bottom:4px;'/><div style='font-size:12px;text-align:center;max-width:80px;word-break:break-all;'>${f.name}</div></div>`;
                }).join("");
            } else {
                html = "No files selected.";
            }
            fileListDiv.innerHTML = html;
        });
    }

    // Hiển thị preview cho cover image
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
                const f = coverInput.files[0];
                const url = URL.createObjectURL(f);
                html = `<img src='${url}' alt='${f.name}' style='width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee;margin-bottom:4px;'/><div style='font-size:12px;text-align:center;max-width:80px;word-break:break-all;'>${f.name}</div>`;
            } else {
                html = "No cover image selected.";
            }
            coverPreviewDiv.innerHTML = html;
        });
    }
    feather.replace();
    // Tab navigation
    const tabMap = {
        "Dashboard": "dashboardSection",
        "Create Item": "createItemSection",
        "Products": "productsSection",
        "Orders": "ordersSection",
        "Analytics": "analyticsSection"
    };
    const navTabs = document.querySelectorAll('.border-b-2');
    navTabs.forEach(tab => {
        tab.addEventListener("click", function(e) {
            e.preventDefault();
            // Hide all sections
            Object.values(tabMap).forEach(id => {
                const sec = document.getElementById(id);
                if (sec) sec.style.display = 'none';
            });
            // Show selected section
            const sectionId = tabMap[tab.textContent.trim()];
            if (sectionId) {
                const sec = document.getElementById(sectionId);
                if (sec) sec.style.display = 'block';
            }
            // Move blue underline to selected tab
            navTabs.forEach(t => {
                t.classList.remove('border-indigo-500', 'text-indigo-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            tab.classList.remove('border-transparent', 'text-gray-500');
            tab.classList.add('border-indigo-500', 'text-indigo-600');
        });
    });

    // Fetch shop info and render
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "register-shop.html";
        return;
    }
    const response = await fetch("http://localhost:8080/shop/info", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    let shopInfo = null;
    try {
        shopInfo = await response.json();
    } catch (e) {
        shopInfo = null;
    }
    if ((response.status === 400 && shopInfo && shopInfo.code === 1008) || !shopInfo || shopInfo.code !== 1) {
        // Nếu shop chưa tạo hoặc lỗi code 1008 thì chuyển hướng về trang đăng ký shop
        window.location.href = "register-shop.html";
        return;
    }
    if (shopInfo && shopInfo.result && shopInfo.result.shopResponse) {
        const shop = shopInfo.result.shopResponse;
        document.getElementById("shopName").textContent = shop.shopName;
        document.getElementById("shopRate").querySelector("span").textContent = shop.rate;
        document.getElementById("shopRatings").querySelector("span").textContent = shop.ratings;
        document.getElementById("shopFollowers").querySelector("span").textContent = shop.followers;
        // Update Products tab with totalProduct
        const productsTab = Array.from(document.querySelectorAll('.border-b-2')).find(tab => tab.textContent.trim().startsWith("Products"));
        if (productsTab) {
            productsTab.textContent = `Products (${shop.totalProduct})`;
        }
        // Render products
        const productsList = document.getElementById("productsList");
        productsList.innerHTML = "";
        const shopEmpty = document.getElementById("shopEmpty");
        if (shopInfo.result.items && shopInfo.result.items.length > 0) {
            shopEmpty.style.display = "none";
            shopInfo.result.items.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition duration-300";
                card.innerHTML = `
                    <div class='relative h-48 overflow-hidden flex items-center justify-center bg-gray-100'>
                        <img src='${item.image || "https://cdn-icons-png.flaticon.com/512/4086/4086679.png"}' alt='Product' class='w-32 h-32 object-cover'>
                    </div>
                    <div class='p-4'>
                        <h3 class='font-medium text-gray-900'>${item.name || "Product Name"}</h3>
                        <p class='text-sm text-gray-500 mt-1'>${item.category || "Category"}</p>
                        <div class='mt-2 flex justify-between items-center'>
                            <span class='text-lg font-semibold text-gray-900'>${item.price ? `$${item.price}` : "Contact for price"}</span>
                            <span class='text-sm text-gray-500'>${item.stock ? `${item.stock} in stock` : ""}</span>
                        </div>
                    </div>
                `;
                productsList.appendChild(card);
            });
        } else {
            shopEmpty.style.display = "flex";
        }
    }

    // Avatar hover to change
    const shopAvatar = document.getElementById("shopAvatar");
    if (shopAvatar) {
        // Add input for file upload (hidden)
        let avatarInput = document.getElementById("shopAvatarInput");
        if (!avatarInput) {
            avatarInput = document.createElement("input");
            avatarInput.type = "file";
            avatarInput.accept = "image/*";
            avatarInput.id = "shopAvatarInput";
            avatarInput.style.display = "none";
            shopAvatar.parentNode.appendChild(avatarInput);
        }
        shopAvatar.style.cursor = "pointer";
        shopAvatar.title = "Click to change shop avatar";
        shopAvatar.style.width = "96px";
        shopAvatar.style.height = "96px";
        shopAvatar.style.borderRadius = "50%";
        shopAvatar.style.objectFit = "cover";
        shopAvatar.parentNode.style.width = "96px";
        shopAvatar.parentNode.style.height = "96px";
        // Tạo thông báo khi hover
        let changeLabel = document.getElementById("shopAvatarChangeLabel");
        if (!changeLabel) {
            changeLabel = document.createElement("div");
            changeLabel.id = "shopAvatarChangeLabel";
            changeLabel.textContent = "Change avatar";
            changeLabel.style.position = "absolute";
            changeLabel.style.bottom = "8px";
            changeLabel.style.left = "50%";
            changeLabel.style.transform = "translateX(-50%)";
            changeLabel.style.background = "rgba(0,0,0,0.6)";
            changeLabel.style.color = "#fff";
            changeLabel.style.padding = "2px 10px";
            changeLabel.style.borderRadius = "12px";
            changeLabel.style.fontSize = "0.75rem";
            changeLabel.style.pointerEvents = "none";
            changeLabel.style.opacity = "0";
            changeLabel.style.transition = "opacity 0.2s";
            shopAvatar.parentNode.style.position = "relative";
            shopAvatar.parentNode.appendChild(changeLabel);
        }
        shopAvatar.addEventListener("mouseenter", function () {
            changeLabel.style.opacity = "1";
        });
        shopAvatar.addEventListener("mouseleave", function () {
            changeLabel.style.opacity = "0";
        });
        shopAvatar.addEventListener("click", function () {
            avatarInput.click();
        });
        avatarInput.addEventListener("change", async function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You are not logged in!");
                return;
            }
            const formData = new FormData();
            formData.append("image", file);
            try {
                const response = await fetch("http://localhost:8080/shop/update/avatar", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });
                const data = await response.json();
                if (response.ok && data.code === 1) {
                    // Reload avatar from backend
                    try {
                        const avatarRes = await fetch("http://localhost:8080/shop/avatar", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });
                        if (avatarRes.ok) {
                            const blob = await avatarRes.blob();
                            if (blob && blob.size > 0) {
                                shopAvatar.src = URL.createObjectURL(blob);
                            } else {
                                shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                            }
                        } else {
                            shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                        }
                    } catch (e) {
                        shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                    }
                } else {
                    alert(data.result || "Failed to change shop avatar!");
                }
            } catch (error) {
                alert("Cannot connect to server!");
            }
        });
        // Load avatar on page load
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const avatarRes = await fetch("http://localhost:8080/shop/avatar", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (avatarRes.ok) {
                const blob = await avatarRes.blob();
                if (blob && blob.size > 0) {
                    shopAvatar.src = URL.createObjectURL(blob);
                } else {
                    shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
                }
            } else {
                shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
            }
        } catch (e) {
            shopAvatar.src = "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";
        }
    }

    // Always show shopEmpty if no products when switching to Products tab
    const productsTab = Array.from(document.querySelectorAll('.border-b-2')).find(tab => tab.textContent.trim().startsWith("Products"));
    if (productsTab) {
        productsTab.addEventListener("click", function(e) {
            setTimeout(() => {
                const shopEmpty = document.getElementById("shopEmpty");
                const productsList = document.getElementById("productsList");
                if (productsList && shopEmpty) {
                    if (productsList.children.length === 0) {
                        shopEmpty.style.display = "flex";
                    } else {
                        shopEmpty.style.display = "none";
                    }
                }
            }, 0);
        });
    }

    // Show shopEmpty and Add Item button if totalProduct = 0
    function showShopEmptyIfNoProducts() {
        const shopEmpty = document.getElementById("shopEmpty");
        if (shopEmpty && typeof window.shopTotalProduct !== "undefined") {
            if (window.shopTotalProduct === 0) {
                shopEmpty.style.display = "flex";
            } else {
                shopEmpty.style.display = "none";
            }
        }
    }
    // After fetching shop info
    if (shopInfo && shopInfo.result && shopInfo.result.shopResponse) {
        const shop = shopInfo.result.shopResponse;
        window.shopTotalProduct = shop.totalProduct;
        // Render products
        const productsList = document.getElementById("productsList");
        productsList.innerHTML = "";
        const shopEmpty = document.getElementById("shopEmpty");
        if (shopInfo.result.items && shopInfo.result.items.length > 0) {
            shopEmpty.style.display = "none";
            shopInfo.result.items.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition duration-300";
                card.innerHTML = `
                    <div class='relative h-48 overflow-hidden flex items-center justify-center bg-gray-100'>
                        <img src='${item.image || "https://cdn-icons-png.flaticon.com/512/4086/4086679.png"}' alt='Product' class='w-32 h-32 object-cover'>
                    </div>
                    <div class='p-4'>
                        <h3 class='font-medium text-gray-900'>${item.name || "Product Name"}</h3>
                        <p class='text-sm text-gray-500 mt-1'>${item.category || "Category"}</p>
                        <div class='mt-2 flex justify-between items-center'>
                            <span class='text-lg font-semibold text-gray-900'>${item.price ? `$${item.price}` : "Contact for price"}</span>
                            <span class='text-sm text-gray-500'>${item.stock ? `${item.stock} in stock` : ""}</span>
                        </div>
                    </div>
                `;
                productsList.appendChild(card);
            });
        } else {
            shopEmpty.style.display = "flex";
        }
    }
    // On tab click
    if (typeof productsTab !== "undefined" && productsTab) {
        productsTab.addEventListener("click", function(e) {
            setTimeout(showShopEmptyIfNoProducts, 0);
        });
    }
    // Also call after rendering products
    showShopEmptyIfNoProducts();

    // UUID generator
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    // Thêm trường description vào form nếu chưa có
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
            const name = document.getElementById("itemName").value.trim();
            const price = Number(document.getElementById("itemPrice").value);
            const quantity = Number(document.getElementById("itemQuantity").value);
            const description = document.getElementById("itemDescription") ? document.getElementById("itemDescription").value.trim() : "";
            const picturesInput = document.getElementById("itemPictures");
            const coverInput = document.getElementById("itemCover");
            if (picturesInput) picturesInput.setAttribute("multiple", "multiple");
            if (coverInput) coverInput.removeAttribute("multiple");
            const msgDiv = document.getElementById("createItemMsg");
            msgDiv.textContent = "";
            // Prepare files and UUIDs
            let files = Array.from(picturesInput.files);
            let coverFile = coverInput && coverInput.files.length > 0 ? coverInput.files[0] : null;
            let codes = [];
            if (coverFile) {
                // Remove coverFile from files if present, then unshift coverFile to front
                files = files.filter(f => f.name !== coverFile.name);
                files.unshift(coverFile);
            }
            // Generate UUIDs for all item images, ensuring coverFile is first
            codes = files.map(() => uuidv4());
            // Build pictures array for payload (just UUIDs), coverPage UUID is always first
            let pictures = codes.slice(); // Chỉ chứa UUID ảnh sản phẩm
            // Track used UUIDs to avoid overlap with variant images
            let usedUUIDs = new Set(codes);
            // Khai báo biến categoryName và categoryDetail ở ngoài variant
            const categoryName = document.getElementById("categoryNameSelect") ? document.getElementById("categoryNameSelect").value.trim() : "";
            const categoryDetail = document.getElementById("categoryDetailSelect") ? document.getElementById("categoryDetailSelect").value.trim() : "";
            // Build variants from table
            let variants = [];
            const variantTable = document.getElementById('variantTable');
            if (variantTable) {
                let valid = true;
                // Lấy file ảnh cho từng variant
                const variantTableEl = document.getElementById('variantTable');
                let variantImageFiles = [];
                if (variantTableEl) {
                    const fileInputs = variantTableEl.querySelectorAll('input.variant-image-input');
                    fileInputs.forEach(input => {
                        if (input.files && input.files.length > 0) {
                            variantImageFiles.push(input.files[0]);
                        } else {
                            variantImageFiles.push(null);
                        }
                    });
                }
                // Generate UUIDs for variant images (unique, not overlapping with item images)
                let variantImageUUIDs = variantImageFiles.map(f => {
                    if (!f) return null;
                    let uuid;
                    do {
                        uuid = uuidv4();
                    } while (usedUUIDs.has(uuid));
                    usedUUIDs.add(uuid);
                    return uuid;
                });
                // Add variant image files to files array and codes array, nhưng không thêm UUID vào mảng pictures
                variantImageFiles.forEach((f, idx) => {
                    if (f && variantImageUUIDs[idx]) {
                        files.push(f);
                        codes.push(variantImageUUIDs[idx]);
                    }
                });
                const rows = variantTable.querySelectorAll('tbody tr');
                rows.forEach((row, idx) => {
                    let attributeArr = [];
                    // Get attribute names and values
                    const attributeGroups = document.querySelectorAll('#attributeList > div');
                    let valueIdx = 0;
                    attributeGroups.forEach(group => {
                        const nameInput = group.querySelector('input[type="text"]');
                        const values = group.querySelectorAll('.attribute-values input[type="text"]');
                        attributeArr.push({ name: nameInput.value.trim(), value: row.children[valueIdx].textContent.trim() });
                        valueIdx++;
                    });
                    const priceInput = row.querySelector('input[type="number"]');
                    const stockInput = row.querySelectorAll('input[type="number"]')[1];
                    const skuInput = row.querySelector('input[type="text"]');
                    // Validate
                    let priceValid = priceInput && priceInput.value !== "" && !isNaN(Number(priceInput.value));
                    let stockValid = stockInput && stockInput.value !== "" && !isNaN(Number(stockInput.value));
                    // Ảnh variant là bắt buộc
                    let imageObj = null;
                    let imageValid = false;
                    if (variantImageFiles[idx] && variantImageUUIDs[idx]) {
                        imageObj = { pictureID: variantImageUUIDs[idx] };
                        imageValid = true;
                    }
                    if (!priceValid) {
                        priceInput.classList.add('border-red-500');
                        showInputError(priceInput, "Price cannot be empty!");
                    } else {
                        priceInput.classList.remove('border-red-500');
                        clearInputError(priceInput);
                    }
                    if (!stockValid) {
                        stockInput.classList.add('border-red-500');
                        showInputError(stockInput, "Stock cannot be empty!");
                    } else {
                        stockInput.classList.remove('border-red-500');
                        clearInputError(stockInput);
                    }
                    if (skuInput) clearInputError(skuInput);
                    // Nếu đủ price, stock, ảnh thì mới thêm variant
                    if (priceValid && stockValid && imageValid) {
                        variants.push({
                            attribute: attributeArr,
                            image: imageObj,
                            price: Number(priceInput.value),
                            quantity: Number(stockInput.value),
                            SKU: skuInput ? skuInput.value.trim() : ""
                        });
                    }
                });
            }
            // Build payload
            const payload = {
                name,
                price,
                description,
                pictures, // Chỉ UUID ảnh sản phẩm
                quantity,
                category: {
                    name: categoryName,
                    detail: categoryDetail
                },
                variants // Mỗi variant.image.pictureID là UUID riêng, không nằm trong pictures
            };
            // Send create item request first
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
                    // After item created, send images
                    if (files.length > 0) {
                        const formData = new FormData();
                        files.forEach((file, idx) => {
                            formData.append("images", file);
                            formData.append("codes", codes[idx]);
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
                            if (!imgRes.ok || imgData.code !== 1) {
                                msgDiv.textContent = imgData.result || "Failed to save images!";
                                msgDiv.className = "mt-2 text-sm text-red-600";
                                return;
                            }
                        } catch (err) {
                            msgDiv.textContent = "Cannot connect to image server!";
                            msgDiv.className = "mt-2 text-sm text-red-600";
                            return;
                        }
                    }
                    msgDiv.textContent = "Item created successfully!";
                    msgDiv.className = "mt-2 text-sm text-green-600";
                    // Reset lại trang sau khi thêm sản phẩm thành công
                    window.location.reload();
                } else {
                    msgDiv.textContent = data.result || "Failed to create item!";
                    msgDiv.className = "mt-2 text-sm text-red-600";
                }
            } catch (err) {
                msgDiv.textContent = "Cannot connect to server!";
                msgDiv.className = "mt-2 text-sm text-red-600";
            }
        });
    }

        // CATEGORY LOGIC
    const categoryNameSelect = document.getElementById("categoryNameSelect");
    if (categoryNameSelect) {
        categoryNameSelect.addEventListener("click", async function() {
            if (categoryNameSelect.dataset.loaded === "true") return;
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
                    // Nếu có dữ liệu thì xóa option mặc định
                    categoryNameSelect.innerHTML = '';
                    data.result.forEach(item => {
                        if (item.result) {
                            const opt = document.createElement("option");
                            opt.value = item.result;
                            opt.textContent = item.result;
                            categoryNameSelect.appendChild(opt);
                        }
                    });
                    categoryNameSelect.dataset.loaded = "true";
                }
            } catch (err) {
                // Có thể báo lỗi nếu cần
            }
        });
        // Khi đổi category name thì reset lại detail
        categoryNameSelect.addEventListener("change", function() {
            const categoryDetailSelect = document.getElementById("categoryDetailSelect");
            if (categoryDetailSelect) {
                categoryDetailSelect.innerHTML = '<option value="">Select category detail</option>';
                categoryDetailSelect.dataset.loaded = "false";
            }
        });

        const categoryDetailSelect = document.getElementById("categoryDetailSelect");
        if (categoryDetailSelect) {
            categoryDetailSelect.addEventListener("click", async function() {
                // Nếu đã có option động thì không gọi lại nữa
                if (categoryDetailSelect.dataset.loaded === "true") return;
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
                        // Nếu có dữ liệu thì xóa option mặc định
                        categoryDetailSelect.innerHTML = '';
                        data.result.forEach(item => {
                            if (item.result) {
                                const opt = document.createElement("option");
                                opt.value = item.result;
                                opt.textContent = item.result;
                                categoryDetailSelect.appendChild(opt);
                            }
                        });
                        categoryDetailSelect.dataset.loaded = "true";
                    }
                } catch (err) {
                    // Có thể báo lỗi nếu cần
                }
            });
        }
    }

    // ATTRIBUTE LOGIC
    // VARIANT GENERATION LOGIC
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
            // Render table with one column for single attribute group
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
        // Lấy tên nhóm thuộc tính từ input
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
    const attributeList = document.getElementById("attributeList");
    const addAttributeBtn = document.getElementById("addAttributeBtn");
    let attributeGroupCount = 0;
    let addGroupBtn = null;

    function createAttributeGroup() {
        const MAX_ATTRIBUTE_GROUP = 2;
        if (attributeGroupCount >= MAX_ATTRIBUTE_GROUP) return;
        attributeGroupCount++;
        // Group container
        const groupDiv = document.createElement("div");
        groupDiv.className = "border rounded-lg p-4 mb-4 bg-gray-50 relative";
        // Remove group button
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
        // Label
        const label = document.createElement("label");
        label.className = "block text-sm font-semibold text-gray-700 mb-2";
        label.textContent = "Attribute Group Name";
        groupDiv.appendChild(label);
        // Attribute name input + error
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
        // Attribute values
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
            valueInput.maxLength = 20;
            valueInput.placeholder = "Enter value (eg: Red, White,...)";
            valueInput.required = true;
            valueInputRow.appendChild(valueInput);
            // Add value button
            const addValueBtn = document.createElement("button");
            addValueBtn.type = "button";
            addValueBtn.className = "add-value px-2 py-1 border rounded text-indigo-600 border-indigo-400 hover:bg-indigo-50";
            addValueBtn.textContent = "+";
            valueInputRow.appendChild(addValueBtn);
            // Remove value button
            const removeValueBtn = document.createElement("button");
            removeValueBtn.type = "button";
            removeValueBtn.className = "remove-value px-2 py-1 border rounded text-red-600 border-red-400 hover:bg-red-50";
            removeValueBtn.textContent = "🗑";
            valueInputRow.appendChild(removeValueBtn);
            valueRow.appendChild(valueInputRow);
            // Error div
            const valueError = document.createElement("div");
            valueError.className = "input-error mt-1 text-xs text-red-600";
            valueError.style.display = "none";
            valueRow.appendChild(valueError);
            // Validate realtime
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
            // Add value logic
            addValueBtn.onclick = function () {
                valuesDiv.appendChild(createValueInput());
                updateRemoveButtons();
            };
            // Remove value logic
            removeValueBtn.onclick = function () {
                if (valuesDiv.childElementCount > 1) {
                    valueRow.remove();
                    updateRemoveButtons();
                    // Gọi lại generateVariants để cập nhật bảng
                    generateVariants();
                }
            };
            return valueRow;
        }
        // Always at least 1 value
        valuesDiv.appendChild(createValueInput());
        // Update remove buttons (disable if only 1 value)
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
        // Hide add attribute button if max reached
        if (attributeGroupCount >= MAX_ATTRIBUTE_GROUP) addAttributeBtn.style.display = "none";
        feather.replace();

        // Validate attribute name on input
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

        // Khi tạo nhóm mới, kiểm tra và hiển thị lỗi cho tất cả value rỗng
        valuesDiv.querySelectorAll('input[type="text"]').forEach(input => {
            if (!input.value.trim()) {
            }
        });
    }

    function showInputError(input, message) {
        // Luôn chèn lỗi vào div.input-error ngay sau input
        let errorDiv = input.parentNode.querySelector('.input-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'input-error mt-1 text-xs text-red-600';
            input.parentNode.appendChild(errorDiv);
        }
    errorDiv.textContent = message;
    errorDiv.style.display = '';
    errorDiv.style.position = 'static';
    errorDiv.style.marginTop = '4px';
    errorDiv.style.marginLeft = '0';
    errorDiv.style.paddingLeft = '2px';
    errorDiv.style.width = '100%';
    errorDiv.style.whiteSpace = 'normal';
    errorDiv.style.wordBreak = 'break-word';
    errorDiv.style.boxSizing = 'border-box';
    }
    function clearInputError(input) {
        // Luôn xóa lỗi ở div.input-error ngay sau input
        let errorDiv = input.parentNode.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }
    function validateAttributeRealtime() {
        const attributeGroups = document.querySelectorAll('#attributeList > div');
        let attributeValid = true;
        attributeGroups.forEach(group => {
            const groupName = group.querySelector('input[type="text"]');
            if (!groupName.value.trim()) {
                showInputError(groupName, "This field cannot be empty!");
                attributeValid = false;
            } else {
                clearInputError(groupName);
            }
            const values = group.querySelectorAll('.attribute-values input[type="text"]');
            values.forEach(val => {
                if (!val.value.trim()) {
                    attributeValid = false;
                } else {
                    clearInputError(val);
                }
            });
        });
        // Remove attribute error message at the bottom
        const msgDiv = document.getElementById("createItemMsg");
        msgDiv.textContent = "";
        msgDiv.className = "";
    }

    // Gắn sự kiện realtime cho các input attribute
    function setupAttributeRealtimeValidation() {
        const attributeList = document.getElementById("attributeList");
        attributeList.addEventListener("input", function(e) {
            if (e.target.matches('input[type="text"]')) {
                validateAttributeRealtime();
            }
        });
    }
    setupAttributeRealtimeValidation();
    // Khi ấn Add Attribute thì cũng hiện cảnh báo luôn
    if (addAttributeBtn && attributeList) {
        addAttributeBtn.onclick = createAttributeGroup;
    }
});
