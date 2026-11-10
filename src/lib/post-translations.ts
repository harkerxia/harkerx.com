import type {
  Post,
  SourcePost,
  TranslatedPost,
  TranslationEntry,
} from "./content";

export type ArticleLocale = "zh-CN" | "en";

const assertArticleKey = (value: string, label: string) => {
  if (
    !value ||
    /[\u0000-\u0020\u007f?#\\%:<>"|*]/u.test(value) ||
    value.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error(`Invalid ${label}: ${value}`);
  return value;
};

const assertLegacyPath = (path: string) => {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[?#\\]/.test(path) ||
    path.split("/").includes("..")
  )
    throw new Error(`Invalid historical article URL: ${path}`);
  return path;
};

export const postIdentity = (post: Post): string =>
  post.collection === "translations" ? post.translation.originalId : post.id;

export const postLocale = (post: Post): ArticleLocale =>
  post.collection === "translations" ? "en" : "zh-CN";

export const legacyPostPath = (post: Post): string =>
  post.collection === "translations"
    ? post.translation.legacyPath
    : assertLegacyPath(
        post.data.url ??
          `/p/${assertArticleKey(post.id, "source article ID")}/`,
      );

export const articlePath = (post: Post): string => {
  const slug = assertArticleKey(
    post.collection === "translations"
      ? post.translation.sourceSlug
      : (post.data.slug ?? post.id),
    "article slug",
  );
  return `/${postLocale(post) === "en" ? "en" : "zh"}/p/${slug}/`;
};

// Select one version per source article without changing source-based ordering.
export function selectArticleVersions(
  versions: Post[],
  locale: ArticleLocale,
  { fallback = true }: { fallback?: boolean } = {},
): Post[] {
  const groups = new Map<string, Partial<Record<ArticleLocale, Post>>>();
  for (const version of versions) {
    const id = postIdentity(version);
    const group = groups.get(id) ?? {};
    group[postLocale(version)] = version;
    groups.set(id, group);
  }
  const ids = new Set([
    ...versions.filter((post) => post.collection === "posts").map(postIdentity),
    ...groups.keys(),
  ]);
  return Array.from(ids).flatMap((id) => {
    const group = groups.get(id)!;
    const selected = group[locale] ?? (fallback ? group["zh-CN"] : undefined);
    return selected ? [selected] : [];
  });
}

export function deriveArticleSeo(
  post: Post,
  versions: Post[],
  toAbsolute: (path: string) => string,
) {
  const locale = postLocale(post);
  const published = versions.filter((version) =>
    !version.data.draft && postIdentity(version) === postIdentity(post),
  );
  const alternates: { hreflang: ArticleLocale | "x-default"; href: string }[] = [];
  if (!post.data.draft) {
    for (const language of ["zh-CN", "en"] as const) {
      const version = published.find((candidate) => postLocale(candidate) === language);
      if (version) alternates.push({ hreflang: language, href: toAbsolute(articlePath(version)) });
    }
    const original = published.find((candidate) => postLocale(candidate) === "zh-CN");
    if (original) alternates.push({ hreflang: "x-default", href: toAbsolute(articlePath(original)) });
  }
  return { locale, canonical: toAbsolute(articlePath(post)), alternates };
}

// Validate relationships before hiding drafts so invalid unpublished translations are visible to authors.
export function composeArticleVersions(
  sources: SourcePost[],
  translations: TranslationEntry[],
  { preview = false }: { preview?: boolean } = {},
): Post[] {
  const originals = new Map<string, SourcePost>();
  for (const source of sources) {
    assertArticleKey(source.id, "source article ID");
    articlePath(source);
    legacyPostPath(source);
    if (originals.has(source.id))
      throw new Error(`Duplicate source article ID: ${source.id}`);
    originals.set(source.id, source);
  }
  const translated = new Set<string>();
  const versions: Post[] = sources.filter(
    (source) => preview || !source.data.draft,
  );
  const allowed = new Set([
    "translationOf",
    "title",
    "description",
    "draft",
    "lastmod",
    "sourceRevision",
  ]);
  for (const entry of translations) {
    const id = assertArticleKey(entry.data.translationOf, "translationOf ID");
    const source = originals.get(id);
    if (!source)
      throw new Error(
        `Translation ${entry.id} references missing original: ${id}`,
      );
    if (translated.has(id))
      throw new Error(
        `Multiple English translations reference original: ${id}`,
      );
    translated.add(id);
    const overrides = Object.keys(entry.data).filter(
      (key) => !allowed.has(key),
    );
    if (overrides.length)
      throw new Error(
        `Translation ${entry.id} cannot override shared fields: ${overrides.join(", ")}`,
      );
    if (!entry.data.title.trim())
      throw new Error(`Translation ${entry.id} requires a nonblank title`);
    if (!source.data.draft && !entry.data.draft) {
      if (!entry.data.description?.trim())
        throw new Error(`Published translation ${entry.id} requires an English description`);
      if (!entry.body?.trim())
        throw new Error(`Published translation ${entry.id} requires an English article body`);
    }
    if (!preview && (source.data.draft || entry.data.draft)) continue;
    const version: TranslatedPost = {
      ...entry,
      data: {
        ...source.data,
        translationOf: entry.data.translationOf,
        title: entry.data.title,
        description: entry.data.description,
        draft: source.data.draft || entry.data.draft,
        lastmod: entry.data.lastmod ?? source.data.lastmod,
        aliases: [],
      },
      translation: {
        originalId: source.id,
        locale: "en",
        sourceSlug: source.data.slug ?? source.id,
        legacyPath: legacyPostPath(source),
      },
    };
    versions.push(version);
  }
  return versions.sort(
    (a, b) =>
      +b.data.date - +a.data.date ||
      postIdentity(a).localeCompare(postIdentity(b)) ||
      postLocale(a).localeCompare(postLocale(b)),
  );
}
