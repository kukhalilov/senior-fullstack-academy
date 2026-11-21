# sequence and string dynamic programming — Reference: Contiguous substring and interval recurrences

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/), [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/), and [Longest Palindromic Subsequence](https://leetcode.com/problems/longest-palindromic-subsequence/).

## Scope and version

This reference covers contiguous-match and palindrome interval patterns plus named problem scopes checked November 16, 2026. It does not cover advanced suffix structures or all possible range-DP problems.

## How this group fits the mental model

Contiguity restricts transitions: a mismatch cannot skip over characters inside a matching run. Palindrome intervals instead ask about a bounded range and reduce the problem by comparing endpoints. The state must say whether it represents a suffix ending at a pair of positions, a boolean range, a count, or an optimal subsequence length.

## Supplied names explained

- `Substring contiguity condition` — Every selected character position in a substring is adjacent; a gap ends the current matching run. This is the key difference from a subsequence.
- `Longest common substring` — The longest contiguous sequence shared by two strings/arrays. For matching end values, extend the diagonal run; on mismatch, set the suffix-ending state to zero; track the maximum over all states.
- `Longest palindromic substring` — A contiguous range equal to its reverse. Expand around every odd/even center in `O(n²)` time and `O(1)` extra space, or use interval DP; track the longest range.
- `Longest palindromic subsequence` — Longest order-preserving palindrome that may skip characters. An interval recurrence takes inner length plus two for matching endpoints, otherwise the maximum after discarding either endpoint.
- `Interval DP state [left,right]` — A state about the inclusive range from index `left` through `right`. Define its value and empty/singleton behavior exactly; compute by increasing interval length so smaller dependent intervals exist.
- `Expand around center comparison` — A direct palindrome method that expands while both endpoints are in bounds and equal. Each palindrome has an odd center at a character or even center between characters; it does not directly solve the longest palindromic subsequence problem.
- `Palindrome endpoint match` — For a boolean substring table, matching endpoints require the inner range to be palindromic (with lengths 0/1 as bases). For subsequence length, matching endpoints permit `2 + inner`; these are different state meanings.
- `Empty and single-character intervals` — Empty ranges are palindromic and often have length zero; a single character is a palindrome of length one. Explicit bases prevent invalid access to `dp[l+1][r-1]`.

## Cross-item comparison

| Question | State behavior on mismatch | May skip interior characters? |
|---|---|---|
| Longest common substring | Reset suffix run to zero | No |
| Longest common subsequence | Compare skipping a terminal character from either prefix | Yes |
| Palindromic substring | Endpoints mismatch means range is not a palindrome | No |
| Palindromic subsequence | Discard one endpoint and retain the better interval | Yes |

Center expansion is often simpler for palindromic substring enumeration. Interval DP is useful when the problem needs an answer per range or combines subinterval results. For longest palindromic subsequence, interval DP or LCS against the reversed string can compute the length; reconstruction and repeated-character alignment require care if an actual palindrome is needed.

## Examples

For arrays `[1,2,3,2,1]` and `[3,2,1,4,7]`, the common contiguous suffix states reach length 3 for `[3,2,1]`. A later mismatch resets the run rather than preserving the earlier score.

For `"babad"`, odd/even center expansion finds a longest palindromic substring of length 3 (either `"bab"` or `"aba"`). For `"bbbab"`, the longest palindromic subsequence has length 4 (`"bbbb"`) even though those four characters are not all contiguous.

## Common mistakes

- Carrying a previous common-substring score across a mismatch.
- Calling any subsequence a substring.
- Updating substring length from a subsequence recurrence that can drop endpoints.
- Computing interval states in an order that reads unfinished shorter ranges.
- Accessing an empty inner interval without defining its value.
- Counting palindrome occurrences by distinct text instead of positions when the problem counts occurrences.
- Forgetting both odd and even centers.
- Assuming the longest palindromic subsequence itself is contiguous.

## Knowledge checks with answers

1. **What happens to a common-substring suffix state on mismatch?** It resets to zero because the suffix ending at that pair is not a contiguous match.
2. **Why does longest palindromic subsequence allow endpoint discard?** The selected sequence may skip characters, unlike a substring.
3. **How many center types must be checked?** Odd centers on characters and even centers between characters.
4. **What is a useful base for an empty palindrome interval?** It is a palindrome of length zero, enabling the one-character inner case.
5. **Which value is aggregated for longest common substring?** The maximum over every suffix-ending pair state, not necessarily the final cell.
