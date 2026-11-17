# system design foundations and infrastructure building blocks — Reference: Cloudflare Workers

Sources: [How Workers works](https://developers.cloudflare.com/workers/reference/how-workers-works/), [Runtime limits](https://developers.cloudflare.com/workers/platform/limits/), [Execution context and `waitUntil`](https://developers.cloudflare.com/workers/runtime-apis/context/), [Workers KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/), [Durable Object storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/), [Storage product choices](https://developers.cloudflare.com/workers/platform/storage-options/).

## Scope and version

This lesson explains Cloudflare Workers as an edge compute platform and distinguishes the runtime from adjacent Cloudflare data products. Runtime limits, APIs, plan details, and product availability change; check current documentation for deployment decisions. Workers are not general-purpose virtual machines: code runs in a managed runtime with platform-specific resource and networking behavior.

## How this group fits the mental model

When a request arrives, Cloudflare routes it to a Worker in its network. The Worker can inspect the request, perform computation close to the user, call bindings or remote services, and return or stream a response. This is useful for request routing, authentication gates, cache decisions, lightweight APIs, rendering, and adapting traffic between clients and origin systems.

The important design split is between short request handling, durable background work, and coordinated state. A regular Worker handles events in an isolate with CPU and memory constraints. `ctx.waitUntil()` can extend promise work after the response or disconnect, but only for a bounded platform interval; it is not a queue or durable workflow guarantee. For durable asynchronous processing use a queue/workflow product with explicit retries and idempotent consumers. For one logical entity that needs serialized coordination and transactional state, a Durable Object can provide a uniquely addressed coordinator and attached strongly consistent storage. Workers KV serves a different use: globally distributed, cache-heavy reads where eventual consistency is acceptable.

Putting code at the edge does not make a dependent database or origin globally local. Every remote call still has network latency and failure modes. Design timeouts, bounded retries, fallbacks, cache policy, and observability around the complete path.

## Supplied names explained

- `Cloudflare Workers` — Managed event-driven compute running JavaScript/TypeScript and WebAssembly-compatible code in Cloudflare's network. It can execute close to users and connect to Cloudflare bindings or external services, subject to the runtime's resource, API, and product limits.

## Cross-item comparison

| Requirement | Suitable building block | Key trade-off |
| --- | --- | --- |
| Route, filter, authenticate, or transform an HTTP request near users | Stateless Worker handler | Keep CPU and memory bounded; avoid turning every request into a chain of slow origin calls |
| Serve globally cached configuration or preferences with high read volume | Workers KV | Eventual consistency and cached old values mean it is unsuitable as the sole authority for a strict read-after-write decision |
| Coordinate all operations for one room, account, device, or other entity | Durable Object keyed by that entity | Gives a coordination point and attached storage; avoid one global hot object that serializes unrelated users |
| Run work reliably after a request returns | Queue or workflow consumer | Requires explicit delivery/retry/idempotency design; `waitUntil()` alone is not durable job processing |
| Maintain relational data and SQL queries | D1 or an external relational database | Choose transaction/query behavior and location deliberately; edge execution does not erase database round-trip or consistency constraints |
| Run a broad long-lived process with arbitrary OS-level dependencies | Container, VM, or conventional application host | More control and process model, with more infrastructure to manage; may fit dependencies that the Workers runtime does not support |

## Examples

### Edge authentication and API forwarding

A Worker validates an incoming session or token, rejects malformed requests early, applies a cache policy to public resources, and forwards authorized requests to an API origin. It should pass only necessary headers, set a timeout, avoid logging credentials, and define behavior when the identity provider or origin is unavailable. If the Worker fetches profile state from KV, it must tolerate a stale value; a high-risk authorization decision should use an authoritative, appropriately consistent source.

### Chat room with a global edge entry point

Each request reaches a regular Worker, which derives a stable room identifier and forwards room operations to that room's Durable Object. The object serializes room membership and messages or coordinates connected clients. A per-room object avoids a single global coordination bottleneck. If the product needs durable message history, exports, or cross-room search, store and query that history in a system designed for those needs rather than relying only on in-memory state.

### Choose KV or a Durable Object for configuration

For a rarely changed feature flag read by many locations, KV can be a reasonable cache-like store when temporary stale reads are acceptable. For a single inventory reservation or seat allocation where concurrent writers must not oversell, use a transactional/serialized authority such as a Durable Object or a database transaction. Replicating a KV value does not turn it into an atomic counter.

## Common mistakes

- Treating edge compute as zero-latency access to the application's central database.
- Buffering an unbounded request or response body in memory rather than streaming within platform limits.
- Using `waitUntil()` as a substitute for a durable queue when work must survive interruption and be retried or inspected.
- Using KV as a strongly consistent lock, inventory counter, or security authority despite eventual consistency and caching.
- Routing every entity through one Durable Object, creating a hot serialized bottleneck instead of partitioning by the coordination boundary.
- Assuming a Worker isolate is a persistent process. In-memory state can disappear when an isolate is evicted or replaced; durable state belongs in a persistence product.
- Retrying non-idempotent side effects without an idempotency key or reconciliation strategy.
- Treating platform limits and plan-specific quotas as timeless constants; verify the live limits for the account and invocation type.

## Knowledge checks with answers

1. **Why might a Worker near the user still have a slow request?** Its origin, database, identity provider, or another dependency may be far away or slow. Edge placement reduces only some parts of the path.
2. **Can `waitUntil()` safely process a job that must never be lost?** Not by itself. It extends background work for a bounded time but is not a durable queue; enqueue the work in a durable system and make the consumer idempotent.
3. **When should KV be avoided as the authority?** When the operation requires immediate globally consistent reads, atomic read-modify-write, strict uniqueness, or concurrency control that KV does not promise.
4. **What does a Durable Object's identity buy you?** A stable, globally addressable coordination point for one logical entity, with attached persistent storage and serialized logic; it does not remove the need to partition load or design recovery.
5. **What should be checked before moving a Node server to Workers?** Runtime compatibility, native module/OS assumptions, streaming behavior, request body handling, CPU/memory budgets, binding behavior, origin dependencies, and required background processing guarantees.

## Practice

Design a globally accessed ticket-booking API. Place the stateless request logic, authoritative seat allocation, cacheable venue data, payment call, and post-booking email work. State which consistency guarantee each data product must provide, what happens on timeout after payment, how retries avoid double booking or charging, how you partition coordination to avoid hot spots, and which latency the edge placement actually removes.
