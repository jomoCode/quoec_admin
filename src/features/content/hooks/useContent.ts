"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { useWebsiteId } from "@/features/sites/hooks/useSites";
import { insightsApi, journalApi, siteContentApi } from "../api/ContentApi";
import type { FaqInput, PostInput, PostStatus, SiteSettings, TestimonialInput } from "../types";

const POSTS = [["posts"]] as const;
const SITE = [["site"]] as const;

// Every key below starts with [area, website_id, …] so two websites never share cached data,
// and queries wait (enabled: false) until the selected website is known.

// ── Journal ───────────────────────────────────────────────────────────────
export function usePosts(q: PageQuery & { status?: PostStatus }) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["posts", site, "list", q], queryFn: () => journalApi.list(site!, q), enabled: !!site, placeholderData: keepPreviousData });
}
export function usePost(id: string) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["posts", site, "detail", id], queryFn: () => journalApi.get(site!, id), enabled: !!site });
}
export function useCategories() {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["posts", site, "categories"], queryFn: () => journalApi.categories(site!), enabled: !!site, staleTime: 5 * 60_000 });
}

export function usePostActions(id?: string) {
  const site = useWebsiteId()!;
  return {
    create: useMutationWithToast({ mutationFn: (body: PostInput & { title: string }) => journalApi.create(site, body), success: "Draft created", invalidate: POSTS }),
    save: useMutationWithToast({ mutationFn: (body: PostInput) => journalApi.update(site, id!, body), success: "Saved", invalidate: POSTS }),
    cover: useMutationWithToast({ mutationFn: (file: File) => journalApi.setCover(site, id!, file), success: "Cover photo updated", invalidate: POSTS }),
    publish: useMutationWithToast({
      mutationFn: (publishAt: string | null) => journalApi.publish(site, id!, publishAt),
      success: (p) => (p.status === "scheduled" ? "Scheduled — it goes live automatically" : "Published — live on the website within a minute"), invalidate: POSTS,
    }),
    unpublish: useMutationWithToast({ mutationFn: () => journalApi.unpublish(site, id!), success: "Taken off the website (now a draft)", invalidate: POSTS }),
    archive: useMutationWithToast({ mutationFn: () => journalApi.archive(site, id!), success: "Archived", invalidate: POSTS }),
    createCategory: useMutationWithToast({ mutationFn: (name: string) => journalApi.createCategory(site, name), success: (c) => `Category “${c.name}” added`, invalidate: POSTS }),
  };
}

// ── Site content ──────────────────────────────────────────────────────────
function useSiteQuery<T>(part: string, fetch: (site: string) => Promise<T>, staleTime?: number) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["site", site, part], queryFn: () => fetch(site!), enabled: !!site, staleTime });
}
export const useSiteSettingsAdmin = () => useSiteQuery("settings", siteContentApi.settings);
export const useFaqs = () => useSiteQuery("faqs", siteContentApi.faqs);
export const useTestimonials = () => useSiteQuery("testimonials", siteContentApi.testimonials);
export const usePageSeo = () => useSiteQuery("pages", siteContentApi.pages);
export const usePageNames = () => useSiteQuery("page-names", siteContentApi.pageNames, Infinity);

export function useSiteActions() {
  const site = useWebsiteId()!;
  return {
    saveSettings: useMutationWithToast({ mutationFn: (b: Omit<SiteSettings, "updated_at">) => siteContentApi.saveSettings(site, b), success: "Contact details saved", invalidate: SITE }),
    createFaq: useMutationWithToast({ mutationFn: (b: FaqInput) => siteContentApi.createFaq(site, b), success: "Question added", invalidate: SITE }),
    updateFaq: useMutationWithToast({ mutationFn: (b: { id: string } & Partial<FaqInput>) => siteContentApi.updateFaq(site, b.id, b), success: "Question saved", invalidate: SITE }),
    createTestimonial: useMutationWithToast({ mutationFn: (b: TestimonialInput) => siteContentApi.createTestimonial(site, b), success: "Testimonial added (hidden until you show it)", invalidate: SITE }),
    updateTestimonial: useMutationWithToast({
      mutationFn: (b: { id: string } & Partial<TestimonialInput> & { is_published?: boolean }) => siteContentApi.updateTestimonial(site, b.id, b),
      success: "Testimonial saved", invalidate: SITE,
    }),
    testimonialPhoto: useMutationWithToast({ mutationFn: (b: { id: string; file: File }) => siteContentApi.testimonialPhoto(site, b.id, b.file), success: "Photo added", invalidate: SITE }),
    reorder: useMutationWithToast({ mutationFn: (b: { table: "faqs" | "testimonials"; ids: string[] }) => siteContentApi.reorder(site, b.table, b.ids), success: "Order saved", invalidate: SITE }),
    remove: useMutationWithToast({ mutationFn: (b: { table: "faqs" | "testimonials"; id: string }) => siteContentApi.remove(site, b.table, b.id), success: "Deleted", invalidate: SITE }),
    savePage: useMutationWithToast({
      mutationFn: (b: { path: string; title: string | null; description: string | null }) => siteContentApi.savePage(site, b.path, b),
      success: "Search-engine text saved", invalidate: SITE,
    }),
  };
}

// ── Insights ──────────────────────────────────────────────────────────────
/** `site` null = every website together. */
export const useInsights = (site: string | null, days: number) =>
  useQuery({ queryKey: ["insights", site, days], queryFn: () => insightsApi.summary(site, days), placeholderData: keepPreviousData, staleTime: 60_000 });
