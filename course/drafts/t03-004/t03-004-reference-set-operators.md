# joins sets subqueries CTEs and recursive queries — Reference: Compatible query results and duplicate semantics

# Scope and version

This reference explains all 17 supplied names in **Compatible query results and duplicate semantics** for SQL Server 2025 (17.x) T-SQL. It stays within this group’s boundary and uses SQL Server behavior rather than assuming that a relational concept implies a particular physical plan.

# How this group fits the mental model

A set operator combines compatible result rows vertically. Every operand must project the same number of columns in matching positions. UNION and UNION ALL append; INTERSECT and EXCEPT compare complete tuples.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `UNION` | Combines rows from both query expressions and removes duplicate result tuples. Duplicate comparison considers the full projected row; use it only when set semantics are intended. |
| `UNION ALL` | Combines both row streams while preserving duplicates. It avoids UNION’s duplicate-elimination requirement and is usually the right choice when repeated rows are meaningful or inputs are known disjoint. |
| `INTERSECT` | Returns distinct full rows present in both query results. It compares corresponding columns and treats two NULL values as equal for duplicate/set comparison. |
| `EXCEPT` | Returns distinct full rows from the left result that are absent from the right result. It is directional: reversing inputs changes the meaning. |
| `Compatible column count` | Each operand must return the same number of columns in the same positional order. Names do not align columns; explicitly project fields in matching semantic positions. |
| `Result data-type resolution` | Corresponding columns must be compatible. SQL Server chooses a result type using data-type precedence and expression type-resolution rules; explicit casts make intended length, precision, scale, and nullability clearer. |
| `Column names inherited from first query` | The result column names are taken from the first query expression. Give the left operand clear aliases because later ORDER BY refers to the combined result’s output names. |
| `Duplicate elimination in UNION` | UNION compares complete rows and removes repeated tuples, including duplicates that existed within either input; two NULL values compare equal for duplicate elimination. It does not preserve source-row identity or choose a representative business entity. |
| `Duplicate preservation in UNION ALL` | UNION ALL retains every row occurrence from both inputs. If the same row appears in both branches, it appears twice; branch order is not a result-order guarantee. |
| `Distinct set semantics of INTERSECT` | INTERSECT returns each common tuple once even if either input contains it multiple times. For occurrence-preserving matching, a different query design is required. |
| `Distinct set semantics of EXCEPT` | EXCEPT returns each left-side tuple once when no equal tuple exists on the right. Repeated left rows collapse and NULLs compare equal for set duplicate checking. |
| `Parenthesized set operation` | Parentheses group query expressions and make operator precedence or a desired combination explicit. A final ORDER BY belongs to the combined outer query expression. |
| `Set-operator precedence` | INTERSECT binds more tightly than UNION and EXCEPT. UNION and EXCEPT at the same precedence are evaluated left to right; parentheses are clearer when the intended grouping matters. |
| `ORDER BY after set operation` | Place the ORDER BY after the complete set expression to order its final result. Its sort items must appear in the set-operation select list and use the output names from the first (leftmost) query. Ties remain unordered. |
| `Set operator versus JOIN` | A set operator stacks compatible rows vertically; a join combines columns horizontally by matching row pairs. Choose from the shape of the desired result, not from superficial similarity between tables. |
| `Type precedence across set branches` | When corresponding types differ but are compatible, SQL Server may implicitly convert one operand to the higher-precedence result type. Conversion can fail or alter precision, so cast explicitly when the contract matters. |
| `Collation compatibility across set branches` | Character columns with different collations must be resolved by collation-precedence rules for comparison and output. Conflicting implicit collations can raise an error; use an explicit COLLATE where the intended comparison collation is known. |

# Cross-item comparison

UNION removes duplicate tuples; UNION ALL preserves every occurrence. INTERSECT returns distinct shared rows; EXCEPT returns distinct left-only rows. A JOIN pairs columns horizontally based on a relationship and can multiply rows.

# Examples

```sql
SELECT CAST(c.CustomerId AS bigint) AS EntityId, N'customer' AS EntityType
FROM dbo.Customers AS c
UNION ALL
SELECT CAST(s.SupplierId AS bigint), N'supplier'
FROM dbo.Suppliers AS s
ORDER BY EntityType, EntityId;
```

Both branches return two corresponding columns. The explicit cast documents a shared result type; column names come from the first branch. UNION ALL retains rows even if values happen to be equal.




# Common mistakes

- Matching columns by name instead of position.
- Using UNION when repeated row occurrences are meaningful.
- Assuming set-operation input or branch order is output order.
- Ignoring implicit type conversion, precision, or collation conflicts.
- Forgetting INTERSECT binds before UNION and EXCEPT.

# Knowledge checks with answers

1. **What does `UNION` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
2. **What does `UNION ALL` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
3. **What does `INTERSECT` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
4. **What does `EXCEPT` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
5. **What does `Compatible column count` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
6. **What does `Result data-type resolution` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
7. **What does `Column names inherited from first query` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
8. **What does `Duplicate elimination in UNION` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
9. **What does `Duplicate preservation in UNION ALL` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
10. **What does `Distinct set semantics of INTERSECT` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
11. **What does `Distinct set semantics of EXCEPT` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
12. **What does `Parenthesized set operation` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
13. **What does `Set-operator precedence` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
14. **What does `ORDER BY after set operation` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
15. **What does `Set operator versus JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
16. **What does `Type precedence across set branches` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
17. **What does `Collation compatibility across set branches` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.

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
