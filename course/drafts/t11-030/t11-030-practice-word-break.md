<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Word Break

# Goals
- Learn how to solve sequence and string dynamic programming problems independently.
- Master the **Word Break** problem using a reachable prefix state pattern and dictionary boundary checks.
- Practice writing fully working, self-contained C# code with rigorous assertion checks.

# Problem statement
Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. Dictionary words may be reused multiple times.

# Input constraints
- `1 <= s.length <= 300`
- `1 <= wordDict.length <= 1000`
- `1 <= wordDict[i].length <= 20`
- `s` and dictionary words contain lowercase English letters.
- Dictionary words are unique.

# Examples with expected output
- Input: `s = "leetcode"`, `wordDict = ["leet", "code"]`
  - Expected output: `true`
- Input: `s = "applepenapple"`, `wordDict = ["apple", "pen"]`
  - Expected output: `true`
- Input: `s = "catsandog"`, `wordDict = ["cats", "dog", "sand", "and", "cat"]`
  - Expected output: `false`

# Clarifying assumptions
- An empty prefix before the start of the string (index `0`) is always reachable as a valid base case.
- Multiple dictionary words can be matched back-to-back to form valid segmentations.
- Order matters in the sense that segments must reconstruct the original string `s` continuously from left to right.

# Progressive hints
1. **Hint 1 (State definition):** Think about whether a prefix of length `i` can be segmented. Define a boolean array `dp` of size `s.Length + 1`, where `dp[i]` indicates whether the substring `s[0..i-1]` can be segmented using dictionary words.
2. **Hint 2 (Base case):** What is the truth value for an empty prefix (`dp[0]`)? Setting `dp[0] = true` gives your dynamic programming recurrence a solid foundation.
3. **Hint 3 (Transitions):** To determine if `dp[i]` is true, look back at all possible split points `j` from `0` to `i-1`. If `dp[j]` is true and the substring from index `j` to `i-1` exists in the dictionary, then `dp[i]` becomes true.
4. **Hint 4 (Optimization for lookups):** Searching the `wordDict` list repeatedly is slow. Convert `wordDict` into a hash set for $O(1)$ dictionary word membership checks.

# Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

namespace SequenceDpLesson
{
    public class Program
    {
        public static bool WordBreak(string s, IList<string> wordDict)
        {
            if (string.IsNullOrEmpty(s))
            {
                return true;
            }

            HashSet<string> wordSet = new HashSet<string>(wordDict);
            int n = s.Length;
            bool[] dp = new bool[n + 1];
            dp[0] = true;

            for (int i = 1; i <= n; i++)
            {
                for (int j = 0; j < i; j++)
                {
                    if (dp[j])
                    {
                        string word = s.Substring(j, i - j);
                        if (wordSet.Contains(word))
                        {
                            dp[i] = true;
                            break;
                        }
                    }
                }
            }

            return dp[n];
        }

        public static void Main(string[] args)
        {
            // Example 1
            string s1 = "leetcode";
            IList<string> dict1 = new List<string> { "leet", "code" };
            bool res1 = WordBreak(s1, dict1);
            if (res1 != true)
            {
                throw new InvalidOperationException("Example 1 failed: expected true, got false.");
            }

            // Example 2
            string s2 = "applepenapple";
            IList<string> dict2 = new List<string> { "apple", "pen" };
            bool res2 = WordBreak(s2, dict2);
            if (res2 != true)
            {
                throw new InvalidOperationException("Example 2 failed: expected true, got false.");
            }

            // Example 3
            string s3 = "catsandog";
            IList<string> dict3 = new List<string> { "cats", "dog", "sand", "and", "cat" };
            bool res3 = WordBreak(s3, dict3);
            if (res3 != false)
            {
                throw new InvalidOperationException("Example 3 failed: expected false, got true.");
            }

            // Edge Case: Single character matching dictionary
            string s4 = "a";
            IList<string> dict4 = new List<string> { "a" };
            if (WordBreak(s4, dict4) != true)
            {
                throw new InvalidOperationException("Edge Case 1 failed.");
            }

            // Edge Case: Single character missing from dictionary
            string s5 = "x";
            IList<string> dict5 = new List<string> { "a" };
            if (WordBreak(s5, dict5) != false)
            {
                throw new InvalidOperationException("Edge Case 2 failed.");
            }

            Console.WriteLine("All test cases passed successfully.");
        }
    }
}
```

# Correctness argument
The algorithm uses dynamic programming over prefix reachability. By setting `dp[0] = true`, we establish that an empty prefix is validly segmentable. For each index `i` from `1` to `n`, we test all possible prior boundary indices `j`. If a prefix of length `j` is reachable (`dp[j] == true`) and the remaining slice `s[j..i-1]` is present in the dictionary, then the prefix of length `i` is also reachable (`dp[i] = true`). Because we check every possible split point for each prefix in increasing order of length, no valid segmentation path is missed.

# Step-by-step dry run
Consider `s = "leet"`, `wordDict = ["leet", "code"]`.
1. Initialize `dp` array of size `5`: `[true, false, false, false, false]`.
2. `i = 1` (`s[0] = 'l'`):
   - `j = 0`: `dp[0]` is `true`. Substring `s[0..0] = "l"`. Not in dictionary.
   - `dp[1]` remains `false`.
3. `i = 2` (`s[0..1] = "le"`):
   - `j = 0`: Substring `"le"` not in dict.
   - `j = 1`: `dp[1]` is `false`.
   - `dp[2]` remains `false`.
4. `i = 3` (`s[0..2] = "lee"`):
   - Substring `"lee"` not in dict. `dp[3]` remains `false`.
5. `i = 4` (`s[0..3] = "leet"`):
   - `j = 0`: `dp[0]` is `true`. Substring `s[0..3] = "leet"`. Found in dictionary! Set `dp[4] = true`, break inner loop.
6. Return `dp[4]`, which is `true`.

# Time complexity
- Converting the dictionary to a hash set takes $O(W \cdot M)$ time, where $W$ is the number of words and $M$ is the maximum word length.
- The outer loop runs $n$ times (where $n$ is `s.Length`).
- The inner loop runs $i$ times, resulting in $O(n^2)$ substring checks.
- Each substring extraction and hash set lookup takes $O(M)$ time.
- Total time complexity is $O(n^2 \cdot M + W \cdot M)$, which is well within acceptable limits for $n \le 300$.

# Space complexity
- The `dp` boolean array takes $O(n)$ space.
- The `wordSet` hash set stores $W$ words, taking $O(W \cdot M)$ space.
- Total space complexity is $O(n + W \cdot M)$.

# Edge-case tests
- **Minimum length string matching:** `s = "a"`, `wordDict = ["a"]` -> returns `true`.
- **Minimum length string mismatch:** `s = "x"`, `wordDict = ["a"]` -> returns `false`.
- **Repeated word usage:** `s = "aaaaaaa"`, `wordDict = ["aaaa", "aa"]` -> checks sub-segmentations successfully.
- **Unreachable suffix:** `s = "catsandog"`, where `"sand"` matches but leaves `"og"`, which cannot be segmented.

# Reflection questions
1. How would the state definition and transitions change if you needed to return the actual list of strings instead of just a boolean?
2. What signal indicates that a greedy approach (e.g., always picking the longest matching dictionary prefix from the left) would fail on this problem?
3. How does converting `wordDict` to a `HashSet` affect performance compared to searching a raw list linearly inside the inner loop?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/word-break/)
