# system design foundations and infrastructure building blocks — Reference: Cloudflare Durable Objects

Sources: [What are Durable Objects?](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/), [Lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/), [Rules and best practices](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/), [Storage access](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/), [WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/), [FAQ and limits](https://developers.cloudflare.com/durable-objects/reference/faq/), [Durable Object architecture pattern](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/).

## Scope and version

This lesson explains Cloudflare Durable Objects as a stateful coordination building block on the Workers platform. APIs, storage backends, placement options, migration requirements, and limits evolve; check the current Cloudflare docs and your namespace configuration. A Durable Object is not a globally replicated relational database: each object is an individually addressed coordination unit with its own storage and execution lifecycle.

## How this group fits the mental model

Imagine a chat room with many connected participants. A normal Worker can receive a request anywhere, but coordinating room membership and message order across multiple stateless handlers requires a shared authority. The application can derive a stable object ID from the room ID and send every room operation to that Durable Object. That instance provides one logical place to coordinate room state and connected clients.

Each object has a globally unique identity, single-threaded JavaScript execution, and private durable storage. The instance can be evicted or hibernated while its persistent data remains. This actor-like shape makes per-entity serialization easier, but the key choice determines throughput: a single object for all users becomes a hot serialized bottleneck. Split by a natural coordination boundary such as room, account, game, or device, while keeping operations that need atomic coordination within one object's boundary.

Single-threaded execution does not mean every async operation is automatically atomic. Requests can interleave at `await` points. Use storage transactions for atomic read-modify-write operations and design external side effects with idempotency/reconciliation; a transaction cannot atomically include a remote payment service. Keep durable state in storage rather than relying on in-memory fields, because in-memory state is lifecycle-scoped and may be lost when the object stops or code changes.

Durable Objects also support WebSockets, including a hibernation API that can keep connections open while allowing JavaScript execution to sleep, and alarms to wake an object for scheduled work. These features help with connection-heavy and timer-based designs, but they do not replace a durable queue when many independent jobs need backpressure, retry policy, and dead-letter handling.

## Supplied names explained

- `Cloudflare Durable Objects` — A Workers-platform primitive combining uniquely addressed compute with private persistent storage, useful for coordinating state and clients around one logical entity.

## Cross-item comparison

| Mechanism | Consistency/coordination role | Good fit | Boundary |
| --- | --- | --- | --- |
| Durable Object | Per-object coordination and transactional, strongly consistent attached storage | Chat room, multiplayer match, per-account workflow, rate coordination, WebSocket hub | Hot-key risk and per-object storage/compute limits; unrelated entities should be partitioned |
| Workers KV | Globally distributed and cached key-value reads with eventual consistency | Read-heavy configuration, preferences, cache-like data | Not an atomic counter or strict read-after-write authority |
| Relational database | Transactions and relational queries across rows/entities | Business records and multi-entity constraints | Network placement and connection/query patterns must be designed; it may be the better authority for cross-entity transactions |
| Queue | Durable asynchronous message handoff, buffering, and consumer retries | Work that can be processed later or needs load smoothing | Usually at-least-once-style consumer design requires idempotency; not an interactive per-entity coordinator by itself |
| In-memory map in a Worker | Fast state within one isolate's lifetime | Temporary cache or request-local work | No stable identity, durable persistence, or reliable coordination among isolates |

## Examples

### Model a room as a Durable Object

1. A regular Worker authenticates the user and validates the room identifier.
2. It derives or looks up the stable room object ID and forwards the operation to that object.
3. The object validates membership, uses storage transactions for state changes that must be atomic, and sends updates to connected room members.
4. Persistent messages or audit history are stored deliberately. If message history must be searchable or retained independently, write it to a database/object store using an outbox or idempotent event pattern.
5. When idle, WebSocket hibernation may keep connections alive while object code is not actively executing. On wake or code update, the constructor/lifecycle runs again, so restore needed state from durable storage and re-establish only valid ephemeral state.

### Prevent a hot object

Suppose one global object tracks every application's rate limits. All requests serialize through one key, creating a throughput ceiling and broad failure domain. Instead partition counters by tenant or resource where semantics permit. If a global cap is truly required, use a design that makes the central coordination cost explicit, perhaps allocating bounded token batches to partitions and accepting controlled approximation. The partitioning changes correctness semantics, so document the trade-off rather than silently splitting state.

### Handle a scheduled timeout

An object can set an alarm for a room-expiration deadline and wake later to check whether the deadline is still current before deleting or closing state. Store the deadline/version durably, make the alarm handler safe to run after a delay or retry, and compare current state before applying the action. For large independent scheduled workloads, a queue or workflow service may provide a more suitable operational model.

## Common mistakes

- Treating the object as one globally replicated database. Its coordination and storage are per object; cross-object transactions are not implied.
- Putting every user or room in one object and discovering that single-threaded serialization limits throughput.
- Assuming single-threaded execution removes races across asynchronous interleavings. Use transactions for atomic storage updates and idempotency for remote effects.
- Keeping the only copy of important state in memory. Objects can hibernate, be evicted, restart, migrate, or run new code.
- Treating a WebSocket connection as durable application history. Persist messages/state that must survive disconnection or lifecycle changes.
- Using alarms as if they were a high-volume queue with rich retry/dead-letter semantics.
- Updating a Durable Object class/namespace without planning migrations for existing persisted data and object identity.
- Assuming a transaction covers a payment API, email, or another service. It covers the documented storage operation boundary; external effects need a workflow design.

## Knowledge checks with answers

1. **Why route a room's operations to one object?** It provides one logical coordination point for room-specific state and clients, avoiding a separate distributed lock for that boundary.
2. **Can a single Durable Object handle unlimited throughput?** No. Requests and storage work for that object share a coordination unit and can serialize; partition the application where the business invariant allows it.
3. **Does single-threaded JavaScript make a read-modify-write safe across `await`?** No. Async operations can interleave. Use a storage transaction for atomic state changes and handle external side effects separately.
4. **What survives hibernation or eviction?** Durable storage survives according to the product's persistence contract; ordinary in-memory fields do not. WebSocket hibernation is a special API that can retain connections while the object sleeps.
5. **When should a queue be used instead?** When work should be buffered and processed asynchronously with delivery/retry controls, especially at high volume; an object alarm is not a general substitute.

## Practice

Design a collaborative editing service. Pick the Durable Object identity boundary, define which operations need a transaction, estimate hot-document traffic, model WebSocket connect/disconnect and hibernation, persist edit history, and send indexing work to a queue. Explain how a code migration handles existing objects, how retries avoid duplicate edits/indexing, and what happens if the object's storage or an external database is temporarily unavailable.
