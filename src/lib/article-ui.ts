import type { Post } from './content';
import { contentPath, postIdentity, postLocale } from './content';
import { url } from './site';

export interface ArticlePresentation {
  title: string;
  description: string;
  path: string;
  locale: 'en' | 'zh-CN';
}
export type ArticleCatalog = Record<string, Partial<Record<'en' | 'zh-CN', ArticlePresentation>>>;

// Lists keep source ordering and counts; only their presentation changes language.
export function buildArticleCatalog(versions: Post[]): ArticleCatalog {
  const catalog: ArticleCatalog = Object.create(null);
  for (const post of versions) {
    const id = postIdentity(post);
    (catalog[id] ??= {})[postLocale(post)] = {
      title: post.data.title,
      description: post.data.description ?? '',
      path: url(contentPath(post)),
      locale: postLocale(post),
    };
  }
  return catalog;
}
