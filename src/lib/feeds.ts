import sanitizeHtml from 'sanitize-html';
import { cfg, config, absolute, url } from './site';
import { contentPath, plainText, postIdentity, postLocale, type Post } from './content';
import type { ArticleLocale } from './post-translations';
import { siteText } from './ui-language';

const xmlText = (value: unknown) =>
  String(value ?? '').replace(
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,
    '',
  );

export const xml = (value: unknown) =>
  xmlText(value).replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  );

const cdata = (value: string) =>
  `<![CDATA[${xmlText(value).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;

async function renderPostContent(post: Post): Promise<string> {
  if (post.rendered && !post.rendered.metadata?.imagePaths?.length) {
    return post.rendered.html;
  }

  // Use Astro's renderer for imported images and deferred MDX components.
  const [{ render }, { experimental_AstroContainer }] = await Promise.all([
    import('astro:content'),
    import('astro/container'),
  ]);
  const { Content } = await render(post);
  const container = await experimental_AstroContainer.create();
  if (post.filePath?.endsWith('.mdx')) {
    const [{ default: renderer }, { components }] = await Promise.all([
      import('@astrojs/mdx/server.js'),
      import('../components/mdx'),
    ]);
    container.addServerRenderer({ renderer });
    return container.renderToString(Content, { props: { components } });
  }
  return container.renderToString(Content);
}

export function rssContent(html: string, postUrl: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'figure',
      'figcaption',
      'details',
      'summary',
      'video',
      'audio',
      'source',
      'math',
      'semantics',
      'annotation',
      'mrow',
      'mi',
      'mn',
      'mo',
      'mfrac',
      'msup',
      'msub',
      'msubsup',
      'msqrt',
      'mroot',
      'mtable',
      'mtr',
      'mtd',
      'mover',
      'munder',
      'munderover',
      'mtext',
      'mspace',
      'mstyle',
      'mpadded',
      'mphantom',
      'menclose',
    ],
    allowedAttributes: {
      '*': [
        'id',
        'title',
        'lang',
        'dir',
        'mathvariant',
        'stretchy',
        'fence',
        'separator',
        'accent',
        'accentunder',
        'lspace',
        'rspace',
        'linethickness',
        'columnalign',
        'rowalign',
        'columnspacing',
        'rowspacing',
        'width',
        'height',
        'depth',
      ],
      a: ['href', 'name'],
      img: ['src', 'alt', 'width', 'height'],
      video: ['src', 'poster', 'controls'],
      audio: ['src', 'controls'],
      source: ['src', 'type'],
      span: ['class'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
      math: ['xmlns', 'display'],
      annotation: ['encoding'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    transformTags: {
      iframe: (_tagName, attributes) => ({
        tagName: 'a',
        attribs: { href: attributes.src || postUrl },
        text: 'View embedded content',
      }),
      '*': (tagName, attributes) => {
        const attribs = { ...attributes };
        for (const field of ['href', 'src', 'poster']) {
          if (!attribs[field]) continue;
          try {
            attribs[field] = new URL(attribs[field], postUrl).href;
          } catch {
            delete attribs[field];
          }
        }
        return { tagName, attribs };
      },
    },
    // MathML works without the site's KaTeX CSS; its HTML twin would duplicate it.
    exclusiveFilter: (frame) =>
      frame.tag === 'span' &&
      (frame.attribs.class || '').split(/\s+/).includes('katex-html'),
  });
}

interface RssOptions {
  title?: string;
  feedPath?: string;
  sitePath?: string;
  locale?: ArticleLocale;
}

export async function rss(
  posts: Post[],
  {
    title = config.title,
    feedPath = '/rss.xml',
    sitePath = '/',
    locale = 'zh-CN',
  }: RssOptions = {},
): Promise<string> {
  // Feeds always contain published posts, including during local draft preview.
  const entries = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => +b.data.date - +a.data.date || a.id.localeCompare(b.id));
  const items = await Promise.all(
    entries.map(async (post) => {
      const link = absolute(contentPath(post));
      const summary = post.data.description?.trim();
      const description = summary || plainText(post.body ?? '').slice(0, 300);
      const coverPath = post.data.cover?.trim() || cfg.post.default.cover[0];
      let cover: string | undefined;
      if (coverPath) {
        try {
          const candidate = new URL(absolute(coverPath));
          if (candidate.protocol === 'http:' || candidate.protocol === 'https:')
            cover = candidate.href;
        } catch {
          // Invalid cover URLs must not break the feed or enter media metadata.
        }
      }
      // Some readers extract previews from the full content rather than description.
      const content = rssContent([
        summary ? `<p>${xml(summary)}</p>` : '',
        cover ? `<p><img src="${xml(cover)}" alt="${xml(post.data.title)}" /></p>` : '',
        await renderPostContent(post),
      ].filter(Boolean).join('\n'), link);
      const categories = [
        ...new Set([...post.data.categories, ...post.data.tags]),
      ];
      return [
        '    <item>',
        `      <title>${xml(post.data.title)}</title>`,
        `      <link>${xml(link)}</link>`,
        `      <guid isPermaLink="true">${xml(link)}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <dc:creator>${xml(config.author.name)}</dc:creator>`,
        ...categories.map(
          (category) => `      <category>${xml(category)}</category>`,
        ),
        ...(cover ? [
          `      <media:content url="${xml(cover)}" medium="image" isDefault="true" />`,
          `      <media:thumbnail url="${xml(cover)}" />`,
        ] : []),
        `      <description>${cdata(`<p>${xml(description)}</p>`)}</description>`,
        `      <content:encoded>${cdata(content)}</content:encoded>`,
        '    </item>',
      ].join('\n');
    }),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    '  <channel>',
    `    <title>${xml(title === config.title ? title : `${config.title} — ${title}`)}</title>`,
    `    <link>${xml(absolute(sitePath))}</link>`,
    `    <description>${xml(siteText(config.description, locale))}</description>`,
    `    <language>${xml(locale)}</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${xml(absolute(feedPath))}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function searchXml(posts: Post[]) {
  return `<?xml version="1.0" encoding="UTF-8"?><search>${posts.map((post) => `<entry><id>${xml(postIdentity(post))}</id><language>${xml(postLocale(post))}</language><title>${xml(post.data.title)}</title><url>${xml(url(contentPath(post)))}</url><description>${xml(post.data.description ?? '')}</description><content>${xml(plainText(post.body ?? ''))}</content></entry>`).join('')}</search>`;
}
