import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-009.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const u = {
  plans: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/execution-plans?view=sql-server-ver17',
  display: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-and-save-execution-plans?view=sql-server-ver17',
  operators: 'https://learn.microsoft.com/en-us/sql/relational-databases/showplan-logical-and-physical-operators-reference?view=sql-server-ver17',
  architecture: 'https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17',
  ce: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17',
  stats: 'https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17',
  iq: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17',
  psp: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17',
  oppo: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17',
  qs: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17',
  qsusage: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-usage-scenarios?view=sql-server-ver17',
  qsSecondary: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-for-secondary-replicas?view=sql-server-ver17',
  qshints: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-hints?view=sql-server-ver17',
  queryhints: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-query?view=sql-server-ver17',
  events: 'https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/extended-events?view=sql-server-ver17',
  newSql: 'https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17',
};
manifest.sourceSnapshot = { ...manifest.sourceSnapshot, authority: 'Microsoft SQL Server 2025 query processing, Showplan, Query Store, and intelligent query processing documentation', edition: 'SQL Server 2025 (17.x), compatibility level 170 boundaries checked 2026-11-16', checkedAt: '2026-11-16', urls: [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(u)])] };
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), ...Object.values(u)])];
manifest.versionNotes = [{ edition: 'SQL Server 2025 (17.x) and compatibility level 170', items: [
  'SQL Server 2025 adds PSP optimization for eligible DML statements and can select multiple eligible predicates from the same table; PSP remains equality-predicate-focused and selects at most three predicates per query.',
  'OPPO requires compatibility level 170 and OPTIONAL_PARAMETER_OPTIMIZATION; SQL Server 2025 enables the database-scoped setting by default. OPPO creates variants for eligible optional NULL predicates, not arbitrary dynamic filtering logic.',
  'SQL Server 2025 introduces CE feedback for expressions at compatibility level 160 on SQL Server (170 on Azure SQL Database), and OPTIMIZED_SP_EXECUTESQL is available to reduce concurrent compilation storms.',
  'Compatibility level enables feature eligibility; it does not guarantee that every query qualifies or that the resulting plan is faster. Evaluate workload regressions in Query Store before rollout.',
], sourceUrls: [u.iq, u.psp, u.oppo, u.newSql, u.qs] }];

