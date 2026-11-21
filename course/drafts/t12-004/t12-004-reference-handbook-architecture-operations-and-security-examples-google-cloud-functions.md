# architecture patterns multi-region tenancy and reliability — Reference: Google Cloud Functions

Sources: [HLD Handbook](https://hld.handbook.academy/), [Cloud Run functions comparison](https://docs.cloud.google.com/run/docs/functions/comparison), [Cloud Run functions overview](https://docs.cloud.google.com/run/docs/functions/overview), [Cloud Run function triggers](https://docs.cloud.google.com/run/docs/function-triggers), [Cloud Run functions best practices](https://docs.cloud.google.com/run/docs/tips/functions-best-practices), [Cloud Run concurrency](https://docs.cloud.google.com/run/docs/about-concurrency), [Cloud Run retries](https://docs.cloud.google.com/run/docs/configuring/retries), [Cloud Run functions pricing](https://cloud.google.com/functions/pricing-1stgen), [Eventarc overview](https://cloud.google.com/eventarc/docs/overview).

## Scope and version

This lesson covers Google Cloud's function programming model as documented on 2026-11-20. The current product family is **Cloud Run functions**. The latest generation is deployed as a Cloud Run service; older material calls it Cloud Functions (2nd gen). **Cloud Run functions (1st gen)** is the earlier product with a distinct resource model and narrower capabilities. These names are consequential: APIs, deployment commands, triggers, retries, concurrency, and billing differ. Do not infer exact quotas from this lesson; limits vary by region, runtime, API path, and configuration.

The latest functions can be created through the recommended Cloud Run Admin API or the Cloud Functions v2 API. A v2 API function remains addressable through that API and can also be managed through Cloud Run. A function created directly through the Cloud Run Admin API is managed there. Select and document one control plane as the source of truth; avoid competing deployments from two tools.

## How this group fits the mental model

A function is a deployment and scaling unit for a handler, not a guarantee of exactly-once business effects. An HTTP request or event invokes code inside a managed runtime. Google builds source into a container image, stores it in Artifact Registry, and runs it as a Cloud Run service for the latest generation. Eventarc routes supported events; Pub/Sub can provide buffering and delivery semantics for asynchronous workflows.

This model removes server provisioning while leaving application responsibilities intact: validate input, authenticate callers, bound work, persist durable state outside an ephemeral instance, handle duplicates, expose health and telemetry, and plan for retries and poison events. A function instance may be reused, but process memory is not durable state. A cold start may occur. A successful transport delivery does not imply that a downstream side effect happened exactly once.

Choose an HTTP function for a request/response endpoint or a CloudEvents function for event-driven work. For long-running, stateful workflows, use a durable workflow or queue-backed orchestration rather than stretching a request handler to its timeout. When a conventional container service needs custom startup, routing, or a long-running process, compare Cloud Run services; when work is finite and scheduled or batch-oriented, compare Cloud Run jobs.

## Supplied names explained

- **Cloud Run functions (latest generation)** — Source-deployed function code packaged as a container and run as a Cloud Run service. It supports HTTP and CloudEvents functions, Eventarc event sources, traffic splitting, and Cloud Run configuration. A Cloud Run service can process concurrent requests per instance; the documented maximum is up to 1,000, but the effective setting and safe value depend on runtime and workload.
- **Cloud Functions v2 API** — An API/control-plane path for deploying the latest generation. It can specify triggers at deployment and retains v2 API management in addition to Cloud Run management. It is not a separate execution generation from the latest Cloud Run functions.
- **Cloud Run Admin API** — Recommended current creation and management path. A directly created function is managed with Cloud Run tools; the API choice affects deployment workflow and resource ownership, not the handler's business semantics.
- **Cloud Run functions (1st gen)** — Original generation, formerly Cloud Functions (1st gen). It has one request at a time per instance, a smaller set of direct event sources and runtimes, no traffic splitting, and a nine-minute maximum request timeout in the comparison table. Treat migrations as behavior changes to test, not only a rename.
- **HTTP function** — A handler invoked through HTTP. It needs explicit authentication, request validation, response and timeout design, and protection against duplicate client requests. Public URL reachability is not the same as authorization.
- **CloudEvents function** — A handler receiving an event in CloudEvents form. The event envelope identifies the event type and source; application code still validates the payload and its schema. Event delivery can be repeated, so effects should be idempotent or deduplicated.
- **Eventarc** — Event routing for supported Google Cloud event sources and custom events. The latest generation can use event types supported by Eventarc. Configure retry policy and dead-letter handling at the event delivery layer where supported; do not assume handler code alone controls all redelivery behavior.
- **Concurrency** — Number of requests an instance can handle at once. Latest-generation Cloud Run functions inherit Cloud Run concurrency controls. Raising concurrency can reduce instance count but increases simultaneous memory, connection, and shared-state pressure; code must be safe under parallel requests. First generation processes one request per instance.
- **Retry policy and dead-letter handling** — Delivery behavior after a failed event invocation. Retries improve eventual processing only when transient failures are distinguishable and effects are safe to repeat. A dead-letter topic or equivalent quarantine prevents endless poison-event loops, but requires alerting, inspection, and replay procedures.
- **Cloud Build and Artifact Registry** — Source deployment builds an image and stores it in Artifact Registry before Cloud Run executes it. Build identity, artifact retention, provenance, dependency pinning, and deployment permissions are part of the production supply chain.
- **Traffic splitting** — Latest-generation Cloud Run functions can use Cloud Run traffic management for gradual rollout and rollback. Validate that the event trigger, state schema, and side effects remain compatible across simultaneously active revisions.

## Cross-item comparison

| Decision | Latest Cloud Run functions | 1st gen | Cloud Run service or job |
|---|---|---|---|
| Event routing | Eventarc-supported events; HTTP | Narrower direct event sources; legacy background event model | Service can receive HTTP; job is run-to-completion, with event integration supplied separately |
| Instance concurrency | Configurable Cloud Run behavior, up to documented maximum | One request per instance | Cloud Run service concurrency is configurable; job task parallelism is a separate control |
| Deployment surface | Cloud Run Admin API recommended, or Cloud Functions v2 API | Cloud Functions API | Cloud Run service/job APIs |
| Main fit | Small event or request handler with managed build and function conventions | Existing legacy deployment pending tested migration | Custom container/runtime, a broader web process, or finite batch execution |

Cloud Run functions are convenient for a handler but are not inherently cheaper, more reliable, or more secure than a service. Compare cold-start tolerance, steady-state traffic, per-request resource usage, concurrency safety, event volume, operational visibility, and team familiarity. For a queue consumer, compare Pub/Sub push/pull, Cloud Run worker pools, and other durable workers when sustained processing or explicit backpressure matters.

## Examples

**Image processing:** an object-finalized event arrives through Eventarc. The function reads the object version, writes a derived object under a deterministic key, and records completion with an idempotency key. If a retry occurs after the write but before acknowledgement, the repeat detects the existing result instead of creating duplicate billing or notifications. A malformed image is sent to a dead-letter path and raises an alert.

**HTTP endpoint:** a React client submits an upload-completion request. The function authenticates the identity, checks ownership and request limits, persists a job record, and returns a job identifier. A separate asynchronous worker performs long processing; the browser polls or subscribes for status. The function does not hold an HTTP request open for work whose duration can exceed its timeout.

**Safe rollout:** deploy a new revision with traffic splitting for a synchronous endpoint, observe errors and latency, then shift traffic gradually. For event-driven workloads, first verify trigger routing and retry/dead-letter settings and ensure both old and new revisions can safely process the same event and data shape.

## Common mistakes

- Using “Cloud Functions,” “Cloud Functions 2nd gen,” and “Cloud Run functions” as if their APIs and runtime behavior were identical.
- Assuming latest-generation functions are always single-request-at-a-time or assuming concurrency is safe just because the platform permits it.
- Treating event delivery or an HTTP response as exactly-once completion of a business transaction.
- Enabling retries without idempotency, bounded attempts, poison-event handling, and operational replay procedures.
- Keeping durable workflow state, locks, or coordination only in process memory.
- Assuming a function is private because it is event-triggered, or public because it has a URL; configure IAM and ingress intentionally.
- Deploying source without reviewing build identity, dependency provenance, artifact access, and least-privilege runtime identity.
- Migrating 1st gen to the latest generation without testing timeouts, concurrency, event format, retries, environment variables, IAM, and billing.
- Treating traffic splitting as safe when two revisions can write incompatible database or event schemas.

## Knowledge checks with answers

1. **What is the current relationship between Cloud Run functions and Cloud Functions 2nd gen?** Cloud Run functions is the latest product name and service-based resource model; Cloud Functions (2nd gen) is the former name. The Cloud Functions v2 API remains one deployment/control-plane path for the latest generation.
2. **If an event handler writes a result and crashes before acknowledgement, what should happen on retry?** The handler should detect the prior effect through an idempotency key, conditional write, or deduplication record, then safely complete acknowledgement.
3. **Why can increasing concurrency reduce cost but create risk?** More simultaneous requests can use fewer instances, but can overload memory, connection pools, downstream quotas, or mutable shared state. Load-test the whole dependency path and bound concurrency.
4. **When is a Cloud Run job a better fit?** When work should run to completion as a finite task, often in parallel or on a schedule, rather than serving each invocation as a request handler.
5. **What must be verified before a 1st-gen migration?** Trigger/event compatibility, retry and dead-letter behavior, request timeout, concurrency assumptions, identities and permissions, build/deployment API, environment configuration, and state compatibility.
