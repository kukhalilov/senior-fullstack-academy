# select filtering sorting and pagination — Exercises and worked solutions

# Goals

Translate a requirement into a query shape; reason through NULL and Boolean conditions; write a predictable order; select an appropriate row-limiting method; and verify SQL Server-specific syntax against the current engine and compatibility level.

# Worked example

Requirement: return the 10 newest non-cancelled orders for a customer, with every order at the boundary timestamp included.

```sql
SELECT TOP (10) WITH TIES
       o.OrderId, o.CustomerId, o.CreatedAt, o.Status
FROM dbo.Orders AS o
WHERE o.CustomerId = @CustomerId
  AND o.Status <> N'Cancelled'
ORDER BY o.CreatedAt DESC;
```

TOP uses the ordered rows. WITH TIES may return more than 10 when multiple orders share the last selected CreatedAt value. If exactly 10 rows are required, omit WITH TIES and add a unique key as a tie-breaker. This query also excludes NULL Status values because `<>` produces UNKNOWN for them; if NULL status should qualify, express that rule separately.

# Exercises

1. `Orders.Status` is nullable. Return open or pending orders, but exclude rows with unknown status. Add a minimum total filter and show intended Boolean grouping.
2. Return all products with no matching row in `DiscontinuedProducts`. The subquery’s ProductId column is nullable. Avoid NOT IN’s NULL trap.
3. A report selects `OrderDate AS DateLabel` and tries to filter with `WHERE DateLabel >= @Start`. Explain why it fails and show two valid query-boundary approaches.
4. Sort customers by last name and then first name. Explain what still prevents a deterministic total order and add a unique tie-breaker.
5. Return the second page of 25 orders ordered newest first. State all assumptions needed for deterministic page membership.
6. A case-insensitive database column must be regex-filtered for a pattern. Explain why the database collation is insufficient and show a SQL Server 2025 flag example.
7. Explain what changes if `TOP (10) PERCENT` is applied to 23 ordered rows, and how ties differ from percentage rounding.
8. A user asks for every row whose `Code` is not in a set returned by a subquery. Compare NOT IN and NOT EXISTS when that set may include NULL.

# Progressive hints

1. Parenthesize OR conditions and use IS NULL only if NULL should be included.
2. NOT EXISTS asks if a correlated matching row exists.
3. WHERE binds before SELECT; repeat the expression or wrap projection in a derived query.
4. Tied names remain tied; choose a unique key.
5. A unique order is necessary on the static data. OFFSET skips; page requests may see changes.
6. Use the regex-specific `i` flag; compatibility level 170 is required.
7. Compute the percentage count, round upward, then apply WITH TIES only if requested.
8. A NULL in NOT IN can make a nonmatching predicate UNKNOWN.

# Complete solutions

1. `WHERE (Status = N'Open' OR Status = N'Pending') AND Total >= @MinimumTotal` keeps only rows for which the full condition is TRUE. NULL statuses make both equality tests UNKNOWN and therefore do not pass. If the requirement includes missing status, add `OR Status IS NULL` inside the parentheses.
2. Use `WHERE NOT EXISTS (SELECT 1 FROM dbo.DiscontinuedProducts AS d WHERE d.ProductId = p.ProductId)`. A NULL row in the inner source does not turn every nonmatching product into UNKNOWN. This assumes a NULL product key should not match another NULL; specify a null-safe correlation if the data model defines that behavior.
3. The SELECT alias is not visible to WHERE in the same query scope because WHERE binds earlier. Repeat the source expression in WHERE, or project it in a derived table/CTE and filter the resulting column from the outer query. The latter creates a name boundary, though it does not force materialization.
4. Use `ORDER BY LastName, FirstName, CustomerId` if CustomerId uniquely identifies a customer. Last and first names alone can repeat; stable ordering for a static result requires a unique tuple.
5. Use `ORDER BY CreatedAt DESC, OrderId DESC OFFSET 25 ROWS FETCH NEXT 25 ROWS ONLY`. Both keys and page parameters must be valid; OrderId is assumed unique. To keep one consistent multi-page view while data changes, a separate transaction/isolation strategy is required; otherwise new writes may shift page membership.
6. Use `REGEXP_LIKE(Code, '^ab[0-9]+$', 'i')` on SQL Server 2025 with database compatibility level 170 or higher. Regex ignores collation rules; `i` explicitly requests case-insensitive matching. The anchored pattern here uses a start anchor and a range/quantifier form, but only Microsoft’s documented subset is guaranteed SARGable. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
7. Twenty-three rows times ten percent is 2.3; PERCENT rounds the fractional count up, so TOP (10) PERCENT selects three ordered rows before tie behavior. WITH TIES is a separate option that can add more rows matching the final ORDER BY key values.
8. NOT IN can return UNKNOWN for a nonmatching outer value if the inner set contains NULL, so WHERE removes the row. NOT EXISTS with an equality correlation avoids that poisoning. Confirm whether NULL outer keys should be included or treated as equal, because that is a separate data-model rule.

# Tests and edge cases

Include NULL and non-NULL predicate operands; empty and duplicate subquery results; lists containing NULL; equal sort keys; zero and negative paging values; NULL sort keys; collation-sensitive text; Unicode and trailing spaces in LIKE; regex flags and database compatibility level; percentage rounding; WITH TIES over multiple duplicate boundary rows; and inserts/updates/deletes between page requests. Test intended output order explicitly, not by relying on one observed plan.

# Reflection questions

- Does WHERE retain a row if its predicate is UNKNOWN?
- Is each output alias in scope where it is referenced?
- Is the final ORDER BY unique for this filtered result?
- Does a NULL value change the meaning of this NOT or comparison?
- Is the requested SQL syntax supported by SQL Server or only by Fabric?
- What data-consistency promise do multiple page requests actually need?

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server LIKE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY and paging](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server transaction isolation](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)
