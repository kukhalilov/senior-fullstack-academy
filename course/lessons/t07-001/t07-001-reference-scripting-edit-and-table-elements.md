# HTML document structure metadata and semantic content elements — Reference: Scripting, edit, and table elements

## Scope and version

Current HTML Living Standard. See [WHATWG scripting](https://html.spec.whatwg.org/multipage/scripting.html), [edits](https://html.spec.whatwg.org/multipage/edits.html), [tables](https://html.spec.whatwg.org/multipage/tables.html), and [MDN elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

This group covers executable or fallback script content, document edit annotations, drawing surfaces, and the structure used for genuine tabular data. Table structure communicates row and column relationships; it is not a layout grid.

## Supplied names explained

- `<canvas>` — Scriptable bitmap drawing surface; provide fallback content and accessible equivalent information because pixels do not automatically expose meaning.
- `<noscript>` — Fallback content for environments where scripting is disabled or unsupported, subject to parsing context.
- `<script>` — Embeds or references executable code or data blocks. `type`, `src`, `async`, `defer`, and module semantics affect execution; protect inline scripts with an appropriate nonce/policy when using CSP.
- `<del>` — Marks content deleted from a document revision; optional `cite` and `datetime` can describe source/time.
- `<ins>` — Marks content inserted into a document revision, with optional citation/time metadata.
- `<caption>` — Gives a table its caption/title and is a child near the beginning of the table structure.
- `<col>` — Represents one or more columns in a column group, mainly for column-level semantics/presentation.
- `<colgroup>` — Groups columns and may contain column definitions; it precedes row groups in table structure.
- `<table>` — Represents tabular data with row/column relationships, not general page layout.
- `<tbody>` — Groups body rows. Browsers may insert it in the DOM even if it is omitted in source.
- `<td>` — Data cell in a row. Use header associations where relationships are not simple.
- `<tfoot>` — Groups footer rows, such as totals or summaries.
- `<th>` — Header cell for a row or column; `scope` or explicit headers can clarify relationships.
- `<thead>` — Groups header rows.
- `<tr>` — Table row containing header or data cells.

## Cross-item comparison

`<th>` supplies header semantics and `<td>` supplies data; visual bolding alone does not create a header. `<thead>`, `<tbody>`, and `<tfoot>` group row roles; `<colgroup>` and `<col>` describe columns. `<ins>`/`<del>` annotate document revisions, while `<script>` executes or provides script data. `<canvas>` is a drawing surface and needs a semantic/fallback counterpart.

## Examples

```html
<table>
  <caption>Quarterly revenue by region</caption>
  <thead><tr><th scope="col">Region</th><th scope="col">Revenue</th></tr></thead>
  <tbody><tr><th scope="row">North</th><td>$120,000</td></tr></tbody>
  <tfoot><tr><th scope="row">Total</th><td>$120,000</td></tr></tfoot>
</table>
```

## Common mistakes

- Using table markup for page layout instead of CSS layout.
- Omitting captions or headers, merging cells without a clear accessible association, or making data relationships depend only on color.
- Assuming `<tbody>` is absent from the DOM because it was omitted in the source.
- Using inline executable script without considering CSP, XSS, execution order, or user-controlled input.
- Drawing essential text only into canvas without a DOM-accessible equivalent.
- Treating `<noscript>` as a complete solution for all JavaScript failures; it addresses disabled/unsupported script contexts, not arbitrary runtime errors.

## Knowledge checks with answers

1. **What distinguishes `<th>` from `<td>`?** Header-cell semantics versus data-cell semantics.
2. **Why is a table a poor page-layout tool?** It asserts tabular relationships and can misrepresent the content structure.
3. **What should accompany a canvas for meaningful content?** Fallback/accessibility content or an equivalent DOM representation.
