# aggregation grouping and window functions — Exercises and worked solutions

# Goals

Translate a reporting requirement into the correct row grain, aggregate, grouping set, or window specification. State the edge-case behavior before choosing syntax.

# Worked example

For an account ledger, retain each transaction while adding the cumulative balance:

```sql
SELECT AccountId, TransactionId, Amount,
       SUM(Amount) OVER
       (
           PARTITION BY AccountId
           ORDER BY PostedAt, TransactionId
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS Balance
FROM dbo.Ledger
ORDER BY AccountId, PostedAt, TransactionId;
```

The unique TransactionId breaks timestamp ties. The window adds a value without collapsing transaction rows.

# Exercises

1. Count every posted sale per store, even when optional columns are NULL. Explain why COUNT_BIG(*) may be preferable to COUNT(*).
2. Return stores whose posted total exceeds a threshold, but exclude cancelled sales from the total.
3. Concatenate non-NULL notes in sale order, ensuring the result is not limited to a short inferred string type.
4. Estimate unique visitors for a very large telemetry set. Explain approximation and collation caveats.
5. Produce detail by region/year, subtotal by region, and grand total; distinguish a real NULL region from the subtotal placeholder.
6. A CUBE over 13 dimensions fails. Explain the combination growth and choose a narrower grouping design.
7. Compute a running total when several events share a timestamp. Make row-by-row order deterministic.
8. Compute a rolling seven-row average and explain how early rows are handled.
9. Return each customer’s last ordered value from the full partition using LAST_VALUE.
10. Assign rank and dense rank to ties; show the different next rank.
11. Access the prior non-NULL value, including the engine version and servicing requirement.
12. Compute the median per department and distinguish continuous from discrete percentile semantics.
13. An application uses `GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW`. Explain why SQL Server rejects it and propose an explicit ROWS or peer-aware design.
14. A query uses the WINDOW clause but runs at compatibility level 150. Explain the failure and deployment requirement.
15. For a very large salary table, compare APPROX_PERCENTILE_CONT with exact PERCENTILE_CONT. State what its error bound guarantees.

# Progressive hints

1. COUNT(*) includes NULL-bearing rows and returns int; COUNT_BIG returns bigint.
2. Filter rows in WHERE, then use HAVING on the grouped SUM.
3. Use STRING_AGG with an nvarchar(max) expression and WITHIN GROUP ordering.
4. APPROX_COUNT_DISTINCT is probabilistic and uses binary matching for sensitive strings.
5. Use GROUPING_ID in the SELECT list.
6. CUBE creates 2^n sets; GROUPING SETS can name only the required levels.
7. Add a unique key after timestamp and specify a ROWS frame.
8. Use ROWS BETWEEN 6 PRECEDING AND CURRENT ROW; the frame shrinks near the partition start.
9. Use a full-partition frame ending UNBOUNDED FOLLOWING.
10. RANK leaves gaps; DENSE_RANK does not.
11. IGNORE NULLS is SQL Server 2022+, and CU4 fixes a documented LAG/LEAD issue.
12. PERCENTILE_CONT interpolates; PERCENTILE_DISC selects an observed value.
13. SQL Server has ROWS and restricted RANGE, not GROUPS.
14. Named WINDOW requires compatibility level 160.
15. SQL Server 2022 added APPROX_PERCENTILE_CONT/DISC. The documented error is rank-based, not a bound on the distance between values.

# Complete solutions

1. `SELECT StoreId, COUNT_BIG(*) AS SaleCount FROM dbo.Sales WHERE Status = N'Posted' GROUP BY StoreId;` COUNT_BIG avoids int overflow for a very large group.
2. `SELECT StoreId, SUM(Amount) AS Total FROM dbo.Sales WHERE Status = N'Posted' GROUP BY StoreId HAVING SUM(Amount) > @Minimum;` Filtering precedes aggregation; HAVING tests the formed total.
3. `STRING_AGG(CONVERT(nvarchar(max), Note), N'; ') WITHIN GROUP (ORDER BY SaleId)` skips NULL Note values; cast controls result width and ordering is explicit.
4. Use `APPROX_COUNT_DISTINCT(VisitorId)`. Treat it as an estimate with the documented probabilistic error bound, and verify whether binary matching for strings matches the reporting contract.
5. `SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingId, SUM(Amount) AS Total FROM dbo.Sales GROUP BY GROUPING SETS ((Region, Year), (Region), ());` GROUPING_ID labels the omitted-key levels.
6. Thirteen dimensions imply 8,192 CUBE combinations, exceeding SQL Server’s 12-key CUBE/ROLLUP limit. Specify only required combinations with GROUPING SETS.
7. `SUM(Amount) OVER (PARTITION BY AccountId ORDER BY EventTime, EventId ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)` uses unique EventId to break timestamp ties.
8. `AVG(Value) OVER (PARTITION BY DeviceId ORDER BY SampleTime, SampleId ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. At partition starts, fewer than seven rows are available; require a full frame separately if needed.
9. `LAST_VALUE(Value) OVER (PARTITION BY CustomerId ORDER BY OrderDate, OrderId ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)`. The ending boundary matters because the default ends at the current peer group.
10. Values A=10, B=10, C=8 yield RANK 1,1,3 and DENSE_RANK 1,1,2 when ordered descending.
11. `LAG(Value) IGNORE NULLS OVER (PARTITION BY EntityId ORDER BY EventTime, EventId)` is available in SQL Server 2022+, with CU4 fixing a documented LAG/LEAD bug.
12. `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY Salary) OVER (PARTITION BY DepartmentId)` can interpolate; `PERCENTILE_DISC(0.5)` returns an observed salary. Both use a partition-only OVER in SQL Server.
13. SQL Server does not implement GROUPS. Use ROWS if the requirement is a count of physical rows; to include peer groups, derive a peer-group key/rank and join or aggregate explicitly.
14. Set database compatibility level to 160 or higher on a supported SQL Server 2022+ instance, or repeat the window specification in each OVER clause.
15. `SELECT DepartmentId, APPROX_PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY Salary) AS ApproxMedian FROM dbo.EmployeeSalary GROUP BY DepartmentId;` SQL Server 2022+ computes an approximate continuous median per department. Microsoft’s 1.33% rank error within 99% confidence is a rank-position guarantee, not a numeric-distance bound; a large value gap between neighboring ranks can make the approximate result differ substantially from the exact percentile ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)).

# Tests and edge cases

Check empty input, one global group, grouped empty input, all-NULL values, duplicate values, COUNT/COUNT_BIG limits, numeric overflow and precision, case/accent-sensitive strings, approximate distinct error and collation, duplicate grouping sets, actual NULL grouping keys, partition edges, peer ties, nonunique order keys, default RANGE behavior, frame boundaries, LAG/LEAD beyond partition ends and at NULL-valued target rows, IGNORE NULLS on supported CU levels, and percentile endpoints 0 and 1.

# Reflection questions

- What does one grouped output row represent?
- Which rows are removed before aggregation, and which groups are removed afterward?
- Is the required count exact, approximate, or over the full row set?
- Does a NULL key represent data or an omitted subtotal dimension?
- Does the window need a physical row frame, peer-aware frame, or full partition?
- What unique columns make the ordering repeatable?
- Does the database compatibility level support the named WINDOW clause?

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
