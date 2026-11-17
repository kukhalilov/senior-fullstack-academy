# sequence and string dynamic programming — Problem: Word Break

Source: [Word Break](https://leetcode.com/problems/word-break/).

## Goals

Use a reachable-prefix invariant, initialize the empty prefix correctly, and connect a word boundary to an earlier reachable boundary.

## Problem statement

Given a string `s` and a dictionary of strings `wordDict`, return whether `s` can be segmented into one or more dictionary words. A dictionary word may be reused any number of times.

## Input constraints

- `1 <= s.length <= 300`.
- `1 <= wordDict.length <= 1000`.
- `1 <= wordDict[i].length <= 20`.
- `s` and dictionary words contain lowercase English letters.
- Dictionary words are unique.

## Examples with expected output

- `s="leetcode"`, `wordDict=["leet","code"]` → `true`.
- `s="applepenapple"`, `wordDict=["apple","pen"]` → `true`.
- `s="catsandog"`, `wordDict=["cats","dog","sand","and","cat"]` → `false`.

## Clarifying assumptions

Segmentation must cover the entire string with no gaps and no unused suffix. The answer is Boolean; the task does not ask to count segmentations or return one. Generalized empty-string input is considered segmentable by zero words.

## Progressive hints

1. Use a Boolean array indexed by prefix length.
2. The empty prefix is the starting boundary and is reachable.
3. For each end position, try earlier boundaries; the substring between them must be a dictionary word.
4. Avoid substring work for prefixes already known unreachable.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

static bool WordBreak(string s, string[] words)
{
    var dictionary = new HashSet<string>(words, StringComparer.Ordinal);
    bool[] reachable = new bool[s.Length + 1];
    reachable[0] = true;
    int maxWordLength = 0;
    foreach (string word in words) maxWordLength = Math.Max(maxWordLength, word.Length);

    for (int end = 1; end <= s.Length; end++)
    {
        int earliest = Math.Max(0, end - maxWordLength);
        for (int start = end - 1; start >= earliest; start--)
        {
            if (reachable[start] && dictionary.Contains(s.Substring(start, end - start)))
            {
                reachable[end] = true;
                break;
            }
        }
    }
    return reachable[s.Length];
}

static void Check(bool expected, bool actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(true, WordBreak("leetcode", new[] { "leet", "code" }));
Check(true, WordBreak("applepenapple", new[] { "apple", "pen" }));
Check(false, WordBreak("catsandog", new[] { "cats", "dog", "sand", "and", "cat" }));
Check(true, WordBreak("", new[] { "a" }));
Check(false, WordBreak("a", Array.Empty<string>()));
Check(true, WordBreak("aaaa", new[] { "a", "aa" }));
```

## Correctness argument

`reachable[i]` is true exactly when the prefix of length `i` can be segmented. The empty prefix is reachable by using no words. For each `end`, every possible final dictionary word has some start boundary `start < end`; the prefix before it must already be reachable and the substring `[start,end)` must be in the dictionary. The algorithm marks `end` only when both conditions hold, so every mark corresponds to a valid segmentation. Conversely, any valid segmentation has a final word and its preceding prefix is valid, so that boundary is considered and marked. Induction over increasing end positions proves the returned value answers the full-string question.

## Step-by-step dry run

For `"applepenapple"`, words `apple` and `pen`, begin with `reachable[0]=true`. At end 5, `s[0..5)` is `apple`, so `reachable[5]=true`. At end 8, `s[5..8)` is `pen`, so `reachable[8]=true`. At end 13, `s[8..13)` is `apple`, so `reachable[13]=true`; the full string is segmentable.

## Time complexity

Let `n` be string length, `L` the maximum word length, and `T` the total number of characters across dictionary words. Building the hash set takes expected `O(T)` character work. There are at most `nL` boundary checks; obtaining each candidate substring and hashing/comparing up to `L` characters gives expected `O(nL²)` character work overall, plus `O(T)` construction. A full-range `Substring` call may return the original string; partial ranges return substring strings. A trie or span-based lookup can reduce temporary allocations or repeated comparisons.

## Space complexity

`O(n + D)` auxiliary entries for reachability and the hash set, where `D` is dictionary word count, excluding the input words' character storage. At most `O(L)` candidate characters are needed by one substring operation at a time, while cumulative substring allocation over all checks can reach `O(nL²)` characters. Building a trie instead uses space proportional to its distinct prefix nodes.

## Edge-case tests

Assertions cover all examples, an empty generalized input, an empty dictionary, and overlapping word choices. In the actual platform constraints the dictionary is nonempty.

## Reflection questions

- How would you modify the state to count the number of segmentations?
- When could a trie improve the boundary search?
- Why does a greedy longest-word-first choice fail in general?

Sources: [Word Break](https://leetcode.com/problems/word-break/), [.NET `String.Substring`](https://learn.microsoft.com/en-us/dotnet/api/system.string.substring?view=net-10.0), [.NET `HashSet<T>.Contains`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1.contains?view=net-10.0).
