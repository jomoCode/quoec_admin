/**
 * Which website the admin is editing (its `website_id`), shared by every screen and remembered per browser.
 * Kept outside React so API helpers and hooks read the same value.
 */
const KEY = "admin.website";
const listeners = new Set<() => void>();
let current: string | null | undefined; // undefined = not read from storage yet

function read(): string | null {
  if (current === undefined) {
    try {
      current = window.localStorage.getItem(KEY);
    } catch {
      current = null;
    }
  }
  return current;
}

export const siteStore = {
  get: (): string | null => (typeof window === "undefined" ? null : read()),
  getServer: (): string | null => null,
  set(websiteId: string | null) {
    if (websiteId === read()) return;
    current = websiteId;
    try {
      if (websiteId) window.localStorage.setItem(KEY, websiteId);
      else window.localStorage.removeItem(KEY);
    } catch {
      // Private mode or blocked storage: the choice still holds for this tab.
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Request options that name the website a call is for. */
export const forSite = (websiteId: string) => ({ headers: { "X-Website-Id": websiteId } });
