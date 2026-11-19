# CSS layout flexbox grid positioning and responsive design — Reference: CSS Flexible Box Layout properties

# Scope and version

This lesson covers exactly the 8 assigned names in **CSS Flexible Box Layout properties**. The captured MDN pages from 2026-11-16 label seven established properties Baseline Widely available and `flex-line-count` Experimental; those labels describe feature support, not every value or nuance. Flexbox Level 1 is a mature published specification. The current Level 2 Editor’s Draft adds `flex-wrap: balance` and `flex-line-count`; these are experimental draft features and must not be treated as generally available. The live draft can change.

# How this group fits the mental model

Flexbox lays out a flex container’s **items** along a main axis, and optionally forms lines across a cross axis. `flex-direction` selects the main axis relative to the writing mode; it does not simply select physical left/right or top/bottom. `flex-wrap` determines whether items stay on one line or can form multiple lines. Each line performs its own main-axis sizing and free-space distribution. Wrapped flex lines do not form the shared two-dimensional tracks of CSS Grid.

The sizing sequence is conceptually: determine each item’s flex base size; account for outer sizes, margins, and gaps to find free space; choose grow or shrink factors according to whether space is positive or negative; distribute that space; clamp sizes by min/max constraints; and repeat freezing/redistribution as required by the flex algorithm. The result is not just a ratio. Automatic minimum sizes, intrinsic content, aspect ratios, gaps, and definite/indefinite container dimensions can all affect it.

# Supplied names explained

| Exact name | Role | Key behavior and gotchas |
| --- | --- | --- |
| `flex-direction` | Chooses main-axis orientation and flow direction: `row`, `row-reverse`, `column`, or `column-reverse`. | `row` follows the inline axis; `column` follows the block axis. `*-reverse` changes main-start/main-end flow but does not rewrite DOM order, speech order, or sequential keyboard navigation. Use source order that remains meaningful. |
| `flex-wrap` | Controls whether the flex container is single-line or multi-line: `nowrap`, `wrap`, or `wrap-reverse`. | `nowrap` is the initial behavior; `wrap` creates lines as needed; `wrap-reverse` reverses the cross-start/cross-end stacking direction, not the order of items within a line. The Level 2 draft adds `balance`, which tries to distribute items more evenly across lines; it is experimental and needs support checks. |
| `flex-flow` | Shorthand for `flex-direction` followed by `flex-wrap`. | Either component may be given alone; omitted components take their initial values. For example, `flex-flow: row wrap` permits rows to wrap. It does not set alignment or gaps. |
| `flex-basis` | Supplies an item’s flex base size along the main axis before grow/shrink distribution. | Accepts sizing values like `width`/`height` plus `content`; `auto` uses the main-size property, falling back to content sizing when that property is also auto. Percentages resolve against the flex container’s inner main size; if that size is indefinite, the used result can be content-based. In a row container it usually corresponds to width; in a column container, height, subject to writing mode and box sizing. |
| `flex-grow` | Nonnegative number (initial `0`) that weights an item’s share of positive free space on its line. | It is a factor, not a target size or percentage of the container. Space is distributed among unfrozen items with grow factors, after accounting for the flex base and constraints. Items with different bases do not necessarily finish equal. |
| `flex-shrink` | Nonnegative number (initial `1`) that weights an item’s share of negative free space on its line. | Shrinking uses the scaled shrink factor (shrink factor multiplied by inner flex base size), then respects minimum sizes. A `flex-shrink: 1` item can still overflow because of automatic minimum size or unbreakable content; inspect `min-width`/`min-height` or logical minimums when appropriate. |
| `flex` | Shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`. | Common forms: `flex: initial` = `0 1 auto`; `flex: auto` = `1 1 auto`; `flex: none` = `0 0 auto`; a positive number such as `flex: 1` sets a zero basis and grow factor, with shrink behavior from the shorthand grammar. Browsers commonly expand a one-number form with `0%` basis while the specification’s equivalent is expressed as zero; percentage versus length can differ in indefinite containers. Prefer the shorthand for common intent and inspect computed styles for edge cases. |
| `flex-line-count` | Experimental Level 2 property with a positive integer value and initial `1`; applies to multi-line flex containers. | In a `flex-wrap: balance` container it establishes a minimum number of lines over which items are balanced. It is capped by the number of items; the actual line count may exceed it if needed. In a non-balance multi-line container, the draft only uses it to adjust cross-axis available space. It has no effect when `flex-wrap: nowrap`. Do not rely on it without explicit browser support verification. |

# Cross-item comparison

`flex-direction` defines which dimension is main; `flex-basis` supplies each item’s starting main size; `flex-grow` and `flex-shrink` control how positive or negative free space is allocated; `flex` sets those three together. `flex-wrap` forms lines, while `flex-flow` combines wrapping and direction. `flex-line-count` belongs to the experimental Level 2 balancing extension, not ordinary Level 1 flex behavior. For a 2D layout whose rows and columns should share track sizing, compare Grid rather than trying to make wrapped flex lines behave like grid tracks.

The Level 1 shorthand has several easily confused forms. `flex: 1` is not the same as `flex: auto`: the former starts from a zero basis, while `auto` starts from the item’s main-size/content basis. `flex: none` opts out of both growth and shrinkage. Final dimensions still depend on free space and min/max constraints, so these are behavior presets rather than exact pixel widths.

# Examples

This row can wrap cards and allows each to grow from a 16rem basis. `min-inline-size: 0` removes the automatic minimum only if content should be allowed to shrink below its min-content contribution; it is not a universal flexbox fix.

```css
.card-row {
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
}

