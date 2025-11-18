// Tema Yönetimi

// Tema sabitleri
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Varsayılan tema
const DEFAULT_THEME = THEMES.LIGHT;

// Tema'yı localStorage'da sakla
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}

// Tema'yı localStorage'dan al
function getTheme() {
  return localStorage.getItem('theme') || DEFAULT_THEME;
}

// Tema'yı localStorage'dan sil
function removeTheme() {
  localStorage.removeItem('theme');
}

// Tema değiştirme fonksiyonu
function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  saveTheme(newTheme);
  applyTheme(newTheme);
  return newTheme;
}

// Tema uygulama fonksiyonu
function applyTheme(theme) {
  if (theme === THEMES.DARK) {
    document.documentElement.classList.add('dark');
    document.body.classList.remove('bg-gray-100');
    document.body.classList.add('bg-gray-900', 'text-white');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('bg-gray-900', 'text-white');
    document.body.classList.add('bg-gray-100');
  }
}

// Sayfa yüklendiğinde tema uygula
function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}

export {
  THEMES,
  DEFAULT_THEME,
  saveTheme,
  getTheme,
  removeTheme,
  toggleTheme,
  applyTheme,
  initTheme
};