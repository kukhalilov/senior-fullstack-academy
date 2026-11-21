# architecture patterns multi-region tenancy and reliability — Reference: Notification, state-transfer, and domain events

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Event-driven architecture style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS event-driven architecture guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/architecture.html).

## Scope and version

This lesson distinguishes three message meanings that often share the same broker or JSON envelope. These are conceptual categories, not mandatory wire formats. A message bus does not make a payload a domain event; meaning comes from the contract and how consumers interpret it.

## How this group fits the mental model

A producer and a consumer need to exchange information after some state change. The first design question is: **what does the message promise?** It may announce a fact, signal that data is available, or transfer a versioned snapshot. That promise determines who owns truth, whether the receiver must fetch more data, how replay works, and what happens when the payload becomes stale.

An event is normally immutable: it records that something happened at a point in business time. A notification can intentionally be small and tell consumers where to look next. State transfer copies a view so that consumers can work independently. These can overlap in practice; make the semantics explicit rather than relying on the word “event.”

## Supplied names explained

- **Notification, state-transfer, and domain events** — Three message intents. A notification is a signal; a state-transfer message carries data needed by a recipient; a domain event names a meaningful business fact. They can use the same transport, but have different ownership, coupling, freshness, privacy, and replay consequences.

### 1. Notification

A notification says “something changed” or “work is ready,” often with an identifier and a version/cursor. The receiver fetches the authoritative resource or change feed. This reduces copied personal or business data and lets the source control its representation, but the fetch can fail, arrive after the resource changes, or find it already deleted. Define whether the receiver fetches the current state or a historical version. Notifications may also carry just enough routing metadata to find the resource without exposing sensitive content.

### 2. State-transfer message

A state-transfer message carries a snapshot or data projection, for example `CustomerAddressChanged` with the new address fields for an authorized downstream consumer. The recipient can update a local read model without synchronously calling the source. This reduces runtime coupling, but copies state and creates schema evolution, privacy, retention, and staleness responsibilities. Include an aggregate identifier, schema version, and monotonic source version where useful; consumers should reject older versions if out-of-order delivery would roll a projection backward. A snapshot is not automatically a complete audit history or the source of truth.

### 3. Domain event

A domain event states a business fact that has already occurred, such as `PaymentCaptured` or `SubscriptionCancelled`. Its name and fields should reflect the domain language and a committed business outcome, not an internal method call. Events can notify many consumers and support projections, integrations, or audit workflows, but those consumers may process asynchronously and temporarily disagree with the authoritative write model. Treat event schemas as public contracts: preserve old readers, add fields compatibly, and version breaking semantic changes intentionally.

## Cross-item comparison

| Message intent | Example payload | Receiver behavior | Typical coupling |
|---|---|---|---|
| Notification | `DocumentChanged(id, version)` | Fetch current or specified version from owner | Receiver depends on source read API/availability |
| State transfer | `DocumentSnapshot(id, version, fields...)` | Update local copy/projection | Producer payload schema and copied-data lifecycle |
| Domain event | `InvoiceIssued(invoiceId, customerId, occurredAt)` | React to immutable business fact | Shared event semantics and eventual processing |

One message can satisfy more than one intent, but explicitly state which contract consumers may rely on. If the payload is only a notification, consumers must not assume the fields represent an authoritative snapshot. If it is a domain event, do not mutate the meaning of that historical fact when the current state changes.

## Examples

**Search projection.** The catalog commits a product change and records an outbox event containing product ID and source version. A search projector consumes it and can either fetch the latest representation (notification style) or apply a supplied projection update (state-transfer style). It stores the last applied version to avoid a delayed older event overwriting a newer document. Search is eventually consistent; checkout validates price and stock against authoritative services rather than trusting the index.

**Customer deletion.** A `CustomerErasureRequested` workflow is a command or request, not proof that deletion is finished. The system tracks the required stores and legal retention exceptions. When each owner finishes, it may publish a domain fact such as `CustomerErasureCompleted` without including the erased personal data. A notification can tell a downstream processor to fetch an authorized task record. Keep event retention and replay compatible with data-minimization obligations.

## Common mistakes

- Calling every broker message a domain event, even when it is a command, notification, or snapshot.
- Placing the entire database row in an event “for convenience,” creating accidental coupling and copies of sensitive data.
- Publishing an event before the transaction commits or losing it between a database commit and broker publish; use an outbox or equivalent atomic handoff.
- Assuming event consumption is exactly once, ordered globally, or instantaneous; design for the delivery guarantees actually provided.
- Treating event payload state as current forever or overwriting a newer projection with an older message.
- Renaming or changing a fact’s semantics without preserving consumers or publishing a compatible version.
- Using an event stream as an audit system without access controls, retention, integrity, and deletion policy.

## Knowledge checks with answers

1. **A consumer receives only `DocumentChanged(id)`. Is that a state snapshot?** No. It is a notification; the consumer must fetch the defined authoritative version or current resource.
2. **Why include an aggregate version in a transferred projection?** So a consumer can detect duplicates/out-of-order updates and avoid replacing newer state with an older copy.
3. **Is `PaymentCaptured` a command?** It should normally be a domain fact after capture succeeded. A request to attempt capture is a command and can fail.
4. **What must be decided before replaying retained events?** Idempotency, external side effects, schema compatibility, privacy/retention constraints, and whether replay re-creates current state or repeats actions.
