const logoutButton = document.getElementById("logoutButton");
const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("backButton");
    const logoutButton = document.getElementById("logoutButton");

    // Кнопка назад — возвращаемся на предыдущее меню
    backButton.addEventListener("click", () => {
        window.history.back();
    });

    // Кнопка выхода
    logoutButton.addEventListener('click', () => {
        if (confirm("Вы действительно хотите завершить сеанс?")) {

            fetch('/logout', {
                method: 'POST',
                headers: {
                    [header]: token
                }
            })
                .then(() => window.location.href = '/login?logout=true');
        }
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
    });

});