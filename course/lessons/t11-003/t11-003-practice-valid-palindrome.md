# two-pointer and sliding-window techniques — Problem: Valid Palindrome

## Goals

- Compare a filtered sequence from both ends without allocating a normalized copy.
- Skip irrelevant characters independently at each boundary.
- State the input character semantics that make the implementation correct.

## Problem statement

Given a string s, return true if it is a palindrome after converting uppercase English letters to lowercase and removing every character that is not an ASCII English letter or digit. Otherwise, return false. A string with no remaining alphanumeric characters is a palindrome.

## Input constraints

- 1 <= s.Length <= 200,000.
- The input contains printable ASCII characters.
- Punctuation, whitespace, and other non-alphanumeric ASCII characters are ignored.

## Examples with expected output

1. s = "A man, a plan, a canal: Panama" -> true.
2. s = "race a car" -> false.
3. s = " " -> true after filtering to an empty string.
4. s = "0P" -> false.

## Clarifying assumptions

- Filtering and case folding are exactly ASCII English letter/digit semantics for this prompt.
- The method compares without constructing a filtered string.
- A single remaining alphanumeric character is a palindrome.
- The input is not mutated.

## Progressive hints

1. Place one pointer at each end.
2. Move each pointer past characters that are removed by the definition.
3. If the pointers have not crossed, compare the normalized characters and stop on a mismatch.
4. Convert only ASCII uppercase letters; digits and lowercase letters compare as-is.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    private static bool IsAsciiAlphaNumeric(char c) =>
        (c >= 'A' && c <= 'Z') ||
        (c >= 'a' && c <= 'z') ||
        (c >= '0' && c <= '9');

    private static char NormalizeAscii(char c) =>
        c >= 'A' && c <= 'Z' ? (char)(c + ('a' - 'A')) : c;

    public static bool IsPalindrome(string s)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));

        int left = 0;
        int right = s.Length - 1;
        while (left < right)
        {
            while (left < right && !IsAsciiAlphaNumeric(s[left])) left++;
            while (left < right && !IsAsciiAlphaNumeric(s[right])) right--;

            if (NormalizeAscii(s[left]) != NormalizeAscii(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }

    private static void AssertEqual(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(IsPalindrome("A man, a plan, a canal: Panama"), true, "Example 1");
        AssertEqual(IsPalindrome("race a car"), false, "Example 2");
        AssertEqual(IsPalindrome(" "), true, "Filtered empty string");
        AssertEqual(IsPalindrome("0P"), false, "Digit participates");
        AssertEqual(IsPalindrome("a"), true, "Single letter");
        AssertEqual(IsPalindrome(".,!"), true, "All punctuation");
        Console.WriteLine("All Valid Palindrome checks passed.");
    }
}
```

## Correctness argument

At each comparison, the inner loops advance left and right only over characters excluded by the problem's normalization rule. Thus the current positions are the first and last unprocessed alphanumeric characters. If their normalized values differ, the filtered sequence cannot read the same forward and backward, so false is correct. If they match, both can be discarded as a matching outer pair. Repeating this process leaves either no positions or one center character, both of which satisfy palindrome symmetry. The algorithm returns true exactly in those cases.

## Step-by-step dry run

For `"A man, a plan, a canal: Panama"`, skip spaces and punctuation, then compare the outer normalized letters `a` and `a`. Continue inward; the filtered sequence is `amanaplanacanalpanama`. Every mirrored pair matches, so the result is true. For `"0P"`, both characters participate; `0` differs from `p`, so the result is false.

## Time complexity

O(n), since each pointer only moves inward across each character at most once.

## Space complexity

O(1) auxiliary space; no normalized copy is allocated.

## Alternatives and tradeoffs

- Build a filtered, lowercased string and compare it with its reverse. This can simplify the comparison but requires O(n) extra storage and additional passes.
- `char.IsLetterOrDigit` and Unicode-aware case folding answer a broader question than this prompt's printable-ASCII definition. Use them only when the specification defines those semantics and character-unit behavior.

## Common mistakes and gotchas

- Comparing before skipping punctuation at both ends.
- Skipping only on the left or only on the right.
- Calling general Unicode APIs while the prompt asks for ASCII rules, or assuming ASCII code handles arbitrary Unicode.
- Treating an all-punctuation string as false instead of the empty normalized string, which is a palindrome.
- Forgetting digits participate in comparison.
- Advancing pointers twice after the inner skip loop in a way that passes over an unprocessed alphanumeric character.

## Edge-case tests

- All characters are ignored.
- One remaining character.
- A digit at either boundary.
- Mixed case with punctuation between mirrored characters.
- A mismatch at the first pair that remains after skipping.

## Reflection questions

1. Why do the pointers compare the filtered sequence without constructing it?
2. What exact input assumption makes ASCII-only normalization correct?
3. Why does an empty filtered result count as a palindrome?
4. What behavior would need to be specified before replacing ASCII rules with Unicode-aware rules?

Source: [LeetCode: Valid Palindrome](https://leetcode.com/problems/valid-palindrome/).
