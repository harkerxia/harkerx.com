import { getPosts, taxonomy } from '../../lib/content';
import { rss } from '../../lib/feeds';
export async function getStaticPaths() {
  const posts = await getPosts();
  return [
    {
      params: { feed: 'posts' },
      props: { posts, title: 'Posts', sitePath: '/archives/' },
    },
    ...(['categories', 'tags', 'series'] as const).flatMap((kind) =>
      taxonomy(posts, kind).length
        ? [
            { params: { feed: kind }, props: { posts, title: kind } },
            ...taxonomy(posts, kind).map((g) => ({
              params: { feed: decodeURI(g.path).replace(/^\/|\/$/g, '') },
              props: { posts: g.posts, title: g.name, sitePath: g.path },
            })),
          ]
        : [],
    ),
  ];
}
export async function GET({
  props,
  url,
}: {
  props: {
    posts: Awaited<ReturnType<typeof getPosts>>;
    title: string;
    sitePath?: string;
  };
  url: URL;
}) {
  return new Response(
    await rss(props.posts, {
      title: props.title,
      feedPath: url.pathname,
      sitePath: props.sitePath,
    }),
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
}
