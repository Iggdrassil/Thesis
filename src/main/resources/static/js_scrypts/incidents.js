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

const role = document.body.dataset.role; // Thymeleaf вставит значение из сессии

let editIncidentId = null;
let currentDeleteId = null;
let editSelectedRecommendations = [];

let selectedRecommendations = [];

if (role === 'ROLE_USER' || role === 'ROLE_AUDITOR') {
    addIncidentBtn.style.display = 'none';
    document.querySelectorAll('.edit-btn').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.delete-btn').forEach(el => el.style.display = 'none');
}

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
function openIncidentModal(){
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden","false");
}
function closeIncidentModal(){
    modal.style.display = "none";
    modal.setAttribute("aria-hidden","true");
    // сброс формы
    titleInput.value = "";
    descInput.value = "";
    categorySelect.value = "";
    levelSelect.value = "";
    selectedRecommendations = [];
    // выключаем кнопку
    validateForm();
}

function openRecsModal(){
    recsModal.style.display = "flex";
    recsModal.setAttribute("aria-hidden","false");
}
function closeRecsModal(){
    recsModal.style.display = "none";
    recsModal.setAttribute("aria-hidden","true");
}

// --- загрузка словарей из бекенда ---
async function loadDictionaries(){
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

    } catch (err) {
        console.error("Ошибка загрузки справочников:", err);
    }
}

// утилита для чекбоксов (вызывается из onChange)
function toggleRecommendationCb(cb){
    const v = cb.value;
    if(cb.checked){
        if(!selectedRecommendations.includes(v)) selectedRecommendations.push(v);
    } else {
        selectedRecommendations = selectedRecommendations.filter(x => x !== v);
    }
    // не нужно непосредственно менять createButton — рекомендации не обязательны
}

// --- валидация формы ---
function validateForm(){
    const ok = titleInput.value.trim() !== "" && categorySelect.value !== "" && levelSelect.value !== "";
    createButton.disabled = !ok;
}

// --- отправка запроса создания ---
async function submitCreateIncident(){
    if(createButton.disabled) return;

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

        if(resp.status === 409){
            // показать модальное сообщение об ошибке (или alert)
            alert("Инцидент с таким названием уже существует");
            return;
        }
        if(!resp.ok){
            alert("Ошибка при создании инцидента");
            return;
        }

        closeIncidentModal();
        location.reload();

    } catch(e){
        console.error(e);
        alert("Ошибка сети");
    }
}

// Кнопка выхода
logoutButton.addEventListener('click', () => {
    if (confirm("Вы действительно хотите завершить сеанс?")) {
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
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

    // Простые поля
    incidentCreated.textContent = incident.creationDate;
    incidentUpdated.textContent = incident.updatedDate ?? "—";
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
            alert("Не удалось загрузить инцидент");
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
        alert("Ошибка сети");
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
            alert("Не удалось загрузить данные инцидента");
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
        alert("Ошибка сети");
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
            alert("Не удалось сохранить изменения");
            return;
        }

        closeEditIncidentModal();
        location.reload(); // единообразно с созданием

    } catch (e) {
        console.error(e);
        alert("Ошибка сети");
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
            headers: { [header]: token },
            credentials: "same-origin"
        });

        if (response.ok) {
            // Успешно удалено
            document.getElementById("deleteIncidentModal").style.display = "none";
            currentDeleteId = null;
            location.reload(); // обновляем список
        } else if (response.status === 404) {
            alert("Инцидент не найден");
        } else {
            alert("Ошибка при удалении инцидента");
        }
    } catch (err) {
        alert("Ошибка соединения с сервером");
    }
});





