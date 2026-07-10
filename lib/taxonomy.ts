// ============================================================================
// Single source of truth for Realm's category taxonomy and IP text.
// Per the Category Structure Handoff, enum values and disclaimer wording live
// here (not hardcoded across the UI) so they can be adjusted after legal review.
// Bracketed [ ... ] text marks wording a real IP lawyer still needs to confirm.
// ============================================================================
import type { ContentType, ListingCategory } from "@/types/db";

// System A — content-type navigation (generic media, NO brand names)
export const CONTENT_TYPES: { value: ContentType; label: string; blurb: string }[] = [
  { value: "tabletop_games", label: "Tabletop Games", blurb: "Miniatures for tabletop and board games." },
  { value: "movies", label: "Movies", blurb: "Figures and busts inspired by film characters." },
  { value: "games", label: "Games", blurb: "Figures inspired by video game characters." },
  { value: "anime", label: "Anime", blurb: "Figures inspired by anime and manga characters." },
  { value: "original_designs", label: "Original Designs", blurb: "The creator's own characters or concepts." },
];

export const contentTypeLabel = (v: ContentType) =>
  CONTENT_TYPES.find((c) => c.value === v)?.label ?? v;

// System B — legal listing classification (badge + listing fields)
export const LISTING_CATEGORIES: {
  value: ListingCategory; label: string; definition: string;
}[] = [
  { value: "original", label: "Original Design",
    definition: "Your own character or concept, not based on existing IP." },
  { value: "licensed_painting", label: "Licensed Miniature Painting",
    definition: "A painting or finishing service on an officially purchasable, painting-ready kit. State the official product line." },
  { value: "fan_inspired", label: "Fan-Inspired Design",
    definition: "A sculpt based on a copyrighted character with no official painting-ready kit. Allowed, but you are responsible for any rights issues." },
];

export const listingCategoryLabel = (v: ListingCategory) =>
  LISTING_CATEGORIES.find((c) => c.value === v)?.label ?? v;

// Badge tone per legal classification
export const listingCategoryTone = (v: ListingCategory): "green" | "blue" | "red" =>
  v === "original" ? "green" : v === "licensed_painting" ? "blue" : "red";

// Auto-shown disclaimer for Fan-Inspired listings.
// [Confirm final legal wording before launch.]
export const FAN_INSPIRED_DISCLAIMER =
  "This is an unofficial, fan-made piece created by an independent artist. It is not affiliated with, endorsed by, or licensed by any rights holder. It may be removed if a rights holder objects.";

// Required attestation text the creator must accept for Fan-Inspired listings.
// [Confirm final legal wording.]
export const RIGHTS_ATTESTATION_TEXT =
  "I understand this design is based on a copyrighted character without a license, I am responsible for any rights issues, and Realm may remove this listing if the rights holder objects.";

// Designated IP / content complaint contact shown on the site.
// [Legal is registering a formal Designated Agent with the US Copyright Office
//  separately; replace with the real address before launch.]
export const IP_CONTACT_EMAIL = "[ip-contact@realm.example]";
