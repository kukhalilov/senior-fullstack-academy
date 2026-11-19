# CSS layout flexbox grid positioning and responsive design — Reference: CSS Grid Layout properties

# Scope and version

This lesson covers exactly the 15 properties assigned to **CSS Grid Layout properties**. MDN’s captured 2026-11-16 property pages mark the 15 established properties Baseline Widely available; that label does not promise every value, newer feature, or embedded browser behaves identically. The published Grid Level 2 specification adds subgrid to Grid; compatibility should still be checked for the exact browser versions you support. The current Grid Level 3 Editor’s Draft describes the experimental one-dimensional grid-lanes layout (`grid-lanes` and `inline-grid-lanes` display values); it is a related emerging layout mode, not a stable feature implied by Baseline Grid properties.

# How this group fits the mental model

Grid creates a two-dimensional coordinate system. **Grid lines** bound **tracks** (rows or columns); intersecting tracks create cells; one or more cells form a grid area. The explicit grid comes from authored templates. Auto-placement may create implicit tracks beyond it, sized by `grid-auto-rows` or `grid-auto-columns`. Grid items can be placed by named lines, numbered lines, spans, named areas, or automatic placement.

Track sizing is a constraint algorithm, not just a declaration of final widths. Fixed lengths, intrinsic keywords (`min-content`, `max-content`, `auto`), `minmax()`, `fit-content()`, `repeat()`, and flexible `fr` units participate differently. The `fr` unit distributes leftover space after fixed/intrinsic contributions under the track sizing algorithm; a bare `1fr` has an automatic minimum that can make a track wider than expected. `minmax(0, 1fr)` removes that automatic minimum when the design requires the track to shrink below min-content size.

Grid is useful when alignment across both dimensions matters. Flexbox treats each wrapped line independently; ordinary Grid maintains shared row and column tracks. Choose based on the relationships in the content, not on a blanket “grid is newer” rule.

# Supplied names explained

| Exact name | Role | Important behavior and edge cases |
| --- | --- | --- |
| `grid-template-columns` | Defines explicit column tracks and optional line names. Columns follow the grid’s inline axis. | Accepts track sizing functions, line names, and repeat notation, including `repeat(auto-fill, …)` and `repeat(auto-fit, …)` in valid contexts. `auto-fit` collapses empty repeated tracks after placement; `auto-fill` preserves them. `subgrid` makes a nested grid participate in sizing parent tracks on that axis; it is not a new set of independently sized tracks. |
| `grid-template-rows` | Defines explicit row tracks and optional line names. Rows follow the grid’s block axis. | Uses the same track-sizing grammar and can use `subgrid`. Intrinsic sizing, indefinite container size, and content contributions affect final used sizes. The Level 3 grid-lanes draft reuses template properties in its experimental one-dimensional layout; that does not make grid-lanes part of stable Grid Level 2. |
| `grid-template-areas` | Declares a visual matrix of named areas using quoted rows. | Every named area must be a rectangle. A `.` token marks an empty cell. Area names also create implicit `name-start`/`name-end` grid lines. The declaration names areas; it does not by itself size tracks. |
| `grid-template` | Shorthand for the explicit grid: `grid-template-rows`, `grid-template-columns`, and `grid-template-areas`. | Supports a compact row-string/row-size/column-size syntax, or direct row/column track lists. It does not set auto-placement or implicit track sizes. Use `grid` when the intent is to reset/configure those too. |
| `grid-auto-rows` | Sets a repeating sizing pattern for implicit row tracks. | Applies when auto-placement or explicit placement creates rows outside the explicit grid. A list such as `minmax(8rem, auto) 1fr` repeats as needed. It does not size explicit rows. |
| `grid-auto-columns` | Sets a repeating sizing pattern for implicit column tracks. | Applies when placement creates columns outside the explicit grid. It does not size explicit columns. It is especially relevant when `grid-auto-flow: column` creates additional columns. |
| `grid-auto-flow` | Controls the direction of the auto-placement cursor, with optional dense backfilling. | `row` is the initial direction; `column` fills down columns before moving across. `dense` may backtrack to fill earlier holes, so later items can appear visually before earlier ones. It only affects items left partly or wholly auto-placed; it does not replace deliberate line/area placement. |
| `grid-row-start` | Sets an item’s start line/span in the block axis. | Accepts a line number, line name, `span`, or `auto`. Positive and negative numbers address lines in the explicit grid; named-line occurrence syntax can disambiguate repeated names. If placement is partial, the auto-placement algorithm resolves the remaining edge. |
| `grid-row-end` | Sets an item’s end line/span in the block axis. | Same placement grammar as row-start. A span is measured from the opposite edge when the other edge is definite. A negative line number is counted from the end of the explicit grid; do not assume it targets the final implicit track. |
| `grid-column-start` | Sets an item’s start line/span in the inline axis. | Same line/name/span/auto model as row placement, but on columns. `start` is logical and maps through writing mode; it should not be casually described as physical left. |
| `grid-column-end` | Sets an item’s end line/span in the inline axis. | Same placement grammar and implicit-line rules as column-start. The original generated summary incorrectly described these column properties as block-axis edges; columns are the inline axis and rows the block axis. |
| `grid-row` | Shorthand for `grid-row-start / grid-row-end`. | One value sets the start and leaves the end auto; two values set both edges. It places on rows (block axis), not columns. |
| `grid-column` | Shorthand for `grid-column-start / grid-column-end`. | One value sets the start and leaves the end auto; two values set both edges. It places on columns (inline axis), not rows. |
| `grid-area` | Either names a `grid-template-areas` region or sets four placement longhands. | Four-part order is `row-start / column-start / row-end / column-end`; omitted trailing parts follow shorthand expansion rules. A single area name places into a matching named area. The property does not resize the tracks themselves. |
| `grid` | Broad shorthand for explicit and implicit grid properties. | Resets/sets `grid-template`, `grid-auto-flow`, `grid-auto-rows`, and `grid-auto-columns`. It can use template-style syntax or the `auto-flow` forms. Because it resets omitted components, prefer the longhands or `grid-template` when preserving current implicit-grid settings matters. |

