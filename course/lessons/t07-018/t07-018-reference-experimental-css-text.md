# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS text-spacing-trim properties

## Scope and version

This lesson covers the supplied CSS property text-spacing-trim. The current CSS Text Module Level 4 Working Draft was published 2026-08-14; its Editor’s Draft was updated 2026-10-26. Both are work in progress, not a final Recommendation. The draft itself notes spotty tests for inheritance, applicability, animation, line-edge behavior, and many punctuation pairs. Sources checked 2026-11-20.

## How this group fits the mental model

In Japanese, Chinese, and other CJK typography, many punctuation marks occupy a full ideographic cell even though the visible glyph sits toward one side. This built-in blank space can make punctuation look balanced in isolation, but waste space or create awkward gaps when punctuation is adjacent or sits at a line edge.

text-spacing-trim controls whether selected fullwidth punctuation is treated as fullwidth (spaced) or halfwidth (trimmed/flush), based on its position at the start or end of a line and on neighboring punctuation. It is contextual typesetting, not a generic letter-spacing control and not an instruction to replace a punctuation glyph with a different halfwidth character.

A useful mental model is three independent positions: line start, between adjacent punctuation, and line end. The longhand value can choose a policy for each position. Character classes and font metrics then determine which glyph spacing can actually be adjusted. The property is inherited, so placing it on a block affects text descendants unless overridden.

## Supplied names explained

### Property purpose and formal definition

text-spacing-trim controls contextual spacing of CJK fullwidth punctuation using character-class rules.

| Descriptor | Current CSS Text Level 4 draft |
| --- | --- |
| Value | <spacing-trim> or auto |
| Initial value | normal |
| Applies to | text |
| Inherited | yes |
| Computed value | auto, trim-all, or three keywords representing start, adjacent, and end positions |
| Animation | discrete |
| Percentages | none |

The CSS-wide cascade keywords inherit, initial, revert, revert-layer, and unset are also valid. The initial keyword resets the property to its initial value normal; it is distinct from the literal property value normal only in syntax context.

### Complete grammar

The current draft grammar is:

    text-spacing-trim: <spacing-trim> | auto;

    <spacing-trim> =
      [ trim-start | space-start | space-first ]
      || [ trim-adjacent | space-adjacent ]
      || [ trim-end | space-end | allow-end ]
      | trim-both
      | space-all
      | trim-all;

The double bar means the three bracketed position groups may be supplied in any order, with at most one choice from each group. A single keyword from one group can be combined with a keyword from another group. For an omitted group, the default is trim-start for line start, trim-adjacent between punctuation, and allow-end for line end.

Examples of valid combinations include trim-start trim-end and space-start trim-adjacent allow-end. Repeating two choices from the same group is invalid, as is combining one of the three whole-property keywords with a position-specific group.

### Position-specific keywords

| Keyword | Effect |
| --- | --- |
| trim-start | Trim fullwidth opening punctuation at the start of every line, making it flush there. |
| space-start | Keep fullwidth opening punctuation fullwidth/spaced at the start of every line. |
| space-first | Keep opening punctuation spaced on the first line of the block and after each forced line break; on other line starts, behave as space-start per the current draft. This value exists for compatibility requirements. |
| trim-adjacent | Collapse the spacing between eligible adjacent fullwidth punctuation characters according to the draft’s character-class rules. |
| space-adjacent | Keep adjacent punctuation fullwidth/spaced rather than collapsing their spacing. |
| trim-end | Trim fullwidth closing punctuation at the end of every line. |
| space-end | Keep fullwidth closing punctuation fullwidth/spaced at every line end. |
| allow-end | At a line end, trim closing punctuation only when it does not otherwise fit before justification; otherwise keep it fullwidth. |

The terms opening and closing refer to punctuation classes defined by the specification; they do not mean every glyph that looks like a bracket in every writing system.

### Whole-property values and defaults

| Value | Meaning |
| --- | --- |
| normal | Compatibility behavior equivalent to space-start trim-adjacent allow-end. The start spacing may seem counterintuitive, but this historical behavior is retained for compatibility. |
| space-all | Equivalent to space-start space-adjacent space-end: keep punctuation fullwidth at starts, between adjacent pairs, and at line ends. |
| trim-both | Equivalent to trim-start trim-adjacent trim-end: trim at both line edges and collapse eligible adjacent punctuation. |
| trim-all | Trim the spacing typically associated with fullwidth opening punctuation, closing punctuation, and middle-dot punctuation regardless of position or adjacency. This is stronger than trim-both. |
| auto | Let the user agent choose typographically appropriate values. The choice may vary by browser and platform and need not match operating-system conventions. |

The draft’s omitted-component defaults are not the same as normal. An omitted component defaults to trim-start trim-adjacent allow-end, while the explicit initial value normal means space-start trim-adjacent allow-end. Avoid assuming that a single omitted-component declaration is shorthand for normal.

### What gets adjusted and how

The property operates on fullwidth punctuation such as opening and closing punctuation and the relevant middle-dot class. The draft defines the detailed Unicode classes and character lists; those are more precise than a hand-written list of familiar punctuation marks. It specifies contextual collapsing when eligible punctuation is adjacent on the same line. For example, opening punctuation can be trimmed after another opening mark, a fullwidth middle dot, an ideographic space, certain closing punctuation of an equal or larger font size, or a Unicode Open punctuation character. Closing punctuation has corresponding next-character rules, including a following middle dot, ideographic space, a larger opening punctuation mark, or Unicode Close punctuation. Font-size comparisons matter in these rules.

