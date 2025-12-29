document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const content = document.getElementById('content');
  const title = document.getElementById('pageTitle');
  const buttons = document.querySelectorAll('.nav-btn');

  function haptic(type = 'light') {
    tg?.HapticFeedback?.impactOccurred(type);
  }

  /* ===== SCREENS ===== */

  function renderOrderForm() {
    title.innerText = 'Создание заказа';

    content.innerHTML = `
      <div class="card form">

        <div class="form-group">
          <label>Клиент</label>
          <button class="select-btn">Выбрать клиента</button>
        </div>

        <div class="form-group">
          <label>Товары</label>
          <div class="products-empty">
            Товары не добавлены
          </div>
          <button class="add-btn">+ Добавить товар</button>
        </div>

        <div class="form-group">
          <label>Комментарий</label>
          <textarea placeholder="Комментарий к заказу"></textarea>
        </div>

        <div class="total">
          <span>Итого:</span>
          <strong>0 сум</strong>
        </div>

        <button class="submit-btn">Создать заказ</button>

      </div>
    `;

    // действия
    content.querySelector('.select-btn').onclick = () => {
      haptic();
      alert('Следующий шаг — список клиентов');
    };

    content.querySelector('.add-btn').onclick = () => {
      haptic();
      alert('Следующий шаг — добавление товаров');
    };

    content.querySelector('.submit-btn').onclick = () => {
      haptic('medium');
      tg?.showAlert?.('Заказ создан (пока демо)');
    };
  }

  function renderClients() {
    title.innerText = 'Клиенты';
    content.innerHTML = <div class="card">Список клиентов</div>;
  }

  function renderProducts() {
    title.innerText = 'Товары';
    content.innerHTML = <div class="card">Список товаров</div>;
  }

  /* ===== NAV ===== */
  buttons.forEach(btn => {
    btn.onclick = () => {
      haptic();
      const screen = btn.dataset.screen;
      if (screen === 'order') renderOrderForm();
      if (screen === 'clients') renderClients();
      if (screen === 'products') renderProducts();
    };
  });

  // init
  renderOrderForm();
});
