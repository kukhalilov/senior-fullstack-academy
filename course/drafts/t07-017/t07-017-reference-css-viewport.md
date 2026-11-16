# CSS layout flexbox grid positioning and responsive design — Reference: CSS Viewport properties

# Scope and version

This lesson explains all 1 supplied properties in **CSS Viewport properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 1 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

The viewport property here is `zoom`, which changes the zoom factor of an element and its descendants. It is distinct from browser page zoom and from `transform: scale()`, and its layout effects and support need careful testing. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `zoom` | The zoom CSS property can be used to control the magnification level of an element. transform: scale() can be used as an alternative to this property. **MDN support snapshot:** Baseline 2024. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/zoom) |

# Cross-item comparison

This group contains only `zoom`, so no within-group name comparison applies. `zoom` participates in layout sizing behavior; `transform: scale()` visually scales a rendered box without reflowing neighboring layout. Browser page zoom is a user-agent control. Use responsive CSS and user zoom support rather than substituting element zoom for accessible text resizing.

# Examples

For responsive enlargement, change fluid constraints or component layout instead of shrinking surrounding layout with a transform. Test at browser zoom and text resizing levels.

```css
.diagram { max-inline-size: 100%; block-size: auto; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Confusing CSS `zoom` with browser zoom.
- Using transforms to defeat required reflow at high zoom.
- Assuming `zoom` and transform have identical coordinate and layout effects.
- Changing page-scale behavior in a way that prevents user control.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `zoom`. Each has an individual definition and support link above.
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
