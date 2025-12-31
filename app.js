// ===============================
// TELEGRAM INIT
// ===============================
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

// ===============================
// ELEMENTS
// ===============================
const title = document.getElementById('pageTitle');
const content = document.getElementById('content');
const navButtons = document.querySelectorAll('.nav-btn');

// ===============================
// HAPTIC
// ===============================
function haptic(type = 'light') {
  try { tg?.HapticFeedback?.impactOccurred(type); } catch {}
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

let orders = JSON.parse(localStorage.getItem('orders') || '[]');

// ===============================
// NAV STACK (НАЗАД)
// ===============================
let screenStack = [];
let currentScreen = 'order';

function setHeader(text, withBack = false) {
  if (withBack) {
    title.innerHTML = `
      <span id="backBtn" style="cursor:pointer;margin-right:8px">⬅️</span>
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
  screens[prev]();
}

// ===============================
// SCREENS
// ===============================
const screens = {
  order() {
    currentScreen = 'order';
    setHeader('Создание заказа');

    content.innerHTML = `
      <div class="card">
        <button class="btn" onclick="openProducts()">📦 Добавить товары</button>
        <br><br>

        <textarea
          placeholder="Комментарий к заказу"
          style="width:100%;height:80px"
          onchange="order.comment=this.value"
        ></textarea>

        <p><strong>Итого:</strong> ${order.total.toLocaleString()} сум</p>

        <button class="btn primary" onclick="printOrder(order)">🖨 Печать</button>
        <br><br>

        <button class="btn" onclick="saveOrder()">💾 Сохранить заказ</button>
      </div>
    `;
  },

  products() {
    currentScreen = 'products';
    setHeader('Добавление товаров', true);

    content.innerHTML = `
      <div class="card">
        <table style="width:100%">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody id="itemsTable"></tbody>
        </table>

        <br>
        <button class="btn" onclick="addItem()">➕ Добавить строку</button>
        <br><br>

        <strong>Итого: <span id="totalSum">0</span> сум</strong>
        <br><br>

        <button class="btn primary" onclick="finishProducts()">Готово</button>
      </div>
    `;
    renderItems();
  },

  orders() {
    currentScreen = 'orders';
    setHeader('История заказов', true);

    if (!orders.length) {
      content.innerHTML = <div class="card">Нет заказов</div>;
      return;
    }

    content.innerHTML = `
      <div class="card">
        ${orders.map(o => `
          <div style="padding:10px;border-bottom:1px solid #e5e7eb">
            <b>№${o.id}</b><br>
            ${o.date}<br>
            <b>${o.total.toLocaleString()} сум</b><br><br>

            <button class="btn" onclick="viewOrder(${o.id})">👁 Открыть</button>
            <button class="btn" onclick="printOrderById(${o.id})">🖨 Печать</button>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// ===============================
// OPEN HELPERS
// ===============================
function openProducts() {
  screenStack.push(currentScreen);
  screens.products();
}

// ===============================
// ITEMS
// ===============================
function addItem() {
  haptic();
  order.items.push({ name: '', qty: 1, price: 0 });renderItems();
}

function renderItems() {
  const tbody = document.getElementById('itemsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  order.items.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input value="${item.name}" placeholder="Название"
          oninput="searchProduct(${i}, this.value)">
        <div id="list-${i}"></div>
      </td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          onchange="updateQty(${i}, this.value)">
      </td>
      <td>
        <input type="number" value="${item.price}"
          onchange="updatePrice(${i}, this.value)">
      </td>
    `;
    tbody.appendChild(tr);
  });
  calcTotal();
}

// ===============================
// SEARCH
// ===============================
function searchProduct(i, q) {
  const list = document.getElementById(`list-${i}`);
  list.innerHTML = '';
  if (!q) return;

  products
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    .forEach(p => {
      const d = document.createElement('div');
      d.innerText = p.name;
      d.onclick = () => {
        order.items[i].name = p.name;
        order.items[i].price = p.price;
        renderItems();
      };
      list.appendChild(d);
    });
}

// ===============================
// TOTAL
// ===============================
function updateQty(i, v) {
  order.items[i].qty = Number(v);
  calcTotal();
}

function updatePrice(i, v) {
  order.items[i].price = Number(v);
  calcTotal();
}

function calcTotal() {
  order.total = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const el = document.getElementById('totalSum');
  if (el) el.innerText = order.total.toLocaleString();
}

// ===============================
// FINISH PRODUCTS
// ===============================
function finishProducts() {
  haptic('medium');
  screens.order();
}

// ===============================
// SAVE ORDER
// ===============================
function saveOrder() {
  if (!order.items.length) {
    alert('Нет товаров');
    return;
  }

  orders.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    items: order.items,
    total: order.total
  });

  localStorage.setItem('orders', JSON.stringify(orders));

  order = { client: null, items: [], comment: '', total: 0 };
  haptic('medium');
  screens.order();
}

// ===============================
// VIEW ORDER
// ===============================
function viewOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;

  screenStack.push(currentScreen);
  setHeader(`Заказ №${o.id}`, true);

  content.innerHTML = `
    <div class="card">
      <p><b>Дата:</b> ${o.date}</p>
      <hr>
      ${o.items.map(i => `
        <div style="display:flex;justify-content:space-between">
          <span>${i.name}</span>
          <span>${i.qty} x ${i.price}</span>
          <span>${(i.qty * i.price).toLocaleString()}</span>
        </div>
      `).join('')}
      <hr>
      <b>ИТОГО: ${o.total.toLocaleString()} сум</b>
    </div>
  `;
}

// ===============================
// PRINT
// ===============================
function printOrder(data) {
  if (!data.items.length) return;

  const w = window.open('', '_self');
  w.document.write(`
    <pre style="font-family:monospace">
USTA MARKET
----------------
${data.items.map(i =>
`${i.name}
${i.qty} x ${i.price} = ${i.qty * i.price}`
).join('\n')}
----------------
ИТОГО: ${data.total}
    </pre>
    <script>window.print()</script>
  `);
  w.document.close();
}

function printOrderById(id) {
  const o = orders.find(x => x.id === id);
  if (o) printOrder(o);
}

// ===============================
// BOTTOM BAR
// ===============================
navButtons.forEach(b => {
  b.onclick = () => {
    haptic();
    screenStack = [];
    const s = b.dataset.screen;
    if (s === 'order') screens.order();
    if (s === 'products') screens.products();
    if (s === 'orders') screens.orders();
  };
});

// ===============================
// START
// ===============================
screens.order();
