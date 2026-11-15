# comparison sorting algorithms and selection — Problem: Largest Number

## Goals

- Define a custom comparator based on concatenation order.
- Prove the comparator's pairwise decision matches the objective.
- Return a string and normalize all-zero input.

## Problem statement

Rearrange nonnegative integers so their decimal concatenation is as large as possible, and return that concatenation as a string.

## Input constraints

- 1 <= nums.Length <= 100.
- 0 <= nums[i] <= 1,000,000,000.
- The result may exceed numeric types and must be represented as a string.

## Examples with expected output

1. [10,2] -> "210".
2. [3,30,34,5,9] -> "9534330".
3. [0,0] -> "0".
4. [12,121] -> "12121".

## Clarifying assumptions

- Values are formatted as invariant-culture decimal digits with no signs or separators.
- For strings a and b, place a first exactly when concatenation ab is lexicographically no smaller than ba.
- Equal concatenations may use either order.

## Progressive hints

1. Numeric descending order fails for [3,30].
2. Compare the two possible pair concatenations ab and ba.
3. Sort by that comparison in descending concatenation preference.
4. If the first sorted token is 0, every token is zero; return one zero.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Globalization;
using System.Linq;

public static class Program
{
    public static string LargestNumber(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) return "0";
        if (nums.Any(value => value < 0)) throw new ArgumentException("Values must be nonnegative.", nameof(nums));

        string[] parts = nums.Select(value => value.ToString(CultureInfo.InvariantCulture)).ToArray();
        Array.Sort(parts, (a, b) => string.CompareOrdinal(b + a, a + b));
        if (parts[0] == "0") return "0";
        return string.Concat(parts);
    }

    private static void Equal(string actual, string expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(LargestNumber(new[] { 10, 2 }), "210", "Example 1");
        Equal(LargestNumber(new[] { 3, 30, 34, 5, 9 }), "9534330", "Example 2");
        Equal(LargestNumber(new[] { 0, 0 }), "0", "all zeroes");
        Equal(LargestNumber(new[] { 12, 121 }), "12121", "concatenation tie logic");
        Equal(LargestNumber(new[] { 8308, 830 }), "8308830", "prefix relation");
        Console.WriteLine("All Largest Number checks passed.");
    }
}
```

## Correctness argument

For any two decimal strings a and b, placing a before b yields the concatenated block ab; placing b first yields ba. The comparator chooses the order whose two-item concatenation is lexicographically larger. Sorting under this relation orders every adjacent pair by the locally better concatenation; the relation is transitive for decimal-string concatenation, so a sorted sequence has no adjacent swap that improves the result. Repeatedly swapping any inverted adjacent pair never decreases the full concatenation and terminates at the comparator order, establishing maximality. If the first part is 0, comparator order implies every part is 0; returning one zero removes redundant leading zeros.

## Step-by-step dry run

For [3,30], compare "330" with "303": put "3" before "30". For [34,3], compare "343" with "334": put "34" before "3". Sorting all tokens yields [9,5,34,3,30], concatenated as "9534330".

## Time complexity

O(n log n * L) character work for comparisons and concatenation, where L bounds token length; temporary concatenated strings are allocated during comparisons.

## Space complexity

O(nL) for formatted tokens and the final output, plus comparator temporaries.

## Alternatives and tradeoffs

- Build a custom character-wise comparator to avoid allocating ab and ba for every comparison.
- Numeric sorting is not valid because digit length and prefix relationships determine concatenation order.
- Returning a number can overflow and may discard required leading-zero normalization behavior.

## Common mistakes and gotchas

- Sorting by numeric descending order.
- Sorting by string lexicographic order alone.
- Comparing ab to ba in the wrong direction.
- Parsing the final concatenation into an integer.
- Returning "000" when all tokens are zero.
- Using current-culture formatting or string comparison.

## Edge-case tests

- Single zero and multiple zeros.
- One value.
- Prefix-related values such as 12 and 121.
- Values where numeric order differs from concatenation order.
- Maximum permitted token value.

## Reflection questions

1. Why compare ab with ba?
2. Why does numeric descending fail?
3. What property of the comparator is needed by a sort?
4. Why is the output type a string?

Source: [LeetCode: Largest Number](https://leetcode.com/problems/largest-number/).
