# sweep-line events and active intervals — Reference: Coordinate compression and geometric extension

## Scope and version

This reference introduces compressed coordinates, difference events, and the active coverage state used in geometric sweeps.

## How this group fits the mental model

Compression lets an active structure index only critical coordinates. Geometric extensions change what the active state summarizes, so the invariant must be rederived for lengths, coverage, or maximum height.

## Supplied names explained

- **Coordinate compression:** replace each distinct input coordinate by its sorted rank.
- **Rank-preserving coordinate mapping:** equal coordinates map to one rank and smaller coordinates keep smaller ranks; gaps are not preserved.
- **Difference-array event accumulation:** store a signed change at a coordinate and prefix-sum to recover active counts on following segments.
- **One-dimensional sweep:** scan sorted event coordinates while maintaining an interval count or another summary.
- **Rectangle edge events:** add a rectangle at its left x-edge and remove it at its right x-edge for a vertical sweep of `[left,right)` rectangles.
- **Active coverage structure:** a data structure describing covered y-ranges, heights, or another geometric query among currently active shapes.
- **Segment tree over compressed coordinates:** tree whose leaves represent compressed elementary spans and whose nodes maintain a summary such as covered length; the summary and lazy state must match the query.

## Cross-item comparison

Compression plus a difference array is suitable for pointwise counts when all event coordinates are known and array size is acceptable. A segment tree supports updates and aggregate queries over compressed ranges. A heap or ordered multiset tracks active heights for skyline, but cannot directly provide union length over y-ranges.

## Examples

Suppose interval endpoints are 10, 1,000,000, and 1,000,010. Compression maps them to ranks 0,1,2, which preserves order. The distance between rank 0 and 1 is not one unit of original length; an area calculation must retain the actual coordinates or associated gap widths.

For rectangles `[x1,x2) x [y1,y2)`, at x1 add the y interval and at x2 remove it. Between consecutive x events, active coverage is constant, so area adds `coveredYLength * (nextX-currentX)`.

## Common mistakes

- Using compressed rank difference as geometric length.
- Treating `[left,right)` as active at its right edge.
- Maintaining only an active object count when the query needs covered length or maximum height.
- Building a tree over every raw coordinate when values are sparse and large.
- Updating segment-tree cover counts without defining how child coverage combines.

## Knowledge checks with answers

1. **Does coordinate compression preserve distances?** No, it preserves order/equality only.
2. **What is multiplied by sweep width for rectangle union area?** The active covered y-length.
3. **Which active structure fits skyline maximum height?** A height multiset or heap with valid lazy deletion, not a count alone.

Sources: [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp), [The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/).
