# monotonic stacks and monotonic queues — Reference: Nearest boundaries and range aggregation

## Scope and version

This reference connects nearest-smaller boundaries to histogram area and per-subarray minimum contributions, emphasizing duplicate ownership.

## How this group fits the mental model

Each candidate value defines a maximal span before a smaller boundary blocks expansion. Once both boundaries are known, the number of ranges for which the candidate is the minimum can be counted combinatorially.

## Supplied names explained

- **Nearest smaller element on each side:** closest index to the left and right with value smaller than the current value; strictness may differ by side.
- **Largest rectangle in a histogram:** for each bar height h, find the widest contiguous span where every bar is at least h, then consider `h * width`.
- **Subarray minimum contribution counting:** assign each subarray to one chosen minimum occurrence, then sum value times the number of assigned ranges.
- **Left and right span lengths:** if boundaries are `left` and `right` around index i, spans are `i-left` and `right-i`.
- **Equal-value ownership by asymmetric comparisons:** choose strictness so one side excludes equal values and the other permits them; this assigns every range with tied minima exactly once.
- **Sentinel boundary technique:** use conceptual boundaries outside the array, such as -1 and n, to simplify width formulas. A virtual flush item must not be mistaken for real data.
- **Off-by-one boundary verification:** derive inclusive/exclusive endpoints with a tiny array and verify width equals `right-left-1` for bars or span product for subarrays.

## Cross-item comparison

Histogram area uses a bar's height and the width of a maximal interval where it remains the minimum. Subarray-minimum aggregation uses the number of intervals assigned to an occurrence: `(i-left) * (right-i)`. The formulas look related but their boundary definitions and equality rules must be written separately.

## Examples

For histogram `[2,1,5,6,2,3]`, bar height 5 at index 2 is blocked by a smaller value at index 4; its exclusive boundaries yield width `4-1-1=2`, area 10. For subarray minima `[3,1,2]`, choose a consistent tie policy (there are no equal minima here): index 1 with value 1 owns the four subarrays containing it, while 3 and 2 own their singletons; total minima sum is 3+1+2+1+1+1=9.

## Common mistakes

- Mixing inclusive and exclusive boundary indices.
- Counting equal-minimum subarrays more than once or not at all.
- Multiplying spans in `int` before widening; use `long` for products and totals.
- Choosing a sentinel value that is also valid input without a separate virtual-index check.
- Assuming the nearest strictly smaller boundary is the correct equality convention on both sides.

## Knowledge checks with answers

1. **What is the histogram width between exclusive smaller boundaries?** `right - left - 1`.
2. **How many subarrays can be assigned to index i?** `(i-leftSpanBoundary) * (rightSpanBoundary-i)` under the selected ownership convention.
3. **Why asymmetry for duplicate minima?** Equal values would otherwise claim the same subarray on both sides or leave it unclaimed.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks), [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/), [Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/).
