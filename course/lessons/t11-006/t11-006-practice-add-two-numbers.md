# linked lists, pointer rewiring, reversal, and cycles — Problem: Add Two Numbers

## Goals

- Add two integers represented by least-significant-digit-first lists.
- Propagate carry across nodes and handle a final carry.
- Build a new result without converting the values to a machine integer.

## Problem statement

Two nonempty linked lists represent nonnegative integers. Each node stores one digit, and digits appear in reverse order. Add the numbers and return their sum as a new reversed-digit list.

## Input constraints

- 1 to 100 nodes in each input list.
- 0 <= digit <= 9.
- Each number has no leading zero except the number zero itself.

## Examples with expected output

1. l1 = [2,4,3], l2 = [5,6,4] -> [7,0,8], representing 342 + 465 = 807.
2. l1 = [0], l2 = [0] -> [0].
3. l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9] -> [8,9,9,9,0,0,0,1].
4. l1 = [9], l2 = [1] -> [0,1].

## Clarifying assumptions

- Lists store digits in reverse order, so traversal begins at the ones place.
- Inputs are non-null and nonempty under constraints; the method still handles a null side defensively as zero.
- Result nodes are newly allocated; inputs remain unchanged.
- Carry is an integer from 0 to 1 for two decimal digits plus prior carry.

## Progressive hints

1. Add digits at the same position, treating a missing node as digit zero.
2. The result digit is `sum % 10`; the next carry is `sum / 10`.
3. Continue while either input has a digit or carry remains.
4. Use a dummy result head so the first result digit needs no special branch.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class ListNode
{
    public int Val { get; set; }
    public ListNode? Next { get; set; }
    public ListNode(int val = 0, ListNode? next = null) { Val = val; Next = next; }
}

public static class Program
{
    public static ListNode AddTwoNumbers(ListNode? l1, ListNode? l2)
    {
        if (l1 is null && l2 is null) return new ListNode(0);

        var dummy = new ListNode();
        ListNode tail = dummy;
        int carry = 0;

        while (l1 is not null || l2 is not null || carry != 0)
        {
            int sum = carry;
            if (l1 is not null) { sum += l1.Val; l1 = l1.Next; }
            if (l2 is not null) { sum += l2.Val; l2 = l2.Next; }

            tail.Next = new ListNode(sum % 10);
            tail = tail.Next;
            carry = sum / 10;
        }
        return dummy.Next!;
    }

    private static ListNode Build(params int[] digits)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;
        foreach (int digit in digits) { tail.Next = new ListNode(digit); tail = tail.Next; }
        return dummy.Next!;
    }

    private static int[] Digits(ListNode? head)
    {
        var result = new List<int>();
        for (ListNode? node = head; node is not null; node = node.Next) result.Add(node.Val);
        return result.ToArray();
    }

    private static void AssertSequence(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length failed.");
        for (int i = 0; i < expected.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " digit failed.");
    }

    public static void Main()
    {
        AssertSequence(Digits(AddTwoNumbers(Build(2, 4, 3), Build(5, 6, 4))), new[] { 7, 0, 8 }, "Example 1");
        AssertSequence(Digits(AddTwoNumbers(Build(0), Build(0))), new[] { 0 }, "Example 2");
        AssertSequence(Digits(AddTwoNumbers(Build(9, 9, 9, 9, 9, 9, 9), Build(9, 9, 9, 9))), new[] { 8, 9, 9, 9, 0, 0, 0, 1 }, "Example 3");
        AssertSequence(Digits(AddTwoNumbers(Build(9), Build(1))), new[] { 0, 1 }, "Final carry");
        AssertSequence(Digits(AddTwoNumbers(null, null)), new[] { 0 }, "Defensive null inputs");
        Console.WriteLine("All Add Two Numbers checks passed.");
    }
}
```

## Correctness argument

At each digit position, the loop adds the two available digits and the carry from the previous position. Decimal addition uniquely determines the output digit as the remainder modulo 10 and the next carry as the quotient by 10. The loop advances each input at most once per node and treats an exhausted list as zeros. It continues while a digit or carry remains, so a final carry creates a new result node. By induction over digit positions, each result node is the correct digit of the sum; the output is in the same least-significant-first representation.

## Step-by-step dry run

For 342 + 465, lists are 2→4→3 and 5→6→4. Position 0: 2+5=7, carry 0. Position 1: 4+6=10, emit 0 and carry 1. Position 2: 3+4+1=8. No nodes or carry remain; output 7→0→8.

## Time complexity

O(max(m,n)), where m and n are the input digit counts.

## Space complexity

O(max(m,n)) for the new output list.

## Alternatives and tradeoffs

- Converting lists to integers is unsafe because the represented number can exceed built-in numeric limits and does extra conversion work.
- A recursive digit adder can use O(max(m,n)) call stack; the iterative method avoids stack growth.
- Forward-order digits require processing from the least-significant end through stacks or reversal; that is a different representation problem.

## Common mistakes and gotchas

- Forgetting carry after adding two digits.
- Stopping when one input list ends even though the other or carry remains.
- Treating the head digit as the most significant; the input is reversed.
- Reusing input nodes when the required result should be separate.
- Omitting the final carry node.
- Returning a dummy node or failing to create any node for zero.

## Edge-case tests

- Both values are zero.
- One input is shorter.
- A carry propagates through several 9 digits.
- Final carry adds an extra digit.
- Single-digit inputs.

## Reflection questions

1. Why do reverse-order digits allow a forward traversal?
2. What ranges can carry take here?
3. Why is a final carry part of the loop condition?
4. Why should the algorithm avoid converting the entire number to `int` or `long`?

Source: [LeetCode: Add Two Numbers](https://leetcode.com/problems/add-two-numbers/).
