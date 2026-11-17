# system design tradeoffs and decision methods — Reference: ACID vs BASE

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Brewer, CAP Twelve Years Later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/), [Gilbert and Lynch, CAP](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [Abadi, PACELC](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Scope and version

ACID describes transaction properties; BASE is a design vocabulary associated with availability and eventual convergence. They are not mutually exclusive database categories, and BASE is not a formal transaction protocol.

## How this group fits the mental model

For an order, ACID asks whether a transaction's changes are all-or-nothing, preserve declared invariants, isolate concurrent work, and survive failures according to the database's durability contract. The exact meanings depend on isolation level and system configuration. BASE expands to Basically Available, Soft state, Eventually consistent; it describes accepting useful responses while replicas or derived state may be temporarily divergent and later converge under assumptions.

## Supplied names explained

ACID's “C” means consistency with application/database constraints before and after a transaction; it is distinct from distributed consistency models such as linearizability. A relational database can have ACID transactions and asynchronous replicas that are eventually consistent. A NoSQL database can also provide transactions. Therefore SQL/NoSQL, relational/document, and ACID/BASE are separate axes.

BASE should not be read as “no transactions” or “always available.” Availability is a system-level measured property, and actual behavior depends on deployment and failures. Eventual consistency does not promise bounded staleness, conflict-free business outcomes, or that all replicas converge if updates continue forever or reconciliation fails.

## Cross-item comparison

Select transaction guarantees per invariant and data boundary. A transfer between two accounts usually needs an atomic invariant-preserving operation; an activity feed can often tolerate lag and reconcile. Relaxing immediate agreement may improve latency/availability, but the application must handle stale reads, duplicate operations, conflicts, and repair. Preserve strong local transactions where valuable while asynchronously projecting data for read models.

## Examples

An order database commits an order and outbox record in one local ACID transaction. A worker later publishes the event, and a search index or feed updates asynchronously. The customer may see the order in the primary view before it appears in search. Define the user-facing freshness promise, retry/deduplication behavior, and repair path; calling the system “BASE” does not specify those.

## Common mistakes

- Treating BASE as a formal opposite to ACID or as a precise consistency contract.
- Equating ACID's consistency property with strong distributed consistency.
- Assuming SQL means ACID and NoSQL means BASE.
- Assuming eventual convergence has a fixed deadline or guarantees a business invariant.

## Knowledge checks with answers

1. **Are ACID and BASE mutually exclusive database brands?** No; ACID is transaction properties, BASE is an informal availability/convergence design vocabulary.
2. **Does ACID's C mean linearizability?** No; it means database/application constraints remain satisfied across transactions.
3. **What must an eventual read model define beyond “BASE”?** Staleness expectations, conflict/retry behavior, deduplication, and convergence/repair monitoring.
