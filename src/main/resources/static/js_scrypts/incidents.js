const backButton = document.getElementById("backButton");
const logoutButton = document.getElementById("logoutButton");
const btnAdd = document.getElementById("addIncidentBtn");
document.addEventListener("DOMContentLoaded", function () {

    // Возврат на предыдущую страницу
    backButton.addEventListener("click", () => {
        window.history.back();
    });

    // Выход из системы
    logoutButton.addEventListener("click", () => {
        fetch("/logout", { method: "GET" })
            .then(() => window.location.href = "/login");
    });

    // Добавление инцидента (заглушка)
    btnAdd.addEventListener("click", () => {
        window.location.href = "/incidents/add"; // пример
    });
});

// Редактирование (заглушка)
function openEditIncident(id) {
    window.location.href = "/incidents/edit?id=" + id;
}

// Удаление (заглушка)
function deleteIncident(id) {
    if (confirm("Удалить инцидент?")) {
        fetch("/incidents/delete?id=" + id, { method: "DELETE" })
            .then(r => {
                if (r.ok) location.reload();
                else alert("Ошибка удаления");
            });
    }
}
