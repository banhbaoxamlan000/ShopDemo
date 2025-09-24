document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirm-password");
    const passwordError = document.getElementById("passwordError");
    const termsCheckbox = document.getElementById("terms");

    // Tạo phần tử thông báo cho ngày sinh
    let dobError = document.getElementById("dobError");
    if (!dobError) {
        dobError = document.createElement("div");
        dobError.id = "dobError";
        dobError.className = "text-sm text-red-600 mt-1 hidden";
        const dobInput = document.getElementById("dob-year").parentNode;
        dobInput.parentNode.appendChild(dobError);
    }

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // Luôn chặn submit mặc định
        // Kiểm tra tất cả các trường bắt buộc trước khi submit
        let valid = true;
        const requiredFields = [
            "username",
            "first-name",
            "last-name",
            "gender",
            "dob-day",
            "dob-month",
            "dob-year",
            "email",
            "phone",
            "password",
            "confirm-password"
        ];
        for (const id of requiredFields) {
            const el = document.getElementById(id);
            if (!el || !el.value.trim()) {
                valid = false;
                el && (el.classList.add("border-red-500"));
            } else {
                el && (el.classList.remove("border-red-500"));
            }
        }
        // Kiểm tra ngày sinh hợp lệ
        valid = valid && validateDobRealtime();
        // Kiểm tra mật khẩu
        let pw = passwordInput.value.trim();
        let cpw = confirmInput.value.trim();
        if (pw.length < 8 || pw !== cpw) {
            valid = false;
        }
        // Kiểm tra tick điều khoản
        if (!termsCheckbox.checked) {
            valid = false;
        }
        if (!valid) {
            passwordError.textContent = "Please fill out all required fields correctly.";
            passwordError.classList.remove("hidden");
            return;
        }
        const password = passwordInput.value.trim();
        const confirmPassword = confirmInput.value.trim();
        if (password !== confirmPassword) {
            passwordError.textContent = "Passwords do not match!";
            passwordError.classList.remove("hidden");
            return;
        }
        // Lấy ngày/tháng/năm từ các input
        const day = parseInt(document.getElementById("dob-day").value, 10);
        const month = parseInt(document.getElementById("dob-month").value, 10);
        const year = parseInt(document.getElementById("dob-year").value, 10);
        // Kiểm tra hợp lệ ngày/tháng/năm
        function isLeapYear(y) {
            return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
        }
        let maxDay = 31;
        if ([4, 6, 9, 11].includes(month)) {
            maxDay = 30;
        } else if (month === 2) {
            maxDay = isLeapYear(year) ? 29 : 28;
        }
        if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > maxDay) {
            dobError.textContent = `Invalid date of birth!`;
            dobError.classList.remove("hidden");
            return;
        } else {
            dobError.textContent = "";
            dobError.classList.add("hidden");
        }
        // Ghép lại thành yyyy-mm-dd
        const dob = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        const body = {
            username: document.getElementById("username").value.trim(),
            firstName: document.getElementById("first-name").value.trim(),
            lastName: document.getElementById("last-name").value.trim(),
            gender: document.getElementById("gender").value,
            password: passwordInput.value.trim(),
            dob: dob,
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim()
        };

        // Nếu form không hợp lệ thì chặn submit
        let isFormValid = !registerBtn.disabled;
        if (!isFormValid) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.ok && data.code === 1) {
                localStorage.setItem("resetEmail", body.email);
                localStorage.setItem("flow", "register");
                window.location.href = "verify-code.html";
            } else {
                passwordError.textContent = data.result || "Register failed!";
                passwordError.classList.remove("hidden");
            }
        } catch (error) {
            passwordError.textContent = "Cannot connect to server!";
            passwordError.classList.remove("hidden");
        }
    });

function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

function validateDobRealtime() {
    const day = parseInt(document.getElementById("dob-day").value, 10);
    const month = parseInt(document.getElementById("dob-month").value, 10);
    const year = parseInt(document.getElementById("dob-year").value, 10);
    let maxDay = 31;
    if ([4, 6, 9, 11].includes(month)) {
        maxDay = 30;
    } else if (month === 2) {
        maxDay = ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 29 : 28;
    }
    if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > maxDay
    ) {
        dobError.textContent = "Invalid date of birth!";
        dobError.classList.remove("hidden");
        return false;
    } else {
        dobError.textContent = "";
        dobError.classList.add("hidden");
        return true;
    }
}

document.getElementById("dob-day").addEventListener("input", validateDobRealtime);
document.getElementById("dob-month").addEventListener("input", validateDobRealtime);
document.getElementById("dob-year").addEventListener("input", validateDobRealtime);

function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const validateConfirmPasswordDebounced = debounce(validateConfirmPasswordRealtime, 500);
passwordInput.addEventListener("input", validateConfirmPasswordDebounced);
confirmInput.addEventListener("input", validateConfirmPasswordDebounced);

