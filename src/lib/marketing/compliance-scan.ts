export type ComplianceRiskLevel = "approved" | "needs_review" | "high_risk" | "do_not_use";

export type ComplianceScanResult = {
  riskLevel: ComplianceRiskLevel;
  flaggedTerms: string[];
  suggestions: string[];
};

const RULES: Array<{
  pattern: RegExp;
  term: string;
  suggestion: string;
  risk: ComplianceRiskLevel;
}> = [
  {
    pattern: /\byour child (has|needs|is|was diagnosed)\b/i,
    term: "diagnosis-targeting (your child has/needs/is)",
    suggestion: "Describe general participation or regulation support without implying a diagnosis.",
    risk: "high_risk",
  },
  {
    pattern: /\b(autism|adhd|asd|sensory processing disorder|dyspraxia|dyslexia)\b/i,
    term: "clinical/diagnosis label",
    suggestion: "Use functional, strengths-based language (regulation, participation, motor confidence).",
    risk: "high_risk",
  },
  {
    pattern: /\b(cure|fix|guarantee|promise|will definitely|100%)\b/i,
    term: "outcome guarantee",
    suggestion: "Avoid guarantees; describe what families may practice, not promised outcomes.",
    risk: "high_risk",
  },
  {
    pattern: /\bbefore (and|&)? after\b/i,
    term: "before/after outcome framing",
    suggestion: "Share process-focused stories without comparative outcome claims.",
    risk: "needs_review",
  },
  {
    pattern: /\b(heal|treat|therapy cures|medical treatment)\b/i,
    term: "medical treatment claim",
    suggestion: "Clarify educational OT-informed groups are not a substitute for individualized medical care.",
    risk: "needs_review",
  },
  {
    pattern: /\b(best|#1|only)\b/i,
    term: "superlative claim",
    suggestion: "Use specific, verifiable descriptors instead of absolute rankings.",
    risk: "needs_review",
  },
];

export function scanMarketingCopy(text: string): ComplianceScanResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      riskLevel: "needs_review",
      flaggedTerms: ["empty_content"],
      suggestions: ["Add copy before running compliance scan."],
    };
  }

  const flaggedTerms: string[] = [];
  const suggestions: string[] = [];
  let riskLevel: ComplianceRiskLevel = "approved";

  for (const rule of RULES) {
    if (rule.pattern.test(trimmed)) {
      flaggedTerms.push(rule.term);
      suggestions.push(rule.suggestion);
      if (rule.risk === "high_risk" || rule.risk === "do_not_use") {
        riskLevel = "high_risk";
      } else if (riskLevel === "approved") {
        riskLevel = "needs_review";
      }
    }
  }

  if (flaggedTerms.length >= 3 && riskLevel !== "high_risk") {
    riskLevel = "high_risk";
  }

  return { riskLevel, flaggedTerms, suggestions };
}

export function slugifyMarketingCampaign(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return base || `campaign-${Date.now()}`;
}
