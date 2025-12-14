// --- элементы ---
const addIncidentBtn = document.getElementById("addIncidentBtn");
const modal = document.getElementById("incidentModal");
const recsModal = document.getElementById("recsModal");
const incidentCloseBtn = document.getElementById("incidentCloseBtn");
const recsCloseBtn = document.getElementById("recsCloseBtn");
const recsDoneBtn = document.getElementById("recsDoneBtn");
const cancelIncidentBtn = document.getElementById("cancelIncidentBtn");
const backButton = document.getElementById("backButton");
const logoutButton = document.getElementById("logoutButton");
const successModal = document.getElementById("successModal");
const closeSuccessModal = document.getElementById("closeSuccessModal");

const createButton = document.getElementById("createIncidentBtn");
const titleInput = document.getElementById("incidentTitle");
const descInput = document.getElementById("incidentDescription");
const categorySelect = document.getElementById("incidentCategory");
const levelSelect = document.getElementById("incidentLevel");
const recsList = document.getElementById("recsList");
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const viewIncidentModal = document.getElementById("viewIncidentModal");
const viewIncidentCloseBtn = document.getElementById("viewIncidentCloseBtn");

const incidentShieldIcon = document.getElementById("incidentShieldIcon");
const incidentViewTitle = document.getElementById("incidentViewTitle");
const incidentCreated = document.getElementById("incidentCreated");
const incidentUpdated = document.getElementById("incidentUpdated");
const incidentAuthor = document.getElementById("incidentAuthor");
const incidentDesc = document.getElementById("incidentDesc");
const incidentCategoryView = document.getElementById("incidentCategoryView");

const recShort = document.getElementById("incidentRecsShort");
const recFull = document.getElementById("incidentRecsFull");
const showAllRecsBtn = document.getElementById("showAllRecsBtn");

const editModal = document.getElementById("editIncidentModal");
const editIncidentCloseBtn = document.getElementById("editIncidentCloseBtn");
const cancelIncidentEditBtn = document.getElementById("cancelIncidentEditBtn");
const saveIncidentEditBtn = document.getElementById("saveIncidentEditBtn");
const editChooseRecsBtn = document.getElementById("editChooseRecsBtn");

const editTitleInput = document.getElementById("editIncidentTitle");
const editDescInput = document.getElementById("editIncidentDescription");
const editCategorySelect = document.getElementById("editIncidentCategory");
const editLevelSelect = document.getElementById("editIncidentLevel");
const list = document.getElementById("incidentList");

const PAGE_SIZE = 5;

const noIncidents = document.getElementById("noIncidents");

const role = document.body.dataset.role; // Thymeleaf вставит значение из сессии

let editIncidentId = null;
let currentDeleteId = null;
let editSelectedRecommendations = [];
let selectedRecommendations = [];
let selectedLevelFilters = [];     // выбранные уровни
let allLoadedIncidents = [];       // все инциденты текущей страницы
let allIncidents = [];       // все инциденты, загруженные с сервера
let filteredIncidents = [];  // результат фильтрации
let currentIncidentPage = 1;
let selectedCategoryFilters = []; // выбранные категории
let incidentTextFilter = ""; // текст фильтра по названию

const levelFilterBtn = document.getElementById("levelFilterBtn");
const levelFilterPopup = document.getElementById("levelFilterPopup");
const applyLevelFilterBtn = document.getElementById("applyLevelFilter");
const cancelLevelFilterBtn = document.getElementById("cancelLevelFilter");
const categoryFilterBtn = document.getElementById("categoryFilterBtn");
const categoryFilterPopup = document.getElementById("categoryFilterPopup");
const applyCategoryFilterBtn = document.getElementById("applyCategoryFilter");
const cancelCategoryFilterBtn = document.getElementById("cancelCategoryFilter");
const incidentTextFilterBtn = document.getElementById("incidentTextFilterBtn");
const incidentTextFilterPopup = document.getElementById("incidentTextFilterPopup");
const incidentTextFilterInput = document.getElementById("incidentTextFilterInput");
const applyIncidentTextFilterBtn = document.getElementById("applyIncidentTextFilter");
const cancelIncidentTextFilterBtn = document.getElementById("cancelIncidentTextFilter");


