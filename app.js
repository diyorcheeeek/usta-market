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
  if (prev === 'order') renderOrder();
  if (prev === 'clients') renderClients();
  if (prev === 'products') renderProducts();
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
        onchange="order.comment=this.value"
      ></textarea>

      <p><strong>Итого:</strong> ${order.total.toLocaleString()} сум</p>

      <button class="btn primary" onclick="printOrder()">🖨 Печать</button>
      <br><br>

      <button class="btn" onclick="saveOrder()">💾 Сохранить заказ</button>
    </div>
  `;
}

function renderClients() {
  currentScreen = 'clients';
  setHeader('Клиенты', true);

  content.innerHTML = `
    <div class="card">
      <p>📋 Список клиентов</p>
      <p style="color:#6b7280">(позже будет из 1С)</p>
    </div>
  `;
}

function renderProducts() {
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
  renderProducts();
}

// ===============================
// ITEMS
// ===============================
function addItem() {
  haptic();
  order.items.push({ name: '', qty: 1, price: 0 });
  renderItems();
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
  order.total = order.items.reduce(
    (s, i) => s + i.qty * i.price, 0
  );
  const el = document.getElementById('totalSum');
  if (el) el.innerText = order.total.toLocaleString();
}

// ===============================
// FINISH PRODUCTS
// ===============================
function finishProducts() {
  haptic('medium');
  renderOrder();
}

// ===============================
// SAVE ORDER
// ===============================
function saveOrder() {
  if (order.items.length === 0) {
    alert('Нет товаров');
    return;
  }

  const saved = JSON.parse(localStorage.getItem('orders') || '[]');
  saved.push({
    id: Date.now(),
    date: new Date().toLocaleString(),
    items: order.items,
    total: order.total
  });
  localStorage.setItem('orders', JSON.stringify(saved));

  order = { client: null, items: [], comment: '', total: 0 };
  haptic('medium');
  renderOrder();
}

// ===============================
// PRINT (ANDROID / 58MM)
// ===============================
function printOrder() {
  if (order.items.length === 0) {
    alert('Нет товаров');
    return;
  }

  const w = window.open('', '_self');
  w.document.write(`
    <pre style="font-family:monospace">
USTA MARKET
----------------
${order.items.map(i =>
`${i.name}
${i.qty} x ${i.price} = ${i.qty*i.price}`
).join('\n')}
----------------
ИТОГО: ${order.total}
    </pre>
    <script>window.print()</script>
  `);
  w.document.close();
}

// ===============================
// BOTTOM BAR
// ===============================
navButtons.forEach(b => {
  b.onclick = () => {
    haptic();
    screenStack = [];
    const s = b.dataset.screen;
    if (s === 'order') renderOrder();
    if (s === 'clients') renderClients();
    if (s === 'products') renderProducts();
  };
});

// ===============================
// START
// ===============================
renderOrder();
