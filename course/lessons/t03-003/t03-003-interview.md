# select filtering sorting and pagination — Interview questions and reasoning

# Core questions

Explain result-shape, predicate, ordering, and pagination decisions as database semantics rather than relying on accidental observed results.

# Concise interview answers

1. **Why can a SELECT alias be used in ORDER BY but not WHERE?** SQL Server’s logical binding order places WHERE before SELECT and ORDER BY after it.
2. **What rows pass WHERE?** Only rows whose complete search condition evaluates TRUE; FALSE and UNKNOWN are discarded.
3. **What does DISTINCT remove?** Duplicate projected tuples across all select-list expressions.
4. **When is a result ordered?** When an applicable outer ORDER BY is specified; tied keys can still lack a defined relative order.
5. **TOP or OFFSET/FETCH?** TOP for a top-N selection; OFFSET/FETCH for an ordered page range. They cannot share a query scope.
6. **Why append a unique key to a paging order?** It resolves ties in a static result and makes page boundaries reproducible.
7. **What changed for regex in SQL Server 2025?** REGEXP_LIKE was introduced and requires compatibility level 170; its regex behavior does not use collation rules.

# Deep follow-up answers

The logical order is a binding model that explains name availability; it does not dictate physical execution. SQL uses three-valued logic, so NOT IN and NOT equality interact with NULL in ways that differ from two-valued Boolean reasoning. A final order is lexicographic and only total if its keys uniquely identify every row. Pagination is a product-level consistency decision: a unique order stabilizes a static set, keyset pagination avoids deep positional skipping, and a transaction snapshot can provide a stable set at cost and lifetime tradeoffs. Always separate SQL Server support from syntax shown for another Microsoft database surface.

# Scenario questions

1. **A query returns rows in the same order in production for months, then changes after an index deployment. Was the engine wrong?** No. Without ORDER BY, the prior order was incidental; the query never promised it.
2. **A NOT IN anti-join returns no rows after a NULL appears in the lookup table. Why?** A nonmatching comparison against NULL can evaluate UNKNOWN. Use a correctly correlated NOT EXISTS or define null-safe comparison semantics.
3. **A page contains duplicate customers after inserts occur between requests. How would you investigate?** Check that ORDER BY is unique, whether offset positions shifted under writes, whether keyset continuation fits the UX, and whether the product actually requires a consistent snapshot.
4. **REGEXP_LIKE parses on the server but errors in one database. Why?** Check database compatibility level; the SQL Server 2025 function requires level 170.

# Tradeoffs and alternatives

Explicit projection is more stable than `*`; DISTINCT is simple but may hide key distinctions and cost additional processing. LIKE is a compact wildcard tool; regex is more expressive but has its own flags, compatibility, collation, and SARGability boundaries. OFFSET/FETCH supports numbered pages; keyset continuation scales better for next/previous navigation but does not naturally jump to an arbitrary page number. Snapshot consistency can stabilize data but can be costly to hold across requests.

# Common weak answers

- “NULL equals NULL in SQL.”
- “NOT always returns the complement set.”
- “The database returns rows in clustered-index order.”
- “A unique ORDER BY means all pages see one frozen result.”
- “SQL Server 2025 is sufficient; no compatibility setting matters.”
- “A regex is just a more powerful LIKE with the same collation behavior.”
- “Fabric and SQL Server share all T-SQL syntax.”

# Self-check rubric

Score 0–2 for each answer: correct SQL Server scope/version; NULL and UNKNOWN reasoning; alias/binding explanation; deterministic-order argument; valid row-limit semantics; and explicit concurrency assumptions. A strong answer distinguishes logical query semantics from a particular physical plan.

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server operator precedence](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server transaction isolation](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)
