/** Mirrors backend app/contracts/marketing/development.py. */
export type DevelopmentStatus = "upcoming" | "ongoing" | "completed";

export const DEVELOPMENT_STATUS_LABELS: Record<DevelopmentStatus, string> = { upcoming: "Upcoming", ongoing: "Ongoing", completed: "Completed" };

export type Development = {
  id: string;
  slug: string;
  name: string;
  location: string;
  description: string;
  status: DevelopmentStatus;
  featured: boolean;
  display_order: number;
  is_coming_soon: boolean;
  external_url: string;
  featured_image: string;
  gallery_images: string[];
  featured_video: string | null;
  residence_summary: string | null;
  estate_id: string | null;
  is_published: boolean;
  updated_at: string;
};

export type DevelopmentInput = Partial<Omit<Development, "id" | "display_order" | "updated_at">>;

export type ImageSlot = "featured" | "gallery";
