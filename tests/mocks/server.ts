import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const API = "http://localhost:8000/api/v1";

const site = (website_id: string, kind: "estate" | "landing", name: string, primary_domain: string | null) => ({
  id: `site-${website_id}`, website_id, kind, name, estate_id: kind === "estate" ? "estate-1" : null, estate_name: kind === "estate" ? name : null,
  primary_domain, allowed_origins: [], is_active: true, created_at: "2026-11-22T00:00:00Z", updated_at: "2026-11-22T00:00:00Z",
});
/** Same order the backend lists them in (estate sites first). The admin picks the first by default. */
export const SITES = [site("citadel", "estate", "The Citadel", "thecitadel.ng"), site("quoec", "landing", "Quoec (landing page)", "quoec.com")];

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.get(`${API}/admin/sites`, () => HttpResponse.json(SITES)),
  http.post(`${API}/public/enquiries`, () => HttpResponse.json({ id: "enq_1", reference: "ENQ-2026-0001" }, { status: 201 })),
  http.post(`${API}/public/events`, () => new HttpResponse(null, { status: 204 })),
];

export const server = setupServer(...handlers);
