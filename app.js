const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что Mini App готов
tg.ready();

// Растягиваем на весь экран
tg.expand();

// Можно получить Telegram ID
console.log("User:", tg.initDataUnsafe?.user);
