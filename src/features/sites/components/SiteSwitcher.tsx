"use client";

import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentSite } from "../hooks/useSites";

/** Website-section pages that show one record; after switching websites they go back to their list. */
const DETAIL_PAGE = /^\/admin\/(properties|journal|developments)\/[^/]+$/;

/** Picks which website the Website section edits. Shown at the top of that section in the sidebar. */
export function SiteSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { sites, websiteId, select } = useCurrentSite();
  const pathname = usePathname();
  const router = useRouter();
  if (sites.length < 2 || !websiteId) return null;

  const change = (next: string) => {
    select(next);
    // A listing or article belongs to one website, so its page can't stay open on another.
    if (DETAIL_PAGE.test(pathname)) router.push(pathname.replace(/\/[^/]+$/, ""));
    onSwitch?.();
  };

  return (
    <label className="relative mb-2 block px-1">
      <span className="sr-only">Website being edited</span>
      <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gold" aria-hidden />
      <select value={websiteId} onChange={(e) => change(e.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-surface-muted py-2 pl-9 pr-8 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-gold/60">
        {sites.map((s) => <option key={s.website_id} value={s.website_id}>{s.name}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </label>
  );
}
