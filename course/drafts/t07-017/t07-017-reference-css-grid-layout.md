# CSS layout flexbox grid positioning and responsive design — Reference: CSS Grid Layout properties

# Scope and version

This lesson explains all 15 supplied properties in **CSS Grid Layout properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 15 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Grid defines rows and columns as tracks, places items on grid lines or areas, and sizes tracks from fixed, intrinsic, flexible, and min/max constraints. Explicit tracks are authored; implicit tracks are created when placement exceeds that definition. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `grid` | The grid CSS shorthand property sets all of the explicit and implicit grid properties in a single declaration. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid) |
| `grid-area` | The grid-area CSS shorthand property specifies a grid item's size and location within a grid by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the edges of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-area) |
| `grid-auto-columns` | The grid-auto-columns CSS property specifies the size of an implicitly-created grid column track or pattern of tracks. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-auto-columns) |
| `grid-auto-flow` | The grid-auto-flow CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-auto-flow) |
| `grid-auto-rows` | The grid-auto-rows CSS property specifies the size of an implicitly-created grid row track or pattern of tracks. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-auto-rows) |
| `grid-column` | The grid-column CSS shorthand property specifies a grid item's size and location within a grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-column) |
| `grid-column-end` | The grid-column-end CSS property specifies a grid item's end position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the block-end edge of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-column-end) |
| `grid-column-start` | The grid-column-start CSS property specifies a grid item's start position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement. This start position defines the block-start edge of the grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-column-start) |
| `grid-row` | The grid-row CSS shorthand property specifies a grid item's size and location within a grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-row) |
| `grid-row-end` | The grid-row-end CSS property specifies a grid item's end position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-end edge of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-row-end) |
| `grid-row-start` | The grid-row-start CSS property specifies a grid item's start position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start edge of its grid area. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-row-start) |
| `grid-template` | The grid-template CSS shorthand property specifies the grid columns, grid rows, and grid areas. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template) |
| `grid-template-areas` | The grid-template-areas CSS property specifies named grid areas, establishing the cells in the grid and assigning them names. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-areas) |
| `grid-template-columns` | The grid-template-columns CSS property defines the line names and track sizing functions of the grid columns. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns) |
| `grid-template-rows` | The grid-template-rows CSS property defines the line names and track sizing functions of the grid rows. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows) |

# Cross-item comparison

`grid-template-*` defines explicit tracks and named areas; `grid-auto-*` controls implicit tracks and auto-placement; `grid-row`/`grid-column` place items by line; `grid-area` combines row/column line placement or a named area; `grid` is a resetting shorthand. Flexbox distributes along one axis, while grid coordinates both axes.

# Examples

Use `minmax(0, 1fr)` when a track should share remaining space but must be allowed to shrink below its min-content contribution. Use `minmax(min(100%, 18rem), 1fr)` to avoid a fixed minimum wider than a narrow container.

```css
.layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr); gap: 1.5rem; }
@media (max-width: 48rem) { .layout { grid-template-columns: 1fr; } }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `1fr` alone always shrinks below intrinsic minimums.
- Confusing explicit and implicit tracks.
- Creating visual reading order that conflicts with source order.
- Using auto-placement where a stable, intentional placement is required.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `grid`, `grid-area`, `grid-auto-columns`, `grid-auto-flow`, `grid-auto-rows`, `grid-column`, `grid-column-end`, `grid-column-start`, `grid-row`, `grid-row-end`, `grid-row-start`, `grid-template`, `grid-template-areas`, `grid-template-columns`, `grid-template-rows`. Each has an individual definition and support link above.
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
