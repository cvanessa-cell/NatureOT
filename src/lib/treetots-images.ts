export const treetotsImages = {
  mockupReference: "/images/treetots/01_full_mockup_reference.png",
  heroFull: "/images/treetots/hero_child_in_nature_full.png",
  heroWide: "/images/treetots/02_hero_child_in_nature_crop.png",
  heroCenter: "/images/treetots/03_hero_child_center_crop.png",
  trustBandChildren: "/images/treetots/04_trust_band_children_circle_crop.png",
  servicesCardLeft: "/images/treetots/11_services_ot_swing.png",
  naturePlayChildOnLog: "/images/treetots/12_nature_play_child_on_log.png",
  otGroupHammockPlay: "/images/treetots/13_ot_group_hammock_play.png",
  reflexCoaching: "/images/treetots/03_hero_child_center_crop.png",
  groupTrailHero: "/images/treetots/08_provider_section_crop.png",
  workshopFamilies: "/images/treetots/04_trust_band_children_circle_crop.png",
  homeschoolNature: "/images/treetots/12_nature_play_child_on_log.png",
  parentGuideOutdoor: "/images/treetots/02_hero_child_in_nature_crop.png",
  treetotsLogoSource: "/images/treetots/hero_child_in_nature_full.png",
  servicesArea: "/images/treetots/05_services_cards_area_crop.png",
  upcomingGroupsArea: "/images/treetots/06_upcoming_groups_area_crop.png",
  whyFamiliesChooseArea: "/images/treetots/07_why_families_choose_area_crop.png",
  providerSection: "/images/treetots/08_provider_section_crop.png",
  concernRow: "/images/treetots/09_concern_icons_row_crop.png",
  valuePillarsRow: "/images/treetots/10_value_pillars_row_crop.png",
} as const;

export type TreetotsImageKey = keyof typeof treetotsImages;

export const treetotsImageAlt: Record<TreetotsImageKey, string> = {
  mockupReference: "TreeTots nature-based pediatric occupational therapy website",
  heroFull:
    "Child exploring plants outdoors during nature-based occupational therapy",
  heroWide:
    "Child exploring plants outdoors during nature-based occupational therapy",
  heroCenter: "Child crouching in a natural outdoor setting",
  trustBandChildren:
    "Children standing together outdoors in a nature-based therapy setting",
  servicesCardLeft:
    "Child smiling while playing upside down on a rope swing during outdoor occupational therapy",
  naturePlayChildOnLog:
    "Child balancing on a fallen log while exploring outdoors during a nature play group",
  otGroupHammockPlay:
    "Children playing together on an outdoor rope hammock during a nature-based OT group",
  reflexCoaching:
    "Child outdoors in a calm nature setting for parent-supported occupational therapy carryover",
  groupTrailHero:
    "Children walking together outdoors for a nature-based therapy group",
  workshopFamilies:
    "Children and families gathered outdoors for nature-based occupational therapy education",
  homeschoolNature:
    "Child balancing on a log during a weekday outdoor learning and movement group",
  parentGuideOutdoor:
    "Child exploring plants outdoors as part of a parent guide to sensory-rich nature play",
  treetotsLogoSource:
    "TreeTots DFW nature-based pediatric occupational therapy brand source image",
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
};
