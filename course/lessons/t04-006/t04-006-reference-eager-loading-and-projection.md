# loading navigation properties eager explicit lazy and N+1 — Reference: Include, ThenInclude, filtered include, and projection

## Scope and version

Based on Microsoft's [eager-loading guide](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), [single/split-query guide](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), and final [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF11 improves some reference joins/orderings; provider SQL still needs measurement.

## How this group fits the mental model

Eager APIs state which navigations should be loaded with the query. Projection states which values the caller needs. Tracking fix-up and model auto-includes can change the apparent graph beyond what a single include expression suggests.

## Supplied names explained

- **Eager loading** — Loads related data as part of the initial query execution, through includes or projection.
- **Include** — Adds a navigation to entity query results. Collection includes can multiply rows in a relational join.
- **ThenInclude** — Continues an include path through a previously included reference or collection.
- **Filtered Include** — Filters/orders/pages a collection navigation within an include using supported enumerable operators. In tracking queries, fix-up may add previously tracked rows outside the filter; the navigation is marked loaded even though it is partial.
- **Include<TEntity,TProperty>** — Typed include overload taking a navigation lambda and returning an include queryable for chaining.
- **Include(string navigationPath)** — String path overload for dynamic or derived navigation paths; it sacrifices compile-time/refactor safety.
- **Include on derived entity navigation** — Include a navigation declared only on a subtype through cast, `as`, or a string path; ensure the root query/provider supports the inheritance shape.
- **ThenInclude navigation chain** — Builds nested paths such as `Blog → Posts → Author → Photo`; multiple branches may repeat the first include.
- **ThenInclude generic overload shapes** — Overloads continue from reference or collection navigation; the previous element type differs, so select overloads through typed lambda inference rather than manual generic arguments in ordinary code.
- **Include reference navigation** — Eager-loads a to-one navigation; generally does not create sibling collection cross products, though it may add joins/data.
- **Include collection navigation** — Loads many related entities; can duplicate parent columns/rows in joined SQL.
- **Multiple collection Include** — Includes several collection paths. Sibling collections can cause cartesian explosion; consider projection or split query after measuring.
- **Projection of related data** — Selects fields/aggregates from related entities into a result shape rather than materializing a full entity graph.
- **Select projection** — Defines output columns/shape. Project scalars/DTO values for read screens; entity instances within a projection may still be tracked under tracking behavior.
- **AutoInclude** — Model-level navigation configuration that automatically includes the path whenever its entity is returned; it can expand queries indirectly.
- **IgnoreAutoIncludes** — Query operator that suppresses user-configured auto-includes. It does not suppress owned navigations auto-included by convention.
- **Owned navigation auto-inclusion convention** — Owned navigations are automatically included because owned dependents are part of the owner model shape.
- **IgnoreAutoIncludes owned-navigation limitation** — Owned navigations continue to be included even when `IgnoreAutoIncludes()` is used.
- **Navigation auto-inclusion** — Implicit graph loading configured with `AutoInclude`; inspect model configuration when a query unexpectedly expands.
- **Cartesian explosion** — Cross-product row multiplication from sibling collection joins. For a parent with P children in one collection and C in another, joined rows can approach P×C for that parent.
- **Single query loading** — Relational include strategy that returns a joined result in one SQL query; it may duplicate parent data or produce cross products.
- **AsSingleQuery** — Forces single-query mode for a query; it does not mean “one SQL statement per navigation.”
- **Relationship fix-up after Include** — EF synchronizes loaded relationships with tracked FK/navigation state; fix-up can attach already-tracked entities even if not returned by a filtered include.

## Cross-item comparison

Include materializes entity graphs; projection materializes exactly the selected output, often fewer columns. Filtered include controls query rows but tracking fix-up can broaden collection contents. Explicitly repeat the same filter when a path is included more than once; EF permits one unique filter set per collection navigation path. AutoInclude affects multiple queries implicitly; `IgnoreAutoIncludes` disables user-configured rules but not owned navigation conventions. Sibling collection includes can multiply rows; nested paths have different multiplication characteristics.

## Examples

```csharp
var blogs = await db.Blogs
    .Include(blog => blog.Posts.Where(post => post.IsPublished)
        .OrderByDescending(post => post.PublishedAt)
        .Take(10))
    .ThenInclude(post => post.Author)
    .AsNoTracking()
    .ToListAsync(cancellationToken);

var cards = await db.Blogs
    .Select(blog => new BlogCard(
        blog.Id,
        blog.Name,
        blog.Posts.Count(post => post.IsPublished)))
    .ToListAsync(cancellationToken);
```

Use a fresh/no-tracking result if the filtered collection must not be polluted by prior tracked rows. The projection loads a count and does not need every `Post` entity.

## Common mistakes

- Including every navigation “just in case.”
- Assuming filtered include means the navigation contains only filtered values in a tracking context.
- Assuming `IgnoreAutoIncludes` removes owned navigations.
- Loading multiple sibling collections in a single query without checking joined row count.
- Using string includes for static model paths where typed lambdas are safer.
- Forgetting that entity-valued projections can be tracked.
- Assuming Include on a collection is the same as filtering/projection or as SplitQuery.

## Knowledge checks with answers

1. **What may add out-of-filter entities to a filtered include?** Tracking fix-up from entities previously tracked by that context.
2. **Which is often best for a read-only card with a few values?** Projection.
3. **Can `IgnoreAutoIncludes` suppress owned paths?** No.
4. **What is the main sibling-collection risk?** A cross product of child rows and repeated parent data.
