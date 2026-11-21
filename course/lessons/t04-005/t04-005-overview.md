# LINQ translation server client evaluation and IQueryable — Big-picture orientation and mental model

This lesson follows Microsoft's [querying overview](https://learn.microsoft.com/en-us/ef/core/querying/), the [client/server evaluation rules](https://learn.microsoft.com/en-us/ef/core/querying/client-eval), and the [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Problem and purpose

EF Core lets application code describe a data question in C# while asking a database provider to execute as much work as it can near the data. Understanding that boundary prevents accidental full-table reads, unsupported expressions, confusing execution timing, and provider-specific query bugs.

## Plain-language mental model

An EF query is initially a recipe, not a list of results. `IQueryable<T>` carries an expression tree plus a provider that can interpret it. Query operators extend that recipe. A terminal operation or enumeration executes it. The EF provider translates supported parts to database operations, materializes results, and may apply a permitted final projection step in .NET. `IEnumerable<T>` is a sequence to process locally; crossing to it can move subsequent work into memory.

## How the parts fit together

1. LINQ operators compose a query expression; values from local variables are usually extracted as parameters.
2. EF processes/caches a query shape and asks the selected provider to translate it.
3. The provider produces database-specific commands. Translation depends on provider, database version, type mappings, collation, and expression shape.
4. A terminal operation or enumeration executes the command and materializes values/entities.
5. A top-level projection can contain client-side computation; unsupported expressions in filters/orderings/joins generally fail rather than silently downloading the table.

Execution is deferred until consumption, but `ToListAsync` buffers the full result and `AsAsyncEnumerable` streams as consumed. Async I/O frees a thread while waiting; it does not make a context thread-safe or parallelize a single query.

## Concept map

```text
IQueryable + expression tree + provider
                 ↓ compose (deferred)
     translation / parameter extraction
                 ↓ terminal or enumeration
      provider command → database results
                 ↓ materialization
  optional top-level client projection

IEnumerable boundary / AsEnumerable → remaining operators run locally
```

## End-to-end walkthrough

```csharp
var query = db.Products
    .Where(p => p.IsPublished && p.Price >= minimum)
    .OrderBy(p => p.Name)
    .Select(p => new ProductCard(p.Id, p.Name, p.Price));

Console.WriteLine(query.ToQueryString()); // inspect provider SQL; does not execute it
var cards = await query.Take(50).ToListAsync(cancellationToken); // executes and buffers
```

The `Where`, `OrderBy`, projection, and `Take` remain query description until terminal enumeration. The provider translates them where supported. `ToQueryString()` is useful evidence but logging/integration tests are needed for actual command execution, parameters, plans, and database semantics.

## When to use it and tradeoffs

Keep selective filtering, sorting, joins, grouping, and projection on the server when the provider can translate them. Move to client processing only after a selective server query bounds the data. Buffer when the full result is modest and repeated access is needed; stream for large result sets when the consumer can process incrementally and connection/context lifetime is acceptable. Project to DTOs for read endpoints to reduce materialization and tracking.

EF Core 10 supports .NET 10 `LeftJoin`/`RightJoin` and a parameterized-collection mode with tradeoffs. EF Core 11.0.0 shipped 2026-11-10 and translates .NET 11 `FullJoin`, `MaxBy`/`MinBy`, adds GroupBy improvements, and prunes some redundant joins/order keys/casts. The [What's New page](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) still shows an outdated development banner; use the [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md) for release status. Each translation still requires provider verification.

## What later lessons cover

The first reference covers composition, execution, result contracts, and streaming. The second covers translation, client boundaries, query caching, and extensibility. Practice and interview lessons apply them to performance, correctness, and provider-specific debugging.
