<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# dates times globalization formatting and regular expressions — Exercises and worked solutions

## Goals

Practice representing civil time, parsing culture-independent data, testing time-dependent code, and matching untrusted text safely. Use the official [date/time guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime), [parsing guide](https://learn.microsoft.com/en-us/dotnet/standard/base-types/parsing-strings), and [regex backtracking guidance](https://learn.microsoft.com/en-us/dotnet/standard/base-types/backtracking-in-regular-expressions).

## Worked example

### Parse a stable timestamp contract

Assume an external contract requires an ISO round-trip timestamp with an explicit offset. Parse exactly and reject missing/invalid offsets rather than allowing the machine's local time zone to decide.

```csharp
using System;
using System.Globalization;

static DateTimeOffset ParseTimestamp(string text)
{
    if (!DateTimeOffset.TryParseExact(
            text,
            "O",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out DateTimeOffset value))
        throw new FormatException("Expected an ISO round-trip timestamp with an offset.");

    return value.ToUniversalTime();
}
```

The contract keeps an unambiguous instant and normalizes it to UTC internally. It does not preserve the originating named zone; store a zone ID separately if it is part of the business meaning.

## Exercises

### Exercise 1: Model a recurring local schedule

A store opens at 09:00 local time every weekday in a named city. Explain why storing only `DateTimeOffset` for the first occurrence is insufficient. Propose fields to persist and define how to handle a skipped or repeated local time.

### Exercise 2: Repair a culture-dependent protocol parser

```csharp
decimal amount = decimal.Parse(input);
DateTime date = DateTime.Parse(dateText);
```

The values come from a machine-to-machine API. Identify the hidden assumptions and rewrite with explicit culture, formats, and failure handling.

### Exercise 3: Make expiration logic testable

A cache entry expires after five minutes. The implementation calls `DateTime.Now` in several places and uses `Task.Delay`. Explain the testability/time-jump problems and outline a `TimeProvider` design.

### Exercise 4: Defend an identifier regex

An endpoint accepts up to 64 ASCII identifier characters. Explain how you would anchor and bound the pattern, choose engine options/timeout, and separate lexical validation from semantic rules.

### Exercise 5: Explain the regex denial-of-service risk

Analyze why a pattern like `^(a+)+$` can take excessive time on a long sequence of `a` characters followed by a nonmatching character. Give three mitigations and one limitation of each.

### Exercise 6: Format for a user and persist a number

The user has a French culture. Show why currency display and persisted numeric text should use different providers/contracts.

## Progressive hints

1. Future local rules depend on a zone ID and may change; ambiguous/invalid cases require policy.
2. Specify `CultureInfo.InvariantCulture`, exact numeric styles/date pattern, and `TryParse`/`TryParseExact`.
3. Inject `TimeProvider`, use its clock/timestamp/timer APIs, and advance a fake provider in tests.
4. Use absolute anchors and an explicit ASCII character class, finite length and timeout or NonBacktracking.
5. Nested ambiguous repetition creates many possible partitions; use a safer pattern/engine, bounds, and timeout.
6. Render a localized display with `fr-FR`; store/transport invariant or standard representation.

## Complete solutions

### Solution 1

`DateTimeOffset` preserves an instant and one offset, but not the named zone's rules. Persist the local schedule (weekday/date rule and `TimeOnly`), a stable zone identifier, and the chosen policy for gaps/overlaps. Resolve each occurrence using current zone rules. For an invalid spring-forward time, reject or shift by a documented amount. For an ambiguous fall-back time, ask the user or select the earlier/later offset explicitly. Store each resolved UTC instant for execution/audit as well.

### Solution 2

The ambient culture controls decimal separators and date order, so the same input can parse differently on different machines. Define the API grammar. For example:

```csharp
using System;
using System.Globalization;

if (!decimal.TryParse(input, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal amount))
    throw new FormatException("Invalid invariant decimal.");

if (!DateOnly.TryParseExact(
        dateText, "yyyy-MM-dd", CultureInfo.InvariantCulture,
        DateTimeStyles.None, out DateOnly date))
    throw new FormatException("Expected yyyy-MM-dd.");
```

Then enforce allowed decimal scale, range, and domain rules. Syntax validity is not business validity.

### Solution 3

Use one injected `TimeProvider` to obtain the current instant and create/advance timers. Store expiration as an instant (`DateTimeOffset`) or monotonic deadline depending on whether expiration must survive process restart. For an in-process duration deadline, a monotonic timestamp avoids wall-clock jumps. In tests, use `FakeTimeProvider` from the testing package and advance it rather than sleeping. Ensure all delays/timers use the same provider; a fake clock cannot control a direct `Task.Delay` that bypasses it.

### Solution 4

An example lexical rule is `\A[A-Za-z_][A-Za-z0-9_]{0,63}\z`. It uses absolute anchors, an explicit ASCII set, and a maximum length. `RegexOptions.NonBacktracking` is appropriate because this pattern uses supported simple constructs and has linear matching behavior; a finite timeout provides a separate bound. Then check reserved words, ownership/existence, and authorization in normal code. Do not use case-insensitive matching unless the identifier contract explicitly says so.

### Solution 5

The nested `+` groups can partition a long run of `a` characters in many ways. When the final nonmatching character makes the whole pattern fail, a backtracking engine may revisit a combinatorial number of partitions. Mitigations:

1. **Rewrite to a nonambiguous pattern**, such as `\Aa+\z` for this simple language; this removes the nested choice.
2. **Use `RegexOptions.NonBacktracking`** if all required syntax is supported; it rejects lookarounds/backreferences and other constructs.
3. **Set a finite timeout and input-length limit**; these bound damage but can still cause failed requests and consume time until timeout.

For nested data, use a bounded parser rather than adding regex complexity.

### Solution 6

Format for display with an explicit user culture:

```csharp
string display = amount.ToString("C", CultureInfo.GetCultureInfo("fr-FR"));
string persisted = amount.ToString("G29", CultureInfo.InvariantCulture);
```

The display may contain a localized symbol/separator. Persistence should use an invariant contract and retain currency code separately; the symbol is not a reliable currency identifier.

## Tests and edge cases

- Schedule: test ordinary dates, a spring gap, a fall overlap, a changed zone database, and recurring occurrences across year boundaries.
- Parsing: test wrong separators, whitespace/sign policy, decimal overflow, ambiguous date order, missing offset, and invalid leap day.
- TimeProvider: advance exactly to just before, at, and after expiration; ensure timer cancellation/disposal.
- Regex: test maximum valid length, one over maximum, invalid punctuation, long near-match input, timeout behavior, and reserved words.
- Culture: execute tests under at least two cultures and verify the machine contract remains unchanged.

## Reflection questions

1. Is this value a date, clock time, duration, instant, or future local schedule?
2. Is the format a human display or an external data contract?
3. Does the code use wall clock or monotonic time for the right purpose?
4. Is the regex engine's supported syntax and timeout explicit?
5. Which semantic checks happen after parsing/matching?
