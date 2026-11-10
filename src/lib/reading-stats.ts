import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const cjkCharacters = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const words = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu;

export function readingStats(markdown: string) {
  const html = marked.parse(markdown, { async: false }).replace(
    /<\/?(?:br|hr|p|div|li|h[1-6]|tr|td|th|blockquote|pre|table|ul|ol|section|article)\b[^>]*>/gi,
    ' $& ',
  );
  let text = '';
  // The parser supplies decoded text, excluding image/link attributes and script/style content.
  sanitizeHtml('<reading-stats-root>' + html + '</reading-stats-root>', {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'reading-stats-root'],
    allowedAttributes: {},
    exclusiveFilter: (frame) => {
      if (frame.tag === 'reading-stats-root') text = frame.text;
      return false;
    },
  });
  const characters = (text.match(cjkCharacters) ?? []).length;
  const wordCount = (text.replace(cjkCharacters, ' ').match(words) ?? []).length;
  return {
    count: characters + wordCount,
    // Estimate mixed-language reading using the existing CJK/English rates.
    minutes: Math.max(1, Math.ceil(characters / 500 + wordCount / 212)),
  };
}

export const wordCount = (markdown: string) => readingStats(markdown).count;
