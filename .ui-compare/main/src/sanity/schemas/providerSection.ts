import { defineType, defineField } from "sanity";

export const providerSection = defineType({
  name: "providerSection",
  title: "Provider Section",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "For Providers & Schools",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
      initialValue: "Partner with us to support more kids.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 3,
      initialValue:
        "We partner with pediatricians, therapists, schools, ABA clinics, homeschool communities, and other professionals who support children and families.",
    }),
    defineField({
      name: "bullets",
      title: "Bullets",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Provider Section" };
    },
  },
});
