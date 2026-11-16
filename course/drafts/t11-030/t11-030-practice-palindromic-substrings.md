<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Palindromic Substrings

# Goals
- Understand the core principles of sequence and string dynamic programming, with a focus on contiguous versus non-contiguous subproblems.
- Master the **Palindromic Substrings** problem by exploring both interval expansion and dynamic programming perspectives.
- Build independent problem-solving skills using a robust, self-contained C# implementation that validates all constraints and edge cases.

# Problem statement
Given a string `s`, return the number of palindromic substrings in it. 
A string is a palindrome when it reads the same backward as forward. 
A substring is a contiguous sequence of characters within the string. Equal substrings at different indices are counted separately.

# Input constraints
- `1 <= s.length <= 1000`
- `s` consists of lowercase English letters

# Examples with expected output
- Example 1:
  - Input: `s = "abc"`
  - Expected Output: `3`
  - Explanation: Three palindromic substrings: `"a"`, `"b"`, `"c"`.
- Example 2:
  - Input: `s = "aaa"`
  - Expected Output: `6`
  - Explanation: Six palindromic substrings: `"a"`, `"a"`, `"a"`, `"aa"`, `"aa"`, `"aaa"`.

# Clarifying assumptions
- Single-character substrings are always palindromic.
- Substrings are defined by their start and end indices in the original string. Even if two substrings share the exact same character sequence (e.g., the three `"a"`s in `"aaa"`), each distinct index range counts as a separate occurrence.
- The maximum string length of 1000 permits an $O(n^2)$ time complexity approach, making both interval dynamic programming and expand-around-center fully viable.

# Progressive hints
1. **Hint 1 (Distinguishing Substrings and Subsequences):** Recall that a *substring* requires contiguous characters, whereas a subsequence allows skipping characters. For palindromic substrings, you must check contiguous segments.
2. **Hint 2 (Choosing an Approach):** You can solve this either by iterating through every possible center (single characters and gaps between characters) and expanding outward, or by using an interval dynamic programming table `dp[left, right]` indicating whether `s[left...right]` is a palindrome.
3. **Hint 3 (State Transition):** For interval DP, a substring `s[left...right]` is a palindrome if `s[left] == s[right]` and the inner substring `s[left + 1 ... right - 1]` is also a palindrome (with base cases for length 1 and 2).

# Complete C# solution
```csharp dsa-solution
using System;

public class Program
{
    public static void Main()
    {
        // Test cases verifying the problem requirements and edge cases
        RunTest("abc", 3);
        RunTest("aaa", 6);
        RunTest("a", 1);
        RunTest("abba", 6); // "a", "b", "b", "a", "bb", "abba"
        
        Console.WriteLine("All tests passed successfully.");
    }

    public static int CountSubstrings(string s)
    {
        if (string.IsNullOrEmpty(s))
        {
            return 0;
        }

        int n = s.Length;
        int count = 0;
        bool[,] dp = new bool[n, n];

        // Every single character is a palindrome of length 1
        for (int i = 0; i < n; i++)
        {
            dp[i, i] = true;
            count++;
        }

        // Check palindromes of length 2
        for (int i = 0; i < n - 1; i++)
        {
            if (s[i] == s[i + 1])
            {
                dp[i, i + 1] = true;
                count++;
            }
        }

        // Check palindromes of length 3 up to n
        for (int length = 3; length <= n; length++)
        {
            for (int left = 0; left <= n - length; left++)
            {
                int right = left + length - 1;
                if (s[left] == s[right] && dp[left + 1, right - 1])
                {
                    dp[left, right] = true;
                    count++;
                }
            }
        }

        return count;
    }

    private static void RunTest(string input, int expected)
    {
        int result = CountSubstrings(input);
        if (result != expected)
        {
            throw new InvalidOperationException($"Test failed for input '{input}'. Expected: {expected}, Got: {result}");
        }
    }
}
```

# Correctness argument
The interval DP solution correctly identifies all palindromic substrings by building solutions from smaller lengths to larger lengths. 
- **Base cases:** Substrings of length 1 are initialized to true because any single character is a palindrome. Substrings of length 2 are checked directly by comparing adjacent characters.
- **Inductive step:** For any substring of length `length` spanning from index `left` to `right`, it is a palindrome if and only if the outer characters `s[left]` and `s[right]` match *and* the inner substring `dp[left + 1, right - 1]` has already been evaluated as true. 
- Because we iterate strictly by increasing substring lengths, the inner subproblems are always evaluated before the outer subproblems, preventing dependency errors.

# Step-by-step dry run
Consider `s = "abc"`:
1. Initialize `count = 0`, table `dp` of size $3 \times 3$ (all false).
2. **Length 1:**
   - `i = 0 ('a')`: `dp[0, 0] = true`, `count = 1`
   - `i = 1 ('b')`: `dp[1, 1] = true`, `count = 2`
   - `i = 2 ('c')`: `dp[2, 2] = true`, `count = 3`
3. **Length 2:**
   - `i = 0`: `s[0] ('a') != s[1] ('b')`, so `dp[0, 1] = false`
   - `i = 1`: `s[1] ('b') != s[2] ('c')`, so `dp[1, 2] = false`
4. **Length 3:**
   - `left = 0, right = 2`: `s[0] ('a') != s[2] ('c')`, so `dp[0, 2] = false`
5. **Final Result:** Returns `count = 3`.

# Time complexity
- **Time Complexity:** $O(n^2)$, where `n` is the length of string `s`. There are two nested loops controlling the substring length and start index, and each state transition takes $O(1)$ constant time.
- **Space Complexity:** $O(n^2)$ to store the boolean 2D dynamic programming table `dp[left, right]`. (Note: This can be optimized to $O(1)$ space using the expand-around-center approach).

# Space complexity
- The space complexity is $O(n^2)$ due to the boolean table tracking interval states for all pairs `(left, right)`.

# Edge-case tests
- **Single character (`s = "a"`):** Evaluates correctly to `1` using base case initialization.
- **Empty or null string:** Handled safely via `string.IsNullOrEmpty` returning `0`.
- **All identical characters (`s = "aaa"`):** Correctly identifies overlapping palindromes of lengths 1, 2, and 3, accumulating to `6`.

# Reflection questions
1. How does the space complexity change if you switch from an interval DP table to an expand-around-center strategy?
2. What signal indicates that a problem requires contiguous *substring* recurrences rather than non-contiguous *subsequence* recurrences?
3. Why must the loop order iterate by increasing substring length rather than starting index?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/palindromic-substrings/)
