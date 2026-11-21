# timed mock interviews and spaced problem rehearsal — Reference: Post-session review and spaced re-solving

## Scope and version

This reference covers learning from a completed mock and planning delayed retrieval practice. It gives a flexible review protocol; no fixed interval schedule is guaranteed to work for every learner.

## How this group fits the mental model

The review captures evidence from the session and turns it into a later independent attempt, completing the overview's review and rehearse-later stages.

## Supplied names explained

## Purpose

A mock only becomes useful practice when its outcome changes the next attempt. Record observable gaps, then test retention by reconstructing the solution after a delay.

## Review protocol

Immediately after the session, record:

- **Record misunderstanding:** Which part of the contract, constraints, or requested output did you misread?
- **Record missing invariant:** What state property was absent, vague, or false?
- **Record omitted edge test:** Which boundary or branch was not exercised?
- **Classify pattern gap:** Was the issue recognition, proof, data structure, implementation, testing, or communication?
- **Maintain a mistake log:** Write the mistake, its cause, correction, and a test or question that would reveal it again. Keep the entry specific and short.

## Cross-item comparison

The initial record identifies what failed; classification helps choose a remedy; delayed re-solving checks retention; comparison after an independent attempt distinguishes a genuine gap from a valid alternate method. Interval changes follow recall evidence rather than a rigid calendar.

## Examples

After missing the invariant for a two-pointer solution, log the missing boundary argument and create a tiny counterexample. Schedule a fresh attempt without notes. If recall succeeds and the explanation is sound, extend the delay; if it fails, review the invariant and shorten the interval.

### Delayed re-solving

1. **Schedule delayed re-solve.** Choose a future session rather than rereading the answer immediately.
2. **Attempt without notes.** Reconstruct the contract, approach, invariant, implementation, and tests from memory.
3. **Compare after independent attempt.** Only then inspect notes or a reference solution; distinguish a different but valid method from a real gap.
4. **Adjust the next interval.** Increase interval after successful recall with a sound explanation; Shorten interval after failure and target the missing concept.

Retrieval practice and spacing have research support for improving later retention across studied learning tasks. One classic experiment compared repeated study with retrieval tests on prose passages; it found better delayed retention after testing despite higher confidence after repeated study. That result supports trying to reconstruct a solution before rereading it, but it does not establish a guaranteed improvement for coding interviews or identify one universally optimal retry interval. Spaced timing is a practical scheduling heuristic; adapt it to observed recall, workload, and problem importance.

### Avoid false recall

Recognizing a solution while reading is easier than deriving it. Change names or input values, explain the invariant before coding, and include a new edge case. If the solution only returns after looking at the old code, the attempt was not independent.

## Common mistakes

- Reading the solution immediately and mistaking familiarity for recall.
- Logging vague labels such as “bad at graphs” without a specific error and correction.
- Keeping a fixed schedule despite repeated failure or easy recall.
- Comparing code before attempting the problem independently.

## Knowledge checks with answers

1. **When should you compare with notes?** After an independent attempt and its tests.
2. **When should the retry interval shorten?** When recall fails or a key proof is missing.
3. **What makes a mistake-log entry actionable?** It names the observed error, likely cause, correction, and a way to detect recurrence.

## Checklist

- Is the next action concrete and tied to an observed gap?
- Was the retry independent of notes?
- Did I test the proof and edge case, not just reproduce code?
- Should the next review happen sooner or later based on actual recall?

Sources: [Roediger and Karpicke, “Test-Enhanced Learning”](https://doi.org/10.1111/j.1467-9280.2006.01693.x), [Dunlosky et al., “Improving Students’ Learning With Effective Learning Techniques”](https://doi.org/10.1177/1529100612453266), [The Science of Effective Learning With Spacing and Retrieval Practice](https://doi.org/10.1038/s44159-022-00089-1), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
