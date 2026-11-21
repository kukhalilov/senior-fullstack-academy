# aggregation grouping and window functions — Reference: GROUP BY, aggregates, and HAVING

# Scope and version

This reference explains all 38 frozen names in **GROUP BY, aggregates, and HAVING** for SQL Server 2025 (17.x) T-SQL. Version and compatibility-level boundaries are called out where they change availability.

# How this group fits the mental model

Aggregation converts rows into summaries, so define the group grain before choosing functions. WHERE acts on source rows, HAVING acts on groups, and return type/NULL rules determine whether the numeric or textual result satisfies the contract.

# Supplied names explained

| Exact supplied item | SQL Server behavior and boundary |
| --- | --- |
| `GROUP BY clause` | Forms one output group for each distinct combination of the grouping expressions. Every selected expression must be grouped, aggregated, or otherwise valid under SQL Server grouping rules. GROUP BY does not order the output. |
| `GROUP BY expression` | A grouping key can be a column or nonaggregate expression. It cannot be a select-list alias, aggregate expression, or subquery, and legacy text, ntext, and image types cannot be grouping expressions. Compute complex keys in a derived table when that makes the query clearer. |
| `Multiple grouping columns` | The tuple of values across all listed expressions defines each group. Grouping by (Region, Year) does not mean two independent groupings; it creates one group per pair. |
| `GROUP BY ordinal unsupported boundary` | SQL Server does not allow a select-list ordinal such as GROUP BY 1 to identify a grouping expression. Write the column or expression explicitly; ORDER BY ordinal behavior is separate. |
| `GROUP BY ALL legacy syntax` | SQL Server retains the backward-compatible `GROUP BY ALL column-expression` form. It can include groups filtered out by WHERE, returning NULL aggregate values for those groups; it is disallowed with GROUPING SETS, ROLLUP, and CUBE and has remote-table/FILESTREAM restrictions. Avoid it in new code. Do not confuse it with the separate Fabric `GROUP BY ALL` syntax ([GROUP BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)). |
| `WHERE before grouping` | WHERE filters individual input rows before the grouping operation. A row rejected here cannot contribute to any aggregate or group. |
| `HAVING after grouping` | HAVING filters formed groups, commonly using aggregate expressions. Use WHERE for row-level restrictions when possible so excluded rows do not enter aggregation at all. |
| `Aggregate function` | An aggregate reduces a set of input values to one result per group (or one result for a scalar aggregate query). Most SQL Server aggregates ignore NULL inputs; COUNT(*) is the important exception. Most support OVER, except STRING_AGG, GROUPING, and GROUPING_ID. |
| `COUNT(*)` | Counts every input row, including rows whose columns are NULL. It returns int and can overflow above 2,147,483,647; use COUNT_BIG(*) when a bigint count is needed. A scalar COUNT(*) over empty input returns zero. |
| `COUNT(expression)` | Counts rows where the expression is not NULL; duplicate non-NULL values count repeatedly. Its result type is int, so large counts can overflow. |
| `COUNT(DISTINCT expression)` | Counts unique non-NULL values of one expression. SQL Server COUNT(DISTINCT ...) accepts one expression; it is not a multi-column tuple syntax. DISTINCT aggregate windows are not supported with OVER in SQL Server. |
| `Aggregate ALL and DISTINCT modifiers` | Many value aggregates accept ALL (the default, counting every occurrence) or DISTINCT (apply the aggregate once to each unique non-NULL input value). This modifier changes the input multiset before aggregation; it is not the same as SELECT DISTINCT on the final rows. COUNT(*) does not support DISTINCT. |
| `COUNT_BIG` | COUNT_BIG has COUNT semantics but returns bigint, including for COUNT_BIG(*), and is appropriate when a row count might exceed int. It supports row, non-NULL-expression, and distinct-expression forms. |
| `SUM` | Adds non-NULL numeric values. Return type depends on input type; for decimal input SQL Server returns decimal(38, input scale). Integer accumulation can overflow, so cast to a wider type before summing when the range requires it. |
| `AVG` | Divides the sum of non-NULL values by their count. Its return type follows SQL Server type rules and can be narrower than expected for integer inputs; cast before AVG when fractional precision is required. Empty or all-NULL input yields NULL. |
| `MIN` | Returns the lowest non-NULL value under the data type’s comparison rules. It supports comparable expressions, not bit, and returns NULL when there are no non-NULL values. |
| `MAX` | Returns the highest non-NULL value under the data type’s comparison rules. It supports comparable expressions, not bit, and returns NULL when there are no non-NULL values. |
| `STRING_AGG` | Concatenates non-NULL expression values with a separator. NULL values and their separators are omitted. Cast to a MAX string type when a bounded inferred return type could truncate or raise a length error; input and separator varchar/nvarchar types must be compatible. |
| `STRING_AGG WITHIN GROUP ordering` | WITHIN GROUP (ORDER BY ...) makes concatenation order explicit. The order clause is available at compatibility level 110 or higher; a query has one ordered-aggregation order list. This does not order the SELECT result ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)). |
| `STRING_AGG DISTINCT unsupported boundary` | STRING_AGG syntax has expression and separator arguments but no DISTINCT modifier. To concatenate distinct values, deduplicate rows in a subquery or derived table before applying STRING_AGG, preserving any required group and ordering keys. |
| `APPROX_COUNT_DISTINCT` | Returns an approximate count of unique non-NULL values as bigint. Microsoft documents up to 2% error within 97% probability; it targets large cardinalities, not exact counts. SQL Server uses binary matching for collation-sensitive strings, so results can differ from a case-insensitive exact COUNT(DISTINCT ...) ([APPROX_COUNT_DISTINCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)). |
| `APPROX_COUNT_DISTINCT accuracy and collation boundary` | The documented error guarantee is probabilistic, not a per-query exactness promise. It excludes image, sql_variant, ntext, and text inputs. For collation-sensitive strings, matching follows BIN behavior rather than BIN2 or the database’s ordinary linguistic comparison. |
| `PRODUCT` | SQL Server 2025 (17.x) adds PRODUCT(expression), multiplying numeric non-bit values while ignoring NULL. It supports ALL by default, DISTINCT in aggregate form, and an analytic OVER form. Use it only when multiplication is the intended model and numeric range/precision are appropriate ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). |
| `PRODUCT DISTINCT` | PRODUCT(DISTINCT expression) multiplies each unique non-NULL numeric value once. This differs from the default PRODUCT, which multiplies every occurrence; it is a SQL Server 2025 addition. |
| `PRODUCT return type` | Return type follows the input: tinyint/smallint/int produce int; bigint produces bigint; decimal with scale 0 produces decimal(38,0), otherwise decimal(38,6); money/smallmoney produce money; real/float produce float. The scale rule can round a decimal product, so cast and verify the required precision ([PRODUCT return types](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). |
| `STDEV` | Returns the sample standard deviation, estimating dispersion using the sample denominator. It accepts numeric input, ignores NULL, and returns float; use STDEVP when the values are the entire population. |
| `STDEVP` | Returns the population standard deviation using all non-NULL values as the population. It accepts numeric input and returns float; it is not interchangeable with sample STDEV. |
| `VAR` | Returns sample variance for non-NULL numeric values as float. Use VARP when the rows are the complete population rather than a sample. |
| `VARP` | Returns population variance for all non-NULL numeric values as float. It differs from sample VAR in the denominator used. |
| `ANY_VALUE unsupported in SQL Server` | ANY_VALUE appears in Microsoft documentation for some other Microsoft SQL platforms, but it is not a SQL Server Database Engine aggregate. Do not copy Fabric-only syntax into SQL Server. If a representative value is functionally determined by a grouped key, model that dependency or choose a deterministic aggregate only when its semantics are correct ([ANY_VALUE platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric)). |
| `MEDIAN unsupported in SQL Server` | The MEDIAN aggregate listed for Fabric analytics endpoints and Fabric Warehouse is not supported in the SQL Server Database Engine. Use PERCENTILE_CONT(0.5) WITHIN GROUP with OVER (PARTITION BY ...) for a median per partition, or an explicitly designed alternative ([MEDIAN platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric)). |
| `APPROX_MEDIAN unsupported in SQL Server` | APPROX_MEDIAN is listed for other Microsoft data platforms, not the SQL Server Database Engine. Do not treat it as a SQL Server aggregate; approximate distinct counting is a separate supported function ([APPROX_MEDIAN platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric)). |
| `APPROX_QUANTILE unsupported in SQL Server` | APPROX_QUANTILE is not supported by the SQL Server Database Engine. It appears in other Microsoft analytics platforms and must not be used as if it were a SQL Server T-SQL aggregate ([APPROX_QUANTILE platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=fabric)). |
| `CHECKSUM_AGG` | Returns an integer checksum over a group and ignores NULL inputs. It can help detect some changes but collisions are possible; it is not a cryptographic hash or proof that two datasets are equal. |
| `Aggregate NULL exclusion` | Except for COUNT(*), SQL Server aggregate functions ignore NULL input values. COUNT(expression), SUM, AVG, MIN, MAX, statistical aggregates, PRODUCT, and STRING_AGG therefore summarize non-NULL inputs; this is distinct from filtering rows in WHERE. |
| `Aggregate over empty input` | A scalar aggregate without GROUP BY still returns one row for empty input: COUNT and COUNT_BIG return zero; SUM, AVG, MIN, MAX and most value aggregates return NULL. A grouped aggregate over empty input has no groups and returns no rows. |
| `Aggregate result type and overflow` | Aggregate return types are specified per function and are not always the widest possible type. COUNT can overflow int, and SUM can overflow its accumulator. Cast inputs deliberately before aggregation; converting the already-overflowed result is too late. |
| `GROUP BY with NULL` | Rows whose grouping key is NULL form one group because NULL grouping values are collected together. This grouping behavior is not the same as ordinary `NULL = NULL`, which is UNKNOWN. |

# Cross-item comparison

WHERE filters rows before grouping; HAVING filters after aggregation. COUNT(*) includes NULL-bearing rows; COUNT(expression) does not. COUNT uses int and COUNT_BIG uses bigint. Exact aggregates, approximate distinct counts, statistical summaries, ordered string concatenation, and SQL Server 2025 PRODUCT have different contracts.

# Examples

```sql
SELECT StoreId, COUNT_BIG(*) AS SaleCount,
       SUM(CAST(Amount AS decimal(19, 4))) AS TotalAmount,
       AVG(CAST(Amount AS decimal(19, 4))) AS AverageAmount,
       STRING_AGG(CONVERT(nvarchar(max), Note), N'; ')
         WITHIN GROUP (ORDER BY SaleId) AS Notes
FROM dbo.Sales
WHERE Status = N'Posted'
GROUP BY StoreId
HAVING SUM(Amount) > 1000;
```

WHERE limits contributing rows; GROUP BY defines one row per store; HAVING filters the completed groups. COUNT_BIG avoids the int row-count ceiling. Explicit casts document numeric precision and STRING_AGG output width/order.

# Common mistakes

- Putting an aggregate condition in WHERE.
- Using COUNT(column) when NULL rows must count.
- Casting only after SUM has already overflowed.
- Assuming STRING_AGG input order without WITHIN GROUP.
- Using approximate distinct count where exactness is contractual.

# Knowledge checks with answers

1. **A nullable `Discount` column should count only known discounts while the total order count includes every row. Which expressions fit?** `COUNT(Discount)` and `COUNT(*)`; the first excludes NULL, the second counts rows.
2. **A grouped report can exceed 2.1 billion rows. Which count should be selected and why?** `COUNT_BIG`, which returns `bigint`; `COUNT` returns `int` and can overflow.
3. **A `SUM(intColumn)` can exceed the `int` range. Does casting the final result to `bigint` prevent the aggregate overflow?** No. Cast the input before aggregation, e.g. `SUM(CONVERT(bigint, intColumn))`.
4. **`STRING_AGG` omits some labels and produces inconsistent order. What should be checked?** NULL expressions are omitted along with their separators; use `ISNULL`/`COALESCE` if placeholders are required and `WITHIN GROUP (ORDER BY ...)` for concatenation order. Cast to a MAX string type when necessary to avoid the bounded return type.
5. **A case-insensitive collation query uses `APPROX_COUNT_DISTINCT` and differs from exact `COUNT(DISTINCT ...)`. Is that necessarily a bug?** No. Its documented string matching is binary and its count is probabilistic; it is not interchangeable with exact linguistic distinctness.
6. **A query copied from Fabric uses `APPROX_QUANTILE`. What should a SQL Server user do?** Do not assume cross-product compatibility. That function is documented for Fabric, not the SQL Server Database Engine; use the SQL Server percentile functions that meet the required accuracy contract.


# Sources

- [Microsoft Learn: group](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: aggregates](https://learn.microsoft.com/en-us/sql/t-sql/functions/aggregate-functions-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: over](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: window](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: product](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: countBig](https://learn.microsoft.com/en-us/sql/t-sql/functions/count-big-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: approx](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: stringAgg](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: lag](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: lead](https://learn.microsoft.com/en-us/sql/t-sql/functions/lead-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: first](https://learn.microsoft.com/en-us/sql/t-sql/functions/first-value-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: last](https://learn.microsoft.com/en-us/sql/t-sql/functions/last-value-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: ntile](https://learn.microsoft.com/en-us/sql/t-sql/functions/ntile-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: rank](https://learn.microsoft.com/en-us/sql/t-sql/functions/rank-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: rowNumber](https://learn.microsoft.com/en-us/sql/t-sql/functions/row-number-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: denseRank](https://learn.microsoft.com/en-us/sql/t-sql/functions/dense-rank-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: percentRank](https://learn.microsoft.com/en-us/sql/t-sql/functions/percent-rank-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: cumeDist](https://learn.microsoft.com/en-us/sql/t-sql/functions/cume-dist-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: percentileCont](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: percentileDisc](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: approxPercentileCont](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: approxPercentileDisc](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: anyValue](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric)
- [Microsoft Learn: median](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric)
- [Microsoft Learn: approxMedian](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric)
- [Microsoft Learn: approxQuantile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=fabric)
- [Microsoft Learn: grouping](https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: groupingId](https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-id-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: having](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-having-transact-sql?view=sql-server-ver17)
