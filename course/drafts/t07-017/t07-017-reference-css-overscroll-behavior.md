# CSS layout flexbox grid positioning and responsive design — Reference: CSS Overscroll Behavior properties

# Scope and version

This lesson explains all 5 supplied properties in **CSS Overscroll Behavior properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 0 names have an MDN Baseline label, 5 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Overscroll behavior controls what happens at a scroll container’s boundary when the user continues a gesture. It can prevent scroll chaining or the browser’s boundary affordance on a selected axis without replacing ordinary overflow or scrollability. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `overscroll-behavior` | The overscroll-behavior CSS property controls what happens when scrolling reaches the edge of a scroll container. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior) |
| `overscroll-behavior-block` | The overscroll-behavior-block CSS property sets the browser's behavior when the block direction boundary of a scrolling area is reached. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior-block) |
| `overscroll-behavior-inline` | The overscroll-behavior-inline CSS property sets the browser's behavior when the inline direction boundary of a scrolling area is reached. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior-inline) |
| `overscroll-behavior-x` | The overscroll-behavior-x CSS property sets the browser's behavior when the horizontal boundary of a scrolling area is reached. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior-x) |
| `overscroll-behavior-y` | The overscroll-behavior-y CSS property sets the browser's behavior when the vertical boundary of a scrolling area is reached. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior-y) |

# Cross-item comparison

The shorthand sets both axes; x/y are physical axes, block/inline follow writing mode. `contain` prevents chaining beyond the element and may suppress boundary affordances; `none` additionally suppresses overscroll affordances where applicable; `auto` leaves browser behavior intact.

# Examples

A modal’s inner scroller may use `overscroll-behavior: contain` to keep a scroll gesture from moving the page behind it, while retaining access to every item inside the modal.

```css
.dialog__body { overflow: auto; overscroll-behavior: contain; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Using overscroll control without making the inner region actually scrollable.
- Disabling expected platform boundary feedback without usability consideration.
- Forgetting horizontal and vertical axes can need different behavior.
- Treating it as a substitute for focus management or modal semantics.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `overscroll-behavior`, `overscroll-behavior-block`, `overscroll-behavior-inline`, `overscroll-behavior-x`, `overscroll-behavior-y`. Each has an individual definition and support link above.
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
