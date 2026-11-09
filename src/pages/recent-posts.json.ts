import { getPosts, contentPath } from '../lib/content';
import { absolute, cfg, termPath } from '../lib/site';

// The same published content and URLs as the site, without local draft previews.
export async function GET() {
  const posts = (await getPosts()).filter((post) => !post.data.draft).slice(0, 2);
  return Response.json(posts.map((post) => ({
    title: post.data.title,
    url: absolute(contentPath(post)),
    cover: absolute(post.data.cover ?? cfg.post.default.cover[0]),
    date: post.data.date.toISOString().slice(0, 10),
    categories: post.data.categories.map((name) => ({
      name,
      url: absolute(termPath('categories', name)),
    })),
  })));
}
