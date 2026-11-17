# timed mock interviews and spaced problem rehearsal — Big-picture orientation and mental model

## Problem and purpose

Algorithm fluency includes more than recognizing a pattern. Interviews require turning an unfamiliar prompt into a contract, communicating a sound approach, implementing under time pressure, validating it, and explaining its costs. Delayed re-solving tests whether the method can be reconstructed later without notes.

## Plain-language mental model

Treat each mock as a complete rehearsal, not a race to type code. Spend time understanding and planning, explain meaningful decisions, implement a small correct version, then reserve time to test and analyze it. Afterward, record one or two concrete gaps and schedule an independent retry.

## How the parts fit together

Before the session, select a problem that practices a known or emerging pattern and set a time budget. During the session, clarify the contract, compare a baseline with alternatives, state an invariant, code, dry-run, test boundaries, and analyze complexity. If stuck, say what is uncertain, reduce the task, or return to a correct baseline. After the session, classify mistakes and schedule a delayed re-solve. Track speed alongside correctness, explanation, hints, and pattern breadth.

## Concept map

| Stage | Action | Evidence |
| --- | --- | --- |
| Prepare | Choose one target skill and a time limit | Focused session goal |
| Understand | Restate and clarify | Precise contract |
| Plan | Compare baseline and candidate | Complexity-aware choice |
| Implement | Narrate state and invariants | Small correct steps |
| Validate | Dry-run and test boundaries | Verified behavior |
| Review | Record mistake and correction | One concrete next action |
| Rehearse later | Solve from memory after a delay | Retained reasoning, not copied code |

## End-to-end walkthrough

In a 45-minute mock, reserve about five minutes for contract and constraints, five for examples and approach comparison, twenty-five for implementation, seven for tests and complexity, and three for recap. If the code is incomplete at minute thirty, state the remaining invariant or produce a correct baseline rather than silently rushing. Afterward, record whether the gap was interpretation, pattern selection, coding, testing, or explanation. Retry without notes after a delay; compare against the solution only after the independent attempt.

## When to use it and tradeoffs

Timed sessions help practice prioritization and explanation, but speed alone is a poor measure of readiness. Untimed study is better for learning a new pattern; timed mocks are useful after a basic understanding exists. Increase difficulty gradually and use mixed-pattern sessions periodically to test recognition rather than memorization.

## What later lessons cover

References define the session sequence, communication and recovery moves, spaced review, and progress calibration. Eight advanced and intermediate problems provide mock prompts whose canonical algorithm lessons live in their own topics.

Sources: [Roediger and Karpicke, “Test-Enhanced Learning”](https://doi.org/10.1111/j.1467-9280.2006.01693.x), [The Science of Effective Learning With Spacing and Retrieval Practice](https://doi.org/10.1038/s44159-022-00089-1), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/), [LRU Cache](https://leetcode.com/problems/lru-cache/).
