
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS font synthesis and width properties

# Scope and version

This lesson covers both inventoried properties: `font-width` and `font-synthesis-position`. The current CSS Fonts Level 4 Working Draft and Editor’s Draft are dated 12 November 2026; both remain in progress. The draft marks synthesis of `font-variant-position` at risk, a W3C process flag for possible interoperability difficulty (not a prediction that it will certainly be removed). MDN marks `font-width` Limited availability because it is not yet supported in some widely used browsers; the long-standing `font-stretch` spelling currently has broader support and is a legacy alias in the current spec. `font-synthesis-position` is marked experimental and Limited availability. Its exact support must be checked before production use.

These properties solve different font problems. `font-width` asks font matching to select a face with a particular typographic width (condensed through expanded). `font-synthesis-position` decides whether the browser may synthesize superscript/subscript typefaces when `font-variant-position` requests them and the selected font lacks those forms. One selects a designed face; the other permits or forbids a fallback synthesis operation. Neither should be confused with stretching a CSS box or with semantic HTML superscript/subscript markup.

# How this group fits the mental model

The browser selects a font face from the requested family and available faces. Font matching considers axes such as style, weight, and width. A family may contain separate static faces or a variable font with a width axis. `font-width` supplies the requested width coordinate; if the exact face/axis value is missing, the font matching rules choose an available face. The browser does not necessarily geometrically scale glyphs to the requested width.

Some typographic requests may also need font features absent from the chosen face. CSS can allow or prohibit synthetic weight, oblique style, small caps, and positional forms. `font-synthesis-position` is the positional member of that policy. The `font-synthesis` shorthand resets/sets all four synthesis permissions, so a later shorthand can undo a longhand choice.

# Supplied names explained

## `font-width`

**Grammar:** `normal | <percentage [0,∞]> | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded`. **Initial:** `normal` (100%). **Applies to:** all elements and text. **Inherited:** yes. **Computed value:** a percentage; `getComputedStyle()` serializes the value as a percentage, even if a keyword was authored. The current specification defines an animation type by computed value; keyword values map to percentages.

### Keyword-to-percentage mapping

| Keyword | Width coordinate |
| --- | ---: |
| `ultra-condensed` | 50% |
| `extra-condensed` | 62.5% |
| `condensed` | 75% |
| `semi-condensed` | 87.5% |
| `normal` | 100% |
| `semi-expanded` | 112.5% |
| `expanded` | 125% |
| `extra-expanded` | 150% |
| `ultra-expanded` | 200% |

A numeric percentage requests a continuous width coordinate, including values between the named stops, and the grammar permits percentages from zero upward. This is a typographic font-width value, not a CSS transform or a percentage of the containing block.

### Font matching and missing faces

If a family has a face or variable font supporting the requested width, the browser selects that face/axis value. When a discrete width is missing, matching uses the CSS Fonts algorithm rather than automatically stretching a normal face: requests below 100% prefer narrower faces where available, falling back wider if none exist; requests at or above 100% prefer wider faces where available, falling back narrower if none exist. For a variable font, a supported width range can be matched continuously; outside the available range, the closest supported value/rules apply. This is why loading an actual condensed/expanded face or variable font matters.

### `font-stretch` relationship and fallback

In current CSS Fonts Level 4, `font-stretch` is a legacy-name alias that functions identically to `font-width`; the preferred modern spelling is `font-width`. In today’s browser ecosystem, however, `font-stretch` has broader support. Declare the fallback first and the modern property second:

```css
.headline {
  font-stretch: condensed; /* legacy alias for browsers without font-width */
  font-width: condensed;
}
```

The supported keyword set is shared by the alias, but numeric percentages, matching behavior, and practical support still depend on the engine/font. Avoid adding `transform: scaleX()` as a substitute for selecting a designed width face: it scales the entire rendered box/glyph outlines and can distort strokes, spacing, hit geometry, and layout.

### Font shorthand and `@font-face`

