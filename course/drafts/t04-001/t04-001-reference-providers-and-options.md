# DbContext service lifetimes configuration and providers — Reference: Provider selection, configuration, logging, and context initialization

## Scope and version

This lesson targets EF Core 11 and cites the [official provider catalog](https://learn.microsoft.com/en-us/ef/core/providers/) and [context configuration documentation](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/). Providers are separate packages maintained by Microsoft or third parties; confirm each provider's supported EF Core major and target database version before upgrading.

## How this group fits the mental model

Options select one provider for a context instance and configure diagnostics and behavior. The provider supplies translation, type mapping, connection, and database operations. Initialization APIs affect schema/database lifecycle and should be chosen separately from request-time data access. Provider support does not guarantee every query is portable.

## Supplied names explained

- **`EF Core database provider`** — Package integrating EF Core with a database or non-relational store. It provides provider-specific query/update translation, type mapping, and database services; capability and SQL semantics vary.
- **`UseSqlServer`** — Configures the Microsoft SQL Server provider, including connection string/provider options. Features such as SQL Server-specific translation, value generation, and retry configuration are not universal EF behavior.
- **`UseNpgsql`** — Configures the Npgsql PostgreSQL provider. Npgsql-specific type mapping, SQL translation, and database features may differ from SQL Server even when LINQ looks identical.
- **`UseMySql`** — Configures a MySQL-compatible provider. The extension's package/provider implementation varies (for example, Pomelo versus Oracle's provider); select and version the provider deliberately rather than assuming one universal method implementation.
- **`UseSqlite`** — Configures SQLite. It is useful for lightweight relational storage, but SQLite's SQL features, type affinity, concurrency model, and translation differ from server databases.
- **`UseCosmos`** — Configures the Azure Cosmos DB provider. Its document/partition model and LINQ capabilities differ substantially from relational providers; a relational model does not become portable merely by changing this call.
- **`UseInMemoryDatabase`** — Configures EF Core's non-relational in-memory provider, primarily useful for simple tests. It does not emulate SQL, relational constraints, transactions, collation, or provider translation and is not a production relational substitute.
- **`Database provider package version alignment`** — Keep EF Core runtime, provider, design/tools, and related extensions on compatible versions. A provider release must explicitly support the chosen EF Core major; third-party providers may release on a different schedule.
- **`UseLoggerFactory`** — Supplies an `ILoggerFactory` for EF logging. Reuse an application-managed factory instead of allocating a new one per context; avoid logging sensitive values unintentionally.
- **`LogTo`** — Configures a simple EF log callback, useful for focused diagnostics and tests. Filter categories/levels so routine query logs do not overwhelm or expose data.
- **`EnableSensitiveDataLogging`** — Includes parameter/entity values in some EF log messages and exceptions. Use only in controlled development/debugging because values may contain personal data, credentials, or business secrets.
- **`EnableDetailedErrors`** — Adds diagnostic detail around value reading/materialization failures, with potential runtime overhead. It does not substitute for safe exception handling or logging policy.
- **`ConfigureWarnings`** — Configures EF warning behavior, such as logging, throwing, or ignoring selected warning events. Ignoring a warning should be deliberate and narrowly scoped.
- **`UseQueryTrackingBehavior`** — Sets the context's default query tracking mode. No-tracking is often useful for read-only query paths; entities needed for updates should be tracked or explicitly attached/updated with correct semantics.
- **`UseLazyLoadingProxies`** — Enables proxy-based lazy loading with the corresponding package and navigation-property requirements. Accessing navigation properties can trigger hidden database queries and N+1 behavior; proxy creation also affects entity construction/accessibility requirements.
- **`UseChangeTrackingProxies`** — Enables proxy-based change notifications to avoid some snapshot detection work; entity properties must meet proxy requirements, and proxies must be used consistently so changes are observable.
- **`UseModel compiled model`** — Configures a pre-generated compiled EF model, primarily to reduce startup/model-building cost for very large models. It is generated and must be regenerated when model configuration changes; it is not compiled query execution.
- **`EnsureCreated`** — Creates the database/schema directly from the current model if absent, without migration history. Appropriate for disposable/simple scenarios, not a schema-evolution alternative to migrations.
- **`EnsureDeleted`** — Deletes the database if it exists. Destructive; restrict it to disposable test/dev environments and never expose it on production paths.
- **`Database.Migrate`** — Applies pending migrations to bring a relational database to the latest model schema. Run through an intentional deployment/migration process; simultaneous startup migration from multiple replicas can race and production permissions should be considered.
- **`Database.CanConnect`** — Checks whether the database can be reached at that moment. A successful result does not guarantee a later query will succeed, and a failed result can be transient; it is not a substitute for resilient operation handling.
- **`Connection resiliency configuration`** — Configures provider retry strategies for transient failures. Retries can repeat operations; user-initiated transactions and side effects must be coordinated with the provider execution strategy so a retried unit is safe.
- **`Connection string configuration`** — Supplies server/database/authentication/transport options to the provider. Read secrets from a secret store or protected configuration source, not committed source code or logs; least-privilege credentials and encryption settings matter.
- **`Design-time DbContext factory`** — A predictable way for EF tooling to construct/configure the context when it cannot or should not start the full application host. Keep design-time and runtime model/provider configuration aligned.
- **`IDesignTimeDbContextFactory<TContext>`** — EF tooling interface whose `CreateDbContext(string[] args)` returns a configured context at design time. The returned context's configuration must match intended migrations; this factory is separate from runtime `IDbContextFactory<TContext>`.
- **`DbContextOptionsBuilder`** — Builder used by DI callbacks, `OnConfiguring`, or explicit construction to select provider and configure behavior. A context instance must use exactly one database provider.

