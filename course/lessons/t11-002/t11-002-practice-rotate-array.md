
# arrays and dynamic arrays for algorithmic problem solving — Problem: Rotate Array

# Goals
*   Understand the mechanics of `Fixed-size array` structures and the `In-place update` technique.
*   Master the "Rotate Array" problem using the `In-place reversal` pattern.
*   Learn to manage `Index boundary` conditions to avoid `Off-by-one error` scenarios.
*   Develop the ability to solve array manipulation problems with $O(1)$ extra space.

# Problem statement
Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative. Perform this operation in-place without allocating an extra array of the same size.

# Input constraints
*   `1 <= nums.Length <= 10^5`
*   `0 <= k <= 10^5`
*   The array elements are integers.

# Examples with expected output
*   Input: `nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3` -> Output: `[5, 6, 7, 1, 2, 3, 4]`
*   Input: `nums = [-1, -100, 3, 99]`, `k = 2` -> Output: `[3, 99, -1, -100]`

# Clarifying assumptions
*   Rotating by `nums.Length` results in the same array.
*   If `k > nums.Length`, the effective rotation is `k % nums.Length`.
*   "In-place" means we modify the original array directly, using only $O(1)$ extra space.

# Progressive hints
1.  **The Modular Insight:** If you rotate an array of length 7 by 3, the last 3 elements move to the front. Notice that `k` can be larger than the array length; use `k % length` to find the actual shift.
2.  **The Reversal Pattern:** To rotate in-place, try reversing the entire array first. Then, reverse the first `k` elements, and finally reverse the remaining `n - k` elements.
3.  **Index Management:** Be careful with the `Index boundary` when defining the start and end points for your reversal helper function.

# Complete C# solution
```csharp dsa-solution
using System;

public class Solution {
    public static void Rotate(int[] nums, int k) {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) throw new ArgumentException("Array must be non-empty.", nameof(nums));
        if (k < 0) throw new ArgumentOutOfRangeException(nameof(k));

        int n = nums.Length;
        k %= n;
        if (k == 0) return;

        // Pattern: Reverse all, then reverse parts
        Reverse(nums, 0, n - 1);
        Reverse(nums, 0, k - 1);
        Reverse(nums, k, n - 1);
    }

    private static void Reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start++;
            end--;
        }
    }

    public static void Main() {
        // Test 1
        int[] arr1 = { 1, 2, 3, 4, 5, 6, 7 };
        Rotate(arr1, 3);
        int[] expected1 = { 5, 6, 7, 1, 2, 3, 4 };
        for (int i = 0; i < arr1.Length; i++) 
            if (arr1[i] != expected1[i]) throw new InvalidOperationException("Test 1 failed");

        // Test 2
        int[] arr2 = { -1, -100, 3, 99 };
        Rotate(arr2, 2);
        int[] expected2 = { 3, 99, -1, -100 };
        for (int i = 0; i < arr2.Length; i++) 
            if (arr2[i] != expected2[i]) throw new InvalidOperationException("Test 2 failed");

        // Edge Case: k = 0
        int[] arr3 = { 1, 2 };
        Rotate(arr3, 0);
        if (arr3[0] != 1 || arr3[1] != 2) throw new InvalidOperationException("Edge case k=0 failed");

        // A rotation larger than the array length is reduced modulo its length.
        int[] arr4 = { 1, 2, 3 };
        Rotate(arr4, 4);
        if (arr4[0] != 3 || arr4[1] != 1 || arr4[2] != 2)
            throw new InvalidOperationException("Edge case k > length failed");

        Console.WriteLine("All tests passed!");
    }
}
```

# Correctness argument
The reversal algorithm works because reversing the whole array places the elements that need to move to the front at the beginning, but in reverse order. Reversing the two segments (the first `k` and the remaining `n-k`) restores their original relative order while keeping them in their new positions. This is a standard `In-place update` technique that avoids an `Auxiliary array`.

# Step-by-step dry run
For `nums = [1, 2, 3, 4, 5]`, `k = 2`:
1. `k %= 5` -> `2`.
2. `Reverse(0, 4)`: `[5, 4, 3, 2, 1]`
3. `Reverse(0, 1)`: `[4, 5, 3, 2, 1]`
4. `Reverse(2, 4)`: `[4, 5, 1, 2, 3]`
Result: `[4, 5, 1, 2, 3]`. Correct.

# Time complexity
$O(n)$, where $n$ is the number of elements in the array. We traverse the array elements a constant number of times (reversing the whole array and then the two halves).

# Space complexity
$O(1)$, as we only use a few integer variables for pointers and swapping, regardless of the input size.

# Edge-case tests
*   `k = 0`: The code handles this via `k %= n` and an early return.
*   `nums.Length = 1`: The reversal logic remains valid as `start` will equal `end`.
*   `k = nums.Length`: `k % n` becomes 0, resulting in no change, which is correct.

# Reflection questions
1.  Why is `k %= n` necessary before starting the reversals?
2.  What would happen if we used an `Auxiliary array` instead of the reversal technique? How would the space complexity change?
3.  How does the `In-place reversal` pattern relate to the `Stable relative order` concept?
4.  Source reference: [LeetCode: Rotate Array](https://leetcode.com/problems/rotate-array/description/), [OpenDSA Array-based List](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), and [Microsoft C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays).
