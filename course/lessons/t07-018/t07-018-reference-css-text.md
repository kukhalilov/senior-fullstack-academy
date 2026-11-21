
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Text properties

# Scope and version

This lesson audits all 23 supplied properties in the `css-text` inventory. Its main reference is the CSS Text Module Level 4 Editor’s Draft dated 26 October 2026. That draft is work in progress; it explicitly notes that portions of white-space processing remain under discussion. CSS Text Level 3 is an older module and useful baseline, but Level 4 adds syntax and algorithms that should not be projected backward onto every implementation. The `text-fit` property is described by the separate CSS Text Level 5 delta draft, also work in progress; treat its grammar and behavior as proposed and check support before use. Specification maturity, browser availability, and language-specific quality are different questions. [CSS Text 4](https://drafts.csswg.org/css-text-4/) · [CSS Text 5](https://drafts.csswg.org/css-text-5/) · [CSS Text 3](https://drafts.csswg.org/css-text-3/) · [Unicode Line Breaking Algorithm, UAX #14](https://www.unicode.org/reports/tr14/)

# How this group fits the mental model

Text layout is easier to debug when split into four stages:

1. **Process spaces.** `white-space-collapse` decides which spaces, tabs, and segment breaks collapse or remain; `white-space` is a shorthand that also controls wrapping and, in Level 4, trimming.
2. **Find legal break opportunities.** Language and script rules provide defaults. `line-break`, `word-break`, `hyphens`, `overflow-wrap`, and markup such as `<wbr>` adjust where breaks may occur. A hyphenation break is a rendering opportunity and does not insert characters into the document’s underlying text.
3. **Choose a break and fit the line.** `text-wrap-mode` enables/disables soft wrapping; `text-wrap-style` selects a strategy among opportunities already available. `text-fit`, if implemented, is a newer proposal to scale inline content when it does not fit. Emergency breaks and fitting are not substitutes for sensible layout.
4. **Style the resulting lines and runs.** Alignment, indentation, punctuation hanging, contextual spacing, and letter/word spacing affect presentation. Text transforms change what is drawn, not the semantic source text.

Correct language metadata (`lang`), writing mode, fonts, scripts, markup, inline size, and available hyphenation/word-boundary dictionaries all matter. A value that works for English paragraphs may be poor for Japanese headings, Thai text, Arabic shaping, or mixed-script content. CSS does not promise identical line breaks on every platform.

In the Level 4 property definitions, all 23 assigned names are inherited. Most apply to text; `text-align`, `text-align-last`, `text-indent`, and the Level 5 `text-fit` apply to block containers, while `letter-spacing` applies to inline boxes and text. Aliased `word-wrap` follows `overflow-wrap`.

# Supplied names explained

## Whitespace, wrapping, and legal break opportunities

| Exact name | Grammar and practical behavior |
| --- | --- |
| `white-space` | Shorthand combining `white-space-collapse`, `text-wrap-mode`, and in the Level 4 draft `white-space-trim`. Common keywords map as follows: `normal` = collapse + wrap; `pre` = preserve + nowrap; `pre-wrap` = preserve + wrap; `pre-line` = preserve-breaks + wrap; `nowrap` = collapse + nowrap; `break-spaces` = preserve with a wrap opportunity after each space/tab. An omitted longhand is reset to its initial value. Whitespace processing is rendering behavior; it does not rewrite DOM text. The Level 4 shorthand mixes longhands with different inheritance behavior, another reason to use longhands when precise control matters. |
| `white-space-collapse` | `collapse`, `discard`, `preserve`, `preserve-breaks`, `preserve-spaces`, or `break-spaces`. `collapse` collapses runs; `preserve` retains spaces and segment breaks; `preserve-breaks` collapses spaces but keeps segment breaks as forced breaks; `preserve-spaces` preserves spacing but turns tabs and segment breaks into spaces; `break-spaces` preserves spaces and exposes a wrap opportunity after each preserved space/tab; `discard` discards whitespace. CSS Text 4’s section is still under discussion and may change. Parser normalization can occur before CSS, so CSS cannot recover source whitespace already removed by markup processing. |
| `text-wrap-mode` | `wrap` or `nowrap`. Controls whether soft wrapping is allowed. It does not itself determine where breaks are legal. In `white-space: pre`, wrapping is disabled while source segment breaks remain forced breaks. |
| `text-wrap-style` | `auto`, `balance`, `stable`, `pretty`, or `avoid-short-last-line` in the Level 4 draft. It selects a strategy for choosing among existing soft wrap opportunities: `auto` is UA-defined/default; `balance` aims for balanced lines and is intended for short headings/captions; `stable` avoids reflowing earlier lines while editing; `pretty` can spend more time seeking a better body-text layout; `avoid-short-last-line` tries to avoid an excessively short last line. It does not create new break opportunities. Quality, limits, and performance are user-agent dependent; `balance` may fall back to `auto` for long blocks. |
| `text-wrap` | Shorthand for `text-wrap-mode` and `text-wrap-style`, such as `wrap balance` or `nowrap`. As with other shorthands, omitted components reset to their initial values. Use the mode to answer “may this wrap?” and the style to answer “which legal breaks should be selected?” |
| `line-break` | `auto`, `loose`, `normal`, `strict`, or `anywhere`. Primarily tailors punctuation/character line-breaking strictness for CJK and related writing systems; the exact tailoring for some levels is UA- and language-dependent. `anywhere` permits a break around every typographic character unit, even where ordinary prohibitions apply, and does not prioritize opportunities; it is much more aggressive than ordinary punctuation strictness. Hyphenation is not applied for this value. |
| `word-break` | `normal`, `break-all`, `keep-all`, `manual`, `auto-phrase`, or legacy `break-word`. `break-all` permits breaking between typographic character units in otherwise unbroken words and disables hyphenation; `keep-all` suppresses many intra-word CJK opportunities; `manual` disables UA lexical word analysis (useful for misdetected Southeast Asian language text when authors mark boundaries with `<wbr>` or U+200B); `auto-phrase` asks a supporting UA to detect phrase boundaries, requiring suitable language analysis and metadata, and suppresses hyphenation. Legacy `break-word` is retained for compatibility and has the effect of `normal` plus `overflow-wrap:anywhere`, regardless of `overflow-wrap`; prefer the modern properties. It must not override explicit `<wbr>`/U+200B breaks or breaks required by `line-break`. |
| `overflow-wrap` | `normal`, `break-word`, or `anywhere`. `normal` uses ordinary legal opportunities. If none prevents overflow, `anywhere` may add an emergency break inside an otherwise unbreakable sequence; those opportunities count for min-content sizing. `break-word` has the similar emergency visual effect but its added opportunities do **not** count for min-content sizing. Grapheme clusters remain together, no hyphen character is inserted, and shaping-sensitive text (for example Arabic joining) is shaped as if unbroken. Use for long URLs/IDs, not as the first choice for ordinary prose. |
| `word-wrap` | Legacy alias of `overflow-wrap`, retained for compatibility. It is not a separate wrapping algorithm or a separate modern control. |
| `hyphens` | `none`, `manual`, or `auto` (initial `manual`). `manual` allows only explicitly marked conditional-hyphen opportunities; `auto` additionally permits language-sensitive automatic hyphenation when the UA knows the content language and has an appropriate resource. Automatic splitting depends on correct `lang`, dictionaries/rules, word-length limits, and typography. It may change spelling at a line break in some languages, but must not alter the underlying text, selection, or search content. `none` suppresses hyphenation, including conditional hyphens, while visible ordinary hyphen characters still provide their normal line-break opportunities. |
| `hyphenate-character` | `auto` or a string. Chooses the visible marker at an automatic or discretionary hyphenation point; `auto` uses the UA’s language/typographic convention. It changes the rendering marker, not the source text. A custom string can be empty or contain multiple characters; implementations may truncate it, but not in the middle of a typographic character unit. It has no effect when no hyphenation break is taken. |
| `hyphenate-limit-chars` | One to three values, each `auto` or a non-negative integer: `[ auto | <integer [0,∞]> ]{1,3}`. Values set the minimum total word length, minimum characters before the break, and minimum characters after it. If the third value is omitted, it matches the second; if the second is omitted, it is `auto`. `auto` lets the UA choose language/layout-sensitive limits. Combining marks and intra-word punctuation do not count in the draft’s character-count rule. Limits guide hyphenation; they do not force it. |
| `tab-size` | A non-negative number or length; initial value `8`. A number is a count of space advances, while a length specifies the tab stop size directly. Tabs advance to tab stops rather than adding a fixed gap after every preceding character. Rendering also depends on whitespace preservation: collapsed tabs do not act like visible aligned code tabs. |

## Alignment, transformation, and spacing

| Exact name | Grammar and practical behavior |
| --- | --- |
| `text-align` | Shorthand values: `start`, `end`, `left`, `right`, `center`, `justify`, `match-parent`, `justify-all`, and a single-character `<string>` for character alignment in a table cell. `start`/`end` follow the inline direction; `left`/`right` are physical. `justify` distributes spacing according to `text-justify`; the last line before a forced break is normally start-aligned. `justify-all` also justifies the last line. Most values reset the last-line setting to `auto`; `match-parent` sets both alignment longhands. It aligns inline content within each line box, not the block box within the viewport. |
| `text-align-last` | `auto`, `start`, `end`, `left`, `right`, `center`, `justify`, or `match-parent`. Controls the last line and lines immediately before forced breaks. `auto` follows the general alignment, except a justified block’s last line defaults to start alignment. It does not change the alignment of every ordinary line. |
| `text-justify` | `auto`, `none`, `inter-word`, `inter-character`, `ruby`, optionally combined with `no-compress`; legacy `distribute` aliases `inter-character`. It selects justification behavior only when alignment is justified. `auto` chooses a language-appropriate UA method; `inter-word` mainly expands word separators; `inter-character` distributes at character opportunities; `ruby` follows ruby-oriented rules; `none` adds no justification spacing; `no-compress` prevents compression of spacing from `text-autospace` and `text-spacing-trim`. Justification is writing-system-sensitive and CSS does not define a single ideal algorithm. |
| `text-indent` | A `<length-percentage>` with optional `hanging` and/or `each-line` keywords. By default only the first formatted line is indented; `each-line` also affects lines after forced breaks, and `hanging` reverses which lines receive the indent. A percentage is relative to the block container’s own inline-size, not the font size. Negative or overlarge indents can overflow. Indentation is not a replacement for paragraph margins or semantic structure. |
| `text-transform` | `none`, `capitalize`, `uppercase`, `lowercase`, `full-width`, `full-size-kana`, and `math-auto` in the current Level 4 draft. Case conversion is language-sensitive (for example, locale-specific casing); `full-width` maps characters where a full-width counterpart exists; `full-size-kana` expands small Kana; `math-auto` is for mathematical text processing. These are presentational transforms: they do not change source text or make lossy transformed text a safe substitute for correct content, labels, or accessible names. |
| `hanging-punctuation` | `none` or combinations of `first`, `last`, and `[force-end | allow-end]`. `first` can hang opening punctuation/ideographic space at the start of an element’s first formatted line; `last` can hang closing punctuation at the end of its last formatted line; `force-end` forces eligible stops/commas to hang at line ends; `allow-end` permits them conditionally. At most one punctuation character may hang at a line edge. It can protrude beyond the content edge and cause overflow if padding is insufficient. |
| `text-autospace` | Current Level 4 grammar: `normal | auto | <autospace>`, where `<autospace>` includes `no-autospace`, combinations of `ideograph-alpha`, `ideograph-numeric`, and `punctuation`, optionally with `insert` or `replace`. `normal` provides default ideograph/letter and ideograph/numeral spacing; `auto` lets the UA choose spacing; `no-autospace` disables automatic spacing. `punctuation` currently adds language-specific nonbreaking spacing for French punctuation in this draft. `insert` adds only where no Unicode separator exists; `replace` also replaces an existing U+0020. It is a rendering-only effect and must not change copied plain text. The feature is additive with `word-spacing` and `letter-spacing`; use correct language tags and inspect target browsers. |
| `letter-spacing` | `normal` or a `<length-percentage>` in the current Level 4 draft. Adds tracking between typographic character units; percentages resolve against the current element’s used font-size, unlike inherited `em` lengths, which become absolute lengths. Negative values are permitted but may be limited by implementations. CSS suppresses added spacing at the start and end of a line so it does not create trailing edge spacing. Excessive tracking can impair readability and interact visibly with shaping, ligatures, and scripts. |
| `word-spacing` | `normal` or a `<length-percentage>`, added to the font’s natural spacing at word separators; percentages are relative to the used font-size. Values may be negative. It does not generally create word boundaries for scripts whose words are detected linguistically rather than separated by a character. It is not the same as `letter-spacing`, which tracks between typographic character units. |
| `text-fit` | A CSS Text Level 5 draft proposal for scaling inline-level content when it does not fit its line box. Its grammar is `[ none | grow | shrink ] [ consistent | per-line | per-line-all ]? <percentage>?`; `grow`/`shrink` set direction; `consistent` shares one scale across lines, `per-line` scales each line but skips the last line and lines ending at forced breaks, and `per-line-all` includes those lines. An optional percentage caps growth at 100% or above, or limits shrinkage to a minimum from 0% through 100%; without a valid limit, scaling is unbounded. `none` disables fitting. The draft has no test coverage; `text-indent`, line padding, non-percentage letter/word spacing, and atomic inlines are examples of parts that are not scaled. The draft also records an unresolved zoom concern when the container’s inline size follows the viewport. This is not a general substitute for responsive layout, wrapping, or accessible text sizing. Treat it as draft-only and verify implementation before use. |

# Cross-item comparison

| Question | Controls | Key distinction |
| --- | --- | --- |
| Are source spaces/newlines collapsed? | `white-space` / `white-space-collapse` | Controls whitespace processing; does not change the source DOM string. |
| Are soft wraps allowed? | `text-wrap-mode` or `white-space` | Controls permission to wrap, not break locations. |
| Where may ordinary text break? | `line-break`, `word-break`, language rules | Adjusts script/word/punctuation opportunities. Include `lang` for language-sensitive behavior. |
| Can a long token break to avoid overflow? | `overflow-wrap` | Adds emergency opportunities; `anywhere` and `break-word` differ in min-content sizing. |
| Can a word break with a visible hyphen? | `hyphens`, `hyphenate-character`, `hyphenate-limit-chars` | Language-sensitive hyphenation, visible mark, and thresholds are separate controls. |
| Which available line break should the UA choose? | `text-wrap-style` | Selects a wrapping strategy but does not create opportunities. |
| How is inline content distributed in a line? | `text-align`, `text-align-last`, `text-justify` | Alignment applies per line; justification is one alignment method, tuned by language-sensitive rules. |
| What text gets indented? | `text-indent` | Applies to first/forced-break lines by default; soft-wrapped lines are not separate paragraphs. |
| Is spacing automatic or explicit? | `text-autospace`, `letter-spacing`, `word-spacing` | Contextual script-boundary spacing versus tracking versus extra space at word separator characters. |

# Examples

## Multilingual prose with deliberate emergency wrapping

```html
<p lang="en" class="intro">
  Read the documentation at
  https://example.invalid/a-very-long-unbroken-resource-identifier.
</p>
```

```css
.intro {
  white-space: normal;
  text-wrap: wrap pretty;
  overflow-wrap: anywhere;
  hyphens: auto;
  hyphenate-limit-chars: 8 3 3;
}
```

Normal English break points and language-aware hyphenation are preferred; `overflow-wrap:anywhere` is an emergency escape for a long URL/token. It does not insert a hyphen. A browser that lacks a hyphenation dictionary may simply provide no automatic word breaks. `pretty` is a draft strategy preference, not a promise of a particular line arrangement.

## Preserve source whitespace in code, but keep long lines usable

```css
pre code {
  white-space: pre-wrap;
  tab-size: 4;
  overflow-wrap: anywhere;
}
```

The preserved newlines and spaces remain visible and soft wrapping is allowed. `overflow-wrap` can still split an otherwise unbreakable token. Use `pre` instead if code lines must remain unwrapped and the containing region supplies horizontal scrolling; do not use `word-break:break-all` as the default code strategy.

## Logical alignment and character-based table alignment

```css
.article { text-align: start; }
.article p { text-indent: 1.5em; }
.article .centered-heading { text-align: center; }
.article .last-line { text-align-last: end; }
```

Logical `start`/`end` adapt to direction and writing mode. Physical `left`/`right` do not. `text-align-last` affects the final line; it does not make every line end-aligned.

## Script-aware spacing and presentation-only transforms

```css
:lang(ja) .mixed-script-label {
  text-autospace: normal;
  text-transform: full-width;
}

.metadata { word-spacing: 0.04em; }
.display-title { letter-spacing: -0.015em; }
```

Use these as visual refinements after checking actual Japanese/Latin output. Keep meaningful text in its correct source case and Unicode form; do not rely on CSS casing for user names, identifiers, form values, accessible labels, or search behavior.

# Common mistakes

- Treating `white-space` as only “preserve spaces” and forgetting it also controls wrapping and resets shorthand longhands.
- Confusing forced line breaks from preserved newlines with soft wraps at legal opportunities.
- Expecting `text-wrap-style: balance` or `pretty` to invent a break point or guarantee identical layout across engines.
- Using `word-break: break-all` for URLs/prose when `overflow-wrap` is the targeted emergency control.
- Assuming `overflow-wrap:anywhere` and `break-word` are identical for intrinsic min-content sizing.
- Expecting `hyphens:auto` to work without correct `lang` or a usable UA dictionary; CSS cannot infer every language’s rules.
- Believing a displayed hyphen is inserted into the DOM or copied text.
- Treating `text-align: justify` as a complete, language-independent justification algorithm or assuming the last line is justified by default.
- Using `text-indent` to simulate paragraph spacing or thinking it indents every wrapped line.
- Treating `letter-spacing` and `word-spacing` as interchangeable; one tracks character units, the other adds at word separators.
- Assuming text transformations alter stored/searchable text, or that `capitalize` means title-case each word by ASCII spaces.
- Using `text-fit` as a settled production feature or as an excuse to prevent users from zooming text.
- Relying on new Level 4/5 values without checking current engine support and accessibility implications.

# Knowledge checks with answers

1. **What is the difference between `text-wrap-mode` and `text-wrap-style`?** Mode allows or forbids soft wrapping; style chooses among existing break opportunities.
2. **Why can `overflow-wrap:anywhere` change a grid or flex item’s min-content size differently from `break-word`?** Anywhere-created opportunities count when calculating min-content size; break-word-created ones do not.
3. **Does `white-space:pre-wrap` mean “no wrapping”?** No. It preserves whitespace and permits wrapping. `pre` preserves whitespace but disables soft wrapping.
4. **Why may automatic hyphenation not appear even with `hyphens:auto`?** The language may be missing/incorrect, the browser may lack a suitable dictionary, or word-length limits may disallow the break.
5. **Which property changes the selection of a visible hyphenation marker?** `hyphenate-character`; it does not itself cause hyphenation.
6. **Which values in `text-align` are writing-mode-aware?** `start` and `end`; `left` and `right` refer to physical sides.
7. **Will `text-align-last:justify` justify every line?** No. It controls the last line / lines before forced breaks; ordinary lines are governed by `text-align`.
8. **Does `word-break:keep-all` remove an explicit `<wbr>` opportunity?** No. Explicitly introduced required opportunities must be honored.
9. **Does `text-transform:uppercase` uppercase the underlying text returned by the DOM?** No. It changes presentation, not source content.
10. **Which spacing property adds extra space at word-separator characters?** `word-spacing`; `letter-spacing` adds tracking between typographic character units, and `text-autospace` is contextual script-aware spacing.

# Sources

- [CSS Text Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-text-4/)
- [CSS Text Module Level 5 Editor’s Draft](https://drafts.csswg.org/css-text-5/)
- [CSS Text Module Level 3](https://drafts.csswg.org/css-text-3/)
- [Unicode Standard Annex #14: Unicode Line Breaking Algorithm](https://www.unicode.org/reports/tr14/)
- [CSS Writing Modes Module Level 4](https://drafts.csswg.org/css-writing-modes-4/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