const add = (groupId, names) => {
  const g = manifest.inventory.find(x => x.id === groupId);
  if (!g) throw new Error(`Unknown inventory group: ${groupId}`);
  g.items = [...new Set([...g.items, ...names])];
};
add('plan-shapes-and-operators', [
  'Adaptive Join', 'Bitmap operator', 'Concatenation operator', 'Constant Scan', 'Top operator',
  'Sequence Project', 'Window Aggregate', 'Index Spool', 'Table Spool', 'Eager Spool', 'Lazy Spool',
  'Distribute Streams', 'Repartition Streams', 'Gather Streams', 'Row mode execution', 'Batch mode execution',
  'Actual Rebinds', 'Actual Rewinds', 'Actual EndOfScans', 'Estimated subtree cost',
  'CardinalityEstimationModelVersion property', 'StatementOptmLevel property', 'StatementOptmEarlyAbortReason property',
  'Plan-affecting convert warning', 'Operator execution mode', 'Actual rows per execution',
]);
add('cardinality-and-parameter-sensitivity', [
  'Cardinality Estimator model version', 'Legacy CE model 70', 'Modern CE model 120 and later',
  'Simple containment assumption', 'Base containment assumption', 'Parameter Sensitive Plan predicate limit',
  'PSP equality-predicate eligibility boundary', 'PSP support for DML at compatibility 170',
  'OPTIONAL_PARAMETER_OPTIMIZATION configuration', 'OPPO compatibility level 170 requirement',
  'DISABLE_OPTIONAL_PARAMETER_OPTIMIZATION hint', 'OPPO eligible NULL optional predicate',
  'PSP and OPPO dispatcher/variant distinction', 'CE feedback for expressions in SQL Server 2025',
  'OPTIMIZED_SP_EXECUTESQL', 'DOP feedback Query Store requirement', 'DISABLE_PARAMETER_SNIFFING hint',
  'Parameter Sensitive Plan recompile boundary', 'Memory grant feedback persistence',
]);
add('query-store-and-diagnostics', [
  'SET SHOWPLAN_XML', 'SET STATISTICS XML', 'SET STATISTICS PROFILE', 'SET STATISTICS IO ON', 'SET STATISTICS TIME ON',
  'Actual plan runtime context', 'Live Query Statistics refresh behavior', 'sys.query_store_query_variant',
  'sys.query_store_query_hints', 'sys.sp_query_store_set_hints', 'sys.sp_query_store_clear_hints',
  'Query Store READ_WRITE mode', 'Query Store READ_ONLY mode', 'Query Store wait-statistics capture',
  'Query Store size quota and cleanup', 'Plan forcing versus Query Store hints', 'Query Store hint failure/ignored status',
  'Query Store hint re-evaluation after data change', 'ABORT_QUERY_EXECUTION query hint effect',
  'Query Store DML statement capture', 'Query Store excludes DDL plans', 'Query Store capture mode AUTO',
]);
manifest.scopeExclusions = [...new Set([...(manifest.scopeExclusions ?? []), 'Detailed index design, join syntax, and wait-type diagnosis are taught in adjacent SQL Server topics; this lesson explains how to interpret their plan evidence.', 'The Showplan operator inventory is a curated common set, not every operator in the engine; consult the live Microsoft operator reference for operators outside the named scope.'])];
manifest.sourceSnapshot.urls = [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(u)])];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const allNames = manifest.inventory.flatMap(g => g.items);
const vector = new Set(['PSP', 'OPPO']);
const sourceFor = name => {
  if (/OPPO|optional parameter/i.test(name)) return u.oppo;
  if (/PSP|Parameter Sensitive Plan|parameter sniff|OPTIMIZE FOR|RECOMPILE|parameter embedding|DISABLE_PARAMETER/i.test(name)) return u.psp;
  if (/CE feedback|OPTIMIZED_SP|DOP feedback|Memory grant feedback|Intelligent Query Processing|interleaved execution|deferred compilation|Batch mode/i.test(name)) return u.iq;
  if (/sys\.query_store_query_variant/.test(name)) return u.psp;
  if (/readable secondaries|secondary replicas/i.test(name)) return u.qsSecondary;
  if (/Query Store|query_store|ABORT_QUERY|Query hash|query plan hash/i.test(name)) return /hint|ABORT_QUERY/i.test(name) ? u.qshints : u.qs;
  if (/STATISTICS IO|STATISTICS TIME|SHOWPLAN|STATISTICS XML|STATISTICS PROFILE|Live Query|runtime context/i.test(name)) return u.display;
  if (/operator|predicate|row count|execution count|execution time|logical reads|Memory grant|Spill|Rebind|Rewind|EndOfScans|subtree|CardinalityEstimationModelVersion|StatementOptm|execution mode|Actual rows per/i.test(name)) return u.operators;
  if (/Cardinality|CE |containment|skew|histogram|feedback|Intelligent Query|deferred compilation|Batch mode|Adaptive/i.test(name)) return /histogram|skew|containment|Cardinality Estimator|Legacy CE|Modern CE/i.test(name) ? u.ce : u.iq;
  return u.architecture;
};
const esc = s => s.replaceAll('|', '\\|');
const explain = name => {
  const custom = {
    'Estimated execution plan': 'Compiled optimizer choice based on estimates; it does not execute the query and has no actual row counts or runtime warnings.',
    'Actual execution plan': 'The compiled plan plus observations from one completed execution. Parameter values, concurrency, cache state, and runtime conditions make it one sample, not a universal verdict.',
    'Graphical plan': 'A visual rendering of plan operators and properties. It is an interface over Showplan data, so preserve XML when you need machine-readable comparison.',
    'Showplan XML': 'Structured plan representation containing statement, operator, estimate, runtime, warning, and optimizer properties. Attributes evolve; parse defensively across engine releases.',
    'Query plan': 'A physical execution strategy chosen for a statement at compilation or variant compilation. Declarative SQL specifies results, not operator order.',
    'Physical operator': 'An implementation routine such as a seek, hash join, or sort. It is chosen to implement relational work and must be read with its inputs, row counts, executions, and properties.',
    'Logical operator': 'The relational operation required, such as join or aggregate, independent from the physical algorithm selected to implement it.',
    'Table scan': 'Reads a heap. It can be correct for broad access or a small table; scan presence alone is not evidence of a bad plan.',
    'Index scan': 'Reads some or all ordered index rows. It can satisfy ordering or be cheaper than many lookups when many rows qualify.',
    'Index seek': 'Navigates an index using seek predicates, but may still read many rows, apply residual predicates, or perform many lookups.',
    'Key lookup': 'Fetches base-row columns from a clustered index for each qualifying nonclustered entry. High execution count can dominate an apparently cheap seek.',
    'RID lookup': 'Fetches a heap row using its row identifier for each qualifying nonclustered entry; repeated lookups can cost more than a scan.',
    'Nested Loops join': 'Often efficient when the outer input is small and the inner side has a useful access path. Repeated inner executions multiply cost when estimates are wrong.',
    'Hash Match join': 'Builds a hash structure from one input and probes it with another; suitable for larger unsorted inputs but sensitive to memory grant and spill.',
    'Merge Join': 'Consumes inputs ordered on join keys. It can be efficient at scale but may require sorting or may handle many-to-many matches with extra work.',
    'Sort operator': 'Orders rows for ORDER BY, merge, or another requirement. Large sorts need memory and can spill to tempdb; check actual rows and grant.',
    'Stream Aggregate': 'Aggregates ordered input, often with low memory; upstream ordering may be required.',
    'Hash Aggregate': 'Groups through a hash structure without requiring ordered input; memory pressure can produce spills.',
    'Filter operator': 'Tests a predicate after its input produces rows. Compare rows before and after it; a residual filter can mean the access path read more than it returned.',
    'Compute Scalar': 'Defines scalar expressions. The expression may be deferred until the value is needed, so the icon alone does not quantify CPU cost.',
    'Spool operator': 'Stores rows in a worktable for reuse, protection, or plan semantics. Determine its type, rebind/rewind counts, and whether it is a symptom or intentional reuse.',
    'Exchange operator': 'Moves rows among parallel workers. Distribution choice can create skew, synchronization, or data movement cost.',
    'Parallelism operator': 'Graphical label for exchange operations such as gather, repartition, and distribute streams; inspect worker counts and skew, not just the icon.',
    'Actual row count': 'Observed rows produced by an operator for an execution. Compare with estimated rows at cardinality-sensitive boundaries and account for per-thread display semantics.',
    'Estimated row count': 'Optimizer prediction used in cost and memory decisions. It is not a promise or a runtime measurement.',
    'Actual execution count': 'How often an operator ran. A small per-execution cost can be large when repeated thousands of times, especially under Nested Loops.',
    'Actual execution time': 'Runtime measurement available in supported actual/live plans. It includes environmental effects and should be correlated with CPU, reads, waits, and concurrency.',
    'Actual logical reads': 'Pages requested from the buffer pool, reported through statistics I/O for statements/tables. Compare consistent runs and do not confuse logical with physical disk reads.',
    'Memory grant': 'Execution memory reserved for operators such as sort/hash. Too small can spill; too large can reduce concurrency. Compare requested, granted, and used amounts.',
    'Spill to tempdb': 'A sort/hash or other operator writes work to tempdb because memory was insufficient or execution shape required it. Find the operator, spill volume, estimate error, and grant feedback.',
    'Residual predicate': 'Predicate evaluated after rows are located by the access method; rows can be read then discarded, so inspect actual rows read versus returned.',
    'Seek predicate': 'Predicate used to navigate index key ranges. A seek predicate can be broad and can coexist with residual predicates.',
    'Predicate property': 'Showplan property describing the filter condition applied by an operator. Distinguish it from Seek Predicates to see which conditions narrowed navigation.',
    'Plan warning': 'A diagnostic annotation such as spill, conversion, or missing statistics. It identifies a lead to investigate; it is not itself a diagnosis or an automatic repair instruction.',
    'Cardinality estimation': 'Prediction of rows flowing through each plan stage. Estimates combine statistics, constraints, and assumptions and shape join, access, memory, and parallelism choices.',
    'Statistics histogram': 'A sampled or full-scan summary of value distribution. A stats object has a histogram on its first key column, bounded to at most 200 steps; it cannot express arbitrary correlation.',
    'Data skew': 'Uneven frequency across values. One cached plan can be poor for values selecting very different row counts; inspect distributions and parameter-specific runtime behavior.',
    'Parameter sniffing': 'Compilation can use parameter values to estimate a reusable plan. It is a feature that helps when values behave similarly and a risk when distributions differ materially.',
    'Parameter-sensitive query': 'A parameterized query whose efficient plan changes for different parameter values or resulting cardinalities.',
    'Parameter Sensitive Plan optimization (PSPO)': 'Adaptive optimization that may cache a dispatcher and multiple query variants for eligible parameterized equality predicates with materially different cardinalities. Qualification is selective.',
    'OPTION(RECOMPILE)': 'Compiles a fresh plan for the current execution and discards that temporary plan after execution. It can fit current values but spends compile CPU and does not fix a bad schema/statistics model.',
    'OPTIMIZE FOR query hint': 'Directs compilation to use a specified parameter value or unknown-value assumption. It changes estimates, not returned values; a fixed representative value can become unrepresentative.',
    'Local variable estimate': 'A local variable often lacks a sniffed runtime value at optimization, so the optimizer uses a generic estimate unless statement recompilation/embedding changes the context.',
    'Parameter embedding optimization': 'Compilation can substitute known parameter values into a statement, commonly with recompile contexts, allowing constant folding and value-specific plans at a compilation cost.',
    'Optional Parameter Plan Optimization (OPPO)': 'SQL Server 2025 adaptive feature for eligible optional predicates such as `Column = @p OR @p IS NULL`; it dispatches NULL and non-NULL states to variants.',
    'Parameter-sensitive plan dispatcher': 'A parent plan evaluates selected parameter cardinality ranges or optional states and routes execution to a query variant.',
    'Query variant': 'A child plan compiled for one dispatcher bucket/state. Variants are independently visible in plan cache/Query Store metadata; seeing variants does not imply all values are covered optimally.',
    'Cardinality estimation feedback': 'An Intelligent Query Processing family of feedback mechanisms that can adjust assumptions for repeat executions; eligibility, persistence, and exact behavior vary by feedback type and release.',
    'Memory grant feedback': 'Adjusts later memory grants based on prior execution use/spills. It is iterative, has eligibility/disable cases, and does not replace fixing incorrect row estimates or pathological query shapes.',
    'Degree of parallelism feedback': 'Can tune DOP for repeating queries when eligible; in SQL Server it requires Query Store and should be evaluated with CPU and elapsed-time objectives.',
    'Interleaved execution': 'For eligible multi-statement table-valued functions, pauses optimization to use a first-execution row count, then resumes compilation; that observed cardinality can still be unrepresentative later.',
    'Table variable deferred compilation': 'Defers compilation for eligible table-variable statements until first execution can observe its row count. It improves the initial estimate but does not create full distribution statistics.',
    'Batch mode on rowstore': 'Allows eligible rowstore plans to use batch processing without requiring a columnstore index. Eligibility is optimizer-selected and not a guarantee for every query.',
    'Intelligent Query Processing': 'A family of automatic optimizer improvements enabled by version/compatibility-specific eligibility. Raising compatibility can change plans; test regressions rather than treating the label as a single switch.',
    'Query Store': 'Database-level persisted history of queries, plans, runtime statistics, and optionally wait statistics. It survives plan-cache eviction and helps compare behavior over time.',
    'Query Store runtime statistics': 'Aggregated execution metrics grouped into configured time intervals; averages and totals can hide skew, outliers, and execution count changes.',
    'Query Store wait statistics': 'Wait categories associated with query execution intervals when collection is enabled. A category narrows diagnosis but does not prove the root cause.',
    'Query Store plan forcing': 'Requests reuse of a previously captured plan to mitigate a regression. Forcing can fail or become inappropriate after schema/data changes; monitor forcing status and reevaluate.',
    'Query Store hints': 'Persisted query-level hints applied without changing application SQL. Use only after addressing stats/index/compatibility causes; hints may fail or be ignored and require lifecycle ownership.',
    'Query Store plan regression': 'A performance deterioration associated with a plan choice change. Compare same query/parameter/workload windows and distinguish plan effect from data, concurrency, or infrastructure changes.',
    'Query Store capture mode': 'Controls which queries Query Store captures (for example AUTO, ALL, or CUSTOM where supported). Capture policy balances completeness, storage, and overhead.',
    'SET STATISTICS IO': 'Reports logical/physical/read-ahead reads by object for executed statements. Use it to compare work; it does not explain wait time or prove the plan is best.',
    'SET STATISTICS TIME': 'Reports parse/compile and execution CPU/elapsed measurements. Separate compile from runtime and compare repeated, controlled executions.',
    'Live Query Statistics': 'Shows runtime row flow and estimated progress for an in-flight query, refreshed periodically. Instrumentation has overhead and displayed progress is not a precise completion forecast.',
    'Extended Events query monitoring': 'Targeted event sessions can capture query, plan, and optimizer diagnostics. Prefer narrowly filtered sessions and inspect event semantics/overhead before production collection.',
    'Actual versus estimated row comparison': 'Compare at the earliest operator where actual and estimated cardinality diverge; downstream symptoms often originate upstream. A mismatch is a clue, not proof statistics alone are wrong.',
    'Plan cache': 'Memory cache of compiled plans. It holds recent/reusable plans but can evict them and does not provide durable plan history.',
    'Plan cache reuse': 'Reuses a compiled plan when statement identity and relevant context match. Reuse reduces compilation but may expose parameter sensitivity; settings/schema/metadata can cause separate cache entries.',
    'Compilation versus execution time': 'Compilation optimizes and builds a plan; execution runs it. Compilation storms and repeated recompiles are distinct from expensive execution and should be measured separately.',
    'Query hash': 'Identifier derived from normalized query text for grouping similar statements. It is not a collision-free business identity and does not prove two statements have identical runtime behavior.',
    'Query plan hash': 'Hash of a plan shape useful for identifying plan changes. Same hash does not guarantee identical runtime performance under different parameters/data/resources.',
    'sys.query_store_query': 'One row per captured query in Query Store. Join query_id to plan and runtime views; capture policy and retention determine what is present.',
    'sys.query_store_plan': 'Captured plan metadata and Showplan XML for a Query Store query. Newer versions distinguish dispatcher and query-variant plans; use relationship metadata when examining adaptive plans.',
    'sys.query_store_runtime_stats': 'Aggregated runtime metrics per plan and interval, including execution counts and CPU/duration/I/O. In-progress intervals can be partial; compare equivalent time windows.',
    'sys.query_store_wait_stats': 'Query Store wait-category aggregates when wait capture is enabled. This narrows query-level diagnosis but does not replace instance-level resource analysis.',
    'sys.query_store_query_variant': 'SQL Server 2022+ catalog view exposing parent/child relationships among original queries, dispatcher plans, and query variants produced by PSP. Join its query/plan identifiers to Query Store metadata and account for SQL Server 2025 PSP extensions.',
    'sys.query_store_query_hints': 'Catalog view for Query Store hints and their application/failure status. Use it to verify the persisted hint and diagnosis rather than assuming sys.sp_query_store_set_hints succeeded as intended.',
    'sys.sp_query_store_set_hints': 'System stored procedure that creates or replaces Query Store hints for a query_id. It accepts an OPTION(...) string; a later call replaces prior hint text for that query.',
    'sys.sp_query_store_clear_hints': 'System stored procedure that removes Query Store hints for a query_id. Clearing a hint returns plan generation to the remaining query/database/plan-guide controls; verify the subsequent plan.',
    'ABORT_QUERY_EXECUTION query hint effect': 'SQL Server 2025 Query Store hint that deliberately aborts a targeted query rather than execute it. Treat it as a containment/deny control; verify exact query identity, alerting, and clear-hint recovery.',
    'Query Store for readable secondaries': 'Query Store for readable secondary replicas is preview across Database Engine platforms. It is available starting with SQL Server 2025, but is not enabled by default there; configure primary and secondary capture with an Always On availability group. SQL Server 2022 support is limited preview and requires trace flag 12606, which Microsoft says is not intended for production. Azure availability differs by service/update policy.',
    'SET SHOWPLAN_XML': 'Returns estimated Showplan XML without executing the batch. It has compile-time estimates but no runtime row counts, warnings, or resource measurements.',
    'SET STATISTICS XML': 'Executes statements and returns actual Showplan XML with runtime information. Use controlled runs because collecting and returning detailed XML has overhead.',
    'SET STATISTICS PROFILE': 'Executes statements and returns tabular plan/operator runtime profile data for estimated-versus-actual comparisons.',
    'SET STATISTICS IO ON': 'Reports logical, physical, and read-ahead reads by object after execution. Logical reads measure buffer pages accessed, not storage latency.',
    'SET STATISTICS TIME ON': 'Reports parse/compile and execution CPU/elapsed measurements. Separate compile work from runtime; elapsed time can include waits and scheduling.',
    'Actual plan runtime context': 'An actual plan combines the compiled strategy with runtime observations from that execution, such as actual rows and supported warning/time properties. It represents only the captured execution context.',
    'Live Query Statistics refresh behavior': 'Displays in-flight row flow and estimated progress, refreshed periodically (about once per second in the documented interface). Instrumentation adds overhead, and progress is not an ETA.',
    'Cardinality Estimator model version': 'Showplan property identifying the CE model used for optimization. It helps correlate compatibility/CE changes with plan differences but does not diagnose the cause by itself.',
    'Legacy CE model 70': 'Legacy CE family associated with model version 70; it uses assumptions such as independence, uniformity, and simple containment. A legacy-CE override can help one query and regress others.',
    'Modern CE model 120 and later': 'Modern CE family beginning at model version 120, with changed assumptions including join containment. Latest CE is generally recommended, but compatibility upgrades require workload validation.',
    'Simple containment assumption': 'Assumes join inputs overlap after filters are applied, which can lower estimated join output. It can misestimate when filtered value domains do not overlap as assumed.',
    'Base containment assumption': 'Estimates join selectivity from base distributions before applying input filters, reflecting a different overlap model. Compare its prediction with actual filtered-domain overlap.',
    'Parameter Sensitive Plan predicate limit': 'PSP selects at most three interesting predicates per query, limiting dispatcher and variant growth. It can select fewer or none when eligibility evidence is absent.',
    'PSP equality-predicate eligibility boundary': 'PSP currently targets eligible equality predicates with parameter-sensitive cardinalities; do not assume arbitrary range, expression, or optional predicates qualify.',
    'PSP support for DML at compatibility 170': 'SQL Server 2025 at compatibility 170 expands PSP to eligible INSERT, UPDATE, DELETE, and MERGE statements. Confirm a dispatcher/variant actually appears for the statement.',
    'OPTIONAL_PARAMETER_OPTIMIZATION configuration': 'Database-scoped setting that controls OPPO. SQL Server 2025 enables it by default, but compatibility level 170 and an eligible query pattern are also required.',
    'OPPO compatibility level 170 requirement': 'OPPO requires SQL Server 2025 compatibility level 170. Meeting this prerequisite does not mean every optional predicate qualifies.',
    'DISABLE_OPTIONAL_PARAMETER_OPTIMIZATION hint': 'USE HINT option that disables OPPO for a statement and overrides the database-scoped setting; it can also be applied through Query Store hints.',
    'OPPO eligible NULL optional predicate': 'A documented eligible pattern is Column = @p OR @p IS NULL, where NULL and non-NULL states may need different scan/seek plans. Other dynamic-search forms are not guaranteed to qualify.',
    'PSP and OPPO dispatcher/variant distinction': 'Both use Multiplan dispatch, but PSP selects cardinality ranges for skewed predicates while OPPO splits eligible optional NULL states. A query can qualify for both; inspect Showplan metadata.',
    'CE feedback for expressions in SQL Server 2025': 'Learns across repeating expressions and selects more suitable CE model assumptions. SQL Server 2025 lists compatibility 160; Azure SQL Database lists 170, so verify product-specific availability.',
    'OPTIMIZED_SP_EXECUTESQL': 'SQL Server 2025 database-scoped configuration that serializes concurrent compilation for equivalent sp_executesql batches to reduce compilation storms. It addresses compilation concurrency, not execution-plan quality.',
    'DOP feedback Query Store requirement': 'Degree-of-parallelism feedback tunes eligible repeating queries and requires Query Store. Check Query Store state and feedback eligibility before expecting a learned DOP.',
    'DISABLE_PARAMETER_SNIFFING hint': 'USE HINT that disables parameter sniffing for a statement and uses generic estimates. This can avoid one bad sniffed plan while harming values that benefit from specialization.',
    'Parameter Sensitive Plan recompile boundary': 'Dispatcher plans can be rebuilt after significant distribution changes; variants can recompile independently under normal recompile conditions. A variant is not permanently fixed to its first plan.',
    'Memory grant feedback persistence': 'Supported memory grant feedback can persist learned adjustments through Query Store when Query Store is enabled in READ_WRITE mode. Eligibility and persistence do not guarantee feedback for every query.',
    'Query Store READ_WRITE mode': 'Records Query Store data and accepts management operations. Size limits can change the actual mode; monitor it to detect gaps in recent history.',
    'Query Store READ_ONLY mode': 'Retains existing Query Store data but stops recording new data. Inspect mode and reason before interpreting missing recent plans as absence of workload.',
    'Query Store wait-statistics capture': 'Configurable collection of query-associated wait categories by runtime interval. It is query-level evidence, not a complete instance wait diagnosis.',
    'Query Store size quota and cleanup': 'Configured storage quota and cleanup policy bound retained Query Store history. At capacity, capture can stop or the store can transition modes; monitor cleanup and actual status.',
    'Plan forcing versus Query Store hints': 'Forcing requests a captured plan; a Query Store hint changes supported compilation behavior. Hints can override in-text/plan-guide hints, while forcing can fail; both need monitoring and revalidation.',
    'Query Store hint failure/ignored status': 'Unsupported or contradictory hints might be ignored rather than block execution (except ABORT_QUERY_EXECUTION). Check Query Store hint status and applied Showplan attributes.',
    'Query Store hint re-evaluation after data change': 'Reassess hints and forced plans after data distribution, schema, compatibility, or workload changes; the intervention can become suboptimal as assumptions age.',
    'Query Store DML statement capture': 'Query Store captures plans for DML such as SELECT, INSERT, UPDATE, DELETE, MERGE, and BULK INSERT. It does not mean each internal operation is stored separately.',
    'Query Store excludes DDL plans': 'Query Store does not capture DDL plans such as CREATE INDEX as query plans, though it can capture underlying DML statements performed by the workload.',
    'Query Store capture mode AUTO': 'AUTO uses engine heuristics to limit low-value/noisy capture. It can omit statements, so inspect capture policy before concluding a query never ran.',
    'ABORT_QUERY_EXECUTION query hint': 'A SQL Server 2025 Query Store hint that causes a targeted query to fail rather than execute. It is an operational block control requiring careful query identification and rollback handling.',
  };
  if (custom[name]) return custom[name];
  if (/^(sys\.|SET |OPTIONAL_PARAMETER|DISABLE_|OPTIMIZED_|Legacy CE|Modern CE|Simple containment|Base containment|DOP feedback|PSP |OPPO |CE feedback|Memory grant feedback persistence|Query Store READ|Query Store wait|Query Store size|Plan forcing versus|Query Store hint|ABORT_QUERY)/i.test(name)) return `${name} is an exact SQL Server diagnostic or optimizer surface. Its availability and effect depend on engine version, compatibility level, database-scoped configuration, permission, and query eligibility; inspect the cited reference and actual Showplan/DMV state before relying on it.`;
  if (/operator|mode execution|Adaptive Join|Bitmap|Concatenation|Constant Scan|Top operator|Sequence Project|Window Aggregate|Spool|Streams|Rebind|Rewind|EndOfScans|subtree|ModelVersion|StatementOptm|convert warning|execution mode|rows per execution/i.test(name)) return `${name} is a named Showplan operator or property. Interpret it with its logical role, child/parent operators, actual rows, execution count, parallel workers, and warnings; the operator name alone does not establish a performance problem.`;
  if (/feedback|PSP|OPPO|parameter|CE |containment|OPTIMIZED_SP|Legacy CE|Modern CE|Intelligent Query/i.test(name)) return `${name} concerns optimizer estimates or parameter-dependent plan selection. Eligibility is selective and version/compatibility dependent; inspect dispatcher/variant evidence and compare representative parameter values.`;
  return `${name} is part of the named query-processing scope. Confirm its current behavior in the linked Microsoft documentation and interpret it in the context of the full statement, plan properties, runtime rows, and workload. No single icon, warning, estimate, or hint is a complete diagnosis.`;
};

