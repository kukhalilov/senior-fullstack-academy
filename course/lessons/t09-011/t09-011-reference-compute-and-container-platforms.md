# AWS architecture identity networking compute and data services — Reference: EC2, autoscaling, load balancing, containers, and functions

Sources: [Amazon EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Instances.html), [EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/), [Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html), [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html), [Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html), [Lambda Managed Instances](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html), and [Lambda timeout configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html).

## Scope and version

This reference covers every one of the 63 supplied compute and execution terms, from EC2 through containers, functions, batch, workflows and configuration. Instance families, runtime versions, Region support, quotas and service pricing change; select them from the current service pages and measure a representative workload. The most recent major Lambda shift is the separate Web Functions HTTP-server model alongside the renamed Event Functions; this distinction is cited below.

## How this group fits the mental model

Compute differs along four axes: how much host/runtime infrastructure you operate, how work is invoked, how capacity scales, and what failure/retry contract the platform supplies. Compare those contracts against latency, duration, concurrency, state, network access and operations ownership. Container packaging alone does not select a scheduler, and serverless does not mean unlimited or responsibility-free.

## Supplied names explained

### Virtual machines and capacity

- `Amazon Elastic Compute Cloud (Amazon EC2)` — AWS service for resizable virtual compute instances and related networking/storage attachments. The customer selects images/types and owns guest OS patching, hardening, process supervision and much of capacity planning.
- `EC2 instance` — A running virtual server with an instance type, AMI, network interfaces, storage and IAM profile. Instance state and health checks do not establish that the application is ready to serve useful traffic.
- `Amazon Machine Image (AMI)` — Template containing OS and software configuration used to launch instances. Build, scan, patch, version and retire images as immutable artifacts; do not assume an old AMI is secure because it still launches.
- `EC2 instance type` — Compute capacity selection describing processor, memory, networking and other capabilities. Choose with measured CPU/memory/network/disk demands and verify architecture compatibility for native code and AMIs.
- `EC2 instance family` — Group of types optimized for general purpose, compute, memory, storage, accelerated computing or other patterns. Family labels are a shortlist, not a substitute for load testing, price/performance and regional availability checks.
- `EC2 launch template` — Versioned specification for launching EC2 instances, including AMI, type, network, storage, IAM profile and user data. Auto Scaling groups and other services can consume a selected version; use controlled versions and avoid mutable `$Latest` behavior where reproducibility matters.
- `EC2 user data` — Bootstrap data/script supplied at launch. It may run with elevated privileges and has size/logging/secrecy concerns; use it for bounded bootstrap, not as a permanent configuration-management or secret-delivery mechanism.
- `EC2 instance store` — Ephemeral block storage physically associated with the host. Data can be lost when an instance stops, terminates or underlying hardware fails; use for caches/scratch, not the only copy of durable business data.
- `EC2 placement group` — Placement strategy controlling how instances are placed for latency, throughput or failure isolation. Cluster, partition and spread strategies have different limits and availability tradeoffs; placement does not replace app-level redundancy.
- `EC2 Auto Scaling group` — Controller maintaining desired EC2 capacity across subnets/AZs from a launch template and health/scaling behavior. It launches/replaces instances, not application correctness; lifecycle hooks and graceful draining matter during updates and termination.
- `EC2 launch configuration` — Legacy launch specification for Auto Scaling groups. It is not as flexible as launch templates and should generally be treated as a migration/compatibility term, not the default for new architectures.
- `EC2 scaling policy` — Rule or target that changes Auto Scaling group capacity in response to metrics or schedules. Scaling is delayed by metric windows, instance startup and warmup; ensure minimum/maximum capacity and downstream services can absorb it.
- `Target tracking scaling policy` — Feedback controller aiming for a metric target such as average CPU utilization or requests per target. It adjusts capacity automatically but needs an informative metric, realistic target and warmup configuration; it cannot scale on a signal it does not receive.
- `Step scaling policy` — Adds/removes capacity based on alarm thresholds and adjustment steps. It is useful for explicit reaction bands, but alarm evaluation and instance startup create response delay; avoid overlapping rules with conflicting outcomes.
- `Scheduled scaling` — Changes desired/minimum/maximum capacity at known times. It prepares for predictable demand but does not react to unexpected surges by itself.
- `Instance refresh` — Auto Scaling operation that replaces instances in an orderly rollout using launch-template changes, health requirements and warmup. Set minimum healthy capacity and checkpoints deliberately; a refresh does not guarantee new application code is healthy unless checks detect it.
- `EC2 Spot Instance` — Spare EC2 capacity offered at a discount and subject to interruption. Use interruption-aware, replaceable workloads, diversified instance pools and graceful checkpoint/drain behavior; do not put irreplaceable local state on Spot.
- `EC2 Reserved Instance` — Billing discount commitment associated with eligible EC2 usage and scope/flexibility rules; it is not a reserved physical instance or a scheduler. Compare utilization and exchange/market terms before commitment.
- `Savings Plans` — Hourly spend commitment discounting eligible compute usage according to plan type and scope. The commitment is billed even when unused; forecast durable baseline, understand coverage priority and keep burst/variable demand flexible.

