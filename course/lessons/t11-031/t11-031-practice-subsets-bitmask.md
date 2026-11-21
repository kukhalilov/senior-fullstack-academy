# bitwise operations, masks, and subset enumeration — Problem: Subsets

# Goals

- Associate one bit with each input position and enumerate every mask from zero to 2^n-1.
- Emit an element exactly when its corresponding bit is set.
- Account for both the exponential number of subsets and the work to materialize them.
# Problem statement

Return all subsets of unique input values, including the empty subset, in any order.

# Input constraints

- 1 <= nums.length <= 10
- -10 <= nums[i] <= 10
- All values are unique

# Examples with expected output

- `nums=[1,2,3]` → `all eight subsets`
- `nums=[0]` → `[], [0]`

# Clarifying assumptions

Input values are unique and n is at most 10, so `1 << n` and each position mask fit safely in a 32-bit signed `int`.

# Progressive hints

1. How does one mask bit correspond to an input position?
2. Which mask represents the empty subset?
3. How many masks must be visited for n distinct indexed elements?
# Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class SubsetsBitmaskSolution
{
    public static IList<IList<int>> Subsets(int[] nums)
    {
        int subsetCount = 1 << nums.Length;
        var result = new List<IList<int>>(subsetCount);

        for (int mask = 0; mask < subsetCount; mask++)
        {
            var subset = new List<int>();

            for (int index = 0; index < nums.Length; index++)
            {
                if ((mask & (1 << index)) != 0)
                {
                    subset.Add(nums[index]);
                }
            }

            result.Add(subset);
        }

        return result;
    }

    public static void Main()
    {
        IList<IList<int>> result = Subsets(new[] { 1, 2, 3 });
        if (result.Count != 8 || result[0].Count != 0 ||
            Subsets(new[] { 0 }).Count != 2 || Subsets(new[] { 0 })[0].Count != 0)
        {
            throw new InvalidOperationException("Subsets check failed.");
        }
    }
}
```

# Correctness argument

Every subset uniquely determines one bit per input position: 1 means included and 0 means excluded. The range `[0,2^n)` contains every n-bit pattern exactly once, and the inner loop includes exactly the positions marked 1. Therefore each possible subset is emitted once, including mask zero for the empty subset.

# Step-by-step dry run

For nums=[1,2,3]: mask 000 emits []; 001 emits [1]; 010 emits [2]; 011 emits [1,2]; continuing through 111 emits [1,2,3]. Eight masks produce all 2^3 subsets.

# Time complexity

O(n·2^n): there are 2^n masks and each scans n positions. Constructing output itself is exponential.

# Space complexity

O(n·2^n) for all emitted element references in the worst case, plus per-subset list overhead. Auxiliary working space excluding output is O(n).

# Edge-case tests

n=1; n=10 maximum constraint gives 1024 subsets; empty subset included; zero is treated as a value, not as an empty marker; unique values assumed by the prompt.

# Reflection questions
1. Prove every subset maps to exactly one mask and every mask emits one subset.
2. Why is total work O(n·2^n) when each subset is materialized?
3. How does the unique-value guarantee affect treating positions as distinct?

**Answers:** 1. Bit i records whether position i is included, so each subset has exactly one mask and every mask specifies exactly one subset. 2. There are 2^n masks and each scans n positions, giving O(n*2^n) work to emit all subsets. 3. Unique values ensure different position subsets also have different value subsets; duplicates could produce duplicate value lists.

# Sources

- [Assigned problem](https://leetcode.com/problems/subsets/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
