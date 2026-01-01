// ===============================
// TELEGRAM INIT
// ===============================
const tg = window.Telegram?.WebApp;
tg?.ready();

// ===============================
// SELLER
// ===============================
const SELLER_NAME = 'Avazbek';

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
// DATA
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
// NAV STACK
// ===============================
let screenStack = [];
let currentScreen = 'order';

function setHeader(text, withBack = false) {
  if (withBack) {
    title.innerHTML = `<span id="backBtn">⬅️</span> ${text}`;
    document.getElementById('backBtn').onclick = () => {
      haptic(); goBack();
    };
  } else title.innerText = text;
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
      <button class="btn" onclick="openProducts()">📦 Добавить товары</button><br><br>

      <textarea placeholder="Комментарий"
        style="width:100%;height:80px"
        onchange="order.comment=this.value"></textarea>

      <p><b>Итого:</b> ${order.total.toLocaleString()} сум</p>

      <button class="btn" onclick="saveOrder()">💾 Сохранить</button>
      <button class="btn primary" onclick="printOrder()">🖨 Печать</button>
    </div>
  `;
}

function renderClients() {
  currentScreen = 'clients';
  setHeader('Клиенты', true);
  content.innerHTML = `<div class="card">(будет из 1С)</div>`;
}

function renderProductsTable() {
  currentScreen = 'products';
  setHeader('Добавление товаров', true);

  content.innerHTML = `
    <div class="card">
      <table width="100%">
        <thead>
          <tr><th>Товар</th><th>Кол-во</th><th>Цена</th></tr>
        </thead>
        <tbody id="itemsTable"></tbody>
      </table><br>
      <button class="btn" onclick="addItemRow()">➕ Добавить</button><br><br>
      <b>Итого: <span id="totalSum">0</span> сум</b><br><br>
      <button class="btn primary" onclick="finishProducts()">Готово</button>
    </div>
  `;
  renderItems();
}

// ===============================
// HELPERS
// ===============================
function openProducts() {
  screenStack.push(currentScreen);
  renderProductsTable();
}

// ===============================
// ITEMS
// ===============================
function addItemRow() {
  order.items.push({ name: '', qty: 1, price: 0 });
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById('itemsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  order.items.forEach((item, i) => {
    tbody.innerHTML += `
      <tr>
        <td><input value="${item.name}" oninput="searchProduct(${i}, this.value)"></td>
        <td><input type="number" value="${item.qty}" onchange="updateQty(${i}, this.value)"></td>
        <td><input type="number" value="${item.price}" onchange="updatePrice(${i}, this.value)"></td>
      </tr>
      <tr><td colspan="3" id="list-${i}"></td></tr>
    `;
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

  products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    .forEach(p => {
      const d = document.createElement('div');
      d.innerText = p.name;
      d.onclick = () => {
        order.items[i] = { name: p.name, qty: 1, price: p.price };
        renderItems();
      };
      list.appendChild(d);
    });
}

// ===============================
// TOTAL
// ===============================
function updateQty(i, v) { order.items[i].qty = +v; calcTotal(); }
function updatePrice(i, v) { order.items[i].price = +v; calcTotal(); }

function calcTotal() {
  order.total = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const el = document.getElementById('totalSum');
  if (el) el.innerText = order.total.toLocaleString();
}

// ===============================
// FINISH
// ===============================
function finishProducts() { renderOrder(); }

// ===============================
// SAVE
// ===============================
function saveOrder() {
  const validItems = order.items.filter(i => i.name && i.qty > 0);
  if (!validItems.length) return alert('Нет товаров');

  if (typeof getOrders === 'function') {
    const orders = getOrders();
    orders.push({
      id: Date.now(),
      date: new Date().toLocaleString(),
      seller: SELLER_NAME,
      items: validItems,
      total: order.total
    });
    setOrders(orders);
  }

  order = { client:null, items:[], comment:'', total:0 };
  alert('Заказ сохранён');
  renderOrder();
}

// ===============================
// PRINT
// ===============================
function printOrder() {
  const validItems = order.items.filter(i => i.name && i.qty > 0);
  if (!validItems.length) return alert('Нет товаров');

  const w = window.open('', '_blank');
  w.document.write(`
    <pre style="font-family:monospace">
USTA MARKET
Продавец: ${SELLER_NAME}
----------------
${validItems.map(i => `${i.name}\n${i.qty} x ${i.price} = ${i.qty*i.price}`).join('\n')}
----------------
ИТОГО: ${order.total}
    </pre>
    <script>window.print()</script>
  `);
  w.document.close();

  order = { client:null, items:[], comment:'', total:0 };
  renderOrder();
}

// ===============================
// NAV
// ===============================
navButtons.forEach(btn => {
  btn.onclick = () => {
    const s = btn.dataset.screen;
    if (s === 'order') renderOrder();
    if (s === 'clients') renderClients();
    if (s === 'products') renderProductsTable();
  };
});

// ===============================
// START
// ===============================
renderOrder();
