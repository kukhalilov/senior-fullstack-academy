# aggregation grouping and window functions — Reference: OVER clause, partitions, order, and frame behavior

# Scope and version

This reference explains all 24 frozen names in **OVER clause, partitions, order, and frame behavior** for SQL Server 2025 (17.x) T-SQL. Version and compatibility-level boundaries are called out where they change availability.

# How this group fits the mental model

Window functions retain detail rows. A partition chooses the population, an order chooses logical sequence and peer groups, and a frame chooses each row’s contributing neighbors. SQL Server supports ROWS and restricted RANGE semantics.

# Supplied names explained

| Exact supplied item | SQL Server behavior and boundary |
| --- | --- |
| `OVER clause` | OVER defines the rowset window used by an aggregate or analytic function: optional partition, function-specific ordering, and—when that function supports it—a ROWS or RANGE frame. Supported elements vary by function. |
| `WINDOW named-window clause` | SQL Server 2022 (16.x) introduced the SELECT WINDOW clause for naming reusable window specifications. It requires database compatibility level 160. A function refers to a name with OVER window_name; compatibility level is a database setting, not just the installed engine version ([WINDOW clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17)). |
| `WINDOW inheritance and extension` | A named window can reference another named window and add components, but cannot redefine inherited PARTITION BY, ORDER BY, or frame properties. Forward and backward references are allowed; cycles and multiple references in one window definition are not. |
| `PARTITION BY` | Divides the input rows into independent logical groups for the function. It does not reduce the output rows; each input row remains and receives a window result. Without it, the entire input is one partition. |
| `Window ORDER BY` | Defines the logical sequence used by a function within its partition and establishes peers. It does not order the final SELECT result. Add a query-level ORDER BY for presentation and a unique tie-breaker when individual row sequence matters. |
| `ROWS frame` | Defines frame membership by physical row offsets in the ordered partition. For predictable row-by-row running calculations, include a unique ORDER BY key and an explicit ROWS frame. |
| `RANGE frame` | Defines frame membership by ORDER BY value and peers. In SQL Server, RANGE offsets are not implemented: use only UNBOUNDED and CURRENT ROW bounds. RANGE CURRENT ROW includes all rows tied on every window ORDER BY expression. |
| `RANGE offset unsupported boundary` | SQL Server does not support `RANGE n PRECEDING` or `RANGE n FOLLOWING`; numeric frame offsets are valid only with ROWS. RANGE is limited to current-row/partition endpoints. |
| `GROUPS frame unsupported in SQL Server` | The SQL Server T-SQL OVER grammar supports ROWS and RANGE, not the GROUPS frame unit found in some other database systems. Do not use `GROUPS BETWEEN` in SQL Server. |
| `UNBOUNDED PRECEDING` | Starts a frame at the first row of the partition. With CURRENT ROW as the end it describes a cumulative frame from the partition start. |
| `n PRECEDING` | For ROWS, includes a nonnegative integer number of physical rows before the current row; the documented value must be an integer literal. RANGE does not allow numeric offsets in SQL Server. |
| `CURRENT ROW` | In ROWS, identifies the current physical row. In RANGE, the current row’s peer group is included, meaning all rows equal on the full window ORDER BY list. |
| `n FOLLOWING` | For ROWS, includes a nonnegative integer number of physical rows after the current row. SQL Server RANGE does not allow this numeric offset. |
| `UNBOUNDED FOLLOWING` | Ends the frame at the last row of the partition. It can only be an ending boundary, not a starting boundary. |
| `ROWS BETWEEN frame` | The explicit `ROWS BETWEEN start AND end` syntax includes physical rows from the chosen start through end. Boundary ordering must be valid; for example, a frame cannot start after its end. |
| `RANGE BETWEEN frame` | The explicit `RANGE BETWEEN start AND end` syntax uses the current peer group and partition endpoints. SQL Server disallows numeric PRECEDING/FOLLOWING offsets for RANGE. |
| `Default window frame` | For a function that accepts a frame, when OVER has ORDER BY but no explicit frame, SQL Server defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Peer rows therefore share cumulative results; state ROWS explicitly for physical row-by-row behavior. |
| `Window aggregate` | An aggregate used with OVER returns one aggregate value for each input row rather than collapsing rows. Most aggregates, including PRODUCT in SQL Server 2025, support OVER; STRING_AGG, GROUPING, and GROUPING_ID do not. |
| `DISTINCT aggregate OVER unsupported boundary` | SQL Server does not permit DISTINCT aggregation with OVER. A grouped COUNT(DISTINCT x) is supported, but `COUNT(DISTINCT x) OVER (...)` is not; redesign the query when distinct window counts are required. |
| `Running total` | A running total is usually SUM(expression) OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). A unique order key prevents ties from making row-by-row accumulation ambiguous. |
| `Moving average` | A moving average uses AVG over a bounded frame, such as ROWS BETWEEN 6 PRECEDING AND CURRENT ROW. Decide whether the first rows use smaller partial windows or require a full fixed-size window. |
| `Partition boundary` | A frame cannot cross its partition. At partition edges, a bounded frame contains fewer available rows; the aggregate then operates on that smaller frame. |
| `Peer rows` | Rows tied on every window ORDER BY expression are peers. RANGE CURRENT ROW includes the entire peer group; ranking functions assign ties according to their own rules. |
| `Window order does not order final result` | The OVER ORDER BY controls the function’s logical input sequence, not the query’s output sequence. Only the outer SELECT ORDER BY guarantees row presentation order. |

