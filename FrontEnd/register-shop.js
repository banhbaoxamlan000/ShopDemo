document.addEventListener("DOMContentLoaded", async function () {
    // Kiểm tra nếu đã có shop thì chuyển hướng về shop.html
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const response = await fetch("http://localhost:8080/shop/info", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.code === 1 && data.result && data.result.shopResponse) {
                window.location.href = "shop.html";
                return;
            }
        } catch (err) {}
    }

    const form = document.getElementById("registerShopForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        // Luôn lấy token mới nhất từ localStorage
        let token = localStorage.getItem("token");
        if (!token) {
            alert("You need to log in first!");
            window.location.href = "login.html";
            return;
        }

        // Lấy dữ liệu từ form
        const shopName = document.getElementById("shopName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const taxNumber = document.getElementById("taxNumber").value;
        const business = document.getElementById("business").value;
        const city = document.getElementById("city").value;
        const district = document.getElementById("district").value;
        const ward = document.getElementById("ward").value;
        const detail = document.getElementById("detail").value;

        const payload = {
            shopName,
            email,
            phone,
            taxNumber,
            business,
            address: {
                city,
                district,
                ward,
                detail
            }
        };

        try {
            const response = await fetch("http://localhost:8080/shop/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok && data.code === 1) {
                // Gọi API refresh token
                try {
                    const refreshRes = await fetch("http://localhost:8080/auth/refresh", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ token })
                    });
                    const refreshData = await refreshRes.json();
                    // Sau khi refresh thành công, cập nhật lại biến token
                    if (refreshRes.ok && refreshData.code === 1 && refreshData.result && refreshData.result.token) {
                        localStorage.removeItem("token");
                        localStorage.setItem("token", refreshData.result.token);
                        token = refreshData.result.token;
                    }
                } catch (err) {
                    // Nếu refresh lỗi, vẫn chuyển hướng nhưng giữ token cũ
                }
                window.location.href = "shop.html";
            } else {
                alert(data.message || "Failed to create shop!");
            }
        } catch (error) {
            alert("Cannot connect to the server!");
        }
    });

    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function setupShopRealtimeCheck(inputId, apiUrl, fieldName) {
        const input = document.getElementById(inputId);
        let msg = document.getElementById(inputId + "Msg");
        if (!msg) {
            msg = document.createElement("span");
            msg.id = inputId + "Msg";
            msg.className = "ml-2 text-sm";
            input.insertAdjacentElement('afterend', msg);
        }
        const check = debounce(async function() {
            const value = input.value.trim();
            if (inputId === "phone") {
                // Chỉ kiểm tra API nếu đúng 10 số
                if (value.length !== 10) {
                    msg.textContent = "❌ Phone must be exactly 10 digits!";
                    msg.classList.remove("text-green-600");
                    msg.classList.add("text-red-600");
                    return;
                } else {
                    msg.textContent = "";
                    msg.classList.remove("text-red-600", "text-green-600");
                }
            }
            if (inputId === "taxNumber") {
                // Chỉ kiểm tra API nếu từ 10-13 số
                if (value.length < 10 || value.length > 13) {
                    msg.textContent = "❌ Tax Number must be 10-13 digits!";
                    msg.classList.remove("text-green-600");
                    msg.classList.add("text-red-600");
                    return;
                } else {
                    msg.textContent = "";
                    msg.classList.remove("text-red-600", "text-green-600");
                }
            }
            if (!value) {
                msg.textContent = "";
                msg.classList.remove("text-red-600", "text-green-600");
                return;
            }
            // Nếu là phone, chỉ gửi request nếu đúng 10 số
            if (inputId === "phone" && value.length !== 10) return;
            // Nếu là taxNumber, chỉ gửi request nếu từ 10-13 số
            if (inputId === "taxNumber" && (value.length < 10 || value.length > 13)) return;
            try {
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ search: value })
                });
                const data = await response.json();
                if (data.code === 1 && data.result === true) {
                    msg.textContent = `❌ ${fieldName} already exists!`;
                    msg.classList.remove("text-green-600");
                    msg.classList.add("text-red-600");
                } else {
                    msg.textContent = `✔ ${fieldName} is available`;
                    msg.classList.remove("text-red-600");
                    msg.classList.add("text-green-600");
                }
            } catch (error) {
                msg.textContent = `Error checking ${fieldName}`;
                msg.classList.remove("text-green-600");
                msg.classList.add("text-red-600");
            }
        }, 500);
        input.addEventListener("input", check);
    }

    setupShopRealtimeCheck("phone", "http://localhost:8080/auth/check-shop-phone", "Phone");
    setupShopRealtimeCheck("email", "http://localhost:8080/auth/check-shop-email", "Email");
    setupShopRealtimeCheck("taxNumber", "http://localhost:8080/auth/check-business-number", "Tax Number");

    // Giới hạn số điện thoại đúng 10 số
    const phoneInput = document.getElementById("phone");
    phoneInput.addEventListener("input", function() {
        let value = phoneInput.value.replace(/\D/g, "");
        // Chỉ cho nhập tối đa 10 số
        if (value.length > 10) value = value.slice(0, 10);
        phoneInput.value = value;
        const msg = document.getElementById("phoneMsg");
        if (value.length < 10) {
            msg.textContent = "❌ Phone must be exactly 10 digits!";
            msg.classList.remove("text-green-600");
            msg.classList.add("text-red-600");
        } else if (value.length > 10) {
            msg.textContent = "❌ Phone must be exactly 10 digits!";
            msg.classList.remove("text-green-600");
            msg.classList.add("text-red-600");
        } else {
            msg.textContent = "";
            msg.classList.remove("text-red-600", "text-green-600");
        }
    });

    // Giới hạn tax number từ 10-13 số
    const taxInput = document.getElementById("taxNumber");
    taxInput.addEventListener("input", function() {
        let value = taxInput.value.replace(/\D/g, "");
        if (value.length > 13) value = value.slice(0, 13);
        taxInput.value = value;
        const msg = document.getElementById("taxNumberMsg");
        if (value.length < 10 || value.length > 13) {
            msg.textContent = "❌ Tax Number must be 10-13 digits!";
            msg.classList.remove("text-green-600");
            msg.classList.add("text-red-600");
        } else if (!msg.textContent.includes("already exists")) {
            msg.textContent = "";
            msg.classList.remove("text-red-600", "text-green-600");
        }
    });

    // Tích hợp API địa chỉ Việt Nam
    async function loadProvinces() {
        const citySelect = document.getElementById("city");
        citySelect.innerHTML = '<option value="">Select City/Province</option>';
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        data.forEach(province => {
            const opt = document.createElement("option");
            opt.value = province.name;
            opt.textContent = province.name;
            opt.dataset.code = province.code;
            citySelect.appendChild(opt);
        });
    }

    async function loadDistricts(provinceCode) {
        const districtSelect = document.getElementById("district");
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (!provinceCode) return;
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        data.districts.forEach(district => {
            const opt = document.createElement("option");
            opt.value = district.name;
            opt.textContent = district.name;
            opt.dataset.code = district.code;
            districtSelect.appendChild(opt);
        });
    }

    async function loadWards(districtCode) {
        const wardSelect = document.getElementById("ward");
        wardSelect.innerHTML = '<option value="">Select Ward</option>';
        if (!districtCode) return;
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        data.wards.forEach(ward => {
            const opt = document.createElement("option");
            opt.value = ward.name;
            opt.textContent = ward.name;
            wardSelect.appendChild(opt);
        });
    }

    loadProvinces();
    document.getElementById("city").addEventListener("change", function() {
        const selected = this.options[this.selectedIndex];
        const code = selected.dataset.code;
        loadDistricts(code);
        document.getElementById("ward").innerHTML = '<option value="">Select Ward</option>';
    });
    document.getElementById("district").addEventListener("change", function() {
        const selected = this.options[this.selectedIndex];
        const code = selected.dataset.code;
        loadWards(code);
    });
});
