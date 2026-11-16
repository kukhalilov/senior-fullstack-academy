# aggregation grouping and window functions — Reference: Ranking, offsets, distribution, and percentile functions

# Scope and version

This reference explains all 32 frozen names in **Ranking, offsets, distribution, and percentile functions** for SQL Server 2025 (17.x) T-SQL. Version and compatibility-level boundaries are called out where they change availability.

# How this group fits the mental model

Analytic functions have distinct contracts: sequence/ranking, neighboring-row access, frame endpoint selection, distribution, and percentile selection. The function-specific syntax determines which ordering and frame clauses are valid.

# Supplied names explained

| Exact supplied item | SQL Server behavior and boundary |
| --- | --- |
| `ROW_NUMBER` | Assigns a sequential bigint number within each partition according to required ORDER BY. Ties in the ordering expressions have no guaranteed relative order; add a unique key for repeatable numbering. |
| `RANK` | Assigns equal rank to peers and leaves gaps after ties: ranks 1, 1, 3. It requires ORDER BY and does not accept a ROWS/RANGE frame. |
| `DENSE_RANK` | Assigns equal rank to peers without gaps: ranks 1, 1, 2. It requires ORDER BY and does not accept a frame. |
| `NTILE` | Divides each ordered partition into the requested number of buckets and returns a bigint bucket number. Bucket sizes differ by at most one; larger buckets come first when division is uneven. |
| `LAG` | Reads an expression from a preceding physical row in the same partition without a self-join. It requires ORDER BY and supports an offset, default value, and SQL Server 2022+ NULL-treatment option. |
| `LEAD` | Reads an expression from a following physical row in the same partition. It requires ORDER BY and has the analogous offset, default, and NULL-treatment options of LAG. |
| `FIRST_VALUE` | Returns the expression from the first row of the current frame, not necessarily the entire partition. It requires ORDER BY; specify an appropriate frame when the whole partition is intended. |
| `LAST_VALUE` | Returns the expression from the last row of the current frame. The default ordered frame ends at the current peer group, so LAST_VALUE often returns the current value; use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for the partition’s final value. |
| `PERCENT_RANK` | Returns (rank - 1) / (partition row count - 1) as float; the first rank is 0, and a one-row partition returns 0. It requires ORDER BY and is nondeterministic when peer order or partition content can vary. |
| `CUME_DIST` | Returns the relative position of the last row in the current peer group: rows at or before that value divided by partition row count. It ranges above 0 through 1 and assigns the same value to peers. |
| `PERCENTILE_CONT` | Computes a continuous percentile using interpolation, so the result can be between observed values. The percentile literal is from 0.0 to 1.0; use WITHIN GROUP (ORDER BY numeric_expression) and OVER (PARTITION BY ...). It ignores NULLs and returns float(53). SQL Server does not allow ORDER BY or a frame inside this function’s OVER clause ([PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17)). |
| `PERCENTILE_DISC` | Computes a discrete percentile and returns an observed ordered value with the same type as its ordering expression. The percentile is from 0.0 to 1.0; WITHIN GROUP permits one ordering expression, and OVER may partition but cannot have its own ORDER BY or frame. NULL input values are ignored ([PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17)). |
| `APPROX_PERCENTILE_CONT` | Available in SQL Server 2022 (16.x) and later. Computes an approximate continuous percentile from one numeric ordering expression using a KLL sketch; the percentile is a literal from 0.0 to 1.0 and the return type is float(53). It ignores NULLs. Its guarantee is rank-based, not value-based, so the selected numeric value can differ substantially when neighboring ranks contain distant values. It is nondeterministic and is an aggregate with WITHIN GROUP, not a PERCENTILE_CONT-style analytic OVER function in SQL Server ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)). |
| `APPROX_PERCENTILE_DISC` | Available in SQL Server 2022 (16.x) and later. Computes an approximate discrete percentile from one numeric ordering expression and returns an observed value. The percentile is a literal from 0.0 to 1.0; NULLs are ignored. Its rank-based guarantee is not a bound on numeric distance, and the randomized KLL algorithm can return different results across executions. The documentation contains a contradictory sentence about supported float/decimal inputs; verify the exact input type on the target engine rather than infer beyond the unambiguous numeric requirement ([APPROX_PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)). |
| `Approximate percentile rank-error guarantee` | Microsoft documents up to 1.33% rank error within 99% confidence for these SQL Server approximate percentile functions. This bounds rank position, not the numerical distance between returned and exact values; the algorithm is randomized and may vary by execution ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [APPROX_PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)). |
| `RANK tie gaps` | If two rows tie at rank r, both receive r and the next rank advances by the number of tied rows. Use RANK when competition-style positions should preserve skipped places. |
| `DENSE_RANK no tie gaps` | Tied rows share a rank, and the next distinct ordering value receives the immediately following rank. Use DENSE_RANK when counting distinct ordered levels. |
| `Nondeterministic ROW_NUMBER without unique order` | ROW_NUMBER is nondeterministic unless the partition/order key combination uniquely orders rows. A stable-looking result in one execution is not a tie-break guarantee. |
| `LAG default argument` | The third argument is returned when the requested preceding offset lies outside the partition; if omitted it is NULL. It must be type-compatible with scalar_expression and cannot be an analytic function. |
| `LEAD default argument` | The third argument is returned when the requested following offset lies outside the partition; if omitted it is NULL. It must be type-compatible with scalar_expression and cannot be an analytic function. |
| `LAG IGNORE NULLS` | Available in SQL Server 2022 (16.x) and later. It skips NULL values while looking backward; SQL Server 2022 CU4 fixed a related LAG/LEAD bug. Validate the deployed build before depending on this behavior ([LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)). |
| `LEAD IGNORE NULLS` | Available in SQL Server 2022 (16.x) and later. It skips NULL values while looking forward; SQL Server 2022 CU4 fixed a related LAG/LEAD bug. Validate the deployed build before depending on this behavior ([LEAD](https://learn.microsoft.com/en-us/sql/t-sql/functions/lead-transact-sql?view=sql-server-ver17)). |
| `FIRST_VALUE IGNORE NULLS` | Available in SQL Server 2022 (16.x) and later. It selects the first non-NULL expression value in the frame; if every value is NULL the result remains NULL ([FIRST_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/first-value-transact-sql?view=sql-server-ver17)). |
| `LAST_VALUE IGNORE NULLS` | Available in SQL Server 2022 (16.x) and later. It selects the last non-NULL expression value in the frame; the frame boundary still controls which rows are eligible ([LAST_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/last-value-transact-sql?view=sql-server-ver17)). |
| `LAG RESPECT NULLS` | RESPECT NULLS is the default treatment, available as an explicit option from SQL Server 2022 (16.x). A NULL at the offset row is returned as NULL rather than skipped. |
| `LEAD RESPECT NULLS` | RESPECT NULLS is the default treatment, available as an explicit option from SQL Server 2022 (16.x). A NULL at the offset row is returned as NULL rather than skipped. |
| `FIRST_VALUE RESPECT NULLS` | RESPECT NULLS is the default treatment, available explicitly in SQL Server 2022 (16.x) and later. A leading NULL in the frame can therefore be the first value. |
| `LAST_VALUE RESPECT NULLS` | RESPECT NULLS is the default treatment, available explicitly in SQL Server 2022 (16.x) and later. A last NULL in the current frame can be the returned value. |
| `NTILE bucket count` | The NTILE argument is a positive integer or expression convertible to int. It specifies the number of buckets, not a bucket size; if rows divide unevenly, earlier buckets receive one extra row. |
| `LAG and LEAD offset rules` | Offset defaults to 1 and must be a positive integer expression convertible to bigint; negative offsets and analytic offset expressions are not allowed. The default expression is used only when the target row is outside the partition, not when its value is NULL. |
| `SQL Server 2022 IGNORE NULLS availability and CU4 fix` | IGNORE NULLS and RESPECT NULLS were introduced for LAG, LEAD, FIRST_VALUE, and LAST_VALUE in SQL Server 2022 (16.x). Microsoft documents a LAG/LEAD IGNORE NULLS fix in SQL Server 2022 CU4; treat engine version and servicing level as part of the feature requirement. |
| `Window function versus grouped aggregate` | A grouped aggregate emits one row per group and reduces the result. A window function retains each input row and adds a value calculated from related rows; the same aggregate such as SUM can be used in either shape. |

# Cross-item comparison

ROW_NUMBER creates a sequence, RANK leaves tie gaps, and DENSE_RANK does not. LAG/LEAD access adjacent ordered rows; FIRST/LAST_VALUE respect frame bounds; percentile functions distinguish interpolation from selecting an observed value. Every function has its own accepted OVER shape.

# Examples

```sql
SELECT CustomerId, OrderId, OrderDate, Amount,
       ROW_NUMBER() OVER
         (PARTITION BY CustomerId ORDER BY OrderDate DESC, OrderId DESC) AS Recency,
       LAG(Amount, 1, 0) IGNORE NULLS OVER
         (PARTITION BY CustomerId ORDER BY OrderDate, OrderId) AS PreviousNonNullAmount,
       LAST_VALUE(Amount) OVER
         (PARTITION BY CustomerId ORDER BY OrderDate, OrderId
          ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS FinalAmount
FROM dbo.Orders
ORDER BY CustomerId, OrderDate, OrderId;
```

A unique OrderId resolves ties. LAG’s default applies only when no eligible preceding row exists; IGNORE NULLS skips NULL-valued rows and requires SQL Server 2022 or later (CU4 fixes a documented issue). LAST_VALUE’s explicit full-partition frame requests the final ordered value.

# Common mistakes

- Using ROW_NUMBER with nonunique ordering when stable assignment matters.
- Confusing RANK and DENSE_RANK tie behavior.
- Assuming LAG’s default replaces an existing NULL value.
- Forgetting LAST_VALUE frame bounds.
- Expecting PERCENTILE_CONT to return an observed value.

# Knowledge checks with answers

1. **What does `ROW_NUMBER` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
2. **What does `RANK` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
3. **What does `DENSE_RANK` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
4. **What does `NTILE` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
5. **What does `LAG` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
6. **What does `LEAD` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
7. **What does `FIRST_VALUE` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
8. **What does `LAST_VALUE` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
9. **What does `PERCENT_RANK` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
10. **What does `CUME_DIST` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
11. **What does `PERCENTILE_CONT` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
12. **What does `PERCENTILE_DISC` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
13. **What does `APPROX_PERCENTILE_CONT` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
14. **What does `APPROX_PERCENTILE_DISC` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
15. **What does `Approximate percentile rank-error guarantee` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
16. **What does `RANK tie gaps` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
17. **What does `DENSE_RANK no tie gaps` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
18. **What does `Nondeterministic ROW_NUMBER without unique order` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
19. **What does `LAG default argument` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
20. **What does `LEAD default argument` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
21. **What does `LAG IGNORE NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
22. **What does `LEAD IGNORE NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
23. **What does `FIRST_VALUE IGNORE NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
24. **What does `LAST_VALUE IGNORE NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
25. **What does `LAG RESPECT NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
26. **What does `LEAD RESPECT NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
27. **What does `FIRST_VALUE RESPECT NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
28. **What does `LAST_VALUE RESPECT NULLS` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
29. **What does `NTILE bucket count` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
30. **What does `LAG and LEAD offset rules` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
31. **What does `SQL Server 2022 IGNORE NULLS availability and CU4 fix` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.
32. **What does `Window function versus grouped aggregate` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.

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
