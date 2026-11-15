# prefix sums, difference arrays, and static range queries — Reference: Prefix definitions and range queries

## Scope and version

This lesson covers the seven supplied prefix basics. Array indices are zero-based; formulas distinguish inclusive element indices from half-open boundary indices.

## How this group fits the mental model

A prefix table stores an aggregate from the beginning through a boundary. Range queries use two prefixes when the aggregate can be cancelled by an inverse operation, such as addition or XOR.

## Supplied names explained

- `Inclusive prefix sum` — `P[i]` may be defined as the sum of elements `a[0..i]`. This representation has n entries and makes prefix ending at i direct, but a range formula must handle `left == 0` separately.
- `Exclusive prefix sum` — `P[i]` is the sum of elements before i: `a[0..i)`. With `P[0]=0`, P has n+1 boundary entries and a half-open range sum is always `P[right]-P[left]`.
- `Leading identity element` — The initial aggregate before reading values: zero for addition, one for multiplication, and zero for XOR. It creates a uniform boundary for empty prefixes and ranges beginning at index zero. Identity depends on the operation.
- `Half-open interval [left,right)` — Includes left and excludes right; length is `right-left`. Its sum is `P[right]-P[left]`. Empty range `[i,i)` has sum zero for addition.
- `Inclusive interval [left,right]` — Includes both endpoint elements; length is `right-left+1`. Its sum under the exclusive-prefix convention is `P[right+1]-P[left]`. Validate `left <= right` if empty ranges are not permitted.
- `Static range-sum query` — A query on data that remains unchanged after preprocessing. Build prefixes in O(n), answer each query in O(1), and pay O(n) storage. If data changes, the table needs rebuilding or another structure.
- `Prefix sum reconstruction` — Recover a value from adjacent exclusive prefixes: `a[i]=P[i+1]-P[i]`. Conversely, compute each prefix by adding the next input value to the previous cumulative total.

## Cross-item comparison

`Inclusive prefix sum` stores values at element endpoints, while `Exclusive prefix sum` stores totals at boundaries; the latter produces uniform half-open range formulas. A `Leading identity element` is what makes the boundary before index zero explicit. `Inclusive interval [left,right]` needs a right-boundary `+1` when using exclusive prefixes; `Half-open interval [left,right)` does not. `Static range-sum query` benefits from preprocessing but assumes no updates. `Prefix sum reconstruction` uses adjacent boundaries in either direction.

## Examples

For `a=[4,-1,2]`, exclusive P is `[0,4,3,5]`. Sum inclusive `[1,2]` is `P[3]-P[1]=5-4=1`. Recover `a[1]` as `P[2]-P[1]=3-4=-1`.

## Common mistakes

- Allocating only n prefix slots and then indexing the boundary after the last value.
- Applying `P[right]-P[left]` to inclusive endpoints without adding one.
- Forgetting the leading identity and adding special cases throughout the query code.
- Using prefix subtraction for an aggregate with no suitable inverse.
- Forgetting that a static table becomes stale after updates.
- Allowing narrow integer overflow in cumulative sums.

## Knowledge checks with answers

1. **How many entries does an exclusive prefix table have for n values?** n+1.
2. **What is the half-open sum `[l,r)`?** `P[r]-P[l]`.
3. **What is the inclusive sum `[l,r]`?** `P[r+1]-P[l]`.
4. **Can two prefix minima be subtracted to get a range minimum?** No; minimum has no inverse that cancels the earlier prefix.

Source: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums).
