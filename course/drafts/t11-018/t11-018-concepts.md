# timed mock interviews and spaced problem rehearsal — Core concepts and how they fit together

## Learning objectives

- Run a complete timed session that reserves time for review.
- Narrate decisions and uncertainty without rambling.
- Recover from a stall using a smaller subproblem or correct baseline.
- Record session-specific mistakes and schedule independent re-solves.
- Track correctness and explanation quality alongside speed.

## Prerequisites

Know the basic interview solve process: contract, approach, invariant, implementation, tests, and complexity. This module rehearses performance and retention; it does not replace algorithm lessons.

## Core concepts

A mock interview simulates the whole solve cycle. A timer adds pressure, so time must be allocated to reading, planning, coding, and validation. Communication should expose useful reasoning and state transitions while staying concise. When stuck, make uncertainty explicit and choose a recovery action rather than pausing silently or guessing.

Review converts a session into a learning loop. Record what was misunderstood, which invariant or pattern was missed, and which test was omitted. Spaced re-solving means attempting the problem again after a delay from memory before reading notes. The delay should adapt: successful unaided recall can justify a longer gap; failure suggests a shorter retry and focused review.

Progress metrics are diagnostic signals, not a score of ability. Measure time to a correct approach and implementation, hint dependence, edge-case correctness, explanation clarity, re-solve success, and pattern breadth.

## Mechanisms and relationships

### Time allocation

Reserve explicit time for contract clarification, approach comparison, implementation, and validation. Adapt proportions to the interview format, but do not spend the whole session coding. A correct baseline with a proof is more useful than an unfinished optimization with no explanation.

### Reasoning narration and recovery

Say the decision before low-level code detail: “I will keep the smallest candidate index nondecreasing so each combination appears once.” If uncertain, name the uncertainty, ask a targeted question, construct a tiny counterexample, or reduce to a baseline. Respond to feedback by explaining how it changes the invariant or approach.

### Review and spaced practice

Immediately after the mock, log one misunderstanding, one missing invariant, one omitted test, and one correction. Schedule a retry without notes. Compare only after the independent attempt, then update the mistake log. A simple increasing delay sequence is a planning heuristic, not a guarantee that a skill is retained.

### Calibration

Progress difficulty from familiar patterns to combined constraints, then mix topics. A faster solution with wrong edge behavior is not progress. Compare both speed and correctness, and revisit earlier topics when delayed recall drops.

## Worked examples

For Jump Game II, explain the current jump layer as the indices reachable using the current number of jumps. Track the farthest next endpoint while scanning the layer; when its end is reached, commit one jump and advance to the next layer. State that the input guarantee makes the destination reachable. If the invariant becomes unclear, first implement a DP that computes minimum jumps to each index, then compare the greedy layer compression.

After the mock, note whether the difficulty was proving that all indices within the frontier are reachable, not merely implementing the loop. Schedule a retry that begins with the invariant and proof before code.

## Misconceptions and edge cases

- Finishing quickly is not sufficient if the contract, proof, or tests are missing.
- Reading a solution and immediately typing it again does not test independent recall.
- A timer should create prioritization practice, not reward hiding uncertainty.
- One failed re-solve identifies a gap to address; it does not define overall ability.
- Practice should include mixed patterns, not only repeatedly rehearsed favorites.

## Knowledge checks with answers

1. **What should a mock reserve before coding?** Time to clarify, choose an approach, and validate.
2. **What is a good response to being stuck?** State the specific uncertainty, reduce the problem, create a counterexample, or return to a correct baseline.
3. **When should you inspect the reference solution after a re-solve?** After the independent attempt and its tests.
4. **What should progress tracking include besides time?** Correctness, hints, explanation clarity, re-solve success, and pattern breadth.

Sources: [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Jump Game II](https://leetcode.com/problems/jump-game-ii/).
