# CSS layout flexbox grid positioning and responsive design — Reference: CSS Containment properties

# Scope and version

This lesson explains all 2 supplied properties in **CSS Containment properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 2 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Containment lets authors declare that selected layout, style, paint, or size effects are isolated from surroundings, enabling optimizations and changing formatting behavior. The promise is semantic: declaring containment that the component does not satisfy can produce clipped content or incorrect sizing. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `contain` | The contain CSS property indicates that an element and its contents are, as much as possible, independent from the rest of the document tree. Containment enables isolating a subsection of the DOM, providing performance benefits by limiting calculations of layout, style, paint, size, or any combination to a DOM subtree rather than the entire page. Containment can also be used to scope CSS counters and quotes. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain) |
| `content-visibility` | The content-visibility CSS property controls whether or not an element renders its contents at all, along with forcing a strong set of containments, allowing user agents to potentially omit large swathes of layout and rendering work until it becomes needed. It enables the user agent to skip an element's rendering work (including layout and painting) until it is needed — which makes the initial page load much faster. **MDN support snapshot:** Baseline 2024. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) |

# Cross-item comparison

`contain` selects containment dimensions; `content-visibility` can skip rendering work for offscreen content while preserving a skippable subtree. `contain-intrinsic-size` (outside this manifest) supplies a placeholder size when contents are skipped; do not assume containment automatically determines a useful intrinsic size.

# Examples

Apply `content-visibility: auto` only to independent long-page sections after checking focus navigation, find-in-page, and layout shifts. Use an estimated intrinsic size when needed and test the rendered transition into view.

```css
.article-section { content-visibility: auto; contain-intrinsic-size: auto 30rem; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Adding `contain: size` without supplying a meaningful size model.
- Assuming paint containment is harmless when shadows or popovers must escape.
- Using rendering skipping on tiny content where complexity exceeds benefit.
- Claiming guaranteed speedups instead of measuring.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `contain`, `content-visibility`. Each has an individual definition and support link above.
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
