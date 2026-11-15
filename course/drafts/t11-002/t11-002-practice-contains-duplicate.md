<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Problem: Contains Duplicate

# Goals
*   Understand the fundamental structure of arrays and dynamic arrays in C#.
*   Learn to identify when to use auxiliary storage (like a `HashSet`) to optimize search operations.
*   Practice solving the "Contains Duplicate" problem using membership tracking.
*   Develop skills in managing array traversal and early exit patterns.

# Problem statement
Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.

# Input constraints
*   `1 <= nums.Length <= 10^5`
*   `-10^9 <= nums[i] <= 10^9`

# Examples with expected output
*   `nums = [1, 2, 3, 1]` -> `true`
*   `nums = [1, 2, 3, 4]` -> `false`
*   `nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]` -> `true`

# Clarifying assumptions
*   The array may contain negative numbers.
*   An empty array is not possible per the constraints, but a single-element array always returns `false`.
*   We prioritize time efficiency over space efficiency.

# Progressive hints
1.  **Brute Force:** You could compare every element with every other element using nested loops. What is the time complexity of this approach?
2.  **Sorting:** If you sort the array first, duplicates will be adjacent. How does sorting affect the time complexity?
3.  **Membership Tracking:** Can you use a data structure to remember which numbers you have already seen while scanning the array once?
4.  **API Selection:** In C#, which collection allows for fast (constant time) lookups to check if an item exists? (Hint: See `System.Collections.Generic.HashSet<T>`).

# Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public class Solution
{
    public static bool ContainsDuplicate(int[] nums)
    {
        // Using a HashSet for O(1) average time complexity lookups
        HashSet<int> seen = new HashSet<int>();
        
        foreach (int num in nums)
        {
            // If Add returns false, the element is already in the set
            if (!seen.Add(num))
            {
                return true;
            }
        }
        
        return false;
    }

    public static void Main()
    {
        // Test Case 1
        if (ContainsDuplicate(new int[] { 1, 2, 3, 1 }) != true) 
            throw new InvalidOperationException("Failed Test 1");
            
        // Test Case 2
        if (ContainsDuplicate(new int[] { 1, 2, 3, 4 }) != false) 
            throw new InvalidOperationException("Failed Test 2");
            
        // Test Case 3
        if (ContainsDuplicate(new int[] { 1, 1, 1, 3, 3, 4, 3, 2, 4, 2 }) != true) 
            throw new InvalidOperationException("Failed Test 3");

        Console.WriteLine("All tests passed successfully.");
    }
}
```

# Correctness argument
The algorithm performs a linear scan of the input array. For each element, it attempts to add the value to a `HashSet`. The `HashSet.Add` method returns `false` if the element is already present, which correctly identifies a duplicate. Since we return `true` immediately upon finding the first duplicate, we satisfy the "early exit" requirement. If the loop completes, no duplicates exist.

# Step-by-step dry run
Input: `[1, 2, 3, 1]`
1.  Initialize empty `HashSet`.
2.  Index 0: `num = 1`. `seen.Add(1)` is `true`. Set: `{1}`.
3.  Index 1: `num = 2`. `seen.Add(2)` is `true`. Set: `{1, 2}`.
4.  Index 2: `num = 3`. `seen.Add(3)` is `true`. Set: `{1, 2, 3}`.
5.  Index 3: `num = 1`. `seen.Add(1)` is `false` (already exists).
6.  Return `true`.

# Time complexity
*   **Time:** O(n), where `n` is the number of elements in the array. We traverse the array once, and `HashSet` operations (Add/Contains) are O(1) on average.
*   **Space:** O(n), as in the worst case (no duplicates), we store all `n` elements in the `HashSet`.

# Space complexity
The space complexity is O(n) because we maintain an auxiliary `HashSet` that stores up to `n` unique integers from the input array.

# Edge-case tests
*   **Single element:** `[1]` -> `false`.
*   **Two identical elements:** `[1, 1]` -> `true`.
*   **Large values:** `[1000000000, -1000000000]` -> `false`.

# Reflection questions
1.  Why is a `HashSet` more efficient than a nested loop for this problem?
2.  If the input array was already sorted, could you solve this with O(1) extra space? How?
3.  What happens to the `HashSet` performance if many elements have the same hash code (a "collision")?
4.  How does the `HashSet` internal capacity relate to the "Dynamic array" concept discussed in the lesson?

*Source: [https://leetcode.com/problems/two-sum/description/](https://leetcode.com/problems/two-sum/description/), [https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2?view=net-10.0](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2?view=net-10.0)*
