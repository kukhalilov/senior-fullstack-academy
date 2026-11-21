# aggregation grouping and window functions — Core concepts and how they fit together

# Learning objectives

Predict grouped output grain; distinguish WHERE from HAVING; choose aggregate semantics for duplicates, NULL, empty input, and numeric range; generate subtotals and label them reliably; and design analytic calculations with explicit order and frame behavior.

# Prerequisites

Know SELECT, FROM, WHERE, NULL, basic numeric types, and query ordering. The earlier SQL Server SELECT topic covers filtering and final ORDER BY.

# Core concepts

## Grouping changes grain

GROUP BY forms one result row per distinct grouping-key tuple. WHERE removes source rows before that operation; HAVING filters the groups afterward. A global scalar aggregate has one group even on empty input, whereas a grouped aggregate over empty input has no groups. SQL Server collects NULL grouping keys into one group.

Aggregate functions differ in NULL handling, return types, exactness, and meaning. COUNT(*) includes every row; COUNT(expression) excludes NULL. COUNT returns int while COUNT_BIG returns bigint. SUM/AVG and numeric accumulators can overflow or lose desired fractional precision unless inputs are cast before aggregation. Statistical sample functions STDEV and VAR differ from population functions STDEVP and VARP. PRODUCT is new in SQL Server 2025 ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). STRING_AGG skips NULL expressions and needs an explicit ordering clause when concatenation order matters ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)). APPROX_COUNT_DISTINCT trades exactness for lower memory use and has a documented probabilistic error bound; it has distinct collation behavior ([function reference](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)).

Some function names listed across Microsoft database products are not available in SQL Server. ANY_VALUE, MEDIAN, APPROX_MEDIAN, and APPROX_QUANTILE are not SQL Server Database Engine functions ([ANY_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric), [MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric), [APPROX_MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric), [APPROX_QUANTILE](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=fabric)). SQL Server provides exact PERCENTILE_CONT and PERCENTILE_DISC and, since SQL Server 2022, APPROX_PERCENTILE_CONT and APPROX_PERCENTILE_DISC ([exact PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17), [exact PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17), [approximate PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [approximate PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)).

## Subtotals are extra grouping sets

GROUPING SETS names specific combinations; ROLLUP produces a key hierarchy; CUBE produces every subset and grows as 2^n. These forms can emit NULL placeholders for keys absent from a grouping set. GROUPING and GROUPING_ID reveal whether a NULL came from subtotal omission or source data. SQL Server allows at most 12 grouping expressions for CUBE/ROLLUP and at most 4,096 generated grouping sets in these advanced forms ([GROUP BY limitations](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)).

## Windows keep input rows

OVER specifies a partition, optional logical order, and an optional frame when supported by the function. PARTITION BY does not collapse rows. ROWS counts physical positions; RANGE treats all current peers together. SQL Server implements RANGE without numeric offsets and does not implement GROUPS frames. When ORDER BY exists but a frame is omitted, frame-capable functions default to RANGE UNBOUNDED PRECEDING through CURRENT ROW. This peer-aware default explains why tied rows can share a running aggregate and why LAST_VALUE returns the value from the frame's last row rather than necessarily the partition's final value; if the ORDER BY key has ties, which row is last within that peer group is not guaranteed ([OVER clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17)).

SQL Server 2022 introduced named WINDOW specifications at compatibility level 160 ([WINDOW clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17)). A function's syntax constrains which OVER components it can use: ranking functions require ordering but do not accept frames; LAG/LEAD use offsets and cannot use frames ([LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)); exact percentile functions put their value ordering in WITHIN GROUP and only partition in OVER ([PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17)). SQL Server does not allow DISTINCT aggregates with OVER.

## Function families

ROW_NUMBER assigns sequence positions; RANK leaves gaps after ties; DENSE_RANK does not. NTILE distributes rows into near-equal buckets. LAG and LEAD access preceding/following rows. FIRST_VALUE and LAST_VALUE read the current frame. PERCENT_RANK and CUME_DIST express relative position. PERCENTILE_CONT interpolates; PERCENTILE_DISC returns an observed value. SQL Server 2022 approximate percentile aggregates use rank-based error bounds ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)). A window ORDER BY does not order the final result, and ties require explicit tie-break keys whenever stable individual-row sequence matters.

# Mechanisms and relationships

An aggregate may appear in the SELECT list or HAVING clause. A window function is evaluated over rows produced by the query and does not replace WHERE or GROUP BY. Grouping metadata describes why a grouping column is NULL in a subtotal. Window function syntax is specific to each function family; the OVER grammar alone does not mean every function accepts every clause.

# Worked examples

```sql
SELECT StoreId, SaleId, SaleTime, Amount,
       SUM(Amount) OVER
       (
           PARTITION BY StoreId
           ORDER BY SaleTime, SaleId
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS RunningTotal
FROM dbo.Sales
WHERE Status = N'Posted'
ORDER BY StoreId, SaleTime, SaleId;
```

The WHERE clause selects contributing detail rows; the window retains each of them. The explicit ROWS frame and unique ordering key make the running sequence row-based and repeatable.

```sql
SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingLevel,
       SUM(SalesAmount) AS Sales
FROM dbo.Sales
GROUP BY GROUPING SETS ((Region, Year), (Region), ());
```

GROUPING_ID distinguishes the detail, regional subtotal, and grand total, including when actual Region or Year values are NULL.

# Misconceptions and edge cases

- GROUP BY does not promise output ordering.
- GROUP BY ordinal is not supported in SQL Server.
- GROUP BY ALL is legacy syntax and should not be used for new work.
- NULL grouping values form one group, but ordinary equality still yields UNKNOWN for NULL comparisons.
- The default ordered frame is RANGE, not ROWS.
- RANGE numeric offsets and GROUPS frames are unsupported in SQL Server.
- LAST_VALUE uses the current frame endpoint; it is not automatically the final partition value.
- Window ORDER BY does not order the returned result.
- Microsoft documentation may list functions available only on Fabric or other engines; availability must be checked per product.

# Knowledge checks with answers

1. **What does one GROUP BY row represent?** One row for each distinct tuple of the listed grouping expressions.
2. **Does HAVING filter individual input rows?** No. WHERE filters rows before grouping; HAVING filters formed groups.
3. **What is the empty-input difference between COUNT(*) and SUM(x)?** A scalar aggregate returns COUNT(*) = 0 and SUM(x) = NULL; a grouped query over empty input has no groups.
4. **How do subtotal rows distinguish an omitted dimension from a real NULL?** GROUPING(column) and GROUPING_ID(...) mark grouping-set omission.
5. **Why can two tied rows share a running total under the default frame?** The default is RANGE through CURRENT ROW, which includes the complete peer group.
6. **How do you make row-by-row accumulation deterministic?** Use an explicit ROWS frame and a unique ordering key, plus an outer ORDER BY if presentation order matters.
7. **When is WINDOW syntax available?** SQL Server 2022 and later with database compatibility level 160 or higher.

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
