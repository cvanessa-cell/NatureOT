import { getEnv } from "@/lib/env";

/** OpenAI-compatible chat/completions for SEO drafts — optional dependency. */
export async function chatCompletionJson(params: {
  system: string;
  user: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const env = getEnv();
  const apiKey = env.OPENAI_API_KEY;
  const base =
    env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  if (!apiKey) {
    return { ok: false, error: "OPENAI_API_KEY not configured" };
  }
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: await res.text() };
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return { ok: true, text };
}
