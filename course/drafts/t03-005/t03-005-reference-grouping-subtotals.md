# aggregation grouping and window functions — Reference: Subtotal generation and grouping metadata

# Scope and version

This reference explains all 15 frozen names in **Subtotal generation and grouping metadata** for SQL Server 2025 (17.x) T-SQL. Version and compatibility-level boundaries are called out where they change availability.

# How this group fits the mental model

Subtotals are separate grouping sets in the same result. Choose exact sets, a hierarchical ROLLUP, or all CUBE combinations, then expose grouping metadata so readers can identify each row’s grain.

# Supplied names explained

| Exact supplied item | SQL Server behavior and boundary |
| --- | --- |
| `GROUPING SETS` | Lists the exact grouping combinations to compute in one grouped query. It is conceptually similar to combining several grouped queries with UNION ALL, but duplicate grouping sets are not automatically removed; repeated sets can yield repeated subtotal rows. |
| `ROLLUP` | Generates a hierarchy of subtotals from the ordered grouping expressions: full detail, then progressively fewer rightmost keys, ending with the grand total. Order the keys from the most detailed to the desired subtotal hierarchy. |
| `CUBE` | Generates every combination of the listed grouping expressions, including detail and grand total. With n expressions this is 2^n grouping sets, so output grows exponentially; SQL Server limits CUBE/ROLLUP to 12 grouping expressions. |
| `Empty grouping set ()` | The empty grouping set computes one grand-total group over all input rows. When used with other grouping sets it adds a grand-total row alongside the requested details/subtotals. |
| `GROUPING function` | GROUPING(column) returns 1 when that column was omitted from the current grouping set and 0 when it participates. Use it to distinguish a subtotal placeholder NULL from a source-data NULL. |
| `GROUPING_ID function` | GROUPING_ID(col1, ...) combines GROUPING bits for the specified columns into an integer that identifies the grouping level. Argument order defines bit positions; do not assume the value is a simple level number. |
| `Subtotal row` | A subtotal row aggregates a less-detailed grouping set. Its omitted grouping columns appear as NULL, which can collide visually with genuine NULL data unless GROUPING metadata is included. |
| `Grand-total row` | The grand total aggregates all qualifying input rows into the empty grouping set. It exists only if the query asks for that grouping, such as GROUP BY () or a grouping construct that includes it. |
| `Grouping NULL placeholder` | SQL Server uses NULL in columns omitted from a grouping set. That placeholder is not evidence the source key was NULL; pair the displayed key with GROUPING or GROUPING_ID to label subtotal rows correctly. |
| `GROUPING_ID bitmask` | Each bit encodes whether its corresponding argument was aggregated away, with the rightmost argument associated with the least-significant bit. Convert or label these values explicitly; argument order changes the bitmask. |
| `Explicit UNION ALL subtotal` | Separate GROUP BY queries combined with UNION ALL can express custom subtotal shapes. Align types and labels in every branch, preserve duplicates intentionally, and compare this approach with GROUPING SETS for maintainability. |
| `ROLLUP hierarchy` | ROLLUP follows the written key sequence, so GROUP BY ROLLUP(Year, Month, Day) yields day detail, month subtotal, year subtotal, and grand total. Reordering keys changes which subtotals exist. |
| `CUBE combination count` | CUBE over n keys asks for 2^n groupings, including every subset. Even modest key counts can create many rows; use GROUPING SETS when only selected combinations are required. |
| `GROUPING SETS output limit` | SQL Server permits at most 32 expressions in a GROUP BY using ROLLUP, CUBE, or GROUPING SETS, and the generated grouping-set count is limited to 4,096. CUBE/ROLLUP additionally allow at most 12 grouping expressions. |
| `Legacy WITH CUBE and WITH ROLLUP` | The older `GROUP BY expression WITH CUBE` and `WITH ROLLUP` spellings remain for backward compatibility only. Prefer the standard-looking `GROUP BY CUBE(...)` and `GROUP BY ROLLUP(...)` forms in new SQL. |

# Cross-item comparison

GROUPING SETS enumerates requested levels, ROLLUP follows an ordered hierarchy, and CUBE creates every combination. GROUPING and GROUPING_ID mark subtotal placeholders; duplicate grouping specifications can still produce duplicate output rows.

# Examples

```sql
SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingId,
       SUM(SalesAmount) AS Sales
FROM dbo.Sales
GROUP BY GROUPING SETS ((Region, Year), (Region), ());
```

This emits region/year detail, a subtotal per region, and a grand total. GROUPING_ID distinguishes omitted-key NULL placeholders from source NULL values. The explicit sets avoid generating every CUBE combination.

# Common mistakes

- Treating subtotal NULL as source NULL.
- Using CUBE when only a few subtotal levels are needed.
- Assuming duplicate grouping sets are eliminated.
- Changing ROLLUP key order without noticing changed subtotal levels.
- Treating GROUPING_ID as a simple ordinal level number.

# Knowledge checks with answers

1. **What does `GROUPING SETS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
2. **What does `ROLLUP` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
3. **What does `CUBE` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
4. **What does `Empty grouping set ()` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
5. **What does `GROUPING function` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
6. **What does `GROUPING_ID function` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
7. **What does `Subtotal row` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
8. **What does `Grand-total row` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
9. **What does `Grouping NULL placeholder` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
10. **What does `GROUPING_ID bitmask` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
11. **What does `Explicit UNION ALL subtotal` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
12. **What does `ROLLUP hierarchy` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
13. **What does `CUBE combination count` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
14. **What does `GROUPING SETS output limit` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
15. **What does `Legacy WITH CUBE and WITH ROLLUP` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.

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
- [Microsoft Learn: approxQuantile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: grouping](https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: groupingId](https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-id-transact-sql?view=sql-server-ver17)
- [Microsoft Learn: having](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-having-transact-sql?view=sql-server-ver17)
