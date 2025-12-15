const errorModal = document.getElementById("errorModal");
const closeErrorModal = document.getElementById("closeErrorModal");
const closeSuccessModal = document.getElementById("closeSuccessModal");
const errorMessage = document.getElementById("errorMessage");
const userList = document.getElementById("userList");
const pagination = document.getElementById("pagination");
const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

let roleFilterState = new Set();
let currentPageGlobal = 1;

const ROLES = [
    { value: "ADMIN", label: "Администратор ИБ" },
    { value: "AUDITOR", label: "Аудитор" },
    { value: "USER", label: "Пользователь" }
];
const roleFilterBtn = document.getElementById("roleFilterBtn");
const roleFilterPopup = document.getElementById("roleFilterPopup");
const roleFilterOptions = document.getElementById("roleFilterOptions");
const roleFilterActiveIcon = document.getElementById("roleFilterActiveIcon");

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
                showSuccessModal("Пользователь успешно создан");
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
                showSuccessModal("Пользователь успешно отредактирован");
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
                showSuccessModal("Пользователь успешно удален");
                await render(1); // <-- заново отрисовываем первую страницу
            } else if (response.status === 403) {
                showErrorModal("Нельзя удалить самого себя");
            } else if (response.status === 404) {
                showErrorModal("Пользователь не найден");
            } else {
                showErrorModal("Ошибка при удалении пользователя");
            }
        } catch (err) {
            showErrorModal("Ошибка соединения с сервером");
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
        const params = new URLSearchParams();
        params.set("page", page);

        // добавляем фильтр ролей
        roleFilterState.forEach(role => {
            params.append("roles", role);
        });

        const response = await fetch(`/users/list?${params.toString()}`);
        if (!response.ok) throw new Error("Ошибка при загрузке данных");

        return await response.json();
    } catch (e) {
        console.error("Ошибка запроса:", e);
        return { users: [], totalPages: 1, page: 1 };
    }
}

async function render(page = 1) {
    currentPageGlobal = page;

    const data = await fetchUsers(page);
    userList.innerHTML = "";
    pagination.innerHTML = "";

    if (!data.users.length) {
        userList.innerHTML = `
            <li style="text-align:center; margin-top:1rem;">
                Нет пользователей, подходящих под условия фильтра
            </li>`;
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
                <button class="icon-button" title="Редактировать">
                    <img src="/web/static/icons/edit.png" alt="Редактировать">
                </button>
                <button class="icon-button ${isCurrentUser ? 'disabled' : ''}"
                        title="Удалить"
                        ${isCurrentUser ? 'disabled' : ''}>
                    <img src="/web/static/icons/${isCurrentUser ? 'deleteUnable.png' : 'delete.png'}"
                         alt="Удалить">
                </button>
            </div>
        `;

        li.querySelector(".user-actions button:first-child")
            .addEventListener("click", () => editUser(user.username));

        const deleteBtn = li.querySelector(".user-actions button:last-child");
        if (!isCurrentUser) {
            deleteBtn.addEventListener("click", () => deleteUser(user.username));
        }

        userList.appendChild(li);
    });

    userList.style.overflowY = data.totalPages > 1 ? "hidden" : "auto";

    renderPagination(data.page, data.totalPages);
}


function renderPagination(currentPage, totalPages) {
    const box = pagination;
    box.innerHTML = "";

    if (totalPages <= 1) return;

    const maxVisible = 5;

    if (currentPage > 1) box.appendChild(pageBtn("←", () => render(currentPage - 1)));

    let start = 1;
    let end = totalPages;

    if (totalPages > maxVisible) {
        start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = end - maxVisible + 1;
        }
    }

    if (start > 1) {
        box.appendChild(pageBtn(1, () => render(1)));
        if (start > 2) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.style.cursor = "pointer";
            dots.onclick = () => render(Math.max(1, start - Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
    }

    for (let i = start; i <= end; i++) {
        const btn = pageBtn(i, () => render(i));
        if (i === currentPage) btn.classList.add("active");
        box.appendChild(btn);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.style.cursor = "pointer";
            dots.onclick = () => render(Math.min(totalPages, end + Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
        box.appendChild(pageBtn(totalPages, () => render(totalPages)));
    }

    if (currentPage < totalPages) box.appendChild(pageBtn("→", () => render(currentPage + 1)));
}

function pageBtn(text, handler) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = text;
    btn.addEventListener("click", handler);
    return btn;
}


async function loadUser(username) {
    const resp = await fetch(`/users/get/${encodeURIComponent(username)}`);
    if (!resp.ok) return null;
    return await resp.json();
}

// Успех — показать
function showSuccessModal(message) {
    let successMessage = document.getElementById("successMessage");
    successMessage.textContent = message;
    successModal.style.display = "flex";
}

// Ошибка — закрыть
closeSuccessModal.addEventListener("click", () => {
    successModal.style.display = "none";
});

roleFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // закрываем другие попапы если будут
    document.querySelectorAll(".filter-popup").forEach(p => {
        if (p !== roleFilterPopup) p.style.display = "none";
    });

    roleFilterPopup.style.display =
        roleFilterPopup.style.display === "block" ? "none" : "block";
});

roleFilterPopup.addEventListener("click", (e) => {
    e.stopPropagation();
});

function renderRoleFilterOptions() {
    roleFilterOptions.innerHTML = "";

    ROLES.forEach(role => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = role.value;
        checkbox.checked = roleFilterState.has(role.value);

        checkbox.addEventListener("change", () => {
            checkbox.checked
                ? roleFilterState.add(role.value)
                : roleFilterState.delete(role.value);
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(role.label));

        roleFilterOptions.appendChild(label);
    });
}

renderRoleFilterOptions();

document.getElementById("applyRoleFilter").addEventListener("click", () => {
    roleFilterPopup.style.display = "none";

    roleFilterActiveIcon.style.display =
        roleFilterState.size ? "inline" : "none";

    render(1); // ВСЕГДА начинаем с первой страницы
});

document.getElementById("cancelRoleFilter").addEventListener("click", () => {
    roleFilterPopup.style.display = "none";
});

document.addEventListener("click", () => {
    roleFilterPopup.style.display = "none";
});



