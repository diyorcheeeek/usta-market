document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  const title = document.getElementById('pageTitle');
  const content = document.getElementById('content');
  const navButtons = document.querySelectorAll('.nav-btn');

  let selectedClient = null;
  let orderItems = [];
  let screenStack = [];
  let currentScreen = 'order';

  /* ===== HELPERS ===== */

  function haptic(type = 'light') {
    tg?.HapticFeedback?.impactOccurred(type);
  }

  function setHeader(text, back = false) {
    title.innerHTML = back
      ? `⬅️ <span id="backBtn">${text}</span>`
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
    if (prev === 'order') renderOrder();
  }

  /* ===== DATA (ЗАГЛУШКИ → 1С) ===== */

  function getProducts() {
    return [
      { id: 'p1', name: 'Цемент М500', price: 75000 },
      { id: 'p2', name: 'Кирпич красный', price: 1200 },
      { id: 'p3', name: 'Песок (мешок)', price: 30000 }
    ];
  }

  /* ===== ORDER ===== */

  function calcTotal() {
    return orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderOrder() {
    currentScreen = 'order';
    setHeader('Создание заказа');

    content.innerHTML = `
      <div class="card">
        <button class="action-btn" id="addProductsBtn">
          ➕ Добавить товары
        </button><br><br>

        ${orderItems.length === 0 ? 'Товары не добавлены' :
          orderItems.map(i =>
            `<div>${i.name} — ${i.qty} × ${i.price}</div>`
          ).join('')
        }

        <hr>
        <b>Итого: ${calcTotal()} сум</b>
      </div>
    `;

    document.getElementById('addProductsBtn').onclick = () => {
      haptic();
      screenStack.push('order');
      renderProductsTable();
    };
  }

  /* ===== PRODUCTS TABLE ===== */

  function renderProductsTable() {
    currentScreen = 'products';
    setHeader('Добавление товаров', true);

    let rows = [{ product: null, qty: 1, price: 0 }];

    function render() {
      const products = getProducts();

      content.innerHTML = `
        <div class="card">
          ${rows.map((r, idx) => `
            <div style="margin-bottom:12px">
              <input placeholder="Товар"
                value="${r.product?.name || ''}"
                data-search="${idx}"
                style="width:100%;margin-bottom:4px">

              <input type="number" value="${r.qty}"
                data-qty="${idx}" style="width:30%">

              <input type="number" value="${r.price}"
                data-price="${idx}" style="width:60%">
            </div>
          `).join('')}

          <button id="addRow" class="action-btn">➕ Строка</button><br><br>
          <button id="done" class="action-btn primary">Готово</button>
        </div>
      `;

      /* SEARCH */
      rows.forEach((r, idx) => {
        const input = document.querySelector(`[data-search="${idx}"]`);
        input.oninput = e => {
          const q = e.target.value.toLowerCase();
          const found = products.find(p =>
            p.name.toLowerCase().includes(q)
          );
          if (found) {
            rows[idx].product = found;
            rows[idx].price = found.price;
            render();
          }
        };

        document.querySelector(`[data-qty="${idx}"]`).oninput =
          e => rows[idx].qty = +e.target.value;

        document.querySelector(`[data-price="${idx}"]`).oninput =
          e => rows[idx].price = +e.target.value;
      });

      document.getElementById('addRow').onclick = () => {
        haptic();
        rows.push({ product: null, qty: 1, price: 0 });
        render();
      };

      document.getElementById('done').onclick = () => {
        orderItems = rows
          .filter(r => r.product)
          .map(r => ({
            ...r.product,
            qty: r.qty,
            price: r.price
          }));
        haptic('medium');
        renderOrder();
      };
    }

    render();
  }

  /* ===== INIT ===== */
  renderOrder();
});
