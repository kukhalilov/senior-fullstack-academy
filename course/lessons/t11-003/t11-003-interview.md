# two-pointer and sliding-window techniques — Interview questions and reasoning

## Core questions

1. What invariant does a two-pointer algorithm maintain?
2. How do you justify advancing one of two pointers?
3. When does a sliding-window scan run in linear time?
4. What is the difference between a fixed-size and variable-size window?
5. Why can negative numbers invalidate a shortest-subarray sum window?
6. How do you track duplicate characters in a window?

## Concise interview answers

1. An invariant states what the current pointer range represents and what answers remain possible. I state it before coding and check initialization, each update, and termination.
2. I show that every candidate using the discarded endpoint is impossible or cannot improve the best answer, based on a property such as sorted order, symmetry, or an area upper bound.
3. Each boundary moves only forward or inward O(n) times, and each update to the maintained state has bounded cost. A nested loop can still be linear when all its iterations collectively advance a pointer at most n times.
4. A fixed-size window's width is prescribed and shifts by removing one item and adding one. A variable window changes width to maintain a predicate or optimize an objective.
5. With nonnegative values, expansion cannot lower a sum and removing a left value cannot increase it. Negative values break both monotonic facts, so the greedy boundary movement may skip a valid optimum.
6. Maintain multiplicities with a map or an alphabet-indexed array. Update counts on entry and exit; track distinctness through zero-to-one and one-to-zero transitions, or use last-seen indices with a nondecreasing left boundary.

## Deep follow-up answers

### “Why not just move whichever pointer seems useful?”

Because an unproved move can discard the optimum. In sorted pair sum, if the sum is too small, the current low value plus any remaining value is still too small; the low endpoint is impossible. In Container With Most Water, the shorter side caps the current area, and any narrower pair that retains it cannot do better. The proofs depend on different properties, so I explain the specific bound rather than reciting a generic rule.

### “Why is the shortest sum window linear despite a while loop inside a for loop?”

The right boundary advances n times. The left boundary never decreases and advances at most n times total. Therefore the inner loop contributes at most n iterations across the entire algorithm, not n for each right endpoint. This amortized argument assumes constant-time state updates.

### “Can sliding windows work with negative values?”

Yes, if the maintained predicate has a separate monotonicity proof. The common shortest contiguous subarray with sum at least target scan specifically relies on nonnegative values. For signed sums, prefix sums and a monotonic deque solve one common variant; prefix-sum frequency maps solve certain counting variants. I first identify whether the task asks for a longest range, shortest range, or count because those variants have different invariants.

### “When do you sort before using pointers?”

When sorted order creates a usable elimination rule and reordering is compatible with the output contract. Sorting adds O(n log n); sorting a copy adds O(n) storage. If answers refer to original positions, carry indices. Duplicate skipping depends on whether answers are value-combinations or position-combinations.

## Scenario questions

### A sorted array asks for a pair summing to a target

Use opposite pointers. Compare the sum: too small advances left; too large retreats right. Preserve distinct indices and explain why order bounds every candidate involving the discarded endpoint. If the input were unsorted, a hash map may be preferable unless sorting and index preservation are acceptable.

### Find the longest substring with no repeated characters

Use a variable window and frequency state or last-seen indices. If using last-seen indices, set `left = max(left, previous + 1)` so a duplicate outside the active range cannot move left backward. Measure only valid windows.

### Count subarrays with exactly K distinct values

When the predicate supports the standard monotone window, compute `atMost(K) - atMost(K-1)`. For each right endpoint, add `right-left+1` after shrinking to at most K. Use a sufficiently wide result type because the number of subarrays is quadratic in n.

## Tradeoffs and alternatives

- Two pointers can reduce repeated search, but only with a structural movement proof.
- Windows exploit contiguity and incremental state; they cannot represent arbitrary subsequences.
- Prefix sums answer range-sum queries and handle some signed-input variants; they may need a map, binary search, or deque depending on the objective.
- Sorting can expose order but changes positions and incurs preprocessing cost.
- A brute-force O(n²) or O(n³) implementation can be valuable as a small-input oracle for randomized verification, even when it is too slow for production constraints.

## Common weak answers

- “Use sliding window because it is a subarray problem,” without proving the validity predicate can be repaired monotonically.
- “Move the smaller pointer,” without defining smaller by the relevant objective or proving why that move is safe.
- “It is O(n) because there is one loop,” while repeatedly scanning the current range.
- “Use a set for duplicates,” when required multiplicities matter.
- “Negative numbers are not allowed in sliding windows,” which overgeneralizes a specific sum-threshold limitation.
- Reporting O(1) space while omitting a sorted copy, map, or returned output.

## Self-check rubric

For a complete interview answer, can you:

- State the exact input property the proof uses?
- Define the candidate range and invariant before coding?
- Justify each pointer move and prove no answer is skipped?
- Explain how duplicate values and boundaries are handled?
- Derive time and auxiliary-space costs, including sorting and output?
- Name a nearby case where the pattern fails and select a suitable alternative?

Sources: [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
