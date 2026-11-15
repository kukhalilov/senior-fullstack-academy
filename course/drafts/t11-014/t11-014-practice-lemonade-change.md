# greedy choices, invariants, and correctness proofs — Problem: Lemonade Change

## Goals
- Simulate customers in order while maintaining counts of $5 and $10 bills.
- Return change for $10 and $20 bills using the available denominations.
- Preserve flexible small bills by preferring one $10 plus one $5 for a $20.
- Prove the local change choice cannot reduce future feasibility.

## Problem statement
Each lemonade costs $5. Customers arrive in the order given and pay with a $5, $10, or $20 bill. Initially there is no change. Return true exactly when each customer can receive the correct change at the time of purchase.

## Input constraints

- 1 <= bills.Length <= 100,000.
- bills[i] is 5, 10, or 20.

## Examples with expected output

- [5,5,5,10,20] -> true.
- [5,5,10,10,20] -> false.
- [10] -> false.

## Clarifying assumptions

- Customers cannot be reordered.
- Each sale gives exactly $5 lemonade; net change due is bill minus 5.
- A $20 bill received from a customer is not useful as change for later customers in this problem.

## Progressive hints

1. Track only counts of $5 and $10 bills; $20 bills are never needed for change.
2. A $10 payment requires one $5.
3. A $20 payment can use either $10+$5 or three $5 bills.
4. Prefer $10+$5 when both are available, because three $5 bills can serve three later $10 payments.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static bool LemonadeChange(int[] bills)
    {
        int fives = 0, tens = 0;
        foreach (int bill in bills)
        {
            if (bill == 5)
            {
                fives++;
            }
            else if (bill == 10)
            {
                if (fives == 0) return false;
                fives--;
                tens++;
            }
            else if (bill == 20)
            {
                if (tens > 0 && fives > 0)
                {
                    tens--;
                    fives--;
                }
                else if (fives >= 3)
                {
                    fives -= 3;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                throw new ArgumentException("Bill must be 5, 10, or 20.", nameof(bills));
            }
        }
        return true;
    }

    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(true, LemonadeChange(new[] { 5, 5, 5, 10, 20 }));
        Check(false, LemonadeChange(new[] { 5, 5, 10, 10, 20 }));
        Check(false, LemonadeChange(new[] { 10 }));
        Check(true, LemonadeChange(new[] { 5, 5, 5, 20 }));
        Check(false, LemonadeChange(new[] { 5, 5, 20 }));
        Console.WriteLine("Lemonade Change checks passed.");
    }
}
```

## Correctness argument

Before each customer, the counts represent exactly the $5 and $10 bills currently available. A $10 customer can be served if and only if at least one $5 exists. For a $20 customer, the two feasible change patterns are $10+$5 and $5+$5+$5. When both are feasible, choosing $10+$5 preserves three $5 bills instead of consuming them. Any future $10 customer requires a $5, and a future $20 customer may use either pattern; replacing three $5 change with $10+$5 never leaves fewer $5 bills and retains a $10 that can help a later $20. Thus the preferred change dominates the alternative for all future customers. Failure means neither valid pattern exists, so no strategy can serve the current customer. Induction over arrival order proves the decision.

## Step-by-step dry run

For [5,5,5,10,20], the first three customers leave three $5 bills. The $10 customer uses one, leaving two $5 and one $10. The $20 customer uses $10+$5, leaving one $5. All customers receive correct change.

## Time complexity

O(n), one pass over n bills.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- A map of denomination counts is more general if more bill types exist, but the fixed three-denomination rules are clearer and constant-space.
- A breadth-first search over cash inventories could explore all change choices, but the dominance proof makes branching unnecessary.
- Changing the accepted denomination system invalidates the proof and may require different state or search.

## Common mistakes and gotchas

- Using three $5 bills for a $20 while holding both a $10 and $5 discards the more flexible small bills.
- Counting $20 bills as useful change is invalid under this task's required net $5 transaction.
- Reordering customers changes the feasibility problem.
- Checking only total cash value is insufficient; the denominations available must make the exact change.

## Edge-case tests

- First customer pays $10 or $20: false.
- Three $5 bills can make $15 change for a $20.
- Two $5 bills cannot.
- A $10 payment consumes one $5 and creates one $10.
- Any value outside {5,10,20} is rejected defensively.

## Reflection questions

1. Why does the $10+$5 choice preserve more future options than three $5 bills?
2. Why can the algorithm ignore accumulated $20 bills?
3. Which proof assumptions fail if customers may pay with other denominations?

## Source

- [Lemonade Change](https://leetcode.com/problems/lemonade-change/)