// --- события открытия/закрытия ---
document.addEventListener("DOMContentLoaded", () => {

    // кнопки навигации уже есть в твоём файле — не трогаем
    addIncidentBtn.addEventListener("click", openIncidentModal);
    incidentCloseBtn?.addEventListener("click", closeIncidentModal);
    cancelIncidentBtn?.addEventListener("click", closeIncidentModal);
    viewIncidentCloseBtn.addEventListener("click", closeViewIncidentModal);

    chooseRecsBtn?.addEventListener("click", openRecsModal);
    recsCloseBtn?.addEventListener("click", closeRecsModal);
    recsDoneBtn?.addEventListener("click", closeRecsModal);

    // валидация формы
    titleInput.addEventListener("input", validateForm);
    categorySelect.addEventListener("change", validateForm);
    levelSelect.addEventListener("change", validateForm);

    // кнопка создания
    createButton.addEventListener("click", submitCreateIncident);

    // загрузить словарики
    loadDictionaries();
});

// --- открытие/закрытие модалок ---
function openIncidentModal() {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    // Сброс формы
    titleInput.value = "";
    descInput.value = "";
    categorySelect.value = "";
    levelSelect.value = "";

    // Сбрасываем выбранные рекомендации
    selectedRecommendations = [];

    // Снимаем галки со всех чекбоксов
    document.querySelectorAll("#recsList input[type='checkbox']").forEach(cb => cb.checked = false);

    // Переключаем кнопку создания
    validateForm();
}

function closeIncidentModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    // сброс формы
    titleInput.value = "";
    descInput.value = "";
    categorySelect.value = "";
    levelSelect.value = "";
    selectedRecommendations = [];
    // выключаем кнопку
    validateForm();
}

function openRecsModal() {
    recsModal.style.display = "flex";
    recsModal.setAttribute("aria-hidden", "false");
}

function closeRecsModal() {
    recsModal.style.display = "none";
    recsModal.setAttribute("aria-hidden", "true");
}

// --- загрузка словарей из бекенда ---
async function loadDictionaries() {
    try {
        // категории
        const catResp = await fetch("/incidents/categories");
        const categories = await catResp.json(); // array of { value,label }
        categorySelect.innerHTML = `<option value="">Выберите категорию</option>`;
        categories.forEach(c => {
            // если сервер возвращает {name,label} или {value,label} — подстрахуемся:
            const val = c.value ?? c.name ?? c;
            const label = c.label ?? c.localizedValue ?? c.name ?? c;
            categorySelect.add(new Option(label, val));
            editCategorySelect.add(new Option(label, val));
        });

        // уровни
        const lvlResp = await fetch("/incidents/levels");
        const levels = await lvlResp.json();
        levelSelect.innerHTML = `<option value="">Выберите уровень важности</option>`;
        levels.forEach(l => {
            const val = l.value ?? l.name ?? l;
            const label = l.label ?? l.localizedValue ?? l.name ?? l;
            levelSelect.add(new Option(label, val));
            editLevelSelect.add(new Option(label, val));
        });

        // рекомендации
        const recResp = await fetch("/incidents/recommendations");
        const recs = await recResp.json();
        recsList.innerHTML = "";
        recs.forEach(r => {
            const val = r.value ?? r.name ?? r;
            const label = r.label ?? r.localizedValue ?? r.name ?? r;
            const id = `rec_${val}`;
            recsList.insertAdjacentHTML('beforeend', `
                <label for="${id}" style="display:flex; gap:10px; align-items:flex-start;">
                    <input id="${id}" type="checkbox" value="${val}" onchange="toggleRecommendationCb(this)">
                    <span>${label}</span>
                </label>
            `);
        });

        // уровни для фильтра
        const levelFilterOptions = document.getElementById("levelFilterOptions");
        levelFilterOptions.innerHTML = "";

        levels.forEach(l => {
            const val = l.value ?? l.name;
            const label = l.label ?? l.localizedValue ?? val;

            levelFilterOptions.insertAdjacentHTML("beforeend", `
        <label>
            <input type="checkbox" value="${val}">
            <span>${label}</span>
        </label>
    `);
        });

        // категории для фильтра
        const categoryFilterOptions = document.getElementById("categoryFilterOptions");
        categoryFilterOptions.innerHTML = "";

        categories.forEach(c => {
            const val = c.value ?? c.name ?? c;
            const label = c.label ?? c.localizedValue ?? c.name ?? c;

            categoryFilterOptions.insertAdjacentHTML("beforeend", `
        <label>
            <input type="checkbox" value="${val}">
            <span>${label}</span>
        </label>
    `);
        });



    } catch (err) {
        console.error("Ошибка загрузки справочников:", err);
    }
}

