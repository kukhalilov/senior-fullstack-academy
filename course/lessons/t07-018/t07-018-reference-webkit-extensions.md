# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: WebKit Extensions properties

# Scope and version

This reference covers all four supplied text-fill and text-stroke properties. Their `-webkit-` names are historical, but these are not merely arbitrary old WebKit hacks: the WHATWG Compatibility Standard currently defines their grammar and behavior to preserve web compatibility. MDN marked all four Baseline Widely available in the captured 2026-11-16 compatibility snapshot; check the actual target browsers and embedded webviews before depending on them. The Compatibility Standard is a compatibility specification, not a general unprefixed CSS module.

# How this group fits the mental model

Text fill controls the interior paint of glyphs; text stroke paints an outline at glyph edges. The stroke shorthand controls width and color. The properties inherit, so setting them on a text container affects descendant text unless overridden. They are separate from SVG’s unprefixed `fill`/`stroke` properties and from `text-shadow`; there is no general unprefixed equivalent for outlining ordinary HTML text. Use them when an outlined-text effect is genuinely needed, and preserve readable contrast and an un-stroked fallback.

# Supplied names explained

| Exact supplied property | Grammar, initial value, and behavior |
| --- | --- |
| `-webkit-text-fill-color` | `<color>`; initial `currentcolor`; inherited; applies to all elements. Determines text’s foreground fill. With no separate fill value, it follows `color` through its `currentcolor` initial value. It animates as a color. |
| `-webkit-text-stroke` | `<line-width> || <color>`; shorthand for the width and color longhands; inherited. Width and color may appear in either order. Omitted components take the respective longhand’s initial value. |
| `-webkit-text-stroke-color` | `<color>`; initial `currentcolor`; inherited; applies to all elements. Sets the glyph-outline color and animates as a color. |
| `-webkit-text-stroke-width` | `<line-width>`; initial `0`; inherited; applies to all elements. A zero width paints no stroke; negative widths are invalid. Stroke width animates discretely in the Compatibility Standard. |

`<line-width>` includes non-negative lengths and the line-width keywords accepted by the compatibility definition (`hairline`, `thin`, `medium`, and `thick`). Do not assume percentages are accepted. These properties apply to visual presentation; they do not add semantic meaning to text.

# Cross-item comparison

`-webkit-text-fill-color` changes the glyph interior; `-webkit-text-stroke-color` and `-webkit-text-stroke-width` jointly define the outline; `-webkit-text-stroke` sets both outline components. A stroke can overlap glyph counters or neighboring glyphs and may reduce legibility, especially at small font sizes. Test font, size, weight, color contrast, and platform rendering rather than assuming that a thick outline improves readability.

# Examples

```css
.outlined-heading {
  color: white;
  -webkit-text-fill-color: white;
  -webkit-text-stroke: 1px #243047;
}
```

The regular `color` remains a fallback for engines that ignore the prefixed fill declaration. It is prudent for the fill and stroke colors to maintain contrast if the stroke is absent. `text-shadow` can approximate an outline by layering shadows but differs in geometry and rendering; it is not a drop-in standardized replacement.

# Common mistakes

- Assuming the `-webkit-` prefix means no other browser implements the feature; these four names are documented in the Compatibility Standard for web compatibility.
- Assuming the prefixed names have direct unprefixed equivalents for ordinary HTML text. SVG `fill` and `stroke` apply under their own element and paint rules.
- Setting only the stroke color and expecting an outline; the initial width is zero.
- Using a negative stroke width or assuming percentages are valid line widths.
- Confusing text fill with the inherited `color` value. `color` supplies the `currentcolor` default; an explicitly set fill can differ from it.
- Applying thick strokes to small text without checking counters, edge overlap, and contrast.
- Treating Baseline status as a guarantee in every browser version, webview, or rendering environment.

# Knowledge checks with answers

1. **What does `-webkit-text-stroke` set?** It is shorthand for stroke width and stroke color; the two components are independently available as longhands.
2. **Why might `-webkit-text-stroke-color: navy` show no visible effect?** The width defaults to zero; set a positive non-negative width.
3. **What does the `currentcolor` initial value do for text fill?** Unless a separate fill color is specified, the text fill follows the element’s `color` value.
4. **Are these properties limited to WebKit browsers?** No. Their names are prefixed for historical reasons, and the Compatibility Standard documents them for cross-browser web compatibility; still check actual target support.
5. **Is SVG `stroke` an interchangeable unprefixed replacement?** No. SVG paint properties have their own applicability and rendering model and do not generally replace outlined HTML text.

# Sources

- [WHATWG Compatibility Standard](https://compat.spec.whatwg.org/) — §3.4.6 defines the four supplied text fill/stroke properties and their values, inheritance, initial values, shorthand relationship, and animation behavior.
- [MDN `-webkit-text-fill-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-fill-color), [`-webkit-text-stroke`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke), [`-webkit-text-stroke-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke-color), and [`-webkit-text-stroke-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke-width) — practical syntax, compatibility summaries, and browser tables.
- [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity profile; it is not a browser support table.
