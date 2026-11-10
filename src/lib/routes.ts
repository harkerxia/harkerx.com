import {
  getPosts,
  getArticleVersions,
  postIdentity,
  postLocale,
  legacyPostPath,
  getPages,
  homePosts,
  paginate,
  taxonomy,
  contentPath,
  assertUniquePaths,
  normalizedRoutePath,
  type Post,
  type Page,
} from "./content";
import { config, cfg, t, url } from "./site";
import { pageData } from "./data";
export interface ArticleLanguage {
  id: string;
  locale: "zh-CN" | "en";
  versions: Partial<Record<"zh-CN" | "en", string>>;
  legacyPath: string;
}
export interface Route {
  path: string;
  kind: "home" | "post" | "page" | "taxonomy" | "term" | "redirect";
  title: string;
  entry?: Post | Page;
  posts?: Post[];
  current?: number;
  total?: number;
  taxonomy?: "tags" | "categories" | "series";
  type?: string;
  target?: string;
  shareVersions?: ArticleLanguage["versions"];
  article?: ArticleLanguage;
}
export async function getRoutes(): Promise<Route[]> {
  const posts = await getPosts(),
    pages = await getPages();
  const chunks = paginate(homePosts(posts), config.pagination);
  const routes: Route[] = chunks.map((items, i) => ({
    path: i ? `/page/${i + 1}/` : "/",
    kind: "home",
    title: config.title,
    posts: items,
    current: i + 1,
    total: chunks.length,
  }));
  const articleVersions = await getArticleVersions();
  for (const entry of articleVersions) {
    const id = postIdentity(entry);
    const versions = Object.fromEntries(
      articleVersions.filter((version) => postIdentity(version) === id)
        .map((version) => [postLocale(version), url(contentPath(version))]),
    );
    routes.push({
      path: contentPath(entry),
      kind: "post",
      title: entry.data.title,
      entry,
      type: "post",
      article: { id, locale: postLocale(entry), versions, legacyPath: new URL(url(legacyPostPath(entry)), config.site).pathname },
    });
  }
  for (const kind of ["tags", "categories", "series"] as const) {
    const groups = taxonomy(posts, kind);
    if (kind === "series" && groups.length === 0) continue;
    routes.push({
      path: `/${kind}/`,
      kind: "taxonomy",
      title: t(kind),
      taxonomy: kind,
    });
    for (const group of groups)
      routes.push({
        path: group.path,
        kind: "term",
        title: group.name,
        posts: group.posts,
        taxonomy: kind,
      });
  }
  // Optional pages are published only after the site has real content for them.
  // An explicit Markdown page can always opt in through its front matter.
  const defaults: [string, string, string, boolean][] = [
    ["/archives/", "archives", t("allPosts"), true],
    [
      "/links/",
      "links",
      t("links"),
      pageData(undefined, "links").links.some((g) => g.link_list.length > 0),
    ],
    ["/music/", "music", t("music"), cfg.music.enable && Boolean(cfg.music.id)],
    [cfg.envelope.page, "message", t("message"), cfg.envelope.enable],
    [
      cfg.notes.page,
      "notes",
      t("notes"),
      cfg.notes.enable && pageData(undefined, "notes").items.length > 0,
    ],
    [
      cfg.recent_comments.page,
      "recentcomment",
      t("recentComments"),
      cfg.recent_comments.enable && Boolean(cfg.comment.use),
    ],
  ];
  const explicitPaths = new Set(
    pages.map((p) => normalizedRoutePath(contentPath(p))),
  );
  for (const [path, type, title, enabled] of defaults)
    if (enabled && !explicitPaths.has(normalizedRoutePath(path)))
      routes.push({ path, kind: "page", type, title });
  for (const entry of pages)
    routes.push({
      path: contentPath(entry),
      kind: "page",
      title: entry.data.title,
      entry,
      type: entry.data.type ?? "page",
    });
  const redirects = new Map<string, { path: string; title: string; target: string; shareVersions?: ArticleLanguage["versions"] }>();
  for (const entry of posts) {
    if (entry.data.draft) continue;
    const target = contentPath(entry);
    const path = target.replace(/^\/zh\/p\//, "/p/");
    const shareVersions = Object.fromEntries(
      articleVersions.filter((version) => !version.data.draft && postIdentity(version) === entry.id)
        .map((version) => [postLocale(version), url(contentPath(version))]),
    );
    redirects.set(normalizedRoutePath(path), { path, title: entry.data.title, target, shareVersions });
  }
  for (const entry of [...posts, ...pages]) {
    const target = contentPath(entry);
    for (const alias of entry.data.aliases) {
      const path = contentPath({ id: "", collection: "pages", data: { url: alias } });
      const key = normalizedRoutePath(path);
      if (key === normalizedRoutePath(target)) continue;
      const existing = redirects.get(key);
      if (existing && existing.target !== target) throw new Error(`Conflicting redirect: ${path}`);
      redirects.set(key, { ...existing, path, title: entry.data.title, target });
    }
  }
  for (const redirect of redirects.values()) routes.push({ ...redirect, kind: "redirect" });
  assertUniquePaths([
    ...routes.map((r) => r.path),
    "/404.html",
    "/rss.xml",
    "/en/rss.xml",
    "/search.xml",
    "/en/search.xml",
    "/links.json",
    "/recent-posts.json",
    "/sitemap.xml",
    "/robots.txt",
    ...(cfg.pwa.enable ? [cfg.pwa.manifest] : []),
  ]);
  return routes;
}
