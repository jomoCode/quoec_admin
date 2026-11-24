"use client";

import { inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils/cn";
import { useCurrentSite } from "../hooks/useSites";

/**
 * "All websites" or one website, for screens that can show every website together (Enquiries, Insights).
 * `value` is a website_id, or "" for all. Hidden when there is only one website or the user can't list them.
 */
export function WebsiteFilter({ value, onChange, className }: { value: string; onChange: (websiteId: string) => void; className?: string }) {
  const { sites } = useCurrentSite();
  if (sites.length < 2) return null;
  return (
    <select aria-label="Website" value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "sm:w-48", className)}>
      <option value="">All websites</option>
      {sites.map((s) => <option key={s.website_id} value={s.website_id}>{s.name}</option>)}
    </select>
  );
}

/** Display name of a website_id, for "came from" columns. */
export function useSiteName(): (websiteId: string | null | undefined) => string | null {
  const { sites } = useCurrentSite();
  return (websiteId) => (websiteId ? sites.find((s) => s.website_id === websiteId)?.name ?? websiteId : null);
}