const refs = [
  ['plan-shapes-and-operators', 'plan-shapes-and-operators', 'Estimated and actual plans, operators, and execution properties', u.operators],
  ['cardinality-and-parameter-sensitivity', 'cardinality-and-parameter-sensitivity', 'Estimation, parameter effects, and adaptive compilation', u.iq],
  ['query-store-and-diagnostics', 'query-store-and-diagnostics', 'Plan history, regressions, and repeatable diagnosis', u.qs],
];
const sourceList = [...new Set(Object.values(u))].map(x => `- [Microsoft Learn](${x})`).join('\n');
const title = manifest.title;
const target = 'course/lessons/t03-009';
await fs.mkdir(target, {recursive:true});
const write = (name, body) => fs.writeFile(`${target}/t03-009-${name}.md`, body.trimEnd()+'\n');
const namesIn = id => manifest.inventory.find(g => g.id === id).items;
for (const [task, groupId, groupTitle, defaultSource] of refs) {
  const rows = namesIn(groupId).map(name => `| \`${esc(name)}\` | ${explain(name)} ([source](${sourceFor(name) || defaultSource})) |`).join('\n');
  await write(`reference-${groupId}`, `# ${title} — Reference: ${groupTitle}

# Scope and version

Targets SQL Server 2025 (17.x), with compatibility and eligibility boundaries called out separately. Azure SQL products can expose different release/update policies. These are the exact names frozen for this reference group; consult the cited Microsoft reference for operators and options outside this curated list.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
${rows}

# How to use this reference

Read the plan from data-producing leaves toward the root, then trace what drives repeated work from root toward leaves. Compare estimated and actual rows at the first divergence; check executions, rows read versus returned, memory grant/spills, and runtime evidence. A seek, scan, warning, or high estimated cost is a clue, not a verdict.

# How this group fits the mental model

This inventory names the plan, estimate, or diagnostic surface needed to explain a query's behavior. Connect each property to a question: what did the optimizer predict, what happened at runtime, and where did the difference begin?

# Cross-item comparison

Estimated rows describe the forecast; actual rows describe one execution. A seek predicate navigates a key range; a residual predicate filters rows after access. A plan hash describes a shape; Query Store runtime intervals describe observed workload behavior. Use pairs together instead of treating any one as a score.

# Examples

If a Nested Loops inner seek executes 80,000 times, inspect Actual Executions and rows per execution even if the icon looks selective. If estimated rows at an upstream filter are 5 but actual rows are 40,000, trace statistics, parameter values, and predicates before blaming the downstream Hash Match spill.

# Common mistakes

- Calling every scan bad or every seek good.
- Comparing estimated subtree cost to elapsed milliseconds.
- Reading plan arrows as invocation direction; graphical flow and pull execution direction differ.
- Treating a warning as proof of a fix without checking the operator and runtime impact.

# Knowledge checks with answers

1. What is the earliest useful location for an estimate diagnosis? The first consequential estimated/actual row divergence.
2. Does an actual plan generalize to all values? No; it records one execution context.
3. What does a residual predicate imply? Rows can be read before the predicate rejects them; compare rows read and returned.

# Sources

${sourceList}`);
}

