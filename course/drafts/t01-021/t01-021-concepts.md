<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# dates times globalization formatting and regular expressions — Core concepts and how they fit together

## Learning objectives

Choose date/time types by meaning; explain UTC instants, offsets, named zones, and daylight-saving ambiguity; distinguish wall clocks from monotonic elapsed time; use cultures and formats intentionally; and select a regex engine/timeout appropriate to the input threat model.

## Prerequisites

You should understand value types, parsing/formatting, exceptions, and basic regular-expression syntax. Date/time and globalization behavior can vary by OS/runtime data source, so examples use explicit choices.

Sources: Microsoft's [date/time types guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime), [globalization guide](https://learn.microsoft.com/en-us/dotnet/core/extensions/globalization), and [regex options reference](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options).

## Core concepts

### Model the meaning of time first

- `DateOnly` represents a calendar date without a time or zone.
- `TimeOnly` represents a time of day without a date or zone.
- `TimeSpan` represents a duration/offset amount; it is not a time zone.
- `DateTime` is a date-and-time value with a `Kind` hint (`Utc`, `Local`, or `Unspecified`). `Unspecified` does not secretly mean UTC.
- `DateTimeOffset` stores a date/time and numeric offset, identifying an unambiguous instant. It does **not** store the named zone that produced the offset.
- `TimeZoneInfo` represents named zone rules and converts local times/instants. Rules can change with OS updates and government decisions.

For a one-time event, persist an instant, commonly UTC/`DateTimeOffset`. For future civil schedules such as “9:00 every weekday in Tashkent,” keep local calendar/time plus a time-zone identifier and resolve each occurrence using rules. For historical reporting, preserving both original local representation/zone and resolved instant may be needed.

### Daylight-saving gaps and overlaps

When clocks move forward, some local wall times do not exist. When clocks move backward, some local times occur twice. A local `DateTime` with no zone cannot resolve these cases by itself. Check `TimeZoneInfo.IsInvalidTime` and `IsAmbiguousTime`, and define policy: reject, shift, choose the earlier/later offset, or ask the user. Do not silently assume the system's local zone for a business rule.

An offset is a numeric relationship to UTC for one value. Many zones can share an offset at a given instant, and a zone's offset changes over time. `DateTimeOffset.ToOffset` changes representation while preserving the instant; it does not apply a zone's future rules. `DateTime.ToUniversalTime` interprets `Local`/`Unspecified` according to API rules and machine local zone; use explicit conversions when zone identity matters.

### Wall clocks, durations, and testable time

System wall clocks can jump due to synchronization or manual changes. Use monotonic timestamps (such as `Stopwatch` or `TimeProvider.GetTimestamp`) for elapsed-time measurement. Use `DateTimeOffset.UtcNow`/`TimeProvider.GetUtcNow` for current instants. Inject a `TimeProvider` for expirations, scheduling, and time-dependent code; a fake provider makes tests deterministic. A clock abstraction does not automatically virtualize every external timer unless code uses its provider timer APIs.

### Culture, format, and parsing contracts

`CurrentCulture` controls culture-sensitive formatting, parsing, and comparison. `CurrentUICulture` selects localized resources. Both flow with asynchronous execution context; defaults may come from the operating system/user. `InvariantCulture` is stable for machine-oriented text, but a standard format string is usually clearer for dates/numbers. Persist a defined invariant representation, not whatever a user's display settings produce.

`Parse` accepts a grammar that may be broader than intended and throws on invalid input; `TryParse` reports failure. `ParseExact`/`TryParseExact` constrain accepted formats. Always select an explicit culture and styles at external boundaries, avoid ambiguous two-digit years, and separately enforce range/domain rules. For floating-point round trips use the round-trip format; decimal has its own round-trip format. Formatting does not guarantee a value will fit a UI field or meet a protocol schema.

String comparison is purpose-dependent. `Ordinal` compares code-unit sequences and is usually right for identifiers/protocol tokens. Culture-aware comparison follows linguistic rules for display/search. `OrdinalIgnoreCase` is not linguistic case-folding. Unicode has grapheme clusters and normalization concerns; one `char` is a UTF-16 code unit, not necessarily a complete user-perceived character.

### Regex engine, syntax, and safety

The traditional engine uses backtracking for many constructs. Ambiguous nested quantifiers/alternations can cause catastrophic work on near-matching input. Set a finite timeout for untrusted patterns/input, bound input length, and consider `RegexOptions.NonBacktracking` when its syntax restrictions are acceptable. It guarantees linear-time processing in input length for supported patterns, but does not support lookarounds, backreferences, atomic groups, balancing groups, or conditionals in the same way.

`RegexOptions.Multiline` changes `^`/`$` to line-oriented anchors; `Singleline` changes `.` to match newline; they are independent. `CultureInvariant` controls case comparisons independent of culture. `AnyNewLine` is available in .NET 11 and alters newline recognition. `GeneratedRegex` creates a specialized regex at compile time and provides diagnostics; `RegexOptions.Compiled` incurs runtime compilation cost and is different. A regex can check syntax but should not be used as a complete parser for nested languages or as a whole email-address validity rule.

## Mechanisms and relationships

```text
semantic value → zone/culture context → format contract → text
      │                 │                    │
instant vs local   rules may change     parse exact/invariant
      │
clock provider for now + monotonic timestamp for elapsed duration

regex lexical test + timeout/input bound → domain validation or real parser
```

For a boundary, specify: value meaning, time zone/culture, accepted format(s), invalid-input behavior, and resource limit. These decisions should be part of the API contract and tests.

## Worked examples

### Resolve a future local appointment

Given a `DateOnly`, `TimeOnly`, and named `TimeZoneInfo`, combine into a `DateTime` with `Kind.Unspecified`. Check invalid/ambiguous cases before converting. If valid and unambiguous, `TimeZoneInfo.ConvertTimeToUtc` with that zone gives the instant. If ambiguous, select a policy explicitly rather than relying on an implicit choice.

### Parse a machine amount

Use `decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out value)` when the external contract accepts invariant number syntax. Then enforce business limits. For localized user input, choose the user's culture explicitly and provide useful validation feedback.

## Misconceptions and edge cases

- “`DateTimeOffset` includes the time zone.” It includes an offset, not a named zone's rule identity.
- “UTC offset is always constant for a place.” Political and daylight-saving rules can change.
- “`DateTimeKind.Unspecified` means local.” APIs may interpret it differently; attach explicit source-zone semantics.
- “A duration is a timestamp.” `TimeSpan` measures a quantity, while an instant is a point on a timeline.
- “CurrentCulture and CurrentUICulture are the same.” One affects formatting/comparison; the other selects resources.
- “Invariant culture is a user language.” It is a stable culture-independent convention, not localized UI.
- “`Singleline` means one-line input.” It changes dot/newline matching; `Multiline` separately changes anchors.
- “A timeout fixes any regex risk.” It bounds execution time but may still tie up a worker until timeout; bound input and choose safer patterns/engines.
- “A regex makes a complex value valid.” It only matches its own pattern; semantic validation remains.

## Knowledge checks with answers

1. **Which type represents a recurring local clock time?** `TimeOnly`, combined with the relevant date and named time zone when resolving occurrences.
2. **Does a `DateTimeOffset` preserve zone rules?** No, only an offset and instant.
3. **What is an invalid local time?** A wall-clock time skipped during a forward clock transition.
4. **Which culture should a machine protocol use?** An explicitly specified invariant/standard format.
5. **How do `Multiline` and `Singleline` differ?** Multiline affects anchors; Singleline affects dot matching.
