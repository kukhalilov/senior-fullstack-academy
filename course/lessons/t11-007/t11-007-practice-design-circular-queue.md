# stacks, queues, deques, and priority-agnostic worklists — Problem: Design Circular Queue

## Goals

- Implement a fixed-capacity FIFO ring buffer without a built-in queue.
- Reuse freed slots using modular index arithmetic.
- Distinguish empty, full, front, and rear states reliably.

## Problem statement

Design a circular queue with fixed capacity `k` and operations `EnQueue`, `DeQueue`, `Front`, `Rear`, `IsEmpty`, and `IsFull`. Failed insertion/removal returns false. Front and Rear return -1 when empty.

## Input constraints

- 1 <= k <= 1000.
- 0 <= value <= 1000.
- At most 3000 operations.
- The implementation must not use a built-in queue.

## Examples with expected output

1. Capacity 3; enqueue 1,2,3 -> true; enqueue 4 -> false; Rear -> 3; dequeue -> true; enqueue 4 -> true; Rear -> 4.
2. Capacity 1; enqueue 7 -> true; IsFull -> true; dequeue -> true; Front -> -1.
3. Capacity 2; enqueue 4, dequeue, enqueue 5, enqueue 6 -> true; Front -> 5; Rear -> 6.

## Clarifying assumptions

- Store `head` (the front index), `count`, and an array of exactly capacity elements.
- Derive the insertion index as `(head + count) % capacity`.
- Count distinguishes empty from full even when the ring wraps.
- This problem's Front/Rear empty sentinel is -1; the value range makes the sentinel unambiguous.

## Progressive hints

1. Avoid shifting items after dequeue; advance the head.
2. Compute the next insertion slot from head plus current count, modulo capacity.
3. Increment/decrement count on successful insertion/removal only.
4. Rear is the slot immediately before the insertion slot, with wraparound.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class MyCircularQueue
{
    private readonly int[] data;
    private int head;
    private int count;

    public MyCircularQueue(int k)
    {
        if (k <= 0) throw new ArgumentOutOfRangeException(nameof(k));
        data = new int[k];
    }

    public bool EnQueue(int value)
    {
        if (IsFull()) return false;
        int tail = (head + count) % data.Length;
        data[tail] = value;
        count++;
        return true;
    }

    public bool DeQueue()
    {
        if (IsEmpty()) return false;
        head = (head + 1) % data.Length;
        count--;
        return true;
    }

    public int Front() => IsEmpty() ? -1 : data[head];

    public int Rear()
    {
        if (IsEmpty()) return -1;
        int tail = (head + count - 1) % data.Length;
        return data[tail];
    }

    public bool IsEmpty() => count == 0;
    public bool IsFull() => count == data.Length;
}

public static class Program
{
    private static void Equal<T>(T actual, T expected, string label)
    {
        if (!Equals(actual, expected)) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        var q = new MyCircularQueue(3);
        Equal(q.EnQueue(1), true, "enqueue 1"); Equal(q.EnQueue(2), true, "enqueue 2");
        Equal(q.EnQueue(3), true, "enqueue 3"); Equal(q.EnQueue(4), false, "reject full");
        Equal(q.Rear(), 3, "rear full"); Equal(q.IsFull(), true, "full state");
        Equal(q.DeQueue(), true, "dequeue front"); Equal(q.EnQueue(4), true, "wrap enqueue");
        Equal(q.Front(), 2, "front after wrap"); Equal(q.Rear(), 4, "rear after wrap");

        var one = new MyCircularQueue(1);
        Equal(one.Front(), -1, "empty front sentinel"); Equal(one.Rear(), -1, "empty rear sentinel");
        Equal(one.EnQueue(7), true, "capacity one insert"); Equal(one.IsFull(), true, "capacity one full");
        Equal(one.DeQueue(), true, "capacity one remove"); Equal(one.DeQueue(), false, "empty removal");

        var reuse = new MyCircularQueue(2);
        reuse.EnQueue(4); reuse.DeQueue(); reuse.EnQueue(5); reuse.EnQueue(6);
        Equal(reuse.Front(), 5, "reused slot front"); Equal(reuse.Rear(), 6, "reused slot rear");
        Console.WriteLine("All Circular Queue checks passed.");
    }
}
```

## Correctness argument

The `count` occupied cells begin at `head` and proceed circularly in FIFO order. For a nonfull queue, `(head + count) % capacity` is the first free cell after them, so enqueue appends and increments count. For a nonempty queue, dequeue advances head past the first occupied cell and decrements count, preserving the order of all remaining elements. Thus Front is at head and Rear is at `(head + count - 1) % capacity`. Count zero and count equal to capacity characterize empty and full without ambiguity.

## Step-by-step dry run

Capacity 3: enqueue 1,2,3 fills indices 0,1,2. Dequeue advances head from 0 to 1 and count becomes 2. Enqueue 4 computes `(1+2)%3=0`, reusing the freed slot. The logical order is 2,3,4; Front is 2 and Rear is 4.

## Time complexity

O(1) worst-case for every operation.

## Space complexity

O(k) for the fixed array.

## Alternatives and tradeoffs

- A `head`/`tail` design may reserve one slot to distinguish full from empty; it then needs k+1 storage cells for usable capacity k.
- A boolean full flag can distinguish head-equals-tail states, but it adds state-transition cases.
- A dynamically growing ring buffer changes the fixed-capacity contract and requires a growth policy.

## Common mistakes and gotchas

- Using `(head + count - 1) % capacity` before confirming the queue is nonempty; negative remainder is troublesome.
- Advancing head on a failed dequeue or changing count on failed operations.
- Treating `head == tail` as enough to decide both empty and full without another state bit.
- Forgetting modulo wraparound after the last array index.
- Using modulo zero when capacity was not validated.

## Edge-case tests

- Empty Front/Rear and failed DeQueue.
- Capacity one transitions empty -> full -> empty.
- Fill, reject one extra item, remove, then wrap and refill.
- Repeated wraparound while preserving FIFO order.
- Value 0, which is valid and must not be confused with an unused slot.

## Reflection questions

1. What invariant does `count` provide?
2. Why is the tail index `(head + count) % capacity`?
3. How does count distinguish full from empty when indices coincide?
4. When would a growable ring buffer be useful?

Source: [LeetCode: Design Circular Queue](https://leetcode.com/problems/design-circular-queue/).
