# CSS layout flexbox grid positioning and responsive design — Reference: CSS Scroll Anchoring properties

# Scope and version

This lesson explains all 1 supplied properties in **CSS Scroll Anchoring properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 1 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Scroll anchoring attempts to keep the user’s apparent reading position stable when content above the viewport changes size. Authors may opt out in a subtree when the browser’s selected anchor causes a harmful jump, but should first fix avoidable layout shifts. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `overflow-anchor` | The overflow-anchor CSS property provides a way to opt out of the browser's scroll anchoring behavior, which adjusts scroll position to minimize content shifts. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-anchor) |

# Cross-item comparison

This group contains only `overflow-anchor`, so no within-group name comparison applies. `overflow-anchor: none` opts an element out of anchor selection; `auto` leaves normal anchoring behavior available. It does not reserve image dimensions, prevent every shift, or control scroll snapping.

# Examples

Reserve image and ad space to prevent layout shift. Only if a specific virtualized region produces a demonstrated bad anchor adjustment should you narrowly opt it out.

```css
.unstable-virtualized-region { overflow-anchor: none; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Disabling anchoring globally to conceal missing size reservations.
- Assuming the browser will select a particular descendant as the anchor.
- Confusing scroll anchoring with scroll snapping or smooth scrolling.
- Ignoring browser-specific support and interactions.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `overflow-anchor`. Each has an individual definition and support link above.
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
