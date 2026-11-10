import type {
  SolitudePageConfiguration,
  SolitudeSiteConfiguration,
} from "../types";
import { normalizeUiLocale } from "../../lib/ui-language";

type LanguagePatch = ReturnType<
  typeof import("../../lib/runtime-config").runtimeLanguagePatch
>;
const parsed = new WeakMap<Element, unknown>();
const localized = new WeakMap<
  Element,
  Map<string, SolitudeSiteConfiguration>
>();
const parseConfig = <T>(id: string, fallback: T): T => {
  const element = document.getElementById(id);
  if (!element) return fallback;
  if (parsed.has(element)) return parsed.get(element) as T;
  try {
    const value: T = JSON.parse(
      (element instanceof HTMLTemplateElement
        ? element.content.textContent
        : null) ||
        element.textContent ||
        "{}",
    );
    parsed.set(element, value);
    return value;
  } catch (error) {
    console.error(`Invalid Solitude configuration in #${id}:`, error);
    return fallback;
  }
};

export const getConfig = (): SolitudeSiteConfiguration => {
  const base = parseConfig<SolitudeSiteConfiguration>(
    "site-config",
    {} as SolitudeSiteConfiguration,
  );
  const element = document.getElementById("site-ui-config");
  if (!element) return base;
  const locale = normalizeUiLocale(document.documentElement.dataset.uiLanguage);
  let cache = localized.get(element);
  if (!cache) localized.set(element, (cache = new Map()));
  const cached = cache.get(locale);
  if (cached) return cached;
  const patch = parseConfig<Partial<Record<"en" | "zh-CN", LanguagePatch>>>(
    "site-ui-config",
    {},
  )[locale];
  if (!patch) return base;
  const value: SolitudeSiteConfiguration = {
    ...base,
    ...patch,
    aside: { ...base.aside, ...patch.aside },
    friend_links: { ...base.friend_links, ...patch.friend_links },
    twikoo: { ...base.twikoo, ...patch.twikoo },
    waline: { ...base.waline, ...patch.waline },
    artalk: { ...base.artalk, ...patch.artalk },
    giscus: { ...base.giscus, ...patch.giscus },
    valine: { ...base.valine, ...patch.valine },
  };
  cache.set(locale, value);
  return value;
};
export const getPageConfig = () =>
  parseConfig<SolitudePageConfiguration>(
    "config-diff",
    {} as SolitudePageConfiguration,
  );
