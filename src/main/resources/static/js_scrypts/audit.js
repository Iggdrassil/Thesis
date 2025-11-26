let currentPage = 1;

async function loadAudit(page = 1) {
    const resp = await fetch(`/audit/list?page=${page}`);
    const data = await resp.json();

    currentPage = data.page;

    renderList(data.records);
    renderPagination(data.page, data.totalPages);
}

function renderList(records) {
    const container = document.getElementById("audit-list");
    container.innerHTML = "";

    if (records.length === 0) {
        container.innerHTML = "<div class='empty'>Нет записей</div>";
        return;
    }

    records.forEach(r => {
        const div = document.createElement("div");
        div.className = "audit-item";

        div.innerHTML = `
            <span>${r.title}</span>
            <span>${r.description}</span>
            <span>${r.username}</span>
            <span>${r.creationDatetime}</span>
        `;

        container.appendChild(div);
    });
}

function renderPagination(page, totalPages) {
    const box = document.querySelector(".pagination");
    box.innerHTML = "";

    if (totalPages <= 1) return;

    // ← Previous
    if (page > 1) {
        const btn = createPageButton("←", () => loadAudit(page - 1));
        box.appendChild(btn);
    }

    // Number buttons
    for (let p = 1; p <= totalPages; p++) {
        const btn = createPageButton(p, () => loadAudit(p));
        if (p === page) btn.classList.add("active");
        box.appendChild(btn);
    }

    // → Next
    if (page < totalPages) {
        const btn = createPageButton("→", () => loadAudit(page + 1));
        box.appendChild(btn);
    }
}

function createPageButton(text, handler) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = text;
    btn.onclick = handler;
    return btn;
}

loadAudit();