import { defineType, defineField } from "sanity";

export const groupOffering = defineType({
  name: "groupOffering",
  title: "Group Offering",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Group Name", type: "string" }),
    defineField({ name: "ageRange", title: "Age Range", type: "string" }),
    defineField({ name: "schedule", title: "Schedule", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Now Enrolling", value: "enrolling" },
          { title: "Join Waitlist", value: "waitlist" },
          { title: "Full", value: "full" },
        ],
      },
      initialValue: "waitlist",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    { title: "Sort Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "schedule" },
  },
});
