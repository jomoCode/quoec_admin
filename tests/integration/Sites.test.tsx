import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import DevelopmentPage from "@/app/(admin)/admin/developments/[id]/page";
import DevelopmentsPage from "@/app/(admin)/admin/developments/page";
import EnquiriesPage from "@/app/(admin)/admin/enquiries/page";
import ListingPage from "@/app/(admin)/admin/properties/[id]/page";
import ListingsPage from "@/app/(admin)/admin/properties/page";
import { visibleNav } from "@/components/admin/nav";
import type { Development } from "@/features/developments/types";
import { SiteSwitcher } from "@/features/sites/components/SiteSwitcher";
import { siteStore } from "@/features/sites/siteStore";
import type { Listing } from "@/features/website/types";
import { API, server } from "../mocks/server";
import { navigation } from "../setup";
import { FakeAuthService, makeToken } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const editor = () => new FakeAuthService(makeToken({ sub: "w1", app_permissions: ["cms.manage", "leads.view"] }));

const listing = (over: Partial<Listing> = {}): Listing => ({
  id: "p1", slug: "palm-crest", name: "Palm Crest", property_type: "Duplexes", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos",
  price_from_kobo: 0, bedrooms_min: 4, bedrooms_max: 5, status: "selling", summary: "Villas.", description: [], features: [], featured: false,
  is_published: true, seo_title: null, seo_description: null, photos: [{ id: "ph1", url: "https://x.supabase.co/a.jpg", alt: "", position: 0 }],
  enquiry_count: 2, updated_at: "2026-11-24T10:00:00Z", ...over,
});

const development = (over: Partial<Development> = {}): Development => ({
  id: "d1", slug: "the-citadel", name: "The Citadel", location: "Asokoro, Abuja", description: "", status: "ongoing", featured: true, display_order: 1,
  is_coming_soon: false, external_url: "https://thecitadel.ng", featured_image: "https://x.supabase.co/c.jpg", gallery_images: [], featured_video: null,
  residence_summary: null, estate_id: null, is_published: true, updated_at: "2026-11-24T10:00:00Z", ...over,
});

const emptyPage = { items: [], total: 0, page: 1, page_size: 20 };

async function openPage(ui: React.ReactElement, auth = editor()) {
  await act(async () => { renderWithProviders(<Suspense>{ui}</Suspense>, { auth }); });
}

