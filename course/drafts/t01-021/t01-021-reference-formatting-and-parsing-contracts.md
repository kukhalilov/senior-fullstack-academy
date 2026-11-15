<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# dates times globalization formatting and regular expressions — Reference: IFormattable, format strings, Parse and TryParse, exact parsing, interpolated handlers, and spans

# Scope and version

This lesson covers every item in `formatting-and-parsing-contracts`. Formatting/parsing is a contract: specify format, culture, styles, range, and failure behavior. Sources: [.NET formatting types](https://learn.microsoft.com/en-us/dotnet/standard/base-types/formatting-types) and [parsing strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/parsing-strings).

# How this group fits the mental model

Formatting maps a structured value to text with a format provider; parsing maps text back under a grammar. Human display may be localized; persistence/protocol text must be explicit and stable. `ParseExact` constrains syntax, `TryParse` reports ordinary invalid input without exception, and span-based methods can reduce temporary strings. None of these replaces business validation.

# Supplied names explained

| Supplied name | Meaning and edge case |
|---|---|
| `IFormattable.ToString(String,IFormatProvider)` | Produces text using a format string and provider; null/empty format usually requests general format. |
| `ISpanFormattable.TryFormat(Span<Char>,Int32,ReadOnlySpan<Char>,IFormatProvider)` | Attempts formatting directly into caller buffer, returning success and chars written; insufficient space returns false. |
| `IParsable<TSelf>.Parse(String,IFormatProvider)` | Static-abstract generic parsing contract from string with provider; invalid input may throw. |
| `IParsable<TSelf>.TryParse(String,IFormatProvider,TSelf)` | Generic string parsing contract that returns success and parsed value. |
| `ISpanParsable<TSelf>.Parse(ReadOnlySpan<Char>,IFormatProvider)` | Parses from character span without requiring an input string allocation. |
| `ISpanParsable<TSelf>.TryParse(ReadOnlySpan<Char>,IFormatProvider,TSelf)` | Span-based generic parse that reports expected invalid-input failure. |
| `String.Format(IFormatProvider,String,Object)` | Composite formatting with explicit provider and arguments; placeholder indexes must match arguments. |
| `FormattableString.Invariant(FormattableString)` | Converts interpolated composite data using invariant culture after interpolation captures arguments and format components. |
| `CultureInfo.InvariantCulture formatting` | Stable culture-independent formatting choice for machine/log formats; pair with an explicit standard format when interoperability matters. |
| `Composite formatting item index and format component` | `{index[,alignment][:formatString]}` selects argument, optional alignment, and type-specific format. |
| `Alignment component in composite format string` | Minimum output width with optional sign for left/right alignment; does not truncate long values. |
| `Escaped braces in composite format string` | Doubled braces represent literal braces; malformed brace syntax can throw `FormatException`. |
| `Interpolated string format specifier` | `:format` after an expression selects type-specific representation, with current provider unless explicitly controlled. |
| `InterpolatedStringHandlerAttribute` | Marks a custom interpolated string handler for compiler lowering; enables conditional/lower-allocation formatting patterns. |
| `DefaultInterpolatedStringHandler.AppendLiteral(String)` | Appends literal text segment while the compiler constructs an interpolated string. |
| `DefaultInterpolatedStringHandler.AppendFormatted<T>(T)` | Appends a formatted value using selected format/alignment/provider overload. |
| `DefaultInterpolatedStringHandler.ToStringAndClear()` | Produces final string and clears handler's buffered state. |
| `Standard numeric format strings` | Single-character format codes plus optional precision for numeric families; behavior depends on type/provider. |
| `Custom numeric format strings` | Pattern symbols control digits, grouping, decimal positions, scaling, and literals. |
| `Standard date and time format strings` | One-character specifiers produce culture- or invariant-defined date/time representations. |
| `Custom date and time format strings` | Pattern tokens define components; quoting/escaping and culture names are significant. |
| `Standard TimeSpan format strings` | Standard `c`, `g`, and `G` duration forms; `c` is invariant constant format. |
| `Custom TimeSpan format strings` | Explicit duration component patterns; escape/literal rules differ from date formats. |
| `Round-trip format specifier O` | Round-trip date/time representation preserving kind/offset semantics in supported types. |
| `Sortable format specifier s` | Sortable ISO-like local fields without offset; not sufficient alone to identify a global instant. |
| `Universal sortable format specifier u` | Universal sortable representation with UTC convention; exact conversion/format contract matters. |
| `RFC1123 format specifier r` | RFC 1123 GMT format using invariant English names. |
| `General format specifier G` | General date/time display format; culture-dependent and unsuitable as a persistence protocol. |
| `Round-trip invariant DateTimeOffset serialization` | Use round-trip format to preserve offset/instant text; separately store named zone if future rules matter. |
| `DateTime.ToString(String,IFormatProvider)` | Formats `DateTime` with explicit format and provider. |
| `DateTime.TryFormat(Span<Char>,Int32,ReadOnlySpan<Char>,IFormatProvider)` | Writes `DateTime` directly into char span and reports chars written. |
| `DateTimeOffset.ToString(String,IFormatProvider)` | Formats clock and offset using explicit provider/pattern. |
| `DateOnly.ToString(String,IFormatProvider)` | Formats calendar date with explicit format and provider. |
| `TimeOnly.ToString(String,IFormatProvider)` | Formats time of day with explicit provider. |
| `TimeSpan.ToString(String,IFormatProvider)` | Formats duration according to standard/custom duration patterns. |
| `Int32.ToString(String,IFormatProvider)` | Formats integer according to numeric format and provider. |
| `Decimal.ToString(String,IFormatProvider)` | Formats decimal using numeric format and provider; `G29` can preserve decimal round trip. |
| `DateTime.Parse(String,IFormatProvider,DateTimeStyles)` | Parses using provider and styles; accepted text may be broader than an external contract intends. |
| `DateTime.TryParse(String,IFormatProvider,DateTimeStyles,DateTime)` | Attempts culture/style-aware parse and returns success without expected invalid-input exception. |
| `DateTime.ParseExact(String,String,IFormatProvider,DateTimeStyles)` | Requires a specified pattern; throws if text does not match or is invalid. |
| `DateTime.TryParseExact(String,String,IFormatProvider,DateTimeStyles,DateTime)` | Exact parse that reports expected failure. |
| `DateTimeOffset.Parse(String,IFormatProvider,DateTimeStyles)` | Parses date/time and offset using provider/styles; absent offset interpretation depends on styles/local rules. |
| `DateTimeOffset.ParseExact(String,String,IFormatProvider,DateTimeStyles)` | Requires exact format; define offset/assumption policy explicitly. |
| `DateOnly.Parse(String,IFormatProvider,DateTimeStyles)` | Parses a date under provider/style conventions and throws on failure. |
| `DateOnly.TryParseExact(String,String,IFormatProvider,DateTimeStyles,DateOnly)` | Parses with an exact date pattern and reports malformed or out-of-range text through its Boolean result. |
| `TimeOnly.Parse(String,IFormatProvider,DateTimeStyles)` | Parses a clock time using provider/styles; this value has no date/time zone. |
| `TimeOnly.TryParseExact(String,String,IFormatProvider,DateTimeStyles,TimeOnly)` | Attempts an exact time-pattern parse and reports ordinary failure with false. |
| `TimeSpan.ParseExact(String,String,IFormatProvider)` | Parses duration text matching a supplied duration format. |
| `Int32.Parse(String,NumberStyles,IFormatProvider)` | Parses integer using allowed number syntax and provider; can throw format or overflow exceptions. |
| `Int32.TryParse(String,NumberStyles,IFormatProvider,Int32)` | Attempts integer parse and reports malformed/out-of-range input as false. |
| `Decimal.Parse(String,NumberStyles,IFormatProvider)` | Parses decimal according to allowed syntax/provider; precision/range and separators are explicit concerns. |
| `Decimal.TryParse(String,NumberStyles,IFormatProvider,Decimal)` | Nonthrowing expected-failure decimal parse. |
| `NumberStyles.Integer` | Allows sign and surrounding whitespace according to enum flags; excludes decimal/group separators. |
| `NumberStyles.Number` | General number syntax including decimal/group separators and sign; does not mean every currency/exponent format. |
| `NumberStyles.Float` | Floating-style syntax including whitespace/sign/decimal/exponent; grouping is not enabled unless combined. |
| `NumberStyles.AllowThousands` | Permits group separators when combined with other style flags. |
| `NumberStyles.Currency` | Allows currency-specific symbols/separators and related syntax. |
| `DateTimeStyles.AssumeLocal` | Treats parsed date/time without zone as local where applicable. |
| `DateTimeStyles.AssumeUniversal` | Treats parsed date/time without zone as UTC where applicable. |
| `DateTimeStyles.AdjustToUniversal` | Converts parsed result to UTC when applicable; compatible combinations are constrained. |
| `DateTimeStyles.RoundtripKind` | Preserves `DateTime.Kind` behavior for round-trip formats; cannot be combined with every other style. |
| `FormatException` | Indicates text or format grammar is invalid/incompatible. |
| `OverflowException during numeric parsing` | Indicates syntactically numeric input exceeds target numeric range. |
| `TryParse versus Parse failure contract` | Use `Parse` when invalidity is exceptional; use `TryParse` for expected user/input validation failure. |
| `ParseExact contract versus permissive Parse` | Exact parsing accepts only declared grammar; permissive parse may accept culture-dependent alternatives. |
| `Explicit culture at external input boundary` | Pass culture/provider rather than inherit ambient machine/user settings. |
| `Invariant format for logs and machine-readable values` | Use stable invariant/standard representation so locale changes do not corrupt contracts. |
| `Localized display formatting versus persistence format` | Render for the user at the UI edge; persist a standardized representation and semantic type. |
| `Avoid ambiguous two-digit-year parsing` | Two-digit-year pivot rules are culture/calendar dependent; require four-digit years for external contracts. |
| `Floating-point round-trip format R` | Round-trip specifier preserves a `float`/`double` value through text parse under supported runtime behavior. |
| `Decimal G29 format round-trip` | General precision 29 format preserves decimal value round trips without unnecessary trailing zeros. |
| `Span-based parsing and formatting allocation behavior` | Spans can avoid intermediate input/output strings when caller provides buffers; benchmark full path and handle insufficient buffer. |

# Cross-item comparison

| API | Invalid input | Allocation/contract |
|---|---|---|
| `Parse` | Throws | Convenient when failure is exceptional. |
| `TryParse` | Returns false | Better for expected validation paths. |
| `ParseExact`/`TryParseExact` | Requires stated grammar | Appropriate for stable external formats. |
| String formatting | Creates text | Simple, potentially allocates. |
| Span formatting/parsing | Returns success/length | Can reuse buffers and avoid temporary strings. |

# Examples

```csharp
using System;
using System.Globalization;

const string format = "O";
string wire = timestamp.ToString(format, CultureInfo.InvariantCulture);
if (!DateTimeOffset.TryParseExact(
        wire, format, CultureInfo.InvariantCulture,
        DateTimeStyles.RoundtripKind, out DateTimeOffset parsed))
    throw new FormatException("Invalid timestamp.");
```

In a real schema, define whether the value must contain an offset and whether UTC normalization is required. Round-trip text does not preserve a named time-zone ID.

# Common mistakes

- Parsing external values using ambient culture.
- Using `G`/localized display text as a persistent schema.
- Using `ParseExact` without specifying whether offset/kind is required.
- Treating numeric overflow as the same failure as malformed syntax.
- Assuming an interpolated string is invariant.
- Using two-digit years or ambiguous date order.
- Forgetting to check `TryFormat`/span capacity and `charsWritten`.

# Knowledge checks with answers

1. **What does `ParseExact` add?** It restricts accepted syntax to the declared pattern(s).
2. **Which method handles ordinary invalid user input without an exception?** `TryParse` or its exact/span counterpart.
3. **Is interpolated string formatting automatically invariant?** No; it normally uses current culture unless provider is supplied.
4. **What does `R` preserve?** A floating-point value's round-trip representation.
5. **Does `O` preserve a named time zone?** No; it preserves relevant date/time kind or offset representation.
