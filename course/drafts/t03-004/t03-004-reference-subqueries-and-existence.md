# joins sets subqueries CTEs and recursive queries — Reference: Scalar, correlated, and quantified subqueries

# Scope and version

This reference explains all 21 supplied names in **Scalar, correlated, and quantified subqueries** for SQL Server 2025 (17.x) T-SQL. It stays within this group’s boundary and uses SQL Server behavior rather than assuming that a relational concept implies a particular physical plan.

# How this group fits the mental model

A subquery can contribute one scalar value, a set of values, a table-shaped source, or an existence test. Pick the operator from the shape and question; NULL and cardinality are part of the semantics.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `Scalar subquery` | A parenthesized query used where one scalar value is expected. It may return zero or one row; more than one row is an error. A zero-row scalar subquery yields NULL. |
| `Single-row subquery` | Returns at most one row in a scalar context, either by its data guarantee or an explicit aggregate or limiting rule. Do not assume a nonaggregate query is single-row without a uniqueness guarantee. |
| `Multirow subquery` | Returns a set of rows for operators such as IN, EXISTS, ANY, or ALL, or a table expression in FROM. Its cardinality and NULL contents affect predicate meaning. |
| `Correlated subquery` | References a column from an outer query scope. It expresses a per-outer-row relationship logically, but SQL Server may transform it into a join or another plan; do not assume it literally executes once per row. |
| `Uncorrelated subquery` | Does not reference an outer row and has the same logical input for each outer row. The optimizer controls whether and how its result is computed or reused. |
| `EXISTS subquery` | Tests whether the subquery produces any row. The selected values do not matter, so SELECT 1 is a common convention; NULL in the select list does not prevent a row from existing. |
| `NOT EXISTS subquery` | Tests that no row satisfies the correlated subquery. It is a robust anti-match pattern when the inner key may be NULL, provided the correlation predicate reflects the intended null semantics. |
| `IN subquery` | Tests whether an expression equals any value produced by a single-column subquery. If no match exists but the subquery contains NULL, the predicate can be UNKNOWN rather than FALSE. |
| `NOT IN subquery` | Negates membership, but a NULL returned by the subquery can make otherwise unmatched comparisons UNKNOWN and remove outer rows in WHERE. Filter out NULL deliberately or use a correctly correlated NOT EXISTS. |
| `NULL in NOT IN result` | If the inner result has NULL and no equal value, three-valued logic can make NOT IN UNKNOWN. The outer WHERE discards UNKNOWN, which can make a query unexpectedly return no unmatched rows. |
| `ANY quantified comparison` | ANY is TRUE when the comparison is TRUE for at least one subquery value; SOME is its synonym. An empty set yields FALSE, while unresolved NULL comparisons can yield UNKNOWN if no comparison is TRUE. |
| `SOME quantified comparison` | SOME is a synonym for ANY in quantified subquery comparisons. It requires one qualifying comparison, not every comparison; an empty set yields FALSE. |
| `ALL quantified comparison` | ALL is TRUE only when the comparison is TRUE for every returned value. SQL Server 2025 RTM evaluates ALL over an empty subquery as TRUE; NULL comparisons can produce UNKNOWN when no comparison is false. Microsoft Learn's general search-condition page currently says FALSE for that empty-set case, conflicting with the dedicated ALL definition and the engine result; verify on the exact target build if this edge case matters. |
| `Subquery in SELECT list` | A subquery in a select expression must provide a scalar result for each output row. Correlated scalar subqueries can be useful for a single related value, but a join or APPLY may express multirow relationships more clearly. |
| `Subquery in WHERE` | A WHERE subquery commonly supplies membership, quantified comparison, or existence logic. Choose the operator based on whether the requirement is scalar comparison, set membership, or merely the existence of a matching row. |
| `Subquery in FROM` | A subquery in FROM is a derived table and must have an alias. Its columns become inputs to the outer query; it is not inherently materialized. |
| `Derived table` | A named-alias wrapper around a query expression inside FROM. It creates a query scope for projection and filtering, but does not promise storage or evaluation order. |
| `EXISTS versus join row multiplication` | EXISTS asks whether at least one match exists and keeps an outer row once. A join emits one row per matching pair, so a one-to-many relation can multiply outer rows; use EXISTS when only existence is needed. |
| `Scalar subquery cardinality error` | A scalar subquery returning multiple rows raises an error at execution. Fix the data constraint, aggregate intentionally, or rewrite the requirement; TOP (1) without a meaningful ORDER BY merely hides ambiguity. |
| `Nested subquery` | A subquery may appear inside another subquery. SQL Server permits up to 32 nesting levels, though available memory and query complexity can make the practical limit lower. Deeper nesting can obscure correlation scope; name each query role and consider a join or CTE when it makes the relationship clearer. |
| `Subquery decorrelation` | The optimizer can transform some correlated subqueries into joins or semi/anti-semi operations while preserving semantics. This is plan-dependent; write for clear meaning and inspect plans when performance matters. |

# Cross-item comparison

EXISTS asks whether any matching row exists and keeps an outer row once; a JOIN produces one row per matching pair. IN tests membership but can become UNKNOWN when NULL participates; NOT EXISTS avoids that particular poisoning when its correlation expresses the intended rule.

# Examples

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

The query returns each qualifying customer once even if that customer has many open orders. The inner SELECT values are irrelevant; the predicate is true when the subquery has at least one qualifying row.




# Common mistakes

- Assuming scalar subqueries silently choose one row when several exist.
- Using NOT IN when the subquery can return NULL.
- Replacing EXISTS with a one-to-many join and overlooking row multiplication.
- Assuming a correlated subquery must be executed literally once per outer row.
- Treating a CTE or subquery as a materialization or performance guarantee.

# Knowledge checks with answers

1. **What does `Scalar subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
2. **What does `Single-row subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
3. **What does `Multirow subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
4. **What does `Correlated subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
5. **What does `Uncorrelated subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
6. **What does `EXISTS subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
7. **What does `NOT EXISTS subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
8. **What does `IN subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
9. **What does `NOT IN subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
10. **What does `NULL in NOT IN result` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
11. **What does `ANY quantified comparison` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
12. **What does `SOME quantified comparison` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
13. **What does `ALL quantified comparison` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
14. **What does `Subquery in SELECT list` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
15. **What does `Subquery in WHERE` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
16. **What does `Subquery in FROM` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
17. **What does `Derived table` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
18. **What does `EXISTS versus join row multiplication` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
19. **What does `Scalar subquery cardinality error` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
20. **What does `Nested subquery` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
21. **What does `Subquery decorrelation` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.

# Sources

- [Microsoft Learn: from](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: union](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: except](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: cte](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: recursive](https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: subqueries](https://learn.microsoft.com/en-us/sql/relational-databases/performance/subqueries?view=sql-server-ver17)
- [Microsoft Learn: search](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: ALL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/all-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: hints](https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-ver17)
- [Microsoft Learn: tableValues](https://learn.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: pivot](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17)
