# system design tradeoffs and decision methods — Reference: Push vs pull delivery and fan-out

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Azure queue-based load leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling), [Azure competing consumers](https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers).

## Scope and version

Push and pull describe who initiates delivery/consumption. Fan-out describes how one event reaches multiple interested consumers. They are separate decisions and can be combined.

## How this group fits the mental model

**Push:** a producer/broker sends work or events to consumers as they arrive. It can reduce delivery delay, but consumers need flow control, bounded queues, retry handling, and protection from overload.

**Pull:** consumers request work when ready, controlling concurrency and pace. It smooths load and supports backpressure, but polling adds delay/empty requests unless a blocking receive is available.

**Fan-out:** publish one event to multiple independent subscriptions/queues so each consumer can process it at its own rate. Decide whether each subscriber needs all events, replay, ordering, retention, and independent failure isolation. A work queue with competing consumers typically distributes each message to one worker; a pub/sub topic fans copies to subscriptions.

## Supplied names explained

- `Push vs pull delivery and fan-out` — Push distributes work/data to consumers proactively and can create hot consumers or fan-out bursts; pull lets consumers control pace but adds polling delay and cursor/lease management. Hybrid systems partition responsibility and need backpressure.

## Cross-item comparison

Pull is useful when expensive consumers must cap work and apply backpressure. Push is useful for low-latency notification when the downstream can absorb controlled delivery. Use a durable queue to decouple bursty producers from workers; use pub/sub when multiple systems need separate copies. Limit prefetch and queue depth, and define what producers do when buffers fill.

## Examples

Order-created events feed billing, email, and analytics. Publish once to a durable topic with three subscriptions; each subscriber pulls at bounded concurrency. If email is slow, its backlog grows without blocking billing, but retention and lag alarms must prevent expiry. A consumer crashes after sending an email but before acknowledging; on redelivery it must deduplicate by event ID or risk sending twice.

## Common mistakes

- Confusing pub/sub fan-out with competing consumers in one work queue.
- Pushing faster than consumers can process without bounded buffers/backpressure.
- Assuming acknowledgement means exactly-once business side effect.
- Sharing one subscriber's queue/retention so a slow consumer blocks unrelated subscribers.

## Knowledge checks with answers

1. **How do competing consumers use one work queue?** They divide messages among workers.
2. **How does pub/sub fan-out differ?** Each subscription receives its own delivery stream/copy according to broker semantics.
3. **What protects a push consumer from overload?** Bounded queues, flow control, concurrency/prefetch limits, and producer throttling.
