# joins sets subqueries CTEs and recursive queries — Reference: Join types, row preservation, and correlated row sources

# Scope and version

This reference explains all 41 supplied names in **Join types, row preservation, and correlated row sources** for SQL Server 2025 (17.x) T-SQL. It stays within this group’s boundary and uses SQL Server behavior rather than assuming that a relational concept implies a particular physical plan.

# How this group fits the mental model

A join is a rule for pairing rows, not a promise that each left row remains one result row. Inner joins keep matching pairs, outer joins also preserve selected unmatched sides, CROSS JOIN creates every pair, and APPLY evaluates a dependent right-side table expression per left row.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `FROM table source` | Names the row-producing input to a query. A source may be a table, view, table variable, derived query, rowset source, table-valued function, or a composition of joins, APPLY, PIVOT, and UNPIVOT. SQL Server documents up to 256 table sources, but the practical limit varies with memory and query complexity. Give complex sources clear aliases. |
| `INNER JOIN` | Returns combinations for which the ON search condition is TRUE. Rows without a matching partner are absent; multiple matching partners create multiple result rows. |
| `LEFT OUTER JOIN` | Returns every left row and each matching right row. When no right row satisfies ON, SQL Server emits one row with NULLs for the right-side columns. |
| `RIGHT OUTER JOIN` | Preserves every row from the right input and matches left rows where ON is TRUE. It is logically symmetric with LEFT JOIN, though rewriting inputs is often easier to read. |
| `FULL OUTER JOIN` | Returns matching combinations plus unmatched rows from both inputs, filling the missing side with NULLs. A row can match multiple partners and therefore appear multiple times. |
| `CROSS JOIN` | Forms the Cartesian product: each left row is paired with every right row. The output count is the product of input counts, including zero if either input is empty. |
| `CROSS APPLY` | Evaluates a right table expression for each left row and combines its rows with that left row. If the right expression returns no rows for a left row, that left row is omitted. |
| `OUTER APPLY` | Evaluates the right table expression per left row, preserving that left row when the expression returns no rows and NULL-extending right columns. It is the lateral counterpart to an outer join. |
| `Join predicate ON` | Defines which pairs count as matches. In an outer join, a right-side restriction in ON changes matching while preserving unmatched left rows; it is not interchangeable with moving that condition to WHERE. |
| `Join predicate in WHERE` | Filters the joined result after outer-join null extension in logical query processing. A predicate on a nullable side often rejects the NULL-extended rows and effectively removes the preservation the outer join was meant to provide. |
| `Equijoin` | Matches rows using equality comparisons, commonly between a foreign key and a referenced key. Equality with NULL is UNKNOWN, so NULL keys do not match unless a different explicit null-safe condition is defined. |
| `Non-equijoin` | Uses a predicate other than equality, such as a range overlap or less-than condition. One row may match many rows, so validate cardinality and boundary inclusiveness explicitly. |
| `Self-join` | Joins a table to another logical instance of itself. Assign distinct aliases and express the relationship, such as employee-to-manager, in ON. |
| `Multiple join sequence` | Adds table sources in a written sequence. Read each ON against the inputs available at that point, use parentheses when grouping is important, and reason about each join’s multiplicity and preservation. |
| `Join cardinality` | The number of output rows depends on match counts and row preservation, not only on input table sizes. A one-to-one relationship can preserve one row per key; one-to-many relations expand rows, and many-to-many matches can create a product of match counts within each key group. |
| `One-to-many duplicate multiplication` | A parent with several matching children appears once per child in an ordinary join. These repeated parent values are valid joined rows, not accidental duplicates; aggregate or use EXISTS if the requested result is one row per parent. |
| `Null-extended unmatched row` | Outer joins synthesize NULL values for columns from the missing side. These NULLs mean no matching row was found in this join; they do not prove that the underlying right-side column itself is nullable. |
| `Outer join predicate placement` | Put restrictions that define a qualifying match in ON when unmatched preserved-side rows must remain. Put filters on the final joined result in WHERE only when rejecting null-extended rows is intended; test both matched-but-disqualified and no-match cases. |
| `APPLY correlated table expression` | The right table source can reference columns from the left source and is evaluated per left row as a logical model. SQL Server combines each right row with the left row; do not infer a particular physical execution strategy from this description. |
| `VALUES table value constructor source` | A VALUES list can supply an inline rowset, for example as a derived table with an alias and column names. The 1,000-row limit applies to INSERT ... VALUES, not a VALUES-derived table. Rows in a VALUES constructor are not an ordering guarantee for a query result. |
| `Derived table` | A parenthesized query expression in FROM that acts as a table source for the outer query. SQL Server requires a table alias; provide column aliases where names would otherwise be ambiguous or unavailable. |
| `Table-valued function source` | A function returning a rowset can appear as a FROM source with a table alias. If its arguments depend on a preceding source row, use APPLY to express that correlation. |
| `Join hint boundary` | A join hint forces a physical join strategy. Microsoft recommends using hints only as a last resort after plan analysis. A join hint can also force join order for the query, so a local change can affect the whole multi-join plan. |
| `LOOP JOIN hint` | Forces a nested-loops physical join strategy for the specified pair. SQL Server cannot combine this hint with RIGHT or FULL join types. It constrains the plan and should be used only when measured evidence justifies overriding optimizer choice. |
| `HASH JOIN hint` | Forces a hash physical join strategy for the specified pair. This changes plan selection, not which rows logically match. Use only after measuring the actual workload and plan. |
| `MERGE JOIN hint` | Forces a merge physical join strategy for the specified pair. It is an execution algorithm, not the MERGE data-modification statement. Use only when measured plan evidence supports the constraint. |
| `REMOTE JOIN hint` | Requests that a distributed join execute at the remote table site, typically with a local left input and remote right input; it is useful when provider statistics do not let the optimizer choose a suitable remote strategy. Microsoft advises the left input be smaller than the right. SQL Server documents it only for INNER JOIN; collation casts in the compared predicate can make the hint invalid. |
| `PIVOT operator` | Rotates unique values from one input column into a fixed set of output columns and aggregates the remaining values. The IN list is static in the query text; values not listed do not become output columns. Give the output table source its required alias. Repeated PIVOT/UNPIVOT operators in one statement can hurt performance. |
| `PIVOT aggregate_function` | The PIVOT clause requires an aggregate function over its value column. The aggregate combines multiple source rows in each group; NULL value inputs are not considered by aggregate functions. |
| `PIVOT COUNT(*) restriction` | COUNT(*) cannot be used as the aggregate expression in PIVOT. Use an allowed aggregate over the value column and ensure it represents the intended measure; the PIVOT input still produces groups from its rows. |
| `PIVOT value_column` | Names the input column whose values are aggregated into each generated output column. Null values in this column are not considered by the aggregate; choose the aggregate according to the required summary. |
| `PIVOT pivot_column` | Names the input column whose distinct values are mapped to output headings by the IN list. It must be convertible to nvarchar and cannot be image or rowversion. |
| `PIVOT IN column_list` | Lists the fixed output-column identifiers and corresponding values expected from the pivot column. A listed output name cannot already exist in the input source; an unlisted pivot value has no output column. |
| `PIVOT implicit grouping columns` | Every input column other than pivot_column and value_column becomes an implicit grouping key. Project only the intended grouping columns in a source subquery; an unnoticed extra column splits groups and can produce repeated-looking rows. |
| `PIVOT empty subgroup result` | For a group with no source rows for a listed pivot value, SQL Server returns NULL in that output column; when the aggregate counts rows, it returns zero. This differs from values that exist but aggregate to NULL. |
| `UNPIVOT operator` | Rotates several input columns into row values under a name column and a value column, and requires an output table alias. It is not a lossless inverse of PIVOT when aggregation merged rows, and its treatment of NULL inputs can remove rows. |
| `UNPIVOT value_column` | Names the output column that receives values from the listed input columns. It cannot collide with an existing input column name, and the source columns in the IN list must have compatible types. |
| `UNPIVOT pivot_column` | Names the output column that receives each original input-column identifier as a row value. It cannot already exist in the input source; the resulting name values use nvarchar(128). |
| `UNPIVOT IN column_list` | Lists the source columns that become rows. Their names become values in pivot_column and their cell values become value_column; the query shape is static and the columns must be type-compatible. |
| `UNPIVOT NULL elimination` | UNPIVOT omits rows whose selected input cell is NULL. Therefore UNPIVOT is not an exact inverse of PIVOT or a complete reshape when NULL cells carry meaning; preserve them separately if they must remain observable. |
| `UNPIVOT catalog collation` | Column identifiers emitted as values follow the catalog collation. Combining them with differently collated data can require explicit COLLATE DATABASE_DEFAULT to resolve a collation conflict. |

