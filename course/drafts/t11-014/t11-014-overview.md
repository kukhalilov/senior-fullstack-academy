# greedy choices, invariants, and correctness proofs — Big-picture orientation and mental model

## Problem and purpose

Greedy algorithms construct a solution one decision at a time. At each step, they select a choice that looks best under a local rule, commit to it, and continue without revisiting earlier choices. This can be far faster than exploring every possible solution, but only when the rule is proved to preserve a globally optimal completion.

## Plain-language mental model

Imagine arranging tasks while a deadline approaches. A greedy rule says which task to place next. The central question is not whether the rule sounds sensible; it is whether a proof shows that committing to it never loses a better complete arrangement. A correct greedy algorithm needs both:

- a decision rule that can be implemented efficiently;
- a correctness argument tied to the exact constraints and objective.

Without that proof, the rule is only a heuristic.

## How the parts fit together

First define the feasible solutions and objective. Then propose a choice order: perhaps earliest finishing time, smallest requirement, greatest value, or smallest remaining item. Maintain an invariant describing what the partial solution guarantees. Finally prove that each committed choice can belong to some optimal solution, or that the greedy partial solution stays at least as good as any competitor.

Sorting or a priority queue may expose the choices efficiently, but neither data structure proves correctness. If a locally attractive choice consumes a resource needed later, the correct method may need dynamic programming, exhaustive search, or a separately proved approximation guarantee.

## Concept map

| Question | Greedy design task |
| --- | --- |
| What is optimized? | State the objective precisely |
| Which next choice is tempting? | Define and order candidate decisions |
| What must remain true? | State a feasible-solution invariant |
| Why can the choice be committed? | Prove exchange, staying ahead, or another theorem |
| What if it cannot be proved? | Search for a counterexample; compare DP or exhaustive search |
| What does implementation cost? | Include sorting, scans, heap operations, and output |

## End-to-end walkthrough

For Assign Cookies, sort children's minimum requirements and cookie sizes. Consider the least-demanding child and the smallest cookie that can satisfy that child. If the cookie is too small, it cannot satisfy any more demanding child, so discard it. For a fitting cookie, take a maximum matching. If the child already has a larger cookie and the smallest fitting cookie is assigned elsewhere, swap the two cookies: the other child accepted the smaller one, so it also accepts the larger one. If the child is unmatched and the cookie is assigned to someone else, reassign it to this child without changing the match count. These exchanges show that some maximum matching contains the greedy pair; repeat on the remainder. This proof makes the local rule trustworthy.

Contrast this with coin change for an arbitrary denomination set. Taking the largest coin first can block an exact solution: with denominations {1,3,4} and amount 6, the locally largest choice 4 leaves 2 more coins, while 3+3 uses only two coins. A greedy-looking rule must be proved for its denomination assumptions; canonical currency systems do not justify it for every set.

## When to use it and tradeoffs

Use a greedy approach when a structural proof supports the irrevocable choices and the resulting implementation improves on exhaustive alternatives. Sorting often yields O(n log n); a scan after sorting is O(n), and a heap may make repeated extract/insert choices O(log n) each. The proof can be more difficult than the code.

Greedy is risky when choices compete for scarce resources or a decision changes future options in ways that cannot be summarized by an invariant. Build tiny counterexamples and compare with an exact brute-force oracle before trusting a conjectured rule.

## What later lessons cover

The reference lessons define invariants and proof patterns, compare common decision families, and separate exact greedy proofs from heuristics and approximation guarantees. Eight C# practice lessons apply the ideas to matching, change-making, reachability, circular feasibility, partitioning, multiset grouping, capacity selection, and queue reconstruction.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf), [Assign Cookies](https://leetcode.com/problems/assign-cookies/).
