const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let currentScreen = 'home';

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

  if (screen === 'home' || !screen) {
    title.innerText = 'Создание заказа';
    backBtn.style.display = 'none';

    content.innerHTML = `
      <div class="card big">
        <button class="primary-btn">➕ Создать заказ</button>
      </div>
    `;
  }

  if (screen === 'clients') {
    title.innerText = 'Клиенты';
    backBtn.style.display = 'block';

    content.innerHTML = `
      <div class="card big">
        <p style="font-size:28px">📋 Список клиентов</p>
      </div>
    `;
  }

  if (screen === 'products') {
    title.innerText = 'Товары';
    backBtn.style.display = 'block';

    content.innerHTML = `
      <div class="card big">
        <p style="font-size:28px">📦 Список товаров</p>
      </div>
    `;
  }

  if (screen === 'order') {
    title.innerText = 'Создание заказа';
    backBtn.style.display = 'block';

    content.innerHTML = `
      <div class="card big">
        <p style="font-size:28px">🧾 Форма заказа</p>
      </div>
    `;
  }
}

function goBack() {
  switchScreen('home');
}

// INIT
switchScreen('home');
