# architecture patterns multi-region tenancy and reliability — Reference: Cost unit economics

Sources: [HLD Handbook](https://hld.handbook.academy/), [FinOps Unit Economics capability](https://www.finops.org/framework/capabilities/unit-economics/), [FinOps Rate Optimization capability](https://www.finops.org/framework/capabilities/rate-optimization/), [FinOps principles](https://www.finops.org/framework/principles/), [FinOps Framework overview](https://www.finops.org/framework/).

## Scope and version

Cost unit economics connects technology spending with a meaningful product or organizational unit. This is a decision method, not a universal formula or claim that every cost can be allocated precisely. FinOps capabilities evolve; the linked framework pages describe the current capability definitions as checked on 2026-11-20.

## How this group fits the mental model

A monthly bill tells how much was spent, but not whether that spend created proportionate value. A unit metric relates cost to a unit of delivered service: cost per successful order, active tenant, case resolved, API request, stored GB-month, or model response meeting a quality threshold. The denominator should represent the outcome the product and engineering team actually cares about.

Unit metrics help teams compare architecture and operating choices over time within a defined scope. They are most useful when cost data and business usage data have consistent definitions and owners. A unit cost can rise because an architecture regressed, because low-value traffic increased, or because a beneficial security/reliability investment raised cost while improving user outcomes. Interpret it with quality, latency, availability, and value measures.

## Supplied names explained

- **Cost unit economics** — A family of metrics connecting technology costs and usage to the value or output of a product/service. Examples include cost per transaction, tenant, case resolved, API request, GB stored, or model token/response; choose a denominator aligned to organizational goals.

### Define a trustworthy metric

1. **Name the decision.** Is the question product pricing, architecture choice, efficiency trend, workload placement, or budget forecasting? Different decisions need different scope and time windows.
2. **Define the unit precisely.** Distinguish total requests from successful authorized requests, jobs enqueued from jobs completed, or registered users from active paying users. Specify cohort, exclusions, time basis, and quality threshold.
3. **Define cost inclusions.** Decide whether the numerator includes compute, storage, network egress, managed service charges, support, licenses, shared platform cost, engineering labor, and allocation overhead. Report direct-variable and fully loaded variants separately when useful.
4. **Join cost and activity data.** Allocate by tags, account/project, workload, tenant, or measured consumption; reconcile to provider bills. Document shared-cost allocation rules and missing-data treatment. False precision from weak attribution is worse than a clearly stated estimate.
5. **Trend within comparable scope.** Compare the same product/service, unit definition, and workload mix over time. Broad comparisons between unrelated products can be misleading.
6. **Pair cost with outcome/quality.** Monitor SLOs, throughput, customer value, and security/compliance. A cheaper design that increases failure rate or harms users is not necessarily more efficient.
7. **Use the result to run an experiment.** Identify a controllable driver, predict the unit-cost and outcome effect, change one meaningful factor, and compare against a baseline.

An illustrative equation is `unit cost = attributed technology cost during period / count of qualifying units delivered during period`. This is only meaningful if the numerator scope, denominator, time period, allocation, and qualifying outcome are documented. If the denominator is zero, negative, delayed, or not attributable, show the metric as unavailable rather than divide misleadingly.

## Cross-item comparison

| Metric type | Example | Best use |
|---|---|---|
| Resource-efficiency unit | Cost per GB-month, per million requests, per token | Engineering control over resource consumption and architecture |
| Business unit metric | Cost per successful order, case resolved, or active tenant | Product, finance, and leadership decisions about value and cost to serve |
| Rate metric | Discounted price per eligible resource-hour | Compare pricing/commitment models, not total efficiency alone |
| Total spend | Monthly service/cloud bill | Budget visibility and variance investigation |
| Outcome/quality metric | Successful transactions, SLO attainment, response quality | Interpret whether cost changes improve or damage delivered value |

## Examples

**API cost per successful request.** Attribute compute, database, cache, and egress cost to an API scope. Divide by successful authorized requests rather than all incoming requests, and track p95 latency and error SLI alongside it. A caching change lowers database cost but increases stale results, so the team compares savings against freshness and correctness requirements before declaring success.

**AI response economics.** Cost per token is a resource-efficiency signal, not product value. A product team might also measure cost per response that meets a task-specific quality threshold, completion rate, latency, and human-review burden. The cheapest model may require more retries or fail more tasks, raising cost per successful outcome.

**Shared platform allocation.** A central observability platform is used by many teams. The organization documents a stable allocation rule—such as measured ingest volume plus a shared base—and shows both direct usage and allocated shared cost. It does not present a tenant’s allocated estimate as an exact provider invoice line.

## Common mistakes

- Dividing a bill by a vague count such as “users” without defining active, paying, authorized, or successful.
- Omitting network, managed services, shared infrastructure, support, or failure/retry costs without saying so.
- Comparing unit costs across different product mixes, quality targets, or allocation rules as if they were directly equivalent.
- Optimizing resource cost per request while ignoring successful outcomes, user value, latency, availability, and security.
- Claiming that every cost reduction is a saving if the organization is still committed to pay for unused capacity.
- Reporting false precision when cost attribution or usage denominators are incomplete.
- Treating the unit-cost metric as a performance ranking instead of a signal to investigate drivers and make a decision.

## Knowledge checks with answers

1. **What makes a denominator useful?** It represents a clearly defined, meaningful unit of delivered output/value and can be measured consistently for the chosen scope.
2. **Why report cost per successful request instead of total incoming requests?** It connects cost to work that met the service’s success condition; dropped or failed requests should not make a system appear more efficient.
3. **Should a single unit metric include shared cost?** State the scope. Direct-variable and fully loaded variants can both be useful if the allocation method is transparent and not presented as exact when it is estimated.
4. **What should accompany a falling unit cost?** Relevant quality, user outcome, latency, reliability, and security signals so efficiency has not been gained by degrading the product.
