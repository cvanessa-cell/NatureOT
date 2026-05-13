import { defineQuery } from "next-sanity";

export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage"][0] {
    heroHeadline,
    heroHighlight,
    heroBody,
    heroBenefits[] { iconName, label },
    heroTrustText,
    heroTrustCardItems,
    heroTrustSubtext,
    heroImage { asset-> { _id, url } },
    trustHeadline,
    trustBody,
    trustStats[] { iconName, value, label },
    concernsHeadline,
    concernItems[] { iconName, label },
    concernsSupportText,
    valuePillars[] { iconName, label },
    explainerHeadline,
    explainerSubtitle,
    explainerBody,
    explainerBullets,
    whyNatureHeadline,
    whyNatureBody,
    whyNatureItems[] { iconName, label },
    ctaHeadline,
    ctaBody,
    localSeoHeadline,
    localSeoBody,
    serviceAreas
  }
`);

export const SERVICES_QUERY = defineQuery(`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    description,
    iconName,
    image { asset-> { _id, url } },
    href
  }
`);

export const GROUPS_QUERY = defineQuery(`
  *[_type == "groupOffering"] | order(order asc) {
    _id,
    name,
    ageRange,
    schedule,
    location,
    status
  }
`);

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) {
    _id,
    quote,
    author,
    location,
    rating
  }
`);

export const FAQ_QUERY = defineQuery(`
  *[_type == "faqItem"] | order(order asc) {
    _id,
    question,
    answer
  }
`);

export const PROVIDER_SECTION_QUERY = defineQuery(`
  *[_type == "providerSection"][0] {
    heading,
    subheading,
    body,
    bullets
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    brandName,
    announcementText,
    announcementSecondary,
    footerMission,
    socialLinks
  }
`);
