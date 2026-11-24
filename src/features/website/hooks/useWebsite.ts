"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { useWebsiteId } from "@/features/sites/hooks/useSites";
import { enquiriesApi, listingsApi, type EnquiryQuery } from "../api/WebsiteApi";
import type { ListingInput } from "../types";

const LISTINGS = [["listings"]] as const;
const ENQUIRIES = [["enquiries"], ["notifications"]] as const;

// ── Listings (keys: ["listings", website_id, …]) ─────────────────────────
export function useListings(q: PageQuery & { published?: boolean }) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["listings", site, "list", q], queryFn: () => listingsApi.list(site!, q), enabled: !!site, placeholderData: keepPreviousData });
}
export function useListing(id: string) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["listings", site, "detail", id], queryFn: () => listingsApi.get(site!, id), enabled: !!site });
}

export function useListingActions(id?: string) {
  const site = useWebsiteId()!;
  return {
    create: useMutationWithToast({ mutationFn: (body: ListingInput) => listingsApi.create(site, body), success: (l) => `${l.name} created — add photos next`, invalidate: LISTINGS }),
    update: useMutationWithToast({
      mutationFn: (body: ListingInput) => listingsApi.update(site, id!, body),
      success: (l, body) => ("is_published" in body ? (l.is_published ? "Listing is live on the website" : "Listing hidden from the website") : "Listing saved"),
      invalidate: LISTINGS,
    }),
    remove: useMutationWithToast({
      mutationFn: () => listingsApi.remove(site, id!),
      success: "Listing deleted",
      // Only the list: refetching the deleted listing's own page would flash "not found" before we leave it.
      invalidate: [["listings", site, "list"], ...ENQUIRIES],
    }),
    addPhoto: useMutationWithToast({ mutationFn: (file: File) => listingsApi.addPhoto(site, id!, file), success: "Photo added", invalidate: LISTINGS }),
    removePhoto: useMutationWithToast({ mutationFn: (photoId: string) => listingsApi.removePhoto(site, id!, photoId), success: "Photo removed", invalidate: LISTINGS }),
    reorder: useMutationWithToast({ mutationFn: (ids: string[]) => listingsApi.reorderPhotos(site, id!, ids), success: "Photo order saved", invalidate: LISTINGS }),
  };
}

// ── Enquiries (`site` null = every website) ──────────────────────────────
export const useEnquiries = (site: string | null, q: EnquiryQuery) =>
  useQuery({ queryKey: ["enquiries", "list", site, q], queryFn: () => enquiriesApi.list(site, q), placeholderData: keepPreviousData, refetchInterval: 60_000 });
export const useEnquiryCounts = (site: string | null = null) =>
  useQuery({ queryKey: ["enquiries", "counts", site], queryFn: () => enquiriesApi.counts(site), refetchInterval: 60_000 });
export const useEnquiry = (id: string) => useQuery({ queryKey: ["enquiries", "detail", id], queryFn: () => enquiriesApi.get(id) });

export function useEnquiryActions(id: string) {
  return {
    setHandled: useMutationWithToast({
      mutationFn: (handled: boolean) => enquiriesApi.setHandled(id, handled),
      success: (e) => (e.handled ? "Marked as handled" : "Moved back to “To handle”"), invalidate: ENQUIRIES,
    }),
    addNote: useMutationWithToast({ mutationFn: (body: string) => enquiriesApi.addNote(id, body), success: "Note saved", invalidate: ENQUIRIES }),
  };
}
