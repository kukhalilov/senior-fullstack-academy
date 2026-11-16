<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Longest Increasing Subsequence

# Goals
- Master the Longest Increasing Subsequence problem using dynamic programming.
- Learn to build prefix-based states and recurrence relations for sequence problems.
- Implement an executable C# solution that validates edge cases and throws an `InvalidOperationException` on failure.

# Problem statement
Return the length of the longest strictly increasing subsequence in an integer array.

# Input constraints
- `1 <= nums.length <= 2500`
- `-10000 <= nums[i] <= 10000`
- The problem includes an O(n log n) follow-up

# Examples with expected output
- Input: `nums=[10,9,2,5,3,7,101,18]` | Expected Output: `4`
- Input: `nums=[0,1,0,3,2,3]` | Expected Output: `4`
- Input: `nums=[7,7,7,7,7,7,7]` | Expected Output: `1`

# Clarifying assumptions
- A subsequence preserves the relative order of elements from the original array without needing them to be contiguous.
- Strictly increasing means every element in the subsequence must be strictly greater than the preceding element (no equality allowed).
- An array with identical elements (e.g., all 7s) has a maximum strictly increasing subsequence length of 1.

# Progressive hints
1. **Hint 1 (State definition):** Think about what defines a subproblem for an element at index $i$. Let `dp[i]` represent the length of the longest strictly increasing subsequence that ends *at* index $i$.
2. **Hint 2 (Transitions):** To compute `dp[i]`, look back at all previous indices $j < i$. If `nums[i] > nums[j]`, you can extend the increasing subsequence ending at $j$ by appending `nums[i]`.
3. **Hint 3 (Base case):** Every single element by itself is a valid strictly increasing subsequence of length 1. Therefore, initialize every entry in the `dp` array to 1.
4. **Hint 4 (Final answer):** The overall answer is not necessarily `dp[n-1]`, because the longest subsequence might end at any index in the array. Take the maximum value across all entries in the `dp` array.

# Complete C# solution
```csharp dsa-solution
using System;

namespace SequenceDpLesson
{
    public static class Program
    {
        public static int LengthOfLIS(int[] nums)
        {
            if (nums == null || nums.Length == 0)
            {
                return 0;
            }

            int n = nums.Length;
            int[] dp = new int[n];
            int maxLength = 0;

            for (int i = 0; i < n; i++)
            {
                dp[i] = 1;
                for (int j = 0; j < i; j++)
                {
                    if (nums[i] > nums[j])
                    {
                        dp[i] = Math.Max(dp[i], dp[j] + 1);
                    }
                }
                maxLength = Math.Max(maxLength, dp[i]);
            }

            return maxLength;
        }

        public static void Main(string[] args)
        {
            // Example 1
            int[] ex1 = { 10, 9, 2, 5, 3, 7, 101, 18 };
            int res1 = LengthOfLIS(ex1);
            if (res1 != 4)
            {
                throw new InvalidOperationException($"Example 1 failed. Expected 4, got {res1}");
            }

            // Example 2
            int[] ex2 = { 0, 1, 0, 3, 2, 3 };
            int res2 = LengthOfLIS(ex2);
            if (res2 != 4)
            {
                throw new InvalidOperationException($"Example 2 failed. Expected 4, got {res2}");
            }

            // Example 3
            int[] ex3 = { 7, 7, 7, 7, 7, 7, 7 };
            int res3 = LengthOfLIS(ex3);
            if (res3 != 1)
            {
                throw new InvalidOperationException($"Example 3 failed. Expected 1, got {res3}");
            }

            // Edge-case test: Single element
            int[] edgeSingle = { 42 };
            int resSingle = LengthOfLIS(edgeSingle);
            if (resSingle != 1)
            {
                throw new InvalidOperationException($"Edge case single element failed. Expected 1, got {resSingle}");
            }

            // Edge-case test: Strictly decreasing array
            int[] edgeDec = { 5, 4, 3, 2, 1 };
            int resDec = LengthOfLIS(edgeDec);
            if (resDec != 1)
            {
                throw new InvalidOperationException($"Edge case decreasing array failed. Expected 1, got {resDec}");
            }

            Console.WriteLine("All checks passed successfully.");
        }
    }
}
```

# Correctness argument
The dynamic programming formulation correctly considers all possible ending positions for a strictly increasing subsequence. By defining `dp[i]` as the length of the longest strictly increasing subsequence ending at index $i$, we ensure that every valid subsequence terminating at `nums[i]` is evaluated by checking all prior valid endpoints $j < i$ where `nums[i] > nums[j]`. Initializing all `dp` entries to 1 guarantees that single-element subsequences are accounted for. Taking the maximum value across the entire `dp` array ensures we capture the global optimum regardless of where it terminates.

# Step-by-step dry run
Consider the input array: `nums = [10, 9, 2, 5]`
- `i = 0`, `nums[0] = 10`:
  - `dp[0] = 1`.
  - `maxLength = 1`.
  - `dp` array: `[1, 0, 0, 0]`
- `i = 1`, `nums[1] = 9`:
  - `dp[1] = 1`. Check `j = 0`: `nums[1] > nums[0]` (`9 > 10`) is false.
  - `maxLength = max(1, 1) = 1`.
  - `dp` array: `[1, 1, 0, 0]`
- `i = 2`, `nums[2] = 2`:
  - `dp[2] = 1`. Check `j = 0` (`2 > 10` false), `j = 1` (`2 > 9` false).
  - `maxLength = max(1, 1) = 1`.
  - `dp` array: `[1, 1, 1, 0]`
- `i = 3`, `nums[3] = 5`:
  - `dp[3] = 1`. Check `j = 0` (`5 > 10` false), `j = 1` (`5 > 9` false), `j = 2` (`5 > 2` **true**, `dp[3] = max(1, dp[2] + 1) = 2`).
  - `maxLength = max(1, 2) = 2`.
  - `dp` array: `[1, 1, 1, 2]`
- Final result: `maxLength = 2` (subsequence: `[2, 5]`).

# Time complexity
The outer loop runs $n$ times. For each iteration $i$, the inner loop runs $i$ times. This results in total operations proportional to $1 + 2 + \dots + (n - 1) = \frac{n(n - 1)}{2}$, giving a time complexity of $O(n^2)$.

# Space complexity
We allocate a single 1D array `dp` of size $n$ to store the state for each prefix ending position. This requires $O(n)$ auxiliary space.

# Edge-case tests
- **Single element array (`[42]`):** The loop runs once, `dp[0] = 1`, returns `1`.
- **Strictly decreasing array (`[5, 4, 3, 2, 1]`):** No element is ever greater than a preceding element; all `dp` entries remain `1`, returns `1`.
- **All identical elements (`[7, 7, 7, 7]`):** Strict inequality (`nums[i] > nums[j]`) prevents extension, returns `1`.

# Reflection questions
1. How would the recurrence relation change if we wanted a *non-decreasing* subsequence instead of a *strictly increasing* subsequence?
2. What structural property of the problem allows us to achieve an $O(n \log n)$ time complexity using a tails array and binary search instead of an $O(n^2)$ scan?
3. Why is taking the maximum value over the entire `dp` array required at the end, rather than simply returning the final element `dp[n-1]`?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/longest-increasing-subsequence/)
