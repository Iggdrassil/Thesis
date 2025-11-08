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

    document.querySelector("#usersCard").addEventListener("click", () => {
        try {
            const response = fetch(`/users/list?page=1`);
            if (!response.ok) throw new Error("Ошибка при загрузке данных");
            return response.json();
        } catch (e) {
            console.error("Ошибка запроса:", e);
            return { users: [], totalPages: 1, page: 1 };
        }
        /*window.location.href = "userManagement.html?page=1";*/
    });

});