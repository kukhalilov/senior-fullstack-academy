# CSS layout flexbox grid positioning and responsive design — Reference: CSS Table properties

# Scope and version

This lesson explains all 5 supplied properties in **CSS Table properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 5 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Table layout uses rows, columns, cells, and column sizing constraints rather than ordinary block flow. The table formatting algorithm can coordinate column widths across rows, while border model and caption placement affect geometry and painting. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `border-collapse` | The border-collapse CSS property sets whether cells inside a <table> have shared or separate borders. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-collapse) |
| `border-spacing` | The border-spacing CSS property sets the distance between the borders of adjacent cells in a <table>. This property applies only when border-collapse is separate. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-spacing) |
| `caption-side` | The caption-side CSS property puts the content of a table's <caption> on the specified side. The values are relative to the writing-mode of the table. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/caption-side) |
| `empty-cells` | The empty-cells CSS property sets whether borders and backgrounds appear around <table> cells that have no visible content. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/empty-cells) |
| `table-layout` | The table-layout CSS property sets the algorithm used to lay out <table> cells, rows, and columns. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/table-layout) |

# Cross-item comparison

`table-layout: fixed` bases horizontal column sizing on table width and early row/caption inputs rather than all cell content; `auto` considers content contributions. `border-collapse` chooses shared versus separated borders; `border-spacing` matters only in separated mode. `empty-cells` and `caption-side` affect presentation, not whether semantic table markup is appropriate.

# Examples

Use a real table for data with row/column relationships and headers. Select fixed layout when a known table width and predictable columns matter, then handle long cell content explicitly.

```css
table { table-layout: fixed; width: 100%; border-collapse: collapse; }
th, td { overflow-wrap: anywhere; border: 1px solid #888; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Using a table solely for page layout.
- Expecting border-spacing to affect collapsed borders.
- Setting fixed layout without a table width that permits its algorithm.
- Omitting captions and header associations for data tables.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `border-collapse`, `border-spacing`, `caption-side`, `empty-cells`, `table-layout`. Each has an individual definition and support link above.
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
