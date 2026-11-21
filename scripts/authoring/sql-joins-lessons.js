import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-004.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const urls = {
  from: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17',
  union: 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17',
  except: 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17',
  cte: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17',
  recursive: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17',
  subqueries: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/subqueries?view=sql-server-ver17',
  search: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17',
  hints: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-ver17',
  tableValues: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver17',
  pivot: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17',
};

const latestSources = Object.values(urls);
manifest.sourceSnapshot = {
  ...manifest.sourceSnapshot,
  edition: 'SQL Server 2025 (17.x) T-SQL table sources, set operators, subqueries, and recursive CTEs checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...latestSources])],
};
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), ...latestSources])];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const definitions = {
  'join-forms-and-row-preservation': [
    ['FROM table source', 'Names the row-producing input to a query. A source may be a table, view, table variable, derived query, rowset source, table-valued function, or a composition of joins, APPLY, PIVOT, and UNPIVOT. SQL Server documents up to 256 table sources, but the practical limit varies with memory and query complexity. Give complex sources clear aliases.'],
    ['INNER JOIN', 'Returns combinations for which the ON search condition is TRUE. Rows without a matching partner are absent; multiple matching partners create multiple result rows.'],
    ['LEFT OUTER JOIN', 'Returns every left row and each matching right row. When no right row satisfies ON, SQL Server emits one row with NULLs for the right-side columns.'],
    ['RIGHT OUTER JOIN', 'Preserves every row from the right input and matches left rows where ON is TRUE. It is logically symmetric with LEFT JOIN, though rewriting inputs is often easier to read.'],
    ['FULL OUTER JOIN', 'Returns matching combinations plus unmatched rows from both inputs, filling the missing side with NULLs. A row can match multiple partners and therefore appear multiple times.'],
    ['CROSS JOIN', 'Forms the Cartesian product: each left row is paired with every right row. The output count is the product of input counts, including zero if either input is empty.'],
    ['CROSS APPLY', 'Evaluates a right table expression for each left row and combines its rows with that left row. If the right expression returns no rows for a left row, that left row is omitted.'],
    ['OUTER APPLY', 'Evaluates the right table expression per left row, preserving that left row when the expression returns no rows and NULL-extending right columns. It is the lateral counterpart to an outer join.'],
    ['Join predicate ON', 'Defines which pairs count as matches. In an outer join, a right-side restriction in ON changes matching while preserving unmatched left rows; it is not interchangeable with moving that condition to WHERE.'],
    ['Join predicate in WHERE', 'Filters the joined result after outer-join null extension in logical query processing. A predicate on a nullable side often rejects the NULL-extended rows and effectively removes the preservation the outer join was meant to provide.'],
    ['Equijoin', 'Matches rows using equality comparisons, commonly between a foreign key and a referenced key. Equality with NULL is UNKNOWN, so NULL keys do not match unless a different explicit null-safe condition is defined.'],
    ['Non-equijoin', 'Uses a predicate other than equality, such as a range overlap or less-than condition. One row may match many rows, so validate cardinality and boundary inclusiveness explicitly.'],
    ['Self-join', 'Joins a table to another logical instance of itself. Assign distinct aliases and express the relationship, such as employee-to-manager, in ON.'],
    ['Multiple join sequence', 'Adds table sources in a written sequence. Read each ON against the inputs available at that point, use parentheses when grouping is important, and reason about each join’s multiplicity and preservation.'],
    ['Join cardinality', 'The number of output rows depends on match counts and row preservation, not only on input table sizes. A one-to-one relationship can preserve one row per key; one-to-many relations expand rows, and many-to-many matches can create a product of match counts within each key group.'],
    ['One-to-many duplicate multiplication', 'A parent with several matching children appears once per child in an ordinary join. These repeated parent values are valid joined rows, not accidental duplicates; aggregate or use EXISTS if the requested result is one row per parent.'],
    ['Null-extended unmatched row', 'Outer joins synthesize NULL values for columns from the missing side. These NULLs mean no matching row was found in this join; they do not prove that the underlying right-side column itself is nullable.'],
    ['Outer join predicate placement', 'Put restrictions that define a qualifying match in ON when unmatched preserved-side rows must remain. Put filters on the final joined result in WHERE only when rejecting null-extended rows is intended; test both matched-but-disqualified and no-match cases.'],
    ['APPLY correlated table expression', 'The right table source can reference columns from the left source and is evaluated per left row as a logical model. SQL Server combines each right row with the left row; do not infer a particular physical execution strategy from this description.'],
    ['VALUES table value constructor source', 'A VALUES list can supply an inline rowset, for example as a derived table with an alias and column names. The 1,000-row limit applies to INSERT ... VALUES, not a VALUES-derived table. Rows in a VALUES constructor are not an ordering guarantee for a query result.'],
    ['Derived table', 'A parenthesized query expression in FROM that acts as a table source for the outer query. SQL Server requires a table alias; provide column aliases where names would otherwise be ambiguous or unavailable.'],
    ['Table-valued function source', 'A function returning a rowset can appear as a FROM source with a table alias. If its arguments depend on a preceding source row, use APPLY to express that correlation.'],
    ['Join hint boundary', 'A join hint forces a physical join strategy. Microsoft recommends using hints only as a last resort after plan analysis. A join hint can also force join order for the query, so a local change can affect the whole multi-join plan.'],
    ['LOOP JOIN hint', 'Forces a nested-loops physical join strategy for the specified pair. SQL Server cannot combine this hint with RIGHT or FULL join types. It constrains the plan and should be used only when measured evidence justifies overriding optimizer choice.'],
    ['HASH JOIN hint', 'Forces a hash physical join strategy for the specified pair. This changes plan selection, not which rows logically match. Use only after measuring the actual workload and plan.'],
    ['MERGE JOIN hint', 'Forces a merge physical join strategy for the specified pair. It is an execution algorithm, not the MERGE data-modification statement. Use only when measured plan evidence supports the constraint.'],
    ['REMOTE JOIN hint', 'Requests that a distributed join execute at the remote table site, typically with a local left input and remote right input; it is useful when provider statistics do not let the optimizer choose a suitable remote strategy. Microsoft advises the left input be smaller than the right. SQL Server documents it only for INNER JOIN; collation casts in the compared predicate can make the hint invalid.'],
    ['PIVOT operator', 'Rotates unique values from one input column into a fixed set of output columns and aggregates the remaining values. The IN list is static in the query text; values not listed do not become output columns. Give the output table source its required alias. Repeated PIVOT/UNPIVOT operators in one statement can hurt performance.'],
    ['PIVOT aggregate_function', 'The PIVOT clause requires an aggregate function over its value column. The aggregate combines multiple source rows in each group; NULL value inputs are not considered by aggregate functions.'],
    ['PIVOT COUNT(*) restriction', 'COUNT(*) cannot be used as the aggregate expression in PIVOT. Use an allowed aggregate over the value column and ensure it represents the intended measure; the PIVOT input still produces groups from its rows.'],
    ['PIVOT value_column', 'Names the input column whose values are aggregated into each generated output column. Null values in this column are not considered by the aggregate; choose the aggregate according to the required summary.'],
    ['PIVOT pivot_column', 'Names the input column whose distinct values are mapped to output headings by the IN list. It must be convertible to nvarchar and cannot be image or rowversion.'],
    ['PIVOT IN column_list', 'Lists the fixed output-column identifiers and corresponding values expected from the pivot column. A listed output name cannot already exist in the input source; an unlisted pivot value has no output column.'],
    ['PIVOT implicit grouping columns', 'Every input column other than pivot_column and value_column becomes an implicit grouping key. Project only the intended grouping columns in a source subquery; an unnoticed extra column splits groups and can produce repeated-looking rows.'],
    ['PIVOT empty subgroup result', 'For a group with no source rows for a listed pivot value, SQL Server returns NULL in that output column; when the aggregate counts rows, it returns zero. This differs from values that exist but aggregate to NULL.'],
    ['UNPIVOT operator', 'Rotates several input columns into row values under a name column and a value column, and requires an output table alias. It is not a lossless inverse of PIVOT when aggregation merged rows, and its treatment of NULL inputs can remove rows.'],
    ['UNPIVOT value_column', 'Names the output column that receives values from the listed input columns. It cannot collide with an existing input column name, and the source columns in the IN list must have compatible types.'],
    ['UNPIVOT pivot_column', 'Names the output column that receives each original input-column identifier as a row value. It cannot already exist in the input source; the resulting name values use nvarchar(128).'],
    ['UNPIVOT IN column_list', 'Lists the source columns that become rows. Their names become values in pivot_column and their cell values become value_column; the query shape is static and the columns must be type-compatible.'],
    ['UNPIVOT NULL elimination', 'UNPIVOT omits rows whose selected input cell is NULL. Therefore UNPIVOT is not an exact inverse of PIVOT or a complete reshape when NULL cells carry meaning; preserve them separately if they must remain observable.'],
    ['UNPIVOT catalog collation', 'Column identifiers emitted as values follow the catalog collation. Combining them with differently collated data can require explicit COLLATE DATABASE_DEFAULT to resolve a collation conflict.'],
  ],
  'set-operators': [
    ['UNION', 'Combines rows from both query expressions and removes duplicate result tuples. Duplicate comparison considers the full projected row; use it only when set semantics are intended.'],
    ['UNION ALL', 'Combines both row streams while preserving duplicates. It avoids UNION’s duplicate-elimination requirement and is usually the right choice when repeated rows are meaningful or inputs are known disjoint.'],
    ['INTERSECT', 'Returns distinct full rows present in both query results. It compares corresponding columns and treats two NULL values as equal for duplicate/set comparison.'],
    ['EXCEPT', 'Returns distinct full rows from the left result that are absent from the right result. It is directional: reversing inputs changes the meaning.'],
    ['Compatible column count', 'Each operand must return the same number of columns in the same positional order. Names do not align columns; explicitly project fields in matching semantic positions.'],
    ['Result data-type resolution', 'Corresponding columns must be compatible. SQL Server chooses a result type using data-type precedence and expression type-resolution rules; explicit casts make intended length, precision, scale, and nullability clearer.'],
    ['Column names inherited from first query', 'The result column names are taken from the first query expression. Give the left operand clear aliases because later ORDER BY refers to the combined result’s output names.'],
    ['Duplicate elimination in UNION', 'UNION compares complete rows and removes repeated tuples, including duplicates that existed within either input; two NULL values compare equal for duplicate elimination. It does not preserve source-row identity or choose a representative business entity.'],
    ['Duplicate preservation in UNION ALL', 'UNION ALL retains every row occurrence from both inputs. If the same row appears in both branches, it appears twice; branch order is not a result-order guarantee.'],
    ['Distinct set semantics of INTERSECT', 'INTERSECT returns each common tuple once even if either input contains it multiple times. For occurrence-preserving matching, a different query design is required.'],
    ['Distinct set semantics of EXCEPT', 'EXCEPT returns each left-side tuple once when no equal tuple exists on the right. Repeated left rows collapse and NULLs compare equal for set duplicate checking.'],
    ['Parenthesized set operation', 'Parentheses group query expressions and make operator precedence or a desired combination explicit. A final ORDER BY belongs to the combined outer query expression.'],
    ['Set-operator precedence', 'INTERSECT binds more tightly than UNION and EXCEPT. UNION and EXCEPT at the same precedence are evaluated left to right; parentheses are clearer when the intended grouping matters.'],
    ['ORDER BY after set operation', 'Place the ORDER BY after the complete set expression to order its final result. Its sort items must appear in the set-operation select list and use the output names from the first (leftmost) query. Ties remain unordered.'],
    ['Set operator versus JOIN', 'A set operator stacks compatible rows vertically; a join combines columns horizontally by matching row pairs. Choose from the shape of the desired result, not from superficial similarity between tables.'],
    ['Type precedence across set branches', 'When corresponding types differ but are compatible, SQL Server may implicitly convert one operand to the higher-precedence result type. Conversion can fail or alter precision, so cast explicitly when the contract matters.'],
    ['Collation compatibility across set branches', 'Character columns with different collations must be resolved by collation-precedence rules for comparison and output. Conflicting implicit collations can raise an error; use an explicit COLLATE where the intended comparison collation is known.'],
  ],
  'subqueries-and-existence': [
    ['Scalar subquery', 'A parenthesized query used where one scalar value is expected. It may return zero or one row; more than one row is an error. A zero-row scalar subquery yields NULL.'],
    ['Single-row subquery', 'Returns at most one row in a scalar context, either by its data guarantee or an explicit aggregate or limiting rule. Do not assume a nonaggregate query is single-row without a uniqueness guarantee.'],
    ['Multirow subquery', 'Returns a set of rows for operators such as IN, EXISTS, ANY, or ALL, or a table expression in FROM. Its cardinality and NULL contents affect predicate meaning.'],
    ['Correlated subquery', 'References a column from an outer query scope. It expresses a per-outer-row relationship logically, but SQL Server may transform it into a join or another plan; do not assume it literally executes once per row.'],
    ['Uncorrelated subquery', 'Does not reference an outer row and has the same logical input for each outer row. The optimizer controls whether and how its result is computed or reused.'],
    ['EXISTS subquery', 'Tests whether the subquery produces any row. The selected values do not matter, so SELECT 1 is a common convention; NULL in the select list does not prevent a row from existing.'],
    ['NOT EXISTS subquery', 'Tests that no row satisfies the correlated subquery. It is a robust anti-match pattern when the inner key may be NULL, provided the correlation predicate reflects the intended null semantics.'],
    ['IN subquery', 'Tests whether an expression equals any value produced by a single-column subquery. If no match exists but the subquery contains NULL, the predicate can be UNKNOWN rather than FALSE.'],
    ['NOT IN subquery', 'Negates membership, but a NULL returned by the subquery can make otherwise unmatched comparisons UNKNOWN and remove outer rows in WHERE. Filter out NULL deliberately or use a correctly correlated NOT EXISTS.'],
    ['NULL in NOT IN result', 'If the inner result has NULL and no equal value, three-valued logic can make NOT IN UNKNOWN. The outer WHERE discards UNKNOWN, which can make a query unexpectedly return no unmatched rows.'],
    ['ANY quantified comparison', 'ANY is TRUE when the comparison is TRUE for at least one subquery value; SOME is its synonym. An empty set yields FALSE, while unresolved NULL comparisons can yield UNKNOWN if no comparison is TRUE.'],
    ['SOME quantified comparison', 'SOME is a synonym for ANY in quantified subquery comparisons. It requires one qualifying comparison, not every comparison; an empty set yields FALSE.'],
    ['ALL quantified comparison', 'ALL is TRUE only when the comparison is TRUE for every returned value. For an empty result, this universal condition is true; NULL comparisons can produce UNKNOWN when no comparison is false.'],
    ['Subquery in SELECT list', 'A subquery in a select expression must provide a scalar result for each output row. Correlated scalar subqueries can be useful for a single related value, but a join or APPLY may express multirow relationships more clearly.'],
    ['Subquery in WHERE', 'A WHERE subquery commonly supplies membership, quantified comparison, or existence logic. Choose the operator based on whether the requirement is scalar comparison, set membership, or merely the existence of a matching row.'],
    ['Subquery in FROM', 'A subquery in FROM is a derived table and must have an alias. Its columns become inputs to the outer query; it is not inherently materialized.'],
    ['Derived table', 'A named-alias wrapper around a query expression inside FROM. It creates a query scope for projection and filtering, but does not promise storage or evaluation order.'],
    ['EXISTS versus join row multiplication', 'EXISTS asks whether at least one match exists and keeps an outer row once. A join emits one row per matching pair, so a one-to-many relation can multiply outer rows; use EXISTS when only existence is needed.'],
    ['Scalar subquery cardinality error', 'A scalar subquery returning multiple rows raises an error at execution. Fix the data constraint, aggregate intentionally, or rewrite the requirement; TOP (1) without a meaningful ORDER BY merely hides ambiguity.'],
    ['Nested subquery', 'A subquery may appear inside another subquery. SQL Server permits up to 32 nesting levels, though available memory and query complexity can make the practical limit lower. Deeper nesting can obscure correlation scope; name each query role and consider a join or CTE when it makes the relationship clearer.'],
    ['Subquery decorrelation', 'The optimizer can transform some correlated subqueries into joins or semi/anti-semi operations while preserving semantics. This is plan-dependent; write for clear meaning and inspect plans when performance matters.'],
  ],
  'common-table-expressions': [
    ['WITH common_table_expression', 'Introduces one or more named query expressions for the single following statement. In SQL Server, a preceding statement must end with a semicolon in the same batch. The CTE definition cannot nest another WITH-defined CTE, and its query cannot use INTO, OPTION, or FOR BROWSE; ORDER BY is restricted unless TOP or OFFSET/FETCH is also present.'],
    ['CTE column-name list', 'An optional ordered list that assigns names to the CTE result columns. Its count must match the query output and its names must be unique within the CTE.'],
    ['Nonrecursive CTE', 'A named query expression that does not reference itself. It improves organization and can separate logical steps, but it is not a temporary stored result by definition.'],
    ['Multiple CTE definitions', 'Several CTEs can be declared in one WITH clause, separated by commas, then consumed by the single following statement. Use distinct names and keep dependencies readable.'],
    ['CTE dependency ordering', 'A CTE may reference itself and earlier CTEs in the same WITH clause; a forward reference to a later CTE is not allowed. Order definitions from prerequisites to consumers.'],
    ['Recursive CTE anchor member', 'The anchor query supplies the initial rows and does not reference the CTE itself. It runs first and establishes the starting frontier for recursive expansion.'],
    ['Recursive CTE recursive member', 'The recursive query references the CTE and derives the next rows from the prior iteration. Corresponding columns must have the same data types as the anchor; SQL Server also applies recursion restrictions. Design a clear next-step relation.'],
    ['UNION ALL recursion separator', 'The last anchor member and first recursive member must be joined with UNION ALL; UNION ALL is also the only separator allowed between multiple recursive members. Anchor members can use other set operators. Recursive UNION ALL preserves every produced row, so duplicate and cycle control must be deliberate.'],
    ['Recursive CTE termination condition', 'Recursion stops when an iteration returns no rows, or when the configured recursion limit is reached. A cyclic relationship may never naturally terminate, so the query needs cycle handling or an appropriate limit.'],
    ['MAXRECURSION query hint', 'OPTION (MAXRECURSION n) on the outer statement limits recursion levels; it cannot be placed inside the CTE definition. SQL Server default is 100, and valid explicit values are 0 through 32767. A limit detects runaway depth but does not make cyclic results correct.'],
    ['Recursive CTE cycle prevention', 'Carry a visited-path or other cycle-detection state and refuse to revisit a key. A depth limit alone only stops expansion after a threshold; it does not identify a cycle or guarantee complete results.'],
    ['Recursive member restrictions', 'SQL Server forbids SELECT DISTINCT, GROUP BY, PIVOT (at compatibility level 110 or higher), HAVING, scalar aggregation, TOP, LEFT/RIGHT/OUTER JOIN, subqueries, and a hint applied to the recursive CTE reference inside a recursive member. INNER JOIN is allowed. Put restricted shaping in an outer query or a separate nonrecursive step when appropriate.'],
    ['CTE scope is one statement', 'A CTE is scoped to the single SELECT, INSERT, UPDATE, MERGE, or DELETE statement immediately following its WITH clause; it can also appear inside the defining SELECT of CREATE VIEW. It is not a session variable or reusable object.'],
    ['CTE is not automatically materialized', 'Microsoft documents CTE results as not materialized: each outer reference requires the CTE definition to be re-executed. The optimizer can transform the plan, but the name is not a storage or cache contract. Use a temporary table when a separately stored and indexed intermediate is required.'],
    ['CTE versus derived table', 'Both can name a query expression for one statement. A CTE gives a reusable name within that statement and supports recursion; a derived table is local to one FROM position. Neither inherently materializes rows.'],
    ['CTE versus temporary table', 'A temporary table is a separately created stored intermediate that can be indexed and reused across statements, with tempdb and lifecycle costs. A CTE is a single-statement query expression without that storage guarantee.'],
    ['CTE versus view', 'A view is a persistent database object whose definition can be referenced by later statements; a CTE is a statement-local name. A view does not automatically materialize either, unless a separately defined indexed-view mechanism applies.'],
    ['Recursive hierarchy traversal', 'A recursive CTE can walk an adjacency list such as employee-to-manager or parent-to-child. It can have multiple anchor and recursive members, but all anchors precede recursive members. Define the anchor, next-edge join, depth or path state, cycle policy, and result ordering separately.'],
    ['Anchor and recursive type compatibility', 'Corresponding anchor and recursive member columns must have matching data types. Cast both sides deliberately, especially for growing path strings and numeric depth, to prevent type errors or truncation. SQL Server marks recursive CTE output columns nullable.'],
    ['MAXRECURSION 0 unlimited boundary', 'MAXRECURSION 0 removes the recursion-level limit. It is not a cycle-prevention feature; an accidental cycle can run until another resource or query limit stops it, so use only with a proven termination rule.'],
  ],
};

