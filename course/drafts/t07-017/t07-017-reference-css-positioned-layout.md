# CSS layout flexbox grid positioning and responsive design — Reference: CSS Positioned Layout properties

# Scope and version

This lesson explains all 15 supplied properties in **CSS Positioned Layout properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 15 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Positioning changes how a box participates in normal flow or establishes an inset reference. The containing block, inset properties, writing mode, and stacking context determine where it appears; `float` and `clear` are older flow-wrapping tools, not modern general layout systems. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `bottom` | The bottom CSS property participates in setting the vertical position of a positioned element. This inset property has no effect on non-positioned elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/bottom) |
| `clear` | The clear CSS property sets whether an element must be moved below (cleared) floating elements that precede it. The clear property applies to floating and non-floating elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clear) |
| `float` | The float CSS property places an element on the left or right side of its container, allowing text and inline elements to wrap around it. The element is removed from the normal flow of the page, though still remaining a part of the flow (in contrast to absolute positioning). **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/float) |
| `inset` | The inset CSS shorthand property corresponds to the top, right, bottom, and/or left properties. It has the same multi-value syntax of the margin shorthand. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset) |
| `inset-block` | The inset-block CSS shorthand property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the top and bottom, or right and left properties depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-block) |
| `inset-block-end` | The inset-block-end CSS property defines the logical block end offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-block-end) |
| `inset-block-start` | The inset-block-start CSS property defines the logical block start offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-block-start) |
| `inset-inline` | The inset-inline CSS shorthand property defines the logical start and end offsets of an element in the inline direction, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the top and bottom, or right and left properties depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-inline) |
| `inset-inline-end` | The inset-inline-end CSS property defines the logical inline end inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-inline-end) |
| `inset-inline-start` | The inset-inline-start CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-inline-start) |
| `left` | The left CSS property participates in specifying the horizontal position of a positioned element. This inset property has no effect on non-positioned elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/left) |
| `position` | The position CSS property sets how an element is positioned in a document. The top, right, bottom, and left physical properties and the inset-block-start, inset-block-end, inset-inline-start, and inset-inline-end flow-relative logical properties can be used to determine the final location of positioned elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position) |
| `right` | The right CSS property participates in specifying the horizontal position of a positioned element. This inset property has no effect on non-positioned elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/right) |
| `top` | The top CSS property sets the vertical position of a positioned element. This inset property has no effect on non-positioned elements. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/top) |
| `z-index` | The z-index CSS property sets the z-order of a positioned element and its descendants or flex and grid items. Overlapping elements with a larger z-index cover those with a smaller one. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/z-index) |

# Cross-item comparison

`relative` remains in flow and offsets its painted box; `absolute` is out of flow and uses a containing block; `fixed` is generally viewport-fixed but can be affected by ancestor containing-block creation; `sticky` participates in flow and sticks within a scrollport after a threshold. `inset` and logical inset shorthands set edge offsets. `z-index` orders positioned/flex/grid items within stacking-context rules.

# Examples

Use a positioned wrapper as the deliberate containing block for a badge; keep the badge decorative and verify it does not cover text or focus outlines at zoom.

```css
.card { position: relative; }
.card__badge { position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming a large `z-index` escapes an ancestor stacking context.
- Forgetting absolute positioning removes the box from normal flow.
- Assuming fixed always means the visual viewport regardless of transforms/containment.
- Using float for page-level columns rather than its text-wrapping purpose.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `bottom`, `clear`, `float`, `inset`, `inset-block`, `inset-block-end`, `inset-block-start`, `inset-inline`, `inset-inline-end`, `inset-inline-start`, `left`, `position`, `right`, `top`, `z-index`. Each has an individual definition and support link above.
2. **What should be checked beyond this concise description?** Full grammar, applicable boxes, inheritance, computed behavior, interactions, and the target browser compatibility data.
3. **What is the MDN status label’s date?** The local reference capture is dated 2026-11-16; consult current compatibility data for future production decisions.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 4 draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
- [CSS Display Level 4 draft](https://drafts.csswg.org/css-display-4/)
- [CSS Anchor Positioning Level 1 draft](https://drafts.csswg.org/css-anchor-position-1/)
