# CSS layout flexbox grid positioning and responsive design — Reference: CSS Positioned Layout properties

# Scope and version

# How this group fits the mental model

Positioning answers two different questions: **Does this box keep its normal-flow space?** and **Which rectangle provides its coordinate system?** `static` uses ordinary flow; `relative` keeps its original slot and shifts the painted box; `absolute` leaves normal flow and uses an absolute-positioning containing block; `fixed` is a special absolute scheme attached to a fixed containing block; `sticky` keeps its flow slot and is visually constrained relative to a scrollport as scrolling proceeds.

Insets (`top`, `right`, `bottom`, `left`, their logical counterparts, and shorthands) are offsets, not coordinates in a universal page space. Their reference depends on the positioning scheme and its containing block. Writing modes determine how logical `block`/`inline` edges map to physical sides. `float` is a separate flow-wrapping model: a float is out of normal flow for block placement but affects surrounding line boxes, so it is not equivalent to absolute positioning.

# Supplied names explained

| Exact name | Role | Practical behavior and gotchas |
| --- | --- | --- |
| `position` | Selects `static`, `relative`, `absolute`, `fixed`, or `sticky`. | `static` is normal flow and ignores inset offsets. `relative` remains in flow; offsets visually move it while its original space remains. `absolute` is out of flow and positioned against the nearest ancestor establishing an absolute containing block (often a positioned ancestor). `fixed` uses the nearest fixed-position containing block, usually the viewport if none is established by an ancestor. `sticky` behaves like relative positioning until a scroll threshold, then stays constrained by its nearest scrollport and containing block. Sticky needs a non-`auto` inset on the axis to stick; an intervening scroll container, insufficient room, or oversized sticky box can make it appear not to work. |
| `top` | Physical top inset for a positioned box. | With absolute/fixed positioning it offsets from the containing block’s top edge; with relative positioning it shifts from the box’s normal position; with sticky positioning it defines a scrollport threshold. Percentages refer to the containing block’s height. It has no positioning effect when `position: static`. |
| `right` | Physical right inset for a positioned box. | Same positioning-scheme distinctions as `top`; percentages refer to the containing block’s width. It is physical, so use logical inset properties for writing-mode-aware layouts. |
| `bottom` | Physical bottom inset for a positioned box. | Same scheme distinctions; percentages refer to the containing block’s height. In absolute layout, paired inset/size constraints participate in solving the final size and position rather than merely translating the box. |
| `left` | Physical left inset for a positioned box. | Same scheme distinctions; percentages refer to the containing block’s width. When opposing insets over-constrain an axis, direction and writing-mode rules resolve which side controls or how auto margins/sizes are calculated. |
| `inset` | Physical shorthand for `top`, `right`, `bottom`, and `left`. | Uses the familiar one-to-four-value expansion: one value all sides; two vertical/horizontal; three top/horizontal/bottom; four top/right/bottom/left. It has no independent geometry: each expanded inset follows the current positioning scheme. |
| `inset-block-start` | Logical inset at the block-start edge. | Maps to a physical side according to `writing-mode`; for horizontal writing it is usually top, while vertical writing changes the mapping. Percentages resolve against the relevant containing-block dimension for the block axis. |
| `inset-block-end` | Logical inset at the block-end edge. | Opposite block edge to `inset-block-start`; maps with writing mode rather than hard-coding bottom. It has the same scheme-dependent meaning as the physical inset properties. |
| `inset-inline-start` | Logical inset at the inline-start edge. | Maps using writing mode and text direction; in common LTR horizontal writing it is left, while RTL or vertical writing changes the mapping. Prefer it for direction-aware components. |
| `inset-inline-end` | Logical inset at the inline-end edge. | Opposite inline edge to `inset-inline-start`; avoids hard-coded right/left assumptions. |
| `inset-block` | Shorthand for `inset-block-start` and `inset-block-end`. | One value sets both logical block edges; two set start then end. It is not the physical top/bottom shorthand in every writing mode. |
| `inset-inline` | Shorthand for `inset-inline-start` and `inset-inline-end`. | One value sets both logical inline edges; two set start then end. Use logical properties when the component must work in RTL or vertical writing. |
| `float` | Moves a box to a side so inline content can wrap around it. | Established values include `left`, `right`, and `none`; logical `inline-start` and `inline-end` allow flow-relative placement. A float is removed from normal block flow but remains part of the surrounding formatting behavior: line boxes wrap around it, later floats are constrained, and its parent may need a new block formatting context/flow-root to contain it. It is suited to text wrapping around figures, not modern page-level columns. |
| `clear` | Prevents a box from sitting alongside specified preceding floats. | Values include `none`, `left`, `right`, `both`, and logical `inline-start`/`inline-end`. It moves the cleared box below applicable floats in its block formatting context; it does not clear arbitrary positioned elements or replace margin/layout spacing. |
| `z-index` | Sets a stacking level for boxes that participate in stacking. | Accepts `auto` or an integer. A positioned box with an integer `z-index` establishes a local stacking context; fixed and sticky positioned boxes form stacking contexts even with `auto`. Flex/grid items can also use integer `z-index` without becoming positioned. Descendants are compared within their stacking context, so a huge number cannot escape an ancestor context. `z-index` changes stacking, not normal-flow layout. |

