const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;
const logoutButton = document.getElementById("logoutButton");

let currentPage = 1;
let auditEventFilterState = new Set(); // enum-ключи событий
let auditUserFilterValue = "";

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
const userFilterActiveIcon =
    document.getElementById("auditUserFilterActiveIcon");


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


loadAudit();