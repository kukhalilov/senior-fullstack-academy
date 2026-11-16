# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Reference: Message templates, structured state, source-generated logging, and exceptions

Sources: Microsoft's [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging), [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), and [`LoggerMessageAttribute` API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loggermessageattribute).

## Scope and version

This reference explains structured event templates and the `LoggerMessage` generator. Provider-specific destructuring/redaction behavior can differ; inspect the configured provider and package.

## Structure versus rendered text

Message templates use placeholders whose names become structured properties, e.g. `"Request {RequestId} completed in {ElapsedMs}ms"`. Positional template placeholders like `{0}` may render but make query fields less readable. Repeating a placeholder name can create ambiguous/colliding fields; use a unique property per concept. Interpolated strings are rendered before the logging call and usually prevent providers from receiving a reusable template plus typed values. Provider-specific destructuring (`@` or similar) is not a universal `ILogger` guarantee.

The `ILogger.Log<TState>` state/formatter carries structured data and a display formatter. Exceptions should be passed through the exception overload/parameter so providers can capture type, stack, and inner exceptions. If the exception is also inserted as a property, duplicate rendering/storage can result. Avoid logging secret-bearing object graphs. “Sensitive data redaction boundary” means logger abstractions do not automatically know which application values are secret; classify and redact at source or configure a proven provider redaction facility.

## Source generation

The source-generated logging method is declared as a static or instance partial method with `LoggerMessageAttribute`; the generator supplies its implementation. The attribute includes event ID/name, level, message, and optional skip-enabled-check behavior. Methods need supported return/parameter shapes; analyzer diagnostics identify constraints and placeholder mismatches. Static methods receive the logger explicitly; instance methods can use an injected field/parameter pattern supported by the generator. Review generated signatures and diagnostics on the target SDK/package version.

Generated methods preserve typed parameters and stable event metadata while avoiding runtime template parsing, boxing, and avoidable allocations. Logger extension methods are simpler and remain correct; high-performance source generation is most valuable when event volume or allocation pressure justifies ceremony. `LoggerMessage.Define<T1>` and its scope counterpart provide manual high-performance alternatives.

`LogPropertiesAttribute` expands selected object properties into event fields. `Transitive` controls recursive property inclusion; `SkipNullProperties` omits null members; `OmitReferenceName` affects field-name prefixing. `LogPropertyIgnoreAttribute` excludes a property. Property expansion changes schema and can increase payload/cardinality or disclose secrets. Prefer small event-specific values over serializing broad domain entities; use exclusions/allowlists and inspect actual provider output.

## Exception practice

Log an exception at the layer that can add useful operation context and decides how it is handled. Avoid logging the same exception at every layer and returning a second log of the same failure. If rethrowing, preserve the exception (`throw;`) and let an owning boundary log once. Do not include credentials, tokens, raw request bodies, or personally identifiable details in messages/fields unless an approved policy exists. Untrusted input should be escaped/structured so log injection cannot forge lines or attributes.

## Examples

```csharp
internal static partial class OrderLogs
{
    [LoggerMessage(EventId = 42, EventName = "OrderPersistFailed",
        Level = LogLevel.Error,
        Message = "Persisting order {OrderId} failed")]
    internal static partial void PersistFailed(
        ILogger logger, int orderId, Exception exception);
}
```

The event ID/name and `OrderId` field remain stable for query tools; the exception is passed as a real exception argument. Avoid adding a `Customer` object with all nested properties unless every property is reviewed for sensitivity and cardinality.

## Cross-item comparison

Structured templates preserve property names; interpolation preserves only a preformatted string. Source-generated methods generate code for the template; `LoggerMessage.Define` caches a delegate manually. A scope enriches several events; `LogProperties` adds values to one event. Each has different schema/lifetime impact.

## Common mistakes

Passing exceptions as ordinary template values; broad object capture; unstable placeholder names; assuming destructuring works the same across providers; marking `SkipEnabledCheck` without checking cost; and hiding generator warnings instead of correcting signatures.

## Knowledge checks with answers

1. **What do placeholder names become?** Structured property names in log state.
2. **What is the generator's performance benefit?** Compile-time template parsing and typed arguments reduce boxing/allocations.
3. **Why be cautious with `LogProperties`?** It can expand sensitive/high-cardinality fields.
4. **Where should an exception usually be logged?** At the boundary that owns its handling and has useful context, once.

## Supplied names explained

The full inventory below preserves each template/state/generator attribute, object-property expansion control, exception convention, performance tradeoff, and data-safety concept declared for this group.

## Exact terms covered

### Exact terms covered

- `Message template placeholder`
- `Named logging value`
- `Structured logging state`
- `ILogger.Log<TState> state and formatter`
- `Message template versus interpolated string`
- `Positional template placeholder`
- `Repeated placeholder name`
- `Destructuring provider extension`
- `Exception argument overload`
- `Exception as first logging argument`
- `Exception structured fields`
- `Source-generated logging method`
- `LoggerMessageAttribute generated method`
- `Static partial logging method`
- `Instance partial logging method`
- `Generated logging method constraints`
- `Generated logging diagnostics`
- `LoggerMessage.Define<T1>`
- `LoggerMessage.DefineScope<T1>`
- `LogPropertiesAttribute`
- `LogPropertyIgnoreAttribute`
- `LogPropertiesAttribute.Transitive`
- `LogPropertiesAttribute.SkipNullProperties`
- `LogPropertiesAttribute.OmitReferenceName`
- `LogPropertyIgnoreAttribute property exclusion`
- `LoggerMessage source generator analyzer`
- `Logging generator performance tradeoffs`
- `High-performance logging without source generation`
- `Sensitive data redaction boundary`
## How this group fits the mental model
Template/state design controls how event values are preserved and how generated methods construct them efficiently.
