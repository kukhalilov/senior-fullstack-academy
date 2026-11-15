# binary search, bounds, rotated arrays, and monotone answers — Core concepts and how they fit together

## Learning objectives

- Define an invariant and interval convention before writing a binary-search loop.
- Distinguish exact search, lower bound, and upper bound.
- Search a monotone answer predicate and explain safe bounds.
- Recognize how rotated arrays and row-major matrices expose ordered halves.

## Prerequisites

You should understand sorted arrays, indices, Boolean predicates, and loop termination. A monotone Boolean sequence has one transition at most: for example, false, false, false, true, true.

## Core concepts

### Binary search is boundary search

Binary search is justified by order or monotonicity. At each check, show that one side of the midpoint cannot contain the sought result. Without this property, halving is unjustified. Comparisons must be consistent with the sought boundary: exact equality, first value `>= target`, and first value `> target` are distinct predicates.

For a half-open interval `[lo,hi)`, lower bound can maintain “every index below lo has value < target; every index at or above hi is known to be >= target or lies outside the candidates.” While `lo < hi`, choose `mid=lo+(hi-lo)/2`. If `a[mid] < target`, set lo to mid+1; otherwise set hi to mid. On termination lo=hi is the first true boundary, or n if none exists. Upper bound changes the comparison to `a[mid] <= target`. The number of target values is upperBound-lowerBound.

### Exact search and duplicates

An exact search may return any matching index. If the problem asks for the first or last match, returning immediately on equality is insufficient. Use lower/upper bounds or continue the search while retaining the best candidate. Duplicates are not a nuisance to hide; they determine which boundary question is needed.

### Interval and midpoint rules

Closed `[lo,hi]` and half-open `[lo,hi)` are both valid. Do not mix their stopping conditions and updates. In a closed exact search, while `lo <= hi`, failure on a midpoint discards it with `lo=mid+1` or `hi=mid-1`. In a lower-bound half-open search, `hi=mid` may retain mid, and the loop stops when the interval is empty.

Use `lo + (hi-lo)/2` to avoid overflow in `lo+hi` when indices or bounds can be large. For a last-true search, use an upper midpoint such as `lo+(hi-lo+1)/2` so the interval progresses when only two candidates remain. A loop invariant plus a decreasing interval length proves termination.

### Search a monotone answer space

If `feasible(x)` is false for small x and true from some minimum onward, binary search for the first true x. For a maximum feasible value, the predicate often changes true to false; search for the last true. The check may greedily simulate a candidate capacity or count required resources. Prove monotonicity: if capacity C works, any larger capacity also works. Prove bounds: the lower bound must be impossible or feasible as intended, and the upper bound must contain a feasible answer. A result may not exist; define that case before the loop.

The complexity is `O(log(range) * checkCost)`, not simply O(log range). If the check scans n items, the full algorithm is O(n log range). Avoid integer overflow in `mid`, candidate bounds, and accumulated check values; early-stop a check when its result is already known.

### Rotated arrays and matrices

A rotated strictly increasing array has two sorted portions. With distinct values, one half around the midpoint is sorted; compare the target with that half's bounds to discard the other half. Duplicates can obscure which half is strictly ordered, which is outside this lesson's closed scope.

If a matrix's rows are ordered and each next row starts after the previous row ends, the matrix is one sorted sequence in row-major order. For flattened index x with `columns` C, row is `x/C` and column is `x%C`. Search indices `[0,rows*columns)` without allocating a flattened copy. Compute the product in a sufficiently wide type when dimensions may be large.

## Mechanisms and relationships

| Question | Predicate / invariant | Typical interval | Result |
|---|---|---|---|
| Is target present? | values before/after candidate ruled out by order | closed or half-open | matching index or -1 |
| First value >= target | false before boundary, true from boundary | half-open | insertion position in `[0,n]` |
| First value > target | `<= target` is false side | half-open | upper bound |
| Minimum feasible x | feasible is monotone false→true | numeric interval | first true or explicit no-solution |
| Target in rotated sorted array | one half remains sorted | closed | match or -1 |
| Target in row-major matrix | flattening preserves sorted order | half-open | Boolean result |

## Worked examples

In `[2,4,4,4,7]`, lower bound of 4 is 1, upper bound is 4, and count is 3. If searching for insertion position of 5, lower bound returns 4: inserting there preserves sorted order.

For a monotone capacity predicate, suppose weights can ship within D days at capacity 8. Then any capacity above 8 also succeeds because it can carry every day's assigned packages. Binary search finds the smallest successful capacity only after a valid upper bound and a correct greedy check have been established.

## Misconceptions and edge cases

- A sorted array supports boundary search, but the requested boundary still determines comparison and return value.
- A loop that finds an equal item does not automatically find its first or last occurrence.
- The final insertion position may be n, one past the last element.
- Closed and half-open intervals have different empty states and update rules.
- Binary search on a predicate needs monotonicity; “the answer is numeric” is not enough.
- A correct outer search cannot repair a wrong feasibility checker.
- An empty matrix or zero columns can make flattened index conversion invalid; follow constraints or handle them before division.
- Binary search over a continuous domain needs an error tolerance/iteration bound and floating-point analysis; it is outside this topic's scope.

## Knowledge checks with answers

1. **How many copies of target are present?** `upperBound(target)-lowerBound(target)`.
2. **Why is lower bound's return allowed to equal n?** It is the insertion point after all elements when no value is large enough.
3. **Why use an upper midpoint for last-true?** It prevents a two-element interval from repeatedly choosing its lower endpoint.
4. **What determines answer-space complexity?** Number of binary-search iterations times feasibility-check cost.
5. **Why does flattening preserve matrix search order?** Row-major constraints make each row's values ordered and every row's values precede the next row's values.

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
