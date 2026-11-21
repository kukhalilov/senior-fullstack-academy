import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-003.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const selectUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17';
const searchUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17';
const logicalUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/logical-operators-transact-sql?view=sql-server-ver17';
const precedenceUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17';
const likeUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17';
const orderUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17';
const topUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17';
const distinctUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17';
const regexpUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17';
const isolationUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17';
const unionUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17';
const allUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/all-transact-sql?view=sql-server-ver17';
const anyUrl = 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/some-any-transact-sql?view=sql-server-ver17';
const versionUrl = 'https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17';

const latestSources = [likeUrl, precedenceUrl, isolationUrl, unionUrl, allUrl, anyUrl];
manifest.sourceSnapshot = {
  ...manifest.sourceSnapshot,
  edition: 'SQL Server 2025 (17.x), current Transact-SQL SELECT surface checked 2026-11-16; SQL Server 2022 and 2025 predicate additions verified against current Microsoft Learn references',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...latestSources])],
};
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), ...latestSources])];
if (manifest.versionNotes[0]) {
  manifest.versionNotes[0].sourceUrls = [...new Set([...manifest.versionNotes[0].sourceUrls, ...latestSources])];
}

const definitions = {
  'select-query-shape-and-projection': {
    'SELECT statement': 'The T-SQL statement that retrieves a result set. It combines a query expression with optional ordering and other clauses; its written clause order is grammar, not a promise about physical execution order.',
    'SELECT query expression': 'The result-producing expression, which may be one query specification or query specifications combined by set operators. Parentheses can group a query expression; set-operation output is one result shape.',
    'SELECT query specification': 'One SELECT branch that describes a projection and optional source, filter, grouping, and related clauses. In this topic the important separation is its select list, FROM table source, WHERE filter, and result-order/limit stage.',
    'SELECT [ALL]': 'The default duplicate-preserving projection. \`ALL\` may be written explicitly, but omitting it has the same duplicate-retaining effect; duplicate result rows are not automatically removed.',
    'SELECT DISTINCT': 'Removes duplicate rows from the projected result, comparing the entire selected row. It does not deduplicate a source table or choose an arbitrary representative source row; every selected expression participates.',
    'Select list': 'The comma-separated expressions that define result columns, their values, and optionally their output labels. Its shape determines the result metadata and interacts with DISTINCT and set-operation compatibility.',
    'Select-list column expression': 'A column reference or expression derived from a source column, such as `o.OrderDate` or `o.Total * 1.1`. Qualify a name when more than one source could supply it.',
    'Select-list scalar expression': 'An expression evaluated to one scalar result for each row in the current query result. It can combine constants, columns, operators, and scalar functions; it is not a separate source row or a predicate.',
    'Select-list alias': 'The output label assigned to a select-list expression. It is available to the later ORDER BY binding stage, but not to the earlier WHERE stage in the same query specification.',
    'AS column-alias syntax': 'The explicit form `expression AS alias` labels a projected expression. Use AS to make the boundary between the expression and its result name clear; it is optional in some alias forms, but consistency improves review.',
    'Delimited identifier alias': 'An output alias written as a delimited identifier, commonly `[Order Total]` in T-SQL, so it can contain a space or reserved word. Delimiting names is not a substitute for parameterizing data values.',
    'Duplicate projected values versus duplicate source rows': 'Two different source rows may project identical values, and the result can therefore contain repeated-looking rows under ALL. DISTINCT removes identical projected tuples, which can hide source distinctions if the key was not selected.',
    'SELECT * wildcard': 'Expands to all columns from the query source shape. It is convenient for exploration but makes a public result contract fragile: schema additions change output, more data may be read or exposed, and consumers depend on implicit column order.',
    'Qualified wildcard table-alias.*': 'Expands to all columns from the one table source named by its FROM alias. It is less ambiguous than \`*\` in multi-source queries, but still has schema-drift and over-projection risks.',
    'FROM clause table source': 'Introduces the table or other row-producing source from which the query reads. JOIN/APPLY/PIVOT composition is taught elsewhere; a table source supplies names used by the select list and search condition.',
    'Table alias in FROM': 'A query-local name for a table source, such as `FROM dbo.Orders AS o`. Once an alias is assigned, qualify that source’s columns with it when needed; the alias does not rename the stored table.',
    'WHERE clause': 'Filters candidate rows using a search condition before projection and duplicate elimination in SQL Server’s logical binding order. Only TRUE passes; FALSE and UNKNOWN do not. It is for row predicates, not aggregate-group filtering.',
    'Logical SELECT clause processing order': 'SQL Server documents a logical binding sequence that makes FROM/WHERE inputs available before SELECT aliases; ORDER BY is later and may see the alias. This explains name visibility, not the optimizer’s physical operator sequence.',
    'SELECT alias visibility in ORDER BY': 'Because ORDER BY is logically later than SELECT projection, an output alias can be referenced there. Keep the alias standalone when referencing it; Microsoft documents an alias combined inside another ORDER BY expression as invalid for this binding form.',
    'SELECT alias not visible in WHERE': 'WHERE binds before the select list, so the alias is not in scope there. Repeat the expression, use a derived query/CTE boundary, or use an appropriate predicate form; do not rely on a physical plan evaluating projection first.',
    'SELECT result-set order is unspecified without ORDER BY': 'Without a final ORDER BY, SQL Server makes no row-order guarantee, even if current results happen to look sorted or an index scan seems ordered. Storage order and execution-plan order are not result contracts.',
    'UNION-compatible result projection boundary': 'Set-operation branches must project the same number of columns in the same positions with compatible data types. Output names come from the first query; implicit type precedence can convert values, so make casts explicit when shape or precision matters.',
    'ORDER BY ALL is Microsoft Fabric syntax, not SQL Server syntax': 'This spelling is documented for Fabric Data Warehouse and the SQL analytics endpoint, where it sorts by every projected column. It is not part of the SQL Server SELECT grammar; enumerate SQL Server sort keys instead.',
    'QUALIFY is Fabric Data Warehouse syntax, not SQL Server syntax': 'QUALIFY appears in the Fabric Data Warehouse SELECT syntax, not SQL Server’s current query specification. SQL Server code must use supported query structure, such as a derived query and an outer WHERE, when filtering a window result.',
  },
  'where-predicates-and-search-conditions': {
    'Search condition': 'A Boolean composition of predicates used to decide which rows satisfy a WHERE filter. SQL Server conditions can evaluate to TRUE, FALSE, or UNKNOWN, and the optimizer may evaluate expressions in an order different from their textual arrangement.',
    'Boolean TRUE': 'The condition is satisfied; a WHERE clause retains that row. TRUE is not the same as “nonzero” or a truthy programming-language value in T-SQL.',
    'Boolean FALSE': 'The condition is not satisfied; WHERE removes that row. FALSE also results from negating TRUE, but UNKNOWN remains UNKNOWN when negated.',
    'Boolean UNKNOWN': 'The result when a predicate cannot decide TRUE or FALSE, commonly because a comparison operand is NULL. WHERE does not retain UNKNOWN; this is why a missing value is not tested with ordinary equality.',
    'Three-valued logic': 'SQL predicate logic has TRUE, FALSE, and UNKNOWN. NOT UNKNOWN is UNKNOWN; AND/OR use truth tables, so “not matching” is not always the inverse set when NULL participates.',
    'Comparison operator =': 'Tests equality under SQL Server’s data-type conversion and, for strings, collation rules. If either operand is NULL, the result is UNKNOWN; use a null-safe predicate when NULL must compare as a value.',
    'Comparison operator >': 'Tests whether the left expression compares greater than the right after SQL Server’s type and collation rules. NULL yields UNKNOWN; string ordering can be collation dependent.',
    'Comparison operator <': 'Tests whether the left expression compares less than the right. NULL yields UNKNOWN, and text ordering follows the applicable collation rather than a universal alphabet.',
    'Comparison operator >=': 'Tests greater-than-or-equal under the operand types and collation. It remains UNKNOWN if either operand is NULL.',
    'Comparison operator <=': 'Tests less-than-or-equal under the operand types and collation. It remains UNKNOWN if either operand is NULL.',
    'Comparison operator <> (not equal)': 'The standard T-SQL not-equal spelling. It produces UNKNOWN when either operand is NULL, so it does not select rows whose value is missing.',
    'Comparison operator != (non-ISO not equal)': 'A supported SQL Server not-equal spelling with the same comparison behavior as \`<>\`, including UNKNOWN for NULL operands. Prefer the ISO-style spelling for portable SQL text.',
    'Comparison operator !< (non-ISO not less than)': 'The non-ISO spelling for “not less than,” documented as a comparison operator in T-SQL. It is harder to read and less portable; NULL still makes the comparison UNKNOWN.',
    'Comparison operator !> (non-ISO not greater than)': 'The non-ISO spelling for “not greater than,” documented by SQL Server. Prefer conventional comparison forms where they express the intended range more clearly; NULL still yields UNKNOWN.',
    'Logical operator NOT': 'Negates a Boolean condition: TRUE becomes FALSE and FALSE becomes TRUE, while UNKNOWN stays UNKNOWN. It binds more tightly than AND and OR in SQL Server.',
    'Logical operator AND': 'The conjunction is TRUE only when both sides are TRUE. A FALSE side makes it FALSE even if the other is UNKNOWN; otherwise an UNKNOWN side can make the result UNKNOWN.',
    'Logical operator OR': 'The disjunction is TRUE when either side is TRUE. It is FALSE only when both sides are FALSE; an unresolved UNKNOWN may propagate when no side is TRUE.',
    'AND before OR operator precedence': 'SQL Server evaluates NOT before AND before OR in logical binding. Write parentheses around intended groups; the optimizer can reorder physical predicate evaluation, so precedence is not a short-circuit safety mechanism.',
    'Parenthesized search condition': 'Parentheses explicitly group predicates and override operator precedence. They communicate business intent and protect logic when conditions are added later.',
    'BETWEEN and NOT BETWEEN': 'BETWEEN tests an inclusive range: both endpoints are included. NOT BETWEEN negates that predicate, but NULL operands can still yield UNKNOWN; for timestamp day ranges, half-open bounds are often safer than inventing a final time.',
    'IN and NOT IN value-list predicate': 'IN matches when an expression equals a member of the parenthesized list; NOT IN negates the membership result. A NULL in a list can make a nonmatching comparison UNKNOWN and eliminate it from WHERE.',
    'IN and NOT IN subquery predicate': 'The subquery supplies membership values and is evaluated as part of the predicate. NOT IN is especially dangerous if the subquery can return NULL; use NOT EXISTS with a correctly correlated condition when null-safe anti-matching is intended.',
    'EXISTS and NOT EXISTS subquery predicate': 'EXISTS is TRUE when the subquery returns at least one row; NOT EXISTS is true when it returns none. The subquery’s projection values are irrelevant to the existence test, and NULL in the selected expression does not make an existing row disappear.',
    'ANY and SOME quantified comparison': 'ANY and SOME are synonyms: the comparison is TRUE when at least one subquery value makes it TRUE. An empty subquery yields FALSE; if no comparison is true but an unresolved NULL comparison exists, the overall result can be UNKNOWN.',
    'ALL quantified comparison': 'ALL requires the comparison to be TRUE for every returned value. With an empty set, there is no counterexample, so the universal comparison is TRUE; with NULL comparisons and no FALSE result, the result can be UNKNOWN. SQL Server documents the every-pair rule; the empty-set conclusion follows from that universal definition.',
    'IS NULL and IS NOT NULL': 'These predicates test whether an expression is missing or present and always return a definite condition result. They are the ordinary way to filter NULL; \`= NULL\` is not a substitute.',
    'IS DISTINCT FROM and IS NOT DISTINCT FROM': 'SQL Server 2022 added null-safe comparison predicates: they always return TRUE or FALSE, treating two NULLs as not distinct and one NULL versus a non-NULL as distinct. This differs from `=`/\`<>\`, which return UNKNOWN for NULL operands. [Microsoft Learn: IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)',
    'NULL in NOT IN subquery result': 'If a NOT IN subquery returns NULL and no non-NULL value matches, the condition can be UNKNOWN rather than TRUE, so the row is filtered out. Prefer NOT EXISTS when the subquery may contain NULL and an anti-match is intended.',
    'LIKE and NOT LIKE predicate': 'LIKE matches a string against its wildcard grammar; NOT LIKE negates the match under three-valued logic. String type, trailing spaces, and collation can affect results, so a quick pattern is not a regular expression.',
    'LIKE percent wildcard (%)': 'The percent sign matches zero or more characters. `%cat%` can match a substring anywhere; a leading wildcard often prevents a simple left-anchored index seek, so use it knowingly.',
    'LIKE underscore wildcard (_)': 'Underscore matches exactly one character. Escape it when searching for a literal underscore, otherwise a value such as `A_1` is a pattern rather than exact text.',
    'LIKE bracket character class ([...])': 'A bracket expression matches one character from a set or range, such as `[ABC]` or `[A-F]`. Range membership can depend on collation sort rules; it is not the same syntax as a regular expression.',
    'LIKE negated bracket character class ([^...])': 'A bracket class beginning with `^` matches one character outside the listed set or range. The caret is special inside this bracket form; test escaping and collation-sensitive ranges carefully.',
    'LIKE ESCAPE character': 'ESCAPE designates one character that makes a following wildcard literal, such as an underscore in user input. The escape expression must be one character; escape user-supplied patterns deliberately rather than concatenating raw input.',
    'LIKE collation-sensitive matching': 'LIKE uses SQL Server string comparison/collation behavior, which can vary in case, accent, width, kana, and sorting rules. Character classes, trailing spaces, and Unicode/non-Unicode types add edge cases; choose a collation intentionally.',
    'REGEXP_LIKE(string_expression,pattern_expression[,flags])': 'The SQL Server 2025 predicate/function tests whether a character string matches a regular-expression pattern; the optional flags argument changes matching modes. It requires database compatibility level 170 and is not available in SQL Server 2022 or earlier. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)',
    'REGEXP_LIKE case-sensitive flag c': 'The \`c\` modifier requests case-sensitive regex matching and is the default. If contradictory \`c\` and \`i\` modifiers appear, SQL Server documents that the last character wins.',
    'REGEXP_LIKE case-insensitive flag i': 'The \`i\` modifier requests case-insensitive regex matching. Regex case behavior is not derived from a column’s linguistic collation; the flag is the explicit regex control.',
    'REGEXP_LIKE multiline flag m': 'The \`m\` modifier changes `^` and `$` so they can match line boundaries as well as the start and end of the entire text. Without it, they anchor the whole input.',
    'REGEXP_LIKE dot-newline flag s': 'The \`s\` modifier allows the regex dot to match newline characters. Without it, dot does not match newline.',
    'REGEXP_LIKE database compatibility level 170 requirement': 'SQL Server 2025 exposes REGEXP_LIKE only at database compatibility level 170 or higher; a server engine version alone is insufficient if the database remains at a lower compatibility level. Confirm the intended database setting before deployment. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)',
    'REGEXP_LIKE ignores collation rules': 'Regular-expression matching does not honor SQL Server collation rules, unlike many ordinary string comparisons. A case-insensitive linguistic collation therefore does not silently make the regex case-insensitive; select the regex \`i\` or \`c\` flag.',
    'REGEXP_LIKE SARGable anchored-pattern boundary': 'Microsoft documents REGEXP_LIKE as SARGable only when the pattern starts with `^`; supported anchored patterns can include quantifiers `*`, `+`, `?`, `{n}`, `{n,}`, or `{n,m}`, and character ranges such as `[0-9A-Za-z]`. Escaping a metacharacter uses backslash. This narrow optimizer-supported grammar is not a guarantee that arbitrary regex patterns use an index; inspect the plan for the actual query. [Microsoft Learn: REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)',
    'Predicate versus scalar expression': 'A predicate answers whether a condition is satisfied in a search context; a scalar expression produces a value. Use CASE when a condition must produce a projected value, and do not assume SQL Server evaluates predicates left-to-right as a procedural guard.',
  },
  'ordering-and-result-determinism': {
    'ORDER BY clause': 'Requests a final result ordering by one or more expressions. It is the only SELECT-level ordering guarantee; a view’s, index’s, or current execution plan’s apparent order does not replace it.',
    'ORDER BY expression list': 'A comma-separated sequence of sort keys. SQL Server sorts by the first key, then uses the next key only to order rows tied on preceding keys; add a unique final key when a deterministic total order is required.',
    'ORDER BY column name': 'Names a source or selected column as a sort key. Qualify ambiguous columns, and after assigning a table alias, use that alias when qualifying the source column.',
    'ORDER BY select-list alias': 'Names a projected output alias after SELECT binding. Use the alias by itself in this position; SQL Server documents alias-plus-expression forms such as `ORDER BY Alias + 1` as invalid in that alias-binding case.',
    'ORDER BY ordinal position': 'A nonnegative integer can refer to the select-list position. It works but is fragile: reordering or inserting projected columns silently changes which expression is sorted, so prefer named keys.',
    'ORDER BY expression not in select list': 'In an ordinary SELECT, a source expression can be a sort key even if it is not projected. With SELECT DISTINCT or set operators, ordering expressions must be represented in the select list under SQL Server’s restrictions.',
    'ORDER BY ASC': 'ASC requests ascending order; it is also the default when direction is omitted. SQL Server treats NULL as the lowest sort value, so NULL appears first in ASC order.',
    'ORDER BY DESC': 'DESC requests descending order. Since SQL Server treats NULL as the lowest sort value, NULL appears after non-NULL values under DESC.',
    'ASC default sort direction': 'A sort key without ASC or DESC is ascending. Write the direction explicitly when it improves review, especially in multi-key pagination where each key’s direction matters.',
    'ORDER BY multiple sort keys': 'Keys are applied in sequence: later keys break ties in earlier ones. A common paging order uses a business timestamp followed by a unique identifier so equal timestamps still have a deterministic order.',
    'ORDER BY COLLATE collation_name': 'COLLATE selects a string collation for that sort expression, changing linguistic ordering and potentially case/accent behavior. It applies to supported character types and can add a conversion/sort cost; use a valid collation name.',
    'Collation-specific string sort order': 'Text sorting is linguistic, not a universal byte or alphabet order. Case, accent, locale, and other collation options affect ties and sequence; a different database, column, or explicit ORDER BY collation can yield another order.',
    'NULL sorts before non-NULL values in SQL Server': 'SQL Server treats NULL as the lowest possible value for sorting: first under ASC and last under DESC. If the desired placement differs, sort first by an explicit CASE expression, then by the value.',
    'ORDER BY does not guarantee order among equal sort keys': 'Rows that compare equal on all listed sort expressions may appear in either relative order. The result is not deterministic for pagination until the key tuple uniquely identifies every row in the filtered result.',
    'Unique tie-breaker for deterministic paging': 'Append a stable unique key to the ORDER BY list, such as OrderId after CreatedAt. This removes ambiguity among ties in a static data set; it does not by itself freeze changing data between separate page requests.',
    'ORDER BY inside a view or derived table does not order its outer query': 'An inner ORDER BY is allowed only with row-limiting constructs in these contexts and only chooses which inner rows qualify. The outer result remains unordered unless its own query has ORDER BY.',
    'ORDER BY with UNION, EXCEPT, and INTERSECT scope': 'At top-level set operations, place the result ORDER BY after all branches; only the final combined result is ordered. The names/aliases in that ORDER BY must follow set-operation output rules.',
    'ORDER BY with SELECT INTO limitation': 'ORDER BY may choose the source result order, but Microsoft explicitly says it does not guarantee the physical insertion order into a SELECT INTO table. Query the new table with its own ORDER BY.',
    'ORDER BY ALL is Fabric-only': 'ORDER BY ALL is supported in the documented Fabric Data Warehouse and SQL analytics endpoint syntax, where it orders by every projected column. It is not SQL Server syntax; list the intended SQL Server sort keys explicitly.',
  },
  'row-limits-and-pagination': {
    'TOP (expression)': 'Limits a query result to the requested row count. Without ORDER BY, SQL Server may choose any qualifying rows; with a deterministic ORDER BY, it chooses the first rows in that order.',
    'TOP (expression) PERCENT': 'Returns the requested percentage of the ordered result; a fractional row count is rounded up to the next whole row. It is based on the result cardinality and is not a fixed-size page.',
    'TOP (expression) WITH TIES': 'Includes additional rows tied with the last selected row on all ORDER BY expressions, so the output can exceed the requested count. The relative order among tied rows is not guaranteed; use only when including all boundary ties is intended.',
    'TOP parentheses compatibility rule': 'SQL Server retains a compatibility form omitting parentheses only when a SELECT TOP expression is an integer constant. Prefer \`TOP (n)\` consistently; parentheses are required in other DML forms and remove ambiguity.',
    'TOP requires ORDER BY for predictable row selection': 'TOP without ORDER BY limits an undefined subset. Use an explicit sort key, and include a unique tie-breaker if exactly which rows are selected must be reproducible.',
    'WITH TIES requires ORDER BY': 'WITH TIES is meaningful only against a boundary sort key, so SQL Server requires ORDER BY. It includes every row equal to the last row across the complete ORDER BY key list.',
    'TOP cannot share a query scope with OFFSET/FETCH': 'SQL Server does not allow TOP and OFFSET/FETCH in the same query expression. Choose one row-limiting form per query scope; a nested query can establish a separate scope when genuinely needed.',
    'ORDER BY OFFSET integer_constant ROWS': 'The integer constant is the number of ordered rows to skip before returning a result. It must be nonnegative and is used after ORDER BY; this basic form is often paired with FETCH for page size.',
    'ORDER BY OFFSET offset_row_count_expression ROWS': 'The expression can be a variable, parameter, or noncorrelated scalar subquery and must be nonnegative. It cannot reference outer-query columns when it is a subquery; large offsets may cost more because earlier rows still have to be navigated.',
    'FETCH FIRST row_count ROW ONLY': 'Returns the requested number of rows after OFFSET. FIRST and NEXT are synonyms, as are ROW and ROWS; FETCH count must be at least one.',
    'FETCH NEXT row_count ROWS ONLY': 'The common paging form returns a bounded number of rows after the skip count. It belongs to ORDER BY with OFFSET, not a standalone unordered clause.',
    'OFFSET/FETCH requires ORDER BY': 'SQL Server defines OFFSET/FETCH as part of ORDER BY. The sort order controls which positions make up each page; a stable page order should end in a unique key.',
    'OFFSET/FETCH SQL Server 2012 and later availability': 'SQL Server added OFFSET/FETCH in SQL Server 2012 (11.x); it is present in SQL Server 2025. It is not available on older SQL Server engines. [Microsoft Learn: ORDER BY](' + orderUrl + ')',
    'OFFSET/FETCH variables and expressions': 'OFFSET and FETCH accept nonnegative expressions, including variables/parameters and noncorrelated scalar subqueries. OFFSET may be zero; FETCH must be at least one. Validate app input before binding it.',
    'Offset pagination': 'A client requests page N by skipping a computed number of rows and fetching a page size. It is simple for numbered pages, but deep offsets can do increasing work and separate requests can see changing data.',
    'Keyset (seek) pagination': 'A continuation query starts after the last row’s ordered key tuple instead of counting and skipping all earlier rows. For descending `(CreatedAt, OrderId)`, continue with an earlier date, or the same date and a smaller ID; the key tuple and null policy must match ORDER BY.',
    'Deterministic pagination needs a unique ordering key': 'A unique ordering tuple is required to keep the same static rows in a predictable sequence across pages. Nonunique timestamps alone can shift tied rows between page boundaries.',
    'Pagination consistency under concurrent writes': 'A unique order prevents tie ambiguity but does not freeze a multi-request result set while rows are inserted, deleted, or updated. Decide whether the product accepts movement/duplicates, uses a continuation key, or requires a transactionally consistent snapshot.',
    'Snapshot or serializable transaction for stable multi-page reads': 'Microsoft’s OFFSET/FETCH guidance says stable page requests require unchanged underlying data, for example all page reads in one SNAPSHOT or SERIALIZABLE transaction, plus a unique ORDER BY key. SNAPSHOT needs ALLOW_SNAPSHOT_ISOLATION; READ_COMMITTED_SNAPSHOT gives statement-level versions, not one shared snapshot across page requests; SERIALIZABLE range locks can block writes. Holding a transaction across interactive HTTP page requests is often operationally undesirable, so assess the requirement rather than assuming pagination is a snapshot.',
    'Large-offset scan cost': 'A deep page can require the engine to find and pass many preceding ordered rows before returning the requested slice. An appropriate index and plan can change cost, but keyset pagination is often better for sequential “next page” navigation.',
    'SET ROWCOUNT legacy row-limit alternative': 'SET ROWCOUNT applies a connection/session setting that limits rows affected or returned by subsequent statements, rather than expressing a local SELECT row limit. It can leak into later work if not reset and is not the preferred SELECT paging interface.',
    'TOP and FETCH preferred over SET ROWCOUNT for SELECT limits': 'Microsoft recommends TOP or OFFSET/FETCH for SELECT limits because the optimizer can consider their values during plan optimization; SET ROWCOUNT sits outside an individual query’s syntax. Choose TOP for top-N and OFFSET/FETCH for numbered page ranges.',
    'FETCH row-count and offset must be nonnegative': 'OFFSET accepts zero or greater; FETCH accepts one or greater. A negative or zero FETCH count is invalid. Reject or normalize page inputs in application code rather than producing a runtime syntax error.',
  },
};