The CSS Fonts Level 4 `font` shorthand can set the longhand `font-width` in its grammar (the CSS Fonts 3 width keywords are part of that shorthand syntax). New width keywords introduced at Level 4 are not all usable there; the spec’s explicit CSS3-compatible width keyword set is `normal` plus the eight named width categories, not arbitrary percentage width. The `font-width` longhand is the clearest way to request a numeric percentage. A `font` shorthand also resets other font longhands omitted from it, so put a custom width declaration after `font` if it should override the shorthand’s reset/default.

In `@font-face`, a separately named `font-width` **descriptor** declares the width (or supported range for variable fonts) of the downloaded face. The descriptor is metadata used for face matching; the `font-width` property on an element is the request. Do not confuse the two, and ensure descriptor ranges actually match the font file’s supported axis/face.

## `font-synthesis-position`

**Values:** `auto | none`. **Initial:** `auto`. **Applies to:** all elements and text. **Inherited:** yes. **Computed value:** specified keyword. **Animation:** discrete. `auto` permits/requests the user agent to synthesize the superscript/subscript positional typefaces for `font-variant-position` when the selected font lacks them; `none` forbids this synthesis. It only controls positional typeface synthesis. It does not itself request superscript or subscript; `font-variant-position: super` or `sub` provides that request.

The property has no effect when using HTML `<sup>` and `<sub>` elements. Those elements have their own semantics and user-agent styling. Do not replace semantic markup with this property, and do not expect the property to shift baseline position: it controls whether a synthetic positional font form may be produced after CSS requests one.

The desired typographic result depends on the font’s support for positional glyphs/features and the browser’s synthesis implementation. A font may provide designed superscript/subscript glyphs; when it does, there may be no need to synthesize. If synthesis is prohibited and no suitable glyph/face exists, the browser does not create the synthetic positional form. Check actual glyphs and fallback fonts for scientific notation, footnotes, and other high-precision typography.

### Interaction with `font-variant-position` and `font-synthesis`

`font-variant-position` selects `normal`, `sub`, or `super` text presentation. `font-synthesis-position` controls the missing-font-form fallback permission. `font-synthesis` is the shorthand for `font-synthesis-weight`, `font-synthesis-style`, `font-synthesis-small-caps`, and `font-synthesis-position`; its initial value permits all four (`weight style small-caps position`). The shorthand supports `none` or selected permission keywords in combinations. A later `font-synthesis` shorthand can reset `font-synthesis-position`, so order declarations carefully:

```css
.math {
  font-synthesis: none;
  font-synthesis-position: auto; /* explicitly allow positional synthesis only */
  font-variant-position: super;
}
```

This leaves weight/style/small-caps synthesis disabled while permitting positional synthesis. To prohibit positional synthesis as well, use `font-synthesis: none` without overriding it later, or use `font-synthesis-position: none` after any shorthand.

# Cross-item comparison

| Property/value | Request or policy | Typical use |
| --- | --- | --- |
| `font-width` | Select a condensed/normal/expanded font face or variable-font width coordinate | Match a family’s designed width variants for headings, labels, or compact UI. |
| `font-stretch` | Legacy alias of `font-width` with broader current browser support | Compatibility declaration before `font-width`. |
| `font-synthesis-position` | Permit or forbid synthetic subscript/superscript forms when CSS requests them | Preserve typographic control if the chosen family lacks positional forms. |
| `font-variant-position` | Request normal, subscript, or superscript text form | Select the positional feature; it does not govern whether synthesis is allowed. |
| HTML `<sup>` / `<sub>` | Semantic superscript/subscript content | Semantic markup; `font-synthesis-position` does not affect these elements. |
| `transform: scaleX()` | Geometrically scale an element’s rendered box | Not a font-width selection mechanism; may distort glyph shapes and layout. |

# Examples

## Prefer real width variants, with a compatibility alias

```css
@font-face {
  font-family: "Editorial Sans";
  src: url("editorial-sans-variable.woff2") format("woff2");
  font-width: 75% 125%;
  font-weight: 300 800;
}

.compact-heading {
  font-family: "Editorial Sans", sans-serif;
  font-stretch: condensed;
  font-width: condensed;
}
```

