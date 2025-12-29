document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const title = document.getElementById('pageTitle');
  const content = document.getElementById('content');
  const navButtons = document.querySelectorAll('.nav-btn');

  let selectedClient = null;
  let orderItems = [];

  function haptic(type = 'light') {
    tg?.HapticFeedback?.impactOccurred(type);
  }

  function setActive(btn) {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  /* ===== DATA (ЗАГЛУШКИ, ПОТОМ 1С) ===== */

  function getProducts() {
    return [
      { id: 'p1', name: 'Цемент М500', price: 75000 },
      { id: 'p2', name: 'Песок (мешок)', price: 30000 },
      { id: 'p3', name: 'Кирпич красный', price: 1200 }
    ];
  }

  function getClients() {
    return JSON.parse(localStorage.getItem('clients') || '[]');
  }

  function saveClients(list) {
    localStorage.setItem('clients', JSON.stringify(list));
  }

  /* ===== ORDER ===== */

  function calcTotal() {
    return orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function removeItem(index) {
    orderItems.splice(index, 1);
    haptic('medium');
    renderOrder();
  }

  function renderOrder() {
    title.innerText = 'Создание заказа';

    content.innerHTML = `
      <div class="card">
        <h3>Форма заказа</h3>

        <button class="action-btn" id="clientBtn">
          👤 ${selectedClient ? selectedClient.name : 'Выбрать клиента'}
        </button><br><br>

        <button class="action-btn" id="addProductBtn">
          📦 Добавить товар
        </button><br><br>

        ${orderItems.length === 0 ? '<p>Товары не добавлены</p>' : `
          ${orderItems.map((i, idx) => `
            <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e5e7eb">
              <b>${i.name}</b><br>
              ${i.qty} × ${i.price} = ${i.qty * i.price} сум
              <br>
              <button class="remove-btn" data-index="${idx}">
                ❌ Удалить
              </button>
            </div>
          `).join('')}
        `}

        <hr>
        <b>Итого: ${calcTotal()} сум</b>
        <br><br>

        <button class="action-btn primary">
          Создать заказ
        </button>
      </div>
    `;

    document.getElementById('clientBtn').onclick = () => {
      haptic();
      renderClients();
      setActive(document.querySelector('[data-screen="clients"]'));
    };

    document.getElementById('addProductBtn').onclick = () => {
      haptic();
      renderProducts();
      setActive(document.querySelector('[data-screen="products"]'));
    };

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = () => removeItem(btn.dataset.index);
    });
  }

  /* ===== PRODUCTS ===== */

  function renderProducts() {
    title.innerText = 'Товары';
    const products = getProducts();

    content.innerHTML = `
      <div class="card">
        <h3>Товары</h3>

        ${products.map(p => `
          <div style="margin-bottom:16px;">
            <b>${p.name}</b><br>

            Цена:
            <input type="number" value="${p.price}" data-price="${p.id}"
              style="width:100%;margin-bottom:4px;"><br>

            Кол-во:
            <input type="number" value="1" min="1" data-qty="${p.id}"
              style="width:100%;margin-bottom:6px;"><br>

            <button class="action-btn" data-add="${p.id}">
              ➕ Добавить
            </button>
          </div>
        `).join('')}
      </div>
    `;

    products.forEach(p => {
      document.querySelector(`[data-add="${p.id}"]`).onclick = () => {
        const price = +document.querySelector(`[data-price="${p.id}"]`).value;
        const qty = +document.querySelector(`[data-qty="${p.id}"]`).value;

        orderItems.push({ ...p, price, qty });
        haptic('medium');
        renderOrder();
        setActive(document.querySelector('[data-screen="order"]'));
      };
    });
  }

  /* ===== CLIENTS ===== */

  function renderClients() {
    title.innerText = 'Клиенты';
    const clients = getClients();

    content.innerHTML = `
      <div class="card">
        <h3>Клиенты</h3>

        ${clients.map((c, i) => `
          <div class="client-row" data-index="${i}">
            👤 <b>${c.name}</b><br>📞 ${c.phone}
          </div>
        `).join('')}

        <br>
        <button class="action-btn primary" id="addClientBtn">
          ➕ Добавить клиента
        </button>
      </div>
    `;

    document.querySelectorAll('.client-row').forEach(row => {
      row.onclick = () => {
        selectedClient = clients[row.dataset.index];
        haptic();
        renderOrder();
        setActive(document.querySelector('[data-screen="order"]'));
      };
    });

    document.getElementById('addClientBtn').onclick = () => {
      haptic();
      renderAddClient();
    };
  }

  function renderAddClient() {
    title.innerText = 'Новый клиент';
    content.innerHTML = `
      <div class="card">
        <input id="name" placeholder="Имя" style="width:100%;margin-bottom:8px;">
        <input id="phone" placeholder="Телефон" style="width:100%;margin-bottom:8px;">
        <button class="action-btn primary" id="saveClientBtn">
          Сохранить
        </button>
      </div>
    `;

    document.getElementById('saveClientBtn').onclick = () => {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if (!name || !phone) return tg?.showAlert('Заполни поля');

      const clients = getClients();
      clients.push({ id: Date.now(), name, phone });
      saveClients(clients);

      haptic('medium');
      renderClients();
    };
  }

  /* ===== NAV ===== */

  navButtons.forEach(btn => {
    btn.onclick = () => {
      haptic();
      setActive(btn);
      if (btn.dataset.screen === 'order') renderOrder();
      if (btn.dataset.screen === 'clients') renderClients();
      if (btn.dataset.screen === 'products') renderProducts();
    };
  });

  /* ===== INIT ===== */
  setActive(document.querySelector('.nav-btn.center'));
  renderOrder();
});
