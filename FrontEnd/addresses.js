// User address management
class AddressManager {
    constructor() {
        this.addresses = [];
        this.init();
    }

    // Initialize address page
    init() {
        this.loadUserProfile();
        this.loadAddresses();
        this.setupEventListeners();
        this.loadProvinces();
        this.initializeCartDropdown();
    }

    // Load user profile information
    async loadUserProfile() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "login.html";
                return;
            }

            const response = await fetch("http://localhost:8080/users/myInfo", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            if (data.code === 1) {
                const user = data.result;
                document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;
                document.getElementById("profile-username").textContent = user.username ? `@${user.username}` : "";
            } else {
                console.error("Cannot load user information");
            }

            // Load avatar từ API
            await this.loadUserAvatar(token);
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    // Load user avatar
    async loadUserAvatar(token) {
        try {
            const response = await fetch("http://localhost:8080/users/avatar", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                // API trả về trực tiếp ảnh binary
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                document.getElementById("profile-picture").src = imageUrl;
            } else {
                console.error("Cannot load user avatar");
            }
        } catch (error) {
            console.error("Error loading avatar:", error);
        }
    }

    // Load address list
    async loadAddresses() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "login.html";
                return;
            }

            const response = await fetch("http://localhost:8080/users/addresses", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.code === 1) {
                    // Only keep active addresses per new API contract and sort default to top
                    this.addresses = (data.result || [])
                        .filter(addr => addr.active === true)
                        .sort((a, b) => {
                            const aDef = a.defaultAddress ? 1 : 0;
                            const bDef = b.defaultAddress ? 1 : 0;
                            return bDef - aDef;
                        });
                } else {
                    this.addresses = [];
                }
                this.renderAddresses();
            } else {
                // If API fails, show empty list
                this.addresses = [];
                this.renderAddresses();
            }
        } catch (error) {
            console.error("Error loading addresses:", error);
            // Show empty list on error
            this.addresses = [];
            this.renderAddresses();
        }
    }


    // Display address list
    renderAddresses() {
        const addressList = document.getElementById("addressList");
        
        if (this.addresses.length === 0) {
            addressList.innerHTML = `
                <div class="text-center py-12">
                    <i data-feather="map-pin" class="mx-auto h-12 w-12 text-gray-400"></i>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No addresses yet</h3>
                    <p class="mt-1 text-sm text-gray-500">Add your first address for delivery.</p>
                </div>
            `;
        } else {
            addressList.innerHTML = this.addresses.map(address => this.createAddressCard(address)).join('');
        }
        
        feather.replace();
    }

    // Create address card
    createAddressCard(address) {
        const isDefault = address.defaultAddress ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200';
        const defaultBadge = address.defaultAddress ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Default</span>' : '';
        
        return `
            <div class="border rounded-lg p-4 ${isDefault} hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-medium text-gray-900">Delivery Address</h4>
                            ${defaultBadge}
                        </div>
                        <p class="text-sm text-gray-600 mb-1">${address.phone || address.phoneNumber || ''}</p>
                        <p class="text-sm text-gray-700">
                            ${address.detail || address.streetAddress || ''}, ${address.ward || ''}, ${address.district || ''}, ${address.city || ''}
                        </p>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        ${!address.defaultAddress ? `<button onclick=\"addressManager.setDefaultAddress(${address.addressID})\" class=\"text-gray-600 hover:text-gray-800 text-sm font-medium\">Set Default</button>` : ''}
                        <button onclick="addressManager.deleteAddress(${address.addressID})" class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Get province/city name
    getProvinceName(provinceCode) {
        const provinces = {
            'hanoi': 'Hà Nội',
            'hcm': 'TP. Hồ Chí Minh',
            'danang': 'Đà Nẵng',
            'cantho': 'Cần Thơ',
            'haiphong': 'Hải Phòng',
            'bienhoa': 'Biên Hòa',
            'nhatrang': 'Nha Trang',
            'hue': 'Huế',
            'buonmathuot': 'Buôn Ma Thuột',
            'dalat': 'Đà Lạt'
        };
        return provinces[provinceCode] || provinceCode;
    }

    // Load provinces from API
    async loadProvinces() {
        const provinceSelect = document.getElementById("province");
        provinceSelect.innerHTML = '<option value="">Select Province/City</option>';
        try {
            const res = await fetch("https://provinces.open-api.vn/api/p/");
            const data = await res.json();
            data.forEach(province => {
                const opt = document.createElement("option");
                opt.value = province.name;
                opt.textContent = province.name;
                opt.dataset.code = province.code;
                provinceSelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error loading provinces:", error);
        }
    }

    // Load districts based on selected province
    async loadDistricts(provinceCode) {
        const districtSelect = document.getElementById("district");
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (!provinceCode) return;
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await res.json();
            data.districts.forEach(district => {
                const opt = document.createElement("option");
                opt.value = district.name;
                opt.textContent = district.name;
                opt.dataset.code = district.code;
                districtSelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error loading districts:", error);
        }
    }

    // Load wards based on selected district
    async loadWards(districtCode) {
        const wardSelect = document.getElementById("ward");
        wardSelect.innerHTML = '<option value="">Select Ward</option>';
        if (!districtCode) return;
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await res.json();
            data.wards.forEach(ward => {
                const opt = document.createElement("option");
                opt.value = ward.name;
                opt.textContent = ward.name;
                wardSelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error loading wards:", error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Add new address button
        document.getElementById('addAddressBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Close modal button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        // Cancel button in modal
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        // Form submit
        document.getElementById('addressForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAddress();
        });

        // Click outside modal to close
        document.getElementById('addressModal').addEventListener('click', (e) => {
            if (e.target.id === 'addressModal') {
                this.hideModal();
            }
        });

        // Province/District/Ward cascading dropdowns
        document.getElementById("province").addEventListener("change", (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const code = selected.dataset.code;
            this.loadDistricts(code);
            // Reset ward dropdown
            document.getElementById("ward").innerHTML = '<option value="">Select Ward</option>';
        });

        document.getElementById("district").addEventListener("change", (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const code = selected.dataset.code;
            this.loadWards(code);
        });
    }

    // Khởi tạo dropdown giỏ hàng trên header
    initializeCartDropdown() {
        const cartIcon = document.getElementById('cartIcon');
        const cartMenu = document.getElementById('cartMenu');
        const viewCartBtn = document.getElementById('viewCartBtn');

        if (!cartIcon || !cartMenu) return;

        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartMenu.classList.toggle('hidden');
            if (!cartMenu.classList.contains('hidden')) {
                this.loadCartDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            if (!cartIcon.contains(e.target) && !cartMenu.contains(e.target)) {
                cartMenu.classList.add('hidden');
            }
        });

        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
        }
    }

    // Tải danh sách sản phẩm trong dropdown giỏ hàng
    async loadCartDropdown() {
        const token = localStorage.getItem('token');
        const headerCartItems = document.getElementById('cartItems');
        const headerCartTotal = document.getElementById('cartTotal');
        if (!token || !headerCartItems || !headerCartTotal) return;

        try {
            const response = await fetch('http://localhost:8080/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.code === 1 && Array.isArray(data.result?.itemCart)) {
                let total = 0;
                let itemCount = 0;
                let itemsHtml = '';

                for (const shop of data.result.itemCart) {
                    if (shop.items && shop.items.length > 0) {
                        for (const item of shop.items) {
                            itemCount += item.quantity || 1;
                            total += (item.price || 0) * (item.quantity || 1);

                            let attributesText = '';
                            if (item.attributes && Array.isArray(item.attributes)) {
                                attributesText = item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
                            }

                            let imageUrl = 'https://via.placeholder.com/48';
                            try {
                                const imgResponse = await fetch(`http://localhost:8080/item/coverImage/${item.itemID}`);
                                if (imgResponse.ok) {
                                    const blob = await imgResponse.blob();
                                    if (blob.size > 0) {
                                        imageUrl = URL.createObjectURL(blob);
                                    }
                                }
                            } catch {}

                            itemsHtml += `
                                <div class="flex items-center space-x-3 py-2">
                                    <img src="${imageUrl}" alt="${item.itemName || 'Product'}" class="w-12 h-12 rounded object-cover border">
                                    <div class="flex-1">
                                        <h5 class="text-sm font-medium text-gray-800">${item.itemName || 'Product'}</h5>
                                        ${attributesText ? `<p class="text-xs text-gray-500">${attributesText}</p>` : ''}
                                        <p class="text-sm text-indigo-600">$${item.price || 0} x ${item.quantity || 1}</p>
                                    </div>
                                </div>
                            `;
                        }
                    }
                }

                if (itemCount === 0) {
                    itemsHtml = '<p class="text-sm text-gray-500">Your cart is empty</p>';
                }

                headerCartItems.innerHTML = itemsHtml;
                headerCartTotal.innerHTML = `
                    <span class="font-medium">Total: $${total.toFixed(2)}</span>
                    <span class="text-sm text-gray-500">(${itemCount} items)</span>
                `;
            } else {
                headerCartItems.innerHTML = '<p class="text-sm text-gray-500">Your cart is empty</p>';
                headerCartTotal.innerHTML = '<span class="font-medium">Total: $0</span>';
            }
        } catch (error) {
            headerCartItems.innerHTML = '<p class="text-sm text-red-500">Error loading cart</p>';
            headerCartTotal.innerHTML = '<span class="font-medium">Total: $0</span>';
        }
    }

    // Show modal
    async showModal(addressId = null) {
        const modal = document.getElementById('addressModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('addressForm');
        const noticeDiv = document.querySelector('.bg-blue-50');
        
        if (addressId) {
            modalTitle.textContent = 'Edit Address';
            // Hide notice for editing
            if (noticeDiv) {
                noticeDiv.style.display = 'none';
            }
            const address = this.addresses.find(addr => addr.addressID === addressId);
            if (address) {
                await this.fillForm(address);
            }
        } else {
            modalTitle.textContent = 'Add New Address';
            // Show notice for new address
            if (noticeDiv) {
                noticeDiv.style.display = 'block';
            }
            form.reset();
            document.getElementById('addressId').value = '';
            // Reset dropdowns
            document.getElementById("district").innerHTML = '<option value="">Select District</option>';
            document.getElementById("ward").innerHTML = '<option value="">Select Ward</option>';
        }
        
        modal.classList.remove('hidden');
    }

    // Hide modal
    hideModal() {
        document.getElementById('addressModal').classList.add('hidden');
        document.getElementById('addressForm').reset();
        // Reset dropdowns
        document.getElementById("district").innerHTML = '<option value="">Select District</option>';
        document.getElementById("ward").innerHTML = '<option value="">Select Ward</option>';
    }

    // Fill form with address data
    async fillForm(address) {
        document.getElementById('addressId').value = address.addressID;
        document.getElementById('phoneNumber').value = address.phone || address.phoneNumber || '';
        
        // Set province
        const cityName = address.city || address.province;
        if (cityName) {
            document.getElementById('province').value = cityName;
            // Find province code and load districts
            const provinceSelect = document.getElementById('province');
            const provinceOption = Array.from(provinceSelect.options).find(opt => opt.value === cityName);
            if (provinceOption && provinceOption.dataset.code) {
                await this.loadDistricts(provinceOption.dataset.code);
                
                // Set district after districts are loaded
                if (address.district) {
                    document.getElementById('district').value = address.district;
                    
                    // Find district code and load wards
                    const districtSelect = document.getElementById('district');
                    const districtOption = Array.from(districtSelect.options).find(opt => opt.value === address.district);
                    if (districtOption && districtOption.dataset.code) {
                        await this.loadWards(districtOption.dataset.code);
                        
                        // Set ward after wards are loaded
                        if (address.ward) {
                            document.getElementById('ward').value = address.ward;
                        }
                    }
                }
            }
        }
        
        document.getElementById('streetAddress').value = address.detail || address.streetAddress || '';
    }

    // Save address
    async saveAddress() {
        const requestData = {
            phone: document.getElementById('phoneNumber').value,
            city: document.getElementById('province').value,
            district: document.getElementById('district').value,
            ward: document.getElementById('ward').value,
            detail: document.getElementById('streetAddress').value
        };

        try {
            const token = localStorage.getItem("token");
            const method = "POST";
            const url = "http://localhost:8080/users/addresses";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                this.hideModal();
                await this.loadAddresses(); // Reload list
                this.showToast('Address added successfully!', 'success');
            } else {
                this.showToast('Failed to add address', 'error');
                throw new Error('Error saving address');
            }
        } catch (error) {
            console.error("Error saving address:", error);
            this.showToast('Error adding address', 'error');
        }
    }

    // Local storage fallback removed per new API behavior

    // Edit removed per requirement

    // Delete address
    async deleteAddress(addressId) {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            // Determine if the deleted address is default and the next address candidate
            const currentIndex = this.addresses.findIndex(a => a.addressID === addressId);
            const wasDefault = currentIndex !== -1 ? !!this.addresses[currentIndex].defaultAddress : false;
            const nextAddress = currentIndex !== -1 && this.addresses[currentIndex + 1] ? this.addresses[currentIndex + 1] : null;

            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/users/addresses/${addressId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                if (wasDefault && nextAddress) {
                    // Set the next address as default after successful deletion
                    await this.setDefaultAddress(nextAddress.addressID);
                    // Additionally notify delete success
                    this.showToast('Address deleted successfully!', 'success');
                } else {
                    await this.loadAddresses();
                    this.showToast('Address deleted successfully!', 'success');
                }
            } else {
                this.showToast('Failed to delete address', 'error');
                throw new Error('Error deleting address');
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            this.showToast('Error deleting address', 'error');
        }
    }

    // Set default address
    async setDefaultAddress(addressId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/users/addresses/${addressId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            let data = null;
            try { data = await response.json(); } catch (_) { data = null; }

            if (data && data.code === 1) {
                await this.loadAddresses();
                this.showToast('Default address set successfully!', 'success');
            } else {
                this.showToast('Failed to set default address', 'error');
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            this.showToast('Error setting default address', 'error');
        }
    }

    // Simple toast notification (green for success, red for error), auto-hide after ~5s
    showToast(message, type = 'success') {
        const containerId = 'toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.top = '16px';
            container.style.right = '16px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '8px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.padding = '10px 14px';
        toast.style.borderRadius = '6px';
        toast.style.color = type === 'success' ? '#065f46' : '#7f1d1d';
        toast.style.backgroundColor = type === 'success' ? '#d1fae5' : '#fee2e2';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        toast.style.border = type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 200ms ease';

        container.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
                if (container.childElementCount === 0) container.remove();
            }, 250);
        }, 5000);
    }
}

// Initialize AddressManager when page loads
let addressManager;
document.addEventListener('DOMContentLoaded', function() {
    addressManager = new AddressManager();
});