.card-row > article {
  flex: 1 1 16rem;
  min-inline-size: 0;
}
```

For an experimental balanced-wrap exploration, the Level 2 draft pairs `flex-wrap: balance` with `flex-line-count`; check engine support before using this in a production interface:

```css
.balanced-list {
  display: flex;
  flex-wrap: balance;
  flex-line-count: 3;
}
```

# Common mistakes

- Treating `row` as synonymous with left-to-right. Writing mode and `direction` affect the physical mapping.
- Treating `row-reverse`/`column-reverse` as semantic reordering. They change visual flow; they do not update source or assistive-technology order.
- Assuming wrapping makes flex rows share column widths. Each line sizes independently; Grid is usually the right model for shared tracks.
- Reading `flex-grow` as a percentage of the container. It weights leftover positive space after base sizes and constraints.
- Expecting `flex-shrink` to defeat min-content/automatic minimum sizes. Check min-size constraints and long unbreakable content.
- Assuming `flex: 1` and `flex: auto` mean the same thing, or that equal grow factors guarantee equal final sizes.
- Treating `flex-line-count` and `flex-wrap: balance` as stable Level 1 features. They are Level 2 draft additions with experimental support.
- Using `min-inline-size: 0` everywhere without checking whether content is then allowed to become too narrow or inaccessible.

# Knowledge checks with answers

1. **Why can two items with `flex: 1` end at different widths?** Their bases, min/max constraints, intrinsic content, margins, gaps, and available free space affect the algorithm; equal grow factors do not guarantee equal final sizes in every case.
2. **When is `flex: auto` different from `flex: 1`?** `auto` uses an auto/main-size basis (`1 1 auto`); a one-number form starts from a zero basis per shorthand behavior. The distinction matters when content or main-size declarations contribute different bases.
3. **Why does a flex item refuse to shrink?** Its automatic minimum size or other min-size constraint may prevent shrinking below its content-based minimum. Verify the relevant physical or logical min-size and content wrapping.
4. **Does `row-reverse` change keyboard tab order?** No. Visual flow direction is independent from DOM order and sequential navigation order.
5. **Is `flex-line-count: 3` guaranteed to produce exactly three lines?** No. In the Level 2 draft it sets a minimum for balancing, can be clamped by the item count, and more lines may still be needed. It has no effect on a single-line/no-wrap container.

# Sources

- [CSS Flexible Box Layout Module Level 1, published specification](https://www.w3.org/TR/css-flexbox-1/) — flex axes, line formation, sizing algorithm, shorthand grammar, intrinsic sizing, and automatic minimum sizes.
- [CSS Flexible Box Layout Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-flexbox-2/) — `flex-wrap: balance` and `flex-line-count`; this is work in progress and those features are experimental.
- [MDN `flex`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex) and the assigned [flex property references](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) — syntax, examples, and per-property compatibility data. Consult the individual pages for `flex-basis`, `flex-direction`, `flex-flow`, `flex-grow`, `flex-shrink`, and `flex-wrap`.
- [MDN `flex-line-count`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-line-count) — draft property reference and experimental status.
- [CSS Box Alignment Module Level 3](https://drafts.csswg.org/css-align-3/) and [CSS Gaps Module Level 1](https://drafts.csswg.org/css-gaps-1/) — alignment and gap interactions with flex layout; both current Editor’s Drafts are works in progress.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity snapshot, not a browser-support table.
