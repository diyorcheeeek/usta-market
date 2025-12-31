// ===============================
// TELEGRAM INIT
// ===============================
const tg = window.Telegram?.WebApp;
tg?.ready();

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
// DATA (позже будет 1С)
// ===============================
const products = [
  { id: 1, name: 'Цемент М500', price: 75000 },
  { id: 2, name: 'Песок', price: 30000 },
  { id: 3, name: 'Щебень', price: 45000 },
  { id: 4, name: 'Гипс', price: 28000 }
];

let order = {
  items: [],
  total: 0
};

// ===============================
// NAV STACK
// ===============================
let screenStack = [];
let currentScreen = 'order';

function setHeader(text, back = false) {
  title.innerHTML = back
    ? <span id="backBtn">⬅️</span> ${text}
    : text;

  if (back) {
    document.getElementById('backBtn').onclick = () => {
      haptic();
      goBack();
    };
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
        <button class="btn" onclick="openProducts()">📦 Добавить товары</button><br><br>
        <p><b>Итого:</b> ${order.total.toLocaleString()} сум</p>
        <button class="btn primary" onclick="openReceipt()">🖨 Печать</button>
      </div>
    `;
  },

  products() {
    currentScreen = 'products';
    setHeader('Товары', true);

    content.innerHTML = `
      <div class="card">
        <table width="100%">
          <thead>
            <tr><th>Товар</th><th>Кол</th><th>Цена</th></tr>
          </thead>
          <tbody id="itemsTable"></tbody>
        </table>
        <br>
        <button class="btn" onclick="addItem()">➕ Добавить</button>
      </div>
    `;
    renderItems();
  }
};

// ===============================
// PRODUCTS
// ===============================
function openProducts() {
  screenStack.push(currentScreen);
  screens.products();
}

function addItem() {
  order.items.push({ name: '', qty: 1, price: 0 });
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById('itemsTable');
  tbody.innerHTML = '';

  order.items.forEach((i, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input value="${i.name}" oninput="search(${idx}, this.value)">
        <div id="list-${idx}"></div>
      </td>
      <td><input type="number" value="${i.qty}" onchange="setQty(${idx}, this.value)"></td>
      <td><input type="number" value="${i.price}" onchange="setPrice(${idx}, this.value)"></td>
    `;
    tbody.appendChild(tr);
  });
  calcTotal();
}

function search(idx, q) {
  const list = document.getElementById(`list-${idx}`);
  list.innerHTML = '';
  products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    .forEach(p => {
      const d = document.createElement('div');
      d.innerText = p.name;
      d.onclick = () => {
        order.items[idx].name = p.name;
        order.items[idx].price = p.price;
        renderItems();
      };
      list.appendChild(d);
    });
}

function setQty(i, v) { order.items[i].qty = +v; calcTotal(); }
function setPrice(i, v) { order.items[i].price = +v; calcTotal(); }

function calcTotal() {
  order.total = order.items.reduce((s, i) => s + i.qty * i.price, 0);
}

// ===============================
// PRINT (SAFE)
// ===============================
function openReceipt() {
  if (!order.items.length) {
    tg.showAlert('Нет товаров');
    return;
  }

  const text = `
USTA MARKET
----------------
${order.items.map(i =>
`${i.name}
x${i.qty} = ${(i.qty*i.price).toLocaleString()}`
).join('\n')}
----------------
ИТОГО: ${order.total.toLocaleString()} сум
`;

  tg.showPopup({
    title: 'Чек',
    message: text,
    buttons: [{ type: 'ok', text: 'Закрыть' }]
  });
}

// ===============================
// BOTTOM NAV
// ===============================
navButtons.forEach(btn => {
  btn.onclick = () => {
    haptic();
    screenStack = [];
    screens[btn.dataset.screen]();
  };
});

// ===============================
// START
// ===============================
screens.order();