// утилита для чекбоксов (вызывается из onChange)
function toggleRecommendationCb(cb) {
    const v = cb.value;
    if (cb.checked) {
        if (!selectedRecommendations.includes(v)) selectedRecommendations.push(v);
    } else {
        selectedRecommendations = selectedRecommendations.filter(x => x !== v);
    }
    // не нужно непосредственно менять createButton — рекомендации не обязательны
}

// --- валидация формы ---
function validateForm() {
    const ok = titleInput.value.trim() !== "" && categorySelect.value !== "" && levelSelect.value !== "";
    createButton.disabled = !ok;
}

// --- отправка запроса создания ---
async function submitCreateIncident() {
    if (createButton.disabled) return;

    const body = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        author: document.getElementById("currentUserLogin") ? document.getElementById("currentUserLogin").value : null,
        category: categorySelect.value,   // отправляем enum name (value)
        level: levelSelect.value,         // отправляем enum name
        recommendations: selectedRecommendations
    };

    try {
        const headers = {
            "Content-Type": "application/json",
            [header]: token  // добавление CSRF-заголовка
        };
        const resp = await fetch("/incidents/add", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            credentials: "same-origin"
        });

        if (resp.status === 400) {
            // показать модальное сообщение об ошибке
            showErrorModal("Инцидент с таким названием уже существует");
            return;
        }
        if (!resp.ok) {
            showErrorModal("Ошибка при создании инцидента");
            return;
        }

        // сброс выбранных рекомендаций **непосредственно после успешного создания**
        selectedRecommendations = [];
        showSuccessModal("Инцидент успешно создан");
        closeIncidentModal();
        await loadIncidents(currentIncidentPage);

    } catch (e) {
        console.error(e);
        showErrorModal("Ошибка сети");
    }
}

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
    window.location.href = "/main";
});

function openViewIncidentModal(incident) {
    // Заголовок + иконка
    incidentViewTitle.textContent = incident.title;

    if (incident.level === "HIGH")
        incidentShieldIcon.src = "/web/static/icons/lvlHigh.png";
    else if (incident.level === "MEDIUM")
        incidentShieldIcon.src = "/web/static/icons/lvlMed.png";
    else
        incidentShieldIcon.src = "/web/static/icons/lvlLow.png";

    const creationDate = incident.creationDate
        ? incident.creationDate.replace('T', ' ').split('.')[0] // <--- форматирование даты
        : "";

    const updatedDate = incident.updatedDate
        ? incident.updatedDate.replace('T', ' ').split('.')[0] // <--- форматирование даты
        : "";

    // Простые поля
    incidentCreated.textContent = creationDate;
    incidentUpdated.textContent = updatedDate ?? "—";
    incidentAuthor.textContent = incident.author;
    incidentDesc.textContent = incident.description ?? "—";
    incidentCategoryView.textContent = incident.categoryLocalized ?? "—";

    // Рекомендации — первые 5
    recShort.innerHTML = "";
    recFull.innerHTML = "";

    if (incident.recommendationsLocalized && incident.recommendationsLocalized.length > 0) {
        const arr = incident.recommendationsLocalized;

        arr.slice(0, 5).forEach(r => {
            recShort.insertAdjacentHTML("beforeend", `<li>${r}</li>`);
        });

        if (arr.length > 5) {
            showAllRecsBtn.style.display = "inline";
            recFull.innerHTML = arr.slice(5).map(r => `<li>${r}</li>`).join("");
        } else {
            showAllRecsBtn.style.display = "none";
        }
    }

    viewIncidentModal.style.display = "flex";
    viewIncidentModal.setAttribute("aria-hidden", "false");
}

