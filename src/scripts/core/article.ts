import type { ArticleLanguage } from "../../lib/routes";
import type { ArticleCatalog } from "../../lib/article-ui";

const cache = new WeakMap<Element, ArticleLanguage | undefined>();

export function getArticleLanguage(
  root: Document = document,
): ArticleLanguage | undefined {
  const element = root.getElementById("article-language");
  if (!element) return;
  if (cache.has(element)) return cache.get(element);
  let article: ArticleLanguage | undefined;
  try {
    const value: unknown = JSON.parse(
      (element instanceof HTMLTemplateElement
        ? element.content.textContent
        : element.textContent) || "null",
    );
    if (value && typeof value === "object") {
      const candidate = value as Partial<ArticleLanguage>;
      if (
        typeof candidate.id === "string" &&
        candidate.id &&
        (candidate.locale === "en" || candidate.locale === "zh-CN") &&
        typeof candidate.legacyPath === "string" &&
        candidate.versions &&
        typeof candidate.versions === "object"
      )
        article = candidate as ArticleLanguage;
    }
  } catch (error) {
    console.warn("Unable to read article language metadata:", error);
  }
  cache.set(element, article);
  return article;
}

const catalogs = new WeakMap<Element, ArticleCatalog>();
export function getArticlePresentation(id: string, root: Document = document) {
  const element = root.getElementById("article-catalog");
  if (!element) return;
  let catalog = catalogs.get(element);
  if (!catalog) {
    try {
      catalog = JSON.parse((element instanceof HTMLTemplateElement
        ? element.content.textContent : element.textContent) || "{}");
      catalogs.set(element, catalog!);
    } catch { return; }
  }
  const locale = root.documentElement.dataset.uiLanguage === "zh-CN" ? "zh-CN" : "en";
  return catalog?.[id]?.[locale] ?? catalog?.[id]?.["zh-CN"];
}
