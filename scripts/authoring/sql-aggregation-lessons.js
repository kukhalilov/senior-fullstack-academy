import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-005.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const urls = {
  group: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17',
  aggregates: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/aggregate-functions-transact-sql?view=sql-server-ver17',
  over: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17',
  window: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17',
  product: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17',
  countBig: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/count-big-transact-sql?view=sql-server-ver17',
  approx: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17',
  stringAgg: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17',
  lag: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17',
  lead: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/lead-transact-sql?view=sql-server-ver17',
  first: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/first-value-transact-sql?view=sql-server-ver17',
  last: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/last-value-transact-sql?view=sql-server-ver17',
  ntile: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/ntile-transact-sql?view=sql-server-ver17',
  rank: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/rank-transact-sql?view=sql-server-ver17',
  rowNumber: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/row-number-transact-sql?view=sql-server-ver17',
  denseRank: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/dense-rank-transact-sql?view=sql-server-ver17',
  percentRank: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/percent-rank-transact-sql?view=sql-server-ver17',
  cumeDist: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/cume-dist-transact-sql?view=sql-server-ver17',
  percentileCont: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17',
  percentileDisc: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17',
  approxPercentileCont: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17',
  approxPercentileDisc: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17',
  anyValue: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric',
  median: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric',
  approxMedian: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric',
  approxQuantile: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=sql-server-ver17',
  grouping: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-transact-sql?view=sql-server-ver17',
  groupingId: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/grouping-id-transact-sql?view=sql-server-ver17',
  having: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-having-transact-sql?view=sql-server-ver17',
};
manifest.sourceSnapshot.urls = [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(urls)])];
manifest.comparisonSources = [...new Set([...manifest.comparisonSources, ...Object.values(urls)])];
manifest.versionNotes = [
  {
    edition: 'SQL Server 2017 (14.x), SQL Server 2019 (15.x), SQL Server 2022 (16.x), and SQL Server 2025 (17.x)',
    items: ['SQL Server 2017 added STRING_AGG; WITHIN GROUP ordering requires compatibility level 110 or higher.'],
    sourceUrls: [urls.stringAgg],
  },
  {
    edition: 'SQL Server 2019 (15.x)',
    items: ['SQL Server 2019 added APPROX_COUNT_DISTINCT for approximate unique non-NULL counts.'],
    sourceUrls: [urls.approx],
  },
  {
    edition: 'SQL Server 2022 (16.x)',
    items: ['SQL Server 2022 added the named WINDOW clause, which requires compatibility level 160. It also added IGNORE NULLS and RESPECT NULLS to LAG, LEAD, FIRST_VALUE, and LAST_VALUE; CU4 fixes a documented LAG/LEAD IGNORE NULLS issue. SQL Server 2022 added APPROX_PERCENTILE_CONT and APPROX_PERCENTILE_DISC, whose error guarantees are rank-based rather than value-based.'],
    sourceUrls: [urls.window, urls.lag, urls.lead, urls.first, urls.last, urls.approxPercentileCont, urls.approxPercentileDisc],
  },
  {
    edition: 'SQL Server 2025 (17.x)',
    items: ['SQL Server 2025 added PRODUCT as an aggregate and analytic function.'],
    sourceUrls: [urls.product],
  },
];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const definitions = {
  'grouped-aggregation': {
    'GROUP BY clause': 'Forms one output group for each distinct combination of the grouping expressions. Every selected expression must be grouped, aggregated, or otherwise valid under SQL Server grouping rules. GROUP BY does not order the output.',
    'GROUP BY expression': 'A grouping key can be a column or nonaggregate expression. It cannot be a select-list alias, aggregate expression, or subquery, and legacy text, ntext, and image types cannot be grouping expressions. Compute complex keys in a derived table when that makes the query clearer.',
    'Multiple grouping columns': 'The tuple of values across all listed expressions defines each group. Grouping by (Region, Year) does not mean two independent groupings; it creates one group per pair.',
    'GROUP BY ordinal unsupported boundary': 'SQL Server does not allow a select-list ordinal such as GROUP BY 1 to identify a grouping expression. Write the column or expression explicitly; ORDER BY ordinal behavior is separate.',
    'GROUP BY ALL legacy syntax': 'SQL Server retains the backward-compatible `GROUP BY ALL column-expression` form. It can include groups filtered out by WHERE, returning NULL aggregate values for those groups; it is disallowed with GROUPING SETS, ROLLUP, and CUBE and has remote-table/FILESTREAM restrictions. Avoid it in new code. Do not confuse it with the separate Fabric `GROUP BY ALL` syntax ([GROUP BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)).',
    'WHERE before grouping': 'WHERE filters individual input rows before the grouping operation. A row rejected here cannot contribute to any aggregate or group.',
    'HAVING after grouping': 'HAVING filters formed groups, commonly using aggregate expressions. Use WHERE for row-level restrictions when possible so excluded rows do not enter aggregation at all.',
    'Aggregate function': 'An aggregate reduces a set of input values to one result per group (or one result for a scalar aggregate query). Most SQL Server aggregates ignore NULL inputs; COUNT(*) is the important exception. Most support OVER, except STRING_AGG, GROUPING, and GROUPING_ID.',
    'COUNT(*)': 'Counts every input row, including rows whose columns are NULL. It returns int and can overflow above 2,147,483,647; use COUNT_BIG(*) when a bigint count is needed. A scalar COUNT(*) over empty input returns zero.',
    'COUNT(expression)': 'Counts rows where the expression is not NULL; duplicate non-NULL values count repeatedly. Its result type is int, so large counts can overflow.',
    'COUNT(DISTINCT expression)': 'Counts unique non-NULL values of one expression. SQL Server COUNT(DISTINCT ...) accepts one expression; it is not a multi-column tuple syntax. DISTINCT aggregate windows are not supported with OVER in SQL Server.',
    'Aggregate ALL and DISTINCT modifiers': 'Many value aggregates accept ALL (the default, counting every occurrence) or DISTINCT (apply the aggregate once to each unique non-NULL input value). This modifier changes the input multiset before aggregation; it is not the same as SELECT DISTINCT on the final rows. COUNT(*) does not support DISTINCT.',
    'COUNT_BIG': 'COUNT_BIG has COUNT semantics but returns bigint, including for COUNT_BIG(*), and is appropriate when a row count might exceed int. It supports row, non-NULL-expression, and distinct-expression forms.',
    'SUM': 'Adds non-NULL numeric values. Return type depends on input type; for decimal input SQL Server returns decimal(38, input scale). Integer accumulation can overflow, so cast to a wider type before summing when the range requires it.',
    'AVG': 'Divides the sum of non-NULL values by their count. Its return type follows SQL Server type rules and can be narrower than expected for integer inputs; cast before AVG when fractional precision is required. Empty or all-NULL input yields NULL.',
    'MIN': 'Returns the lowest non-NULL value under the data type’s comparison rules. It supports comparable expressions, not bit, and returns NULL when there are no non-NULL values.',
    'MAX': 'Returns the highest non-NULL value under the data type’s comparison rules. It supports comparable expressions, not bit, and returns NULL when there are no non-NULL values.',
    'STRING_AGG': 'Concatenates non-NULL expression values with a separator. NULL values and their separators are omitted. Cast to a MAX string type when a bounded inferred return type could truncate or raise a length error; input and separator varchar/nvarchar types must be compatible.',
    'STRING_AGG WITHIN GROUP ordering': 'WITHIN GROUP (ORDER BY ...) makes concatenation order explicit. The order clause is available at compatibility level 110 or higher; a query has one ordered-aggregation order list. This does not order the SELECT result ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)).',
    'STRING_AGG DISTINCT unsupported boundary': 'STRING_AGG syntax has expression and separator arguments but no DISTINCT modifier. To concatenate distinct values, deduplicate rows in a subquery or derived table before applying STRING_AGG, preserving any required group and ordering keys.',
    'APPROX_COUNT_DISTINCT': 'Returns an approximate count of unique non-NULL values as bigint. Microsoft documents up to 2% error within 97% probability; it targets large cardinalities, not exact counts. SQL Server uses binary matching for collation-sensitive strings, so results can differ from a case-insensitive exact COUNT(DISTINCT ...) ([APPROX_COUNT_DISTINCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)).',
    'APPROX_COUNT_DISTINCT accuracy and collation boundary': 'The documented error guarantee is probabilistic, not a per-query exactness promise. It excludes image, sql_variant, ntext, and text inputs. For collation-sensitive strings, matching follows BIN behavior rather than BIN2 or the database’s ordinary linguistic comparison.',
    'PRODUCT': 'SQL Server 2025 (17.x) adds PRODUCT(expression), multiplying numeric non-bit values while ignoring NULL. It supports ALL by default, DISTINCT in aggregate form, and an analytic OVER form. Use it only when multiplication is the intended model and numeric range/precision are appropriate ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)).',
    'PRODUCT DISTINCT': 'PRODUCT(DISTINCT expression) multiplies each unique non-NULL numeric value once. This differs from the default PRODUCT, which multiplies every occurrence; it is a SQL Server 2025 addition.',
    'PRODUCT return type': 'Return type follows the input: tinyint/smallint/int produce int; bigint produces bigint; decimal with scale 0 produces decimal(38,0), otherwise decimal(38,6); money/smallmoney produce money; real/float produce float. The scale rule can round a decimal product, so cast and verify the required precision ([PRODUCT return types](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)).',
    'STDEV': 'Returns the sample standard deviation, estimating dispersion using the sample denominator. It accepts numeric input, ignores NULL, and returns float; use STDEVP when the values are the entire population.',
    'STDEVP': 'Returns the population standard deviation using all non-NULL values as the population. It accepts numeric input and returns float; it is not interchangeable with sample STDEV.',
    'VAR': 'Returns sample variance for non-NULL numeric values as float. Use VARP when the rows are the complete population rather than a sample.',
    'VARP': 'Returns population variance for all non-NULL numeric values as float. It differs from sample VAR in the denominator used.',
    'ANY_VALUE unsupported in SQL Server': 'ANY_VALUE appears in Microsoft documentation for some other Microsoft SQL platforms, but it is not a SQL Server Database Engine aggregate. Do not copy Fabric-only syntax into SQL Server. If a representative value is functionally determined by a grouped key, model that dependency or choose a deterministic aggregate only when its semantics are correct ([ANY_VALUE platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric)).',
    'MEDIAN unsupported in SQL Server': 'The MEDIAN aggregate listed for Fabric analytics endpoints and Fabric Warehouse is not supported in the SQL Server Database Engine. Use PERCENTILE_CONT(0.5) WITHIN GROUP with OVER (PARTITION BY ...) for a median per partition, or an explicitly designed alternative ([MEDIAN platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric)).',
    'APPROX_MEDIAN unsupported in SQL Server': 'APPROX_MEDIAN is listed for other Microsoft data platforms, not the SQL Server Database Engine. Do not treat it as a SQL Server aggregate; approximate distinct counting is a separate supported function ([APPROX_MEDIAN platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric)).',
    'APPROX_QUANTILE unsupported in SQL Server': 'APPROX_QUANTILE is not supported by the SQL Server Database Engine. It appears in other Microsoft analytics platforms and must not be used as if it were a SQL Server T-SQL aggregate ([APPROX_QUANTILE platform applicability](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=sql-server-ver17)).',
    'CHECKSUM_AGG': 'Returns an integer checksum over a group and ignores NULL inputs. It can help detect some changes but collisions are possible; it is not a cryptographic hash or proof that two datasets are equal.',
    'Aggregate NULL exclusion': 'Except for COUNT(*), SQL Server aggregate functions ignore NULL input values. COUNT(expression), SUM, AVG, MIN, MAX, statistical aggregates, PRODUCT, and STRING_AGG therefore summarize non-NULL inputs; this is distinct from filtering rows in WHERE.',
    'Aggregate over empty input': 'A scalar aggregate without GROUP BY still returns one row for empty input: COUNT and COUNT_BIG return zero; SUM, AVG, MIN, MAX and most value aggregates return NULL. A grouped aggregate over empty input has no groups and returns no rows.',
    'Aggregate result type and overflow': 'Aggregate return types are specified per function and are not always the widest possible type. COUNT can overflow int, and SUM can overflow its accumulator. Cast inputs deliberately before aggregation; converting the already-overflowed result is too late.',
    'GROUP BY with NULL': 'Rows whose grouping key is NULL form one group because NULL grouping values are collected together. This grouping behavior is not the same as ordinary `NULL = NULL`, which is UNKNOWN.',
  },
  'grouping-subtotals': {
    'GROUPING SETS': 'Lists the exact grouping combinations to compute in one grouped query. It is conceptually similar to combining several grouped queries with UNION ALL, but duplicate grouping sets are not automatically removed; repeated sets can yield repeated subtotal rows.',
    'ROLLUP': 'Generates a hierarchy of subtotals from the ordered grouping expressions: full detail, then progressively fewer rightmost keys, ending with the grand total. Order the keys from the most detailed to the desired subtotal hierarchy.',
    'CUBE': 'Generates every combination of the listed grouping expressions, including detail and grand total. With n expressions this is 2^n grouping sets, so output grows exponentially; SQL Server limits CUBE/ROLLUP to 12 grouping expressions.',
    'Empty grouping set ()': 'The empty grouping set computes one grand-total group over all input rows. When used with other grouping sets it adds a grand-total row alongside the requested details/subtotals.',
    'GROUPING function': 'GROUPING(column) returns 1 when that column was omitted from the current grouping set and 0 when it participates. Use it to distinguish a subtotal placeholder NULL from a source-data NULL.',
    'GROUPING_ID function': 'GROUPING_ID(col1, ...) combines GROUPING bits for the specified columns into an integer that identifies the grouping level. Argument order defines bit positions; do not assume the value is a simple level number.',
    'Subtotal row': 'A subtotal row aggregates a less-detailed grouping set. Its omitted grouping columns appear as NULL, which can collide visually with genuine NULL data unless GROUPING metadata is included.',
    'Grand-total row': 'The grand total aggregates all qualifying input rows into the empty grouping set. It exists only if the query asks for that grouping, such as GROUP BY () or a grouping construct that includes it.',
    'Grouping NULL placeholder': 'SQL Server uses NULL in columns omitted from a grouping set. That placeholder is not evidence the source key was NULL; pair the displayed key with GROUPING or GROUPING_ID to label subtotal rows correctly.',
    'GROUPING_ID bitmask': 'Each bit encodes whether its corresponding argument was aggregated away, with the rightmost argument associated with the least-significant bit. Convert or label these values explicitly; argument order changes the bitmask.',
    'Explicit UNION ALL subtotal': 'Separate GROUP BY queries combined with UNION ALL can express custom subtotal shapes. Align types and labels in every branch, preserve duplicates intentionally, and compare this approach with GROUPING SETS for maintainability.',
    'ROLLUP hierarchy': 'ROLLUP follows the written key sequence, so GROUP BY ROLLUP(Year, Month, Day) yields day detail, month subtotal, year subtotal, and grand total. Reordering keys changes which subtotals exist.',
    'CUBE combination count': 'CUBE over n keys asks for 2^n groupings, including every subset. Even modest key counts can create many rows; use GROUPING SETS when only selected combinations are required.',
    'GROUPING SETS output limit': 'SQL Server permits at most 32 expressions in a GROUP BY using ROLLUP, CUBE, or GROUPING SETS, and the generated grouping-set count is limited to 4,096. CUBE/ROLLUP additionally allow at most 12 grouping expressions.',
    'Legacy WITH CUBE and WITH ROLLUP': 'The older `GROUP BY expression WITH CUBE` and `WITH ROLLUP` spellings remain for backward compatibility only. Prefer the standard-looking `GROUP BY CUBE(...)` and `GROUP BY ROLLUP(...)` forms in new SQL.',
  },
  'window-frames': {
    'OVER clause': 'OVER defines the rowset window used by an aggregate or analytic function: optional partition, function-specific ordering, and—when that function supports it—a ROWS or RANGE frame. Supported elements vary by function.',
    'WINDOW named-window clause': 'SQL Server 2022 (16.x) introduced the SELECT WINDOW clause for naming reusable window specifications. It requires database compatibility level 160. A function refers to a name with OVER window_name; compatibility level is a database setting, not just the installed engine version ([WINDOW clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17)).',
    'WINDOW inheritance and extension': 'A named window can reference another named window and add components, but cannot redefine inherited PARTITION BY, ORDER BY, or frame properties. Forward and backward references are allowed; cycles and multiple references in one window definition are not.',
    'PARTITION BY': 'Divides the input rows into independent logical groups for the function. It does not reduce the output rows; each input row remains and receives a window result. Without it, the entire input is one partition.',
    'Window ORDER BY': 'Defines the logical sequence used by a function within its partition and establishes peers. It does not order the final SELECT result. Add a query-level ORDER BY for presentation and a unique tie-breaker when individual row sequence matters.',
    'ROWS frame': 'Defines frame membership by physical row offsets in the ordered partition. For predictable row-by-row running calculations, include a unique ORDER BY key and an explicit ROWS frame.',
    'RANGE frame': 'Defines frame membership by ORDER BY value and peers. In SQL Server, RANGE offsets are not implemented: use only UNBOUNDED and CURRENT ROW bounds. RANGE CURRENT ROW includes all rows tied on every window ORDER BY expression.',
    'RANGE offset unsupported boundary': 'SQL Server does not support `RANGE n PRECEDING` or `RANGE n FOLLOWING`; numeric frame offsets are valid only with ROWS. RANGE is limited to current-row/partition endpoints.',
    'GROUPS frame unsupported in SQL Server': 'The SQL Server T-SQL OVER grammar supports ROWS and RANGE, not the GROUPS frame unit found in some other database systems. Do not use `GROUPS BETWEEN` in SQL Server.',
    'UNBOUNDED PRECEDING': 'Starts a frame at the first row of the partition. With CURRENT ROW as the end it describes a cumulative frame from the partition start.',
    'n PRECEDING': 'For ROWS, includes a nonnegative integer number of physical rows before the current row; the documented value must be an integer literal. RANGE does not allow numeric offsets in SQL Server.',
    'CURRENT ROW': 'In ROWS, identifies the current physical row. In RANGE, the current row’s peer group is included, meaning all rows equal on the full window ORDER BY list.',
    'n FOLLOWING': 'For ROWS, includes a nonnegative integer number of physical rows after the current row. SQL Server RANGE does not allow this numeric offset.',
    'UNBOUNDED FOLLOWING': 'Ends the frame at the last row of the partition. It can only be an ending boundary, not a starting boundary.',
    'ROWS BETWEEN frame': 'The explicit `ROWS BETWEEN start AND end` syntax includes physical rows from the chosen start through end. Boundary ordering must be valid; for example, a frame cannot start after its end.',
    'RANGE BETWEEN frame': 'The explicit `RANGE BETWEEN start AND end` syntax uses the current peer group and partition endpoints. SQL Server disallows numeric PRECEDING/FOLLOWING offsets for RANGE.',
    'Default window frame': 'For a function that accepts a frame, when OVER has ORDER BY but no explicit frame, SQL Server defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Peer rows therefore share cumulative results; state ROWS explicitly for physical row-by-row behavior.',
    'Window aggregate': 'An aggregate used with OVER returns one aggregate value for each input row rather than collapsing rows. Most aggregates, including PRODUCT in SQL Server 2025, support OVER; STRING_AGG, GROUPING, and GROUPING_ID do not.',
    'DISTINCT aggregate OVER unsupported boundary': 'SQL Server does not permit DISTINCT aggregation with OVER. A grouped COUNT(DISTINCT x) is supported, but `COUNT(DISTINCT x) OVER (...)` is not; redesign the query when distinct window counts are required.',
    'Running total': 'A running total is usually SUM(expression) OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). A unique order key prevents ties from making row-by-row accumulation ambiguous.',
    'Moving average': 'A moving average uses AVG over a bounded frame, such as ROWS BETWEEN 6 PRECEDING AND CURRENT ROW. Decide whether the first rows use smaller partial windows or require a full fixed-size window.',
    'Partition boundary': 'A frame cannot cross its partition. At partition edges, a bounded frame contains fewer available rows; the aggregate then operates on that smaller frame.',
    'Peer rows': 'Rows tied on every window ORDER BY expression are peers. RANGE CURRENT ROW includes the entire peer group; ranking functions assign ties according to their own rules.',
    'Window order does not order final result': 'The OVER ORDER BY controls the function’s logical input sequence, not the query’s output sequence. Only the outer SELECT ORDER BY guarantees row presentation order.',
  },
  'ranking-and-offset-functions': {
    'ROW_NUMBER': 'Assigns a sequential bigint number within each partition according to required ORDER BY. Ties in the ordering expressions have no guaranteed relative order; add a unique key for repeatable numbering.',
    'RANK': 'Assigns equal rank to peers and leaves gaps after ties: ranks 1, 1, 3. It requires ORDER BY and does not accept a ROWS/RANGE frame.',
    'DENSE_RANK': 'Assigns equal rank to peers without gaps: ranks 1, 1, 2. It requires ORDER BY and does not accept a frame.',
    'NTILE': 'Divides each ordered partition into the requested number of buckets and returns a bigint bucket number. Bucket sizes differ by at most one; larger buckets come first when division is uneven.',
    'LAG': 'Reads an expression from a preceding physical row in the same partition without a self-join. It requires ORDER BY and supports an offset, default value, and SQL Server 2022+ NULL-treatment option.',
    'LEAD': 'Reads an expression from a following physical row in the same partition. It requires ORDER BY and has the analogous offset, default, and NULL-treatment options of LAG.',
    'FIRST_VALUE': 'Returns the expression from the first row of the current frame, not necessarily the entire partition. It requires ORDER BY; specify an appropriate frame when the whole partition is intended.',
    'LAST_VALUE': 'Returns the expression from the last row of the current frame. The default ordered frame ends at the current peer group, so LAST_VALUE often returns the current value; use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for the partition’s final value.',
    'PERCENT_RANK': 'Returns (rank - 1) / (partition row count - 1) as float; the first rank is 0, and a one-row partition returns 0. It requires ORDER BY and is nondeterministic when peer order or partition content can vary.',
    'CUME_DIST': 'Returns the relative position of the last row in the current peer group: rows at or before that value divided by partition row count. It ranges above 0 through 1 and assigns the same value to peers.',
    'PERCENTILE_CONT': 'Computes a continuous percentile using interpolation, so the result can be between observed values. The percentile literal is from 0.0 to 1.0; use WITHIN GROUP (ORDER BY numeric_expression) and OVER (PARTITION BY ...). It ignores NULLs and returns float(53). SQL Server does not allow ORDER BY or a frame inside this function’s OVER clause ([PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17)).',
    'PERCENTILE_DISC': 'Computes a discrete percentile and returns an observed ordered value with the same type as its ordering expression. The percentile is from 0.0 to 1.0; WITHIN GROUP permits one ordering expression, and OVER may partition but cannot have its own ORDER BY or frame. NULL input values are ignored ([PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17)).',
    'APPROX_PERCENTILE_CONT': 'Available in SQL Server 2022 (16.x) and later. Computes an approximate continuous percentile from one numeric ordering expression using a KLL sketch; the percentile is a literal from 0.0 to 1.0 and the return type is float(53). It ignores NULLs. Its guarantee is rank-based, not value-based, so the selected numeric value can differ substantially when neighboring ranks contain distant values. It is nondeterministic and is an aggregate with WITHIN GROUP, not a PERCENTILE_CONT-style analytic OVER function in SQL Server ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)).',
    'APPROX_PERCENTILE_DISC': 'Available in SQL Server 2022 (16.x) and later. Computes an approximate discrete percentile from one numeric ordering expression and returns an observed value. The percentile is a literal from 0.0 to 1.0; NULLs are ignored. Its rank-based guarantee is not a bound on numeric distance, and the randomized KLL algorithm can return different results across executions. The documentation contains a contradictory sentence about supported float/decimal inputs; verify the exact input type on the target engine rather than infer beyond the unambiguous numeric requirement ([APPROX_PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)).',
    'Approximate percentile rank-error guarantee': 'Microsoft documents up to 1.33% rank error within 99% confidence for these SQL Server approximate percentile functions. This bounds rank position, not the numerical distance between returned and exact values; the algorithm is randomized and may vary by execution ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [APPROX_PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)).',
    'RANK tie gaps': 'If two rows tie at rank r, both receive r and the next rank advances by the number of tied rows. Use RANK when competition-style positions should preserve skipped places.',
    'DENSE_RANK no tie gaps': 'Tied rows share a rank, and the next distinct ordering value receives the immediately following rank. Use DENSE_RANK when counting distinct ordered levels.',
    'Nondeterministic ROW_NUMBER without unique order': 'ROW_NUMBER is nondeterministic unless the partition/order key combination uniquely orders rows. A stable-looking result in one execution is not a tie-break guarantee.',
    'LAG default argument': 'The third argument is returned when the requested preceding offset lies outside the partition; if omitted it is NULL. It must be type-compatible with scalar_expression and cannot be an analytic function.',
    'LEAD default argument': 'The third argument is returned when the requested following offset lies outside the partition; if omitted it is NULL. It must be type-compatible with scalar_expression and cannot be an analytic function.',
    'LAG IGNORE NULLS': 'Available in SQL Server 2022 (16.x) and later. It skips NULL values while looking backward; SQL Server 2022 CU4 fixed a related LAG/LEAD bug. Validate the deployed build before depending on this behavior ([LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)).',
    'LEAD IGNORE NULLS': 'Available in SQL Server 2022 (16.x) and later. It skips NULL values while looking forward; SQL Server 2022 CU4 fixed a related LAG/LEAD bug. Validate the deployed build before depending on this behavior ([LEAD](https://learn.microsoft.com/en-us/sql/t-sql/functions/lead-transact-sql?view=sql-server-ver17)).',
    'FIRST_VALUE IGNORE NULLS': 'Available in SQL Server 2022 (16.x) and later. It selects the first non-NULL expression value in the frame; if every value is NULL the result remains NULL ([FIRST_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/first-value-transact-sql?view=sql-server-ver17)).',
    'LAST_VALUE IGNORE NULLS': 'Available in SQL Server 2022 (16.x) and later. It selects the last non-NULL expression value in the frame; the frame boundary still controls which rows are eligible ([LAST_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/last-value-transact-sql?view=sql-server-ver17)).',
    'LAG RESPECT NULLS': 'RESPECT NULLS is the default treatment, available as an explicit option from SQL Server 2022 (16.x). A NULL at the offset row is returned as NULL rather than skipped.',
    'LEAD RESPECT NULLS': 'RESPECT NULLS is the default treatment, available as an explicit option from SQL Server 2022 (16.x). A NULL at the offset row is returned as NULL rather than skipped.',
    'FIRST_VALUE RESPECT NULLS': 'RESPECT NULLS is the default treatment, available explicitly in SQL Server 2022 (16.x) and later. A leading NULL in the frame can therefore be the first value.',
    'LAST_VALUE RESPECT NULLS': 'RESPECT NULLS is the default treatment, available explicitly in SQL Server 2022 (16.x) and later. A last NULL in the current frame can be the returned value.',
    'NTILE bucket count': 'The NTILE argument is a positive integer or expression convertible to int. It specifies the number of buckets, not a bucket size; if rows divide unevenly, earlier buckets receive one extra row.',
    'LAG and LEAD offset rules': 'Offset defaults to 1 and must be a positive integer expression convertible to bigint; negative offsets and analytic offset expressions are not allowed. The default expression is used only when the target row is outside the partition, not when its value is NULL.',
    'SQL Server 2022 IGNORE NULLS availability and CU4 fix': 'IGNORE NULLS and RESPECT NULLS were introduced for LAG, LEAD, FIRST_VALUE, and LAST_VALUE in SQL Server 2022 (16.x). Microsoft documents a LAG/LEAD IGNORE NULLS fix in SQL Server 2022 CU4; treat engine version and servicing level as part of the feature requirement.',
    'Window function versus grouped aggregate': 'A grouped aggregate emits one row per group and reduces the result. A window function retains each input row and adds a value calculated from related rows; the same aggregate such as SUM can be used in either shape.',
  },
};