function closeViewIncidentModal() {
    viewIncidentModal.style.display = "none";
    viewIncidentModal.setAttribute("aria-hidden", "true");
}

showAllRecsBtn.addEventListener("click", () => {
    recFull.style.display = recFull.style.display === "none" ? "block" : "none";
    showAllRecsBtn.textContent =
        recFull.style.display === "none"
            ? "Показать остальные рекомедации"
            : "Скрыть";
});

async function viewIncident(id) {
    try {
        const resp = await fetch(`/incidents/${id}`);
        if (!resp.ok) {
            showErrorModal("Не удалось загрузить инцидент");
            return;
        }

        const data = await resp.json();

        // структура ожидается такая:
        // {
        //   id, title, description, author,
        //   creationDate, updateDate,
        //   category,
        //   level,   // HIGH / MEDIUM / LOW
        //   recommendations: ["...", "..."]
        // }

        openViewIncidentModal(data);

    } catch (e) {
        console.error(e);
        showErrorModal("Ошибка сети");
    }
}

// --- делегированный обработчик кликов по списку инцидентов ---
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".incident-list");
    if (!list) return;

    list.addEventListener("click", (event) => {

        // если кликнули по edit-btn
        if (event.target.closest(".edit-btn")) {
            event.stopPropagation();
            const id = event.target.closest(".edit-btn").dataset.id;
            openEditIncident(id);
            return;
        }

        // если кликнули по delete-btn
        if (event.target.closest(".delete-btn")) {
            event.stopPropagation();

            const btn = event.target.closest(".delete-btn");
            const incidentItem = btn.closest(".incident-item"); // карточка инцидента
            const id = btn.dataset.id;
            const title = incidentItem.querySelector(".incident-info strong").textContent;

            console.log("ID:", id);
            console.log("Title:", title);

            openDeleteIncident(id, title); // можно передать и title
            return;
        }

        // если кликнули по .incident-item
        const item = event.target.closest(".incident-item");
        if (item) {
            const id = item.dataset.id;
            if (id) viewIncident(id);
        }
    });
});

// ------------------------------
// МОДАЛКА РЕДАКТИРОВАНИЯ
// -----------------------------

// открыть модалку
function openEditIncidentModal() {
    editModal.style.display = "flex";
    editModal.setAttribute("aria-hidden", "false");
}

// закрыть модалку
function closeEditIncidentModal() {
    editModal.style.display = "none";
    editModal.setAttribute("aria-hidden", "true");

    editIncidentId = null;
    editTitleInput.value = "";
    editDescInput.value = "";
    editCategorySelect.value = "";
    editLevelSelect.value = "";
    editSelectedRecommendations = [];
}

// кнопки закрытия
editIncidentCloseBtn.addEventListener("click", closeEditIncidentModal);
cancelIncidentEditBtn.addEventListener("click", closeEditIncidentModal);

// открыть рекомендаций в режиме редактирования
editChooseRecsBtn.addEventListener("click", () => {
    // перед открытием ставим галки выбранных рекомендаций
    document.querySelectorAll("#recsList input[type='checkbox']").forEach(cb => {
        cb.checked = editSelectedRecommendations.includes(cb.value);
    });
    openRecsModal();
});

recsDoneBtn.addEventListener("click", () => {
    // обновляем editSelectedRecommendations
    editSelectedRecommendations =
        Array.from(document.querySelectorAll("#recsList input[type='checkbox']:checked"))
            .map(cb => cb.value);

    closeRecsModal();
});

// ------------------------------
// ОТКРЫТИЕ РЕДАКТИРОВАНИЯ
// ------------------------------

