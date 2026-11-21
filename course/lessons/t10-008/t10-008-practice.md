# mentorship communication estimation planning and leadership — Exercises and worked solutions

# Goals

Practice coaching without taking over, writing decision-oriented communication, producing an uncertainty-aware delivery forecast, making delegation boundaries explicit, and negotiating cross-team dependencies.

# Worked example

## Reforecast a cross-team API change

The team expects a replacement vendor endpoint to be ready in three weeks. A partner team has not confirmed whether its export supports stable identifiers. The current plan treats that as an assumption, so the delivery date is not yet a reliable commitment.

Write a short status update:

> **Outcome:** migrate one customer workflow without changing its observable contract. **Current forecast:** 3–6 weeks, medium-low confidence. **Assumption:** partner export has stable identifiers. **Next step:** a two-day spike with the partner team to verify identity and rate limits. **Risk:** if identifiers are unstable, reconciliation work is required. **Decision needed:** product owner to choose whether to preserve the current vendor through launch or move the launch after the spike. **Next update:** after the spike results are reviewed.

This update distinguishes outcome, forecast, assumption, risk, investigation, and decision owner. It does not disguise uncertainty as an exact date or claim that the partner owns the entire delay.

# Exercises

## Exercise 1: Mentor without taking the keyboard

A junior teammate says, “The integration test fails. Can you just fix it?” You see a likely timeout issue but do not yet know whether it is test setup or application behavior. Write a short response that listens, asks for useful evidence, offers support, and keeps appropriate ownership with the learner. Then define what you would do if the failure indicated imminent production risk.

## Exercise 2: Write a decision proposal

The team is choosing between a quick adapter around a legacy API and a broader rewrite of its integration layer. Draft a concise proposal outline with decision request, outcome, assumptions, options, tradeoffs, risks, validation, owner, and decision deadline.

## Exercise 3: Create an estimate range

A familiar endpoint change usually takes 2–4 ideal engineer-days. This change also needs partner approval (historically 2–8 calendar days) and deployment windows only on Tuesdays. Provide a forecast range, confidence, assumptions, critical path, and what would change your forecast. Do not add effort and calendar time as if they were the same unit.

## Exercise 4: Negotiate a dependency

A platform team cannot deliver the requested monitoring dashboard before your launch. Write a cross-team request that describes the outcome, minimum capability needed, options, impact, decision deadline, and a fallback. Keep the language collaborative.

## Exercise 5: Delegate a bounded decision

You want a teammate to own the first implementation of a new service adapter. State the outcome, decisions they own, boundaries they must respect, when to escalate, check-in point, and how they will demonstrate completion.

# Progressive hints

1. **Exercise 1:** Ask what they observed and what they tried; suggest examining the first failing assertion or log. For production risk, be more directive and contain impact first.
2. **Exercise 2:** Lead with what decision is needed and by when, then show consequences and evidence.
3. **Exercise 3:** Keep ideal effort separate from partner wait and release calendar. The release window may dominate elapsed time.
4. **Exercise 4:** Propose the smallest useful monitoring capability, not only the original full dashboard.
5. **Exercise 5:** Say what the teammate can decide and what contract/safety conditions remain fixed.

# Complete solutions

## Exercise 1 solution

“Let’s inspect it together. What is the first failing assertion, and does the request reach the test server? Share the failure output and the relevant timeout configuration; you can drive while I help trace it. We’ll decide whether this is test setup or application behavior before changing it. If the failure points to live customer impact, I’ll help coordinate containment immediately and we can return to learning after the risk is controlled.”

This response offers support without assuming the cause or taking ownership away. In a real emergency, the mentor may need to direct actions based on the incident role and then debrief later.

## Exercise 2 solution

```text
Decision requested: choose a bounded adapter now or approve a broader integration rewrite by Friday.
Outcome: preserve current customer workflows while enabling vendor replacement.
Assumptions: old and new API can coexist for one release; current callers are fully inventoried.
Option A: narrow adapter; lower near-term scope, retains legacy model mapping.
Option B: rewrite layer; may simplify multiple callers, higher parity and migration risk.
Tradeoffs/risks: hidden consumers, retry semantics, data reconciliation, temporary dual support.
Validation: contract tests and one representative vertical slice; measure errors and latency.
Recommendation: adapter first unless discovery shows the seam cannot isolate the needed changes.
Owner: engineering lead decides after partner/platform input.
Deadline: Friday, before the next release plan is finalized.
```

## Exercise 3 solution

State approximately **2–4 ideal engineer-days of implementation**, plus **2–8 calendar days of partner approval**, with deployment constrained to Tuesday windows. The earliest calendar delivery depends on whether approval starts immediately and which Tuesday window is available; the answer should express actual dates only after knowing today’s date and approval schedule. Confidence may be medium for code effort and low-to-medium for elapsed delivery because partner response and release windows dominate. Assumptions: endpoint remains within the familiar pattern, partner approves one review cycle, and the change passes required checks. Critical path: implementation and tests → partner approval if contract-dependent → release readiness → Tuesday deployment. Forecast changes if partner needs contract changes, another review cycle, or a missed Tuesday window.

Do not add “2–4 days plus 2–8 days” into a single effort estimate: one is focused engineering effort, the other is elapsed waiting.

## Exercise 4 solution

“We need to verify request failures and latency for the new endpoint before expanding rollout. The full dashboard may not be available before launch. Could the platform team provide the minimum request-rate, error-rate, and latency panels or alert query by Monday? If not, we can delay cohort expansion until the existing telemetry is sufficient, or run a manual review for the first small cohort. Which option fits your capacity? The release owner needs the decision by Tuesday.”

This request names the outcome, minimum capability, options, fallback, and deadline while recognizing capacity constraints.

## Exercise 5 solution

“Please own the first adapter for the read-only customer lookup. You may choose its internal structure and test doubles. Keep the existing response contract and timeout behavior; do not add retries or send production traffic without review. Escalate if the legacy API returns undocumented fields, customer data crosses a new trust boundary, or the partner contract is unclear. Let’s review the contract tests and dependency map after the first draft. Completion means tests cover success, missing customer, timeout, and malformed response, and you present a rollout/checkpoint plan.”

## Exercise 2 review checklist

A good proposal makes the decision owner and deadline visible, compares feasible options on relevant consequences, separates facts from assumptions, includes a validation plan, and does not pretend a recommendation is an approved decision.

# Tests and edge cases

Review your answers for these cases:

- Does the estimate distinguish effort from elapsed time?
- Does the critical path include external approvals and release windows?
- Can the mentee make a real decision within the delegation boundary?
- Does the escalation condition cover safety and privacy, not just schedule?
- Does the status update report facts separately from assumptions and forecasts?
- Is the fallback usable if the preferred dependency is unavailable?
- Does the decision request identify who decides and by when?
- Does the learning plan avoid using psychological safety as a reason to ignore risk?

# Reflection questions

1. Which estimate assumptions in your current work are hidden from stakeholders?
2. How can you tell whether a mentee needs explanation, guided discovery, or direct instruction?
3. Which channel would you choose for a technical disagreement that is both complex and sensitive? What durable record follows?
4. What is one commitment you should renegotiate earlier when evidence changes?
5. How can you make a vertical slice useful to users and informative about system risk?

# Sources

- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)
- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