await write('overview', `# ${title} — Big-picture orientation and mental model

# Problem and purpose

SQL Server translates declarative T-SQL into a physical execution strategy. The optimizer predicts cardinalities and costs, but one cached plan can behave very differently as parameter values, data distributions, or workload conditions change. Reliable tuning requires linking plan structure to runtime evidence and history.

# Plain-language mental model

Treat a plan as a hypothesis about how to produce a result. The estimated plan is the optimizer's forecast. An actual plan adds observations from one execution. Query Store is the flight recorder: it preserves query, plan, and runtime history that the plan cache alone cannot retain. Start at the earliest estimate error or expensive repeated operation, then test one cause at a time.

# How the parts fit together

1. Capture the exact statement, parameter values, compatibility level, SET options, and representative workload context.
2. Compare estimated and actual plans; read physical operators with their properties and child inputs.
3. Find the first important row-estimate divergence, then test statistics, skew, parameter sensitivity, conversions, and query shape.
4. Compare CPU, elapsed time, logical reads, waits, memory grants, spills, and executions across representative parameter classes.
5. Use Query Store to establish whether plan choice changed over time; test a fix and keep rollback/monitoring ready.

# Concept map

| Question | Evidence | Limit |
| --- | --- | --- |
| What strategy did optimizer compile? | Estimated plan / Showplan XML | Estimates only; no runtime observations |
| What happened on this execution? | Actual plan, STATISTICS IO/TIME, Live Query Statistics | One execution context is not the workload |
| Why was a join/access path chosen? | Cardinality estimates, statistics, operator properties | Cost is an estimate, not wall-clock truth |
| Does one parameter change the plan needs? | Parameter classes, dispatcher and variants, Query Store | PSPO/OPPO are eligibility-driven, not guaranteed |
| Did performance regress with a plan change? | Query Store plans, intervals, runtime and wait statistics | Correlation does not isolate data/concurrency changes |

# End-to-end walkthrough

Suppose \`Orders\` has 40 million rows. \`CustomerId = @id\` selects 1 row for most customers but 500,000 for a few. The query uses a cached plan compiled for a rare customer and performs many key lookups for a large customer. First compare actual and estimated rows at the seek and lookup, then test both parameter classes with consistent reads and CPU. Check whether SQL Server 2022+ PSPO created a dispatcher/variants; if not, inspect eligibility and statistics rather than assuming the feature must engage. Use Query Store to compare plan/runtime history. Recompile, rewrite, or a targeted Query Store hint is an experiment with compile, stability, and lifecycle costs—not the default first fix.

# Version and platform boundaries

SQL Server 2025 PSP improvements require compatibility level 170 for DML support and multiple eligible predicates from one table; the feature remains selective and at most three predicates are chosen. OPPO requires compatibility 170 and its database-scoped configuration. CE feedback for expressions is available in SQL Server 2025 at compat 160, whereas Azure SQL Database uses compat 170. \`OPTIMIZED_SP_EXECUTESQL\` is a SQL Server 2025 addition. Validate exact deployment/update policy and feature state. [IQP matrix](${u.iq}) · [PSP](${u.psp}) · [OPPO](${u.oppo}).

# When to use it and tradeoffs

Use estimated plans to inspect optimizer choices without executing, actual plans to explain a completed run, live statistics for a currently executing query, and Query Store to compare across intervals. Each adds overhead or limited context; select evidence that answers the question and compare representative runs.

# What later lessons cover

Index selection and maintenance live in t03-008; SELECT semantics in t03-005; joins in t03-006; locking and deadlocks in t03-010; Query Store/wait operational practice is expanded in t03-013.

# Sources

${sourceList}`);

