# select filtering sorting and pagination — Core concepts and how they fit together

# Learning objectives

Read a SELECT shape; explain alias scope and logical binding; evaluate NULL predicates using three-valued logic; select a pattern grammar; define deterministic ordering; compare TOP, OFFSET/FETCH and keyset pages; and explain SQL Server version and compatibility boundaries.

# Prerequisites

Know tables, columns, data types, NULL, basic T-SQL statements, and simple expressions. Joins, aggregation, index design, execution plans, and query tuning have separate modules; this unit uses only the source and clause context needed to understand selection.

# Core concepts

## Query shape and result projection

A query specification describes one branch of a result. Its select list produces output expressions and aliases; `SELECT ALL` is the default and retains duplicate projected tuples. `SELECT DISTINCT` removes duplicates only after projection, so choosing too few columns can collapse rows that were different in the source. `SELECT *` expands the source schema and couples consumers to changes; explicit projection communicates a stable result contract.

Set-operation branches combine results vertically and need the same number and order of compatible output columns. They do not join columns side by side. SQL Server takes output names from the left branch and resolves compatible type differences through implicit conversion rules. Use explicit casts when precision, scale, or type choice matters. [Microsoft Learn: UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)

## Logical binding versus physical execution

The documented logical order begins with FROM, followed by WHERE, then SELECT and DISTINCT, then ORDER BY and TOP. It explains why a select alias is not in scope in WHERE but is available in ORDER BY. This is a name-binding model, not an instruction that SQL Server must physically run each operator in that order; the optimizer may reorder or transform execution while preserving semantics. [Microsoft Learn: SELECT logical processing](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)

## Search conditions and three-valued logic

Each predicate can yield TRUE, FALSE, or UNKNOWN. WHERE retains only TRUE. A comparison with NULL usually gives UNKNOWN, and NOT UNKNOWN is still UNKNOWN. Use IS NULL to test missingness and `IS [NOT] DISTINCT FROM` for null-safe equality/inequality. AND binds before OR, but parentheses make business logic explicit. Precedence does not promise procedural short-circuit evaluation, so do not place an unsafe conversion in one side and assume the other side always guards it. [Microsoft Learn: search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17) [Microsoft Learn: operator precedence](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17)

NOT IN has a common trap: a NULL in the compared list/subquery can leave a nonmatching candidate UNKNOWN, so WHERE filters it. NOT EXISTS expresses an anti-match without that NULL poisoning, provided the correlation condition expresses the intended comparison. ANY/SOME and ALL compare against a subquery set; SQL Server’s documentation defines empty-set behavior and UNKNOWN cases, so do not reduce them to an English slogan.

## LIKE and regular expressions are distinct tools

LIKE uses `%` for zero-or-more characters, `_` for one character, and bracket expressions for one-character sets/ranges. ESCAPE makes a wildcard literal. Collation and character data type influence case/accent/range matching and trailing-space details. REGEXP_LIKE uses regex syntax and flags `c`, `i`, `m`, `s`; it requires compatibility level 170 in SQL Server 2025 and does not honor collations. Only a restricted anchored pattern subset is documented as SARGable. [Microsoft Learn: LIKE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17) [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)

## Ordering is a contract only when requested

Without the outer ORDER BY, result order is unspecified. A list of sort keys works left-to-right: each later key resolves only ties from earlier keys. An ORDER BY that is not unique can still leave row order unstable; append a unique key for paging. SQL Server sorts NULL as the lowest value, so it appears first in ascending and last in descending order. A collation-specific sort may differ from another database or locale. ORDER BY inside a view or derived table selects rows only when paired with a row limit; it does not impose outer result order. [Microsoft Learn: ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)

## Row limiting and pagination

TOP without ORDER BY selects an undefined subset. TOP PERCENT rounds a fractional count upward; WITH TIES may return more than N and requires ORDER BY. OFFSET/FETCH is part of ORDER BY, and TOP cannot share its query scope. OFFSET must be nonnegative; FETCH must be at least one. OFFSET/FETCH was introduced in SQL Server 2012. [Microsoft Learn: TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17) [Microsoft Learn: ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)

Offset pagination identifies a position from the start, which is convenient for numbered pages but can require work through earlier rows. Keyset pagination adds a lexicographic “after last key” predicate and is suited to sequential continuation. Neither a unique ordering nor keyset navigation guarantees a frozen dataset if rows change. Microsoft’s stability guidance for separate OFFSET/FETCH requests requires no relevant data change or all pages in a single SNAPSHOT/SERIALIZABLE transaction plus unique ordering; snapshot isolation must be enabled, while serializable range locks can reduce concurrency. A long-lived transaction across user think time may be unsuitable, so define the product’s consistency requirement first. [Microsoft Learn: paging stability](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17) [Microsoft Learn: isolation levels](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)

## Current SQL Server boundary

