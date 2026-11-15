# solve, explain, test, and analyze algorithm problems — Reference: Complexity, alternatives, and concise explanation

## Scope and version

This lesson explains the ten supplied analysis and communication terms.

## How this group fits the mental model

Analysis checks whether the approach fits the constraints. A clear explanation then links the contract, invariant, implementation, tests, and cost without making broader claims than the evidence supports.

## Supplied names explained

- Worst-case time complexity — An upper bound on operation growth for the most expensive valid inputs of size n.
- Auxiliary-space complexity — Additional memory used beyond the input and, depending on stated convention, output. State what is counted.
- Expected complexity — An average bound under an explicit probability model, such as expected hash-table operations; it is not a deterministic worst-case bound.
- Amortized complexity — A bound averaged over a sequence of operations, often proved by aggregate, accounting, or potential arguments; an individual operation may cost more.
- Input versus output space distinction — Separate memory for reading/holding input, working state, and returned output. If output is required, its size may be unavoidable.
- Dominant operation count — Count the operation that grows fastest or is repeated most, such as pair comparisons, heap updates, or table transitions.
- Tradeoff comparison — Compare approaches by time, memory, mutation, complexity, and contract fit rather than saying one is universally better.
- Explain why a rejected approach fails — Give a concrete growth issue, counterexample, or violated assumption.
- Summarize invariant and proof — State what the algorithm maintains and why that property implies the result at termination.
- Limit claims to tested or sourced evidence — Distinguish measured behavior, formal guarantee, assumption, and unverified speculation.

## Cross-item comparison

Worst-case, expected, and amortized describe different guarantees and should not be interchanged. Auxiliary space excludes or separates output by convention; a returned collection still consumes memory. Testing evidence is empirical, while a proof supports all inputs under the stated assumptions.

## Examples

For duplicate detection using a hash set, expected time is O(n) under ordinary hash-distribution assumptions, but worst-case behavior can be worse depending on collisions and implementation guarantees. Auxiliary space is O(n); if the input is included in total process memory, say so separately.

For checking every pair, worst-case comparisons are n(n-1)/2, hence O(n²). This may be correct for small n or useful as an oracle, but not fit a very large bound. Sorting followed by adjacent comparisons costs O(n log n) time and may mutate or copy the input; a set-based method uses extra memory but can preserve order.

## Common mistakes

- Calling expected hash-table time worst-case.
- Calling amortized cost a per-call guarantee.
- Omitting sort or heap costs because the final loop is linear.
- Reporting only working memory while silently storing all outputs.
- Claiming correctness because tests pass.
- Saying a rejected approach “is slow” without operation counts or relevant constraints.

## Knowledge checks with answers

1. **What does amortized O(1) mean?** A sequence of operations costs O(number of operations) in total, though one operation can be more expensive.
2. **What makes expected time conditional?** It depends on a stated random or hashing model.
3. **Why separate output space?** The caller-required result can dominate memory and may not be avoidable.
4. **What should a concise proof explanation include?** Invariant or recurrence, why updates preserve it, and what termination implies.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/).
