const backButton = document.getElementById("backButton");
const logoutButton = document.getElementById("logoutButton");

async function loadStats() {
    const categoriesResp = await fetch('/statistics/api/categories');
    const levelsResp = await fetch('/statistics/api/importance');
    const dailyResp = await fetch('/statistics/api/daily?days=30');
    const categories = await categoriesResp.json();
    const levels = await levelsResp.json();
    const daily = await dailyResp.json();

    const levelColors = {
        HIGH: "#FF4444",
        MEDIUM: "#FFD93D",
        LOW: "#4CAF50"
    };
    console.log("DAILY DATA:", daily);

    const categoryColors = {
        DDOS: "#ECCE08",
        PASSWORD_BRUTEFORCE: "#7d0db2",
        VULNERABILITY_EXPLOITATION: "#6242cb",
        NET_SCANNING: "#19bd27",
        SPYWARE: "#e7760a",
        MALWARE: "#09d3d3",
        SUSPICIOUS_ACTIVITY: "#FF4444",
        OTHER: "#4b4949"
    };



    new Chart(document.getElementById("categoriesPie"), {
        type: 'pie',
        data: {
            labels: categories.map(e => e.category),
            datasets: [{ data: categories.map(e => e.count),
                backgroundColor: categories.map(e => categoryColors[e.category])}]
        }
    });

    new Chart(document.getElementById("levelsPie"), {
        type: 'pie',
        data: {
            labels: levels.map(e => e.level),
            datasets: [{ data: levels.map(e => e.count),
                backgroundColor: levels.map(e => levelColors[e.level])
            }]
        }
    });

    new Chart(document.getElementById("perDayBar"), {
        type: 'bar',
        data: {
            labels: daily.map(e => e.date),
            datasets: [{
                label: "Инциденты",
                data: daily.map(e => e.count)
            }]
        }
    });
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

loadStats();