await write('concepts', `# ${title} — Core concepts and how they fit together

# Learning objectives

Distinguish estimated, actual, and live plans; read common operators and properties without treating icons as diagnoses; locate estimate divergence; explain parameter sniffing, PSPO, and OPPO; use Query Store for durable comparison; and measure changes with repeatable runtime evidence.

# Prerequisites

Know SELECT, joins, predicates, indexes, statistics basics, and SQL Server parameterized statements. Index design is in t03-008; detailed waits/locking are covered elsewhere.

# Core concepts

The optimizer receives query text, schema/index metadata, statistics, parameter/context information, and engine rules. It explores a bounded search space and chooses a good plan using estimated row counts and a cost model. It does not prove global optimality or promise a particular operator. SQL is declarative: logical result requirements do not specify the physical join order or access method.

# Plans are trees, not ranked icon lists

Graphical arrows show data flow from right to left; execution demand is pull-driven from the root toward children. Read leaf access, then transformations/joins/aggregates, then the root. Logical operators describe required relational work; physical operators implement it. A table scan can be best for a small table or broad result. An index seek can read a broad range, apply a residual predicate, and perform a lookup thousands of times. Operators must be understood with predicates, rows, executions, rebinds/rewinds, workers, memory, and warnings.

An estimated plan is compiled without execution. An actual plan includes runtime data for one completed execution. Live Query Statistics adds in-flight row flow and progress estimates and refreshes periodically with instrumentation overhead. Never compare an actual plan from one parameter to an estimated plan compiled under another context without recording that difference.

# Find the first consequential cardinality error

Compare estimated versus actual rows at operators that feed joins, lookups, sorts, aggregates, and memory-consuming operators. The earliest large mismatch often propagates downstream: a join chosen for 10 rows may be disastrous when it receives 100,000; an overestimate can request too much memory or choose excessive parallelism. Check row counts, execution count, and rows read versus returned. Other causes include stale/sampled statistics, skew, correlation assumptions, implicit conversions, non-SARGable expressions, unknown values, table-valued functions, and parameter-sensitive distributions.

The cost model is useful for choosing among alternatives but estimated subtree cost is not actual duration and cannot be compared as an absolute benchmark across different plans/environments. Use STATISTICS IO/TIME, actual rows, CPU, elapsed time, memory grant/spill details, and representative executions.

# Parameter behavior: three distinct tools

**Parameter sniffing** uses compile-time parameter values to produce a reusable plan. It is beneficial if future values have similar needs. **PSP optimization** can generate a dispatcher and child variants for eligible skewed equality predicates; dispatcher boundaries come from statistics, candidate selection is limited, and variants still need runtime validation. SQL Server 2025 compat 170 expands PSP to eligible DML and can select multiple predicates from one table, with a maximum of three total. **OPPO** addresses eligible optional predicates such as \`(@p IS NULL OR col = @p)\`, routing NULL and non-NULL cases to variants because one seek plan may not be valid for both. It requires compat 170 and \`OPTIONAL_PARAMETER_OPTIMIZATION\`.

These mechanisms do not cover arbitrary dynamic search patterns. OPTION(RECOMPILE) can compile for current values but costs CPU; OPTIMIZE FOR, DISABLE_PARAMETER_SNIFFING, or a Query Store hint intentionally alters optimization assumptions and can age badly. Prefer evidence and address a root cause such as statistics or query shape first.

# Query Store versus plan cache

The plan cache is an evictable in-memory store of reusable compiled plans. Query Store persists query/plan and interval runtime history and can capture waits; SQL Server 2022+ enables it by default for new databases in read-write mode. It exposes plan regressions and supports plan forcing and Query Store hints, which have different mechanisms: forcing requests a captured plan; a hint alters compilation behavior. Both can fail, override expectations, or turn harmful after data/schema/compatibility changes. Query Store hints override in-text and plan-guide hints; unsupported or contradictory hints may be ignored (ABORT_QUERY_EXECUTION intentionally blocks execution).

# Repeatable diagnosis loop

1. Define a performance objective and collect same-workload baselines.
2. Reproduce with representative parameter values and plan-affecting session/database settings.
3. Locate earliest estimate error or runtime-heavy operator; measure logical reads, CPU, elapsed time, memory, spill, and waits.
4. Check Query Store for plan changes and interval/capture gaps; compare normalized query identity and plan hashes cautiously.
5. Change one thing, rerun all parameter classes, and evaluate total system impact, not one screenshot.
6. Remove temporary hints/forcing when no longer justified; record owner, rationale, alerts, and revalidation date for retained controls.

# Current feature boundaries

Compatibility 170 affects many SQL Server 2025 capabilities but not every feature has the same minimum level. CE feedback for expressions specifically lists SQL Server 2025 compat 160, while Azure SQL Database lists 170. OPPO uses compat 170; PSP core started in SQL Server 2022 compat 160, with SQL Server 2025 compat 170 expansions. DOP feedback requires Query Store. Check current product matrix and scoped configuration, then test plan regressions.

# Mechanisms and relationships

Statistics inform cardinality; cardinality feeds operator cost, memory grants, join selection, and parallelism. A downstream spill may therefore originate in an earlier estimate error. Query Store records outcomes across time; it does not itself explain why the estimate was wrong. PSPO and OPPO add a dispatcher/variant layer to eligible query compilation, while Query Store forcing and hints are administrator controls applied to plan generation.

# Worked examples

For an optional search parameter, \`WHERE (@p IS NULL OR Status = @p)\`, the NULL case may require a broad scan and the non-NULL case may use a selective seek. OPPO can split eligible states into variants at compatibility 170. For skewed customer IDs with equality predicates, PSP can bucket cardinality ranges. In both cases check Showplan and Query Store for the actual dispatcher/variants, then measure NULL, common, and rare values.

# Misconceptions and edge cases

- Parameter sniffing is not inherently a defect; it often improves plans.
- New compatibility level enables eligibility but cannot make every query eligible or guarantee better performance.
- A histogram on one column does not describe arbitrary correlation between columns.
- Recompilation can fit current values but repeated compile CPU may harm throughput.
- A query hint can be ignored or become stale when data distribution, schema, or plan validity changes.

# Knowledge checks with answers

1. What is the core PSP issue? One reusable plan can fit poorly when parameter values imply very different cardinalities.
2. What does OPPO split? Eligible optional-parameter NULL and non-NULL states.
3. Why compare Query Store history? To distinguish a current regression from long-standing query behavior and plan changes.

# Sources

${sourceList}`);

