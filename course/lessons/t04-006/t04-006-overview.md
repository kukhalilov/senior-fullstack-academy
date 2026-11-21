# loading navigation properties eager explicit lazy and N+1 — Big-picture orientation and mental model

This lesson follows Microsoft's [related-data loading guide](https://learn.microsoft.com/en-us/ef/core/querying/related-data/) and [single versus split query guidance](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries). EF Core 11's released SQL improvements are recorded in the [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Problem and purpose

An entity's navigation tells EF how related rows connect, but it does not decide when those rows are fetched. Loading choices shape SQL joins, round trips, data duplication, memory usage, consistency, and when hidden database work occurs.

## Plain-language mental model

There are four common choices: eager loading asks for related rows with the initial query; explicit loading asks later at a visible point; lazy loading fetches when code touches a navigation; projection asks the database directly for the read shape the caller needs. Single queries join results; split queries issue multiple related queries. Each strategy trades query count, row duplication, complexity, resource lifetime, and consistency.

## How the parts fit together

`Include`/`ThenInclude` describe an entity graph to fetch. `Filtered Include` narrows a collection but has tracking/fix-up caveats. `AutoInclude` can add implicit graph loading to every query that returns that entity. Explicit `Entry(...).Reference/Collection(...).LoadAsync()` keeps the fetch point visible, while `.Query()` can aggregate/filter without materializing the entire navigation. Lazy loading makes property access perform database I/O, potentially once per entity and causing N+1 behavior or work during serialization.

Joining multiple sibling collections in one SQL query can multiply rows (cartesian explosion) and repeat parent columns. `AsSplitQuery` reduces this duplication by issuing separate queries, but increases network round trips, may buffer intermediate results, and can observe concurrent changes across statements. EF Core 11 prunes some redundant to-one joins/order keys; it does not erase those basic split-query tradeoffs.

## Concept map

```text
Need related data?
  ├─ known up front → Include / projection
  ├─ conditional later → explicit Load / Query aggregate
  └─ transparently on access → lazy loading (hidden I/O risk)

Entity graph query:
  single SQL with joins → row multiplication/duplication
  split SQL statements → more round trips/buffering/consistency considerations
```

## End-to-end walkthrough

A page shows 25 orders with customer name and line-item count. Loading full order/customer/items graphs with sibling includes may return far more rows and columns than needed. A projection can select order ID, customer name, and a database-side item count directly. If details are shown only after a user expands one order, explicit loading at that interaction may be clearer. Lazy loading would hide the request and may run once for every rendered row.

## When to use it and tradeoffs

Prefer projection for read models that need a known subset. Use `Include` when an entity graph is genuinely needed for a unit of work. Use explicit loading for conditional follow-up data and `Query()` for a count/filter without loading everything. Use lazy loading only when hidden round trips are acceptable and measured; it is risky in APIs/serialization. Choose split query when measured join duplication is worse than extra round trips and consistency is addressed.

## What later lessons cover

Reference lessons cover eager/projection, explicit/lazy, and split-query choices. Practice works through SQL/round-trip accounting. Interview scenarios cover N+1, filtered includes, and consistency tradeoffs.
