# backtracking, subsets, permutations, and combinations — Big-picture orientation and mental model

## Problem and purpose

Backtracking explores a decision tree to construct valid candidates. It is useful when the task asks to enumerate combinations, permutations, partitions, or other solutions rather than compute only an aggregate.

## Plain-language mental model

Build one partial answer, choose a next option, recurse, then undo that choice so the next branch starts from the same state. The invariant is that the mutable path contains exactly the choices on the current branch.

## How the parts fit together

Subsets make a choose-or-skip decision per input position. Combinations select candidates in nondecreasing index order, avoiding different orderings of the same set. Permutations select any unused position at each depth, so order matters. When values repeat, sorting groups equals and a same-depth skip avoids duplicate branches while still allowing duplicates in a result where multiplicity is valid.

The search tree can be exponential or factorial because output size itself may be large. Analyze the number of states, the work per state, and the total output size. Pruning is valid only when the partial state provably cannot lead to a solution.

## Concept map

| Goal | Search rule | Duplicate control |
| --- | --- | --- |
| All subsets of unique values | Choose or skip each position | None needed |
| Unique subsets with duplicate values | Sort, branch by position | Skip equal values at same depth |
| All permutations of distinct values | Choose unused index | Boolean used array |
| Unique permutations with repeats | Sort, choose unused index | Skip equal predecessor unless predecessor is already used |
| Combination with unlimited candidate reuse | Recurse at same candidate index | Start index prevents reordering |
| Combination with single-use candidates | Recurse at next index | Sorted same-depth skip and remaining-sum prune |
| Phone letter products | Choose one letter for each digit | Digit index sets depth |
| Palindrome partitions | Choose next substring boundary | Reject non-palindromic cuts |

## End-to-end walkthrough

For [1,2,2] in Subsets II, sort first. At a recursion depth, choose 1; then the first 2 branch can choose or skip the next 2. When considering the second 2 as the first choice at that same depth, skip it because the earlier equal value already represents that branch. This emits [1,2] once, while still allowing [1,2,2] by selecting both positions.

## When to use it and tradeoffs

Use backtracking when output candidates must be constructed or constraints can soundly prune partial choices. Use dynamic programming when many branches reach equivalent states and only an aggregate or optimum is required. Backtracking may still have exponential worst-case time; pruning improves instances but not automatically the bound.

## What later lessons cover

References establish decision-tree state, choose/skip generation, permutation duplicates, sound pruning, and output-sensitive analysis. Eight practice problems implement these patterns as independent C# solutions.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
