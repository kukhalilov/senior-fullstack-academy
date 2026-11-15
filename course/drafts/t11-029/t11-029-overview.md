# knapsack, subset-sum, and resource-allocation DP — Big-picture orientation and mental model

## Problem and purpose

Knapsack-style dynamic programming answers how to choose items under one or more resource limits. Each item decision changes what future choices remain, so the state records the current capacity or target and whether items can be reused. Small loop-order differences encode major semantic differences: selecting each item once, reusing an item indefinitely, counting unordered combinations, or counting ordered sequences.

## Plain-language mental model

Imagine walking through items while keeping a chart of what can be achieved with the resources seen so far. For each item, either skip it or use it if it fits. A row of the chart summarizes the previous items. Compressing the chart to one array saves memory, but the direction you scan that array determines whether the current item can accidentally be selected again.

## How the parts fit together

| Problem question | State/transition idea |
| --- | --- |
| Can a subset reach a sum? | Boolean reachable-sum state |
| How many subsets reach it? | Count state; zeros double choices |
| Maximize value under one capacity | 0/1 or unbounded knapsack recurrence |
| Make equal halves? | Check even total, then reach half the sum |
| Count signed expressions? | Convert signs to a subset-count target |
| Count coin combinations? | Coin outer, amount ascending |
| Count ordered sequences? | Target outer, try every final value |
| Limit two resources? | Two capacity dimensions, both descending for 0/1 use |

## Concept map

The item-prefix dimension expresses which items have been considered. A capacity dimension expresses remaining or used resource. A 0/1 transition takes from the previous item row and scans compressed capacity downward. An unbounded transition may take from the current row and scans upward. Boolean decision, counting, maximization, and minimization use different values and base states even when they share a capacity grid. The numeric capacity makes the common `O(nW)` algorithm pseudo-polynomial.

## End-to-end walkthrough

For subset sum `[3,4,5]` and target 7, begin with `reachable[0]=true`. Process 3 downward: sums 3 become reachable. Process 4 downward: sums 4 and 7 become reachable. Process 5 downward: other sums may become reachable, but 7 remains true. Descending iteration ensures the 5, 4, or 3 currently being processed is used at most once. If the capacity loop ran upward for 0/1 items, a newly reached sum could be reused during the same item iteration.

## When to use it and tradeoffs

Use this family when a manageable integer capacity, target, budget, or resource count is part of the state and item choices have a clean recurrence. Check actual numeric bounds before choosing `O(nW)`; W is a value, not its bit length. Large W may call for meet-in-the-middle, sparse-state methods, or a different formulation. Reconstructing selected indices requires predecessor choices or a carefully justified second pass; one compressed value array alone usually does not identify which items were selected.

## What later lessons cover

The concepts lesson derives state and loop order from item reuse and objective. Reference lessons cover recurrence families, storage updates, subset/partition/counting reductions, complexity, and reconstruction. The practice set includes equal partition, sign assignment counts, coin combinations, stone partition difference, two-budget binary strings, and ordered target sequences. The interview lesson highlights loop-direction traps and pseudo-polynomial limits.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf).