The descriptor advertises the variable font’s supported width range; the property requests a face/axis value. Confirm the actual font file has the declared width axis and test browsers that only understand the legacy alias.

## Request a width only where the font actually supplies one

```css
.navigation-label {
  font-family: "Corporate Sans", "Arial Narrow", sans-serif;
  font-stretch: semi-condensed;
  font-width: semi-condensed;
}
```

The family list provides real alternatives if the preferred family lacks a width face. The browser’s font matching chooses the nearest available face; do not assume every family has all nine static widths.

## Control positional synthesis

```css
.equation {
  font-variant-position: super;
  font-synthesis-position: none;
}
```

This requests a superscript form but forbids the browser from synthesizing a positional typeface if the chosen font lacks it. Use this only when visual consistency matters more than always producing a raised form, and verify the supplied font actually contains suitable glyphs. Semantic `<sup>` remains a separate HTML choice.

# Common mistakes

- Treating `font-width: 75%` as `width: 75%` or as a geometric squeeze of the text box.
- Expecting a family with only a regular face to supply a high-quality condensed face; font matching may choose the nearest available width.
- Forgetting that the percentages map to widths relative to normal (`100%`) and that named keywords have defined stops.
- Using only `font-width` where target browsers require the better-supported `font-stretch` alias.
- Declaring `font-width` before a later `font` shorthand that resets the width request.
- Confusing the `font-width` property with the `font-width` descriptor inside `@font-face`.
- Treating `font-synthesis-position` as the switch that requests superscript/subscript; `font-variant-position` requests it.
- Expecting `font-synthesis-position` to affect `<sup>` or `<sub>`; the MDN reference explicitly says it has no effect on those elements.
- Assuming `font-synthesis-position: none` disables all synthetic bold/italic/small caps; it controls positional synthesis only. Use `font-synthesis` or the other longhands for those features.
- Assuming synthesis policy guarantees a particular glyph design; font data and implementation determine the result.
- Treating experimental/limited-support labels as a reason to omit feature detection, fallback fonts, or browser testing.

# Knowledge checks with answers

1. **What does `font-width` choose?** A font face or variable-font width coordinate, not the CSS box width.
2. **What does `condensed` mean numerically?** It maps to 75%; `normal` maps to 100%.
3. **If a family lacks the exact requested width, must the browser horizontally stretch glyphs?** No. Font matching chooses an available face/width according to the CSS matching algorithm.
4. **How should a stylesheet support browsers that lack `font-width`?** Declare `font-stretch` first as the legacy fallback, then `font-width`.
5. **Which property asks for superscript presentation?** `font-variant-position: super`; `font-synthesis-position` only governs whether a missing positional typeface may be synthesized.
6. **Does `font-synthesis-position` alter `<sup>`?** No; it has no effect on `<sup>` or `<sub>` elements.
7. **What does `font-synthesis-position: none` prohibit?** Synthesis of positional superscript/subscript forms; it does not prohibit synthetic weight, oblique, or small-caps faces.
8. **What does the `font-synthesis` shorthand reset?** The weight, style, small-caps, and position synthesis permissions.
9. **Why can a face descriptor and property share the name `font-width` without doing the same job?** The descriptor describes supported downloaded font faces/ranges; the property expresses the width the element requests.

# Sources

- [CSS Fonts Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-fonts-4/) — current `font-width`, alias, font matching, shorthand, and synthesis definitions; work in progress.
- [W3C CSS Fonts Module Level 4 Working Draft](https://www.w3.org/TR/css-fonts-4/) — current published Working Draft dated 12 November 2026.
- [MDN: `font-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-width) — value mapping, support status, legacy alias fallback, and examples.
- [MDN: `font-synthesis-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis-position) — values, semantics, `<sup>/<sub>` caveat, experimental support, and compatibility.
- [MDN: `font-variant-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-position) and [MDN: `font-synthesis`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis) — requesting positional forms and the four synthesis permissions.
