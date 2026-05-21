document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  // Admin panel elements
  const adminToggle = document.getElementById('adminToggle');
  const adminModal = document.getElementById('adminModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const adminLogin = document.getElementById('adminLogin');
  const adminPassword = document.getElementById('adminPassword');
  const loginButton = document.getElementById('loginButton');
  const loginError = document.getElementById('loginError');
  const logoutButton = document.getElementById('logoutButton');
  const downloadExcelButton = document.getElementById('downloadExcelButton');
  const submissionsTable = document.getElementById('submissionsTable').querySelector('tbody');

  let isAdminLoggedIn = false;

  // Tab functionality
  tabButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const target = this.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((panel) => panel.classList.remove('active'));

      this.classList.add('active');
      const activePanel = document.getElementById(target);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const initials = this.elements['name'].value.trim();
      const email = this.elements['email'].value.trim();
      const comment = this.elements['comment'].value.trim();

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initials, email, comment }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при отправке');
        }

        formNote.textContent = 'Спасибо! Ваше сообщение сохранено на сервере.';
        form.reset();
      } catch (error) {
        formNote.textContent = 'Ошибка отправки. Попробуйте снова.';
        console.error(error);
      }
    });
  }

  // Admin panel
  if (adminToggle) {
    adminToggle.addEventListener('click', function () {
      adminModal.classList.remove('hidden');
      if (isAdminLoggedIn) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
      } else {
        loginForm.classList.remove('hidden');
        adminPanel.classList.add('hidden');
      }
    });
  }

  if (closeModal || modalOverlay) {
    const closeAction = () => {
      adminModal.classList.add('hidden');
      loginError.textContent = '';
      if (isAdminLoggedIn) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
      }
    };
    if (closeModal) closeModal.addEventListener('click', closeAction);
    if (modalOverlay) modalOverlay.addEventListener('click', closeAction);
  }

  if (loginButton) {
    loginButton.addEventListener('click', async function () {
      const login = adminLogin.value.trim();
      const password = adminPassword.value.trim();
      loginError.textContent = '';

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ login, password }),
        });

        if (!response.ok) {
          throw new Error('Ошибка входа');
        }

        isAdminLoggedIn = true;
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        adminLogin.value = '';
        adminPassword.value = '';
        loginError.textContent = '';
        await loadSubmissions();
      } catch (error) {
        loginError.textContent = 'Неверный логин или пароль';
        console.error(error);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      isAdminLoggedIn = false;
      adminLogin.value = '';
      adminPassword.value = '';
      loginError.textContent = '';
      adminPanel.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }

  async function loadSubmissions() {
    try {
      const response = await fetch('/api/admin/submissions');
      if (!response.ok) throw new Error('Ошибка загрузки');

      const submissions = await response.json();
      submissionsTable.innerHTML = '';

      submissions.forEach((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.initials}</td>
          <td>${entry.email}</td>
          <td>${entry.comment}</td>
          <td>${new Date(entry.date).toLocaleString('ru-RU')}</td>
        `;
        submissionsTable.appendChild(row);
      });
    } catch (error) {
      submissionsTable.innerHTML = '<tr><td colspan="4">Ошибка загрузки данных</td></tr>';
      console.error(error);
    }
  }

  if (downloadExcelButton) {
    downloadExcelButton.addEventListener('click', function () {
      window.location.href = '/api/admin/export/xlsx';
    });
  }
});
