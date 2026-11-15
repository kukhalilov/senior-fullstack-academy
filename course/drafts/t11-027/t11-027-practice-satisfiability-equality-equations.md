# disjoint-set union and connectivity maintenance — Problem: Satisfiability of Equality Equations

## Goals
- Represent equality's transitive closure with DSU components.
- Process every equality before checking inequalities.
- Construct a proof both for detecting contradiction and for accepting a satisfiable system.

## Problem statement

Each equation is `x==y` or `x!=y`, with lowercase one-letter variable names. Return true if integer values can be assigned to variables so that every equation holds.

## Input constraints
- `1 <= equations.Length <= 500`.
- Every equation has length four.
- Positions 0 and 3 contain lowercase letters.
- Position 1 is `=` or `!`; position 2 is `=`.

## Examples with expected output
- `["a==b","b!=a"] -> false`.
- `["b==a","a==b"] -> true`.
- `["a==b","b==c","a!=c"] -> false`.
- `["a!=b"] -> true`.

## Clarifying assumptions

Only 26 variables can appear, and values may be any integers. Different DSU components may be assigned the same integer unless an inequality requires them to differ. The DSU represents equalities only; it does not represent inequalities as merges.

## Progressive hints
1. Equality is reflexive, symmetric, and transitive, so its closure forms equivalence classes.
2. Union all variable pairs from `==` equations.
3. Scan `!=` equations and reject if their endpoints have the same root.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static bool EquationsPossible(string[] equations)
    {
        var dsu = new Dsu(26);
        foreach (string equation in equations)
            if (equation[1] == '=')
                dsu.Union(equation[0] - 'a', equation[3] - 'a');

        foreach (string equation in equations)
            if (equation[1] == '!' && dsu.Find(equation[0] - 'a') == dsu.Find(equation[3] - 'a'))
                return false;
        return true;
    }

    sealed class Dsu
    {
        private readonly int[] parent, size;
        public Dsu(int n)
        {
            parent = new int[n]; size = new int[n];
            for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        }
        public int Find(int x)
        {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        }
        public bool Union(int a, int b)
        {
            int ra = Find(a), rb = Find(b);
            if (ra == rb) return false;
            if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
            parent[rb] = ra; size[ra] += size[rb]; return true;
        }
    }

    static void Check(bool expected, string[] equations)
    {
        bool actual = EquationsPossible(equations);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(false, new[] { "a==b", "b!=a" });
        Check(true, new[] { "b==a", "a==b" });
        Check(false, new[] { "a==b", "b==c", "a!=c" });
        Check(true, new[] { "a!=b" });
        Check(false, new[] { "a!=a" });
        Check(true, new[] { "a==a" });
        Console.WriteLine("Satisfiability of Equality Equations checks passed.");
    }
}
```

## Correctness argument

After the equality pass, two variables have the same DSU root exactly when equality equations imply them equal through transitivity. If an inequality's endpoints share a root, no assignment can make them both equal (as required by the equality chain) and unequal. If every inequality crosses distinct roots, assign a distinct integer to each root. All equalities then hold within components and all inequalities hold across them. Therefore the algorithm returns true exactly for satisfiable systems.

## Step-by-step dry run

For `a==b`, `b==c`, `a!=c`, the first pass merges a with b and b with c. In the second pass, `Find(a)` and `Find(c)` are equal, so the inequality is contradictory and the function returns false.

## Time complexity

For q equations, `O(q α(26))` amortized.

## Space complexity

`O(26)`.

## Edge-case tests

- Official examples and a transitive contradiction are asserted.
- `a!=b` alone is satisfiable.
- `a!=a` is contradictory.
- `a==a` is always satisfiable.

## Reflection questions

1. Why is a single pass that immediately checks `!=` unsafe?
2. Why do different roots not mean the variables are required to differ?
3. How would the approach change if variables were arbitrary strings rather than one lowercase letter?

Source: [LeetCode: Satisfiability of Equality Equations](https://leetcode.com/problems/satisfiability-of-equality-equations/).
