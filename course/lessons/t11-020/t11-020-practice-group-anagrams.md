# hash maps and frequency tables — Problem: Group Anagrams

## Goals
- Define a canonical key shared by exactly the anagrams.
- Group values in a dictionary without depending on output order.
- Compare fixed-alphabet counting with sorting each word.

## Problem statement
Given an array of strings, group strings that are anagrams of one another. Return groups and their internal order in any order.

## Input constraints
- `1 <= strs.Length <= 10,000`.
- `0 <= strs[i].Length <= 100`.
- Strings contain only lowercase English letters; empty strings are allowed.

## Examples with expected output
- `["eat","tea","tan","ate","nat","bat"]` -> groups equivalent to `[["bat"],["nat","tan"],["ate","eat","tea"]]`.
- `[""]` -> `[[""]]`.
- `["a"]` -> `[["a"]]`.

## Clarifying assumptions
- Anagrams have the same multiplicity for every character; sorting or frequency counts preserve that information.
- Group ordering and order within a group are unrestricted.
- The lowercase alphabet is fixed, so a 26-count vector is a complete signature.

## Progressive hints
1. Sorting every string produces a canonical representation, but costs O(L log L) per string.
2. Since only 26 letters occur, count each letter instead.
3. Serialize all 26 counts unambiguously as the dictionary key.
4. Append the original string to the group for its key.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<string>> GroupAnagrams(string[] strs)
    {
        var groups = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (string word in strs)
        {
            int[] counts = new int[26];
            foreach (char c in word) counts[c - 'a']++;
            string key = string.Join(',', counts);
            if (!groups.TryGetValue(key, out List<string>? group))
            {
                group = new List<string>();
                groups.Add(key, group);
            }
            group.Add(word);
        }
        return groups.Values.Select(group => (IList<string>)group).ToList();
    }

    static string Normalize(IEnumerable<IList<string>> groups) =>
        string.Join("|", groups.Select(group => string.Join(',', group.OrderBy(x => x, StringComparer.Ordinal)))
            .OrderBy(x => x, StringComparer.Ordinal));

    static void Check(string expected, string[] input)
    {
        string actual = Normalize(GroupAnagrams(input));
        if (!StringComparer.Ordinal.Equals(expected, actual))
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("ate,eat,tea|bat|nat,tan", new[] { "eat", "tea", "tan", "ate", "nat", "bat" });
        Check("", new[] { "" });
        Check("a", new[] { "a" });
        Check("ab,ba|abc", new[] { "ab", "abc", "ba" });
        Console.WriteLine("Group Anagrams checks passed.");
    }
}
```

## Correctness argument
For each word, its 26-entry count vector records the exact multiplicity of every allowed letter. Two words are anagrams exactly when these vectors are equal. Their comma-separated fixed-length serialization is therefore equal exactly for anagram pairs. The dictionary places each word into the group with its signature, so every group contains mutually anagrammatic words and every input word is included once.

## Step-by-step dry run
`"eat"` and `"tea"` each produce one a, one e, one t, and zero of every other letter. They use the same key and enter one group. `"tan"` has a different count vector and forms another group.

## Time complexity
O(S + 26K) expected, where S is the total number of characters and K is the number of strings; serializing and hashing a fixed 26-count key costs O(26) per string. With a variable alphabet, the signature cost grows with alphabet size.

## Space complexity
O(S + 26K) for the grouped output and dictionary keys, excluding the input strings.

## Alternatives and tradeoffs
- Sort each string to form a key: O(L log L) per word, simple and independent of a small fixed alphabet.
- Use an immutable count-vector key with value equality to avoid string serialization, but it requires a custom equality/hash type.
- The fixed count signature is efficient here because lowercase English letters are explicitly guaranteed.

## Common mistakes and gotchas
- Using a set of letters and losing multiplicity.
- Concatenating counts without separators so different vectors can serialize ambiguously.
- Assuming arbitrary Unicode input while indexing a 26-entry array.
- Requiring a particular dictionary output order when the contract allows any order.

## Edge-case tests
- Empty string.
- Single-character group.
- Same letters with different multiplicities.
- Several distinct groups and repeated members.

## Reflection questions
1. Why is the count vector a complete canonical key under the constraints?
2. When is sorting a better choice than fixed-alphabet counting?
3. How would an immutable frequency-vector key implement equality?

## Source
- [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