### Containers and managed application platforms

- `Amazon Elastic Container Registry (Amazon ECR)` — Managed registry for container images and artifacts. Restrict repository access, scan images, use immutable deployment references/digests where appropriate and replicate only when a deployment topology needs it.
- `ECR repository` — Namespace/resource for storing ECR images with repository policies, encryption and lifecycle settings. Tags can move unless immutability is configured; production rollout should identify the exact image content.
- `ECR image scanning` — Vulnerability scanning of container images using supported Basic or Enhanced scanning capabilities. Findings depend on package ecosystem, scanner coverage and scan freshness; prioritize reachable/exploitable risks and rebuild patched images.
- `Amazon Elastic Container Service (Amazon ECS)` — AWS-native container orchestrator managing task placement, services, networking and integrations. It avoids Kubernetes API/operations when ECS fits; teams still design deployments, health, scaling, IAM and cluster/capacity strategy.
- `ECS cluster` — Logical grouping of ECS capacity and services. Depending on launch type/capacity provider, it may represent EC2 capacity or serverless capacity organization; it is not itself a Kubernetes cluster.
- `ECS service` — Long-running desired-state controller maintaining tasks and coordinating deployments, service discovery and load-balancer registration. Configure health checks, deployment circuit-breaker/rollback options and task capacity; desired count alone does not prove readiness.
- `ECS task definition` — Versioned blueprint for containers, CPU/memory, ports, roles, storage, logging and runtime settings. Separate the task execution role (pull/log startup) from the task role (application API calls) and avoid secrets in plaintext environment values.
- `ECS task` — Running instance of a task definition, either standalone or maintained by a service. Task replacement, exit codes, stopped reasons and logs help diagnosis; ephemeral task storage should not be assumed durable.
- `ECS capacity provider` — ECS integration describing how tasks use and scale EC2 Auto Scaling or Fargate capacity. Weight/base and managed scaling affect placement and cost; capacity-provider strategy is distinct from application autoscaling.
- `AWS Fargate` — Serverless compute capacity for supported ECS/EKS tasks without customer-managed worker instances. Customers still define task/pod resources, network, IAM, image, scheduling and scale; capabilities, ephemeral storage and cost differ from EC2 launch types.
- `Amazon Elastic Kubernetes Service (Amazon EKS)` — Managed Kubernetes service controlling the Kubernetes control plane and integrating with AWS. Customers remain responsible for workload design, node capacity, cluster add-ons/upgrades, policies, network paths, observability and many operational decisions.
- `EKS cluster` — Managed Kubernetes control plane with configured networking, identity and data-plane compute. Cluster creation is not application deployment; configure access, supported version lifecycle, add-ons, capacity and upgrade strategy.
- `EKS managed node group` — EKS-managed EC2 worker group with lifecycle integration for provisioning and updates. It reduces node-group operations but not node OS/application compatibility, pod scheduling, disruption or capacity planning.
- `EKS Fargate profile` — Rules selecting which eligible pods run on Fargate and the execution role/subnets they use. It is not a per-pod arbitrary instance-size selector; supported workload, networking, daemonset and storage constraints must be checked.
- `EKS access entry` — EKS API resource mapping an IAM principal into cluster authentication/authorization configuration. It is the modern EKS access-management surface for supported cluster setups; Kubernetes RBAC permissions still need intentional assignment.
- `EKS add-on` — EKS-managed or integrated Kubernetes component lifecycle, such as networking, DNS, storage or observability software. Check cluster-version compatibility and conflict management; an add-on does not remove the need to understand its configuration.
- `Amazon Elastic Beanstalk` — Application platform provisioning AWS infrastructure around supported application stacks and deployment packages. It can simplify environment lifecycle, but the underlying instances, scaling, health, networking and release configuration remain important.
- `Elastic Beanstalk environment` — Collection of AWS resources running an application version in a selected environment tier. Environment health is based on configured signals; manage platform updates, deployment policy, secrets and data resources separately.
- `AWS App Runner` — Managed service for deploying web applications and APIs from source or container images with service-level scaling and ingress. It reduces infrastructure setup but has platform, network, scaling and customization constraints; verify current region/runtime support.

