# CSS layout flexbox grid positioning and responsive design — Reference: CSS Display properties

# Scope and version

This lesson explains all 5 supplied properties in **CSS Display properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 3 names have an MDN Baseline label, 2 have Limited availability, and 2 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Display establishes the outer participation of a box and the inner formatting context for its children. It is the switchboard that determines whether children use flow, flex, grid, table, or another model; it is not just a visibility toggle. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `display` | The display CSS property sets whether an element is treated as a block or inline box and the layout used for its children, such as flow layout, grid or flex. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display) |
| `order` | The order CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending order value and then by their source code order. Items not given an explicit order value are assigned the default value of 0. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order) |
| `reading-flow` | The reading-flow CSS property enables modifying the reading order of child elements of a block, flex, or grid layout. This affects the order in which they are rendered to speech and navigated to when using sequential navigation such as tabbing to links or buttons. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/reading-flow) |
| `reading-order` | The reading-order CSS property enables changing the order in which a child of a reading flow container is read relative to its element siblings. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/reading-order) |
| `visibility` | The visibility CSS property shows or hides an element without changing the layout of a document. The property can also hide rows or columns in a <table>. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/visibility) |

# Cross-item comparison

`display` creates the formatting model; `visibility` affects painting while generally retaining layout space; `order` changes flex/grid layout order but normally leaves DOM source order untouched. `reading-flow` and `reading-order` are evolving tools for aligning sequential navigation with a rendered layout; they do not excuse an incoherent source order.

# Examples

Use semantic source order for a card list, then choose grid for two-dimensional placement. Avoid reordering a meaningful process visually unless the sequential reading and focus order stay understandable.

```css
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 1rem; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `display: none` is equivalent to `visibility: hidden`; the former removes the box from layout and rendering.
- Using `order` to disguise incorrect DOM order.
- Assuming `visibility: hidden` removes allocated space.
- Using emerging reading-flow features without checking keyboard and assistive-technology behavior.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `display`, `order`, `reading-flow`, `reading-order`, `visibility`. Each has an individual definition and support link above.
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