SQL Server 2022 introduced `IS [NOT] DISTINCT FROM`; SQL Server 2025 introduced REGEXP_LIKE with compatibility level 170. The Microsoft Learn SELECT and ORDER BY pages also show Fabric-only `QUALIFY` and `ORDER BY ALL` forms separately; those are not SQL Server syntax. Do not copy a feature from a shared product documentation page without checking the “Applies to” surface. [SQL Server 2025 changes](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17) [Microsoft Learn: SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17) [Microsoft Learn: ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)

# Mechanisms and relationships

| Stage | Logical responsibility | Visible facts |
| --- | --- | --- |
| FROM | Establish row sources and names | Source columns and table aliases |
| WHERE | Keep rows whose predicate is TRUE | FALSE and UNKNOWN are excluded |
| SELECT | Form projected output | Expressions and aliases |
| DISTINCT | Remove equal projected tuples | Every selected column participates |
| ORDER BY | Define returned sequence | Later keys break earlier ties |
| TOP/OFFSET/FETCH | Limit rows from the ordered set | The sort determines which rows count |

# Worked examples

## NULL-safe change detection

```sql
SELECT c.CustomerId, c.Status
FROM dbo.Customers AS c
WHERE c.Status IS DISTINCT FROM @PreviousStatus;
```

This selects a changed value even when exactly one side is NULL; two NULLs are not distinct. Ordinary `<>` would yield UNKNOWN when either side is NULL.

## Null-safe anti-match

```sql
SELECT p.ProductId
FROM dbo.Products AS p
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.DiscontinuedProducts AS d
    WHERE d.ProductId = p.ProductId
);
```

The subquery asks whether a matching row exists. An unrelated NULL in `DiscontinuedProducts.ProductId` does not poison every unmatched product, unlike NOT IN. If either key can be NULL and NULL should count as equal, encode that rule explicitly.

## Stable numbered page

```sql
DECLARE @Offset bigint = 40;
DECLARE @PageSize int = 20;

SELECT o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
WHERE o.Status = N'Open'
ORDER BY o.CreatedAt DESC, o.OrderId DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
```

OrderId breaks ties in CreatedAt, making a deterministic order for a static dataset. It still does not freeze rows between requests. Validate page inputs; a negative offset or a zero FETCH count is invalid.

## Continuation-key page

```sql
DECLARE @LastCreatedAt datetime2(7) = '2026-10-01T12:00:00';
DECLARE @LastOrderId bigint = 9000;
DECLARE @PageSize int = 20;

SELECT TOP (@PageSize) o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
WHERE o.Status = N'Open'
  AND (o.CreatedAt < @LastCreatedAt
       OR (o.CreatedAt = @LastCreatedAt AND o.OrderId < @LastOrderId))
ORDER BY o.CreatedAt DESC, o.OrderId DESC;
```

This assumes CreatedAt is non-NULL and the continuation tuple came from the prior result. The predicate mirrors the descending lexicographic order. If sort keys are nullable or mutable, define explicit ordering/null rules and continuation semantics.

# Misconceptions and edge cases

- Logical binding order explains name scope; it does not prescribe physical execution order.
- `WHERE x = NULL` is not a NULL test.
- NOT UNKNOWN remains UNKNOWN; NOT IN may be affected by one NULL in its set.
- DISTINCT removes duplicates in the projected tuple, not duplicate source records by business key.
- ORDER BY with nonunique keys does not totally order rows.
- TOP without ORDER BY chooses no predictable subset.
- WITH TIES may exceed the requested row count and does not order the tied rows among themselves.
- A unique page key does not create a snapshot across independent requests.
- SQL Server 2025 REGEXP_LIKE requires compatibility level 170 and ignores collations; LIKE is not regex.
- Shared Learn pages may document Fabric syntax beside SQL Server syntax.

# Knowledge checks with answers

1. **Why can ORDER BY see a SELECT alias when WHERE cannot?** Its logical binding stage follows projection; WHERE binds before the select list.
2. **What does WHERE do with UNKNOWN?** It does not retain that row; only TRUE passes.
3. **Why is NOT IN risky with nullable subquery output?** A nonmatch against a NULL can yield UNKNOWN, which WHERE excludes.
4. **What does DISTINCT deduplicate?** The entire projected row tuple.
5. **What makes paging order deterministic on a static result?** A sort-key tuple unique for every row.
6. **What exact SQL Server 2025 boundary applies to REGEXP_LIKE?** Database compatibility level 170 or higher; SQL Server 2022 and earlier do not expose it.
7. **Does a unique sort key make multiple HTTP requests a consistent snapshot?** No; data changes still require a separate consistency strategy.

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server logical operators](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/logical-operators-transact-sql?view=sql-server-ver17)
- [SQL Server ANY and SOME](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/some-any-transact-sql?view=sql-server-ver17)
- [SQL Server ALL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/all-transact-sql?view=sql-server-ver17)
- [SQL Server operator precedence](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17)
- [SQL Server LIKE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY and paging](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server transaction isolation](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)
- [SQL Server UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
