document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get("page")) || 1;

    const userList = document.getElementById("userList");
    const pagination = document.getElementById("pagination");
    const addUserBtn = document.getElementById("addUserBtn");
    const backButton = document.getElementById("backButton");
    const logoutButton = document.getElementById("logoutButton");
    const homeButton = document.getElementById("homeBtn");

    // Кнопка выхода
    logoutButton.addEventListener("click", () => {
        fetch("/logout", { method: "POST" })
            .then(() => window.location.href = "/login");
    });

    // Кнопка назад — возвращаемся на предыдущее меню
    backButton.addEventListener("click", () => {
        window.history.back();
    });

    // Кнопка домой — возвращаемся сразу в главное меню
    homeButton.addEventListener("click", () => {
        fetch("/logout", { method: "GET" })
            .then(() => window.location.href = "/main");
    });

    async function fetchUsers(page) {
        try {
            const response = await fetch(`/users/api?page=${page}`);
            if (!response.ok) throw new Error("Ошибка при загрузке данных");
            return await response.json();
        } catch (e) {
            console.error("Ошибка запроса:", e);
            return { users: [], totalPages: 1, page: 1 };
        }
    }

    async function render(page) {
        const data = await fetchUsers(page);
        userList.innerHTML = "";
        pagination.innerHTML = "";

        if (!data.users.length) {
            userList.innerHTML = `<li style="text-align:center; margin-top:1rem;">Нет пользователей</li>`;
            return;
        }

        data.users.forEach(user => {
            const li = document.createElement("li");
            li.classList.add("user-item");
            li.innerHTML = `
            <div class="user-info">
                <strong>${user.username}</strong>
                <span>${user.role}</span>
            </div>
            <div class="user-actions">
            <button class="icon-button" title="Редактировать" onclick="editUser('${user.username}')">
                <img src="/web/static/icons/edit.png" alt="Редактировать">
            </button>
            <button class="icon-button" title="Удалить" ${user.username === 'admin' ? 'disabled' : ''} onclick="deleteUser('${user.username}')">
                <img src="/web/static/icons/${user.username === 'admin' ? 'deleteUnable.png' : 'delete.png'}" alt="Удалить">
            </button>
  </div>
`;

            userList.appendChild(li);
        });

        // пагинация
        for (let i = 1; i <= data.totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.classList.add("page-btn");
            if (i === data.page) btn.classList.add("active");
            btn.addEventListener("click", () => {
                window.location.href = `/users?page=${i}`;
            });
            pagination.appendChild(btn);
        }
    }

    addUserBtn.addEventListener("click", () => {
        alert("Добавление нового пользователя (реализуется позже)");
    });

    render(currentPage);
});

// Примеры заглушек функций (позже можно заменить модалками или запросами)
function editUser(username) {
    alert(`Редактирование пользователя: ${username}`);
}

function deleteUser(username) {
    if (confirm(`Удалить пользователя "${username}"?`)) {
        alert("Пользователь удалён (реализуется позже)");
    }
}
