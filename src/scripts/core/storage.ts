export const saveToLocal = {
  set(key: string, value: unknown, ttlDays: number) {
    if (ttlDays === 0) return;
    try {
      const expiry = Date.now() + ttlDays * 86_400_000;
      localStorage.setItem(key, JSON.stringify({ value, expiry }));
    } catch {
      // Optional preferences must not interrupt page behavior when storage fails.
    }
  },
  get<T = unknown>(key: string): T | undefined {
    try {
      const source = localStorage.getItem(key);
      if (!source) return undefined;
      const item = JSON.parse(source);
      if (!item?.expiry || Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return undefined;
      }
      return item.value as T;
    } catch {
      // Treat unavailable storage or invalid cached data as a cache miss.
      return undefined;
    }
  },
};