const sources = Object.entries(urls).map(([name, url]) => `- [Microsoft Learn: ${name}](${url})`).join('\n');
const esc = text => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ').trim();
const row = (groupId, name) => {
  const detail = definitions[groupId][name];
  if (!detail) throw new Error(`No authored explanation for ${groupId} / ${name}`);
  return `| \`${esc(name)}\` | ${esc(detail)} |`;
};
const title = manifest.title;
const outputDir = 'course/lessons/t03-005';
await fs.mkdir(outputDir, { recursive: true });
const write = (name, body) => fs.writeFile(`${outputDir}/t03-005-${name}.md`, `${body.trim()}\n`);

const overview = `# ${title} — Big-picture orientation and mental model

# Problem and purpose

Aggregation answers questions about collections: totals, counts, summaries, and subtotals. Window functions answer related questions while keeping detail rows visible, such as running totals, rankings, prior values, and percentiles. SQL Server's grouping and analytic syntax has several boundaries that differ from other database systems, so syntax and version compatibility matter.

# Plain-language mental model

First decide what one output row should mean. A grouped query changes the grain: many input rows become one row per group. A window query preserves the input grain and adds a value computed over a partition or frame. WHERE chooses input rows before groups form; HAVING decides which formed groups survive.

The group is not the same as the frame. PARTITION BY splits independent populations. ORDER BY gives functions a logical sequence. A ROWS or RANGE frame narrows the rows considered around the current row. SQL Server's default ordered frame is a peer-aware RANGE frame, which can surprise running totals and LAST_VALUE.

# How the parts fit together

1. Define the output grain and which source rows qualify.
2. Use WHERE for row predicates; use GROUP BY to establish groups and HAVING for group predicates.
3. Choose exact aggregation, approximate distinct counting, or statistical summaries according to the accuracy contract.
4. Use GROUPING SETS for selected totals, ROLLUP for a hierarchy, and CUBE only when every combination is needed.
5. Use a window function when detail rows must remain; specify partition, ordering, and frame deliberately.
6. Add a final query ORDER BY when presentation order matters.

# Version landmarks

SQL Server 2017 added STRING_AGG; its ordered WITHIN GROUP form requires compatibility level 110 or higher ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)). SQL Server 2019 added APPROX_COUNT_DISTINCT ([function reference](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)). SQL Server 2022 added the named WINDOW clause at compatibility level 160, approximate percentile aggregates, and NULL-treatment options for LAG, LEAD, FIRST_VALUE, and LAST_VALUE; CU4 fixed an IGNORE NULLS issue for LAG/LEAD ([WINDOW](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17), [approximate continuous percentile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [approximate discrete percentile](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17), [LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)). SQL Server 2025 adds PRODUCT as an aggregate and analytic function ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). GROUPS frames, Fabric-only ANY_VALUE/MEDIAN/APPROX_MEDIAN/APPROX_QUANTILE, and DISTINCT window aggregates are not SQL Server syntax ([ANY_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric), [MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric), [APPROX_MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric), [APPROX_QUANTILE](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=sql-server-ver17)).

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

${sources}
`;
await write('overview', overview);

