document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const buttons = document.querySelectorAll('.nav-btn');
  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');

  function clearActive() {
    buttons.forEach(b => b.classList.remove('active'));
  }

  function render(screen) {
    if (screen === 'order') {
      title.innerText = 'Создание заказа';
      content.innerHTML = <div class="card"><p>🧾 Здесь будет форма заказа</p></div>;
    }
    if (screen === 'clients') {
      title.innerText = 'Клиенты';
      content.innerHTML = <div class="card"><p>📋 Список клиентов</p></div>;
    }
    if (screen === 'products') {
      title.innerText = 'Товары';
      content.innerHTML = <div class="card"><p>📦 Список товаров</p></div>;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;

      // ❌ НИКОГДА НЕ ДЕЛАЕМ active ДЛЯ +
      if (!btn.classList.contains('center')) {
        clearActive();
        btn.classList.add('active');
      }

      tg?.HapticFeedback?.impactOccurred('medium');
      render(screen);
    });
  });

  // INIT — активна ТОЛЬКО "Клиенты"
  const defaultBtn = document.querySelector('.nav-btn[data-screen="clients"]');
  defaultBtn.classList.add('active');
  render('clients');
});
