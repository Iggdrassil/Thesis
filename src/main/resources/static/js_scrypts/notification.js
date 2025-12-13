document.addEventListener("DOMContentLoaded", async () => {
    const toggle = document.getElementById("notifyToggle");
    const settingsBlock = document.getElementById("settingsBlock");
    const disabledMessage = document.getElementById("disabledMessage");
    const saveBtn = document.getElementById("saveBtn");
    const testBtn = document.getElementById("sendTestBtn");

    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const token = document.querySelector('meta[name="_csrf"]').content;

    window.selectedLevels = [];
    window.selectedCategories = [];

    // ------------------------------
    // 1. Загрузка настроек
    // ------------------------------
    async function loadSettings() {
        try {
            const resp = await fetch("/notifications/email/settings");
            if (!resp.ok) throw new Error("Ошибка загрузки настроек");
            const settings = await resp.json();

            toggle.checked = settings.enabled;

            document.getElementById("smtpHost").value = settings.smtpHost ?? "";
            document.getElementById("smtpPort").value = settings.smtpPort ?? "";
            document.getElementById("smtpUser").value = settings.smtpUsername ?? "";
            document.getElementById("smtpPassword").value = settings.smtpPassword ?? "";
            document.getElementById("senderEmail").value = settings.senderEmail ?? "";
            document.getElementById("recipientEmail").value = settings.recipientEmail ?? "";

            window.selectedLevels = settings.allowedLevels || [];
            window.selectedCategories = settings.allowedCategories || [];

            updateFormState();
        } catch (e) {
            console.error(e);
            showErrorModal("Не удалось загрузить настройки оповещения");
        }
    }

    // ------------------------------
    // 2. Управление видимостью формы и сообщений
    // ------------------------------
    function updateFormState() {
        const enabled = toggle.checked;

        // Показ/скрытие блока настроек
        settingsBlock.style.display = enabled ? "flex" : "none";

        // Кнопки
        saveBtn.style.display = enabled ? "inline-block" : "none";
        testBtn.style.display = enabled ? "inline-block" : "none";

        // Сообщение по центру
        disabledMessage.style.display = enabled ? "none" : "flex";
    }

    toggle.addEventListener("change", async () => {
        updateFormState();

        // Сохраняем только включение/отключение уведомлений
        try {
            const body = { enabled: toggle.checked };
            const resp = await fetch("/notifications/email/updateSettings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    [header]: token
                },
                body: JSON.stringify(body)
            });
            if (!resp.ok) {
                const msg = await resp.text();
                showErrorModal(msg || "Не удалось сохранить состояние уведомлений");
            }
        } catch (e) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

    toggle.addEventListener("change", updateFormState);

    // ------------------------------
    // 3. Сохранение настроек
    // ------------------------------
    saveBtn.addEventListener("click", async () => {
        const body = {
            enabled: toggle.checked,
            smtpHost: document.getElementById("smtpHost").value.trim(),
            smtpPort: Number(document.getElementById("smtpPort").value),
            smtpUsername: document.getElementById("smtpUser").value.trim(),
            smtpPassword: document.getElementById("smtpPassword").value.trim(),
            senderEmail: document.getElementById("senderEmail").value.trim(),
            recipientEmail: document.getElementById("recipientEmail").value.trim(),
            allowedLevels: window.selectedLevels,
            allowedCategories: window.selectedCategories
        };
        try {
            const resp = await fetch("/notifications/email/updateSettings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    [header]: token
                },
                body: JSON.stringify(body)
            });
            if (resp.ok) {
                showSuccessModal("Настройки сохранены");
            } else {
                const msg = await resp.text();
                showErrorModal(msg || "Ошибка сохранения настроек");
            }
        } catch (e) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

    // ------------------------------
    // 4. Тестовая отправка письма
    // ------------------------------
    testBtn.addEventListener("click", async () => {
        try {
            const resp = await fetch("/notifications/email/test", {
                method: "POST",
                headers: { [header]: token }
            });
            const msg = await resp.text();
            if (resp.ok) {
                showSuccessModal("Тестовое письмо успешно отправлено");
            } else {
                showErrorModal("Ошибка отправки письма");
            }
        } catch (e) {
            showErrorModal("Ошибка соединения с сервером");
        }
    });

    // ------------------------------
    // 5. Модалки уровней и категорий
    // ------------------------------
    const levelsModal = document.getElementById("levelsModal");
    const categoriesModal = document.getElementById("categoriesModal");

    function createCheckbox(value, labelText, checked = false) {
        const ch = document.createElement("input");
        ch.type = "checkbox";
        ch.value = value;
        ch.checked = checked;
        const label = document.createElement("label");
        label.textContent = labelText;
        label.prepend(ch);
        const div = document.createElement("div");
        div.className = "checkbox-row";
        div.appendChild(label);
        return div;
    }

    function setupSelectAll(container, allCheckboxId) {
        const allCheckbox = container.querySelector(`#${allCheckboxId}`);
        allCheckbox.addEventListener("change", () => {
            container.querySelectorAll("input[type=checkbox]").forEach(ch => {
                if (ch.id !== allCheckboxId) ch.checked = allCheckbox.checked;
            });
        });
    }

    document.getElementById("selectLevelsBtn").addEventListener("click", async () => {
        try {
            const resp = await fetch("/incidents/levels");
            if (!resp.ok) throw new Error("Не удалось загрузить уровни");
            const levels = await resp.json();
            const container = document.getElementById("levelsList");
            container.innerHTML = "";

            // "Выбрать все"
            const divAll = createCheckbox("all", "Выбрать все", window.selectedLevels.length === levels.length);
            divAll.querySelector("input").id = "selectAllLevels";
            container.appendChild(divAll);
            setupSelectAll(container, "selectAllLevels");

            levels.forEach(l => {
                const div = createCheckbox(l.value, l.label, window.selectedLevels.includes(l.value));
                container.appendChild(div);
            });

            levelsModal.style.display = "flex";

            document.getElementById("saveLevelsBtn").onclick = () => {
                window.selectedLevels = Array.from(container.querySelectorAll("input[type=checkbox]"))
                    .filter(c => c.value !== "all" && c.checked)
                    .map(c => c.value);
                levelsModal.style.display = "none";
            };
            document.getElementById("cancelLevelsBtn").onclick = () => levelsModal.style.display = "none";

        } catch (e) {
            showErrorModal("Не удалось загрузить уровни");
        }
    });

    document.getElementById("selectCategoriesBtn").addEventListener("click", async () => {
        try {
            const resp = await fetch("/incidents/categories");
            if (!resp.ok) throw new Error("Не удалось загрузить категории");
            const categories = await resp.json();
            const container = document.getElementById("categoriesList");
            container.innerHTML = "";

            // "Выбрать все"
            const divAll = createCheckbox("all", "Выбрать все", window.selectedCategories.length === categories.length);
            divAll.querySelector("input").id = "selectAllCategories";
            container.appendChild(divAll);
            setupSelectAll(container, "selectAllCategories");

            categories.forEach(c => {
                const div = createCheckbox(c.value, c.label, window.selectedCategories.includes(c.value));
                container.appendChild(div);
            });

            categoriesModal.style.display = "flex";

            document.getElementById("saveCategoriesBtn").onclick = () => {
                window.selectedCategories = Array.from(container.querySelectorAll("input[type=checkbox]"))
                    .filter(c => c.value !== "all" && c.checked)
                    .map(c => c.value);
                categoriesModal.style.display = "none";
            };
            document.getElementById("cancelCategoriesBtn").onclick = () => categoriesModal.style.display = "none";

        } catch (e) {
            showErrorModal("Не удалось загрузить категории");
        }
    });

    document.getElementById("closeErrorBtn").addEventListener("click", () => {
        document.getElementById("errorModal").style.display = "none";
    });

    // ------------------------------
    // 7. Старт
    // ------------------------------
    await loadSettings();
});

const backButton = document.getElementById("backButton");
const homeButton = document.getElementById("homeBtn");
const logoutButton = document.getElementById("logoutButton");

// Кнопка назад — возвращаемся на предыдущее меню
backButton.addEventListener("click", () => {
    window.location.href = "/settings";
});

// Кнопка домой — переходим в главное меню без выхода
homeButton.addEventListener("click", () => {
    window.location.href = "/main";
});

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
