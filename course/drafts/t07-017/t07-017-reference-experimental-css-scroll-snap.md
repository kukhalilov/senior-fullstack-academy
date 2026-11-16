# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css scroll snap properties

# Scope and version

This lesson explains all 1 supplied properties in **Experimental css scroll snap properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 0 names have an MDN Baseline label, 1 have Limited availability, and 1 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

`scroll-initial-target` is proposed for selecting where a scroll container initially lands. It belongs to CSS Scroll Snap Level 2, an Editor’s Draft; it supplements, rather than replaces, user-controlled scrolling and established snap behavior. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `scroll-initial-target` | The scroll-initial-target CSS property enables the definition of elements that are potential snap targets when their ancestor scroll container is first rendered. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-initial-target) |

# Cross-item comparison

This group contains only `scroll-initial-target`, so no within-group name comparison applies. The draft keyword `nearest` marks an element as a potential initial target for its nearest scroll container. It is separate from `scroll-snap-align`, which defines preferred resting alignment during snapping, and from fragment navigation or script-driven scrolling.

# Examples

For stable behavior, use meaningful document order and fragment links; only layer this draft property behind feature detection when its exact behavior is needed.

```css
undefined
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Claiming the initial target property is broadly interoperable.
- Confusing initial position selection with snap alignment on later scrolls.
- Overriding user scroll state after the user has begun interacting.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `scroll-initial-target`. Each has an individual definition and support link above.
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
