// ------------------------------
// common.js
// ------------------------------

// CSRF токен
export const header = document.querySelector('meta[name="_csrf_header"]').content;
export const token = document.querySelector('meta[name="_csrf"]').content;

// ------------------------------
// Logout
// ------------------------------
export function initLogout(logoutButtonId) {
    const logoutButton = document.getElementById(logoutButtonId);
    logoutButton?.addEventListener('click', () => {
        if (confirm("Вы действительно хотите завершить сеанс?")) {
            fetch('/logout', {
                method: 'POST',
                headers: { [header]: token }
            })
                .then(() => window.location.href = '/login?logout=true');
        }
    });
}

// ------------------------------
// Back / Home navigation
// ------------------------------
export function initNavigation({ backButtonId, backUrl, homeButtonId, homeUrl }) {
    const backButton = document.getElementById(backButtonId);
    backButton?.addEventListener("click", () => {
        window.location.href = backUrl;
    });

    const homeButton = document.getElementById(homeButtonId);
    homeButton?.addEventListener("click", () => {
        window.location.href = homeUrl;
    });
}

// ------------------------------
// Ошибки
// ------------------------------
export function showErrorModal(msg) {
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    if (!errorModal || !errorMessage) return;
    errorMessage.textContent = msg;
    errorModal.style.display = "flex";
}

export function initErrorModal(closeBtnId) {
    const closeBtn = document.getElementById(closeBtnId);
    closeBtn?.addEventListener("click", () => {
        document.getElementById("errorModal").style.display = "none";
    });
}

// ------------------------------
// Тумблер пароля
// ------------------------------
export function initPasswordToggle(toggleId, passwordId) {
    const toggle = document.getElementById(toggleId);
    const password = document.getElementById(passwordId);
    toggle?.addEventListener("click", () => {
        const type = password.getAttribute("type") === "password" ? "text" : "password";
        password.setAttribute("type", type);
    });
}

// ------------------------------
// Помощник fetch с CSRF
// ------------------------------
export async function csrfFetch(url, options = {}) {
    const defaultHeaders = { [header]: token };
    options.headers = { ...defaultHeaders, ...(options.headers || {}) };
    options.credentials = "same-origin";
    return fetch(url, options);
}