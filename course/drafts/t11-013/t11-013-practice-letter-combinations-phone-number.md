# backtracking, subsets, permutations, and combinations — Problem: Letter Combinations of a Phone Number

## Goals
- Translate a sequence of independent character choices into a Cartesian product.
- Build each output string with depth-first backtracking.
- State output-sensitive complexity when the branching factor differs by digit.

## Problem statement
Given a string containing digits 2 through 9, return every string formed by choosing one mapped letter for each digit, in the original digit order.

## Input constraints

The input contains 1 to 4 digits. Mapping: 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz.

## Examples with expected output
Input: "23"
Expected output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

Input: "2"
Expected output: ["a","b","c"]

## Clarifying assumptions
- Only digits 2 through 9 are valid for this exercise.
- Every output has exactly one character per input digit.
- Results may appear in any order; this implementation follows mapping order.

## Progressive hints
1. At position p, choose one letter from the digit's mapping.
2. Append the choice, recurse at p+1, then remove the appended character.
3. When p reaches the digit count, save a string copy.
4. The output count is the product of mapping lengths for all digits.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<string> LetterCombinations(string digits)
    {
        if (digits.Length == 0) return Array.Empty<string>();
        string[] map = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
        foreach (char digit in digits)
            if (digit < '2' || digit > '9')
                throw new ArgumentException("Digits must be between 2 and 9.", nameof(digits));

        var result = new List<string>();
        var path = new List<char>(digits.Length);

        void Search(int position)
        {
            if (position == digits.Length)
            {
                result.Add(new string(path.ToArray()));
                return;
            }

            foreach (char letter in map[digits[position] - '0'])
            {
                path.Add(letter);
                Search(position + 1);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(0);
        return result;
    }

    static void Main()
    {
        var expected = new[] { "ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf" }.ToHashSet();
        if (!LetterCombinations("23").ToHashSet().SetEquals(expected)) throw new Exception("Two-digit mapping mismatch.");
        if (!LetterCombinations("2").ToHashSet().SetEquals(new[] { "a", "b", "c" })) throw new Exception("Single digit mismatch.");
        if (LetterCombinations("").Count != 0) throw new Exception("Empty input should yield no combinations in this contract.");
        bool rejected = false;
        try { LetterCombinations("1"); } catch (ArgumentException) { rejected = true; }
        if (!rejected) throw new Exception("Unsupported digit should be rejected.");
        Console.WriteLine("Phone-letter combination checks passed.");
    }
}
```

## Correctness argument
At recursion depth p, the path contains exactly one mapped letter for each of the first p digits. The loop explores every possible mapped letter for digit p, and recursion processes the next digit. When p equals the input length, the path contains one valid letter per digit in order and is saved. Every combination has a unique sequence of choices through these loops, so it is emitted once.

## Step-by-step dry run
For "23", the first digit maps to a,b,c and the second to d,e,f. Choosing a leads to ad, ae, af; backtracking to b yields bd, be, bf; then c yields cd, ce, cf. Each branch selects exactly one letter from each mapping.

## Time complexity
Let b_i be the number of letters mapped to digit i and L be the number of digits. There are P=product(b_i) outputs, each of length L. Materialization takes Θ(L·P).

## Space complexity
The current path and recursion use O(L) auxiliary space, excluding output. Output storage is Θ(L·P).

## Alternatives and tradeoffs
- Iterative Cartesian-product expansion repeatedly appends each next mapping to every partial string. It is concise but creates intermediate strings.
- A generator can yield strings as they are completed to avoid retaining the full output set.
- A preallocated char array avoids repeated list growth, but its mutation and copying should be explained carefully.

## Common mistakes and gotchas
- Reversing the digit-to-letter mapping indices produces incorrect results.
- Returning the mutable path rather than a string copy corrupts saved answers.
- Using one fixed branching factor of three is wrong because 7 and 9 map to four letters.
- This contract excludes 0 and 1; accepting them requires a separately defined mapping policy.

## Edge-case tests
- One digit mapped to three letters.
- A digit mapped to four letters such as 7.
- Several digits produce the product of the individual mapping lengths.
- Empty input follows the chosen contract and returns no combinations.
- Unsupported digits are rejected instead of silently indexed.

## Reflection questions
1. Why is the output count a product rather than a sum?
2. How could an iterative approach create the same set?
3. How would a streaming API affect memory use?

## Source
- [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
