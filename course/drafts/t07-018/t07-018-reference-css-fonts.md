<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Fonts properties

# Scope and version

This lesson audits the 24 assigned properties in the `css-fonts` inventory. The main normative reference used here is the CSS Fonts Module Level 4 Editor’s Draft dated 12 November 2026. It is a work in progress, not a W3C Recommendation, and explicitly lists some features as at risk. CSS Fonts Level 3 reached Recommendation status in 2018 and is a useful stable historical baseline; it does not contain all current features. CSS Fonts Level 5 is a newer delta draft and must be read as proposed work, not as a replacement that silently removes Level 4 material. Specification status and browser availability are separate questions; this lesson does not claim universal implementation. [CSS Fonts 4](https://drafts.csswg.org/css-fonts-4/) · [CSS Fonts 5](https://drafts.csswg.org/css-fonts-5/) · [CSS Fonts 3](https://www.w3.org/TR/css-fonts-3/)

Two closely related names are deliberately assigned to the companion lesson [CSS font synthesis and width properties](t07-018-reference-experimental-css-fonts.md): `font-synthesis-position` and `font-width`. They are discussed here only where needed to explain interactions; consult that lesson for their complete grammar and status. They are not additional names in this lesson’s 24-item inventory.

# How this group fits the mental model

Text rendering is a pipeline, not a single “choose a font” switch:

1. CSS declarations cascade and inherit. Shorthands can reset longhands even when the shorthand does not visibly mention them.
2. `font-family`, `font-size`, `font-weight`, and `font-style` provide the main selection request. The user agent matches an available face, then may synthesize some missing styles if permitted.
3. Text shaping maps characters and clusters to glyphs, applies required script shaping and default font features, then applies author-requested variants and variation axes where the chosen font supports them.
4. Fallback can happen for individual characters or clusters. A family that renders Latin letters may not contain the required glyphs for another script, emoji sequence, or combining cluster.
5. Layout uses font metrics. A fallback face can have different x-height or other metrics, changing perceived size or line geometry even when the declared `font-size` is unchanged.

The browser, operating system, installed fonts, downloaded font files, script, language, writing mode, user settings, and font tables all affect the result. A CSS value requests behavior; it does not create a missing glyph, OpenType feature, variation axis, or palette. Most properties in this group are inherited. The shorthand exceptions and resets are important enough to learn before memorizing feature names.

# Supplied names explained

## Family, size, and face matching

| Exact name | Values and behavior to know |
| --- | --- |
| `font-family` | A comma-separated prioritized list of family names and generic families. Family names may be quoted strings or valid unquoted identifiers; quote names with spaces or ambiguous tokens, and quote a family whose spelling is also a generic-family keyword. Generic choices include `serif`, `sans-serif`, `system-ui`, `cursive`, `fantasy`, `math`, and `monospace`; system UI variants include `ui-serif`, `ui-sans-serif`, `ui-monospace`, and `ui-rounded`; script-specific forms include `generic(fangsong)`, `generic(kai)`, `generic(khmer-mul)`, and `generic(nastaliq)`. The `ui-*` and script-specific choices need not map to an installed face everywhere. A user agent searches the list and may choose fallback per character/cluster, not only once for an entire paragraph. Put an appropriate generic fallback last. |
| `font-size` | Accepts absolute-size keywords (`xx-small` through `xxx-large`, including `medium`), relative-size keywords (`larger`, `smaller`), non-negative lengths and percentages, math functions, and the Fonts 4 `math` keyword. Percentages are relative to the parent’s computed size; `em` in this property is relative to the inherited size, while `rem` is relative to the root. Do not confuse `font-size` with line-box height (`line-height`) or with `font-size-adjust`, which can change the used size to preserve a metric. |
| `font-size-adjust` | `none` disables adjustment; a non-negative number supplies the desired metric ratio. CSS Fonts 5 proposes/currently defines a metric selector (`ex-height`, `cap-height`, `ch-width`, `ic-width`, or `ic-height`) followed by `from-font` or a number; without a selector, the metric defaults to ex-height. This is newer than the CSS Fonts 3 Recommendation and the Fonts 4 property index, so check implementation before relying on the expanded grammar. Its purpose is to preserve a chosen metric when fallback occurs. It changes the used font size, not the computed size inherited by descendants. It affects metric-relative units such as `ex` and `ch`, but not `em`; a numeric `line-height` is based on computed `font-size`. |
| `font-weight` | Accepts `normal` (400), `bold` (700), `bolder`, `lighter`, or a number from 1 through 1000. Common reference labels are 100 thin, 200 extra-light, 300 light, 400 normal, 500 medium, 600 semibold, 700 bold, 800 extra-bold, 900 black; intermediate numbers are valid. These labels are a convention, not the only legal values, and the name inside a font file does not override CSS numeric mapping. A requested value is matched to available faces according to the algorithm; if no exact face exists, a nearby face or permitted synthesis may be used. `bolder` and `lighter` are relative to the inherited weight, not fixed aliases for 700 and 300. |
| `font-style` | `normal`, `italic`, `left`, `right`, or `oblique` with an optional angle from −90° to 90° (the omitted oblique angle is 14° in the Fonts 4 draft). Italic and oblique are distinct face requests. In a variable font, the high-level property can select the `ital` or `slnt` axis. Positive CSS oblique angles describe clockwise slant; direct variation-axis `slnt` values use the opposite sign convention, another reason to prefer this property. |
| `font` | A legacy near-shorthand whose general order is optional style/variant/weight/width, required size, optional `/ line-height`, then family list; a system-font keyword is an alternate form. The current Fonts 4 draft also includes `font-width` in the explicit set. Only the CSS 2.1 `normal` and `small-caps` variants fit the old shorthand grammar; modern variants belong in `font-variant` or its longhands. `font` resets many omitted font subproperties to their initial values, including feature, variation, optical-sizing, and size-adjust controls. It does **not** reset every property beginning `font-`: palette and synthesis longhands cascade independently. Set nuanced properties after the shorthand. |

The shorthand reset is a common source of “why did my feature disappear?” bugs:

```css
.price {
  font-variant-numeric: tabular-nums;
  font: 500 1rem/1.4 "Reading Sans", sans-serif;
}

/* The font declaration resets font-variant-numeric. Put the feature after it. */
.price {
  font: 500 1rem/1.4 "Reading Sans", sans-serif;
  font-variant-numeric: tabular-nums;
}
```

## Synthesis and variable-font controls

| Exact name | Values and behavior to know |
| --- | --- |
| `font-synthesis` | Shorthand: `none` or any combination of `weight`, `style`, `small-caps`, and `position`. The initial behavior permits all listed synthesis kinds. It controls whether a user agent may fabricate missing bold/oblique/small-cap/subscript/superscript forms; it cannot make the result identical to a designed face. The companion `font-synthesis-position` longhand controls `position` in the current draft. |
| `font-synthesis-weight` | `auto` or `none`. Allows or forbids synthetic bold/weight when a matching weight face is unavailable. Prefer loading/selecting a real weight when typography matters; synthesis can alter strokes and metrics. |
| `font-synthesis-style` | `auto`, `none`, or `oblique-only`. Controls synthetic italic/oblique styling when the requested face is missing. The `oblique-only` option allows synthesis only for oblique requests, rather than turning an italic request into an artificial slant. |
| `font-synthesis-small-caps` | `auto` or `none`. Governs whether small caps may be synthesized if the font lacks designed small-cap glyphs. Faux small caps often scale capitals and can have poorer proportions and stroke weight than actual glyphs. |
| `font-optical-sizing` | `auto` or `none`, initially `auto`. With a variable font that has an optical-size axis, `auto` lets the user agent map the text’s size to that axis; `none` disables this automatic adjustment. It does not make a static font optically responsive. Use `font-variation-settings: "opsz" …` only when a deliberate low-level override is needed. |
| `font-variation-settings` | `normal` or a list of case-sensitive four-character OpenType/TrueType axis tags paired with numeric values, for example `"GRAD" 40`. Unknown axes are ignored; values outside a supported axis range are clamped. Duplicate tags resolve to the last listed value. This is the low-level escape hatch for axes lacking a higher-level CSS property. Prefer `font-weight` for `wght`, `font-style` for `ital`/`slnt`, the companion `font-width` for `wdth`, and `font-optical-sizing` for `opsz`: these high-level properties participate in matching/cascade more appropriately. A variation setting does not cause fallback-font matching to act as if a high-level property had been set. |

There are two separate low-level mechanisms. `font-feature-settings` turns shaping features on/off or assigns feature values (OpenType tags such as `liga`); `font-variation-settings` chooses coordinates on variable axes (such as `wght`, `wdth`, or a custom axis). They are not interchangeable. Both require support in the selected font. The standardized CSS properties below are preferred for common functions because they express intent and cascade per function.

## OpenType feature and palette controls

| Exact name | Values and behavior to know |
| --- | --- |
| `font-feature-settings` | `normal` or comma-separated four-character feature tags with integer values, e.g. `"ss01" 1`. Intended for uncommon low-level features; prefer `font-kerning`, `font-variant-*`, or other high-level controls for standardized functions. Feature tags are case-sensitive. A font can ignore unsupported features. CSS shaping must keep required script/layout features enabled; authors should not try to disable shaping features needed for correct text. |
| `font-kerning` | `auto`, `normal`, or `none`. Controls metric kerning data present in the font. `auto` leaves the decision to the user agent; `normal` requests kerning; `none` disables it. It only affects glyph pairs for which the font and shaper provide kerning, and can be script/writing-mode dependent. It is not letter spacing: `letter-spacing` changes spacing across a run and can affect shaping differently. |
| `font-language-override` | `normal` or a string containing a font’s language-system tag (for OpenType, commonly a four-character script/language system code). This is a specialized override for font-specific language substitutions, not a replacement for correct document language metadata (`lang`). It is marked at risk in the current Fonts 4 process document; avoid depending on it without checking implementation and current spec status. |
| `font-variant` | Shorthand for ligatures, position, caps, alternates, numeric, East Asian, and emoji variant subproperties. `normal` resets all its subproperties; `none` disables the ligature subproperty while resetting the other variant subproperties. Modern longhand values are accepted here, but not all are accepted by the older `font` shorthand. As a shorthand, an omitted subproperty resets rather than preserving an earlier longhand value. |
| `font-variant-ligatures` | `normal`, `none`, or combinations of common (`common-ligatures` / `no-common-ligatures`), discretionary, historical, and contextual (`contextual` / `no-contextual`) pairs. In OpenType, common ligatures and contextual forms are generally default-on; discretionary and historical forms are not. `none` disables the ligature/contextual features covered by this property, not the required shaping rules for a script. Whether a particular sequence has a ligature is font-specific. |
| `font-variant-caps` | `normal`, `small-caps`, `all-small-caps`, `petite-caps`, `all-petite-caps`, `unicase`, or `titling-caps`. Requests alternate capital forms; it does not uppercase text content. If designed glyphs are absent, the user agent may synthesize unless synthesis is disabled. |
| `font-variant-numeric` | `normal`, plus independent combinations from figure style (`lining-nums`, `oldstyle-nums`), spacing (`proportional-nums`, `tabular-nums`), fraction (`diagonal-fractions`, `stacked-fractions`), and the flags `ordinal` and `slashed-zero`. These are typographic glyph substitutions, not numeric formatting or locale-aware number parsing. A font may lack some requested forms. Fractions can depend on surrounding characters and font-specific shaping; apply the option to the fraction text, then inspect actual output. |
| `font-variant-east-asian` | `normal`, or combinations of variant forms (`jis78`, `jis83`, `jis90`, `jis04`, `simplified`, `traditional`), width (`full-width`, `proportional-width`), and `ruby`. These request font-specific East Asian glyph variants/spacing; they do not translate text or change its language. `ruby` requests glyph forms designed for ruby annotation, not smaller font size or ruby layout itself. |
| `font-variant-position` | `normal`, `sub`, or `super`. Requests typographic subscript/superscript glyphs designed to remain in the em box and baseline layout. It does not implement semantic `<sub>`/`<sup>` markup or guarantee a raised/lowered scale when the font lacks those variants. The Fonts 4 draft marks synthesis of this feature at risk; the related synthesis control is in the companion lesson. |
| `font-variant-alternates` | `normal`, or combinations of `historical-forms`, `stylistic(name)`, `styleset(name, …)`, `character-variant(name, …)`, `swash(name)`, `ornaments(name)`, and `annotation(name)`. Font-specific names are declared for named families with `@font-feature-values` blocks such as `@styleset` or `@swash`; the feature set is not portable across unrelated fonts. Unknown/unmapped names cannot conjure a glyph. |
| `font-variant-emoji` | `normal`, `text`, `emoji`, or `unicode`. Controls the default text-vs-emoji presentation of Unicode emoji-presentation-participating code points. `normal` follows user-agent/platform choice; `unicode` follows Unicode’s default presentation properties; `text`/`emoji` behave like appending VS15/VS16 for the affected code points. Explicit U+FE0E or U+FE0F in the text wins. This property neither recolors arbitrary symbols nor overrides presentation for all Unicode characters. |
| `font-palette` | `normal`, `light`, `dark`, a custom `<palette-identifier>`, or `palette-mix()` in the current Fonts 4 draft. Applies to color-font palettes. `@font-palette-values --name { font-family: NamedColorFont; base-palette: 1; override-colors: 0 rebeccapurple; }` defines a named palette; the family must match, palette indexes are zero-based, and overrides apply only to palette entries. `palette-mix()` interpolates palettes according to color interpolation rules. The property has no effect on a monochrome font or on a color font without the relevant palette data. |

### Exact feature value families

These values are easy to forget and should be recognized when reading a declaration:

- **Ligatures:** common `common-ligatures` / `no-common-ligatures`; discretionary `discretionary-ligatures` / `no-discretionary-ligatures`; historical `historical-ligatures` / `no-historical-ligatures`; contextual `contextual` / `no-contextual`.
- **Caps:** `small-caps`, `all-small-caps`, `petite-caps`, `all-petite-caps`, `unicase`, `titling-caps`.
- **Alternates:** `historical-forms`; functions `stylistic()`, `styleset()`, `character-variant()`, `swash()`, `ornaments()`, `annotation()`.
- **Numerals:** `lining-nums`, `oldstyle-nums`, `proportional-nums`, `tabular-nums`, `diagonal-fractions`, `stacked-fractions`, `ordinal`, `slashed-zero`.
- **East Asian:** `jis78`, `jis83`, `jis90`, `jis04`, `simplified`, `traditional`, `full-width`, `proportional-width`, `ruby`.
- **Position and emoji:** `sub`, `super`; and `text`, `emoji`, `unicode` respectively.

The CSS feature names map to OpenType tags (for example `tabular-nums` to `tnum` and `small-caps` to `smcp`) but the font decides which glyphs/features exist. The mapping is an implementation contract for supported font technologies, not a guarantee every family contains every alternate.

For named alternates, `@font-feature-values` defines family-scoped aliases using `@stylistic`, `@styleset`, `@character-variant`, `@swash`, `@ornaments`, and `@annotation` blocks. Those aliases let a stylesheet ask for a human-readable named alternate instead of hard-coding a font’s numeric feature index. Definitions are font-family-specific; a fallback font is not required to implement the named glyph. `font-variant-alternates` also has `historical-forms`, which does not require a named alias.

# Cross-item comparison

| Need | Prefer | Lower-level or related control | Why the distinction matters |
| --- | --- | --- | --- |
| Choose a family and fallback | `font-family` | `@font-face` resource descriptors | CSS picks from a prioritized set; `@font-face` makes a web font face available and describes its matching characteristics. Neither guarantees every code point exists in the first face. |
| Choose size/readability | `font-size`, optionally `font-size-adjust` | `font-variation-settings: "opsz" …` | Size is the requested scale; size-adjust compensates a chosen metric for fallback; optical size is a variable-font design axis. They solve different problems. |
| Choose weight/slant/width | `font-weight`, `font-style`, companion `font-width` | `font-variation-settings` | High-level properties participate in face matching and fallback. Direct axis coordinates are for custom/rare axes and do not request equivalent fallback matching. |
| Enable standard typography | `font-kerning`, `font-variant-*` | `font-feature-settings` | Intent-based properties are clearer and cascade independently; low-level tag control is font-technology-specific. |
| Enable a variable axis | High-level axis property when one exists | `font-variation-settings` | Axis tags are case-sensitive and face-specific; unknown tags do nothing and do not synthesize fallback behavior. |
| Prevent faux styles | `font-synthesis` or individual longhands | Choose/load the real face | Disabling synthesis can make the requested style unavailable; it does not load a missing weight or italic face. |
| Set emoji preference | `font-variant-emoji` or explicit variation selectors in text | `font-family` | Presentation choice and font fallback interact; explicit VS15/VS16 in content overrides the CSS default for affected sequences. |
| Style colored glyphs | `font-palette` plus `@font-palette-values` | A color font with palette tables | A CSS palette selection cannot add color tables or palette entries to a font that lacks them. |

# Examples

## Predictable family fallback and a real variable-font range

```css
@font-face {
  font-family: "Atlas Text";
  src: url("/fonts/atlas-variable.woff2") format("woff2");
  font-weight: 300 800;
  font-style: normal italic;
}

body {
  font-family: "Atlas Text", ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 430;
  font-optical-sizing: auto;
}

.quiet {
  font-weight: 350;
  font-style: oblique 8deg;
}
```

The `@font-face` descriptors advertise which styles the downloaded file can match; the family declaration still supplies fallback. The numeric weights are not promises that the local file actually contains a continuous axis: the font metadata and selected face must support them. `font-optical-sizing` only has an effect if the face exposes the optical-size axis.

## Tabular figures without low-level feature tags

```css
.invoice-total,
.invoice-row__amount {
  font-variant-numeric: lining-nums tabular-nums;
  font-kerning: normal;
}
```

Tabular numerals make digit advance widths suitable for aligned columns when the font supports them; they do not align decimal separators or format currency. Use a layout mechanism such as a table or grid for column alignment.

## A named alternate and a color palette

```css
@font-feature-values "Atlas Display" {
  @styleset {
    open-single-storey-a: 3;
  }
}

@font-palette-values --warm-display {
  font-family: "Atlas Display";
  base-palette: 1;
  override-colors: 0 #7a263a, 1 #f2cf8a;
}

.brand-wordmark {
  font-family: "Atlas Display", serif;
  font-variant-alternates: styleset(open-single-storey-a);
  font-palette: --warm-display;
}
```

Both declarations depend on metadata in the named font. A fallback serif may lack the styleset or the color palette; it still renders text, but the requested visual treatment may be absent.

# Common mistakes

- Treating `font: ...` as if it preserves omitted font settings. It resets many subproperties; set variants and low-level overrides after it.
- Treating all names beginning `font-` as members of the `font` shorthand. `font-palette` and synthesis longhands cascade independently in the current draft.
- Assuming `font-feature-settings` and `font-variation-settings` are synonyms. One addresses shaping features; the other sets variable-axis coordinates.
- Setting standard features through tags when a high-level property exists, or assuming an OpenType tag exists in every font.
- Using a fake bold/italic without checking whether synthesis is allowed or visually appropriate.
- Believing a requested family handles every script, emoji sequence, or combining cluster. Test real multilingual text and fallback.
- Assuming numeric `font-weight` is restricted to multiples of 100, or that every font has a face for each accepted number.
- Confusing italic with oblique, CSS `oblique` angle signs with a font’s raw `slnt` axis convention, or font size with line-height.
- Applying small-caps or a numeral variant to content and expecting case conversion, localized number formatting, decimal alignment, or semantic sub/sup markup.
- Assuming `font-variant-emoji` forces any symbol to colored emoji or overrides explicit VS15/VS16.
- Treating the latest Editor’s Draft as a stable compatibility guarantee, or interpreting “at risk” as a prediction about shipping date.
- Confusing assigned `font-synthesis-weight` with companion-only `font-synthesis-position`, or assigned `font-weight` with companion-only `font-width`.

# Knowledge checks with answers

1. **What is the difference between `font-feature-settings` and `font-variation-settings`?** The former requests font shaping features such as ligatures; the latter sets coordinates on variable-font axes. Prefer standard CSS properties for features or axes that have them.
2. **Why can a later `font` declaration undo `font-variant-numeric`?** `font` resets omitted font subproperties to their initial values. Put the variant after the shorthand.
3. **What does a trailing `sans-serif` in `font-family` provide?** A generic fallback when earlier named families are unavailable or lack glyphs. It does not guarantee identical metrics across devices.
4. **Will `font-weight: 630` necessarily render at exactly that darkness?** No. The value is valid, but the selected face’s axes/available instances, matching algorithm, and synthesis permissions determine the result.
5. **Does `font-size-adjust` change the inherited computed `font-size`?** No. It adjusts the used size to preserve the selected metric; descendants still inherit the computed size.
6. **Can `font-variant-numeric: tabular-nums` make a monetary column line up by itself?** It can request equal-width digits when supported; use table/grid layout for column geometry and decimal alignment.
7. **What wins when text explicitly includes U+FE0E but CSS requests emoji presentation?** The explicit variation selector overrides the CSS default for participating emoji code points.
8. **What should be checked when `font-palette: --warm-display` appears to do nothing?** Confirm the selected face is the named color font, it contains usable palettes, the `@font-palette-values` family matches, and that the UA supports the draft feature.
9. **Is `font-language-override` a substitute for setting `lang`?** No. Set correct language metadata; the CSS property is a specialized font language-system override and is at risk in the current draft.
10. **Why might `font-variant-position: super` not look like a small, raised character?** It asks for designed superscript glyphs that preserve em-box/baseline layout; the font may lack them, and synthesis is separately controlled and at risk.

# Sources

- [CSS Fonts Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-fonts-4/)
- [CSS Fonts Module Level 5 Editor’s Draft](https://drafts.csswg.org/css-fonts-5/)
- [CSS Fonts Module Level 3 Recommendation](https://www.w3.org/TR/css-fonts-3/)
- [Unicode Emoji, UTS #51](https://www.unicode.org/reports/tr51/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS font property references](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
