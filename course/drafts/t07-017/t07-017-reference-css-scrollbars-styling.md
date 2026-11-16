# CSS layout flexbox grid positioning and responsive design — Reference: CSS Scrollbars Styling properties

# Scope and version

This lesson explains all 2 supplied properties in **CSS Scrollbars Styling properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 2 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Scrollbar styling changes the scrollbar’s color and approximate thickness while the browser and platform retain control of much of its appearance. Scrollbars remain user-navigation affordances and can be overlaid or reserved depending on platform settings. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `scrollbar-color` | The scrollbar-color CSS property sets the color of the scrollbar track and thumb. **MDN support snapshot:** Baseline 2025. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-color) |
| `scrollbar-width` | The scrollbar-width property allows the author to set the desired thickness of an element's scrollbars when they are shown. **MDN support snapshot:** Baseline 2024. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width) |

# Cross-item comparison

`scrollbar-color` selects thumb and track colors; `scrollbar-width` offers standardized sizing keywords rather than arbitrary dimensions. Older pseudo-element styling mechanisms are outside this inventory and have different engine-specific behavior.

# Examples

Use a contrasting thumb and track and avoid `thin` if it makes pointer targeting difficult. Preserve keyboard and touch scrolling and test high-contrast/forced-color environments.

```css
.results { scrollbar-color: #536dfe #e8eaf6; scrollbar-width: auto; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming custom scrollbar colors render identically on every OS.
- Removing scrollbar visibility cues or reducing target size without a reason.
- Relying on color alone to indicate scroll position.
- Expecting these standardized properties to style every platform scrollbar detail.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `scrollbar-color`, `scrollbar-width`. Each has an individual definition and support link above.
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