const concepts = `# ${title} — Core concepts and how they fit together

# Learning objectives

Predict grouped output grain; distinguish WHERE from HAVING; choose aggregate semantics for duplicates, NULL, empty input, and numeric range; generate subtotals and label them reliably; and design analytic calculations with explicit order and frame behavior.

# Prerequisites

Know SELECT, FROM, WHERE, NULL, basic numeric types, and query ordering. The earlier SQL Server SELECT topic covers filtering and final ORDER BY.

# Core concepts

## Grouping changes grain

GROUP BY forms one result row per distinct grouping-key tuple. WHERE removes source rows before that operation; HAVING filters the groups afterward. A global scalar aggregate has one group even on empty input, whereas a grouped aggregate over empty input has no groups. SQL Server collects NULL grouping keys into one group.

Aggregate functions differ in NULL handling, return types, exactness, and meaning. COUNT(*) includes every row; COUNT(expression) excludes NULL. COUNT returns int while COUNT_BIG returns bigint. SUM/AVG and numeric accumulators can overflow or lose desired fractional precision unless inputs are cast before aggregation. Statistical sample functions STDEV and VAR differ from population functions STDEVP and VARP. PRODUCT is new in SQL Server 2025 ([PRODUCT](https://learn.microsoft.com/en-us/sql/t-sql/functions/product-aggregate-transact-sql?view=sql-server-ver17)). STRING_AGG skips NULL expressions and needs an explicit ordering clause when concatenation order matters ([STRING_AGG](https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql?view=sql-server-ver17)). APPROX_COUNT_DISTINCT trades exactness for lower memory use and has a documented probabilistic error bound; it has distinct collation behavior ([function reference](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-count-distinct-transact-sql?view=sql-server-ver17)).

Some function names listed across Microsoft database products are not available in SQL Server. ANY_VALUE, MEDIAN, APPROX_MEDIAN, and APPROX_QUANTILE are not SQL Server Database Engine functions ([ANY_VALUE](https://learn.microsoft.com/en-us/sql/t-sql/functions/any-value-transact-sql?view=fabric), [MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/median-transact-sql?view=fabric), [APPROX_MEDIAN](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-median-transact-sql?view=fabric), [APPROX_QUANTILE](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-quantile-transact-sql?view=sql-server-ver17)). SQL Server provides exact PERCENTILE_CONT and PERCENTILE_DISC and, since SQL Server 2022, APPROX_PERCENTILE_CONT and APPROX_PERCENTILE_DISC ([exact PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17), [exact PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-disc-transact-sql?view=sql-server-ver17), [approximate PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17), [approximate PERCENTILE_DISC](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-disc-transact-sql?view=sql-server-ver17)).

## Subtotals are extra grouping sets

GROUPING SETS names specific combinations; ROLLUP produces a key hierarchy; CUBE produces every subset and grows as 2^n. These forms can emit NULL placeholders for keys absent from a grouping set. GROUPING and GROUPING_ID reveal whether a NULL came from subtotal omission or source data. SQL Server allows at most 12 grouping expressions for CUBE/ROLLUP and at most 4,096 generated grouping sets in these advanced forms ([GROUP BY limitations](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)).

## Windows keep input rows

OVER specifies a partition, optional logical order, and an optional frame when supported by the function. PARTITION BY does not collapse rows. ROWS counts physical positions; RANGE treats all current peers together. SQL Server implements RANGE without numeric offsets and does not implement GROUPS frames. When ORDER BY exists but a frame is omitted, frame-capable functions default to RANGE UNBOUNDED PRECEDING through CURRENT ROW. This peer-aware default explains why tied rows can share a running aggregate and why LAST_VALUE can return the current peer value rather than the partition's final value ([OVER clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17)).

SQL Server 2022 introduced named WINDOW specifications at compatibility level 160 ([WINDOW clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-window-transact-sql?view=sql-server-ver17)). A function's syntax constrains which OVER components it can use: ranking functions require ordering but do not accept frames; LAG/LEAD use offsets and cannot use frames ([LAG](https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver17)); exact percentile functions put their value ordering in WITHIN GROUP and only partition in OVER ([PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/percentile-cont-transact-sql?view=sql-server-ver17)). SQL Server does not allow DISTINCT aggregates with OVER.

## Function families

ROW_NUMBER assigns sequence positions; RANK leaves gaps after ties; DENSE_RANK does not. NTILE distributes rows into near-equal buckets. LAG and LEAD access preceding/following rows. FIRST_VALUE and LAST_VALUE read the current frame. PERCENT_RANK and CUME_DIST express relative position. PERCENTILE_CONT interpolates; PERCENTILE_DISC returns an observed value. SQL Server 2022 approximate percentile aggregates use rank-based error bounds ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)). A window ORDER BY does not order the final result, and ties require explicit tie-break keys whenever stable individual-row sequence matters.

# Mechanisms and relationships

An aggregate may appear in the SELECT list or HAVING clause. A window function is evaluated over rows produced by the query and does not replace WHERE or GROUP BY. Grouping metadata describes why a grouping column is NULL in a subtotal. Window function syntax is specific to each function family; the OVER grammar alone does not mean every function accepts every clause.

# Worked examples

\`\`\`sql
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
\`\`\`

The WHERE clause selects contributing detail rows; the window retains each of them. The explicit ROWS frame and unique ordering key make the running sequence row-based and repeatable.

\`\`\`sql
SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingLevel,
       SUM(SalesAmount) AS Sales
FROM dbo.Sales
GROUP BY GROUPING SETS ((Region, Year), (Region), ());
\`\`\`

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

${sources}
`;
await write('concepts', concepts);

