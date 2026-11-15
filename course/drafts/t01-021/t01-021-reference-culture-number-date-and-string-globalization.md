<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# dates times globalization formatting and regular expressions — Reference: CultureInfo, NumberFormatInfo, DateTimeFormatInfo, calendars, Unicode, comparison, and ICU

# Scope and version

This is the complete `culture-number-date-and-string-globalization` inventory for .NET 11. Culture data and sort behavior can change with ICU/CLDR/OS updates. Sources: [globalization guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/globalization), [ICU globalization](https://learn.microsoft.com/en-us/dotnet/core/extensions/globalization-icu), and [`CultureInfo`](https://learn.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo).

# How this group fits the mental model

Culture combines formatting, parsing, comparison, calendars, and localized resource contexts. `CurrentCulture` affects user-facing value operations; `CurrentUICulture` selects resources. Invariant culture supports stable machine formats, but standard wire formats should be preferred where available. Unicode text has multiple levels: UTF-16 code units, Unicode scalar values, grapheme/text elements, and normalization forms. Ordinal comparison is suited to protocol identifiers; linguistic comparison is for human language.

# Supplied names explained

| Supplied name | Meaning and edge case |
|---|---|
| `CultureInfo` | Culture descriptor containing number/date formats, calendar, text, and comparison services. |
| `CultureInfo.CurrentCulture` | Ambient culture for formatting/parsing and culture-sensitive comparison; flows across async execution context. |
| `CultureInfo.CurrentUICulture` | Ambient culture used by resource lookup/localized UI selection; distinct from value formatting culture. |
| `CultureInfo.InvariantCulture` | Stable culture-independent culture for machine-oriented conventions; not localized for users. |
| `CultureInfo.InstalledUICulture` | System-installed UI culture, which may differ from current/user UI culture. |
| `CultureInfo.DefaultThreadCurrentCulture` | Default culture for threads without an explicitly inherited/current value; changing process defaults can affect behavior broadly. |
| `CultureInfo.DefaultThreadCurrentUICulture` | Default resource/UI culture for threads. |
| `CultureInfo.GetCultureInfo(String)` | Retrieves a cached read-only culture by name. |
| `CultureInfo.CreateSpecificCulture(String)` | Creates a specific culture from a name, converting neutral culture to a likely specific region when possible. |
| `CultureInfo.GetCultures(CultureTypes)` | Enumerates cultures supported by the runtime/globalization data. |
| `CultureInfo.Name` | Culture name identifier such as `fr-FR`; available names can vary. |
| `CultureInfo.IsNeutralCulture` | Indicates language-only culture without a specific region. |
| `CultureInfo.Parent` | Parent culture in the culture hierarchy, often used for fallback. |
| `CultureInfo.CompareInfo` | Culture-aware string comparison/search implementation for the culture. |
| `CultureInfo.DateTimeFormat` | Date/time names, patterns, calendar, and related conventions. |
| `CultureInfo.NumberFormat` | Decimal/group separators, signs, symbols, and numeric conventions. |
| `CultureInfo.TextInfo` | Culture text casing and character information. |
| `CultureInfo.Calendar` | Calendar used by culture's date formatting/parsing defaults. |
| `CultureInfo.UseUserOverride` | Indicates whether Windows user overrides can affect culture data; behavior/platform support varies. |
| `CultureInfo.ReadOnly(CultureInfo)` | Wraps a culture as read-only to prevent changing nested format objects. |
| `CultureInfo.Clone()` | Creates a writable copy of culture state; clone before changing formats. |
| `CultureInfo.CurrentCulture AsyncLocal flow` | Ambient current culture follows async execution context; avoid assuming it is a process-global constant. |
| `CultureInfo.CurrentUICulture resource-selection role` | Selects localized resources and should be configured separately from numeric/date formatting where needed. |
| `Specific culture versus neutral culture` | Specific culture includes region conventions; neutral culture represents a language family and may lack concrete formatting details. |
| `Invariant culture machine-format role` | Provides stable convention independent of user's locale; still use standardized format specs for interoperable contracts. |
| `NumberFormatInfo` | Numeric display/parse conventions for separators, signs, symbols, and digits. |
| `NumberFormatInfo.NumberDecimalSeparator` | Decimal separator for general numbers. |
| `NumberFormatInfo.NumberGroupSeparator` | Grouping separator for general numbers. |
| `NumberFormatInfo.CurrencyDecimalSeparator` | Decimal separator for currency format. |
| `NumberFormatInfo.CurrencyGroupSeparator` | Grouping separator for currency format. |
| `NumberFormatInfo.CurrencySymbol` | Culture-specific currency symbol; symbol alone does not identify an ISO currency code. |
| `NumberFormatInfo.PercentSymbol` | Culture's percent symbol; formatting also scales numeric values according to format rules. |
| `NumberFormatInfo.NegativeSign` | Culture's negative sign string. |
| `NumberFormatInfo.PositiveSign` | Culture's positive sign string for applicable formats/parsers. |
| `NumberFormatInfo.NativeDigits` | Culture metadata for native digit strings; many .NET formatting/parsing operations still use ASCII digits, so do not assume this changes output. |
| `DateTimeFormatInfo` | Culture-specific patterns, names, calendar, and week conventions. |
| `DateTimeFormatInfo.ShortDatePattern` | Short date pattern; user/configuration data can vary. |
| `DateTimeFormatInfo.LongDatePattern` | Long date pattern with localized names. |
| `DateTimeFormatInfo.ShortTimePattern` | Short time display pattern. |
| `DateTimeFormatInfo.LongTimePattern` | Long time display pattern. |
| `DateTimeFormatInfo.FullDateTimePattern` | Combined long date/time pattern. |
| `DateTimeFormatInfo.MonthNames` | Localized month names; calendars with leap months may require additional leap-month fields. |
| `DateTimeFormatInfo.DayNames` | Localized day-of-week names. |
| `DateTimeFormatInfo.FirstDayOfWeek` | Culture's convention for first weekday; not universally Monday/Sunday. |
| `DateTimeFormatInfo.Calendar` | Calendar used by date formatting/parsing for the format info. |
| `Calendar` | Abstract calendar system for date component arithmetic and era/year rules. |
| `GregorianCalendar` | Gregorian calendar implementation used widely in civil dates. |
| `HebrewCalendar` | Hebrew lunisolar calendar implementation with leap-month behavior. |
| `HijriCalendar` | Islamic lunar calendar implementation with configurable adjustment behavior. |
| `JapaneseCalendar` | Calendar with Japanese era/year conventions; era data can update. |
| `PersianCalendar` | Persian calendar implementation. |
| `UmAlQuraCalendar` | Saudi Umm al-Qura calendar implementation with supported year range/data. |
| `Calendar.GetDaysInMonth(Int32,Int32)` | Returns days in a month for calendar year/month; era may be required through overloads for some calendars. |
| `Calendar.GetMonthsInYear(Int32)` | Returns months in a year; leap-month calendars can vary. |
| `Calendar.IsLeapYear(Int32)` | Tests leap-year rules for that calendar, not necessarily Gregorian rules. |
| `Calendar.Eras` | Calendar era identifiers; order/meaning varies by calendar. |
| `CompareInfo.Compare(String,String,CompareOptions)` | Culture-aware comparison with selected linguistic/ordinal options. |
| `CompareInfo.IndexOf(String,String,CompareOptions)` | Culture-aware search; may match according to linguistic rules rather than code-unit equality. |
| `CompareOptions.Ordinal` | Requests binary/ordinal comparison for the operation; use for protocol identifiers. |
| `CompareOptions.OrdinalIgnoreCase` | Ordinal case-insensitive comparison; not full linguistic casing. |
| `CompareOptions.IgnoreCase` | Ignores case according to culture comparison rules. |
| `CompareOptions.IgnoreNonSpace` | Ignores nonspacing marks during culture comparison; not a universal Unicode normalization operation. |
| `StringComparison.Ordinal` | Culture-independent code-unit comparison; suitable for protocol tokens and identifiers. |
| `StringComparison.OrdinalIgnoreCase` | Culture-independent ordinal case-insensitive comparison; suitable for case-insensitive identifiers with documented ASCII/Unicode policy. |
| `StringComparison.CurrentCulture` | Linguistic comparison using current culture; appropriate for user-facing sorting/search. |
| `StringComparison.CurrentCultureIgnoreCase` | Current-culture comparison ignoring case. |
| `StringComparison.InvariantCulture` | Linguistic comparison using invariant culture; not a replacement for ordinal identity comparison. |
| `StringComparer.Ordinal` | Reusable ordinal equality/order comparer. |
| `StringComparer.OrdinalIgnoreCase` | Reusable ordinal case-insensitive comparer. |
| `StringComparer.CurrentCulture` | Culture-aware comparer for user-facing collections/sorting. |
| `StringComparer.InvariantCulture` | Invariant linguistic comparer; behavior can still evolve with globalization data. |
| `TextInfo.ToLower(String)` | Converts using culture-specific casing rules; casing can change string length/content. |
| `TextInfo.ToUpper(String)` | Culture-aware uppercase conversion. |
| `TextInfo.ToTitleCase(String)` | Applies culture title-casing heuristics; not a language-perfect title editor. |
| `NormalizationForm.FormC` | Canonical composition normalization. |
| `NormalizationForm.FormD` | Canonical decomposition normalization. |
| `NormalizationForm.FormKC` | Compatibility composition normalization, which can fold distinctions. |
| `NormalizationForm.FormKD` | Compatibility decomposition normalization. |
| `String.Normalize(NormalizationForm)` | Returns normalized Unicode string; normalization does not define security/identifier policy by itself. |
| `Unicode scalar value versus UTF-16 code unit` | A scalar may require one or two UTF-16 `char` code units; a `char` is not always a full character. |
| `StringInfo text element enumeration` | Treats grapheme/text elements as user-perceived units, which can span several scalars/code units. |
| `StringInfo.GetTextElementEnumerator(String)` | Enumerates text elements according to Unicode text segmentation rules. |
| `StringInfo.ParseCombiningCharacters(String)` | Returns indexes of text element starts, not indexes of every scalar/code unit. |
| `Rune Unicode scalar value` | Represents one Unicode scalar value, excluding surrogate code points. |
| `Rune.ToUpperInvariant(Rune)` | Converts a rune using invariant casing when a single-rune mapping exists; some casing expands and cannot be represented as one rune. |
| `Rune.ToLowerInvariant(Rune)` | Invariant lowercase mapping for a scalar. |
| `Globalization ICU` | International Components for Unicode library used for culture, collation, and globalization data on supported .NET platforms. |
| `Windows National Language Support (NLS)` | Windows globalization API backend; available as a runtime mode on Windows. |
| `Globalization ICU data and CLDR updates` | ICU/CLDR updates can change culture formats, names, and sorting; persist machine contracts independently of them. |
| `System.Globalization.UseNls runtime setting` | Runtime configuration to use Windows NLS instead of ICU on supported Windows deployments. |
| `DOTNET_SYSTEM_GLOBALIZATION_INVARIANT` | Environment variable controlling invariant globalization mode for the runtime. |
| `Invariant globalization mode` | Reduces globalization data/features for small or controlled deployments; culture-sensitive behavior is limited. |
| `App-local ICU deployment` | Ships a chosen ICU data/library set with an app for more controlled globalization behavior; deployment and servicing become application responsibilities. |
| `Culture-sensitive sorting can vary across runtime and OS updates` | Collation data changes can reorder strings; do not use linguistic sort as a persistent identifier/order contract. |
| `Ordinal comparison for protocol identifiers` | Use deterministic ordinal comparison for tokens, keys, protocol names, and security-sensitive identifiers. |
| `Culture-sensitive comparison for displayed language text` | Use culture-aware collation for user-facing lists and search where linguistic behavior is intended. |

# Cross-item comparison

| Operation | Choose |
|---|---|
| Protocol key equality | `Ordinal` or `OrdinalIgnoreCase` per protocol spec. |
| Human language sorting | Explicit culture-aware comparer. |
| Stable machine numeric/date text | Invariant or standardized format. |
| Localized user display | User's explicit `CurrentCulture`/format provider. |
| Resource lookup | `CurrentUICulture`. |
| User-perceived cursor/length | Text-element APIs, not `string.Length`/single `char`. |

# Examples

```csharp
using System;
using System.Globalization;

string machineNumber = amount.ToString("G29", CultureInfo.InvariantCulture);
if (!decimal.TryParse(machineNumber, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal parsed))
    throw new FormatException("Invalid invariant amount.");

string display = parsed.ToString("C", CultureInfo.GetCultureInfo("fr-FR"));
```

The invariant representation is for a machine boundary; the currency display is explicitly localized. A currency symbol still needs a separate currency-code/business contract.

# Common mistakes

- Using `CurrentCulture` implicitly to persist values or parse network input.
- Using `CurrentUICulture` to format numeric/date values without reason.
- Treating `InvariantCulture` as ordinal comparison.
- Assuming `NativeDigits` changes all formatter/parser output.
- Using a culture-aware comparer for security identifiers or filenames.
- Treating `string.Length` as displayed-character count.
- Assuming normalization resolves confusable-character/security concerns.
- Treating ICU/CLDR sorting and formatting as immutable across updates.

# Knowledge checks with answers

1. **Which culture selects localized resources?** `CurrentUICulture`.
2. **Which comparison suits protocol identifiers?** Ordinal comparison, according to the protocol's case policy.
3. **Does `char` always represent one user-visible character?** No; it is a UTF-16 code unit.
4. **Does invariant culture mean bytewise comparison?** No; it is culture-independent formatting/linguistic data, while ordinal comparison is separate.
5. **Can ICU updates change sorting?** Yes; collation data updates can change linguistic ordering.
