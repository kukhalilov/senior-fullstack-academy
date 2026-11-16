# query performance indexes projection pagination split queries and compiled queries — Big-picture orientation and mental model

Microsoft's [efficient-querying guide](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [performance diagnosis guide](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis), and [EF Core 11 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) lead to one practical rule: reduce database work and transferred data before optimizing EF overhead. EF Core 11.0.0 shipped on November 10, 2026. Provider and workload determine whether any particular query is fast.

## Problem and purpose

A request can be slow because the database scans too many rows, reads too many columns, returns duplicate data, makes too many network trips, or spends avoidable work materializing objects. These costs interact, and EF is only one part of the path. Performance work observes LINQ, generated SQL, the database plan, transferred results, materialization, and application processing.

## Plain-language mental model

Think of a query as a delivery pipeline. The database finds and shapes rows, sends bytes through a connection, and EF turns those bytes into CLR values. A useful optimization removes work as early as possible: filter and project before transfer, make predicates match useful indexes, cap results, and avoid joins that multiply rows. Only then consider EF query compilation, context setup, tracking, or model startup.

## How the parts fit together

Indexes and query plans affect how the database finds rows. Projection and pagination affect rows and bytes crossing the network. Includes and query splitting affect relationship loading. Tracking and materialization affect client CPU and memory. Query caching and explicit compiled queries affect EF expression processing. Context pooling and compiled models target setup costs. Each choice has a counter-cost: indexes slow writes; split queries add commands and can observe inconsistent snapshots; no-tracking removes update behavior; pooling requires state hygiene.

## Concept map

```text
workload → measure baseline → inspect SQL and plan
         → reduce rows, columns, round trips, duplicate bytes
         → align filters/order with indexes
         → tune materialization/tracking
         → optimize EF overhead only when measured
```

## End-to-end walkthrough

Suppose a product-search endpoint returns 30 cards ordered by creation time and ID. Record latency, command count, database duration, returned rows/bytes, and allocations under representative data. Inspect SQL and the actual plan. Project only card fields, bound the page size, use fully unique `(CreatedAt, Id)` ordering, and use a seek predicate for next-page navigation with a supporting index. If the query includes sibling collections, compare row multiplication in one query against the extra commands of split loading. Examine tracking and materialization next. Only if EF-side overhead remains material should you benchmark compiled queries, context pooling, or a compiled model. Repeat the same measurement and inspect tail latency as well as averages.

## When to use it and tradeoffs

Use projection and bounded result sets for read paths. Prefer keyset pagination for sequential navigation; use offset where arbitrary page jumps matter. Design indexes from observed predicates and ordering, not every property. Split queries can reduce duplicated data but increase round trips and may need stronger isolation for one consistent view. Use no-tracking for read-only entity results. Treat pooling and compiled optimizations as measured choices.

## What later lessons cover

The concepts lesson develops the diagnosis workflow. Reference lessons cover result shape and pagination, indexes and SQL, and tracking/materialization. Practice applies the choices to a search endpoint; interview questions test tradeoff reasoning and evidence-based tuning.
