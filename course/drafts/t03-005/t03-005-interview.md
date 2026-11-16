# aggregation grouping and window functions — Interview questions and reasoning

# Core questions

Begin with the output grain, then explain which rows reach aggregation and which rows remain after windowing.

# Concise interview answers

1. **WHERE vs HAVING?** WHERE filters source rows before groups form; HAVING filters groups after aggregation.
2. **COUNT(*) vs COUNT(x)?** The first counts all rows; the second counts non-NULL x values.
3. **COUNT vs COUNT_BIG?** Same counting semantics, int versus bigint return type.
4. **ROLLUP vs CUBE?** ROLLUP follows one key hierarchy; CUBE produces every key subset and grows exponentially.
5. **How distinguish subtotal NULL from data NULL?** Use GROUPING or GROUPING_ID.
6. **Grouped aggregate vs window aggregate?** Grouping collapses rows; a window adds values while preserving detail rows.
7. **ROWS vs RANGE?** ROWS counts physical positions; RANGE includes ordered peers and SQL Server supports only non-offset boundaries.
8. **Why can running totals repeat at ties?** The default frame is peer-aware RANGE; use an explicit ROWS frame with a tie-break key for row-wise accumulation.
9. **Why does LAST_VALUE often look wrong?** Its default frame ends at the current peer group; use an explicit full-partition frame when the final partition value is wanted.
10. **RANK vs DENSE_RANK?** Both share ranks for ties; RANK leaves gaps and DENSE_RANK does not.
11. **What is new for SQL Server 2025 here?** PRODUCT aggregate and analytic function.
12. **What are the SQL Server 2022 boundaries?** Named WINDOW needs compatibility 160; NULL treatment options and approximate percentile aggregates were added, with a LAG/LEAD IGNORE NULLS fix in CU4. Approximate percentile error is rank-based, not value-based.
13. **Can SQL Server use GROUPS frames or COUNT(DISTINCT x) OVER?** No; both require a different query design.
14. **Does a window ORDER BY sort output?** No; only the query ORDER BY controls final presentation.

# Deep follow-up answers

Explain empty-input behavior precisely: scalar COUNT/COUNT_BIG returns zero, most value aggregates return NULL, and grouped empty input has no groups. Explain return-type and overflow rules before suggesting a cast; cast the input before SUM or AVG if accumulation precision is the concern. For approximate distinct counts, state that approximation and collation behavior are part of the result contract.

For subtotals, identify the row grain of each grouping set and use GROUPING metadata so a NULL subtotal placeholder is not confused with source data. For windows, separate partition, order, and frame. Name the function-specific syntax constraints: ranking functions do not take a frame, offsets require ordered partitions, percentile functions use WITHIN GROUP, and named WINDOW specifications have compatibility requirements.

# Scenario questions

1. A grouped report is missing groups after a predicate was added: determine whether it belongs in WHERE or HAVING.
2. A count over a large telemetry table errors: compare COUNT and COUNT_BIG.
3. A running total gives equal values for tied timestamps: explain RANGE peers and create a deterministic ROWS specification.
4. A report labels real NULL regions as “All Regions”: use GROUPING_ID to distinguish subtotal rows.
5. LAST_VALUE returns the current row: inspect and extend the frame endpoint.
6. A request says “median”: choose exact continuous/discrete semantics and state SQL Server support.
7. A query is copied from Fabric using ANY_VALUE or APPROX_QUANTILE: identify product availability rather than assuming cross-platform syntax.

# Tradeoffs and alternatives

Exact aggregates preserve exactness; approximate distinct counting and approximate percentiles target large-scale responsiveness with documented probabilistic error. SQL Server 2022 supports APPROX_PERCENTILE_CONT and APPROX_PERCENTILE_DISC; their error is rank-based, not value-based. GROUPING SETS avoids unnecessary subtotal combinations; CUBE is appropriate only when all dimensions matter. ROWS frames give physical row-count semantics, while RANGE groups peers.

# Common weak answers

- “GROUP BY orders the rows.”
- “COUNT(column) counts every row.”
- “GROUP BY ordinal works like ORDER BY ordinal.”
- “A CUBE over a few dimensions is always cheap.”
- “NULL in a subtotal always came from source data.”
- “OVER ORDER BY sorts the final output.”
- “The default frame processes one physical row at a time.”
- “LAST_VALUE means the last value in the whole partition.”
- “SQL Server supports every T-SQL function documented for Fabric.”

# Self-check rubric

Assess output grain, row-vs-group filtering, NULL and empty-input semantics, duplicate treatment, numeric type/overflow, subtotal identification, partition/order/frame separation, peer and tie handling, function-specific syntax, version and compatibility boundaries, and final output ordering.

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
