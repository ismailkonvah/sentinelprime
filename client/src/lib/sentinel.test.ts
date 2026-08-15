import { describe, expect, it } from "vitest";
import { buildReport, defaultPolicy, evaluateAgent, orionAgents, parseIntent } from "./sentinel";

describe("Sentinel intent compiler", () => {
  it("parses amount, duration, volatility, bridges, and low-risk audit requirements", () => {
    const policy = parseIntent("Find low-risk yield for $1,250 for 30 days. No more than one bridge and no more than 12% weekly volatility.");
    expect(policy.amount).toBe(1250);
    expect(policy.duration).toBe(30);
    expect(policy.maxBridges).toBe(1);
    expect(policy.maxVolatility).toBe(12);
    expect(policy.riskTolerance).toBe("low");
    expect(policy.auditRequired).toBe(true);
  });
});

describe("Sentinel deterministic preflight", () => {
  it("runs exactly six named checks for every Orion agent", () => {
    const result = evaluateAgent(orionAgents[0], defaultPolicy);
    expect(result.checks).toHaveLength(6);
    expect(result.checks.map((check) => check.key)).toEqual(["audit", "liquidity", "volatility", "bridges", "concentration", "permissions"]);
  });

  it("blocks an agent with unaudited contracts, excess bridges, and unlimited approvals", () => {
    const result = evaluateAgent(orionAgents[2], defaultPolicy);
    expect(result.verdict).toBe("blocked");
    expect(result.checks.find((check) => check.key === "audit")?.status).toBe("fail");
    expect(result.checks.find((check) => check.key === "bridges")?.status).toBe("fail");
    expect(result.checks.find((check) => check.key === "permissions")?.status).toBe("fail");
  });

  it("updates a verdict when the user raises the volatility guardrail", () => {
    const initial = evaluateAgent(orionAgents[1], defaultPolicy);
    const relaxed = evaluateAgent(orionAgents[1], { ...defaultPolicy, maxVolatility: 15 });
    expect(initial.verdict).toBe("blocked");
    expect(relaxed.verdict).toBe("warning");
    expect(relaxed.checks.find((check) => check.key === "volatility")?.status).toBe("pass");
  });
});

describe("Sentinel audit reports", () => {
  it("labels reports as simulation and includes the policy, checks, and recommendation", () => {
    const evaluation = evaluateAgent(orionAgents[0], defaultPolicy);
    const report = buildReport(orionAgents[0], defaultPolicy, evaluation.checks, evaluation.verdict, true);
    expect(report).toContain("SIMULATION — NO FUNDS MOVED");
    expect(report).toContain("POLICY OBJECT");
    expect(report).toContain("PREFLIGHT CHECKS");
    expect(report).toContain("RECOMMENDATION");
  });
});
