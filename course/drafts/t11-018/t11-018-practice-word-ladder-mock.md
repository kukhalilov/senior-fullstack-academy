# timed mock interviews and spaced problem rehearsal — Problem: Word Ladder

## Goals
- Model one-character transformations as an unweighted graph.
- Use BFS to find a shortest path measured in words.
- Explain when to mark vertices visited and how bidirectional BFS changes the work.

## Problem statement
Given `beginWord`, `endWord`, and a dictionary, return the number of words in a shortest sequence from begin to end where adjacent words differ by exactly one letter and every transformed word belongs to the dictionary. Return 0 if no sequence exists.

## Input constraints
- Words have length 1 through 10, consist of lowercase English letters, and have equal length.
- `wordList` contains at most 5,000 unique words.
- `beginWord != endWord`; begin need not be in the list.
- The end word must appear in the list for a path to exist.

## Examples with expected output
- `hit`, `cog`, [`hot`,`dot`,`dog`,`lot`,`log`,`cog`] -> `5`.
- `hit`, `cog`, [`hot`,`dot`,`dog`,`lot`,`log`] -> `0`.
- `a`, `c`, [`b`,`c`] -> `2`.

## Clarifying assumptions
- The returned length counts words, including both endpoints, not edges.
- Only lowercase single-character substitutions are allowed; a transformed word must be in the dictionary.
- `beginWord` is allowed even when it is absent from `wordList`.

## Progressive hints
1. Treat each valid word as a vertex; an edge connects words with one differing position.
2. BFS finds a shortest path in an unweighted graph.
3. Generate neighbors by changing each character through `a` to `z`; use a hash set for membership.
4. Remove a discovered word from `unvisited` when enqueuing it, so it enters the queue once. Increment the distance by layers.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int LadderLength(string beginWord, string endWord, IList<string> wordList)
    {
        var unvisited = new HashSet<string>(wordList, StringComparer.Ordinal);
        if (!unvisited.Contains(endWord)) return 0;

        var queue = new Queue<string>();
        queue.Enqueue(beginWord);
        int wordsInPath = 1;
        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            for (int i = 0; i < levelSize; i++)
            {
                string current = queue.Dequeue();
                if (current == endWord) return wordsInPath;
                char[] chars = current.ToCharArray();
                for (int position = 0; position < chars.Length; position++)
                {
                    char original = chars[position];
                    for (char letter = 'a'; letter <= 'z'; letter++)
                    {
                        if (letter == original) continue;
                        chars[position] = letter;
                        string next = new string(chars);
                        if (unvisited.Remove(next)) queue.Enqueue(next);
                    }
                    chars[position] = original;
                }
            }
            wordsInPath++;
        }
        return 0;
    }

    static void Check(int expected, string begin, string end, string[] words)
    {
        int actual = LadderLength(begin, end, words);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(5, "hit", "cog", new[] { "hot", "dot", "dog", "lot", "log", "cog" });
        Check(0, "hit", "cog", new[] { "hot", "dot", "dog", "lot", "log" });
        Check(2, "a", "c", new[] { "b", "c" });
        Check(1, "same", "same", new[] { "same" });
        Check(0, "hit", "cog", Array.Empty<string>());
        Console.WriteLine("Word Ladder checks passed.");
    }
}
```

## Correctness argument
BFS processes vertices in nondecreasing edge distance from `beginWord`. The generated neighbors are exactly the dictionary words one legal substitution away. Removing a word from `unvisited` when enqueued marks its shortest distance on first discovery and prevents duplicate queue entries. Each queue layer has one fixed number of words in a shortest path from the start, beginning at one. Therefore the first time `endWord` is dequeued its word-count distance is minimal; exhaustion means no path exists.

## Step-by-step dry run
For `hit` to `cog`, the levels are `{hit}`, `{hot}`, `{dot,lot}`, `{dog,log}`, then `{cog}`. Their path word counts are 1 through 5. `cog` is removed from `unvisited` when enqueued and returned when dequeued at level count 5.

## Time complexity
With mutation-generated neighbors, at most each reachable dictionary word is enqueued once and each dequeued word tries 25 substitutions at each of L positions. Creating and hashing each string costs O(L), so expected time is O(N * L * 26 * L) under ordinary string hashing; often described as O(N * L * 26) when treating word lookup as O(1), but this code materializes length-L strings. N is dictionary size plus the start.

## Space complexity
O(N * L) for stored words and queue strings, excluding the input list's existing storage. Hash-set and queue references are O(N), and generated candidate strings are temporary O(L).

## Alternatives and tradeoffs
- Bidirectional BFS searches from both ends and expands the smaller frontier; it can reduce explored states in favorable graphs but needs careful distance/visited coordination.
- Precomputed wildcard patterns can reduce repeated mutation work for large query sets, at the cost of pattern strings and adjacency buckets.
- Graph construction followed by BFS is explicit but can use substantial memory for all edges.

## Common mistakes and gotchas
- Returning edge count instead of word count; initialize level count to one.
- Re-enqueueing already visited words, which can cause repeated work.
- Marking visited only at dequeue, allowing duplicates in the same frontier.
- Forgetting to restore a character before moving to the next position.
- Treating the begin word's absence from the dictionary as failure.

## Edge-case tests
- End word absent.
- Direct one-letter transformation.
- Begin equals end (the canonical statement excludes it; implementation returns one if called).
- No route despite some reachable intermediate words.
- Longer paths with branches.

## Reflection questions
1. Why is BFS necessary for shortest path in this unweighted graph?
2. Why is removal at enqueue safe?
3. What additional state is needed for bidirectional BFS to return the correct word count?

## Source
- [Word Ladder](https://leetcode.com/problems/word-ladder/)
