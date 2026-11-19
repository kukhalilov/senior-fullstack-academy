# ASP.NET Core configuration providers binding and options lifecycle — Interview questions and reasoning

Sources: Microsoft's [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-providers), [options](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), and [configuration source generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-generator).

## Core questions

1. How is `IConfiguration` assembled from providers?
2. Which value wins when several providers define the same key?
3. What is the difference between `IConfigurationSource` and `IConfigurationProvider`?
4. Compare `IOptions<T>`, `IOptionsSnapshot<T>`, and `IOptionsMonitor<T>`.
5. How do configure and post-configure stages run?
6. What does named options mean?
7. How does monitor reload work, and what does it not guarantee?
8. Compare direct configuration access with strongly typed options.
9. How do you validate required and cross-property settings?
10. What changed for async options validation in .NET 11?
11. What does the configuration binding source generator do?
12. How do you keep secrets out of source and logs?

## Concise interview answers

1. Sources build providers; a root aggregates providers into hierarchical key/value access.
2. Usually the last provider in effective order wins; inspect actual provider ordering.
3. A source describes how to build a provider; a provider loads and resolves values.
4. `IOptions` is cached default startup state; snapshot is per-scope/name; monitor is singleton-safe, named, and supports change callbacks.
5. All applicable configure delegates run before post-configure delegates, then validation at the relevant access/startup path.
6. The same option type can have multiple independent named instances; default name is empty string.
7. Change tokens invalidate monitor cache and invoke callbacks when provider supports reload. This is not atomic reconfiguration of all consumers.
8. Direct access is flexible for dynamic keys; typed options group related settings and support validation/lifetime semantics.
9. Use `GetRequiredSection` plus options validation, explicit required/range rules, and startup validation for critical values.
10. Async validation APIs are available through async overloads of `OptionsBuilder.Validate` and `IAsyncValidateOptions`; startup validation can seed initial `IOptions` and monitor caches. New snapshot values and monitor reloads remain synchronous and throw if async-only validation must run. `IStartupValidator` is obsolete.
11. It intercepts supported binder call sites to generate trim/AOT-friendly code; it does not support every reflection shape.
12. Use User Secrets locally, protected environment/managed stores in production, least privilege, rotation, and redacted diagnostics.

## Deep follow-up answers

### Why can an empty environment variable override a JSON value?

An empty value is still configured. Starting in .NET 11, `AddConfiguration` reports an empty string in the chained root as present, so it overrides an earlier outer-provider value; a null from the chained root remains indistinguishable from missing. Inspect the effective source and do not assume blank means “unset”; explicitly validate required non-empty values. [.NET 11 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/chained-configuration-empty-string)

### What is the cost of using `IOptionsMonitor` everywhere?

It adds a shared cache, change-token subscriptions, reload callbacks, and the need for dependent-resource refresh semantics. If values are immutable startup configuration, `IOptions<T>` is simpler. If only request-scope recomputation is needed, snapshot may be appropriate. Monitor's singleton safety does not make mutable options safe to modify.

### Why might an async validator be a poor place for a remote check?

It can make startup/access depend on a remote service, and the check can become stale immediately. Validate local shape synchronously where possible; use async validation when a useful early check needs I/O, but enforce authoritative state changes transactionally in the operation.

## Scenario questions

1. **Environment variable does not override JSON.** Check naming, double underscores, provider registration/order, process environment, and effective origin.
2. **Scoped snapshot is injected into a singleton.** It violates lifetime; use monitor or redesign the singleton's need.
3. **Monitor callback fires but connection pool still uses old secret.** The callback does not rebuild consumers; implement safe refresh/recreation.
4. **AOT warnings remain after enabling generator.** Inspect supported call site/type and diagnostics; generator is not universal.
5. **A service fails on first request for missing URL.** Add startup validation and meaningful non-secret errors. With async validators, test initial startup caches separately from new scopes and monitor reloads, which still construct synchronously.

## Tradeoffs and alternatives

Compare user secrets, environment injection, and managed secret stores by local usability, deployment control, audit, rotation, and availability. Choose reload only when live reconfiguration is a real requirement. Prefer typed options for cohesive setting contracts while retaining direct lookup for truly dynamic configuration.

## Common weak answers

Avoid saying configuration is automatically typed, every provider reloads, monitor reload updates all consumers atomically, snapshot is singleton-safe, empty means absent, generator covers all binding shapes, or secrets are safe because they are outside appsettings.

## Self-check rubric

A strong response predicts the effective source, names the consumer lifetime, identifies binding/validation timing, explains reload scope, and describes secret exposure control. Give one point for each; revisit any missing dimension.
