// ===============================
// TELEGRAM INIT
// ===============================
const tg = window.Telegram?.WebApp;
tg?.ready();
// ===============================
// SELLER
// ===============================
const SELLER_NAME = 'Avazbek'; // ← поменяешь имя когда нужно

// ===============================
// ELEMENTS
// ===============================
const title = document.getElementById('pageTitle');
const content = document.getElementById('content');
const navButtons = document.querySelectorAll('.nav-btn');

// ===============================
// SAFE HAPTIC
// ===============================
function haptic(type = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred(type);
  } catch (e) {}
}

// ===============================
// DATA (ЗАГЛУШКИ → ПОТОМ 1С)
// ===============================
const products = [
  { id: 1, name: 'Цемент М500', price: 75000 },
  { id: 2, name: 'Песок', price: 30000 },
  { id: 3, name: 'Щебень', price: 45000 },
  { id: 4, name: 'Гипс', price: 28000 }
];

let order = {
  client: null,
  items: [],
  comment: '',
  total: 0
};

// ===============================
// NAV STACK (НАЗАД)
// ===============================
let screenStack = [];
let currentScreen = 'order';

function setHeader(text, withBack = false) {
  if (withBack) {
    title.innerHTML = `
      <span id="backBtn" style="margin-right:8px;cursor:pointer">⬅️</span>
      ${text}
    `;
    document.getElementById('backBtn').onclick = () => {
      haptic();
      goBack();
    };
  } else {
    title.innerText = text;
  }
}

function goBack() {
  const prev = screenStack.pop();
  if (!prev) return;

  if (prev === 'order') renderOrder();
  if (prev === 'clients') renderClients();
  if (prev === 'products') renderProductsTable();
}

// ===============================
// SCREENS
// ===============================
function renderOrder() {
  currentScreen = 'order';
  setHeader('Создание заказа');

  content.innerHTML = `
    <div class="card">
      <h3>Форма заказа</h3>

      <button class="btn" onclick="openClients()">👤 Выбрать клиента</button>
      <br><br>

      <button class="btn" onclick="openProducts()">📦 Добавить товары</button>
      <br><br>

      <textarea
        placeholder="Комментарий к заказу"
        style="width:100%;height:80px"
        onchange="order.comment = this.value"
      ></textarea>

      <p><strong>Итого:</strong> ${order.total.toLocaleString()} сум</p>

      <button class="btn" onclick="saveOrder()">💾 Сохранить</button>
<button class="btn primary" onclick="printOrder()">🖨 Печать</button>
    </div>
  `;
}

function renderClients() {
  currentScreen = 'clients';
  setHeader('Клиенты', true);

  content.innerHTML = `
    <div class="card">
      <p>📋 Список клиентов</p>
      <p style="color:#6b7280">(будет загружаться из 1С)</p>
    </div>
  `;
}

function renderProductsTable() {
  currentScreen = 'products';
  setHeader('Добавление товаров', true);

  content.innerHTML = `
    <div class="card">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th align="left">Товар</th>
            <th width="60">Кол-во</th>
            <th width="80">Цена</th>
          </tr>
        </thead>
        <tbody id="itemsTable"></tbody>
      </table>

      <br>
      <button class="btn" onclick="addItemRow()">➕ Добавить строку</button>
      <br><br>

      <strong>Итого: <span id="totalSum">0</span> сум</strong>
      <br><br>

      <button class="btn primary" onclick="finishProducts()">Готово</button>
    </div>
  `;

  renderItems();
}

// ===============================
// OPEN HELPERS
// ===============================
function openClients() {
  screenStack.push(currentScreen);
  renderClients();
}

function openProducts() {
  screenStack.push(currentScreen);
  renderProductsTable();
}

// ===============================
// ITEMS (ТАБЛИЧНАЯ ЧАСТЬ)
// ===============================
function addItemRow() {
  haptic();
  order.items.push({
    productId: null,
    name: '',
    qty: 1,
    price: 0
  });
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById('itemsTable');
  if (!tbody) return;

  tbody.innerHTML = '';

  order.items.forEach((item, index) => {
    const tr = document.createElement('tr');tr.innerHTML = `
      <td>
        <input
          type="text"
          placeholder="Начни вводить..."
          value="${item.name}"
          oninput="searchProduct(${index}, this.value)"
          style="width:100%"
        >
        <div id="list-${index}"></div>
      </td>

      <td>
        <input
          type="number"
          min="1"
          value="${item.qty}"
          onchange="updateQty(${index}, this.value)"
          style="width:50px"
        >
      </td>

      <td>
        <input
          type="number"
          value="${item.price}"
          onchange="updatePrice(${index}, this.value)"
          style="width:70px"
        >
      </td>
    `;

    tbody.appendChild(tr);
  });

  calcTotal();
}

