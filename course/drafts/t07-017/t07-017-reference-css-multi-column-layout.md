# CSS layout flexbox grid positioning and responsive design — Reference: CSS Multi-column Layout properties

# Scope and version

This lesson explains all 8 supplied properties in **CSS Multi-column Layout properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 8 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Multi-column layout fragments continuous block content into newspaper-like columns. The browser balances or fills columns according to available height and fragmentation constraints; it is not a grid of independent semantic columns. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `column-count` | The column-count CSS property breaks an element's content into the specified number of columns. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-count) |
| `column-fill` | The column-fill CSS property controls how an element's contents are balanced when broken into columns. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-fill) |
| `column-rule` | The column-rule CSS shorthand property sets the width, style, and color of the lines drawn between columns in multi-column grid, flex, and multi-col layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-rule) |
| `column-rule-color` | The column-rule-color CSS property defines the colors of the lines drawn between columns in multi-column grid, flex, and multi-col layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-rule-color) |
| `column-rule-style` | The column-rule-style CSS property defines the line style of the lines drawn between columns in multi-column grid, flex, and multi-col layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-rule-style) |
| `column-rule-width` | The column-rule-width CSS property defines the widths of the lines drawn between columns in multi-column grid, flex, and multi-col layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-rule-width) |
| `column-span` | The column-span CSS property makes it possible for an element to span across all columns when its value is set to all. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-span) |
| `columns` | The columns CSS shorthand property sets the maximum number of columns to use when drawing an element's contents, along with the minimum width and maximum height of the element's columns. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/columns) |

# Cross-item comparison

`columns` combines count and width hints; `column-count` requests a count, while `column-width` guides desired width. `column-rule` is a shorthand for the visual divider. `column-span: all` lets a child span the columns and can split a multicol fragmentainer sequence.

# Examples

Use multicol for flowing prose or reference lists, not for a collection that must remain row-aligned. Test keyboard reading and print fragmentation as column order can differ from common web navigation expectations.

```css
.glossary { columns: 18rem 3; column-gap: 2rem; column-rule: 1px solid #bbb; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Expecting independent row alignment like grid.
- Fixing both count and width without considering the container size.
- Assuming `column-span: all` is supported identically in all engines.
- Using multicol for source-order-sensitive navigation without testing.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `column-count`, `column-fill`, `column-rule`, `column-rule-color`, `column-rule-style`, `column-rule-width`, `column-span`, `columns`. Each has an individual definition and support link above.
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