const contexts = {
  'select-query-shape-and-projection': {
    mental: 'A SELECT is a request to form a result table. FROM establishes available row sources, WHERE keeps qualifying rows, and the select list shapes each remaining row. DISTINCT may remove duplicate projected tuples; ORDER BY orders the result only when requested.',
    comparison: '`SELECT ALL` preserves repeated projected rows; `SELECT DISTINCT` removes duplicates in the complete projection. A query expression may combine compatible result shapes; a query specification is one branch. Fabric-only syntax names are included solely to keep the SQL Server boundary explicit.',
    code: 'SELECT o.OrderId, o.CreatedAt, o.Total AS [Order Total]\nFROM dbo.Orders AS o\nWHERE o.Status = N\'Open\'\nORDER BY o.CreatedAt DESC, o.OrderId DESC;',
    mistakes: ['Using SELECT * as a durable API contract.', 'Expecting DISTINCT to select a representative row by some key.', 'Trying to use a SELECT alias in WHERE.', 'Assuming SELECT without ORDER BY returns the same order on each run.', 'Copying Fabric-only ORDER BY ALL or QUALIFY into SQL Server.'],
  },
  'where-predicates-and-search-conditions': {
    mental: 'A WHERE clause keeps rows for which the full search condition is TRUE. Because SQL Server predicates can yield UNKNOWN, NULL behavior must be reasoned through every comparison, NOT, and membership operation rather than treated as ordinary Boolean negation.',
    comparison: '\`= NULL\` produces UNKNOWN; \`IS NULL\` tests for missingness; \`IS [NOT] DISTINCT FROM\` (SQL Server 2022+) gives a null-safe definite comparison. LIKE uses wildcard characters and collation-sensitive string rules; SQL Server 2025 REGEXP_LIKE uses regex flags and compatibility level 170, ignores collation rules, and has only a restricted SARGable pattern boundary.',
    code: 'SELECT o.OrderId, o.Status, o.Total\nFROM dbo.Orders AS o\nWHERE o.CancelledAt IS NULL\n  AND (o.Status = N\'Open\' OR o.Status = N\'Pending\')\n  AND o.Total >= @MinimumTotal;',
    mistakes: ['Writing \`= NULL\` or `<> NULL`.', 'Assuming NOT UNKNOWN becomes TRUE.', 'Using NOT IN when its source can return NULL.', 'Relying on short-circuit evaluation to protect an invalid expression.', 'Treating SQL Server 2025 REGEXP_LIKE as available at every database compatibility level.'],
  },
  'ordering-and-result-determinism': {
    mental: 'Ordering is a property of a returned result only when the outer query states ORDER BY. Multiple keys form a lexicographic order; rows tied on every key remain unordered relative to one another.',
    comparison: '\`ORDER BY\` sorts final output; \`TOP\` and OFFSET/FETCH use an order to choose rows. A sort by a nonunique business value is not deterministic at the ties. Collation changes text ordering; SQL Server places NULL below non-NULL values.',
    code: 'SELECT o.OrderId, o.CreatedAt, o.Status\nFROM dbo.Orders AS o\nORDER BY o.CreatedAt DESC, o.OrderId DESC;',
    mistakes: ['Ordering by a nonunique key and calling pagination deterministic.', 'Using a select-list ordinal after projection changes.', 'Assuming inner/view ordering reaches an outer query.', 'Sorting text as though every collation used the same alphabet.', 'Expecting SELECT INTO insertion order to be guaranteed by ORDER BY.'],
  },
  'row-limits-and-pagination': {
    mental: 'A row limit answers “how many” and an order answers “which ones.” TOP is a top-N row limit; OFFSET/FETCH defines a page slice within an ordered query. Keyset paging follows the last key rather than counting from the beginning.',
    comparison: '\`TOP (n)\` is concise for top-N and can include boundary ties; OFFSET/FETCH is natural for page number/size; keyset paging is natural for sequential continuation. None guarantees a stable multi-request view if data changes unless the application also defines a consistency strategy.',
    code: 'DECLARE @Offset bigint = 40;\nDECLARE @PageSize int = 20;\n\nSELECT o.OrderId, o.CreatedAt, o.Total\nFROM dbo.Orders AS o\nORDER BY o.CreatedAt DESC, o.OrderId DESC\nOFFSET @Offset ROWS\nFETCH NEXT @PageSize ROWS ONLY;',
    mistakes: ['Using TOP without ORDER BY and expecting a predictable subset.', 'Combining TOP and OFFSET/FETCH in one query scope.', 'Paging by a nonunique key.', 'Assuming a unique sort key freezes data between independent requests.', 'Using a long-lived transaction across user think time without considering version-store/locking costs.'],
  },
};

