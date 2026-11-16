# sequence and string dynamic programming — Problem: Word Break

# Goals

- Model a prefix as reachable when it can be segmented entirely into dictionary words.
- Derive the transition from a prior reachable boundary and one dictionary word.
- Implement the Boolean DP in C# and state its cost in terms of input and dictionary size.

# Problem statement

Given a string `s` and a dictionary of words, return `true` if `s` can be segmented into one or more dictionary words. A dictionary word may be reused any number of times. The complete string must be covered; unused characters at either end are not allowed.

# Input constraints

- `1 <= s.Length <= 300`
- `1 <= wordDict.Count <= 1000`
- `1 <= wordDict[i].Length <= 20`
- `s` and dictionary words contain lowercase English letters.
- Dictionary words are unique.

# Examples with expected output

- `s = "leetcode"`, `wordDict = ["leet", "code"]` → `true` because `leet + code` covers the full string.
- `s = "applepenapple"`, `wordDict = ["apple", "pen"]` → `true`; dictionary entries can be reused.
- `s = "catsandog"`, `wordDict = ["cats", "dog", "sand", "and", "cat"]` → `false`; the apparent prefixes leave an unsegmentable ending.

# Clarifying assumptions

- Segments must be contiguous substrings of `s`, and their concatenation must equal `s`.
- The order of dictionary entries does not matter.
- Empty `s` is outside the supplied constraints; the implementation below returns true for it because the empty prefix needs zero words.
- Equality is ordinal and case-sensitive; the supplied input is lowercase ASCII.

# Progressive hints

1. Define `reachable[i]` to mean the first `i` characters can be segmented.
2. The empty prefix is reachable. To reach `i`, find a word of length `L` whose occurrence ends at `i` and whose starting prefix `i-L` is reachable.
3. Check only word lengths no longer than the current prefix. Since every word has length at most 20, each state has a small bounded set of candidate lengths.
4. Return the state for the full length, not whether any prefix was reachable.

# Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class WordBreakSolution
{
    public static bool WordBreak(string s, IList<string> wordDict)
    {
        var wordsByLength = new Dictionary<int, HashSet<string>>();
        int maxWordLength = 0;

        foreach (string word in wordDict)
        {
            if (!wordsByLength.TryGetValue(word.Length, out HashSet<string>? words))
            {
                words = new HashSet<string>(StringComparer.Ordinal);
                wordsByLength.Add(word.Length, words);
            }

            words.Add(word);
            maxWordLength = Math.Max(maxWordLength, word.Length);
        }

        var reachable = new bool[s.Length + 1];
        reachable[0] = true;

        for (int end = 1; end <= s.Length; end++)
        {
            int firstStart = Math.Max(0, end - maxWordLength);

            for (int start = firstStart; start < end; start++)
            {
                if (!reachable[start])
                {
                    continue;
                }

                int length = end - start;
                if (wordsByLength.TryGetValue(length, out HashSet<string>? words) &&
                    words.Contains(s.Substring(start, length)))
                {
                    reachable[end] = true;
                    break;
                }
            }
        }

        return reachable[s.Length];
    }

    public static void Main()
    {
        if (!WordBreak("leetcode", new[] { "leet", "code" }) ||
            !WordBreak("applepenapple", new[] { "apple", "pen" }) ||
            WordBreak("catsandog", new[] { "cats", "dog", "sand", "and", "cat" }) ||
            !WordBreak("", new[] { "a" }) ||
            !WordBreak("aaaa", new[] { "a", "aa" }) ||
            WordBreak("b", new[] { "a", "aa" }))
        {
            throw new InvalidOperationException("A Word Break check failed.");
        }
    }
}
```

# Correctness argument

For every index `i`, `reachable[i]` is true exactly when the prefix `s[0..i)` can be segmented into dictionary words.

- **Base:** `reachable[0]` is true because the empty prefix requires no word. Every nonempty prefix starts false.
- **Soundness:** The algorithm sets `reachable[end]` only if some `start < end` has `reachable[start]` true and `s[start..end)` is in the dictionary. Appending that word to a valid segmentation of the earlier prefix gives a valid segmentation through `end`.
- **Completeness:** If a prefix ending at `end` has a valid segmentation, its final word begins at some `start`. The preceding prefix is reachable, and the final word length is at most `maxWordLength`, so the loop examines that boundary and recognizes the word. It therefore sets `reachable[end]` true.

Thus the returned `reachable[s.Length]` is true if and only if the full string is segmentable.

# Step-by-step dry run

Use `s = "applepenapple"` and words `apple`, `pen`. The only lengths are 3 and 5; the set begins with `reachable[0] = true`.

- End 1 and 2: no reachable starting boundary plus a dictionary word matches, so both remain false.
- End 3: the length-3 suffix `app` is not a word; false.
- End 5: start 0 is reachable and `apple` is present, so `reachable[5] = true`.
- End 8: start 5 is reachable and `pen` is present, so `reachable[8] = true`.
- End 13: start 8 is reachable and `apple` is present, so `reachable[13] = true`.

Intermediate ends without a matching word from a reachable start remain false. The final state is true.

# Time complexity

Let `n = s.Length`, `D` be the number of distinct word lengths, and `L` be the maximum word length. There are at most `min(D, L)` candidate boundaries per end. Creating a substring and hashing/comparing it costs up to `O(L)`, so the conservative bound is `O(n × D × L)`. With `L <= 20`, this is bounded and small for the supplied constraints. Building the length-indexed sets takes `O(total dictionary characters)` expected time.

# Space complexity

The reachability array uses `O(n)` space. The sets store the dictionary in `O(total dictionary characters)` space. Candidate substrings create temporary allocations during the scan; they are not retained by the DP. A trie or span-aware lookup can reduce allocations if a larger constraint set makes them material.

# Edge-case tests

- A word equal to the entire string.
- A valid segmentation that reuses one dictionary word.
- A reachable prefix followed by an impossible suffix.
- No dictionary word begins at index 0.
- Several candidate boundaries exist but only a shorter one leads to a complete solution.
- Empty string if the API is intended to accept it (the supplied constraints exclude it; this implementation returns true).
- Maximum input length with maximum word length.

# Reflection questions

1. Why is checking that *any* prefix is reachable insufficient?
2. How does `reachable[0] = true` make a word beginning at index zero fit the same transition as later words?
3. Why is this a prefix-reachability DP instead of a greedy longest-word-first scan?
4. If the dictionary allowed non-ASCII text, what string indexing assumption in this C# implementation would need revisiting?

**Answers:** (1) The requirement is to cover the whole string. (2) A word from index zero extends the empty valid segmentation. (3) A longer locally valid word can block a valid later split; all reachable boundaries must be considered. (4) .NET `string.Length` and indexing use UTF-16 code units; Unicode scalar/grapheme semantics may require a different representation, though the frozen problem is lowercase English.

# Sources

- [Assigned problem: Word Break](https://leetcode.com/problems/word-break/)
- [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp)