### Lambda and workflow execution

- `AWS Lambda` — Service family for managed functions and newer execution models. Current terminology distinguishes Lambda Event Functions from Lambda Web Functions; do not assume every execution model has the same runtime, concurrency, endpoint or timeout contract.
- `Lambda Event Function` — Established Lambda model invoked through synchronous/asynchronous requests or event-source mappings. Retry and acknowledgment behavior depend on invocation type/source; the October 2026 name change did not require code changes for existing functions. [Launch announcement](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/)
- `Lambda function` — Deployable logical Lambda unit with code, runtime/execution configuration, permissions and versions/aliases depending on model. In current AWS docs, legacy references to “Lambda function” often refer to Event Functions; check context when distinguishing from Web Functions.
- `Lambda execution role` — IAM role assumed by the Lambda service to give function code access to AWS APIs. Grant only required actions/resources, scope trust to Lambda service and separate this from the caller’s permission to invoke the function.
- `Lambda execution environment` — Managed environment that initializes runtime/extensions and processes invocation(s). Reuse can improve performance but creates state/concurrency considerations; never rely on reuse for correctness or persist sensitive request data across invocations.
- `Lambda handler` — Entry-point function invoked by the Lambda runtime with an event and context (for Event Functions). It should validate input, manage dependency timeouts, produce the expected response, and avoid assuming a particular event shape without validation.
- `Lambda layer` — Archive containing code or dependencies added to supported Lambda runtimes. Layers can share libraries but create version/compatibility and supply-chain concerns; container images are another packaging model, not automatically better.
- `Lambda extension` — Companion process/integration that participates in function environment lifecycle, often for telemetry or configuration. Extensions consume resources and can affect initialization/latency; ensure third-party extensions are trusted and compatible.
- `Lambda event source mapping` — Polling/integration configuration that reads from a supported stream or queue and invokes a function in batches. Batch size, concurrency, retry, bisect, partial failure and source visibility/retention settings jointly determine processing and duplicates.
- `Lambda destination` — Asynchronous-invocation success/failure destination capturing invocation result context to a supported target. A destination differs from a dead-letter queue’s event-payload focus; choose based on needed diagnostics and downstream processing.
- `Lambda provisioned concurrency` — Pre-initialized execution environments assigned to a function version or alias to reduce initialization latency. It incurs cost and must scale to traffic; it is not reserved invocation capacity or a guarantee of zero latency.
- `Lambda reserved concurrency` — Function-level concurrency ceiling and reservation from the account concurrency pool. Setting it to zero can stop invocations; too-low limits throttle, and concurrency is not the same as provisioned warm capacity.
- `Lambda SnapStart` — Startup optimization that snapshots initialized state for supported runtimes/configurations and restores environments from that snapshot. Initialization code must be snapshot-safe; uniqueness, connections, entropy and cached credentials may need post-restore handling.
- `Lambda function URL` — Built-in HTTPS endpoint for invoking a Lambda Event Function directly, with configurable auth type and resource policy. It remains an Event Function invocation endpoint, not a Lambda Web Function server/revision endpoint; authentication and origin controls must be designed. [Function URL guide](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html)
- `Lambda container image` — OCI image packaging option for Event Functions, stored in ECR and subject to Lambda image/runtime requirements. Updating an ECR tag alone does not necessarily update a deployed function; deploy a new image digest/configuration and understand scanning/base-image patch duties.
- `Lambda Web Function` — Direct HTTP server model in which Node.js application code listens on a port and handles requests using ordinary web frameworks. At launch it supports Node.js, scale-to-zero and multiple concurrent requests per environment; check current limitations and region support. [AWS guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html)
- `Lambda Web Function revision` — Immutable snapshot of Web Function code and configuration. Deploying a new revision permits controlled routing/rollback, but traffic changes must be associated with the correct endpoint and verified with metrics.
- `Lambda Web Function endpoint` — HTTPS request entry that routes traffic to one or two Web Function revisions according to endpoint configuration. Endpoint access control, deployment routing, custom domains/CloudFront and regional behavior differ from a Lambda function URL.
- `Lambda Managed Instances` — Lambda Event Function execution model on AWS-managed EC2 instances in the customer account, with selected instance types and Lambda-managed fleet operations. It supports sustained/concurrent worker capacity but has distinct pricing, execution behavior and availability. On-demand Event Functions and synchronous Managed Instances invocations can run up to 30 minutes. Eligible asynchronous and event-source mapping invocations on Managed Instances can run up to 90 minutes; Amazon MQ and DocumentDB mappings remain at 15 minutes. Initialization remains limited to 10 seconds on-demand and 15 minutes on Managed Instances. The function code must tolerate concurrent invocations in one environment.
- `Lambda durable function` — Lambda workflow model that persists execution progress and can wait, retry and resume without continuously consuming compute while waiting. It is for multi-step durable executions, not an exactly-once transaction or unrestricted state store; side effects need idempotency and payload/storage quotas matter.
- `Lambda durable operation` — Persisted step/checkpoint within a durable execution, such as a step or wait. In October 2026 AWS increased the limit to 30,000 operations per execution and payload to 1 MB; these are quotas, and every persisted step/retry affects design and cost. [Quota announcement](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-durable-gen-limit-increase/)

