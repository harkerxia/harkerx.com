import { getPosts } from '../lib/content';
import { rss } from '../lib/feeds';
export async function GET() {
  return new Response(await rss(await getPosts()), {
    // General XML also enables browsers' structured XML view.
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
