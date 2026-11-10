import { createHash } from "node:crypto";
import type { SourcePost, TranslationEntry } from "./content";

const normalized = (value: string | undefined) =>
  (value ?? "").replace(/\r\n?/g, "\n").trim();

// Shared settings such as covers do not require re-reviewing translated prose.
export function sourceRevision(source: SourcePost): string {
  return createHash("sha256").update(JSON.stringify({
    title: normalized(source.data.title),
    description: normalized(source.data.description),
    body: normalized(source.body),
  })).digest("hex");
}

export function translationReviewMessages(
  sources: SourcePost[],
  translations: TranslationEntry[],
): string[] {
  const originals = new Map(sources.map((source) => [source.id, source]));
  return translations.flatMap((entry) => {
    const source = originals.get(entry.data.translationOf);
    if (!source || source.data.draft || entry.data.draft) return [];
    const revision = sourceRevision(source);
    if (entry.data.sourceRevision === revision) return [];
    const reason = entry.data.sourceRevision
      ? "the Chinese title, description, or body changed since translation review"
      : "no reviewed source revision has been recorded";
    return [
      `[translations] ${entry.id}: ${reason}. Review the English translation against ${source.id}; after updating it, set sourceRevision: "${revision}" in its front matter.`,
    ];
  });
}
