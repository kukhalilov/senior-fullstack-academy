# LINQ translation server client evaluation and IQueryable — Reference: Translation, unsupported expressions, and explicit client evaluation

## Scope and version

Based on Microsoft's [client/server evaluation rules](https://learn.microsoft.com/en-us/ef/core/querying/client-eval), [provider guide](https://learn.microsoft.com/en-us/ef/core/providers/), [EF10 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew), [EF11 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew), and [final EF11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). The EF query pipeline is provider- and version-dependent; older high-level pipeline documentation warns that some internals are outdated.

## How this group fits the mental model

The provider translates expression-tree nodes it understands. EF may evaluate captured/local parameter expressions and permitted top-level projection code. A deliberate client boundary means later operators run over materialized or streamed rows in .NET. Query caching makes stable expression shape important.

## Supplied names explained

- **LINQ-to-Entities translation** — Converts supported LINQ expression-tree operations over EF query roots into provider/database commands.
- **Provider translation** — Database provider's mapping of supported query expressions to SQL or another backend language; support is version-specific and not uniform across providers.
- **Client evaluation** — Executes query logic in application memory rather than database. EF permits certain top-level projection calculations but rejects unsupported server-required operations elsewhere by default.
- **Top-level projection client evaluation** — Nontranslatable part of the final `Select` can run on the client after EF fetches required columns.
- **Client evaluation in filter rejection** — Since EF Core 3, unsupported filter/order/join expressions normally throw instead of silently downloading all candidate rows.
- **AsEnumerable client boundary** — Converts subsequent synchronous LINQ operators to LINQ-to-Objects. The source remains deferred; enumerate it and rows are fetched as provider streams/materializes them.
- **AsAsyncEnumerable client boundary** — Converts downstream operators to async-enumerable client processing. Apply server-side filters/limits before the boundary and keep the context alive through enumeration.
- **Unsupported expression translation exception** — Runtime translation failure for expression/provider combinations that cannot be mapped; rewrite the query, project and deliberately evaluate locally, or provide a supported database mapping.
- **EF.Functions** — Access point to EF/provider database functions for use inside LINQ; methods may only work with a particular provider and are not ordinary client utility calls.
- **Provider-specific function translation** — Mapping of a method to database functionality such as collation, date, JSON, full-text, vector, or spatial operations; behavior and availability vary.
- **Value conversion in query expression** — Model/provider conversion can affect comparisons, ordering, parameters, and SQL translation. A converter does not ensure every operation on the model CLR type translates.
- **Parameter extraction** — Recognizes values independent of query shape (such as captured scalar values) and passes them as command parameters when possible.
- **Query parameterization** — Uses parameters for values so changing input does not necessarily change query structure/SQL text; parameter-sensitive plan quality and provider collection translation still require testing.
- **Null compensation** — EF can add SQL conditions to approximate C# two-valued nullable comparison semantics over SQL's three-valued logic; provider/database null settings and expression shape matter.
- **Client-side method call in projection** — Helper function in final projection runs in .NET after required database values are fetched; avoid capturing large service/instance objects in cached client projections.
- **Custom method translation** — Provide an explicit database function mapping or provider extension for a domain operation that should execute in the database; keep SQL semantics and provider scope explicit.
- **IMethodCallTranslator plugin boundary** — Low-level provider extension translating method calls; it is a provider/plugin integration surface, not the usual application-level way to add a method to one query.
- **IQueryExpressionInterceptor** — EF interceptor surface for inspecting or modifying query expression trees; broad rewrites can alter meaning and query-cache behavior, so prefer simpler expression construction where possible.
- **Query tags** — SQL comments attached to queries for correlating commands with application code/diagnostics; do not put secrets or sensitive values in tags.
- **TagWith** — Adds a string tag to generated query commands. Tags aid logs/tracing but are not parameterized security controls.
- **Compiled query cache** — EF caches query processing for reusable expression shapes. A stable shape with varying captured scalar parameters is generally more cache-friendly than rebuilding expressions with embedded constants.
- **Query plan cache key** — Identity used to reuse processed query/plan forms; provider/database caches have their own distinct keys and behavior.
- **Provider-specific collation translation** — Collation controls text comparison/sort semantics and index compatibility; applying a collation can change whether an index is usable and is not a portable case-insensitive switch.
- **EF Core query compilation cache** — Cache of compiled processing for query shapes; distinct from the database's SQL execution-plan cache.
- **Dynamic query expression shape** — Programmatically constructed LINQ expression; keep structure stable and represent changing values as parameters to avoid recompilation/cache churn.
- **Query plan cache pollution** — Excess query shapes or inlined changing constants can cause EF compilation-cache churn and/or database plan-cache growth; use parameterized stable shapes and measure.
- **DbFunction mapping** — Maps a CLR method to a database function for translation. Ensure database function exists and its semantics/types match the CLR contract; a client invocation may not have a meaningful body.

## Cross-item comparison

`IQueryable` operators build provider expressions; after `AsEnumerable`/`AsAsyncEnumerable`, new operators run locally. EF permits client evaluation in the top-level projection but rejects an untranslatable filter by default to prevent hidden full-table downloads. Parameter extraction captures values without changing structure; dynamic constants can change structure and cache keys. `DbFunction` is a public mapping for an application function; `IMethodCallTranslator` is a lower-level provider plugin. EF's compilation cache is not the database's query-plan cache.

## Examples

```csharp
// Server work first, bounded data second, client helper last.
var cards = await db.Products
    .Where(product => product.IsPublished && product.CategoryId == categoryId)
    .OrderBy(product => product.Name)
    .Select(product => new { product.Id, product.Name, product.Slug })
    .Take(100)
    .ToListAsync(cancellationToken);

var result = cards.Select(card => new ProductCard(card.Id, NormalizeSlug(card.Slug))).ToList();
```

If `NormalizeSlug` belongs in the database and should filter/index on the result, map a real database function or use supported provider functions; do not put an untranslatable helper into `Where` and assume EF downloads all rows.

## Common mistakes

- Crossing to client evaluation before selective filtering and paging.
- Assuming a method works because it works in LINQ-to-Objects.
- Assuming a provider plugin API is stable application-level extension surface.
- Dynamically constructing constants for every user value and creating cache churn.
- Using query tags to carry secrets or request-specific personal information.
- Treating `ToQueryString` as database execution-plan evidence.
- Assuming EF parameterization prevents all semantic/performance problems or validates user input.
- Treating EF-generated null compensation as proof the database's collation/null behavior matches application expectations.

## Knowledge checks with answers

1. **Where is client evaluation allowed by default?** In the top-level projection; unsupported operations elsewhere generally throw.
2. **How should a client-only method be applied safely?** After server filtering/projection has reduced and bounded the values needed.
3. **What reduces query cache churn?** Stable expression shape with scalar values parameterized rather than embedded as constants.
4. **What distinguishes a query compilation cache from plan cache?** EF caches expression processing; the database caches executable plans for commands.
5. **When use a translator plugin?** When implementing provider-level translation; ordinary app mappings should use supported query APIs or `DbFunction` mapping.
