export const UrlUtil = {
  joinUrl(base: string, path: string): string {
    const normalizedBase = base.replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  },

  toQueryString(params: Record<string, string | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        search.set(key, value);
      }
    }
    return search.toString();
  },

  normalizeScopes(scope?: string | string[]): string {
    if (!scope) {
      return "";
    }
    if (Array.isArray(scope)) {
      return scope.filter(Boolean).join(" ");
    }
    return scope.trim();
  },
};