await write('practice', `# ${title} — Exercises and worked solutions

# Goals

Use execution evidence to distinguish access-path, estimate, parameter, memory, and plan-history causes. Every exercise asks for a testable diagnosis, not a magic hint.

# Worked example

A parameterized report runs quickly for most customers but slowly for a few large customers. Capture Query Store intervals and plans, then execute the same statement with representative low/medium/high-cardinality values while recording compile context, actual plan, actual/estimated rows, logical reads, CPU, duration, grant, spills, and concurrency. If a plan is compiled on a small customer and reused for a large one, test PSP eligibility and dispatcher variants. Do not force the large-customer scan for all customers. Compare a supported automatic variant strategy, an alternative query shape, or controlled recompile against the same workload and write down compile overhead and stability.

# Exercises

1. An estimated plan shows a seek and actual plan shows 400,000 rows plus 400,000 lookups. Explain why “seek” did not make this cheap.
2. A Hash Match spills after receiving 50 times its estimated rows. Identify the earliest evidence to inspect and propose a safe experiment.
3. The actual plan's first estimate mismatch is at a filter on two correlated columns. Explain why a single-column histogram can miss the joint distribution.
4. One cached query plan is good for most account IDs and poor for a handful. Compare parameter sniffing, PSP, recompile, and Query Store plan forcing.
5. A search query uses \`(@status IS NULL OR status = @status)\`. Explain the seek/scan validity conflict and OPPO prerequisites.
6. A team changes compatibility from 160 to 170 and reports a regression. Give a rollout and Query Store rollback strategy.
7. A query has high estimated subtree cost but low elapsed time; another has low cost but high duration. Explain the difference and evidence needed.
8. A plan shows an implicit conversion and a warning. Determine how to verify which side converts, whether it affects seekability, and what data types should be aligned.
9. A Query Store forced plan is no longer successful after index changes. What should the operator inspect, and what is the rollback path?
10. A memory grant is ten times larger than peak used memory, reducing concurrency. Compare grant feedback, estimate correction, and an explicit hint.
11. Compilation CPU spikes for many concurrent identical \`sp_executesql\` batches on SQL Server 2025. Identify the release feature and its scope.
12. An actual plan shows parallel exchange skew. Explain why MAXDOP alone may not fix it.

# Progressive hints

1. Multiply per-row lookup work by actual execution count; compare rows read with rows returned.
2. Find the first divergence, not just the spill icon; check stats, skew, predicates, and value class.
3. Histograms are limited; multi-column density is not a joint histogram.
4. Separate the general sniffing behavior from eligibility-driven PSP and the operational override of forcing.
5. A seek plan must remain correct when the optional parameter is NULL.
6. Use Query Store before and after, test representative parameters, and keep a compatibility rollback plan.

# Complete solutions

1. The seek can locate a broad range; the residual filter may discard rows only after reading them. Each actual qualifying row may trigger a lookup. Compare total logical reads with a scan or covering alternative; “seek” describes navigation, not total work.
2. Compare estimated/actual rows at the filter and its inputs, then inspect statistic freshness/distribution, predicate conversions, and parameter context. Correct the estimate cause or test eligible memory-grant feedback; verify repeated executions and concurrency. Do not begin by blindly increasing grants.
3. If predicates correlate, independence assumptions can multiply selectivities as if columns were independent. Inspect multi-column stats/density and actual distribution; test suitable statistics or query formulation and compare estimates across values.
4. Sniffing reuses the first compiled plan; PSP may build a dispatcher and variants for eligible skewed equality predicates. Recompile specializes each execution at compile cost. Query Store forcing pins a known plan and can fail or become stale. Test all options over the parameter distribution and monitor lifecycle/compile cost.
5. When status is NULL, the predicate is true for all rows and a scan may be needed; when non-NULL, seek may be better. OPPO in SQL Server 2025 requires compat 170 and enabled \`OPTIONAL_PARAMETER_OPTIMIZATION\`, and only eligible forms receive dispatcher variants. Verify actual variant metadata and runtime benefit.
6. Baseline Query Store plans/runtime/waits, stage compatibility change, replay representative workload, monitor regressions, and use Query Store plan forcing only as a temporary targeted mitigation when the prior plan is still valid. Roll back compatibility or clear forcing/hints according to the tested plan; retain evidence and revalidate after updates.
7. Subtree cost is a relative optimizer estimate from its model, not elapsed time. Compare logical/physical reads, CPU, waits, duration, parameter, concurrency, and plan operators; environmental waits or underestimation can reverse observed ranking.
8. Identify the convert expression in Showplan XML and actual predicate, compare declared/column types and collation, then test a correctly typed parameter/literal. Conversion on the indexed column can impair seekability; confirm with plan properties and reads rather than assuming every warning has the same effect.
9. Check forcing failure reason/state, plan validity, schema/index changes, compatibility and Query Store read/write/capacity. Unforce the stale plan or restore a validated plan; compare current unforced behavior and replace the force only after testing.
10. Check actual row estimates, operator memory requirements, grant feedback eligibility/persistence, and Query Store state. Fix row estimates where possible; feedback may converge over executions. Explicit grant hints can harm other values/concurrency and require revalidation.
11. SQL Server 2025 \`OPTIMIZED_SP_EXECUTESQL\` can serialize equivalent concurrent \`sp_executesql\` compilation work to reduce compilation storms. Validate its database-scoped configuration, application workload, and compile/runtime measurements.
12. Exchanges redistribute rows; one worker may receive a disproportionate share because of key/data skew or distribution requirements. Inspect per-thread rows and upstream estimates/keys, then address skew/query shape. MAXDOP changes worker count but cannot remove a fundamentally uneven distribution and may worsen CPU or latency.

# Tests and edge cases

- Include NULL and non-NULL optional parameter values, common and rare skew values, empty and large result sets.
- Compare estimates with actual row counts at every major join/filter boundary.
- Separate compile CPU, execution CPU, elapsed time, reads, waits, grants, and spills.
- Test changes under representative concurrency and with the intended compatibility level/SET options.
- Check Query Store capture mode, read-write state, storage cap, cleanup policy, and plan-force/hint status before drawing conclusions from gaps.

# Reflection questions

Where did the first consequential estimate error occur? Which metrics prove the query improved? Which parameter class might regress? How will you detect and retire an override? Which evidence is durable in Query Store versus transient in the plan cache?

# Sources

${sourceList}`);