# Cross-item comparison

PARTITION BY separates populations, ORDER BY creates logical sequence and peers, and a frame selects rows around each current row. ROWS counts physical rows; SQL Server RANGE uses peers and partition endpoints only; GROUPS is unsupported. Named WINDOW definitions require SQL Server 2022 compatibility level 160.

# Examples

```sql
SELECT StoreId, SaleId, SaleTime, Amount,
       SUM(Amount) OVER
       (
           PARTITION BY StoreId
           ORDER BY SaleTime, SaleId
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS RollingSevenRows
FROM dbo.Sales
ORDER BY StoreId, SaleTime, SaleId;
```

The window keeps every sale row and sums at most the current row plus six preceding rows within its store. SaleId breaks same-time ties. This is seven rows, not seven calendar days; for date-range semantics use a different query shape.

# Common mistakes

- Confusing a frame with an entire partition.
- Leaving the default RANGE frame in a row-by-row running calculation.
- Using unsupported RANGE offsets or GROUPS in SQL Server.
- Expecting the window order to sort final output.
- Assuming a seven-row frame means seven days.

# Knowledge checks with answers

1. **You need the current sale plus the previous six sales, regardless of elapsed time. Which frame?** `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`, with a deterministic order key.
2. **Two rows tie on every `ORDER BY` expression and a running `SUM` uses the default frame. Why can both rows show the same result?** The default ordered frame is `RANGE UNBOUNDED PRECEDING ... CURRENT ROW`, and `RANGE CURRENT ROW` includes all peers.
3. **Does `OVER (PARTITION BY StoreId ORDER BY SaleTime)` sort the final result?** No. It orders the window calculation; add an outer query `ORDER BY` for presentation.
4. **Can SQL Server express a seven-day numeric `RANGE` offset or `GROUPS` frame directly?** No. SQL Server supports `ROWS` and restricted `RANGE` syntax without numeric offsets; `GROUPS` is not in its T-SQL frame grammar. Use a different query shape for calendar intervals.
5. **A `LAST_VALUE` query should return the final value for the entire partition. What frame should be explicit?** `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`, with a deterministic order if the final row must be unique.
6. **What does named `WINDOW` add, and what is its SQL Server compatibility requirement?** It names reusable window definitions; SQL Server 2022+ requires database compatibility level 160.


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
