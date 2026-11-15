# stacks, queues, deques, and priority-agnostic worklists — Problem: Valid Parentheses

## Goals

- Use LIFO order to validate properly nested delimiters.
- Reject a closing delimiter as soon as it has no matching opener.
- Distinguish balanced counts from correctly nested order.

## Problem statement

Given a string containing only `()[]{}`, return true if every opening bracket is closed by the same type, in the correct order, and every closing bracket has a matching earlier opener. Otherwise return false.

## Input constraints

- 1 <= s.Length <= 10,000.
- s contains only the six bracket characters `(`, `)`, `[`, `]`, `{`, `}`.

## Examples with expected output

1. s = "()" -> true.
2. s = "()[]{}" -> true.
3. s = "(]" -> false.
4. s = "([])" -> true.
5. s = "([)]" -> false.

## Clarifying assumptions

- An opener must be matched with the same bracket type.
- A closing bracket must close the most recent unmatched opener.
- Non-bracket characters are outside the input contract.
- Empty input would be balanced, though the stated constraints require at least one character.

## Progressive hints

1. Balanced counts alone do not detect crossing pairs like `([)]`.
2. Store unmatched opening brackets in the order they occur.
3. For each closer, require the stack top to be its matching opener before popping.
4. At end, all openers must have been removed.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static bool IsValid(string s)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));
        var openings = new Stack<char>();

        foreach (char c in s)
        {
            if (c is '(' or '[' or '{')
            {
                openings.Push(c);
                continue;
            }

            if (c is not ')' and not ']' and not '}') return false;
            if (openings.Count == 0) return false;

            char expected = c switch { ')' => '(', ']' => '[', _ => '{' };
            if (openings.Pop() != expected) return false;
        }
        return openings.Count == 0;
    }

    private static void AssertEqual(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(IsValid("()"), true, "Example 1");
        AssertEqual(IsValid("()[]{}"), true, "Example 2");
        AssertEqual(IsValid("(]"), false, "Example 3");
        AssertEqual(IsValid("([])"), true, "Example 4");
        AssertEqual(IsValid("([)]"), false, "Example 5");
        AssertEqual(IsValid("("), false, "Unclosed opener");
        AssertEqual(IsValid(")"), false, "Closer without opener");
        Console.WriteLine("All Valid Parentheses checks passed.");
    }
}
```

## Correctness argument

After reading any prefix, the stack contains exactly the opening brackets from that prefix that have not yet been matched, in their original order. Pushing an opener preserves the claim. A closer is valid only if the stack is nonempty and its top is the corresponding opener; popping then matches the most recent unmatched opener, which is required by nesting. A mismatch or empty stack proves invalidity. If processing ends with any opener remaining, it lacks a closer. Therefore true is returned exactly for correctly matched, properly nested strings.

## Step-by-step dry run

For `"([])"`: push `(`, push `[`, read `]` and pop `[`, read `)` and pop `(`. Stack ends empty, so true. For `"([)]"`, reading `)` finds `[` on top, so the crossing order is rejected immediately.

## Time complexity

O(n), one pass over the string with constant-time stack operations.

## Space complexity

O(n) worst case when all characters are opening brackets.

## Alternatives and tradeoffs

- For only one bracket type, a counter can track balance; multiple bracket types and nesting order require remembering the opener types.
- A map of opening-to-closing characters can replace the switch when the set is configurable, but the fixed switch is direct for this closed alphabet.

## Common mistakes and gotchas

- Counting opener/closer totals without checking their order.
- Popping before checking whether the stack is empty.
- Accepting any opener for any closer.
- Forgetting the final empty-stack test.
- Pushing closing brackets instead of opening brackets.

## Edge-case tests

- One opener or one closer.
- Correctly nested different types.
- Crossed bracket types.
- Extra closer after a valid prefix.
- Unclosed nested openers.
- Empty string defensive case.

## Reflection questions

1. Why does the most recent unmatched opener need to close first?
2. Why are equal counts insufficient?
3. What does the stack contain after each prefix?
4. How would you generalize to a larger delimiter set?

Source: [LeetCode: Valid Parentheses](https://leetcode.com/problems/valid-parentheses/).
