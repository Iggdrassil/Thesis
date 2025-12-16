const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;
const logoutButton = document.getElementById("logoutButton");

let currentPage = 1;
let auditEventFilterState = new Set(); // enum-ключи событий
let auditUserFilterValue = "";
let auditDateFrom = "";
let auditDateTo = "";

const AUDIT_EVENTS = [
    { value: "USER_LOGIN", label: "Вход пользователя" },
    { value: "USER_LOGOUT", label: "Выход пользователя" },
    { value: "USER_CREATED", label: "Создание пользователя" },
    { value: "USER_DELETED", label: "Удаление пользователя" },
    { value: "INCIDENT_CREATED", label: "Создание инцидента" },
    { value: "INCIDENT_CREATE_ERROR", label: "Ошибка создания инцидента" },
    { value: "INCIDENT_UPDATED", label: "Изменение инцидента" },
    { value: "INCIDENT_DELETED", label: "Удаление инцидента" },
    { value: "USER_EDITED", label: "Изменение пользователя" },
    { value: "USER_LOGIN_BLOCK", label: "Блокировка входа" },
    { value: "USER_LOGIN_UNBLOCK", label: "Снятие блокировки" },
    { value: "EMAIL_NOTIFICATION_ENABLE", label: "Email включён" },
    { value: "EMAIL_NOTIFICATION_DISABLE", label: "Email отключён" },
    { value: "SEND_EMAIL_SUCCESS", label: "Отправка письма" },
    { value: "SEND_EMAIL_FAIL", label: "Ошибка отправки письма" }
];

const eventFilterBtn = document.getElementById("auditEventFilterBtn");
const eventFilterPopup = document.getElementById("auditEventFilterPopup");
const eventFilterOptions = document.getElementById("auditEventFilterOptions");
const applyEventFilterBtn = document.getElementById("applyAuditEventFilter");
const cancelEventFilterBtn = document.getElementById("cancelAuditEventFilter");
const userFilterBtn = document.getElementById("auditUserFilterBtn");
const userFilterPopup = document.getElementById("auditUserFilterPopup");
const userFilterInput = document.getElementById("auditUserFilterInput");
const applyUserFilterBtn = document.getElementById("applyAuditUserFilter");
const cancelUserFilterBtn = document.getElementById("cancelAuditUserFilter");
const userFilterActiveIcon = document.getElementById("auditUserFilterActiveIcon");
const dateFilterBtn = document.getElementById("auditDateFilterBtn");
const dateFilterPopup = document.getElementById("auditDateFilterPopup");
const dateFromInput = document.getElementById("auditDateFrom");
const dateToInput = document.getElementById("auditDateTo");
const applyDateFilterBtn = document.getElementById("applyAuditDateFilter");
const cancelDateFilterBtn = document.getElementById("cancelAuditDateFilter");
const dateFilterActiveIcon = document.getElementById("auditDateFilterActiveIcon");


async function loadAudit(page = 1) {
    currentPage = page;

    const params = new URLSearchParams();
    params.set("page", page);

// фильтр по событиям
    auditEventFilterState.forEach(ev => {
        params.append("events", ev);
    });

// фильтр по username
    if (auditUserFilterValue) {
        params.set("username", auditUserFilterValue);
    }

    if (auditDateFrom) params.set("dateFrom", auditDateFrom);
    if (auditDateTo) params.set("dateTo", auditDateTo);

    auditEventFilterState.forEach(ev => {
        params.append("events", ev);
    });

    const resp = await fetch(`/audit/list?${params.toString()}`);
    const data = await resp.json();

    renderList(data.records);
    renderPagination(data.page, data.totalPages);
}


function renderList(records) {
    const list = document.getElementById("audit-list");
    const empty = document.getElementById("no-audit");

    list.innerHTML = "";

    if (records.length === 0) {
        empty.textContent = "Нет записей, подходящих под условия фильтра";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    records.forEach(record => {
        const div = document.createElement("div");
        div.className = "audit-item";

        const creationDate = record.creationDatetime
            ? record.creationDatetime.replace('T', ' ').split('.')[0] // <--- форматирование даты
            : "";

        div.innerHTML = `
            <div class="audit-info">
                <strong>${record.title}</strong>
                <span>${record.description}</span>
            </div>
            <span>${record.username}</span>
            <span>${creationDate}</span>
        `;

        list.appendChild(div);
    });
}

function renderPagination(page, totalPages) {
    const box = document.getElementById("pagination");
    box.innerHTML = "";

    if (totalPages <= 1) return;

    const maxVisible = 5; // максимальное число видимых кнопок страниц (без ← → и ...)

    // кнопка назад
    if (page > 1) {
        box.appendChild(pageBtn("←", () => loadAudit(page - 1)));
    }

    let start = 1;
    let end = totalPages;

    if (totalPages > maxVisible) {
        // если всего страниц больше maxVisible, определяем сдвиг
        start = Math.max(1, page - Math.floor(maxVisible / 2));
        end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = end - maxVisible + 1;
        }
    }

    if (start > 1) {
        box.appendChild(pageBtn(1, () => loadAudit(1)));
        if (start > 2) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.style.cursor = "pointer";
            dots.onclick = () => loadAudit(Math.max(1, start - Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
    }

    for (let p = start; p <= end; p++) {
        const btn = pageBtn(p, () => loadAudit(p));
        if (p === page) btn.classList.add("active");
        box.appendChild(btn);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const dots = document.createElement("span");
            dots.className = "dots";
            dots.textContent = "...";
            dots.style.cursor = "pointer";
            dots.onclick = () => loadAudit(Math.min(totalPages, end + Math.floor(maxVisible / 2)));
            box.appendChild(dots);
        }
        box.appendChild(pageBtn(totalPages, () => loadAudit(totalPages)));
    }

    // кнопка вперед
    if (page < totalPages) {
        box.appendChild(pageBtn("→", () => loadAudit(page + 1)));
    }
}


function pageBtn(text, handler) {
    const b = document.createElement("button");
    b.className = "page-btn";
    b.textContent = text;
    b.onclick = handler;
    return b;
}

// Кнопка назад — возвращаемся на предыдущее меню
document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/main";
});

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

