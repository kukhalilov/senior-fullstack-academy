# CSS layout flexbox grid positioning and responsive design — Reference: CSS Multi-column Layout properties

# Scope and version

This lesson covers the nine assigned properties: `column-count`, `column-fill`, `column-width`, `column-rule`, `column-rule-color`, `column-rule-style`, `column-rule-width`, `column-span`, and `columns`. CSS Multi-column Layout Level 1 is a Candidate Recommendation Snapshot. Level 2 is an Editor’s Draft dated 14 November 2026 in the version checked; it extends the model with column height/wrapping, integer spanning, and other proposals. Draft additions are identified in the companion experimental lesson.

# How this group fits the mental model

Multicol takes one normal-flow stream and fragments it through column boxes, usually in reading order down one column and then the next. Unlike Grid, it does not put independent children into row/column cells; the browser chooses breaks as it flows the content. A spanning element interrupts a multicol line and starts a new one. Use this for prose or lists where flowing text is appropriate, not for records that need row alignment.

# Supplied names explained

| Exact supplied property | Grammar and behavior |
| --- | --- |
| `column-count` | `auto \| <integer [1,∞]>`; initial `auto`; positive integer requests a column count. It interacts with `column-width`: when both are specified, the used count is capped by the requested count while the actual layout also depends on available inline space and fragmentation. |
| `column-width` | `auto \| <length [0,∞]>`; initial `auto`. A length is an optimal column width, not a strict guarantee: actual columns may widen to fill space or narrow if the container cannot fit the requested width. The current spec clamps a used zero width to at least 1px. |
| `columns` | Level 1 grammar: `[<'column-width'> || <'column-count'>]`; Level 2 adds optional `/ <'column-height'>`. Omitted components reset their longhands to initial values; Level 2 shorthand also resets `column-wrap`. Common forms include `columns: 3`, `columns: 18rem`, and `columns: 18rem 3`. |
| `column-fill` | `auto \| balance` in Level 1; Level 2 adds draft `balance-all`. Initial `balance`; applies to multicol containers; not inherited. `balance` tries to even column heights (only the last fragment balances in fragmented contexts); `auto` fills sequentially when the column height is constrained. See companion lesson for draft `balance-all`. |
| `column-span` | Level 1: `none \| all`; initial `none`. `all` makes an eligible in-flow child span across all columns, splitting the multicol line before and after it. Level 2 proposes `auto` and positive integer span counts; these are draft and their integer behavior still has open questions. |
| `column-rule` | Shorthand for `column-rule-width`, `column-rule-style`, and `column-rule-color`; initial components are medium, none, currentColor. Omitted components reset. The rule is painted in the inter-column gap and does not create extra content width beyond that gap. |
| `column-rule-width` | Border-width-like values (`<line-width>`); initial `medium`; negative lengths are invalid. Its visible effect depends on a non-`none` rule style. |
| `column-rule-style` | Border-style-like keywords; initial `none`. A `none` style means no rule is drawn even if a width/color is set. |
| `column-rule-color` | Color value including `currentColor`; initial `currentColor`. It supplies the divider color. |

In Level 1, `columns` sets width/count hints only. The Level 2 slash form adds a preferred column block size; it does not change the meaning of the pre-slash width/count components. `column-gap` is a separate property from the Box Alignment module.

# Cross-item comparison

Use `column-count` when the desired count is the main constraint, `column-width` when a comfortable line measure is the main constraint, or both to give the browser a target width and a maximum count. The browser computes actual column geometry from available space, gaps, breaks, and fragmentation; the authored count is not always the actual count. `columns` is the combined shorthand and resets omitted values.

`column-rule` only decorates the gutter; it is not a border around each column. `column-span: all` is structurally different: it interrupts the current set of columns and begins another multicol line after the spanning box. The `::column` pseudo-element proposed in Level 2 can represent a column but is distinct from selecting or styling its content.

# Examples

```css
.glossary {
  columns: 18rem 3;
  column-gap: 2rem;
  column-rule: 1px solid #bbb;
}

.glossary h2 {
  column-span: all;
}
```

Test with narrow viewports, zoom, print, keyboard reading, and screen readers. Multicol’s visual order must remain understandable alongside DOM/source order; do not assume columns behave like independently navigable cards.

# Common mistakes

- Expecting multicol to create a grid with row-aligned cells.
- Treating `column-width` as an exact width or `column-count` as a guarantee of actual column count.
- Assuming `column-rule` consumes width in addition to the gap or draws full borders around columns.
- Setting a rule width/color while leaving its style as `none` and expecting a visible divider.
- Assuming `column-fill: auto` always fills columns sequentially even without a constrained height.
- Forgetting that `columns` resets omitted longhands (and Level 2 resets `column-wrap`).
- Using spanning headings without checking the fragmentation and resulting reading flow.
- Treating Level 2 values as stable because Level 1 properties are widely implemented.

# Knowledge checks with answers

1. **How do `column-width` and `column-count` differ?** Width gives an optimal line measure; count requests a number. Together the browser fits columns to available space, so actual geometry can differ.
2. **What does `columns: 18rem 3` mean?** An optimal column width of 18rem and a requested/max count of three, subject to available space.
3. **Does `column-rule` add a new gutter?** No. It draws a divider in the existing inter-column gap.
4. **What is the default `column-rule-style`?** `none`, so a width/color alone does not draw a rule.
5. **What does `column-span: all` do to the flow?** It interrupts the current multicol line; content before appears before the spanner and following content continues after it.
6. **Is Level 2 `balance-all` covered as established behavior?** No. It is an Editor’s Draft value and is treated as experimental in the companion lesson.

# Sources

- [CSS Multi-column Layout Module Level 1](https://www.w3.org/TR/css-multicol-1/) — §§2–8: column model, width/count algorithm, rules, spanning, filling, and fragmentation.
- [CSS Multi-column Layout Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-multicol-2/) — current proposal for columns shorthand extension, height/wrap, integer span, `::column`, and `balance-all`.
- [CSS Fragmentation Module Level 3](https://www.w3.org/TR/css-break-3/) — break constraints and fragmentation model used by multicol.
- [CSS Box Alignment Level 3](https://drafts.csswg.org/css-align-3/) — gap values used between columns.
