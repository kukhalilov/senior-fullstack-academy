# CSS layout flexbox grid positioning and responsive design — Reference: CSS Box Alignment properties

# Scope and version

This lesson covers exactly the 12 properties assigned to **CSS Box Alignment properties**. The captured MDN property pages listed all 12 as Baseline Widely available on 2026-11-16; representative live pages were rechecked on 2026-11-19. That label applies to the established property feature; it does not guarantee every newer keyword or every context-specific behavior is implemented in every browser. Check each target browser’s compatibility table for production use. The CSS Box Alignment Level 3 Editor’s Draft checked here is work in progress; the published specification and browser support data remain distinct sources of status.

# How this group fits the mental model

An alignment property has an **alignment subject** (the box, items, lines, or tracks being moved), an **alignment container** (the space they are positioned within), and an axis. The relevant axes are logical: block and inline axes depend on writing mode; flex containers use main and cross axes, which derive from `flex-direction` and writing mode. Thus `justify-*` does not always mean horizontal and `align-*` does not always mean vertical.

There are three useful scopes:

- **Self alignment** positions one box in its containing area: `align-self` and `justify-self`.
- **Default item alignment** supplies values for children: `align-items` and `justify-items`; a child’s self-alignment property can override the default.
- **Content alignment** positions a collection of lines, tracks, or content within the container: `align-content` and `justify-content`.

The `place-*` properties are shorthands. `gap`, `row-gap`, and `column-gap` specify gutters between layout items; they do not align items or add a gutter around the outside edge. Tables use `border-spacing` for cell separation.

# Supplied names explained

| Property | Subject and axis | Where it matters and practical distinction |
| --- | --- | --- |
| `align-content` | A group of content, flex lines, or grid tracks on the block/cross axis. | In grid it aligns the track set in the grid’s block axis; in a multi-line flex container it aligns the flex lines in the cross axis; in block layout it can align content within the content box when the relevant sizing conditions allow. In a single-line flex container it has no effect. It does not align each item inside its own area; use `align-items`/`align-self` for that. |
| `align-items` | Default self-alignment of children on the block/cross axis. | In grid it aligns items within their grid areas; in flex it aligns items on the cross axis (and baseline behavior can group items). It sets a default, not a forced value: a child can specify `align-self`. `normal` is context-sensitive and often stretches auto-sized grid/flex items, with exceptions such as intrinsic sizing and aspect ratio. |
| `align-self` | One item on the block/cross axis. | Overrides the parent’s `align-items` for that item in contexts that support self-alignment, notably grid and flex. In flex it cannot align along the main axis. `auto` generally takes the parent’s `align-items` value; the exact effect of `normal` and `stretch` depends on the layout context and sizing constraints. |
| `justify-content` | A collection of items/tracks on the main/inline axis. | In flex it distributes free main-axis space among items; in grid it positions the track set in the inline axis; in multicol it distributes columns in the inline axis. It does not position one grid item inside its cell. It has no effect on ordinary block containers. In flex, `stretch` behaves as `flex-start`. |
| `justify-items` | Default self-alignment of children on the inline/main axis. | Most visible in grid, where it aligns items within their grid areas. It is not the flex item main-axis alignment control; flex uses `justify-content` for distribution and does not use `justify-items` to align individual flex items. `legacy` exists for compatibility with historical HTML alignment behavior. |
| `justify-self` | One item on the inline/main axis. | Aligns an item inside its alignment area, especially a grid area. It does not affect flex items; use auto margins or container-level flex distribution for flex main-axis placement. `left` and `right` are physical-direction values accepted by `justify-*`, unlike the logical `start` and `end`. |
| `place-content` | Shorthand for content alignment on block/cross then inline/main axes. | Sets `align-content` followed by optional `justify-content`. One value supplies both components, subject to the shorthand’s baseline fallback rule. A second value is useful when the two axes need different distribution. |
| `place-items` | Shorthand for default item alignment on block/cross then inline/main axes. | Sets `align-items` followed by optional `justify-items`. When the second value is omitted, the first is used for both. This is commonly useful for centering grid items in both directions; it does not distribute grid tracks. |
| `place-self` | Shorthand for one item on block/cross then inline/main axes. | Sets `align-self` followed by optional `justify-self`. When the second value is omitted, the first is used for both. Each component still follows that component’s applicability: `justify-self` has no effect on flex items, so the shorthand does not create flex main-axis self-alignment. |
| `row-gap` | Fixed gutter between layout rows, along the block axis. | Applies to grid, flex, and multicol containers. In row-direction flex, row gaps separate flex lines; in column-direction flex, they separate successive items. In multicol, visible row gaps depend on a layout that actually creates rows; ordinary flowing columns are separated by `column-gap`. `normal` uses zero in grid/flex but a font-relative used value in multicol. |
| `column-gap` | Fixed gutter between layout columns, along the inline axis. | Applies to grid, flex, and multicol containers. In row-direction flex, column gaps separate items in a line; in column-direction flex, they separate flex lines. In multicol it separates columns and is the familiar column gutter. `normal` is context-dependent as described for `row-gap`. |
| `gap` | Shorthand: `row-gap` first, optional `column-gap` second. | One value sets both gaps; two values set row then column. Nonnegative lengths and percentages are accepted, plus `normal`; percentages resolve against the corresponding content-box dimension with layout-specific cyclic/intrinsic sizing details. Gaps are minimum separation: content distribution can enlarge them. They do not appear at the outer edges, unlike margins, and gaps disappear at fragmentation breaks. |

