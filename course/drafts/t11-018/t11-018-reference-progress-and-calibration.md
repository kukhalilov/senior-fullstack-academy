# timed mock interviews and spaced problem rehearsal — Reference: Measure progress and calibrate difficulty

## Scope and version

This reference defines useful practice observations and how to use them to choose work. These measures are diagnostic, affected by context, and are not a validated universal readiness score.

## How this group fits the mental model

Calibration takes review evidence and selects the next session's target, difficulty, and format. It closes the practice loop while leaving room to revisit earlier concepts.

## Supplied names explained

## Purpose

Metrics help select the next practice task. They are noisy observations of performance in a context, not a score of talent or a guarantee of interview readiness.

## What to track

- **Time to correct approach:** Duration until an approach has a defensible invariant, not merely a named pattern.
- **Time to accepted implementation:** Record separately from approach time; typing speed and debugging can dominate it.
- **Hint dependence:** Note whether a prompt, partial hint, or full solution was needed.
- **Correctness across edge cases:** Record passed boundary and adversarial tests, not only the sample.
- **Explanation clarity:** Can you state contract, invariant, proof, and tradeoffs succinctly?
- **Re-solve success:** Did you reconstruct the reasoning after a delay without notes?
- **Pattern breadth:** Include which distinct families were practiced; repeated wins in one family do not show breadth.
- **Difficulty progression:** Increase one dimension at a time when possible, such as input constraints or combined patterns.
- **Distinguish speed from understanding:** A fast answer with a broken edge case or no proof is not mastery.
- **Periodic mixed-pattern session:** Mix problems after focused practice to test recognition without a topic label.

## Cross-item comparison

Approach time and implementation time isolate different bottlenecks. Hint dependence, edge correctness, and explanation clarity describe support and quality. Re-solve success and pattern breadth add retention and transfer evidence. No single metric is sufficient to represent progress.

## Examples

If approach time is short but edge correctness is weak, add boundary tests and state the invariant before coding. If the solution is correct but delayed re-solving fails, practice retrieval with a shorter interval. If focused sessions are reliable, use a mixed-pattern session to test recognition.

### Calibration loop

Choose a target based on evidence. If the approach is correct but implementation is slow, practice clean state updates and tests. If implementation is fast but the invariant is weak, return to untimed derivation. If delayed recall fails, shorten the review interval and reduce difficulty temporarily. When a pattern is reliable, mix it with a related or contrasting pattern.

Avoid interpreting one attempt in isolation. Problem difficulty, familiarity, environment, and interviewer interaction affect time. Use several sessions and retain the actual context with the metric.

## Common mistakes

- Treating a faster solve as improvement when correctness or proof quality dropped.
- Comparing time across problems of different familiarity or difficulty without context.
- Practicing only one pattern and assuming the result transfers to mixed problems.
- Treating a personal log as a measure of ability or a guarantee of interview outcome.

## Knowledge checks with answers

1. **Why record approach and implementation time separately?** They reveal different sources of delay and suggest different practice actions.
2. **What does one failed attempt imply?** It suggests a targeted next action, not a global conclusion.
3. **Why schedule mixed-pattern practice?** It tests recognition when the lesson or pattern name is not supplied.

## Minimal log

| Date/problem | Approach time | Implementation time | Hints | Edge tests | Explanation | Delayed retry |
| --- | ---: | ---: | --- | --- | --- | --- |
| Example entry | 8 min | 21 min | one nudge | 4/5 | clear invariant, weak proof | scheduled |

Use the log to decide the next practice action, not to compare yourself with someone else's timeline.

Sources: [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
