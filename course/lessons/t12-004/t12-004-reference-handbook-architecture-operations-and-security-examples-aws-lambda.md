# architecture patterns multi-region tenancy and reliability — Reference: AWS Lambda

Sources: [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), [execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html), [invocation modes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-invocation.html), [error handling](https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html), [asynchronous retries](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html), [event source mappings](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html), [SQS event source configuration](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-configure.html), [concurrency and scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html), [best practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html), [durable functions](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html), [durable SDK](https://docs.aws.amazon.com/lambda/latest/dg/durable-execution-sdk.html), [supported runtimes](https://docs.aws.amazon.com/lambda/latest/dg/durable-supported-runtimes.html), [SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html).

## Scope and version

This lesson explains AWS Lambda’s function, invocation, runtime, concurrency, failure, and durable-execution models based on AWS documentation current on 2026-11-20. Runtime names, quotas, event-source behavior, pricing, and feature support change; check the live service documentation for the Region, runtime, architecture, and trigger you deploy. Standard Lambda execution is bounded by its configured timeout (normally 1–900 seconds); Lambda durable functions can span much longer overall workflows using persisted checkpoints and multiple invocations, not one continuously running process.

AWS documentation now distinguishes Lambda **Event Functions**, **Web Functions**, and **Managed Instances** deployment options. They use different request and concurrency models; a fact about one variant does not necessarily apply to another.

Additional current variant sources: [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html), [Web Function lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html), [Lambda Managed Instances](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html), [Managed Instances execution environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances-execution-environment.html).

## How this group fits the mental model

Lambda runs code in managed execution environments in response to requests or events. It removes server provisioning from the application team but does not remove capacity, state, retries, security, observability, or cost design. Treat an invocation as a potentially repeated unit of work with bounded runtime and external side effects. Persist important state outside the execution environment.

## Supplied names explained

- **Function:** deployed code plus runtime, architecture, handler/entry point, configuration, permissions, and versions.
- **Execution environment:** isolated runtime environment initialized for a function version/configuration, reused opportunistically, and removed by Lambda when no longer needed. `/tmp`, static variables, and connections can survive reuse but are not durable storage and have no guaranteed lifetime.
- **Cold start / initialization:** creation and setup of an execution environment before it serves an invocation. Runtime, package size, initialization code, networking, and extensions affect latency.
- **Synchronous invocation (`RequestResponse`):** caller waits for a result/error. The caller owns retry behavior and can see invocation/function errors; a client timeout can leave outcome unknown if side effects already happened.
- **Asynchronous invocation (`Event`):** Lambda queues the event internally and returns acceptance; Lambda retries function errors by default and can deliver duplicates. Configure maximum event age, retry attempts, dead-letter queue, or on-failure destination as appropriate.
- **Event source mapping (ESM):** Lambda-managed poller reads a source such as SQS, Kinesis, DynamoDB Streams, Kafka, or another supported source and invokes the function with batches. Check per-source ordering, checkpoint, retry, and scaling semantics.
- **Execution role:** IAM role assumed by function code to access AWS services. The function also needs an invocation permission/resource policy for some service principals and cross-account callers; these are separate authorization directions.
- **Lambda Web Function:** a newer deployment option for an HTTP server application. The app listens on a port and receives HTTP requests through a Lambda-managed HTTPS endpoint; current documentation lists Node.js runtime support. Each environment handles multiple concurrent requests, may scale to zero, and supports streaming. Use CloudFront in front when you need custom-domain and AWS WAF capabilities per current docs. Web Functions are for direct HTTP workloads; queue/file-event handlers use Event Functions.
- **Lambda Managed Instances:** a compute option for Lambda Event Functions running in customer-account EC2-backed capacity providers managed by Lambda. It supports different instance choices and multi-concurrent invocations per environment; code must be thread-safe and isolate request state. Capacity-provider functions share a trust boundary, and scaling differs from default Lambda compute. Current docs describe up to 90-minute invocation limits for some async/ESM workloads, with exceptions; verify specific trigger/runtime support.
- **Reserved concurrency:** reserves account concurrency for a function and sets its maximum concurrency, protecting critical capacity or limiting blast radius.
- **Provisioned concurrency:** pre-initializes environments for lower startup latency at additional cost; configure on a published version or alias and size for traffic.
- **SnapStart:** creates a snapshot of initialized environments for supported runtimes/configurations. Snapshot restoration requires care with unique IDs, sockets, credentials, and randomness; verify the supported runtime/architecture and incompatibilities.
- **Lambda durable function:** an opt-in function using the AWS Durable Execution SDK’s checkpoints, replay, steps, waits, callbacks, parallel/map operations, and retries. It supports long-lived workflows while suspending compute between waits. Durable execution is separately configured at function creation and requires durable checkpoint permissions; durable steps are at-least-once by default unless the selected operation/configuration says otherwise, so side effects still need idempotency.
- **DLQ vs destination:** a dead-letter queue captures failed/discarded asynchronous events in a queue. An asynchronous on-failure destination can capture richer invocation record/context. Neither is automatically configured for every invocation type.

## Request and event lifecycle

1. A caller or source invokes a function version/alias. Lambda checks request shape, invocation permissions, and available scaling capacity.
2. Lambda selects or creates an execution environment. Initialization loads runtime/code/configuration and executes initialization work; a cold start adds latency.
3. The handler validates the event, authenticates/authorizes any application-level principal represented in it, performs bounded work, and interacts with dependencies using timeouts.
4. Lambda returns the result for synchronous calls, or manages queue/retry/ack behavior according to async invocation or event-source semantics.
5. The environment may be reused, but its memory/filesystem state can later disappear. Durable application state belongs in databases, queues, object storage, or durable execution checkpoints.

Do not assume “Lambda retries” means the same thing for every trigger. For asynchronous invocation, Lambda’s internal queue retries function errors according to async settings. For SQS, the event source mapping polls and visibility timeout controls when messages reappear; a failed batch can cause successful records to be delivered again unless partial batch failure responses are configured. Stream sources have shard/partition ordering and checkpoint behavior that differs from queues. Always design idempotent handlers.

## Scaling, concurrency, and capacity

Lambda concurrency is in-flight executions, approximately request arrival rate multiplied by average execution duration (Little’s Law), with burst/scaling behavior and account/service quotas also affecting results. Downstream databases may have much lower safe concurrency than Lambda can create. Set reserved concurrency or ESM maximum concurrency to protect dependencies; use queues and controlled batch sizes to absorb bursts.

Provisioned concurrency reduces cold-start impact for configured versions/aliases but costs money and does not mean unlimited scale. Reserved concurrency is a cap/reservation, not a warm pool. Load test realistic cold/warm paths, package/runtime startup, VPC/network access, and downstream limits. Increase memory can also increase available CPU for standard Lambda functions; measure the cost/performance curve.

## Retries, duplicates, and delivery guarantees

Lambda event processing is commonly at-least-once rather than exactly-once. Duplicate delivery can occur after a timeout, lost acknowledgement, service retry, partial batch failure, or asynchronous queue behavior. A function can complete an external side effect and then fail before acknowledging success.

Use a stable idempotency key (business operation/event ID) and persist a processing/result record atomically with the side effect when possible. For payments or email, use provider idempotency keys or an outbox/transactional state machine. Configure retry count/age, visibility timeout, maximum batching window, partial batch responses, redrive/DLQ, and alerting. A DLQ is not a repair strategy until you define ownership and replay safeguards.

For standard SQS ESM, AWS recommends queue visibility timeout at least six times the function timeout, plus batching window when used. Treat it as a source-specific recommendation and verify current docs for your configuration. Tune batch size against payload limits, processing duration, memory, and retry blast radius.

## Example: .NET API and order workflow

A React browser sends an authenticated order request to a .NET API. The API validates and commits an order plus an outbox event in one database transaction. A queue invokes a .NET Lambda worker with the event ID; the worker claims an idempotency record, processes one bounded step, and records completion. If a third-party payment call succeeds but the function times out before writing its result, the retry uses the provider’s idempotency key and reconciles status instead of charging twice.

If the workflow must pause for human approval for several days, use Lambda durable functions or Step Functions rather than keeping a normal invocation alive. Durable functions checkpoint steps and replay, but step side effects and idempotency still require thought. Step Functions may be a better fit for visual orchestration and native integrations across many AWS services. Neither makes multiple business systems one ACID transaction; use compensating actions and reconciliation.

For a Node.js React server-rendered storefront, a Lambda Web Function can run a conventional HTTP server and stream responses. For a .NET API, use a supported .NET Event Function behind API Gateway/another HTTP front door or a container service; the current Web Function runtime list is Node.js only. A CPU/GPU-heavy event workload with predictable demand might be evaluated on Managed Instances, but this trades the default per-environment isolation/concurrency model for EC2-backed capacity-provider management.

## Security and observability

- Use least-privilege execution roles scoped to exact resources; protect `iam:PassRole`, function update, layer, alias, and invoke permissions.
- Keep secrets in a secret manager or secure parameter store; do not embed them in code, environment logs, layers, or React bundles. Restrict who can read configuration because environment values may contain secrets.
- Validate event schemas and caller context; a direct event source may not be an authenticated end user. Do not trust tenant/user identifiers in an event without verifying its producer and integrity.
- Avoid logging full events when they contain personal data, credentials, payment data, or tokens. Use structured logs, correlation IDs, metrics, traces, and redaction.
- Monitor errors, throttles, duration, concurrency, iterator age/queue age, DLQ depth, cold starts, retries, and downstream saturation. Add alarms for business outcomes, not only invocation success.
- Prevent recursive event loops (for example, writing into a bucket that triggers the same function) and set concurrency/cost guardrails.
- Use deployment versions and aliases for controlled rollout and rollback. Test permission and configuration changes alongside code.

## Cross-item comparison

- **Lambda vs containers/long-running services:** Lambda suits event-triggered or request workloads with variable demand and bounded execution; containers/VMs give more control over process lifetime, runtime, networking, and sustained workloads.
- **Lambda function vs Step Functions:** a function performs bounded code work; Step Functions orchestrates a workflow across states/services. Lambda durable functions add checkpoint/replay within Lambda code for long-running executions; choose based on ownership and workflow visibility.
- **Event Function vs Web Function:** an Event Function processes an invocation/event contract; a Web Function hosts an HTTP server and directly handles requests. Web Functions are currently Node.js-only per AWS docs.
- **Default compute vs Managed Instances:** default Lambda compute uses a single-concurrency environment model; Managed Instances run on account capacity providers and can multiplex concurrent invocations, increasing utilization but requiring thread safety and capacity-provider trust isolation.
- **Async invocation vs ESM:** async invocation places accepted events in Lambda’s managed queue; ESM polls an external source and has source-specific batch/ack semantics.
- **Reserved vs provisioned concurrency:** reserved concurrency limits/reserves capacity; provisioned concurrency pre-initializes environments and incurs additional charges.
- **Lambda vs .NET API service:** moving a handler to Lambda does not change domain ownership, authz, idempotency, or data consistency requirements.

## Common mistakes

- Storing durable application state in globals or `/tmp` and assuming environments persist.
- Assuming every trigger retries the same way or that events are delivered exactly once.
- Using Lambda’s maximum concurrency without checking database connection and downstream capacity.
- Treating a DLQ as automatic recovery or replaying poison messages without deduplication.
- Confusing reserved concurrency with provisioned/warm concurrency.
- Keeping one standard invocation open for a multi-day workflow instead of durable orchestration.
- Assuming durable checkpoints make arbitrary external side effects exactly once.
- Trusting event payload identity/tenant fields without authenticating the producer or validating the message.
- Setting timeouts equal to average duration, leaving no margin for tail latency.
- Forgetting async invocation permissions/resource policies when another AWS service must invoke the function.

## Knowledge checks with answers

1. **Can a Lambda execution environment be used as durable storage?** No. Reuse may preserve local state temporarily, but Lambda can recycle it at any time.
2. **Does asynchronous invocation mean the function completed?** No. It means Lambda accepted the event; later execution may fail, retry, age out, or reach a failure destination.
3. **Why is idempotency needed if Lambda retries?** A previous attempt may have performed a side effect before its acknowledgement was lost.
4. **What does reserved concurrency do?** It sets a function’s concurrency reservation/cap and can protect critical capacity or limit downstream load; it does not prewarm environments.
5. **What is the purpose of provisioned concurrency?** Pre-initialize a configured number of environments to reduce initialization latency, with additional cost.
6. **When is durable execution useful?** Long-running workflows with checkpointed steps, waits, and recovery; not as a reason to ignore idempotency or external transaction boundaries.
7. **Why must SQS visibility timeout account for Lambda timeout and retries?** Messages may become visible again while a prior batch is still processing, creating concurrent duplicate work.

## Examples

An SQS batch contains ten messages; nine succeed and one fails. Without partial batch responses, the whole batch may reappear and the nine successful business effects can be repeated. Configure partial failures and idempotency, then send repeatedly failing messages to a DLQ with an operator-owned replay process.

## Practice exercise

Design a Lambda-backed image-processing pipeline. Specify sync/async invocation, S3 event filtering, idempotency, batch/visibility/retry settings, concurrency limits, image-size bounds, IAM role, DLQ/replay, metrics, and behavior if object storage or the database is unavailable. Decide whether a multi-step approval variant needs durable functions or Step Functions.
