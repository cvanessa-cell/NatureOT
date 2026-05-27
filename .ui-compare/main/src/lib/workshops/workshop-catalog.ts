/** Slugs from `WorkshopRegistrationForm` — synced with operational titles. */

export const WORKSHOP_SLUG_TITLE: Record<string, string> = {
  "sensory-seekers": "Helping Sensory-Seeking Kids Thrive Outdoors",
  "regulation-attention": "Nature Play for Regulation and Attention",
  "motor-confidence": "Outdoor Play for Motor Confidence",
  "big-emotions": "Supporting Big Emotions Through Movement",
  "homeschool-strategies": "Homeschool Nature Play + OT Strategies",
};

export function workshopTitleFromSlug(slug: string): string {
  return WORKSHOP_SLUG_TITLE[slug] ?? slug.replace(/-/g, " ");
}
