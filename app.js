const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// HAPTIC
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    tg.HapticFeedback?.impactOccurred('medium');
    switchScreen(btn.dataset.screen);
  });
});

function switchScreen(screen) {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card big">
    <h2 style="font-size:32px">${screen.toUpperCase()}</h2>
    <p style="font-size:24px">Экран в разработке</p>
  </div>`;
}
