# greedy choices, invariants, and correctness proofs — Problem: Assign Cookies

## Goals
- Maximize the number of satisfied children when each child and cookie can be used once.
- Explain why matching the least-demanding child with the smallest fitting cookie is safe.
- Use sorting and two pointers without mutating caller arrays.

## Problem statement
Each child i has minimum greed requirement g[i], and each cookie j has size s[j]. A child is content if assigned one cookie of size at least their requirement. Assign at most one cookie to each child and at most one child to each cookie. Return the maximum number of content children.

## Input constraints

- 1 <= g.Length <= 30,000.
- 0 <= s.Length <= 30,000.
- Each greed factor and cookie size is between 1 and Int32.MaxValue.

## Examples with expected output

- g=[1,2,3], s=[1,1] -> 1.
- g=[1,2], s=[1,2,3] -> 2.
- g=[5], s=[] -> 0.

## Clarifying assumptions

- Requirements and sizes are positive integers.
- Every child can receive at most one cookie.
- Input arrays are preserved by sorting copies.
- The objective is cardinality of satisfied children, not minimizing used cookie size.

## Progressive hints

1. Sort both lists from smallest to largest.
2. Consider the least-demanding child first.
3. If the smallest remaining cookie is too small, discard it; it cannot satisfy this or a more demanding child.
4. Otherwise match them and advance both pointers.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int FindContentChildren(int[] greed, int[] cookies)
    {
        int[] children = (int[])greed.Clone();
        int[] available = (int[])cookies.Clone();
        Array.Sort(children);
        Array.Sort(available);

        int child = 0, cookie = 0, satisfied = 0;
        while (child < children.Length && cookie < available.Length)
        {
            if (available[cookie] >= children[child])
            {
                satisfied++;
                child++;
            }
            cookie++;
        }
        return satisfied;
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(1, FindContentChildren(new[] { 1, 2, 3 }, new[] { 1, 1 }));
        Check(2, FindContentChildren(new[] { 1, 2 }, new[] { 1, 2, 3 }));
        Check(0, FindContentChildren(new[] { 5 }, Array.Empty<int>()));
        Check(0, FindContentChildren(Array.Empty<int>(), new[] { 4 }));
        int[] greed = { 2, 1 }, cookies = { 2, 1 };
        FindContentChildren(greed, cookies);
        Check(2, greed.Length);
        Check(2, cookies.Length);
        Check(2, FindContentChildren(greed, cookies));
        Console.WriteLine("Assign Cookies checks passed.");
    }
}
```

## Correctness argument

Sort requirements and cookie sizes. If the smallest cookie cannot satisfy the least-demanding remaining child, it cannot satisfy any remaining child, so discarding it loses no possible match. Otherwise let c be that child and s the smallest fitting cookie, and consider a maximum matching. If c is matched to a larger cookie x, then either s is unused and can replace x, or s is assigned to another child d; in the latter case assign s to c and x to d. Since d accepted s and x >= s, d still accepts x. If c is unmatched, s cannot be unused in a maximum matching because then adding the pair would increase its size; so s is assigned to another child. Reassign s from that child to c, preserving the match count. In each case a maximum matching exists containing the greedy pair. Removing the pair and repeating proves the algorithm optimal by induction.

## Step-by-step dry run

For greed [1,2,3] and cookies [1,1], sorted order is unchanged. Match child requiring 1 to cookie 1; the second cookie 1 cannot satisfy requirement 2, so it is discarded. One child is content.

## Time complexity

Sorting costs O(C log C + S log S), where C is child count and S is cookie count. The two-pointer scan is O(C+S). Total is O(C log C + S log S).

## Space complexity

The copied arrays use O(C+S) auxiliary space; sorting stack usage depends on the runtime implementation.

## Alternatives and tradeoffs

- A sorted list of pairs plus a matching algorithm is unnecessary because this special threshold compatibility structure admits the two-pointer greedy proof.
- A general bipartite maximum-matching algorithm supports arbitrary compatibility edges but costs substantially more and ignores this problem's order structure.
- If inputs are already sorted and may be trusted as such, the copies and sorts can be avoided under a different API contract.

## Common mistakes and gotchas

- Assigning the largest cookie to the most demanding child first can consume a cookie that would satisfy several less-demanding children.
- Advancing the child pointer when a cookie is too small skips a child that may fit a later cookie.
- Sorting caller arrays in place may violate an input-preservation contract.
- Greedy matching is valid here because compatibility is a threshold; it is not a proof for arbitrary child-cookie compatibility graphs.

## Edge-case tests

- No cookies or no children gives zero.
- A cookie exactly equal to the greed requirement succeeds.
- A cookie one smaller fails.
- Large positive values fit in Int32 without addition, avoiding overflow.
- Unsorted inputs produce the same optimum and remain unchanged.

## Reflection questions

1. Why is it safe to discard a cookie that fails the least-demanding remaining child?
2. Where does the exchange argument use threshold compatibility?
3. What changes if each child can accept only a specified subset of cookie types?

## Source

- [Assign Cookies](https://leetcode.com/problems/assign-cookies/)
