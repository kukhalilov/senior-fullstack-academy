# architecture patterns multi-region tenancy and reliability — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), [Google SRE handling overload](https://sre.google/sre-book/handling-overload/), [Microsoft multitenant data approaches](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS Well-Architected game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html), [NIST Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final), [DORA delivery metrics](https://dora.dev/guides/dora-metrics/).

## Core questions

1. What user journey and invariant are we designing for, and what is explicitly out of scope?
2. What workload shape, growth, tenant skew, and latency distribution should the design handle?
3. Which service owns each write, and which reads may be cached, replicated, or eventually consistent?
4. What happens if a request times out after the side effect succeeded, or a message is delivered more than once?
5. Which failure domain is the recovery plan meant to survive, and what RTO/RPO has actually been tested?
6. How are identity, tenant isolation, privacy, and abuse protected on every request path?
7. Which end-to-end SLI demonstrates success, and which saturation/lag signal warns of failure?
8. What does each boundary cost in latency, operational ownership, coordination, and money?

## Concise interview answers

A strong answer begins with a short requirements summary and a few high-value clarifying questions. It states assumptions out loud, estimates load only enough to select an architecture, and draws the simplest baseline before adding complexity. For each component, connect it to one requirement and state what it does not guarantee. Trace one write and one read end to end; then walk through timeout, duplicate, overload, dependency outage, and recovery. Finish with the unresolved decision, measurable risks, cost, and how you would validate the design.

Do not jump from “large scale” to microservices or from “availability” to active-active. A modular monolith may be the simplest first step; a second region may require tested data ownership and failover more than another diagram. Make trade-offs conditional on the stated user objectives.

## Deep follow-up answers

### 1. A database commit may have succeeded although the caller timed out. What is the protocol?

Treat the remote result as unknown, not failed. The client retries with the same idempotency key or queries a stable operation ID. The server records the key and result atomically with the state transition, scoped to caller/tenant and operation. If an external side effect is involved, propagate an idempotency key where supported and reconcile ambiguous outcomes before retrying. Expire key records only after the maximum client retry/replay window is understood.

### 2. Traffic grows tenfold but one tenant drives it. How do you protect other tenants?

Measure per-tenant request rate, concurrency, cost, latency, and queue age. Enforce authenticated quotas and bounded concurrency at ingress and downstream pools; isolate large/noisy tenants into cells or dedicated partitions when shared capacity cannot meet fairness goals. Add priority/admission control for critical journeys. Do not partition solely from aggregate traffic; check data locality, hot keys, cross-tenant queries, migration complexity, and operational ownership.

### 3. Queue depth is healthy but users report delayed work. What do you inspect?

Queue depth is a point-in-time count; old work can be stuck while new messages are consumed. Inspect oldest-message age, enqueue-to-completion latency, per-partition/tenant lag, retry and dead-letter counts, worker saturation, dependency latency, and end-to-end traces. Correlate one user operation through enqueue, handler, and completion, with stable correlation IDs and privacy-safe attributes.

### 4. A release changes API and schema while old instances remain. How do you sequence it?

Use expand-and-contract: add backward-compatible schema/fields; deploy readers/writers that tolerate old and new representations; backfill and verify; switch traffic; observe; then remove obsolete columns/contracts only after old versions and rollback paths are gone. Canary the application change and keep schema migration compatibility independent from application rollback. A migration that drops data is not reversed by rolling back binaries.

### 5. Two regions accept conflicting writes. Which should merge?

Classify operations by business invariant. Some independent edits (for example, collaborative text) can use a CRDT with explicit merge semantics; money transfer, inventory reservation, and unique-name assignment often need a single authority, coordination, or a domain-specific conflict workflow. Active-active infrastructure does not itself resolve business conflicts. State ownership, fencing/split-brain protection, reconciliation, and user-visible behavior must be designed before enabling multi-writer traffic.

### 6. How do you choose between a modular monolith and microservices?

Start with cohesive modules and explicit dependencies/data ownership. Split into independently deployed services when a stable boundary solves a demonstrated need—independent scaling, release cadence, team ownership, security isolation, or fault containment—and the organization can operate the network, deployment, observability, and data consistency costs. A service boundary with shared database writes may preserve coupling while adding failure modes.

### 7. When is choreography preferable to orchestration?

Choreography suits independent reactions with a small, understandable event graph and clear local ownership. Orchestration can make long-running workflows, deadlines, compensations, and support visibility explicit. Both require idempotency, retry policy, schema evolution, correlation, and operational recovery. Choose based on process visibility and change ownership, not fashion.

### 8. How do you decide whether multi-region is required?

Translate availability language into user-visible SLO, region-outage assumption, RTO/RPO, residency, latency, and cost. Test whether multi-zone redundancy and backups meet those objectives first. Multi-region adds replication lag, failover/failback, split-brain, routing, and data-placement work. Choose active-passive if a controlled write-owner transfer meets targets; use active-active only where write semantics, conflicts, and operational readiness support it.

