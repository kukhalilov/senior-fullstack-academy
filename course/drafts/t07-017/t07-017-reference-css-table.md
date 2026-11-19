# CSS layout flexbox grid positioning and responsive design — Reference: CSS Table properties

# Scope and version

This lesson covers the five assigned properties: `border-collapse`, `border-spacing`, `caption-side`, `empty-cells`, and `table-layout`. The CSS 2.2 table chapter remains the detailed reference for the table model and algorithms. CSS Logical Properties Level 1 adds the logical `caption-side` values `inline-start` and `inline-end`; those are draft-defined additions, not `block-start`/`block-end` values. A specification value does not by itself guarantee implementation across browsers.

# How this group fits the mental model

CSS table layout coordinates cells through shared row and column tracks. The table’s structure comes from the document language (normally HTML); CSS controls presentation and sizing. This coordination is why a column’s width can be affected by cells in multiple rows. A table is appropriate for data whose relationships are genuinely tabular, not merely because a page needs columns.

# Supplied names explained

| Property | Values and behavior |
| --- | --- |
| `table-layout` | `auto \| fixed`; initial `auto`; applies to `table` and `inline-table`; not inherited. The fixed algorithm determines horizontal layout from the table’s specified width, column widths, borders/spacing, and first row rather than examining every cell’s contents. `<col>` widths are considered first, then first-row cell widths (spanning widths are distributed), then remaining space is shared. The table needs a non-auto width for the specified fixed algorithm; CSS 2.2 allows user agents to use fixed layout for a block-level table in normal flow even when width is `auto`. The automatic algorithm considers cell content, but CSS 2.2 does not completely define its algorithm, so implementations can differ. |
| `border-collapse` | `collapse \| separate`; initial `separate`; inherited. `separate` draws cell borders independently and permits spacing; `collapse` resolves adjoining borders into a shared border. In the collapsed model, competing borders are resolved by rules considering `hidden`, style, width, and the originating table/row/cell elements. |
| `border-spacing` | One or two nonnegative lengths; initial `0`; inherited; applies only with `border-collapse: separate`. One value sets both horizontal and vertical spacing; two values set horizontal then vertical spacing. Spacing also exists between the outer table border and the first/last cells, with the table’s padding contributing at the edge. It has no effect in collapsed-border mode. |
| `empty-cells` | `show \| hide`; initial `show`; inherited; applies to table-cell boxes in the separated-border model. `hide` suppresses the borders and background of an empty cell according to the specification’s emptiness conditions; it does not remove the cell from table layout. It has no effect when borders collapse. |
| `caption-side` | CSS 2.2 defines `top \| bottom` (initial `top`; inherited), placing the caption before or after the table grid. The CSS Logical Properties Level 1 draft adds `inline-start \| inline-end` where supported; these map to the table’s inline axis. CSS 2.2 `left`/`right` behavior is legacy and not a substitute for the logical values. The added inventory values are `caption-side: inline-start` and `caption-side: inline-end`. |

# Cross-item comparison

Choose `table-layout: fixed` when predictable, early-determined columns matter and the table has a usable width. It can avoid scanning later cell contents to determine horizontal track widths, but long content still needs an overflow or wrapping strategy. `auto` adapts tracks to content and can be more suitable when content should influence sizing; its exact algorithm is implementation-dependent.

Choose `border-collapse: collapse` for a single shared grid line. Choose `separate` when independent cell borders or visible spacing is desired; only there do `border-spacing` and `empty-cells` have their specified effects. `caption-side` places the caption relative to the table and writing direction; it does not replace a meaningful `<caption>` or header relationships.

# Examples

```css
table.data {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

table.data th,
table.data td {
  border: 1px solid #888;
  overflow-wrap: anywhere;
}

table.data caption {
  caption-side: top;
}
```

For tables with long or complex content, test narrow viewports and zoom. Preserve semantic header cells and associations; changing the visual table model alone does not create accessible tabular semantics.

# Common mistakes

- Assuming CSS 2.2 fully specifies the automatic table-layout algorithm.
- Expecting `border-spacing` or `empty-cells` to affect collapsed borders.
- Thinking `empty-cells: hide` removes a cell or shifts later cells into its place.
- Assuming `table-layout: fixed` clips or wraps overflowing content automatically.
- Treating the draft logical caption values as universally supported or using nonexistent `block-start`/`block-end` values for this property.
- Using data-table markup only to obtain page layout columns.

# Knowledge checks with answers

1. **Why can a cell in a later row affect an auto-layout column?** The automatic algorithm considers content contributions across cells, although CSS 2.2 leaves its exact algorithm under-specified.
2. **Which border model uses `border-spacing`?** The separated model (`border-collapse: separate`).
3. **Does `empty-cells: hide` remove an empty cell from the grid?** No. It suppresses its border/background under the defined conditions; the cell remains part of layout.
4. **What values does the logical-properties draft add to `caption-side`?** `inline-start` and `inline-end`.

# Sources

- [CSS 2.2, Tables](https://www.w3.org/TR/CSS22/tables.html) — table model, layout algorithms, captions, borders, and empty cells.
- [CSS Logical Properties and Values Level 1](https://www.w3.org/TR/css-logical-1/) — §2.1, logical values for `caption-side`.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — status of CSS modules, not browser support.
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) — compatibility information should be checked for target browsers.
