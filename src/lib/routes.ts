import {
  getPosts,
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
import { config, cfg, t } from "./site";
import { pageData } from "./data";
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
  for (const entry of posts)
    routes.push({
      path: contentPath(entry),
      kind: "post",
      title: entry.data.title,
      entry,
      type: "post",
    });
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
  for (const entry of [...posts, ...pages])
    for (const alias of entry.data.aliases)
      routes.push({
        path: contentPath({
          id: "",
          collection: "pages",
          data: { url: alias },
        }),
        kind: "redirect",
        title: entry.data.title,
        target: contentPath(entry),
      });
  assertUniquePaths([
    ...routes.map((r) => r.path),
    "/404.html",
    "/rss.xml",
    "/search.xml",
    "/links.json",
    "/recent-posts.json",
    "/sitemap.xml",
    "/robots.txt",
    ...(cfg.pwa.enable ? [cfg.pwa.manifest] : []),
  ]);
  return routes;
}
