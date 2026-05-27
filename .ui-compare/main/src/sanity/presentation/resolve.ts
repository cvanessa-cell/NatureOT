import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    homepage: defineLocations({
      select: {},
      resolve: () => ({
        locations: [{ title: "Homepage", href: "/" }],
      }),
    }),
    siteSettings: defineLocations({
      select: {},
      resolve: () => ({
        locations: [{ title: "Homepage", href: "/" }],
      }),
    }),
    service: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Service", href: "/" },
        ],
      }),
    }),
    groupOffering: defineLocations({
      select: { title: "name" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Group", href: "/" },
          { title: "All Groups", href: "/groups" },
        ],
      }),
    }),
    testimonial: defineLocations({
      select: { title: "author" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Testimonial", href: "/" },
        ],
      }),
    }),
    faqItem: defineLocations({
      select: { title: "question" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "FAQ", href: "/" },
        ],
      }),
    }),
    providerSection: defineLocations({
      select: {},
      resolve: () => ({
        locations: [{ title: "Homepage", href: "/" }],
      }),
    }),
  },
};
