let originalTitle = document.title;
let titleTimer: number | undefined;

const welcome = 'Welcome back! (≧▽≦)';
const goodbye = 'See you next time~ (｡･ω･)ﾉﾞ';

function showWelcome() {
  window.clearTimeout(titleTimer);

  document.title = welcome;

  titleTimer = window.setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

document.addEventListener('astro:page-load', () => {
  originalTitle = document.title;

  if (!document.hidden) {
    showWelcome();
  }
});

document.addEventListener('visibilitychange', () => {
  window.clearTimeout(titleTimer);

  if (document.hidden) {
    document.title = goodbye;
    titleTimer = window.setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  } else {
    showWelcome();
  }
});