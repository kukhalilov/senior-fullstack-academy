# monotonic stacks and monotonic queues — Problem: Remove K Digits

## Goals
- Derive a greedy deletion rule from decimal place significance.
- Use an increasing stack-like buffer to keep the smallest possible prefix.
- Handle leftover deletions and leading zeroes separately.

## Problem statement
Given a nonnegative integer represented by digit string `num`, remove exactly k digits so the resulting integer is as small as possible. Return its canonical decimal representation without leading zeroes, or `"0"` if no digits remain.

## Input constraints
- `1 <= k <= num.Length <= 100,000`.
- `num` contains only decimal digits.
- `num` has no leading zeroes unless it is exactly `"0"`.

## Examples with expected output
- `num="1432219"`, k=3 -> `"1219"`.
- `num="10200"`, k=1 -> `"200"`.
- `num="10"`, k=2 -> `"0"`.
- `num="123456"`, k=3 -> `"123"`.

## Clarifying assumptions
- Exactly k digits are removed, even if the sequence becomes empty.
- Compare numeric value; leading zeroes do not change value and are omitted in output.
- Input is a valid decimal representation under the no-leading-zero rule.

## Progressive hints
1. At the first differing digit, the smaller digit in the more significant position makes the number smaller.
2. If a new digit is smaller than the preceding kept digit, deleting that preceding digit improves the result.
3. Repeat while deletions remain and the stack top is larger than the new digit.
4. If deletions remain after scanning, remove them from the end; then trim leading zeroes.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static string RemoveKdigits(string num, int k)
    {
        char[] kept = new char[num.Length];
        int size = 0;
        foreach (char digit in num)
        {
            while (k > 0 && size > 0 && kept[size - 1] > digit)
            {
                size--;
                k--;
            }
            kept[size++] = digit;
        }

        size -= k;
        int first = 0;
        while (first < size && kept[first] == '0') first++;
        return first == size ? "0" : new string(kept, first, size - first);
    }

    static void Check(string expected, string num, int k)
    {
        string actual = RemoveKdigits(num, k);
        if (actual != expected) throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("1219", "1432219", 3);
        Check("200", "10200", 1);
        Check("0", "10", 2);
        Check("123", "123456", 3);
        Check("11", "112", 1);
        Check("0", "1000", 1);
        Console.WriteLine("Remove K Digits checks passed.");
    }
}
```

## Correctness argument
When reading digit d, if the most recently kept digit is larger, deleting it makes d occupy a more significant position while using one deletion. Any solution retaining that larger preceding digit is lexicographically larger at the first differing position, so the greedy removal is safe. Repeating removes every harmful descent until deletions are exhausted or the kept prefix is nondecreasing. If k remains after the scan, removing the least significant trailing digits minimizes the number. Finally, stripping leading zeroes preserves numeric value; an empty or all-zero result is represented as `"0"`.

## Step-by-step dry run
For `1432219`, k=3: read 1,4; digit 3 removes 4; digit 2 removes 3; the next 2 equals the previous 2, so keep both. Digit 1 removes one preceding 2, using the final deletion. Append 9; the kept digits are `1219`.

## Time complexity
O(n): each digit is appended once and removed at most once; leading-zero trimming is linear.

## Space complexity
O(n) for the mutable output buffer.

## Alternatives and tradeoffs
- Try every deletion subset: exponential and only useful as a tiny-input oracle.
- A linked list might make middle deletion convenient, but repeated search and allocation are unnecessary; the stack buffer provides amortized constant-time tail operations.
- Parsing to an integer is unsafe because the input may have 100,000 digits and leading-zero output behavior matters.

## Common mistakes and gotchas

- Removing the earlier digit on `>=` without considering equal digits; deleting an equal predecessor does not improve the number and may waste a deletion needed later.
- Forgetting to remove remaining k digits from the tail.
- Returning an empty string or leading zeroes instead of canonical `"0"`/digits.
- Removing digits from the end first rather than fixing earlier, more significant descents.
- Assuming k is always less than the string length; k may equal it.

## Edge-case tests
- k equals the entire length.
- Already increasing digits (deletions come from the end).
- Descending digits (greedy pops early digits).
- Leading zeroes created by deletion.
- All-zero result.

## Reflection questions
1. Why does an earlier digit dominate a later digit lexicographically?
2. Why are leftover removals taken from the end?
3. Why does strict `>` preserve equal digits until another decision is needed?

## Source
- [Remove K Digits](https://leetcode.com/problems/remove-k-digits/)
