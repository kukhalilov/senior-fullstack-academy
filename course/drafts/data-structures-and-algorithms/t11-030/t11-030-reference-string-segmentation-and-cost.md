# sequence and string dynamic programming — Reference: Segmentation and string transformation

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Word Break](https://leetcode.com/problems/word-break/), [Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/), and [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/).

## Scope and version

This group covers the specified prefix reachability, minimum-cost alignment, and two pattern-matching DP problems. The linked problem constraints/statements were checked November 16, 2026. This is not a complete formal specification of every regular-expression or glob syntax; the supplied problem defines a deliberately small grammar.

## How this group fits the mental model

Segmentation asks whether a prefix is reachable by joining valid pieces; transformation asks for the least cost to align two prefixes; pattern matching asks whether a pattern prefix can consume a text prefix. In each case, define prefix length rather than last character index, then derive transitions from the final word, operation, or pattern token.

## Supplied names explained

- `Word break prefix reachability` — Let `reachable[i]` mean the first `i` characters can be segmented into dictionary entries. Start with `reachable[0]=true`; the answer is `reachable[n]`.
- `Dictionary word boundary transition` — For an earlier reachable boundary `j`, mark `i` reachable when `s[j..i)` is a dictionary word. Hash-set lookup is convenient; checking all boundaries and substrings costs depend on string copying/hashing strategy.
- `Minimum palindrome cuts` — Minimum cuts splitting a string into palindromic substrings. A common prefix DP uses `cuts[i]` for the first `i` characters and a precomputed palindrome table or center expansion to test candidate final pieces. Empty/single-character conventions need careful handling.
- `Regular-expression matching state` — For the supplied grammar, `dp[i][j]` asks whether the first `i` text characters match the first `j` pattern characters. The entire text and pattern must match; this is not a general backtracking regex engine.
- `Wildcard matching state` — A separate grammar where `?` typically matches one character and `*` can match any sequence. This differs from regex `*`, which repeats the preceding token; do not transfer transitions between grammars without stating semantics.
- `Edit operation cost` — Cost added for an insertion, deletion, replacement, or match transition. Unit-cost edit distance assigns one to each edit and zero to match; weighted variants change the recurrence but not the need for a precise operation definition.
- `Impossible-prefix state` — A state with no valid construction/path. Use a safe sentinel or boolean false and guard arithmetic; adding a cost to `int.MaxValue` can overflow.
- `Empty-string initialization` — Empty source/target/pattern prefixes still have defined results. For edit distance, empty-to-length-`j` costs `j` inserts; for Word Break, empty prefix is reachable; for regex, a pattern made of valid `x*` pairs can match empty text.

## Cross-item comparison

| Problem | State type | Final choice |
|---|---|---|
| Word Break | Boolean reachable prefix | Pick a dictionary word ending at this boundary |
| Minimum edit cost | Integer minimum for prefix pair | Insert, delete, match or replace |
| Regex full match | Boolean prefix pair | Consume one token or let `x*` consume zero/more |
| Wildcard match | Boolean prefix pair | `?` consumes one; `*` consumes zero or more arbitrary chars |
| Minimum palindrome cuts | Integer best prefix partition | Pick the last palindromic piece |

The word “star” is overloaded. In the supplied regular-expression problem, `*` repeats the preceding element (`a*`); in common wildcard matching, `*` represents any sequence. They are different languages and have different base cases.

## Examples

For `s="applepenapple"` with words `apple, pen`, reachable prefix lengths progress through 5, 8, and 13. For regex `s="aa"`, `p="a*"`, the star branch can consume one more `a` while remaining at the pattern position, then eventually move past the `a*` token. For `s="ab"`, `p=".*"`, dot matches each character and star repeats dot. A pattern like `*a` is invalid under the supplied constraints because star must have a preceding element.

For an ASCII deletion-only alignment, matching equal characters keeps the diagonal cost; deleting from one string adds that character’s code-point/ASCII value to the appropriate predecessor. When constraints specify lowercase English letters, the values are ASCII-compatible; for Unicode generalization, define whether cost is UTF-16 code unit, Unicode scalar value, or another weight.

## Common mistakes

- Leaving `reachable[0]` false, which prevents every segmentation from starting.
- Treating the full pattern as a substring match instead of requiring the entire string.
- Implementing wildcard `*` semantics for regex `*` or vice versa.
- Allowing a leading `*` despite the supplied valid-pattern constraint.
- Forgetting that `x*` can represent zero characters; skipping two pattern positions handles this case.
- Using an “infinity” sentinel and then overflowing when adding a cost.
- Counting cuts as pieces or mishandling the zero/one-character case.
- Comparing Unicode characters but claiming ASCII costs outside ASCII constraints.

## Knowledge checks with answers

1. **Why is the empty prefix reachable in Word Break?** It is the valid starting boundary before the first dictionary word.
2. **What does regex `a*` mean here?** Zero or more repetitions of the immediately preceding `a` token.
3. **How does wildcard `*` differ?** In the common wildcard grammar it can consume any sequence, not repetitions of a preceding token.
4. **What is the edit-distance cost to transform empty text into a length-`j` target under unit insertions?** `j`.
5. **Why guard impossible states before adding costs?** A large sentinel plus a positive cost can overflow and become a falsely small value.
