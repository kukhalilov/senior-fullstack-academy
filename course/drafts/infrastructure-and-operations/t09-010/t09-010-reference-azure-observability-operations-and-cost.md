# Microsoft Azure architecture identity networking compute and data services — Reference: Monitoring, diagnostics, deployment and financial operations

Sources: [Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/overview), [Azure Monitor metrics](https://learn.microsoft.com/en-us/azure/azure-monitor/metrics/data-platform-metrics), [Diagnostic settings](https://learn.microsoft.com/en-us/azure/azure-monitor/platform/diagnostic-settings), [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview), [Kusto Query Language](https://learn.microsoft.com/en-us/kusto/query/), [Azure Monitor OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable), [Azure Cost Management](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management), [Azure Advisor](https://learn.microsoft.com/en-us/azure/advisor/advisor-overview), and [Azure DevOps service connections](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/connect-to-azure).

## Scope and version

This lesson covers Azure observability, operational controls, deployment identity and cost governance at a service-concept level. Signal retention, regional support, pricing and product lifecycle change; use current documentation and your subscription's actual configuration. Current concepts were checked 2026-11-20.

## How this group fits the mental model

Operations converts workload behavior into signals, alerts and repeatable response. Metrics show numeric trends; logs explain events/details; traces connect operations across components. Azure resource control-plane events differ from application/data-plane logs. Cost needs telemetry and ownership metadata too: a technically healthy system can still be wasteful or exceed its budget.

## Supplied names explained

### Azure Monitor signals and Application Insights

- `Azure Monitor` — Azure platform for collecting, analyzing and acting on telemetry from Azure and connected environments. It includes several data stores/tools, not one automatically complete application monitor.
- `Azure Monitor metrics` — Numeric time-series data with timestamps/dimensions and aggregation. Retention, cardinality, granularity and metric namespace vary by service.
- `Azure Monitor logs` — Records stored in Log Analytics or supported destinations and queried with KQL. Ingestion schema, retention and cost depend on table/plan/configuration.
- `Azure Monitor alert rule` — Condition/action evaluation over metrics, logs, activity or other supported signals. Choose a signal that represents user impact and avoid noisy thresholds.
- `Azure Monitor metric alert` — Evaluates time-series conditions with aggregation, dimensions and evaluation window. High-cardinality dimensions can multiply alert series.
- `Azure Monitor log alert` — Runs a scheduled KQL query and creates alerts from returned records/aggregations; query cadence and result cardinality affect detection time/cost.
- `Azure Monitor action group` — Reusable notification/automation destinations invoked by alert rules. Verify receiver permissions and test escalation paths.
- `Azure Monitor workspace` — Data/management boundary used by specific Azure Monitor data products, including managed Prometheus; it is distinct from Log Analytics workspace.
- `Log Analytics workspace` — Log data store/workspace boundary for KQL querying, access, retention and table configuration; choose region/access/retention deliberately.
- `Kusto Query Language (KQL)` — Query language for filtering, aggregating and joining telemetry tables. Queries should bound time ranges and control scan volume.
- `Azure diagnostic setting` — Resource configuration selecting supported platform logs/metrics and destinations. Creating a setting does not retroactively recover data from before export.
- `Azure Monitor diagnostic setting destination` — Destination such as Log Analytics, Storage or Event Hubs for selected resource telemetry. Destination region, retention and access are separate decisions.
- `Azure resource log` — Platform-generated data-plane/service diagnostic record for a resource category; enable diagnostic settings and consult the service's category/schema list.
- `Azure Activity Log alert` — Alert over subscription control-plane events or service-health activity; it is not an application log alert.
- `Azure Activity Log` — Subscription-level control-plane event history; export if retention/cross-subscription analysis needs exceed its built-in availability.
- `Application Insights` — Application monitoring experience built on Azure Monitor for request, dependency, exception, trace and performance telemetry.
- `Workspace-based Application Insights` — Application Insights resource storing telemetry in a linked Log Analytics workspace, aligning access/retention/query management with that workspace.
- `Application Insights availability test` — Synthetic check from configured locations/conditions that tests an endpoint. It validates the test's request path, not every user journey or private network.
- `Application Insights distributed trace` — Correlated telemetry for a request across application/dependency spans using trace context. Missing instrumentation/propagation breaks the end-to-end graph.
- `Application Insights sampling` — Reduces telemetry volume while attempting to preserve representative/correlated items; sampling can hide rare events and affect counts.
- `Application Map` — Visualizes application components/dependencies from telemetry. It reflects collected/instrumented signals and should not be treated as a complete architecture inventory.
- `Azure Monitor OpenTelemetry Distro` — Azure configuration/distribution of OpenTelemetry instrumentation/export for supported languages, integrating app signals with Azure Monitor. Instrumentation and sampling choices remain app responsibilities.
- `Azure Monitor managed service for Prometheus` — Managed collection/storage/query support for Prometheus metrics for supported Kubernetes environments; configure scraping, labels, access and retention.
- `Azure Managed Grafana` — Managed Grafana workspace integrated with Azure data sources/access controls; dashboards still require sound queries, ownership and service health.
- `Azure Monitor autoscale` — Rule/schedule-based scaling for supported Azure resources based on metrics/time; it does not automatically scale every service or ensure downstream capacity.

### Service health, resource health and operations

- `Azure Service Health` — Personalized view of Azure service incidents, planned maintenance and advisories affecting selected subscriptions/regions.
- `Azure Service Health service issue` — Provider-reported event potentially affecting a service/region/subscription. Configure alerts and assess actual workload impact.
- `Azure Resource Health` — Resource-level availability/health signals and history for supported resources; it complements, not replaces, app-level health checks.
- `Azure Resource Health resource status` — Resource status such as available/degraded/unavailable with platform/user-initiated cause details when provided.
- `Azure Update Manager` — Centralized assessment/scheduling of updates for supported Azure, on-premises and Arc-enabled machines; it is OS patch management, not app release automation.
- `Azure Automation` — Runbook/process automation and configuration capabilities for Azure/hybrid operations. Secure credentials, scope runbook identity and make actions idempotent.
- `Azure Arc` — Management/control-plane extensions for supported resources outside Azure, such as on-premises/multicloud servers or Kubernetes; it does not make their underlying compute an Azure region.

### Cost and architecture review

- `Azure Cost Management` — Tools/data for analyzing, allocating and governing Azure spending across scopes.
- `Azure Cost Analysis` — Views for grouping and exploring recorded cost by service/resource/tag/time; billing data can lag and forecasts are estimates.
- `Azure cost budget` — Threshold/forecast budget that can notify or trigger configured actions; it is not a universal hard spending cap.
- `Azure cost alert` — Notification tied to a budget/cost threshold; configure recipients and act before the period closes.
- `Azure cost allocation tag` — Tag key/value used to assign shared resource costs to teams/products. Coverage and inheritance must be governed; tags do not automatically make every bill attributable.
- `Azure reservation` — Capacity/usage commitment discount for eligible resources over a term, with scope/exchange/utilization rules. An unused reservation can waste money.
- `Azure reservation scope` — Defines where a reservation benefit is applied (such as shared or selected subscription/resource group scope) subject to offer-specific options.
- `Azure savings plan for compute` — Hourly spend commitment for eligible compute usage over a term, applying across supported services more flexibly than a specific capacity reservation; terms and utilization matter.
- `Azure savings plan coverage` — Eligible usage matched to the hourly commitment. Unused commitment still incurs cost; covered usage beyond commitment may remain pay-as-you-go.
- `Azure Advisor` — Recommendation service for reliability, security, performance, operational excellence and cost in supported areas; validate the recommendation against architecture/context.
- `Azure Advisor recommendation` — Specific suggested action/resource finding with potential impact; it is decision support, not automatic proof of current application needs.
- `Azure Pricing Calculator` — Estimate tool for selected Azure services/usage assumptions. It does not know your negotiated agreement, actual load, taxes or all operational costs.
- `Azure Total Cost of Ownership (TCO) Calculator` — Estimation tool comparing on-premises assumptions with cloud scenarios; input assumptions determine the result.
- `Azure Well-Architected Review` — Structured workload review across architecture pillars. It identifies discussion points and gaps; it is not certification or a substitute for testing.

### Deployment environment and workload identity

- `Azure deployment environment` — Self-service development/test environment provisioned from approved templates/catalogs, typically associated with Azure Dev Center capabilities; it is distinct from a production deployment slot.
- `Azure DevOps pipeline service connection` — Pipeline configuration connecting a project to Azure/service targets with selected authentication/permissions; manage approvals, scope and secret/credential lifecycle.
- `Azure workload identity federation in deployment pipeline` — OIDC-based trust allowing a supported pipeline to exchange its job token for short-lived Entra/Azure credentials without a stored client secret. Restrict issuer/subject/audience and grant only target-scope roles.
- `Azure DevOps workload identity federation` — Federated service-connection authentication using a DevOps-issued OIDC token and a Microsoft Entra federated identity credential; constrain the trusted organization, project, pipeline/service connection and Azure role scope.

## Cross-item comparison

| Signal/control | Best question it answers | It does not answer |
|---|---|---|
| Metrics | How is a numeric measure changing over time? | Why did an individual request fail? |
| Logs | What records/events occurred and with what fields? | Full causality across services without trace context |
| Traces | Which spans/dependencies contributed to an operation? | Complete system behavior if instrumentation/sampling is missing |
| Activity Log | Which Azure management operation or provider event occurred? | Application data-plane behavior |
| Service Health | Is Microsoft reporting a broader service issue/maintenance? | Whether this specific app is healthy |
| Resource Health | What platform-level state is reported for this resource? | End-user service quality |
| Reservation | Discount for eligible, often capacity-specific usage | Flexible discount across every compute type |
| Savings plan | Discount against eligible hourly compute spend | Guaranteed capacity or unlimited discount |

## Examples

For an API objective, emit request duration, errors, dependency failures and trace context. Put diagnostic settings on supported dependencies for resource logs, route them to a governed workspace, and define an alert on an actionable error/latency condition. Use an availability test for an external path and service-health/resource-health alerts for platform issues. Correlate the signals during an incident and preserve a runbook with owner, user impact, rollback/recovery and escalation steps.

For a CI pipeline, use a federated service connection and constrain the Entra trust to the intended repository/branch/environment. Scope the deployment role to the resources it manages. Run with approvals for production, write activity logs to the right retention destination, tag resources and use Cost Analysis to compare actual spending after release.

## Common mistakes

- Assuming Azure Monitor collects every resource log/metric without diagnostic/instrumentation configuration.
- Treating Log Analytics workspace and Azure Monitor workspace as the same service boundary.
- Treating Activity Log as a data-plane or application event log.
- Building alerts from noisy infrastructure measures without a user impact/recovery action.
- Assuming Application Map contains uninstrumented or unsampled dependencies.
- Leaving diagnostic logs unretained, broadly accessible or unnecessarily high-volume.
- Treating Service Health as a replacement for checking the app's own health.
- Assuming a budget automatically blocks all future spend.
- Buying a reservation/savings plan before measuring eligible stable usage and utilization.
- Using long-lived pipeline secrets where a scoped federated identity is supported.
- Treating Azure DevOps environment, App Service slot and Azure deployment environment as the same concept.

## Knowledge checks with answers

1. **What does a diagnostic setting do?** Selects supported resource logs/metrics and sends them to configured destinations; it does not backfill earlier events.
2. **When use Application Insights distributed traces?** To correlate an operation across instrumented app components/dependencies when trace context is propagated.
3. **Is an Azure budget a spending cap?** Usually it is an alert/monitoring mechanism. Enforce controls separately and account for billing-data delay.
4. **How do Service Health and Resource Health differ?** Service Health reports provider incidents/maintenance; Resource Health reports a specific resource's platform availability state.
5. **Why prefer workload identity federation in a pipeline?** It avoids storing a long-lived client secret, while restricting the trusted repository/job claims and Azure roles.
6. **What is the difference between a reservation and savings plan?** Reservation discounts eligible selected usage/capacity more specifically; savings plan applies a compute spend commitment across eligible usage. Both need utilization review.
