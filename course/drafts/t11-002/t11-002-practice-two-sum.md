<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Problem: Two Sum

# Goals
* Understand the mechanics of arrays and dynamic arrays in C#.
* Learn to solve the "Two Sum" problem using an efficient linear scan pattern.
* Practice managing array indices and avoiding common off-by-one errors.
* Develop the ability to trade space for time complexity using auxiliary data structures.

# Problem statement
Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to the `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.

# Input constraints
* `2 <= nums.Length <= 10^4`
* `-10^9 <= nums[i] <= 10^9`
* `-10^9 <= target <= 10^9`
* Exactly one valid solution exists.

# Examples with expected output
* Input: `nums = [2, 7, 11, 15]`, `target = 9` -> Output: `[0, 1]`
* Input: `nums = [3, 2, 4]`, `target = 6` -> Output: `[1, 2]`
* Input: `nums = [3, 3]`, `target = 6` -> Output: `[0, 1]`

# Clarifying assumptions
* The output indices can be returned in any order.
* The solution must be efficient; a brute-force approach checking every pair is acceptable for small inputs but we aim for a one-pass scan using a dictionary (complement lookup).

# Progressive hints
1. **Brute Force:** Can you use two nested loops to check every possible pair `(i, j)` where `i != j`?
2. **Optimization:** Instead of a second loop, can you store the numbers you have already seen in a lookup table (a `Dictionary<int, int>`)?
3. **Complement Lookup:** For each number `x`, you need to find if `target - x` exists in your "seen" collection. If it does, you have found the pair.

# Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public class Solution {
    public static int[] TwoSum(int[] nums, int target) {
        // We use a Dictionary to store the value as the key and its index as the value.
        // This allows O(1) average time complexity for lookups.
        Dictionary<int, int> seen = new Dictionary<int, int>();
        
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            
            if (seen.ContainsKey(complement)) {
                return new int[] { seen[complement], i };
            }
            
            // Only add if not present to handle cases like [3, 3] with target 6
            if (!seen.ContainsKey(nums[i])) {
                seen.Add(nums[i], i);
            }
        }
        throw new InvalidOperationException("No solution found.");
    }

    public static void Main() {
        // Test Case 1
        int[] res1 = TwoSum(new int[] { 2, 7, 11, 15 }, 9);
        if (res1[0] != 0 || res1[1] != 1) throw new InvalidOperationException("Test 1 failed");

        // Test Case 2
        int[] res2 = TwoSum(new int[] { 3, 2, 4 }, 6);
        if (res2[0] != 1 || res2[1] != 2) throw new InvalidOperationException("Test 2 failed");

        // Test Case 3
        int[] res3 = TwoSum(new int[] { 3, 3 }, 6);
        if (res3[0] != 0 || res3[1] != 1) throw new InvalidOperationException("Test 3 failed");

        Console.WriteLine("All tests passed!");
    }
}
```

# Correctness argument
The algorithm performs a single linear scan of the array. For every element `nums[i]`, it calculates the `complement` required to reach the `target`. By checking the `seen` dictionary, we verify if that complement appeared previously. Since the problem guarantees exactly one solution, the dictionary will eventually contain the complement for the second element of the pair, ensuring we return the correct indices.

# Step-by-step dry run
Input: `nums = [3, 2, 4]`, `target = 6`
1. `i = 0`, `nums[0] = 3`. Complement = `6 - 3 = 3`. `seen` is empty. Add `3: 0` to `seen`.
2. `i = 1`, `nums[1] = 2`. Complement = `6 - 2 = 4`. `4` is not in `seen`. Add `2: 1` to `seen`.
3. `i = 2`, `nums[2] = 4`. Complement = `6 - 4 = 2`. `2` is in `seen` at index `1`.
4. Return `[1, 2]`.

# Time complexity
* **O(n)**: We traverse the array exactly once, and dictionary lookups/insertions are O(1) on average.

# Space complexity
* **O(n)**: In the worst case, we store nearly all elements of the array in the dictionary.

# Edge-case tests
* **Two elements:** `[3, 3]` with target `6` is handled correctly by checking the dictionary before adding the current element.
* **Negative numbers:** The logic `target - nums[i]` works correctly with negative integers.
* **Large values:** The use of `int` is sufficient given the constraints.

# Reflection questions
1. Why is a `Dictionary` (hash map) preferred over a nested loop for this problem?
2. How would the space complexity change if we used a brute-force approach?
3. What happens if the input array is empty? Does the current code handle it, or does it violate the constraints?
4. Reference: [OpenDSA ListArray](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html) and [Microsoft List<T> Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity). How do these concepts of contiguous storage relate to the efficiency of the array traversal used here?

*Automatically generated draft.*