const contexts = {
  'join-forms-and-row-preservation': {
    mental: 'A join is a rule for pairing rows, not a promise that each left row remains one result row. Inner joins keep matching pairs, outer joins also preserve selected unmatched sides, CROSS JOIN creates every pair, and APPLY evaluates a dependent right-side table expression per left row.',
    comparison: 'INNER JOIN removes unmatched rows; LEFT OUTER JOIN preserves the left side and adds NULLs when no match exists. CROSS APPLY removes a left row when its right expression is empty; OUTER APPLY keeps it. PIVOT aggregates rows into fixed output columns; UNPIVOT changes selected columns into rows and drops NULL input cells. A join matches pairs, while EXISTS tests whether a match exists without multiplying the outer row.',
    code: `SELECT c.CustomerId, c.Name, o.OrderId, o.Status
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open'
ORDER BY c.CustomerId, o.OrderId;`,
    explanation: 'The status restriction defines which orders count as matches. A customer with no open order remains and has NULL order columns. Moving the status condition to WHERE would discard those null-extended customer rows.',
    mistakes: ['Moving a right-side ON restriction into WHERE while expecting all left rows to remain.', 'Assuming a one-to-many join returns one row per parent.', 'Using a join when only existence is needed and then hiding multiplication with DISTINCT.', 'Treating NULL-extended columns as proof the base column is nullable.', 'Using CROSS JOIN without estimating the product cardinality.', 'Assuming APPLY or a correlated subquery must physically execute once per row.'],
  },
  'set-operators': {
    mental: 'A set operator combines compatible result rows vertically. Every operand must project the same number of columns in matching positions. UNION and UNION ALL append; INTERSECT and EXCEPT compare complete tuples.',
    comparison: 'UNION removes duplicate tuples; UNION ALL preserves every occurrence. INTERSECT returns distinct shared rows; EXCEPT returns distinct left-only rows. A JOIN pairs columns horizontally based on a relationship and can multiply rows.',
    code: `SELECT CAST(c.CustomerId AS bigint) AS EntityId, N'customer' AS EntityType
FROM dbo.Customers AS c
UNION ALL
SELECT CAST(s.SupplierId AS bigint), N'supplier'
FROM dbo.Suppliers AS s
ORDER BY EntityType, EntityId;`,
    explanation: 'Both branches return two corresponding columns. The explicit cast documents a shared result type; column names come from the first branch. UNION ALL retains rows even if values happen to be equal.',
    mistakes: ['Matching columns by name instead of position.', 'Using UNION when repeated row occurrences are meaningful.', 'Assuming set-operation input or branch order is output order.', 'Ignoring implicit type conversion, precision, or collation conflicts.', 'Forgetting INTERSECT binds before UNION and EXCEPT.'],
  },
  'subqueries-and-existence': {
    mental: 'A subquery can contribute one scalar value, a set of values, a table-shaped source, or an existence test. Pick the operator from the shape and question; NULL and cardinality are part of the semantics.',
    comparison: 'EXISTS asks whether any matching row exists and keeps an outer row once; a JOIN produces one row per matching pair. IN tests membership but can become UNKNOWN when NULL participates; NOT EXISTS avoids that particular poisoning when its correlation expresses the intended rule.',
    code: `SELECT c.CustomerId, c.Name
FROM dbo.Customers AS c
WHERE EXISTS
(
    SELECT 1
    FROM dbo.Orders AS o
    WHERE o.CustomerId = c.CustomerId
      AND o.Status = N'Open'
);`,
    explanation: 'The query returns each qualifying customer once even if that customer has many open orders. The inner SELECT values are irrelevant; the predicate is true when the subquery has at least one qualifying row.',
    mistakes: ['Assuming scalar subqueries silently choose one row when several exist.', 'Using NOT IN when the subquery can return NULL.', 'Replacing EXISTS with a one-to-many join and overlooking row multiplication.', 'Assuming a correlated subquery must be executed literally once per outer row.', 'Treating a CTE or subquery as a materialization or performance guarantee.'],
  },
  'common-table-expressions': {
    mental: 'A CTE gives a name to a query expression for one following statement. A recursive CTE adds a base result and repeatedly derives another level. Termination, type compatibility, cycle handling, and output ordering are separate responsibilities.',
    comparison: 'A CTE is a statement-scoped query name, a derived table is local to one FROM position, and a temporary table is stored and can be indexed or reused. Naming a query with a CTE does not promise materialization or better performance.',
    code: `;WITH Reports (EmployeeId, ManagerId, Depth) AS
(
    SELECT e.EmployeeId, e.ManagerId, 0
    FROM dbo.Employees AS e
    WHERE e.ManagerId IS NULL

    UNION ALL

    SELECT child.EmployeeId, child.ManagerId, parent.Depth + 1
    FROM dbo.Employees AS child
    INNER JOIN Reports AS parent
      ON child.ManagerId = parent.EmployeeId
)
SELECT EmployeeId, ManagerId, Depth
FROM Reports
ORDER BY Depth, ManagerId, EmployeeId
OPTION (MAXRECURSION 100);`,
    explanation: 'The anchor selects roots; each recursive step finds their children. The integer literal and increment expression both produce int for the depth column. MAXRECURSION limits runaway depth, while correctness still depends on the hierarchy being acyclic or on explicit cycle prevention.',
    mistakes: ['Thinking a CTE is a temporary table or is evaluated exactly once.', 'Omitting a recursive stop condition or cycle policy.', 'Using MAXRECURSION 0 as a cycle safeguard.', 'Mismatching anchor and recursive data types.', 'Assuming recursion order defines final row order.', 'Forgetting a CTE is available only to the immediately following statement.'],
  },
};

