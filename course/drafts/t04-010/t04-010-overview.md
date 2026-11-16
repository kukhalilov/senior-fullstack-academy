# raw SQL bulk updates and Dapper comparison — Big-picture orientation and mental model

This topic follows Microsoft's [SQL query guidance](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [set-based update/delete guidance](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), and the official [Dapper project documentation](https://github.com/DapperLib/Dapper). EF Core 11.0.0 shipped on 2026-11-10; the basic safety and change-tracking boundaries here remain important across releases.

## Problem and purpose

Most persistence code benefits from EF Core's model, LINQ translation, change tracking, and migrations. Some queries need exact SQL, database-specific syntax, or high-volume set-based operations. Dapper offers a smaller SQL-first mapper. The goal is to choose the least complex tool that still gives correct SQL, mapping, transactions, security, and maintenance.

## Plain-language mental model

EF Core normally translates a model-aware query and manages entity state. Raw SQL replaces part of the translation with SQL you own; the result still follows EF's mapping/tracking rules when queried through a DbSet. Set-based update/delete sends a database command immediately without loading entities. Dapper executes SQL on an ADO.NET connection and maps rows, while leaving unit-of-work behavior, relationship tracking, and migrations to your application.

An important safety distinction: values belong in database parameters; SQL structure such as table names and sort direction cannot generally be parameterized. Interpolated EF APIs turn value holes into parameters, whereas raw-string APIs insert SQL text. Dynamic identifiers therefore require a strict allow-list.

## How the parts fit together

Choose LINQ when it expresses the query clearly and produces acceptable SQL. Use EF raw SQL when translation cannot express the needed query and the result fits EF mapping. Use command execution for SQL that is not a query. Use `ExecuteUpdate`/`ExecuteDelete` for translated, set-based DML where immediate execution and unsynchronized tracked state are acceptable. Choose Dapper when SQL control and lightweight row mapping are more valuable than EF's unit-of-work behavior. If both access the same database, share an explicit connection and transaction when atomicity requires it.

## Concept map

```text
query need → LINQ translation → EF raw SQL → lower-level command/Dapper
             model + tracking   SQL ownership   SQL + explicit mapping

values → parameters; identifiers/keywords → validated allow-list
set-based write → executes now, outside SaveChanges tracking
multiple commands → explicit shared transaction if they must be atomic
```

## End-to-end walkthrough

Suppose an analytics endpoint needs a provider-specific ranking function and the result is a read-only DTO. First check if LINQ translation can express it. If not, use a parameterized scalar/unmapped query or a mapped keyless type, checking the required output column names. If SQL itself is simpler through Dapper, issue a parameterized query on the existing connection. For a bulk status change, consider `ExecuteUpdate`; include tenant/authorization and concurrency predicates, inspect affected-row count, and remember tracked entities remain stale. If the status update and Dapper audit insert must commit together, use the same connection and transaction explicitly. Add tests against the production provider.

## When to use it and tradeoffs

Raw SQL is justified when translation is unavailable, inefficient after measurement, or a database feature demands SQL. It transfers query correctness and maintenance responsibility to the team. Set-based DML reduces row loading and per-entity commands but bypasses normal tracking and SaveChanges hooks. Dapper is not automatically faster for every workload and does not eliminate SQL, mapping, or transaction design. Avoid introducing multiple data-access styles without clear ownership and shared integration tests.

## What later lessons cover

The concepts lesson builds a tool-selection and safety model. Reference lessons explain raw SQL APIs, bulk/update semantics, and Dapper mapping/transactions. Practice applies them to a reporting query and bulk update; interview lessons cover injection, stale tracking, atomicity, and choice rationale.
