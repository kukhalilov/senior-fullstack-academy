# sequence and string dynamic programming — Problem: Word Break

## Goals

Model word segmentation as reachability of string boundaries, prove a prefix DP, and distinguish a valid word ending from a merely matching substring.

## Problem statement

Given a string `s` and a dictionary `wordDict`, return `true` when `s` can be split into a space-separated sequence of one or more dictionary words. A dictionary word may be reused any number of times. [Official problem statement](https://leetcode.com/problems/word-break/)

## Input constraints

- `1 <= s.Length <= 300`.
- `1 <= wordDict.Length <= 1000`.
- `1 <= wordDict[i].Length <= 20`.
- `s` and each dictionary word contain lowercase English letters only.
- Dictionary words are unique.

## Examples with expected output

1. `s = "leetcode"`, dictionary `{"leet", "code"}` → `true` (`leet` + `code`).
2. `s = "applepenapple"`, dictionary `{"apple", "pen"}` → `true`; `apple` is reused.
3. `s = "catsandog"`, dictionary `{"cats", "dog", "sand", "and", "cat"}` → `false`.

## Clarifying assumptions

The empty string is outside the given input constraints, though the DP uses an empty-prefix base state. The output asks only whether a segmentation exists, not for all segmentations. Reuse means dictionary entries are not consumed after one use.

## Progressive hints

1. Think of each boundary between characters as a node. Which boundary is reachable before reading anything?
2. A word taking the prefix ending at `start` to `end` is useful only if `start` is already reachable.
3. Store dictionary words in a hash set. Since words have length at most 20, only inspect starts within the previous 20 characters.

## Complete C# solution

`dp[i]` means the first `i` characters are segmentable. For each reachable `start`, test the next dictionary words by their possible lengths. This avoids building a new substring for every candidate. Hash lookups are expected constant time, and each candidate comparison examines at most 20 characters.

```csharp dsa-solution
using System;
using System.Collections.Generic;

static bool WordBreak(string s, string[] words)
{
    var dictionary = new HashSet<string>(words, StringComparer.Ordinal);
    int maxWordLength = 0;
    foreach (string word in words) maxWordLength = Math.Max(maxWordLength, word.Length);

    bool[] reachable = new bool[s.Length + 1];
    reachable[0] = true;
    for (int start = 0; start < s.Length; start++)
    {
        if (!reachable[start]) continue;
        int limit = Math.Min(s.Length, start + maxWordLength);
        for (int end = start + 1; end <= limit; end++)
        {
            if (dictionary.Contains(s.Substring(start, end - start)))
                reachable[end] = true;
        }
    }
    return reachable[s.Length];
}

static void Check(bool condition, string label)
{
    if (!condition) throw new InvalidOperationException("Failed: " + label);
}

Check(WordBreak("leetcode", new[] { "leet", "code" }), "official example 1");
Check(WordBreak("applepenapple", new[] { "apple", "pen" }), "official example 2 and reuse");
Check(!WordBreak("catsandog", new[] { "cats", "dog", "sand", "and", "cat" }), "official example 3");
Check(WordBreak("a", new[] { "a" }), "single exact word");
Check(!WordBreak("ab", new[] { "a", "c" }), "unreachable final boundary");
Check(WordBreak("aaaaaaaaaaaaaaaaaaaa", new[] { "a", "aa" }), "many reusable short words");
Console.WriteLine("All Word Break checks passed.");
```

## Correctness argument

We prove by induction on boundary `i` that `reachable[i]` is true exactly when the prefix `s[0..i)` can be segmented. Boundary zero is reachable because the empty prefix needs no words. The algorithm marks `end` only after finding a reachable `start` and a dictionary word equal to `s[start..end)`, so concatenating that word to a valid segmentation proves soundness. Conversely, any nonempty valid segmentation of a prefix has a final dictionary word beginning at some boundary `start`; the preceding prefix is segmentable, and the algorithm considers its length (which is no greater than the maximum dictionary word length), so it marks `end`. Thus the final boundary has the requested truth value.

## Step-by-step dry run

For `"leetcode"` and `{"leet","code"}`, start with `reachable[0]=true`. From boundary 0, the candidate `"leet"` marks boundary 4. The other starts before 4 remain false. From boundary 4, `"code"` marks boundary 8. Therefore `reachable[8]` is true. No character needs to be assigned to a word until its preceding boundary is proven reachable.

## Time complexity

Let `n` be the string length and `L` the maximum dictionary word length. There are at most `nL` candidate substrings. `Substring` allocates/copies at most `L` characters and hash computation also examines those characters, so expected time is `O(n L²)` character work plus dictionary construction. With the supplied bounds, `n <= 300` and `L <= 20`.

## Space complexity

The reachability array uses `O(n)` booleans. The hash set stores the dictionary, `O(total dictionary characters)` space. Candidate substring allocations are temporary, each at most `O(L)`.

## Edge-case tests

The program asserts all official examples, one exact one-letter match, a reachable prefix that cannot reach the end, and repeated use of short words. The constraints exclude an empty input string and empty dictionary words, so no such cases are needed for the judge contract.

## Reflection questions

1. What bug appears if a matching word is allowed to mark an endpoint from an unreachable start?
2. How would predecessor boundaries let you return one segmentation?
3. How might a trie reduce repeated prefix checks when the maximum word length is not small?
