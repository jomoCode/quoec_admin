/** Settings for the estate portal (admin, security and resident). */
export const portalConfig = {
  name: "The Citadel Portal",
  shortName: "Citadel Portal",
  description: "Estate management for The Citadel, Asokoro — for administrators, security and residents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
} as const;

/** The public marketing website (The Citadel), where published listings and journal posts appear. */
export const websiteUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/** Absolute link to a page on the public website, e.g. websiteLink("/blog/my-post"). */
export const websiteLink = (path: string) => `${websiteUrl}${path.startsWith("/") ? path : `/${path}`}`;
