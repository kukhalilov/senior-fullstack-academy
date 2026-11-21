# stacks, queues, deques, and priority-agnostic worklists — Problem: Implement Queue using Stacks

## Goals

- Simulate FIFO behavior using only LIFO stack operations.
- Use lazy transfer so each value moves at most once between stacks.
- Explain why the sequence cost is linear although one operation may be linear.

## Problem statement

Implement a queue supporting `Push`, `Pop`, `Peek`, and `Empty` using two stacks. Push adds to the back; pop and peek operate on the front.

## Input constraints

- Values satisfy 1 <= x <= 9 and at most 100 operations are performed in the source problem.
- Pop and Peek calls are valid and therefore the queue is nonempty.
- Only push/top/pop/count/empty stack operations are used.

## Examples with expected output

1. Push 1, Push 2, Peek -> 1; Pop -> 1; Empty -> false.
2. Push 4, Pop -> 4; Empty -> true.
3. Push 1, Push 2, Pop -> 1, Push 3, Pop -> 2, Pop -> 3.

## Clarifying assumptions

- `incoming` stores newest items on top; `outgoing` stores the next queue front on top.
- Transfer occurs only when outgoing is empty.
- Empty Pop/Peek throw defensively; the judge contract guarantees nonempty calls.

## Progressive hints

1. A single stack reverses order; two reversals restore FIFO order.
2. Push every new value onto an incoming stack.
3. When a front is needed and outgoing is empty, move all incoming items to outgoing.
4. Do not transfer while outgoing still contains older queue items.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MyQueue
{
    private readonly Stack<int> incoming = new();
    private readonly Stack<int> outgoing = new();

    public void Push(int x) => incoming.Push(x);

    private void PrepareFront()
    {
        if (outgoing.Count != 0) return;
        while (incoming.Count > 0) outgoing.Push(incoming.Pop());
    }

    public int Peek()
    {
        PrepareFront();
        if (outgoing.Count == 0) throw new InvalidOperationException("Queue is empty.");
        return outgoing.Peek();
    }

    public int Pop()
    {
        PrepareFront();
        if (outgoing.Count == 0) throw new InvalidOperationException("Queue is empty.");
        return outgoing.Pop();
    }

    public bool Empty() => incoming.Count == 0 && outgoing.Count == 0;
}

public static class Program
{
    private static void Equal<T>(T actual, T expected, string label)
    {
        if (!Equals(actual, expected)) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var q = new MyQueue();
        q.Push(1); q.Push(2);
        Equal(q.Peek(), 1, "front"); Equal(q.Pop(), 1, "first pop");
        Equal(q.Empty(), false, "one item remains"); Equal(q.Pop(), 2, "second pop");
        Equal(q.Empty(), true, "queue drained");

        q.Push(1); q.Push(2); Equal(q.Pop(), 1, "first transfer");
        q.Push(3); Equal(q.Pop(), 2, "old outgoing stays first");
        Equal(q.Pop(), 3, "later incoming transfers");
        Console.WriteLine("All Queue Using Stacks checks passed.");
    }
}
```

## Correctness argument

When outgoing is nonempty, its top is the earliest value not yet removed: a previous transfer reversed incoming order, placing the oldest value on top, and later pushes stay isolated in incoming. When outgoing is empty, transferring all incoming values reverses their insertion order so the oldest becomes its top. Thus Peek and Pop return the queue front. Push preserves append order, and Empty checks both disjoint stores. Each item is pushed to incoming once, transferred at most once, and popped at most once.

## Step-by-step dry run

Push 1, Push 2 leaves incoming top 2. Peek transfers 2 then 1; outgoing top is 1. Pop removes 1. Push 3 stays in incoming while outgoing contains 2. Pop removes 2; the next Pop transfers 3 and removes it.

## Time complexity

Push is O(1). Peek/Pop are O(1) when outgoing is nonempty, and O(n) for the operation that transfers n items. Across a sequence, each value transfers once, so operations are O(1) amortized.

## Space complexity

O(n) for both stacks together.

## Alternatives and tradeoffs

- Eagerly transfer on every Pop can make a single operation cheaper in some states but repeated reversals break the amortized bound.
- A queue built from a linked list or circular array is simpler when the constraint does not require stacks.
- This representation uses two stacks but no element is duplicated during transfer.

## Common mistakes and gotchas

- Transferring incoming while outgoing still has older elements, which reorders the queue.
- Transferring on every operation rather than only when outgoing is empty.
- Reporting worst-case O(1) for every operation; the guarantee is amortized.
- Implementing Empty by checking only one stack.

## Edge-case tests

- Peek repeatedly without removing.
- Drain, then reuse the queue.
- Push new values while older values remain in outgoing.
- One-item queue.
- Empty defensive access.

## Reflection questions

1. Why is the oldest incoming item at the top after transfer?
2. Why can a single Pop still be O(n)?
3. Why does transferring only when outgoing is empty preserve FIFO?
4. How many times can each value cross between stacks?

Source: [LeetCode: Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/).
