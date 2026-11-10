import { navigate } from "astro:transitions/client";
import {
  applyUiLanguage,
  normalizeUiLocale,
  uiText,
  type UiCopies,
  type UiLocale,
} from "../lib/ui-language";
import { Solitude } from "./core/api";
import { getArticleLanguage } from "./core/article";

const storageKey = "harkerx-ui-language";
const languageWindow = window as Window & { __harkerxUiLanguage?: UiLocale };
let activeLocale = normalizeUiLocale(
  languageWindow.__harkerxUiLanguage ??
    document.documentElement.dataset.uiLanguage,
);
let initialized = false;
let switching = false;
let restoreController: AbortController | undefined;
let restoreTarget = "";
let languageNavigationPending = false;
const copiesCache = new WeakMap<Element, UiCopies>();

export const getUiLanguage = () => activeLocale;
export function applyLanguage(
  root: Document = document,
  locale = activeLocale,
) {
  const element = root.getElementById("site-ui-copy");
  if (!element) return;
  let copies = copiesCache.get(element);
  if (!copies) {
    try {
      copies = JSON.parse(
        element instanceof HTMLTemplateElement
          ? element.content.textContent || "{}"
          : element.textContent || "{}",
      );
      copiesCache.set(element, copies!);
    } catch (error) {
      console.warn("Unable to load interface translations:", error);
      return;
    }
  }
  applyUiLanguage(root, locale, copies!);
}

type FieldSnapshot = {
  index: number;
  value: string;
  tag: string;
  type: string;
  focused: boolean;
  start: number | null;
  end: number | null;
};
const commentFields = () =>
  Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "#post-comment textarea, #post-comment input:not([type=hidden]):not([type=password]):not([type=file]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button])",
    ),
  );
