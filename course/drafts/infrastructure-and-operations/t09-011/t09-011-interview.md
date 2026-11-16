# AWS architecture identity networking compute and data services — Interview questions and reasoning

Sources: [AWS IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [Amazon VPC routing](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html), [DynamoDB consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html), [Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html), [Lambda timeout configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html), and [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html).

## Core questions

Use these to test whether you can explain boundaries, failure and operational consequences—not just name products.

1. How do AWS Organizations, an account, a Region, an Availability Zone, a VPC and a subnet differ?
2. What is the difference between an IAM role trust policy and permission policy?
3. How can an `Allow` policy still result in `AccessDenied`?
4. How would you give GitHub Actions temporary access to deploy to one production account?
5. What do SCPs and RCPs do, and why do they not grant permissions?
6. When is a subnet public, and what else is required for actual inbound reachability?
7. Compare security groups and network ACLs.
8. Compare an internet gateway, NAT gateway and VPC endpoint.
9. When would you choose VPC peering, Transit Gateway or AWS Cloud WAN?
10. How would you design for an AZ failure versus a Region failure?
11. What are the differences among S3 versioning, replication, Object Lock and backup?
12. Compare RDS Multi-AZ instance deployment, Multi-AZ DB cluster deployment and a read replica.
13. How do you choose a DynamoDB partition key and secondary index?
14. What are MREC and MRSC global-table consistency modes, and how do you choose?
15. Compare SQS, SNS, EventBridge and Kinesis Data Streams.
16. How do you prevent a payment from being processed twice after queue redelivery?
17. Compare EC2, ECS, EKS, Fargate, Batch and Lambda by operations ownership.
18. What changed when Lambda Web Functions launched alongside Lambda Event Functions?
19. Under what conditions can Lambda Event Functions use a 90-minute timeout?
20. How do metrics, logs, traces, CloudTrail, Config and synthetic checks complement each other?
21. How do you prove a backup is useful and a disaster-recovery plan meets its objectives?
22. What would you do when a CloudFormation change set proposes replacing a stateful resource?
23. How would you diagnose a sudden cost increase without stopping a critical service blindly?
24. How would you run a fault-injection experiment safely?
25. How do the six Well-Architected pillars affect a real design decision?

## Concise interview answers

1. Organizations groups/governs accounts; the account is an administrative/billing boundary; Region and AZ define geographic/failure scopes; VPC is a regional network; a subnet is one AZ’s address range and route association.
2. Trust says who may assume the role; permission policies say what actions the assumed session may perform.
3. The allow may not cover the exact principal/action/resource/context, a required policy may be absent, or an explicit deny, boundary, session policy, SCP/RCP, resource/endpoint policy or KMS key policy may constrain it.
4. Configure GitHub OIDC trust with exact issuer/audience/subject claims, allow the job to assume a narrow deployment role, scope role permissions and `iam:PassRole`, and use short-lived credentials plus protected environment controls.
5. SCPs limit maximum permissions for principals; RCPs constrain maximum permissions granted to supported resources. Neither is an allow grant. Applicability and exceptions differ by account/service.
6. The subnet’s associated route table includes a route to an internet gateway. An inbound IPv4 resource also needs a public address, permissive SG/NACL/firewall rules, a listening service and any required DNS/TLS/application authorization.
7. SGs are stateful allow filters associated with interfaces/resources; NACLs are stateless numbered subnet filters requiring explicit return-flow rules.
8. IGW provides internet routing for configured public paths; NAT gives private IPv4 egress without unsolicited inbound sessions; endpoints provide private access to supported AWS services with endpoint/IAM/resource policies still applied.
9. Peering is a simple direct, non-transitive VPC connection; Transit Gateway is a regional hub; Cloud WAN is a managed global network control model. Choose by topology, segmentation, operations and cost.
10. Spread stateless capacity across AZs and test failover/connection retry. Region failure additionally needs explicit data replication/restore, identity, networking, DNS, quotas, deployment artifacts and a tested recovery objective.
11. Versioning keeps prior object versions; replication copies eligible changes; Object Lock protects versions from deletion/overwrite under retention rules; backups create governed recovery points. They protect different failure modes.
12. Multi-AZ instance deployment has a standby for failover; Multi-AZ DB cluster provides a writer and readable standbys for supported offerings; read replicas asynchronously scale reads and can lag. None removes backups.
13. Choose partition/sort keys from dominant queries and distribution. GSIs support alternate keys with eventual reads and added write/storage cost; LSIs share the partition key and have different limits/consistency.
14. Current Global Tables version 2019.11.21 defaults to MREC, which asynchronously replicates across supported Regions. MRSC synchronously replicates and supports strong reads but requires exactly three supported Regions, has feature restrictions, and its mode/topology cannot be changed after creation. Compare latency, RPO, conflict and availability needs.
15. SQS buffers work for consumer acknowledgment; SNS fans out publications; EventBridge matches/routes events; Kinesis provides ordered shard-based records and consumer positions.
16. Use a durable business operation ID, idempotent provider/API call or deduplication record, acknowledge/delete only after durable result, and test crash-after-side-effect redelivery.
17. EC2 gives host control; ECS/EKS orchestrate containers through distinct APIs; Fargate supplies managed capacity for supported ECS/EKS workloads; Batch schedules jobs; Lambda executes managed function models. More managed does not remove IAM, network, capacity and recovery responsibilities.
18. Lambda Web Functions are a separate direct HTTP server model with immutable revisions/endpoints and Node.js-only support at launch; the existing model was renamed Lambda Event Functions. Web Functions are not merely a function URL.
19. Asynchronous and eligible event-source invocations on Lambda Managed Instances can reach 5,400 seconds; Amazon MQ and DocumentDB mappings remain 15 minutes, and synchronous invocations/initialization remain within the 15-minute limit. Check current service docs.
20. Metrics show values over time, logs record events, traces connect request spans, CloudTrail records configured AWS API activity, Config evaluates resource state, and canaries test a configured user path. Coverage and retention must be enabled.
21. State RPO/RTO, restore into isolation, recover dependencies and credentials, validate data and real workflows, and measure time/data loss. A successful backup job or replication status is not proof of recovery.
22. Identify why replacement is proposed, whether data will be deleted or migrated, whether retention/import is possible, and how service/application compatibility changes. Pause risky execution, test in a safe environment and make rollback/recovery explicit.
23. Use Cost Explorer to find the service/Region/usage change, then CUR and tags for detail; compare deployments, traffic, egress, NAT, logs, replication and quotas. Stop confirmed waste safely; budgets/anomaly alerts can lag and are not universal hard caps.
24. State a measurable hypothesis, isolate blast radius, define permissions, stop conditions, owners and customer protections, observe the result, and avoid running an uncontrolled fault against unprepared production.
25. Operational excellence, security, reliability, performance efficiency, cost optimization and sustainability expose competing concerns. A defensible design explains measurable requirements and tradeoffs across all six.

## Deep follow-up answers

### “A private ECS task has an IAM allow but S3 returns AccessDenied. What do you check?”

Identify the credential principal and exact object/action. Check the task role, assumed session, boundary/session policy and applicable organization controls. Then inspect endpoint route/policy, bucket policy, Block Public Access where relevant, and KMS key policy/encryption context. Confirm DNS/path and use CloudTrail data events if they were enabled. Network flow evidence and IAM evidence answer different questions. Keep the bucket private; do not respond to an authorization bug by exposing data.

### “How do you choose active-active multi-Region data?”

Start with the write conflict model and user consistency requirement, not a global label. For current DynamoDB global tables, MREC is the default asynchronous mode; it supports broad regional placement but can expose stale reads and last-writer-wins conflicts. MRSC synchronously replicates and supports strongly consistent reads, but it must use exactly three supported Regions (three replicas or two plus a witness), does not support TTL or LSIs, and its mode/topology cannot be changed by adding replicas later. Identify which entity can be written in multiple Regions, what a user reads immediately after a write, and what happens during a network partition or Region failure. Test those behaviors and validate current regional feature support. Stronger cross-Region semantics add latency constraints.

### “Why did the API remain unhealthy after Auto Scaling replaced instances?”

Instance health may only measure host reachability. Check target health probe path, application startup and readiness, dependency connectivity, IAM, logs/traces, deployment version, and capacity bottlenecks. Ensure Auto Scaling health integrates with the load balancer and instance refresh waits for application-level health. Scaling out can worsen a saturated database or downstream limit; stabilize the constrained dependency before adding load.

### “The queue says the message was processed but the customer sees a duplicate payment.”

Inspect side-effect ordering. If the external charge succeeded and the consumer crashed before deleting the message, SQS can redeliver. Make the business operation idempotent using a provider-supported idempotency key and durable operation state. Delete/ack only after storing the final result. Add a crash-point test and a reconciliation path for ambiguous outcomes.

### “Would you move an existing API to Lambda Web Functions?”

Compare the current server contract with the new model: runtime support, concurrent requests per execution environment, endpoint/revision rollout, networking, extensions/instrumentation, regional availability, deployment and cost. At launch Web Functions support Node.js; a .NET/Java/Python API cannot be assumed to migrate directly. A function URL on an Event Function is another option with different invocation semantics. Use a representative benchmark and failure test before migration.

### “A change set says a database is replaced. Can you execute it?”

Not until the team understands the resource’s data lifecycle and replacement consequence. Confirm whether snapshot/retention protects it, whether migration/cutover preserves writes, how clients find the endpoint, and whether the new resource is compatible. Rehearse in a safe environment and plan for rollback; a change set previews CloudFormation’s interpretation, not all application/data consequences.

## Scenario questions

### Scenario A: one AZ is impaired

Explain how load balancer health checks remove targets, Auto Scaling/capacity in surviving AZs responds, and database/service endpoints fail over. Include what happens to in-flight requests, queues, cached state, NAT/endpoints and cross-AZ traffic costs. Name the user-facing success metric and how you prevent retry storms.

### Scenario B: accidental object deletion is detected

Identify bucket/versioning/Object Lock and replication state; restrict destructive access; preserve CloudTrail evidence; restore the correct version or recovery point; validate related event-driven processing. Check whether replication copied the deletion and whether noncurrent-version lifecycle could remove the needed data.

### Scenario C: production spend rises 40 percent

Define the time window and billing-data delay. Find service, Region and usage types in Cost Explorer/CUR, correlate deployment and traffic, examine data transfer, logs, scaling and untagged resources, and determine if the growth is expected or abusive. Set an owner and safe mitigation; do not disable critical redundancy without a risk decision.

## Tradeoffs and alternatives

- **Cross-account isolation vs simplicity:** Separate accounts strengthen blast-radius and billing boundaries but require role, pipeline, logging, networking and policy orchestration.
- **Managed service vs control:** Managed systems reduce some operational work but constrain runtime, protocol, version and tuning choices.
- **Synchronous vs asynchronous work:** Synchronous paths simplify response semantics but couple latency/availability; queues/workflows decouple and add retries, duplicate handling and eventual completion.
- **Multi-AZ vs cross-Region:** Multi-AZ usually targets regional AZ failure and low-latency failover; cross-Region addresses wider disasters at added cost, replication delay and operational complexity.
- **Strong vs eventual consistency:** Strong reads reduce stale observations but can constrain latency/topology; eventual replication can scale local reads/writes but requires conflict and stale-read handling.
- **Commitment discounts vs flexibility:** Savings Plans/Reserved Instances reduce eligible spend when utilized, while on-demand/Spot choices preserve different capacity and interruption tradeoffs.

## Common weak answers

- “AWS handles all security because it is managed.” Shared responsibility depends on the service; customers still own identity, data, network, code and configuration choices.
- “The policy says Allow, so access must work.” That ignores role trust, missing policy types, explicit deny, KMS, endpoint/resource policies and network path.
- “The private subnet has no internet.” It may have NAT, peering, transit, endpoints or other routed paths.
- “Multi-AZ means the database is backed up.” Availability and point-in-time recovery solve different problems.
- “SQS FIFO guarantees exactly once.” FIFO ordering/deduplication is bounded; external side effects and retries still need idempotency.
- “A global table is strongly consistent everywhere” or “always eventually consistent.” Current modes differ; name which one and its topology.
- “Lambda supports 90 minutes now.” The longer limit is specific to eligible Lambda Managed Instances invocations, not every function invocation.
- “We have CloudWatch.” Name the signals, instrumentation, retention, threshold, owner and response action.
- “A budget prevents overspending.” It does not universally stop usage or update in real time.
- “The deployment succeeded.” Show user-facing health, data correctness and rollback evidence.

## Self-check rubric

Score each 0–2: **0** absent/incorrect, **1** directionally correct but missing operational/failure details, **2** precise and tradeoff-aware.

| Dimension | A score of 2 includes |
|---|---|
| Boundaries | Correct account/Region/AZ/VPC/subnet distinctions and why they matter |
| Identity | Trust, temporary credentials, policy types, explicit deny and least privilege |
| Network | DNS, route, stateful/stateless filtering, endpoint and listener path |
| Compute/data | Workload fit, capacity/retry contract, state and consistency consequences |
| Reliability | Failure hypothesis, RPO/RTO, backup/replica distinction and tested recovery |
| Operations | User-impact signals, audit evidence, owner, runbook and safe mitigation |
| Cost/governance | Realistic usage drivers, tags/quota/alerts and commitment risk |
| Reasoning | Explicit assumptions, alternatives, evidence and what must be verified live |

Aim for 13/16 or higher, with no zero in identity, network or reliability. For any missed dimension, answer again using a concrete workload and identify the evidence that would prove the design works.
