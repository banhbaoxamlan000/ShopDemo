document.addEventListener("DOMContentLoaded", function () {
  // Khi vào trang này, luôn ghi đè flow thành 'forgot-password'
  localStorage.setItem("flow", "forgot-password");

  const form = document.getElementById("forgotPasswordForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    fetch("http://localhost:8080/users/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: "",
        email: email
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to send code. Status: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        if (data.code === 1) {
          localStorage.setItem("resetEmail", email);
          localStorage.setItem("flow", "forgot-password");
          // Điều hướng sang trang nhập code
          window.location.href = "verify-code.html";
        } else {
          alert("Error: " + (data.message || "Unable to process request."));
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error.message);
      });
  });
});
