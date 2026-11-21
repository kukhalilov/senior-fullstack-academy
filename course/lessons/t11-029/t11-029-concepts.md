# knapsack, subset-sum, and resource-allocation DP — Core concepts and how they fit together

## Learning objectives

- Define a DP state around item eligibility and remaining/used capacity.
- Derive 0/1, unbounded, boolean, counting, maximum-value, and minimum-cost transitions.
- Explain why one-dimensional loop direction controls whether the current item can be reused.
- Reduce equal partition and target-sign counting to subset sum with correct parity/range checks.
- Distinguish unordered combinations from ordered sequences by loop nesting.
- Analyze pseudo-polynomial costs, overflow bounds, and reconstruction information.

## Prerequisites

Know recurrence-based dynamic programming, arrays, loops, integer arithmetic, and the distinction between subsets and sequences. A subset chooses each input index at most once; equal values at different indices are still distinct choices.

## Core concepts

### Capacity state and item-prefix dimension

For 0/1 knapsack, define `dp[i,w]` as the best value using the first i items with capacity at most w. The recurrence is `max(dp[i-1,w], value[i-1] + dp[i-1,w-weight[i-1]])` when the item fits; otherwise only skip. The item-prefix dimension prevents reuse because take also reads from the previous row. A one-dimensional array compresses those rows only if update order preserves the intended old-row dependency.

For unbounded use, the take transition may read the current item row/state: `dp[w] = max(dp[w], dp[w-weight] + value)`. This permits using the same item repeatedly. The same distinction applies to Boolean reachability and counting.

### Objectives and identity states

- **Maximum-value recurrence:** maximize value under a capacity, usually with zero as the valid empty selection when all item values are nonnegative.
- **Minimum-cost recurrence:** minimize cost to reach a target. An impossible state needs a sentinel such as infinity, not zero, because zero may be a valid optimum.
- **Boolean reachability recurrence:** OR the skip and take possibilities; initialize only the empty selection sum as reachable.
- **Subset-sum decision:** a 0/1 Boolean capacity problem asking whether some subset totals a target.

Initialization is part of the recurrence. In 0/1 subset sum, `reachable[0]=true` before processing items. In count-of-subsets, `count[0]=1`, representing the empty subset. For unbounded coin ways, `ways[0]=1`, representing the empty combination. For positive-weight minimum coin count, unreachable amounts start at an infinity sentinel.

### 0/1 versus unbounded loop order

In a one-dimensional 0/1 update, scan capacities downward. Then `dp[c-weight]` still represents the previous item layer; the current item cannot feed its own update. Scanning upward reads a state already updated for this item and may reuse it, causing an **Accidental item reuse bug**. For unbounded knapsack, ascending capacity is intentional because repeated use is allowed.

Counting combinations has a second ordering distinction. Coin outer / amount ascending counts each unordered multiset once, because coin types become available in a fixed order. Amount outer / value inner counts ordered sequences by their last chosen value; permutations such as 1+2 and 2+1 are distinct. These loops are not interchangeable.

### Subset and sign reductions

For equal partition, total S must be even. If so, it is enough to ask whether a subset sums to S/2; its complement then has the same sum. For Target Sum, let P be the sum assigned `+` and N the sum assigned `-`. `P-N=T` and `P+N=S`, so `N=(S-T)/2`. Count 0/1 subsets with that sum only when T is in `[-S,S]` and `S-T` is nonnegative and even. Using the positive side instead gives `(S+T)/2`. The two formulations are symmetric.

Zeros deserve care in counting: assigning `+0` and `-0` are different indexed sign choices even though they produce the same total. In a descending subset-count update, a zero doubles every reachable count exactly once for that zero item. Boolean reachability does not distinguish these choices.

For minimum partition difference, choose a reachable sum x at most floor(S/2); the complementary group gives difference `S-2x`. The closest reachable value to half minimizes this difference.

### Multiple resources

Ones and Zeroes has state `dp[z,o]`: maximum number of strings using at most z zeros and o ones. A string consumes `(zeroCount, oneCount)` and is a 0/1 item. Scan both dimensions downward so the same string cannot be added more than once during its own update. The answer is `dp[m,n]` because states mean “at most” these capacities.

### Pseudo-polynomial cost and reconstruction

A one-dimensional capacity DP commonly takes `O(nW)` time and `O(W)` memory. This is **Pseudo-polynomial complexity**: W may be exponentially larger than the number of bits needed to write W. If W is huge but n is small, compare with meet-in-the-middle, which splits items and enumerates roughly `2^(n/2)` sums on each side, then combines them. It has exponential dependence on n but avoids iterating over every capacity.

To **Reconstruct selected item indices**, preserve a two-dimensional reference table or record predecessor/item choices with enough information to distinguish the previous layer. A compressed optimum value does not encode which choices produced it. A second pass can reconstruct only if it retains enough per-prefix information or recomputes subproblems. **Tie between optimal subsets** means more than one index set may achieve the same value; any one is valid unless the prompt specifies a tie-break. Use `long` for total sums when bounds can exceed `int`, and guard capacity arithmetic before allocation.

## Mechanisms and relationships

The `O(nW)` bound comes from n item stages and W capacity states. A two-dimensional table costs `O(nW)` space; compression reduces it to `O(W)` only when the dependency direction is preserved. Bitset subset sum can shift a bitset of reachable sums by each item value and OR it back, representing the same 0/1 update compactly; machine-word implementation details and advanced bitset optimizations are outside the named implementation practice here.

## Worked examples

For target 4 with one 0-valued item, count starts `count[0]=1`. Processing 0 downward executes `count[0] += count[0]`, giving 2: exclude or include that zero. For two zero items, the count becomes 4, matching the four sign assignments in Target Sum when all values are zero.

For coins `[1,2]`, amount 3, coin-first updates yield two combinations `{1,1,1}` and `{1,2}`. Target-first updates yield three ordered sequences: `(1,1,1)`, `(1,2)`, and `(2,1)`. The recurrence values are similar; loop order defines the counting semantics.

## Misconceptions and edge cases

- 0/1 capacity must run downward after compression; upward iteration can reuse an item.
- Equal values at different indices remain distinct 0/1 choices.
- `dp[0]=1` in a counting recurrence means the empty choice, not one coin/item.
- Zero-valued items double subset counts but do not change Boolean reachability.
- An odd total cannot be equally partitioned; a divisible total does not guarantee a feasible subset.
- Target Sum reduction requires range and parity checks before indexing a DP array.
- Coin-first and target-first counting answer different questions.
- `O(nW)` is not polynomial in the encoded input length when W is binary-encoded.
- A compressed DP value alone is not a reconstruction trail.
- Use numeric types sized for total sums and accumulated counts; a safe state index does not guarantee safe arithmetic elsewhere.

## Knowledge checks with answers

1. **Why descend for 0/1 subset sum?** To ensure a state updated by the current item is not reused during that same item pass.
2. **Why ascend for unbounded knapsack?** Reusing the current item is allowed, so newly reached lower capacities may feed larger ones.
3. **What does one zero do to subset counts?** It doubles them by creating exclude/include choices.
4. **How does Target Sum reduce to counting subsets?** Choose a sign group whose target is `(S-T)/2` or `(S+T)/2`, after range/parity checks.
5. **What does coin-first loop nesting count?** Unordered coin combinations, not permutations.
6. **Why is O(nW) pseudo-polynomial?** Runtime depends on numeric W rather than `log W` input bits.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf), [USACO Guide: Book Shop](https://usaco.guide/problems/cses-1158-book-shop/solution).
