# timed mock interviews and spaced problem rehearsal — Reference: A complete timed interview session

## Scope and version

This reference covers the session sequence for algorithm interview practice. The sequence is a flexible rehearsal framework, not an industry-wide prescribed timing standard.

## How this group fits the mental model

It operationalizes the overview's prepare, understand, plan, implement, validate, review, and rehearse-later cycle. The steps below turn those stages into actions and evidence.

## Supplied names explained

## Purpose

Use this checklist to rehearse the entire problem-solving cycle under a chosen time budget. The goal is a defensible solution with evidence of understanding, not maximal typing speed.

## Session sequence

1. **Read and restate problem.** State input, output, objective, and side effects in your own words. Do not silently assume what the statement does not say.
2. **Clarify constraints.** Check input size, value ranges, duplicates, ordering, mutation, reachability, and numeric bounds. Ask only questions whose answers can change the algorithm or contract.
3. **Propose baseline.** Give a direct correct method, even if too slow. It anchors correctness and makes the cost of repeated work visible.
4. **Compare candidate approaches.** Estimate time and auxiliary space against the bounds. Explain why an optimization is needed and what it costs.
5. **Select data structure.** Name the operations needed and why the chosen structure supports them. Include ordering, deletion, lookup, and tie behavior where relevant.
6. **State invariant.** Describe exactly what the maintained variables or structures mean before and after each iteration.
7. **Implement in small steps.** Keep code aligned with the invariant; explain meaningful decisions instead of reading each line aloud.
8. **Dry run an example.** Track the state that drives the algorithm, including a boundary transition.
9. **Test boundary cases.** Cover smallest inputs, repeated or extreme values, and cases that exercise branches.
10. **Analyze time and space.** Count dominant operations and auxiliary storage; distinguish expected hash costs from worst-case guarantees.
11. **Communicate tradeoffs.** State assumptions, alternatives, and what the selected solution gives up.
12. **Reserve time for review.** Do not let implementation consume the entire mock. Adapt the allocation to the interview length and task.

## Cross-item comparison

The supplied steps form a dependency chain: clarification informs the baseline; comparison informs data-structure choice; the invariant guides implementation; dry runs and tests check it; analysis and tradeoffs explain suitability. No step substitutes for the others.

## Examples

### A 45-minute allocation

One reasonable starting point is 5 minutes for understanding, 5 for approach selection, 25 for implementation, 7 for validation and complexity, and 3 for recap. These are adjustable allocations, not universal rules. If the problem is unfamiliar, take more derivation time; if the code is short, spend more time testing the proof boundaries.

### Recovery when time runs short

State what remains uncertain. If optimization stalls, present the correct baseline and its cost. If implementation is incomplete, identify the invariant and the next step precisely. Never imply code was tested when it was only reasoned about.

## Common mistakes

- Spending the entire session coding and leaving no time for tests or explanation.
- Choosing an optimization before establishing the problem contract.
- Stating complexity without counting the operations in the implementation.
- Calling an unexecuted test successful.

## Knowledge checks with answers

1. **Why propose a baseline?** It clarifies correctness and gives a reference for judging whether an optimization is necessary.
2. **Why state an invariant before coding?** It gives each update a correctness condition that can be checked in the implementation.
3. **What should remain reserved in a timed mock?** Time to validate behavior, analyze cost, and summarize tradeoffs.

## Checklist

- Did I reserve time for testing and explanation?
- Can I state the contract and invariant without referring to code syntax?
- Is every claimed complexity bound supported by the operations used?
- What one mistake should the next session target?

Sources: [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