# Cross-item comparison

The alignment properties share families of values, but their grammar and effect depend on the property and formatting context:

- **Position values** include logical `start`, `end`, `center`, `self-start`, and `self-end`, plus flex-relative `flex-start`/`flex-end` where allowed. `left` and `right` are accepted only by `justify-*` properties. Logical values adapt to writing mode; physical left/right do not.
- **Baseline alignment** (`baseline`, `first baseline`, `last baseline`) aligns baseline-sharing groups, useful for labels, headings, or cards whose text should line up despite different box sizes. If a baseline group cannot be formed, the specification defines a fallback alignment; it is not equivalent to centering.
- **Stretch** can expand auto-sized items or tracks to fill available space, subject to intrinsic sizes, aspect ratios, min/max constraints, and the layout algorithm. It does not mean “make every box larger” unconditionally.
- **Content distribution** values include `space-between`, `space-around`, `space-evenly`, and `stretch`. They distribute available free space; they cannot create it. `space-between` has no distributed space when there is only one subject. `normal` is not one universal position: its used behavior depends on the layout mode.
- **Overflow alignment** prefixes such as `safe center` ask the browser to avoid an alignment that would make content inaccessible through overflow; `unsafe` permits the requested alignment even if content overflows. Use safe alignment for controls/content that must remain reachable.
- **Anchor positioning integration** introduces `anchor-center` in the current grammar for relevant anchor-positioned boxes. This newer value is not implied to have the same support as the established property; verify implementation status independently.

The CSS Align specification defines the full formal grammars and fallback behavior. Avoid inferring the allowed keywords for one property from another: for example, `align-*` excludes physical `left`/`right`, and `*-items` has the special `legacy` compatibility value in its relevant grammar.

# Examples

For a responsive card grid, `gap` controls the minimum gutters, `place-items` aligns the card boxes inside their grid areas, and `place-content` positions the whole track set if the grid is smaller than its container. If the cards should fill their cells, the default stretch behavior may already do that; adding `center` can instead shrink auto-sized items around their content. In flex layout, `justify-content` distributes items or free space along the main axis, while `align-items` positions them across the cross axis. Changing `flex-direction` changes which physical direction those axes map to.

```css
.toolbar {
  display: flex;
  align-items: center;        /* cross-axis alignment */
  justify-content: space-between; /* main-axis distribution */
  gap: 1rem;                  /* minimum between adjacent items */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem 1.5rem;           /* row gap, then column gap */
  place-items: start stretch; /* block-axis then inline-axis defaults */
}
```

# Common mistakes

- Assuming `align` always means vertical and `justify` always means horizontal; writing mode and flex direction determine the axes.
- Confusing aligning each item (`*-items`/`*-self`) with positioning the whole set (`*-content`).
- Expecting `align-content` to move a single flex line, or `justify-self`/`justify-items` to align flex items on the main axis.
- Expecting content-distribution values to manufacture free space. Auto margins, intrinsic sizing, and track sizing can consume or constrain it first.
- Treating `normal` as a synonym for `stretch` in every context.
- Assuming `gap` adds space around the container, or using it to separate table cells.
- Treating an MDN Baseline property label as proof that every newer keyword, layout context, or embedded browser supports it.
- Reordering visual items with CSS without preserving a sensible DOM, keyboard, and assistive-technology reading order.

# Knowledge checks with answers

1. **A grid’s cells have enough space but the whole track set is packed at the start. Which kind of property should you inspect?** Content alignment (`justify-content` and/or `align-content`), because the alignment subject is the track set. Item alignment will only change each item inside its area.
2. **Why might `align-content` do nothing in a flex example?** A single-line flex container has no multiple lines to distribute; it also needs applicable free space and sizing conditions.
3. **What does `gap: 0.5rem 1rem` mean?** `row-gap: 0.5rem` and `column-gap: 1rem`; these are minimum internal gutters and can be enlarged by content distribution.
4. **Does `place-self: center` center a flex item on both axes?** No. It supplies both self-alignment components, but `justify-self` does not affect flex items. Flex main-axis positioning is controlled at the container or by margins.
5. **Is `place-items: center` equivalent to centering all grid tracks in the container?** No. It aligns grid items within their areas. Use content alignment to position the track set.

# Sources

- [CSS Box Alignment Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-align-3/) — formal property grammars, alignment subjects/containers, axes, distribution, overflow safety, and layout-specific behavior. The draft is work in progress.
- [CSS Gaps Module Level 1, current Editor’s Draft](https://drafts.csswg.org/css-gaps-1/) — `gap`, `row-gap`, and `column-gap` grammar, context, percentage behavior, normal used values, and gutter interactions. The draft is work in progress.
- [CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/) — flex axes, line alignment, and flex-specific behavior.
- [CSS Grid Layout Module Level 2](https://www.w3.org/TR/css-grid-2/) — grid item/area and track alignment.
- [CSS Multi-column Layout Module Level 1](https://www.w3.org/TR/css-multicol-1/) — column distribution and multicol gutters.
- [MDN CSS Box Alignment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_alignment) — practical overview and compatibility links.
- [MDN `align-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/align-content), [`justify-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/justify-content), [`place-self`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/place-self), and [`gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap) — syntax/examples/status; inspect each assigned property’s reference page for its complete compatibility table.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — published specification maturity snapshot, not an implementation table.