const allItems = manifest.inventory.flatMap(group => group.items);
const sourceList = Object.entries(urls).map(([name, url]) => `- [Microsoft Learn: ${name}](${url})`).join('\n');
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').trim();
const row = (groupId, item) => {
  const entry = definitions[groupId].find(([name]) => name === item);
  if (!entry) throw new Error(`Missing authored explanation: ${groupId} / ${item}`);
  return `| \`${esc(item)}\` | ${esc(entry[1])} |`;
};
await fs.mkdir('course/lessons/t03-004', { recursive: true });
const write = async (name, content) => fs.writeFile(`course/lessons/t03-004/t03-004-${name}.md`, `${content.trim()}\n`);
const topic = manifest.title;

const overview = `# ${topic} — Big-picture orientation and mental model

# Problem and purpose

Relational queries often need to combine related rows, compare two result sets, ask a question about related data, or name a reusable step. SQL Server provides joins and APPLY for row composition, set operators for row-set comparison, subqueries for scalar/set/existence relationships, and CTEs for statement-local query structure and recursion.

# Plain-language mental model

Think first about the shape you need. A join pairs rows and can increase row count. An outer join also preserves rows that lack a qualifying match. PIVOT summarizes rows into fixed output columns; UNPIVOT turns selected columns into rows. A set operator stacks or compares complete result rows. A subquery supplies a value, a row set, a table-shaped input, or a yes/no existence condition. A CTE gives a query step a name; recursion repeatedly finds the next level of a relationship.

These are different relational tools. Choosing among them requires deciding whether unmatched rows remain, whether duplicate occurrences matter, whether one or many values are legal, and whether the result is one row per entity or one row per relationship.

# How the parts fit together

1. Specify the result grain: what one output row represents.
2. Select row sources and a matching or correlation rule.
3. Decide which side(s) must survive when no match exists.
4. Check whether one source row can match several rows and multiply output.
5. For set operations, align every projected column by position and type.
6. For subqueries, choose scalar, membership, quantified, or existence semantics.
7. Use CTEs to name query steps; add anchor, recursive step, and safe termination for a recursive CTE.
8. Add an outer ORDER BY only when result order is part of the requirement.

# Concept map

| Need | Natural construct | Main question |
| --- | --- | --- |
| Combine related row columns | JOIN | What constitutes a matching pair, and how many matches can exist? |
| Preserve rows without a match | LEFT/RIGHT/FULL JOIN or OUTER APPLY | Which input must survive, and where do match conditions belong? |
| Evaluate a dependent table expression | APPLY | Does the right side depend on the current left row? |
| Append or compare row sets | UNION / INTERSECT / EXCEPT | Do duplicate occurrences matter, and are columns aligned? |
| Ask whether a related row exists | EXISTS / NOT EXISTS | Is only existence needed, without projecting each match? |
| Reuse a query name in one statement | CTE | Is a named step enough, or is stored intermediate data required? |
| Walk a hierarchy | Recursive CTE | What is the base set, next step, and cycle/termination policy? |

# End-to-end walkthrough

To list every customer with any open order, use EXISTS so a customer remains once even with many matching orders. To show details for all orders, use a JOIN and accept one output row per order. To show customers even when none have an open order, use a LEFT JOIN and put the open-status condition in ON. These three requirements differ in output grain and row preservation, so replacing one construct with another can change the result even if a small sample happens to look similar.

For a hierarchy, start with roots in the anchor member, find children from the preceding level in the recursive member, and stop when no next rows exist. A cycle can prevent natural termination; a recursion limit is a safety cap, not a proof that the hierarchy is valid.

# When to use it and tradeoffs

Use JOIN when matching rows and projecting both sides is the goal; use EXISTS when only a yes/no match is needed. Use UNION ALL when occurrences should be preserved; use duplicate-removing set operators only when distinct tuple semantics are intended. Use scalar subqueries only when at most one row is guaranteed. Use a CTE for readable one-statement structure, and a temporary table when a persisted, indexed, multi-statement intermediate is genuinely needed.

# What later lessons cover

Four reference lessons cover join row preservation and APPLY, set operators, subquery shapes and NULL behavior, and CTE scope and recursion. The practice lesson combines these decisions in realistic queries; the interview lesson focuses on cardinality, semantics, and termination reasoning.

# Sources

${sourceList}
`;
await write('overview', overview);

