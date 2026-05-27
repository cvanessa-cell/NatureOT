import { describe, expect, it } from "vitest";
import { compareWorktreePaths } from "./git-info.mjs";

describe("git-info compare cleanup paths", () => {
  it("lists both ui-compare parent folders for a branch", () => {
    const repoRoot = "C:/repo/texas-nature-ot-leads";
    const paths = compareWorktreePaths(repoRoot, "automation/polish-ui");
    expect(paths).toEqual([
      "C:/repo/texas-nature-ot-leads/.ui-compare/automation-polish-ui",
      "C:/repo/nature-ot-ui-compare/automation-polish-ui",
    ]);
  });

  it("uses main folder name for main target", () => {
    const paths = compareWorktreePaths("/repo", "main");
    expect(paths[0]).toContain("/.ui-compare/main");
    expect(paths[1]).toContain("/nature-ot-ui-compare/main");
  });
});
