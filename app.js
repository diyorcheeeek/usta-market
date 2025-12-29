// Ждём, пока DOM точно загрузится
document.addEventListener('DOMContentLoaded', () => {

  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const buttons = document.querySelectorAll('.nav-btn');
  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');

  if (!buttons.length) {
    console.error('NAV BUTTONS NOT FOUND');
    return;
  }

  function setActive(btn) {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function render(screen) {
    if (screen === 'order') {
      title.innerText = 'Создание заказа';
      content.innerHTML = `
        <div class="card">
          <p>🧾 Здесь будет форма заказа</p>
        </div>
      `;
    }

    if (screen === 'clients') {
      title.innerText = 'Клиенты';
      content.innerHTML = `
        <div class="card">
          <p>📋 Список клиентов</p>
        </div>
      `;
    }

    if (screen === 'products') {
      title.innerText = 'Товары';
      content.innerHTML = `
        <div class="card">
          <p>📦 Список товаров</p></div>
      `;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      tg?.HapticFeedback?.impactOccurred('medium');

      setActive(btn);

      const screen = btn.getAttribute('data-screen');
      render(screen);
    });
  });

  // ===== INIT =====
  const defaultBtn = document.querySelector('.nav-btn[data-screen="order"]');
  if (defaultBtn) {
    setActive(defaultBtn);
    render('order');
  }
});
