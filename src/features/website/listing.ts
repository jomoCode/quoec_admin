/** Publication status of a property listing shown on The Citadel website. */
export type PropertyStatus = "selling" | "offPlan" | "ready" | "soldOut";

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  selling: "Now selling",
  offPlan: "Off-plan",
  ready: "Ready to move in",
  soldOut: "Sold out",
};
