# two-pointer and sliding-window techniques — Big-picture orientation and mental model

## Problem and purpose

Many array and string tasks ask about pairs of positions or contiguous ranges. A direct search may revisit the same candidates many times. Two pointers replace repeated search with coordinated movement; a sliding window maintains the useful information for one contiguous range while its boundaries move.

These are patterns, not magic templates. Their linear time comes from a proof that each pointer only moves forward (or inward) and that every discarded candidate is impossible. Without that proof, moving a pointer can skip the answer.

## Plain-language mental model

Imagine two bookmarks in a book. Sometimes one bookmark starts at each end: if the sequence is sorted, the current pair tells you which bookmark can safely move. Sometimes both bookmarks move forward: one marks the earliest still-useful position, while the other discovers new input. The interval between them is a window.

For sorted values `[1, 3, 6, 8]`, a target sum of `9` begins with endpoints 1 and 8. Their sum is 9, so the pair is found. If the sum were 7, the largest possible partner for 1 is 8 and the sum would be 9; moving the right bookmark left would only make the sum smaller. Instead, the left value is the one that must be discarded. Such reasoning—not the diagram—makes the algorithm correct.

For a window, think of a basket containing the values between two bookmarks. When the right boundary adds a value, update the basket's summary. When the left boundary removes one, undo that value's contribution. The summary could be a sum, a count, or a frequency table.

## How the parts fit together

- **Opposite-direction pointers** explore pairs in sorted data or exploit symmetry. A comparison proves which endpoint is no longer useful.
- **Same-direction pointers** process a sequence once. A read pointer discovers values and a write pointer records the compacted result.
- **Sliding windows** are same-direction pointers with a contiguous interval and maintained state. They are useful when a range condition can be repaired by moving one boundary.
- **Window state** is the smallest summary needed to decide whether the current range is valid. Keeping too much state causes bugs; keeping too little can make updates expensive.
- **Frequency state** supports uniqueness and multiplicity conditions, especially for substrings.
- **Sorting** may create the order needed by a pair scan, but sorting costs time, changes order, and can require storage.

The standard linear scan is justified when pointer movement is monotone: no pointer retreats, each input position enters and leaves only a bounded number of times, and the invariant remains true after each update.

## Concept map

```text
Two pointers
├─ opposite directions: sorted pair search, symmetric comparison
├─ same direction: read/write compaction, merging
└─ contiguous range → sliding window
   ├─ fixed size: add entering, remove leaving
   └─ variable size: expand until useful, contract while valid
      ├─ sum or other scalar state
      └─ frequency counts and distinct/multiplicity state
```

One key boundary is input assumptions. Variable-size windows for “sum at least target, minimum length” depend on nonnegative values: extending cannot reduce the sum, and removing from the left cannot increase it. Negative values break that monotonicity; prefix sums plus a different data structure may be needed. In contrast, the longest substring with no repeated character uses a frequency invariant and does not rely on numeric signs.

## End-to-end walkthrough

Find the shortest nonempty subarray with sum at least 7 in `[2, 3, 1, 2, 4, 3]`. All values are positive.

1. Start with an empty window and `left = 0`. Extend `right` and add each value: sums become 2, 5, 6, then 8.
2. At `[2,3,1,2]`, sum 8 meets the target, so record length 4. Remove the left value 2; the sum becomes 6 and the window is no longer valid.
3. Extend with 4, giving window `[3,1,2,4]`, sum 10, length 4. Record it, remove 3; sum 7, length 3, still valid. Record length 3, remove 1; sum 6, invalid.
4. Extend with 3: `[2,4,3]` sums to 9, length 3. Remove 2; `[4,3]` sums to 7, length 2. Record 2, then removing 4 makes the window invalid.
5. The scan ends; the shortest valid length was 2.

Each element is added once and removed at most once, so the scan is O(n) time and O(1) extra space. The proof relies on positivity. With negative values, removing a negative could increase the sum, and extending could decrease it.

## When to use it and tradeoffs

Use pointers when the problem offers a structural reason to discard candidates or process positions monotonically. Use a sliding window for contiguous ranges whose validity can be updated incrementally and repaired by moving a boundary. For fixed-size ranges, each step can remove one departing item and add one arriving item.

Prefer another technique when the range need not be contiguous, when pointer movement cannot be justified, when negative values invalidate monotonicity, or when arbitrary queries need to be answered repeatedly. Prefix sums, binary search, dynamic programming, or a monotonic deque may then fit better.

Sorting is often a useful preprocessing tradeoff: it can make two-pointer elimination possible, but destroys original position order unless indices are carried along. An in-place scan saves allocation but mutates its input and requires a carefully defined prefix invariant.

## What later lessons cover

The concepts lesson develops pointer and window invariants. The reference lessons classify pointer arrangements, window shapes, window state, and failure modes. Separate practice lessons solve each named problem, including Valid Palindrome, 3Sum, Container With Most Water, Longest Substring Without Repeating Characters, Minimum Size Subarray Sum, and Minimum Window Substring. The interview lesson focuses on explaining proofs, complexity, and when these patterns do not apply.

Sources: [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
