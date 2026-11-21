# end-to-end system design case studies — Reference: MoSCoW prioritization

Sources: [Agile Business Consortium: What is MoSCoW Prioritization?](https://www.agilebusiness.org/resource/what-is-moscow-prioritization/), [UK Government Digital Policy: Practice Guide for Scoping and Planning, Appendix A](https://www.digitalpolicy.gov.hk/en/our_work/digital_infrastructure/methodology/proj_mgmt/doc/G63a_Practice_Guide_for_LSP_Appendix_A_v2_0.pdf), [HLD Handbook: Requirements Scoping](https://hld.handbook.academy/curriculum/interview-framework/requirements-scoping/).

## Scope and version

MoSCoW is a requirements-prioritization technique commonly associated with DSDM. The categories are **Must have**, **Should have**, **Could have**, and **Won’t have this time**; the lowercase “o” letters make the acronym pronounceable. This lesson explains its use in scoping a system-design interview or delivery increment, not a method for calculating technical architecture. Categories need shared definitions and a stated timebox. Sources checked 2026-11-21.

## How this group fits the mental model

An open-ended system question can contain more features than can be designed in the available time. Prioritization makes the boundary visible: identify the minimum capabilities needed for the chosen outcome, decide what is valuable but deferrable, and state what is outside this iteration. In an interview, this prevents “design everything” scope. In delivery, it helps manage a fixed timebox, but only if stakeholders agree what each category means.

## Supplied names explained

- **Must have:** necessary for the agreed solution to be viable in this timebox. If a true Must is omitted, the selected outcome fails its core purpose. Avoid labeling every desirable feature a Must.
- **Should have:** important and expected if feasible, but there is a viable workaround or the agreed outcome can still succeed if it is deferred. “Should” does not mean low value.
- **Could have:** useful if capacity remains and it does not jeopardize Musts or Shoulds. It is the first scope to defer when time or capacity is constrained.
- **Won’t have this time:** explicitly excluded from this delivery slice, while potentially remaining valuable later. It records a decision and manages expectations; it does not mean “never.”
- **Timebox and agreement:** priorities are relative to a defined release, interview scope, or increment. A requirement’s category can change when business goals, evidence, dependencies, or constraints change. Revisit the set deliberately rather than silently relabeling items.

MoSCoW is not a numerical score, dependency resolver, or substitute for risk analysis. A dependency can make an apparently small feature necessary; a regulatory or safety constraint can turn a requirement into a Must. Record the rationale and dependencies, and ensure the Must set is feasible in the timebox.

## Cross-item comparison

| Technique | Primary question | Limitation |
| --- | --- | --- |
| MoSCoW | Which requirements are essential, important, optional, or deferred for this timebox? | Categories can inflate without shared criteria or a feasible Must set |
| Impact/effort ranking | Which item seems to produce more value for less work? | Scores can hide dependencies, risk, and uncertainty |
| Risk-first design | Which uncertainty or failure could invalidate the design? | Does not itself prioritize product scope |
| Interview requirement scoping | Which few features and quality constraints should this answer cover? | Must remain responsive to interviewer direction |

## Examples

For a ticketing system interview, Must: list an event’s seats and complete one purchase without overselling. Should: support temporary holds that expire and safely recover from payment timeouts. Could: provide personalized event recommendations. Won’t this time: build resale, loyalty, and multi-currency support. Before drawing architecture, check dependencies: preventing oversell and defining payment confirmation semantics may be Must-level correctness requirements even if the prompt initially emphasizes a recommendation feature. If the interviewer changes the audience or scale, revisit the categories and explain what changes.

## Common mistakes

- Putting nearly everything into Must, making prioritization meaningless.
- Treating Should as unimportant or Could as guaranteed to be delivered.
- Writing “Won’t” without the phrase “this time,” leaving stakeholders to infer it is permanently rejected.
- Applying categories without a defined increment, deadline, or outcome.
- Ignoring dependencies, legal/security requirements, or failure modes that change what is truly essential.
- Treating MoSCoW as an algorithm that selects components or estimates engineering effort.
- Failing to revisit priorities when requirements or constraints change.

## Knowledge checks with answers

1. **What does Won’t mean?** Excluded from the current timebox or scope, not necessarily rejected forever.
2. **Can a Should have be high value?** Yes. It can matter greatly while remaining deferrable under the agreed outcome and workaround.
3. **What makes a Must category useful?** A shared definition, a feasible set, and an explicit consequence if a Must is absent.
4. **Does MoSCoW handle dependencies automatically?** No. Identify and account for dependencies separately.
5. **When should categories be reviewed?** When goals, evidence, dependencies, capacity, or constraints materially change.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder text with category definitions grounded in DSDM/government practice guidance. Clarified “Won’t have this time,” timebox dependence, category inflation, dependencies, and the distinction between scope prioritization and architecture selection. No unsupported numerical rules are included. No material omission remains in the supplied topic scope.
