document.addEventListener("DOMContentLoaded", function () {
    const togglePassword = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");

    togglePassword.addEventListener("click", function () {
        const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
        passwordField.setAttribute("type", type);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const blockedMessage = document.getElementById("blockedMessage");
    const loginButton = document.getElementById("loginButton");

    // Если блокировка активна
    if (blockedMessage) {
        // Берём число секунд из параметра ?blocked=N
        const params = new URLSearchParams(window.location.search);
        const seconds = parseInt(params.get("blocked"), 10);

        // Блокируем кнопку
        loginButton.disabled = true;

        // Через N секунд убираем блокировку без перезагрузки
        setTimeout(() => {
            blockedMessage.style.display = "none";
            loginButton.disabled = false;
        }, seconds * 1000);
    }
});
