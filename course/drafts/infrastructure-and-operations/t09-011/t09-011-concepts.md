# AWS architecture identity networking compute and data services — Core concepts and how they fit together

Sources: [AWS IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [AWS VPC subnet basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), [DynamoDB current global-table model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/V2globaltables_HowItWorks.html), [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html), and [AWS Lambda timeout configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html).

## Learning objectives

By the end, you should be able to:

- Explain the boundaries between AWS Organizations, accounts, Regions, AZs, VPCs, subnets and resources.
- Trace a workload request through DNS, routing, filtering, compute, service authorization and data access.
- Reason about IAM as request-time policy evaluation, including role trust, resource policies, boundaries and explicit deny.
- Select a compute, storage, database or messaging model from workload requirements and state its operational tradeoffs.
- Distinguish availability, durability, backup, replication and disaster recovery, and connect observability to an actionable operating model.
- Explain the current Lambda Event Function and Web Function models without applying one model’s limits to the other.

## Prerequisites

You should know what a process, network address, DNS name, HTTP request, database transaction and message queue are. You do not need an AWS account to learn the concepts. Do not experiment in a billable account without understanding resource cleanup, data exposure and cost.

## Core concepts

### Boundaries are layered

An **AWS account** is a principal administrative and billing boundary. **AWS Organizations** lets an organization manage multiple accounts and apply organization-level controls. An **organizational unit** is a grouping for accounts, not a network or application environment by itself. You can isolate production from development in separate accounts and then apply shared governance centrally. A workload split across accounts introduces explicit cross-account role trust and network connectivity decisions.

A **Region** is a geographic deployment area. An **Availability Zone** is a distinct failure domain within a Region. Service scope can be global, regional, or zonal, and an account’s quota or service availability can differ by Region. A regional service endpoint does not mean its data or control plane is automatically replicated elsewhere. Decide which failure domain the application must survive before choosing replication.

Inside a Region, a **VPC** defines an IP address space. Each **subnet** belongs to one AZ and is associated with a route table. “Public subnet” means a route table has a path to an internet gateway; a resource also needs a public address and compatible filtering/service configuration to be reachable. A private subnet commonly uses NAT for outbound IPv4 connectivity, but NAT is not an inbound firewall rule or a substitute for private service endpoints.

### Identity is evaluated separately from network access

An IAM **role** has two separate concerns: a trust policy states who may assume it, and permission policies state what the assumed session may do. Assuming a role obtains temporary credentials. This is preferable to embedding a durable user access key in a server, CI configuration or container image. Use workload identities such as instance profiles, task roles, EKS Pod Identity or OIDC federation with each mechanism’s supported boundary.

Authorization is a request-specific calculation involving the principal, action, resource, context and applicable policy types. An identity policy can allow an action, while a resource policy, permissions boundary, session policy, organization policy, resource control policy or explicit deny changes the result. The short rule “explicit deny wins” is useful, but a missing allow also means the request is denied. Policies are not all merged identically: principal/account context and policy type matter. Use the AWS policy evaluation model and test the actual request context rather than guessing from one JSON statement. [AWS policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

This identity decision does not create a packet path. A role can permit `GetObject` while a VPC endpoint policy, bucket policy, route, DNS resolution or security control blocks access. Conversely, a reachable endpoint does not grant the operation.

### Network reachability is a sequence

For an application request, reason in this order:

1. **Name:** Which DNS name does the client resolve, and which hosted zone/resolver/routing policy answers it?
2. **Address and path:** Does the destination address have a route from the source subnet? What is the route-table target: local, gateway, peering, transit, NAT or endpoint?
3. **Filters:** Do security groups permit the flow? Do network ACLs permit both directions? Do a firewall, WAF or service resource policy add constraints?
4. **Listener and target:** Is the application listening on the expected address/port? Does the load balancer health check reach a ready target?
5. **Application identity and authorization:** Which role or user signed the service API request, and which policy decides access?

Security groups are stateful and attached to network interfaces; responses to allowed connections are tracked. Network ACLs are stateless and applied at subnet boundaries; both inbound and outbound rules, including ephemeral response ports, matter. Security groups allow rules rather than explicit deny rules; NACLs use numbered allow/deny rules. Avoid making changes based only on subnet names.

A **gateway endpoint** provides private routing to supported AWS services such as S3/DynamoDB through route-table configuration. An **interface endpoint** uses endpoint network interfaces and PrivateLink connectivity. A VPC endpoint can reduce exposure to public internet paths, but it still requires DNS, endpoint/service policies, IAM permissions, routes, security groups and service-side configuration to align. Private connectivity is a network property, not authorization.

### Compute choices trade control for operations

EC2 gives the most direct control over instances and guest OS responsibilities. An EC2 Auto Scaling group replaces/scales instances according to desired capacity and policies, but its health checks and scaling signals must reflect application health and useful capacity. Spot Instances exchange interruption risk for discounted spare capacity; interruption handling and diversification are part of the design. Savings Plans and Reserved Instances are financial commitments/discount mechanisms, not schedulers that automatically place workloads.

Amazon ECS and EKS are different orchestration control planes. ECS models tasks and services in the AWS-native scheduler. EKS provides managed Kubernetes control plane integration and still requires cluster, node, add-on, upgrade, policy and networking operations. Fargate is a capacity model that removes worker-node management for eligible workloads; it does not make orchestration, image security, networking or application troubleshooting disappear. A managed service has a shared-responsibility boundary, not zero responsibility.

The two Lambda request models also differ:

- **Lambda Event Functions** are invoked by direct callers or event-source mappings, with invocation, retry, concurrency and event semantics depending on the trigger. As of 2026-11-19, on-demand Event Functions support up to 30 minutes for synchronous, asynchronous and event-source mappings. Managed Instances support 30-minute synchronous and up to 90-minute asynchronous/ESM invocations, except Amazon MQ and DocumentDB mappings remain at 15 minutes. Initialization stays at 10 seconds on-demand and 15 minutes on Managed Instances; verify the invocation path. [AWS announcement](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-lambda-30-minute-ondemand-event-functions/) · [Timeout details](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html)
- **Lambda Web Functions** run a Node.js web server that listens on a port and handles HTTP requests directly. They have immutable revisions and endpoints and can handle multiple concurrent requests per execution environment. They are not just a function URL; those are different Lambda constructs. Check regional and feature support before use. [Web Function model](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-how-it-works.html)

Lambda durable functions add persisted steps, waits and retries for long-running workflows; the feature does not turn every invocation into an unlimited transaction. External side effects still need idempotency, and state/payload size is bounded. Step Functions remains a separate state-machine service with its own integrations and execution semantics. Choose by workflow requirements and supported service model.

### State and event contracts matter more than product names

S3 is an object store, not a mounted POSIX disk. EBS is block storage attached to compute, while EFS and FSx are file-system products with distinct protocols and performance models. Choosing “storage” requires an access pattern, latency/throughput target, consistency expectation, retention policy, encryption design and restore test.

RDS/Aurora and DynamoDB do not offer the same data model. Relational constraints, joins and transactions favor a relational engine. DynamoDB requires key/access-pattern design: a partition key distributes requests; a sort key orders/query-ranges within a partition. Secondary indexes add query flexibility but consume storage and write capacity and have consistency/propagation behavior to understand. For new work, current global tables use version 2019.11.21: MREC is the default asynchronous mode; MRSC provides cross-Region strong reads but requires exactly three supported Regions (three replicas or two replicas plus a witness), cannot add replicas or change mode after creation, and does not support TTL or local secondary indexes. MREC supports broader regional placement and can expose replication lag/conflicts; MRSC trades additional latency for stronger multi-Region consistency. A global table is a distinct data model, not a transparent substitute for a single-Region table.

Messaging services also express different contracts:

- SQS buffers work for polling consumers. Standard queues provide at-least-once delivery and best-effort ordering; FIFO queues add ordering/deduplication features within documented constraints. Visibility timeout hides a received message temporarily; it does not prove work completed.
- SNS publishes to subscriptions for fan-out. Subscription protocol, filtering, delivery retries and dead-letter options determine what subscribers receive.
- EventBridge matches/routes events between producers and targets. Rule matching, archive/replay capabilities, retry and target delivery differ from a queue’s consumer-controlled acknowledgment.
- Kinesis Data Streams provides ordered records within shards, with retention and consumer-position semantics. Capacity mode, shard throughput and consumer patterns determine scaling.

Expect retries and duplicate delivery unless a service contract and processing design specifically establish otherwise. Make consumers idempotent and track a durable business operation key.

### Reliability is a set of explicit outcomes

**Availability** is the ability to serve successfully when requested. **Durability** is the probability that stored data remains intact. **Backup** is a recoverable copy at a point in time. **Replication** copies changes and may also copy deletion, corruption or malicious changes. **Disaster recovery** is the plan and tested capability to restore a service after a defined failure. These concepts overlap but none implies another.

Write a recovery time objective (RTO) and recovery point objective (RPO) before choosing multi-AZ, snapshots, cross-Region replication or a recovery service. Multi-AZ failover can improve availability but does not necessarily preserve a user’s in-flight request. A database read replica is not equivalent to a failover standby or a point-in-time backup. Backups must be protected against accidental/hostile deletion and restore tests must include application configuration, secrets, DNS, identity and data validation.

### Operations require questions, signals and owners

CloudWatch metrics identify changing numeric signals, logs preserve event records, and traces connect spans across a request. AWS CloudTrail answers who called which AWS API and when; it is not a complete application audit log. AWS Config records/evaluates resource configuration; it does not prove that an application works. Health dashboards describe AWS service or account-impacting events, whereas workload probes assess user-visible behavior.

An alert should have a signal tied to user or system impact, a threshold/window, an owner, a runbook and an escalation route. “CPU is high” is a symptom; a burn-rate or latency/error objective can express service impact more directly. Dashboards do not replace alert hygiene, and a green health check does not prove an entire dependency chain is healthy.

## Mechanisms and relationships

Use an account for a strong ownership/security boundary; use VPCs and subnets for network segmentation; use IAM and service policies for action authorization. Deploy infrastructure from reviewed templates, inspect proposed changes, and promote immutable artifacts between environments. Use resource tags and Organizations tag policy for cost/accountability conventions, but validate coverage because tags can be absent or excluded from some cost records.

When a connection fails, do not start by opening all ports. Check DNS, then routes, then security-group rules on both endpoints, then stateless NACL return traffic, then endpoint or resource policy, and finally application listener/authentication. A VPC Flow Log records accepted/rejected network flows at configured scope; it cannot explain all application protocol errors. Reachability Analyzer evaluates a supported configuration path; it does not send real traffic or prove DNS/application readiness.

When a service fails, first stabilize users: scope the impact, compare recent changes, choose a safe mitigation, communicate status, and verify recovery with user-facing signals. Then preserve evidence and prevent recurrence. AWS Fault Injection Service experiments are controlled, permissioned tests with stop conditions; they are not a substitute for an incident plan or backup restore rehearsal.

## Worked examples

### Diagnose an S3 access failure from a private workload

The IAM role appears to allow `s3:GetObject`, but a request fails. Verify which principal the SDK actually resolved. Confirm bucket/key and Region, then check whether the VPC has the expected gateway endpoint route or other path. Inspect the endpoint policy, bucket policy, permissions boundary/organization controls and any explicit deny. Check encryption: KMS key policy and grants can deny decryption even when S3 allows the object request. Finally inspect CloudTrail data-event coverage if it was enabled; ordinary management event history is not a guarantee of object-read data events. Do not “fix” this by making the bucket public.

### Choose a web API execution model

For a conventional HTTP server built in Node.js, evaluate Lambda Web Functions: direct port listener, concurrent requests per environment, endpoint/revision model and current regional support. For a queue-driven image processor, use Lambda Event Functions with an SQS mapping, batch/visibility/retry choices, idempotent processing and a dead-letter or failure destination. For a workload that must run continuously or needs a different control model, compare ECS/EKS/App Runner or EC2. The word “serverless” alone does not settle latency, concurrency, long-running work, portability, operating effort or cost.

### Choose queue, topic, bus or stream

If a worker pool should independently pull tasks and control acknowledgment, start with SQS. If multiple subscribers need a notification, consider SNS fan-out. If producers emit typed events that should be routed by content to multiple targets, consider EventBridge. If records need ordered shard-based replay/consumer positions and sustained stream processing, consider Kinesis Data Streams. Add deduplication, idempotency, retention, replay, retry and poison-message behavior to the design before calling it “reliable.”

## Misconceptions and edge cases

- A role’s permission policy does not prove it can be assumed; the trust policy and caller context matter.
- “Explicit deny wins” is not the whole policy algorithm. A required allow can be absent, and policy types interact by principal, account and request context.
- A route to an internet gateway does not make a private-address-only resource publicly reachable.
- Security groups are stateful; network ACLs are stateless. Their evaluation and rule semantics differ.
- Multi-AZ, cross-Region replication and backups protect against different failure classes.
- A queue’s visibility timeout, retry policy and dead-letter queue do not create exactly-once business processing.
- Lambda Web Functions and Lambda Event Functions are different programming/execution models. The 90-minute Lambda Managed Instances limit is not a general Lambda or Web Functions limit.
- Managed capacity still has quotas, capacity, regional availability, IAM, networking, patch responsibility boundaries, deployment and cost constraints.
- A budget sends notifications/actions when configured; it is not a universal hard spending cap.

## Knowledge checks with answers

1. **Why can a workload with an IAM allow still fail to reach S3?** The route/DNS path, VPC endpoint policy, bucket policy, explicit deny, KMS authorization or credentials can block the request independently.
2. **What makes a subnet public?** Its effective route table has an internet-gateway route; public reachability also needs an address, allowed filters and a listening service.
3. **How do security groups differ from NACLs?** Security groups are stateful network-interface filters; NACLs are stateless subnet filters requiring return traffic rules.
4. **Does Multi-AZ eliminate the need for backup?** No. It helps with some availability failures; backup supports recovery from deletion, corruption and other point-in-time recovery needs.
5. **When should a consumer be idempotent?** Whenever delivery/retry can repeat work and the business effect must not be applied twice.
6. **What is the key 2026 Lambda distinction?** Lambda Event Functions preserve invocation/event semantics; Lambda Web Functions directly host Node.js HTTP servers with revisions/endpoints at launch. Their support and limits differ.
7. **What does CloudTrail show?** AWS API/control-plane activity in the configured event categories; application events and data events require their own coverage/design.
