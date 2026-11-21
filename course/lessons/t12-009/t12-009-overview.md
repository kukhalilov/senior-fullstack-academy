# End-to-end performance engineering for web applications — Big-picture orientation and mental model

## Problem and purpose

Performance is the speed and capacity users experience across a complete journey. A React screen can wait on a network, ASP.NET Core, EF Core, SQL Server, a payment service, or the browser main thread. Improving one piece does not guarantee that the journey improves. Senior engineers need a repeatable way to identify the real constraint, select a safe change, and prove the result.

## Plain-language mental model

Imagine a checkout as a relay race with queues. Each stage receives work, may wait, and passes work on. The user feels the full time, including waiting. A slow stage can hold up everything behind it; retries can add more runners to an already crowded queue. Browser rendering is also part of the race: the server may finish while the browser is still downloading code or doing main-thread work.

Performance engineering begins with the user’s goal and a representative workload. Measure the same journey before and after. A profile points to a likely bottleneck; controlled evidence confirms whether a fix helped.

## How the parts fit together

```text
user action → browser resources/render → network → API queue and middleware
            → application work → EF/SQL and dependencies → response
            → browser parse/render/hydration → visible result
```

Set a time and resource budget at each boundary. Follow a slow example with browser timing and distributed traces, then use the relevant deep tool: React Profiler, .NET runtime profile/counters, EF query logging and SQL execution plan, or load testing. Keep correctness, privacy, cost, and reliability constraints in the same decision.

## Concept map

1. Define user journey, target population, workload, and acceptable latency/error thresholds.
2. Measure distributions and locate time spent versus time waiting.
3. Identify the constrained resource or queue using evidence.
4. Form one optimization hypothesis and predict its tradeoffs.
5. Test with representative data, concurrency, and cache state.
6. Release safely, compare real users, and roll back if the journey regresses.

## End-to-end walkthrough

Suppose checkout p95 rises to 4.2 seconds. Browser traces show 1.5 seconds before the API request; server spans show 2.7 seconds, including 1.8 seconds in a payment dependency and 300 ms of SQL. First verify the trace follows representative slow users and the clock boundaries are clear. Improve the measured browser bottleneck and investigate payment timeout/retry behavior separately. Do not rewrite EF queries when the database is not the dominant stage. Protect payment retries with idempotency. Re-run comparable workloads, measure p95 and error rate, then canary and watch real-user data.

## When to use it and tradeoffs

Use the method for slow pages, overloaded APIs, rising database cost, latency regressions, capacity planning, and release decisions. Caching, compression, batching, concurrency, streaming, and precomputation each trade resources or freshness for speed. Optimization without a user goal or representative measurement can add complexity and make another part slower.

## What later lessons cover

References define workload and service goals, browser/React performance, ASP.NET Core runtime, EF Core/SQL, distributed dependencies/capacity, and measurement/release practice. Scenarios trace checkout and a production latency regression.

### Sources

- [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [SQL Server performance monitoring](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [web.dev Web Vitals](https://web.dev/articles/vitals)