const sourceLinks = [selectUrl, searchUrl, logicalUrl, precedenceUrl, likeUrl, orderUrl, topUrl, distinctUrl, regexpUrl, isolationUrl, unionUrl, allUrl, anyUrl, versionUrl];
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').trim();

function row(item, groupId) {
  const explanation = definitions[groupId]?.[item];
  if (!explanation) throw new Error(`No authored explanation for supplied item: ${groupId} / ${item}`);
  return `| \`${esc(item)}\` | ${esc(explanation)} |`;
}

const topic = manifest.title;
const overview = `# ${topic} — Big-picture orientation and mental model

# Problem and purpose

Queries select a useful set of rows and columns from stored data. This topic focuses on one SELECT query: what it projects, how it filters, how it orders, and how it limits rows. Correct results depend on SQL semantics, not on what a query happened to return in one test run.

# Plain-language mental model

Treat a query as a recipe for a result table. FROM names the available row source; WHERE rejects rows whose search condition is not TRUE; SELECT shapes the columns; DISTINCT optionally removes duplicate projected rows; ORDER BY defines a returned sequence; TOP or OFFSET/FETCH limits which ordered rows are returned. SQL Server has a logical binding order that explains alias visibility, but the optimizer may physically execute a plan in another order.

This unit is specifically SQL Server 2025 (17.x) Transact-SQL. Two release changes are especially relevant: SQL Server 2022 added null-safe \`IS [NOT] DISTINCT FROM\`; SQL Server 2025 added \`REGEXP_LIKE\`, which requires database compatibility level 170. Regex matching ignores collation rules, unlike ordinary string comparison. [Microsoft Learn: IS DISTINCT FROM](${distinctUrl}) [Microsoft Learn: REGEXP_LIKE](${regexpUrl}) [SQL Server 2025 changes](${versionUrl})

# How the parts fit together

1. Choose a row source and give it a clear alias.
2. Write a search condition; account for TRUE, FALSE, and UNKNOWN.
3. Choose explicit result expressions and stable output names.
4. State an outer ORDER BY if sequence matters.
5. Add a row limit only after deciding which ordered rows count.
6. For pagination, choose a unique key tuple and decide what concurrent changes mean.

# Concept map

| Question | Query feature | Main hazard |
| --- | --- | --- |
| Which data is available? | FROM/table source | Ambiguous or overbroad projection |
| Which rows qualify? | WHERE/predicates | UNKNOWN, NULL and precedence |
| Which columns form the result? | Select list/aliases | Duplicate rows, unstable output shape |
| In what order are rows returned? | ORDER BY | Missing order or nonunique keys |
| Which slice should the client receive? | TOP, OFFSET/FETCH, keyset | Undefined subset, deep offsets, concurrent writes |
| Which pattern grammar applies? | LIKE or REGEXP_LIKE | Collation, escapes, version and support boundary |

# End-to-end walkthrough

Suppose an endpoint returns the next 20 open orders, newest first. Filter \`Status\` in WHERE, project only the required columns, and order by \`CreatedAt DESC, OrderId DESC\`. The unique identifier breaks timestamp ties. OFFSET/FETCH is convenient for numbered pages; a continuation predicate on the last timestamp and ID is more appropriate for “next” navigation. If rows may change between requests, decide whether movement is acceptable or a stable snapshot is required. A pattern search must choose LIKE or SQL Server 2025 REGEXP_LIKE based on the actual grammar, compatibility level, and collation requirements.

# When to use it and tradeoffs

Project explicit columns for stable contracts and reduced exposure. Use DISTINCT only when duplicate projected tuples are semantically unwanted. Use ORDER BY whenever callers depend on sequence. Choose TOP for a top-N result, OFFSET/FETCH for numbered page slices, and keyset pagination for continuation over a changing or large ordered set. Choose the simpler pattern matcher that meets the requirement; regular expressions add a different grammar and support boundary.

# What later lessons cover

The concepts lesson explains binding, three-valued logic, ordering, and paging before the catalogs. Four references cover query shape, predicates, ordering, and limits; every exact manifest item appears in its assigned group. Practice and interview lessons use SQL Server-specific cases and highlight the SQL Server/Fabric boundary.

# Sources

- [SQL Server SELECT](${selectUrl})
- [SQL Server search conditions](${searchUrl})
- [SQL Server ORDER BY](${orderUrl})
- [SQL Server TOP](${topUrl})
- [SQL Server 2025 REGEXP_LIKE](${regexpUrl})
`;

