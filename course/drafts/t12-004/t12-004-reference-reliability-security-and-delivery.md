# architecture patterns multi-region tenancy and reliability — Reference: Operational controls and secure system behavior

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), [Google SRE: Error Budgets](https://sre.google/sre-book/embracing-risk/), [Brendan Gregg: USE Method](https://www.brendangregg.com/usemethod.html), [Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/), [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/), [Azure circuit breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), [Azure bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead), [NIST Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final), [NIST SBOM definition](https://csrc.nist.gov/glossary/term/software_bill_of_materials), [Azure safe deployment strategies](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments), [Prisma expand-and-contract migration guide](https://www.prisma.io/docs/guides/database/data-migration).

## Scope and version

This lesson connects the twelve supplied operational and security concepts. SLI/SLO practices and architectural patterns are principles rather than provider guarantees. Exact telemetry, sampling, deployment, and policy features vary by implementation. Treat thresholds and examples as starting points to measure against a named workload.

## How this group fits the mental model

Reliability should be described as a user-visible measurement, investigated with signals, protected against dependency failure, and improved through controlled releases. Security applies at each request and software boundary. These are connected through feedback: define the promise; observe behavior; limit blast radius; change safely; verify that the change improves the promise.

## Supplied names explained

- **Service level indicator (SLI)** — A quantitative measure of a user-relevant service property at a defined boundary. Examples include the fraction of eligible requests that succeed, latency distribution for a route, or freshness of a processed event. Define numerator, denominator, exclusions, and measurement source; “uptime” without a user journey can hide important failures.
- **Service level objective (SLO)** — A target or acceptable range for an SLI over a stated time window, such as 99.9% of eligible API requests succeeding in a rolling 28-day period. The target is a product and engineering choice, not the same thing as a provider SLA. Use a metric the team can influence and users care about.
- **Error budget** — The allowed bad portion implied by an SLO over its measurement window. For a request-based 99.9% success target with 100,000 eligible requests, the illustrative budget is 100 unsuccessful requests in that window. It is not extra server capacity, and an error-budget policy should say how launch risk, reliability work, and feature delivery change when the budget is consumed.
- **RED method** — A service-oriented troubleshooting view: request **Rate**, **Errors**, and **Duration**. Define what counts as a request and error; latency percentiles usually reveal tail behavior better than a mean alone. RED helps answer whether a service is receiving load, failing, or slowing.
- **USE method** — A resource-oriented investigation: for each resource, examine **Utilization**, **Saturation**, and **Errors**. Utilization describes how busy or occupied a resource is under a stated definition; saturation captures queued work or inability to serve demand; errors count failed operations. It is a bottleneck-finding checklist, not a complete user-experience or application-correctness model.
- **Distributed trace** — A causally connected record of spans for work crossing components. Context propagation links spans across processes; sampling, asynchronous work, missing instrumentation, and privacy constraints affect what can be seen. A trace shows one path, while metrics summarize many paths.
- **Circuit breaker** — A caller-side state machine that can stop sending requests to a dependency after a configured failure condition, allow a limited probe after a cool-down, and reopen if the probe succeeds or fails. It protects callers and limits repeated waiting; it does not repair the dependency. Timeouts, retry policy, fallback semantics, and breaker scope must be coordinated.
- **Bulkhead** — Separate capacity pools, concurrency limits, or cells so one slow dependency or workload cannot consume every thread, connection, or worker. Isolation reduces blast radius but can strand capacity, so pool sizing and degradation behavior must be measured.
- **Zero-trust architecture** — A resource-centered security approach that grants no implicit trust solely because a user, device, or workload is on a particular network or is organization-owned. Authenticate and authorize explicitly for the resource and session context. Zero trust is an architecture direction, not one product or an instruction to repeatedly prompt users.
- **Software bill of materials (SBOM)** — A formal record of software components and their supply-chain relationships in a product. It helps identify whether known vulnerable components are present, but only if it is accurate, tied to the shipped artifact, current enough, and accompanied by a remediation process. An SBOM alone does not prove software is secure.
- **Canary deployment** — A progressive release that exposes a new version to a small, controlled cohort or traffic share, evaluates health, then increases exposure. Define automated stop/rollback conditions and compare representative metrics. Canarying cannot detect every rare or tenant-specific defect, and it does not make incompatible database changes safe.
- **Expand-and-contract migration** — A compatibility sequence for changing shared schemas while old and new code may run concurrently: expand with additive structures, deploy code that can work with both, backfill and verify, switch reads/writes, then contract by removing old structures only after no active version depends on them. It reduces coordinated downtime risk, but may require dual-write/backfill care and a longer coexistence period.

## Cross-item comparison

| Question | Useful mechanism | Boundary to remember |
|---|---|---|
| Is the user experience meeting its promise? | SLI compared with an SLO | A dashboard metric is not automatically a good SLI |
| Is risk acceptable for another release? | Error budget and agreed policy | Budget is tied to the SLO window and eligible events |
| Is the service slow or failing? | RED and distributed traces | RED summarizes the service; traces explain sampled paths |
| Which resource is the bottleneck? | USE | Requires a resource inventory and accurate saturation signals |
| Is a dependency causing cascading waits? | Timeout, bounded retries, circuit breaker, bulkhead | Each mechanism needs coordinated thresholds and fallback behavior |
| Is the workload permitted to access this resource? | Zero-trust identity and authorization checks | Network location alone is not sufficient evidence of trust |
| Which components are in a shipped build? | Artifact-linked SBOM | Inventory supports response but does not establish exploitability or remediation |
| Can a risky release be limited? | Canary/progressive exposure | Watch representative user and business outcomes, not only process health |
| Can schema evolution coexist with rolling releases? | Expand-and-contract | Old and new application versions must remain compatible throughout each phase |

## Examples

**Checkout dependency outage:** define a successful checkout SLI at the public API boundary, excluding only documented client-invalid requests. A circuit breaker opens after the agreed dependency failure pattern; a bulkhead reserves enough capacity for order-status reads. The fallback preserves a pending order state rather than claiming payment succeeded. RED shows increased duration and errors; traces identify the payment provider span. The team checks the SLO error budget before resuming a rollout and alerts on user-impacting symptoms.

**Safe column replacement:** add a new nullable `status` column while `published` remains. Deploy code that writes both and reads the new value with a fallback. Backfill existing rows in bounded batches, compare counts and invariants, then switch all readers. After old instances, jobs, and rollback artifacts no longer use `published`, remove it in a separate release. If any stage fails, the compatibility plan identifies the safe rollback point.

**Supply-chain incident:** when a new advisory appears, query SBOMs generated from the exact deployed artifacts to identify affected services. Confirm component versions and build provenance, assess actual exposure, prioritize patches or mitigations, deploy gradually, and verify the resulting artifact. The inventory speeds discovery but cannot replace vulnerability analysis or incident response.

## Common mistakes

- Choosing an SLO target before defining which requests count and how users experience success.
- Treating an SLO, an SLA, availability, and latency as synonyms.
- Using average latency alone while tail latency violates user-facing deadlines.
- Assuming circuit breakers, bulkheads, and retries are interchangeable or that retries are always safe.
- Treating traces as complete logs or recording secrets, tokens, or high-risk personal data as span attributes.
- Using RED for every infrastructure bottleneck, or USE as a substitute for request-level outcomes.
- Treating zero trust as “put everything behind a proxy”; identities, authorization, device/workload posture, and resource policy remain essential.
- Generating an SBOM once but not tying it to artifacts, tracking new advisories, or assigning remediation ownership.
- Canarying only by percentage while ignoring cohort skew, tenant impact, low-volume paths, or shared-schema compatibility.
- Contracting a schema before old binaries, scheduled jobs, consumers, and rollback images have stopped using it.

## Knowledge checks with answers

1. **What makes an SLI useful?** It measures an outcome users care about at a stated boundary, with a documented good-event definition and reliable data source.
2. **What does a circuit breaker do when a dependency fails?** It temporarily stops or limits calls according to a policy and may probe recovery; it contains repeated failures but does not fix the downstream service.
3. **When should you use RED versus USE?** RED for request/service behavior; USE to investigate utilization, queued/saturated work, and errors for each relevant resource. Use both when the problem spans layers.
4. **Does a canary guarantee a safe deployment?** No. It limits exposure while measurements are evaluated; insufficient traffic, cohort differences, delayed effects, or shared state can still hide defects.
5. **Why does expand-and-contract use multiple releases?** Old and new application versions can overlap during rolling deployment or rollback. Each intermediate schema/code state must remain compatible until old readers and writers are gone.
6. **What does an SBOM prove?** It records component inventory and relationships for a particular product/artifact; it does not prove the artifact is vulnerability-free or that a listed vulnerability is exploitable.
