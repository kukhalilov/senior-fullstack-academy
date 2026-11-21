# aggregation grouping and window functions — Big-picture orientation and mental model

# Problem and purpose

Aggregation answers questions about collections: totals, counts, summaries, and subtotals. Window functions answer related questions while keeping detail rows visible, such as running totals, rankings, prior values, and percentiles. SQL Server's grouping and analytic syntax has several boundaries that differ from other database systems, so syntax and version compatibility matter.

# Plain-language mental model

First decide what one output row should mean. A grouped query changes the grain: many input rows become one row per group. A window query preserves the input grain and adds a value computed over a partition or frame. WHERE chooses input rows before groups form; HAVING decides which formed groups survive.

The group is not the same as the frame. PARTITION BY splits independent populations. ORDER BY gives functions a logical sequence. A ROWS or RANGE frame narrows the rows considered around the current row. SQL Server's default ordered frame is a peer-aware RANGE frame, which can surprise running totals and `LAST_VALUE`, whose result is determined by the frame endpoint; tied peers can leave the endpoint row ambiguous.

# How the parts fit together

1. Define the output grain and which source rows qualify.
2. Use WHERE for row predicates; use GROUP BY to establish groups and HAVING for group predicates.
3. Choose exact aggregation, approximate distinct counting, or statistical summaries according to the accuracy contract.
4. Use GROUPING SETS for selected totals, ROLLUP for a hierarchy, and CUBE only when every combination is needed.
5. Use a window function when detail rows must remain; specify partition, ordering, and frame deliberately.
6. Add a final query ORDER BY when presentation order matters.

# Version landmarks

SQL Server 2017 added STRING_AGG; its ordered WITHIN GROUP form requires compatibility level 110 or higher ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)). SQL Server 2019 added APPROX_COUNT_DISTINCT ([function reference](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)). SQL Server 2022 added the named WINDOW clause at compatibility level 160, approximate percentile aggregates, and NULL-treatment options for LAG, LEAD, FIRST_VALUE, and LAST_VALUE; CU4 fixed an IGNORE NULLS issue for LAG/LEAD ([WINDOW](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17), [approximate continuous percentile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [approximate discrete percentile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17), [LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)). SQL Server 2025 adds PRODUCT as an aggregate and analytic function ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). GROUPS frames, Fabric-only ANY_VALUE/MEDIAN/APPROX_MEDIAN/APPROX_QUANTILE, and DISTINCT window aggregates are not SQL Server syntax ([ANY_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric), [MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric), [APPROX_MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric), [APPROX_QUANTILE](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=fabric)).

# Concept map

| Need | Construct | Key decision |
| --- | --- | --- |
| One row per group | GROUP BY + aggregate | Which expressions define the grain? |
| Filter individual source rows | WHERE | Which rows contribute? |
| Filter completed groups | HAVING | Which group summaries qualify? |
| Selected subtotals | GROUPING SETS | Which exact groupings are required? |
| Hierarchical subtotals | ROLLUP | What is the key order from detail to total? |
| All dimensional combinations | CUBE | Is the exponential set of combinations manageable? |
| Add calculations without collapsing detail | Window function | What are the partition, order, and frame? |
| Access adjacent rows | LAG / LEAD | What tie-break order and partition boundaries apply? |
| Rank or distribute rows | Ranking/distribution functions | How are peers treated and buckets assigned? |

# End-to-end walkthrough

For daily sales, first filter out void transactions in WHERE, then GROUP BY date and store to get one row per store/day. If the report needs only days whose total exceeds a threshold, apply HAVING. If it needs every transaction beside a running store total, keep transaction rows and use SUM(...) OVER (PARTITION BY StoreId ORDER BY SaleTime, SaleId ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). The unique SaleId resolves same-time ties; the outer ORDER BY still controls display.

# When to use it and tradeoffs

Exact COUNT(DISTINCT ...) gives exact unique counts but can consume more resources than APPROX_COUNT_DISTINCT. GROUPING SETS makes subtotal logic explicit; CUBE can create too many combinations. Window calculations avoid self-joins and preserve details, but may require partitioning and sorting and do not promise output order.

# What later lessons cover

Four exact-inventory references cover grouped aggregates, subtotals, frames and named windows, and ranking/offset/distribution/percentile functions. The practice lesson applies these choices to reporting requirements, while the interview lesson tests concise semantic reasoning.

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
