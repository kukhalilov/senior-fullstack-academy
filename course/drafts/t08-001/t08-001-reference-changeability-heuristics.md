# SOLID cohesion coupling DRY KISS YAGNI — Reference: Changeability and simplicity heuristics

Sources: [Beck’s design rules](https://martinfowler.com/bliki/BeckDesignRules.html) and [YAGNI](https://martinfowler.com/bliki/Yagni.html).

## Scope and version

These heuristics help judge duplication and complexity. Their value depends on which knowledge changes together and the present cost of supporting a design.

## How this group fits the mental model

Keep the design understandable and aligned with known needs. Centralize shared rules that must evolve together; defer speculative flexibility; and avoid optimizing a performance concern before measurement shows it matters.

## Supplied names explained

### DRY (Don't Repeat Yourself)

Avoid multiple authoritative representations of the same knowledge. When a business invariant must change in one way, encode it once or ensure there is one maintained source. DRY is not a demand to remove every similar expression; independent policies can look alike today and diverge tomorrow.

### KISS (Keep It Simple, Stupid)

Prefer the simplest design that adequately meets requirements, correctness constraints, and operational needs. Simplicity is not always the fewest lines: clear named types may be simpler to reason about than a compressed expression. Evaluate total cognitive and maintenance cost.

### YAGNI (You Aren't Gonna Need It)

Do not build speculative capabilities until a real requirement justifies their cost. Keep design open to change through good boundaries, but avoid implementing hypothetical providers, options, and plugin systems without evidence. YAGNI does not mean ignore roadmap commitments or security requirements already known.

### Premature abstraction

A generalized interface or framework is introduced before the cases and stable common behavior are understood. It can force unrelated use cases into one model. Wait for repeated, genuinely shared knowledge or an explicit requirement, then extract the smallest abstraction that improves changeability.

### Premature optimization

Complexity is added to improve speed or resource use without measurement that the current path is a bottleneck. First identify the objective and gather representative evidence. A known algorithmic complexity defect may justify early correction, but speculative caching or concurrency often adds invalidation and correctness costs.

### Knowledge duplication versus textual duplication

Textual duplication means code looks similar; knowledge duplication means one policy or fact has multiple places that must stay synchronized. Similar formatting code for CSV and JSON may be independently changeable, while a tax-rate rule copied into two formats is duplicated knowledge. Refactor according to shared reasons to change, not visual similarity alone.

## Cross-item comparison

| Situation | Heuristic |
|---|---|
| One rule must change in several places | DRY: establish one authoritative representation |
| Similar code represents separate policies | Keep independent until shared knowledge is real |
| Unknown feature is anticipated | YAGNI: defer implementation while retaining sensible boundaries |
| Complex cache has no observed benefit | Avoid premature optimization |
| Generalization hides the actual use cases | Avoid premature abstraction; simplify |

## Examples

Two endpoints independently format a date string for different external contracts. Their code looks similar, but formats may evolve independently, so a universal formatter may be wrong. By contrast, both endpoints enforce the same order authorization invariant; duplicating that policy risks a security inconsistency and should be addressed as shared knowledge.

## Common mistakes

- “DRY means never repeat a line.”
- “YAGNI means do not design any extension boundary.”
- “KISS means use the fewest classes regardless of clarity.”
- “Optimization is always premature until a profiler exists.”
- “Identical code today guarantees one shared reason to change.”

## Knowledge checks with answers

1. **What does DRY target?** Duplicated knowledge that must remain consistent.
2. **When is a copy acceptable?** When similar text expresses independently evolving policy.
3. **What does YAGNI postpone?** Unneeded speculative capability, not known requirements.

### Exact terms covered

- `DRY (Don't Repeat Yourself)`
- `KISS (Keep It Simple, Stupid)`
- `YAGNI (You Aren't Gonna Need It)`
- `Premature abstraction`
- `Premature optimization`
- `Knowledge duplication versus textual duplication`

### Exact terms covered

- `DRY (Don't Repeat Yourself)`
- `KISS (Keep It Simple, Stupid)`
- `YAGNI (You Aren't Gonna Need It)`
- `Premature abstraction`
- `Premature optimization`
- `Knowledge duplication versus textual duplication`
