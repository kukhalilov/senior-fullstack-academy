# joins sets subqueries CTEs and recursive queries — Reference: CTE syntax, recursion, scope, and alternatives

# Scope and version

This reference explains all 20 supplied names in **CTE syntax, recursion, scope, and alternatives** for SQL Server 2025 (17.x) T-SQL. It stays within this group’s boundary and uses SQL Server behavior rather than assuming that a relational concept implies a particular physical plan.

# How this group fits the mental model

A CTE gives a name to a query expression for one following statement. A recursive CTE adds a base result and repeatedly derives another level. Termination, type compatibility, cycle handling, and output ordering are separate responsibilities.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `WITH common_table_expression` | Introduces one or more named query expressions for the single following statement. In SQL Server, a preceding statement must end with a semicolon in the same batch. The CTE definition cannot nest another WITH-defined CTE, and its query cannot use INTO, OPTION, or FOR BROWSE; ORDER BY is restricted unless TOP or OFFSET/FETCH is also present. |
| `CTE column-name list` | An optional ordered list that assigns names to the CTE result columns. Its count must match the query output and its names must be unique within the CTE. |
| `Nonrecursive CTE` | A named query expression that does not reference itself. It improves organization and can separate logical steps, but it is not a temporary stored result by definition. |
| `Multiple CTE definitions` | Several CTEs can be declared in one WITH clause, separated by commas, then consumed by the single following statement. Use distinct names and keep dependencies readable. |
| `CTE dependency ordering` | A CTE may reference itself and earlier CTEs in the same WITH clause; a forward reference to a later CTE is not allowed. Order definitions from prerequisites to consumers. |
| `Recursive CTE anchor member` | The anchor query supplies the initial rows and does not reference the CTE itself. It runs first and establishes the starting frontier for recursive expansion. |
| `Recursive CTE recursive member` | The recursive query references the CTE and derives the next rows from the prior iteration. Corresponding columns must have the same data types as the anchor; SQL Server also applies recursion restrictions. Design a clear next-step relation. |
| `UNION ALL recursion separator` | The last anchor member and first recursive member must be joined with UNION ALL; UNION ALL is also the only separator allowed between multiple recursive members. Anchor members can use other set operators. Recursive UNION ALL preserves every produced row, so duplicate and cycle control must be deliberate. |
| `Recursive CTE termination condition` | Normal recursion stops when an iteration returns no rows. If MAXRECURSION is exceeded, SQL Server cancels the statement with an error; this is a safety failure, not successful termination. A cyclic relationship may never naturally terminate, so the query needs cycle handling or an appropriate limit. |
| `MAXRECURSION query hint` | OPTION (MAXRECURSION n) on the outer statement limits recursion levels; it cannot be placed inside the CTE definition. SQL Server default is 100, and valid explicit values are 0 through 32767. When the limit is exceeded, the statement is canceled with an error. The limit is a runaway-depth guard, not cycle detection or a way to return a complete partial hierarchy. |
| `Recursive CTE cycle prevention` | Carry a visited-path or other cycle-detection state and refuse to revisit a key. A depth limit alone only stops expansion after a threshold; it does not identify a cycle or guarantee complete results. |
| `Recursive member restrictions` | SQL Server forbids SELECT DISTINCT, GROUP BY, PIVOT (at compatibility level 110 or higher), HAVING, scalar aggregation, TOP, LEFT/RIGHT/OUTER JOIN, subqueries, and a hint applied to the recursive CTE reference inside a recursive member. INNER JOIN is allowed. Put restricted shaping in an outer query or a separate nonrecursive step when appropriate. |
| `CTE scope is one statement` | A CTE is scoped to the single SELECT, INSERT, UPDATE, MERGE, or DELETE statement immediately following its WITH clause; it can also appear inside the defining SELECT of CREATE VIEW. It is not a session variable or reusable object. |
| `CTE is not automatically materialized` | Microsoft documents CTE results as not materialized: each outer reference requires the CTE definition to be re-executed. The optimizer can transform the plan, but the name is not a storage or cache contract. Use a temporary table when a separately stored and indexed intermediate is required. |
| `CTE versus derived table` | Both can name a query expression for one statement. A CTE gives a reusable name within that statement and supports recursion; a derived table is local to one FROM position. Neither inherently materializes rows. |
| `CTE versus temporary table` | A temporary table is a separately created stored intermediate that can be indexed and reused across statements, with tempdb and lifecycle costs. A CTE is a single-statement query expression without that storage guarantee. |
| `CTE versus view` | A view is a persistent database object whose definition can be referenced by later statements; a CTE is a statement-local name. A view does not automatically materialize either, unless a separately defined indexed-view mechanism applies. |
| `Recursive hierarchy traversal` | A recursive CTE can walk an adjacency list such as employee-to-manager or parent-to-child. It can have multiple anchor and recursive members, but all anchors precede recursive members. Define the anchor, next-edge join, depth or path state, cycle policy, and result ordering separately. |
| `Anchor and recursive type compatibility` | Corresponding anchor and recursive member columns must have matching data types. Cast both sides deliberately, especially for growing path strings and numeric depth, to prevent type errors or truncation. SQL Server marks recursive CTE output columns nullable. |
| `MAXRECURSION 0 unlimited boundary` | MAXRECURSION 0 removes the recursion-level limit. It is not a cycle-prevention feature; an accidental cycle can run until another resource or query limit stops it, so use only with a proven termination rule. |