const comparisons = {
  'grouped-aggregation': 'WHERE filters rows before grouping; HAVING filters after aggregation. COUNT(*) includes NULL-bearing rows; COUNT(expression) does not. COUNT uses int and COUNT_BIG uses bigint. Exact aggregates, approximate distinct counts, statistical summaries, ordered string concatenation, and SQL Server 2025 PRODUCT have different contracts.',
  'grouping-subtotals': 'GROUPING SETS enumerates requested levels, ROLLUP follows an ordered hierarchy, and CUBE creates every combination. GROUPING and GROUPING_ID mark subtotal placeholders; duplicate grouping specifications can still produce duplicate output rows.',
  'window-frames': 'PARTITION BY separates populations, ORDER BY creates logical sequence and peers, and a frame selects rows around each current row. ROWS counts physical rows; SQL Server RANGE uses peers and partition endpoints only; GROUPS is unsupported. Named WINDOW definitions require SQL Server 2022 compatibility level 160.',
  'ranking-and-offset-functions': 'ROW_NUMBER creates a sequence, RANK leaves tie gaps, and DENSE_RANK does not. LAG/LEAD access adjacent ordered rows; FIRST/LAST_VALUE respect frame bounds; percentile functions distinguish interpolation from selecting an observed value. Every function has its own accepted OVER shape.',
};
const codes = {
  'grouped-aggregation': {
    code: `SELECT StoreId, COUNT_BIG(*) AS SaleCount,
       SUM(CAST(Amount AS decimal(19, 4))) AS TotalAmount,
       AVG(CAST(Amount AS decimal(19, 4))) AS AverageAmount,
       STRING_AGG(CONVERT(nvarchar(max), Note), N'; ')
         WITHIN GROUP (ORDER BY SaleId) AS Notes
FROM dbo.Sales
WHERE Status = N'Posted'
GROUP BY StoreId
HAVING SUM(Amount) > 1000;`,
    explanation: 'WHERE limits contributing rows; GROUP BY defines one row per store; HAVING filters the completed groups. COUNT_BIG avoids the int row-count ceiling. Explicit casts document numeric precision and STRING_AGG output width/order.',
    mistakes: ['Putting an aggregate condition in WHERE.', 'Using COUNT(column) when NULL rows must count.', 'Casting only after SUM has already overflowed.', 'Assuming STRING_AGG input order without WITHIN GROUP.', 'Using approximate distinct count where exactness is contractual.'],
    fit: 'Aggregation converts rows into summaries, so define the group grain before choosing functions. WHERE acts on source rows, HAVING acts on groups, and return type/NULL rules determine whether the numeric or textual result satisfies the contract.',
  },
  'grouping-subtotals': {
    code: `SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingId,
       SUM(SalesAmount) AS Sales
FROM dbo.Sales
GROUP BY GROUPING SETS ((Region, Year), (Region), ());`,
    explanation: 'This emits region/year detail, a subtotal per region, and a grand total. GROUPING_ID distinguishes omitted-key NULL placeholders from source NULL values. The explicit sets avoid generating every CUBE combination.',
    mistakes: ['Treating subtotal NULL as source NULL.', 'Using CUBE when only a few subtotal levels are needed.', 'Assuming duplicate grouping sets are eliminated.', 'Changing ROLLUP key order without noticing changed subtotal levels.', 'Treating GROUPING_ID as a simple ordinal level number.'],
    fit: 'Subtotals are separate grouping sets in the same result. Choose exact sets, a hierarchical ROLLUP, or all CUBE combinations, then expose grouping metadata so readers can identify each row’s grain.',
  },
  'window-frames': {
    code: `SELECT StoreId, SaleId, SaleTime, Amount,
       SUM(Amount) OVER
       (
           PARTITION BY StoreId
           ORDER BY SaleTime, SaleId
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS RollingSevenRows
FROM dbo.Sales
ORDER BY StoreId, SaleTime, SaleId;`,
    explanation: 'The window keeps every sale row and sums at most the current row plus six preceding rows within its store. SaleId breaks same-time ties. This is seven rows, not seven calendar days; for date-range semantics use a different query shape.',
    mistakes: ['Confusing a frame with an entire partition.', 'Leaving the default RANGE frame in a row-by-row running calculation.', 'Using unsupported RANGE offsets or GROUPS in SQL Server.', 'Expecting the window order to sort final output.', 'Assuming a seven-row frame means seven days.'],
    fit: 'Window functions retain detail rows. A partition chooses the population, an order chooses logical sequence and peer groups, and a frame chooses each row’s contributing neighbors. SQL Server supports ROWS and restricted RANGE semantics.',
  },
  'ranking-and-offset-functions': {
    code: `SELECT CustomerId, OrderId, OrderDate, Amount,
       ROW_NUMBER() OVER
         (PARTITION BY CustomerId ORDER BY OrderDate DESC, OrderId DESC) AS Recency,
       LAG(Amount, 1, 0) IGNORE NULLS OVER
         (PARTITION BY CustomerId ORDER BY OrderDate, OrderId) AS PreviousNonNullAmount,
       LAST_VALUE(Amount) OVER
         (PARTITION BY CustomerId ORDER BY OrderDate, OrderId
          ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS FinalAmount
FROM dbo.Orders
ORDER BY CustomerId, OrderDate, OrderId;`,
    explanation: 'A unique OrderId resolves ties. LAG’s default applies only when no eligible preceding row exists; IGNORE NULLS skips NULL-valued rows and requires SQL Server 2022 or later (CU4 fixes a documented issue). LAST_VALUE’s explicit full-partition frame requests the final ordered value.',
    mistakes: ['Using ROW_NUMBER with nonunique ordering when stable assignment matters.', 'Confusing RANK and DENSE_RANK tie behavior.', 'Assuming LAG’s default replaces an existing NULL value.', 'Forgetting LAST_VALUE frame bounds.', 'Expecting PERCENTILE_CONT to return an observed value.'],
    fit: 'Analytic functions have distinct contracts: sequence/ranking, neighboring-row access, frame endpoint selection, distribution, and percentile selection. The function-specific syntax determines which ordering and frame clauses are valid.',
  },
};