# Cross-item comparison

INNER JOIN removes unmatched rows; LEFT OUTER JOIN preserves the left side and adds NULLs when no match exists. CROSS APPLY removes a left row when its right expression is empty; OUTER APPLY keeps it. PIVOT aggregates rows into fixed output columns; UNPIVOT changes selected columns into rows and drops NULL input cells. A join matches pairs, while EXISTS tests whether a match exists without multiplying the outer row.

# Examples

```sql
SELECT c.CustomerId, c.Name, o.OrderId, o.Status
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open'
ORDER BY c.CustomerId, o.OrderId;
```

The status restriction defines which orders count as matches. A customer with no open order remains and has NULL order columns. Moving the status condition to WHERE would discard those null-extended customer rows.


## PIVOT a rowset into fixed month columns

```sql
SELECT CustomerId, [Jan], [Feb]
FROM
(
    SELECT CustomerId, MonthName, Amount
    FROM dbo.MonthlySales
) AS src
PIVOT
(
    SUM(Amount) FOR MonthName IN ([Jan], [Feb])
) AS p;
```

The source query projects only the desired grouping key, pivot column, and value column. Any other source column would become an additional implicit grouping key. Months not listed in IN do not become output columns; an empty listed subgroup yields NULL for SUM.

## UNPIVOT selected columns into rows

