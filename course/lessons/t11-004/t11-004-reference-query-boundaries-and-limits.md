# prefix sums, difference arrays, and static range queries — Reference: Boundary conventions and limits

## Scope and version

This lesson covers the seven supplied boundary and limitation terms. Each formula assumes exclusive prefix sums with a leading zero unless noted.

## How this group fits the mental model

Prefix algorithms place aggregates at boundaries. Most bugs arise from mixing a problem's element indices with the table's boundary indices, using stale data after edits, or overflowing an aggregate.

## Supplied names explained

- `Zero-based versus one-based indexing` — C# arrays are zero-based, but a statement may use one-based positions. Convert inputs at the boundary and convert outputs back explicitly; do not mix conventions inside the invariant.
- `Inclusive versus half-open bounds` — Inclusive `[l,r]` contains r and has length `r-l+1`; half-open `[l,r)` excludes r and has length `r-l`. Exclusive-prefix range sum is respectively `P[r+1]-P[l]` or `P[r]-P[l]`.
- `Empty prefix` — The aggregate before any elements, at boundary zero. For additive prefixes it is zero and its frequency is seeded once for subarray counting. It is distinct from the empty subarray if the problem counts only nonempty ranges.
- `Single-element interval` — Inclusive `[i,i]` has one element and is queried as `P[i+1]-P[i]`. Half-open `[i,i+1)` denotes the same element; `[i,i)` is empty.
- `Accumulator width and overflow` — A prefix or answer can exceed the range of one element. In C#, widen operands before arithmetic (for example `(long)a+b`) because assigning an already-overflowed int result to long does not repair it. Select a type from maximum total and count bounds.
- `Static data limitation` — A prefix table reflects the array values used during construction. Editing the array does not update stored prefixes; all affected entries must be rebuilt or maintained by a dynamic structure.
- `Interleaved update limitation` — Difference arrays batch known updates but do not answer a query against the state after each update. Frequent online point/range updates with queries need a Fenwick tree, segment tree, or another structure matched to operations.

## Cross-item comparison

`Zero-based versus one-based indexing` concerns external positions; `Inclusive versus half-open bounds` concerns endpoint inclusion. The `Empty prefix` creates the base boundary; a `Single-element interval` is a useful off-by-one check. `Accumulator width and overflow` applies to every arithmetic representation. `Static data limitation` and `Interleaved update limitation` describe distinct reasons to rebuild or select a dynamic structure.

## Examples

For `a=[7]`, exclusive prefix is `[0,7]`. Its only element is half-open `[0,1)` and sum `P[1]-P[0]=7`; it is inclusive `[0,0]` and sum `P[1]-P[0]=7`. If an API accepts one-based inclusive `1..1`, convert it to zero-based half-open `[0,1)` once.

## Common mistakes

- Adding one to both endpoints when converting to half-open bounds.
- Seeding empty-prefix frequency zero more than once.
- Counting an empty range when the task requires a nonempty subarray.
- Casting after overflow rather than before the addition or multiplication.
- Reusing an old prefix table after mutating source data.
- Choosing a static preprocessing method for interleaved update/query requirements.

## Knowledge checks with answers

1. **What half-open range matches inclusive `[l,r]`?** `[l,r+1)`.
2. **What prefix formula retrieves one element a[i]?** `P[i+1]-P[i]`.
3. **How do you avoid an int overflow before storing into long?** Widen at least one operand before the operation.
4. **What structure family handles interleaved updates and queries?** A suitable dynamic range-query structure, such as a Fenwick or segment tree.

Source: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums).