for (const group of manifest.inventory) {
  const defs = definitions[group.id];
  for (const item of group.items) if (!defs?.[item]) throw new Error(`Missing definition: ${group.id} / ${item}`);
  if (Object.keys(defs).length !== group.items.length) throw new Error(`Extra authored definitions in ${group.id}`);
  const meta = codes[group.id];
  const body = `# ${title} — Reference: ${group.title}

# Scope and version

This reference explains all ${group.items.length} frozen names in **${group.title}** for SQL Server 2025 (17.x) T-SQL. Version and compatibility-level boundaries are called out where they change availability.

# How this group fits the mental model

${meta.fit}

# Supplied names explained

| Exact supplied item | SQL Server behavior and boundary |
| --- | --- |
${group.items.map(item => row(group.id, item)).join('\n')}

# Cross-item comparison

${comparisons[group.id]}

# Examples

\`\`\`sql
${meta.code}
\`\`\`

${meta.explanation}

# Common mistakes

${meta.mistakes.map(x => `- ${x}`).join('\n')}

# Knowledge checks with answers

${group.items.map((item, i) => `${i + 1}. **What does \`${item}\` mean here?** Use the exact inventory row above; identify its input grain, NULL/duplicate behavior, version or compatibility boundary, and output contract where applicable.`).join('\n')}

