# disjoint-set union and connectivity maintenance — Problem: Accounts Merge

## Goals
- Merge accounts through shared emails and transitive chains, never through name equality alone.
- Choose account indices as DSU elements and use an email-owner map to discover unions.
- Return sorted, deduplicated email lists while allowing arbitrary account-group order.

## Problem statement

Each account is a list whose first string is a name and remaining strings are emails. Two accounts belong to the same person when they share an email; this relation is transitive. Merge all accounts for each person. Return each merged account as the name followed by its emails in sorted order. The order of accounts in the answer is arbitrary. Different people may have the same name.

## Input constraints
- `1 <= accounts.Length <= 1000`.
- Each account contains 2..10 strings; each string has length 1..30.
- Names use English letters; email strings are valid emails.
- All accounts in one person group have the same name.

## Examples with expected output

`[[John,johnsmith@mail.com,john_newyork@mail.com],[John,johnsmith@mail.com,john00@mail.com],[Mary,mary@mail.com],[John,johnnybravo@mail.com]]` yields these three groups (any group order):

- `[John,john00@mail.com,john_newyork@mail.com,johnsmith@mail.com]`
- `[Mary,mary@mail.com]`
- `[John,johnnybravo@mail.com]`

## Clarifying assumptions

An account has at least one email. One shared email is sufficient to connect two accounts; shared names alone are not. The problem guarantees all accounts merged into one person have consistent names. Output group order is unconstrained, but each group's emails must be sorted. Use ordinal string ordering for deterministic C# sorting.

## Progressive hints
1. Make account indices the DSU elements. For each email, remember an account that contains it.
2. When an email is seen again, union this account with its recorded owner.
3. After every union has happened, scan emails again, group by final account root, and sort.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<string>> AccountsMerge(IList<IList<string>> accounts)
    {
        var dsu = new Dsu(accounts.Count);
        var owner = new Dictionary<string, int>(StringComparer.Ordinal);
        for (int i = 0; i < accounts.Count; i++)
        {
            for (int j = 1; j < accounts[i].Count; j++)
            {
                string email = accounts[i][j];
                if (owner.TryGetValue(email, out int first)) dsu.Union(i, first);
                else owner[email] = i;
            }
        }

        var groups = new Dictionary<int, SortedSet<string>>();
        for (int i = 0; i < accounts.Count; i++)
        {
            int root = dsu.Find(i);
            if (!groups.TryGetValue(root, out SortedSet<string>? emails))
                groups[root] = emails = new SortedSet<string>(StringComparer.Ordinal);
            for (int j = 1; j < accounts[i].Count; j++) emails.Add(accounts[i][j]);
        }

        var result = new List<IList<string>>();
        foreach (var pair in groups)
        {
            var merged = new List<string> { accounts[pair.Key][0] };
            merged.AddRange(pair.Value);
            result.Add(merged);
        }
        return result;
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

    static string Normalize(IList<IList<string>> groups) => string.Join("|", groups
        .Select(g => string.Join(",", g)).OrderBy(x => x, StringComparer.Ordinal));
    static void Check(string[] expected, IList<IList<string>> actual)
    {
        string e = string.Join("|", expected.Select(s => s).OrderBy(x => x, StringComparer.Ordinal));
        string a = Normalize(actual);
        if (e != a) throw new InvalidOperationException($"Expected {e}; got {a}.");
    }

    static void Main()
    {
        Check(new[] {
            "John,john00@mail.com,john_newyork@mail.com,johnsmith@mail.com",
            "Mary,mary@mail.com",
            "John,johnnybravo@mail.com"
        }, AccountsMerge(new List<IList<string>> {
            new List<string>{"John","johnsmith@mail.com","john_newyork@mail.com"},
            new List<string>{"John","johnsmith@mail.com","john00@mail.com"},
            new List<string>{"Mary","mary@mail.com"},
            new List<string>{"John","johnnybravo@mail.com"}
        }));

        Check(new[] { "A,a@x.com,b@x.com,c@x.com", "A,z@x.com" }, AccountsMerge(new List<IList<string>> {
            new List<string>{"A","a@x.com","b@x.com"},
            new List<string>{"A","c@x.com","b@x.com"},
            new List<string>{"A","z@x.com"}
        }));
        Console.WriteLine("Accounts Merge checks passed.");
    }
}
```

## Correctness argument

For every shared email, the repeated occurrence unions its account with the first account using that email, so all accounts connected by shared-email chains end in one DSU component. Conversely, the algorithm performs no union except when an email is shared, so it cannot join unrelated components. The second pass assigns every email to the final component root of its account; therefore each group contains exactly the emails of that merged identity. Sorting gives the required order, and the prompt guarantees the representative account's name is consistent with the group.

## Step-by-step dry run

Account 0 records `johnsmith` and `john_newyork`. Account 1 sees the existing `johnsmith` owner and unions indices 1 and 0; then it records `john00`. Account 2 has a unique email and remains its own component. Account 3 is also separate even though its name is John. During grouping, roots collect the first three John emails into one sorted set, while Mary's and the separate John's emails each form their own result group.

## Time complexity

Let `A` be account count and `E` the number of email occurrences. DSU work is `O(E α(A))` amortized; sorting all group emails is `O(E log E)` worst case. Dictionary operations are expected `O(1)`.

## Space complexity

`O(A+U)` auxiliary space for DSU and maps/sets, where `U` is the number of distinct emails. The returned groups also contain `U` emails.

## Edge-case tests

- Official example is asserted independent of account-group order.
- A transitive shared-email chain is asserted.
- An account with one email remains a singleton group.
- Two accounts with the same name but no common email remain separate.
- SortedSet avoids duplicate output if a generalized input repeats an email in one account.

## Reflection questions

1. Why is the DSU universe accounts rather than all possible strings?
2. Why must grouping happen after all unions?
3. What changes if emails are mapped to DSU IDs directly instead of account indices?

Source: [LeetCode: Accounts Merge](https://leetcode.com/problems/accounts-merge/).