const concepts = `# ${topic} — Core concepts and how they fit together

# Learning objectives

Predict row preservation and cardinality; choose among joins, APPLY, set operators, subqueries, and CTEs; explain NULL and duplicate semantics; and design a recursive query with explicit type, cycle, depth, and ordering rules.

# Prerequisites

Know tables, keys, SELECT, WHERE, NULL, and basic data types. Aggregation, window functions, pagination, and plan tuning have dedicated topics; this lesson uses only enough context to explain relational composition.

# Core concepts

## Start with output grain and cardinality

Before writing a join, define what one result row represents. If a customer has three orders, joining customer to order yields three rows for that customer. This is expected one-to-many multiplication. If the requirement is one customer row when at least one order exists, EXISTS communicates that requirement without multiplying. DISTINCT is not a general repair for an incorrect grain: it can erase meaningful differences.

Join predicates define matches. INNER JOIN returns matching pairs. LEFT JOIN retains every left row and null-extends the right side when no right row satisfies ON; RIGHT JOIN preserves right, and FULL JOIN preserves both. For outer joins, a condition in ON decides which rows match. A WHERE predicate is applied to the joined result and can discard a null-extended row. Test the case where there are no matches and the case where rows exist but fail the condition; they are not always equivalent.

## APPLY is a dependent row source

CROSS APPLY and OUTER APPLY express a right-side table expression that can reference preceding left-side columns. CROSS APPLY omits a left row when the right side is empty; OUTER APPLY preserves it with NULLs. APPLY is useful for a correlated table-valued function or derived query. This is logical semantics; the optimizer may transform execution.

## PIVOT and UNPIVOT reshape table-valued inputs

PIVOT uses an aggregate over a value column, turns a pivot-column value list into fixed output columns, and groups implicitly by every other input column. Keep the source subquery narrow or extra columns silently change the grouping grain. The IN list is part of the query shape, not an automatic discovery of future values. An empty pivot subgroup is NULL, except a count aggregate returns zero. UNPIVOT selects input columns to turn into name/value rows; it drops rows for NULL cells and is not a lossless inverse after aggregation. UNPIVOT's emitted identifiers use catalog collation, which can conflict when combined with other text. [Microsoft Learn: PIVOT and UNPIVOT](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17)

## Set operations compare complete tuples

UNION and UNION ALL stack rows. INTERSECT and EXCEPT compare complete projected tuples. Corresponding columns are matched by position, must be compatible, and may undergo implicit conversion. SQL Server takes result names from the first operand. UNION, INTERSECT, and EXCEPT remove duplicates; UNION ALL preserves occurrences. Set duplicate comparison treats two NULLs as equal, even though ordinary equality predicates with NULL yield UNKNOWN. INTERSECT has higher precedence than UNION and EXCEPT; parentheses make grouping explicit. [Microsoft Learn: UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17) [Microsoft Learn: EXCEPT and INTERSECT](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17)

## Subquery shape determines its contract

A scalar subquery returns one column and at most one row in its scalar context: zero rows becomes NULL, multiple rows raise an error. IN/ANY/ALL consume a single-column set; EXISTS only asks if there is a row. NOT IN has a NULL trap; NOT EXISTS avoids poisoning from an unrelated inner NULL when the correlation expresses the desired match. A JOIN can multiply outer rows while EXISTS retains each qualifying outer row once.

Correlated describes a dependency on an outer query value, not a physical promise to execute repeatedly. The optimizer can decorrelate or otherwise transform an equivalent query. Do not choose between forms based on assumptions about a specific execution algorithm; clarify semantics first, measure plans when performance matters. [Microsoft Learn: Subqueries](https://learn.microsoft.com/en-us/sql/relational-databases/performance/subqueries?view=sql-server-ver17)

## CTEs name statement-local query expressions

A CTE is visible to the immediately following statement. It can make a multi-step query readable, and a recursive CTE can expand a hierarchy. A CTE is not automatically materialized or evaluated once. A temporary table has a different storage and lifecycle contract; a view is a persistent database object.

Recursive execution begins with anchor rows, then repeatedly applies a recursive member to the previous iteration. UNION ALL separates the last anchor from the first recursive member. Output column types must match, and recursive members have restrictions. Natural termination occurs when an iteration returns no rows. A cycle-prevention rule is separate from MAXRECURSION; setting MAXRECURSION 0 removes the depth limit and can allow unbounded recursion. [Microsoft Learn: CTEs](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17) [Microsoft Learn: Recursive CTEs](https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17)

# Mechanisms and relationships

| Construct | Result shape | Duplicate/cardinality concern | Empty or unmatched behavior |
| --- | --- | --- | --- |
| INNER JOIN | Matching row pairs | One-to-many matches multiply rows | Unmatched rows disappear |
| LEFT JOIN | Matching pairs plus preserved left rows | Several matches still multiply | Missing right columns become NULL |
| EXISTS | Outer rows satisfying existence | Keeps outer row once | No match makes predicate false |
| UNION ALL | Rows stacked | Every occurrence retained | Empty input contributes no rows |
| UNION / INTERSECT / EXCEPT | Distinct tuples | Duplicate elimination applies | Set operation follows its definition |
| Scalar subquery | One scalar per outer row | More than one row is an error | Zero rows yields NULL |
| Recursive CTE | Anchor plus iterative levels | Duplicate/cycle policy matters | Stops when recursive member returns no rows |

# Worked examples

### Preserve a customer while restricting matching orders

\`\`\`sql
SELECT c.CustomerId, o.OrderId
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open';
\`\`\`

An unmatched customer remains. If the status predicate were in WHERE, its NULL result for that customer would be rejected.

### Compare sets while keeping duplicates

\`\`\`sql
SELECT CustomerId FROM dbo.CurrentSubscribers
UNION ALL
SELECT CustomerId FROM dbo.ArchivedSubscribers;
\`\`\`

The result includes every row occurrence from both sources. UNION would instead remove repeated values from the combined result.

### Traverse a hierarchy

The overview’s recursive example starts with employees whose manager is NULL and repeatedly joins employees to the preceding level. Depth is explicitly typed, while cycle detection and an outer ORDER BY are separate concerns.

# Misconceptions and edge cases

- An outer join does not preserve the nullable side after a WHERE filter rejects its NULL-extended rows.
- A join is not inherently one row per entity; cardinality follows the match relation.
- UNION ALL is not the same as UNION, even when test data contains no duplicates.
- Set operators align columns by position, not aliases.
- EXISTS ignores the subquery select-list values; a JOIN may multiply rows.
- A scalar subquery returning multiple rows is an error, not an arbitrary choice.
- A CTE name does not guarantee storage, caching, or a single evaluation.
- MAXRECURSION is a limit, not cycle detection; zero means no recursion limit.
- Recursive output order is unspecified without a final ORDER BY.

# Knowledge checks with answers

1. **Why can a LEFT JOIN lose left rows after a WHERE predicate?** Null-extended columns make ordinary predicates UNKNOWN or FALSE, which WHERE rejects.
2. **When is EXISTS preferable to a join?** When the requirement is whether a related row exists and each qualifying outer row should appear once.
3. **Do UNION operands align columns by name?** No; position and compatible types govern.
4. **What happens to a scalar subquery with no rows or multiple rows?** It yields NULL for no row; multiple rows cause a scalar-subquery error.
5. **Does a CTE guarantee materialization?** No.
6. **What does MAXRECURSION 0 do?** It removes the recursion depth limit, not cycles.

# Sources

${sourceList}
`;
await write('concepts', concepts);

