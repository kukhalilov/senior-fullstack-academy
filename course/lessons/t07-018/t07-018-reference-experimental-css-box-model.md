
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Box Model margin-trim properties

## Scope and version

This lesson covers the sole supplied item, `margin-trim`, in CSS Box Model Module Level 4. The current CSSWG Editor’s Draft is dated 6 August 2026; the latest published W3C snapshot is a Working Draft from 4 August 2024. They do not currently describe the same scope. The 2024 published draft and MDN describe a broader design with inline-axis values and flex/grid containers. The newer Editor’s Draft has narrowed the definition to block-axis trimming on block containers and multicolumn containers. Browser implementations may reflect an earlier version of the proposal, so check actual behavior as well as the latest draft.

MDN currently marks `margin-trim` Limited availability and Experimental. It is not a safe assumption that all engines support the same syntax or layout modes. This lesson gives the newer Editor’s Draft as the current design and explicitly identifies the older published behavior where it differs.

## How this group fits the mental model

Margins belong to boxes and normally create space around them. In a vertical stack of cards or sections, you may want a margin between every pair of adjacent children, but not an extra margin between the first/last child and the container’s own edges. Without container-level trimming, authors often need special first/last-child selectors or must coordinate the parent’s padding with child margins.

`margin-trim` lets a container say which of its edges should discard adjoining margins from its in-flow children. The child still has its declared margin in the cascade; the container changes how the adjoining child margin participates at that edge. The property does not remove the container’s own margins, change its padding, or zero every child margin. It is edge-specific.

The current Editor’s Draft only handles the block axis: the direction in which blocks stack. In `writing-mode: horizontal-tb`, block-start/end usually correspond to top/bottom; in vertical writing modes they can map to left/right. The names are logical so the rule follows writing mode.

## Supplied names explained

### `margin-trim`

**Current Editor’s Draft grammar:** `none | block | [ block-start || block-end ]`, plus CSS-wide keywords. In CSS value notation, `||` means one or both values may appear in either order. **Initial:** `none`. **Applies to:** block containers and multicolumn containers. **Inherited:** no. **Percentages:** not applicable. **Computed value:** a set of zero to two keywords indicating the sides trimmed. **Animation:** discrete.

Values in the current Editor’s Draft:

| Value | Effect |
| --- | --- |
| `none` | The container does not trim child margins. |
| `block-start` | Trim the block-start margin of the first in-flow block-level child adjoining that edge. |
| `block-end` | Trim the block-end margin of the last in-flow block-level child adjoining that edge. |
| `block-start block-end` | Trim at both block-axis edges. Either order is allowed by the `||` grammar. |
| `block` | Shorthand keyword equivalent to trimming both `block-start` and `block-end`. |

For block-container content, the current draft discards the first block-level child’s block-start margin and the last block-level child’s block-end margin when the respective edge is trimmed. It also discards descendant margins that have collapsed together with those adjoining margins. It does **not** discard the container’s own margin, a sibling’s margin, or an ancestor’s margin just because that margin might otherwise have collapsed with the child margin. The property has no effect on inline-level descendant margins or float margins in block containers under this draft.

Margins are only trimmed when they adjoin the selected container edge. A gap from padding, alignment distribution, or other spacing is not necessarily the same thing as a child margin. Trimming is not a blanket `margin: 0` on descendants. `margin-break` is a separate property dealing with a box’s own margins at fragmentation breaks such as page or column breaks.

Example: retain a 1rem gap between sections but trim the first section’s start margin and the last section’s end margin:

```css
.article-sections {
  display: flow-root;
  margin-trim: block;
}

.article-sections > section {
  margin-block: 1rem;
}
```

`display: flow-root` is shown to make a self-contained block formatting context and avoid the usual parent/child margin-collapsing surprises in this example; it is not a requirement stated by `margin-trim`. The first and last section margins at the selected edges are trimmed under the current proposal, while margins between sibling sections remain available for inter-section spacing. Test actual collapsing and layout behavior in the target browser because implementations may be based on an earlier draft.

## Earlier published design and version differences

The 2024 W3C Working Draft has broader syntax: `none | [ block || inline ] | [ block-start || inline-start || block-end || inline-end ]`. In that design, `block` and `inline` represent both edges on their respective logical axes; individual start/end values trim individual logical edges. It also defines behavior for flex and grid containers and details trimming for their items. MDN’s current syntax and values reflect that broader proposal, even though the 2026 Editor’s Draft has since narrowed the feature. The older design also describes `::first-letter` applicability, which the current Editor’s Draft’s property definition does not list.

Do not combine these generations into one assumed universal grammar. A declaration such as `margin-trim: inline-start` may be valid under the older published draft/implementation but is not in the newer Editor’s Draft grammar. Likewise, do not assume flex/grid item trimming from the latest ED. If a browser supports a broader older form, that is implementation behavior to test and consult compatibility data for, not evidence that the newer draft still contains it.

