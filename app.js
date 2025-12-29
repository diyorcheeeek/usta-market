document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready();

  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');
  const buttons = document.querySelectorAll('.nav-btn');

  function haptic(type = 'light') {
    tg?.HapticFeedback?.impactOccurred(type);
  }

  function render(screen) {
    if (screen === 'order') {
      title.innerText = 'Создание заказа';
      content.innerHTML = `
        <div class="card">
          <h3>Форма заказа</h3>
          <p>🧾 Здесь будет форма заказа</p>
          <button id="test">Тест вибрации</button>
        </div>
      `;

      document.getElementById('test').onclick = () => {
        haptic('medium');
        tg.showAlert('Вибрация работает');
      };
    }

    if (screen === 'clients') {
      title.innerText = 'Клиенты';
      content.innerHTML = <div class="card">Список клиентов</div>;
    }

    if (screen === 'products') {
      title.innerText = 'Товары';
      content.innerHTML = <div class="card">Список товаров</div>;
    }
  }

  buttons.forEach(btn => {
    btn.onclick = () => {
      haptic();
      render(btn.dataset.screen);
    };
  });

  // INIT
  render('order');
});
