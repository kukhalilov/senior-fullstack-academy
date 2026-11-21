# binary search, bounds, rotated arrays, and monotone answers — Interview questions and reasoning

## Core questions

1. What property allows binary search to discard half of a candidate range?
2. How does exact search differ from lower bound and upper bound?
3. When should you use a half-open interval?
4. How do you find the minimum feasible capacity?
5. How does binary search work in a rotated array with distinct values?
6. How do you search a row-major matrix without flattening it?
7. What belongs in the complexity of answer-space binary search?

## Concise interview answers

1. Sorted order or a monotone predicate lets a comparison prove an entire side cannot contain the answer.
2. Exact search finds any match; lower bound finds the first value >= target; upper bound finds the first value > target.
3. A half-open `[lo,hi)` interval naturally represents empty ranges and the insertion sentinel n. Use one convention consistently.
4. Define a monotone feasibility check, prove candidate bounds, and binary-search the first feasible integer.
5. Identify the sorted half using endpoint values, then keep it only when target lies in its value range.
6. Search flat indices and map x to row `x/columns`, column `x%columns` under global row-major ordering.
7. Number of checks times cost per check; a scan-based check over n values gives O(n log range).

## Deep follow-up answers

### “Why can lower bound set hi to mid rather than mid-1?”

Because mid may itself be the first value meeting the predicate. In a half-open boundary search, the candidate interval represents possible answer positions rather than only values already tested. The invariant and termination condition reflect that distinction. Exact closed search generally discards a nonmatching midpoint with ±1.

### “How do you choose a midpoint for first-true versus last-true?”

For first true, a floor midpoint and `hi=mid` / `lo=mid+1` moves the upper candidate inward while retaining a possible true midpoint. For last true, if the update can retain mid as the lower bound, use a ceiling midpoint so a two-candidate interval progresses. Derive the midpoint from the update rule, then prove the interval width decreases.

### “How do you prove a feasibility checker?”

Separate it from the binary-search loop. Show the checker returns true exactly when the candidate satisfies the resource/deadline rules. For shipping, greedy loading in input order takes the longest prefix that fits each day; ending earlier cannot reduce the required number of days. Then show monotonicity: a larger capacity cannot make a prior feasible schedule infeasible.

### “Why does rotated-array search need distinct values?”

With distinct endpoints, comparing `nums[left]` and `nums[mid]` identifies one ordered half. Duplicates can make these equal even when the midpoint region crosses the rotation drop, so the comparison may not reveal which half is sorted. A duplicate-aware algorithm may shrink a boundary but can degrade to O(n).

### “Does O(log n) guarantee the algorithm is faster?”

No. The data structure must provide efficient random access, and preprocessing can dominate for one query. A scan is often simpler for small input; binary search is attractive for many queries on already sorted random-access data or for a large monotone answer range.

## Scenario questions

### Return the first and last index of a duplicate target

Use lower bound for the first value >= target and upper bound for first value > target. Check the lower-bound value for equality before indexing the upper boundary. Return upperBound-1 as the last index.

### Find the smallest eating speed that finishes by a deadline

The check sums `ceil(pile/speed)` hours. This total is nonincreasing as speed grows, so feasible speeds form a suffix. Bounds are 1 and max pile when the available hours are at least the number of piles. Use integer ceiling division and a wide total.

### Search a rotated array

Check mid first. If the left endpoint through mid is ordered, test whether target lies in its half-open value range; otherwise the right side is ordered. State the distinct-value premise. Alternatively find the pivot and search one of two sorted ranges.

### Search a matrix

Before flattening, verify both row ordering and cross-row separation. If rows are merely individually sorted, binary-searching each row may be correct with O(m log n), while a single virtual-array search would be invalid.

## Tradeoffs and alternatives

- Lower/upper bounds encode duplicate behavior and insertion positions more directly than stopping on equality.
- A closed exact-search interval is direct for membership; half-open intervals simplify boundaries and sentinels.
- Binary search on an answer is useful when a correct monotone feasibility test exists; without one, numeric output alone does not justify the pattern.
- A linear scan can be the right choice for small data, unsorted data, or one-off queries.
- For updates, choose a dynamic ordered/range structure instead of expecting a static array search to remain current.

## Common weak answers

- “Binary search because the problem is sorted,” without stating the target predicate or boundary.
- Mixing `left < right` with closed-interval updates or `left <= right` with half-open bounds.
- Claiming lower bound found the target without checking equality.
- Using the classic rotated-array branch with duplicates despite ambiguous endpoints.
- Giving only O(log range) for an answer search whose check scans the input.
- Choosing arbitrary search bounds or an unproven feasible endpoint.
- Ignoring midpoint, sum, or flattened-index overflow.

## Self-check rubric

- Can you state the monotone predicate or sorted-order property?
- Can you write the interval invariant and empty condition?
- Does each update strictly reduce the candidate interval?
- Are lower/upper bounds and sentinels handled without invalid indexing?
- Is the answer range proven feasible/impossible at its endpoints?
- Is the feasibility checker correct and is its cost included?
- Do duplicate and rotation assumptions match the problem statement?
- Are arithmetic and flattened matrix boundaries safe?

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