# Cross-item comparison

For a badge anchored to a card, give the card `position: relative` and the badge `position: absolute` with logical insets. The card remains in normal flow and supplies the badge’s containing block; the badge does not reserve space. For a persistent header, compare `sticky` (retains its flow slot and sticks within a scrollport) with `fixed` (removed from flow and attached to its fixed containing block). Neither choice guarantees room for content underneath; account for overlap, safe areas, zoom, and focus visibility.

Logical insets and physical insets set equivalent kinds of offsets but differ in mapping. `inset` groups the four physical sides; `inset-block`/`inset-inline` group logical pairs. Floats and clears do not use the positioned-box coordinate model. Stacking is a separate painting relationship: first understand stacking-context boundaries, then choose a local `z-index` scale rather than escalating values without checking ancestors.

# Examples

The badge is anchored to the card’s padding box because the card establishes the containing block. Logical end/start keeps it in the same semantic corner in RTL and vertical writing modes.

```css
.card {
  position: relative;
}

.card__badge {
  position: absolute;
  inset-block-start: 0.5rem;
  inset-inline-end: 0.5rem;
}

.site-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
}
```

For a floated editorial image, use a flow-relative side and clear only where the following content must begin below the float:

```css
.article-image { float: inline-start; margin-inline-end: 1rem; }
.article-section { clear: inline-start; }
```

# Common mistakes

- Assuming `position: fixed` always uses the viewport. Ancestor properties such as transforms, containment, and related containing-block triggers can establish a nearer fixed containing block.
- Expecting `absolute` or `fixed` boxes to reserve space for themselves.
- Expecting `sticky` to stick without a non-auto inset, a useful scrollport, and enough containing-block space.
- Setting `z-index: 999999` without checking whether an ancestor stacking context traps the element.
- Assuming `z-index` only applies to positioned boxes; flex and grid items also accept an integer stacking level.
- Treating `float` as fully removed from all flow behavior. Inline content still wraps around it.
- Using physical `left`/`right` for components that need to adapt to RTL or vertical writing.
- Treating `inset` as an unconditional translation shorthand; absolute opposing insets also affect sizing.
- Assuming `clear` clears every overlap. It only addresses the applicable preceding floats.

# Knowledge checks with answers

1. **Why does an absolutely positioned badge overlap the card without pushing later content?** The badge is out of normal flow. The relatively positioned card establishes its containing block but keeps its own flow slot.
2. **Why might a fixed dialog child scroll with a transformed parent?** That ancestor can establish a fixed-position containing block, so the child is fixed relative to it instead of the viewport.
3. **What does `inset: 0 1rem` expand to?** Top and bottom are `0`; right and left are `1rem`. These are physical sides, unlike `inset-block`/`inset-inline`.
4. **Why can `z-index: 100000` still appear behind another component?** Its stacking context is compared as a unit within its parent context; its child cannot outrank an element in a higher ancestor context.
5. **How does a float differ from absolute positioning?** Both leave normal block placement, but a float affects surrounding inline line layout and text wraps beside it; an absolutely positioned box does not participate in that wrapping.
6. **When can `clear: both` help?** When the element should be placed below preceding left and right floats in the relevant block formatting context.

# Sources

- [CSS Positioned Layout Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-position-3/) — position schemes, containing blocks, inset values, sticky behavior, absolute layout, and stacking. Work in progress.
- [CSS Positioned Layout Module Level 4, current Editor’s Draft](https://drafts.csswg.org/css-position-4/) — painting/stacking and top layer model. Work in progress.
- [CSS 2.2 Visual Formatting Model](https://www.w3.org/TR/CSS22/visuren.html) — established float, clear, normal-flow, and classic stacking concepts; read with newer modules for current extensions.
- [CSS Display Module Level 3](https://drafts.csswg.org/css-display-3/) and [CSS Logical Properties and Values Level 1](https://www.w3.org/TR/css-logical-1/) — formatting-context behavior, blockification, and logical flow-relative sides.
- [CSS Transforms Module Level 1](https://www.w3.org/TR/css-transforms-1/) and [CSS Containment Module Level 2](https://www.w3.org/TR/css-contain-2/) — ancestor effects relevant to containing blocks and fixed positioning.
- [MDN CSS position](https://developer.mozilla.org/en-US/docs/Web/CSS/position), [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index), [float](https://developer.mozilla.org/en-US/docs/Web/CSS/float), and [clear](https://developer.mozilla.org/en-US/docs/Web/CSS/clear) — practical guides and compatibility links; consult each assigned property page for its complete grammar and target-browser data.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — published specification maturity snapshot, not a browser implementation table.
