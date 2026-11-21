# AWS architecture identity networking compute and data services — Reference: Telemetry, audit, deployment automation, resilience, and cost governance

Sources: [Amazon CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html), [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html), [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html), [CloudFormation change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/framework.html), [AWS Well-Architected Cloud Foundations](https://docs.aws.amazon.com/wellarchitected/latest/framework/cloud-foundations.html), and [AWS Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/what-is-costmanagement.html).

## Scope and version

This reference explains all 68 supplied operational, observability, deployment, resilience, governance and cost terms. Exact service quotas, retention, feature availability and pricing vary by Region, account and configuration. Use these concepts to decide what evidence and control you need, then consult the live service guide for current settings.

As of the November 16, 2026 framework update, AWS Well-Architected has two sections: **Cloud Foundations** for organization-wide capabilities and **Cloud Workloads** for the six workload pillars. Cloud Foundations covers multi-account environment, identity and access, central observability, inventory/resource management, security/compliance, cloud financial management, and networking/connectivity. These capabilities typically have shared platform ownership; workload teams still own service-specific architecture and operations.

## How this group fits the mental model

Operations converts a design into a system that can be changed and diagnosed safely. Metrics answer “how much/how often?”, logs answer “what happened?”, traces answer “where did this request spend time?”, audit records answer “which AWS API principal changed what?”, and configuration evaluation answers “what does this resource look like against a rule?” Health notifications and synthetic checks add external/provider context. Cost controls explain the financial side. No single dashboard proves correctness.

## Supplied names explained

### Signals, audit and configuration evidence

- `Amazon CloudWatch` — AWS monitoring and observability service for metrics, alarms, logs, dashboards and related capabilities. Data is scoped by account/Region and service integration; metric presence, log retention and alert action must be configured.
- `CloudWatch metric` — Timestamped numeric measurement with namespace, name and dimensions. Dimensions create separate time series and can increase cardinality/cost; choose labels that support operational questions without embedding unbounded IDs.
- `CloudWatch alarm` — State machine evaluating a metric or expression over a period/window and invoking configured actions. Missing data, evaluation periods, thresholds and action permissions affect behavior; test both alarm and recovery paths.
- `CloudWatch Logs` — Managed log ingestion, storage, retention and query service. Log groups, streams, resource policies, KMS settings and retention are separate controls; ingestion without retention limits can create surprise cost.
- `CloudWatch Logs log group` — Collection boundary for log streams with retention, encryption and access settings. Set retention intentionally and constrain writers/readers; retention is not the same as backup or immutable audit protection.
- `CloudWatch Logs log stream` — Ordered sequence of log events associated with a source such as an instance/container. Streams are not a cross-service trace; include structured fields and correlation identifiers for querying.
- `CloudWatch Logs Insights` — Interactive query capability for supported CloudWatch log groups. Bound time range, filter early and understand scanned data/cost; queries do not automatically correlate logs from different services without shared context.
- `CloudWatch agent` — Host agent collecting guest OS metrics/logs and optionally traces from EC2 or other supported environments. Install/configure least privilege, control collection volume and maintain agent versions; AWS service metrics alone do not show guest-level disk/memory detail.
- `CloudWatch dashboard` — Shared visual layout of metrics/log widgets across resources/accounts/Regions as configured. A dashboard needs owners, useful time ranges and links to runbooks; it is not a substitute for alerts or incident command.
- `CloudWatch Synthetics canary` — Scheduled script/browser check exercising an endpoint or journey and recording availability/latency/artifacts. Design credentials and test data safely; a canary only proves its particular route, region, script and time.
- `AWS CloudTrail` — Service recording AWS account/API activity for governance, compliance and investigation. Management events, data events and Insights have different coverage/cost; enable the event categories and delivery protections needed by your threat model.
- `CloudTrail event history` — Recent management-event history available through console/API for an account/Region. It is a convenience view, not a durable enterprise audit archive; configure protected trails or event data stores with required retention.
- `CloudTrail trail` — Configuration that delivers selected account/Region events to destinations such as S3 and CloudWatch Logs. Multi-Region/organization scope, data selectors, encryption, log-file validation and bucket permissions determine actual coverage.
- `AWS Config` — Service recording resource configuration changes and evaluating resources against rules. It helps identify drift/compliance state, not whether a workload is healthy or a permission is safe in every runtime path.
- `AWS Config rule` — Managed or custom evaluation of resource configuration against a desired condition, on change or schedule. Rules need correct scope/remediation design; “compliant” means the rule’s condition passes, not overall compliance certification.
- `AWS Config conformance pack` — Collection of Config rules and remediation actions deployable as a compliance package. Review its rule scope, parameter values and service coverage before treating its score as a meaningful control result.
- `AWS X-Ray` — Distributed tracing service collecting trace segments for instrumented AWS applications. Traces help analyze request paths and latency but depend on instrumentation/context propagation and may be sampled.
- `AWS Distro for OpenTelemetry (ADOT)` — AWS-supported distribution of OpenTelemetry components/instrumentation for exporting telemetry to AWS and other compatible backends. It does not make every signal/vendor integration automatic; configure SDK/collector pipelines, sampling and resource attributes deliberately.
- `Amazon Managed Service for Prometheus` — Managed Prometheus-compatible metrics service for scraping/querying metrics from supported environments. Workspace boundaries, ingestion/query quotas, retention, labels and remote-write capacity need design.
- `Amazon Managed Grafana` — Managed Grafana workspaces for dashboards and data-source integration. Authentication, workspace permissions, data-source roles and dashboard ownership remain security and operations responsibilities.
- `AWS Health Dashboard` — View of AWS service issues, planned changes and account-specific events. Account-specific visibility depends on support plan and service features; configure notification paths and evaluate actual workload impact.
- `AWS Health event` — AWS-published issue, maintenance or account notification with affected service/Region/resources and lifecycle. It is a signal to assess, not proof that every application instance is impacted or that recovery is complete.

### Fleet operations and infrastructure delivery

- `AWS Systems Manager` — Operations service family for managed nodes, parameters, automation, inventory, patching and session access. Features require managed-node prerequisites, IAM permissions and network connectivity; SSM does not remove change control.
- `Systems Manager Session Manager` — Browser/CLI session access to managed nodes without opening inbound SSH/RDP ports. Use session logging, least-privilege start-session controls and secure egress; connectivity and agent prerequisites still apply.
- `Systems Manager Parameter Store` — Hierarchical configuration/parameter management with standard and advanced parameters and optional encrypted SecureString values. It can centralize settings, but rotation, throughput and secret lifecycle differ from Secrets Manager.
- `Systems Manager Fleet Manager` — Console capability for viewing/operating supported managed nodes and fleet data. Access remains privileged and audit-worthy; it is an operations interface, not a replacement for patch baselines or desired-state configuration.
- `AWS Systems Manager Automation` — Runbook capability for controlled operational tasks across AWS resources and managed nodes. Constrain assume roles, parameters, concurrency and blast radius; make automation idempotent and include approval/rollback controls for risky actions.
- `AWS CloudFormation` — Declarative infrastructure-as-code service managing stacks of AWS resources. Templates encode desired configuration, while drift, immutable property replacement, provider/API limits and data retention still require review.
- `CloudFormation template` — JSON/YAML resource declaration with parameters, mappings, conditions, outputs and intrinsic functions. Make inputs validated, secrets external, and dependency/replacement behavior explicit; a syntactically valid template can still have dangerous effects.
- `CloudFormation stack` — Managed collection of resources created/updated/deleted from a template. Stack deletion can delete resources unless retention policies protect them; nested stacks and import/drift behavior affect lifecycle.
- `CloudFormation change set` — Preview of proposed resource changes before executing an update. It reveals many replacements/modifications but is not a proof of runtime safety; review data loss, IAM, network exposure, dependencies and application compatibility.
- `AWS Cloud Development Kit (AWS CDK)` — Infrastructure-as-code framework expressing cloud resources using supported programming languages and synthesizing CloudFormation templates. Abstraction does not erase the resulting template; inspect synthesized output, bootstrap roles and asset publishing.
- `AWS CDK construct` — Reusable infrastructure component at an abstraction level such as L1, L2 or L3. Higher-level defaults can be convenient but may conceal security, network or replacement choices; understand escape hatches and synthesized resources.
- `AWS CDK bootstrap` — Account/Region setup that provisions resources/roles used by CDK deployments and asset publishing. Review bootstrap template trust and permissions; bootstrapping another account is a security-sensitive administrative action.
- `AWS CodeBuild` — Managed build/test service running project commands in ephemeral or configured environments. Buildspec, image, secrets, cache, network and role determine behavior; pin toolchain/dependencies and publish immutable artifacts.
- `AWS CodeDeploy` — Deployment service coordinating releases to supported compute targets using deployment groups and strategies. Health alarms, lifecycle hooks and rollback settings matter; deployment success is not equivalent to user-visible correctness.
- `AWS CodePipeline` — Workflow service connecting source, build, approval and deployment actions. Stages/actions require scoped roles and artifacts; protect pipeline definitions because pipeline compromise can become production compromise.
- `AWS CodeArtifact` — Managed artifact/package repositories for supported package ecosystems. Upstream connections and retention help dependency supply-chain management; restrict publishing and pin/verify dependency provenance.
- `AWS CodeConnections` — Managed connections between AWS developer tools and supported external providers for source integrations. Repository access and installation scope are security boundaries; rotate/revoke connections when ownership changes.

### Architecture quality and resilience

- `AWS Well-Architected Tool` — Workload review and milestone tracking service using the Well-Architected question sets. It organizes analysis and improvement plans; completing questions does not certify a workload or replace evidence/tests.
- `AWS Well-Architected Framework` — Guidance organized into Cloud Foundations and Cloud Workloads. Cloud Workloads retains six pillars; Cloud Foundations separately covers seven organization-level capabilities. Treat it as a structured design/review guide, not a mandated single reference architecture.
- `Operational excellence pillar` — Ability to operate and evolve workloads safely through observability, automation, response and continuous learning. It includes preparation and improvement, not merely runbooks.
- `Security pillar` — Protection of workloads and data through identity, detection, infrastructure protection, incident response and application security. Security is a property of the system and its process, not one firewall product.
- `Reliability pillar` — Ability to recover from failures and meet workload demand. It includes foundations, change management, failure management and tested recovery; multi-AZ alone does not prove reliability.
- `Performance efficiency pillar` — Efficient use of compute, storage and network resources as workload demand changes. Measure representative workloads and review technology choices; maximum instance size is not automatically optimal.
- `Cost optimization pillar` — Ability to achieve business outcomes at the lowest appropriate cost over lifecycle. Include monitoring, usage-aware selection, pricing models and ongoing optimization without sacrificing needed resilience/security.
- `Sustainability pillar` — Minimizing environmental impact through efficient use of resources and workload design. Measure demand, utilization and architecture choices; it is broader than choosing a low-cost instance.
- `AWS Fault Injection Service (AWS FIS)` — Managed fault-injection experiments to test resilience under controlled conditions. Define hypotheses, permissions, stop conditions, blast-radius limits and observability before running an experiment; it is not a production outage drill by default.
- `AWS Backup` — Centralized policy-based backup management for supported AWS services and workloads. Coverage, recovery points, vault controls, cross-account/Region copies and restore validation must match RPO/RTO.
- `AWS Backup vault` — Logical container for recovery points with access/encryption and optional Vault Lock controls. Separate backup administration from production deletion authority and verify retention/immutability configuration.
- `AWS Backup plan` — Rules defining backup schedules, lifecycle and target vault/copy settings for selected resources. Resource assignment tags/IDs and service support determine coverage; a plan existing does not prove every critical resource is protected.
- `AWS Elastic Disaster Recovery` — Block-level replication and recovery service for supported source servers into AWS. Recovery requires staging, launch settings, network/identity dependencies, application validation and practiced cutover; replication alone is not a tested DR plan.

### Cost and quota governance

- `AWS Cost Explorer` — Cost/usage analysis and forecasting interface/API for supported billing data. Billing data is delayed and grouping/granularity depend on configuration; use it to find patterns, not as a real-time meter.
- `AWS Budgets` — Cost, usage, reservation or Savings Plans budget thresholds with notifications/actions. Alerts may arrive after spend and budgets are not universal hard caps; define recipients and response actions.
- `AWS Cost and Usage Report (CUR)` — Detailed billing and usage data delivered for downstream analysis, with selectable content and update behavior. Data volume/schema and refresh cadence need storage/query planning; reconcile it to billing context before accounting decisions.
- `AWS Cost Anomaly Detection` — Monitoring/alerting that detects unusual spend patterns using historical behavior and configured monitors/subscriptions. Detection can lag and can produce noisy findings; it identifies anomalies, not root cause or automatic containment.
- `AWS Pricing Calculator` — Estimate tool for modeled AWS service usage. Region, discounts, traffic, taxes, support and operational assumptions affect reality; calculate alternatives with explicit workload assumptions.
- `AWS Compute Optimizer` — Recommendations for sizing/configuration using observed utilization and service telemetry. Recommendations depend on lookback/metric quality and do not know every latency, resilience or licensing constraint; test before resizing production.
- `AWS Trusted Advisor` — Checks and recommendations across supported cost, security, fault-tolerance, performance and service-limit areas. Coverage depends on account/support/service context; use findings as evidence to investigate rather than an audit certificate.
- `AWS Savings Plans` — Discount commitment for eligible compute usage over a term, with plan-specific flexibility. Commitment is billed regardless of utilization; analyze stable baseline and keep uncertain bursts uncommitted.
- `Reserved Instances` — Billing/usage discount commitment for eligible services, with engine/instance/scope/exchange rules. It is not necessarily a capacity reservation unless the specific offering says so; unused commitments waste money.
- `EC2 Spot pricing` — Variable discounted price for spare EC2 capacity that can be interrupted. Spot is a compute availability/cost choice requiring interruption handling and diversification, not a guaranteed long-term price.
- `Data transfer out to internet` — Metered egress traffic from AWS to public internet, priced by service/Region/tier and current price rules. Response payloads, media and repeated downloads can dominate; caching/compression and path choices help but must preserve requirements.
- `Inter-Availability Zone data transfer` — Traffic crossing AZ boundaries that can incur charges depending on service/path. Replicas, NAT gateways, load balancers and chatty service calls can create cross-AZ data transfer; estimate traffic topology, not just resource count.
- `Cross-Region data transfer` — Traffic/data replication between Regions with transfer and service-specific charges. Cross-Region resilience creates both storage/request and transfer cost; price a realistic failover/replication pattern.
- `AWS Service Quotas` — Service for viewing/requesting adjustable limits and tracking selected quota utilization. Limits can be regional/account/service-specific and changes may require approval; capacity planning should include headroom and load tests.
- `AWS Organizations tag policy` — Organization policy defining standardized tag keys/allowed values and reporting compliance for supported resources. It does not automatically tag every resource or enforce every API operation; combine with provisioning controls and audits.
- `Cost allocation tag` — Tag activated for billing allocation and used to group eligible costs by resource metadata. Activation is required and billing data can lag; shared/untagged resources still need allocation rules.

## Cross-item comparison

| Signal/control | Best question | Blind spot |
|---|---|---|
| CloudWatch metrics/alarms | Is a numeric service condition breaching? | Causality and missing instrumentation |
| CloudWatch Logs | What events were emitted? | Cross-service causality without trace context |
| X-Ray/OpenTelemetry trace | Which spans/dependencies dominate a request? | Uninstrumented or unsampled work |
| CloudTrail | Which AWS API action was called by whom? | Application business events unless separately logged |
| AWS Config | Does resource configuration match a rule? | Runtime user experience and all security semantics |
| AWS Health | Is AWS reporting an affecting service event? | Whether the workload is actually unhealthy |
| Synthetic canary | Can this configured external path complete? | Every user flow and region/client profile |
| Backup plan | Are recovery points scheduled? | Whether restored service meets objectives until tested |
| Budget/anomaly finding | Is modeled/observed spending near an alert condition? | Immediate hard spend prevention/root cause |

CloudFormation and CDK share a deployment outcome: CDK synthesizes infrastructure definitions that CloudFormation applies. A change set is a preview, not a risk-free guarantee. CodeBuild builds, CodePipeline orchestrates stages, CodeDeploy handles selected deployment targets, CodeArtifact hosts packages, and CodeConnections enables source/provider integration; these roles can be composed but are not synonyms.

## Examples

### Define a useful production alert

Start with user impact: for example, sustained API failure rate or latency over an agreed window. Emit request metrics and traces with bounded dimensions, store structured logs with request/correlation IDs, and alert through a CloudWatch alarm to an owned action path. Attach a runbook explaining impact, recent changes, diagnostic queries, safe mitigations and escalation. Add a CloudWatch Synthetics canary from a representative public path. Test alarm delivery and recovery; keep CloudTrail events and Config findings available for change/security investigation.

### Make infrastructure changes reviewable

Keep a version-controlled template or CDK source, synthesize it, inspect the resulting CloudFormation, and create a change set against the intended stack. Review replacements/deletions, IAM changes, public paths, data retention and cross-stack dependencies. Deploy the same artifact through environments with scoped roles and staged approval. Monitor app-level health after deployment and define rollback; CloudFormation update success alone does not prove an application release is healthy.

### Test backup recoverability

Pick a critical database and write down its RPO and RTO. Confirm the AWS Backup plan selects it, copies recovery points to protected vaults as required, and keeps the needed retention. In a separate controlled account/VPC, restore a recovery point, recover application configuration and identity/network dependencies, validate data and business workflows, and time the process. Record gaps; replication or a green backup-job status is not the restore test.

### Attribute spend and react

Activate consistent cost allocation tags, export detailed CUR data if the team needs resource-level analysis, and use Cost Explorer for broad patterns. Set a budget with named recipients and a runbook, then review anomaly findings and service quotas. A sudden spike may be a legitimate load increase, egress, cross-AZ chatter or a leaked loop; use metrics/logs and deployment history to find cause. A budget notification is not a guarantee that service usage stops.

## Common mistakes

- Alerting on every available metric instead of defining user-impact thresholds, owners and actions.
- Assuming a metric/log/trace exists without enabling the integration and retention needed.
- Treating CloudTrail management event history as a complete audit/data-access archive.
- Calling a Config “compliant” resource secure or healthy without understanding the rule.
- Treating a synthetic canary as a complete test of every real client journey.
- Treating a change set as a full simulation of runtime and data consequences.
- Giving CDK bootstrap or pipeline roles account-wide administration without need.
- Enabling backups but never restoring; putting backups under the same deletion authority as production.
- Assuming cost budgets are caps, tags apply automatically, or billing data is real-time.
- Deleting resources to reduce cost without checking backup, retention and disaster recovery needs.

## Knowledge checks with answers

1. **What does CloudTrail answer that CloudWatch usually does not?** Which AWS API principal performed a configured management/data event and when; CloudWatch focuses on telemetry and app/service behavior.
2. **What does AWS Config evaluate?** Recorded resource configuration against rules/conformance packs, not complete runtime correctness.
3. **Why is a change set not a safety proof?** Runtime behavior, data effects, application compatibility and some dependencies still require human analysis and tests.
4. **What is required for a useful alert?** Meaningful signal/window/threshold, owner, notification/action, runbook and tested delivery/recovery path.
5. **How do backup plans differ from restore tests?** A plan schedules recovery points; only a restore drill demonstrates recovery time, data integrity and application usability.
6. **Does an AWS Budget stop spending at its threshold?** Not universally; it sends notifications or configured actions, while usage and billing timing can continue.
7. **Why activate cost allocation tags?** Resource tags are not necessarily included in cost allocation until activated, and untagged/shared costs still need attribution.
