import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { Site } from "../types";

/** The websites the admin can manage: the landing page and each estate's site (view: cms.manage or settings.manage). */
export class SitesApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = () => this.api.get<Site[]>("/admin/sites");
}

export const sitesApi = new SitesApi();
