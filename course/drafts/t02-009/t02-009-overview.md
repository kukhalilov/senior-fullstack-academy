# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Big-picture orientation and mental model

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), and [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging).

## Problem and purpose

Logs are records of what an application did and what it observed. Good logs help diagnose behavior across services without turning every line into unstructured text or exposing sensitive data. .NET's `ILogger` abstraction records events; providers decide destinations, and filtering controls which categories/levels are emitted to each destination.

## Plain-language mental model

A logging call describes an event: category, severity, optional event ID/name, template, structured values, and exception. The logger factory/provider pipeline checks filters, then each enabled provider handles the record. A scope adds shared context while a block/operation is active. Source generation creates efficient, strongly typed logging methods for frequent/hot-path events.

## How the parts fit together

```text
ILogger call → category + level + EventId + template + values + exception
             → filter rules per provider/category → provider formatter/sink
scope → shared context on nested events (only if provider supports scopes)
```

Logging is distinct from distributed tracing and metrics. Scopes may correlate events but do not create a trace by themselves. Console output is useful locally and can be collected by a host, but it is not itself durable centralized storage.

## Concept map

`ILogger<T>` commonly uses a type-based category. Message templates preserve named fields as structured state; string interpolation formats eagerly and loses that shape. Log levels indicate event severity/operational importance. Providers such as Console, Debug, EventSource, and EventLog send records to different destinations. Filter rules select the effective threshold by provider/category, often choosing the most specific category rule and last matching rule. Scopes attach request/job context; providers must capture them.

## End-to-end walkthrough

An API logs `Order {OrderId} accepted` at Information with a stable event ID and an exception only when an error occurs. A filter rule enables Information for the app category but Warning for a noisy framework category. The console provider formats the message as text or JSON; a centralized provider exports it for retention/querying. A scope can attach request/order context to several related events. A source-generated method avoids repeated template parsing and boxing on a frequently executed path.

## When to use it and tradeoffs

Use ordinary `ILogger` extension methods for simple/low-volume events and source-generated methods for hot paths or stable event catalogs. Use structured fields that are queryable and low-cardinality. Use scopes for bounded shared context. Select providers and retention according to operations/compliance needs; never assume console output is durable. Keep sensitive fields out or apply explicit redaction.

## What later lessons cover

Reference lessons explain abstractions/levels/event IDs, templates/source generation/exceptions, providers/configuration/filter selection, and scopes/correlation/safe operations. Practice and interview lessons debug missing events, performance, scope visibility, and secret/cardinality risks.

## Version notes

Logging abstractions, provider packages, and generators can have independent package versions. Check the package used by the application. LoggerMessage source generation is the current built-in high-performance pattern; `LoggerMessage.Define` remains supported for legacy scenarios, and `ILogger` extension methods remain valid for straightforward cases.