for (const group of manifest.inventory) {
  const context = contexts[group.id];
  if (!context) throw new Error(`Missing group context: ${group.id}`);
  const rows = group.items.map(item => row(group.id, item)).join('\n');
  const pivotExamples = group.id === 'join-forms-and-row-preservation' ? [
    '',
    '## PIVOT a rowset into fixed month columns',
    '',
    '```sql',
    'SELECT CustomerId, [Jan], [Feb]',
    'FROM',
    '(',
    '    SELECT CustomerId, MonthName, Amount',
    '    FROM dbo.MonthlySales',
    ') AS src',
    'PIVOT',
    '(',
    '    SUM(Amount) FOR MonthName IN ([Jan], [Feb])',
    ') AS p;',
    '```',
    '',
    'The source query projects only the desired grouping key, pivot column, and value column. Any other source column would become an additional implicit grouping key. Months not listed in IN do not become output columns; an empty listed subgroup yields NULL for SUM.',
    '',
    '## UNPIVOT selected columns into rows',
    '',
    '```sql',
    'SELECT CustomerId, MonthName, Amount',
    'FROM dbo.MonthlyTotals',
    'UNPIVOT',
    '(',
    '    Amount FOR MonthName IN ([Jan], [Feb])',
    ') AS u;',
    '```',
    '',
    'Input cells containing NULL do not produce rows. MonthName contains the source-column names and follows catalog collation; resolve collation if it is combined with differently collated text.'
  ].join('\n') : '';
  const checks = group.items.map((item, index) => `${index + 1}. **What does \`${item}\` mean in this group?** See its exact row above; reason about output grain, row preservation, duplicates, cardinality, and NULL behavior before choosing it.`).join('\n');
  const ref = `# ${topic} — Reference: ${group.title}

# Scope and version

This reference explains all ${group.items.length} supplied names in **${group.title}** for SQL Server 2025 (17.x) T-SQL. It stays within this group’s boundary and uses SQL Server behavior rather than assuming that a relational concept implies a particular physical plan.

# How this group fits the mental model

${context.mental}

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
${rows}

# Cross-item comparison

${context.comparison}

# Examples

\`\`\`sql
${context.code}
\`\`\`

${context.explanation}

${pivotExamples}


# Common mistakes

${context.mistakes.map(mistake => `- ${mistake}`).join('\n')}

# Knowledge checks with answers

${checks}

# Sources

${sourceList}
`;
  await write(`reference-${group.id}`, ref);
}

