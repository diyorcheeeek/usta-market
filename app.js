document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');
  const buttons = document.querySelectorAll('.nav-btn');

  function haptic() {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
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
          <p>📦 Список товаров</p>
        </div>
      `;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      haptic(); // ✅ ВИБРАЦИЯ ВЕРНУЛАСЬ
      render(btn.dataset.screen);
    });
  });

  // init
  render('order');
});
