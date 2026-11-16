import fs from 'node:fs/promises';
const mp='curriculum/manifests/sql-server/t03-010.json';
const m=JSON.parse(await fs.readFile(mp,'utf8'));
const s={guide:'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17',iso:'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17',opt:'https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17',dead:'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17',locks:'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-tran-locks-transact-sql?view=sql-server-ver17',wait:'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-waiting-tasks-transact-sql?view=sql-server-ver17',versions:'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17',active:'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-active-snapshot-database-transactions-transact-sql?view=sql-server-ver17',app:'https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17',release:'https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-releaseapplock-transact-sql?view=sql-server-ver17',xact:'https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17',tran:'https://learn.microsoft.com/en-us/sql/t-sql/functions/trancount-transact-sql?view=sql-server-ver17',abort:'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17',news:'https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17'};
m.sourceSnapshot={...m.sourceSnapshot,authority:'Microsoft SQL Server transactions, locking, row versioning, deadlock, and optimized-locking documentation',edition:'SQL Server 2025 (17.x), checked 2026-11-16',checkedAt:'2026-11-16',urls:[...new Set([...m.sourceSnapshot.urls,...Object.values(s)])]};
m.comparisonSources=[...new Set([...(m.comparisonSources??[]),...Object.values(s)])];
m.versionNotes=[{edition:'SQL Server 2025 optimized locking',items:['SQL Server 2025 supports optimized locking but leaves it disabled by default per database; ADR is required first. Azure availability/defaults differ.','TID locking shortens row/page lock lifetimes. LAQ requires RCSI and READ COMMITTED; incompatible hints, isolation, statements, and table types can disable it.','Optimized locking reduces DML lock pressure but not schema locks, writer conflicts, all deadlocks, or application correctness requirements.'],sourceUrls:[s.news,s.opt,s.guide,s.iso]}];
const add=(id,x)=>{const g=m.inventory.find(y=>y.id===id);g.items=[...new Set([...g.items,...x])];};
add('transaction-and-isolation',['SET TRANSACTION ISOLATION LEVEL syntax','RCSI statement-level snapshot','Snapshot transaction-level snapshot','Snapshot update conflict error 3960','Snapshot isolation across multiple databases','SET IMPLICIT_TRANSACTIONS','XACT_ABORT and uncommittable transaction','TRY/CATCH rollback with XACT_STATE','Savepoint rollback does not end transaction','NOLOCK still takes schema stability locks','Lock timeout is not deadlock detection','RCSI does not eliminate writer conflicts','Serializable requires usable range index for key-range locks','Version store retention from oldest active snapshot','ADR persistent version store placement']);
add('locks-blocking-and-deadlocks',['Lock compatibility matrix','Lock conversion deadlock','Update lock conversion purpose','Intent locks communicate lower-level locks','Lock escalation threshold and table-level target','ROWLOCK does not prevent escalation','Lock escalation extended event','Blocking versus deadlock distinction','Deadlock error 1205 victim rollback','Deadlock victim cost and priority selection','Deadlock retry must restart whole transaction','xml_deadlock_report Extended Event','system_health captures deadlock reports by default','Deadlock graph victim/process/resource lists','Deadlocks can involve workers memory and exchanges','Application lock resource case sensitivity','Application lock owner transaction versus session','sp_getapplock return codes','Application lock acquisition order','sys.dm_exec_requests blocking_session_id']);
add('row-versioning-and-optimized-locking',['Optimized locking availability by SQL platform','OPTIMIZED_LOCKING database option','Accelerated database recovery prerequisite','Optimized locking disabled by default on SQL Server 2025','TID XACT lock lifetime','TID row/page lock release behavior','LAQ requires RCSI and READ COMMITTED','LAQ evaluates latest committed version','LAQ predicate requalification after concurrent update','LAQ statement restart event lock_after_qual_stmt_abort','LAQ disabled by conflicting lock hints','LAQ unsupported for MERGE','LAQ unsupported with OUTPUT or variable assignment','LAQ unsupported on columnstore updates','Skip Index Locks optimization','Optimized locking does not remove schema locks','Optimized locking tempdb and temporary table boundary','Optimized locking XACT wait types','READCOMMITTEDLOCK forces locking under RCSI','UPDLOCK and HOLDLOCK reduce optimized locking benefits','RCSI optimized locking strict-order behavior change','sys.databases is_optimized_locking_on','DATABASEPROPERTYEX IsOptimizedLockingOn']);
m.scopeExclusions=[...new Set([...(m.scopeExclusions??[]),'This lesson focuses on transaction and concurrency semantics; detailed DML syntax remains in t03-006.','Optimized-locking platform availability and default settings differ; verify actual per-database settings.'])];
await fs.writeFile(mp,JSON.stringify(m,null,2)+'\n');
const detail={
'BEGIN TRANSACTION':'Starts an explicit transaction; locks and modifications remain until the outermost COMMIT or full ROLLBACK.','COMMIT TRANSACTION':'Decrements @@TRANCOUNT; only the outermost COMMIT commits. An inner COMMIT is not independently durable.','ROLLBACK TRANSACTION':'Without a savepoint name, rolls back the whole transaction and resets @@TRANCOUNT.','SAVE TRANSACTION':'Creates a partial rollback marker inside a local committable transaction; it is not a nested transaction.','@@TRANCOUNT':'Nesting counter, not a committability indicator. Pair with XACT_STATE.','XACT_STATE':'Returns 1 committable, -1 uncommittable, 0 no transaction. State -1 requires full rollback.','SET XACT_ABORT':'ON makes many run-time errors terminate and roll back the transaction; THROW honors it, RAISERROR does not.','Read uncommitted':'Permits dirty/inconsistent reads that may later roll back.','Read committed':'Default isolation. Locking reads use S locks when RCSI is off; with RCSI on, reads normally use statement-start versions. Writers still conflict.','Read committed snapshot isolation (RCSI)':'READ COMMITTED statement-level committed snapshot; lowers reader/writer blocking but statements in one transaction can see different commits.','Repeatable read':'Retains locks on rows already read, preventing their changes but allowing new qualifying rows (phantoms).','Snapshot isolation':'Transaction-level row-versioned view; requires ALLOW_SNAPSHOT_ISOLATION ON and may abort a same-row conflict.','Serializable isolation':'Protects predicate ranges against phantoms with suitable indexed range access; increases blocking risk.','Dirty read':'Read of uncommitted data that may change or roll back.','Nonrepeatable read':'Same row has a different value on a second read after another transaction commits an update.','Phantom read':'A repeated predicate returns a changed set because another transaction inserts/deletes qualifying rows.','Lost update':'Concurrent read-modify-write overwrites another change; use atomic updates or conflict protection.','Write skew':'Snapshot transactions modify different rows based on a shared invariant, jointly violating it; SNAPSHOT is not SERIALIZABLE.','Accelerated Database Recovery persistent version store':'With ADR, row versions use database PVS rather than tempdb’s traditional version store.','Snapshot update conflict':'Usually error 3960: snapshot transaction updates a row changed since its snapshot; restart the whole transaction.','Transaction retry boundary':'Retry the whole logical unit in a fresh transaction with bounded backoff and idempotent side effects.','Shared lock (S)':'Compatible with readers and conflicts with X; duration depends on isolation/RCSI.','Update lock (U)':'Compatible with S, but only one U per resource; reduces a common S-to-X conversion deadlock.','Exclusive lock (X)':'Protects modifications from conflicting access; optimized locking can release row/page X locks earlier.','Intent shared lock (IS)':'Ancestor marker that finer-grained shared locks exist or are intended.','Intent exclusive lock (IX)':'Ancestor marker for finer-grained exclusive locks.','Schema stability lock (Sch-S)':'Protects metadata during compile/execution and conflicts with Sch-M. NOLOCK still takes Sch-S.','Schema modification lock (Sch-M)':'Exclusive metadata lock; blocks Sch-S readers, including NOLOCK queries.','Key-range lock':'Serializable lock on an indexed key interval preventing qualifying phantom inserts.','Lock escalation':'Replaces many fine locks with a coarser table/HoBT lock; can increase blocking. Optimized locking makes it less likely, not impossible.','Blocking session':'Session holding a resource another needs; it may be idle with an open transaction. Find the head blocker.','Blocked request':'Request waiting on a resource; capture wait/resource, blocker, SQL, and transaction age.','Blocking chain':'Wait dependency chain; address the head blocker, not only a downstream waiter.','Deadlock cycle':'Circular wait-for dependency that the monitor detects and breaks.','Deadlock victim':'Transaction chosen and rolled back to resolve a cycle; client receives 1205.','Deadlock graph':'XML victim/process/resource lists; inspect owned/requested modes, SQL, resource order, and indexes.','Deadlock priority':'LOW/NORMAL/HIGH or -10..10 influences victim preference, not cycle prevention.','Lock timeout':'Wait bound; timeout is not a deadlock and does not guarantee the surrounding transaction is clean.','SET LOCK_TIMEOUT':'Session timeout in milliseconds; -1 waits indefinitely, 0 returns immediately when blocked.','sp_getapplock':'Acquires an application-named resource. Names are binary/case-sensitive; transaction ownership requires an active transaction.','sp_releaseapplock':'Explicitly releases an application lock; transaction locks also release at commit/rollback.','sys.dm_tran_locks':'Live currently granted/waiting lock requests; not historical telemetry.','sys.dm_os_waiting_tasks':'Live waiting task/resource/blocker evidence; parallel requests can have multiple task rows.','Extended Events deadlock report':'Use xml_deadlock_report; system_health captures it by default, with bounded retention.','Read committed snapshot isolation (RCSI)':'Database option gives each READ COMMITTED statement its own committed snapshot, not one snapshot for a transaction.','Snapshot transaction sequence number':'XSN identifies version visibility boundary; active snapshot DMVs help locate version-retaining transactions.','Versioned read':'Reads a committed image visible at statement start (RCSI) or transaction snapshot (SNAPSHOT).','Write-write conflict':'Row versioning does not silently permit conflicting writers; they block or one aborts.','Optimized locking':'SQL Server 2025 per-database TID locking and LAQ features reduce DML lock memory; requires ADR.','Transaction ID (TID) locking':'Retains one XACT transaction lock while releasing many row/page locks sooner.','Lock After Qualification (LAQ)':'With optimized locking+RCSI+READ COMMITTED, evaluates DML predicate on latest committed row before locking qualifying rows.','READCOMMITTEDLOCK hint':'Requests locking READ COMMITTED for a table under RCSI; can reintroduce blocking and disable LAQ there.','NOLOCK hint dirty-read risk':'Allows dirty, missing, duplicated, or changing rows; still takes Sch-S.','Row-version retention':'Versions remain until no active snapshot needs them; long transactions delay cleanup.','Version-store cleanup':'Background reclaim of obsolete versions; inspect old snapshots/ADR state. Full version-store scans can be expensive.','Optimized-locking eligibility boundary':'SQL Server 2025 opt-in + ADR; LAQ also needs RCSI/READ COMMITTED. Cloud defaults and exclusions differ.'};
Object.assign(detail,{
'RCSI statement-level snapshot':'Each READ COMMITTED statement sees committed versions from its own start time; multiple statements in one transaction can observe different commits.','Snapshot transaction-level snapshot':'Statements share a transaction-level committed view established at first data access, plus the transaction’s own modifications.','Snapshot isolation first data access boundary':'Snapshot visibility begins when the transaction first accesses data, not merely at BEGIN TRANSACTION.','Snapshot isolation across multiple databases':'ALLOW_SNAPSHOT_ISOLATION must be ON in every database the transaction accesses; it does not create a distributed snapshot.',
'SET IMPLICIT_TRANSACTIONS':'Automatically starts transactions for qualifying statements; explicitly commit/rollback before reusing a pooled connection.','XACT_ABORT and uncommittable transaction':'XACT_ABORT changes many run-time error outcomes; CATCH must inspect XACT_STATE because an active transaction can be doomed.','TRY/CATCH rollback with XACT_STATE':'In CATCH, fully roll back when XACT_STATE is nonzero; -1 cannot commit or roll back to a savepoint. Rethrow after cleanup.','Savepoint rollback does not end transaction':'Rollback to savepoint leaves transaction active and @@TRANCOUNT unchanged; it cannot restore a doomed transaction.','NOLOCK still takes schema stability locks':'NOLOCK skips data S locks, not Sch-S. DDL Sch-M still conflicts.','Lock timeout is not deadlock detection':'Timeout means a wait exceeded LOCK_TIMEOUT; no cycle is required and an enclosing transaction may remain active.','RCSI does not eliminate writer conflicts':'Versioned reads reduce reader/writer waits; writers still serialize or fail on conflicts, and metadata locks remain.','Serializable requires usable range index for key-range locks':'Key-range protection requires SERIALIZABLE and an index whose key covers the predicate range; access shape affects lock scope.','Version store retention from oldest active snapshot':'An old active snapshot can hold needed versions and delay cleanup. Find oldest snapshot transactions/XSN before blaming a leak.','ADR persistent version store placement':'ADR stores row versions in the database PVS rather than tempdb traditional version store; monitor user-database capacity and cleanup.',
'Lock compatibility matrix':'Compatibility depends on exact granted/requested modes on the same resource. Use the documented matrix, including intent modes.','Lock conversion deadlock':'Two sessions can each hold S and wait to convert to X; U locks reduce one common conversion cycle. Consistent resource ordering is broader prevention.','Update lock conversion purpose':'Only one U lock can be held per resource; it allows S readers but serializes a prospective updater before X conversion.','Intent locks communicate lower-level locks':'IS/IX/SIX on ancestors advertise descendant locks so the engine can test coarse-level compatibility efficiently.','Lock escalation threshold and table-level target':'Escalation can occur on documented lock-count or memory thresholds and takes a coarser object/HoBT lock; optimized locking lowers likelihood but does not guarantee none.','ROWLOCK does not prevent escalation':'ROWLOCK only influences initial lock acquisition. It does not prohibit escalation and can increase lock overhead.','Lock escalation extended event':'The lock_escalation event captures escalation activity for correlation with statement, object, and workload.','Deadlock victim cost and priority selection':'Generally the least rollback-cost transaction is selected unless priorities differ; lower DEADLOCK_PRIORITY loses.','Deadlock retry must restart whole transaction':'Retry the full business operation in a fresh transaction with bounded backoff and idempotent external side effects.','xml_deadlock_report Extended Event':'Recommended structured deadlock event; avoid older SQL Profiler deadlock graph capture for current deployments.','system_health captures deadlock reports by default':'Default system_health captures xml_deadlock_report, but its retention is bounded; persist critical events separately.','Deadlock graph victim/process/resource lists':'Victim list identifies chosen process, process list shows statements/modes, resource list exposes owned/requested resources and cycle.','Deadlocks can involve workers memory and exchanges':'Cycles can involve locks, worker threads, memory grants, parallel exchanges, MARS mutexes, and application resources.','Application lock resource case sensitivity':'Application lock names are binary/case-sensitive regardless of database collation; the application must ensure global uniqueness.','Application lock owner transaction versus session':'Transaction-owned locks require an active transaction and release at its end; session-owned locks require explicit release/session end.','sp_getapplock return codes':'Check return codes: nonnegative means acquired; negative values indicate timeout, cancellation, deadlock victim, or call error.','Application lock acquisition order':'Application locks participate in deadlocks; acquire multiple resources in one consistent order across all code paths.',
'Optimized locking availability by SQL platform':'Azure SQL Database, Fabric SQL database, and Azure SQL Managed Instance list enabled defaults; SQL Server 2025 supports but disables by default; SQL Server 2022 and earlier do not support it.','OPTIMIZED_LOCKING database option':'ALTER DATABASE per-database switch for optimized locking; ADR must be enabled first.','Accelerated database recovery prerequisite':'Enable ADR before optimized locking; turn optimized locking off before disabling ADR.','Optimized locking disabled by default on SQL Server 2025':'SQL Server 2025 supports but does not enable it by default. Check sys.databases or DATABASEPROPERTYEX; Azure defaults differ.','TID XACT lock lifetime':'Writer retains an XACT-resource X lock until transaction completion; other tasks can wait on that transaction ID.','TID row/page lock release behavior':'Row/page locks can be released after row modification while the XACT TID lock remains; schema locks are unaffected.','LAQ requires RCSI and READ COMMITTED':'LAQ requires optimized locking, READ_COMMITTED_SNAPSHOT ON, and READ COMMITTED isolation.','LAQ evaluates latest committed version':'DML predicate is tested on latest committed row version before acquiring locks for rows that qualify.','LAQ predicate requalification after concurrent update':'If another writer changes a qualified row, SQL Server waits and reevaluates; unsupported plan operators can trigger internal restart without LAQ.','LAQ statement restart event lock_after_qual_stmt_abort':'Fires when LAQ statement processing is internally restarted after a conflict; repeated work can be costly.','LAQ disabled by conflicting lock hints':'UPDLOCK, READCOMMITTEDLOCK, XLOCK, HOLDLOCK and incompatible isolation can disable LAQ for an access.','LAQ unsupported for MERGE':'Current optimized-locking docs list MERGE outside LAQ support.','LAQ unsupported with OUTPUT or variable assignment':'Some OUTPUT and variable-assignment forms cannot be restarted without changing semantics, so LAQ is skipped.','LAQ unsupported on columnstore updates':'Current LAQ limitations exclude tables with columnstore indexes.','Skip Index Locks optimization':'With optimized locking + RCSI + LAQ, some DML can skip row/page locks when no locking reader needs stability; exact operation and row exclusions apply.','Optimized locking does not remove schema locks':'Feature alters DML row/page locking; Sch-S, Sch-M, and other object/database locks remain.','Optimized locking tempdb and temporary table boundary':'Current docs state optimized locking does not apply to modifications in tempdb or temporary tables.','Optimized locking XACT wait types':'XACT wait types include LCK_M_S_XACT_READ, LCK_M_S_XACT_MODIFY, and LCK_M_S_XACT; interpret with wait_resource and feature state.','READCOMMITTEDLOCK forces locking under RCSI':'Forces shared locking for a READ COMMITTED table reference despite RCSI, potentially reintroducing blocking and disabling LAQ there.','UPDLOCK and HOLDLOCK reduce optimized locking benefits':'Hints remain honored but can require longer row/page locks or disable LAQ. Retain them only for a correctness requirement.','RCSI optimized locking strict-order behavior change':'LAQ qualifies against latest committed data and can skip a row another transaction may later commit. Use stronger isolation/locking when strict order is a correctness invariant.','sys.databases is_optimized_locking_on':'Catalog flag reports database optimized-locking state; inspect together with ADR/RCSI flags.','DATABASEPROPERTYEX IsOptimizedLockingOn':'Returns 1 enabled, 0 disabled, NULL unavailable.'
});
const explain=n=>detail[n]??(/lock|deadlock|block/i.test(n)?`${n}: inspect resource, requested/granted mode, owner/waiter, isolation, and feature state; the name alone does not identify cause.`:/snapshot|version|isolation/i.test(n)?`${n}: distinguish statement versus transaction visibility and account for writer conflicts/version retention.`:`${n}: verify exact session/database scope, platform availability, and error/cleanup behavior in the cited SQL Server documentation.`);
Object.assign(detail,{
'Implicit transaction':'A qualifying statement starts a transaction that remains open until explicit COMMIT or ROLLBACK; inspect @@TRANCOUNT before returning pooled connections.','Autocommit transaction':'Each successful statement commits as its own transaction when neither explicit nor implicit transaction mode is active.','Isolation-level anomaly':'Distinguish dirty, nonrepeatable, phantom, lost-update, and write-skew anomalies; select protection based on the invariant and access pattern.','Row version store':'RCSI/SNAPSHOT versions remain while active readers need them; distinguish traditional tempdb storage from ADR persistent version store.','tempdb version store':'Without ADR, row versions commonly consume tempdb; investigate generation/cleanup rates and long-running snapshots.','Transaction scope':'Transaction state is connection-scoped; a leaked open transaction can retain locks and versions after application work appears finished.','Long-running transaction':'An open transaction can retain locks and delay version cleanup or log truncation; find its session and snapshot age before intervening.','Nested BEGIN TRANSACTION counter behavior':'Nested BEGIN increments @@TRANCOUNT but creates no independently durable nested transaction; only full rollback ends all levels.','SET TRANSACTION ISOLATION LEVEL syntax':'Sets the session isolation level for subsequent statements; it does not retroactively change a running statement.',
'READ_COMMITTED_SNAPSHOT database option':'Makes READ COMMITTED use statement-start row versions; coordinate the database option change and account for version-store capacity.','ALLOW_SNAPSHOT_ISOLATION database option':'Required before SNAPSHOT transactions; state transitions may wait for existing transactions to drain.','Low Priority Lock Wait':'WAIT_AT_LOW_PRIORITY applies to supported online index operations and partition switching, not arbitrary DML lock waits.','READPAST hint interaction with row versioning':'READPAST skips row locks, not page locks; under RCSI it has restrictions and may require READCOMMITTEDLOCK for a locking read.',
'Row lock':'Row/key lock resource; actual granularity and HoBT/key representation depend on access path and optimized-locking state.','Page lock':'Page lock can block access to other rows on the same page; inspect resource and mode before diagnosing contention.','Table lock':'Object-level lock; mode and intent locks determine compatibility, so the label alone does not mean every access is blocked.','Blocking versus deadlock distinction':'Blocking is a wait dependency without necessarily a cycle; a deadlock is a cycle the monitor breaks by rolling back a victim.','Deadlock error 1205 victim rollback':'Victim receives error 1205 and its transaction is rolled back; retry the whole idempotent unit with bounded backoff.','sys.dm_exec_requests blocking_session_id':'Shows the session currently blocking a request; special negative values need documented interpretation and task waits can add precision.',
'Transaction-level snapshot':'SNAPSHOT uses a transaction-consistent version boundary; RCSI establishes a new visibility boundary for each READ COMMITTED statement.','Snapshot isolation write conflict':'An update to a row changed since the transaction snapshot can fail with 3960; retry the entire logical transaction.','Snapshot update conflict error 3960':'SQL Server aborts the SNAPSHOT transaction when its target row changed after the transaction snapshot began; roll back and retry the entire unit in a fresh transaction.','Version store cleanup pressure':'Correlate version-store/PVS usage with oldest active snapshot evidence; size alone is not a reason to terminate a session.','Application lock resource identity':'Application lock identity includes database, database principal, and binary case-sensitive resource name; all callers must agree on the naming scheme.'
});
const citation=n=>/deadlock|Deadlock|blocking|LOCK_TIMEOUT|DEADLOCK_PRIORITY|xml_deadlock|system_health|1205/i.test(n)?s.dead:/application lock|applock|sp_getapplock/i.test(n)?s.app:/sp_releaseapplock/i.test(n)?s.release:/dm_os_waiting|dm_exec_requests/i.test(n)?s.wait:/dm_tran_locks/i.test(n)?s.locks:/optimized|TID|LAQ|OPTIMIZED_LOCKING|Skip Index|is_optimized|IsOptimized|XACT wait/i.test(n)?s.opt:/snapshot|Snapshot|RCSI|READ COMMITTED SNAPSHOT|ALLOW_SNAPSHOT|READ UNCOMMITTED|NOLOCK|READCOMMITTEDLOCK|Serializable|SERIALIZABLE|Repeatable|Dirty read|Nonrepeatable|Phantom|Write skew|Lost update/i.test(n)?s.iso:/version store|version-store|PVS|ADR persistent|Versioned read/i.test(n)?s.versions:/XACT_STATE/i.test(n)?s.xact:/@@TRANCOUNT/i.test(n)?s.tran:/XACT_ABORT/i.test(n)?s.abort:s.guide;
const groups=[['transaction-and-isolation','Transaction lifecycle, isolation, and row-versioning'],['locks-blocking-and-deadlocks','Lock modes, blocking chains, deadlocks, and diagnostics'],['row-versioning-and-optimized-locking','RCSI, snapshot semantics, and SQL Server 2025 locking changes']];
const bib=[...new Set(Object.values(s))].map(x=>`- [Microsoft Learn](${x})`).join('\n');const dir='course/drafts/t03-010';await fs.mkdir(dir,{recursive:true});const write=(n,b)=>fs.writeFile(`${dir}/t03-010-${n}.md`,b.trimEnd()+'\n');
for(const [id,title] of groups){const g=m.inventory.find(x=>x.id===id);const rows=g.items.map(n=>`| \`${n.replaceAll('|','\\|')}\` | ${explain(n)} ([source](${citation(n)})) |`).join('\n');await write(`reference-${id}`,`# ${m.title} — Reference: ${title}

# Scope and version

Targets SQL Server 2025 (17.x) unless a platform boundary is named. Azure SQL, Fabric, and Synapse can differ. This table explains every exact inventory item assigned to the group.

# How this group fits the mental model

Transactions define atomicity; isolation defines visibility; locks and versions implement concurrent behavior. Diagnose current session/database state before applying hints.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
${rows}

# Cross-item comparison

RCSI is statement-level; SNAPSHOT is transaction-level. A wait is not necessarily a deadlock. @@TRANCOUNT counts nesting, while XACT_STATE determines committability. TID locking reduces lock duration/count but does not remove schema locks or writer conflicts.

# Examples

Compare a two-statement READ COMMITTED transaction under locking versus RCSI, then SNAPSHOT. For a deadlock, map each process’s owned/requested resources into a cycle before changing access order.

# Common mistakes

- Confusing a lock timeout with deadlock.
- Assuming NOLOCK bypasses Sch-M.
- Assuming RCSI gives a transaction snapshot.
- Treating optimized locking as universal/default on SQL Server 2025.

# Knowledge checks with answers

1. What does XACT_STATE=-1 mean? Active but uncommittable; full rollback is required.
2. Does SNAPSHOT prevent write skew across different rows? Not necessarily.
3. What breaks a deadlock cycle? Victim rollback with error 1205.

# Sources

${bib}`);}
const main=`# ${m.title} — Big-picture orientation and mental model

# Problem and purpose

Transactions preserve application invariants while sessions work concurrently. Isolation defines what concurrent changes a transaction may observe; locks and row versions implement those semantics. Poor transaction scope causes blocking, deadlocks, version retention, and unsafe retries.

# Plain-language mental model

A transaction is a short lease over the facts it needs to keep consistent. Locks make conflicting work wait; row versions let selected readers use prior committed images. A deadlock is a cycle that SQL Server breaks by rolling back one victim. Optimized locking changes lock duration/volume, not the business invariant.

# How the parts fit together

1. Define the invariant and smallest atomic unit.
2. Choose isolation that prevents the relevant anomaly.
3. Keep transactions short and clean up every error path.
4. Use lock/wait DMVs, version diagnostics, and deadlock graphs as evidence.
5. Retry the whole transaction only after cleanup and idempotency safeguards.

# Concept map

| Need | Mechanism | Boundary |
| --- | --- | --- |
| Atomic multi-statement work | BEGIN/COMMIT/ROLLBACK | Nested BEGIN is a counter |
| Committed statement view | READ COMMITTED + RCSI | New snapshot per statement |
| Stable transaction view | SNAPSHOT | Update conflicts/write skew remain possible |
| Prevent predicate phantoms | SERIALIZABLE/key-range locks | Requires indexed range access; can block |
| Reduce write lock pressure | Optimized locking | SQL Server 2025 opt-in + ADR; LAQ needs RCSI |

# End-to-end walkthrough

An inventory reservation must not exceed available quantity. A read followed by a later update can lose updates. Prefer one conditional atomic update and check affected rows, or choose a transaction contract that protects the invariant. SNAPSHOT may abort same-row conflicts with 3960; RCSI reduces reader/writer blocking but does not serialize writers. Keep network calls outside the transaction and make retries idempotent.

# When to use it and tradeoffs

Use row versioning to reduce reader/writer contention when its consistency and storage cost fit. Use stronger isolation or targeted locks when correctness requires range exclusion. Optimized locking can reduce DML lock pressure where available. Test simultaneous sessions; each mechanism changes blocking, storage, or retry behavior.

# What later lessons cover

This lesson covers SQL Server transaction/concurrency semantics. Distributed transactions, outbox, and application retry architectures live in track-08; broad waits are in t03-013.

# Sources

${bib}`;
await write('overview',main);
const concepts=`# ${m.title} — Core concepts and how they fit together

# Learning objectives

Model transaction state; distinguish isolation levels and anomalies; explain locks/deadlocks; monitor version retention; and state SQL Server 2025 optimized-locking prerequisites and limits.

# Prerequisites

Know SQL DML, constraints, indexes, sessions, and application transaction boundaries.

# Core concepts

ACID is a goal, not a blanket concurrency guarantee. Autocommit makes each statement its own transaction. Explicit BEGIN remains open until outer COMMIT/full ROLLBACK; nested BEGIN only increments @@TRANCOUNT. Savepoints allow partial rollback only while committable. In errors, @@TRANCOUNT reports scope while XACT_STATE reports whether commit is possible. A connection returned to a pool must not retain an open/doomed transaction.

READ UNCOMMITTED permits dirty reads. READ COMMITTED is default: locking reads use shared locks when RCSI is OFF; RCSI ON gives each statement a committed snapshot. REPEATABLE READ retains locks on rows already read but allows new matching rows. SERIALIZABLE protects predicate ranges when an indexed range access is available. SNAPSHOT gives a transaction-level committed view and detects conflicting same-row writes, but can permit write skew across rows.

Row versions reduce some reader/writer waits, not writer conflicts or schema locks. Versions consume storage and cleanup can be delayed by active snapshots. ADR uses a persistent version store (PVS) in the user database; traditional version storage otherwise uses tempdb.

A lock request is a resource plus a mode. S/U/X and intent modes have compatibility rules; Sch-S/Sch-M protect metadata. Blocking is a wait. Deadlock is a cycle; the monitor picks a victim, rolls back its transaction, and returns error 1205. Lock escalation trades fine-grained tracking for coarser contention.

# Mechanisms and relationships

Optimized locking uses transaction-ID locks to shorten row/page lock lifetimes. LAQ evaluates DML predicates against the latest committed row version before locking qualifying rows. SQL Server 2025 supports optimized locking but leaves it disabled by default; ADR is required. LAQ additionally requires RCSI and READ COMMITTED. Conflicting hints, statement forms, isolation, and table types can disable LAQ. Under optimized locking plus RCSI, do not assume strict execution ordering; use stronger isolation/locking when the invariant requires serialization.

# Worked examples

Two SNAPSHOT transactions read a shared invariant and update different rows. Both may commit because they changed different rows, yet jointly violate the invariant: use SERIALIZABLE or explicit invariant enforcement. A serializable range read can use key-range locks to prevent phantoms if its index key covers the predicate.

# Misconceptions and edge cases

- NOLOCK allows inconsistent data and still takes Sch-S.
- RCSI gives statement snapshots, not one transaction snapshot.
- Lock timeouts are not deadlocks and do not guarantee transaction cleanup.
- ROWLOCK does not prevent escalation.
- Optimized locking does not remove schema locks, all deadlocks, or writer conflicts.
- Snapshot isolation is not serializable.

# Knowledge checks with answers

1. What is retained by RCSI? A statement-start committed version.
2. What must precede enabling optimized locking? ADR.
3. What is needed for LAQ? Optimized locking, RCSI ON, READ COMMITTED, and an eligible statement.

# Sources

${bib}`;
await write('concepts',concepts);
const practice=`# ${m.title} — Exercises and worked solutions

# Goals

Choose an isolation contract, explain wait cycles, clean up transaction errors, and design a safe retry boundary.

# Worked example

Two transfers update accounts in opposite order and deadlock. Normalize account order, keep the transaction short, capture xml_deadlock_report, and retry the entire operation after 1205 with bounded backoff. Ensure external effects are idempotent. Raising deadlock priority does not remove the cycle.

# Exercises

1. Compare two READ COMMITTED reads when RCSI is OFF and ON.
2. A transaction checks an absent email then inserts. Explain the race and two correct designs.
3. Why can a nested procedure COMMIT while the caller still has an open transaction?
4. What is allowed when XACT_STATE()=-1?
5. Why can NOLOCK still block during schema deployment?
6. Explain a shared-to-exclusive conversion deadlock and U locks.
7. Why retry the entire transaction after 1205 or 3960?
8. tempdb/PVS grows after row versioning. What should you inspect?
9. Two SNAPSHOT transactions update different rows under a shared invariant. Explain write skew.
10. SQL Server 2025 seems not to use optimized locking. Check prerequisites/state.
11. LAQ causes a concurrent predicate update to skip a row. Why can that happen?
12. There are long blocking chains but no deadlock reports. What do you capture?
13. After LOCK_TIMEOUT, is the connection safe to return to a pool?
14. Explain sp_getapplock naming, owner, return codes, and ordering.

# Progressive hints

1. Distinguish statement from transaction snapshots.
2. Use a unique constraint or protect the predicate range.
3. Inner COMMIT decrements a counter.
4. A doomed transaction requires full rollback.
5. NOLOCK does not skip schema locks.
6. Examine each session's held and requested resources/modes.

# Complete solutions

1. Locking READ COMMITTED may see a newly committed value on the second statement; RCSI starts a new committed snapshot per statement. Neither is transaction-wide SNAPSHOT.
2. A concurrent insert can race after the check. Use a unique constraint and handle duplicate-key, or SERIALIZABLE with indexed key-range protection. Check-then-act alone is not atomic.
3. Nested BEGIN/COMMIT changes @@TRANCOUNT; only outer COMMIT commits. Define transaction ownership/savepoint behavior.
4. Only full rollback; no commit or rollback-to-savepoint. Use XACT_STATE in CATCH and rethrow after cleanup.
5. NOLOCK skips data S locks but still takes Sch-S, which conflicts with DDL Sch-M.
6. Both transactions may hold S and wait to convert to X. U locks serialize one prospective updater; consistent order/atomic updates and short scopes help more broadly.
7. Earlier reads/decisions may be stale. Restart all checks/writes under a fresh transaction, with idempotent outside effects.
8. Find long-lived snapshots and cleanup blockers. ADR places PVS in the user DB; otherwise traditional versions use tempdb. Avoid scanning a huge version-store DMV casually.
9. Snapshot may not detect writes to different rows; use SERIALIZABLE, atomic invariant design, or explicit coordination.
10. Check platform, sys.databases ADR/RCSI/is_optimized_locking_on, isolation and hints. SQL Server 2025 opt-in; LAQ also needs RCSI+READ COMMITTED.
11. LAQ qualifies against latest committed row versions and can avoid waiting; this can change observed ordering. Use stricter isolation/locking when ordering is a correctness requirement.
12. Capture wait/resource, blocker, SQL, transaction age, and application state. Blocking has no cycle requirement; deadlock reports only represent cycles.
13. No. Inspect @@TRANCOUNT/XACT_STATE and roll back as needed before returning a clean connection. Timeout itself is not transaction cleanup.
14. Resource names are case-sensitive and must be unique. Transaction owner requires an active transaction; session owner needs explicit release. Check return code and acquire resources consistently.

# Tests and edge cases

- Test two-session interleavings with commit and rollback.
- Verify timeout, cancellation, exception, and deadlock paths clean up.
- Test absent-key races and cross-row invariants.
- Hold a long SNAPSHOT transaction and observe delayed version cleanup.
- Compare optimized-locking/RCSI combinations where supported.
- Test bounded full-transaction retries and idempotency.

# Reflection questions

Which anomaly must be prevented? What is the transaction scope/retry boundary? What evidence distinguishes blocking from deadlock? Where do versions reside? Which flags are actually enabled?

# Sources

${bib}`;
await write('practice',practice);
const interview=`# ${m.title} — Interview questions and reasoning

# Core questions

1. What does isolation change and what remains true for writes?
2. RCSI versus SNAPSHOT?
3. READ COMMITTED versus REPEATABLE READ versus SERIALIZABLE?
4. @@TRANCOUNT versus XACT_STATE?
5. Blocking versus deadlock?
6. How is a deadlock victim selected and handled?
7. Why is NOLOCK unsafe?
8. What does a key-range lock protect?
9. Where do versions live with ADR?
10. What are TID locking and LAQ?
11. What enables optimized locking and LAQ?
12. How should a client retry 1205 or snapshot conflict?

# Concise interview answers

1. Isolation changes visibility/locking; writers still need conflict protection and can block/fail.
2. RCSI gives statement-start snapshots under READ COMMITTED; SNAPSHOT gives one transaction view and can abort same-row conflicts.
3. READ COMMITTED prevents dirty reads; REPEATABLE READ retains row locks but allows phantoms; SERIALIZABLE protects indexed predicate ranges.
4. @@TRANCOUNT counts nesting; XACT_STATE says absent, committable, or doomed.
5. Blocking is one-way waiting; deadlock is a cycle automatically broken by victim rollback.
6. SQL Server generally chooses least rollback cost unless DEADLOCK_PRIORITY differs, rolls back victim, and returns 1205.
7. It permits dirty/missing/duplicate/inconsistent observations and still takes Sch-S.
8. Protects qualifying key intervals from phantoms when SERIALIZABLE uses a suitable index.
9. ADR stores versions in database PVS; traditional versions otherwise use tempdb.
10. TID retains a transaction lock while releasing many row/page locks earlier. LAQ qualifies DML on latest committed versions before locking rows.
11. ADR is required; SQL Server 2025 is opt-in. LAQ additionally needs RCSI ON and READ COMMITTED.
12. Clean up and retry the whole business unit in a new transaction with bounded backoff and idempotent effects.

# Deep follow-up answers

A savepoint permits partial rollback only while committable; XACT_STATE=-1 requires full rollback. Nested BEGIN does not create nested commit scope. RCSI reduces reader/writer blocking but does not protect cross-row invariants; SNAPSHOT can still allow write skew.

Optimized locking does not remove all locks/deadlocks. LAQ can alter observed blocking/order under RCSI because it checks latest committed rows. Verify feature flags and use stronger isolation for a stated correctness requirement.

# Scenario questions

**Frequent 1205 errors appear after deployment.** Preserve deadlock XML, inspect victim/process/resource lists, identify resource order and transaction duration, then fix order/scope or the actual invariant. Add bounded whole-transaction retry only with idempotency; monitor rate and graph shape.

# Tradeoffs and alternatives

RCSI favors reader throughput but consumes versions and gives statement snapshots. SNAPSHOT gives transaction consistency but can produce update conflicts and write skew. SERIALIZABLE protects ranges but raises contention. Application locks coordinate logical resources but require shared naming/order. Optimized locking can reduce write lock pressure when eligible.

# Common weak answers

- “NOLOCK means no locks.”
- “RCSI makes the whole transaction repeatable.”
- “A deadlock is just long blocking.”
- “Nested BEGIN creates a savepoint.”
- “Disable escalation and set deadlock priority high.”
- “SQL Server 2025 turns optimized locking on automatically.”

# Self-check rubric

Score 0–2: (0) slogan/hint only; (1) mechanism but misses anomaly/cost; (2) states correctness contract, exact visibility/lock/version behavior, platform prerequisites, evidence, and full cleanup/retry path.

# Sources

${bib}`;
await write('interview',interview);
console.log(`Wrote ${groups.length} references for ${m.inventory.reduce((n,g)=>n+g.items.length,0)} named concurrency items, plus overview, concepts, practice, and interview.`);
