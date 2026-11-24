"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import { Perm } from "@/features/auth/permissions";
import { useAuth } from "@/providers/AuthProvider";
import { sitesApi } from "../api/SitesApi";
import { siteStore } from "../siteStore";
import type { Site } from "../types";

export const useSites = (enabled = true) =>
  useQuery({ queryKey: ["sites"], queryFn: sitesApi.list, staleTime: 5 * 60_000, enabled });

/** The website being edited: its `website_id` (null until known) and, once the list loads, the full record. */
export function useCurrentSite(): { websiteId: string | null; site: Site | undefined; sites: Site[]; isLoading: boolean; select: (websiteId: string) => void } {
  const { can } = useAuth();
  const canList = can(Perm.CmsManage) || can(Perm.SettingsManage);
  const query = useSites(canList);
  const stored = useSyncExternalStore(siteStore.subscribe, siteStore.get, siteStore.getServer);
  const sites = (query.data ?? []).filter((s) => s.is_active);
  const site = sites.find((s) => s.website_id === stored);

  // First visit, or the remembered website was removed or switched off: fall back to the first one.
  useEffect(() => {
    if (query.data && !site) siteStore.set(sites[0]?.website_id ?? null);
  }, [query.data, site, sites]);

  return { websiteId: site ? stored : null, site, sites, isLoading: query.isLoading, select: siteStore.set };
}

/** For data hooks: the selected website, or null while it is being worked out (queries wait). */
export const useWebsiteId = () => useCurrentSite().websiteId;

/** The website's public address (e.g. "https://quoec.com"), or null when it has no domain yet. */
export const siteOrigin = (site: Site | undefined): string | null =>
  site?.primary_domain ? `https://${site.primary_domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : null;

/** Link builder for pages on the selected website; returns null when the website has no domain (hide the link). */
export function useSiteLink(): (path: string) => string | null {
  const origin = siteOrigin(useCurrentSite().site);
  return (path) => (origin ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : null);
}
