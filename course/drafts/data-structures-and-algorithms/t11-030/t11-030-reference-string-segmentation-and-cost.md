# sequence and string dynamic programming — Reference: Segmentation and string transformation

## Scope and version

This lesson explains the supplied segmentation and matching state names. The regex lesson uses only the restricted grammar in its problem statement; it is not a complete programming-language regex engine. Problem-specific bounds appear in their cited statements.

The general state and recurrence framing follows the [USACO Guide DP introduction](https://usaco.guide/gold/intro-dp).

## How this group fits the mental model

Segmentation asks which boundaries can be reached by valid words. Transformation asks for the least cost among ways to align prefixes. Pattern matching asks whether two prefixes can match under a grammar. Their table shapes may look alike, but their value domains—boolean, minimum cost, or matching truth—are different.

## Supplied names explained

- **Word break prefix reachability** — `dp[i]` is true exactly when the first `i` characters can be segmented into dictionary words. The answer is `dp[n]`.
- **Dictionary word boundary transition** — A candidate final word spans `[j,i)`. It can extend a valid construction only if `dp[j]` is true and that substring is in the dictionary. A dictionary word may be reused; this is not a one-use resource.
- **Minimum palindrome cuts** — A separate palindrome-partitioning optimization: for each prefix endpoint, minimize cuts over earlier boundaries whose intervening substring is a palindrome. A prefix already palindromic needs zero cuts. This inventory item describes the recurrence family; it is not one of this module's assigned practice problems.
- **Regular-expression matching state** — For the restricted `.` and `*` grammar, `dp[i,j]` says whether the first `i` text characters match the first `j` pattern characters. `.` consumes one arbitrary permitted character. `*` applies to the preceding atom and means zero or more repetitions of that atom; it is not a free-standing wildcard.
- **Wildcard matching state** — A distinct grammar family commonly gives `?` a one-character role and `*` an arbitrary-sequence role. Its star transition and meaning differ from regex repetition. A wildcard star does not mean “repeat the previous token.”
- **Edit operation cost** — The objective defines each operation's weight. Unit edit distance charges one per insertion, deletion, or replacement. Minimum ASCII delete sum charges the deleted character value and allows only deletions; equal retained characters cost nothing.
- **Impossible-prefix state** — A boolean prefix DP starts unreachable except at the empty prefix. For optimization, impossible states need a safe sentinel or separate reachability marker so adding costs cannot overflow or turn impossibility into a valid answer.
- **Empty-string initialization** — Empty prefixes are real states. Word Break sets the empty prefix reachable. Minimum deletion cost accumulates the cost of deleting the nonempty side. Regex matching allows an empty text prefix to match patterns made from zero-or-more atoms, by repeatedly removing an atom-star pair.

## Cross-item comparison

Word Break combines boolean reachability with word boundaries. Minimum deletion sum combines prefix alignment with weighted costs. Restricted regex matching combines prefix pairs with a token that can consume zero or more characters. In wildcard matching, `*` commonly consumes any-length text directly, so carrying over the regex recurrence would be wrong. Always derive a transition from the exact grammar and objective.

## Examples

`"applepenapple"` is segmentable using `apple`, `pen`, `apple`; reuse is allowed. In `"a*"`, `*` repeats the preceding `a`, so it can match empty text or any positive run of `a` characters. The same star meaning cannot be assumed in a wildcard grammar. For deletion cost, turning `"sea"` and `"eat"` into `"ea"` deletes `s` and `t`; cost is their character-value sum under the problem's stated ASCII convention.

## Common mistakes

- Allowing a word transition from an unreachable boundary.
- Treating the regex star as an arbitrary sequence or letting it stand alone.
- Initializing only the all-empty state when empty text can match zero-or-more pattern atoms.
- Using a unit operation cost for a character-weighted deletion problem.
- Adding to an infinity sentinel without guarding overflow.

## Knowledge checks with answers

1. **Can Word Break reuse a dictionary word?** Yes.
2. **What does regex `*` repeat?** The immediately preceding valid atom, zero or more times.
3. **Why is an empty-prefix state useful?** It makes construction from nothing and deletion/matching of empty prefixes explicit.