# Cross-item comparison

Use `grid-template-columns`, `grid-template-rows`, and `grid-template-areas` to author the explicit structure. Use `grid-auto-flow` with `grid-auto-rows`/`grid-auto-columns` to describe how remaining items flow and how overflow tracks are sized. Use row/column placement properties for line-based positioning; `grid-area` accepts either a named area or the four placement edges. `grid-template` is an explicit-grid shorthand; `grid` is broader and resets implicit-grid/flow settings too.

Named-area lines are a convenience, not the only line naming method. Explicit line names may repeat; use an occurrence index when a name is ambiguous. Numbered lines are not item numbers: line 1 is at the explicit grid’s start, and negative indices count backward from its end. Spans count tracks rather than naming a fixed endpoint. Grid lines and areas are logical, so writing mode changes their physical mapping.

Subgrid and grid-lanes solve different problems. `subgrid` lets a nested Grid use and contribute to selected parent tracks. The current Grid Level 3 draft’s grid-lanes layout places items into the currently shortest lane (waterfall-like); it is an emerging one-dimensional mode and its placement can create visual backtracking. Classic two-dimensional Grid remains preferable when aligned rows/columns and predictable reading sequence are required.

# Examples

This template gives the article and sidebar shared row boundaries and lets the main column shrink below long unbreakable content. The narrow-screen rule changes the relationship rather than simply scaling the desktop tracks.

```css
.page {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
  grid-template-areas:
    "article sidebar";
  gap: 1.5rem;
}

.article { grid-area: article; min-inline-size: 0; }
.sidebar { grid-area: sidebar; }

@media (max-width: 48rem) {
  .page {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "article"
      "sidebar";
  }
}
```

For a repeated card layout, `repeat(auto-fit, minmax(min(100%, 18rem), 1fr))` can create as many columns as fit while letting a single column adapt to a narrow container. The nested `min()` prevents the minimum track size from being wider than the container.

# Common mistakes

- Confusing row placement (block axis) with column placement (inline axis), or assuming those axes always map to physical top/left.
- Expecting `grid-template-*` to size implicit tracks; those are controlled by the relevant `grid-auto-*` property.
- Treating `grid-template` as equivalent to `grid`. The broader `grid` shorthand also resets implicit track and auto-flow settings.
- Assuming `1fr` always shrinks below long content. Use a zero minimum when that is intended, and preserve sensible overflow/wrapping behavior.
- Forgetting named areas must form rectangles or that `.` creates an intentionally empty cell.
- Using `dense` without considering visual/source-order mismatch and keyboard navigation.
- Assuming `auto-fit` and `auto-fill` are interchangeable; empty repeated tracks collapse only with `auto-fit`.
- Confusing `subgrid` with a nested independent grid or with the experimental grid-lanes layout.
- Relying on positive/negative line numbers without distinguishing the explicit grid from implicit tracks.

# Knowledge checks with answers

1. **What axis do `grid-column-start` and `grid-column-end` use?** The inline axis. Row placement uses the block axis; the physical direction depends on writing mode.
2. **A placement creates a new row beyond the authored template. Which property sizes it?** `grid-auto-rows`, because the new track is implicit.
3. **What is the difference between `grid-template` and `grid`?** `grid-template` covers explicit rows, columns, and areas. `grid` also sets/resets auto-flow and implicit row/column sizing.
4. **Why might a `1fr` track overflow?** Its automatic minimum may honor min-content contributions. `minmax(0, 1fr)` removes that minimum when the track should shrink, but content still needs a usable wrapping/overflow strategy.
5. **Can a named area be L-shaped?** No. Every named area must be rectangular; use multiple areas or explicit placement for nonrectangular designs.
6. **What does `grid-auto-flow: row dense` trade?** It backfills earlier holes more aggressively, which may compact the visual layout while making visual order differ from source order.

# Sources

- [CSS Grid Layout Module Level 1, published specification](https://www.w3.org/TR/css-grid-1/) — core Grid model, track sizing, line/area placement, auto-placement, and shorthands.
- [CSS Grid Layout Module Level 2, published specification](https://www.w3.org/TR/css-grid-2/) — subgrid and Level 1 extensions; publication status is not a browser-support guarantee.
- [CSS Grid Layout Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-grid-3/) — experimental grid-lanes layout; work in progress.
- [CSS Box Alignment Module Level 3](https://drafts.csswg.org/css-align-3/) and [CSS Gaps Module Level 1](https://drafts.csswg.org/css-gaps-1/) — grid item/track alignment and gutters; current Editor’s Drafts are works in progress.
- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) and the [individual property references](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) — guides, syntax, examples, and browser compatibility data for all 15 assigned properties.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity snapshot, not an implementation table.
