const language = document.documentElement.lang;
const url = new URL(location.href);
const explicit = url.searchParams.get('lang') === language;
let preferred;
let legacyOverride;

try {
  if (explicit) {
    localStorage.setItem('secux-language', language);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url);
  }
  preferred = localStorage.getItem('secux-language');
  legacyOverride = localStorage.getItem('lang-override');
} catch {
  // The explicit language in the URL also works when storage is blocked.
}

if (language === 'en' && !explicit &&
    (preferred === 'ru' || (!preferred && !legacyOverride && navigator.language.toLowerCase().startsWith('ru')))) {
  const russianPage = new URL('./ru/', location.href);
  russianPage.search = url.search;
  russianPage.hash = url.hash;
  location.replace(russianPage);
}
