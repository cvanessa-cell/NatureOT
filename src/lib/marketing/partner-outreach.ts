export type PartnerOutreachOrg = {
  id: string;
  name: string;
  status: string;
  next_follow_up_at: string | null;
};

export type OutreachTaskDraft = {
  taskType: string;
  channel: string;
  subject: string;
  body: string | null;
  dueDate: string;
};

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dueDateForOrg(org: PartnerOutreachOrg): string {
  if (org.next_follow_up_at) {
    const followUp = new Date(org.next_follow_up_at);
    if (!Number.isNaN(followUp.getTime()) && followUp >= new Date()) {
      return followUp.toISOString().slice(0, 10);
    }
  }
  return addDaysIso(7);
}

export function buildIntroEmailDraft(org: Pick<PartnerOutreachOrg, "name">): string {
  return `Hi team at ${org.name},

I'm reaching out from TreeTots Nature OT in the DFW area. We offer small, outdoor occupational therapy-informed groups for children and families exploring nature-based support.

We would love to share a brief referral overview and learn whether collaboration might be helpful for families you serve. Would a short call or email exchange work in the next week or two?

Thank you for the work you do in our community.

[Your name]
TreeTots Nature OT`;
}

export function deriveOutreachTaskFromOrg(org: PartnerOutreachOrg): OutreachTaskDraft {
  const dueDate = dueDateForOrg(org);
  const status = org.status;

  if (status === "first_message_sent" || status.includes("follow_up")) {
    return {
      taskType: "follow_up",
      channel: "email",
      subject: `Follow-up — ${org.name}`,
      body: null,
      dueDate,
    };
  }

  if (status === "meeting_requested" || status === "meeting_booked") {
    return {
      taskType: "meeting",
      channel: "email",
      subject: `Meeting follow-up — ${org.name}`,
      body: null,
      dueDate,
    };
  }

  return {
    taskType: "initial_outreach",
    channel: "email",
    subject: `Partner intro — ${org.name}`,
    body: null,
    dueDate,
  };
}

export function deriveDraftIntroTask(org: PartnerOutreachOrg): OutreachTaskDraft {
  const base = deriveOutreachTaskFromOrg(org);
  return {
    ...base,
    taskType: "intro_email_draft",
    subject: `Draft intro — ${org.name}`,
    body: buildIntroEmailDraft(org),
  };
}
