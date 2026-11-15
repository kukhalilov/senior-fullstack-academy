# timed mock interviews and spaced problem rehearsal — Interview questions and reasoning

## Core questions

1. What should be included in a timed problem-solving session besides coding?
2. How do you decide how much time to spend deriving an approach?
3. What makes spoken reasoning helpful rather than distracting?
4. What can you do when you cannot prove an optimization?
5. Why should a review attempt happen before reading the solution?
6. Which measurements distinguish speed from understanding?
7. How should a failed delayed re-solve change the plan?

## Concise interview answers

- A full session includes contract clarification, approach comparison, implementation, validation, complexity analysis, and a recap.
- Allocate time explicitly, then adapt it to the task. Reserve time for tests and explanation rather than using all available minutes to code.
- Narrate decisions, invariants, uncertainties, and tradeoffs. Avoid reading syntax aloud.
- State the uncertainty, create a small counterexample, simplify the problem, or return to a correct baseline that can expose what the optimization must preserve.
- Independent recall reveals whether the method can be reconstructed. Reading first can create familiarity that feels like recall.
- Track approach time, implementation time, hints, correctness on edge cases, explanation clarity, delayed re-solve success, and pattern breadth.
- Identify the missing concept, review it, shorten the next interval, and retry without notes. One failure is information about the next practice action, not a general judgment.

## Deep follow-up answers

### Why keep a slower baseline?

A simple baseline often has a direct correctness argument and can serve as a small-input oracle. It gives a trustworthy point of comparison while an optimization is derived. The baseline is not automatically suitable for large constraints; its cost must still be stated.

### What does a useful progress measure look like?

It records observable behavior and context, such as whether the approach was correct, which hint was needed, and whether a delayed re-solve succeeded. A number without its problem, conditions, and correctness evidence is easy to misread.

## Scenario questions

### The interviewer challenges an invariant

Do not defend a vague claim. State the invariant precisely, inspect initialization and the update that is being challenged, and test a minimal input. If the claim fails, correct it openly and revise the approach. If it holds, explain why the transition preserves it and why termination gives the answer.

### Implementation is incomplete near the time limit

Summarize the established contract and approach, name the remaining implementation step, and state what test would validate it. If a correct baseline is available, explain its complexity. Do not claim an unexecuted test passed.

### A re-solve feels familiar but does not progress

Close the notes, restate the problem, and write the invariant or recurrence from memory. If that fails, consult only the relevant note, then schedule a shorter retry. Merely recognizing the old solution is not independent retrieval.

## Tradeoffs and alternatives

- A timed mock rehearses prioritization and communication; untimed study is better when first learning an idea.
- A self-recorded mock is convenient and repeatable; a live interviewer can expose communication gaps that solo practice misses.
- A baseline favors simplicity and confidence; an optimized approach may fit constraints better but demands a careful proof.
- A fixed re-solve calendar is easy to follow; adapting intervals to recall is more responsive but requires honest logging.

## Common weak answers

- “I know this pattern” without stating why the constraints and invariant fit it.
- “It is O(n)” without identifying what is scanned or assumptions behind map operations.
- “I finished faster” without checking edge correctness or explaining the proof.
- “I reviewed the solution, so I know it” without an independent delayed attempt.
- “I got stuck” without identifying the first uncertain contract, state, or transition.

## Self-check rubric

Rate each item as **not yet**, **with a prompt**, or **independently**:

- I reserve time for contract clarification, testing, and a recap.
- I can explain the invariant and why each update preserves it.
- I recover from a stall by naming uncertainty and choosing a concrete next move.
- I review mistakes and schedule unaided re-solves.
- I interpret performance metrics with context and prioritize correctness alongside speed.

## Self-calibration

Review several sessions together. A single fast solve may reflect a familiar prompt; a single slow solve may reflect an unusual constraint. Read metrics with their context and choose one concrete skill for the next session.

Sources: [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
