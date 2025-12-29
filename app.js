const tg = window.Telegram.WebApp;
tg.ready();

let currentScreen = 'order';

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    tg.HapticFeedback?.impactOccurred('medium');
    switchScreen(btn.dataset.screen);
  });
});

function switchScreen(screen) {
  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');
  const backBtn = document.getElementById('backBtn');

  currentScreen = screen;

  if (screen === 'order') {
    title.innerText = 'Создание заказа';
    backBtn.style.display = 'none';

    content.innerHTML = `
      <div class="card">
        <p>🧾 Форма заказа</p>
      </div>
    `;
  }

  if (screen === 'clients') {
    title.innerText = 'Клиенты';
    backBtn.style.display = 'flex';

    content.innerHTML = `
      <div class="card">
        <p>📋 Список клиентов</p>
      </div>
    `;
  }

  if (screen === 'products') {
    title.innerText = 'Товары';
    backBtn.style.display = 'flex';

    content.innerHTML = `
      <div class="card">
        <p>📦 Список товаров</p>
      </div>
    `;
  }
}

function goBack() {
  switchScreen('order');
}

/* INIT */
switchScreen('order');
