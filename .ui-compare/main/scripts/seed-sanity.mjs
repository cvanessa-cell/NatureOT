/**
 * Seed script for Sanity CMS.
 *
 * Usage:
 *   npm run sanity:seed
 * Loads `.env.local` via Node (--env-file). Requires Node 20.6+.
 *
 * Tokens: prefers SANITY_API_WRITE_TOKEN (Editor+). If unset, falls back to
 * SANITY_API_READ_TOKEN only when it has mutate permissions (Editor/Admin)—
 * Viewer tokens cannot seed. Best practice: use a dedicated write token.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN?.trim() ||
  process.env.SANITY_API_READ_TOKEN?.trim();

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID and a mutate-capable token (SANITY_API_WRITE_TOKEN or SANITY_API_READ_TOKEN with Editor)."
  );
  process.exit(1);
}

const API = `https://${projectId}.api.sanity.io/v2026-02-01/data/mutate/${dataset}`;

async function mutate(mutations) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function deleteIfExists(id) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mutations: [{ delete: { id } }],
    }),
  });
  const json = await res.json();
  if (res.ok) {
    console.log(`✓ removed legacy: ${id}`);
    return;
  }
  const raw = JSON.stringify(json);
  if (/does not exist|not found/i.test(raw)) return;
  throw new Error(raw);
}

async function createOrReplace(doc) {
  await mutate([{ createOrReplace: doc }]);
  console.log(`✓ ${doc._type}: ${doc._id}`);
}

async function main() {
  // Site Settings
  await createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    brandName: "TreeTots Nature OT",
    announcementText:
      "Nature-Based Occupational Therapy Groups in Dallas–Fort Worth",
    announcementSecondary:
      "Now Enrolling for Spring Groups & Summer Camps!",
    footerMission:
      "Helping kids grow, connect, and thrive through nature-based occupational therapy in Dallas–Fort Worth.",
  });

  // Homepage
  await createOrReplace({
    _id: "homepage",
    _type: "homepage",
    heroHeadline: "Helping Kids Grow, Connect & Thrive",
    heroHighlight: "Through Nature",
    heroBody:
      "Nature-based occupational therapy groups and services that help children build the skills they need for confidence, connection, and everyday life.",
    heroBenefits: [
      { _key: "b1", iconName: "ShieldCheck", label: "Build Confidence" },
      { _key: "b2", iconName: "Brain", label: "Improve Regulation" },
      { _key: "b3", iconName: "Activity", label: "Strengthen Skills" },
      { _key: "b4", iconName: "Users", label: "Create Connection" },
    ],
    heroTrustText: "Trusted by families and providers across DFW",
    heroTrustCardItems: ["Evidence-Based", "Play-Based", "Child-Led", "Nature-Focused"],
    heroTrustSubtext: "Real therapy.\nReal nature.\nReal impact.",
    trustHeadline: "Therapy That Meets Kids Where They Are",
    trustBody:
      "We use the healing power of nature and the proven science of occupational therapy to help children build the skills they need for a life of independence and joy.",
    trustStats: [
      { _key: "s1", iconName: "Calendar", value: "12+", label: "Years of Experience" },
      { _key: "s2", iconName: "Heart", value: "100+", label: "Families Served" },
      { _key: "s3", iconName: "Users", value: "Small", label: "Groups for Big Impact" },
      { _key: "s4", iconName: "MapPin", value: "DFW", label: "Local & Community Focused" },
    ],
    concernsHeadline: "Is Your Child Struggling With\u2026",
    concernItems: [
      { _key: "c1", iconName: "Wind", label: "Sensory Overwhelm" },
      { _key: "c2", iconName: "Footprints", label: "Poor Coordination or Clumsiness" },
      { _key: "c3", iconName: "Sparkles", label: "Big Emotions & Meltdowns" },
      { _key: "c4", iconName: "Users", label: "Social Skills & Friendships" },
      { _key: "c5", iconName: "ShieldCheck", label: "Low Confidence or Risk-Avoidance" },
      { _key: "c6", iconName: "Puzzle", label: "Difficulty with Transitions" },
    ],
    concernsSupportText: "You're not alone. We're here to help.",
    valuePillars: [
      { _key: "v1", iconName: "HandHeart", label: "OT-Led & Family-Centered" },
      { _key: "v2", iconName: "TreePine", label: "Outdoors in Nature" },
      { _key: "v3", iconName: "ShieldCheck", label: "Evidence-Based & Play-Based" },
      { _key: "v4", iconName: "Users", label: "Small Group Support" },
      { _key: "v5", iconName: "MapPin", label: "DFW Local & Community Focused" },
    ],
    explainerHeadline: "What Is Nature-Based Occupational Therapy?",
    explainerSubtitle: "Real therapy. Real nature. Real-life growth.",
    explainerBody:
      "Nature-based occupational therapy is therapist-led, goal-directed, play-based OT delivered in outdoor and natural environments. It uses movement, sensory-rich experiences, social play, problem-solving, and meaningful real-world activities to support a child\u2019s development.",
    explainerBullets: [
      "Supports sensory regulation",
      "Builds motor planning and coordination",
      "Encourages confidence and resilience",
      "Creates opportunities for social participation",
      "Helps children practice real-life functional skills",
      "Gives parents strategies for carryover at home and in the community",
    ],
    whyNatureHeadline: "Why Nature?",
    whyNatureBody:
      "Outdoor environments can provide rich opportunities for movement, sensory exploration, problem-solving, confidence-building, and social connection.",
    whyNatureItems: [
      { _key: "w1", iconName: "Brain", label: "Improve Sensory Processing" },
      { _key: "w2", iconName: "Eye", label: "Increase Focus & Attention" },
      { _key: "w3", iconName: "Heart", label: "Build Emotional Regulation" },
      { _key: "w4", iconName: "Mountain", label: "Boost Confidence & Resilience" },
      { _key: "w5", iconName: "Activity", label: "Enhance Motor Skills" },
      { _key: "w6", iconName: "Users", label: "Support Social Connection" },
    ],
    ctaHeadline: "Ready to See If We're a Good Fit?",
    ctaBody:
      "Join the waitlist or book a parent call. We'll answer your questions and help you find the right next step for your child.",
    localSeoHeadline: "Nature-Based OT for Families Across Dallas–Fort Worth",
    localSeoBody:
      "We serve families across Dallas–Fort Worth and surrounding communities, including Dallas, Plano, Frisco, McKinney, Allen, Richardson, Garland, Southlake, and Collin County.",
    serviceAreas: [
      "Dallas", "Plano", "Frisco", "McKinney", "Allen",
      "Richardson", "Garland", "Southlake", "Collin County",
    ],
  });

  // Remove previous 4-service seed ids so the homepage only sees the two slots
  for (const id of ["svc-groups", "svc-individual", "svc-camps", "svc-workshops"]) {
    await deleteIfExists(id);
  }

  // Services (two slots — add titles, copy, optional Link URL in /studio when ready)
  const services = [
    {
      id: "svc-slot-1",
      slug: "service-1",
      title: "Service title",
      description:
        "Add a short description of this offering when you\u2019re ready.",
      iconName: "Leaf",
      href: "",
      order: 0,
    },
    {
      id: "svc-slot-2",
      slug: "service-2",
      title: "Service title",
      description:
        "Add a short description of this offering when you\u2019re ready.",
      iconName: "CircleUserRound",
      href: "",
      order: 1,
    },
  ];
  for (const s of services) {
    const doc = {
      _id: s.id,
      _type: "service",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      description: s.description,
      iconName: s.iconName,
      order: s.order,
    };
    const href = s.href?.trim();
    if (href) doc.href = href;
    await createOrReplace(doc);
  }

  // Groups
  const groups = [
    { id: "grp-spring", name: "Spring OT Group (Ages 5–7)", ageRange: "Ages 5–7", schedule: "Tuesdays | April 28 – June 11", location: "White Rock Lake, Dallas", status: "waitlist", order: 0 },
    { id: "grp-social", name: "Social Skills & Confidence (Ages 8–10)", ageRange: "Ages 8–10", schedule: "Thursdays | May 2 – June 13", location: "Frisco Commons Park", status: "waitlist", order: 1 },
    { id: "grp-homeschool", name: "Homeschool Nature OT (Ages 6–9)", ageRange: "Ages 6–9", schedule: "Wednesdays | May 1 – June 12", location: "Arbor Hills Nature Preserve, Plano", status: "enrolling", order: 2 },
  ];
  for (const g of groups) {
    await createOrReplace({
      _id: g.id,
      _type: "groupOffering",
      name: g.name,
      ageRange: g.ageRange,
      schedule: g.schedule,
      location: g.location,
      status: g.status,
      order: g.order,
    });
  }

  // Testimonials
  const testimonials = [
    { id: "test-1", quote: "My child is more confident, better regulated, and actually asks to go outside now.", author: "A.P.", location: "Plano, TX", rating: 5, order: 0 },
    { id: "test-2", quote: "The group was the highlight of our week. My daughter has grown so much socially and emotionally.", author: "M.K.", location: "Frisco, TX", rating: 5, order: 1 },
    { id: "test-3", quote: "A perfect blend of play and therapy. We saw progress we hadn\u2019t seen before.", author: "J.T.", location: "McKinney, TX", rating: 5, order: 2 },
  ];
  for (const t of testimonials) {
    await createOrReplace({
      _id: t.id,
      _type: "testimonial",
      quote: t.quote,
      author: t.author,
      location: t.location,
      rating: t.rating,
      order: t.order,
    });
  }

  // FAQ
  const faqs = [
    { id: "faq-1", question: "What is nature-based occupational therapy?", answer: "Nature-based occupational therapy is therapist-led, goal-directed, play-based OT delivered in outdoor and natural environments. It uses movement, sensory-rich experiences, social play, and meaningful real-world activities to support a child's development.", order: 0 },
    { id: "faq-2", question: "Is this the same as outdoor play?", answer: "No. While outdoor play is wonderful, nature-based OT is led by a licensed occupational therapist with specific therapeutic goals, structured activities, and ongoing assessment. It's real therapy in a natural setting.", order: 1 },
    { id: "faq-3", question: "Who is a good fit for nature-based OT groups?", answer: "Children ages 4–12 who may benefit from support with sensory regulation, motor coordination, social participation, emotional regulation, or building confidence in outdoor settings. We help families determine fit during a parent call.", order: 2 },
    { id: "faq-4", question: "What skills can nature-based OT support?", answer: "Nature-based OT can support sensory processing, motor planning and coordination, emotional regulation, social skills, confidence, problem-solving, and functional independence in everyday activities.", order: 3 },
    { id: "faq-5", question: "Do you offer individual sessions?", answer: "Yes. We offer personalized individual OT sessions designed around your child's unique goals, strengths, and sensory needs. Contact us to learn more about availability.", order: 4 },
    { id: "faq-6", question: "How do groups work?", answer: "Groups are small (typically 4–6 children), led by a licensed OT, and meet weekly at local outdoor locations across DFW. Each session includes structured therapeutic activities with clear goals while keeping it fun and engaging.", order: 5 },
    { id: "faq-7", question: "What happens if the weather is bad?", answer: "We monitor weather closely and have backup plans for inclement conditions. In some cases sessions may be rescheduled. Safety is always our top priority.", order: 6 },
    { id: "faq-8", question: "Do you work with schools or providers?", answer: "Absolutely. We partner with pediatricians, therapists, schools, ABA clinics, homeschool communities, and other professionals who support children and families. We make referrals easy.", order: 7 },
    { id: "faq-9", question: "How do I join the waitlist?", answer: "Click the 'Join the Waitlist' button anywhere on this page, fill out a brief form, and we'll be in touch with next steps and availability for upcoming groups.", order: 8 },
  ];
  for (const f of faqs) {
    await createOrReplace({
      _id: f.id,
      _type: "faqItem",
      question: f.question,
      answer: f.answer,
      order: f.order,
    });
  }

  // Provider Section
  await createOrReplace({
    _id: "providerSection",
    _type: "providerSection",
    heading: "For Providers & Schools",
    subheading: "Partner with us to support more kids.",
    body: "We partner with pediatricians, therapists, schools, ABA clinics, homeschool communities, and other professionals who support children and families.",
    bullets: [
      "Easy referrals",
      "School and clinic partnerships",
      "Staff development",
      "Parent education",
      "Community events",
    ],
  });

  console.log("\n✅ Seed complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
