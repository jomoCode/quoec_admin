import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { Page, PageQuery } from "@/features/estate-core/types";
import { forSite } from "@/features/sites/siteStore";
import type { Category, Faq, FaqInput, Insights, PageSeo, Post, PostInput, PostStatus, SiteSettings, Testimonial, TestimonialInput } from "../types";

/** Journal articles of one website (permission: cms.manage). `site` = its website_id. */
export class JournalApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (site: string, q: PageQuery & { status?: PostStatus }) => this.api.get<Page<Post>>("/admin/posts", q, forSite(site));
  get = (site: string, id: string) => this.api.get<Post>(`/admin/posts/${id}`, undefined, forSite(site));
  create = (site: string, body: PostInput & { title: string }) => this.api.post<Post>("/admin/posts", body, forSite(site));
  update = (site: string, id: string, body: PostInput) => this.api.patch<Post>(`/admin/posts/${id}`, body, forSite(site));
  setCover = (site: string, id: string, file: File) => this.api.upload<Post>(`/admin/posts/${id}/cover`, file, {}, forSite(site));
  addImage = (site: string, id: string, file: File) => this.api.upload<{ url: string }>(`/admin/posts/${id}/images`, file, {}, forSite(site));
  publish = (site: string, id: string, publishAt?: string | null) => this.api.post<Post>(`/admin/posts/${id}/publish`, { publish_at: publishAt ?? null }, forSite(site));
  unpublish = (site: string, id: string) => this.api.post<Post>(`/admin/posts/${id}/unpublish`, undefined, forSite(site));
  archive = (site: string, id: string) => this.api.post<Post>(`/admin/posts/${id}/archive`, undefined, forSite(site));
  categories = (site: string) => this.api.get<Category[]>("/admin/posts/categories", undefined, forSite(site));
  createCategory = (site: string, name: string) => this.api.post<Category>("/admin/posts/categories", { name }, forSite(site));
}

/** Contact details, FAQs, testimonials and page search-engine text of one website (permission: cms.manage). */
export class SiteContentApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  settings = (site: string) => this.api.get<SiteSettings>("/admin/site/settings", undefined, forSite(site));
  saveSettings = (site: string, body: Omit<SiteSettings, "updated_at">) => this.api.put<SiteSettings>("/admin/site/settings", body, forSite(site));
  faqs = (site: string) => this.api.get<Faq[]>("/admin/site/faqs", undefined, forSite(site));
  createFaq = (site: string, body: FaqInput) => this.api.post<Faq>("/admin/site/faqs", body, forSite(site));
  updateFaq = (site: string, id: string, body: Partial<FaqInput>) => this.api.patch<Faq>(`/admin/site/faqs/${id}`, body, forSite(site));
  testimonials = (site: string) => this.api.get<Testimonial[]>("/admin/site/testimonials", undefined, forSite(site));
  createTestimonial = (site: string, body: TestimonialInput) => this.api.post<Testimonial>("/admin/site/testimonials", body, forSite(site));
  updateTestimonial = (site: string, id: string, body: Partial<TestimonialInput> & { is_published?: boolean }) =>
    this.api.patch<Testimonial>(`/admin/site/testimonials/${id}`, body, forSite(site));
  testimonialPhoto = (site: string, id: string, file: File) => this.api.upload<Testimonial>(`/admin/site/testimonials/${id}/photo`, file, {}, forSite(site));
  reorder = (site: string, table: "faqs" | "testimonials", ids: string[]) => this.api.put(`/admin/site/${table}/order`, { ids }, forSite(site));
  remove = (site: string, table: "faqs" | "testimonials", id: string) => this.api.delete(`/admin/site/${table}/${id}`, forSite(site));
  pages = (site: string) => this.api.get<PageSeo[]>("/admin/site/pages", undefined, forSite(site));
  pageNames = (site: string) => this.api.get<Record<string, string>>("/admin/site/page-names", undefined, forSite(site));
  savePage = (site: string, path: string, body: { title: string | null; description: string | null; image_url?: string | null }) =>
    this.api.put<PageSeo>(`/admin/site/pages?path=${encodeURIComponent(path)}`, body, forSite(site));
}

/** Website analytics. `site` null = every website together. */
export class InsightsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  summary = (site: string | null, days: number) => this.api.get<Insights>("/admin/insights", { days }, site ? forSite(site) : undefined);
}

export const journalApi = new JournalApi();
export const siteContentApi = new SiteContentApi();
export const insightsApi = new InsightsApi();
