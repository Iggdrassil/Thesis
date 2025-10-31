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

document.getElementById('settings-btn').addEventListener('click', () => {
    window.location.href = '/settings';
});

document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm("Вы действительно хотите завершить сеанс?")) {
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
    }
});