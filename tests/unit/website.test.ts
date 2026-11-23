import { describe, expect, it } from "vitest";
import { draftFrom, toInput } from "@/features/website/components/ListingForm";
import { whatsappLink } from "@/features/website/format";

describe("listing form → API payload", () => {
  const filled = { ...draftFrom(), name: "Palm Crest", property_type: "Villas", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos", price: "250,000,000" };

  it("sends only the essentials when creating", () => {
    expect(toInput(filled, false)).toEqual({ name: "Palm Crest", property_type: "Villas", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos",
      price_from_kobo: 25_000_000_000, bedrooms_min: 1, bedrooms_max: 1 });
  });

  it("splits paragraphs on blank lines and features on new lines", () => {
    const result = toInput({ ...filled, description: "First para.\n\n\nSecond para.\n", features: "Garden\n\n  Pool \n" }, true);
    expect(result).toMatchObject({ description: ["First para.", "Second para."], features: ["Garden", "Pool"], status: "selling" });
  });

  it("explains what's wrong in plain words", () => {
    expect(toInput({ ...filled, price: "abc" }, false)).toMatch(/starting price/);
    expect(toInput({ ...filled, bedrooms_min: 4, bedrooms_max: 2 }, false)).toMatch(/fewer bedrooms/);
    expect(toInput({ ...filled, city: "" }, false)).toMatch(/location/);
  });
});

describe("whatsappLink", () => {
  it("turns a local Nigerian number into international format", () => {
    expect(whatsappLink("0803 123 4567")).toBe("https://wa.me/2348031234567");
    expect(whatsappLink("+234 (803) 123-4567")).toBe("https://wa.me/2348031234567");
  });
});
