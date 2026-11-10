import { getArticleVersions, selectArticleVersions } from '../../lib/content';
import { rss } from '../../lib/feeds';

export async function GET() {
  const posts = selectArticleVersions(await getArticleVersions(), 'en', {
    fallback: false,
  });
  return new Response(await rss(posts, {
    locale: 'en',
    title: 'English posts',
    feedPath: '/en/rss.xml',
    sitePath: '/archives/',
  }), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
