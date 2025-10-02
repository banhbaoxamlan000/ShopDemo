// Xử lý toggle hiển thị password
feather.replace(); // chỉ gọi 1 lần sau khi DOM load

const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', function () {
    const [eye, eyeOff] = this.querySelectorAll('svg');
    const isPassword = passwordInput.type === 'password';

    passwordInput.type = isPassword ? 'text' : 'password';

    if (isPassword) {
        eye.classList.add('hidden');
        eyeOff.classList.remove('hidden');
    } else {
        eye.classList.remove('hidden');
        eyeOff.classList.add('hidden');
    }
});


// Xử lý submit form
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Cho phép đăng nhập bằng username, email hoặc phone
        // Input duy nhất: id='loginId'
        fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: document.getElementById("loginId").value,
                password: document.getElementById("password").value
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error submitting data: ' + response.status);
                }
                return response.json(); // Parse JSON từ ApiResponse
            })
            .then(result => {
                if (result.code === 1) {
                    const token = result.result.token;
                    tokenManager.setToken(token);
                    window.location.href = 'index.html';
                } else {
                    throw new Error('Login failed: ' + (result.message || 'Invalid response'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});