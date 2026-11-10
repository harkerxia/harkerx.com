import { navigate } from "astro:transitions/client";
import {
  applyUiLanguage,
  normalizeUiLocale,
  type UiCopies,
  type UiLocale,
} from "../lib/ui-language";
import { Solitude } from "./core/api";

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
    search: Solitude.localSearch?.open
      ? Solitude.localSearch.input.value
      : null,
  };
}
function restorePageState(
  snapshot: ReturnType<typeof capturePageState>,
  signal: AbortSignal,
) {
  const restored = new Set<number>();
  let restoredSearch = snapshot.search === null;
  let restoredScroll = false;
  const restore = () => {
    if (signal.aborted) return;
    const original = new URL(snapshot.href);
    if (
      location.pathname + location.search !==
      original.pathname + original.search
    )
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
    if (!restoredScroll) {
      window.scrollTo({
        left: snapshot.scrollX,
        top: snapshot.scrollY,
        behavior: "instant",
      });
      restoredScroll = true;
    }
    if (restored.size === snapshot.fields.length && restoredSearch) finish();
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
async function setLanguage(locale: UiLocale, persist = true) {
  if (locale === activeLocale || switching) return;
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
  const original = new URL(snapshot.href);
  restoreTarget = original.pathname + original.search;
  languageNavigationPending = true;
  const afterSwap = () => {
    if (signal.aborted) return;
    languageNavigationPending = false;
    if (location.pathname + location.search !== restoreTarget) return;
    // Restore the exact URL after forcing a fresh swap even when it has a hash.
    history.replaceState(history.state, "", snapshot.href);
    if (snapshot.fields.length) {
      document
        .querySelectorAll<HTMLElement>(
          "#post-comment [data-initialized], #twikoo-container, #waline-wrap, #artalk-wrap",
        )
        .forEach((mount) => {
          mount.dataset.lazyReady = "true";
        });
    }
    restorePageState(snapshot, signal);
  };
  document.addEventListener("astro:after-swap", afterSwap, {
    once: true,
    signal,
  });
  try {
    const target = new URL(location.href);
    target.hash = "";
    await navigate(target.href, { history: "replace" });
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
    void setLanguage(activeLocale === "en" ? "zh-CN" : "en");
  });
  window.addEventListener("storage", (event) => {
    if (
      event.key === storageKey &&
      (event.newValue === "en" || event.newValue === "zh-CN")
    )
      void setLanguage(event.newValue, false);
  });
}
