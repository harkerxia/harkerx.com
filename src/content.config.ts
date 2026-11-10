import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const common = z.looseObject({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  lastmod: z.coerce.date().optional(),
  slug: z.string().optional(),
  url: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  cover: z.string().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  series: z.array(z.string()).default([]),
  home: z.boolean().default(true),
  draft: z.boolean().default(false),
  sticky: z.union([z.boolean(), z.number()]).default(false),
  comment: z.boolean().default(true),
  aside: z.boolean().default(true),
  toc: z.boolean().default(true),
  random: z.boolean().default(true),
  type: z.string().optional(),
  not_cover: z.boolean().optional(),
});
export const collections = {
  posts: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "./src/content/posts",
      generateId: ({ entry }) => entry.replace(/\\/g, "/").replace(/\.mdx?$/i, ""),
    }),
    schema: common.extend({ date: z.coerce.date() }),
  }),
  translations: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "./src/content/translations/en",
      generateId: ({ entry }) => entry.replace(/\\/g, "/").replace(/\.mdx?$/i, ""),
    }),
    schema: z.strictObject({
      translationOf: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().optional(),
      draft: z.boolean().default(false),
      lastmod: z.coerce.date().optional(),
      sourceRevision: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
    schema: common.extend({ comment: z.boolean().optional() }),
  }),
};
