# stacks, queues, deques, and priority-agnostic worklists — Problem: Implement Stack using Queues

## Goals

- Implement LIFO operations with FIFO queues.
- Choose which operation bears the linear cost and state that tradeoff.
- Preserve the newest item at the queue front.

## Problem statement

Implement a stack with `Push`, `Pop`, `Top`, and `Empty`, using only standard queue enqueue, dequeue, peek, count, and empty operations. Use one queue by rotating older items behind each newly pushed item.

## Input constraints

- Values satisfy 1 <= x <= 9 and at most 100 operations are performed in the source problem.
- Pop and Top are called only when nonempty.
- Only standard FIFO queue operations may be used.

## Examples with expected output

1. Push 1, Push 2, Top -> 2; Pop -> 2; Empty -> false.
2. Push 1, Pop -> 1; Empty -> true.
3. Push 1, Push 2, Push 3, Pop -> 3, Top -> 2.

## Clarifying assumptions

- A .NET `Queue<int>` is used as the single FIFO structure.
- Push enqueues the new value then rotates the previous queue count elements.
- Empty Pop/Top throw defensively; valid source operations avoid these calls.

## Progressive hints

1. A queue's front is the oldest item, but a stack's top is the newest.
2. After enqueuing a new value, move every older value behind it.
3. Then the queue front is always the stack top.
4. Pop and Top become a dequeue and peek, while Push costs O(n).

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MyStack
{
    private readonly Queue<int> queue = new();

    public void Push(int x)
    {
        int olderCount = queue.Count;
        queue.Enqueue(x);
        for (int i = 0; i < olderCount; i++) queue.Enqueue(queue.Dequeue());
    }

    public int Pop()
    {
        if (queue.Count == 0) throw new InvalidOperationException("Stack is empty.");
        return queue.Dequeue();
    }

    public int Top()
    {
        if (queue.Count == 0) throw new InvalidOperationException("Stack is empty.");
        return queue.Peek();
    }

    public bool Empty() => queue.Count == 0;
}

public static class Program
{
    private static void Equal<T>(T actual, T expected, string label)
    {
        if (!Equals(actual, expected)) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var stack = new MyStack();
        stack.Push(1); stack.Push(2);
        Equal(stack.Top(), 2, "top"); Equal(stack.Pop(), 2, "pop newest");
        Equal(stack.Empty(), false, "one item remains"); Equal(stack.Pop(), 1, "pop oldest");
        Equal(stack.Empty(), true, "drained");

        stack.Push(1); stack.Push(2); stack.Push(3);
        Equal(stack.Pop(), 3, "three pushes"); Equal(stack.Top(), 2, "new top");
        Console.WriteLine("All Stack Using Queue checks passed.");
    }
}
```

## Correctness argument

After every Push, the new value is enqueued at the rear and each previously present value is dequeued and re-enqueued once. This rotation places the new value at the front followed by all older values in their prior stack order. Therefore the queue front always equals the stack top. Pop removes that front, Top observes it without removal, and Empty reflects the structure. Induction over operations proves the LIFO behavior.

## Step-by-step dry run

Push 1 gives queue `[1]`. Push 2 first enqueues to `[1,2]`, then rotates the one old item to get `[2,1]`. Push 3 rotates two old items and yields `[3,2,1]`; dequeue returns 3.

## Time complexity

Push is O(n) in the current stack size because it rotates all older items. Pop, Top, and Empty are O(1). Across n pushes, total rotation work can be O(n^2).

## Space complexity

O(n) for the queue.

## Alternatives and tradeoffs

- With two queues, push can be O(n) and pop O(1) using the same rotate-after-insert idea.
- A two-queue design can instead make push O(1) and pop O(n) by moving all but the last element during removal.
- The one-queue version satisfies the follow-up while keeping the invariant easy to inspect.

## Common mistakes and gotchas

- Rotating the new value too, returning the queue to its original ordering.
- Capturing count after enqueue, which causes an extra rotation and loses the intended boundary.
- Using a deque's back access to bypass the queue-only operation constraint.
- Claiming Push is O(1).

## Edge-case tests

- One pushed value.
- Several pushes followed by several pops.
- Top repeated without mutation.
- Pop all items then reuse the stack.
- Empty defensive access.

## Reflection questions

1. Why is the queue front the stack top after every Push?
2. Why must `olderCount` be captured before enqueue?
3. Which operations are constant time?
4. When would the two-queue version be preferable?

Source: [LeetCode: Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/).
