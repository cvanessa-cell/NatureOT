import { appBaseUrl } from "@/lib/env";
import { CATEGORY_LABELS } from "@/lib/quiz-data";
import type { ResultCategory } from "@/types/database";

function safeLabel(cat: ResultCategory): string {
  return CATEGORY_LABELS[cat] ?? String(cat);
}

export function mergeTemplate(
  html: string,
  vars: {
    parent_name: string;
    primary_category: string;
    book_url: string;
    unsubscribe_url: string;
  }
): string {
  return html
    .replaceAll("{{parent_name}}", escapeHtml(vars.parent_name))
    .replaceAll("{{primary_category}}", escapeHtml(vars.primary_category))
    .replaceAll("{{book_url}}", vars.book_url)
    .replaceAll("{{unsubscribe_url}}", vars.unsubscribe_url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resultEmailHtml(
  parentName: string,
  primary: ResultCategory,
  unsubscribePath: string
): string {
  const base = appBaseUrl();
  const book = `${base}/book`;
  const label = safeLabel(primary);
  return `
    <p>Hi ${escapeHtml(parentName)},</p>
    <p>Thank you for completing the parent guide. Your responses suggested <strong>${escapeHtml(
      label
    )}</strong> as a theme to explore. This guide is educational only and is not an occupational therapy evaluation or diagnosis.</p>
    <p>Every child is unique; we do not guarantee specific results from groups or outdoor sessions.</p>
    <p>If you would like to learn whether our Texas nature-based pediatric occupational therapy groups may be a fit, you can <a href="${book}">schedule a short call</a>.</p>
    <p><a href="${book}">Book a call</a> · <a href="${base}/privacy">Privacy</a></p>
    <p style="font-size:12px"><a href="${unsubscribePath}">Unsubscribe from marketing emails</a></p>
  `;
}
