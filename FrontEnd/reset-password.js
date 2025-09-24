document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resetPasswordForm");
    const confirmInput = document.getElementById("confirm-password");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.querySelector("#resetPasswordForm button[type='submit']");
    const errorDiv = document.getElementById("passwordError");

    // Kiểm tra mật khẩu khớp theo thời gian thực và disable nút submit nếu không khớp
    function checkPasswordMatch() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmInput.value.trim();

        if (confirmPassword && password !== confirmPassword) {
            errorDiv.textContent = "Re-entered password does not match";
            errorDiv.classList.remove("d-none");
            errorDiv.classList.add("text-danger");
            errorDiv.classList.remove("text-success");
            submitBtn.disabled = true;
            submitBtn.classList.add("opacity-50", "cursor-not-allowed");
        } else {
            errorDiv.textContent = "";
            errorDiv.classList.add("d-none");
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }

    confirmInput.addEventListener("input", checkPasswordMatch);
    passwordInput.addEventListener("input", checkPasswordMatch);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const password = passwordInput.value.trim();
        const confirmPassword = confirmInput.value.trim();
        const email = localStorage.getItem("resetEmail");
        const token = localStorage.getItem("resetToken");

        // Xóa thông báo cũ
        showError("");

        if (!password || !confirmPassword || !email || !token) {
            showError("Please enter complete information!");
            return;
        }

        if (password.length < 8) {
            showError("Password must be at least 8 characters!");
            return;
        }

        if (password !== confirmPassword) {
            showError("Re-entered password does not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    password: password,
                    email: email
                })
            });

            const data = await response.json();

            if (response.ok && data.code === 1) {
                showSuccess("Password changed successfully!");
                localStorage.removeItem("resetToken");
                localStorage.removeItem("resetEmail");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                
                showError(data.result || "Password change failed!");
                setTimeout(() => {
                    window.location.href = "verify-code.html";
                }, 2000);
            }
        } catch (error) {
            console.error("Error:", error);
            showError("Unable to connect to server!");
        }
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
        errorDiv.classList.add("text-danger");
        errorDiv.classList.remove("text-success");
    }

    function showSuccess(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
        errorDiv.classList.remove("text-danger");
        errorDiv.classList.add("text-success");
    }
});