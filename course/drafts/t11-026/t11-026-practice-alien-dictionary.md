# directed acyclic graphs and topological ordering — Problem: Alien Dictionary

## Goals
- Derive a precedence graph from adjacent sorted words.
- Use only the first differing character from each pair.
- Detect both a cycle and the invalid longer-word-before-prefix case.

## Problem statement
The given words are claimed to be sorted under an unknown ordering of lowercase English letters. Return one valid ordering of every distinct character that appears in the words. Return the empty string when the evidence is contradictory.

## Input constraints
- 1 <= words.Length <= 100.
- 1 <= words[i].Length <= 100.
- Each word contains only lowercase English letters.

## Examples with expected output
- ["wrt","wrf","er","ett","rftt"] -> "wertf" (one valid ordering).
- ["z","x","z"] -> "" because the inferred order contains a cycle.
- ["abc","ab"] -> "" because a longer word appears before its own prefix.
- ["z","z"] -> "z".

## Clarifying assumptions
- Include every distinct character present, even if no constraint connects it to another character.
- The output may be any valid ordering; this implementation uses a min-priority queue for deterministic smallest-ready choices.
- The input words are in the claimed order; no claim is made about letters absent from the input.

## Progressive hints
1. Compare each adjacent pair until the first unequal character.
2. That first mismatch gives one directed edge from the earlier word's character to the later word's character.
3. If the later word is a strict prefix of the earlier word, reject immediately.
4. Deduplicate edges so indegrees count distinct constraints, then topologically sort all observed characters.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static string AlienOrder(string[] words)
    {
        var exists = new bool[26];
        var outgoing = new HashSet<int>[26];
        var indegree = new int[26];
        for (int i = 0; i < 26; i++) outgoing[i] = new HashSet<int>();

        foreach (string word in words)
            foreach (char c in word)
                exists[c - 'a'] = true;

        for (int i = 0; i + 1 < words.Length; i++)
        {
            string first = words[i], second = words[i + 1];
            int commonLength = Math.Min(first.Length, second.Length);
            int j = 0;
            while (j < commonLength && first[j] == second[j]) j++;

            if (j == commonLength)
            {
                if (first.Length > second.Length) return string.Empty;
                continue;
            }

            int from = first[j] - 'a', to = second[j] - 'a';
            if (outgoing[from].Add(to)) indegree[to]++;
        }

        var ready = new PriorityQueue<int, int>();
        int characterCount = 0;
        for (int c = 0; c < 26; c++)
        {
            if (!exists[c]) continue;
            characterCount++;
            if (indegree[c] == 0) ready.Enqueue(c, c);
        }

        var result = new System.Text.StringBuilder();
        while (ready.Count > 0)
        {
            int current = ready.Dequeue();
            result.Append((char)('a' + current));
            foreach (int next in outgoing[current])
                if (--indegree[next] == 0) ready.Enqueue(next, next);
        }
        return result.Length == characterCount ? result.ToString() : string.Empty;
    }

    static void CheckValid(string[] words, Func<string, bool> accepts)
    {
        string order = AlienOrder(words);
        if (!accepts(order)) throw new InvalidOperationException($"Unexpected alien order: {order}");
    }

    static bool IsValidFor(string[] words, string order)
    {
        var rank = new int[26];
        Array.Fill(rank, -1);
        for (int i = 0; i < order.Length; i++)
        {
            int c = order[i] - 'a';
            if (rank[c] != -1) return false;
            rank[c] = i;
        }
        foreach (string word in words)
            foreach (char c in word)
                if (rank[c - 'a'] == -1) return false;
        for (int i = 0; i + 1 < words.Length; i++)
        {
            string a = words[i], b = words[i + 1];
            int j = 0;
            while (j < a.Length && j < b.Length && a[j] == b[j]) j++;
            if (j == b.Length && a.Length > b.Length) return false;
            if (j < a.Length && j < b.Length && rank[a[j] - 'a'] > rank[b[j] - 'a']) return false;
        }
        return true;
    }

    static void Main()
    {
        CheckValid(new[] { "wrt", "wrf", "er", "ett", "rftt" }, order => order == "wertf");
        CheckValid(new[] { "z", "x", "z" }, order => order.Length == 0);
        CheckValid(new[] { "abc", "ab" }, order => order.Length == 0);
        CheckValid(new[] { "z", "z" }, order => order == "z");
        CheckValid(new[] { "a", "b", "d" }, order => IsValidFor(new[] { "a", "b", "d" }, order));
        Console.WriteLine("Alien Dictionary checks passed.");
    }
}
```

## Correctness argument
For any two adjacent lexicographically sorted words, their first differing characters determine the only ordering constraint implied by that pair; later positions do not affect lexicographic comparison. A strict-prefix inversion is impossible and is rejected before graph processing. The character set includes every observed letter, including isolated ones. Edge deduplication keeps indegrees consistent. Kahn's algorithm emits a valid character order exactly when it processes every observed character; otherwise a cycle makes the evidence inconsistent.

## Step-by-step dry run
For wrt and wrf, the first two positions match and t differs from f, producing t -> f. For wrf and er, the first characters differ, producing w -> e. Repeat across adjacent pairs to get w -> e -> r -> t -> f; each ready choice respects the directed constraints.

## Time complexity
Let S be total input characters, V observed distinct letters (at most 26), and E distinct precedence edges. Comparing adjacent words takes O(S); graph work takes O(E + V log V) with the priority queue.

## Space complexity
O(V+E) for observed characters, adjacency sets, indegrees, frontier, and result; input strings are not copied.

## Alternatives and tradeoffs
- FIFO Kahn or DFS reverse postorder can return any valid order in O(S+V+E), without lexicographically minimizing available choices.
- A fixed 26-letter alphabet bounds the priority-queue overhead, but a min-priority frontier makes the tie rule explicit.
- A comparison graph cannot infer order for characters absent from all words; the contract returns only observed characters.

## Common mistakes and gotchas

- Adding edges for every differing character rather than only the first mismatch.
- Comparing all word pairs instead of adjacent pairs in an already sorted sequence.
- Missing the invalid prefix case, such as abc before ab.
- Omitting isolated characters from the result.
- Incrementing indegree for a duplicate edge but decrementing it only once.
- Returning a partial order when Kahn processing detects a cycle.

## Edge-case tests

- One word or repeated identical words.
- A strict-prefix inversion.
- A directed cycle.
- Multiple independent letters with many valid orders.
- Duplicate inferred edges from separate word pairs.

## Reflection questions

1. Why does the first mismatch give the only constraint for an adjacent pair?
2. Why must characters with no edges still appear?
3. How can edge deduplication affect indegree correctness?

## Source
- [Alien Dictionary](https://leetcode.com/problems/alien-dictionary/)
- [NeetCode: Alien Dictionary statement and examples](https://neetcode.io/solutions/alien-dictionary)