const practice = `# ${topic} — Exercises and worked solutions

# Goals

Choose query shapes from a requirement, preserve exactly the intended rows, reason about duplicate and NULL behavior, and design a recursive query with safe types and termination.

# Worked example

Requirement: return every customer who has at least one open order, once per customer.

\`\`\`sql
SELECT c.CustomerId, c.Name
FROM dbo.Customers AS c
WHERE EXISTS
(
    SELECT 1
    FROM dbo.Orders AS o
    WHERE o.CustomerId = c.CustomerId
      AND o.Status = N'Open'
);
\`\`\`

EXISTS expresses the yes/no requirement and avoids multiplying one customer by several matching orders. If the requirement were to display each order, a join would be appropriate instead.

# Exercises

1. Return all customers, including those without an open order, and show matching open order IDs when present. Explain why the status condition belongs where you put it.
2. A customer can have many orders. Return one customer row if any order exceeds a threshold; compare EXISTS with JOIN.
3. Combine current and archived contact rows while preserving repeated occurrences. The identifier columns differ in integer type; make the result type explicit.
4. Return unique product IDs present in both current and previous inventory snapshots. Explain how NULLs and duplicate occurrences are handled.
5. Return products absent from a nullable discontinued-products list. Avoid NOT IN null poisoning and state how NULL product keys should behave.
6. A scalar subquery is intended to return one employee by email, but duplicate email rows exist. Explain the runtime behavior and how a data uniqueness rule could make the scalar contract valid.
7. Build a recursive query that starts at root employees and returns descendants with a depth. Explain the anchor, recursive join, type matching, termination, cycle policy, and output order.
8. A recursive query reports a maximum-recursion error at level 100. Explain the default and give a safe response; distinguish raising/removing the cap from preventing cycles.
9. A CTE is referenced twice and the team assumes its output is cached. Explain the guarantee and identify when a temporary table may be the right design.
10. Summarize monthly sales into fixed Jan/Feb columns with PIVOT. Identify the grouping key, pivot column, value column, and what happens when a source subquery accidentally includes Region.
11. Turn Jan/Feb columns back into month/value rows with UNPIVOT. Explain what happens to NULL cells and why this may not reconstruct the original rows.

# Progressive hints

1. Use a left-preserving row source and define an open order as a match.
2. EXISTS asks only whether at least one match exists; a join emits one row per match.
3. Set operands align by position; cast corresponding types.
4. INTERSECT compares complete tuples with distinct semantics.
5. Use a correlated NOT EXISTS and decide whether NULL outer keys can match.
6. Use a scalar aggregate, a uniqueness guarantee, or deterministic ordering and row limit according to the requirement.
7. Start with roots, then join each employee to the previous level’s employee key.
8. Default MAXRECURSION is 100. First establish whether legitimate depth or a cycle caused the limit.
9. A CTE is a statement-local expression, not a storage contract.
10. Keep only the intended grouping key plus month and amount in the pivot source; an extra Region column becomes a grouping key.
11. UNPIVOT emits one row per non-NULL selected cell, with the original column name in the pivot-column output.

# Complete solutions

1. Use LEFT JOIN with the right-side status condition in ON:

\`\`\`sql
SELECT c.CustomerId, o.OrderId
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
  ON o.CustomerId = c.CustomerId
 AND o.Status = N'Open';
\`\`\`

Customers without an open order remain with NULL OrderId. Putting o.Status = N'Open' in WHERE would reject those rows.

2. Use EXISTS when only customer qualification is required. A JOIN would return one customer row per matching order unless the result were intentionally aggregated or deduplicated; DISTINCT is not a substitute for deciding the desired grain.

3. Use UNION ALL with explicit casts in each branch to the intended common identifier type. This retains every source occurrence; UNION would remove duplicate projected rows. Name the output in the first SELECT.

4. Use \`SELECT ProductId FROM CurrentInventory INTERSECT SELECT ProductId FROM PreviousInventory\`. INTERSECT returns each common projected value once, and two NULL values compare equal for set semantics. If the product key is nullable and NULL does not represent a real product, filter it out explicitly.

5. Use \`WHERE NOT EXISTS (SELECT 1 FROM dbo.DiscontinuedProducts AS d WHERE d.ProductId = p.ProductId)\`. An unrelated NULL in the inner relation cannot poison the result. With ordinary equality, an outer NULL key finds no match; if the domain treats two missing keys as equal, express that null-safe rule explicitly.

6. If only the most recent date is needed, use \`SELECT MAX(o.OrderDate) FROM dbo.Orders AS o WHERE o.CustomerId = c.CustomerId\`; an aggregate returns one scalar value (NULL when no qualifying non-NULL date exists). If the requirement needs columns from one latest order, use a correlated ordered row source such as OUTER APPLY with TOP (1) and a deterministic tie-breaker. TOP (1) without a meaningful ORDER BY selects an unspecified row.

7. The recursive pattern is the overview example: anchor at ManagerId IS NULL, recurse by child.ManagerId = parent.EmployeeId, carry an integer Depth with the same type in both members, and use a hierarchy invariant or explicit path/visited-state check to prevent revisits. Natural recursion ends when no children are produced. Add an outer ORDER BY for presentation; recursive generation order is not a result-order guarantee.

8. SQL Server’s default recursion cap is 100; explicit values range from 0 to 32767, with 0 meaning no limit. Determine whether legitimate depth exceeds the cap or the data contains a cycle. Raise the cap only for known depth; add cycle handling for cyclic data. Unlimited recursion can run without natural termination.

9. A CTE is available to the one following statement and is not promised to be cached or materialized. The optimizer may transform or re-evaluate its expression. If separate materialization, indexes, or reuse across statements is required, create a temporary table and account for its lifecycle and tempdb costs.
10. Use a source subquery with only CustomerId, MonthName, and Amount, then \`PIVOT (SUM(Amount) FOR MonthName IN ([Jan], [Feb]))\`. Region is an implicit grouping column, so including it returns separate rows per customer and region. Only the listed month headings appear; an empty SUM subgroup is NULL.
11. Use \`UNPIVOT (Amount FOR MonthName IN ([Jan], [Feb])) AS u\`. NULL input cells disappear, so the operation cannot preserve a missing-versus-NULL distinction by itself. PIVOT may also have aggregated multiple original rows, so UNPIVOT cannot recover the original row set.

# Tests and edge cases

Include no matches, one and many matches, duplicate keys, NULL join keys, unmatched preserved rows, matched rows that fail an ON restriction, NULLs in IN/NOT IN sources, scalar subqueries returning zero/one/multiple rows, empty quantified sets, duplicate set operands, type and collation conflicts, extra PIVOT source columns, listed pivot values with no rows, NULL aggregate values, UNPIVOT NULL cells and collation, recursive roots with no children, deep trees, self-cycles, longer cycles, anchor/recursive type mismatches, MAXRECURSION boundaries, and multiple CTE references. Verify the intended row grain and counts, not only sample column values.

# Reflection questions

- What does one output row represent?
- Which inputs must survive with no match?
- Can one input row match several rows?
- Does the requirement need a join, existence test, set comparison, or scalar value?
- Are duplicates meaningful, and how are NULLs treated?
- Does a recursive query have both natural termination and cycle handling?
- Is the CTE name being mistaken for a stored result?

# Sources

${sourceList}
`;
await write('practice', practice);