eventFilterBtn.addEventListener("click", e => {
    e.stopPropagation();
    eventFilterPopup.style.display =
        eventFilterPopup.style.display === "block" ? "none" : "block";
});

eventFilterPopup.addEventListener("click", e => e.stopPropagation());

document.addEventListener("click", () => {
    eventFilterPopup.style.display = "none";
});

function renderEventFilterOptions() {
    eventFilterOptions.innerHTML = "";

    AUDIT_EVENTS.forEach(ev => {
        const label = document.createElement("label");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = ev.value;
        cb.checked = auditEventFilterState.has(ev.value);

        cb.addEventListener("change", () => {
            cb.checked
                ? auditEventFilterState.add(ev.value)
                : auditEventFilterState.delete(ev.value);
        });

        label.appendChild(cb);
        label.append(ev.label);
        eventFilterOptions.appendChild(label);
    });
}

renderEventFilterOptions();

applyEventFilterBtn.addEventListener("click", () => {
    eventFilterPopup.style.display = "none";

    // иконка активного фильтра
    document.getElementById("auditEventFilterActiveIcon").style.display =
        auditEventFilterState.size ? "inline" : "none";

    loadAudit(1); // ВСЕГДА с первой страницы
});


cancelEventFilterBtn.addEventListener("click", () => {
    eventFilterPopup.style.display = "none";
    userFilterPopup.style.display = "none";
});

userFilterBtn.addEventListener("click", e => {
    e.stopPropagation();
    userFilterPopup.style.display =
        userFilterPopup.style.display === "block" ? "none" : "block";
});

userFilterPopup.addEventListener("click", e => e.stopPropagation());

applyUserFilterBtn.addEventListener("click", () => {
    auditUserFilterValue = userFilterInput.value.trim();

    userFilterPopup.style.display = "none";
    userFilterActiveIcon.style.display =
        auditUserFilterValue ? "inline" : "none";

    loadAudit(1);
});

cancelUserFilterBtn.addEventListener("click", () => {
    userFilterPopup.style.display = "none";
});

// открыть/закрыть попап
dateFilterBtn.addEventListener("click", e => {
    e.stopPropagation();
    dateFilterPopup.style.display =
        dateFilterPopup.style.display === "block" ? "none" : "block";
});

dateFilterPopup.addEventListener("click", e => e.stopPropagation());
document.addEventListener("click", () => {
    dateFilterPopup.style.display = "none";
});

// автоподстановка формата ДД-ММ-ГГГГ
function formatDateInput(e) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0,2) + "-" + val.slice(2);
    if (val.length > 5) val = val.slice(0,5) + "-" + val.slice(5,9);
    e.target.value = val;
}

dateFromInput.addEventListener("input", formatDateInput);
dateToInput.addEventListener("input", formatDateInput);

// календарь
document.querySelectorAll(".native-date").forEach(native => {
    const targetId = native.dataset.target;
    const targetInput = document.getElementById(targetId);

    native.addEventListener("change", () => {
        if (native.value) {
            const d = new Date(native.value);
            const dd = String(d.getDate()).padStart(2,"0");
            const mm = String(d.getMonth()+1).padStart(2,"0");
            const yyyy = d.getFullYear();
            targetInput.value = `${dd}-${mm}-${yyyy}`;
        }
    });
});

// кнопка календаря открывает native input
document.querySelectorAll(".calendar-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        e.stopPropagation();
        const native = btn.parentElement.querySelector(".native-date");
        native.showPicker?.(); // для современных браузеров
    });
});

// применяем фильтр
applyDateFilterBtn.addEventListener("click", () => {
    auditDateFrom = dateFromInput.value.trim();
    auditDateTo = dateToInput.value.trim();

    dateFilterPopup.style.display = "none";
    dateFilterActiveIcon.style.display =
        auditDateFrom || auditDateTo ? "inline" : "none";

    loadAudit(1);
});

// отмена
cancelDateFilterBtn.addEventListener("click", () => {
    dateFilterPopup.style.display = "none";
});

loadAudit();