const concepts = `# ${topic} — Core concepts and how they fit together

# Learning objectives

Read a SELECT shape; explain alias scope and logical binding; evaluate NULL predicates using three-valued logic; select a pattern grammar; define deterministic ordering; compare TOP, OFFSET/FETCH and keyset pages; and explain SQL Server version and compatibility boundaries.

# Prerequisites

Know tables, columns, data types, NULL, basic T-SQL statements, and simple expressions. Joins, aggregation, index design, execution plans, and query tuning have separate modules; this unit uses only the source and clause context needed to understand selection.

# Core concepts

## Query shape and result projection

A query specification describes one branch of a result. Its select list produces output expressions and aliases; \`SELECT ALL\` is the default and retains duplicate projected tuples. \`SELECT DISTINCT\` removes duplicates only after projection, so choosing too few columns can collapse rows that were different in the source. \`SELECT *\` expands the source schema and couples consumers to changes; explicit projection communicates a stable result contract.

Set-operation branches combine results vertically and need the same number and order of compatible output columns. They do not join columns side by side. SQL Server takes output names from the left branch and resolves compatible type differences through implicit conversion rules. Use explicit casts when precision, scale, or type choice matters. [Microsoft Learn: UNION](${unionUrl})

## Logical binding versus physical execution

The documented logical order begins with FROM, followed by WHERE, then SELECT and DISTINCT, then ORDER BY and TOP. It explains why a select alias is not in scope in WHERE but is available in ORDER BY. This is a name-binding model, not an instruction that SQL Server must physically run each operator in that order; the optimizer may reorder or transform execution while preserving semantics. [Microsoft Learn: SELECT logical processing](${selectUrl})

## Search conditions and three-valued logic

Each predicate can yield TRUE, FALSE, or UNKNOWN. WHERE retains only TRUE. A comparison with NULL usually gives UNKNOWN, and NOT UNKNOWN is still UNKNOWN. Use IS NULL to test missingness and \`IS [NOT] DISTINCT FROM\` for null-safe equality/inequality. AND binds before OR, but parentheses make business logic explicit. Precedence does not promise procedural short-circuit evaluation, so do not place an unsafe conversion in one side and assume the other side always guards it. [Microsoft Learn: search conditions](${searchUrl}) [Microsoft Learn: operator precedence](${precedenceUrl})

NOT IN has a common trap: a NULL in the compared list/subquery can leave a nonmatching candidate UNKNOWN, so WHERE filters it. NOT EXISTS expresses an anti-match without that NULL poisoning, provided the correlation condition expresses the intended comparison. ANY/SOME and ALL compare against a subquery set; SQL Server’s documentation defines empty-set behavior and UNKNOWN cases, so do not reduce them to an English slogan.

## LIKE and regular expressions are distinct tools

LIKE uses \`%\` for zero-or-more characters, \`_\` for one character, and bracket expressions for one-character sets/ranges. ESCAPE makes a wildcard literal. Collation and character data type influence case/accent/range matching and trailing-space details. REGEXP_LIKE uses regex syntax and flags \`c\`, \`i\`, \`m\`, \`s\`; it requires compatibility level 170 in SQL Server 2025 and does not honor collations. Only a restricted anchored pattern subset is documented as SARGable. [Microsoft Learn: LIKE](${likeUrl}) [Microsoft Learn: REGEXP_LIKE](${regexpUrl})

## Ordering is a contract only when requested

Without the outer ORDER BY, result order is unspecified. A list of sort keys works left-to-right: each later key resolves only ties from earlier keys. An ORDER BY that is not unique can still leave row order unstable; append a unique key for paging. SQL Server sorts NULL as the lowest value, so it appears first in ascending and last in descending order. A collation-specific sort may differ from another database or locale. ORDER BY inside a view or derived table selects rows only when paired with a row limit; it does not impose outer result order. [Microsoft Learn: ORDER BY](${orderUrl})

## Row limiting and pagination

TOP without ORDER BY selects an undefined subset. TOP PERCENT rounds a fractional count upward; WITH TIES may return more than N and requires ORDER BY. OFFSET/FETCH is part of ORDER BY, and TOP cannot share its query scope. OFFSET must be nonnegative; FETCH must be at least one. OFFSET/FETCH was introduced in SQL Server 2012. [Microsoft Learn: TOP](${topUrl}) [Microsoft Learn: ORDER BY](${orderUrl})

Offset pagination identifies a position from the start, which is convenient for numbered pages but can require work through earlier rows. Keyset pagination adds a lexicographic “after last key” predicate and is suited to sequential continuation. Neither a unique ordering nor keyset navigation guarantees a frozen dataset if rows change. Microsoft’s stability guidance for separate OFFSET/FETCH requests requires no relevant data change or all pages in a single SNAPSHOT/SERIALIZABLE transaction plus unique ordering; snapshot isolation must be enabled, while serializable range locks can reduce concurrency. A long-lived transaction across user think time may be unsuitable, so define the product’s consistency requirement first. [Microsoft Learn: paging stability](${orderUrl}) [Microsoft Learn: isolation levels](${isolationUrl})

## Current SQL Server boundary

SQL Server 2022 introduced \`IS [NOT] DISTINCT FROM\`; SQL Server 2025 introduced REGEXP_LIKE with compatibility level 170. The Microsoft Learn SELECT and ORDER BY pages also show Fabric-only \`QUALIFY\` and \`ORDER BY ALL\` forms separately; those are not SQL Server syntax. Do not copy a feature from a shared product documentation page without checking the “Applies to” surface. [SQL Server 2025 changes](${versionUrl}) [Microsoft Learn: SELECT](${selectUrl}) [Microsoft Learn: ORDER BY](${orderUrl})

# Mechanisms and relationships

| Stage | Logical responsibility | Visible facts |
| --- | --- | --- |
| FROM | Establish row sources and names | Source columns and table aliases |
| WHERE | Keep rows whose predicate is TRUE | FALSE and UNKNOWN are excluded |
| SELECT | Form projected output | Expressions and aliases |
| DISTINCT | Remove equal projected tuples | Every selected column participates |
| ORDER BY | Define returned sequence | Later keys break earlier ties |
| TOP/OFFSET/FETCH | Limit rows from the ordered set | The sort determines which rows count |

# Worked examples

## NULL-safe change detection

\`\`\`sql
SELECT c.CustomerId, c.Status
FROM dbo.Customers AS c
WHERE c.Status IS DISTINCT FROM @PreviousStatus;
\`\`\`

This selects a changed value even when exactly one side is NULL; two NULLs are not distinct. Ordinary \`<>\` would yield UNKNOWN when either side is NULL.

## Null-safe anti-match

\`\`\`sql
SELECT p.ProductId
FROM dbo.Products AS p
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.DiscontinuedProducts AS d
    WHERE d.ProductId = p.ProductId
);
\`\`\`

The subquery asks whether a matching row exists. An unrelated NULL in \`DiscontinuedProducts.ProductId\` does not poison every unmatched product, unlike NOT IN. If either key can be NULL and NULL should count as equal, encode that rule explicitly.

## Stable numbered page

\`\`\`sql
DECLARE @Offset bigint = 40;
DECLARE @PageSize int = 20;

SELECT o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
WHERE o.Status = N'Open'
ORDER BY o.CreatedAt DESC, o.OrderId DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
\`\`\`

OrderId breaks ties in CreatedAt, making a deterministic order for a static dataset. It still does not freeze rows between requests. Validate page inputs; a negative offset or a zero FETCH count is invalid.

## Continuation-key page

\`\`\`sql
DECLARE @LastCreatedAt datetime2(7) = '2026-10-01T12:00:00';
DECLARE @LastOrderId bigint = 9000;
DECLARE @PageSize int = 20;

SELECT TOP (@PageSize) o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
WHERE o.Status = N'Open'
  AND (o.CreatedAt < @LastCreatedAt
       OR (o.CreatedAt = @LastCreatedAt AND o.OrderId < @LastOrderId))
ORDER BY o.CreatedAt DESC, o.OrderId DESC;
\`\`\`

This assumes CreatedAt is non-NULL and the continuation tuple came from the prior result. The predicate mirrors the descending lexicographic order. If sort keys are nullable or mutable, define explicit ordering/null rules and continuation semantics.

# Misconceptions and edge cases

- Logical binding order explains name scope; it does not prescribe physical execution order.
- \`WHERE x = NULL\` is not a NULL test.
- NOT UNKNOWN remains UNKNOWN; NOT IN may be affected by one NULL in its set.
- DISTINCT removes duplicates in the projected tuple, not duplicate source records by business key.
- ORDER BY with nonunique keys does not totally order rows.
- TOP without ORDER BY chooses no predictable subset.
- WITH TIES may exceed the requested row count and does not order the tied rows among themselves.
- A unique page key does not create a snapshot across independent requests.
- SQL Server 2025 REGEXP_LIKE requires compatibility level 170 and ignores collations; LIKE is not regex.
- Shared Learn pages may document Fabric syntax beside SQL Server syntax.

# Knowledge checks with answers

1. **Why can ORDER BY see a SELECT alias when WHERE cannot?** Its logical binding stage follows projection; WHERE binds before the select list.
2. **What does WHERE do with UNKNOWN?** It does not retain that row; only TRUE passes.
3. **Why is NOT IN risky with nullable subquery output?** A nonmatch against a NULL can yield UNKNOWN, which WHERE excludes.
4. **What does DISTINCT deduplicate?** The entire projected row tuple.
5. **What makes paging order deterministic on a static result?** A sort-key tuple unique for every row.
6. **What exact SQL Server 2025 boundary applies to REGEXP_LIKE?** Database compatibility level 170 or higher; SQL Server 2022 and earlier do not expose it.
7. **Does a unique sort key make multiple HTTP requests a consistent snapshot?** No; data changes still require a separate consistency strategy.

# Sources

- [SQL Server SELECT](${selectUrl})
- [SQL Server search conditions](${searchUrl})
- [SQL Server logical operators](${logicalUrl})
- [SQL Server ANY and SOME](${anyUrl})
- [SQL Server ALL](${allUrl})
- [SQL Server operator precedence](${precedenceUrl})
- [SQL Server LIKE](${likeUrl})
- [SQL Server ORDER BY and paging](${orderUrl})
- [SQL Server TOP](${topUrl})
- [SQL Server IS DISTINCT FROM](${distinctUrl})
- [SQL Server REGEXP_LIKE](${regexpUrl})
- [SQL Server transaction isolation](${isolationUrl})
- [SQL Server UNION](${unionUrl})
`;

