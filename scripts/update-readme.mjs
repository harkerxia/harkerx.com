import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const startMarker = '<!-- RECENT-POSTS:START -->';
export const endMarker = '<!-- RECENT-POSTS:END -->';
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);
const httpUrl = (value) => {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid post URL');
  return escape(url.href);
};

export function renderRecentPosts(posts, locale = 'en') {
  if (posts.length > 2) throw new Error('Expected at most two recent posts');
  if (!posts.length) return `<p align="center">${locale === 'zh-CN' ? '暂无已发布文章。' : 'No published posts yet.'}</p>`;
  const cells = posts.map((post) => {
    const version = post.versions?.[locale] ?? post.versions?.['zh-CN'] ?? post;
    const link = httpUrl(version.url);
    const categories = post.categories.map((category) =>
      `<a href="${httpUrl(category.url)}">${escape(category.name)}</a>`,
    );
    const metadata = [
      ...categories,
      ...(locale === 'en' && version.locale === 'zh-CN' ? ['Chinese'] : []),
      escape(post.date),
    ].join(' · ');
    return `    <td align="center" valign="top" width="${100 / posts.length}%">
      <a href="${link}">
        <img src="${httpUrl(post.cover)}" alt="${escape(version.title)}" width="360" height="200" />
      </a>
      <br />
      <a href="${link}"><strong>${escape(version.title)}</strong></a>
      <br />
      <sub>${metadata}</sub>
    </td>`;
  });
  return `<table align="center">\n  <tr>\n${cells.join('\n')}\n  </tr>\n</table>`;
}

export function replaceRecentPosts(readme, posts, locale) {
  if (readme.split(startMarker).length !== 2 || readme.split(endMarker).length !== 2) {
    throw new Error('README must have exactly one pair of RECENT-POSTS markers');
  }
  const start = readme.indexOf(startMarker) + startMarker.length;
  const end = readme.indexOf(endMarker);
  if (end < start) throw new Error('README recent-post markers are out of order');
  const newline = readme.includes('\r\n') ? '\r\n' : '\n';
  const content = renderRecentPosts(posts, locale).replaceAll('\n', newline);
  return readme.slice(0, start) + newline + content + newline + readme.slice(end);
}

async function main() {
  const root = new URL('../', import.meta.url);
  const posts = JSON.parse(await readFile(new URL('dist/recent-posts.json', root), 'utf8'));
  // Validate both blocks before writing either file. All other text is untouched.
  const updates = await Promise.all([
    ['README.md', 'en'], ['README.zh-CN.md', 'zh-CN'],
  ].map(async ([name, locale]) => {
    const file = new URL(name, root);
    const before = await readFile(file, 'utf8');
    return { name, file, before, after: replaceRecentPosts(before, posts, locale) };
  }));
  for (const { name, file, before, after } of updates) {
    if (before === after) continue;
    await writeFile(file, after);
    console.log(`Updated ${name}: ${posts.length} recent posts`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
