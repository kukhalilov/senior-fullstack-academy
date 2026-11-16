# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css positioned layout properties

# Scope and version

This lesson explains all 1 supplied properties in **Experimental css positioned layout properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 0 names have an MDN Baseline label, 1 have Limited availability, and 1 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

`overlay` concerns whether an element that is already in the top layer is rendered there during a discrete transition. It does not promote an arbitrary element into the top layer; dialog/popover APIs perform that state change. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `overlay` | The overlay CSS property specifies whether an element appearing in the top layer (for example, a shown popover or modal <dialog> element) is actually rendered in the top layer. This property is only relevant within a list of transition-property values, and only if allow-discrete is set as the transition-behavior. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overlay) |

# Cross-item comparison

This group contains only `overlay`, so no within-group name comparison applies. Top-layer membership is established by platform behavior such as showing a modal dialog or popover. The `overlay` property can be included in a transition with `transition-behavior: allow-discrete` so the top-layer removal can be delayed until the transition finishes.

# Examples

Treat this as progressive enhancement for a dialog close transition; ensure the dialog closes and content remains available when the property is unsupported.

```css
dialog { transition: opacity 160ms, overlay 160ms allow-discrete; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `overlay` itself puts an element in the top layer.
- Forgetting `allow-discrete` for discrete transitions.
- Treating limited-support transition behavior as universal.
- Making dismissal depend on the animation completing.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `overlay`. Each has an individual definition and support link above.
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
