"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import { useWebsiteId } from "@/features/sites/hooks/useSites";
import { developmentsApi } from "../api/DevelopmentsApi";
import type { DevelopmentInput, ImageSlot } from "../types";

const DEVELOPMENTS = [["developments"]] as const;

// Keys: ["developments", website_id, …] — never shared between websites.
export function useDevelopments() {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["developments", site, "list"], queryFn: () => developmentsApi.list(site!), enabled: !!site });
}
export function useDevelopment(id: string) {
  const site = useWebsiteId();
  return useQuery({ queryKey: ["developments", site, "detail", id], queryFn: () => developmentsApi.get(site!, id), enabled: !!site });
}

export function useDevelopmentActions(id?: string) {
  const site = useWebsiteId()!;
  return {
    create: useMutationWithToast({
      mutationFn: (body: DevelopmentInput & { name: string }) => developmentsApi.create(site, body), success: (d) => `${d.name} added — add photos next`, invalidate: DEVELOPMENTS,
    }),
    update: useMutationWithToast({
      mutationFn: (body: DevelopmentInput) => developmentsApi.update(site, id!, body),
      success: (d, body) => ("is_published" in body ? (d.is_published ? "Shown on the website" : "Hidden from the website") : "Development saved"),
      invalidate: DEVELOPMENTS,
    }),
    remove: useMutationWithToast({
      mutationFn: () => developmentsApi.remove(site, id!), success: "Development deleted",
      invalidate: [["developments", site, "list"]], // not the deleted card's own page (it would flash "not found")
    }),
    reorder: useMutationWithToast({ mutationFn: (ids: string[]) => developmentsApi.reorder(site, ids), success: "Order saved", invalidate: DEVELOPMENTS }),
    addImage: useMutationWithToast({
      mutationFn: (b: { file: File; slot: ImageSlot }) => developmentsApi.addImage(site, id!, b.file, b.slot),
      success: (_d, b) => (b.slot === "featured" ? "Featured image updated" : "Photo added to the gallery"), invalidate: DEVELOPMENTS,
    }),
  };
}
