import en from "../i18n/en.json";
import zh from "../i18n/zh-CN.json";
import siteZh from "../i18n/site.zh-CN.json";
import type { ArticleCatalog } from "./article-ui";

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
  root.documentElement.lang = root.documentElement.dataset.articleLocale || locale;
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
  let catalog: ArticleCatalog = {};
  const catalogElement = root.getElementById("article-catalog");
  try {
    catalog = JSON.parse((catalogElement instanceof HTMLTemplateElement
      ? catalogElement.content.textContent : catalogElement?.textContent) || "{}");
  } catch {
    /* Preserve server-rendered article links when metadata is unavailable. */
  }
  const attributes = new Set(["href", "title", "alt", "data-link", "data-title", "data-solitude-url"]);
  root.querySelectorAll<HTMLElement>("[data-article-bind], [data-article-text], [data-article-language]").forEach((node) => {
    const owner = node.closest<HTMLElement>("[data-article-id]");
    const versions = catalog[owner?.dataset.articleId || ""];
    const version = versions?.[locale] ?? versions?.["zh-CN"];
    if (!version) return;
    if (owner) owner.dataset.articleLocale = version.locale;
    for (const binding of (node.dataset.articleBind || "").split(";")) {
      const [attribute, field] = binding.split(":");
      if (attributes.has(attribute) && (field === "path" || field === "title"))
        node.setAttribute(attribute, version[field]);
    }
    const field = node.dataset.articleText;
    if (field === "title" || field === "description") {
      node.textContent = version[field];
      node.lang = version.locale;
      if (field === "description") node.hidden = !version.description.trim();
    }
    if (node.hasAttribute("data-article-language")) {
      node.hidden = !(locale === "en" && version.locale === "zh-CN");
      node.lang = "zh-CN";
    }
  });
  root.querySelectorAll<HTMLAnchorElement>("a[data-feed-link]").forEach((link) => {
    const target = locale === "en" ? link.dataset.feedEn : link.dataset.feedZh;
    if (target) link.setAttribute("href", target);
  });
  root.querySelectorAll<HTMLElement>("#nav, #footer, #search-mask").forEach((node) => { node.lang = locale; });
  let article:
    { locale?: string; versions?: Record<string, string> } | undefined;
  const articleElement = root.getElementById("article-language");
  if (articleElement) {
    try {
      article =
        JSON.parse(
          (articleElement instanceof HTMLTemplateElement
            ? articleElement.content.textContent
            : articleElement.textContent) || "null",
        ) || undefined;
    } catch {
      /* Keep interface-only controls if article metadata is unavailable. */
    }
  }
  const counterpart =
    article?.locale === "en"
      ? "zh-CN"
      : article?.locale === "zh-CN"
        ? "en"
        : undefined;
  const targetLocale =
    counterpart && article?.versions?.[counterpart]
      ? counterpart
      : locale === "en"
        ? "zh-CN"
        : "en";
  root
    .querySelectorAll<HTMLElement>("[data-ui-language-switch]")
    .forEach((button) => {
      const label = targetLocale === "zh-CN" ? "中文" : "EN";
      const title =
        locale === "en"
          ? targetLocale === "zh-CN"
            ? "Switch to Chinese"
            : "Switch to English"
          : targetLocale === "zh-CN"
            ? "切换为中文"
            : "切换为英文";
      button.querySelectorAll("[data-ui-language-label]").forEach((node) => {
        node.textContent = label;
      });
      button.setAttribute("aria-label", title);
      button.setAttribute("title", title);
      button.setAttribute("heotip", title);
      button.setAttribute("lang", targetLocale);
      button.dataset.uiLanguageTarget = targetLocale;
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
  document.documentElement.lang = document.documentElement.dataset.articleLocale || locale;
}