await fs.mkdir('course/lessons/t03-003', {recursive: true});
const write = async (suffix, content) => fs.writeFile(`course/lessons/t03-003/t03-003-${suffix}.md`, `${content.trim()}\n`);
await write('overview', overview);
await write('concepts', concepts);

for (const group of manifest.inventory) {
  const detail = contexts[group.id];
  if (!detail) throw new Error(`Missing context for ${group.id}`);
  const rows = group.items.map(item => row(item, group.id)).join('\n');
  const pagingExample = group.id === 'row-limits-and-pagination' ? [
    '',
    '## Keyset continuation example',
    '',
    'For descending `(CreatedAt, OrderId)`, the next page consists of rows lexicographically below the last row returned. This example assumes `CreatedAt` is non-NULL and `OrderId` is unique; the cursor values come from the last row of the prior page.',
    '',
    '```sql',
    'DECLARE @PageSize int = 20;',
    "DECLARE @LastCreatedAt datetime2(7) = '2026-11-15T12:00:00';",
    'DECLARE @LastOrderId bigint = 9001;',
    '',
    'SELECT TOP (@PageSize) o.OrderId, o.CreatedAt, o.Total',
    'FROM dbo.Orders AS o',
    'WHERE o.CreatedAt < @LastCreatedAt',
    '   OR (o.CreatedAt = @LastCreatedAt AND o.OrderId < @LastOrderId)',
    'ORDER BY o.CreatedAt DESC, o.OrderId DESC;',
    '```',
    '',
    'Use the same filters and ordering on every request. If a sort key is nullable or mutable, define matching NULL and cursor semantics explicitly. Keyset navigation avoids skipping a deep prefix, but it does not by itself provide a frozen snapshot while rows change.'
  ].join('\n') : '';
  const ref = `# ${topic} — Reference: ${group.title}

# Scope and version

This reference explains all ${group.items.length} supplied items in **${group.title}** and adds no neighboring query API. The target is SQL Server 2025 (17.x) T-SQL. Version-specific claims below are cited at the point of use. SQL Server product surfaces differ; Microsoft Learn labels Fabric-only grammar separately from SQL Server grammar.

# How this group fits the mental model

${detail.mental}

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
${rows}

# Cross-item comparison

${detail.comparison}

# Examples

\`\`\`sql
${detail.code}
\`\`\`

This snippet illustrates the group’s rules. Its result order, NULL behavior, parameter values, and schema assumptions are explained above; validate it against the target schema and database compatibility level.

${pagingExample}

# Common mistakes

${detail.mistakes.map(item => `- ${item}`).join('\n')}

# Knowledge checks with answers

1. **Which exact inventory items does this reference cover?** ${group.items.map(item => `\`${item}\``).join(', ')}. Every one is explained in the table above.
2. **What should be checked when a result surprises you?** Binding scope, data types, NULL truth value, collation, unique ordering, and the SQL Server product/version surface relevant to the syntax.
3. **Does a successful query prove its order is guaranteed?** No. Only an applicable final ORDER BY defines result order, and tied keys remain unordered.