async function openEditIncident(id) {
    try {
        // дождаться загрузки словарей (если ещё не загрузились)

        await loadDictionaries;

        const resp = await fetch(`/incidents/${id}`);
        if (!resp.ok) {
            showErrorModal("Не удалось загрузить данные инцидента");
            return;
        }

        const data = await resp.json();
        editIncidentId = id;

        // заполняем поля
        editTitleInput.value = data.title;
        editDescInput.value = data.description ?? "";


        // Присваиваем селектам value — опция уже должна существовать после loadDictionaries()
        editCategorySelect.value = data.category ?? "";
        editLevelSelect.value = data.level ?? "";

        // рекомендации — backend возвращает (например) ["ANALYZE_LOGS", ...]
        editSelectedRecommendations = data.recommendations ? [...data.recommendations] : [];

        // Отметим чекбоксы в #recsList (если они есть)
        document.querySelectorAll("#recsList input[type='checkbox']").forEach(cb => {
            cb.checked = editSelectedRecommendations.includes(cb.value);
        });

        openEditIncidentModal();

    } catch (e) {
        console.error(e);
        showErrorModal("Ошибка сети");
    }
}

// ------------------------------
// ------------------------------
// СОХРАНЕНИЕ РЕДАКТИРОВАНИЯ
// ------------------------------

saveIncidentEditBtn.addEventListener("click", () => submitEditIncident());

