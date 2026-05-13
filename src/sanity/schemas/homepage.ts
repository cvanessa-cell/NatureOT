import { defineType, defineField, defineArrayMember } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "trustBand", title: "Trust Band" },
    { name: "concerns", title: "Concerns" },
    { name: "valuePillars", title: "Value Pillars" },
    { name: "explainer", title: "OT Explainer" },
    { name: "whyNature", title: "Why Nature" },
    { name: "conversionCta", title: "Conversion CTA" },
    { name: "localSeo", title: "Local SEO" },
  ],
  fields: [
    // --- Hero ---
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      group: "hero",
      initialValue: "Helping Kids Grow, Connect & Thrive",
    }),
    defineField({
      name: "heroHighlight",
      title: "Hero Highlight Text (italic)",
      type: "string",
      group: "hero",
      initialValue: "Through Nature",
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body Text",
      type: "text",
      rows: 3,
      group: "hero",
      initialValue:
        "Nature-based occupational therapy groups and services that help children build the skills they need for confidence, connection, and everyday life.",
    }),
    defineField({
      name: "heroBenefits",
      title: "Hero Benefit Icons",
      type: "array",
      group: "hero",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "iconName", title: "Icon Name", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "iconName" },
          },
        }),
      ],
    }),
    defineField({
      name: "heroTrustText",
      title: "Hero Trust Line",
      type: "string",
      group: "hero",
      initialValue: "Trusted by families and providers across DFW",
    }),
    defineField({
      name: "heroTrustCardItems",
      title: "Trust Card Items",
      type: "array",
      group: "hero",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "heroTrustSubtext",
      title: "Trust Card Subtext",
      type: "string",
      group: "hero",
      initialValue: "Real therapy. Real nature. Real impact.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      group: "hero",
      options: { hotspot: true },
    }),

    // --- Trust Band ---
    defineField({
      name: "trustHeadline",
      title: "Trust Band Headline",
      type: "string",
      group: "trustBand",
      initialValue: "Therapy That Meets Kids Where They Are",
    }),
    defineField({
      name: "trustBody",
      title: "Trust Band Body",
      type: "text",
      rows: 3,
      group: "trustBand",
      initialValue:
        "We use the healing power of nature and the proven science of occupational therapy to help children build the skills they need for a life of independence and joy.",
    }),
    defineField({
      name: "trustStats",
      title: "Trust Stats",
      type: "array",
      group: "trustBand",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "iconName", title: "Icon Name", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
    }),

    // --- Concerns ---
    defineField({
      name: "concernsHeadline",
      title: "Concerns Headline",
      type: "string",
      group: "concerns",
      initialValue: "Is Your Child Struggling With\u2026",
    }),
    defineField({
      name: "concernItems",
      title: "Concern Items",
      type: "array",
      group: "concerns",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "iconName", title: "Icon Name", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
    }),
    defineField({
      name: "concernsSupportText",
      title: "Concerns Support Text",
      type: "string",
      group: "concerns",
      initialValue: "You're not alone. We're here to help.",
    }),

    // --- Value Pillars ---
    defineField({
      name: "valuePillars",
      title: "Value Pillars",
      type: "array",
      group: "valuePillars",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "iconName", title: "Icon Name", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
    }),

    // --- OT Explainer ---
    defineField({
      name: "explainerHeadline",
      title: "Explainer Headline",
      type: "string",
      group: "explainer",
      initialValue: "What Is Nature-Based Occupational Therapy?",
    }),
    defineField({
      name: "explainerSubtitle",
      title: "Explainer Subtitle",
      type: "string",
      group: "explainer",
      initialValue: "Real therapy. Real nature. Real-life growth.",
    }),
    defineField({
      name: "explainerBody",
      title: "Explainer Body",
      type: "text",
      rows: 4,
      group: "explainer",
    }),
    defineField({
      name: "explainerBullets",
      title: "Explainer Bullets",
      type: "array",
      group: "explainer",
      of: [{ type: "string" }],
    }),

    // --- Why Nature ---
    defineField({
      name: "whyNatureHeadline",
      title: "Why Nature Headline",
      type: "string",
      group: "whyNature",
      initialValue: "Why Nature?",
    }),
    defineField({
      name: "whyNatureBody",
      title: "Why Nature Body",
      type: "text",
      rows: 3,
      group: "whyNature",
    }),
    defineField({
      name: "whyNatureItems",
      title: "Why Nature Items",
      type: "array",
      group: "whyNature",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "iconName", title: "Icon Name", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
    }),

    // --- Conversion CTA ---
    defineField({
      name: "ctaHeadline",
      title: "CTA Headline",
      type: "string",
      group: "conversionCta",
      initialValue: "Ready to See If We're a Good Fit?",
    }),
    defineField({
      name: "ctaBody",
      title: "CTA Body",
      type: "text",
      rows: 2,
      group: "conversionCta",
    }),

    // --- Local SEO ---
    defineField({
      name: "localSeoHeadline",
      title: "Local SEO Headline",
      type: "string",
      group: "localSeo",
      initialValue:
        "Nature-Based OT for Families Across Dallas–Fort Worth",
    }),
    defineField({
      name: "localSeoBody",
      title: "Local SEO Body",
      type: "text",
      rows: 3,
      group: "localSeo",
    }),
    defineField({
      name: "serviceAreas",
      title: "Service Areas",
      type: "array",
      group: "localSeo",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
