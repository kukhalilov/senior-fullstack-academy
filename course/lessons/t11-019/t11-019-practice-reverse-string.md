<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# strings and character sequences — Problem: Reverse String

# Goals

- Reverse a mutable array in place by swapping mirrored elements.
- Use two pointers that move inward and stop before they cross.
- Explain why only half the positions need processing.
- Distinguish a mutable char array from an immutable C# string.

# Problem statement

Reverse the input character array s in place using O(1) extra memory.

# Input constraints

- 1 <= s.Length <= 100,000
- Each s[i] is a printable ASCII character.
- The method mutates the provided array and does not return a new string.

# Examples with expected output

1. s = ['h', 'e', 'l', 'l', 'o'] → ['o', 'l', 'l', 'e', 'h'].
2. s = ['H', 'a', 'n', 'n', 'a', 'h'] → ['h', 'a', 'n', 'n', 'a', 'H'].
3. s = ['x'] → ['x'].

# Clarifying assumptions

- The input is a mutable char array, matching the problem’s in-place contract.
- Reversal swaps positions symmetrically: index i with index n - 1 - i.
- For the stated printable ASCII input, each char is one complete character. Reversing arbitrary Unicode text by UTF-16 code unit may split surrogate pairs or reorder combining sequences; that is outside this problem’s constraints.

# Progressive hints

1. Which element belongs at index 0? Which belongs at the last index?
2. Swap those two, then move both indices inward.
3. Stop when left >= right. A middle element in an odd-length array stays in place.
4. Each swap fixes two positions, so only floor(n / 2) swaps are needed.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static void ReverseString(char[] s)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));

        int left = 0;
        int right = s.Length - 1;
        while (left < right)
        {
            (s[left], s[right]) = (s[right], s[left]);
            left++;
            right--;
        }
    }

    private static void AssertEqual(char[] actual, string expected, string label)
    {
        if (actual.Length != expected.Length)
            throw new InvalidOperationException(label + ": length mismatch.");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i])
                throw new InvalidOperationException(label + ": mismatch at index " + i);
    }

    public static void Main()
    {
        char[] hello = { 'h', 'e', 'l', 'l', 'o' };
        ReverseString(hello);
        AssertEqual(hello, "olleh", "Example 1");

        char[] hannah = { 'H', 'a', 'n', 'n', 'a', 'h' };
        ReverseString(hannah);
        AssertEqual(hannah, "hannaH", "Example 2");

        char[] one = { 'x' };
        ReverseString(one);
        AssertEqual(one, "x", "Single character");

        char[] empty = Array.Empty<char>();
        ReverseString(empty);
        AssertEqual(empty, "", "Empty defensive case");
        Console.WriteLine("All Reverse String checks passed.");
    }
}
```

# Correctness argument

Before each iteration, every position outside [left, right] is already equal to its required reversed value. Swapping s[left] with s[right] places the original rightmost unprocessed character at its final left position and the original leftmost unprocessed character at its final right position. Advancing both pointers preserves the invariant and shrinks the unprocessed interval. When left >= right, at most one middle element remains; it maps to itself. Therefore the entire array is reversed.

# Step-by-step dry run

For ['h', 'e', 'l', 'l', 'o']:

1. Swap indices 0 and 4: ['o', 'e', 'l', 'l', 'h'].
2. Swap indices 1 and 3: ['o', 'l', 'l', 'e', 'h'].
3. Both pointers meet at index 2; the center remains unchanged.

# Time complexity

O(n): each pair of positions is swapped once.

# Space complexity

O(1) auxiliary space: only two indices and the swap temporary are used.

# Alternatives and tradeoffs

- Allocate a second array and write characters from end to start: simple, but O(n) extra storage and not in place.
- Use Array.Reverse(s): a valid library API for application code, but implementing the two-pointer loop exposes the algorithm requested for practice.
- C# strings are immutable. To reverse a string in application code, convert to a mutable buffer such as char[], reverse it, then construct a new string; that process allocates and is not the in-place problem solved here.

# Common mistakes and gotchas

- Iterating over all indices and swapping with n - 1 - i reverses the array twice unless the loop stops at the midpoint.
- Use left < right to avoid an unnecessary self-swap at the center.
- An empty array is handled defensively by right = -1, though excluded by the problem constraints.
- Reversing a .NET string’s char units is not a general Unicode text reversal. UTF-16 surrogate pairs and grapheme clusters require different handling.
- The input is mutated; callers must not expect its original contents afterward.

# Edge-case tests

- One character.
- Even length and odd length.
- Repeated characters.
- Printable ASCII punctuation and spaces.
- Empty array as a defensive behavior beyond the official constraint.

# Reflection questions

1. Why does each swap put both affected characters in their final positions?
2. Why is floor(n / 2) the maximum number of swaps?
3. Why is a char array mutable while a C# string is not?
4. Why would this method need different semantics for arbitrary Unicode text?

Sources: [LeetCode: Reverse String](https://leetcode.com/problems/reverse-string/).
