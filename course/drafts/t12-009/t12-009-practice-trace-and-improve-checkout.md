# End-to-end performance engineering for web applications — Problem: Trace and improve a slow checkout journey

## Goals

Build an evidence-led plan spanning browser, ASP.NET Core, EF Core, SQL Server, and a payment dependency. Preserve payment correctness and verify tail latency.

## Worked example

Checkout p95 is 4.2 seconds: browser work before the API is 1.5 seconds; server trace is 2.7 seconds; payment p95 is 1.8 seconds; SQL p95 is 300 ms. The payment call and browser path merit immediate investigation. Averages should not replace the p95 target.

## Exercises

1. Define the user-facing SLI and workload details needed for a baseline.
2. Draw which measurements are sequential, parallel, and nested.
3. Identify what evidence you need before changing the payment timeout or retry policy.
4. Choose one browser experiment and one backend/data experiment.
5. Describe a safe canary and rollback criterion.

## Progressive hints

1. Follow representative slow checkouts through a trace and browser waterfall.
2. Do not add nested span durations to parent duration; determine critical path.
3. A timeout can occur after a payment provider accepted a charge.
4. Inspect query shape, rows, round trips, plan, and waits before EF micro-optimizations.
5. Monitor p95/p99, errors, duplicate charges, resource use, and cost during rollout.

## Complete solutions

Define a completion SLI for checkout from user submit to confirmed result, with p95/p99 and error/duplicate-charge constraints for a stated traffic mix and device/network population. Capture browser traces and correlated server traces for slow and normal cases. Separate the 1.5-second browser portion into resource/render/main-thread work. For the server, distinguish queue wait, application time, payment wait, SQL, and serialization. Since payment accounts for much of the backend tail, inspect provider latency and retry behavior; use a stable idempotency key for repeated charge attempts. Set an end-to-end deadline and smaller dependency budget, but avoid shortening a timeout in a way that increases ambiguous outcomes. For SQL, validate actual plans, parameter distribution, waits, rows, and round trips before changing EF query shape. Optimize one measured part at a time. Repeat under equivalent load/data/cache state. Canary the change and monitor user latency, errors, charges, SQL resource use, queue depth, and cost; rollback when a predeclared threshold is exceeded.

## Tests and edge cases

- Payment provider accepts charge but response times out; retry must not create duplicate charge.
- Slow SQL parameter and fast parameter select different query behavior.
- Warm browser cache hides critical asset delay; compare cold and warm sessions.
- Load surge causes queue growth despite moderate average CPU.
- A change improves p95 but worsens error rate or cost per successful checkout.

## Reflection questions

1. Which measurement represents user experience, and which diagnoses a particular layer?
2. What would make the p95 before/after comparison invalid?
3. How do you distinguish actual payment failure from ambiguous response loss?

### Sources

- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [SQL Server performance monitoring](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
