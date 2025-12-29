document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready();

  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');
  const buttons = document.querySelectorAll('.nav-btn');

  function haptic() {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  }

  function renderOrder() {
    title.innerText = 'Создание заказа';
    content.innerHTML = `
      <div class="card">
        <b>ФОРМА ЗАКАЗА РАБОТАЕТ ✅</b><br><br>
        Нажми кнопки — будет вибрация
        <br><br>
        <button id="testBtn">Тест вибрации</button>
      </div>
    `;

    document.getElementById('testBtn').onclick = () => {
      haptic();
      tg.showAlert('Вибрация есть 👍');
    };
  }

  function renderClients() {
    title.innerText = 'Клиенты';
    content.innerHTML = <div class="card">Экран клиентов</div>;
  }

  function renderProducts() {
    title.innerText = 'Товары';
    content.innerHTML = <div class="card">Экран товаров</div>;
  }

  buttons.forEach(btn => {
    btn.onclick = () => {
      haptic();
      const screen = btn.dataset.screen;
      if (screen === 'order') renderOrder();
      if (screen === 'clients') renderClients();
      if (screen === 'products') renderProducts();
    };
  });

  // INIT
  renderOrder();
});
