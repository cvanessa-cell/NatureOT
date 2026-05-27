/** Curated Texas metros for local SEO templates — swap copy via CMS later. */

export const TEXAS_SEO_CITIES = [
  {
    slug: "austin",
    displayName: "Austin",
    nearby: ["Round Rock", "Cedar Park", "Bee Cave", "Dripping Springs"],
    keyword: "nature OT groups Austin",
  },
  {
    slug: "dallas",
    displayName: "Dallas",
    nearby: ["Highland Park", "Richardson", "Garland", "Irving"],
    keyword: "outdoor pediatric OT Dallas",
  },
  {
    slug: "fort-worth",
    displayName: "Fort Worth",
    nearby: ["Arlington", "Keller", "Southlake", "Mansfield"],
    keyword: "nature occupational therapy Fort Worth",
  },
  {
    slug: "houston",
    displayName: "Houston",
    nearby: ["Sugar Land", "Pearland", "The Woodlands", "Katy"],
    keyword: "sensory regulation groups Houston",
  },
  {
    slug: "san-antonio",
    displayName: "San Antonio",
    nearby: ["Alamo Heights", "Stone Oak", "Boerne", "New Braunfels"],
    keyword: "outdoor OT groups San Antonio",
  },
  {
    slug: "mckinney",
    displayName: "McKinney",
    nearby: ["Frisco", "Allen", "Prosper", "Plano"],
    keyword: "nature OT McKinney",
  },
  {
    slug: "frisco",
    displayName: "Frisco",
    nearby: ["Prosper", "McKinney", "Little Elm", "The Colony"],
    keyword: "pediatric OT groups Frisco",
  },
  {
    slug: "plano",
    displayName: "Plano",
    nearby: ["Frisco", "Allen", "Richardson", "Carrollton"],
    keyword: "outdoor OT groups Plano",
  },
  {
    slug: "round-rock",
    displayName: "Round Rock",
    nearby: ["Austin", "Cedar Park", "Georgetown", "Pflugerville"],
    keyword: "nature OT Round Rock",
  },
  {
    slug: "waco",
    displayName: "Waco",
    nearby: ["Woodway", "Hewitt", "Robinson", "Bellmead"],
    keyword: "outdoor pediatric OT Waco",
  },
] as const;

export type TexasSeoSlug = (typeof TEXAS_SEO_CITIES)[number]["slug"];

export function getTexasCity(slug: string) {
  return TEXAS_SEO_CITIES.find((c) => c.slug === slug);
}
