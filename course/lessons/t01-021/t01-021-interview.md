
# dates times globalization formatting and regular expressions — Interview questions and reasoning

## Core questions

1. How do `DateOnly`, `TimeOnly`, `TimeSpan`, `DateTime`, and `DateTimeOffset` differ semantically?
2. Does `DateTimeOffset` store a named time zone?
3. How do you represent a future local schedule through daylight-saving transitions?
4. When should you use monotonic time instead of `DateTime.UtcNow`?
5. What are `CurrentCulture` and `CurrentUICulture` used for?
6. Why should machine input use an explicit culture and exact grammar?
7. How do `Parse` and `TryParse` differ?
8. How do regex `Multiline` and `Singleline` differ?
9. What causes catastrophic backtracking, and how do you reduce risk?
10. What is the tradeoff between `NonBacktracking`, `Compiled`, and `GeneratedRegex`?

## Concise interview answers

1. `DateOnly` is a calendar date; `TimeOnly` a clock time; `TimeSpan` a duration/offset; `DateTime` date/time with a kind hint; `DateTimeOffset` an instant plus numeric offset.
2. No. It identifies an instant and offset, but not the zone's rule identity.
3. Store local schedule plus named zone ID, resolve each occurrence with current rules, and define gap/overlap policy.
4. Use monotonic timestamps for elapsed durations because wall clocks can jump. Use UTC wall clock for instants.
5. `CurrentCulture` controls formatting/parsing/comparison; `CurrentUICulture` selects localized resources.
6. Ambient user/OS culture can change separators, date order, and names; an external contract must be deterministic.
7. `Parse` throws for invalid input; `TryParse` reports expected failure with false and an output value.
8. `Multiline` changes `^` and `$` to line anchors; `Singleline` makes `.` match newlines.
9. Ambiguous nested optional quantifiers/alternations can generate many backtracking paths. Rewrite, bound input, use a timeout, or use `NonBacktracking` when syntax permits.
10. NonBacktracking provides a linear-time engine for supported patterns; Compiled generates/JITs at runtime; GeneratedRegex emits code at build time and gives compile-time diagnostics.

Sources: [date/time types](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime), [regex options](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options), and [backtracking guidance](https://learn.microsoft.com/en-us/dotnet/standard/base-types/backtracking-in-regular-expressions).

## Deep follow-up answers

### Why not use `DateTimeOffset` for every schedule?

It is a good representation for instants crossing systems, but only stores an offset. A future event such as “9 AM in this city” depends on a named zone whose rules can change. Store the local date/time recurrence and zone ID, resolve each occurrence, and persist resulting instants when needed for execution/audit.

### What happens to an ambiguous local time?

During a backward clock shift, one wall-clock time maps to two offsets/instants. During a forward shift, some wall times do not exist. Use `TimeZoneInfo.IsAmbiguousTime`, `IsInvalidTime`, and `GetAmbiguousTimeOffsets`, then apply an explicit business policy. Never rely on machine-local implicit conversion for a foreign zone.

### Why is `InvariantCulture` not a universal string comparer?

Invariant culture still uses linguistic comparison rules; it is distinct from ordinal code-unit comparison. Protocol IDs and security tokens generally need ordinal semantics defined by the protocol. Human language sorting should use the intended culture. Persisted ordering based on collation may change as ICU/CLDR data updates.

### What are the limits of regex timeouts?

A timeout bounds how long one match runs, but it does not make an unsafe pattern desirable or the request free. The worker can still be occupied until timeout; input length and concurrency need bounds. Prefer a simple unambiguous pattern or the nonbacktracking engine when supported. A timeout exception should be treated as controlled invalid/over-budget input.

### How does `TimeProvider` improve tests?

Inject it into code that reads current time, measures elapsed time, or creates timers. A fake provider lets tests move clock/timer state deterministically without sleeping. Code that bypasses the provider still uses real time, so all time-dependent paths must share the abstraction.

## Scenario questions

### Scenario: A recurring reminder fires an hour late after a rule change

Check whether the application stored a fixed offset/UTC instant instead of local schedule plus zone ID. Resolve future occurrences against current zone rules and define gap/overlap behavior.

### Scenario: API numbers parse differently in production

Inspect ambient culture use and exact format assumptions. Pass invariant culture/number styles for machine input, validate range, and keep UI localization at the display boundary.

### Scenario: A regex endpoint stalls on invalid input

Inspect nested ambiguous quantifiers and input size. Add finite timeouts, rewrite to avoid ambiguity, use NonBacktracking if supported, and test long near-matches; consider a parser for nested grammar.

### Scenario: Unit tests fail around midnight/month end

Inject `TimeProvider`, test exact boundary instants, and use `DateOnly`/`TimeOnly` to express business concepts. Avoid sleeps and machine-local implicit zones.

## Tradeoffs and alternatives

- **`DateTime` / `DateTimeOffset`:** richer familiar API with kind ambiguity versus explicit offset/instant but no named zone.
- **Fixed offset / named zone:** stable numeric relationship for one value versus rule set for conversion across dates.
- **Current culture / invariant:** localized presentation versus stable machine contract.
- **Ordinal / linguistic compare:** deterministic identifier equality versus language-aware sorting/search.
- **Backtracking / NonBacktracking:** expressive constructs versus linear-time supported subset.
- **Runtime `Compiled` / generated regex:** runtime setup/JIT versus build-time code and diagnostics.
- **Regex / parser:** concise lexical patterns versus explicit nested/semantic grammar processing.

## Common weak answers

- “`DateTimeOffset` is a time zone.” It stores an offset, not the named zone rules.
- “UTC and local time are interchangeable.” They are different representations; local rules can be ambiguous/invalid.
- “Invariant culture makes a string comparison ordinal.” It does not.
- “TryParse validates the business value.” It only parses syntax/range for the target type.
- “Singleline means `^`/`$` are line-oriented.” That is Multiline.
- “Compiled regex prevents ReDoS.” It does not change backtracking complexity.
- “A timeout makes all regex patterns safe.” It bounds a match but still consumes resources until timeout.

## Self-check rubric

Score each from 0 (cannot explain) to 2 (accurate with a practical example):

1. Selects time types from semantic meaning.
2. Handles named zones, ambiguous/invalid local times, and rule updates.
3. Separates wall clock from monotonic elapsed timing and uses `TimeProvider`.
4. Uses explicit culture/format at machine boundaries and localization at UI edges.
5. Chooses comparison semantics and Unicode granularity deliberately.
6. Explains regex engine risks, options, timeout, and parser alternative.

10–12: ready to discuss date/text boundaries; 7–9: revisit specific culture/time-zone/regex details; 0–6: redo the scheduling and ReDoS exercises before memorizing APIs.
