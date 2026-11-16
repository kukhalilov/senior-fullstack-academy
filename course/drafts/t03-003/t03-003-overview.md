# select filtering sorting and pagination — Big-picture orientation and mental model

# Problem and purpose

Queries select a useful set of rows and columns from stored data. This topic focuses on one SELECT query: what it projects, how it filters, how it orders, and how it limits rows. Correct results depend on SQL semantics, not on what a query happened to return in one test run.

# Plain-language mental model

Treat a query as a recipe for a result table. FROM names the available row source; WHERE rejects rows whose search condition is not TRUE; SELECT shapes the columns; DISTINCT optionally removes duplicate projected rows; ORDER BY defines a returned sequence; TOP or OFFSET/FETCH limits which ordered rows are returned. SQL Server has a logical binding order that explains alias visibility, but the optimizer may physically execute a plan in another order.

This unit is specifically SQL Server 2025 (17.x) Transact-SQL. Two release changes are especially relevant: SQL Server 2022 added null-safe `IS [NOT] DISTINCT FROM`; SQL Server 2025 added `REGEXP_LIKE`, which requires database compatibility level 170. Regex matching ignores collation rules, unlike ordinary string comparison. [Microsoft Learn: IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17) [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17) [SQL Server 2025 changes](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)

# How the parts fit together

1. Choose a row source and give it a clear alias.
2. Write a search condition; account for TRUE, FALSE, and UNKNOWN.
3. Choose explicit result expressions and stable output names.
4. State an outer ORDER BY if sequence matters.
5. Add a row limit only after deciding which ordered rows count.
6. For pagination, choose a unique key tuple and decide what concurrent changes mean.

# Concept map

| Question | Query feature | Main hazard |
| --- | --- | --- |
| Which data is available? | FROM/table source | Ambiguous or overbroad projection |
| Which rows qualify? | WHERE/predicates | UNKNOWN, NULL and precedence |
| Which columns form the result? | Select list/aliases | Duplicate rows, unstable output shape |
| In what order are rows returned? | ORDER BY | Missing order or nonunique keys |
| Which slice should the client receive? | TOP, OFFSET/FETCH, keyset | Undefined subset, deep offsets, concurrent writes |
| Which pattern grammar applies? | LIKE or REGEXP_LIKE | Collation, escapes, version and support boundary |

# End-to-end walkthrough

Suppose an endpoint returns the next 20 open orders, newest first. Filter `Status` in WHERE, project only the required columns, and order by `CreatedAt DESC, OrderId DESC`. The unique identifier breaks timestamp ties. OFFSET/FETCH is convenient for numbered pages; a continuation predicate on the last timestamp and ID is more appropriate for “next” navigation. If rows may change between requests, decide whether movement is acceptable or a stable snapshot is required. A pattern search must choose LIKE or SQL Server 2025 REGEXP_LIKE based on the actual grammar, compatibility level, and collation requirements.

# When to use it and tradeoffs

Project explicit columns for stable contracts and reduced exposure. Use DISTINCT only when duplicate projected tuples are semantically unwanted. Use ORDER BY whenever callers depend on sequence. Choose TOP for a top-N result, OFFSET/FETCH for numbered page slices, and keyset pagination for continuation over a changing or large ordered set. Choose the simpler pattern matcher that meets the requirement; regular expressions add a different grammar and support boundary.

# What later lessons cover

The concepts lesson explains binding, three-valued logic, ordering, and paging before the catalogs. Four references cover query shape, predicates, ordering, and limits; every exact manifest item appears in its assigned group. Practice and interview lessons use SQL Server-specific cases and highlight the SQL Server/Fabric boundary.

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server 2025 REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
