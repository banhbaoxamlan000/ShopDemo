document.addEventListener("DOMContentLoaded", async function () {
    const email = localStorage.getItem("resetEmail");
    const flow = localStorage.getItem("flow");
    // Đã xoá đoạn gọi API reset-verify ở đầu file, chỉ gọi khi submit form

    function showCodeError(message) {
        const errorDiv = document.getElementById("codeError");
        errorDiv.textContent = message;
        errorDiv.style.display = message ? "block" : "none";
    }

    const form = document.getElementById("resetCodeForm");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        showCodeError(""); // Xóa lỗi cũ

        const code = document.getElementById("code").value.trim();

        if (!code || !email) {
            showCodeError("Vui lòng nhập mã xác thực và đảm bảo đã nhập email!");
            return;
        }

        try {
            let endpoint;
            if (flow === "register") {
                endpoint = "http://localhost:8080/users/verify";
            } else if (flow === "forgot-password" || flow === "reset") {
                endpoint = "http://localhost:8080/users/reset-verify";
            }
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code,
                    email: email
                })
            });

            const text = await response.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch {
                showCodeError("Server trả về dữ liệu không hợp lệ!");
                return;
            }

            if (
                (flow === "register" && response.ok && data.code === 1) ||
                (flow === "forgot-password" && response.ok && data.code === 1 && data.result?.token) ||
                (flow === "reset" && response.ok && data.code === 1 && data.result?.token)
            ) {
                if (flow === "reset") {
                    localStorage.setItem("resetToken", data.result.token);
                    localStorage.removeItem("flow");
                    localStorage.removeItem("resetEmail");
                    window.location.href = "reset-password.html";
                    return;
                }
                if (flow === "register") {
                    localStorage.removeItem("resetEmail");
                }
                if (flow !== "register") {
                    localStorage.setItem("resetToken", data.result.token);
                }
                localStorage.removeItem("flow");
                // Điều hướng theo flow
                if (flow === "register") {
                    window.location.href = "login.html";
                } else if (flow === "forgot-password") {
                    window.location.href = "reset-password.html";
                }
            } else {
                showCodeError(data.message || "Mã xác thực không đúng hoặc đã hết hạn.");
            }
        } catch (error) {
            console.error("Error:", error);
            showCodeError("Không thể kết nối tới server!");
        }
    });
});