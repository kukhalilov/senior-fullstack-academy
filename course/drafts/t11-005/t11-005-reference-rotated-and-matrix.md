# binary search, bounds, rotated arrays, and monotone answers — Reference: Rotated arrays and matrix search

## Scope and version

This lesson covers the six supplied rotated-array and matrix terms. The rotated-search item assumes distinct values; duplicate ambiguity is excluded by the manifest.

## How this group fits the mental model

Rotation breaks global sorted order but preserves a sorted half around each midpoint when values are distinct. A row-major matrix with ordered rows and separated row ranges can instead be viewed as one virtual sorted sequence.

## Supplied names explained

- `Rotation pivot` — The boundary where a sorted sequence was cut and rejoined. In a rotated strictly increasing array, the minimum identifies the start of the second sorted block, or index zero when no rotation occurred.
- `Sorted half in a rotated array` — At a midpoint in a rotated array with distinct values, either `[left,mid]` or `[mid,right]` is sorted. Compare target with that half's endpoint range to decide whether it remains a candidate.
- `Distinct-value rotated search` — Binary search that relies on distinct values to identify exactly one sorted half. Duplicate values can make both ends equal and obscure which half is ordered; that variant needs different handling and is outside this scope.
- `Minimum in a rotated sorted array` — Compare mid with right. If mid is greater, minimum lies to the right of mid; otherwise mid may itself be the minimum, so keep it by setting right=mid. A half-open or closed interval must keep a valid candidate invariant.
- `Virtual one-dimensional matrix index` — Map flattened index x to row `x / columns` and column `x % columns`. This avoids copying a matrix into a 1D array.
- `Row-major sorted matrix` — Matrix rows are sorted, and the first value of each row is greater than the last value of the preceding row. These conditions make flattened order globally sorted; row sorting alone is insufficient.

## Cross-item comparison

`Rotation pivot` describes the cut; `Sorted half in a rotated array` enables local elimination; `Distinct-value rotated search` is the complete search pattern under its uniqueness assumption. `Minimum in a rotated sorted array` searches for the pivot value directly. `Virtual one-dimensional matrix index` maps coordinates, while `Row-major sorted matrix` is the ordering precondition that makes the mapping searchable.

## Examples

For `[4,5,6,7,0,1,2]`, mid may lie in the left sorted block `[4,5,6,7]`; target 1 is outside it, so search the right block. For a 3×4 matrix, flattened index 6 maps to row `6/4=1`, column `6%4=2`.

## Common mistakes

- Assuming a sorted half based on midpoint position without comparing values.
- Using distinct-value logic when duplicates are permitted.
- Dropping mid in minimum search when mid may itself be the minimum.
- Treating independently sorted rows as a globally sorted flattened sequence.
- Dividing by zero columns or overflowing `rows*columns` before searching.
- Flattening by allocation when virtual indexing is enough.

## Knowledge checks with answers

1. **Why is one half sorted in the distinct rotated case?** A single rotation splits the original increasing sequence into two ordered runs.
2. **What is row and column for flat index x?** `x/columns` and `x%columns`.
3. **What extra matrix property makes global flattening sorted?** Each row begins after the preceding row's last value.
4. **Why are duplicates excluded here?** Equal endpoint values can prevent identifying which half is ordered from comparisons alone.

Sources: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search), [LeetCode: Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/).
