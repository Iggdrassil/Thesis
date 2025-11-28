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

    records.forEach(r => {
        const div = document.createElement("div");
        div.className = "audit-item";

        div.innerHTML = `
            <div class="audit-info">
                <strong>${r.title}</strong>
                <span>${r.description}</span>
            </div>
            <span>${r.username}</span>
            <span>${r.creationDatetime}</span>
        `;

        list.appendChild(div);
    });
}

function renderPagination(page, total) {
    const box = document.getElementById("pagination");
    box.innerHTML = "";

    if (total <= 1) return;

    if (page > 1) {
        box.appendChild(pageBtn("←", () => loadAudit(page - 1)));
    }

    for (let p = 1; p <= total; p++) {
        const btn = pageBtn(p, () => loadAudit(p));
        if (p === page) btn.classList.add("active");
        box.appendChild(btn);
    }

    if (page < total) {
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

document.getElementById("logoutButton").addEventListener('click', () => {
    if (confirm("Вы действительно хотите завершить сеанс?")) {
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
    }
});

loadAudit();