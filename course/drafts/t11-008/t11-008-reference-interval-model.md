# interval representations, merging, and scheduling — Reference: Endpoint models and overlap semantics

## Scope and version

This lesson explains the ten supplied interval-model terms. Endpoint behavior follows the individual problem contract; these mathematical definitions are stable.

## How this group fits the mental model

An interval is a set of ordered coordinates. Endpoint inclusion determines whether equality at a boundary counts as a shared point. That choice controls every overlap, merge, and compatibility predicate.

## Supplied names explained

- `Closed interval` — `[a,b]` contains both endpoints. Two closed intervals intersect when `max(a,c) <= min(b,d)`.
- `Open interval` — `(a,b)` excludes both endpoints. The interval is empty if `a >= b` over a dense order.
- `Half-open interval` — `[a,b)` includes the start and excludes the end; `[a,a)` is empty. Half-open ranges compose without double-counting shared boundaries.
- `Start endpoint` — The lower coordinate in the interval ordering, subject to the domain's orientation.
- `End endpoint` — The upper coordinate, subject to the same convention.
- `Touching intervals` — Two ranges meet at a boundary but have no interior intersection. `[1,2]` and `[2,3]` share point 2; `[1,2)` and `[2,3)` do not.
- `Overlap predicate` — For closed ranges, `a <= d && c <= b`; for half-open ranges, `a < d && c < b`. Mixed inclusion requires checking whether both include the shared point.
- `Empty interval` — A range containing no coordinate. Its existence depends on endpoint convention; `[x,x]` is a singleton, while `[x,x)` is empty.
- `Sorted disjoint interval list` — Intervals appear in start order and satisfy the problem's non-overlap condition. Whether equality is allowed between end and next start depends on endpoint semantics.
- `Coordinate endpoint domain` — The ordered set from which endpoints come. Integer, real, bounded, and unbounded domains affect representation and safe arithmetic.

## Cross-item comparison

`Closed interval` and `Half-open interval` differ exactly at equality. A universal `<=`/`<` choice is unsafe until inclusion is known. Sorting order alone does not imply that intervals are disjoint.

## Examples

- Closed `[1,2]` with `[2,4]`: intersection `{2}`, so overlap.
- Half-open `[1,2)` with `[2,4)`: no shared points, so disjoint.
- Closed `[3,3]`: one point. Half-open `[3,3)`: empty.

## Common mistakes

- Calling all equal-endpoint intervals “touching but disjoint” without reading whether endpoints are included.
- Treating `[x,x]` and `[x,x)` as the same set.
- Assuming an interval list is sorted and disjoint merely because its type is an array.
- Performing endpoint addition/subtraction without checking the coordinate domain.

## Knowledge checks with answers

1. **Do closed `[2,5]` and `[5,9]` overlap?** Yes, at 5.
2. **Do half-open `[2,5)` and `[5,9)` overlap?** No.
3. **Is `[4,4]` empty?** No; it is a singleton closed interval.
4. **Why read problem examples before coding?** They establish the endpoint equality rule the scan must implement.

Source: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting).
