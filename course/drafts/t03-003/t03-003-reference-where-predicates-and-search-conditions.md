# select filtering sorting and pagination — Reference: WHERE predicates, comparisons, Boolean logic, NULL semantics, subqueries, and text patterns

# Scope and version

This reference explains all 44 supplied items in **WHERE predicates, comparisons, Boolean logic, NULL semantics, subqueries, and text patterns** and adds no neighboring query API. The target is SQL Server 2025 (17.x) T-SQL. Version-specific claims below are cited at the point of use. SQL Server product surfaces differ; Microsoft Learn labels Fabric-only grammar separately from SQL Server grammar.

# How this group fits the mental model

A WHERE clause keeps rows for which the full search condition is TRUE. Because SQL Server predicates can yield UNKNOWN, NULL behavior must be reasoned through every comparison, NOT, and membership operation rather than treated as ordinary Boolean negation.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `Search condition` | A Boolean composition of predicates used to decide which rows satisfy a WHERE filter. SQL Server conditions can evaluate to TRUE, FALSE, or UNKNOWN, and the optimizer may evaluate expressions in an order different from their textual arrangement. |
| `Boolean TRUE` | The condition is satisfied; a WHERE clause retains that row. TRUE is not the same as “nonzero” or a truthy programming-language value in T-SQL. |
| `Boolean FALSE` | The condition is not satisfied; WHERE removes that row. FALSE also results from negating TRUE, but UNKNOWN remains UNKNOWN when negated. |
| `Boolean UNKNOWN` | The result when a predicate cannot decide TRUE or FALSE, commonly because a comparison operand is NULL. WHERE does not retain UNKNOWN; this is why a missing value is not tested with ordinary equality. |
| `Three-valued logic` | SQL predicate logic has TRUE, FALSE, and UNKNOWN. NOT UNKNOWN is UNKNOWN; AND/OR use truth tables, so “not matching” is not always the inverse set when NULL participates. |
| `Comparison operator =` | Tests equality under SQL Server’s data-type conversion and, for strings, collation rules. If either operand is NULL, the result is UNKNOWN; use a null-safe predicate when NULL must compare as a value. |
| `Comparison operator >` | Tests whether the left expression compares greater than the right after SQL Server’s type and collation rules. NULL yields UNKNOWN; string ordering can be collation dependent. |
| `Comparison operator <` | Tests whether the left expression compares less than the right. NULL yields UNKNOWN, and text ordering follows the applicable collation rather than a universal alphabet. |
| `Comparison operator >=` | Tests greater-than-or-equal under the operand types and collation. It remains UNKNOWN if either operand is NULL. |
| `Comparison operator <=` | Tests less-than-or-equal under the operand types and collation. It remains UNKNOWN if either operand is NULL. |
| `Comparison operator <> (not equal)` | The standard T-SQL not-equal spelling. It produces UNKNOWN when either operand is NULL, so it does not select rows whose value is missing. |
| `Comparison operator != (non-ISO not equal)` | A supported SQL Server not-equal spelling with the same comparison behavior as `<>`, including UNKNOWN for NULL operands. Prefer the ISO-style spelling for portable SQL text. |
| `Comparison operator !< (non-ISO not less than)` | The non-ISO spelling for “not less than,” documented as a comparison operator in T-SQL. It is harder to read and less portable; NULL still makes the comparison UNKNOWN. |
| `Comparison operator !> (non-ISO not greater than)` | The non-ISO spelling for “not greater than,” documented by SQL Server. Prefer conventional comparison forms where they express the intended range more clearly; NULL still yields UNKNOWN. |
| `Logical operator NOT` | Negates a Boolean condition: TRUE becomes FALSE and FALSE becomes TRUE, while UNKNOWN stays UNKNOWN. It binds more tightly than AND and OR in SQL Server. |
| `Logical operator AND` | The conjunction is TRUE only when both sides are TRUE. A FALSE side makes it FALSE even if the other is UNKNOWN; otherwise an UNKNOWN side can make the result UNKNOWN. |
| `Logical operator OR` | The disjunction is TRUE when either side is TRUE. It is FALSE only when both sides are FALSE; an unresolved UNKNOWN may propagate when no side is TRUE. |
| `AND before OR operator precedence` | SQL Server evaluates NOT before AND before OR in logical binding. Write parentheses around intended groups; the optimizer can reorder physical predicate evaluation, so precedence is not a short-circuit safety mechanism. |
| `Parenthesized search condition` | Parentheses explicitly group predicates and override operator precedence. They communicate business intent and protect logic when conditions are added later. |
| `BETWEEN and NOT BETWEEN` | BETWEEN tests an inclusive range: both endpoints are included. NOT BETWEEN negates that predicate, but NULL operands can still yield UNKNOWN; for timestamp day ranges, half-open bounds are often safer than inventing a final time. |
| `IN and NOT IN value-list predicate` | IN matches when an expression equals a member of the parenthesized list; NOT IN negates the membership result. A NULL in a list can make a nonmatching comparison UNKNOWN and eliminate it from WHERE. |
| `IN and NOT IN subquery predicate` | The subquery supplies membership values and is evaluated as part of the predicate. NOT IN is especially dangerous if the subquery can return NULL; use NOT EXISTS with a correctly correlated condition when null-safe anti-matching is intended. |
| `EXISTS and NOT EXISTS subquery predicate` | EXISTS is TRUE when the subquery returns at least one row; NOT EXISTS is true when it returns none. The subquery’s projection values are irrelevant to the existence test, and NULL in the selected expression does not make an existing row disappear. |
| `ANY and SOME quantified comparison` | ANY and SOME are synonyms: the comparison is TRUE when at least one subquery value makes it TRUE. An empty subquery yields FALSE; if no comparison is true but an unresolved NULL comparison exists, the overall result can be UNKNOWN. |
| `ALL quantified comparison` | ALL requires the comparison to be TRUE for every returned value. With an empty set, there is no counterexample, so the universal comparison is TRUE; with NULL comparisons and no FALSE result, the result can be UNKNOWN. SQL Server documents the every-pair rule; the empty-set conclusion follows from that universal definition. |
| `IS NULL and IS NOT NULL` | These predicates test whether an expression is missing or present and always return a definite condition result. They are the ordinary way to filter NULL; `= NULL` is not a substitute. |
| `IS DISTINCT FROM and IS NOT DISTINCT FROM` | SQL Server 2022 added null-safe comparison predicates: they always return TRUE or FALSE, treating two NULLs as not distinct and one NULL versus a non-NULL as distinct. This differs from `=`/`<>`, which return UNKNOWN for NULL operands. [Microsoft Learn: IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17) |
| `NULL in NOT IN subquery result` | If a NOT IN subquery returns NULL and no non-NULL value matches, the condition can be UNKNOWN rather than TRUE, so the row is filtered out. Prefer NOT EXISTS when the subquery may contain NULL and an anti-match is intended. |
| `LIKE and NOT LIKE predicate` | LIKE matches a string against its wildcard grammar; NOT LIKE negates the match under three-valued logic. String type, trailing spaces, and collation can affect results, so a quick pattern is not a regular expression. |
| `LIKE percent wildcard (%)` | The percent sign matches zero or more characters. `%cat%` can match a substring anywhere; a leading wildcard often prevents a simple left-anchored index seek, so use it knowingly. |
| `LIKE underscore wildcard (_)` | Underscore matches exactly one character. Escape it when searching for a literal underscore, otherwise a value such as `A_1` is a pattern rather than exact text. |
| `LIKE bracket character class ([...])` | A bracket expression matches one character from a set or range, such as `[ABC]` or `[A-F]`. Range membership can depend on collation sort rules; it is not the same syntax as a regular expression. |
| `LIKE negated bracket character class ([^...])` | A bracket class beginning with `^` matches one character outside the listed set or range. The caret is special inside this bracket form; test escaping and collation-sensitive ranges carefully. |
| `LIKE ESCAPE character` | ESCAPE designates one character that makes a following wildcard literal, such as an underscore in user input. The escape expression must be one character; escape user-supplied patterns deliberately rather than concatenating raw input. |
| `LIKE collation-sensitive matching` | LIKE uses SQL Server string comparison/collation behavior, which can vary in case, accent, width, kana, and sorting rules. Character classes, trailing spaces, and Unicode/non-Unicode types add edge cases; choose a collation intentionally. |
| `REGEXP_LIKE(string_expression,pattern_expression[,flags])` | The SQL Server 2025 predicate/function tests whether a character string matches a regular-expression pattern; the optional flags argument changes matching modes. It requires database compatibility level 170 and is not available in SQL Server 2022 or earlier. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17) |
| `REGEXP_LIKE case-sensitive flag c` | The `c` modifier requests case-sensitive regex matching and is the default. If contradictory `c` and `i` modifiers appear, SQL Server documents that the last character wins. |
| `REGEXP_LIKE case-insensitive flag i` | The `i` modifier requests case-insensitive regex matching. Regex case behavior is not derived from a column’s linguistic collation; the flag is the explicit regex control. |
| `REGEXP_LIKE multiline flag m` | The `m` modifier changes `^` and `$` so they can match line boundaries as well as the start and end of the entire text. Without it, they anchor the whole input. |
| `REGEXP_LIKE dot-newline flag s` | The `s` modifier allows the regex dot to match newline characters. Without it, dot does not match newline. |
| `REGEXP_LIKE database compatibility level 170 requirement` | SQL Server 2025 exposes REGEXP_LIKE only at database compatibility level 170 or higher; a server engine version alone is insufficient if the database remains at a lower compatibility level. Confirm the intended database setting before deployment. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17) |
| `REGEXP_LIKE ignores collation rules` | Regular-expression matching does not honor SQL Server collation rules, unlike many ordinary string comparisons. A case-insensitive linguistic collation therefore does not silently make the regex case-insensitive; select the regex `i` or `c` flag. |
| `REGEXP_LIKE SARGable anchored-pattern boundary` | Microsoft documents REGEXP_LIKE as SARGable only when the pattern starts with `^`; supported anchored patterns can include quantifiers `*`, `+`, `?`, `{n}`, `{n,}`, or `{n,m}`, and character ranges such as `[0-9A-Za-z]`. Escaping a metacharacter uses backslash. This narrow optimizer-supported grammar is not a guarantee that arbitrary regex patterns use an index; inspect the plan for the actual query. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17) |
| `Predicate versus scalar expression` | A predicate answers whether a condition is satisfied in a search context; a scalar expression produces a value. Use CASE when a condition must produce a projected value, and do not assume SQL Server evaluates predicates left-to-right as a procedural guard. |

