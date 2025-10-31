document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("backButton");
    const logoutButton = document.getElementById("logoutButton");

    // Кнопка назад — возвращаемся на предыдущее меню
    backButton.addEventListener("click", () => {
        window.history.back();
    });

    // Кнопка выхода
    logoutButton.addEventListener("click", () => {
        fetch("/logout", { method: "POST" })
            .then(() => window.location.href = "/login");
    });
});