async function submitEditIncident() {
    if (!editIncidentId) return;

    const body = {
        description: editDescInput.value.trim(),
        category: editCategorySelect.value,
        level: editLevelSelect.value,
        recommendations: editSelectedRecommendations
    };

    try {
        const headers = {
            "Content-Type": "application/json",
            [header]: token
        };

        const resp = await fetch(`/incidents/edit/${editIncidentId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
            credentials: "same-origin"
        });

        if (!resp.ok) {
            showErrorModal("Не удалось сохранить изменения");
            return;
        }
        showSuccessModal("Инцидент успешно отредактирован");
        closeEditIncidentModal();
        await loadIncidents(currentIncidentPage);

    } catch (e) {
        console.error(e);
        showErrorModal("Ошибка сети");
    }
}

function openDeleteIncident(id, name) {
    currentDeleteId = id;
    const modal = document.getElementById("deleteIncidentModal");
    const title = document.getElementById("deleteIncidentTitle");
    title.textContent = `Удалить инцидент ${name}?`;
    modal.style.display = "flex";
}

// Кнопка отмены
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
    document.getElementById("deleteIncidentModal").style.display = "none";
    currentDeleteId = null;
});

// Кнопка подтверждения
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    if (!currentDeleteId) return;

    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    try {
        const response = await fetch(`/incidents/delete/${currentDeleteId}`, {
            method: "DELETE",
            headers: {[header]: token},
            credentials: "same-origin"
        });

        if (response.ok) {
            showSuccessModal("Инцидент успешно удален");
            // Успешно удалено
            document.getElementById("deleteIncidentModal").style.display = "none";
            currentDeleteId = null;

            // Получаем общее число инцидентов
            const totalIncidents = await getTotalIncidents();
            const totalPages = Math.ceil(totalIncidents / PAGE_SIZE);

            // Если текущая страница стала пустой, переключаемся на предыдущую
            if (currentIncidentPage > totalPages) {
                currentIncidentPage = totalPages > 0 ? totalPages : 1;
            }

            await loadIncidents(currentIncidentPage); // обновляем список
        } else if (response.status === 404) {
            showErrorModal("Инцидент не найден");
        } else {
            showErrorModal("Ошибка при удалении инцидента");
        }
    } catch (err) {
        showErrorModal("Ошибка соединения с сервером");
    }
});

// --- ПАГИНАЦИЯ ---
// Загрузка и рендер инцидентов
async function loadIncidents(page = 1) {
    try {
        const resp = await fetch(`/incidents/list`); // убираем page
        if (!resp.ok) throw new Error("Ошибка при загрузке инцидентов");
        const data = await resp.json();

        allIncidents = data;       // сохраняем все данные
        currentIncidentPage = page;

        applyFilters();            // обновляем filteredIncidents и рендерим
    } catch (e) {
        console.error(e);
        incidentList.innerHTML = "";
        noIncidents.style.display = "block";
        pagination.innerHTML = "";
    }
}


// Функция для получения общего числа инцидентов
async function getTotalIncidents() {
    try {
        const resp = await fetch('/incidents/list');
        if (!resp.ok) throw new Error("Ошибка при получении количества инцидентов");
        const data = await resp.json();
        return data.length;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

// Рендер списка
function renderIncidents(incidents) {
    if (!list) return;

    list.innerHTML = "";

    if (!incidents || incidents.length === 0) {  // ← исправлено
        if (noIncidents) noIncidents.style.display = "block";
        return;
    } else {
        if (noIncidents) noIncidents.style.display = "none";
    }

    incidents.forEach(incident => {
        const creationDate = incident.creationDate
            ? incident.creationDate.replace('T', ' ').split('.')[0] // <--- форматирование даты
            : "";

        const item = document.createElement("div");
        item.className = "incident-item";
        item.setAttribute("data-id", incident.id);

        if (role === 'ROLE_USER' || role === 'ROLE_AUDITOR') {
            addIncidentBtn.style.display = 'none';
            item.innerHTML = `
            <div class="incident-info">
                <strong>${incident.title}</strong>
                <span>${incident.description ?? ""}</span>
            </div>
            <div class="incident-meta1">
                <span>${creationDate}</span>
                <span class="incident-level ${incident.level?.toLowerCase() ?? ""}">
                    ${incident.levelLocalized ?? ""}
                </span>
            </div>
            <div class="incident-meta2">
                <div class="incident-cat" data-full-text="${incident.categoryLocalized ?? ""}">
                    <span class="cat-text">${incident.categoryLocalized ?? ""}</span>
                </div>
            </div>
            </div>
        `;
        } else {
            item.innerHTML = `
            <div class="incident-info">
                <strong>${incident.title}</strong>
                <span>${incident.description ?? ""}</span>
            </div>
            <div class="incident-meta1">
                <span>${creationDate}</span>
                <span class="incident-level ${incident.level?.toLowerCase() ?? ""}">
                    ${incident.levelLocalized ?? ""}
                </span>
            </div>
            <div class="incident-meta2">
                <div class="incident-cat" data-full-text="${incident.categoryLocalized ?? ""}">
                    <span class="cat-text">${incident.categoryLocalized ?? ""}</span>
                </div>
            </div>
            <div class="incident-actions">
                <button class="edit-btn" title="Редактировать" data-id="${incident.id}">
                    <img src="/web/static/icons/edit.png" alt="Редактировать инцидент">
                </button>
                <button class="delete-btn" title="Удалить" data-id="${incident.id}">
                    <img src="/web/static/icons/delete.png" alt="Удалить инцидент">
                </button>
            </div>
        `;
        }
        incidentList.appendChild(item);
    });
}

// Рендер пагинации
function renderIncidentPagination(page, totalPages) {
    const box = pagination;
    box.innerHTML = "";

    if (totalPages <= 1) return; // оставляем, но убедимся, что totalPages > 1 корректно

    const maxVisible = 5;

    let start = 1;
    let end = totalPages;

    if (page > 1) box.appendChild(pageBtn("←", () => changePage(page - 1)));

    if (totalPages > maxVisible) {
        start = Math.max(1, page - Math.floor(maxVisible / 2));
        end = start + maxVisible - 1;
        if (end > totalPages) {
            end = totalPages;
            start = end - maxVisible + 1;
        }
    }

    if (start > 1) {
        box.appendChild(pageBtn(1, () => changePage(1)));
        if (start > 2) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.onclick = () => changePage(Math.max(1, start - Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
    }

    for (let p = start; p <= end; p++) {
        const btn = pageBtn(p, () => changePage(p));
        if (p === page) btn.classList.add("active");
        box.appendChild(btn);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.onclick = () => changePage(Math.min(totalPages, end + Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
        box.appendChild(pageBtn(totalPages, () => changePage(totalPages)));
    }

    if (page < totalPages) box.appendChild(pageBtn("→", () => changePage(page + 1)));
}

// Кнопка страницы
function pageBtn(text, handler) {
    const b = document.createElement("button");
    b.className = "page-btn";
    b.textContent = text;
    b.onclick = handler;
    return b;
}

// Загружаем первую страницу при старте
document.addEventListener("DOMContentLoaded", () => {
    loadIncidents(currentIncidentPage);
});

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

// Успех — показать
function showSuccessModal(message) {
    let successMessage = document.getElementById("successMessage");
    successMessage.textContent = message;
    successModal.style.display = "flex";
}

// Успех — закрыть
closeSuccessModal.addEventListener("click", () => {
    successModal.style.display = "none";
});

levelFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    levelFilterPopup.style.display =
        levelFilterPopup.style.display === "block" ? "none" : "block";
});

levelFilterPopup.addEventListener("click", (e) => {
    e.stopPropagation();
});


cancelLevelFilterBtn.addEventListener("click", () => {
    levelFilterPopup.style.display = "none";
});

// закрытие по клику вне
document.addEventListener("click", () => {
    levelFilterPopup.style.display = "none";
    categoryFilterPopup.style.display = "none";
    incidentTextFilterPopup.style.display = "none";
});

applyLevelFilterBtn.addEventListener("click", () => {
    selectedLevelFilters =
        Array.from(levelFilterPopup.querySelectorAll("input[type='checkbox']:checked"))
            .map(cb => cb.value);

    levelFilterPopup.style.display = "none";
    applyFilters();
});

function applyFilters() {
    filteredIncidents = [...allIncidents];

    // уровень
    if (selectedLevelFilters.length > 0) {
        filteredIncidents = filteredIncidents.filter(i =>
            selectedLevelFilters.includes(i.level)
        );
    }

    // категория
    if (selectedCategoryFilters.length > 0) {
        filteredIncidents = filteredIncidents.filter(i =>
            selectedCategoryFilters.includes(i.category)
        );
    }

    // название инцидента (регистронезависимо)
    if (incidentTextFilter !== "") {
        const q = incidentTextFilter.toLowerCase();
        filteredIncidents = filteredIncidents.filter(i =>
            i.title?.toLowerCase().includes(q)
        );
    }

    currentIncidentPage = 1;
    renderPage();
    updateFilterIcons();
}

function renderPage() {
    const start = (currentIncidentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = filteredIncidents.slice(start, end);

    renderIncidents(pageItems);

    const totalPages = Math.ceil(filteredIncidents.length / PAGE_SIZE);
    renderIncidentPagination(currentIncidentPage, totalPages);

    if (pageItems.length === 0) {
        noIncidents.textContent = "Нет инцидентов, подходящих под условия фильтра";
        noIncidents.style.display = "block";
    } else {
        noIncidents.style.display = "none";
    }
}

function changePage(page) {
    currentIncidentPage = page;
    renderPage();
}

function updateFilterIcons() {
    const levelIcon = document.getElementById("levelFilterActiveIcon");
    const categoryIcon = document.getElementById("categoryFilterActiveIcon");
    const incidentIcon = document.getElementById("incidentTextFilterActiveIcon");

    levelIcon.style.display =
        selectedLevelFilters.length > 0 ? "inline" : "none";

    categoryIcon.style.display =
        selectedCategoryFilters.length > 0 ? "inline" : "none";

    incidentIcon.style.display =
        incidentTextFilter !== "" ? "inline" : "none";
}


categoryFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryFilterPopup.style.display =
        categoryFilterPopup.style.display === "block" ? "none" : "block";
});

categoryFilterPopup.addEventListener("click", (e) => {
    e.stopPropagation();
});

cancelCategoryFilterBtn.addEventListener("click", () => {
    categoryFilterPopup.style.display = "none";
});

applyCategoryFilterBtn.addEventListener("click", () => {
    selectedCategoryFilters =
        Array.from(categoryFilterPopup.querySelectorAll("input[type='checkbox']:checked"))
            .map(cb => cb.value);

    categoryFilterPopup.style.display = "none";
    applyFilters();
});

incidentTextFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    incidentTextFilterPopup.style.display =
        incidentTextFilterPopup.style.display === "block" ? "none" : "block";
});

incidentTextFilterPopup.addEventListener("click", (e) => {
    e.stopPropagation();
});

cancelIncidentTextFilterBtn.addEventListener("click", () => {
    incidentTextFilterPopup.style.display = "none";
});

applyIncidentTextFilterBtn.addEventListener("click", () => {
    incidentTextFilter = incidentTextFilterInput.value.trim();

    incidentTextFilterPopup.style.display = "none";
    applyFilters();
});









