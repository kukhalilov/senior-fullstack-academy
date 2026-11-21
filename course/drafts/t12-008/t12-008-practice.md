# system design tradeoffs and decision methods — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/trade-offs/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [reference 5](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

Choose a storage, consistency, deployment, API, and event-delivery approach for a globally used inventory service. For each decision, write the invariant, workload assumption, alternative, failure behavior, and operational cost.

**Worked solution.** Keep the invariant explicit: inventory cannot be oversold. Compare a single-region transactional baseline with multi-region options using measured write latency, recovery objectives, and conflict semantics. Use a query/API contract suited to clients and cacheability, while documenting schema evolution. Choose event delivery based on whether consumers need task dispatch or retained replay. Make cache freshness bounded and never use it as the final allocation authority. Revisit each decision if assumptions change.

| Concern | Baseline decision | Why | Failure behavior to test |
|---|---|---|---|
| Authoritative stock | One transactional SQL database with a conditional decrement/reservation row | A single authority can enforce the last-unit invariant simply | Concurrent final-unit requests, deadlock/timeout, recovery from backup |
| Catalog browsing | Cacheable read model/CDN where fields are public | Browsing can tolerate a stated freshness bound | Stale page after a price/availability change; purge/expiry behavior |
| Reservation confirmation | Commit reservation ID and outbox record in one local transaction | Durable acceptance and publish intent are recorded together | Crash after commit, duplicate outbox event, delayed consumer |
| Fulfillment | Durable queue for worker dispatch; analytics may use a retained log | Fulfillment is competing work; analytics needs independent replay | Redelivery, poison job, consumer outage, retention expiry |
| Global access | Regional reads first; write placement chosen from RTO/RPO and conflict needs | Worldwide users do not automatically require multi-writer inventory | Region loss, failover lag, duplicate reservation, stale browsing |

### Small capacity estimate

Assume for exercise purposes 100,000 daily active users, each making 8 catalog reads/day and 1 reservation per 50 users/day. This gives 800,000 reads/day (about 9.3 average reads/s) and 2,000 reservations/day (about 0.023 average reservations/s). If the measured peak-to-average factor is 20, the rough peak is about 185 reads/s and 0.46 reservations/s. These are illustrative estimates, not product facts; real traffic may be much burstier around sales. Add payload sizes, concurrent sessions, cache hit ratio, retries, background events, growth, and safety headroom before sizing.

## Exercises

1. Restate the product goal as two functional requirements and three measurable quality objectives.
2. Estimate the average, peak, and burst workload. List the assumptions that most affect your estimate.
3. Identify authoritative data and one derived representation. State how the derived data is refreshed and reconciled.
4. Walk through a timeout after a write. What does the client know, and what key or query resolves ambiguity?
5. Remove one dependency from the design. Describe user-visible degradation and the telemetry that should detect it.
6. Explain which single measurement would justify the next scaling change.

## Progressive hints

Start with user behavior and invariants. Draw a baseline before adding components. Follow the write path and read path separately. Distinguish successful completion from durable acceptance and unknown outcome.

## Complete solutions

1. Functional requirements describe specific user actions and outcomes. Quality targets state boundary, workload, metric, threshold, and measurement window; they should be agreed with the product owner.
2. Use ranges and show the arithmetic. Include peak-to-average ratio, concurrency, payload, and retention; mark estimates that need measurement.
3. Name the component that owns the authoritative update. A derived store needs a delivery/rebuild policy and a freshness objective.
4. A timeout is ambiguous. Retry only with an idempotency key or verify the operation by a stable identifier before issuing a new effect.
5. Preserve critical behavior and degrade optional work. Emit dependency latency/error, request outcome, queue age where relevant, and trace context without high-cardinality sensitive fields.
6. Select evidence for the actual constraint, such as database saturation, tail latency, queue age, or cache miss cost. Scale the constrained component and retest.

## Tests and edge cases

Test duplicate requests, slow consumers, a full queue, stale cache, one node or zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant ID, and recovery from backup.

## Reflection questions

Which assumption could invalidate the design? Which invariant would be hardest to recover after a partial failure? What evidence would make you remove a component rather than add another?
