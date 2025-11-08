const role = document.body.dataset.role; // Thymeleaf вставит значение из сессии

if (role === 'ROLE_USER' || role === 'ROLE_AUDITOR') {
    document.getElementById('settings-btn').style.display = 'none';
} else {
    document.getElementById('settings-btn').addEventListener('click', () => {
        window.location.href = '/settings';
    });
}

if (role === 'ROLE_AUDITOR') {
    document.getElementById('stat').style.display = 'none';
    document.getElementById('incidents').style.display = 'none';
}

function goTo(section) {
    switch (section) {
        case 'stats':
            window.location.href = '/stats';
            break;
        case 'incidents':
            window.location.href = '/incidents';
            break;
        case 'audit':
            window.location.href = '/audit';
            break;
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm("Вы действительно хотите завершить сеанс?")) {
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
    }
});