```sql
SELECT CustomerId, MonthName, Amount
FROM dbo.MonthlyTotals
UNPIVOT
(
    Amount FOR MonthName IN ([Jan], [Feb])
) AS u;
```

Input cells containing NULL do not produce rows. MonthName contains the source-column names and follows catalog collation; resolve collation if it is combined with differently collated text.


# Common mistakes

- Moving a right-side ON restriction into WHERE while expecting all left rows to remain.
- Assuming a one-to-many join returns one row per parent.
- Using a join when only existence is needed and then hiding multiplication with DISTINCT.
- Treating NULL-extended columns as proof the base column is nullable.
- Using CROSS JOIN without estimating the product cardinality.
- Assuming APPLY or a correlated subquery must physically execute once per row.

# Knowledge checks with answers

1. **What does `FROM table source` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
2. **What does `INNER JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
3. **What does `LEFT OUTER JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
4. **What does `RIGHT OUTER JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
5. **What does `FULL OUTER JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
6. **What does `CROSS JOIN` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
7. **What does `CROSS APPLY` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
8. **What does `OUTER APPLY` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
9. **What does `Join predicate ON` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
10. **What does `Join predicate in WHERE` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
11. **What does `Equijoin` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
12. **What does `Non-equijoin` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
13. **What does `Self-join` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
14. **What does `Multiple join sequence` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
15. **What does `Join cardinality` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
16. **What does `One-to-many duplicate multiplication` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
17. **What does `Null-extended unmatched row` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
18. **What does `Outer join predicate placement` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
19. **What does `APPLY correlated table expression` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
20. **What does `VALUES table value constructor source` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
21. **What does `Derived table` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
22. **What does `Table-valued function source` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
23. **What does `Join hint boundary` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
24. **What does `LOOP JOIN hint` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
25. **What does `HASH JOIN hint` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
26. **What does `MERGE JOIN hint` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
27. **What does `REMOTE JOIN hint` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
28. **What does `PIVOT operator` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
29. **What does `PIVOT aggregate_function` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
30. **What does `PIVOT COUNT(*) restriction` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
31. **What does `PIVOT value_column` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
32. **What does `PIVOT pivot_column` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
33. **What does `PIVOT IN column_list` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
34. **What does `PIVOT implicit grouping columns` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
35. **What does `PIVOT empty subgroup result` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
36. **What does `UNPIVOT operator` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
37. **What does `UNPIVOT value_column` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
38. **What does `UNPIVOT pivot_column` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
39. **What does `UNPIVOT IN column_list` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
40. **What does `UNPIVOT NULL elimination` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
41. **What does `UNPIVOT catalog collation` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.

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
