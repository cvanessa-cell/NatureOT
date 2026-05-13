import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "brandName",
      title: "Brand Name",
      type: "string",
      initialValue: "TreeTots DFW",
    }),
    defineField({
      name: "announcementText",
      title: "Announcement Bar Text",
      type: "string",
      initialValue:
        "Nature-Based Occupational Therapy Groups in Dallas–Fort Worth",
    }),
    defineField({
      name: "announcementSecondary",
      title: "Announcement Secondary Text",
      type: "string",
      initialValue: "Now Enrolling for Spring Groups & Summer Camps!",
    }),
    defineField({
      name: "footerMission",
      title: "Footer Mission Text",
      type: "text",
      rows: 3,
      initialValue:
        "Helping kids grow, connect, and thrive through nature-based occupational therapy in Dallas–Fort Worth.",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({ name: "website", title: "Website URL", type: "url" }),
        defineField({ name: "other", title: "Other Social URL", type: "url" }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
