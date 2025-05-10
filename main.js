document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка main.js');
    
    // Проверяем, находимся ли мы на странице входа
    const isLoginPage = window.location.pathname.includes('login.html');
    console.log('Текущая страница:', { isLoginPage, path: window.location.pathname });
    
    // Проверяем авторизацию
    const currentUser = localStorage.getItem('currentUser');
    console.log('Текущий пользователь:', currentUser);
    
    if (!isLoginPage && !currentUser) {
        console.log('Нет авторизации, перенаправление на страницу входа');
        window.location.href = 'login.html';
        return;
    }

    // Если мы на странице входа, не выполняем остальной код
    if (isLoginPage) {
        console.log('На странице входа, выход из main.js');
        return;
    }

    // Проверяем, является ли текущий пользователь администратором
    const userData = usersDB.getUserByLogin(currentUser);
    console.log('Данные пользователя из БД:', userData);
    const isAdmin = userData && userData.role === 'admin';
    console.log('Статус администратора:', isAdmin);

    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const contentArea = document.getElementById('content-area');

    const sections = {
        dashboard: {
            title: 'Главный экран',
            text: `
                <div class="dashboard-block clock-main">
                    <div id="clock-time"></div>
                    <div id="clock-date-main"></div>
                    <div id="clock-date-alt"></div>
                </div>
                <div class="dashboard-block news-block">
                    <h3>Новости проекта:</h3>
                    <div class="news-list"></div>
                </div>
            `
        },
        reports: {
            title: 'Репорты',
            text: 'Здесь будут отображаться ваши репорты.'
        },
        forms: {
            title: 'Анкеты',
            text: 'Раздел для работы с анкетами.'
        },
        analytics: {
            title: 'Отчёты',
            text: 'Аналитика и отчёты по данным.'
        },
        profile: {
            title: 'Профиль',
            text: 'Информация о вашем профиле.'
        },
        settings: {
            title: 'Настройки',
            text: 'Настройки системы и пользователя.'
        }
    };

    function renderSection(section) {
        if (sections[section]) {
            contentArea.innerHTML = `<h2>${sections[section].title}</h2>${sections[section].text}`;
            if(section === 'dashboard') {
                startClock();
                renderNews();
            }
        }
    }

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            console.log('Нажата кнопка меню:', section);
            document.querySelector('.sidebar-menu li.active').classList.remove('active');
            item.classList.add('active');
            renderSection(section);
        });
    });

    // Часы и дата
    function startClock() {
        const timeEl = document.getElementById('clock-time');
        const dateMainEl = document.getElementById('clock-date-main');
        const dateAltEl = document.getElementById('clock-date-alt');
        if (!timeEl || !dateMainEl || !dateAltEl) return;
        function updateClock() {
            const now = new Date();
            // Время
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${h}:${m}:${s}`;
            // День недели и число
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const dayOfWeek = days[now.getDay()];
            const day = now.getDate();
            const month = months[now.getMonth()];
            dateMainEl.textContent = `${dayOfWeek}, ${day} ${month}`;
            // Дата в формате дд.мм.гггг
            const dd = String(day).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = now.getFullYear();
            dateAltEl.textContent = `${dd}.${mm}.${yyyy}`;
        }
        updateClock();
        if (window.clockInterval) clearInterval(window.clockInterval);
        window.clockInterval = setInterval(updateClock, 1000);
    }

    // При загрузке сразу показываем главный экран с часами
    renderSection('dashboard');

    // --- Админ-панель ---
    const adminBtn = document.getElementById('admin-panel-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminPanel = document.getElementById('admin-panel');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminCancelBtn = document.getElementById('admin-cancel-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminError = document.getElementById('admin-error');

    console.log('Найдены элементы админ-панели:', {
        adminBtn: !!adminBtn,
        adminModal: !!adminModal,
        adminPanel: !!adminPanel,
        adminLoginBtn: !!adminLoginBtn,
        adminCancelBtn: !!adminCancelBtn,
        adminLogoutBtn: !!adminLogoutBtn,
        adminPasswordInput: !!adminPasswordInput,
        adminError: !!adminError
    });

    if (adminBtn) {
        // Показываем кнопку админ-панели только для администраторов
        adminBtn.style.display = isAdmin ? 'block' : 'none';
        console.log('Кнопка админ-панели:', { isAdmin, display: adminBtn.style.display });
        
        adminBtn.addEventListener('click', () => {
            alert('Нажата кнопка админ-панели'); // Временное уведомление для отладки
            console.log('Нажата кнопка админ-панели');
            if (isAdmin) {
                console.log('Открытие админ-панели для администратора');
                hideAllOverlays(); // Скрываем все overlay перед открытием админ-панели
                adminPanel.style.display = 'flex';
                renderNews();
            } else {
                console.log('Запрос пароля для админ-панели');
                adminModal.style.display = 'flex';
                adminPasswordInput.value = '';
                adminError.textContent = '';
                setTimeout(() => adminPasswordInput.focus(), 100);
            }
        });
    } else {
        console.error('Кнопка админ-панели не найдена!');
    }

    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            console.log('Нажата кнопка отмены в админ-панели');
            adminModal.style.display = 'none';
        });
    }

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            console.log('Нажата кнопка входа в админ-панель');
            tryAdminLogin();
        });
        adminPasswordInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                console.log('Нажат Enter в поле пароля админ-панели');
                tryAdminLogin();
            }
        });
    }

    function tryAdminLogin() {
        if (adminPasswordInput.value === '123456') {
            adminModal.style.display = 'none';
            hideAllOverlays(); // Скрываем все overlay перед открытием админ-панели
            adminPanel.style.display = 'flex';
            adminError.textContent = '';
        } else {
            adminError.textContent = 'Неверный пароль';
        }
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            console.log('Нажата кнопка выхода из админ-панели');
            adminPanel.style.display = 'none';
        });
    }

    // --- Логин ---
    const logoutBtn = document.getElementById('logout-btn');
    console.log('Кнопка выхода найдена:', !!logoutBtn);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Нажата кнопка выхода из системы'); // Временное уведомление для отладки
            console.log('Нажата кнопка выхода из системы');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    } else {
        console.error('Кнопка выхода не найдена!');
    }

    // --- Новости (общий массив для главной и админки) ---
    let news = [];

    function renderNews() {
        // Главная страница
        const mainNewsList = document.querySelector('.news-list');
        if (mainNewsList) {
            mainNewsList.innerHTML = news.length === 0 ? '<span style="color:#888;">Пока нет новостей</span>' : '';
            news.forEach(item => {
                mainNewsList.innerHTML += `<div class="news-item"><span class="news-date">${item.date}</span>: <span class="news-text">${item.text}</span></div>`;
            });
        }
        // Админ-панель
        const adminNewsList = document.getElementById('admin-news-list');
        if (adminNewsList) {
            adminNewsList.innerHTML = news.length === 0 ? '<span style="color:#888;">Пока нет новостей</span>' : '';
            news.forEach((item, idx) => {
                adminNewsList.innerHTML += `<div class="admin-news-item"><span class="admin-news-date">${item.date}</span><span class="admin-news-text">${item.text}</span><button class="delete-news-btn" data-idx="${idx}">Удалить</button></div>`;
            });
            // Навешиваем обработчики на кнопки удаления
            adminNewsList.querySelectorAll('.delete-news-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = +this.getAttribute('data-idx');
                    news.splice(idx, 1);
                    renderNews();
                });
            });
        }
    }

    // --- Добавление новости ---
    const addNewsBtn = document.getElementById('add-news-btn');
    const addNewsModal = document.getElementById('add-news-modal');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const cancelNewsBtn = document.getElementById('cancel-news-btn');
    const newsTextInput = document.getElementById('news-text');
    const newsError = document.getElementById('news-error');

    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка добавления новости');
            addNewsModal.style.display = 'flex';
            newsTextInput.value = '';
            newsError.textContent = '';
            setTimeout(() => newsTextInput.focus(), 100);
        });
    }
    if (cancelNewsBtn) {
        cancelNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка отмены добавления новости');
            addNewsModal.style.display = 'none';
        });
    }
    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка сохранения новости');
            saveNews();
        });
        newsTextInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                console.log('Нажат Enter в поле текста новости');
                e.preventDefault();
                saveNews();
            }
        });
    }
    function saveNews() {
        const text = newsTextInput.value.trim();
        if (!text) {
            newsError.textContent = 'Введите текст новости';
            return;
        }
        // Автоматически подставляем текущую дату
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const date = `${dd}.${mm}.${yyyy}`;
        news.unshift({date, text});
        addNewsModal.style.display = 'none';
        renderNews();
    }

    // Рендерим новости при загрузке и при открытии админки
    renderNews();

    // Функция для имитации нажатия кнопки админ-панели
    window.simulateAdminClick = function() {
        console.log('Имитация нажатия кнопки админ-панели');
        if (adminBtn) {
            adminBtn.click();
        } else {
            console.error('Кнопка админ-панели не найдена!');
        }
    };

    // Функция для имитации входа в админ-панель
    window.simulateAdminLogin = function() {
        console.log('Имитация входа в админ-панель');
        if (adminPasswordInput) {
            adminPasswordInput.value = '123456';
            if (adminLoginBtn) {
                adminLoginBtn.click();
            }
        }
    };

    // Функция для полной имитации процесса входа в админ-панель
    window.simulateFullAdminAccess = function() {
        console.log('Запуск полной имитации доступа к админ-панели');
        simulateAdminClick();
        setTimeout(simulateAdminLogin, 500);
    };

    // Выводим инструкцию в консоль
    console.log('Для тестирования админ-панели используйте следующие команды:');
    console.log('simulateAdminClick() - имитирует нажатие кнопки админ-панели');
    console.log('simulateAdminLogin() - имитирует ввод пароля и вход');
    console.log('simulateFullAdminAccess() - выполняет полный процесс входа');

    // Функция для скрытия всех overlay-элементов, кроме админ-панели
    function hideAllOverlays() {
        document.querySelectorAll('.modal-overlay, .login-overlay').forEach(e => e.style.display = 'none');
    }
});