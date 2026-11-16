# joins sets subqueries CTEs and recursive queries — Big-picture orientation and mental model

# Problem and purpose

Relational queries often need to combine related rows, compare two result sets, ask a question about related data, or name a reusable step. SQL Server provides joins and APPLY for row composition, set operators for row-set comparison, subqueries for scalar/set/existence relationships, and CTEs for statement-local query structure and recursion.

# Plain-language mental model

Think first about the shape you need. A join pairs rows and can increase row count. An outer join also preserves rows that lack a qualifying match. PIVOT summarizes rows into fixed output columns; UNPIVOT turns selected columns into rows. A set operator stacks or compares complete result rows. A subquery supplies a value, a row set, a table-shaped input, or a yes/no existence condition. A CTE gives a query step a name; recursion repeatedly finds the next level of a relationship.

These are different relational tools. Choosing among them requires deciding whether unmatched rows remain, whether duplicate occurrences matter, whether one or many values are legal, and whether the result is one row per entity or one row per relationship.

# How the parts fit together

1. Specify the result grain: what one output row represents.
2. Select row sources and a matching or correlation rule.
3. Decide which side(s) must survive when no match exists.
4. Check whether one source row can match several rows and multiply output.
5. For set operations, align every projected column by position and type.
6. For subqueries, choose scalar, membership, quantified, or existence semantics.
7. Use CTEs to name query steps; add anchor, recursive step, and safe termination for a recursive CTE.
8. Add an outer ORDER BY only when result order is part of the requirement.

# Concept map

| Need | Natural construct | Main question |
| --- | --- | --- |
| Combine related row columns | JOIN | What constitutes a matching pair, and how many matches can exist? |
| Preserve rows without a match | LEFT/RIGHT/FULL JOIN or OUTER APPLY | Which input must survive, and where do match conditions belong? |
| Evaluate a dependent table expression | APPLY | Does the right side depend on the current left row? |
| Append or compare row sets | UNION / INTERSECT / EXCEPT | Do duplicate occurrences matter, and are columns aligned? |
| Ask whether a related row exists | EXISTS / NOT EXISTS | Is only existence needed, without projecting each match? |
| Reuse a query name in one statement | CTE | Is a named step enough, or is stored intermediate data required? |
| Walk a hierarchy | Recursive CTE | What is the base set, next step, and cycle/termination policy? |

# End-to-end walkthrough

To list every customer with any open order, use EXISTS so a customer remains once even with many matching orders. To show details for all orders, use a JOIN and accept one output row per order. To show customers even when none have an open order, use a LEFT JOIN and put the open-status condition in ON. These three requirements differ in output grain and row preservation, so replacing one construct with another can change the result even if a small sample happens to look similar.

For a hierarchy, start with roots in the anchor member, find children from the preceding level in the recursive member, and stop when no next rows exist. A cycle can prevent natural termination; a recursion limit is a safety cap, not a proof that the hierarchy is valid.

# When to use it and tradeoffs

Use JOIN when matching rows and projecting both sides is the goal; use EXISTS when only a yes/no match is needed. Use UNION ALL when occurrences should be preserved; use duplicate-removing set operators only when distinct tuple semantics are intended. Use scalar subqueries only when at most one row is guaranteed. Use a CTE for readable one-statement structure, and a temporary table when a persisted, indexed, multi-statement intermediate is genuinely needed.

# What later lessons cover

Four reference lessons cover join row preservation and APPLY, set operators, subquery shapes and NULL behavior, and CTE scope and recursion. The practice lesson combines these decisions in realistic queries; the interview lesson focuses on cardinality, semantics, and termination reasoning.

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
