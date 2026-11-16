# CSS layout flexbox grid positioning and responsive design — Reference: CSS Flexible Box Layout properties

# Scope and version

This lesson explains all 8 supplied properties in **CSS Flexible Box Layout properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 7 names have an MDN Baseline label, 0 have Limited availability, and 1 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Flexbox lays out items along a main axis, forms lines when wrapping is enabled, and distributes positive or negative free space through flex base sizes, grow/shrink factors, and constraints. It is best for a one-dimensional relationship; wrapped lines do not share track sizing as a grid does. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `flex` | The flex CSS shorthand property sets how a flex item will grow or shrink to fit the space available in its flex container. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex) |
| `flex-basis` | The flex-basis CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with box-sizing. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-basis) |
| `flex-direction` | The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed). **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-direction) |
| `flex-flow` | The flex-flow CSS shorthand property specifies the direction of a flex container, as well as its wrapping behavior. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-flow) |
| `flex-grow` | The flex-grow CSS property sets the flex grow factor, which specifies how much of the flex container's positive free space, if any, should be assigned to the flex item's main size. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-grow) |
| `flex-line-count` | Sets the minimum number of flex lines over which wrapped items are balanced. It has an effect only when flex-wrap or flex-flow includes the balance keyword in a multi-line flex container. **MDN support snapshot:** Experimental; CSS Flexible Box Layout Level 2 Editor’s Draft; MDN marks it experimental. [MDN/spec](https://drafts.csswg.org/css-flexbox-2/) |
| `flex-shrink` | The flex-shrink CSS property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, the flex items can shrink to fit according to their flex-shrink value. Each flex line's negative free space is distributed between the line's flex items that have a flex-shrink value greater than 0. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-shrink) |
| `flex-wrap` | The flex-wrap CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-wrap) |

# Cross-item comparison

`flex-basis` supplies the starting main size before free-space distribution; `flex-grow` and `flex-shrink` distribute positive and negative free space; `flex` combines all three. `flex-direction` chooses the main axis and its direction, while `flex-wrap` controls line formation and, in newer draft syntax, balancing. `flex-flow` combines direction and wrapping.

# Examples

For a row of cards that may wrap, set a basis that describes a useful minimum and allow items to shrink only where content can do so. Add `min-inline-size: 0` to a flex item only when its automatic minimum is the specific source of overflow.

```css
.row { display: flex; flex-flow: row wrap; gap: 1rem; }
.row > * { flex: 1 1 16rem; min-inline-size: 0; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `flex: 1` means exactly equal final width in every circumstance; min-size constraints, gaps, and content matter.
- Assuming a flex item always shrinks below its min-content size.
- Using flexbox for a two-dimensional shared-track layout.
- Treating `flex-line-count` or `wrap balance` as a broadly supported baseline; the feature is experimental and only applies to balanced wrapping.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `flex`, `flex-basis`, `flex-direction`, `flex-flow`, `flex-grow`, `flex-line-count`, `flex-shrink`, `flex-wrap`. Each has an individual definition and support link above.
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