The user agent must achieve the requested spacing by trimming blank portions of glyphs or adding spacing; it must not substitute a different halfwidth glyph using OpenType hwid, because that can change glyph shape. The current draft says a user agent may use OpenType halt or vertical alternate vhal font features when available. With proportional punctuation glyphs that cannot be distinguished as fullwidth versus halfwidth, the draft says not to add or remove space for that glyph. A user agent may also avoid trimming if doing so would cause clipping, collisions, or excessive kerning.

This is why the same declaration can look different with different fonts, scripts, writing modes, and browser engines. The current draft also identifies incomplete test coverage, and the font and character-class rules continue to be refined.

## Cross-item comparison

This assigned group contains only text-spacing-trim, so there is no within-group comparison. Related controls are distinct:

- text-autospace inserts spacing at script boundaries or around punctuation; it solves a different spacing problem.
- text-spacing is a shorthand that sets text-spacing-trim together with text-autospace. A shorthand declaration can reset both constituent longhands.
- letter-spacing changes spacing between typographic character units more generally; it does not use the punctuation position and character-class rules described here.
- word-spacing changes word-separator spacing.
- font-feature-settings and font-variant-* select font features; they do not replace text-spacing-trim’s contextual policy.

The whole-property value none belongs to text-spacing, not text-spacing-trim. In the current draft, text-spacing: none sets text-spacing-trim to space-all and text-autospace to no-autospace. This is easy to misread as disabling punctuation spacing, when space-all actually retains fullwidth punctuation spacing and disables automatic inserted inter-script spacing.

## Examples

A compatibility-style baseline for Japanese or Chinese paragraphs can use the current initial behavior, then apply an intentional trim policy only where it improves the chosen font and layout:

    .cjk-copy {
      font-family: "Noto Sans JP", sans-serif;
      text-spacing-trim: normal;
    }

    .compact-heading {
      text-spacing-trim: trim-both;
    }

    .traditional-line-starts {
      text-spacing-trim: space-first trim-adjacent allow-end;
    }

Use the feature only after checking it in the target browser and font. A useful test page compares normal, space-all, space-first, and trim-start on identical text with line wrapping constrained, then tests narrow line widths so line-edge behavior becomes visible. Include consecutive opening and closing marks, middle dots, ideographic spaces, and punctuation at forced and soft line breaks. For ordinary Latin text, the property usually has no relevant punctuation to adjust.

## Browser support and practical use

MDN currently labels text-spacing-trim Experimental and Limited availability. Its Browser Compatibility Data records support in Chromium-based browsers from Chrome 123, with related Chromium products marked as mirrors; it records no support in Firefox or Safari as of the checked snapshot. Support data can change, so check current data for the exact browser and platform before shipping. Even where the property parses, do not infer that every grammar branch or every punctuation/font case behaves identically.

Use progressive enhancement: provide readable punctuation and layout without the feature, then add a narrowly targeted rule. Check the actual target writing system, font files, font fallback, writing direction/orientation, line breaks, and zoom. Do not use CSS to replace source punctuation or assume the browser can trim every font’s glyph safely.

## Common mistakes

- Treating text-spacing-trim as ordinary letter-spacing or word-spacing.
- Assuming fullwidth means the visible glyph fills the whole cell; the blank area can be part of the glyph advance.
- Assuming normal trims opening punctuation at the line start; its current compatibility behavior uses space-start.
- Confusing omitted-component defaults with the explicit normal value.
- Assuming space-first means only the first physical line; it also applies after forced line breaks.
- Treating trim-both and trim-all as synonyms: trim-all ignores position and adjacency and includes the relevant middle-dot class.
- Treating auto as deterministic across browsers and platforms.
- Assuming hwid is an allowed way to get halfwidth spacing; the current draft prohibits substituting halfwidth forms this way.
- Assuming support in one Chromium browser proves support in Firefox or Safari, or full behavior for every value.
- Setting the property globally without testing the target CJK content, fonts, line wrapping, and fallback behavior.
- Confusing text-spacing: none with text-spacing-trim: none; the latter is not in the property grammar.

## Knowledge checks with answers

1. What three positions does the property control? Line start, between adjacent punctuation, and line end.
2. What is the current initial value? normal.
3. What three values are used when position groups are omitted from a <spacing-trim> combination? trim-start, trim-adjacent, and allow-end.
4. What does normal expand to? space-start trim-adjacent allow-end.
5. How does space-first differ from space-start? It spaces opening punctuation on the block’s first line and after forced line breaks; space-start spaces it at every line start.
6. What is the key difference between trim-both and trim-all? trim-both combines edge trimming with adjacent-pair collapsing; trim-all trims the specified punctuation classes regardless of line position and adjacency.
7. Why can the result depend on the font? The user agent needs font metrics/features to adjust glyph advance safely; some proportional glyphs cannot be changed, and trimming can risk collisions or clipping.
8. Which browsers are listed as supporting it in the checked BCD snapshot? Chromium-based browsers from Chrome 123; Firefox and Safari are listed as unsupported in that snapshot.
9. Does text-spacing-trim: none disable all text spacing? No. none is not a value of this property; text-spacing: none is a shorthand value that sets trim to space-all and autospace to no-autospace.

## Sources

- [CSS Text Module Level 4 Editor’s Draft, §8.6](https://drafts.csswg.org/css-text-4/#text-spacing-trim-property) (current grammar, values, behavior, font handling, and known testing gaps)
- [MDN: text-spacing-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-spacing-trim) (explanation and support summary; note its prose support details may not reflect every current draft change)
- [MDN Browser Compatibility Data: text-spacing-trim](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-spacing-trim.json) (browser and value support)
- [Requirements for Japanese Text Layout](https://www.w3.org/TR/jlreq/) (typographic background)
- [Requirements for Chinese Text Layout](https://www.w3.org/TR/clreq/) (typographic background)
