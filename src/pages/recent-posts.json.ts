import {
  getPosts,
  getArticleVersions,
  postIdentity,
  postLocale,
  contentPath,
} from '../lib/content';
import { absolute, cfg, termPath } from '../lib/site';

// Count source articles once; each README chooses a published language version.
export async function GET() {
  const posts = (await getPosts()).filter((post) => !post.data.draft).slice(0, 2);
  const versions = (await getArticleVersions()).filter((post) => !post.data.draft);
  return Response.json(posts.map((post) => ({
    title: post.data.title,
    url: absolute(contentPath(post)),
    cover: absolute(post.data.cover ?? cfg.post.default.cover[0]),
    date: post.data.date.toISOString().slice(0, 10),
    categories: post.data.categories.map((name) => ({
      name,
      url: absolute(termPath('categories', name)),
    })),
    versions: Object.fromEntries(versions
      .filter((version) => postIdentity(version) === post.id)
      .map((version) => [postLocale(version), {
        title: version.data.title,
        url: absolute(contentPath(version)),
        locale: postLocale(version),
      }])),
  })));
}
