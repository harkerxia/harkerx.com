// Share the same policy between rendered comments and their browser controls.
const excludedTypes = new Set([
  "solitude",
  "music",
  "tags",
  "categories",
  "series",
  "recentcomment",
  "archives",
  "taxonomy",
  "term",
  "404",
]);

export const pageCommentsEnabled = (type: string, comment?: boolean): boolean => {
  if (excludedTypes.has(type)) return false;
  if (type === "about" || type === "notes") return comment === true;
  return comment !== false;
};
