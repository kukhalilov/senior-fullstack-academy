# sequence and string dynamic programming — Interview questions and reasoning

## Core questions

These questions follow the state-design approach in the [USACO Guide DP introduction](https://usaco.guide/gold/intro-dp).

1. How do you define a sequence-DP state precisely?
2. How does a substring recurrence differ from a subsequence recurrence?
3. Why does LCS compare two skips on a mismatch?
4. What does the LIS tails array represent?
5. When are rolling rows safe?
6. What does `*` mean in the restricted regex matcher?

## Concise interview answers

1. State what the value means, including prefix lengths or inclusive endpoints, then derive boundaries and transitions from the final choice.
2. Subsequence may skip positions; substring must be contiguous and a mismatch ends a matching run.
3. The unequal final characters cannot be paired; any common subsequence omits at least one, so both skip choices cover the optimum.
4. The smallest achievable ending value for each subsequence length; its length gives the LIS length, but its values need not form an LIS.
5. When every new row depends only on retained previous-row/current-row values and update order preserves dependencies. Reconstruction may need extra choices.
6. It repeats its preceding atom zero or more times; it is not an arbitrary-sequence wildcard.

## Deep follow-up answers

**Why does strict LIS use lower bound?** A new `x` may extend only tails `< x`. Replacing the first tail `>= x` keeps the smallest possible ending value without extending equal values. A non-decreasing variant uses a different boundary.

**Why is longest common substring not LCS?** LCS can skip and retain an earlier optimum. A common substring state is only the matching suffix ending at the current pair; mismatch resets it. Track the maximum globally because the best run can end anywhere.

**Can rolling rows reconstruct an LCS?** Not by themselves, because they discard history. Store directions, recompute, or use a divide-and-conquer method such as Hirschberg's algorithm, with different memory/time tradeoffs.

**How would you validate a recurrence?** Enumerate all subsequences or substrings for tiny inputs, compare a separate brute-force result against DP, then retain focused cases for boundaries, ties, and semantic differences.

## Scenario questions

1. A solution uses `<=` in strict LIS. Test duplicate-only input and repair the invariant.
2. A solution returns the bottom-right longest-common-substring cell. Find a case whose best run ends early and add a global maximum.
3. A regex solution treats star as any sequence. Ask what `a*` matches and compare wildcard grammar.
4. A deletion-cost solution charges one per deletion. Ask whether the objective counts operations or character values.

## Tradeoffs and alternatives

Full tables aid inspection and backtracking but use quadratic memory. Rolling rows suit value-only results with adjacent-row dependencies. LIS tails improves time to `O(n log n)` but requires understanding a summary invariant and predecessor metadata for reconstruction. Center expansion counts palindrome occurrences in `O(n²)` time and constant extra space; interval DP stores richer range information. Hash-set Word Break is simple with short words; tries can share scanning work when dictionary constraints make that worthwhile.

## Common weak answers

- “Use a 2D array” without defining a cell.
- Calling any ordered selection a substring.
- Claiming the tails array itself is an LIS.
- Compressing memory without explaining live dependencies.
- Describing regex star as arbitrary wildcard text.
- Omitting copying or reconstruction costs from complexity.

## Self-check rubric

Score each from 0 (missing) to 2 (clear and correct): state meaning, base cases, transition proof, evaluation order, complexity, reconstruction needs, edge cases. A strong answer scores at least 11/14 and explains why a similar-looking recurrence does not fit.