### Batch, workflows and configuration

- `AWS Batch` — Managed batch scheduler for submitting jobs to compute environments and queues. It provisions suitable capacity from configured resources, but job dependencies, retries, container runtime, timeouts and data staging remain workload concerns.
- `AWS Step Functions` — Managed state-machine orchestration coordinating tasks, choices, waits, parallel branches, retries and service integrations. It externalizes workflow state and transitions; choose Standard/Express execution semantics and understand duration, history, payload and delivery constraints.
- `AWS AppConfig` — Managed configuration deployment and validation service with staged rollout/monitoring integrations. It can reduce risky configuration releases but callers need caching/refresh behavior and safe fallback for invalid or unavailable configuration.
- `AWS Systems Manager Run Command` — Systems Manager capability to run commands remotely on managed nodes without direct inbound SSH/RDP. Restrict documents, targets, roles and output access; command execution is privileged and should be audited.

## Cross-item comparison

| Option | Compute control | Typical fit | Critical design responsibility |
|---|---|---|---|
| EC2 | Highest OS/instance control | Specialized hosts, long-running or legacy processes | Patch, harden, scale, replace and monitor hosts |
| ECS | AWS-native container orchestration | Containers without needing Kubernetes API | Task roles, deployments, capacity and service discovery |
| EKS | Kubernetes API/control plane | Kubernetes ecosystem/portability needs | Cluster lifecycle, add-ons, nodes, RBAC and networking |
| Fargate | Managed task/pod capacity | Avoid worker node management for supported tasks | Per-workload sizing, scheduling, network and cost |
| Lambda Event Functions | Event/request invocation | Short event-driven and synchronous work | Retry/idempotency, concurrency and timeouts |
| Lambda Web Functions | Direct HTTP server (Node.js at launch) | HTTP applications using ordinary server frameworks | Revisions/endpoints, concurrency, auth and region support |
| Batch/Step Functions | Scheduling/workflow coordination | Jobs or multi-step orchestration | Job state, retry, idempotency and integration limits |

