import { describe, expect, it } from "vitest";
import {
  DEFAULT_BRANCH_PORT,
  DEFAULT_MAIN_PORT,
  detectPackageManager,
  isPortAvailable,
  resolvePort,
  routeToSlug,
  sanitizeBranchFolderName,
} from "./compare-ui-branches.mjs";

describe("compare-ui-branches helpers", () => {
  it("sanitizes branch names for folder paths", () => {
    expect(sanitizeBranchFolderName("feature/calendar-links")).toBe("feature-calendar-links");
    expect(sanitizeBranchFolderName("origin/team/design polish")).toBe("team-design-polish");
    expect(sanitizeBranchFolderName("refs/heads/fix/admin/events")).toBe("fix-admin-events");
  });

  it("generates stable route slugs", () => {
    expect(routeToSlug("/")).toBe("home");
    expect(routeToSlug("/admin/events/web-discovery")).toBe("admin-events-web-discovery");
    expect(routeToSlug("/calendar?view=month")).toBe("calendar");
  });

  it("detects the package manager from lockfiles", () => {
    expect(detectPackageManager(["pnpm-lock.yaml", "package-lock.json"])).toBe("pnpm");
    expect(detectPackageManager(["yarn.lock"])).toBe("yarn");
    expect(detectPackageManager(["package-lock.json"])).toBe("npm");
    expect(detectPackageManager(["bun.lockb"])).toBe("bun");
    expect(detectPackageManager([])).toBe("npm");
  });

  it("reports an obviously free high port as available", async () => {
    await expect(isPortAvailable(0)).resolves.toBe(true);
  });

  it("uses 1111 and 1112 as default compare ports", () => {
    expect(DEFAULT_MAIN_PORT).toBe(1111);
    expect(DEFAULT_BRANCH_PORT).toBe(1112);
  });

  it("returns the preferred port when it is open", async () => {
    const port = await resolvePort(0);
    expect(port).toBe(0);
  });
});
