# hash maps and frequency tables — Problem: Isomorphic Strings

## Goals
- Model isomorphism as a one-to-one character mapping.
- Enforce consistency in both source-to-target and target-to-source directions.
- Use the ASCII constraint for bounded direct-address arrays.

## Problem statement
Determine whether strings `s` and `t` are isomorphic. A consistent replacement of each character in `s` must produce `t`, preserve order, and map distinct source characters to distinct target characters.

## Input constraints
- `1 <= s.Length <= 50,000`.
- `t.Length == s.Length`.
- Both strings contain valid ASCII characters, code points 0 through 127.

## Examples with expected output
- `"egg"`, `"add"` -> `true`.
- `"f11"`, `"b23"` -> `false`.
- `"paper"`, `"title"` -> `true`.
- `"ab"`, `"aa"` -> `false`.

## Clarifying assumptions
- Mapping is consistent across all occurrences.
- The mapping must be injective: two distinct source characters cannot map to the same target character.
- Characters may map to themselves; comparison is exact and case-sensitive.

## Progressive hints
1. Checking only repeated source characters is insufficient: two source characters could collapse onto one target character.
2. Maintain a forward map and a reverse map.
3. A direct-address array of length 128 is valid for ASCII; initialize missing entries to -1 because code point zero is valid.
4. For each pair, either both mappings are new or both existing mappings must agree.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static bool IsIsomorphic(string s, string t)
    {
        if (s.Length != t.Length) return false;
        int[] sourceToTarget = new int[128];
        int[] targetToSource = new int[128];
        Array.Fill(sourceToTarget, -1);
        Array.Fill(targetToSource, -1);

        for (int i = 0; i < s.Length; i++)
        {
            int source = s[i];
            int target = t[i];
            if (sourceToTarget[source] == -1 && targetToSource[target] == -1)
            {
                sourceToTarget[source] = target;
                targetToSource[target] = source;
            }
            else if (sourceToTarget[source] != target || targetToSource[target] != source)
            {
                return false;
            }
        }
        return true;
    }

    static void Check(bool expected, string s, string t)
    {
        bool actual = IsIsomorphic(s, t);
        if (actual != expected) throw new InvalidOperationException($"Unexpected result for '{s}' and '{t}'.");
    }

    static void Main()
    {
        Check(true, "egg", "add");
        Check(false, "f11", "b23");
        Check(true, "paper", "title");
        Check(false, "ab", "aa");
        Check(true, "a", "a");
        Check(false, "ab", "abc");
        Check(true, "\0a\0", "\0b\0");
        Console.WriteLine("Isomorphic Strings checks passed.");
    }
}
```

## Correctness argument
The arrays store both directions of every established mapping. When neither side has a mapping, recording both preserves a one-to-one relation. If either side has appeared before, both existing mappings must match the current pair; otherwise consistency or injectivity is violated and the method returns false. If every position passes, the mappings are consistent and bijective between the characters that occur, so replacing source characters produces the target.

## Step-by-step dry run
For `"paper"` and `"title"`, the first pair records p->t and t->p. The next records a->i and i->a. The repeated p/t pair agrees with both mappings. Remaining pairs record e->l and r->e, so the strings are isomorphic.

## Time complexity
O(n), one pass over corresponding positions; array initialization is fixed O(128).

## Space complexity
O(1) auxiliary space for two fixed arrays under the ASCII constraint.

## Alternatives and tradeoffs
- Two dictionaries support a general character domain but use space proportional to distinct characters and expected hash lookup.
- A last-seen-index method compares previous occurrence positions for the paired characters; it is concise but requires careful index encoding.
- Direct arrays are simple and deterministic for this fixed ASCII domain.

## Common mistakes and gotchas
- Using only a source-to-target map and allowing two source characters to map to one target.
- Using zero as the “unmapped” sentinel even though NUL is valid ASCII.
- Forgetting the length check.
- Extending the 128-entry table to arbitrary Unicode without defining code-unit, scalar, or grapheme semantics.

## Edge-case tests
- Repeated character maps consistently.
- Two distinct source characters map to one target (reject).
- NUL character is treated as a valid ASCII character.
- Length mismatch.

## Reflection questions
1. Which false positive is prevented by the reverse map?
2. Why is -1 a safe sentinel here?
3. What representation would you choose for arbitrary Unicode scalar values?

## Source
- [Isomorphic Strings](https://leetcode.com/problems/isomorphic-strings/)
