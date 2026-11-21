# prefix sums, difference arrays, and static range queries — Reference: Two-dimensional prefix aggregates

## Scope and version

This lesson covers the four supplied two-dimensional names. Matrix coordinates use zero-based row and column indices; rectangles below are half-open.

## How this group fits the mental model

A two-dimensional prefix table stores cumulative rectangle sums from the origin. Four corner totals isolate an interior rectangle by inclusion-exclusion: subtract the extra top and left strips, then add their overlap back.

## Supplied names explained

- `Two-dimensional prefix sum` — For a matrix A, define `P[r+1,c+1] = A[r,c] + P[r,c+1] + P[r+1,c] - P[r,c]`. The table has one extra row and column. A rectangle query then uses four table reads.
- `Summed-area table` — Another name for a precomputed 2D cumulative sum table, commonly used for repeated rectangular sum queries in images and grids. Its benefit is O(1) query time after O(rows × columns) preprocessing and storage; the source matrix must remain static for those values to stay current.
- `Rectangle inclusion-exclusion` — Sum half-open rectangle `[r1,r2) × [c1,c2)` as `P[r2,c2]-P[r1,c2]-P[r2,c1]+P[r1,c1]`. The top-left overlap was removed twice and is added back once.
- `Zero-padded boundary row and column` — Allocate P with dimensions `(rows+1) × (columns+1)` and leave row zero and column zero as aggregate identity zero. Rectangles touching the top or left edge use the same formula without special cases.

## Cross-item comparison

`Two-dimensional prefix sum` describes construction and semantics. A `Summed-area table` is the same cumulative representation in applications such as image processing. `Rectangle inclusion-exclusion` is the query formula. `Zero-padded boundary row and column` is the representation choice that simplifies its edge behavior.

## Examples

For a 2×2 matrix `[[1,2],[3,4]]`, padded prefix values include `P[1,1]=1`, `P[1,2]=3`, `P[2,1]=4`, and `P[2,2]=10`. The full rectangle query is `10-0-0+0=10`. The lower-right cell alone `[1,2) × [1,2)` is `10-3-4+1=4`.

## Common mistakes

- Subtracting top and left strips but forgetting their overlap.
- Mixing inclusive cell coordinates with half-open prefix boundaries.
- Allocating a table without padded row/column, then introducing unnecessary boundary branches.
- Using `int` when the rectangle sum may exceed its range.
- Reusing a static table after the source matrix changes.
- Assuming a jagged matrix has equal row lengths unless constraints guarantee it.

## Knowledge checks with answers

1. **Why are there four prefix lookups?** Two strips are removed from the full origin rectangle, and their overlap must be restored.
2. **What dimensions does the padded table have?** `(rows+1) × (columns+1)`.
3. **What does the zero padding represent?** The aggregate before any matrix rows or columns.
4. **When does a 2D prefix table become stale?** After a source-cell update affecting its cumulative rectangles.

Source: [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums).