const interview = `# ${topic} — Interview questions and reasoning

# Core questions

Explain how a row is produced, preserved, compared, or recursively derived, and state the output grain before discussing syntax.

# Concise interview answers

1. **INNER versus LEFT JOIN?** INNER returns matching pairs; LEFT also keeps every left row and NULL-extends the right side when no ON match exists.
2. **Why does an outer-join filter in WHERE matter?** WHERE runs on the null-extended result and may discard unmatched preserved rows.
3. **JOIN or EXISTS?** JOIN returns matching pairs and may multiply an outer row; EXISTS tests whether at least one match exists and retains the outer row once.
4. **UNION versus UNION ALL?** UNION removes duplicate full rows; UNION ALL preserves every occurrence.
5. **How are set-operation columns aligned?** By position and compatible type, not by alias.
6. **Why can NOT IN be surprising?** A NULL in its subquery can make an unmatched comparison UNKNOWN.
7. **What is the scalar-subquery cardinality rule?** Zero rows produce NULL; more than one row raises an error.
8. **What does a CTE guarantee?** A name and scope for one following statement, not materialization or single evaluation.
9. **What are recursive CTE parts?** Anchor member, recursive member, UNION ALL transition, and a termination/cycle strategy.
10. **What does MAXRECURSION 0 mean?** No depth limit; it does not prevent cycles.

# Deep follow-up answers

Outer-join ON predicates define qualifying matches; WHERE predicates filter the already formed result. A right-side filter in WHERE can remove null-extended rows. A parent with multiple matching children naturally appears multiple times in a join, so define whether the result grain is the parent or each relationship. EXISTS is appropriate for parent qualification, while a join is appropriate when child values are part of each output row.

Set operations compare projected tuples. Corresponding columns must be in positional agreement and compatible, and implicit type or collation resolution can affect correctness. UNION, INTERSECT, and EXCEPT have distinct semantics; UNION ALL is the occurrence-preserving append. ORDER BY after a set operation orders the combined result.

Subquery syntax describes a relationship, not a fixed execution algorithm. Correlated subqueries may be transformed. Scalar cardinality is a correctness condition; adding TOP (1) without a business ordering makes an arbitrary result look valid. NOT EXISTS handles an inner NULL differently from NOT IN, but outer-key NULL semantics still need a decision.

CTEs are query expressions scoped to one statement (or the defining SELECT of a view). Microsoft documents them as nonmaterialized, with each outer reference requiring the expression again. Recursive CTEs iterate from anchor rows; type alignment, recursive-member restrictions, termination, and cycle detection all matter. MAXRECURSION is a guard on levels. A temporary table is the explicit choice when stored reuse or indexes are part of the design.

# Scenario questions

1. **A LEFT JOIN query loses customers with no order after a status filter is added.** Check whether the right-side condition was put in WHERE; if it defines a qualifying match, move it to ON.
2. **A report has three rows per customer.** Determine whether each customer has three related matches or whether the query omitted a key; do not assume the join is wrong.
3. **A NOT IN query returns no unmatched products after a NULL is added to the lookup.** Explain three-valued logic and rewrite with a correctly correlated NOT EXISTS if appropriate.
4. **A CTE used twice seems expensive.** A CTE gives no cache guarantee; inspect the plan and consider an indexed temporary table if measured reuse is valuable.
5. **A hierarchy query hits MAXRECURSION.** Check legitimate depth and cycles separately; increasing or disabling the cap does not repair a cycle.

# Tradeoffs and alternatives

JOIN is clear for projecting matches; EXISTS avoids multiplicative matches when only existence matters. APPLY expresses a correlated row source; OUTER APPLY preserves a left row when the dependent source is empty. Set operators compare whole rows; joins compare relationships. A CTE improves local structure, while temporary tables provide explicit storage and indexes. Choose by semantics first, then measure physical performance.

# Common weak answers

- “A LEFT JOIN always keeps all left rows,” without checking WHERE.
- “DISTINCT fixes duplicate rows,” without identifying the intended grain.
- “UNION ALL is just a faster UNION,” ignoring changed duplicate semantics.
- “IN and EXISTS always behave identically,” ignoring NULL and cardinality.
- “A scalar subquery returns the first row.”
- “The CTE is materialized because it has a name.”
- “MAXRECURSION 0 fixes the recursion error.”
- “Recursive results are already in tree order.”

# Self-check rubric

Score 0–2 for each: output grain; match and preservation semantics; duplicate/cardinality behavior; NULL handling; set-operation type/position rules; subquery cardinality; CTE scope/materialization; recursion types, cycles, and limits. A strong answer separates relational meaning from optimizer implementation.

# Sources

${sourceList}
`;
await write('interview', interview);

console.log(`Wrote overview, concepts, ${manifest.inventory.length} exact-inventory references, practice, and interview; ${allItems.length} manifest items are required.`);



