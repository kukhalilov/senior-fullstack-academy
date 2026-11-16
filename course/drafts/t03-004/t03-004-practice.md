# joins sets subqueries CTEs and recursive queries — Exercises and worked solutions

# Goals

Choose query shapes from a requirement, preserve exactly the intended rows, reason about duplicate and NULL behavior, and design a recursive query with safe types and termination.

# Worked example

Requirement: return every customer who has at least one open order, once per customer.

```sql
SELECT c.CustomerId, c.Name
FROM dbo.Customers AS c
WHERE EXISTS
(
    SELECT 1
    FROM dbo.Orders AS o
    WHERE o.CustomerId = c.CustomerId
      AND o.Status = N'Open'
);
```

EXISTS expresses the yes/no requirement and avoids multiplying one customer by several matching orders. If the requirement were to display each order, a join would be appropriate instead.

# Exercises

1. Return all customers, including those without an open order, and show matching open order IDs when present. Explain why the status condition belongs where you put it.
2. A customer can have many orders. Return one customer row if any order exceeds a threshold; compare EXISTS with JOIN.
3. Combine current and archived contact rows while preserving repeated occurrences. The identifier columns differ in integer type; make the result type explicit.
4. Return unique product IDs present in both current and previous inventory snapshots. Explain how NULLs and duplicate occurrences are handled.
5. Return products absent from a nullable discontinued-products list. Avoid NOT IN null poisoning and state how NULL product keys should behave.
6. A scalar subquery is intended to return one employee by email, but duplicate email rows exist. Explain the runtime behavior and how a data uniqueness rule could make the scalar contract valid.
7. Build a recursive query that starts at root employees and returns descendants with a depth. Explain the anchor, recursive join, type matching, termination, cycle policy, and output order.
8. A recursive query reports a maximum-recursion error at level 100. Explain the default and give a safe response; distinguish raising/removing the cap from preventing cycles.
9. A CTE is referenced twice and the team assumes its output is cached. Explain the guarantee and identify when a temporary table may be the right design.
10. Summarize monthly sales into fixed Jan/Feb columns with PIVOT. Identify the grouping key, pivot column, value column, and what happens when a source subquery accidentally includes Region.
11. Turn Jan/Feb columns back into month/value rows with UNPIVOT. Explain what happens to NULL cells and why this may not reconstruct the original rows.

# Progressive hints

1. Use a left-preserving row source and define an open order as a match.
2. EXISTS asks only whether at least one match exists; a join emits one row per match.
3. Set operands align by position; cast corresponding types.
4. INTERSECT compares complete tuples with distinct semantics.
5. Use a correlated NOT EXISTS and decide whether NULL outer keys can match.
6. Use a scalar aggregate, a uniqueness guarantee, or deterministic ordering and row limit according to the requirement.
7. Start with roots, then join each employee to the previous level’s employee key.
8. Default MAXRECURSION is 100. First establish whether legitimate depth or a cycle caused the limit.
9. A CTE is a statement-local expression, not a storage contract.
10. Keep only the intended grouping key plus month and amount in the pivot source; an extra Region column becomes a grouping key.
11. UNPIVOT emits one row per non-NULL selected cell, with the original column name in the pivot-column output.

# Complete solutions

1. Use LEFT JOIN with the right-side status condition in ON:

```sql
SELECT c.CustomerId, o.OrderId
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open';
```

Customers without an open order remain with NULL OrderId. Putting o.Status = N'Open' in WHERE would reject those rows.

2. Use EXISTS when only customer qualification is required. A JOIN would return one customer row per matching order unless the result were intentionally aggregated or deduplicated; DISTINCT is not a substitute for deciding the desired grain.

3. Use UNION ALL with explicit casts in each branch to the intended common identifier type. This retains every source occurrence; UNION would remove duplicate projected rows. Name the output in the first SELECT.