function setupRealtimeCheck(inputId, apiUrl, fieldName) {
    const input = document.getElementById(inputId);
    let msg = document.getElementById(inputId + "Msg");
    if (!msg) {
        msg = document.createElement("span");
        msg.id = inputId + "Msg";
        msg.className = "ml-2 text-sm";
        input.parentNode.appendChild(msg);
    }
    const check = debounce(async function() {
        const value = input.value.trim();
        // Nếu là phone, kiểm tra đúng 10 số
        if (inputId === "phone") {
            const onlyDigits = value.replace(/\D/g, "");
            if (onlyDigits.length !== 10) {
                msg.textContent = "❌ Phone must be exactly 10 digits!";
                msg.classList.remove("text-green-600");
                msg.classList.add("text-red-600");
                return;
            }
        }
        // Nếu là email, kiểm tra phải có dạng @gmail.com
        if (inputId === "email") {
            if (!/^\S+@gmail\.com$/.test(value)) {
                msg.textContent = "❌ Email must be in format @gmail.com";
                msg.classList.remove("text-green-600");
                msg.classList.add("text-red-600");
                return;
            }
        }
        if (!value) {
            msg.textContent = "";
            return;
        }
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

setupRealtimeCheck("username", "http://localhost:8080/auth/check-username", "Username");

// Bắt buộc phone phải đúng 10 số, báo lỗi realtime
const phoneInput = document.getElementById("phone");
const phoneMsg = document.getElementById("phoneMsg");
phoneInput.addEventListener("input", function() {
    let value = phoneInput.value.replace(/\D/g, "");
    phoneInput.value = value;
    if (value.length !== 10) {
        phoneMsg.textContent = "❌ Phone must be exactly 10 digits!";
        phoneMsg.classList.remove("text-green-600");
        phoneMsg.classList.add("text-red-600");
    } else {
        phoneMsg.textContent = "";
        phoneMsg.classList.remove("text-red-600");
    }
});

setupRealtimeCheck("phone", "http://localhost:8080/auth/check-phone", "Phone");
setupRealtimeCheck("email", "http://localhost:8080/auth/check-email", "Email");

function checkFormValid() {
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();
    const termsChecked = termsCheckbox.checked;
    let valid = true;

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
        "username",
        "first-name",
        "last-name",
        "gender",
        "dob-day",
        "dob-month",
        "dob-year",
        "email",
        "phone",
        "password",
        "confirm-password"
    ];
    for (const id of requiredFields) {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            valid = false;
            break;
        }
    }

    // Kiểm tra ngày sinh hợp lệ
    valid = valid && validateDobRealtime();

    // Kiểm tra mật khẩu
    if (password.length < 8 || password !== confirmPassword) {
        valid = false;
    }

    // Kiểm tra tick điều khoản
    if (!termsChecked) {
        valid = false;
    }

    // Kiểm tra các thông báo lỗi realtime (username, phone, email)
    const usernameMsg = document.getElementById("usernameMsg");
    const phoneMsg = document.getElementById("phoneMsg");
    const emailMsg = document.getElementById("emailMsg");
    if ((usernameMsg && usernameMsg.textContent.includes("already exists")) ||
        (phoneMsg && phoneMsg.textContent.includes("already exists")) ||
        (emailMsg && emailMsg.textContent.includes("already exists"))) {
        valid = false;
    }

    registerBtn.disabled = !valid;
    if (!valid) {
        registerBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        registerBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
    // Ẩn thông báo tổng
    passwordError.textContent = "";
    passwordError.classList.add("hidden");
}

termsCheckbox.addEventListener("change", checkFormValid);

function validateConfirmPasswordRealtime() {
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();
    if (confirmPassword && password !== confirmPassword) {
        passwordError.textContent = "Invalid confirm password!";
        passwordError.classList.remove("hidden");
        registerBtn.disabled = true;
        registerBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        passwordError.textContent = "";
        passwordError.classList.add("hidden");
        checkFormValid();
    }
}

passwordInput.addEventListener("input", validateConfirmPasswordRealtime);
confirmInput.addEventListener("input", validateConfirmPasswordRealtime);
passwordInput.addEventListener("input", checkFormValid);
confirmInput.addEventListener("input", checkFormValid);

    // Đặt nút Create Account mặc định là disabled khi load trang
    const registerBtn = document.getElementById("registerBtn");
    registerBtn.disabled = true;
    registerBtn.classList.add("opacity-50", "cursor-not-allowed");

    // Đảm bảo checkFormValid được gọi khi bất kỳ trường nào thay đổi
    const allFields = [
        "username",
        "first-name",
        "last-name",
        "gender",
        "dob-day",
        "dob-month",
        "dob-year",
        "email",
        "phone",
        "password",
        "confirm-password"
    ];
    allFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", checkFormValid);
            el.addEventListener("change", checkFormValid);
        }
    });
    termsCheckbox.addEventListener("change", checkFormValid);

    // Gọi checkFormValid lần đầu để cập nhật trạng thái nút
    checkFormValid();
});
