# transactions distributed consistency saga outbox and inbox — Reference: Atomic local work, ACID, isolation, and boundaries of consistency

Sources: [SQL Server transaction locking and row versioning](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17), [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), and [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination).

## Scope and version

The isolation terms below use SQL Server's current published guide as a concrete illustration (checked 2026-11-16). Similar labels in other engines can differ in defaults, available modes, and exact behavior. This lesson explains boundaries and concepts, not SQL Server or EF Core APIs.

## How this group fits the mental model

A local transaction is the envelope that protects an invariant inside one supported store. Isolation determines concurrent read/write behavior within that envelope; service ownership and consistency models describe how state crosses boundaries outside it.

## Supplied names explained

### Transaction

A logical unit of work with defined begin/commit/rollback semantics. Application code chooses operations that preserve a business invariant; the resource manager supplies the guarantees it supports.

### Local database transaction

A transaction coordinated by one database resource. It cannot by itself commit a broker publish or another independent service's database.

### Atomicity

All enlisted changes commit or none do at the transaction boundary, subject to the engine's contract and configuration. It does not automatically span unrelated resources.

### Consistency invariant

A predicate that must remain true before and after valid state transitions, such as inventory never being negative. Constraints and transactions enforce local invariants; cross-service invariants need an explicit coordination or eventual-recovery design.

### Isolation

Controls what concurrent transactions can observe and how conflicting operations interact. It trades anomaly prevention against locking, version storage, and contention.

### Durability

Committed changes survive failures to the level promised by the store's configuration and acknowledgement semantics. A successful API response alone should not be assumed durable without the system's contract.

### Commit

Requests the resource manager to make the transaction's effects final and visible according to its guarantees. A client losing the response may have an ambiguous commit outcome and should reconcile rather than blindly replay non-idempotent work.

### Rollback

Aborts uncommitted work in the transaction scope. It cannot undo already committed external effects; those require a new compensating action if the domain supports one.

### Transaction boundary

The exact resources and operations covered by atomic commit, plus their isolation/coordination semantics. Make the boundary visible in design reviews rather than inferring it from a method or request boundary.

### Isolation level

A named concurrency contract the database implements. The same level name can have engine-specific details; verify the chosen engine's documentation and options.

### Read uncommitted

Permits reads of uncommitted changes in common SQL semantics, exposing dirty data that may later roll back. It is unsuitable when the consumer needs committed business facts.

### Read committed

Prevents dirty reads, but may allow non-repeatable reads and phantoms across statements in a transaction. On SQL Server, read-committed snapshot configuration can use row versions for statement-level consistency; do not assume this across engines.

### Repeatable read

Prevents changes to rows already read from being observed as changed within a transaction in common SQL semantics, but may still permit phantoms. Exact locking/versioning varies by engine.

### Serializable

The strongest standard SQL isolation level: execution should be equivalent to some serial order. It can increase blocking or aborts, and should be applied with correct transaction scope and predicates.

### Snapshot isolation

Provides a transaction-level consistent versioned view in engines that support it, with write-conflict behavior when concurrent modifications collide. It can permit write skew unless invariants are otherwise protected; SQL Server requires the relevant database option.

### Optimistic concurrency control

Allows work to proceed without long-held exclusive reservations and detects a conflict at update/commit using versions or conditional writes. The application must handle conflicts, recompute, or reject safely.

### Pessimistic locking

Locks resources to prevent conflicting work while the transaction proceeds. It can be appropriate for contention-sensitive invariants but can block, deadlock, and reduce throughput.

### Lost update

Two writers read the same old value and one overwrites the other's change. Use atomic updates, version checks, constraints, or suitable isolation rather than assuming a read-modify-write sequence is safe.

### Dirty read

A transaction observes another transaction's uncommitted value, which may disappear if that transaction aborts.

### Non-repeatable read

The same row read twice within one transaction returns different committed values because another transaction updated it between reads.

### Phantom read

A repeated predicate query returns a changed set because concurrent work inserted/deleted rows matching the predicate. Protecting only previously observed rows may not protect a set-based invariant.

### Strong consistency

A broad phrase for fresh, coordinated visibility, but precise meaning depends on the system's consistency model (for example, linearizability vs transaction guarantees). State the required observable behavior rather than using the label alone.

### Eventual consistency

Replicas or service-owned state may temporarily diverge but should converge if updates and recovery complete. Define acceptable staleness, repair, and user-visible pending behavior.

### Read-your-writes consistency

A caller sees its own successful write in subsequent reads, often through routing/session tokens or reading from an authoritative store. It does not imply that every other service has observed the change.

### Consistency boundary

The component or transaction within which a stated invariant is guaranteed. A microservice boundary often aligns with a database ownership boundary, but architecture must make that ownership real.

### Service-owned database

A store whose schema and writes are controlled by one service. Other services interact through contracts/events instead of mutating its tables, enabling independent evolution but requiring explicit cross-service consistency patterns.

## Cross-item comparison

Read committed, repeatable read, snapshot, and serializable constrain different observations and conflicts; they are not a simple scale of universally portable behavior. Optimistic control detects conflicts, whereas pessimistic locking blocks them early. Strong consistency is a system-level contract; read-your-writes is one narrower client-visible guarantee.

## Examples

Two purchase requests see one remaining seat. A unique constraint or atomic conditional decrement can preserve the invariant even if reads race. For SQL Server `SNAPSHOT`, both transactions can read a consistent snapshot, but update conflicts and predicate-level write skew must still be considered; a row version token, constraint, or serialized reservation operation may be needed.

## Common mistakes

- Assuming a method-level transaction includes a broker or remote HTTP call.
- Treating `SNAPSHOT` as equivalent to serializable for every business invariant.
- Relying on a read followed by an unconditional write to enforce a concurrent invariant.
- Treating eventual consistency as a guarantee of prompt convergence without measuring recovery.
- Using the term “strong consistency” without saying what reads are allowed to observe.

## Knowledge checks with answers

1. **Does commit to one database commit a message broker publish?** No, unless a supported coordinated transaction explicitly covers both.
2. **Can snapshot isolation still have a business anomaly?** Yes; cross-row write skew can violate an invariant unless separately protected.
3. **What is a transaction boundary?** The exact operations/resources covered by transaction guarantees.

### Exact terms covered

- `Transaction`
- `Local database transaction`
- `Atomicity`
- `Consistency invariant`
- `Isolation`
- `Durability`
- `Commit`
- `Rollback`
- `Transaction boundary`
- `Isolation level`
- `Read uncommitted`
- `Read committed`
- `Repeatable read`
- `Serializable`
- `Snapshot isolation`
- `Optimistic concurrency control`
- `Pessimistic locking`
- `Lost update`
- `Dirty read`
- `Non-repeatable read`
- `Phantom read`
- `Strong consistency`
- `Eventual consistency`
- `Read-your-writes consistency`
- `Consistency boundary`
- `Service-owned database`

### Exact terms covered

- `Transaction`
- `Local database transaction`
- `Atomicity`
- `Consistency invariant`
- `Isolation`
- `Durability`
- `Commit`
- `Rollback`
- `Transaction boundary`
- `Isolation level`
- `Read uncommitted`
- `Read committed`
- `Repeatable read`
- `Serializable`
- `Snapshot isolation`
- `Optimistic concurrency control`
- `Pessimistic locking`
- `Lost update`
- `Dirty read`
- `Non-repeatable read`
- `Phantom read`
- `Strong consistency`
- `Eventual consistency`
- `Read-your-writes consistency`
- `Consistency boundary`
- `Service-owned database`