### 9. How do you handle overload and prevent cascading failure?

Bound queues, timeouts, retries, concurrency, and fan-out. Use exponential backoff with jitter only where retries can help, cap retry budgets, and avoid retry multiplication across layers. Shed or degrade optional work before critical paths, isolate resource pools, and protect dependencies with admission control/circuit breaking. Monitor user-facing success and latency plus saturation and queue age. Autoscaling is too slow for some bursts and cannot overcome finite dependency capacity.

### 10. How do you choose an SLO and error budget?

Define a user journey and an SLI with a clear numerator/denominator and window, then choose a target based on customer need, cost, and operational capability. The error budget is the allowed unreliability implied by the SLO for that window. Use burn rate and budget consumption to prioritize reliability work; do not claim a target based solely on infrastructure uptime or the number of replicas.

### 11. How do you prove disaster recovery works?

Restore real backups and exercise the full dependency chain: identity, keys, network, schema, capacity, data replay, tenant placement, routing, and operations access. Time recovery against the RTO and validate recovered data against RPO and business invariants. Test failback and reconciliation too. A successful backup job or configured replica is not a recovery test.

### 12. What metrics show whether an engineering organization is improving?

Use a contextual set: current DORA delivery throughput/instability metrics for an application, service SLOs and user outcomes, flow bottlenecks, and developer experience/qualitative feedback. DORA’s current five metrics are change lead time, deployment frequency, failed deployment recovery time, change fail rate, and deployment rework rate. They are system-level improvement signals, not individual rankings. Investigate causal bottlenecks rather than rewarding one number.

## Scenario questions

- A region becomes unreachable while asynchronous replication is 90 seconds behind. Which reads and writes remain safe? Who is allowed to promote the replica, and how do you reconcile the missing interval?
- One tenant submits 80% of work. How do you maintain fairness while preserving a contractual priority tier?
- An outbox publisher is healthy by process status but has a growing oldest-record age. What data path, alert, and repair procedure do you inspect?
- A tenant requests deletion, but encrypted backups are immutable for a retention period. How do you map data copies, access suppression, key lifecycle, and eventual deletion without making unsupported legal assumptions?
- A canary has healthy infrastructure metrics but lower successful checkout rate. Which signal controls rollout and what is your rollback boundary?
- A forecast scales a service before a daily peak but doubles spend on a holiday with low demand. How do you evaluate forecast error, guardrails, and the reactive fallback?
- An API accepts a signed JWT with the wrong `aud`. Why reject it, and which layer owns issuer, audience, expiry, and authorization validation?
- A Spot worker disappears after sending a payment request but before recording success. What idempotency/reconciliation protocol prevents a duplicate charge?

## Tradeoffs and alternatives

- **Modular monolith vs Microservices:** compare cohesion, release/scale independence, team ownership, data consistency, and operational cost.
- **CQRS vs Event sourcing:** CQRS separates read/write models; event sourcing stores state-changing events as the authoritative history. Neither implies the other.
- **Single-region vs Multi-zone vs Multi-region:** compare failure domain, latency, recovery targets, replication semantics, and cost.
- **Active-passive vs Active-active:** compare failover simplicity and write ownership against latency, availability, conflict, and consistency requirements.
- **Choreography vs orchestration:** compare independent reactions with workflow visibility and centralized process control.
- **RED vs USE:** RED focuses on request-oriented service behavior (rate, errors, duration); USE examines resource utilization, saturation, and errors. Use signals suited to the service and infrastructure layer.
- **Canary deployment vs Expand-and-contract migration:** canary limits application release exposure; expand-and-contract preserves compatibility across schema/code versions. They address different risk dimensions and can be combined.
- **Spot vs committed/reserved capacity:** compare reclaimability, usage commitment, actual capacity guarantee, flexibility, and cost per completed work—not the marketing label.

## Common weak answers

- “Use microservices, a cache, Kafka, and Kubernetes” without connecting each item to a requirement or failure boundary.
- “The request failed because it timed out” when the remote side effect may have succeeded.
- “Scale horizontally” without resource requests, data partitioning, dependency headroom, or provisioning lag.
- “Use active-active” without defining write ownership, conflict resolution, consistency, and split-brain protection.
- “The system is available” without user-visible success, a measurement window, and recovery objective.
- Drawing components without defining source of truth, tenancy controls, privacy copies, operations owner, or cost.
- Naming an SLO target without its SLI or customer rationale.
- Claiming exactly-once effects from a broker guarantee while ignoring databases and external providers.
- Treating deployment frequency, commits, or tickets as an individual productivity score.

## Self-check rubric

Score 0–2 for each dimension: requirements and assumptions; workload reasoning; data ownership and consistency; read/write path; failure, overload, and recovery; identity/privacy/security; observability and SLO; cost and alternatives; validation plan; clear communication. A strong answer earns 16–20, ties every major component to a requirement, distinguishes guarantees from assumptions, and identifies what evidence could change the design. The score is for practice feedback, not a hiring cutoff.
