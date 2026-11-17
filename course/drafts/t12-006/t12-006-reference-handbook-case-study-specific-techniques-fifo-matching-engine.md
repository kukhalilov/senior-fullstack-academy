# end-to-end system design case studies — Reference: FIFO matching engine

Sources: [HLD Handbook](https://hld.handbook.academy/), [FIX Market Data Order Book Management specification](https://www.fixtrading.org/wp-content/uploads/download-manager-files/MDOWG_Book_Mgt-v20.pdf), [Apache Kafka design: message ordering and transactions](https://kafka.apache.org/41/design/design/), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).

## Scope and version

This lesson describes a simplified deterministic command-processing engine for matching compatible orders with price-time priority. It is not a production exchange specification. Real venues publish their own rules for order types, priority, allocation, halts, protection limits, and trade reporting; those rules and applicable regulations take precedence. FIX describes market-data/book representation and should not be mistaken for a matching algorithm standard.

## How this group fits the mental model

A matching engine consumes accepted commands, updates authoritative order state, creates trades when incoming orders cross resting interest, and publishes resulting events. Correctness requires that every command have a deterministic outcome and that recovery reproduce the same book/trades. Throughput matters, but it cannot override price priority, sequence, quantity, or audit invariants.

Partitioning by instrument can allow independent books to process in parallel, while all commands for a given instrument still need one authoritative order. A single-threaded event loop per book is one possible design, not a universal requirement. Replicas can follow a durable ordered log for recovery/read views, but concurrent active writers for one book need explicit consensus/ordering semantics to avoid conflicting matches.

## Supplied names explained

- **Command:** validated new, cancel, or replace request with identity, client/account, instrument, quantity, price, and required policy attributes.
- **Acceptance and sequence:** point at which the engine commits an order into its authoritative ordered state; queue priority should follow the venue-defined sequencing rule.
- **Matching loop:** compare an incoming order against eligible opposite-side price levels and consume quantities in priority order until the order is filled or cannot cross.
- **Trade/execution event:** immutable record of matched quantity, price, counterparties/identities as permitted, order references, and sequence/time metadata.
- **Leaves quantity:** amount still open after partial executions; must never become negative or exceed accepted original quantity.
- **Deterministic replay:** reconstructing state by applying the same committed event/command sequence with versioned deterministic rules.
- **Risk/pre-trade checks:** limits such as maximum quantity/price or account eligibility before matching; exact checks depend on product and legal requirements.

## Cross-item comparison

| Processing shape | Benefit | Main trade-off |
| --- | --- | --- |
| One ordered processor per instrument | Straightforward per-book ordering and replay | Hot instruments can bottleneck; horizontal scaling occurs across instruments, not within one ordered book without more complex coordination |
| Multiple concurrent active matchers for one book | Potential parallelism | Must resolve order priority and conflicting fills atomically; otherwise can double-match or violate queue position |
| Synchronous durable log before acknowledging command | Stronger recovery boundary and clear accepted sequence | Adds persistence latency and requires capacity planning for replication/durability |
| In-memory match then asynchronous persistence | Lower apparent path latency | Crash can lose acknowledged/visible matches unless acknowledgment semantics and recovery buffer are carefully designed |

## Examples

An incoming buy order is accepted at sequence 9001, crosses two resting sell orders, and produces two partial trade events. The engine updates both sellers’ leaves quantities, the buyer’s remaining quantity, the order-book view, and trade sequence as one logically consistent state transition. The client acknowledgement and downstream event must correspond to committed state. If downstream delivery repeats, consumers deduplicate by immutable trade/event ID before settlement or notification.

On recovery, load snapshot version 8800 and replay committed log records 8801 through 9001. Compare generated state with a checksum or independently computed invariants; never replay uncommitted commands as executed trades. If a client retries after timeout, the order request ID must return the accepted/rejected result rather than create a second order. If the engine cannot establish whether a command committed, query the durable command/result log before accepting a new logical order.

## Common mistakes

- Treating broker message ordering as global; many logs guarantee order only within a partition/key.
- Parallelizing matching of one instrument without an authoritative sequencer or conflict-safe allocation algorithm.
- Acknowledging an order before the durable acceptance boundary while presenting it as guaranteed.
- Replaying side effects such as settlement directly from a log without idempotent trade IDs.
- Using floating-point prices or quantities and introducing rounding/equality errors; use instrument-defined tick/lot precision.
- Allowing cancel/replace to race with matching without an explicit precedence/sequence policy.
- Mixing command acceptance, trade execution, market-data publication, clearing, and settlement into one vague “processed” status.
- Failing to version replay logic when matching rules or schemas change.
- Treating a market-data book snapshot as the authoritative source for matching decisions.

## Knowledge checks with answers

1. **Where is per-instrument ordering established?** At the authoritative acceptance/sequencing boundary for that book; partition ordering can help only when all same-instrument commands share the same ordered path.
2. **A client times out after order submission. What should retry do?** Reuse the logical request ID or query the command result; avoid creating an unintended duplicate order.
3. **Why separate trade event IDs from order IDs?** One order can create multiple partial executions, and downstream systems need deduplication per execution.
4. **Can Kafka exactly-once processing alone guarantee one external settlement?** No. The settlement destination must cooperate through idempotency/transactions or reconciliation.

## Review status

Ordering/transaction caveats are checked against Kafka documentation; book representation context against FIX; transaction/replay examples are bounded to the stated model. This lesson remains pending full claim-by-claim audit and manifest omission check.
