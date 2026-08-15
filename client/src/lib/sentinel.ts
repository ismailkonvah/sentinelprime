export type Verdict = "approve" | "warning" | "blocked";
export type CheckStatus = "pass" | "warning" | "fail";

export type Policy = {
  amount: number;
  duration: number;
  riskTolerance: "low" | "medium" | "high";
  assetExclusions: string[];
  maxVolatility: number;
  maxBridges: number;
  auditRequired: boolean;
};

export type CheckResult = {
  key: string;
  label: string;
  status: CheckStatus;
  actual: string;
  threshold: string;
  evidence: string;
};

export type OrionAgent = {
  id: string;
  name: string;
  category: string;
  chain: string;
  intelligenceScore: number;
  auditStatus: "verified" | "review" | "unaudited";
  uptime: number;
  tvl: number;
  volatility: number;
  liquidity: number;
  bridges: number;
  concentration: number;
  approvalPermissions: "scoped" | "unlimited";
  apy: number;
  description: string;
  flow: string[];
};

export const defaultPolicy: Policy = {
  amount: 500,
  duration: 30,
  riskTolerance: "low",
  assetExclusions: ["MEME", "UNVETTED"],
  maxVolatility: 10,
  maxBridges: 1,
  auditRequired: true,
};

export const demoIntent = "Find me a low-risk 30-day yield strategy for $500. No unaudited contracts, no more than one bridge, and block anything with more than 10% weekly volatility.";

export const orionAgents: OrionAgent[] = [
  {
    id: "vega-vault",
    name: "Vega Vault",
    category: "Stablecoin yield",
    chain: "Base → Arbitrum",
    intelligenceScore: 92,
    auditStatus: "verified",
    uptime: 99.4,
    tvl: 12.8,
    volatility: 7.2,
    liquidity: 4.6,
    bridges: 1,
    concentration: 28,
    approvalPermissions: "scoped",
    apy: 12.5,
    description: "Cross-chain stablecoin yield optimizer with circuit breakers.",
    flow: ["Lock policy", "Route to audited vault", "Monitor liquidity", "Settle on Base"],
  },
  {
    id: "aura-engine",
    name: "Aura Engine",
    category: "Market neutral",
    chain: "Base → Ethereum",
    intelligenceScore: 88,
    auditStatus: "review",
    uptime: 98.8,
    tvl: 8.4,
    volatility: 11.8,
    liquidity: 2.1,
    bridges: 1,
    concentration: 41,
    approvalPermissions: "scoped",
    apy: 18.1,
    description: "Adaptive delta-neutral execution agent for volatile markets.",
    flow: ["Lock policy", "Hedge exposure", "Rebalance", "Return principal"],
  },
  {
    id: "helix-yield",
    name: "Helix Yield",
    category: "Liquidity routing",
    chain: "Base → Optimism → Polygon",
    intelligenceScore: 76,
    auditStatus: "unaudited",
    uptime: 97.1,
    tvl: 3.2,
    volatility: 8.4,
    liquidity: 0.7,
    bridges: 2,
    concentration: 63,
    approvalPermissions: "unlimited",
    apy: 22.6,
    description: "Multi-chain liquidity router seeking higher headline yield.",
    flow: ["Bridge to Optimism", "Split liquidity", "Bridge to Polygon", "Harvest"],
  },
];

