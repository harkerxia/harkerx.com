import { getArticleVersions, selectArticleVersions } from '../../lib/content';
import { searchXml } from '../../lib/feeds';

export async function GET() {
  const posts = selectArticleVersions(await getArticleVersions(), 'en', {
    fallback: true,
  });
  return new Response(searchXml(posts), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