## Examples

### Both block edges

```css
main.content-flow {
  margin-trim: block;
}

main.content-flow > :where(h1, p, section) {
  margin-block: 1em;
}
```

The first block-level child’s adjoining block-start margin and the last block-level child’s adjoining block-end margin are trimmed in the current draft model. Margins between children still create their intended rhythm, subject to the layout’s normal margin-collapsing rules.

### Start edge only, with a fallback

```css
.card-stack {
  margin-trim: block-start;
}

/* Fallback for engines that do not implement the property. */
.card-stack > :first-child {
  margin-block-start: 0;
}
```

This selector fallback is useful for simple, known markup, but may need adjustment when the first element is not the first in-flow block child, when wrappers or hidden elements are present, or when layout modes alter child participation. Avoid shipping a duplicate fallback blindly in engines where trimming is supported, because the fallback explicitly changes the child’s declared margin and can alter behavior in edge cases. Test the exact component structure.

## Comparison with common alternatives

| Approach | What it does | Trade-off |
| --- | --- | --- |
| `margin-trim` | Lets a supported container trim adjoining in-flow child margins at selected edges | Concise and writing-mode-aware, but proposal grammar and browser support vary by version |
| `:first-child` / `:last-child` rules | Explicitly changes the first/last child’s margin | Works broadly for controlled markup but couples rules to selectors and DOM structure |
| Parent padding with child margins | Creates an intentional inner edge while retaining child spacing | Predictable, but adds inset space rather than trimming the adjoining margin |
| `gap` in flex/grid | Sets spacing between layout items without margins at the container edges | Often simplest for those layout models, but current ED’s `margin-trim` no longer defines flex/grid item trimming; `gap` is a separate layout feature |

## Common mistakes

- Assuming `margin-trim` trims the container’s own margin. It concerns adjoining child margins.
- Assuming it zeros every descendant margin. It is edge-specific and limited to the relevant in-flow child margins and margins collapsed with them.
- Forgetting that child margins between siblings are not the target edge margins.
- Treating logical `block-start` as always “top.” Writing mode determines the block axis.
- Assuming the `inline-start` and `inline-end` values shown by current MDN are in the newest draft grammar. They occur in the older published draft; the current ED is narrower.
- Assuming flex/grid trimming described in older materials is in the current ED. It is not in the current definition.
- Assuming a `float`’s margin is trimmed by a block container under the current draft. The draft explicitly says it has no such effect.
- Confusing margin trimming with padding removal, margin collapsing, or `margin-break` at page/column breaks.
- Assuming a current browser implementation matches the latest ED, or that “Limited availability” means uniform behavior across engines.

## Knowledge checks with answers

1. **What is the current ED grammar?** `none | block | [block-start || block-end]`, in addition to CSS-wide keywords.
2. **What does `block` mean?** Trim both block-axis edges; it is equivalent to both `block-start` and `block-end`.
3. **Does `margin-trim` change a child’s declared margin value?** It changes how the adjoining margin participates at the selected edge; it does not rewrite the child declaration.
4. **Which child margins are discarded for a block container?** The first in-flow block-level child’s block-start margin and/or the last such child’s block-end margin at selected edges, along with descendant margins collapsed with those margins.
5. **Does it remove the container’s own margin or all inline descendant margins?** No.
6. **Why does MDN show values absent from the current ED?** MDN reflects the broader 2024 published design; the newer ED narrowed the grammar and applicability.
7. **What should be used for inter-item spacing in flex/grid?** Their `gap` property is a separate alternative. Do not assume the current `margin-trim` ED includes flex/grid trimming.
8. **Why test browser-specific behavior?** Implementations may reflect different proposal generations, and support remains limited.

## Cross-item comparison

This group contains one property. The useful comparison is between edge trimming and explicit first/last-child selectors, parent padding, flex/grid `gap`, and margin collapsing. Each solves a different spacing problem; they are not interchangeable. The current ED specifically limits this property to block-axis edges in block and multicolumn containers.

## Sources

- [CSS Box Model Module Level 4 Editor’s Draft, 6 August 2026](https://drafts.csswg.org/css-box-4/) — current grammar, applicability, margin-collapsing behavior, float limitation, and changes from the published draft.
- [CSS Box Model Module Level 4, W3C Working Draft, 4 August 2024](https://www.w3.org/TR/css-box-4/) — earlier broader inline/flex/grid definition; useful for understanding version divergence.
- [MDN `margin-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-trim) — support and syntax reference that currently reflects the broader older feature design; compare its grammar with the latest ED.
- [CSS Display Module Level 3](https://www.w3.org/TR/css-display-3/) — box and container terminology used by the feature.
