import en from "../i18n/en.json";
import zh from "../i18n/zh-CN.json";
import siteZh from "../i18n/site.zh-CN.json";

export type UiLocale = "en" | "zh-CN";
export type UiValues = Record<string, string | number>;
export interface UiCopies {
  en: Record<string, string>;
  "zh-CN": Record<string, string>;
  site: Record<string, string>;
}
export const uiCopies: UiCopies = { en, "zh-CN": zh, site: siteZh };
export const normalizeUiLocale = (locale: unknown): UiLocale =>
  locale === "zh-CN" ? "zh-CN" : "en";

const interpolate = (text: string, values: UiValues = {}) =>
  text.replace(/\$\{(\w+)\}|\{(\w+)\}/g, (match, dollarKey, key) =>
    Object.hasOwn(values, dollarKey ?? key)
      ? String(values[dollarKey ?? key])
      : match,
  );
export const uiText = (key: string, locale: UiLocale, values?: UiValues) =>
  interpolate(uiCopies[locale][key] ?? uiCopies.en[key] ?? key, values);
export const siteText = (text: string | undefined, locale: UiLocale) =>
  locale === "zh-CN" ? (uiCopies.site[text ?? ""] ?? text ?? "") : (text ?? "");
export function translateUiText(
  binding: { k?: string; text?: string; values?: UiValues; zh?: string },
  locale: UiLocale,
) {
  return interpolate(
    locale === "zh-CN" && binding.zh !== undefined
      ? binding.zh
      : binding.k
        ? (uiCopies[locale][binding.k] ?? uiCopies.en[binding.k] ?? binding.k)
        : siteText(binding.text, locale),
    binding.values,
  );
}

// This function is also serialized into the page, before the main runtime loads.
// Keep it self-contained and translate only explicitly marked, trusted UI copy.
export function applyUiLanguage(
  root: Document,
  locale: UiLocale,
  copies: UiCopies,
) {
  root.documentElement.dataset.uiLanguage = locale;
  root.documentElement.lang = locale;
  const translate = (
    key: string | null,
    source: string | null,
    explicit?: string | null,
  ) => {
    if (locale === "zh-CN" && explicit !== undefined && explicit !== null)
      return explicit;
    if (key) return copies[locale][key] ?? copies.en[key] ?? key;
    return locale === "zh-CN"
      ? (copies.site[source ?? ""] ?? source ?? "")
      : (source ?? "");
  };
  const interpolate = (text: string, node: Element) => {
    let values: Record<string, unknown> = {};
    try {
      values = JSON.parse(node.getAttribute("data-i18n-values") || "{}");
    } catch {
      /* Keep the original placeholders. */
    }
    return text.replace(/\$\{(\w+)\}|\{(\w+)\}/g, (match, dollarKey, key) => {
      const value =
        values && Object.hasOwn(values, dollarKey ?? key)
          ? values[dollarKey ?? key]
          : undefined;
      return typeof value === "string" || typeof value === "number"
        ? String(value)
        : match;
    });
  };
  root.querySelectorAll("[data-i18n], [data-i18n-text]").forEach((node) => {
    const text =
      interpolate(
        translate(
          node.getAttribute("data-i18n"),
          node.getAttribute("data-i18n-text"),
          node.getAttribute("data-i18n-zh"),
        ),
        node,
      ) + (node.getAttribute("data-i18n-suffix") || "");
    if (node.hasAttribute("data-i18n-html")) {
      if (node.innerHTML !== text) node.innerHTML = text;
    } else if (node.textContent !== text) node.textContent = text;
  });
  const reserved = new Set(["text", "values", "html", "zh", "suffix"]);
  root.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (!attribute.name.startsWith("data-i18n-")) continue;
      let target = attribute.name.slice(10);
      if (reserved.has(target) || target.endsWith("-zh")) continue;
      const source = target.endsWith("-text");
      if (source) target = target.slice(0, -5);
      if (!(
        target === "title" ||
        target === "placeholder" ||
        target === "alt" ||
        target === "heotip" ||
        target.startsWith("aria-") ||
        target.startsWith("data-") ||
        (target === "content" && node.tagName === "META")
      ))
        continue;
      node.setAttribute(
        target,
        interpolate(
          translate(
            source ? null : attribute.value,
            source ? attribute.value : null,
          ),
          node,
        ),
      );
    }
  });
  root
    .querySelectorAll<HTMLElement>("[data-ui-language-switch]")
    .forEach((button) => {
      const label = locale === "en" ? "中文" : "EN";
      const title = locale === "en" ? "Switch to Chinese" : "切换为英文";
      button.querySelectorAll("[data-ui-language-label]").forEach((node) => {
        node.textContent = label;
      });
      button.setAttribute("aria-label", title);
      button.setAttribute("title", title);
      button.setAttribute("heotip", title);
      button.setAttribute("lang", locale === "en" ? "zh-CN" : "en");
    });
}

export function bootstrapUiLanguage(defaultLocale: UiLocale) {
  const languageWindow = window as Window & { __harkerxUiLanguage?: UiLocale };
  let locale = languageWindow.__harkerxUiLanguage ?? defaultLocale;
  try {
    const stored = localStorage.getItem("harkerx-ui-language");
    if (stored === "en" || stored === "zh-CN") locale = stored;
  } catch {
    /* The current tab still retains its choice when storage is unavailable. */
  }
  languageWindow.__harkerxUiLanguage = locale;
  document.documentElement.dataset.uiLanguage = locale;
  document.documentElement.lang = locale;
}
