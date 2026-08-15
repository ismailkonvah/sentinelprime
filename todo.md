# Project TODO

- [x] Establish Sentinel visual direction: dark graphite, electric cyan, amber warnings, and trustworthy monospace data accents.
- [x] Build public landing page with hero, value proposition, how-it-works steps, live demo entry point, and trust links for GitHub, X, and Discord.
- [x] Add natural-language DeFi strategy input with a parsed structured policy object.
- [x] Add editable guardrails for amount, duration, risk tolerance, asset exclusions, maximum volatility, maximum bridges, and audit requirement.
- [x] Define Orion agents candidate data model with intelligence score, audit status, uptime, TVL, historical volatility, liquidity, bridges, concentration, and approval permissions.
- [x] Implement deterministic risk preflight engine with contract audit, liquidity threshold, weekly volatility, bridge exposure count, token concentration, and approval permissions checks.
- [x] Build Orion agents comparison panel with ranked candidates and per-guardrail pass, fail, and warning indicators.
- [x] Build live decision cards with Approve, Approve with Warning, and Block verdicts plus plain-English evidence for every check.
- [x] Add simulation mode with expected execution steps, estimated outputs, failure conditions, bridge flow, and prominent simulated-data labeling.
- [x] Make guardrail edits recompute verdicts and evidence in real time.
- [x] Generate full audit report containing parsed intent, policy object, check results, agent scores, and final recommendation.
- [x] Add copy-to-clipboard and plain-text export from decision cards and the audit report view.
- [x] Add unit tests for policy parsing, every risk preflight check, verdict aggregation, guardrail updates, simulation labeling, and report generation.
- [x] Verify desktop and mobile layouts, browser console, network behavior, and core interaction flows.
- [x] Save final checkpoint after all TODO items are complete.

- [x] Rank Orion agents by evaluated policy fit and expose audit status, uptime, TVL, historical volatility, liquidity, and intelligence score in the comparison panel.
- [x] Pass the live intent and evaluated agent score into the exported audit report.
- [x] Expand Vitest coverage for each deterministic check outcome and verdict aggregation combinations.
- [x] Inspect browser console and network logs and document clean core-flow QA.

- [x] Add dedicated boundary assertions for liquidity pass/warning/fail, bridge pass/fail, concentration pass/warning/fail, permissions pass/fail, and volatility fail.
- [x] Exercise compile, guardrail edit, simulation toggle, agent selection, copy, and export flows and save a QA note with console/network observations.

- [x] Exercise a real editable guardrail control in the browser and verify the verdict/evidence updates.
- [x] Toggle simulation off and back on in the browser, verify preview restoration, and update QA.md with the observed result.

- [x] Exercise a guardrail control that causes a visible decision or evidence change and document the updated verdict/check explanation.
- [x] Start with simulation ON, toggle OFF and verify LIVE REVIEW/no preview, then toggle ON and verify SIMULATION/no-funds-moved preview; update QA.md with both transitions.

- [x] Redesign the Sentinel visual system to feel premium and intentional rather than generic AI dashboard UI.
- [x] Refine landing-page hierarchy, typography, spacing, hero composition, and signature preflight brand motif.
- [x] Reduce dashboard-card repetition and improve workspace density, section rhythm, and decision emphasis.
- [x] Add polished hover, focus, active, and transition states while preserving accessibility and reduced-motion behavior.
- [x] Re-verify desktop/mobile screenshots and core interactions after the visual redesign.
- [x] Save a new redesign checkpoint after all premium UI items are complete.

- [x] Introduce a distinctive Sentinel audit-trail motif across hero, workspace, method, and trust sections.
- [x] Add stronger page-level compositional contrast and reduce repeated rounded-card treatment.
- [x] Strengthen typography hierarchy and branded section treatments until the visual review supports a premium result.
- [x] Capture a fresh trusted visual review after the second premium pass.
- [x] Save a post-redesign checkpoint after the second pass is verified and the trusted visual review is clean.