function capturePageState() {
  const fields: FieldSnapshot[] = commentFields().flatMap((field, index) => {
    if (!field.value) return [];
    let start: number | null = null,
      end: number | null = null;
    try {
      start = field.selectionStart;
      end = field.selectionEnd;
    } catch {
      /* Email inputs do not expose a selection range. */
    }
    return [
      {
        index,
        value: field.value,
        tag: field.tagName,
        type: field.type,
        focused: document.activeElement === field,
        start,
        end,
      },
    ];
  });
  return {
    fields,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    href: location.href,
    articleId: getArticleLanguage()?.id,
    search: Solitude.localSearch?.open
      ? Solitude.localSearch.input.value
      : null,
  };
}
function restorePageState(
  snapshot: ReturnType<typeof capturePageState>,
  signal: AbortSignal,
  targetHref: string,
  crossVersion: boolean,
) {
  const restored = new Set<number>();
  let restoredSearch = snapshot.search === null;
  let restoredScroll = false;
  const restore = () => {
    if (signal.aborted) return;
    const original = new URL(targetHref);
    if (
      location.pathname + location.search !==
      original.pathname + original.search
    )
      return;
    if (snapshot.articleId && getArticleLanguage()?.id !== snapshot.articleId)
      return;
    const fields = commentFields();
    snapshot.fields.forEach((saved) => {
      if (restored.has(saved.index)) return;
      const field = fields[saved.index];
      if (!field || field.tagName !== saved.tag || field.type !== saved.type)
        return;
      field.value = saved.value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      if (saved.focused) {
        field.focus({ preventScroll: true });
        if (saved.start !== null && saved.end !== null) {
          try {
            field.setSelectionRange(saved.start, saved.end);
          } catch {
            /* Some input types do not support selection. */
          }
        }
      }
      restored.add(saved.index);
    });
    if (
      !restoredSearch &&
      document.documentElement.dataset.solitudeRuntime === "ready" &&
      Solitude.localSearch?.input?.isConnected
    ) {
      Solitude.localSearch.openSearch();
      Solitude.localSearch.input.value = snapshot.search!;
      Solitude.localSearch.search();
      restoredSearch = true;
    }
    if (
      !restoredScroll &&
      document.documentElement.dataset.solitudeRuntime === "ready"
    ) {
      let anchor: HTMLElement | null = null;
      if (crossVersion && original.hash) {
        try {
          anchor = document.getElementById(
            decodeURIComponent(original.hash.slice(1)),
          );
        } catch {
          /* Invalid hashes fall back to the article top. */
        }
      }
      if (anchor) anchor.scrollIntoView({ behavior: "instant" });
      else
        window.scrollTo({
          left: crossVersion ? 0 : snapshot.scrollX,
          top: crossVersion ? 0 : snapshot.scrollY,
          behavior: "instant",
        });
      restoredScroll = true;
    }
    if (
      restored.size === snapshot.fields.length &&
      restoredSearch &&
      restoredScroll
    )
      finish();
  };
  const observer = new MutationObserver(restore);
  const timeout = window.setTimeout(finish, 15000);
  function finish() {
    observer.disconnect();
    window.clearTimeout(timeout);
  }
  signal.addEventListener("abort", finish, { once: true });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-solitude-runtime"],
  });
  restore();
}
async function setLanguage(
  locale: UiLocale,
  persist = true,
  followArticle = true,
) {
  if (switching) return;
  const article = getArticleLanguage();
  const original = new URL(location.href);
  const versionPath = followArticle ? article?.versions[locale] : undefined;
  const destination = new URL(versionPath || original.href, original);
  if (destination.origin !== original.origin) return;
  destination.search = original.search;
  destination.hash = original.hash;
  const crossVersion = destination.pathname !== original.pathname;
  if (locale === activeLocale && !crossVersion) return;
  const unavailable = Boolean(
    followArticle && article && locale !== article.locale && !versionPath,
  );
  switching = true;
  const snapshot = capturePageState();
  activeLocale = locale;
  languageWindow.__harkerxUiLanguage = locale;
  if (persist) {
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      /* Keep the preference for this tab. */
    }
  }
  Solitude.hideRightMenu?.();
  applyLanguage();
  restoreController?.abort();
  restoreController = new AbortController();
  const signal = restoreController.signal;
  restoreTarget = destination.pathname + destination.search;
  languageNavigationPending = true;
  const afterSwap = () => {
    if (signal.aborted) return;
    languageNavigationPending = false;
    if (location.pathname + location.search !== restoreTarget) return;
    if (snapshot.articleId && getArticleLanguage()?.id !== snapshot.articleId)
      return;
    // Translated headings may have different IDs; retain only anchors that exist.
    if (crossVersion && destination.hash) {
      try {
        if (
          !document.getElementById(
            decodeURIComponent(destination.hash.slice(1)),
          )
        )
          destination.hash = "";
      } catch {
        destination.hash = "";
      }
    }
    history.replaceState(history.state, "", destination.href);
    if (snapshot.fields.length) {
      document
        .querySelectorAll<HTMLElement>(
          "#post-comment [data-initialized], #twikoo-container, #waline-wrap, #artalk-wrap",
        )
        .forEach((mount) => {
          mount.dataset.lazyReady = "true";
        });
    }
    restorePageState(snapshot, signal, destination.href, crossVersion);
  };
  document.addEventListener("astro:after-swap", afterSwap, {
    once: true,
    signal,
  });
  try {
    // A hashless request forces a fresh mount even for interface-only changes.
    const target = new URL(destination.href);
    target.hash = "";
    await navigate(target.href, { history: crossVersion ? "push" : "replace" });
    if (
      unavailable &&
      !signal.aborted &&
      getArticleLanguage()?.id === snapshot.articleId
    ) {
      Solitude.snackbarShow?.(
        uiText("articleTranslationUnavailable", locale),
        false,
        3500,
      );
    }
  } catch (error) {
    console.warn("Unable to refresh the interface language:", error);
  } finally {
    languageNavigationPending = false;
    switching = false;
  }
}

export function initializeLanguage() {
  if (initialized) return;
  initialized = true;
  applyLanguage();
  document.addEventListener("astro:before-preparation", (event) => {
    if (
      restoreController &&
      (!languageNavigationPending ||
        event.to.pathname + event.to.search !== restoreTarget)
    )
      restoreController.abort();
  });
  document.addEventListener("astro:before-swap", (event) => {
    applyLanguage(event.newDocument);
  });
  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-ui-language-switch]")
        : null;
    if (!target) return;
    event.preventDefault();
    const article = getArticleLanguage();
    const counterpart =
      article?.locale === "en"
        ? "zh-CN"
        : article?.locale === "zh-CN"
          ? "en"
          : undefined;
    const locale =
      counterpart && article?.versions[counterpart]
        ? counterpart
        : activeLocale === "en"
          ? "zh-CN"
          : "en";
    void setLanguage(locale);
  });
  window.addEventListener("storage", (event) => {
    if (
      event.key === storageKey &&
      (event.newValue === "en" || event.newValue === "zh-CN")
    )
      void setLanguage(event.newValue, false, false);
  });
}
