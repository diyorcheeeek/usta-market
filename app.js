// ===============================
// CORE: STATE & STORAGE
// ===============================
const store = {
  data: {
    products: JSON.parse(localStorage.getItem('products') || '[]'),
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    cart: [],
    user: Telegram.WebApp.initDataUnsafe?.user?.first_name || 'Владелец'
  },

  save() {
    localStorage.setItem('products', JSON.stringify(this.data.products));
    localStorage.setItem('orders', JSON.stringify(this.data.orders));
  },

  addProduct(product) {
    this.data.products.push({ ...product, id: Date.now() });
    this.save();
  },

  deleteProduct(id) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
  },

  createOrder(clientName) {
    if (this.data.cart.length === 0) return false;

    const total = this.data.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const order = {
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU'),
      timestamp: Date.now(),
      client: clientName || 'Клиент',
      items: [...this.data.cart],
      total: total
    };

    this.data.orders.unshift(order);
    this.data.cart = []; // Clear cart
    this.save();
    return true;
  }
};

// ===============================
// UI: VIEWS & COMPONENTS
// ===============================
const app = {
  init() {
    document.getElementById('adminName').textContent = store.data.user;
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    // Initial Render
    this.views.open('dashboard');
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
  },

  views: {
    active: '',

    open(viewName) {
      if (this.active === viewName && viewName !== 'products') return; // Allow products refresh
      this.active = viewName;

      // Update Nav
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === viewName);
      });

      // Render Content
      const container = document.getElementById('app');
      container.innerHTML = ''; // Clear previous

      switch (viewName) {
        case 'dashboard': app.render.dashboard(container); break;
        case 'pos': app.render.pos(container); break;
        case 'products': app.render.products(container); break;
      }
    }
  },

  render: {
    dashboard(container) {
      // Analytics
      const today = new Date().toDateString();
      const todayOrders = store.data.orders.filter(o => new Date(o.timestamp).toDateString() === today);
      const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
      const totalRevenue = store.data.orders.reduce((acc, o) => acc + o.total, 0);

      // Update header total
      document.getElementById('headerTotal').innerText = `${totalRevenue.toLocaleString()} ₸`;

      container.innerHTML = `
        <h2 class="page-title">Сводка</h2>
        
        <div class="card">
          <h3 style="margin-top:0">Сегодня</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-val" style="color:var(--success)">${todayRevenue.toLocaleString()} ₸</span>
              <span class="stat-label">Выручка</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">${todayOrders.length}</span>
              <span class="stat-label">Продаж</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center" style="margin: 20px 0 10px 0;">
          <h3 style="margin:0">Последние чеки</h3>
          <button class="btn btn-sm" onclick="app.views.open('pos')" style="background:var(--bg-elevated)">+ Новый</button>
        </div>

        <div class="history-list">
          ${store.data.orders.length ? store.data.orders.slice(0, 10).map(o => `
            <div class="card product-row">
              <div class="prod-info">
                <h4>${o.client}</h4>
                <p>${o.date} • ${o.items.length} поз.</p>
              </div>
              <div style="font-weight:700; color:var(--success)">+${o.total.toLocaleString()} ₸</div>
            </div>
          `).join('') : '<p class="text-center" style="color:var(--text-scnd)">Нет продаж</p>'}
        </div>
      `;
    },

    pos(container) {
      container.innerHTML = `
        <h2 class="page-title">Касса</h2>
        <div class="pos-grid">
          ${store.data.products.map(p => `
            <div class="pos-item" onclick="app.actions.addToCart(${p.id})">
              <img src="${p.image || 'https://via.placeholder.com/150/2c2c2e/8e8e93?text=No+Img'}" class="pos-img">
              <div class="pos-price">${p.price} ₸</div>
              <div style="font-weight:600; font-size:14px">${p.name}</div>
              <div style="font-size:12px; color:var(--text-scnd)">Остаток: ∞</div>
            </div>
          `).join('')}
          
          <div class="pos-item" style="display:flex; align-items:center; justify-content:center; border:2px dashed var(--border)" onclick="app.views.open('products')">
            <span style="font-size:24px; color:var(--text-scnd)">+</span>
          </div>
        </div>
        
        <div id="cartBar" class="cart-bar hidden" onclick="app.ui.showCartModal()">
          <span style="font-weight:600"><span id="cartCount">0</span> тов.</span>
          <span style="font-weight:700">Итог: <span id="cartTotal">0</span> ₸</span>
        </div>
      `;
      app.ui.updateCartUI();
    },

    products(container) {
      const list = store.data.products.length ? store.data.products.map(p => `
        <div class="product-row">
          <div class="flex items-center gap-10">
            <img src="${p.image || 'https://via.placeholder.com/50/2c2c2e/8e8e93?text='}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">
            <div class="prod-info">
              <h4>${p.name}</h4>
              <p>${p.price.toLocaleString()} ₸</p>
            </div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="app.actions.deleteProduct(${p.id})">✕</button>
        </div>
      `).join('') : '<p class="text-center" style="margin-top:40px; color:var(--text-scnd)">Склад пуст</p>';

      container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h2 class="page-title" style="margin:0">Склад</h2>
          <button class="btn btn-sm btn-primary" onclick="app.ui.showAddProductModal()">+ Товар</button>
        </div>
        <div class="card">
          ${list}
        </div>
      `;
    }
  },

  ui: {
    showModal(title, html) {
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('modalBody').innerHTML = html;
      document.getElementById('modalOverlay').classList.remove('hidden');
    },

    closeModal() {
      document.getElementById('modalOverlay').classList.add('hidden');
    },

    showAddProductModal() {
      this.showModal('Новый товар', `
        <input id="newProdName" placeholder="Название товара">
        <input id="newProdPrice" type="number" placeholder="Цена продажи">
        <input id="newProdImg" placeholder="Ссылка на фото (необяз.)">
        <button class="btn btn-primary" onclick="app.actions.submitNewProduct()">Сохранить</button>
      `);
    },

    showCartModal() {
      const total = store.data.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
      const itemsHtml = store.data.cart.map((item, idx) => `
        <div class="product-row">
           <div class="prod-info">
             <h4>${item.name}</h4>
             <p>${item.price} ₸ x ${item.qty}</p>
           </div>
           <div class="flex items-center gap-10">
              <button class="btn btn-sm" onclick="app.actions.updateCartQty(${idx}, -1)">-</button>
              <span>${item.qty}</span>
              <button class="btn btn-sm" onclick="app.actions.updateCartQty(${idx}, 1)">+</button>
           </div>
        </div>
      `).join('');

      this.showModal('Корзина', `
        <div style="margin-bottom:20px">${itemsHtml}</div>
        <div class="flex justify-between" style="font-size:18px; font-weight:700; margin-bottom:20px; border-top:1px solid var(--border); padding-top:10px;">
          <span>Итого:</span>
          <span>${total.toLocaleString()} ₸</span>
        </div>
        <input id="clientName" placeholder="Имя клиента (необяз.)">
        <button class="btn btn-primary" onclick="app.actions.checkout()">✅ Провести продажу</button>
      `);
    },

    updateCartUI() {
      const count = store.data.cart.reduce((acc, i) => acc + i.qty, 0);
      const total = store.data.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
      const bar = document.getElementById('cartBar');

      if (bar) {
        if (count > 0) {
          bar.classList.remove('hidden');
          document.getElementById('cartCount').innerText = count;
          document.getElementById('cartTotal').innerText = total.toLocaleString();
        } else {
          bar.classList.add('hidden');
        }
      }
    }
  },

  actions: {
    submitNewProduct() {
      const name = document.getElementById('newProdName').value;
      const price = +document.getElementById('newProdPrice').value;
      const image = document.getElementById('newProdImg').value; // Optional

      if (!name || !price) return alert('Введите название и цену');

      store.addProduct({ name, price, image });
      app.ui.closeModal();
      app.views.open('products'); // Refresh
    },

    deleteProduct(id) {
      if (confirm('Удалить товар?')) {
        store.deleteProduct(id);
        app.views.open('products');
      }
    },

    addToCart(id) {
      const product = store.data.products.find(p => p.id === id);
      if (!product) return;

      // Haptic feedback
      Telegram.WebApp.HapticFeedback.impactOccurred('light');

      const existing = store.data.cart.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        store.data.cart.push({ ...product, qty: 1 });
      }
      app.ui.updateCartUI();
    },

    updateCartQty(idx, change) {
      const item = store.data.cart[idx];
      item.qty += change;
      if (item.qty <= 0) store.data.cart.splice(idx, 1);

      app.ui.updateCartUI();
      // Re-render modal is handled by closing/reopening or we need reactive render
      // For simplicity, we just close modal if empty or refresh content manually
      // Here we just close to force re-open for simple state mgmt
      app.ui.closeModal();
      if (store.data.cart.length > 0) app.ui.showCartModal();
    },

    checkout() {
      const client = document.getElementById('clientName').value;
      if (store.createOrder(client)) {
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        app.ui.closeModal();
        app.views.open('dashboard');
      }
    }
  }
};

// Start
app.init();