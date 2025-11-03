document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get("page")) || 1;

    const userList = document.getElementById("userList");
    const pagination = document.getElementById("pagination");
    const addUserBtn = document.getElementById("addUserBtn");
    const backButton = document.getElementById("backButton");
    const logoutButton = document.getElementById("logoutButton");
    const homeButton = document.getElementById("homeBtn");
    const addUserModal = document.getElementById("addUserModal");
    const addUserForm = document.getElementById("addUserForm");
    const createUserBtn = document.getElementById("createUserBtn");
    const cancelAddUser = document.getElementById("cancelAddUser");

    const errorModal = document.getElementById("errorModal");
    const closeErrorModal = document.getElementById("closeErrorModal");
    const errorMessage = document.getElementById("errorMessage");

    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    // Кнопка выхода
    logoutButton.addEventListener("click", () => {
        fetch("/logout", { method: "POST" })
            .then(() => window.location.href = "/login");
    });

// Кнопка назад — возвращаемся на предыдущее меню
    backButton.addEventListener("click", () => {
        window.history.back();
    });

// Кнопка домой — переходим в главное меню без выхода
    homeButton.addEventListener("click", () => {
        window.location.href = "/main";
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

            const isCurrentUser = user.username === currentUser;

            li.innerHTML = `
        <div class="user-info">
            <strong>${user.username}</strong>
            <span>${user.role}</span>
        </div>
        <div class="user-actions">
            <button class="icon-button" title="Редактировать" onclick="editUser('${user.username}')">
                <img src="/web/static/icons/edit.png" alt="Редактировать">
            </button>
            <button class="icon-button ${isCurrentUser ? 'disabled' : ''}" title="Удалить"
                ${isCurrentUser ? 'disabled' : ''} onclick="${isCurrentUser ? '' : `deleteUser('${user.username}')`}">
                <img src="/web/static/icons/${isCurrentUser ? 'deleteUnable.png' : 'delete.png'}" alt="Удалить">
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

    // Показ модального окна
    addUserBtn.addEventListener("click", () => {
        addUserModal.style.display = "flex";
    });

    // Закрытие
    cancelAddUser.addEventListener("click", () => {
        addUserModal.style.display = "none";
        addUserForm.reset();
        createUserBtn.disabled = true;
    });

// Валидация формы
    addUserForm.addEventListener("input", () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const roleSelected = addUserForm.querySelector('input[name="role"]:checked');
        createUserBtn.disabled = !(username && password && roleSelected);
    });

// Отправка формы
    addUserForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = addUserForm.querySelector('input[name="role"]:checked').value;

        try {
            const headers = {
                "Content-Type": "application/json",
                [header]: token  // добавление CSRF-заголовка
            };

            const response = await fetch("/users/add", {
                method: "POST",
                headers,
                body: JSON.stringify({ username, password, role }),
                credentials: "same-origin"  // <--- обязательно!
            });

            if (response.ok) {
                addUserModal.style.display = "none";
                addUserForm.reset();
                createUserBtn.disabled = true;
                location.reload(); // обновляем список пользователей
            } else if (response.status === 409) { // конфликт (уже существует)
                showErrorModal("Пользователь уже существует");
            } else {
                showErrorModal("Ошибка при создании пользователя");
            }
        } catch (err) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

// Ошибка — показать
    function showErrorModal(message) {
        errorMessage.textContent = message;
        errorModal.style.display = "flex";
    }

// Ошибка — закрыть
    closeErrorModal.addEventListener("click", () => {
        errorModal.style.display = "none";
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
