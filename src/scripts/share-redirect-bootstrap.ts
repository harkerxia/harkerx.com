// Serialized into short article entry pages; keep preference lookup self-contained.
export function redirectSharedArticle(
  versions: Partial<Record<'en' | 'zh-CN', string>>,
  defaultLocale: 'en' | 'zh-CN',
) {
  const languageWindow = window as Window & { __harkerxUiLanguage?: 'en' | 'zh-CN' };
  let locale = languageWindow.__harkerxUiLanguage ?? defaultLocale;
  try {
    const saved = localStorage.getItem('harkerx-ui-language');
    if (saved === 'en' || saved === 'zh-CN') locale = saved;
  } catch {
    // The current tab or configured default still works when storage is blocked.
  }
  const path = versions[locale] ?? versions['zh-CN'] ?? versions.en;
  if (!path) return;
  const destination = new URL(path, location.origin);
  if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
  destination.search = location.search;
  destination.hash = location.hash;
  location.replace(destination.href);
}
