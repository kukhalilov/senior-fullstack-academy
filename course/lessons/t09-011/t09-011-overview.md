# AWS architecture identity networking compute and data services — Big-picture orientation and mental model

Sources: [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/framework.html), [AWS Well-Architected Cloud Foundations](https://docs.aws.amazon.com/wellarchitected/latest/framework/cloud-foundations.html), [AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html), [Amazon VPC subnet basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html), [AWS Lambda current quotas](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html), and [AWS App Mesh shutdown status](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html).

## Problem and purpose

Amazon Web Services is a platform of independently operated services. A production system is not “in AWS” as one indivisible object: it is a set of resources owned by accounts, deployed in locations, authorized by policies, connected by routes and endpoints, and operated through monitoring, deployment, recovery and cost controls. The architecture task is to select the smallest set of services whose contracts fit the workload, then configure the boundaries between them correctly.

This topic builds the mental model for that task. It covers the common application architecture surface supplied in the topic inventory: account governance and IAM, Regions and network paths, compute and containers, data and messaging, and operations. It is deliberately not a catalog of every AWS product or every API parameter. AWS’s service list and regional capabilities change continually; the fixed names in the references define this curriculum’s scope.

## Plain-language mental model

Think of a workload as a set of boxes, wires, keys and evidence. **Boxes** are AWS resources and accounts. **Wires** are network paths between clients, compute and data. **Keys** are identities and temporary credentials that authorize individual actions. **Evidence** is telemetry and audit history that lets operators answer what happened. Reliability comes from designing for failed boxes and wires, while cost comes from the resources and traffic the design consumes.

An AWS account is a security and billing boundary. AWS Organizations groups accounts under governance; an organizational unit (OU) groups accounts for policy. Inside an account, an IAM principal makes signed AWS API requests. A user or workload usually assumes an IAM role to obtain temporary security credentials. Policies and explicit denies determine whether a particular request is permitted. Account identity does not imply network reachability, and network reachability does not grant permission.

Resources are deployed in a Region or are global/service-specific. A Region contains Availability Zones (AZs), separate failure domains connected within a region. A VPC is a regional network; each subnet is associated with one AZ. A route table selects a next hop, security groups filter traffic at network interfaces, and network ACLs filter at subnet boundaries. Internet reachability requires a complete path: public addressing where appropriate, a route to an internet gateway, allowed filters and a listening service. A “public subnet” label alone does not make every resource public.

Compute is a responsibility spectrum. With Amazon EC2, you control the virtual machine, guest operating system and much of its lifecycle. Amazon ECS and Amazon EKS coordinate containers; AWS Fargate removes customer management of the underlying worker instances for supported workloads. AWS Lambda runs code in managed execution environments. AWS Lambda now distinguishes **Lambda Event Functions**, the established event/request invocation model, from **Lambda Web Functions**, a newer direct-HTTP server model. The Web Functions model launched on 2026-10-12, initially supports Node.js, and has revisions and endpoints; it is not just another name for a function URL. [AWS announcement](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/) · [Web Functions guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html)

Data services encode different access and failure contracts. Amazon S3 stores objects addressed by keys; Amazon EBS provides block volumes for compute; Amazon EFS and Amazon FSx provide file-system models. Amazon RDS and Amazon Aurora offer managed relational database options, while Amazon DynamoDB is a key-value/document database designed around partition keys and access patterns. Amazon SQS queues work for consumers; Amazon SNS fans notifications out to subscribers; Amazon EventBridge routes events; Kinesis Data Streams supports ordered shard-based stream processing. These services solve related but not interchangeable problems.

Operations closes the loop. Amazon CloudWatch exposes metrics, logs, alarms and dashboards; AWS CloudTrail records control-plane/API activity; AWS Config tracks configuration state and evaluates rules; traces and synthetic checks answer different questions from logs. Infrastructure-as-code and deployment tools make changes repeatable. Backup and disaster recovery must be tested against recovery objectives. Budgets, tags and cost analysis give spending context; they do not automatically stop every charge.

The AWS Well-Architected Framework now separates **Cloud Foundations** from **Cloud Workloads**. Foundations cover organization-wide capabilities such as multi-account governance, centralized identity, observability, inventory, security, financial management, and networking. The workload section retains the six pillars. A sound account foundation enables teams; it does not substitute for testing the architecture of each workload. [Framework update, 2026-11-16](https://docs.aws.amazon.com/wellarchitected/latest/framework/framework.html)

## How the parts fit together

The request path and the permission path are separate:

```text
Client -> DNS / edge -> load balancer -> VPC route -> compute -> data or messaging service
   |                                      |             |
   +-- TLS, WAF, health checks             +-- SG/NACL   +-- IAM role credentials

Organizations/governance -> accounts -> IAM authorization -> resource configuration
CloudWatch/CloudTrail/Config -> operating evidence and alerting
Backup/replication/failover -> recovery behavior
Cost Explorer/Budgets/tags -> spend visibility and governance
```

For each arrow ask four questions: what resolves the name, what routes the packet, what filters the request, and what identity authorizes the operation? If any one answer is missing, “the service is running” does not imply that a user can use it. For each stateful resource ask where data is durable, what is replicated, which failure is tolerated, how a restore is performed, and whether the restore meets the recovery time and recovery point objectives.

## Concept map

1. **Governance and identity:** AWS Organizations, accounts, IAM principals, role trust, policy evaluation, federation, and temporary credentials.
2. **Location and connectivity:** Regions, AZs, VPCs, subnets, routes, filters, gateways, endpoints, DNS, edge services, and hybrid connections.
3. **Execution:** virtual machines, autoscaling, load balancing, container schedulers, managed container capacity, application platforms, functions and workflow orchestration.
4. **State and events:** object/block/file storage, relational and non-relational databases, queues, pub/sub, event routing and streaming.
5. **Operations:** telemetry, audit, configuration compliance, automation, infrastructure as code, reliability testing, backup, disaster recovery and cost controls.

## End-to-end walkthrough

Suppose a team deploys a multi-tenant order API. It first places workloads and data in an AWS account governed by AWS Organizations, choosing a Region and AZ strategy from latency, compliance and recovery needs. A CI workflow obtains short-lived credentials through a GitHub Actions OIDC provider for AWS and assumes a deployment role; the workflow does not store a long-lived IAM user key. The deployment role can change only its target stack and supporting resources.

The public path resolves a hostname through Amazon Route 53, sends traffic through an edge/security layer as needed, and reaches an Application Load Balancer. Its target group health check tests a specific readiness path. Compute runs as a service with defined capacity and rollout behavior. The service’s IAM role has only the data actions required by the order workflow. A route from compute to a private database endpoint exists, security-group rules permit only the necessary source and port, and database credentials or encryption keys are managed separately from code.

The API writes its transaction to a relational store and publishes an event for asynchronous work. The producer records enough state to make publication recoverable; a consumer processes messages idempotently because retries can produce duplicates. CloudWatch metrics and logs show latency and failures, traces connect the request to dependencies, CloudTrail helps investigate control-plane changes, and alerts point to an owner and runbook. Backups are restored in a rehearsal, not merely enabled. A cost budget notifies the team; it is not treated as a hard spending ceiling.

The useful lesson is that the diagram is a set of contracts. The database’s Multi-AZ failover does not create an application-level retry policy; an IAM allow does not open a security group; an SQS visibility timeout does not guarantee exactly-once processing; and a healthy compute target does not prove the API’s user journey works.

## When to use it and tradeoffs

Choose services based on workload behavior and operational ownership, not slogans such as “serverless is always cheaper” or “managed means no operations.” A long-lived stateful workload may fit EC2 or a managed container platform better than request-scoped functions. A low-latency key lookup may fit DynamoDB; a relational transaction/query model may fit RDS or Aurora. SQS is a durable work queue, SNS is fan-out, and EventBridge is event matching/routing. Their retry, ordering, retention and delivery semantics differ.

Use regional redundancy, multi-AZ deployment, cross-Region recovery or global routing only after specifying the failure to survive and the recovery objective. These features increase cost and operational paths. Multi-AZ is not a backup; replication can reproduce deletion or corruption. A private endpoint reduces public exposure but still needs identity policy, DNS, route and security design.

## Current lifecycle and service selection notes

- Lambda Web Functions are a distinct direct-HTTP application model; Lambda Event Functions retain event-source and invocation semantics. At launch, Web Functions support Node.js runtimes, immutable revisions, endpoints, multiple concurrent requests per execution environment, scale-to-zero, streaming, VPC connectivity and selected multi-Region routing. Check current regional and feature availability before selecting them. [AWS announcement](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/) · [Core concepts](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-how-it-works.html)
- As of 2026-11-19, on-demand Lambda Event Functions support 30 minutes for synchronous, asynchronous, and event-source mapping invocations. Lambda Managed Instances support 30-minute synchronous calls and 90-minute asynchronous/ESM calls, except Amazon MQ and DocumentDB mappings remain at 15 minutes. Initialization remains 10 seconds on-demand and 15 minutes on Managed Instances. [AWS announcement](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-lambda-30-minute-ondemand-event-functions/) [Timeout configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html)
- AWS increased Lambda durable-function limits to 30,000 durable operations per execution and a 1 MB checkpoint payload in October 2026. A higher ceiling does not eliminate retry, idempotency, quota or workflow-design concerns. [Announcement](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-durable-gen-limit-increase/)
- AWS App Mesh reached full shutdown on 2026-09-30. It is not an available current managed service for new designs; for legacy references, verify the shutdown page and evaluate current supported architecture options without assuming a direct one-to-one successor. [AWS full-shutdown list](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)

## What later lessons cover

The concepts lesson develops policy evaluation, route reasoning, resilience, data contracts and service selection. Five reference lessons then explain every supplied name in their assigned inventory: account governance and identity; Regions, networking and edge; compute and containers; storage, databases and messaging; and operations, observability and cost. The practice lesson works through architecture and incident scenarios with solutions; the interview lesson gives concise answers and deeper follow-ups. You should understand this map before learning the product names one by one.
