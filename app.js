// ===============================
// APP CONFIG & MOCK DATA (1C)
// ===============================
const mockData = {
  // Simulating 1C Clients
  clients: [
    "Алишер Строй", "Акбар Оптовик", "Бехруз Маркет",
    "Восит Продукты", "Гранд Отель", "Дильшод Ресторан",
    "Евромаркет", "Зафар Кафе", "Ирода Магазин"
  ],
  // Simulating 1C Products
  products: [
    { name: "Кока-Кола 1.5Л", price: 12000 },
    { name: "Фанта 1.5Л", price: 12000 },
    { name: "Спрайт 1.5Л", price: 12000 },
    { name: "Вода 1Л", price: 3000 },
    { name: "Вода 5Л", price: 10000 },
    { name: "Чай Липтон", price: 8000 },
    { name: "Сок Добрый 1Л", price: 15000 },
    { name: "Нескафе Классик", price: 45000 },
    { name: "Шоколад Сникерс", price: 8000 }
  ]
};

// ===============================
// CORE LOGIC
// ===============================
const app = {
  state: {
    currentOrder: {
      client: '',
      items: [], // { name, qty, price }
    },
    history: JSON.parse(localStorage.getItem('orderHistory') || '[]')
  },

  init() {
    this.render.home();
  },

  // --- VIEWS ---
  views: {
    home() {
      app.render.home();
    },
    history() {
      app.render.history();
    }
  },

  // --- UI ACTIONS ---
  ui: {
    openNewOrder() {
      // Reset State
      app.state.currentOrder = { client: '', items: [] };
      document.getElementById('clientSearch').value = '';
      document.getElementById('productSearch').value = '';
      app.render.orderTable();
      document.getElementById('orderModal').classList.remove('hidden');
    },

    closeOrder() {
      if (app.state.currentOrder.items.length > 0 && !confirm("Закрыть без сохранения?")) return;
      document.getElementById('orderModal').classList.add('hidden');
    }
  },

  // --- SEARCH ENGINE ---
  search: {
    client(query) {
      if (!query) return app.render.hideAutocomplete('clientResults');

      const matches = mockData.clients.filter(c => c.toLowerCase().includes(query.toLowerCase()));
      app.render.autocomplete('clientResults', matches.map(c => ({ label: c, value: c })), (val) => {
        app.state.currentOrder.client = val;
        document.getElementById('clientSearch').value = val;
        app.render.hideAutocomplete('clientResults');
      });
    },

    product(query) {
      if (!query) return app.render.hideAutocomplete('productResults');

      const matches = mockData.products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      app.render.autocomplete('productResults', matches.map(p => ({ label: `${p.name} - ${p.price}`, value: p })), (product) => {
        app.order.addItem(product);
        document.getElementById('productSearch').value = '';
        app.render.hideAutocomplete('productResults');
      });
    }
  },

  // --- ORDER LOGIC ---
  order: {
    addItem(product) {
      const existing = app.state.currentOrder.items.find(i => i.name === product.name);
      if (existing) {
        existing.qty++;
      } else {
        app.state.currentOrder.items.push({
          name: product.name,
          price: product.price,
          qty: 1
        });
      }
      app.render.orderTable();
    },

    updateItem(index, field, value) {
      const item = app.state.currentOrder.items[index];
      if (field === 'qty') item.qty = Number(value);
      if (field === 'price') item.price = Number(value);
      app.render.orderTable();
    },

    removeItem(index) {
      app.state.currentOrder.items.splice(index, 1);
      app.render.orderTable();
    },

    calculateTotal() {
      return app.state.currentOrder.items.reduce((acc, i) => acc + (i.qty * i.price), 0);
    },

    printCurrent() {
      const { client, items } = app.state.currentOrder;
      if (items.length === 0) return alert("Пустой заказ!");

      const draftOrder = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        client: client || "Без клиента",
        items: [...items],
        total: this.calculateTotal()
      };

      app.render.receipt(draftOrder);
      setTimeout(() => window.print(), 300);
    },

    save() {
      const { client, items } = app.state.currentOrder;
      if (!client) return alert("Выберите клиента!");
      if (items.length === 0) return alert("Добавьте товары!");

      const total = this.calculateTotal();

      if (app.state.currentOrder.id) {
        // Edit existing
        const index = app.state.history.findIndex(o => o.id === app.state.currentOrder.id);
        if (index !== -1) {
          app.state.history[index] = {
            ...app.state.history[index],
            client, items, total, date: new Date().toLocaleString()
          };
        }
      } else {
        // Create new
        const order = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          client,
          items: [...items],
          total,
          synced: false
        };
        app.state.history.unshift(order);
      }

      localStorage.setItem('orderHistory', JSON.stringify(app.state.history));
      app.ui.closeOrder();
      app.views.home();
      alert("Сохранено!");
    },

    edit(id) {
      const order = app.state.history.find(o => o.id === id);
      if (!order) return;

      app.state.currentOrder = {
        id: order.id,
        client: order.client,
        items: JSON.parse(JSON.stringify(order.items))
      };

      document.getElementById('clientSearch').value = order.client;
      app.render.orderTable();
      document.getElementById('orderModal').classList.remove('hidden');
    },

    printHistory(id) {
      const order = app.state.history.find(o => o.id === id);
      if (!order) return;
      app.render.receipt(order);
      setTimeout(() => window.print(), 300);
    }
  },

  // --- RENDERERS ---
  render: {
    autocomplete(elementId, items, onSelect) {
      const el = document.getElementById(elementId);
      el.innerHTML = items.map((i, idx) => `
        <div class="ac-item" data-idx="${idx}">${i.label}</div>
      `).join('');
      el.classList.remove('hidden');

      // Event delegation
      el.onclick = (e) => {
        if (e.target.classList.contains('ac-item')) {
          onSelect(items[e.target.dataset.idx].value);
        }
      };
    },

    hideAutocomplete(elementId) {
      document.getElementById(elementId).classList.add('hidden');
    },

    orderTable() {
      const tbody = document.getElementById('orderTableBody');
      const items = app.state.currentOrder.items;

      if (items.length === 0) {
        tbody.innerHTML = '';
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('orderTotal').innerText = "0 UZS";
        return;
      }

      document.getElementById('emptyState').classList.add('hidden');

      tbody.innerHTML = items.map((item, i) => `
        <tr>
          <td>${item.name}</td>
          <td>
            <input class="qty-input" type="number" value="${item.qty}" onchange="app.order.updateItem(${i}, 'qty', this.value)">
          </td>
          <td>
            <input class="price-input" type="number" value="${item.price}" onchange="app.order.updateItem(${i}, 'price', this.value)">
          </td>
          <td>
            <span onclick="app.order.removeItem(${i})" style="color:red; cursor:pointer">✕</span>
          </td>
        </tr>
      `).join('');

      document.getElementById('orderTotal').innerText = app.order.calculateTotal().toLocaleString() + ' UZS';
    },

    receipt(order) {
      const container = document.getElementById('receipt-container');
      const itemsRows = order.items.map(i => `
        <tr>
          <td>${i.name}</td>
          <td style="text-align:right">${i.qty} x ${i.price}</td>
          <td style="text-align:right">${(i.qty * i.price).toLocaleString()}</td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="receipt-header">
          <div class="receipt-title">ЧЕК ПРОДАЖИ</div>
          <div class="receipt-info">${order.date}</div>
          <div class="receipt-info">Клиент: ${order.client}</div>
        </div>
        <table class="receipt-table">
          <thead>
             <tr><th>Твр</th> <th style="text-align:right">К/Ц</th> <th style="text-align:right">Сум</th></tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="receipt-footer">
          ИТОГО: ${order.total.toLocaleString()} UZS
        </div>
        <div style="text-align:center; font-size:10px; margin-top:10px;">
          Спасибо за покупку!
        </div>
      `;
    },

    home() {
      const container = document.getElementById('view-container');
      const lastOrder = app.state.history[0];

      const summaryHtml = lastOrder ? `
         <div class="card">
           <h3 style="margin-top:0">Последняя продажа</h3>
           <div class="flex-between">
             <span>${lastOrder.client}</span>
             <span style="font-weight:bold; color:var(--success)">${lastOrder.total.toLocaleString()} UZS</span>
           </div>
           <div style="font-size:12px; color:#888; margin-top:5px">${lastOrder.date}</div>
         </div>
      ` : `<div style="text-align:center; color:#888; margin-top:20px">Нет продаж сегодня</div>`;

      container.innerHTML = `
        <h2 style="margin-top:0">Главная</h2>
        ${summaryHtml}
        <div style="margin-top:20px; font-size:14px; color:#666">
          Нажмите <span style="font-weight:bold; color:var(--primary)">+</span> чтобы создать новый заказ.
        </div>
      `;
    },

    history() {
      const container = document.getElementById('view-container');
      const list = app.state.history.map(o => `
        <div class="card">
          <div class="flex-between">
            <strong>${o.client}</strong>
            <span style="color:var(--success); font-weight:bold">${o.total.toLocaleString()}</span>
          </div>
          <div style="font-size:12px; color:#888; margin: 5px 0">${o.date} • ${o.items.length} поз.</div>
          
          <div style="display:flex; gap:10px; margin-top:10px; border-top:1px solid #333; padding-top:10px">
             <button style="flex:1; background:#333; color:white; border:none; padding:8px; border-radius:4px" onclick="app.order.edit(${o.id})">✏️ Ред.</button>
             <button style="flex:1; background:#333; color:white; border:none; padding:8px; border-radius:4px" onclick="app.order.printHistory(${o.id})">🖨 Печать</button>
          </div>
        </div>
      `).join('');

      container.innerHTML = `<h2>История</h2>${list || 'Пусто'}`;
    }
  }
};

app.init();