# architecture patterns multi-region tenancy and reliability — Reference: Azure Functions

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Functions overview](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview), [Azure Functions hosting options](https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale), [Flex Consumption plan](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan), [HTTP and non-HTTP triggers](https://learn.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings), [Azure Functions retries](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages), [isolated and in-process .NET differences](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-in-process-differences), [Durable Functions overview](https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview), [Azure Functions monitoring](https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring).

## Scope and version

This lesson covers Azure Functions as documented on 2026-11-20. A Function App groups deployed functions and their configuration. Each function has a trigger; optional input/output bindings connect it to other services. Hosting plan, language worker, trigger extension, and runtime version affect scaling, networking, concurrency, timeout, billing, and support. Never apply one plan's limits to all Functions apps.

For serverless hosting, Microsoft currently recommends **Flex Consumption**. It is Linux-only, supports virtual network integration and per-function scaling, and can keep configured always-ready instances. The classic Consumption, Premium, Dedicated/App Service, and Container Apps options remain relevant for different requirements. Flex Consumption does not mean “no servers”; it means the platform operates the compute layer, with plan-specific constraints and cost behavior.

For .NET, distinguish the **isolated worker** from the **in-process** model. Isolated code runs in its own worker process and uses standard .NET hosting and dependency injection. Microsoft ended support for in-process Functions on November 10, 2026; new .NET work should use isolated worker and existing applications should have migrated or be on a controlled migration path. Functions 4.x supports newer .NET versions only in the isolated model; exact support also depends on OS and hosting plan. Check the current support matrix before choosing a target framework.

## How this group fits the mental model

Azure Functions is a managed execution and integration model. A trigger decides when a handler starts; bindings can simplify data movement to and from platform services. A hosting plan determines how workers are allocated and billed. Durable Functions adds persisted workflow state, checkpoints, timers, retries, and recovery for long-running processes. These layers have separate contracts: a trigger does not guarantee exactly-once business effects, a binding does not make a multi-service transaction atomic, and a durable orchestrator is not a substitute for domain-level correctness.

Persist authoritative state in a database or durable workflow store, make side effects idempotent, set bounded retries and poison-message handling, and monitor both the function host and dependencies. Use an HTTP-triggered function for a bounded request/response operation; put slow work behind a queue or durable orchestration and return an operation identifier. A React client should not depend on a long-lived function request for work that can be queued and resumed.

## Supplied names explained

- **Function App** — Deployment and configuration boundary for one or more functions. App settings, identity, networking, hosting plan, runtime, and deployment process are app-level concerns; functions within an app may scale together or independently depending on plan and trigger.
- **Trigger** — The single configured event source that starts a function, such as HTTP, timer, queue, blob, Event Hubs, Service Bus, or Event Grid. Trigger extensions have their own versions and behavior. Verify supported triggers for the selected plan and deployment type.
- **Binding** — Declarative connection between a function and an input or output service. Bindings reduce glue code but do not automatically provide a transaction with the function's database writes or other outputs. Use SDK clients when you need controls or service features the binding does not expose.
- **Flex Consumption** — Recommended serverless plan in current Microsoft guidance. Provides dynamic scale-to-zero, optional always-ready capacity, virtual network integration, configurable instance memory and concurrency, and per-function scale groups. It is Linux-only; scale ceiling, regional memory quota, supported regions, trigger limitations, and billing must be checked. As of the cited plan documentation, deployment slots are not supported and a move to or from this plan requires creating a new app and redeploying.
- **Consumption plan** — Older serverless plan with event-driven scale and execution-based pricing, but fewer networking and configuration choices than Flex Consumption. Existing deployments may remain appropriate; new decisions should compare current plan options and region availability.
- **Premium plan** — Pre-warmed and dedicated capacity options for workloads needing reduced cold starts, longer execution, or networking features. It trades some scale-to-zero economics for reserved capacity; configure autoscale and minimum instances deliberately.
- **Dedicated/App Service plan** — Functions run on App Service compute that the customer allocates and scales. Useful where predictable reserved compute, integration with App Service, or an existing plan is desired; it has different scaling and cost behavior from consumption plans.
- **Isolated .NET worker** — Separate process with standard .NET dependency injection, middleware, and control over the .NET version. It is the supported direction after the in-process support end date. Startup, serialization, bindings, middleware, and Durable Functions APIs differ, so migration needs tests and code changes.
- **In-process .NET worker** — Legacy model where function code executes in the host process. Support ended November 10, 2026; do not present it as a current default. Migration to isolated worker may expose differences in binding packages, HTTP types, configuration, logging, serialization, and Durable APIs.
- **Durable Functions** — Stateful workflow extension built from orchestrator, activity, and entity functions. Runtime checkpoints orchestration progress and can resume after worker restarts. Orchestrator code must be deterministic; perform network calls and side effects in activities. Select the durable storage provider supported by the chosen plan; Flex Consumption currently supports Azure Storage and Durable Task Scheduler.
- **Retry and poison handling** — Trigger and extension-specific behavior after failures. Some triggers retry automatically, some require configuration, and exhausted messages may be moved to a dead-letter location. Inspect each trigger's contract; a retry policy cannot make a non-idempotent side effect safe.
- **Always-ready instances and concurrency** — Flex Consumption can maintain selected instances and set per-instance concurrency controls. Always-ready reduces some cold-start exposure but has baseline cost and does not remove downstream latency. More concurrency can reduce instance count while increasing memory and connection pressure.
- **Managed identity and Key Vault references** — Prefer workload identity for Azure resource access instead of embedded credentials. App settings and Key Vault references have resolution, refresh, permission, and availability considerations; least privilege and rotation still require design.

## Cross-item comparison

| Need | Candidate | Main trade-off |
|---|---|---|
| Event-driven execution with scale-to-zero | Flex Consumption | Convenient dynamic scale and optional always-ready; plan, region, and trigger constraints apply |
| Fewer cold starts and more control over capacity | Flex always-ready or Premium | Lower startup risk at a capacity cost; test actual latency and billing |
| Predictable, continuously allocated compute | Dedicated/App Service plan | More direct capacity control, but the customer owns scaling and idle capacity cost |
| Long-running multi-step process | Durable Functions | Durable checkpoints and orchestration; deterministic orchestrator rules and storage/provider costs apply |
| Custom web process or container behavior | Azure Container Apps or App Service | Broader process model; compare their scaling, networking, and operations to Functions |
| Simple data movement to a supported service | Binding | Less integration code, but fewer controls and no implied cross-resource transaction |

Do not compare only per-invocation compute price. Include cold-start impact, always-ready baseline, storage and network charges, event delivery, monitoring, regional availability, and the engineering cost of managing retries and state. For high-throughput consumers, tune trigger batch size and concurrency against downstream quotas rather than maximizing scale blindly.

## Examples

**Order intake:** an HTTP-triggered function authenticates a caller, validates the order, commits an order and outbox record in one database transaction, then returns `202 Accepted` with a status URL. A queue-triggered function publishes or processes the outbox event idempotently. If the queue redelivers, the consumer checks the event ID before applying the effect. Durable Functions is appropriate only if the workflow needs persisted orchestration such as human approval, timers, compensation, or multi-step recovery.

**Blob processing:** a blob trigger starts thumbnail generation. The handler records the blob version/ETag and output key so a retry does not process an unintended newer object. Configure poison handling and alerting; a dead-lettered event needs an operator path to inspect and replay it.

**.NET migration:** inventory in-process apps and extensions, choose a supported isolated-worker .NET target and plan, migrate packages and startup, update HTTP and Durable APIs, test serialization and bindings, verify identity/network settings, then deploy canary traffic. Since in-process support ended on 2026-11-10, production plans should no longer assume security and bug fixes continue for that model.

## Common mistakes

- Treating triggers, bindings, hosting plans, and the .NET execution model as one interchangeable feature.
- Assuming all plans support identical triggers, networking, operating systems, timeouts, deployment slots, and scale behavior.
- Claiming bindings make multiple writes atomic or that a successful trigger invocation proves exactly-once processing.
- Retrying side effects without idempotency, bounded attempts, poison-message handling, and replay ownership.
- Placing network calls or mutable state in a Durable orchestrator instead of an activity; replay can execute orchestrator code again.
- Treating always-ready instances as a latency guarantee or ignoring their baseline cost.
- Choosing maximum concurrency without testing memory, connection pools, locks, and downstream quotas.
- Continuing to use .NET in-process as if it remained supported after November 10, 2026.
- Putting secrets in source or plain configuration when managed identity and a secret store are available.

## Knowledge checks with answers

1. **What selects a function's execution, and what determines its compute behavior?** A trigger selects execution; the hosting plan and runtime determine allocation, scaling, networking, timeouts, and billing. Bindings are integration helpers, not the trigger or transaction boundary.
2. **Why is an HTTP function often better returning an operation ID for slow work?** It releases the request path quickly, avoids request timeout coupling, and lets a durable queue/workflow own retries and progress.
3. **What makes a Durable Functions orchestrator safe to replay?** Deterministic orchestration logic: external I/O, nondeterministic values, and side effects belong in activities, whose operations need their own idempotency strategy.
4. **What is the present .NET migration direction?** Use the isolated worker. In-process support ended November 10, 2026, and the two models differ in packages, startup, APIs, serialization, middleware, and Durable integration.
5. **Does Flex Consumption guarantee the app scales to its configured maximum?** No. Regional quota, configured limits, trigger scale behavior, concurrency, and platform constraints all matter; load-test and monitor actual scale and throttling.
