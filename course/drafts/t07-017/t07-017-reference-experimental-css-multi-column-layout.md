# CSS layout flexbox grid positioning and responsive design — Reference: Experimental CSS multi-column features

# Scope and version

This lesson explains every item in the experimental multicol inventory: `column-height`, `column-wrap`, `balance-all`, `::column`, and the proposed `auto` and integer `column-span` forms. They appear in CSS Multi-column Layout Level 2, an Editor’s Draft dated 14 November 2026 in the version checked. The draft has open issues and is not a browser-support promise.

# How this group fits the mental model

Level 1 flows content through one row of columns and balances or fills that line. Level 2 explores bounded-height columns arranged into multiple rows, per-column styling/scroll markers, and more flexible spanning. These features expand multicol toward a two-dimensional overflow layout, but columns still contain one ordered content stream; they are not independent Grid tracks or semantic navigation regions.

# Supplied names explained

| Exact supplied name | Draft role and behavior |
| --- | --- |
| `column-height` | `auto \| <length [0,∞]>`; initial `auto`; block-container property except table wrapper boxes; non-inherited. A length requests a column block size and cannot be negative. `auto` lets other layout constraints/content determine it. Constraining the column height may leave unused space if a row is not full. |
| `column-wrap` | `auto \| nowrap \| wrap`; initial `auto`; applies to multicol containers; non-inherited. Controls where overflow columns go when content exceeds a row at the specified column height. `nowrap` creates overflow columns in the inline direction; `wrap` creates another multicol row in the block direction. In the draft, `auto` behaves as `wrap` when column-height is non-auto, otherwise as `nowrap`. The draft flags cases with container height but no explicit column-height as unresolved. |
| `balance-all` | Proposed `column-fill` value. It balances across all fragmentainers/column sets in the multicol flow; the Level 1 `balance` value only balances the last fragment in fragmented contexts. This remains draft behavior. |
| `::column` | Proposed pseudo-element representing each column in a multicol container. It cannot address an individual column: styles apply to all columns of that container. It occupies the corresponding column’s available inline size and container content-box block size; it does not wrap the column’s content or cover gaps/rules. The current draft allows only a limited property set (including `scroll-margin`, `scroll-snap-align`, and `scroll-snap-stop`) and allows a `::scroll-marker` child. |
| `column-span: auto` | Proposed automatic span count based on the element’s min-content outer inline size and the available column width/gap. If it is narrower than one used column width, it behaves like `none`; otherwise the draft computes the smallest positive count whose columns can accommodate that min-content size, capped to `all` when it would exceed the available count. |
| `column-span: <integer [1,∞]>` | Proposed extension allowing a box to span a positive number of columns. Values must be greater than zero; a value at least as large as the available column count behaves like `all`. The draft explicitly lists unresolved questions for `column-span: 1`, which columns are spanned, and interactions with height/fill, so do not rely on the integer form as finalized. |

Level 2 also extends the `columns` shorthand with `/ <column-height>` and says the shorthand resets `column-wrap` to its initial value. If combining these draft features, set `column-wrap` after the `columns` shorthand.

# Cross-item comparison

`column-height` limits the block size of each column; `column-wrap` decides whether overflow columns continue sideways or start a new row. `column-fill` decides whether content is balanced or sequential within the relevant column line. A spanning box interrupts the line, while `::column` is a styling/scroll-state abstraction and contains no actual descendants. Each addresses a different part of a multicol layout.

Two-dimensional rows can make reading order ambiguous when all rows are visible. The draft says reading flows along each row before moving to the next; authors must make this clear to users. For most interface grids, CSS Grid remains the clearer model.

# Examples

This experimental example requests three columns, each with a 12em block size; overflow starts another row. The Level 2 syntax is not yet a stable cross-browser contract.

```css
.catalog {
  column-count: 3;
  column-height: 12em;
  column-wrap: wrap;
  column-fill: balance-all;
}

.catalog::column {
  scroll-snap-align: start;
}
```

Do not make `::column` the only navigation affordance. Keep content understandable in source order and usable if the proposal is unsupported.

# Common mistakes

- Assuming `column-height` is a minimum or maximum rather than the proposed desired column block size.
- Assuming `column-wrap` behavior is fully resolved in every combination; the draft names open questions.
- Confusing `balance-all` with established `balance` behavior.
- Trying to select the nth `::column`; the draft pseudo-elements cannot be individually addressed.
- Assuming `::column` wraps text or paints the inter-column gap; it does neither.
- Setting `columns` after `column-wrap` and expecting the wrap value to survive; the draft shorthand resets it.
- Using integer `column-span` values without accounting for unresolved `1` and layout semantics.
- Treating `column-span: auto` as a finalized interoperable behavior; it is part of the same evolving Level 2 draft.
- Presenting multicol rows as a semantic or accessible grid.

# Knowledge checks with answers

1. **What does `column-wrap: wrap` do?** Places overflow columns in a new row in the block direction.
2. **What is the draft default for `column-wrap: auto`?** `wrap` if `column-height` is non-auto; otherwise `nowrap`.
3. **Can `::column` target only the second column?** No. The draft generates one per column, but a selector cannot address them individually.
4. **What does `balance-all` change?** It proposes balancing across all fragments/column sets rather than only the last fragment in paged contexts.
5. **Is `column-span: 1` fully specified?** The draft explicitly leaves its behavior unresolved.

# Sources

- [CSS Multi-column Layout Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-multicol-2/) — §§4.2–4.8, 7.1, and 8.1: column height/wrap, shorthand reset, `::column`, integer span, and `balance-all`.
- [CSS Multi-column Layout Module Level 1](https://www.w3.org/TR/css-multicol-1/) — established single-row model and baseline `column-fill` behavior.
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) — scroll-snap properties referenced by the proposed `::column` pseudo-element.
