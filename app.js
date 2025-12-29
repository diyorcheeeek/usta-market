document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const title = document.getElementById('pageTitle');
  const content = document.getElementById('content');

  function haptic(type = 'light') {
    tg?.HapticFeedback?.impactOccurred(type);
  }

  function renderOrder() {
    title.innerText = 'Создание заказа';
    content.innerHTML = `
      <div class="card">
        <h3>Форма заказа</h3>

        <button id="clientBtn">👤 Выбрать клиента</button>
        <br><br>

        <button id="productBtn">📦 Добавить товар</button>
        <br><br>

        <textarea placeholder="Комментарий к заказу" style="width:100%;height:80px"></textarea>
        <br><br>

        <b>Итого: 0 сум</b>
        <br><br>

        <button id="submitBtn">Создать заказ</button>
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

  // INIT
  renderOrder();
});
