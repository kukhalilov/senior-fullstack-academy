# CSS layout flexbox grid positioning and responsive design — Reference: CSS Fragmentation properties

# Scope and version

This lesson explains all 6 supplied properties in **CSS Fragmentation properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 3 names have an MDN Baseline label, 3 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Fragmentation breaks one flow across pages, columns, or regions. Break preferences are constraints considered by a fragmentation algorithm; “avoid” values can be overridden when honoring all constraints is impossible. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `box-decoration-break` | The box-decoration-break CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-decoration-break) |
| `break-after` | The break-after CSS property sets how page, column, or region breaks should behave after a generated box. If there is no generated box, the property is ignored. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/break-after) |
| `break-before` | The break-before CSS property sets how page, column, or region breaks should behave before a generated box. If there is no generated box, the property is ignored. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/break-before) |
| `break-inside` | The break-inside CSS property sets how page, column, or region breaks should behave inside a generated box. If there is no generated box, the property is ignored. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/break-inside) |
| `orphans` | The orphans CSS property sets the minimum number of lines in a block container that must be shown at the bottom of a page, region, or column. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/orphans) |
| `widows` | The widows CSS property sets the minimum number of lines in a block container that must be shown at the top of a page, region, or column. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/widows) |

# Cross-item comparison

`break-before`, `break-after`, and `break-inside` express break opportunities and avoidance around boxes; `orphans` and `widows` request minimum line counts on adjacent fragments. `box-decoration-break` controls whether border/padding decoration is cloned or sliced at fragment boundaries.

# Examples

For printable sections, request that a short heading stay with following content using a break-avoid rule, but ensure long sections can still break to prevent blank pages.

```css
@media print { h2 { break-after: avoid-page; } .keep-together { break-inside: avoid-page; } }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Treating break-avoid as an absolute guarantee.
- Confusing page, column, and region fragmentation contexts.
- Using a keep-together rule on content taller than a page.
- Assuming decoration is always repeated on every fragment.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `box-decoration-break`, `break-after`, `break-before`, `break-inside`, `orphans`, `widows`. Each has an individual definition and support link above.
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
