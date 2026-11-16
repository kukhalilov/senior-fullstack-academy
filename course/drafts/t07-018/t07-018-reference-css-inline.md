<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Inline properties

# Scope and version

This reference explains all 10 supplied names in **CSS Inline properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 8 supplied names have an MDN Baseline label, 2 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Inline layout controls line boxes, baselines, leading, vertical alignment, and drop caps. These properties interact with font metrics, writing mode, and the inline formatting context; the visible glyph bounds are not always the line box bounds. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `alignment-baseline` | The alignment-baseline CSS property specifies the specific baseline used to align the box's text and inline-level contents. Baseline alignment is the relationship among the baselines of multiple alignment subjects within an alignment context. When performing baseline alignment, the alignment-baseline property value specifies which baseline of the box is aligned to the corresponding baseline of its alignment context. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/alignment-baseline) |
| `baseline-shift` | The baseline-shift CSS property repositions the dominant-baseline of a text element relative to the dominant-baseline of its parent text content element. The shifted element might be a sub- or superscript. If the property is present, the value overrides the element's baseline-shift attribute. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/baseline-shift) |
| `baseline-source` | The baseline-source CSS property defines which baseline to use when inline-level boxes have multiple possible baselines, such as multi-line inline blocks or inline flex containers. The values allow for choosing between aligning to the box's first baseline, last baseline, or letting the browser decide automatically based on the box type. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/baseline-source) |
| `dominant-baseline` | The dominant-baseline CSS property specifies the specific baseline used to align the box's text and inline-level contents. It also indicates the default alignment baseline of any boxes participating in baseline alignment in the box's alignment context. If present, it overrides the shape's dominant-baseline attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/dominant-baseline) |
| `initial-letter` | The initial-letter CSS property sets the size and sink for dropped, raised, and sunken initial letters. This property applies to ::first-letter pseudo-elements and inline-level first children of block containers. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/initial-letter) |
| `line-height` | The line-height CSS property sets the height of a line box in horizontal writing modes. In vertical writing modes, it sets the width of a line box. It's commonly used to set the distance between lines of text. On block-level elements in horizontal writing modes, it specifies the preferred height of line boxes within the element, and on non-replaced inline elements, it specifies the height that is used to calculate line box height. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height) |
| `text-box` | The text-box CSS shorthand property corresponds to the text-box-trim and text-box-edge properties, which together specify the amount of space to trim from the block-start edge and block-end edge of a text element's block container. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box) |
| `text-box-edge` | The text-box-edge CSS property specifies an amount of space to trim from a text element's block container. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-edge) |
| `text-box-trim` | The text-box-trim CSS property specifies which of the over and under edges of text content to trim from a text element's block container. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim) |
| `vertical-align` | The vertical-align CSS shorthand property sets the vertical alignment of an inline, inline-block, or table-cell box. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/vertical-align) |

# Cross-item comparison

`line-height` controls inline line-box height; baseline properties align inline-level content to typographic baselines; `vertical-align` has context-dependent behavior and is not a general flex/grid alignment tool. New text-box properties trim or select font-derived edges where implemented.

| Item | How to interpret it |
| --- | --- |
| `alignment-baseline` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `baseline-shift` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use `line-height` to set readable line spacing; use `vertical-align` for inline/table-cell alignment, not to vertically center arbitrary block content.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Using `vertical-align` to center a block in a container.
- Assuming font glyph outlines exactly define line-box size.
- Using draft text-box or initial-letter features without checking browser support and script-sensitive behavior.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `alignment-baseline`, `baseline-shift`, `baseline-source`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