// ===============================
// PRODUCT SEARCH
// ===============================
function searchProduct(index, query) {
  const list = document.getElementById(`list-${index}`);
  list.innerHTML = '';
  if (!query) return;

  const found = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  found.forEach(p => {
    const div = document.createElement('div');
    div.innerText = p.name;
    div.style.cursor = 'pointer';
    div.style.padding = '4px 0';
    div.onclick = () => selectProduct(index, p);
    list.appendChild(div);
  });
}

function selectProduct(index, product) {
  order.items[index].productId = product.id;
  order.items[index].name = product.name;
  order.items[index].price = product.price;
  renderItems();
}

// ===============================
// UPDATE & TOTAL
// ===============================
function updateQty(index, value) {
  order.items[index].qty = Number(value);
  calcTotal();
}

function updatePrice(index, value) {
  order.items[index].price = Number(value);
  calcTotal();
}

function calcTotal() {
  order.total = order.items.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  const totalEl = document.getElementById('totalSum');
  if (totalEl) totalEl.innerText = order.total.toLocaleString();
}

// ===============================
// FINISH PRODUCTS
// ===============================
function finishProducts() {
  haptic('medium');
  renderOrder();
}

// ===============================
// PRINT (58 MM)
// ===============================
function printOrder() {
  if (order.items.length === 0) {
    alert('Нет товаров для печати');
    return;
  }
// СОХРАНЯЕМ ЗАКАЗ
if (typeof getOrders === 'function') {
  const orders = getOrders();

  orders.push({
    id: Date.now(),
    date: new Date().toLocaleString(),
    seller: SELLER_NAME,
    items: order.items,
    total: order.total
  });

  setOrders(orders);
}
  const w = window.open('', '_blank');

  const rows = order.items.map(i => `
    <div class="row">
      <span>${i.name}</span>
      <span>x${i.qty}</span>
      <span>${(i.qty * i.price).toLocaleString()}</span>
    </div>
  `).join('');

  w.document.write(`
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: monospace;
          width: 58mm;
          margin: 0;
          padding: 6px;
          font-size: 12px;
        }
        .center {
          text-align: center;
          margin-bottom: 6px;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
      </style>
    </head>
    <body onload="window.print()">
      <div class="center"><b>USTA MARKET</b></div>
      <div class="center">Список заказа</div>
      <div class="center">Продавец: <b>${SELLER_NAME}</b></div>
      <hr>

      ${rows}

      <hr>
      <div class="row">
        <b>ИТОГО</b>
        <b>${order.total.toLocaleString()} сум</b>
      </div>

      <hr>

<div style="margin-top:12px">
  <div>Подпись:</div>
  <div style="margin-top:20px">______________________</div>
</div>

<hr>
<div class="center">Спасибо!</div>
    </body>
    </html>
  `);

  w.document.close();
}

// ===============================
// BOTTOM BAR NAV
// ===============================
navButtons.forEach(btn => {                                                                                                                                                                  
  btn.onclick = () => {
    haptic();
    screenStack = [];

    const screen = btn.dataset.screen;
    if (screen === 'order') renderOrder();
    if (screen === 'clients') renderClients();
    if (screen === 'products') renderProductsTable();
  };
  // ===============================
// SAVE ORDER (NO PRINT)
// ===============================
function saveOrder() {
  if (order.items.length === 0) {
    alert('Нет товаров для сохранения');
    return;
  }

  if (typeof getOrders === 'function') {
    const orders = getOrders();

    orders.push({
      id: Date.now(),
      date: new Date().toLocaleString(),
      seller: SELLER_NAME,
      items: order.items,
      total: order.total
    });

    setOrders(orders);
  }

  // СБРОС ЗАКАЗА
  order = {
    client: null,
    items: [],
    comment: '',
    total: 0
  };

  alert('Заказ сохранён');
  renderOrder();
}
});// ===============================
// START
// ===============================
renderOrder();
