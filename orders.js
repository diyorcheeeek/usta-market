// ===============================
// ORDERS HISTORY (SAFE MODULE)
// ===============================

// гарантируем массив заказов
window.getOrders = function () {
  return JSON.parse(localStorage.getItem('orders') || '[]');
};

window.setOrders = function (orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// ===============================
// SCREEN: ORDERS LIST
// ===============================
window.renderOrders = function () {
  if (!window.content || !window.setHeader) return;

  setHeader('История заказов', true);

  const orders = getOrders();

  if (!orders.length) {
    content.innerHTML = `
      <div class="card">
        <p>Заказов пока нет</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      ${orders.map(o => `
        <div style="padding:10px;border-bottom:1px solid #e5e7eb">
          <b>№${o.id}</b><br>
          ${o.date || ''}<br>
          <b>${o.total.toLocaleString()} сум</b>
          <br><br>

          <button class="btn" onclick="viewSavedOrder(${o.id})">👁 Открыть</button>
          <button class="btn" onclick="reprintSavedOrder(${o.id})">🖨 Печать</button>
        </div>
      `).join('')}
    </div>
  `;
};

// ===============================
// VIEW ORDER
// ===============================
window.viewSavedOrder = function (id) {
  const orders = getOrders();
  const o = orders.find(x => x.id === id);
  if (!o) return;

  setHeader(`Заказ №${o.id}`, true);

  content.innerHTML = `
    <div class="card">
      <p><b>Дата:</b> ${o.date || ''}</p>
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
};

// ===============================
// REPRINT
// ===============================
window.reprintSavedOrder = function (id) {
  const orders = getOrders();
  const o = orders.find(x => x.id === id);
  if (!o) return;

  // используем ТВОЮ рабочую печать
  if (typeof printOrder === 'function') {
    printOrder(o);
  } else {
    alert('Функция печати недоступна');
  }
};

// ===============================
// BOTTOM BAR EXTENSION
// ===============================
document.querySelectorAll('.nav-btn').forEach(btn => {
  if (btn.dataset.screen === 'orders') {
    btn.onclick = () => {
      if (typeof haptic === 'function') haptic();
      renderOrders();
    };
  }
});
