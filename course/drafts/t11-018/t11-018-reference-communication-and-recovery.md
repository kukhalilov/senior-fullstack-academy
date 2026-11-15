# timed mock interviews and spaced problem rehearsal — Reference: Reason aloud, handle uncertainty, and recover

## Scope and version

This reference covers spoken reasoning and recovery actions during algorithm interviews. These are adaptable communication techniques, not required scripts.

## How this group fits the mental model

Clear narration exposes contract decisions, invariants, and tradeoffs during implementation and validation. Recovery moves help return to derivation when an approach is uncertain.

## Supplied names explained

## Purpose

Communication makes the reasoning inspectable. Narrate choices and state changes that affect correctness; concise narration leaves time for implementation and validation.

## Communication moves

- **Concise reasoning narration:** Say the decision and its reason, then continue. Avoid repeating the prompt or narrating obvious syntax.
- **Explain decision before code detail:** “I need constant-time lookup and recency updates, so I will combine a hash map with a doubly linked list.”
- **State uncertainty precisely:** Identify the exact unknown, such as whether equal values can occur or whether an input is guaranteed reachable.
- **Ask a targeted clarification:** Ask one question that can change the algorithm, return behavior, or safety of a mutation.
- **Reduce to smaller subproblem:** Try a tiny input, one element, one transition, or a restricted version to expose the needed state.
- **Construct a counterexample:** Test the current claim against a minimal case likely to violate it.
- **Return to a correct baseline:** A slower correct algorithm can clarify the contract and supply a proof or test oracle.
- **Avoid silent long pauses:** Briefly state what has been established and what you are checking next. Silence can conceal uncertainty from the interviewer.
- **Respond to interviewer feedback:** Treat a hint as new information; restate which assumption, invariant, or approach it changes before editing code.
- **Summarize proof and complexity:** Close with why the invariant yields the answer, time and auxiliary space, and any assumptions.

## Cross-item comparison

Clarification helps before committing to a contract; a counterexample probes a claim; reducing the problem can reveal missing state; returning to a baseline provides a correctness anchor. These moves address different kinds of uncertainty and can be combined.

## Examples

### Example recovery

Suppose a two-pointer optimization is not yet proved. Say: “I am not yet sure that moving this boundary cannot skip a better answer. I will test the smallest counterexample and compare it with a quadratic baseline.” Then use the result to refine or abandon the claim. This is more useful than asserting a familiar pattern without showing why it applies.

### Keep narration useful

Prefer statements about contract, invariant, branch purpose, proof, and tradeoff. Do not speak every keystroke. If the interviewer interrupts, answer the question directly and reconnect the answer to the algorithm.

## Common mistakes

- Narrating every keystroke instead of explaining decisions.
- Hiding uncertainty behind unsupported confidence.
- Treating feedback as a command to change code without understanding the changed requirement.
- Claiming a proof or test that has not been completed.

## Knowledge checks with answers

1. **What should you say when unsure about a proof?** Name the exact uncertain claim and test a small case or compare with a baseline.
2. **What is useful narration?** Contract choices, invariants, branch purpose, proof, and tradeoffs.
3. **How should feedback be handled?** Restate what information it adds and which assumption or invariant changes.

## Checklist

- Can the interviewer tell what I know and what I am unsure about?
- Have I explained why each major data structure is needed?
- Did feedback change my reasoning explicitly, not just my code?
- Can I summarize the proof and bounds in a few sentences?

Sources: [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
