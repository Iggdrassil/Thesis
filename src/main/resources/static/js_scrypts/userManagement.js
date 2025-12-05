const errorModal = document.getElementById("errorModal");
const closeErrorModal = document.getElementById("closeErrorModal");
const errorMessage = document.getElementById("errorMessage");
const userList = document.getElementById("userList");
const pagination = document.getElementById("pagination");
const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get("page")) || 1;

    const addUserBtn = document.getElementById("addUserBtn");
    const backButton = document.getElementById("backButton");
    const logoutButton = document.getElementById("logoutButton");
    const homeButton = document.getElementById("homeBtn");
    const addUserModal = document.getElementById("addUserModal");
    const addUserForm = document.getElementById("addUserForm");
    const createUserBtn = document.getElementById("createUserBtn");
    const cancelAddUser = document.getElementById("cancelAddUser");

    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');


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

// Кнопка назад — возвращаемся на предыдущее меню
    backButton.addEventListener("click", () => {
        window.location.href = "/settings";
    });

// Кнопка домой — переходим в главное меню без выхода
    homeButton.addEventListener("click", () => {
        window.location.href = "/main";
    });

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
                await render(1); // <-- заново отрисовываем первую страницу

        } else if (response.status === 409) { // конфликт (уже существует)
                showErrorModal("Пользователь уже существует");
            } else {
                showErrorModal("Ошибка при создании пользователя");
            }
        } catch (err) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

    render(currentPage);
});

async function editUser(username) {
    const editModal = document.getElementById("editUserModal");
    const editUsername = document.getElementById("editUsername");
    const editPassword = document.getElementById("editPassword");
    const editForm = document.getElementById("editUserForm");
    const applyBtn = document.getElementById("applyEditUser");

    // загрузить данные одного пользователя
    let user;
    try {
        const resp = await fetch(`/users/get/${encodeURIComponent(username)}`);

        if (!resp.ok) {
            if (resp.status === 404) {
                showErrorModal("Пользователь не найден");
            } else {
                showErrorModal("Ошибка при загрузке данных пользователя");
            }
            return;
        }

        user = await resp.json();
    } catch (err) {
        showErrorModal("Ошибка соединения с сервером");
        return;
    }

    // Заполнить форму
    editUsername.value = user.username;
    editPassword.value = "";

    // маппинг локализованных ролей в значения радио-кнопок
    const roleMap = {
        "Администратор ИБ": "ADMIN",
        "Аудитор": "AUDITOR",
        "Пользователь": "USER"
    };

    const mappedRole = roleMap[user.role];
    console.log("role from backend:", user.role);

    document.querySelector(`input[name="editRole"][value="${mappedRole}"]`).checked = true;
    //document.querySelector(`input[name="editRole"][value="${user.role}"]`).checked = true;

    // Открыть модалку
    editModal.style.display = "flex";

    // Удаляем старый обработчик
    const newApplyBtn = applyBtn.cloneNode(true);
    applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);

    newApplyBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const newName = editUsername.value.trim();
        const newPass = editPassword.value.trim();
        const newRole = document.querySelector('input[name="editRole"]:checked').value;

        const body = {
            oldUsername: username,
            newUsername: newName,
            newPassword: newPass || null,
            newRole: newRole
        };

        try {
            const response = await fetch("/users/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    [header]: token
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                editModal.style.display = "none";
                await render(1);
            }
            else if (response.status === 409) {
                showErrorModal("Имя пользователя уже существует");
            }
            else {
                showErrorModal("Ошибка при редактировании пользователя");
            }
        } catch (err) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

    // Закрытие модалки
    document.getElementById("cancelEditUser").onclick = () => {
        editModal.style.display = "none";
    };
    document.getElementById("closeEditModal").onclick = () => {
        editModal.style.display = "none";
    };
}

function deleteUser(username) {
    const confirmDeleteModal = document.getElementById("confirmDeleteModal");
    const deleteTitle = document.getElementById("deleteTitle");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const closeDeleteModal = document.getElementById("closeDeleteModal");

    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    deleteTitle.textContent = `Удалить пользователя "${username}"?`;
    confirmDeleteModal.style.display = "flex";

    // Очистим старые обработчики, если модалка открывалась ранее
    const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
    confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);

    // Подтверждение удаления
    newConfirmBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`/users/delete/${encodeURIComponent(username)}`, {
                method: "DELETE",
                headers: {
                    [header]: token
                },
                credentials: "same-origin"
            });

            if (response.ok) {
                confirmDeleteModal.style.display = "none";
                await render(1); // <-- заново отрисовываем первую страницу
            } else if (response.status === 403) {
                showErrorModal("Нельзя удалить самого себя");
            } else if (response.status === 404) {
                alert("Пользователь не найден");
            } else {
                alert("Ошибка при удалении пользователя");
            }
        } catch (err) {
            alert("Ошибка соединения с сервером");
        }
    });

    // Отмена
    cancelDeleteBtn.addEventListener("click", () => {
        confirmDeleteModal.style.display = "none";
    });

    // Крестик
    closeDeleteModal.addEventListener("click", () => {
        confirmDeleteModal.style.display = "none";
    });
}

// Ошибка — показать
function showErrorModal(message) {
    let errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorModal.style.display = "flex";
}

// Ошибка — закрыть
closeErrorModal.addEventListener("click", () => {
    errorModal.style.display = "none";
});

async function fetchUsers(page) {
    try {
        const response = await fetch(`/users/list?page=${page}`);
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
            <button class="icon-button ${isCurrentUser ? 'disabled' : ''}" title="Удалить" onclick="deleteUser('${user.username}')"
                ${isCurrentUser ? 'disabled' : ''} onclick="${isCurrentUser ? '' : `deleteUser('${user.username}')`}">
                <img src="/web/static/icons/${isCurrentUser ? 'deleteUnable.png' : 'delete.png'}" alt="Удалить">
            </button>
        </div>
    `;

        userList.appendChild(li);
    });

    // скрываем скролл при пагинации
    userList.style.overflowY = data.totalPages > 1 ? "hidden" : "auto";

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

async function loadUser(username) {
    const resp = await fetch(`/users/get/${encodeURIComponent(username)}`);
    if (!resp.ok) return null;
    return await resp.json();
}

