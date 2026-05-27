import { draftMode } from "next/headers";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;
const isConfigured = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
  stega: stegaOverride,
  perspective: perspectiveOverride,
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
  stega?: boolean;
  perspective?: "published" | "drafts" | "raw";
}): Promise<{ data: T | null }> {
  if (!isConfigured) {
    return { data: null };
  }

  const isDraftMode = (await draftMode()).isEnabled;

  const perspective =
    perspectiveOverride ?? (isDraftMode ? "drafts" : "published");
  const stega = stegaOverride ?? isDraftMode;
  const useCdn = !isDraftMode;

  try {
    const data = await client
      .withConfig({
        useCdn,
        stega: stega ? { studioUrl: "/studio" } : false,
      })
      .fetch<T>(query, params, {
        token: isDraftMode ? token : undefined,
        perspective,
        next: {
          revalidate: isDraftMode ? 0 : tags.length ? false : revalidate,
          tags: isDraftMode ? [] : tags,
        },
      });

    return { data };
  } catch (err) {
    console.warn("[sanityFetch] Query failed, returning null:", (err as Error).message);
    return { data: null };
  }
}