# Cross-item comparison

A CTE is a statement-scoped query name, a derived table is local to one FROM position, and a temporary table is stored and can be indexed or reused. Naming a query with a CTE does not promise materialization or better performance.

# Examples

```sql
;WITH Reports (EmployeeId, ManagerId, Depth) AS
(
    SELECT e.EmployeeId, e.ManagerId, 0
    FROM dbo.Employees AS e
    WHERE e.ManagerId IS NULL

    UNION ALL

    SELECT child.EmployeeId, child.ManagerId, parent.Depth + 1
    FROM dbo.Employees AS child
    INNER JOIN Reports AS parent
      ON child.ManagerId = parent.EmployeeId
)
SELECT EmployeeId, ManagerId, Depth
FROM Reports
ORDER BY Depth, ManagerId, EmployeeId
OPTION (MAXRECURSION 100);
```

The anchor selects roots; each recursive step finds their children. The integer literal and increment expression both produce int for the depth column. MAXRECURSION limits runaway depth, while correctness still depends on the hierarchy being acyclic or on explicit cycle prevention.




# Common mistakes

- Thinking a CTE is a temporary table or is evaluated exactly once.
- Omitting a recursive stop condition or cycle policy.
- Using MAXRECURSION 0 as a cycle safeguard.
- Treating a MAXRECURSION error as normal successful termination.
- Mismatching anchor and recursive data types.
- Assuming recursion order defines final row order.
- Forgetting a CTE is available only to the immediately following statement.

# Knowledge checks with answers

1. **What does `WITH common_table_expression` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
2. **What does `CTE column-name list` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
3. **What does `Nonrecursive CTE` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
4. **What does `Multiple CTE definitions` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
5. **What does `CTE dependency ordering` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
6. **What does `Recursive CTE anchor member` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
7. **What does `Recursive CTE recursive member` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
8. **What does `UNION ALL recursion separator` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
9. **What does `Recursive CTE termination condition` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
10. **What does `MAXRECURSION query hint` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
11. **What does `Recursive CTE cycle prevention` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
12. **What does `Recursive member restrictions` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
13. **What does `CTE scope is one statement` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
14. **What does `CTE is not automatically materialized` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
15. **What does `CTE versus derived table` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
16. **What does `CTE versus temporary table` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
17. **What does `CTE versus view` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
18. **What does `Recursive hierarchy traversal` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
19. **What does `Anchor and recursive type compatibility` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.
20. **What does `MAXRECURSION 0 unlimited boundary` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.

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
