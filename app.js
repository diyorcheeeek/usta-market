const tg = window.Telegram.WebApp;
tg.ready();

// Простая навигация (пока заглушки)
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    tg.HapticFeedback?.impactOccurred('medium');

    const screen = btn.dataset.screen;
    const content = document.getElementById('content');
    const title = document.getElementById('pageTitle');

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
  });
});
