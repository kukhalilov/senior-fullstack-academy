# select filtering sorting and pagination — Reference: ORDER BY expressions, sort direction, collation, aliases, and deterministic result ordering

# Scope and version

This reference explains all 19 supplied items in **ORDER BY expressions, sort direction, collation, aliases, and deterministic result ordering** and adds no neighboring query API. The target is SQL Server 2025 (17.x) T-SQL. Version-specific claims below are cited at the point of use. SQL Server product surfaces differ; Microsoft Learn labels Fabric-only grammar separately from SQL Server grammar.

# How this group fits the mental model

Ordering is a property of a returned result only when the outer query states ORDER BY. Multiple keys form a lexicographic order; rows tied on every key remain unordered relative to one another.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `ORDER BY clause` | Requests a final result ordering by one or more expressions. It is the only SELECT-level ordering guarantee; a view’s, index’s, or current execution plan’s apparent order does not replace it. |
| `ORDER BY expression list` | A comma-separated sequence of sort keys. SQL Server sorts by the first key, then uses the next key only to order rows tied on preceding keys; add a unique final key when a deterministic total order is required. |
| `ORDER BY column name` | Names a source or selected column as a sort key. Qualify ambiguous columns, and after assigning a table alias, use that alias when qualifying the source column. |
| `ORDER BY select-list alias` | Names a projected output alias after SELECT binding. Use the alias by itself in this position; SQL Server documents alias-plus-expression forms such as `ORDER BY Alias + 1` as invalid in that alias-binding case. |
| `ORDER BY ordinal position` | A nonnegative integer can refer to the select-list position. It works but is fragile: reordering or inserting projected columns silently changes which expression is sorted, so prefer named keys. |
| `ORDER BY expression not in select list` | In an ordinary SELECT, a source expression can be a sort key even if it is not projected. With SELECT DISTINCT or set operators, ordering expressions must be represented in the select list under SQL Server’s restrictions. |
| `ORDER BY ASC` | ASC requests ascending order; it is also the default when direction is omitted. SQL Server treats NULL as the lowest sort value, so NULL appears first in ASC order. |
| `ORDER BY DESC` | DESC requests descending order. Since SQL Server treats NULL as the lowest sort value, NULL appears after non-NULL values under DESC. |
| `ASC default sort direction` | A sort key without ASC or DESC is ascending. Write the direction explicitly when it improves review, especially in multi-key pagination where each key’s direction matters. |
| `ORDER BY multiple sort keys` | Keys are applied in sequence: later keys break ties in earlier ones. A common paging order uses a business timestamp followed by a unique identifier so equal timestamps still have a deterministic order. |
| `ORDER BY COLLATE collation_name` | COLLATE selects a string collation for that sort expression, changing linguistic ordering and potentially case/accent behavior. It applies to supported character types and can add a conversion/sort cost; use a valid collation name. |
| `Collation-specific string sort order` | Text sorting is linguistic, not a universal byte or alphabet order. Case, accent, locale, and other collation options affect ties and sequence; a different database, column, or explicit ORDER BY collation can yield another order. |
| `NULL sorts before non-NULL values in SQL Server` | SQL Server treats NULL as the lowest possible value for sorting: first under ASC and last under DESC. If the desired placement differs, sort first by an explicit CASE expression, then by the value. |
| `ORDER BY does not guarantee order among equal sort keys` | Rows that compare equal on all listed sort expressions may appear in either relative order. The result is not deterministic for pagination until the key tuple uniquely identifies every row in the filtered result. |
| `Unique tie-breaker for deterministic paging` | Append a stable unique key to the ORDER BY list, such as OrderId after CreatedAt. This removes ambiguity among ties in a static data set; it does not by itself freeze changing data between separate page requests. |
| `ORDER BY inside a view or derived table does not order its outer query` | An inner ORDER BY is allowed only with row-limiting constructs in these contexts and only chooses which inner rows qualify. The outer result remains unordered unless its own query has ORDER BY. |
| `ORDER BY with UNION, EXCEPT, and INTERSECT scope` | At top-level set operations, place the result ORDER BY after all branches; only the final combined result is ordered. The names/aliases in that ORDER BY must follow set-operation output rules. |
| `ORDER BY with SELECT INTO limitation` | ORDER BY may choose the source result order, but Microsoft explicitly says it does not guarantee the physical insertion order into a SELECT INTO table. Query the new table with its own ORDER BY. |
| `ORDER BY ALL is Fabric-only` | ORDER BY ALL is supported in the documented Fabric Data Warehouse and SQL analytics endpoint syntax, where it orders by every projected column. It is not SQL Server syntax; list the intended SQL Server sort keys explicitly. |

# Cross-item comparison

`ORDER BY` sorts final output; `TOP` and OFFSET/FETCH use an order to choose rows. A sort by a nonunique business value is not deterministic at the ties. Collation changes text ordering; SQL Server places NULL below non-NULL values.

# Examples

```sql
SELECT o.OrderId, o.CreatedAt, o.Status
FROM dbo.Orders AS o
ORDER BY o.CreatedAt DESC, o.OrderId DESC;
```

This snippet illustrates the group’s rules. Its result order, NULL behavior, parameter values, and schema assumptions are explained above; validate it against the target schema and database compatibility level.



# Common mistakes

- Ordering by a nonunique key and calling pagination deterministic.
- Using a select-list ordinal after projection changes.
- Assuming inner/view ordering reaches an outer query.
- Sorting text as though every collation used the same alphabet.
- Expecting SELECT INTO insertion order to be guaranteed by ORDER BY.

# Knowledge checks with answers

1. **Which exact inventory items does this reference cover?** `ORDER BY clause`, `ORDER BY expression list`, `ORDER BY column name`, `ORDER BY select-list alias`, `ORDER BY ordinal position`, `ORDER BY expression not in select list`, `ORDER BY ASC`, `ORDER BY DESC`, `ASC default sort direction`, `ORDER BY multiple sort keys`, `ORDER BY COLLATE collation_name`, `Collation-specific string sort order`, `NULL sorts before non-NULL values in SQL Server`, `ORDER BY does not guarantee order among equal sort keys`, `Unique tie-breaker for deterministic paging`, `ORDER BY inside a view or derived table does not order its outer query`, `ORDER BY with UNION, EXCEPT, and INTERSECT scope`, `ORDER BY with SELECT INTO limitation`, `ORDER BY ALL is Fabric-only`. Every one is explained in the table above.
2. **What should be checked when a result surprises you?** Binding scope, data types, NULL truth value, collation, unique ordering, and the SQL Server product/version surface relevant to the syntax.
3. **Does a successful query prove its order is guaranteed?** No. Only an applicable final ORDER BY defines result order, and tied keys remain unordered.

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server logical operators](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/logical-operators-transact-sql?view=sql-server-ver17)
- [SQL Server ANY and SOME](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/some-any-transact-sql?view=sql-server-ver17)
- [SQL Server ALL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/all-transact-sql?view=sql-server-ver17)
- [SQL Server operator precedence](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17)
- [SQL Server LIKE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
