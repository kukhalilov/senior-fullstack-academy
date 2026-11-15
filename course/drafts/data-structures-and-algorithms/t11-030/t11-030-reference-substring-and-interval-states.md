# sequence and string dynamic programming — Reference: Contiguous substring and interval recurrences

## Scope and version

This lesson covers the supplied contiguous and interval concepts. The recurrence details are stable; see [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp) for DP state and transition fundamentals.

## How this group fits the mental model

Contiguous-match states remember a run that must reach the current endpoints. Interval states instead summarize an entire bounded range. The key design question is whether a mismatch breaks the candidate or whether an optimum can skip an endpoint.

## Supplied names explained

- **Substring contiguity condition** — Every character occupies consecutive positions. A solution cannot jump over a mismatch or omit an interior character while still calling the result a substring.
- **Longest common substring** — Let `dp[i,j]` be the length of the common contiguous suffix ending at positions `i-1` and `j-1`. Equal characters extend the previous diagonal by one; unequal characters set the state to zero. Track the maximum over all cells; the last cell need not contain the maximum.
- **Longest palindromic substring** — Find the longest contiguous range equal to its reverse. Every palindrome has an odd center or an even gap-center, so expanding around all `2n-1` centers checks every candidate. A two-dimensional interval table is another method.
- **Longest palindromic subsequence** — Find the longest order-preserving selection that reads the same forward and backward, allowing omissions. For a range `[l,r]`, equal endpoints contribute two plus the inner-range result; otherwise discard one endpoint and retain the better range result.
- **Interval DP state [left,right]** — `dp[l,r]` summarizes the inclusive range. Process increasing range length so shorter intervals used by a transition are already computed. Define length-one and empty-inner-range behavior explicitly.
- **Expand around center comparison** — Center expansion uses `O(n²)` worst-case time and `O(1)` auxiliary space for a longest palindromic substring. Interval DP also takes `O(n²)` time and usually `O(n²)` space, but stores whether or how well every range behaves and can support related computations.
- **Palindrome endpoint match** — In the longest palindromic subsequence recurrence, if `s[l] == s[r]`, include both and use `2 + dp[l+1,r-1]`. When `r-l==1`, the inner range is empty and contributes zero.
- **Empty and single-character intervals** — An empty interval contributes zero for length computations; a one-character range is a palindrome and has subsequence length one. Empty intervals can be conceptual boundary values even when input strings are nonempty.

## Cross-item comparison

Longest common substring resets on a mismatch because contiguity requires an uninterrupted run. Longest common subsequence can preserve an earlier optimum by skipping a character. Longest palindromic substring optimizes a contiguous range; longest palindromic subsequence may skip interior characters. Center expansion is a compact method for substring detection, whereas the interval recurrence directly solves the subsequence objective.

## Examples

For `"abca"`, the entire range is not a palindrome, but a palindromic subsequence `"aca"` has length 3. The longest palindromic substring has length 1. For arrays `[1,2,3,2,1]` and `[3,2,1,4,7]`, the longest common contiguous run is `[3,2,1]`, length 3; the mismatching next pair ends that run.

## Common mistakes

- Keeping a nonzero substring state after a mismatch.
- Returning the bottom-right longest-common-substring cell instead of the global maximum.
- Confusing a palindromic subsequence with a contiguous palindrome.
- Reading the inner interval of a two-character range without defining it as empty.
- Counting distinct palindrome texts when the task asks for occurrences by position.

## Knowledge checks with answers

1. **Why does longest common substring reset?** Any gap would violate contiguity.
2. **When is an interval palindrome state length one?** Every single character is a palindrome.
3. **What is the longest palindromic subsequence of `"abca"`?** Length 3, for example `"aca"`.
