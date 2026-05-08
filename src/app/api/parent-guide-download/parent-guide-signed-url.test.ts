import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn(async () => {}),
}));

const signMock = vi.hoisted(() =>
  vi.fn(async (): Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }> => ({
    data: { signedUrl: "https://signed.example/out.pdf" },
    error: null,
  }))
);

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: (...args: unknown[]) => signMock(...args),
      })),
    },
  }),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => ({
    PARENT_GUIDE_DELIVERY_MODE: "signed_url",
    PARENT_GUIDE_STORAGE_BUCKET: "guides",
    PARENT_GUIDE_STORAGE_PATH: "outdoor-sensory-activities-texas-kids.pdf",
    PARENT_GUIDE_SIGNED_URL_EXPIRES_SECONDS: "120",
    PARENT_GUIDE_PUBLIC_ASSET_PATH: "/guides/outdoor-sensory-activities-texas-kids.html",
    PARENT_GUIDE_ASSET_URL: undefined,
  })),
  appBaseUrl: () => "http://localhost:3000",
}));

describe("GET /api/parent-guide-download (signed_url)", () => {
  beforeEach(() => {
    signMock.mockImplementation(async () => ({
      data: { signedUrl: "https://signed.example/out.pdf" },
      error: null,
    }));
  });

  it("redirects to a Supabase signed URL when storage signing succeeds", async () => {
    const res = await GET(new Request("http://localhost/api/parent-guide-download"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://signed.example/out.pdf");
    expect(signMock).toHaveBeenCalled();
  });

  it("falls back to the public Growth OS asset when signing fails", async () => {
    signMock.mockImplementationOnce(async () => ({
      data: null,
      error: { message: "not_found" },
    }));
    const res = await GET(new Request("http://localhost/api/parent-guide-download"));
    expect(res.status).toBe(302);
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("outdoor-sensory-activities-texas-kids.html");
  });
});
