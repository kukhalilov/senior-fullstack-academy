# stacks, queues, deques, and priority-agnostic worklists — Problem: Evaluate Reverse Polish Notation

## Goals

- Evaluate postfix expressions with a stack.
- Preserve operand order for subtraction and division.
- Apply C# integer division's truncation toward zero as required.

## Problem statement

Given tokens representing a valid arithmetic expression in reverse Polish notation, return its integer value. Operators are `+`, `-`, `*`, and `/`.

## Input constraints

- 1 <= tokens.Length <= 10,000.
- Each token is one of `+`, `-`, `*`, `/`, or a signed integer in [-200, 200].
- Division by zero does not occur; all intermediate values and the answer fit Int32.
- Integer division truncates toward zero.

## Examples with expected output

1. `["2","1","+","3","*"]` -> 9.
2. `["4","13","5","/","+"]` -> 6.
3. `["10","6","9","3","+","-11","*","/","*","17","+","5","+"]` -> 22.
4. `["7","-2","/"]` -> -3.

## Clarifying assumptions

- The expression is valid, so each operator has two preceding operands available and exactly one value remains at the end.
- For an operator, the first popped value is the right operand; the second popped value is the left operand.
- `int.Parse` accepts signed decimal integer tokens within the stated token range.

## Progressive hints

1. A postfix operator applies to the most recent unfinished values.
2. Push operands; when an operator appears, pop right then left.
3. Compute `left operator right` and push the result.
4. Integer division must truncate toward zero; C# integer `/` on `int` does so.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int Evaluate(string[] tokens)
    {
        if (tokens is null) throw new ArgumentNullException(nameof(tokens));
        var values = new Stack<int>();

        foreach (string token in tokens)
        {
            if (token is "+" or "-" or "*" or "/")
            {
                if (values.Count < 2) throw new FormatException("Operator lacks two operands.");
                int right = values.Pop();
                int left = values.Pop();
                int result = token switch
                {
                    "+" => left + right,
                    "-" => left - right,
                    "*" => left * right,
                    "/" => left / right,
                    _ => throw new InvalidOperationException()
                };
                values.Push(result);
            }
            else
            {
                values.Push(int.Parse(token));
            }
        }

        if (values.Count != 1) throw new FormatException("Expression did not reduce to one value.");
        return values.Pop();
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(Evaluate(new[] { "2", "1", "+", "3", "*" }), 9, "Example 1");
        Equal(Evaluate(new[] { "4", "13", "5", "/", "+" }), 6, "Example 2");
        Equal(Evaluate(new[] { "10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+" }), 22, "Example 3");
        Equal(Evaluate(new[] { "7", "-2", "/" }), -3, "negative truncation");
        Equal(Evaluate(new[] { "-7", "2", "/" }), -3, "negative numerator");
        Equal(Evaluate(new[] { "7", "-2", "-" }), 9, "subtraction order");
        Equal(Evaluate(new[] { "7", "-2", "/", "3", "*" }), -9, "postfix continuation");
        Console.WriteLine("All Reverse Polish Notation checks passed.");
    }
}
```

## Correctness argument

After processing each token prefix, the stack contains the values of the completed subexpressions whose operators have not yet been applied by a later token, ordered so the most recent operands are on top. An operand adds one such value. An operator removes exactly its right and left operands in reverse pop order, computes their operation, and pushes the resulting subexpression value. By induction, each prefix is represented correctly. A valid complete postfix expression leaves exactly its final result.

## Step-by-step dry run

For `7 -2 /`, push 7, then -2. At `/`, pop right=-2 and left=7; C# integer division computes 7 / -2 = -3 by truncating toward zero. Push -3, the sole final value.

## Time complexity

O(n) token processing; each token is pushed or consumed once.

## Space complexity

O(n) in the worst case when many operands precede operators.

## Alternatives and tradeoffs

- A recursive expression tree is unnecessary for postfix evaluation and adds nodes or recursion depth.
- A checked arithmetic context can detect overflow in general-purpose evaluation, but this problem guarantees all intermediate results fit Int32.
- Parsing tokens as wider values may be appropriate in a general calculator with different numeric rules.

## Common mistakes and gotchas

- Computing `right - left` or `right / left` after popping.
- Using floating-point division or flooring negative quotients instead of truncating toward zero.
- Treating a negative operand such as `-11` as an operator.
- Popping operands before confirming two are available in a defensive parser.
- Returning the top while ignoring extra values from malformed input.

## Edge-case tests

- Single operand token.
- Negative numerator and denominator.
- Noncommutative subtraction and division.
- Long expression with nested subexpressions.
- Division result truncating toward zero.

## Reflection questions

1. Why is the right operand popped first?
2. How does the stack represent unfinished postfix subexpressions?
3. Why does `7 / -2` produce -3 rather than -4?
4. What validity check ensures the expression reduced fully?

Source: [LeetCode: Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/).
