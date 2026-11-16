# CSS layout flexbox grid positioning and responsive design — Reference: CSS Conditional Rules properties

# Scope and version

This lesson explains all 3 supplied properties in **CSS Conditional Rules properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 3 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Container properties name an eligible ancestor and determine which aspects descendants may query. A query container establishes a relationship between component layout and its own available size or state, reducing dependence on global viewport breakpoints. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `container` | The container shorthand CSS property establishes the element as a query container and specifies the name and type of the containment context used in a container query. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container) |
| `container-name` | The container-name CSS property specifies a list of query container names used by the @container at-rule in a container query. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-name) |
| `container-type` | The container-type CSS property specifies the type of container context used in a container query. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-type) |

# Cross-item comparison

`container-name` labels a query container; `container-type` establishes the containment/query capability; `container` is a shorthand that sets both. Size containment has consequences for intrinsic sizing, so the chosen type matters. Query rules themselves are at-rules and outside this property-only group.

# Examples

Make a card respond to the inline size of its host, not the viewport. Ensure a query container exists above the component and that the chosen containment does not collapse its intrinsic size.

```css
.card-host { container: card / inline-size; }
@container card (inline-size > 32rem) { .card { display: grid; grid-template-columns: 10rem 1fr; } }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Expecting a container query to match when no eligible ancestor exists.
- Confusing viewport media queries with element-relative container queries.
- Applying size containment without accounting for intrinsic sizing.
- Assuming a container can query its own size in its own descendants’ style.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `container`, `container-name`, `container-type`. Each has an individual definition and support link above.
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
