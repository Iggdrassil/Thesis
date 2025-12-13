const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;
const logoutButton = document.getElementById("logoutButton");

let currentPage = 1;

async function loadAudit(page = 1) {
    const resp = await fetch(`/audit/list?page=${page}`);
    const data = await resp.json();

    currentPage = data.page;
    renderList(data.records);
    renderPagination(data.page, data.totalPages);
}

function renderList(records) {
    const list = document.getElementById("audit-list");
    const empty = document.getElementById("no-audit");

    list.innerHTML = "";

    if (records.length === 0) {
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

loadAudit();