# joins sets subqueries CTEs and recursive queries — Interview questions and reasoning

# Core questions

Explain how a row is produced, preserved, compared, or recursively derived, and state the output grain before discussing syntax.

# Concise interview answers

1. **INNER versus LEFT JOIN?** INNER returns matching pairs; LEFT also keeps every left row and NULL-extends the right side when no ON match exists.
2. **Why does an outer-join filter in WHERE matter?** WHERE runs on the null-extended result and may discard unmatched preserved rows.
3. **JOIN or EXISTS?** JOIN returns matching pairs and may multiply an outer row; EXISTS tests whether at least one match exists and retains the outer row once.
4. **UNION versus UNION ALL?** UNION removes duplicate full rows; UNION ALL preserves every occurrence.
5. **How are set-operation columns aligned?** By position and compatible type, not by alias.
6. **Why can NOT IN be surprising?** A NULL in its subquery can make an unmatched comparison UNKNOWN.
7. **What is the scalar-subquery cardinality rule?** Zero rows produce NULL; more than one row raises an error.
8. **What does a CTE guarantee?** A name and scope for one following statement, not materialization or single evaluation.
9. **What are recursive CTE parts?** Anchor member, recursive member, UNION ALL transition, and a termination/cycle strategy.
10. **What does MAXRECURSION 0 mean?** No depth limit; it does not prevent cycles.

# Deep follow-up answers

Outer-join ON predicates define qualifying matches; WHERE predicates filter the already formed result. A right-side filter in WHERE can remove null-extended rows. A parent with multiple matching children naturally appears multiple times in a join, so define whether the result grain is the parent or each relationship. EXISTS is appropriate for parent qualification, while a join is appropriate when child values are part of each output row.

Set operations compare projected tuples. Corresponding columns must be in positional agreement and compatible, and implicit type or collation resolution can affect correctness. UNION, INTERSECT, and EXCEPT have distinct semantics; UNION ALL is the occurrence-preserving append. ORDER BY after a set operation orders the combined result.

Subquery syntax describes a relationship, not a fixed execution algorithm. Correlated subqueries may be transformed. Scalar cardinality is a correctness condition; adding TOP (1) without a business ordering makes an arbitrary result look valid. NOT EXISTS handles an inner NULL differently from NOT IN, but outer-key NULL semantics still need a decision.

CTEs are query expressions scoped to one statement (or the defining SELECT of a view). Microsoft documents them as nonmaterialized, with each outer reference requiring the expression again. Recursive CTEs iterate from anchor rows; type alignment, recursive-member restrictions, termination, and cycle detection all matter. MAXRECURSION is a guard on levels. A temporary table is the explicit choice when stored reuse or indexes are part of the design.

# Scenario questions

1. **A LEFT JOIN query loses customers with no order after a status filter is added.** Check whether the right-side condition was put in WHERE; if it defines a qualifying match, move it to ON.
2. **A report has three rows per customer.** Determine whether each customer has three related matches or whether the query omitted a key; do not assume the join is wrong.
3. **A NOT IN query returns no unmatched products after a NULL is added to the lookup.** Explain three-valued logic and rewrite with a correctly correlated NOT EXISTS if appropriate.
4. **A CTE used twice seems expensive.** A CTE gives no cache guarantee; inspect the plan and consider an indexed temporary table if measured reuse is valuable.
5. **A hierarchy query hits MAXRECURSION.** Check legitimate depth and cycles separately; increasing or disabling the cap does not repair a cycle.

# Tradeoffs and alternatives

JOIN is clear for projecting matches; EXISTS avoids multiplicative matches when only existence matters. APPLY expresses a correlated row source; OUTER APPLY preserves a left row when the dependent source is empty. Set operators compare whole rows; joins compare relationships. A CTE improves local structure, while temporary tables provide explicit storage and indexes. Choose by semantics first, then measure physical performance.

# Common weak answers

- “A LEFT JOIN always keeps all left rows,” without checking WHERE.
- “DISTINCT fixes duplicate rows,” without identifying the intended grain.
- “UNION ALL is just a faster UNION,” ignoring changed duplicate semantics.
- “IN and EXISTS always behave identically,” ignoring NULL and cardinality.
- “A scalar subquery returns the first row.”
- “The CTE is materialized because it has a name.”
- “MAXRECURSION 0 fixes the recursion error.”
- “Recursive results are already in tree order.”

# Self-check rubric

Score 0–2 for each: output grain; match and preservation semantics; duplicate/cardinality behavior; NULL handling; set-operation type/position rules; subquery cardinality; CTE scope/materialization; recursion types, cycles, and limits. A strong answer separates relational meaning from optimizer implementation.

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
