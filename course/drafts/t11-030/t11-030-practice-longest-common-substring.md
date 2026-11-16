<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Maximum Length of Repeated Subarray

# Goals


**Assigned problem: Maximum Length of Repeated Subarray**- Understand the core principles of sequence and string dynamic programming by solving a representative contiguous sequence matching problem.
- Master the difference between contiguous substrings and non-contiguous subsequences.
- Implement a complete, self-contained, and rigorously tested C# solution for finding the maximum length of a repeated subarray.

# Problem statement
Given two integer arrays `nums1` and `nums2`, return the maximum length of a contiguous subarray that appears in both arrays.

# Input constraints
- `1 <= nums1.length, nums2.length <= 1000`
- `0 <= nums1[i], nums2[i] <= 100`

# Examples with expected output
- Example 1:
  - Input: `nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]`
  - Expected Output: `3`
- Example 2:
  - Input: `nums1 = [0,0,0,0,0], nums2 = [0,0,0,0,0]`
  - Expected Output: `5`

# Clarifying assumptions
- A subarray is a contiguous sequence of elements within an array.
- The matching elements must align consecutively in both `nums1` and `nums2`.
- If no common contiguous subarray exists, the maximum length is `0`.

# Progressive hints
- Hint 1 (Recognizing Contiguity): Unlike the Longest Common Subsequence (LCS) problem where characters/elements can be skipped, a *substring* requires an unbroken chain of identical matches. If `nums1[i] != nums2[j]`, what must happen to the length of the common subarray ending at those exact indices?
- Hint 2 (Defining the State): Let `dp[i, j]` represent the length of the longest common contiguous subarray that ends *specifically* at index `i - 1` of `nums1` and index `j - 1` of `nums2`.
- Hint 3 (Formulating the Transition): When `nums1[i - 1] == nums2[j - 1]`, how does `dp[i, j]` relate to `dp[i - 1, j - 1]`? When they do not match, what should `dp[i, j]` be?
- Hint 4 (Tracking the Maximum): Because the longest common subarray can end anywhere in the two arrays, remember to track the global maximum value encountered across all cells of your DP table.

# Complete C# solution
```csharp dsa-solution
using System;

namespace SequenceDpLesson
{
    public class Program
    {
        public static int FindLength(int[] nums1, int[] nums2)
        {
            if (nums1 == null || nums2 == null)
            {
                throw new ArgumentNullException("Input arrays cannot be null.");
            }

            int n = nums1.Length;
            int m = nums2.Length;
            int[,] dp = new int[n + 1, m + 1];
            int maxLength = 0;

            for (int i = 1; i <= n; i++)
            {
                for (int j = 1; j <= m; j++)
                {
                    if (nums1[i - 1] == nums2[j - 1])
                    {
                        dp[i, j] = dp[i - 1, j - 1] + 1;
                        if (dp[i, j] > maxLength)
                        {
                            maxLength = dp[i, j];
                        }
                    }
                    else
                    {
                        dp[i, j] = 0;
                    }
                }
            }

            return maxLength;
        }

        public static void Main(string[] args)
        {
            // Example 1 verification
            int[] nums1Ex1 = new int[] { 1, 2, 3, 2, 1 };
            int[] nums2Ex1 = new int[] { 3, 2, 1, 4, 7 };
            int resultEx1 = FindLength(nums1Ex1, nums2Ex1);
            if (resultEx1 != 3)
            {
                throw new InvalidOperationException($"Example 1 failed: expected 3, got {resultEx1}");
            }

            // Example 2 verification
            int[] nums1Ex2 = new int[] { 0, 0, 0, 0, 0 };
            int[] nums2Ex2 = new int[] { 0, 0, 0, 0, 0 };
            int resultEx2 = FindLength(nums1Ex2, nums2Ex2);
            if (resultEx2 != 5)
            {
                throw new InvalidOperationException($"Example 2 failed: expected 5, got {resultEx2}");
            }

            // Edge Case 1: Disjoint arrays
            int[] nums1Edge1 = new int[] { 1, 2, 3 };
            int[] nums2Edge1 = new int[] { 4, 5, 6 };
            int resultEdge1 = FindLength(nums1Edge1, nums2Edge1);
            if (resultEdge1 != 0)
            {
                throw new InvalidOperationException($"Edge case 1 failed: expected 0, got {resultEdge1}");
            }

            // Edge Case 2: Single matching element
            int[] nums1Edge2 = new int[] { 5 };
            int[] nums2Edge2 = new int[] { 5 };
            int resultEdge2 = FindLength(nums1Edge2, nums2Edge2);
            if (resultEdge2 != 1)
            {
                throw new InvalidOperationException($"Edge case 2 failed: expected 1, got {resultEdge2}");
            }

            Console.WriteLine("All tests passed successfully.");
        }
    }
}
```

