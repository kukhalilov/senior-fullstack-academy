# system design technology landscape and selection — Exercises and worked solutions

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [PostgreSQL documentation](https://www.postgresql.org/docs/current/), [Kafka design](https://kafka.apache.org/design/), [gRPC concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [GraphQL introduction](https://graphql.org/learn/introduction/), [Spanner overview](https://cloud.google.com/spanner), [DynamoDB introduction](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [Vitess overview](https://vitess.io/docs/24.0/overview/whatisvitess/), [ScyllaDB Cassandra compatibility](https://docs.scylladb.com/manual/master/using-scylla/cassandra-compatibility.html).

## Goals

Practice moving from user behavior to a minimal correct design, estimating load, assigning ownership, comparing alternatives, and designing partial-failure behavior. Product choice is the last step in each exercise, after the requirement and contract are clear.

## Worked example

### Build an upload and processing service

Users upload videos up to 2 GB. The service must show upload progress, reject unauthorized access, transcode asynchronously, and make processed videos available globally. An upload acknowledgement must mean the bytes are durably accepted. Transcoding may take minutes and can be retried. A user must not see another tenant’s video.

### Requirements and assumptions

- Functional: an authorized user uploads, checks processing status, and streams a completed video.
- Correctness: only the owning tenant can read or change metadata; processing a duplicate job must not create multiple logical outputs.
- Quality: upload API servers should not carry the full video payload; processing is asynchronous; downloads should be geographically efficient.
- Assumptions to verify: peak uploads/hour, average file size, retention, transcode time/CPU, region needs, and acceptable completion delay.

### Baseline design

1. API authenticates the user, checks tenant quota, creates an upload row with a server-generated object key and `pending` state.
2. API returns a short-lived, scoped object-storage upload capability. Client uploads directly and supplies a checksum/size result.
3. A completion endpoint verifies the object and atomically updates metadata plus an outbox row. This avoids a database commit with a lost publish step.
4. An outbox publisher emits a job to a durable work queue. The job carries object key, tenant ID, and an idempotency identifier, not a long-lived public URL.
5. A worker claims the job, transcodes to a temporary output, writes the final content-addressed object, and marks status complete using a conditional/idempotent update.
6. Authorized downloads use a short-lived signed URL or an authenticated CDN path. CDN cache keys and policies must prevent cross-tenant response reuse.

### Failure walk-through

- **Upload completed but client timed out:** client asks the API for the upload’s status or retries completion with the same upload ID; it does not create a second logical upload.
- **Outbox publisher crashes after publish but before recording progress:** duplicate job is possible; the worker uses the job ID and idempotent output/state transition.
- **Worker crashes mid-transcode:** lease/visibility timeout permits retry; partial temporary output is cleaned or overwritten safely.
- **Database update succeeds but response is lost:** status lookup returns the committed state; stable IDs avoid duplicate rows.
- **CDN returns an object to the wrong tenant:** this is a security incident. The cache policy must not share authenticated/private responses; authorization remains at the origin or signed delivery boundary.

The design does not need a globally distributed SQL system just because users are global. First test whether regional object delivery plus a single authoritative metadata region meets latency and availability goals.

## Exercises

### Exercise 1: quantify a workload before selecting storage

A calendar service has 2 million active users. Assume each user opens the app 4 times/day; each open reads 20 events and writes 0.2 event on average. Estimate daily reads/writes and average rates. Then list missing inputs required to size a peak.

**Worked solution.** Reads/day = 2,000,000 × 4 × 20 = 160,000,000. Writes/day = 2,000,000 × 4 × 0.2 = 1,600,000. Over 86,400 seconds, averages are about 1,852 reads/s and 19 writes/s. These averages do not size capacity: need peak/weekday ratio, burstiness at local morning, fan-out, payload size, cacheability, multi-device concurrency, retention, and read consistency requirement. The 20-event read might be one range query or many point reads; API shape changes backend load.

### Exercise 2: choose delivery semantics

An order is committed to SQL Server and must trigger fulfillment, email, and analytics. Compare direct dual-write, an outbox with a work queue, and a retained event log.

**Worked solution.** Direct dual-write can lose one side if the process crashes between database commit and publish. An outbox writes the order and pending event in one database transaction, then a relay publishes; consumers must tolerate duplicate publish/replay. A work queue fits fulfillment/email tasks where workers compete to handle each job; an event log fits analytics or other independent consumers that need replay and separate offsets. A common design publishes an outbox event to a log, then sends fulfillment commands or consumes it with idempotent handlers. Do not call the whole cross-system business effect exactly once unless the database, broker, and side effect share a supported transaction or a deduplication/reconciliation contract.

### Exercise 3: reduce latency without breaking correctness

Product pages are slow. Decide what to measure and which optimizations are safe to consider first.

**Worked solution.** Split latency by browser rendering, edge/network, API, database, and downstream calls; inspect p50/p95/p99, error rate, cache hit ratio, payload size, query plan, and trace spans. Start with indexes/query shape, batching, compression, and eliminating redundant calls. A CDN or application cache is safe only for public/cacheable data with a correct key and freshness policy. User-specific prices or entitlements require isolated caching or no shared cache. Avoid adding a cache before identifying the slow stage.

### Exercise 4: reason about a timeout after a write

The client sends `POST /payments`, waits five seconds, and times out. Should it retry?

**Worked solution.** The client knows only that it did not receive a response; the payment may have succeeded. The client submits a stable idempotency key. The server stores the key with the operation outcome and returns the same result for a repeat. If the provider’s outcome is uncertain, the server queries/reconciles with the provider using its operation reference before creating another charge. A request timeout is not a rollback.

### Exercise 5: find the first scaling move

A service has high queue depth, healthy database latency, and a growing age of oldest job. Worker CPU is near saturation. Should you shard the database?

**Worked solution.** No evidence points to the database. Measure job service time, worker concurrency, downstream quotas, and backlog growth. Add worker capacity only if downstream dependencies and cost allow; otherwise optimize the job, batch appropriately, apply admission control, or increase acceptable completion time. A queue smooths bursts but does not create processing capacity. Alert on age/lag and define a maximum backlog/dead-letter policy.

### Exercise 6: compare two storage candidates

The workload needs atomic updates to account balance and ledger entries, range queries by customer/time, and a low-latency global read replica. Compare a relational database with a distributed key-value store.

**Worked solution.** The invariant and range-query requirement strongly favor a relational transaction model unless a distributed store demonstrably provides the required transactional scope and query behavior. A distributed key-value store may offer locality/scale but usually requires access-pattern-specific keys, explicit partition design, and tradeoffs around cross-key transactions. Consider a relational primary plus read replicas first; stale replicas may be fine for dashboards but not for a debit authorization. Evaluate actual region RTT, failover RPO/RTO, consistency after promotion, and write conflict behavior before selecting a globally distributed database.

## Progressive hints

For each problem, start from the invariant and one end-to-end path. Estimate only enough to expose a constraint. Name what is authoritative and what may be stale. Then trace one failure and identify a safe recovery action.

## Complete solutions

Each exercise includes a worked solution directly after its prompt; these show one defensible answer and the assumptions it depends on rather than a universal product choice.

## Tests and edge cases

For any design, test duplicate requests, lost acknowledgements, slow consumers, a full queue, hot keys, stale cache, one node/zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant IDs, bad/late events, backup restoration, and a broad CDN purge. For each test, record expected user-visible behavior, authoritative state, alert, recovery action, and whether repeating the operation is safe.

## Reflection questions

Which assumption could invalidate your design? Which state is impossible to rebuild? Where can a timeout leave an unknown outcome? What is the maximum safe queue age? Which privacy boundary crosses a cache or telemetry system? What measured evidence would justify adding a database shard, region, or service?