# Sources

${sources}
`;
  const file = group.id === 'grouped-aggregation' ? 'reference-grouped-aggregation'
    : group.id === 'grouping-subtotals' ? 'reference-grouping-subtotals'
      : group.id === 'window-frames' ? 'reference-window-frames'
        : 'reference-ranking-and-offset-functions';
  await write(file, body);
}

const practice = `# ${title} — Exercises and worked solutions

# Goals

Translate a reporting requirement into the correct row grain, aggregate, grouping set, or window specification. State the edge-case behavior before choosing syntax.

# Worked example

For an account ledger, retain each transaction while adding the cumulative balance:

\`\`\`sql
SELECT AccountId, TransactionId, Amount,
       SUM(Amount) OVER
       (
           PARTITION BY AccountId
           ORDER BY PostedAt, TransactionId
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS Balance
FROM dbo.Ledger
ORDER BY AccountId, PostedAt, TransactionId;
\`\`\`

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
13. An application uses \`GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW\`. Explain why SQL Server rejects it and propose an explicit ROWS or peer-aware design.
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

1. \`SELECT StoreId, COUNT_BIG(*) AS SaleCount FROM dbo.Sales WHERE Status = N'Posted' GROUP BY StoreId;\` COUNT_BIG avoids int overflow for a very large group.
2. \`SELECT StoreId, SUM(Amount) AS Total FROM dbo.Sales WHERE Status = N'Posted' GROUP BY StoreId HAVING SUM(Amount) > @Minimum;\` Filtering precedes aggregation; HAVING tests the formed total.
3. \`STRING_AGG(CONVERT(nvarchar(max), Note), N'; ') WITHIN GROUP (ORDER BY SaleId)\` skips NULL Note values; cast controls result width and ordering is explicit.
4. Use \`APPROX_COUNT_DISTINCT(VisitorId)\`. Treat it as an estimate with the documented probabilistic error bound, and verify whether binary matching for strings matches the reporting contract.
5. \`SELECT Region, Year, GROUPING_ID(Region, Year) AS GroupingId, SUM(Amount) AS Total FROM dbo.Sales GROUP BY GROUPING SETS ((Region, Year), (Region), ());\` GROUPING_ID labels the omitted-key levels.
6. Thirteen dimensions imply 8,192 CUBE combinations, exceeding SQL Server’s 12-key CUBE/ROLLUP limit. Specify only required combinations with GROUPING SETS.
7. \`SUM(Amount) OVER (PARTITION BY AccountId ORDER BY EventTime, EventId ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\` uses unique EventId to break timestamp ties.
8. \`AVG(Value) OVER (PARTITION BY DeviceId ORDER BY SampleTime, SampleId ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)\`. At partition starts, fewer than seven rows are available; require a full frame separately if needed.
9. \`LAST_VALUE(Value) OVER (PARTITION BY CustomerId ORDER BY OrderDate, OrderId ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)\`. The ending boundary matters because the default ends at the current peer group.
10. Values A=10, B=10, C=8 yield RANK 1,1,3 and DENSE_RANK 1,1,2 when ordered descending.
11. \`LAG(Value) IGNORE NULLS OVER (PARTITION BY EntityId ORDER BY EventTime, EventId)\` is available in SQL Server 2022+, with CU4 fixing a documented LAG/LEAD bug.
12. \`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY Salary) OVER (PARTITION BY DepartmentId)\` can interpolate; \`PERCENTILE_DISC(0.5)\` returns an observed salary. Both use a partition-only OVER in SQL Server.
13. SQL Server does not implement GROUPS. Use ROWS if the requirement is a count of physical rows; to include peer groups, derive a peer-group key/rank and join or aggregate explicitly.
14. Set database compatibility level to 160 or higher on a supported SQL Server 2022+ instance, or repeat the window specification in each OVER clause.
15. \`SELECT DepartmentId, APPROX_PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY Salary) AS ApproxMedian FROM dbo.EmployeeSalary GROUP BY DepartmentId;\` SQL Server 2022+ computes an approximate continuous median per department. Microsoft’s 1.33% rank error within 99% confidence is a rank-position guarantee, not a numeric-distance bound; a large value gap between neighboring ranks can make the approximate result differ substantially from the exact percentile ([APPROX_PERCENTILE_CONT](https://learn.microsoft.com/en-us/sql/t-sql/functions/approx-percentile-cont-transact-sql?view=sql-server-ver17)).

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

${sources}
`;
await write('practice', practice);

const interview = `# ${title} — Interview questions and reasoning

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

${sources}
`;
await write('interview', interview);

console.log(`Wrote aggregation concepts, ${manifest.inventory.length} exact-inventory references, practice, and interview; ${manifest.inventory.reduce((sum, group) => sum + group.items.length, 0)} inventory names are required.`);