export function parseIntent(text: string): Policy {
  const normalized = text.toLowerCase();
  const amountMatch = normalized.match(/\$\s?([\d,]+)/);
  const durationMatch = normalized.match(/(\d+)\s*(?:day|days|week|weeks|month|months)/);
  const volatilityMatch = normalized.match(/(?:more than|max(?:imum)?|less than|under)\s*(\d+(?:\.\d+)?)\s*%/);
  const bridgeMatch = normalized.match(/(?:no more than|maximum|max)\s*(\d+)\s*bridge/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : defaultPolicy.amount;
  const rawDuration = durationMatch ? Number(durationMatch[1]) : defaultPolicy.duration;
  const duration = /week/.test(durationMatch?.[0] ?? "") ? rawDuration * 7 : /month/.test(durationMatch?.[0] ?? "") ? rawDuration * 30 : rawDuration;
  const maxVolatility = volatilityMatch ? Number(volatilityMatch[1]) : defaultPolicy.maxVolatility;
  const maxBridges = bridgeMatch ? Number(bridgeMatch[1]) : defaultPolicy.maxBridges;
  const riskTolerance = normalized.includes("high risk") ? "high" : normalized.includes("medium risk") || normalized.includes("moderate") ? "medium" : "low";
  return {
    amount,
    duration,
    riskTolerance,
    assetExclusions: normalized.includes("meme") ? ["MEME", "UNVETTED"] : defaultPolicy.assetExclusions,
    maxVolatility,
    maxBridges,
    auditRequired: !normalized.includes("unaudited is okay") && (normalized.includes("audit") || normalized.includes("low risk") || defaultPolicy.auditRequired),
  };
}

function result(key: string, label: string, status: CheckStatus, actual: string, threshold: string, evidence: string): CheckResult {
  return { key, label, status, actual, threshold, evidence };
}

export function evaluateAgent(agent: OrionAgent, policy: Policy): { verdict: Verdict; checks: CheckResult[]; score: number } {
  const checks: CheckResult[] = [
    result("audit", "Contract audit status", policy.auditRequired ? (agent.auditStatus === "verified" ? "pass" : agent.auditStatus === "review" ? "warning" : "fail") : "pass", agent.auditStatus === "verified" ? "Verified" : agent.auditStatus === "review" ? "In review" : "Unaudited", policy.auditRequired ? "Verified preferred" : "Not required", policy.auditRequired && agent.auditStatus === "unaudited" ? `${agent.name} does not meet the required audit threshold.` : agent.auditStatus === "review" ? "The audit is in review; proceed only with an explicit warning." : "Independent audit and logic simulation are on file."),
    result("liquidity", "Liquidity depth", agent.liquidity >= 1 ? "pass" : agent.liquidity >= 0.75 ? "warning" : "fail", `$${agent.liquidity.toFixed(1)}M`, "$1.0M minimum", agent.liquidity < 1 ? "Liquidity is below the $1.0M preflight minimum for this simulated amount." : "Liquidity supports the requested amount with a reasonable buffer."),
    result("volatility", "Weekly volatility", agent.volatility <= policy.maxVolatility ? "pass" : agent.volatility <= policy.maxVolatility + 3 ? "warning" : "fail", `${agent.volatility.toFixed(1)}%`, `≤ ${policy.maxVolatility}%`, agent.volatility > policy.maxVolatility ? `Weekly volatility exceeds the user guardrail by ${(agent.volatility - policy.maxVolatility).toFixed(1)} points.` : "Observed volatility is inside the user-defined range."),
    result("bridges", "Bridge exposure", agent.bridges <= policy.maxBridges ? "pass" : "fail", `${agent.bridges} bridge${agent.bridges === 1 ? "" : "s"}`, `≤ ${policy.maxBridges}`, agent.bridges > policy.maxBridges ? "The execution path crosses more networks than the policy allows." : "Bridge count is within the user-defined limit."),
    result("concentration", "Token concentration", agent.concentration <= 50 ? "pass" : agent.concentration <= 60 ? "warning" : "fail", `${agent.concentration}%`, "≤ 50% preferred", agent.concentration > 50 ? "A concentrated exposure increases single-asset failure risk." : "No single asset dominates the simulated allocation."),
    result("permissions", "Approval permissions", agent.approvalPermissions === "scoped" ? "pass" : "fail", agent.approvalPermissions === "scoped" ? "Scoped" : "Unlimited", "Scoped approvals", agent.approvalPermissions === "scoped" ? "The agent requests bounded approvals for the planned action." : "Unlimited approvals could authorize movement beyond this policy."),
  ];
  const failed = checks.filter((check) => check.status === "fail").length;
  const warnings = checks.filter((check) => check.status === "warning").length;
  const verdict: Verdict = failed > 0 ? "blocked" : warnings > 0 ? "warning" : "approve";
  const score = Math.max(0, Math.round(agent.intelligenceScore - failed * 12 - warnings * 4));
  return { verdict, checks, score };
}

export function rankAgents(policy: Policy) {
  return [...orionAgents].sort((a, b) => evaluateAgent(b, policy).score - evaluateAgent(a, policy).score);
}

export function verdictLabel(verdict: Verdict) {
  return verdict === "approve" ? "Approve" : verdict === "warning" ? "Approve with Warning" : "Block";
}

export function buildReport(agent: OrionAgent, policy: Policy, checks: CheckResult[], verdict: Verdict, simulated = true, intent = demoIntent, evaluatedScore = agent.intelligenceScore) {
  const lines = [
    "SENTINEL AUDIT REPORT",
    "=====================",
    `Mode: ${simulated ? "SIMULATION — NO FUNDS MOVED" : "LIVE REVIEW"}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "PARSED INTENT",
    intent,
    "",
    "POLICY OBJECT",
    JSON.stringify(policy, null, 2),
    "",
    `ORION AGENT: ${agent.name}`,
    `Intelligence score: ${agent.intelligenceScore}/100 | Evaluated policy fit: ${evaluatedScore}/100 | Audit: ${agent.auditStatus} | Uptime: ${agent.uptime}% | TVL: $${agent.tvl}M`,
    `FINAL VERDICT: ${verdictLabel(verdict).toUpperCase()}`,
    "",
    "PREFLIGHT CHECKS",
    ...checks.map((check) => `[${check.status.toUpperCase()}] ${check.label}: ${check.actual} | Threshold: ${check.threshold}\n  ${check.evidence}`),
    "",
    "RECOMMENDATION",
    verdict === "blocked" ? "Do not proceed. At least one deterministic guardrail failed." : verdict === "warning" ? "Proceed only after reviewing the highlighted warnings and confirming the simulation assumptions." : "The proposed execution is inside the current guardrails. Confirm the transaction details before proceeding.",
    "",
    "All values in this report are simulated unless explicitly attributed to a live Orion agents data source. Sentinel does not custody funds or guarantee outcomes.",
  ];
  return lines.join("\n");
}
