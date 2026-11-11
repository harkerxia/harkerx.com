# Article translations

## Files and identity

Chinese originals stay in `src/content/posts`. Their relative filenames, without `.md` or `.mdx`, define the stable article identity: `src/content/posts/vpn.md` has ID `vpn`, and `src/content/posts/guides/vpn.md` has ID `guides/vpn`. Keep filenames/IDs stable after publishing. Changing a title or the public `slug` does not change the identity.

Put English Markdown or MDX translations in `src/content/translations`. Their filenames are for organization; `translationOf` must match the original ID, including a subdirectory when present.

```yaml
---
translationOf: vpn
title: An introduction to VPNs
description: A short English description of this article.
draft: true
---
Write the reviewed English article here.
```

This collection is reserved for English translations; no extra language subdirectory is needed. Supported translation fields are `translationOf`, `title`, `description`, `draft` (defaults to false), optional `lastmod`, and optional `sourceRevision`. Do not repeat routing, date, cover, category, tag, recommendation, comment, or other shared settings; translations inherit these from the original.

A published translation requires a nonblank English title, description, and article body. Draft translations can keep an unfinished description or body. Production excludes draft translations and translations of draft originals. Development preview includes drafts; seeing one in `pnpm dev` does not mean it will be published.

All associations are checked, including drafts. Unknown originals, duplicate English versions, unsafe identifiers, attempts to override shared settings, and duplicate public routes fail validation. These checks do not assess translation quality; review the English prose manually.

## Routes and language selection

The original is published at `/zh/p/<source-slug>/`, and its published English translation at `/en/p/<source-slug>/`. The slug defaults to the source ID. A short share entry is available at `/p/<source-slug>/`. It redirects in the browser to the visitor's saved interface language (`harkerx-ui-language`), using the configured site default when no preference is saved. Only published versions are eligible; a missing English translation falls back to Chinese. Query strings and anchors are preserved, and the redirect replaces the history entry. With JavaScript disabled, language links remain available.

Explicit article URLs stay in their content language. A saved English interface preference does not redirect a directly opened Chinese article. The top navigation and context-menu language buttons open the matching article version when it exists, preserving usable anchors and query parameters. If the translation is unavailable, the article remains in Chinese and the interface explains that no English version is published.

Article lists, recommendations, and random article links select one version per source article for the current interface language. An English list prefers the English version, falls back to the Chinese original when needed, and labels that fallback as Chinese. Adding a translation does not increase logical article counts or duplicate a card.

Both versions retain the same internal comment/read identity, such as `/p/vpn/`. This remains a storage key independent of the short share entry; it may have the same value when the source ID and slug match. A custom historical source `url`, if provided, remains that storage identity; it does not replace the canonical language routes.

Short share entries have `noindex, follow`, a fixed canonical pointing to the Chinese original, and no article body. They are excluded from the sitemap. Article lists, search, feeds, README links, canonicals, and language alternatives continue to use the explicit `/zh/` and `/en/` addresses. The short entry is a client-side preference redirect, not a server-side HTTP 301/302.

## Search, feeds, and README files

Chinese search indexes originals. English search prefers an English version and falls back to a labeled Chinese result without duplicating the same article. Search matches the available text; it does not perform AI or cross-language semantic search.

Feed contents are fixed by address, independent of a visitor's saved interface language:

- `/rss.xml`: published Chinese originals.
- `/en/rss.xml`: published English translations only.

Both feeds include the configured description, cover, and full article content. Existing taxonomy feed addresses continue to serve Chinese originals.

The README generator selects the latest two logical articles. `README.md` prefers English versions, while `README.zh-CN.md` uses Chinese originals. Covers and article/category links use absolute public URLs. Keep editing personal README text outside the generated recent-post markers.

## Reviewing source updates

`sourceRevision` records the Chinese version against which an English translation was reviewed. It is a SHA-256 fingerprint of the original title, description, and body, with line endings normalized. Changing a shared setting such as the cover does not require re-reviewing translated prose.

When a published translation has no review fingerprint, or its original text changes, content validation prints a warning with the current `sourceRevision` value. The warning does not delete, rewrite, or silently hide a translation.

After updating an original:

1. Run `pnpm build` and read the translation review warning. The build loads article relationships and checks fingerprints.
2. Compare and update the English title, description, and body against the changed original.
3. Only after reviewing the pair, copy the warning's current `sourceRevision` value into the English front matter. Do not copy it merely to silence a warning.
4. Set the translation's `lastmod` when appropriate, then run the checks and production build again.

The fingerprint confirms which source text was reviewed, not whether the translation is accurate. New English drafts do not need a fingerprint until their first publication review.

## Publishing checks

Use `pnpm check` and `pnpm build` before publishing. Verify direct Chinese and English URLs, language switches, fallback behavior, and the generated feeds. Published article versions have their own canonical URL and reciprocal language alternatives; draft or missing versions must not appear in SEO alternatives.

After adding a new collection or the first translation, restart an already-running `pnpm dev` process if a new route still returns 404. Verify published routes with a fresh `pnpm build` and `pnpm preview`; an old development content store is not evidence that a published translation is missing.

## Thoughts translations

In `src/data/notes.json`, each item keeps its Chinese text in `content` and its optional English text in `translation`:

```json
{
  "date": "2026-11-11",
  "content": "这里写中文随想。",
  "translation": "Write the English translation here."
}
```

The interface language selects the displayed text without changing the `/notes/` address. A missing or blank `translation` falls back to `content`. Keep the existing item order, dates, images, and other fields when adding a translation.
