/** Typed sample data for admin UI until Supabase/Airtable are fully wired. */

export const leadSources = [
  "Google Search",
  "Instagram",
  "Facebook Parent Group",
  "Pediatrician Referral",
  "SLP Referral",
  "Homeschool Group",
  "Workshop",
  "Google Business Profile",
  "Local SEO Page",
] as const;

export const sampleLeads = [
  {
    id: "l-1001",
    name: "Jordan M.",
    email: "jordan.m@example.com",
    city: "Austin",
    source: "Local SEO Page",
    status: "new",
    interest: "Sensory regulation",
    booking: "none",
    created: "2026-04-28T14:20:00Z",
  },
  {
    id: "l-1002",
    name: "Riley S.",
    email: "riley.s@example.com",
    city: "Plano",
    source: "Pediatrician Referral",
    status: "contacted",
    interest: "Motor confidence",
    booking: "scheduled",
    created: "2026-04-27T10:05:00Z",
  },
  {
    id: "l-1003",
    name: "Casey T.",
    email: "casey.t@example.com",
    city: "Houston",
    source: "Workshop",
    status: "waitlist",
    interest: "Emotional regulation",
    booking: "none",
    created: "2026-04-26T18:40:00Z",
  },
];

export const sampleWaitlistRows = [
  {
    id: "w-501",
    parent: "Alex P.",
    ageRange: "5–7",
    city: "Round Rock",
    zip: "78664",
    schedule: "Weekday after school",
    interests: ["Sensory regulation", "Outdoor confidence"],
    status: "active",
  },
  {
    id: "w-502",
    parent: "Sam K.",
    ageRange: "3–5",
    city: "McKinney",
    zip: "75070",
    schedule: "Homeschool daytime",
    interests: ["Motor confidence", "Social participation"],
    status: "active",
  },
];

export const sampleGroups = [
  {
    id: "g-01",
    name: "Nature Explorers Ages 3–5",
    ageRange: "3–5",
    focus: "Regulation + exploration",
    city: "Austin",
    dayTime: "Thu 9:30am",
    capacity: 6,
    enrolled: 4,
    status: "open",
  },
  {
    id: "g-02",
    name: "Outdoor Regulation Group Ages 5–7",
    ageRange: "5–7",
    focus: "Motor confidence",
    city: "Frisco",
    dayTime: "Wed 4:15pm",
    capacity: 8,
    enrolled: 8,
    status: "full",
  },
];

export const sampleWorkshops = [
  {
    id: "ws-10",
    title: "Helping Sensory-Seeking Kids Thrive Outdoors",
    date: "2026-06-14",
    registrations: 42,
    attended: 31,
    noShows: 5,
    bookedCalls: 9,
    waitlistAdds: 14,
    enrolled: 3,
  },
];

export const referralPartnerTypes = [
  "Pediatrician",
  "School",
  "Preschool",
  "SLP",
  "PT",
  "Counselor",
  "Homeschool group",
  "Nature school",
  "Parent group",
  "Library",
  "Parks/recreation",
  "Other",
] as const;

export const samplePartners = [
  {
    id: "p-77",
    org: "Hill Country Pediatrics",
    contact: "Dr. Avery Lin",
    type: "Pediatrician",
    city: "Austin",
    followUpDue: "2026-05-10",
    referrals: 6,
    status: "active",
  },
  {
    id: "p-78",
    org: "Cedar Grove Cooperative",
    contact: "Morgan Ellis",
    type: "Homeschool group",
    city: "McKinney",
    followUpDue: "2026-05-02",
    referrals: 2,
    status: "follow_up",
  },
];

export const contentPillars = [
  "Nature play",
  "Sensory regulation",
  "Motor confidence",
  "Emotional regulation",
  "Social participation",
  "School readiness",
  "Workshop promotion",
  "Group enrollment",
  "Referral partner education",
] as const;

