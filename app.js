console.log('APP JS START');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM READY');

  const title = document.getElementById('pageTitle');
  const content = document.getElementById('content');

  title.innerText = 'Создание заказа';
  content.innerHTML = `
    <div class="card">
      <b>JS РАБОТАЕТ ✅</b><br><br>
      Если ты видишь этот текст — всё живо.
    </div>
  `;
});
