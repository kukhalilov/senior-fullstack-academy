# CSS layout flexbox grid positioning and responsive design — Reference: CSS Box Alignment properties

# Scope and version

This lesson explains all 12 supplied properties in **CSS Box Alignment properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 12 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Box Alignment defines alignment subjects, alignment containers, axes, distribution, and overflow behavior across flex, grid, and some block/multicol contexts. The same keyword can have context-specific effects because the available axis and free space differ. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `align-content` | The CSS align-content property sets the distribution of space between and around content items along a flexbox's cross axis, or a grid or block-level element's block axis. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/align-content) |
| `align-items` | The CSS align-items property sets the align-self value on all direct children as a group. In flexbox, it controls the alignment of items on the cross axis. In grid layout, it controls the alignment of items on the block axis within their grid areas. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/align-items) |
| `align-self` | The align-self CSS property overrides a grid or flex item's align-items value. In grid, it aligns the item inside the grid area. In flexbox, it aligns the item on the cross axis. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/align-self) |
| `column-gap` | The column-gap CSS property sets the size of the gap (gutter) between an element's columns in multi-column, flexible box, and grid layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-gap) |
| `gap` | The gap CSS shorthand property sets the gaps (also called gutters) between rows and columns on multi-column, flex, and grid containers. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap) |
| `justify-content` | The CSS justify-content property defines how the browser distributes space between and around content items along the main axis of a flex container and the inline axis of grid and multicol containers. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/justify-content) |
| `justify-items` | The CSS justify-items property defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/justify-items) |
| `justify-self` | The CSS justify-self property sets the way a box is justified inside its alignment container along the appropriate axis. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/justify-self) |
| `place-content` | The place-content CSS shorthand property allows you to align content along both the block and inline directions at once (i.e., the align-content and justify-content properties) in a relevant layout system such as Grid or Flexbox. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/place-content) |
| `place-items` | The place-items CSS shorthand property aligns items along both block and inline directions at the same time. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/place-items) |
| `place-self` | The place-self CSS shorthand property allows you to align an individual item in both the block and inline directions at once (i.e., the align-self and justify-self properties). This property applies to block-level boxes, absolutely-positioned boxes, and grid items. If the second value is not present, the first value is also used for it. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/place-self) |
| `row-gap` | The row-gap CSS property sets the size of the gap (gutter) between an element's rows in multi-column, flexible box, and grid layouts. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/row-gap) |

# Cross-item comparison

`align-*` usually addresses the cross/block axis appropriate to the formatting context; `justify-*` addresses the main/inline axis. `*-items` sets defaults for children, `*-self` overrides one item, and `*-content` distributes tracks or lines when extra space exists. `place-*` combines the corresponding alignment longhands; `gap` sets gutters rather than alignment.

# Examples

Center a grid’s items within their cells with `place-items: center`; to distribute the grid tracks in a larger container, consider `place-content` instead. Verify whether tracks or items are the alignment subject.

```css
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Treating `align-content` and `align-items` as synonyms.
- Expecting content-distribution properties to create free space.
- Forgetting auto margins can consume free space before alignment.
- Using physical alignment assumptions in vertical writing modes.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `align-content`, `align-items`, `align-self`, `column-gap`, `gap`, `justify-content`, `justify-items`, `justify-self`, `place-content`, `place-items`, `place-self`, `row-gap`. Each has an individual definition and support link above.
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
