import { describe, expect, it } from "vitest";
import { buildReport, defaultPolicy, derivePortfolioSnapshot, evaluateAgent, orionAgents, parseIntent, rankAgents } from "../client/src/lib/sentinel";

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

describe("Sentinel dashboard data", () => {
  it("derives dynamic portfolio KPIs from the active policy and Orion agents", () => {
    const baseline = derivePortfolioSnapshot(defaultPolicy, orionAgents[0]);
    const larger = derivePortfolioSnapshot({ ...defaultPolicy, amount: 900 }, orionAgents[0]);
    const blocked = derivePortfolioSnapshot({ ...defaultPolicy, maxBridges: 0 }, orionAgents[0]);
    expect(larger.portfolioValue).toBeGreaterThan(baseline.portfolioValue);
    expect(baseline.totalTvl).toBeCloseTo(24.4, 1);
    expect(baseline.averageUptime).toBeGreaterThan(98);
    expect(blocked.eligibleAgents).toBeLessThanOrEqual(baseline.eligibleAgents);
    expect(blocked.riskLabel).toBe("High");
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


describe("Sentinel command-center controls", () => {
  it("returns searchable workspace and agent records with case-insensitive filtering", async () => {
    const { getSearchResults } = await import("../client/src/lib/sentinel");
    expect(getSearchResults("aura").map((item) => item.label)).toEqual(["Aura Engine"]);
    expect(getSearchResults("").map((item) => item.label)).toContain("Audit report");
  });

  it("models notification unread to read transitions", async () => {
    const { getNotificationState } = await import("../client/src/lib/sentinel");
    expect(getNotificationState(false, 4)).toMatchObject({ unread: true, label: "2 new", summary: "4/6 checks currently passing." });
    expect(getNotificationState(true, 6)).toMatchObject({ unread: false, label: "All read" });
  });

  it("keeps handoff simulation-only and blocks confirmation after a failed preflight", async () => {
    const { getHandoffState } = await import("../client/src/lib/sentinel");
    expect(getHandoffState("approve")).toMatchObject({ canConfirm: true, isSimulationOnly: true });
    expect(getHandoffState("blocked")).toMatchObject({ canConfirm: false, label: "Blocked by preflight", isSimulationOnly: true });
  });

  it("exposes provenance metadata on dynamic portfolio snapshots", () => {
    const snapshot = derivePortfolioSnapshot(defaultPolicy, orionAgents[0]);
    expect(snapshot).toMatchObject({ dataSource: "Orion agents demo registry", dataFreshness: "simulated" });
    expect(snapshot.lastUpdated).toMatch(/^2026-08-15T/);
  });
});


describe("Sentinel remaining UI contracts", () => {
  it("keeps workspace and report as distinct keyboard destinations", async () => {
    const { getSearchResults } = await import("../client/src/lib/sentinel");
    expect(getSearchResults("workspace")[0]).toMatchObject({ target: "workspace" });
    expect(getSearchResults("report")[0]).toMatchObject({ label: "Audit report", target: "report" });
  });

  it("labels profile actions as safe demo-only actions", async () => {
    const { getProfileActionState } = await import("../client/src/lib/sentinel");
    expect(getProfileActionState("view-context", false)).toMatchObject({ safe: true, label: "Demo operator" });
    expect(getProfileActionState("demo-sign-out", true)).toMatchObject({ safe: true, label: "Sign out of demo" });
    expect(getProfileActionState("demo-sign-out", false).description).toContain("no wallet or funds affected");
  });

  it("builds modal evidence for warnings, simulated output, and failure conditions", async () => {
    const { getHandoffModalState, evaluateAgent } = await import("../client/src/lib/sentinel");
    const agent = (await import("../client/src/lib/sentinel")).orionAgents[1];
    const policy = (await import("../client/src/lib/sentinel")).defaultPolicy;
    const evaluation = evaluateAgent(agent, policy);
    const modal = getHandoffModalState(agent, policy, evaluation, true);
    expect(modal).toMatchObject({ agent: "Aura Engine", checksLabel: "4/6 passing", isSimulationOnly: true });
    expect(modal.simulatedOutput).toMatch(/^~\$507/);
    expect(modal.warnings.length).toBeGreaterThan(0);
    expect(modal.failureConditions).toContain("Circuit breaker halts before signing");
  });
});


describe("notification transition", () => {
  it("moves from unread to all read after the panel is opened", async () => {
    const { getNotificationState } = await import("../client/src/lib/sentinel");
    const unread = getNotificationState(false, 4);
    const read = getNotificationState(true, 4);
    expect(unread).toMatchObject({ unread: true, label: "2 new" });
    expect(read).toMatchObject({ unread: false, label: "All read", summary: "4/6 checks currently passing." });
  });
});


describe("Sentinel responsive surface contract", () => {
  it("uses compact stacked controls on mobile and sidebar inline controls on desktop", async () => {
    const { getResponsiveSurfaceState } = await import("../client/src/lib/sentinel");
    expect(getResponsiveSurfaceState(375)).toMatchObject({ navMode: "compact", kpiColumns: 2, actionLayout: "stacked", minimumTouchTarget: 44 });
    expect(getResponsiveSurfaceState(900)).toMatchObject({ navMode: "compact", kpiColumns: 4, actionLayout: "inline", minimumTouchTarget: 44 });
    expect(getResponsiveSurfaceState(1280)).toMatchObject({ navMode: "sidebar", kpiColumns: 5, actionLayout: "inline", minimumTouchTarget: 44 });
  });
});