## Cross-item comparison

Relational provider calls (`UseSqlServer`, `UseNpgsql`, `UseMySql`, `UseSqlite`) connect EF to SQL databases, but differ in SQL/type/feature semantics. `UseCosmos` targets a document database model; `UseInMemoryDatabase` is a test-oriented non-relational store, not a relational engine. `EnsureCreated` creates a schema without migration history; `Database.Migrate` applies migration history. Runtime `IDbContextFactory<TContext>` creates application operation contexts; `IDesignTimeDbContextFactory<TContext>` serves EF tooling. `LogTo` is a callback convenience; `UseLoggerFactory` plugs into structured logging. Sensitive-data logging changes what values may appear, whereas detailed errors change diagnostic detail.

## Examples

```csharp
builder.Services.AddDbContext<OrdersContext>(options =>
{
    options.UseSqlServer(connectionString);
    options.LogTo(Console.WriteLine, LogLevel.Warning);
});
```

In a production application, configure warning behavior selectively rather than throwing for every warning, and ensure the logger filters confidential values. The connection string should come from protected configuration.

```csharp
// Disposable test database only; this does not validate relational SQL behavior.
options.UseInMemoryDatabase("Orders-tests");
```

Use a production-provider integration test for translation, transaction, constraint, collation, and concurrency behavior.

## Common mistakes

- Assuming all provider packages are Microsoft-maintained or release in lockstep.
- Treating LINQ as a guarantee that SQL translation and results match across databases.
- Using `UseInMemoryDatabase` to claim relational integration coverage.
- Enabling `EnableSensitiveDataLogging` in production and leaking parameter values.
- Creating a logger factory/context per operation unnecessarily.
- Using lazy loading without recognizing the hidden query timing and N+1 costs.
- Assuming `Database.CanConnect` makes the following operation reliable.
- Running `Database.Migrate` concurrently from every replica at startup without coordination.
- Mixing `EnsureCreated` and migrations on the same evolving database.
- Treating `UseModel` compiled model as compiled LINQ query caching.

## Knowledge checks with answers

1. **Can one context instance be configured with both SQL Server and SQLite providers?** No; a context instance uses one provider.
2. **What does `EnsureCreated` omit that migrations require?** Migration history and incremental schema evolution.
3. **Why isn't the InMemory provider a relational test substitute?** It doesn't implement relational SQL semantics, constraints, or transaction behavior.
4. **What is the difference between runtime and design-time context factories?** Runtime factory creates contexts for app operations; design-time factory creates contexts for EF tooling such as migrations.
