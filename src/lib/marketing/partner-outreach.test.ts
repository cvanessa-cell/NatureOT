import { describe, expect, it } from "vitest";
import {
  buildIntroEmailDraft,
  deriveDraftIntroTask,
  deriveOutreachTaskFromOrg,
} from "./partner-outreach";

describe("partner-outreach", () => {
  const org = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Sample Clinic",
    status: "ready_for_outreach",
    next_follow_up_at: null,
  };

  it("creates an initial outreach task for new partners", () => {
    const task = deriveOutreachTaskFromOrg(org);
    expect(task.taskType).toBe("initial_outreach");
    expect(task.channel).toBe("email");
    expect(task.subject).toContain("Sample Clinic");
    expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("creates follow-up tasks after first message", () => {
    const task = deriveOutreachTaskFromOrg({
      ...org,
      status: "first_message_sent",
    });
    expect(task.taskType).toBe("follow_up");
  });

  it("draft intro includes compliant body copy", () => {
    const draft = deriveDraftIntroTask(org);
    expect(draft.taskType).toBe("intro_email_draft");
    expect(draft.body).toContain("TreeTots Nature OT");
    expect(buildIntroEmailDraft(org)).toContain(org.name);
  });
});
