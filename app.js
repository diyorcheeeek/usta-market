// ===============================
// TELEGRAM & UTILS
// ===============================
const tg = Telegram.WebApp;
tg.ready();
tg.expand();

// ===============================
// STATE
// ===============================
const state = {
  admin: tg.initDataUnsafe?.user?.first_name || "Admin",
  products: JSON.parse(localStorage.getItem("products") || "[]"),
  order: [],
  history: JSON.parse(localStorage.getItem("history") || "[]"),
  currentView: 'home'
};

// ===============================
// NAVIGATION & VIEW
// ===============================
function view(html, viewName = 'unknown') {
  const container = document.getElementById("view");
  container.innerHTML = `<div class="fade-in">${html}</div>`;
  state.currentView = viewName;
  updateNav(viewName);
}

function updateNav(viewName) {
  // Update active state of bottom bar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.view === viewName) el.classList.add('active');
  });
}

// ===============================
// HOME
// ===============================
function openHome() {
  view(`
    <h2>👋 Hello, ${state.admin}</h2>
    <div class="card">
      <p>Welcome to your customized shop manager.</p>
      <p>Start by adding products or creating a new order.</p>
    </div>
    
    <div class="card" onclick="openCreate()" style="cursor:pointer">
      <h3 style="margin:0">📝 New Order</h3>
      <p style="margin:5px 0 0 0; font-size:14px">Create a new order quickly</p>
    </div>

    <div class="card" onclick="openProducts()" style="cursor:pointer">
      <h3 style="margin:0">📦 Products</h3>
      <p style="margin:5px 0 0 0; font-size:14px">Manage your catalog (${state.products.length} items)</p>
    </div>
  `, 'home');
}

// ===============================
// PRODUCT CATALOG
// ===============================
function openProducts() {
  const listHtml = state.products.length > 0
    ? state.products.map((p, i) => `
        <div class="product-item">
          <div>
            <strong>${p.name}</strong><br>
            <span style="color:var(--text-secondary); font-size:13px">${p.price} UZS</span>
          </div>
          <button class="del-btn" onclick="deleteProduct(${i})">✕</button>
        </div>
      `).join("")
    : `<p style="text-align:center">No products found.</p>`;

  view(`
    <h2>Products</h2>
    <div class="card">
      <input id="newProdName" placeholder="Product Name">
      <input id="newProdPrice" type="number" placeholder="Price">
      <button class="primary" onclick="addProductToCatalog()">+ Add Product</button>
    </div>
    
    <div class="card">
      ${listHtml}
    </div>
  `, 'products');
}

function addProductToCatalog() {
  const name = document.getElementById("newProdName").value.trim();
  const price = +document.getElementById("newProdPrice").value;

  if (!name || price < 0) return alert("Please enter valid name and price");

  state.products.push({ name, price });
  localStorage.setItem("products", JSON.stringify(state.products));
  openProducts(); // Refresh
}

function deleteProduct(index) {
  if (!confirm("Delete this product?")) return;
  state.products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(state.products));
  openProducts();
}

// ===============================
// CREATE ORDER
// ===============================
function openCreate() {
  state.order = [];

  // Product Select Options
  const productOptions = state.products.length > 0
    ? `<option value="">Select a product...</option>` +
    state.products.map(p => `<option value="${p.name}::${p.price}">${p.name} - ${p.price}</option>`).join("")
    : `<option value="">No products in catalog</option>`;

  view(`
    <h2>New Order</h2>

    <div class="card">
      <input id="clientName" placeholder="Client Name (Optional)">
      <select id="productSelect" onchange="addToOrderFromSelect(this)">
        ${productOptions}
      </select>
      <p style="font-size:12px; text-align:center; margin-top:-10px">Select to add automatically</p>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="col-name">Item</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="orderTable"></tbody>
      </table>
      <p id="total">Total: 0</p>
    </div>

    <button class="primary" onclick="saveOrder()">💾 Save Order</button>
  `, 'create');

  renderOrder();
}

function addToOrderFromSelect(selectEl) {
  const val = selectEl.value;
  if (!val) return;

  const [name, price] = val.split("::");
  state.order.push({
    name,
    qty: 1,
    price: +price || 0
  });

  selectEl.value = ""; // Reset select
  renderOrder();
}

function removeProduct(index) {
  state.order.splice(index, 1);
  renderOrder();
}

function renderOrder() {
  let total = 0;
  const tbody = document.getElementById("orderTable");

  if (state.order.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px">Cart is empty</td></tr>`;
    document.getElementById("total").innerText = "Total: 0";
    return;
  }

  tbody.innerHTML = state.order.map((item, index) => {
    total += item.qty * item.price;
    return `
      <tr>
        <td class="col-name">${item.name}</td>
        <td class="col-qty">
          <input type="number" value="${item.qty}" min="1"
            onchange="state.order[${index}].qty = +this.value; renderOrder()">
        </td>
        <td class="col-price">
          <input type="number" value="${item.price}" min="0"
            onchange="state.order[${index}].price = +this.value; renderOrder()">
        </td>
        <td>
           <button class="action-btn" onclick="removeProduct(${index})">✕</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("total").innerText = "Total: " + total.toLocaleString();
}

function saveOrder() {
  if (state.order.length === 0) return alert("Order is empty!");

  const client = document.getElementById("clientName").value.trim() || "Unknown Client";
  const total = state.order.reduce((acc, i) => acc + (i.qty * i.price), 0);

  const order = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    timestamp: Date.now(),
    client,
    items: state.order,
    total,
    admin: state.admin
  };

  state.history.unshift(order); // Add to top
  localStorage.setItem("history", JSON.stringify(state.history));
  alert("Order Saved!");
  openHistory();
}

// ===============================
// HISTORY & ANALYTICS
// ===============================
function openHistory() {
  const historyHtml = state.history.length > 0
    ? state.history.map(o => `
        <div class="card history-item">
          <div>
            <div class="history-date">${o.date}</div>
            <strong>${o.client}</strong>
            <div style="font-size:12px; margin-top:4px">${o.items.length} items (${o.items.map(i => i.name).join(", ")})</div>
          </div>
          <div class="history-total">
            ${o.total.toLocaleString()}
          </div>
        </div>
      `).join("")
    : `<p style="text-align:center">No history yet.</p>`;

  view(`
    <h2>History</h2>
    <div style="display:flex; gap:10px; margin-bottom:15px">
      <button class="primary" style="padding:10px; font-size:14px" onclick="exportHistory()">📤 Export CSV</button>
      <button class="primary" style="padding:10px; font-size:14px; background:var(--danger-color)" onclick="clearHistory()">🗑 Clear</button>
    </div>
    ${historyHtml}
  `, 'history');
}

function exportHistory() {
  if (state.history.length === 0) return alert("Nothing to export");

  let csv = "Date,Client,Items,Total,Admin\n";
  state.history.forEach(o => {
    const itemsStr = o.items.map(i => `${i.name}(x${i.qty})`).join("; ");
    csv += `${o.date},${o.client},"${itemsStr}",${o.total},${o.admin}\n`;
  });

  navigator.clipboard.writeText(csv).then(() => {
    alert("History copied to clipboard as CSV!");
  });
}

function clearHistory() {
  if (!confirm("Are you sure? This cannot be undone.")) return;
  state.history = [];
  localStorage.setItem("history", "[]");
  openHistory();
}

// ===============================
// INITIALIZATION
// ===============================
// Start at home
openHome();