await write('interview', `# ${title} — Interview questions and reasoning

# Core questions

1. What inputs shape the SQL Server optimizer's plan choice?
2. Estimated versus actual execution plan?
3. Why is an index seek not inherently faster than a scan?
4. Logical versus physical operator?
5. How do you locate the first important cardinality error?
6. What is parameter sniffing, and when is it beneficial?
7. PSP versus OPPO?
8. When is OPTION(RECOMPILE) appropriate, and what does it cost?
9. Query Store versus plan cache?
10. Plan forcing versus Query Store hints?
11. What does a spill or large memory grant tell you?
12. How do compatibility level and IQP features affect rollout?
13. Why are query hash and plan hash useful but insufficient?
14. How would you safely tune a plan regression in production?

# Concise interview answers

1. Query text/shape, schema and indexes, statistics, parameter/context information, and optimizer cost/heuristics.
2. Estimated is compilation output without runtime observations. Actual adds one completed execution's runtime context; neither proves behavior for all parameter values.
3. A seek can read a wide range, filter residually, or trigger many lookups; a scan can be cheaper for broad results or small tables.
4. Logical states required relational operation; physical describes implementation algorithm selected by the optimizer.
5. Compare estimated and actual rows from leaves toward root; find earliest mismatch before interpreting downstream join, lookup, sort, or grant costs.
6. A compile-time value informs reusable-plan estimates. It is beneficial for representative values and problematic with materially different cardinalities.
7. PSP variants address eligible cardinality skew (primarily equality predicates); OPPO routes eligible optional NULL/non-NULL predicate states. They share adaptive Multiplan infrastructure but solve different patterns and have distinct eligibility.
8. It specializes estimates/plan for each execution and can solve a skew case, but adds compilation CPU, so measure total workload and frequency.
9. Plan cache is transient and stores reusable compiled plans; Query Store persists query, plan, runtime interval, and optionally wait history.
10. Forcing requests a historical plan; Query Store hints alter compile behavior without changing SQL text. Both need monitoring, may fail/be ignored, and can age badly.
11. Spill suggests insufficient grant for an operator's runtime needs, often from estimate error; a large unused grant can reduce concurrency. Inspect actual rows, requested/granted/used memory and feedback eligibility.
12. Compatibility makes release features eligible but can change plans broadly. Stage it, compare Query Store baselines, replay representative parameter values, and keep a rollback path.
13. Hashes help group query/plan shapes, but do not encode parameter distribution, runtime resources, data state, or guarantee collision-free identity.
14. Establish baseline and parameter classes, inspect plan/runtime/Query Store evidence, isolate one cause, test a reversible change, monitor total workload and remove temporary controls when no longer needed.

# Deep follow-up answers

A scan is not inherently wrong: optimizer choice depends on qualifying rows and required columns. Conversely, a seek followed by many lookups can read more pages than a scan. Count rows/executions and logical reads, then use actual plans to see residual predicates and lookup work.

PSP and OPPO do not create arbitrary plans for every input. PSP uses statistics to select a limited set of at-risk predicates and ranges; OPPO detects eligible optional NULL patterns. In SQL Server 2025, PSP supports eligible DML and multiple predicates per table at compat 170, up to three total. OPPO requires compat 170 and its scoped configuration. Always verify actual dispatcher/variant evidence.

Hints are controls with an owner and expiry condition. Before forcing/hinting, check query shape, statistics, indexes, compatibility, parameter distributions, and waits. Query Store can retain the intervention and history, but changed data or schema may invalidate its assumptions.

# Scenario questions

**A production query became slow immediately after deployment.** Compare Query Store plan/runtime history before and after; confirm same query, parameter classes, data volume, SET options, and infrastructure. Find the earliest estimate/plan divergence, test the previous plan against current data and schema, use a reversible targeted mitigation only if validated, and monitor its success/failure state and expiry criteria.

# Tradeoffs and alternatives

Query Store forcing is fast to apply and avoids changing application SQL, but pins a plan whose assumptions may age. Query Store hints can target compilation behavior without a code release, but they need ownership and revalidation. Query rewrites or schema/statistics changes address causes more directly but require deployment and broad regression tests. Recompile specializes per run but consumes compile CPU.

# Common weak answers

- “A seek is always faster than a scan.”
- “Parameter sniffing is a bug; disable it everywhere.”
- “The plan says 90% cost, so this is where the wall-clock time went.”
- “Raise compatibility and the optimizer will fix the workload.”
- “Force the old plan permanently without checking whether data or schema changed.”

# Self-check rubric

Score each response 0–2: (0) names a tool without evidence, (1) identifies relevant evidence but misses context/cost, (2) compares representative parameter values, plan properties, runtime metrics, Query Store history, feature eligibility, and a reversible validation/monitoring path. A strong answer treats the plan as evidence, not a verdict.

# Sources

${sourceList}`);

console.log(`Wrote ${refs.length} exact-inventory references covering ${allNames.length} plan/estimation/diagnostic items plus overview, concepts, practice, and interview.`);
