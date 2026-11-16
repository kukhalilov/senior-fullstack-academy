# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Exercises and worked solutions

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), and [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging).

## Goals

Design queryable events, select levels and categories, diagnose provider filtering, use scopes safely, improve hot-path performance, and protect sensitive information.

## Worked example

An `Information` log appears locally but not in production. Confirm the call executes; inspect effective provider registration; compare category and level rules including provider aliases/specificity/order; check whether the provider writes to console or remote storage; inspect exporter/collector health; then test with a known event. Do not immediately lower every filter or assume the call site was skipped.

## Exercises

### 1. Preserve structured fields

Rewrite `$"Order {id} failed for {customer}"` for searchable logging.

**Solution:** `logger.LogError(exception, "Order {OrderId} failed for {CustomerId}", id, customerId);` Use appropriate data classification and avoid logging customer PII unless allowed. The named placeholders become structured properties; the exception uses the exception overload.

### 2. Pick a level

A cache miss falls back to the database successfully; a payment attempt is declined by policy; a database write fails unexpectedly; the process cannot start due to an invariant violation.

**Solution:** Cache miss may be Debug or a metric depending on volume; a policy decline is often Information/Warning depending on expectedness; an unexpected failed write is Error; inability to start may be Critical. Choose based on operational meaning, not these labels alone, and avoid alerting on routine events.

### 3. Diagnose category filter

Default is Information, `Microsoft` is Warning, and a provider-specific `Microsoft.Hosting` rule is Debug. What happens for `Microsoft.Hosting.Lifetime` Information?

**Solution:** The most specific matching category rule for that provider is considered; a Debug threshold enables Information. Confirm provider alias and last matching rule behavior in effective options because another later rule may supersede it.

### 4. Avoid eager work

A Debug call serializes a large object even when Debug is disabled.

**Solution:** Do not serialize to a string before logging. Use structured template arguments and the generated logging method. If expensive computation is still required to produce arguments, check `logger.IsEnabled(LogLevel.Debug)` before computing; avoid capturing a whole object graph.

### 5. Apply a scope safely

Add a request ID and tenant ID to every event in one request, then ensure a background request does not inherit stale values.

**Solution:** Start a scope at middleware/request boundary using `using`/`try-finally` to dispose it. Use provider scope support and `IncludeScopes`. Do not store ambient values in static fields. Background work should create its own bounded scope and correlate through an explicit job ID.

### 6. Source-generated log event

Create a stable high-volume warning event for a retry with attempt count and operation name.

**Solution:** Declare a partial method decorated with `LoggerMessageAttribute` using a stable EventId/EventName/Level/Message, and typed parameters matching named placeholders. Keep the event schema stable; inspect generator diagnostics. Use ordinary extension methods if call volume does not justify extra declarations.

### 7. Prevent sensitive property expansion

A generated logger uses `[LogProperties]` on a user object containing email, token, and settings.

**Solution:** Do not capture the broad object. Define a small safe event DTO/arguments; selectively exclude sensitive members with `LogPropertyIgnore` only if the object capture is unavoidable. Verify provider output, since generated state and formatter may reveal fields even if the message text does not.

### 8. Console durability

The team assumes JSON console logs remain searchable for 90 days.

**Solution:** JSON is only a formatter. Confirm the runtime/container/platform collector ships stdout to a durable backend with configured retention and access control. If it does not, configure an appropriate provider/export path and verify delivery/failure behavior.

## Progressive hints

Ask: is this a semantic event; what fields need querying; which level is operationally correct; which provider receives it; which filter wins; is the cost paid before the call; who owns scope disposal; and can any field contain secrets?

## Complete solutions

Each scenario above gives the complete corrective design. For production changes, validate with the real provider/collector and a redacted sample event rather than console-only assumptions.

## Tests and edge cases

Test placeholder names and exception data, filtering by provider/category/order, disabled-level allocation, scope nesting/provider support, concurrent requests, source generator diagnostics, redaction, exporter failure, console collection/retention, and duplicate exception handling.

## Reflection questions

Can an operator query an event without parsing its rendered text? Are IDs/names stable? What data is emitted implicitly by exceptions/properties? Does the destination persist records? Are logs, traces, and metrics being used for their intended roles?
