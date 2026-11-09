import type {
  SolitudePageConfiguration,
  SolitudeSiteConfiguration,
} from "../types";

const parseConfig = <T>(id: string, fallback: T): T => {
  const element = document.getElementById(id);
  if (!element) return fallback;
  try {
    return JSON.parse(
      (element instanceof HTMLTemplateElement
        ? element.content.textContent
        : null) ||
        element.textContent ||
        "{}",
    );
  } catch (error) {
    console.error(`Invalid Solitude configuration in #${id}:`, error);
    return fallback;
  }
};

export const getConfig = () =>
  parseConfig<SolitudeSiteConfiguration>(
    "site-config",
    {} as SolitudeSiteConfiguration,
  );
export const getPageConfig = () =>
  parseConfig<SolitudePageConfiguration>(
    "config-diff",
    {} as SolitudePageConfiguration,
  );