describe("Picking a website", () => {
  it("sends the picked website with every listing call, defaulting to the first", async () => {
    const seen: (string | null)[] = [];
    server.use(http.get(`${API}/admin/properties/p1`, ({ request }) => {
      seen.push(request.headers.get("X-Website-Id"));
      return HttpResponse.json(listing());
    }));
    await openPage(<ListingPage params={Promise.resolve({ id: "p1" })} />);
    expect(await screen.findByRole("heading", { name: "Palm Crest" })).toBeInTheDocument();
    expect(seen).toEqual(["citadel"]);

    act(() => siteStore.set("quoec"));
    await vi.waitFor(() => expect(seen).toEqual(["citadel", "quoec"]));
  });

  it("switches website from the sidebar and leaves a page that belongs to the old one", async () => {
    navigation.pathname = "/admin/properties/p1";
    const user = userEvent.setup();
    await openPage(<SiteSwitcher />);
    const picker = await screen.findByRole("combobox", { name: "Website being edited" });
    expect(picker).toHaveValue("citadel");
    await user.selectOptions(picker, "quoec");
    expect(siteStore.get()).toBe("quoec");
    expect(navigation.router.push).toHaveBeenCalledWith("/admin/properties");
  });

  it("shows Listings for estate websites and Developments for the landing page", () => {
    const can = () => true;
    const labels = (kind?: "landing" | "estate") => visibleNav(can, kind).map((i) => i.label);
    expect(labels("estate")).toContain("Listings");
    expect(labels("estate")).not.toContain("Developments");
    expect(labels("landing")).toContain("Developments");
    expect(labels("landing")).not.toContain("Listings");
    expect(labels(undefined)).not.toContain("Listings"); // waits until the website is known
  });

  it("points to an estate website when Listings is opened on the landing page", async () => {
    siteStore.set("quoec");
    await openPage(<ListingsPage />);
    expect(await screen.findByText("Listings belong to an estate's website")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Switch to The Citadel" }));
    expect(siteStore.get()).toBe("citadel");
  });
});

describe("Deleting a listing", () => {
  it("asks first, deletes on the picked website, then goes back to Listings", async () => {
    let deleted: string | null = null;
    server.use(
      http.get(`${API}/admin/properties/p1`, () => HttpResponse.json(listing())),
      http.delete(`${API}/admin/properties/p1`, ({ request }) => {
        deleted = request.headers.get("X-Website-Id");
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    await openPage(<ListingPage params={Promise.resolve({ id: "p1" })} />);
    expect(await screen.findByText(/Its 2 enquiries are kept/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete listing" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/can't be undone/);
    await user.click(within(dialog).getByRole("button", { name: "Delete listing" }));
    await vi.waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith("/admin/properties"));
    expect(deleted).toBe("citadel");
  });
});

describe("Enquiries across websites", () => {
  it("shows every website by default and narrows to one when picked", async () => {
    const seen: (string | null)[] = [];
    server.use(
      http.get(`${API}/admin/enquiries`, ({ request }) => {
        seen.push(request.headers.get("X-Website-Id"));
        return HttpResponse.json(emptyPage);
      }),
      http.get(`${API}/admin/enquiries/counts`, () => HttpResponse.json({ open: 0, today: 0 })),
    );
    const user = userEvent.setup();
    await openPage(<EnquiriesPage />);
    const filter = await screen.findByRole("combobox", { name: "Website" });
    await vi.waitFor(() => expect(seen).toContain(null));
    await user.selectOptions(filter, "quoec");
    expect(navigation.router.replace).toHaveBeenCalledWith("/contact?site=quoec", { scroll: false });

    navigation.search = "site=quoec";
    seen.length = 0;
    await openPage(<EnquiriesPage />);
    await vi.waitFor(() => expect(seen).toContain("quoec"));
  });
});

describe("Developments", () => {
  it("points to the landing page when another website is picked", async () => {
    await openPage(<DevelopmentsPage />);
    expect(await screen.findByText("Developments are shown on the landing page")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: /Switch to Quoec/ }));
    expect(siteStore.get()).toBe("quoec");
  });

  it("lists the landing page's cards and saves a new order", async () => {
    siteStore.set("quoec");
    let order: string[] = [];
    let site: string | null = null;
    const rows = [development(), development({ id: "d2", slug: "palm-crest", name: "Palm Crest", featured: false, is_published: false })];
    server.use(
      http.get(`${API}/admin/developments`, ({ request }) => {
        site = request.headers.get("X-Website-Id");
        return HttpResponse.json(rows);
      }),
      http.post(`${API}/admin/developments/reorder`, async ({ request }) => {
        order = ((await request.json()) as { ids: string[] }).ids;
        return HttpResponse.json([rows[1], rows[0]]);
      }),
    );
    const user = userEvent.setup();
    await openPage(<DevelopmentsPage />);
    expect(await screen.findByText("Palm Crest")).toBeInTheDocument();
    expect(site).toBe("quoec");
    expect(screen.getByText("Hidden")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Move Palm Crest up" }));
    await vi.waitFor(() => expect(order).toEqual(["d2", "d1"]));
  });

  it("uploads a featured image and a gallery photo with the right slot", async () => {
    siteStore.set("quoec");
    let current = development({ featured_image: "" });
    const slots: string[] = [];
    server.use(
      http.get(`${API}/admin/developments/d1`, () => HttpResponse.json(current)),
      http.post(`${API}/admin/developments/d1/images`, async ({ request }) => {
        const slot = String((await request.formData()).get("slot"));
        slots.push(slot);
        current = slot === "featured"
          ? { ...current, featured_image: "https://x.supabase.co/new.jpg" }
          : { ...current, gallery_images: [...current.gallery_images, `https://x.supabase.co/g${current.gallery_images.length}.jpg`] };
        return HttpResponse.json(current, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    await openPage(<DevelopmentPage params={Promise.resolve({ id: "d1" })} />);
    expect(await screen.findByText("No featured image yet")).toBeInTheDocument();

    const jpg = (name: string) => new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("Upload featured image"), jpg("cover.jpg"));
    expect(await screen.findByAltText("The Citadel featured image")).toBeInTheDocument();
    await user.upload(screen.getByLabelText("Upload gallery photos"), [jpg("a.jpg"), jpg("b.jpg")]);
    await vi.waitFor(() => expect(screen.getAllByRole("button", { name: /^Remove gallery photo/ })).toHaveLength(2));
    expect(slots).toEqual(["featured", "gallery", "gallery"]);
  });
});
