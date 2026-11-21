# dynamic programming states, recurrences, and tabulation — Big-picture orientation and mental model

## Problem and purpose

Dynamic programming (DP) solves a problem by naming smaller subproblems, expressing answers in terms of other subproblems, and reusing computed answers. It is useful when a direct recursive search reaches the same meaningful state many times, or when an optimal answer is assembled from optimal smaller answers.

## Plain-language mental model

Think of a state as a question with just enough context to answer it. For climbing stairs, the state can be “how many ways reach step i?” The answer at i depends on reaching i-1 or i-2. Compute each answer once, then reuse it.

The difficult part is choosing what information belongs in the state. If two histories that can lead to different future answers are merged into one state, the recurrence is wrong. If a state stores too much history, the solution may become unnecessarily large.

## How the parts fit together

1. Define the subproblem and its state dimensions.
2. Write a recurrence that considers every legal predecessor or decision.
3. Specify base cases and impossible states.
4. Choose memoization or a bottom-up order in which dependencies are ready.
5. Prove each state value by induction over dependencies.
6. Count states and transition work; then optimize memory only if overwritten values are no longer needed.

The dependency graph has one node per state and an edge from a state to the smaller state it uses. When dependencies are acyclic, any topological evaluation order is valid. Recursion with memoization follows these edges on demand; tabulation chooses an explicit order.

## Concept map

| DP ingredient | Question it answers |
| --- | --- |
| State | Which subproblem is this value about? |
| Recurrence | Which smaller states determine its answer? |
| Base case | Which smallest states are known directly? |
| Impossible sentinel | How is an unreachable state represented safely? |
| Evaluation order | When are dependencies available? |
| Stored history | What values or choices are needed later or for reconstruction? |

## End-to-end walkthrough

For minimum coins to make amount 6 with denominations [1,3,4], define dp[x] as the minimum coin count for amount x. Set dp[0]=0 and all other states to an unreachable sentinel. For each x, try every coin c<=x and consider dp[x-c]+1 only if x-c is reachable. Then dp[6] compares dp[5]+1, dp[3]+1, and dp[2]+1; the minimum is 2 from 3+3. A largest-coin-first rule would take 4 and then 1+1, showing why storing alternatives matters.

## When to use it and tradeoffs

DP fits when the state space is manageable and different paths share subproblems or can be summarized by state. Its time is roughly number of states times work per state. Its memory is the number and size of stored states, unless dependencies allow rolling storage.

Memoization computes only reached states and mirrors a recurrence, but uses recursion and cache overhead. Tabulation avoids call-stack depth and makes memory use explicit, but requires a valid evaluation order. Space optimization can reduce retained history but may prevent straightforward reconstruction.

## What later lessons cover

References define state and recurrence, evaluation strategies, complexity and reconstruction, and proof/debugging obligations. Eight practice problems build one-dimensional counting and optimization, grid DP, decoding, and a frequency-to-take-or-skip transformation. Advanced knapsack, sequence, and optimization families are handled separately.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Coin Change](https://leetcode.com/problems/coin-change/).
