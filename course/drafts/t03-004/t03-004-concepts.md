# joins sets subqueries CTEs and recursive queries — Core concepts and how they fit together

# Learning objectives

Predict row preservation and cardinality; choose among joins, APPLY, set operators, subqueries, and CTEs; explain NULL and duplicate semantics; and design a recursive query with explicit type, cycle, depth, and ordering rules.

# Prerequisites

Know tables, keys, SELECT, WHERE, NULL, and basic data types. Aggregation, window functions, pagination, and plan tuning have dedicated topics; this lesson uses only enough context to explain relational composition.

# Core concepts

## Start with output grain and cardinality

Before writing a join, define what one result row represents. If a customer has three orders, joining customer to order yields three rows for that customer. This is expected one-to-many multiplication. If the requirement is one customer row when at least one order exists, EXISTS communicates that requirement without multiplying. DISTINCT is not a general repair for an incorrect grain: it can erase meaningful differences.

Join predicates define matches. INNER JOIN returns matching pairs. LEFT JOIN retains every left row and null-extends the right side when no right row satisfies ON; RIGHT JOIN preserves right, and FULL JOIN preserves both. For outer joins, a condition in ON decides which rows match. A WHERE predicate is applied to the joined result and can discard a null-extended row. Test the case where there are no matches and the case where rows exist but fail the condition; they are not always equivalent.

## APPLY is a dependent row source

CROSS APPLY and OUTER APPLY express a right-side table expression that can reference preceding left-side columns. CROSS APPLY omits a left row when the right side is empty; OUTER APPLY preserves it with NULLs. APPLY is useful for a correlated table-valued function or derived query. This is logical semantics; the optimizer may transform execution.

## PIVOT and UNPIVOT reshape table-valued inputs

PIVOT uses an aggregate over a value column, turns a pivot-column value list into fixed output columns, and groups implicitly by every other input column. Keep the source subquery narrow or extra columns silently change the grouping grain. The IN list is part of the query shape, not an automatic discovery of future values. An empty pivot subgroup is NULL, except a count aggregate returns zero. UNPIVOT selects input columns to turn into name/value rows; it drops rows for NULL cells and is not a lossless inverse after aggregation. UNPIVOT's emitted identifiers use catalog collation, which can conflict when combined with other text. [Microsoft Learn: PIVOT and UNPIVOT](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17)

## Set operations compare complete tuples

UNION and UNION ALL stack rows. INTERSECT and EXCEPT compare complete projected tuples. Corresponding columns are matched by position, must be compatible, and may undergo implicit conversion. SQL Server takes result names from the first operand. UNION, INTERSECT, and EXCEPT remove duplicates; UNION ALL preserves occurrences. Set duplicate comparison treats two NULLs as equal, even though ordinary equality predicates with NULL yield UNKNOWN. INTERSECT has higher precedence than UNION and EXCEPT; parentheses make grouping explicit. [Microsoft Learn: UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17) [Microsoft Learn: EXCEPT and INTERSECT](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17)

## Subquery shape determines its contract

A scalar subquery returns one column and at most one row in its scalar context: zero rows becomes NULL, multiple rows raise an error. IN/ANY/ALL consume a single-column set; EXISTS only asks if there is a row. NOT IN has a NULL trap; NOT EXISTS avoids poisoning from an unrelated inner NULL when the correlation expresses the desired match. A JOIN can multiply outer rows while EXISTS retains each qualifying outer row once.

Correlated describes a dependency on an outer query value, not a physical promise to execute repeatedly. The optimizer can decorrelate or otherwise transform an equivalent query. Do not choose between forms based on assumptions about a specific execution algorithm; clarify semantics first, measure plans when performance matters. [Microsoft Learn: Subqueries](https://learn.microsoft.com/en-us/sql/relational-databases/performance/subqueries?view=sql-server-ver17)

## CTEs name statement-local query expressions

A CTE is visible to the immediately following statement. It can make a multi-step query readable, and a recursive CTE can expand a hierarchy. A CTE is not automatically materialized or evaluated once. A temporary table has a different storage and lifecycle contract; a view is a persistent database object.

Recursive execution begins with anchor rows, then repeatedly applies a recursive member to the previous iteration. UNION ALL separates the last anchor from the first recursive member. Output column types must match, and recursive members have restrictions. Natural termination occurs when an iteration returns no rows. A cycle-prevention rule is separate from MAXRECURSION; setting MAXRECURSION 0 removes the depth limit and can allow unbounded recursion. [Microsoft Learn: CTEs](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17) [Microsoft Learn: Recursive CTEs](https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17)

# Mechanisms and relationships

| Construct | Result shape | Duplicate/cardinality concern | Empty or unmatched behavior |
| --- | --- | --- | --- |
| INNER JOIN | Matching row pairs | One-to-many matches multiply rows | Unmatched rows disappear |
| LEFT JOIN | Matching pairs plus preserved left rows | Several matches still multiply | Missing right columns become NULL |
| EXISTS | Outer rows satisfying existence | Keeps outer row once | No match makes predicate false |
| UNION ALL | Rows stacked | Every occurrence retained | Empty input contributes no rows |
| UNION / INTERSECT / EXCEPT | Distinct tuples | Duplicate elimination applies | Set operation follows its definition |
| Scalar subquery | One scalar per outer row | More than one row is an error | Zero rows yields NULL |
| Recursive CTE | Anchor plus iterative levels | Duplicate/cycle policy matters | Stops when recursive member returns no rows |

# Worked examples

### Preserve a customer while restricting matching orders

```sql
SELECT c.CustomerId, o.OrderId
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open';
```

An unmatched customer remains. If the status predicate were in WHERE, its NULL result for that customer would be rejected.

### Compare sets while keeping duplicates

```sql
SELECT CustomerId FROM dbo.CurrentSubscribers
UNION ALL
SELECT CustomerId FROM dbo.ArchivedSubscribers;
```

The result includes every row occurrence from both sources. UNION would instead remove repeated values from the combined result.

### Traverse a hierarchy

The overview’s recursive example starts with employees whose manager is NULL and repeatedly joins employees to the preceding level. Depth is explicitly typed, while cycle detection and an outer ORDER BY are separate concerns.

# Misconceptions and edge cases

- An outer join does not preserve the nullable side after a WHERE filter rejects its NULL-extended rows.
- A join is not inherently one row per entity; cardinality follows the match relation.
- UNION ALL is not the same as UNION, even when test data contains no duplicates.
- Set operators align columns by position, not aliases.
- EXISTS ignores the subquery select-list values; a JOIN may multiply rows.
- A scalar subquery returning multiple rows is an error, not an arbitrary choice.
- A CTE name does not guarantee storage, caching, or a single evaluation.
- MAXRECURSION is a limit, not cycle detection; zero means no recursion limit.
- Recursive output order is unspecified without a final ORDER BY.

# Knowledge checks with answers

1. **Why can a LEFT JOIN lose left rows after a WHERE predicate?** Null-extended columns make ordinary predicates UNKNOWN or FALSE, which WHERE rejects.
2. **When is EXISTS preferable to a join?** When the requirement is whether a related row exists and each qualifying outer row should appear once.
3. **Do UNION operands align columns by name?** No; position and compatible types govern.
4. **What happens to a scalar subquery with no rows or multiple rows?** It yields NULL for no row; multiple rows cause a scalar-subquery error.
5. **Does a CTE guarantee materialization?** No.
6. **What does MAXRECURSION 0 do?** It removes the recursion depth limit, not cycles.

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
