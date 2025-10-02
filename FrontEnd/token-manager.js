/**
 * TokenManager - Quản lý token và auto refresh
 * Đảm bảo token luôn được refresh tự động khi cần thiết
 */
class TokenManager {
    constructor() {
        this.baseURL = 'http://localhost:8080';
        this.refreshPromise = null; // Tránh gọi refresh nhiều lần đồng thời
        this.isRefreshing = false;
    }

    /**
     * Lấy token hiện tại từ localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Lưu token mới vào localStorage
     */
    setToken(token) {
        localStorage.setItem('token', token);
    }

    /**
     * Xóa token khỏi localStorage
     */
    removeToken() {
        localStorage.removeItem('token');
    }

    /**
     * Kiểm tra xem có token hay không
     */
    hasToken() {
        return !!this.getToken();
    }

    /**
     * Refresh token
     */
    async refreshToken() {
        const currentToken = this.getToken();
        if (!currentToken) {
            throw new Error('No token to refresh');
        }

        // Nếu đang refresh, chờ kết quả
        if (this.isRefreshing) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this._performRefresh(currentToken);

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    /**
     * Thực hiện refresh token
     */
    async _performRefresh(token) {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok && data.code === 1 && data.result && data.result.token) {
                this.setToken(data.result.token);
                return data.result.token;
            } else {
                throw new Error(data.message || 'Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.removeToken();
            throw error;
        }
    }

    /**
     * Thực hiện API call với auto refresh token
     */
    async apiCall(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token');
        }

        // Thêm Authorization header
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const requestOptions = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, requestOptions);

            // Nếu token hết hạn, thử refresh và gọi lại
            if (response.status === 401 || response.status === 403) {
                console.log('Token expired, attempting refresh...');
                
                try {
                    await this.refreshToken();
                    const newToken = this.getToken();
                    
                    // Gọi lại API với token mới
                    const newHeaders = {
                        ...headers,
                        'Authorization': `Bearer ${newToken}`
                    };
                    
                    const newRequestOptions = {
                        ...requestOptions,
                        headers: newHeaders
                    };
                    
                    return await fetch(url, newRequestOptions);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    // Redirect về login nếu refresh thất bại
                    this.redirectToLogin();
                    throw refreshError;
                }
            }

            return response;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    /**
     * Redirect về trang login
     */
    redirectToLogin() {
        this.removeToken();
        window.location.href = 'login.html';
    }

    /**
     * Kiểm tra token có hợp lệ không
     */
    async validateToken() {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            const response = await this.apiCall(`${this.baseURL}/users/myInfo`, {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate token khi trang load - logout nếu token hết hạn
     * Sử dụng khi user quay lại sau khi tắt trình duyệt
     */
    async validateTokenOnLoad() {
        const token = this.getToken();
        if (!token) {
            this.redirectToLogin();
            return false;
        }

        try {
            // Thử gọi API với token hiện tại
            const response = await fetch(`${this.baseURL}/users/myInfo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Nếu token hết hạn, logout ngay lập tức
            if (response.status === 401 || response.status === 403) {
                console.log('Token expired on page load, logging out...');
                this.redirectToLogin();
                return false;
            }

            // Token còn hợp lệ
            return response.ok;
        } catch (error) {
            console.error('Token validation error on page load:', error);
            this.redirectToLogin();
            return false;
        }
    }

    /**
     * Refresh token sau khi tạo shop thành công
     */
    async refreshTokenAfterShopCreation() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No token to refresh');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok && data.code === 1 && data.result && data.result.token) {
                this.setToken(data.result.token);
                console.log('Token refreshed after shop creation');
                return data.result.token;
            } else {
                throw new Error(data.message || 'Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error after shop creation:', error);
            throw error;
        }
    }

    /**
     * Logout và xóa token
     */
    async logout() {
        const token = this.getToken();
        if (token) {
            try {
                await this.apiCall(`${this.baseURL}/auth/logout`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        this.removeToken();
        this.redirectToLogin();
    }
}

// Tạo instance global
window.tokenManager = new TokenManager();

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TokenManager;
}
