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

let selectedRecommendations = [];

// --- события открытия/закрытия ---
document.addEventListener("DOMContentLoaded", () => {

    // кнопки навигации уже есть в твоём файле — не трогаем
    addIncidentBtn.addEventListener("click", openIncidentModal);
    incidentCloseBtn?.addEventListener("click", closeIncidentModal);
    cancelIncidentBtn?.addEventListener("click", closeIncidentModal);

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
// ожидание: endpoints возвращают список объектов: { value: "DDOS", label: "Взлом пароля" }
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
        });

        // уровни
        const lvlResp = await fetch("/incidents/levels");
        const levels = await lvlResp.json();
        levelSelect.innerHTML = `<option value="">Выберите уровень важности</option>`;
        levels.forEach(l => {
            const val = l.value ?? l.name ?? l;
            const label = l.label ?? l.localizedValue ?? l.name ?? l;
            levelSelect.add(new Option(label, val));
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
logoutButton.addEventListener("click", () => {
    fetch("/logout", { method: "POST" })
        .then(() => window.location.href = "/login");
});

// Кнопка назад — возвращаемся на предыдущее меню
backButton.addEventListener("click", () => {
    window.location.href = "/main";
});
