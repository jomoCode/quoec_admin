import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { Page, PageQuery } from "@/features/estate-core/types";
import { forSite } from "@/features/sites/siteStore";
import type { Enquiry, EnquiryCounts, EnquiryDetail, HandledFilter, Listing, ListingInput } from "../types";

/** Property listings of one website (permission: cms.manage). `site` = its website_id. */
export class ListingsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (site: string, q: PageQuery & { published?: boolean }) => this.api.get<Page<Listing>>("/admin/properties", q, forSite(site));
  get = (site: string, id: string) => this.api.get<Listing>(`/admin/properties/${id}`, undefined, forSite(site));
  create = (site: string, body: ListingInput) => this.api.post<Listing>("/admin/properties", body, forSite(site));
  update = (site: string, id: string, body: ListingInput) => this.api.patch<Listing>(`/admin/properties/${id}`, body, forSite(site));
  /** Deletes the listing and its photos; enquiries about it are kept. */
  remove = (site: string, id: string) => this.api.delete<void>(`/admin/properties/${id}`, forSite(site));
  addPhoto = (site: string, id: string, file: File) => this.api.upload<Listing>(`/admin/properties/${id}/photos`, file, {}, forSite(site));
  removePhoto = (site: string, id: string, photoId: string) => this.api.delete<Listing>(`/admin/properties/${id}/photos/${photoId}`, forSite(site));
  reorderPhotos = (site: string, id: string, photoIds: string[]) =>
    this.api.put<Listing>(`/admin/properties/${id}/photos/order`, { photo_ids: photoIds }, forSite(site));
}

export type EnquiryQuery = PageQuery & { handled?: HandledFilter; enquiry_type?: string; property_id?: string };

/**
 * Enquiries sent from the public websites (view: leads.view; tick off / notes: leads.manage).
 * `site` null = every website. Single enquiries are opened by id, so they need no website.
 */
export class EnquiriesApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (site: string | null, q: EnquiryQuery) => this.api.get<Page<Enquiry>>("/admin/enquiries", q, site ? forSite(site) : undefined);
  counts = (site: string | null) => this.api.get<EnquiryCounts>("/admin/enquiries/counts", undefined, site ? forSite(site) : undefined);
  get = (id: string) => this.api.get<EnquiryDetail>(`/admin/enquiries/${id}`);
  setHandled = (id: string, handled: boolean) => this.api.post<EnquiryDetail>(`/admin/enquiries/${id}/handled`, { handled });
  addNote = (id: string, body: string) => this.api.post<EnquiryDetail>(`/admin/enquiries/${id}/notes`, { body });
}

export const listingsApi = new ListingsApi();
export const enquiriesApi = new EnquiriesApi();
