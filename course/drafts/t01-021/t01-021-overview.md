<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# dates times globalization formatting and regular expressions — Big-picture orientation and mental model

## Problem and purpose

Dates, times, numbers, and text look deceptively simple because people see them in familiar formats. Software must distinguish a calendar date from a time of day, an elapsed duration from a clock reading, and an instant from a local wall time. Culture changes how values are written and compared. Regular expressions add a pattern language whose features and performance depend on the engine and options.

This topic builds reliable choices for time modeling, international text/numbers, parsing external data, and matching untrusted text. The central rule is to represent meaning before formatting it.

## Plain-language mental model

Think of time as three different tools: a **calendar page** (`DateOnly`), a **clock face** (`TimeOnly`), and a **timeline point** (an instant, often represented by `DateTimeOffset`). A `TimeSpan` measures a gap or duration. A named time zone is a rule set that maps between UTC and local wall time for particular dates. An offset such as `+05:00` is only one numeric difference from UTC; it does not identify the rule set or future daylight-saving changes.

Culture is a presentation and text-behavior policy: decimal separators, month names, casing, and sorting may vary. Invariant or standardized formats are for machine contracts; explicit user culture is for display. Parsing is the reverse process and should state its accepted grammar, culture, and failure behavior.

A regex pattern is a small program for recognizing text. Backtracking engines are expressive but can explore many paths; untrusted input therefore needs a timeout or a supported linear-time engine. A regex can validate a lexical shape, but it cannot replace domain validation or a parser for nested structure.

## How the parts fit together

1. **Choose the semantic value:** date, time, duration, local wall time, or globally identifiable instant.
2. **Attach the right context:** use a named `TimeZoneInfo` when rules matter; use `DateTimeOffset` for an unambiguous instant plus offset.
3. **Keep clock purposes separate:** wall-clock time answers “what time is it?”; monotonic timestamps measure elapsed duration; inject `TimeProvider` for testable time-dependent logic.
4. **Format or parse deliberately:** specify culture and exact patterns at external boundaries; store/transmit invariant standardized representations.
5. **Compare text for its purpose:** ordinal comparison for protocol identifiers; culture-aware comparison/sorting for human language.
6. **Use regex defensively:** specify engine/options/culture/timeouts, bound input, and choose a parser when the grammar is nested or semantic.

## Concept map

```text
date | time-of-day | duration | UTC instant + named-zone rules
                    │
          culture + format contract
                    │
       parse/format/compare user or machine text
                    │
     regex lexical match ── domain validation/parser
```

## End-to-end walkthrough

Suppose a user schedules a meeting for 9:00 AM in a named city time zone next summer. Store the local date, local time, and time-zone identifier as the scheduling intent. At the chosen date, resolve that local time with the zone's current rules; detect invalid spring-forward times or ambiguous fall-back times and apply a deliberate policy. Once resolved, store the resulting UTC instant (or `DateTimeOffset`) for execution/logging. An offset alone cannot preserve the city's future rules.

For an API request containing a numeric amount, parse with invariant culture and an exact allowed syntax, reject overflow/invalid input, and validate business ranges. For a user-facing label, format with the user's culture. If a regex is used to validate an identifier, set a timeout or use `NonBacktracking` only if the pattern's constructs are supported, then still apply domain rules.

## When to use it and tradeoffs

- Use `DateOnly` for birthdays/holidays and `TimeOnly` for recurring local clock times without dates.
- Use `DateTimeOffset` for an instant that crosses systems; retain a zone ID separately when future/historical local rules matter.
- Use `TimeSpan` for elapsed duration, and `Stopwatch`/timestamp APIs for measuring runtime intervals.
- Use `TimeProvider` to inject clocks/timers and make boundary tests deterministic.
- Use invariant/standard formats for persistence and protocols; explicit culture for display.
- Use ordinal string comparisons for identifiers and protocol tokens; culture-aware sorting for user text.
- Use regex for bounded lexical patterns. For nested grammars, use a parser; for untrusted data, set a timeout or use the linear-time engine where compatible.

Recent API details matter: `DateOnly`/`TimeOnly`, `TimeProvider`, source-generated regex, and `RegexOptions.AnyNewLine` were added in later .NET releases. See Microsoft's [date/time type guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime), [globalization/ICU guide](https://learn.microsoft.com/en-us/dotnet/core/extensions/globalization-icu), [regex options](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options), and [backtracking guidance](https://learn.microsoft.com/en-us/dotnet/standard/base-types/backtracking-in-regular-expressions).

## What later lessons cover

The concepts lesson explains time semantics, culture, parsing, and regex risk. Reference lessons enumerate time/time-zone types, globalization APIs, formatting/parsing contracts, and regex patterns/options/source generation. Practice handles scheduling and parsing edge cases. Interview questions emphasize instant modeling, culture contracts, and regex safety.
