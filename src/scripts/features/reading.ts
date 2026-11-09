import { Solitude } from "../core/api";
import { lifecycle } from "../core/lifecycle";

const storageKey = "solitude-read-posts";
let readPosts = new Set<string>();
const postPath = (address: string) =>
  new URL(address, document.baseURI).pathname.replace(/\/+$/, "") || "/";

const restoreReadPosts = () => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    readPosts = new Set(
      Array.isArray(stored)
        ? stored.filter((value): value is string =>
            typeof value === "string" && value.startsWith("/") && !value.startsWith("//"),
          )
        : [],
    );
  } catch {
    // Keep this session's read state when browser storage is unavailable.
  }
};

export const initPostReadState = () => {
  restoreReadPosts();
  if (Solitude.page.is_post) {
    readPosts.add(postPath(location.href));
    try {
      localStorage.setItem(storageKey, JSON.stringify([...readPosts]));
    } catch {
      // Reading an article must still work when persistence is blocked.
    }
  }
  const updateBadges = () => {
    document.querySelectorAll<HTMLAnchorElement>(".unvisited-post").forEach((badge) => {
      badge.hidden = readPosts.has(postPath(badge.href));
    });
  };
  const restoreBadges = () => {
    restoreReadPosts();
    updateBadges();
  };
  updateBadges();
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) restoreBadges();
  }, { signal: lifecycle.signal });
  window.addEventListener("pageshow", restoreBadges, { signal: lifecycle.signal });
};
