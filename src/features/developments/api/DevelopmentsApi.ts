import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import { forSite } from "@/features/sites/siteStore";
import type { Development, DevelopmentInput, ImageSlot } from "../types";

/** Development cards of one website, usually the landing page (permission: cms.manage). `site` = its website_id. */
export class DevelopmentsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (site: string) => this.api.get<Development[]>("/admin/developments", undefined, forSite(site));
  get = (site: string, id: string) => this.api.get<Development>(`/admin/developments/${id}`, undefined, forSite(site));
  create = (site: string, body: DevelopmentInput & { name: string }) => this.api.post<Development>("/admin/developments", body, forSite(site));
  update = (site: string, id: string, body: DevelopmentInput) => this.api.patch<Development>(`/admin/developments/${id}`, body, forSite(site));
  remove = (site: string, id: string) => this.api.delete<void>(`/admin/developments/${id}`, forSite(site));
  /** Every development's id, in the new order. */
  reorder = (site: string, ids: string[]) => this.api.post<Development[]>("/admin/developments/reorder", { ids }, forSite(site));
  /** `featured` replaces the featured image; `gallery` adds to the end of the gallery. */
  addImage = (site: string, id: string, file: File, slot: ImageSlot) =>
    this.api.upload<Development>(`/admin/developments/${id}/images`, file, { slot }, forSite(site));
}

export const developmentsApi = new DevelopmentsApi();