export const sampleContentRows = [
  {
    id: "c-1",
    title: "Trail pacing for sensory seekers",
    pillar: "Sensory regulation",
    status: "Needs Review",
    date: "2026-05-08",
  },
  {
    id: "c-2",
    title: "What we mean by “small groups”",
    pillar: "Group enrollment",
    status: "Approved",
    date: "2026-05-12",
  },
];

export const texasCitiesSeo = [
  { slug: "austin", city: "Austin", keyword: "nature OT groups Austin", status: "Published" },
  { slug: "dallas", city: "Dallas", keyword: "outdoor pediatric OT Dallas", status: "Needs Review" },
  {
    slug: "fort-worth",
    city: "Fort Worth",
    keyword: "nature occupational therapy Fort Worth",
    status: "Drafted",
  },
  { slug: "houston", city: "Houston", keyword: "sensory regulation groups Houston", status: "Approved" },
  {
    slug: "san-antonio",
    city: "San Antonio",
    keyword: "outdoor OT groups San Antonio",
    status: "Planned",
  },
];

export const sampleReviewsQueue = [
  {
    id: "r-900",
    quote: "Our child looked forward to every week…",
    parentInitials: "L.P.",
    authStatus: "Pending",
    adminApproval: "Pending",
    published: false,
  },
  {
    id: "r-901",
    quote: "Clear communication and thoughtful pacing outdoors.",
    parentInitials: "T.R.",
    authStatus: "Authorized",
    adminApproval: "Approved",
    published: true,
  },
];

export const zapCatalogue = [
  { key: "waitlist_entry", name: "New waitlist entry", trigger: "Waitlist created", approval: "Not required", external: "Yes", phi: "Low" },
  { key: "group_invite_approved", name: "Group invitation approved", trigger: "Admin approval", approval: "Required", external: "Yes", phi: "Medium" },
  { key: "workshop_registration", name: "Workshop registration", trigger: "Form submit", approval: "Not required", external: "Yes", phi: "Low" },
  { key: "workshop_attended", name: "Workshop attended", trigger: "Check-in", approval: "Not required", external: "Optional", phi: "Low" },
  { key: "referral_followup_due", name: "Referral partner follow-up due", trigger: "Schedule", approval: "Optional", external: "Yes", phi: "Low" },
  { key: "content_approved", name: "Content approved", trigger: "Admin", approval: "Required", external: "Yes", phi: "Low" },
  { key: "local_seo_approved", name: "Local SEO page approved", trigger: "Admin", approval: "Required", external: "Publish", phi: "Low" },
  { key: "positive_feedback", name: "Positive feedback received", trigger: "Survey", approval: "Required", external: "CRM", phi: "Medium" },
  { key: "booking_created", name: "Booking created", trigger: "Scheduler", approval: "Not required", external: "Yes", phi: "Medium" },
  { key: "unsubscribe_received", name: "Unsubscribe received", trigger: "Email provider", approval: "Not required", external: "Yes", phi: "Low" },
  { key: "zapier_error_alert", name: "Zapier error alert", trigger: "Failed run", approval: "Not required", external: "Slack", phi: "Low" },
] as const;

export const recentActivity = [
  { id: "a1", t: "2026-05-04T09:12Z", text: "Waitlist entry from Round Rock (ages 5–7)" },
  { id: "a2", t: "2026-05-04T08:55Z", text: "Workshop registration — Nature Play for Regulation" },
  { id: "a3", t: "2026-05-03T16:40Z", text: "Referral follow-up marked complete — Cedar Grove Cooperative" },
];

export const suggestedAgentCommands = [
  "Summarize waitlist demand by age range and ZIP.",
  "Show referral partners needing follow-up.",
  "Create a follow-up list for partners not contacted in 14 days.",
  "Draft a quarterly referral partner update.",
  "Show workshops with high registration but low booking conversion.",
  "Create content ideas for next month.",
  "Prepare a list of families matching the new ages 5–7 after-school group.",
  "Show local SEO pages waiting for review.",
];
