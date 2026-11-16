# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css overflow properties

# Scope and version

This lesson explains all 1 supplied properties in **Experimental css overflow properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 0 names have an MDN Baseline label, 0 have Limited availability, and 1 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

`max-lines` is a CSS Overflow Level 4 draft longhand involved in line clamping and fragmentation. It is not a broadly supported standalone substitute for established clamping patterns. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `max-lines` | CSS Overflow Level 4 draft longhand that sets the clamp point of a line-clamp container or forces a region break in a fragmentation container. Its draft syntax accepts auto and a positive integer; it is not a broadly interoperable standalone production feature. This is an evolving Overflow Level 4 draft longhand; do not infer broad browser support from the related legacy clamp behavior. **MDN support snapshot:** W3C Editor’s Draft; experimental and support varies; MDN marks it experimental. [MDN/spec](https://drafts.csswg.org/css-overflow-4/#propdef-max-lines) |

# Cross-item comparison

This group contains only `max-lines`, so no within-group name comparison applies. The draft defines `max-lines` as a clamp point for line-clamp containers or a forced region break under fragmentation; the `line-clamp` shorthand combines line count and ellipsis behavior. Current support for the draft longhand is distinct from legacy `-webkit-line-clamp` compatibility.

# Examples

For production truncation, use an approach supported by target browsers and provide access to the full text; consider expansion controls when truncation hides important content.

```css
.excerpt { line-clamp: 3; overflow: hidden; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming the draft longhand is implemented because a related shorthand has legacy behavior.
- Treating visual ellipsis as deletion of the hidden content or a complete accessibility pattern.
- Using a line limit that hides required information without a way to reveal it.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `max-lines`. Each has an individual definition and support link above.
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
