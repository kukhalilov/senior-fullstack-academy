# end-to-end system design case studies — Reference: ADEPT framework

Sources: [HLD Handbook: Interview Frameworks Compared](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [HLD Handbook: How to Approach a System Design Question](https://hld.handbook.academy/curriculum/core-fundamentals/how-to-approach-design-questions/).

## Scope and version

ADEPT is presented in the HLD Handbook as a community-derived mnemonic: Ask clarifying questions, Define requirements, Estimate, Propose design, Tune with trade-offs. Unlike PEDALS or Alex Xu’s framework, the cited source does not attribute ADEPT to a canonical author or formal published standard. Treat the expansion as one useful memory aid, not an official company rubric. Sources checked 2026-11-21.

## How this group fits the mental model

The useful distinction in ADEPT is between asking questions and stating the requirements you will actually design for. Questions gather evidence; requirements record the chosen scope and assumptions. The final tuning step reminds you to test whether the design still meets the constraints and to explain what you traded away. The short mnemonic does not prescribe the components or make trade-offs disappear from the earlier design work.

## Supplied names explained

- **A — Ask clarifying questions:** resolve ambiguity that could alter architecture, such as primary user journeys, correctness, freshness, latency, geographic scope, and expected workload. Do not ask a long questionnaire; prioritize the highest-impact unknowns.
- **D — Define requirements:** state the selected functional requirements and the few quality goals that matter most. Separate must-haves from optional scope and make assumptions explicit so the interviewer can correct them.
- **E — Estimate:** use simple, visible math to bound traffic, storage, bandwidth, retention, or fan-out when the answer would affect partitioning, caching, queueing, or cost. Estimates are approximations; state inputs and sensitivity rather than presenting false precision.
- **P — Propose design:** sketch a simple end-to-end architecture and explain one write and one read path. Include interfaces and data ownership as needed; ADEPT does not specify API, schema, or diagramming substeps.
- **T — Tune with trade-offs:** identify the likely bottleneck or risk, compare plausible alternatives, choose under the stated constraints, and say when you would revisit the decision. A trade-off is a consequence, not a claim that one design is universally best.

## Cross-item comparison

| Scaffold | Explicitly named parts | Practical implication |
| --- | --- | --- |
| ADEPT | Questions, requirements, estimates, proposal, trade-offs | Compact reminder; the design step must carry APIs, data, failures, and security as needed |
| RESHADED | Requirements, estimates, schema, high-level design, API, detailed design, evaluation, distinctive feature | More granular coverage checklist; can feel mechanical if read as a script |
| PEDALS | Requirements, estimate, service, data model, components, scale | Gives data modeling and scaling their own stages; make trade-offs and failure analysis explicit |
| Alex Xu four-step | Scope, high-level design, deep dive, wrap-up | Flexible outer structure; add explicit estimates, APIs, and entities when helpful |

Only the ADEPT expansion is treated here as a community mnemonic from the cited handbook. Similar acronyms may exist elsewhere with different expansions. Do not attribute it to a company or individual without a primary source.

## Examples

For a URL shortener, ask whether links need custom aliases, expiration, analytics, and abuse controls. Define the core: create a short link and redirect it reliably. Estimate creation and redirect volume plus retention if those numbers affect storage or cache size. Propose an API, a mapping store, and a redirect path. Then tune: a cache reduces read latency but requires expiration and invalidation; a relational store simplifies uniqueness and transactions, while partitioned key-value storage may help at higher scale but complicates distribution and hot-key behavior. Close by identifying redirect availability and abuse prevention as remaining risks.

## Common mistakes

- Treating “Ask” and “Define” as duplicate steps: the first elicits information; the second commits to a scope.
- Asking many low-value questions instead of identifying the uncertainty that changes the design.
- Estimating every quantity, regardless of whether it changes a decision.
- Hiding APIs, data ownership, or failure behavior inside a vague “propose design” diagram.
- Treating “tune” as bolt-on optimization rather than a justified comparison under requirements.
- Assuming ADEPT is a canonical or company-specific process based on its acronym alone.

## Knowledge checks with answers

1. **Why distinguish asking questions from defining requirements?** Questions explore uncertainty; the requirements statement captures the selected scope and assumptions.
2. **When should you estimate?** When a rough bound can influence architecture, capacity, cost, or a trade-off.
3. **Does ADEPT specify what APIs or data model to produce?** No. Those details need to be included within the proposal when relevant.
4. **What does tuning with trade-offs require?** Compare options against stated constraints, choose one, explain consequences, and name a revisit trigger.
5. **Is ADEPT a standardized interview rubric?** No evidence in the cited source establishes that; it is described as community-derived.

## Review status

Reviewed 2026-11-21. Replaced generic template text with a qualified explanation of the five supplied ADEPT stages and their practical use. The lesson explicitly limits provenance claims and distinguishes the mnemonic from a standardized rubric. Added API, data, security, failure, estimation, and interviewer-adaptation caveats to prevent the abbreviated labels from implying complete coverage. No material omission remains in the supplied topic scope.
