/** Mirrors backend app/contracts/site.py (SiteOut). */
export type SiteKind = "landing" | "estate";

export type Site = {
  id: string;
  /** Slug the frontends send as `X-Website-Id`. Never changes. */
  website_id: string;
  kind: SiteKind;
  name: string;
  estate_id: string | null;
  estate_name: string | null;
  primary_domain: string | null;
  allowed_origins: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