ECS and EKS both orchestrate containers but expose different APIs and operations. Fargate can supply capacity for supported ECS/EKS tasks; it is not a third orchestrator. Lambda durable functions and Step Functions both coordinate work but have different programming, persistence and integration contracts. A function URL and a Web Function endpoint are not equivalent concepts.

## Examples

### Size an event consumer

Assume an SQS consumer averages 200 ms of useful work and receives bursts of 500 messages. First choose idempotent business semantics and visibility timeout above the full expected processing/retry window. Then set batch size and concurrency to protect the database, monitor queue age and throttles, and define a dead-letter path. If the task exceeds an on-demand Event Function’s 30-minute ceiling, partition the work, use a suitable orchestration/batch design, or deliberately evaluate Lambda Managed Instances’ narrower 90-minute eligibility instead of assuming all Lambda can run longer.

### Roll out a web server

Build and test the Node.js server locally with the same listen-port contract. Deploy a new immutable Web Function revision, route a small/controlled fraction through the endpoint if supported for the chosen setup, monitor latency/errors and dependencies, then shift traffic or revert. A health endpoint should express readiness and the origin/path should be protected. A function URL on an Event Function would have different invocation/request semantics.

## Common mistakes

- Treating EC2 health, container running state or Lambda success as application readiness.
- Confusing task execution role and ECS task role, or EKS IAM access and Kubernetes RBAC.
- Scaling compute beyond downstream database or queue capacity.
- Assuming a Spot Instance cannot be interrupted or local instance-store data survives.
- Treating a launch configuration as the current EC2 launch specification.
- Assuming Fargate eliminates identity, networking, image, resource and cost work.
- Assuming Lambda execution environments are single-request or can retain mutable state safely.
- Applying Lambda Web Functions runtime support or endpoints to Event Functions, or vice versa.
- Applying the 90-minute Managed Instances exception to synchronous calls, all event sources or Web Functions.
- Assuming layer/image changes automatically update already deployed function code.

## Knowledge checks with answers

1. **How does a launch template differ from a launch configuration?** A launch template is versioned and more flexible/current; launch configurations are legacy and should generally be migrated.
2. **What is the difference between task and execution roles in ECS?** The task role authorizes application calls; the execution role supports ECS agent tasks such as image pulls and logging startup.
3. **Does Fargate remove all infrastructure responsibility?** No. It removes management of worker instances for supported workloads; sizing, IAM, networking, scheduling and application operations remain.
4. **What is the 2026 Lambda Web Functions change?** A separate direct HTTP server model with immutable revisions/endpoints, initially Node.js, while the existing event-driven model is named Event Functions.
5. **What are current Lambda Event Function timeout limits?** As of 2026-11-19, on-demand Event Functions support 30 minutes for synchronous, asynchronous and ESM invocations. Managed Instances support 30-minute synchronous and 90-minute eligible asynchronous/ESM invocations. Amazon MQ/DocumentDB mappings stay at 15 minutes; initialization stays 10 seconds on-demand and 15 minutes on Managed Instances.
6. **Why should a function avoid relying on warm environment reuse?** Reuse is an optimization, not a correctness guarantee; state may be absent, stale or reused across requests.
7. **What does Step Functions add over one Lambda handler?** Explicit persisted workflow state/transitions, retries, waits, branching and integrations; it still needs idempotent side effects and payload-aware design.
