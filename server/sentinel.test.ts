import { describe, expect, it } from "vitest";
import { buildReport, defaultPolicy, evaluateAgent, orionAgents, parseIntent, rankAgents } from "../client/src/lib/sentinel";

describe("Sentinel intent compiler", () => {
  it("parses amount, duration, volatility, bridges, and low-risk audit requirements", () => {
    const policy = parseIntent("Find low-risk yield for $1,250 for 30 days. No more than one bridge and no more than 12% weekly volatility.");
    expect(policy).toMatchObject({ amount: 1250, duration: 30, maxBridges: 1, maxVolatility: 12, riskTolerance: "low", auditRequired: true });
  });
});

describe("Sentinel deterministic preflight", () => {
  it("runs exactly six named checks for every Orion agent", () => {
    const result = evaluateAgent(orionAgents[0], defaultPolicy);
    expect(result.checks).toHaveLength(6);
    expect(result.checks.map((check) => check.key)).toEqual(["audit", "liquidity", "volatility", "bridges", "concentration", "permissions"]);
  });

  it("handles audit status as pass, warning, or fail", () => {
    expect(evaluateAgent(orionAgents[0], defaultPolicy).checks.find((check) => check.key === "audit")?.status).toBe("pass");
    expect(evaluateAgent(orionAgents[1], defaultPolicy).checks.find((check) => check.key === "audit")?.status).toBe("warning");
    expect(evaluateAgent(orionAgents[2], defaultPolicy).checks.find((check) => check.key === "audit")?.status).toBe("fail");
  });

  it("checks liquidity, volatility, bridge count, concentration, and permissions independently", () => {
    const policy = { ...defaultPolicy, maxVolatility: 10, maxBridges: 1 };
    const helix = evaluateAgent(orionAgents[2], policy);
    expect(helix.checks.find((check) => check.key === "liquidity")?.status).toBe("fail");
    expect(helix.checks.find((check) => check.key === "volatility")?.status).toBe("pass");
    expect(helix.checks.find((check) => check.key === "bridges")?.status).toBe("fail");
    expect(helix.checks.find((check) => check.key === "concentration")?.status).toBe("fail");
    expect(helix.checks.find((check) => check.key === "permissions")?.status).toBe("fail");
    const aura = evaluateAgent(orionAgents[1], policy);
    expect(aura.checks.find((check) => check.key === "volatility")?.status).toBe("warning");
  });

  it("covers liquidity, bridge, concentration, permissions, and volatility boundaries", () => {
    const base = { ...orionAgents[0] };
    expect(evaluateAgent({ ...base, liquidity: 1.2 }, defaultPolicy).checks.find((check) => check.key === "liquidity")?.status).toBe("pass");
    expect(evaluateAgent({ ...base, liquidity: 0.8 }, defaultPolicy).checks.find((check) => check.key === "liquidity")?.status).toBe("warning");
    expect(evaluateAgent({ ...base, liquidity: 0.5 }, defaultPolicy).checks.find((check) => check.key === "liquidity")?.status).toBe("fail");
    expect(evaluateAgent({ ...base, bridges: 1 }, defaultPolicy).checks.find((check) => check.key === "bridges")?.status).toBe("pass");
    expect(evaluateAgent({ ...base, bridges: 2 }, defaultPolicy).checks.find((check) => check.key === "bridges")?.status).toBe("fail");
    expect(evaluateAgent({ ...base, concentration: 40 }, defaultPolicy).checks.find((check) => check.key === "concentration")?.status).toBe("pass");
    expect(evaluateAgent({ ...base, concentration: 55 }, defaultPolicy).checks.find((check) => check.key === "concentration")?.status).toBe("warning");
    expect(evaluateAgent({ ...base, concentration: 65 }, defaultPolicy).checks.find((check) => check.key === "concentration")?.status).toBe("fail");
    expect(evaluateAgent({ ...base, approvalPermissions: "scoped" }, defaultPolicy).checks.find((check) => check.key === "permissions")?.status).toBe("pass");
    expect(evaluateAgent({ ...base, approvalPermissions: "unlimited" }, defaultPolicy).checks.find((check) => check.key === "permissions")?.status).toBe("fail");
    expect(evaluateAgent({ ...base, volatility: 20 }, defaultPolicy).checks.find((check) => check.key === "volatility")?.status).toBe("fail");
  });

  it("aggregates failures into Block and warnings into Approve with Warning", () => {
    expect(evaluateAgent(orionAgents[2], defaultPolicy).verdict).toBe("blocked");
    expect(evaluateAgent(orionAgents[1], defaultPolicy).verdict).toBe("warning");
    expect(evaluateAgent(orionAgents[0], defaultPolicy).verdict).toBe("approve");
  });

  it("updates volatility outcome when a guardrail changes", () => {
    const initial = evaluateAgent(orionAgents[1], defaultPolicy);
    const relaxed = evaluateAgent(orionAgents[1], { ...defaultPolicy, maxVolatility: 15 });
    expect(initial.checks.find((check) => check.key === "volatility")?.status).toBe("warning");
    expect(relaxed.checks.find((check) => check.key === "volatility")?.status).toBe("pass");
  });

  it("ranks candidates by evaluated policy fit rather than fixture order", () => {
    const ranked = rankAgents(defaultPolicy);
    expect(ranked[0]?.name).toBe("Vega Vault");
    expect(ranked.map((agent) => agent.id)).toHaveLength(3);
  });
});

describe("Sentinel audit reports", () => {
  it("uses the live intent and evaluated score and labels reports as simulation", () => {
    const evaluation = evaluateAgent(orionAgents[0], defaultPolicy);
    const report = buildReport(orionAgents[0], defaultPolicy, evaluation.checks, evaluation.verdict, true, "Custom strategy intent", 84);
    expect(report).toContain("SIMULATION — NO FUNDS MOVED");
    expect(report).toContain("Custom strategy intent");
    expect(report).toContain("Evaluated policy fit: 84/100");
    expect(report).toContain("POLICY OBJECT");
    expect(report).toContain("PREFLIGHT CHECKS");
    expect(report).toContain("RECOMMENDATION");
  });
});