- [x] Add procedural audit-trace structure directly to the method and trust sections, not only through background decoration.
- [x] Increase non-hero typography contrast with stronger narrative statements and clearer procedural labels.
- [x] Capture a clean trusted visual review after the final brand-system pass.
- [x] Save the final premium UI checkpoint after trusted visual approval.

- [x] Make the method section’s primary statement more editorial and signature-led, with a clear pre-signature action phrase.
- [x] Add a stronger procedural label and visual path marker to the lower trust section so the page ends like an evidence record.
- [x] Capture a fresh trusted visual review after this targeted hierarchy pass.
- [x] Save the final post-review premium checkpoint.

- [x] Read and translate the supplied UI prompt into concrete Sentinel design requirements.
- [x] Apply the supplied prompt to the Sentinel visual layer without changing risk-engine behavior or demo interactions.
- [x] Verify prompt-driven desktop/mobile presentation and preserve all existing core flows.
- [x] Save a checkpoint for the prompt-driven redesign.

- [x] Add prompt-specific top-right search, notifications, wallet, and profile controls to the command-center shell.
- [x] Run browser QA for compile, guardrail edits, agent selection, simulation toggle, report view, copy, and export after the prompt-driven redesign.
- [x] Save a new checkpoint after the prompt-driven redesign and browser QA.

- [x] Re-run the full post-redesign browser QA in one uninterrupted session with evidence-matched compile, guardrail edit, Aura selection, simulation OFF→ON, report, copy, and export.
- [x] Update QA.md from that same stable session and save a fresh checkpoint only after the full post-redesign QA succeeds.

- [x] Complete post-redesign browser QA across stable sessions with explicit evidence for target compile, guardrail edit, Aura active state, simulation OFF and ON, report open, copy success, and export success.
- [x] Append QA.md with the exact final intent, policy, active agent, simulation transitions, and report actions, noting the browser runtime boundary.
- [x] Save a fresh checkpoint after the documented final browser QA evidence.

- [x] Define a live portfolio and Orion-agent data contract with freshness, source, and simulated/demo-state labeling.
- [x] Replace static shell KPI values with dynamic portfolio and agent metrics derived from the active Sentinel data model.
- [x] Implement functional navigation search with keyboard-accessible results and workspace/agent/report destinations.
- [x] Implement a notifications panel with meaningful Sentinel system and risk events plus read-state behavior.
- [x] Implement a profile control with account context and safe sign-out/action states.
- [x] Add a simulation-only wallet handoff flow with a clear no-funds/no-signature boundary.
- [x] Add an explicit confirmation modal showing agent, policy, checks, route, simulated output, and failure conditions before handoff.
- [x] Add unit tests and browser QA for dynamic KPIs, search, notifications, profile, modal confirmation, and simulation-only safety.
- [x] Save a checkpoint after all requested upgrades and verification are complete.

- [x] Add explicit freshness and source metadata to live portfolio/Orion-agent data and surface it in the shell or supporting detail.
- [x] Verify keyboard-accessible search results and destination behavior for workspace, agent, and report targets.
- [x] Implement and verify notification unread/read-state transitions.
- [x] Implement and verify safe profile actions, including clearly labeled demo-only sign-out behavior.
- [x] Show checks, simulated output, and failure conditions inside the handoff confirmation modal before confirmation.
- [x] Add focused unit tests for search, notifications, profile, simulation-handoff safety, and modal state.
- [x] Save a new checkpoint only after these gaps and QA are complete.

- [x] Verify keyboard activation for Workspace and Audit report search destinations and document both results.
- [x] Add direct notification-panel unread-to-read UI evidence and a focused transition test.
- [x] Add and test clearly labeled demo-only profile actions, including demo sign-out behavior.
- [x] Add focused tests for handoff modal content and state, including checks, simulated output, and failure conditions.
- [x] Save a fresh checkpoint after the remaining gap fixes and QA.
