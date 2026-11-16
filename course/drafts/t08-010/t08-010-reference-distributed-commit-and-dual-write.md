# transactions distributed consistency saga outbox and inbox — Reference: Cross-resource commit choices and failure windows in dual writes

Sources: [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [SQL Server transaction guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17).

## Scope and version

This lesson compares cross-resource transaction concepts and failure windows. Distributed transaction support depends on database, broker, driver, platform, and deployment configuration; no general claim is made that 2PC is impossible or automatically available.

## How this group fits the mental model

Cross-resource atomicity needs a coordinator and enlisted participants that can prepare and commit under a shared protocol. Without it, two sequential writes have a crash window in either order. An outbox is an alternative when the requirement is durable eventual publication, not simultaneous visibility in every resource.

## Supplied names explained

### Distributed transaction

A transaction coordinated across multiple resource managers. It can provide atomic outcome when every participant and coordinator support the protocol, but adds coordination, operational coupling, and failure/recovery states.

### Two-Phase Commit (2PC)

A protocol with a prepare phase followed by a commit/abort decision. Participants promise they can commit before the coordinator decides; a failure can leave prepared resources waiting for resolution.

### Transaction coordinator

Tracks participants and the global decision, drives protocol phases, and recovers after failures. It becomes critical infrastructure and must durably preserve its decision and recovery state.

### Prepare phase

The coordinator asks participants to prepare and hold the ability to commit while recording their vote. Prepared participants may retain locks/resources while awaiting the final decision.

### Commit phase

After all required votes succeed, the coordinator durably decides commit and instructs participants to finish. Participants must be able to recover and apply the recorded decision after restart.

### In-doubt transaction

A participant has prepared but cannot yet learn the final coordinator decision. It may retain locks/resources, and operators need a safe recovery process rather than guessing commit or abort.

### Coordinator failure

The coordinator can fail before, during, or after persisting the decision. Durable logs and participant recovery protocols are essential; recovery behavior depends on implementation.

### Blocking distributed commit

Classic 2PC can block prepared participants when the coordinator is unavailable and no final decision is known. This can harm availability; it is a design tradeoff, not proof that the protocol can never be used.

### Resource manager enlistment

A participant registers with the transaction coordinator and implements the protocol needed to prepare, commit, abort, and recover. A resource that cannot enlist is outside the atomic boundary.

### Database and broker dual write

Two independent operations, often a database commit and message publish, issued by one application flow. Without a transaction spanning both or a durable coordination pattern, one can succeed while the other fails.

### Publish-before-database-commit failure window

The broker accepts an event, then the database transaction aborts or the service crashes before commit. Consumers see a fact whose local business change did not commit.

### Database-commit-before-publish failure window

The database commits, then publish fails or the process dies. The business state exists but downstream consumers may never be notified.

### Distributed atomicity requirement

The actual business requirement that multiple resources become visible together or not at all. Confirm whether that is truly required; many workflows can instead expose pending state and converge asynchronously.

### Cross-service transaction cost

Coordination can increase latency, lock duration, coupling, failure-domain size, and operational complexity. Quantify these against the invariant's value and participant support.

### Transaction boundary versus service boundary

The service boundary defines ownership/API responsibility; a transaction boundary defines atomic resource scope. They often differ. A service call does not implicitly extend the caller's database transaction into the callee.

## Cross-item comparison

2PC attempts coordinated atomic commit when resources support enlistment. An outbox commits local state plus publication intent and accepts delayed, potentially duplicate delivery. Publish-first and commit-first dual writes fail in opposite ways; neither order removes the window.

## Examples

An order API writes an order row and publishes to a broker. If it commits first, a crash can lose the message. If it publishes first, the database may reject the order after consumers act. Either implement actual supported distributed commit if simultaneous outcome is mandatory, or save order and event intent in one local commit and relay/deduplicate asynchronously.

## Common mistakes

- Assuming the phrase “distributed transaction” means every framework/provider can participate.
- Assuming 2PC failure is always nonblocking or that outbox provides simultaneous cross-system visibility.
- Adding a compensating delete to hide a publish-first failure without considering consumers that already acted.
- Treating a transaction scope in application code as proof that all resources enlisted.

## Knowledge checks with answers

1. **What can happen after prepare?** A participant can remain in doubt and hold resources until it learns the coordinator's final decision.
2. **What does an outbox change?** It atomically stores local state and the obligation to publish; publication is asynchronous and may duplicate.
3. **When is 2PC a candidate?** When all participants support it and its consistency value justifies its availability and operations costs.

### Exact terms covered

- `Distributed transaction`
- `Two-Phase Commit (2PC)`
- `Transaction coordinator`
- `Prepare phase`
- `Commit phase`
- `In-doubt transaction`
- `Coordinator failure`
- `Blocking distributed commit`
- `Resource manager enlistment`
- `Database and broker dual write`
- `Publish-before-database-commit failure window`
- `Database-commit-before-publish failure window`
- `Distributed atomicity requirement`
- `Cross-service transaction cost`
- `Transaction boundary versus service boundary`

### Exact terms covered

- `Distributed transaction`
- `Two-Phase Commit (2PC)`
- `Transaction coordinator`
- `Prepare phase`
- `Commit phase`
- `In-doubt transaction`
- `Coordinator failure`
- `Blocking distributed commit`
- `Resource manager enlistment`
- `Database and broker dual write`
- `Publish-before-database-commit failure window`
- `Database-commit-before-publish failure window`
- `Distributed atomicity requirement`
- `Cross-service transaction cost`
- `Transaction boundary versus service boundary`
