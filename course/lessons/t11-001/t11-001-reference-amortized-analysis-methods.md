
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Amortized analysis methods

# Scope and version

This lesson develops the aggregate, accounting, and potential methods for bounding the total cost of a sequence of operations. Amortized analysis is deterministic worst-case sequence analysis; it does not require a probability distribution. The source is MIT's algorithm-analysis lecture on amortization and table doubling.

# How this group fits the mental model

An individual operation can be expensive even when every long sequence has a small total cost. Amortized analysis proves a bound on the total actual cost of **every legal sequence** of operations. If every sequence of length `m` costs at most `O(m)`, then the amortized cost per operation is `O(1)`. This does not promise that each individual operation is constant-time, nor does it average independent runs or random inputs.

Suppose operations have actual costs `c1,...,cm`. The target is a bound on `sum(ci)` for every sequence of length `m` (sometimes subject to a stated restriction on operation types). Divide that total bound by `m` to report a uniform amortized bound. A bound stated only for the first `m` appends, for example, must not silently be generalized to arbitrary operations or initial states.

# Supplied names explained

## Aggregate method

Bound the total actual cost of any sequence directly. If the sum is at most `C m + D`, its average cost across that sequence is at most `C + D/m`, hence `O(1)` per operation. The proof need not assign a cost to each operation type. State the sequence constraints and count expensive events carefully.

**Stack example.** Consider a stack with `PUSH`, `POP`, and `MULTIPOP(k)`; `MULTIPOP` removes up to `k` elements. A single call can cost `Theta(n)` when it removes `n` items. But among any sequence of `m` operations starting from an empty stack, each pushed item can be popped at most once. There are at most `m` pushes and at most `m` successful removals in total, so total work is `O(m)` and amortized cost is `O(1)`. This applies even when a `MULTIPOP` removes many items at once.

## Accounting method

Assign each operation an amortized charge `ĉi`. Treat `ĉi - ci` as credit added to or removed from the data structure. For every prefix of every legal sequence, the total saved credit must remain nonnegative; equivalently, the sum of amortized charges must cover the sum of actual costs. Then for the whole sequence, `sum(ci) <= sum(ĉi)`. A charge is a proof device, not a claim that the implementation performs exactly that much work.

**Stack example.** Charge `PUSH` three units and `POP` and `MULTIPOP` zero units, under a model where pushing or popping one item costs one unit. Use one unit of a push's charge for the push itself and save two credits on the pushed item. When that item is later removed, one saved credit pays for its pop, and one remains unused; no operation spends credit belonging to an item that was not pushed. Thus the bank never goes negative and the total actual cost is bounded by three times the number of pushes, at most `3m`.

## Potential method

Represent saved work with a function `Φ(D)` of the data structure state `D`. For operation `i`, from `D(i-1)` to `D(i)`, define amortized cost

`ĉi = ci + Φ(D(i)) - Φ(D(i-1))`.

Summing telescopes:

`sum(ci) = sum(ĉi) + Φ(D(0)) - Φ(D(m))`.

If `Φ(D(m)) >= Φ(D(0))` for all reachable final states, then actual total cost is at most total amortized cost. The common sufficient condition is `Φ(D) >= 0` for every reachable state and `Φ(D(0)) = 0`. Nonnegative potential is a convenient invariant, not a universal requirement: a known lower bound on final potential relative to initial potential is enough. Choose and justify a potential that makes the amortized costs easy to bound; it is not enough merely to call potential “stored energy.”

# Examples

## Worked potential proof: append to a doubling dynamic table

Assume a table begins empty with capacity zero. An append to a non-full table writes one item at cost one. When full at capacity `q > 0`, it allocates capacity `2q`, copies `q` items, then writes the new item; model that operation's actual cost as `q + 1`. After `i` appends let `n=i` be the number of items and `q` the capacity. For `i=0`, use capacity zero. For `i>0`, capacities are powers of two and `q` is the least such capacity at least `i`.

Define `Φ = 2n - q`. This potential is nonnegative because `q < 2n` whenever the table is nonempty under the stated doubling policy (and `Φ=0` initially). For a non-resizing append, `q` stays fixed, so `ΔΦ=2`; actual cost is `1`, and amortized cost is `3`. On a resize, the old table is full: before append `n=q`, after append `n'=q+1` and `q'=2q`. Thus `ΔΦ = [2(q+1)-2q] - [2q-q] = 2-q`; actual cost is `q+1`, giving amortized cost `3`. For the first append from zero capacity, actual cost is one and potential rises from zero to one, so its amortized cost is two. Every later append has amortized cost at most three in this model. Telescoping and nonnegative final potential imply `m` appends cost at most `3m`, so append is `O(1)` amortized although an individual resize costs `Theta(n)`.

The constants depend on the chosen cost model; if allocation or clearing new slots is charged differently, redo the accounting. This proof covers append-only growth from the stated initial state, not arbitrary mixtures of deletion, shrinking, or externally supplied capacities.

# Cross-item comparison

* **Aggregate** is often the shortest proof when counting total work is simple; it may not yield a useful bound by operation type.
* **Accounting** assigns local charges and makes it intuitive which operations prepay for future work; the credit invariant must hold after every prefix.
* **Potential** expresses the same conservation idea as a state function and telescoping sum; it can be compact for stateful structures, but finding a valid function takes care.

These are proof techniques for the same kind of sequence-wide guarantee, not different performance guarantees. For typed operations, one may prove separate amortized charges for each type, but the sum of charges must still upper-bound actual total cost for every allowed sequence.

# Common mistakes

* Calling amortized cost “average-case” without explaining the sequence guarantee. Average-case analysis uses a probability model; amortized analysis bounds sequences without one.
* Saying every append is `O(1)` worst-case for a doubling array. One resizing append is `Theta(n)` in the usual copying model; the `O(1)` claim is amortized.
* Allowing accounting credit to go negative, or asserting a potential proof without checking the initial and final potential terms.
* Proving a bound only for a selected sequence and claiming it holds for all legal sequences.
* Forgetting that changing operation costs or the data-structure policy changes what must be charged.

# Knowledge checks with answers

1. **A stack operation can remove `n` items. Why can the sequence still have `O(1)` amortized cost per operation?** Each item is pushed at most once and removed at most once, so across `m` operations the total item-level work is `O(m)`.
2. **What condition makes assigned accounting charges a valid upper bound?** For every prefix of every legal sequence, saved credit stays nonnegative; therefore accumulated amortized charges cover actual costs.
3. **Why does the potential sum telescope?** The `+Φ(D(i))` term for one operation cancels the `-Φ(D(i))` term for the next, leaving only final minus initial potential.
4. **Does amortized `O(1)` bound each individual operation by a constant?** No. It bounds the total over every legal sequence; individual operations can be linear.

**Sources**

* [MIT OCW, 6.046J Lecture 11: Amortized Analysis (course notes)](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/b1e5ac3c8f7d60db9b8d5b66c40bc55e_MIT6_046JS12_Notes.pdf) — aggregate, accounting, and potential analyses.
* [MIT OCW, 6.046J Lecture 13: Amortized Algorithms, Table Doubling, Potential Method](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-13-amortized-algorithms-table-doubling-potential-method/index.html) — dynamic-table potential analysis.