# Cross-item comparison

`= NULL` produces UNKNOWN; `IS NULL` tests for missingness; `IS [NOT] DISTINCT FROM` (SQL Server 2022+) gives a null-safe definite comparison. LIKE uses wildcard characters and collation-sensitive string rules; SQL Server 2025 REGEXP_LIKE uses regex flags and compatibility level 170, ignores collation rules, and has only a restricted SARGable pattern boundary.

# Examples

```sql
SELECT o.OrderId, o.Status, o.Total
FROM dbo.Orders AS o
WHERE o.CancelledAt IS NULL
  AND (o.Status = N'Open' OR o.Status = N'Pending')
  AND o.Total >= @MinimumTotal;
```

This snippet illustrates the group’s rules. Its result order, NULL behavior, parameter values, and schema assumptions are explained above; validate it against the target schema and database compatibility level.



# Common mistakes

- Writing `= NULL` or `<> NULL`.
- Assuming NOT UNKNOWN becomes TRUE.
- Using NOT IN when its source can return NULL.
- Relying on short-circuit evaluation to protect an invalid expression.
- Treating SQL Server 2025 REGEXP_LIKE as available at every database compatibility level.

# Knowledge checks with answers

1. **Which exact inventory items does this reference cover?** `Search condition`, `Boolean TRUE`, `Boolean FALSE`, `Boolean UNKNOWN`, `Three-valued logic`, `Comparison operator =`, `Comparison operator >`, `Comparison operator <`, `Comparison operator >=`, `Comparison operator <=`, `Comparison operator <> (not equal)`, `Comparison operator != (non-ISO not equal)`, `Comparison operator !< (non-ISO not less than)`, `Comparison operator !> (non-ISO not greater than)`, `Logical operator NOT`, `Logical operator AND`, `Logical operator OR`, `AND before OR operator precedence`, `Parenthesized search condition`, `BETWEEN and NOT BETWEEN`, `IN and NOT IN value-list predicate`, `IN and NOT IN subquery predicate`, `EXISTS and NOT EXISTS subquery predicate`, `ANY and SOME quantified comparison`, `ALL quantified comparison`, `IS NULL and IS NOT NULL`, `IS DISTINCT FROM and IS NOT DISTINCT FROM`, `NULL in NOT IN subquery result`, `LIKE and NOT LIKE predicate`, `LIKE percent wildcard (%)`, `LIKE underscore wildcard (_)`, `LIKE bracket character class ([...])`, `LIKE negated bracket character class ([^...])`, `LIKE ESCAPE character`, `LIKE collation-sensitive matching`, `REGEXP_LIKE(string_expression,pattern_expression[,flags])`, `REGEXP_LIKE case-sensitive flag c`, `REGEXP_LIKE case-insensitive flag i`, `REGEXP_LIKE multiline flag m`, `REGEXP_LIKE dot-newline flag s`, `REGEXP_LIKE database compatibility level 170 requirement`, `REGEXP_LIKE ignores collation rules`, `REGEXP_LIKE SARGable anchored-pattern boundary`, `Predicate versus scalar expression`. Every one is explained in the table above.
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
