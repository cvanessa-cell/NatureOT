export const treetotsImages = {
  mockupReference: "/images/treetots/01_full_mockup_reference.png",
  heroFull: "/images/treetots/hero_child_in_nature_full.png",
  heroWide: "/images/treetots/02_hero_child_in_nature_crop.png",
  heroCenter: "/images/treetots/03_hero_child_center_crop.png",
  trustBandChildren: "/images/treetots/04_trust_band_children_circle_crop.png",
  servicesArea: "/images/treetots/05_services_cards_area_crop.png",
  upcomingGroupsArea: "/images/treetots/06_upcoming_groups_area_crop.png",
  whyFamiliesChooseArea: "/images/treetots/07_why_families_choose_area_crop.png",
  providerSection: "/images/treetots/08_provider_section_crop.png",
  concernRow: "/images/treetots/09_concern_icons_row_crop.png",
  valuePillarsRow: "/images/treetots/10_value_pillars_row_crop.png",
} as const;

export const treetotsImageAlt = {
  heroFull:
    "Child exploring plants outdoors during nature-based occupational therapy",
  heroWide:
    "Child exploring plants outdoors during nature-based occupational therapy",
  heroCenter: "Child crouching in a natural outdoor setting",
  trustBandChildren:
    "Children standing together outdoors in a nature-based therapy setting",
  servicesArea:
    "Nature-based occupational therapy service cards with children outdoors",
  upcomingGroupsArea:
    "Upcoming pediatric nature-based occupational therapy groups",
  whyFamiliesChooseArea:
    "Reasons families choose nature-based pediatric occupational therapy",
  providerSection:
    "Children walking together outdoors for nature-based therapy",
  concernRow:
    "Child-centered concerns supported by pediatric nature-based occupational therapy",
  valuePillarsRow:
    "Core values of occupational therapy outdoors, family support, and community focus",
} as const;

export type TreetotsImageKey = keyof typeof treetotsImages;
