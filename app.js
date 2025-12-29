innerText = 'Клиенты';
    const clients = getClients();

    content.innerHTML = `
      <div class="card">
        <h3>Клиенты</h3>

        ${clients.map((c, i) => `
          <div class="client-row" data-index="${i}">
            👤 <b>${c.name}</b><br>📞 ${c.phone}
          </div>
        `).join('')}

        <br>
        <button class="action-btn primary" id="addClientBtn">
          ➕ Добавить клиента
        </button>
      </div>
    `;

    document.querySelectorAll('.client-row').forEach(row => {
      row.onclick = () => {
        selectedClient = clients[row.dataset.index];
        haptic();
        renderOrder();
        setActive(document.querySelector('[data-screen="order"]'));
      };
    });

    document.getElementById('addClientBtn').onclick = () => {
      haptic();
      renderAddClient();
    };
  }

  function renderAddClient() {
    title.innerText = 'Новый клиент';
    content.innerHTML = `
      <div class="card">
        <input id="name" placeholder="Имя" style="width:100%;margin-bottom:8px;">
        <input id="phone" placeholder="Телефон" style="width:100%;margin-bottom:8px;">
        <button class="action-btn primary" id="saveClientBtn">
          Сохранить
        </button>
      </div>
    `;

    document.getElementById('saveClientBtn').onclick = () => {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if (!name || !phone) return tg?.showAlert('Заполни поля');

      const clients = getClients();
      clients.push({ id: Date.now(), name, phone });
      saveClients(clients);

      haptic('medium');
      renderClients();
    };
  }

  /* ===== NAV ===== */

  navButtons.forEach(btn => {
    btn.onclick = () => {
      haptic();
      setActive(btn);
      if (btn.dataset.screen === 'order') renderOrder();
      if (btn.dataset.screen === 'clients') renderClients();
      if (btn.dataset.screen === 'products') renderProducts();
    };
  });

  /* ===== INIT ===== */
  setActive(document.querySelector('.nav-btn.center'));
  renderOrder();
});
