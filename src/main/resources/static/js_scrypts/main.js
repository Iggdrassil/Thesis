function fadeAndNavigate(url) {
    document.body.style.transition = "opacity 0.3s";
    document.body.style.opacity = "0";
    setTimeout(() => window.location.href = url, 300);
}

function goTo(section) {
    switch (section) {
        case 'stats':
            fadeAndNavigate('/stats');
            break;
        case 'incidents':
            fadeAndNavigate('/incidents');
            break;
        case 'audit':
            fadeAndNavigate('/audit');
            break;
    }
}

document.getElementById('settings-btn').addEventListener('click', () => {
    fadeAndNavigate('/settings');
});

document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm("Вы действительно хотите завершить сеанс?")) {
        document.body.style.transition = "opacity 0.3s";
        document.body.style.opacity = "0";
        fetch('/logout', { method: 'POST' })
            .then(() => setTimeout(() => window.location.href = '/login', 300));
    }
});