# stacks, queues, deques, and priority-agnostic worklists — Problem: Min Stack

## Goals

- Support push, pop, top, and minimum retrieval in O(1) time.
- Preserve the minimum associated with each stack depth.
- Handle duplicate minima and the full Int32 value range safely.

## Problem statement

Design a stack that supports `Push(value)`, `Pop()`, `Top()`, and `GetMin()`. Each operation must run in O(1) time. GetMin returns the smallest value currently in the stack.

## Input constraints

- Values range from -2^31 through 2^31-1.
- Pop, Top, and GetMin are called only when the stack is nonempty by the problem contract.
- At most 30,000 operations are performed.

## Examples with expected output

1. Push -2, push 0, push -3, GetMin -> -3; Pop; Top -> 0; GetMin -> -2.
2. Push 2, push 2, Pop, GetMin -> 2; duplicate minimum remains.
3. Push Int32.MaxValue, push Int32.MinValue, GetMin -> Int32.MinValue.

## Clarifying assumptions

- The stack is LIFO and each value can repeat.
- Duplicate minima must remain represented after one copy is popped.
- The implementation throws on empty access for defensive behavior, though valid problem operations avoid it.
- Stored minima use int values only; no arithmetic on values is needed, so Int32 extremes are safe.

## Progressive hints

1. A single variable holding the current minimum fails when that minimum is popped.
2. Store the minimum for every stack entry, or maintain a second stack of minima.
3. With a pair per entry, the minimum at this depth is the smaller of the new value and the previous depth's minimum.
4. Pop removes both the value and its associated minimum snapshot.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MinStack
{
    private readonly Stack<(int Value, int Minimum)> stack = new();

    public void Push(int value)
    {
        int minimum = stack.Count == 0 ? value : Math.Min(value, stack.Peek().Minimum);
        stack.Push((value, minimum));
    }

    public void Pop()
    {
        if (stack.Count == 0) throw new InvalidOperationException("Stack is empty.");
        stack.Pop();
    }

    public int Top()
    {
        if (stack.Count == 0) throw new InvalidOperationException("Stack is empty.");
        return stack.Peek().Value;
    }

    public int GetMin()
    {
        if (stack.Count == 0) throw new InvalidOperationException("Stack is empty.");
        return stack.Peek().Minimum;
    }
}

public static class Program
{
    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var stack = new MinStack();
        stack.Push(-2); stack.Push(0); stack.Push(-3);
        AssertEqual(stack.GetMin(), -3, "Minimum before pop");
        stack.Pop();
        AssertEqual(stack.Top(), 0, "Top after pop");
        AssertEqual(stack.GetMin(), -2, "Minimum restored after pop");

        var duplicates = new MinStack();
        duplicates.Push(2); duplicates.Push(2); duplicates.Pop();
        AssertEqual(duplicates.GetMin(), 2, "Duplicate minimum remains");

        var extremes = new MinStack();
        extremes.Push(int.MaxValue); extremes.Push(int.MinValue);
        AssertEqual(extremes.GetMin(), int.MinValue, "Int32 extremes");
        Console.WriteLine("All Min Stack checks passed.");
    }
}
```

## Correctness argument

For each depth d, store the inserted value and the minimum across all values from bottom through d. On push, the new depth's minimum is the smaller of the new value and the previous top's stored minimum; the empty case uses the new value itself. Pop removes the entire top snapshot, revealing the prior depth and its correct minimum. Top and GetMin read the current snapshot. Thus each operation is constant time and the minimum remains correct after arbitrary pushes and pops, including duplicate minima.

## Step-by-step dry run

Push -2 stores `(-2,-2)`. Push 0 stores `(0,-2)`. Push -3 stores `(-3,-3)`. GetMin reads -3. Pop removes that pair; the prior top `(0,-2)` is restored, so Top is 0 and GetMin is -2.

## Time complexity

O(1) per operation.

## Space complexity

O(n) for one value/minimum pair per stack element.

## Alternatives and tradeoffs

- Store a second stack of minima, pushing when a new value is <= current minimum and popping when equal to the top minimum. This can use less auxiliary storage but requires careful duplicate handling.
- Store only changes/deltas in a wider integer type to reduce metadata, but arithmetic across Int32 extremes requires extra care and is less transparent.

## Common mistakes and gotchas

- Keeping one minimum variable and losing the previous minimum after it is popped.
- Pushing a new minimum only when it is strictly smaller; duplicate minima then disappear too early.
- Comparing minima by values but failing to restore older stack depth state.
- Subtracting values to encode differences and overflowing at Int32 extremes.
- Implementing GetMin by scanning all elements, which is O(n), not O(1).

## Edge-case tests

- Pop the current minimum and reveal a larger prior minimum.
- Push equal minimum values and pop one.
- All values increasing or decreasing.
- Int32 minimum and maximum.
- Empty defensive behavior.

## Reflection questions

1. What does the stored minimum represent at each depth?
2. Why does popping restore the correct prior minimum without recomputation?
3. How do duplicate minima affect a second-min-stack implementation?
4. Why can difference encoding be unsafe with 32-bit values?

Source: [LeetCode: Min Stack](https://leetcode.com/problems/min-stack/).