# Sources

- [SQL Server SELECT](${selectUrl})
- [SQL Server search conditions](${searchUrl})
- [SQL Server logical operators](${logicalUrl})
- [SQL Server ANY and SOME](${anyUrl})
- [SQL Server ALL](${allUrl})
- [SQL Server operator precedence](${precedenceUrl})
- [SQL Server LIKE](${likeUrl})
- [SQL Server ORDER BY](${orderUrl})
- [SQL Server TOP](${topUrl})
- [SQL Server IS DISTINCT FROM](${distinctUrl})
- [SQL Server REGEXP_LIKE](${regexpUrl})
- [SQL Server UNION](${unionUrl})
`;
  await write(`reference-${group.id}`, ref);
}

const practice = `# ${topic} — Exercises and worked solutions

# Goals

Translate a requirement into a query shape; reason through NULL and Boolean conditions; write a predictable order; select an appropriate row-limiting method; and verify SQL Server-specific syntax against the current engine and compatibility level.

# Worked example

Requirement: return the 10 newest non-cancelled orders for a customer, with every order at the boundary timestamp included.

\`\`\`sql
SELECT TOP (10) WITH TIES
       o.OrderId, o.CustomerId, o.CreatedAt, o.Status
FROM dbo.Orders AS o
WHERE o.CustomerId = @CustomerId
  AND o.Status <> N'Cancelled'
ORDER BY o.CreatedAt DESC;
\`\`\`

TOP uses the ordered rows. WITH TIES may return more than 10 when multiple orders share the last selected CreatedAt value. If exactly 10 rows are required, omit WITH TIES and add a unique key as a tie-breaker. This query also excludes NULL Status values because \`<>\` produces UNKNOWN for them; if NULL status should qualify, express that rule separately.

# Exercises

1. \`Orders.Status\` is nullable. Return open or pending orders, but exclude rows with unknown status. Add a minimum total filter and show intended Boolean grouping.
2. Return all products with no matching row in \`DiscontinuedProducts\`. The subquery’s ProductId column is nullable. Avoid NOT IN’s NULL trap.
3. A report selects \`OrderDate AS DateLabel\` and tries to filter with \`WHERE DateLabel >= @Start\`. Explain why it fails and show two valid query-boundary approaches.
4. Sort customers by last name and then first name. Explain what still prevents a deterministic total order and add a unique tie-breaker.
5. Return the second page of 25 orders ordered newest first. State all assumptions needed for deterministic page membership.
6. A case-insensitive database column must be regex-filtered for a pattern. Explain why the database collation is insufficient and show a SQL Server 2025 flag example.
7. Explain what changes if \`TOP (10) PERCENT\` is applied to 23 ordered rows, and how ties differ from percentage rounding.
8. A user asks for every row whose \`Code\` is not in a set returned by a subquery. Compare NOT IN and NOT EXISTS when that set may include NULL.

# Progressive hints

1. Parenthesize OR conditions and use IS NULL only if NULL should be included.
2. NOT EXISTS asks if a correlated matching row exists.
3. WHERE binds before SELECT; repeat the expression or wrap projection in a derived query.
4. Tied names remain tied; choose a unique key.
5. A unique order is necessary on the static data. OFFSET skips; page requests may see changes.
6. Use the regex-specific \`i\` flag; compatibility level 170 is required.
7. Compute the percentage count, round upward, then apply WITH TIES only if requested.
8. A NULL in NOT IN can make a nonmatching predicate UNKNOWN.

# Complete solutions

1. \`WHERE (Status = N'Open' OR Status = N'Pending') AND Total >= @MinimumTotal\` keeps only rows for which the full condition is TRUE. NULL statuses make both equality tests UNKNOWN and therefore do not pass. If the requirement includes missing status, add \`OR Status IS NULL\` inside the parentheses.
2. Use \`WHERE NOT EXISTS (SELECT 1 FROM dbo.DiscontinuedProducts AS d WHERE d.ProductId = p.ProductId)\`. A NULL row in the inner source does not turn every nonmatching product into UNKNOWN. This assumes a NULL product key should not match another NULL; specify a null-safe correlation if the data model defines that behavior.
3. The SELECT alias is not visible to WHERE in the same query scope because WHERE binds earlier. Repeat the source expression in WHERE, or project it in a derived table/CTE and filter the resulting column from the outer query. The latter creates a name boundary, though it does not force materialization.
4. Use \`ORDER BY LastName, FirstName, CustomerId\` if CustomerId uniquely identifies a customer. Last and first names alone can repeat; stable ordering for a static result requires a unique tuple.
5. Use \`ORDER BY CreatedAt DESC, OrderId DESC OFFSET 25 ROWS FETCH NEXT 25 ROWS ONLY\`. Both keys and page parameters must be valid; OrderId is assumed unique. To keep one consistent multi-page view while data changes, a separate transaction/isolation strategy is required; otherwise new writes may shift page membership.
6. Use \`REGEXP_LIKE(Code, '^ab[0-9]+$', 'i')\` on SQL Server 2025 with database compatibility level 170 or higher. Regex ignores collation rules; \`i\` explicitly requests case-insensitive matching. The anchored pattern here uses a start anchor and a range/quantifier form, but only Microsoft’s documented subset is guaranteed SARGable. [Microsoft Learn: REGEXP_LIKE](${regexpUrl})
7. Twenty-three rows times ten percent is 2.3; PERCENT rounds the fractional count up, so TOP (10) PERCENT selects three ordered rows before tie behavior. WITH TIES is a separate option that can add more rows matching the final ORDER BY key values.
8. NOT IN can return UNKNOWN for a nonmatching outer value if the inner set contains NULL, so WHERE removes the row. NOT EXISTS with an equality correlation avoids that poisoning. Confirm whether NULL outer keys should be included or treated as equal, because that is a separate data-model rule.

# Tests and edge cases

Include NULL and non-NULL predicate operands; empty and duplicate subquery results; lists containing NULL; equal sort keys; zero and negative paging values; NULL sort keys; collation-sensitive text; Unicode and trailing spaces in LIKE; regex flags and database compatibility level; percentage rounding; WITH TIES over multiple duplicate boundary rows; and inserts/updates/deletes between page requests. Test intended output order explicitly, not by relying on one observed plan.

# Reflection questions

- Does WHERE retain a row if its predicate is UNKNOWN?
- Is each output alias in scope where it is referenced?
- Is the final ORDER BY unique for this filtered result?
- Does a NULL value change the meaning of this NOT or comparison?
- Is the requested SQL syntax supported by SQL Server or only by Fabric?
- What data-consistency promise do multiple page requests actually need?

# Sources

- [SQL Server SELECT](${selectUrl})
- [SQL Server search conditions](${searchUrl})
- [SQL Server LIKE](${likeUrl})
- [SQL Server ORDER BY and paging](${orderUrl})
- [SQL Server TOP](${topUrl})
- [SQL Server REGEXP_LIKE](${regexpUrl})
- [SQL Server transaction isolation](${isolationUrl})
`;
await write('practice', practice);

