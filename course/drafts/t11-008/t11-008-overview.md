# interval representations, merging, and scheduling — Big-picture orientation and mental model

## Problem and purpose

- Recognize what endpoint conventions mean before deciding whether two intervals overlap.
- Choose between merging, inserting, selecting, and counting by the problem's objective.
- Understand why sorting creates a one-pass solution and which tie-breaks are essential.

## Plain-language mental model

An interval represents a continuous range on an ordered line. The two endpoints do not determine the range by themselves: the convention matters. A closed interval `[a,b]` includes both endpoints; an open interval `(a,b)` excludes both; a half-open interval such as `[a,b)` includes one. As a result, `[1,2]` and `[2,3]` overlap at 2, while the corresponding half-open intervals do not.

Most interview interval problems begin with arbitrary ranges and ask one of four different questions:

1. **Combine coverage:** sort by start and merge ranges that overlap.
2. **Insert one range into a sorted disjoint set:** emit what is before it, merge the overlap run, then emit what is after.
3. **Keep as many mutually compatible ranges as possible:** sort by finish and greedily accept the earliest-finishing compatible interval.
4. **Compare two already ordered interval streams:** use two pointers and advance the one that ends first.

The same word “interval” does not imply the same overlap rule. Merge Intervals and Insert Interval treat closed intervals touching at one endpoint as overlapping; Non-overlapping Intervals treats touching intervals as compatible; Remove Covered Intervals uses half-open notation but coverage is determined by endpoint containment. Read the statement and examples before selecting a predicate.

## How the parts fit together

Sort first to make one endpoint monotonic. Then maintain only the summary needed for future decisions: the current merged right edge, the last accepted finish time, or the active intersection. Sorting costs O(n log n); the scan is O(n). When input already has sorted and disjoint structure, a two-pointer or insertion scan can be linear.

## Concept map

| Objective | Useful order | Scan state |
| --- | --- | --- |
| Merge all overlapping coverage | Start ascending | Current merged interval |
| Insert into sorted disjoint list | Existing start order | New interval's evolving bounds |
| Maximize compatible count | End ascending | Finish of last accepted interval |
| Minimize removals for equal-cost intervals | End ascending | Accepted compatible count |
| Minimum arrows through closed balloons | End ascending | Right edge of current common intersection |
| Intersect two sorted disjoint lists | Two pointers | Pairwise max start and min end |
| Remove covered ranges | Start ascending, end descending on ties | Farthest end seen |

## End-to-end walkthrough

For `[1,3],[2,6],[8,10]`, first clarify that these are closed ranges and touching counts as overlap. Sort by start. Start with `[1,3]`; `[2,6]` overlaps, so extend the current end to 6. `[8,10]` starts beyond 6, so emit `[1,6]` and begin a second merged range. This one walk illustrates how semantics, ordering, state, and output fit together.

## When to use it and tradeoffs

Sort-and-scan is useful when intervals are static and one-dimensional. The sort costs O(n log n), and the ordered scan is easy to verify. If data changes online, repeatedly sorting may be inefficient; a dynamic interval structure is outside this unit. For already sorted inputs, exploit that precondition for a linear scan.

## What later lessons cover

Event sweeps that maintain active sets, weighted interval scheduling, computational geometry, timezone calendars, and priority queues are separate topics. Sorting endpoints and scanning intervals is not the same as a general sweep-line algorithm.

## Learning path

Start with endpoint semantics and the general sorting-and-scan model. Read the four references to distinguish merging/inserting, scheduling/removal, and complexity hazards. Then solve each problem independently and finish by defending its overlap predicate and greedy or pointer invariant.

Sources: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting), [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf).
