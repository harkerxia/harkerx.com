import { getPosts, postIdentity } from '../lib/content';

// The Worker caches this public list briefly; new posts need no Worker redeploy.
export async function GET() {
  const postIds = (await getPosts())
    .filter(post => !post.data.draft)
    .map(postIdentity)
    .sort();
  return Response.json({ version: 1, postIds });
}
