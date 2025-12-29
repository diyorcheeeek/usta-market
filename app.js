document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const title = document.getElementById('pageTitle');
  const content = document.getElementById('content');
  const navButtons = document.querySelectorAll('.nav-btn');

  function haptic(type = 'light') {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  }

  function setActive(btn) {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  /* ===== SCREENS ===== */

  function renderOrder() {
    title.innerText = 'Создание заказа';
    content.innerHTML = `
      <div class="card">
        <h3>Форма заказа</h3>

        <button class="action-btn" id="clientBtn">👤 Выбрать клиента</button><br><br>
        <button class="action-btn" id="productBtn">📦 Добавить товар</button><br><br>

        <textarea placeholder="Комментарий к заказу"
          style="width:100%;height:80px;padding:8px;border-radius:8px;"></textarea>

        <br><br>
        <b>Итого: 0 сум</b>
        <br><br>

        <button class="action-btn primary" id="submitBtn">Создать заказ</button>
      </div>
    `;

    document.getElementById('clientBtn').onclick = () => {
      haptic();
      tg?.showAlert('Дальше будет выбор клиента');
    };

    document.getElementById('productBtn').onclick = () => {
      haptic();
      tg?.showAlert('Дальше будет добавление товаров');
    };

    document.getElementById('submitBtn').onclick = () => {
      haptic('medium');
      tg?.showAlert('Заказ создан (демо)');
    };
  }

  function renderClients() {
    title.innerText = 'Клиенты';
    content.innerHTML = `
      <div class="card">
        <h3>Клиенты</h3>
        <p>Здесь будет список клиентов</p>
      </div>
    `;
  }

  function renderProducts() {
    title.innerText = 'Товары';
    content.innerHTML = `
      <div class="card">
        <h3>Товары</h3>
        <p>Здесь будет список товаров</p>
      </div>
    `;
  }

  /* ===== NAVIGATION ===== */

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      haptic();
      setActive(btn);

      const screen = btn.dataset.screen;
      if (screen === 'order') renderOrder();
      if (screen === 'clients') renderClients();
      if (screen === 'products') renderProducts();
    });
  });

  /* ===== INIT ===== */
  const defaultBtn = document.querySelector('.nav-btn.center');
  setActive(defaultBtn);
  renderOrder();
});
