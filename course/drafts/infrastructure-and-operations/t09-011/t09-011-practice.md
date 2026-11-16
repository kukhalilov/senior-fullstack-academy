# AWS architecture identity networking compute and data services — Exercises and worked solutions

Sources: [AWS policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [VPC route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html), [DynamoDB consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html), [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), and [Lambda timeout configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html).

## Goals

Practice translating a workload into explicit account, identity, network, compute, data, reliability and operating choices. For each scenario, state assumptions, draw the request/data path, identify who authorizes each operation, explain failure and retry behavior, and name at least one tradeoff. A technically valid architecture is incomplete until recovery, telemetry and cost are also considered.

## Worked example

### Scenario: a private image-processing worker cannot read uploaded S3 objects

An API gives a browser a presigned URL for an upload. S3 accepts the upload, but the worker receives `AccessDenied` while reading it. The worker runs in a private subnet and has an IAM role.

**Reasoning sequence:**

1. Confirm the exact AWS principal by inspecting the worker’s resolved credential identity. Do not assume the intended role is active just because it is attached.
2. Confirm bucket, object key, Region and requested action. Check whether the object uses SSE-KMS; decryption requires KMS authorization as well as S3 permission.
3. Check the S3 path: DNS, gateway endpoint route if used, endpoint policy and any VPC/endpoint conditions in the bucket policy.
4. Evaluate the role identity policy, permissions boundary, session policy, applicable SCP/RCP, bucket policy and KMS key policy for an explicit deny or missing allow.
5. Check CloudTrail data-event coverage if object reads/writes need API evidence. VPC Flow Logs can show a network flow but not the S3 authorization decision.
6. Preserve private access. Do not make the bucket public to hide an IAM, endpoint or encryption-policy bug.

**Safe resolution:** grant only the needed object read action on the intended prefix to the worker role, permit that path in the endpoint/bucket policies, and grant KMS decrypt for the correct key/context when necessary. Add an integration test using the same role and network path, then monitor failures and queue age.

**Why alternatives fail:** adding a broad `s3:*` grant may leave a bucket policy or KMS denial unchanged and expands blast radius. Disabling Block Public Access exposes data and bypasses the actual issue. A successful upload through a presigned URL does not prove that a separate worker principal can read it.

## Exercises

### 1. Multi-account deployment identity

A GitHub Actions workflow in one repository deploys an API to a production member account. A separate development repository should not deploy to production. Design the identity chain and list the main policy checks.

### 2. Private subnet egress

An ECS service in private subnets must access S3, DynamoDB and one external HTTPS API. Compare a gateway endpoint, interface endpoint, NAT gateway and VPC peering. Specify the route, DNS, filter, IAM and cost considerations.

### 3. Resilience versus backup

A team deploys RDS Multi-AZ and says it no longer needs backups. Explain which failures Multi-AZ can address, which it cannot, and design an RPO/RTO-based restore exercise.

### 4. Choose an event model

An application receives direct HTTP requests, queue messages and nightly long-running reconciliation jobs. Select among Lambda Web Functions, Lambda Event Functions, Lambda Managed Instances, ECS/Fargate, AWS Batch and Step Functions. Explain when the 90-minute exception matters.

### 5. Messaging guarantee

Two consumers process payment notifications from SQS. A consumer can crash after charging the payment provider but before deleting the message. Design the idempotency, visibility, retries and dead-letter handling.

### 6. DynamoDB access patterns

An orders service needs query by customer/time, query by order status, and a global read experience in three Regions. Propose table/index key shapes and discuss GSI consistency, hot partitions, MREC and MRSC.

### 7. Edge and ingress path

Users in multiple Regions access a web application with a regional ALB and a private database. Draw a CloudFront or Global Accelerator path, DNS, WAF, origin restriction and health behavior. State which option fits HTTP cache needs and which is for non-cache TCP/UDP routing.

### 8. Operational evidence and incident response

After a deployment, users see elevated API latency, but all EC2 instances show healthy. Identify the useful metrics, logs, traces, synthetic checks, CloudTrail/Config evidence and immediate mitigation decisions.

### 9. Cost surprise

Monthly AWS spend increases unexpectedly. Create a disciplined investigation using Cost Explorer, CUR, Cost Anomaly Detection, tags, CloudWatch and service quotas. Explain why a budget cannot guarantee spending stops at a threshold.

### 10. Disaster-recovery readiness

A service has cross-Region replication enabled and a green backup job. The team has never failed over or restored. Build a game-day plan with safety conditions, data integrity checks, identity/network/DNS recovery and objective measurement.

## Progressive hints

1. Bind the OIDC trust to the intended repository and production environment; remember caller permission, role trust, role permissions and organization guardrails.
2. S3/DynamoDB support gateway endpoints; private HTTPS services may need interface endpoints. NAT is broad IPv4 egress with cost; peering connects VPCs but is non-transitive and not an internet gateway.
3. Multi-AZ is an availability feature, not point-in-time backup or corruption protection. Test restoration in an isolated environment.
4. Use Web Functions only for supported direct HTTP applications; Event Functions fit event triggers; long jobs may need splitting/orchestration/batch rather than an assumed timeout extension.
5. Acknowledge only after durable side effects. Use a business idempotency key and durable deduplication state.
6. Design each query first. GSIs are eventually consistent; global-table mode changes cross-Region guarantees and constraints.
7. CloudFront is HTTP(S) content delivery/cache; Global Accelerator is static Anycast network routing. Neither makes the origin safe by itself.
8. Host health is not request health. Find the affected request path and dependency using latency, error, saturation, trace and user probes.
9. Billing data lags; group by service/Region/usage type/tag and compare to deployment/traffic. Budget alarms are notifications/actions, not universal hard caps.
10. Replication can reproduce corruption. Decide a clean recovery point, isolate the exercise, and verify an actual business workflow.

## Complete solutions

### 1. Multi-account deployment identity

Configure a GitHub OIDC provider in the production account and a role with a trust policy that restricts issuer, audience and subject to the intended repository and production environment/branch. The job requests an OIDC token and assumes the role for temporary credentials; the role has only the stack/resource actions and narrowly scoped `iam:PassRole` needed by deployment. Verify the job principal is allowed to assume the role, the trust policy matches exact claims, any permissions boundary and SCP/RCP allow the action, and the target resource policies do not deny it. Require protected environment approval where appropriate and separate development’s role/trust. Never use a shared IAM user key for both repositories.

### 2. Private subnet egress

Associate each workload subnet to an explicit route table. Add an S3 and DynamoDB gateway endpoint to the route tables, then apply endpoint and resource policies plus the task role’s data permissions. For external HTTPS, decide whether a NAT gateway is acceptable or a vetted egress proxy is needed; place NAT per AZ where isolation/availability justifies the cost, and restrict security-group egress. An interface endpoint can privately reach supported AWS services; create endpoint ENIs, allow source traffic to their security groups, configure private DNS and policies, and evaluate hourly/data charges. Peering only connects VPC address spaces and is non-transitive; it is not the preferred path to public internet APIs. Verify resolver responses, routes, SG/NACL return traffic, TLS and service identity.

### 3. Resilience versus backup

Multi-AZ DB instance deployment maintains a standby for failover; it protects against some instance/AZ failures but causes connection interruption and does not restore a point in time. It will not necessarily protect against accidental deletion, application-corrupt writes, compromised credentials or a logical error replicated to the database. Keep automated backups/snapshots and, if the threat model requires it, protected cross-account/Region recovery points. For an RPO (maximum data loss) and RTO (maximum restore time), isolate a restore, recover configuration/secrets, establish network access, validate tables and business invariants, measure end-to-end time, and record gaps. Run periodically and after major architecture changes.

### 4. Choose an event model

Use Lambda Web Functions for a supported Node.js HTTP server where direct request/response behavior, concurrent requests per environment and its current regional/runtime contract fit. Use Lambda Event Functions for queue/event processing or short synchronous work with retries/idempotency. Lambda Managed Instances may be evaluated for eligible long-running asynchronous/event-source workloads; its 90-minute exception excludes some event sources and synchronous invocations stay within the ordinary 15-minute maximum. Do not select it solely by duration: check its concurrency/process model, support and pricing. Use ECS/Fargate for long-lived/container services needing service control without worker nodes; EC2 capacity can be justified for specialized requirements. AWS Batch is for queued batch jobs and compute environments. Step Functions is for explicit multi-step waits/retries/branching. Reconcile long jobs into idempotent chunks when simpler and more recoverable.

### 5. Messaging guarantee

Create a stable payment operation ID before enqueueing. The consumer atomically records that ID with payment state or uses the payment provider’s idempotency mechanism; on redelivery it returns the existing outcome rather than charging twice. Set visibility timeout above expected processing and retries with margin; extend it for long work when appropriate. Delete only after durable success or recorded terminal outcome. Configure bounded retry/redrive to an SQS dead-letter queue, alert on age/count, protect the queue data, and create a controlled replay procedure. SQS delivery remains at-least-once; FIFO grouping may preserve message order but does not remove application-side idempotency need.

### 6. DynamoDB access patterns

Use a base primary key such as `customerId` partition plus sortable `createdAt#orderId` sort key for customer/time queries. Add a GSI for status only if the query justifies it; status is low cardinality, so salt/bucket or another access-pattern key may be needed to avoid a hot partition, and global index reads are eventually consistent. Project only required status-query fields and account for index write/storage cost. A three-Region global table needs an explicit conflict/consistency model: MREC permits low-latency local writes with asynchronous propagation and concurrent conflict reconciliation; MRSC offers stronger cross-Region consistency but has tighter topology/support and latency constraints. Validate supported Region combinations and failure behavior from current docs, then define whether one order may be concurrently updated in different Regions.

### 7. Edge and ingress path

For HTTP(S) content/API traffic needing caching/edge features, route DNS to CloudFront, use a controlled ALB origin with TLS, attach WAF as needed, and prevent direct bypass if every request must be inspected. Configure cache behavior so personalized responses are not shared and health probes reflect readiness. For non-cache TCP/UDP or static-address regional routing, consider Global Accelerator and health-checked endpoint groups. Route 53 controls DNS answers and TTLs; it is not the connection proxy. A regional ALB distributes to application targets but does not itself create global failover or protect an unprotected database. Verify origin certificates, routing, SGs, target health, user authentication and regional recovery.

### 8. Operational evidence and mitigation

Correlate request rate, errors, latency percentiles and saturation with deployment time. Trace representative slow requests to locate a dependency; inspect structured logs by correlation ID and avoid querying unbounded time ranges. Use an external Synthetics canary to verify the user path. CloudTrail identifies the deployment/API principal and changed AWS resources; Config can show configuration drift. First mitigate user impact with a safe rollback, traffic shift or capacity/dependency protection; avoid scaling blindly if database saturation is the cause. Communicate status, preserve evidence, verify recovery using user-level signals, and later create a blameless follow-up action.

### 9. Cost surprise

Use Cost Explorer to identify the service, Region, operation or usage category that rose; query CUR for detailed resource/tag data after accounting for billing delay. Compare anomaly timestamps with deployments, traffic, log ingestion, storage growth, NAT/edge/replication paths and data transfer. Verify cost allocation tags are activated and shared resources are covered. CloudWatch may show increased request/egress/queue/compute volume. Check whether a resource was accidentally made public or entered a recursive event loop. Budgets notify or trigger configured actions, but billing delay and ongoing usage mean they are not hard real-time caps. Set ownership, stop only the confirmed waste safely, and add a quota/budget/alert/runbook control.

### 10. Disaster-recovery readiness

Define the scenario and RPO/RTO; choose an approved isolated recovery environment and a named exercise lead with a stop condition. Confirm which replication point is trustworthy, because replication may have copied the corruption. Restore from a protected recovery point or launch replicated servers into isolated networks, then rebuild identity roles, KMS access, secrets, routes, endpoints, security groups, DNS and dependent queues. Validate data checksums/business invariants and run a read/write user journey. Measure time to service, stale/lost data, operator steps and external dependency behavior. Do not direct production traffic until validation and rollback paths are approved. Record owners/dates for gaps and repeat the exercise.

## Tests and edge cases

- **Policy simulation:** For a denied request, record principal, action, resource, Region and context. Check role assumption separately from resource access and look for explicit denies, missing allows, endpoint policy, KMS policy and organization controls.
- **Network path:** Test DNS resolution from the same subnet/runtime, then the route target, security-group source/destination, stateless NACL response port, endpoint policy and application TLS/listener. Avoid broad “allow all” changes as a diagnostic fix.
- **Duplicate processing:** Inject a retry after the side effect succeeds but before queue deletion; verify the second delivery does not duplicate the business result.
- **Region/AZ failure:** Disable or isolate a target in a controlled test; verify health detection, connection retry, data consistency and capacity in surviving zones.
- **Restore:** Restore a backup into a separate account/VPC and validate application semantics, not only resource state.
- **Timeout:** Test near the intended deadline. For Lambda Managed Instances, test safe cancellation/idempotency because a timed-out invocation may not stop application code immediately; do not infer behavior from standard Lambda alone.
- **Cost:** Estimate endpoint/NAT/edge/replication/log ingestion and cross-AZ/Region traffic with realistic volumes; compare observed CUR later.
- **Lifecycle:** Verify runtime, Kubernetes/EKS and service retirement status before release; AWS docs and Region coverage can change independently.

## Reflection questions

1. Which architecture decision did you initially make from a product label rather than a workload requirement?
2. Which failure would be hardest to detect with the current metrics, logs and traces?
3. What is your idempotency key and where is its durable result stored?
4. Can a CI token from a pull request or fork assume the production role? Prove the answer from trust conditions.
5. What is the tested RPO/RTO, and when was the last real restore?
6. Which cross-AZ/Region network flows dominate both latency and cost?
7. Which managed-service responsibility is still yours and currently unowned?
8. What single “green” dashboard signal could mislead you during an outage?
