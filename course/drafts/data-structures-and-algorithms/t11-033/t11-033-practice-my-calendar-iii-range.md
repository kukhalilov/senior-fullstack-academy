# Fenwick trees, segment trees, and static range queries — Problem: My Calendar III

## Goals

Track maximum overlap of half-open bookings using a dynamic lazy segment tree over a large coordinate domain.

## Problem statement

Implement `book(startTime,endTime)` for half-open bookings `[startTime,endTime)`. After each booking, return the maximum number of simultaneous active bookings at any time. [Official problem statement](https://leetcode.com/problems/my-calendar-iii/)

## Input constraints

- `0 <= startTime < endTime <= 10^9`.
- At most 400 calls to `book`.

## Examples with expected output

1. Book `[10,20)`, `[50,60)`, `[10,40)`, `[5,15)`, `[5,10)`, `[25,55)` → `1,1,2,3,3,3`.
2. Book `[1,5)`, `[2,6)`, `[5,7)` → `1,2,2`.

## Clarifying assumptions

End times are excluded: a booking ending at `t` does not overlap one starting at `t`. The algorithm uses a half-open domain `[0,1_000_000_001)` and range-adds one to each booking interval.

## Progressive hints

1. Every booking adds one to a time range; the answer is the maximum point value.
2. A lazy segment tree can store maximum and pending range additions.
3. Full-cover add increments node maximum and tag; partial updates push and recombine with `max`.

## Complete C# solution

```csharp dsa-solution
using System;
class Program
{
sealed class MyCalendarThree
{
    private sealed class Node { public Node Left, Right; public int Max, Lazy; }
    private readonly Node root = new Node();
    private const int Lo = 0, Hi = 1_000_000_001;
    public int Book(int startTime, int endTime)
    {
        Add(root, Lo, Hi, startTime, endTime, 1);
        return root.Max;
    }
    private static void Push(Node n)
    {
        n.Left ??= new Node(); n.Right ??= new Node();
        if (n.Lazy != 0)
        {
            n.Left.Max += n.Lazy; n.Left.Lazy += n.Lazy;
            n.Right.Max += n.Lazy; n.Right.Lazy += n.Lazy;
            n.Lazy = 0;
        }
    }
    private static void Add(Node n, int lo, int hi, int ql, int qr, int value)
    {
        if (ql <= lo && hi <= qr) { n.Max += value; n.Lazy += value; return; }
        Push(n);
        int mid = lo + (hi - lo) / 2;
        if (ql < mid) Add(n.Left, lo, mid, ql, qr, value);
        if (qr > mid) Add(n.Right, mid, hi, ql, qr, value);
        n.Max = Math.Max(n.Left.Max, n.Right.Max);
    }
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
static void Main()
    {
        var calendar = new MyCalendarThree();
int[] starts = {10,50,10,5,5,25}, ends = {20,60,40,15,10,55}, expected = {1,1,2,3,3,3};
for (int i = 0; i < starts.Length; i++) Check(calendar.Book(starts[i], ends[i]), expected[i], "example booking " + i);
var c2 = new MyCalendarThree();
Check(c2.Book(1,5), 1, "first booking");
Check(c2.Book(2,6), 2, "overlap");
Check(c2.Book(5,7), 2, "touching endpoint is not overlap");
Console.WriteLine("All My Calendar III checks passed.");
    }
}

```

## Correctness argument

For each segment, `Max` stores the largest overlap count over all times in it, and `Lazy` records an increment already applied to the segment maximum but not its children. A full-cover booking increments both. Before partial recursion, pushing transfers the pending increment to both children without changing represented point values; recomputing the parent as the larger child maximum restores the invariant. Therefore root maximum is the largest overlap after each booking. Half-open endpoint semantics are respected because ranges split at boundaries and an event at `endTime` contributes only before that endpoint.

## Step-by-step dry run

Book `[10,20)` gives maximum 1. Booking `[10,40)` overlaps it on `[10,20)`, raising the maximum to 2. Booking `[5,15)` overlaps both there, raising it to 3. Booking `[5,10)` ends exactly when the prior bookings start, so it does not create overlap 4.

## Time complexity

`O(log C)` per booking for a single interval update over coordinate width `C`; at most one boundary path per side plus covered nodes are visited.

## Space complexity

`O(Q log C)` allocated nodes for `Q` bookings.

## Edge-case tests

Tests check the official sequence and touching endpoints. The end coordinate is excluded by the half-open contract.

## Reflection questions

1. Why is storing only a sum insufficient for a maximum-overlap query?
2. What does the lazy value mean after it has already changed `Max`?
3. How would a sweep-line solution compare when only 400 bookings are allowed?
