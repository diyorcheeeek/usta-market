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
  try {
    tg?.HapticFeedback?.impactOccurred(type);
  } catch {}
}

// ===============================
// DATA (потом будет 1С)
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
  render(prev);
}

// ===============================
// SCREENS
// ===============================
function render(screen) {
  currentScreen = screen;

  if (screen === 'order') {
    setHeader('Создание заказа');

    content.innerHTML = `
      <div class="card">
        <button class="btn" onclick="openProducts()">📦 Добавить товары</button>
        <br><br>

        <p><b>Итого:</b> ${order.total.toLocaleString()} сум</p>

        <button class="btn primary" onclick="printOrder()">🖨 Печать</button>
      </div>
    `;
  }

  if (screen === 'products') {
    setHeader('Товары', true);

    content.innerHTML = `
      <div class="card">
        <table width="100%">
          <thead>
            <tr>
              <th>Товар</th>
              <th width="50">Кол</th>
              <th width="80">Цена</th>
            </tr>
          </thead>
          <tbody id="itemsTable"></tbody>
        </table>

        <br>
        <button class="btn" onclick="addItem()">➕ Добавить</button>
      </div>
    `;

    renderItems();
  }
}

// ===============================
// PRODUCTS
// ===============================
function openProducts() {
  screenStack.push(currentScreen);
  render('products');
}

function addItem() {
  order.items.push({ name: '', qty: 1, price: 0 });
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById('itemsTable');
  tbody.innerHTML = '';

  order.items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input
          placeholder="Начни вводить"
          value="${item.name}"
          oninput="searchProduct(${index}, this.value)"
        >
        <div id="list-${index}"></div>
      </td>

      <td>
        <input type="number" value="${item.qty}"
          onchange="setQty(${index}, this.value)">
      </td>

      <td>
        <input type="number" value="${item.price}"
          onchange="setPrice(${index}, this.value)">
      </td>
    `;
    tbody.appendChild(tr);
  });

  calcTotal();
}

function searchProduct(index, query) {
  const list = document.getElementById(`list-${index}`);
  list.innerHTML = '';

  if (!query) return;

  products
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .forEach(p => {
      const div = document.createElement('div');
      div.innerText = p.name;
      div.onclick = () => {
        order.items[index].name = p.name;
        order.items[index].price = p.price;
        renderItems();
      };
      list.appendChild(div);
    });
}

function setQty(i, v) {
  order.items[i].qty = Number(v);
  calcTotal();
}

function setPrice(i, v) {
  order.items[i].price = Number(v);
  calcTotal();
}

function calcTotal() {
  order.total = order.items.reduce(
    (s, i) => s + i.qty * i.price,
    0
  );
}

// ===============================
// PRINT (ПЕРВЫЙ ПРОСТОЙ ВАРИАНТ)
// ===============================
function printOrder() {
  if (!order.items.length) {
    alert('Нет товаров для печати');
    return;
  }

  let html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: monospace;
          width: 58mm;
          margin: 0;
          padding: 6px;
        }
        .center { text-align: center; }
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
      <hr>
  `;

  order.items.forEach(i => {
    html += `
      <div class="row">
        <span>${i.name}</span>
        <span>x${i.qty}</span>
        <span>${(i.qty * i.price).toLocaleString()}</span>
      </div>
    `;
  });

  html += `
      <hr>
      <div class="row">
        <b>ИТОГО</b>
        <b>${order.total.toLocaleString()} сум</b>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_self');
  w.document.write(html);
  w.document.close();
}

// ===============================
// BOTTOM NAV
// ===============================
navButtons.forEach(btn => {
  btn.onclick = () => {
    haptic();
    screenStack = [];
    render(btn.dataset.screen);
  };
});

// ===============================
// START
// ===============================
render('order');