# Correctness argument
The dynamic programming formulation relies on optimal substructure for contiguous segments. Let `dp[i, j]` be the length of the longest repeated subarray ending with `nums1[i-1]` and `nums2[j-1]`. 
1. If `nums1[i-1] == nums2[j-1]`, any common subarray ending at these positions extends the common subarray ending immediately before them (`nums1[i-2]` and `nums2[j-2]`). Thus, `dp[i, j] = dp[i-1, j-1] + 1`.
2. If `nums1[i-1] != nums2[j-1]`, they cannot form part of the same contiguous match, so the length of the common subarray ending here is `0`.
Since every pair of prefixes is evaluated systematically, and the global maximum is updated at each step, the algorithm correctly identifies the maximum length.

# Step-by-step dry run
Consider a mini-trace with `nums1 = [1, 2]`, `nums2 = [2, 1]`.
- Dimensions: `n = 2`, `m = 2`. Table size is `3 x 3` (including zero-initialization padding).
- `i = 1` (`nums1[0] = 1`):
  - `j = 1` (`nums2[0] = 2`): Mismatch (`1 != 2`). `dp[1, 1] = 0`.
  - `j = 2` (`nums2[1] = 1`): Match (`1 == 1`). `dp[1, 2] = dp[0, 1] + 1 = 0 + 1 = 1`. `maxLength` updates to `1`.
- `i = 2` (`nums1[1] = 2`):
  - `j = 1` (`nums2[0] = 2`): Match (`2 == 2`). `dp[2, 1] = dp[1, 0] + 1 = 0 + 1 = 1`. `maxLength` remains `1`.
  - `j = 2` (`nums2[1] = 1`): Mismatch (`2 != 1`). `dp[2, 2] = 0`.
- Final `maxLength` returned is `1`.

# Time complexity
The algorithm uses a nested loop running `n` times for the outer loop and `m` times for the inner loop, where `n` is the length of `nums1` and `m` is the length of `nums2`. Each table cell lookup and update takes $O(1)$ time. 
- Total Time Complexity: $O(n \times m)$

# Space complexity
The algorithm allocates a 2D integer array of size `(n + 1) * (m + 1)` to store the dynamic programming states.
- Total Space Complexity: $O(n \times m)$
*(Note: Because each row depends only on the immediately preceding row, space can be optimized to $O(\min(n, m))$ using rolling arrays, though the 2D table straightforwardly matches the core recurrence).*

# Edge-case tests
- Completely disjoint arrays (returns `0`).
- Identical single-element arrays (returns `1`).
- Arrays of maximum constraints length (`1000` elements) with repeating values.
- Arrays where the longest common subarray occurs at the very beginning versus the very end.

# Reflection questions
1. How does the recurrence relation for a contiguous *substring* differ from a non-contiguous *subsequence*? What happens to the state value when a mismatch occurs in each case?
2. If memory is constrained to $O(\min(n, m))$ using a rolling-row optimization, how would you adapt the table updates, and would reconstruction be affected?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)
