document.addEventListener("DOMContentLoaded", function () {
    const togglePassword = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");

    togglePassword.addEventListener("click", function () {
        const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
        passwordField.setAttribute("type", type);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".login-form");
    const blockedMessage = document.getElementById("blockedMessage");
    const loginButton = document.getElementById("loginButton");

    let unblockTimer = null;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        blockedMessage.style.display = "none";

        const formData = new FormData(form);

        const response = await fetch(form.action, {
            method: "POST",
            body: formData
        });

        // 🔒 Пользователь заблокирован
        if (response.status === 423) {
            const data = await response.json();
            let seconds = data.seconds;

            blockedMessage.textContent =
                `Вход заблокирован на ${seconds} секунд`;
            blockedMessage.style.display = "block";
            loginButton.disabled = true;

            if (unblockTimer) clearInterval(unblockTimer);

            unblockTimer = setInterval(() => {
                seconds--;

                if (seconds <= 0) {
                    blockedMessage.style.display = "none";
                    loginButton.disabled = false;
                    clearInterval(unblockTimer);
                } else {
                    blockedMessage.textContent =
                        `Вход заблокирован на ${seconds} секунд`;
                }
            }, 1000);

            return;
        }

        // ❌ обычная ошибка логина → пусть Spring делает redirect
        if (response.redirected) {
            window.location.href = response.url;
        }
    });
});

