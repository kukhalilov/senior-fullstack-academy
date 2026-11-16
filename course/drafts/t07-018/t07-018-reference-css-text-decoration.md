<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Text Decoration properties

# Scope and version

This reference explains all 14 supplied names in **CSS Text Decoration properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 13 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Text-decoration properties control underline/overline/line-through lines, style, color, thickness, offsets, skip-ink behavior, emphasis marks, and shadows. Decoration lines can be propagated across inline descendants and follow text shaping. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `text-decoration` | The text-decoration CSS shorthand property sets the appearance of decorative lines on text. It is a shorthand for text-decoration-line, text-decoration-color, text-decoration-style, and the newer text-decoration-thickness property. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration) |
| `text-decoration-color` | The text-decoration-color CSS property sets the color of decorations added to text by text-decoration-line. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-color) |
| `text-decoration-inset` | The text-decoration-inset CSS property enables adjusting the start and end points of an element's text decoration so it can be shortened, lengthened, or have its position shifted with respect to the rendered text. **Support snapshot:** no MDN baseline label was captured; check the linked specification and compatibility data. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-inset) |
| `text-decoration-line` | The text-decoration-line CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-line) |
| `text-decoration-skip-ink` | The text-decoration-skip-ink CSS property specifies how overlines and underlines are drawn when they pass over glyph ascenders and descenders. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-skip-ink) |
| `text-decoration-style` | The text-decoration-style CSS property sets the style of the lines specified by text-decoration-line. The style applies to all lines that are set with text-decoration-line. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-style) |
| `text-decoration-thickness` | The text-decoration-thickness CSS property sets the stroke thickness of the decoration line that is used on text in an element, such as a line-through, underline, or overline. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-thickness) |
| `text-emphasis` | The text-emphasis CSS shorthand property applies emphasis marks to text (except spaces and control characters). **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis) |
| `text-emphasis-color` | The text-emphasis-color CSS property sets the color of emphasis marks. This value can also be set using the text-emphasis shorthand. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-color) |
| `text-emphasis-position` | The text-emphasis-position CSS property sets where emphasis marks are drawn. Similar to the text rendered by the <ruby> HTML element, if there isn't enough room for emphasis marks, the line height is increased. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-position) |
| `text-emphasis-style` | The text-emphasis-style CSS property sets the appearance of emphasis marks. It can also be set, and reset, using the text-emphasis shorthand. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-style) |
| `text-shadow` | The text-shadow CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its text-decoration. Each shadow is described by some combination of X and Y offsets from the element, blur radius, and color. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-shadow) |
| `text-underline-offset` | The text-underline-offset CSS property sets the offset distance of an underline text decoration line (applied using text-decoration) from its original position. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-underline-offset) |
| `text-underline-position` | The text-underline-position CSS property specifies the position of the underline which is set using the text-decoration property's underline value. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-underline-position) |

# Cross-item comparison

`text-decoration-line` selects lines; style, color, thickness, and offset configure them. `text-emphasis` adds marks used in some scripts. `text-shadow` paints a visual shadow and should not reduce text legibility.

| Item | How to interpret it |
| --- | --- |
| `text-decoration` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `text-decoration-color` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use text decoration for links with sufficient contrast and an additional non-color affordance; preserve visible focus separately.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Removing underlines from links without another cue.
- Assuming decoration applies only to the element’s own glyphs.
- Using shadows to simulate contrast or focus indicators.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `text-decoration`, `text-decoration-color`, `text-decoration-inset`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
