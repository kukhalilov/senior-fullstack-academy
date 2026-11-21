
# dates times globalization formatting and regular expressions — Reference: Regex APIs, options, pattern language, captures, replacement, timeouts, and source generation

# Scope and version

This lesson covers all 124 names in `regular-expression-engine-and-patterns`. The inventory includes .NET 11's `AnyNewLine` option and .NET 7's nonbacktracking/source-generation features. Sources: [regex options](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options), [backtracking risks](https://learn.microsoft.com/en-us/dotnet/standard/base-types/backtracking-in-regular-expressions), and [source generators](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-source-generators).

# How this group fits the mental model

A regex pattern is executable matching logic. Options change anchors, dot, capture, culture, or engine behavior. Backtracking offers expressive constructs but can consume extreme time on adversarial inputs. A finite timeout is essential for untrusted cases; `NonBacktracking` guarantees linear input-time processing for its supported syntax but excludes several constructs. Source generation moves pattern analysis/compilation to build time. Regex checks lexical shape, not complete semantic validity.

# Supplied names explained

| Supplied name | Meaning and important behavior |
|---|---|
| `Regex` | .NET regular-expression engine/API for matching, splitting, and replacement. |
| `Regex(String)` | Creates instance for a pattern using defaults; default timeout is infinite unless configured by application/runtime policy. |
| `Regex(String,RegexOptions)` | Creates instance with engine/matching options. |
| `Regex(String,RegexOptions,TimeSpan)` | Creates instance with finite match timeout; validate timeout and catch timeout exceptions. |
| `Regex.IsMatch(String)` | Tests whether any match exists without returning full match details. |
| `Regex.Match(String)` | Finds first match and returns a `Match` with success/value/index/groups. |
| `Regex.Matches(String)` | Returns collection of matches; collection may evaluate lazily as enumerated. |
| `Regex.EnumerateMatches(ReadOnlySpan<Char>)` | Enumerates matches over span with lower allocation; enumerator is stack-bound and values refer to source positions. |
| `Regex.Split(String)` | Splits input at matches; captures in pattern can also appear in output. |
| `Regex.Replace(String,String)` | Replaces matches using replacement-group syntax. |
| `Regex.Replace(String,MatchEvaluator)` | Computes replacement text per match with delegate. |
| `Regex.Replace(String,String,RegexOptions,TimeSpan)` | Static replacement with explicit options and finite timeout. |
| `Regex.Count(String)` | Counts matches without materializing a `MatchCollection`. |
| `Regex.GetGroupNames()` | Returns group names/number strings for the pattern. |
| `Regex.GetGroupNumbers()` | Returns capture group numbers, including group zero. |
| `Regex.GroupNameFromNumber(Int32)` | Maps group number to name, or number text when unnamed. |
| `Regex.GroupNumberFromName(String)` | Resolves a group name to number; invalid name yields failure sentinel. |
| `Regex.Options` | Options configured on instance; does not reflect all inline option changes in the pattern. |
| `Regex.MatchTimeout` | Per-match timeout configured on instance; infinite value removes the bound. |
| `RegexOptions.None` | Default engine behavior. |
| `RegexOptions.IgnoreCase` | Case-insensitive match; case rules are culture-sensitive unless `CultureInvariant` is used. |
| `RegexOptions.Multiline` | Makes `^`/`$` match line boundaries as well as input boundaries. |
| `RegexOptions.Singleline` | Makes `.` match newline characters; independent of `Multiline`. |
| `RegexOptions.ExplicitCapture` | Captures only named/numbered explicit groups; ordinary parentheses become noncapturing. |
| `RegexOptions.Compiled` | Compiles regex at runtime to improve repeated use in some cases, with startup/JIT cost; not the same as source generation. |
| `RegexOptions.IgnorePatternWhitespace` | Ignores unescaped pattern whitespace and enables `#` comments outside character classes. |
| `RegexOptions.RightToLeft` | Searches from right to left; changes match direction/index selection. |
| `RegexOptions.ECMAScript` | Applies ECMAScript-compatible subset behavior; has option compatibility restrictions. |
| `RegexOptions.CultureInvariant` | Makes case behavior independent of current culture. |
| `RegexOptions.NonBacktracking` | Uses linear-time engine for supported constructs; lookarounds/backreferences and other constructs are unsupported. |
| `RegexOptions.AnyNewLine` | .NET 11 option makes anchors, `\Z`, and dot recognize common newline sequences beyond LF; incompatible with ECMAScript and NonBacktracking. |
| `GeneratedRegexAttribute` | Marks a partial method for compile-time regex source generation. |
| `GeneratedRegexAttribute source-generation option overloads` | Constructor forms accept pattern, options, timeout, and culture name where supported; choose explicit finite timeout/culture if needed. |
| `GeneratedRegex partial method declaration` | Partial method declaration with supported return type/visibility shape that the generator implements. |
| `Regex source generator compile-time diagnostics` | Reports invalid or unsupported patterns/options at build time; diagnostics can catch issues before runtime. |
| `Regex.CacheSize` | Controls number of static regex cache entries; cache is an optimization, not a lifetime/security policy. |
| `Regex.InfiniteMatchTimeout` | Sentinel for no match timeout; unsafe for attacker-controlled inputs. |
| `RegexMatchTimeoutException` | Signals match execution exceeded configured timeout; handle as bounded failure and avoid retrying same pathological input endlessly. |
| `RegexCompilationInfo legacy CompileToAssembly workflow` | Legacy .NET Framework workflow for compiling regexes to an assembly; not a modern .NET deployment approach. |
| `RegexOptions.Compiled JIT compilation cost` | Runtime compilation can cost startup/memory and may not beat interpreted/cached use for infrequent patterns. |
| `RegexOptions.NonBacktracking linear-time guarantee` | Supported patterns process in linear time with respect to input length; output/match count and surrounding work still need bounds. |
| `Backtracking regex engine behavior` | Saves alternative states and revisits them when later tokens fail; expressive but can produce large search trees. |
| `Catastrophic backtracking` | Exponential-like path exploration from ambiguous nested optional/alternative patterns on near-matching input. |
| `Literal character matching` | Matches the character literally; escape metacharacters when they should not be syntax. |
| `Character class` | Bracketed set/range of characters; escaping and Unicode categories affect membership. |
| `Negated character class` | Class beginning with `^` matches characters outside the set, with newline/Unicode behavior considered. |
| `Character class subtraction` | Removes a nested character set from a class using .NET class-subtraction syntax. |
| `Unicode category escape p{...}` | Matches Unicode general category or named block using `\p{...}`; behavior follows Unicode data/runtime. |
| `Character escape and Unicode escape` | Backslash escapes syntax or expresses code units/scalars in supported escape forms; distinguish UTF-16 from Unicode scalar. |
| `Dot wildcard and newline behavior` | `.` matches any character except newline by default; `Singleline` and `AnyNewLine` affect newline handling. |
| `AnyNewLine option newline behavior` | Expands recognized newline sequences for anchors/dot as documented in .NET 11. |
| `Start anchor caret` | Matches input start, or line start with `Multiline`. |
| `End anchor dollar` | Matches input end or before final newline; with `Multiline`, matches line ends. |
| `Absolute beginning anchor A` | `\A` matches only absolute input start, unaffected by multiline. |
| `Absolute end anchor z` | `\z` matches only absolute input end. |
| `Absolute end or before final newline anchor Z` | `\Z` matches absolute end or before final newline; `AnyNewLine` broadens newline recognition. |
| `Word boundary b` | `\b` matches transition between word and nonword characters according to engine word-character rules. |
| `Non-word-boundary B` | `\B` matches a position that is not a word boundary. |
| `Quantifier star` | `*` matches zero or more repetitions, greedily by default. |
| `Quantifier plus` | `+` matches one or more repetitions. |
| `Quantifier question mark` | `?` makes preceding item optional (or modifies a quantifier as lazy). |
| `Bounded quantifier braces` | `{m}`, `{m,}`, `{m,n}` specify repetition counts/bounds. |
| `Lazy quantifier suffix question mark` | Makes a quantifier prefer fewer repetitions first; backtracking may still occur. |
| `Possessive quantifier syntax is not supported by .NET Regex` | PCRE-style possessive suffix quantifiers are not .NET syntax; atomic groups can sometimes express related commitment. |
| `Alternation group` | `|` tries alternative subpatterns; order and backtracking affect which match is selected. |
| `Capturing group` | Parenthesized subexpression saves matched text as numbered group unless explicit-capture mode changes behavior. |
| `Named capturing group` | `(?<name>...)` captures subexpression under a name; names should be unique/documented. |
| `Noncapturing group` | `(?:...)` groups syntax without storing a capture. |
| `Atomic group` | `(?>...)` discards internal backtracking states after group succeeds; unsupported by NonBacktracking engine. |
| `Positive lookahead assertion` | `(?=...)` requires following text to match without consuming it; unsupported by NonBacktracking. |
| `Negative lookahead assertion` | `(?!...)` requires following text not to match without consuming; unsupported by NonBacktracking. |
| `Positive lookbehind assertion` | `(?<=...)` requires preceding text to match without consuming; .NET supports lookbehind subject to engine constraints. |
| `Negative lookbehind assertion` | `(?<!...)` requires preceding text not to match; unsupported by NonBacktracking. |
| `Backreference by number` | Re-matches text captured by a numbered group; makes pattern dependent on prior captured content. |
| `Backreference by name` | Re-matches captured text by group name. |
| `Balancing group` | .NET-specific capture-stack construct useful for balancing nested delimiters; complex and unsupported by NonBacktracking. |
| `Conditional group construct` | Selects subpattern based on whether a capture/lookahead condition succeeded. |
| `Inline option group` | `(?imnsx-imnsx)` changes options for part/all of pattern. |
| `RegexOptions.IgnoreCase and culture behavior` | Case-insensitive comparison uses culture rules unless invariant mode is specified. |
| `RegexOptions.Multiline anchor semantics` | Changes `^`/`$` only; it does not make dot match newlines. |
| `RegexOptions.Singleline dot semantics` | Changes dot behavior only; it does not make anchors line-oriented. |
| `RegexOptions.IgnorePatternWhitespace comments` | Allows layout whitespace and `#` comments outside classes; escape spaces/hash when literal. |
| `Match` | Result object for one regex match; unsuccessful result has `Success=false`. |
| `Match.Success` | Indicates whether a match was found. |
| `Match.Value` | Substring matched by the whole pattern. |
| `Match.Index` | Start position in input string, measured in UTF-16 code units. |
| `Match.Length` | Match length in UTF-16 code units. |
| `Match.Groups` | Collection including group zero and capture groups. |
| `Match.NextMatch()` | Continues searching after current match; zero-length matches require progress handling by engine. |
| `Group` | Captured value for a group; for repeated captures, `Value` is generally the final capture. |
| `Group.Success` | Indicates whether group matched. |
| `Group.Captures` | All captures made by a repeated group, not only final group value. |
| `Capture` | One captured text segment with value/index/length. |
| `CaptureCollection` | Ordered collection of captures for a group. |
| `Capture.Value` | Captured substring. |
| `Capture.Index` | Start index in UTF-16 code units. |
| `Capture.Length` | Captured length in UTF-16 code units. |
| `MatchCollection` | Collection of matches; enumeration may defer matching. |
| `MatchCollection.Count` | Forces/returns total match count and can perform matching work. |
| `MatchCollection.GetEnumerator()` | Enumerates matches; dispose/use normal enumeration and account for deferred work. |
| `GroupCollection.NamedGroups` | Named-group mapping convenience; only named captures are present. |
| `MatchEvaluator delegate` | Callback that computes replacement text from each `Match`. |
| `Replacement group substitution $1` | Inserts group 1 capture. |
| `Replacement named group ${name}` | Inserts named capture. |
| `Replacement whole match $&` | Inserts complete matched substring. |
| `Replacement prefix $`` | Inserts text before the match; can make output grow substantially. |
| `Replacement suffix $'` | Inserts text after match. |
| `Replacement last captured group $+` | Inserts last captured group; ambiguous/fragile compared with explicit names. |
| `Replacement escaped dollar $$` | Inserts literal `$`. |
| `Regex timeout for untrusted input` | Set finite timeout and handle `RegexMatchTimeoutException`; also cap input and pattern complexity. |
| `Trusted pattern versus untrusted input distinction` | A trusted fixed pattern can still be costly on hostile input; untrusted patterns add compilation/feature risks too. |
| `RegexOptions.NonBacktracking unsupported constructs` | Engine rejects constructs requiring backtracking or not implemented by its automaton model. |
| `NonBacktracking lookaround restriction` | Lookahead/lookbehind are unsupported. |
| `NonBacktracking backreference restriction` | Backreferences are unsupported because they require matching prior captured text. |
| `NonBacktracking atomic group restriction` | Atomic groups are unsupported. |
| `NonBacktracking balancing-group restriction` | Balancing groups are unsupported. |
| `NonBacktracking conditional-group restriction` | Conditional groups are unsupported. |
| `NonBacktracking \G anchor restriction` | `\G` anchor is not supported by the nonbacktracking engine. |
| `ECMAScript and RightToLeft incompatible with NonBacktracking` | These option combinations cannot be used together with the nonbacktracking engine. |
| `AnyNewLine incompatible with NonBacktracking and ECMAScript` | .NET 11 AnyNewLine cannot be combined with those engine modes. |
| `Regex source generation versus Compiled option` | Source generation emits regex implementation at build time; `Compiled` emits runtime dynamic code and pays runtime setup/JIT cost. |
| `Regex versus parser for nested grammars` | Use a parser when recursive/nested structure or semantic grammar exceeds regex's maintainable/safe scope. |
| `Regex validation versus canonicalization` | Matching accepted shape does not normalize equivalent representations or establish semantic validity. |
| `Regex is not a complete email-address validation strategy` | Email syntax and deliverability are broader than a practical regex; use bounded parsing plus confirmation/standard-library policy. |

# Cross-item comparison

| Approach | Strength | Constraint |
|---|---|---|
| Backtracking engine | Broad pattern features. | Use timeout and avoid ambiguous nested patterns. |
| NonBacktracking | Linear input-time guarantee for supported patterns. | No lookaround/backreferences/atomic/balancing/conditional constructs. |
| `GeneratedRegex` | Build-time generated, analyzable implementation. | Requires partial method/source-generator-compatible pattern. |
| `RegexOptions.Compiled` | Runtime compiled regex for reuse. | Startup/JIT cost; does not eliminate catastrophic backtracking. |
| Parser | Structured/nested semantic grammar. | More code, but clearer semantics and controlled complexity. |

# Examples

```csharp
using System;
using System.Text.RegularExpressions;

static class IdentifierValidator
{
    private static readonly Regex Identifier = new(
        @"\A[A-Za-z_][A-Za-z0-9_]{0,63}\z",
        RegexOptions.CultureInvariant | RegexOptions.NonBacktracking,
        TimeSpan.FromMilliseconds(100));

    public static bool IsIdentifier(string value) =>
        value.Length <= 64 && Identifier.IsMatch(value);
}
```

The pattern is anchored at both absolute ends, has a bounded repetition, uses ASCII explicitly, and still has a timeout. This validates lexical shape only; reserved words and business authorization remain separate.

# Common mistakes

- Using ambiguous nested quantifiers on untrusted input without a timeout.
- Confusing `Singleline` with `Multiline`.
- Assuming `IgnoreCase` is culture-independent.
- Assuming `NonBacktracking` accepts every pattern feature.
- Using `$` when strict absolute end (`\z`) is required.
- Treating captured indexes/lengths as Unicode grapheme positions; they are UTF-16 offsets.
- Assuming `RegexOptions.Compiled` removes catastrophic backtracking.
- Using regex as complete email validation or nested-language parser.

# Knowledge checks with answers

1. **What does `NonBacktracking` guarantee?** Linear matching time in input length for supported pattern constructs.
2. **What does `Singleline` change?** Dot/newline behavior; anchors remain governed by other options.
3. **What are `Match.Index` units?** UTF-16 code units.
4. **Does source generation have the same cost model as `Compiled`?** No; source generation happens at build time, while `Compiled` generates/JITs at runtime.
5. **What should untrusted regex processing include?** Input bounds, finite timeout or compatible nonbacktracking engine, and controlled failure handling.