const interview = `# ${topic} — Interview questions and reasoning

# Core questions

Explain result-shape, predicate, ordering, and pagination decisions as database semantics rather than relying on accidental observed results.

# Concise interview answers

1. **Why can a SELECT alias be used in ORDER BY but not WHERE?** SQL Server’s logical binding order places WHERE before SELECT and ORDER BY after it.
2. **What rows pass WHERE?** Only rows whose complete search condition evaluates TRUE; FALSE and UNKNOWN are discarded.
3. **What does DISTINCT remove?** Duplicate projected tuples across all select-list expressions.
4. **When is a result ordered?** When an applicable outer ORDER BY is specified; tied keys can still lack a defined relative order.
5. **TOP or OFFSET/FETCH?** TOP for a top-N selection; OFFSET/FETCH for an ordered page range. They cannot share a query scope.
6. **Why append a unique key to a paging order?** It resolves ties in a static result and makes page boundaries reproducible.
7. **What changed for regex in SQL Server 2025?** REGEXP_LIKE was introduced and requires compatibility level 170; its regex behavior does not use collation rules.

# Deep follow-up answers

The logical order is a binding model that explains name availability; it does not dictate physical execution. SQL uses three-valued logic, so NOT IN and NOT equality interact with NULL in ways that differ from two-valued Boolean reasoning. A final order is lexicographic and only total if its keys uniquely identify every row. Pagination is a product-level consistency decision: a unique order stabilizes a static set, keyset pagination avoids deep positional skipping, and a transaction snapshot can provide a stable set at cost and lifetime tradeoffs. Always separate SQL Server support from syntax shown for another Microsoft database surface.

# Scenario questions

1. **A query returns rows in the same order in production for months, then changes after an index deployment. Was the engine wrong?** No. Without ORDER BY, the prior order was incidental; the query never promised it.
2. **A NOT IN anti-join returns no rows after a NULL appears in the lookup table. Why?** A nonmatching comparison against NULL can evaluate UNKNOWN. Use a correctly correlated NOT EXISTS or define null-safe comparison semantics.
3. **A page contains duplicate customers after inserts occur between requests. How would you investigate?** Check that ORDER BY is unique, whether offset positions shifted under writes, whether keyset continuation fits the UX, and whether the product actually requires a consistent snapshot.
4. **REGEXP_LIKE parses on the server but errors in one database. Why?** Check database compatibility level; the SQL Server 2025 function requires level 170.

# Tradeoffs and alternatives

Explicit projection is more stable than \`*\`; DISTINCT is simple but may hide key distinctions and cost additional processing. LIKE is a compact wildcard tool; regex is more expressive but has its own flags, compatibility, collation, and SARGability boundaries. OFFSET/FETCH supports numbered pages; keyset continuation scales better for next/previous navigation but does not naturally jump to an arbitrary page number. Snapshot consistency can stabilize data but can be costly to hold across requests.

# Common weak answers

- “NULL equals NULL in SQL.”
- “NOT always returns the complement set.”
- “The database returns rows in clustered-index order.”
- “A unique ORDER BY means all pages see one frozen result.”
- “SQL Server 2025 is sufficient; no compatibility setting matters.”
- “A regex is just a more powerful LIKE with the same collation behavior.”
- “Fabric and SQL Server share all T-SQL syntax.”

# Self-check rubric

Score 0–2 for each answer: correct SQL Server scope/version; NULL and UNKNOWN reasoning; alias/binding explanation; deterministic-order argument; valid row-limit semantics; and explicit concurrency assumptions. A strong answer distinguishes logical query semantics from a particular physical plan.

# Sources

- [SQL Server SELECT](${selectUrl})
- [SQL Server search conditions](${searchUrl})
- [SQL Server operator precedence](${precedenceUrl})
- [SQL Server ORDER BY](${orderUrl})
- [SQL Server TOP](${topUrl})
- [SQL Server IS DISTINCT FROM](${distinctUrl})
- [SQL Server REGEXP_LIKE](${regexpUrl})
- [SQL Server transaction isolation](${isolationUrl})
`;
await write('interview', interview);

console.log(`Wrote the overview, concepts, ${manifest.inventory.length} references, practice, and interview; ${manifest.inventory.reduce((n, group) => n + group.items.length, 0)} exact inventory items are required.`);