4. Use `SELECT ProductId FROM CurrentInventory INTERSECT SELECT ProductId FROM PreviousInventory`. INTERSECT returns each common projected value once, and two NULL values compare equal for set semantics. If the product key is nullable and NULL does not represent a real product, filter it out explicitly.

5. Use `WHERE NOT EXISTS (SELECT 1 FROM dbo.DiscontinuedProducts AS d WHERE d.ProductId = p.ProductId)`. An unrelated NULL in the inner relation cannot poison the result. With ordinary equality, an outer NULL key finds no match; if the domain treats two missing keys as equal, express that null-safe rule explicitly.

6. If only the most recent date is needed, use `SELECT MAX(o.OrderDate) FROM dbo.Orders AS o WHERE o.CustomerId = c.CustomerId`; an aggregate returns one scalar value (NULL when no qualifying non-NULL date exists). If the requirement needs columns from one latest order, use a correlated ordered row source such as OUTER APPLY with TOP (1) and a deterministic tie-breaker. TOP (1) without a meaningful ORDER BY selects an unspecified row.

7. The recursive pattern is the overview example: anchor at ManagerId IS NULL, recurse by child.ManagerId = parent.EmployeeId, carry an integer Depth with the same type in both members, and use a hierarchy invariant or explicit path/visited-state check to prevent revisits. Natural recursion ends when no children are produced. Add an outer ORDER BY for presentation; recursive generation order is not a result-order guarantee.

8. SQL Server’s default recursion cap is 100; explicit values range from 0 to 32767, with 0 meaning no limit. Determine whether legitimate depth exceeds the cap or the data contains a cycle. Raise the cap only for known depth; add cycle handling for cyclic data. Unlimited recursion can run without natural termination.

9. A CTE is available to the one following statement and is not promised to be cached or materialized. The optimizer may transform or re-evaluate its expression. If separate materialization, indexes, or reuse across statements is required, create a temporary table and account for its lifecycle and tempdb costs.
10. Use a source subquery with only CustomerId, MonthName, and Amount, then `PIVOT (SUM(Amount) FOR MonthName IN ([Jan], [Feb]))`. Region is an implicit grouping column, so including it returns separate rows per customer and region. Only the listed month headings appear; an empty SUM subgroup is NULL.
11. Use `UNPIVOT (Amount FOR MonthName IN ([Jan], [Feb])) AS u`. NULL input cells disappear, so the operation cannot preserve a missing-versus-NULL distinction by itself. PIVOT may also have aggregated multiple original rows, so UNPIVOT cannot recover the original row set.

# Tests and edge cases

Include no matches, one and many matches, duplicate keys, NULL join keys, unmatched preserved rows, matched rows that fail an ON restriction, NULLs in IN/NOT IN sources, scalar subqueries returning zero/one/multiple rows, empty quantified sets, duplicate set operands, type and collation conflicts, extra PIVOT source columns, listed pivot values with no rows, NULL aggregate values, UNPIVOT NULL cells and collation, recursive roots with no children, deep trees, self-cycles, longer cycles, anchor/recursive type mismatches, MAXRECURSION boundaries, and multiple CTE references. Verify the intended row grain and counts, not only sample column values.

# Reflection questions

- What does one output row represent?
- Which inputs must survive with no match?
- Can one input row match several rows?
- Does the requirement need a join, existence test, set comparison, or scalar value?
- Are duplicates meaningful, and how are NULLs treated?
- Does a recursive query have both natural termination and cycle handling?
- Is the CTE name being mistaken for a stored result?

# Sources

- [Microsoft Learn: from](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: union](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: except](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: cte](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: recursive](https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: subqueries](https://learn.microsoft.com/en-us/sql/relational-databases/performance/subqueries?view=sql-server-ver17)
- [Microsoft Learn: search](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: hints](https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-ver17)
- [Microsoft Learn: tableValues](https://learn.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: pivot](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17)
