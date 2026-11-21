# CSS layout flexbox grid positioning and responsive design — Reference: CSS Logical Properties and Values properties

# Scope and version

This lesson covers all 46 names in the assigned logical-property inventory. CSS Logical Properties and Values Level 1 (Working Draft, 4 December 2025) supplies writing-mode-relative equivalents for sizing, margins, padding, borders, and corners. The property model is established in browsers, but the cited document remains a draft and its open issues should be checked for advanced cascade/feature questions. The key to using these properties correctly is knowing which box’s writing mode controls the mapping.

# How this group fits the mental model

CSS layout uses two coordinate systems. Physical properties name the canvas (`left`, `top`, `width`); logical properties name the content flow (`inline-start`, `block-end`, `inline-size`). In a typical horizontal LTR paragraph, inline-start is left and block-start is top. In horizontal RTL, inline-start becomes right. In `vertical-rl`, block-start is right and inline-size maps to physical height. Logical declarations make a component adapt when language or writing mode changes.

Mappings are determined by the applicable writing mode and direction, not by guessing from the property spelling. For properties affecting a box itself, the containing block’s writing mode commonly supplies the mapping; consult the defining module for special cases. Physical properties remain appropriate for effects intentionally tied to the physical canvas, such as a shadow that should always fall down and right.

# Supplied names explained

All names below are in the 46-name manifest. CSS-wide keywords apply throughout. Grammar for each family follows its corresponding physical property; the mapping changes the side/axis, not the underlying value system.

## Logical dimensions — six names

| Names | Behavior and value model |
| --- | --- |
| `inline-size`, `min-inline-size`, `max-inline-size` | Set preferred, minimum, and maximum size along the inline axis. In horizontal writing this usually maps to width; in vertical writing it usually maps to height. Follow the matching `width`/`min-width`/`max-width` grammar, including intrinsic sizing keywords where allowed. |
| `block-size`, `min-block-size`, `max-block-size` | Set preferred, minimum, and maximum size along the block axis. In horizontal writing this usually maps to height; in vertical writing it usually maps to width. Follow the matching `height`/`min-height`/`max-height` grammar. |

Size is not interchangeable with min/max constraints: `inline-size` proposes a size; `min-inline-size` and `max-inline-size` bound the used result. Percentages and intrinsic values retain the rules of their physical counterparts and can depend on whether the containing block has a definite size.

## Logical margins — six names

| Names | Behavior and value model |
| --- | --- |
| `margin-block`, `margin-inline` | Two-edge shorthands. One value sets both edges of that logical axis; two set start then end. |
| `margin-block-start`, `margin-block-end`, `margin-inline-start`, `margin-inline-end` | Individual logical side margins. Values follow `margin`: lengths, percentages, and `auto`; negative margins are permitted. A percentage margin resolves against the containing block’s inline size, including block-axis margins. |

Use `margin-inline: auto` for inline-axis centering when the layout context permits auto margins. It is not a universal substitute for alignment properties in flex/grid.

## Logical padding — six names

| Names | Behavior and value model |
| --- | --- |
| `padding-block`, `padding-inline` | Two-edge shorthands. One value sets both logical edges; two set start then end. |
| `padding-block-start`, `padding-block-end`, `padding-inline-start`, `padding-inline-end` | Individual logical side padding. Values follow `padding`: nonnegative lengths or percentages, with the same percentage basis as the physical properties. |

Padding creates space inside the border and participates in box sizing; it cannot be negative. Logical mapping does not change `box-sizing` behavior.

## Logical borders — 24 names

| Exact names | What they set |
| --- | --- |
| `border-block`, `border-inline` | Shorthands for the two borders on the named axis. They set the axis’s start and end sides, including their width, style, and color. Their value follows the physical `border` shorthand components. |
| `border-block-start`, `border-block-end`, `border-inline-start`, `border-inline-end` | One-side shorthands. Each follows `border` grammar and sets width/style/color on that logical side. |
| `border-block-width`, `border-block-style`, `border-block-color`, `border-inline-width`, `border-inline-style`, `border-inline-color` | Two-edge shorthands for a border component. One value sets both sides on that axis; two set start then end. Width, style, and color use the corresponding physical border-component grammar. |
| `border-block-start-width`, `border-block-end-width`, `border-inline-start-width`, `border-inline-end-width` | Individual logical side widths; follow `border-*-width` values such as length or the applicable width keywords. |
| `border-block-start-style`, `border-block-end-style`, `border-inline-start-style`, `border-inline-end-style` | Individual logical side styles; follow `border-*-style` keywords. `none`/`hidden` affect whether a visible border is drawn and interact with border conflict resolution for tables as defined by CSS. |
| `border-block-start-color`, `border-block-end-color`, `border-inline-start-color`, `border-inline-end-color` | Individual logical side colors; follow `border-*-color`, including color values and `currentColor`. |

Border shorthands reset omitted components to their initial values, as physical border shorthands do. A declared border width is not visibly painted when its style computes to `none` (and border styles/widths participate in the rules for collapsed tables).

## Logical corner radii — four names

| Exact supplied property | Corner selected |
| --- | --- |
| `border-start-start-radius` | Intersection of block-start and inline-start. |
| `border-start-end-radius` | Intersection of block-start and inline-end. |
| `border-end-start-radius` | Intersection of block-end and inline-start. |
| `border-end-end-radius` | Intersection of block-end and inline-end. |

Each follows the physical `border-*-radius` grammar: one or two length/percentage radii describe horizontal and vertical curvature for that mapped corner. The mapping changes the corner, not the curve rules.

# Cross-item comparison

To read a name, identify its axis, edge, and component. For example, `border-inline-start-width` means width component → inline axis → start edge. `border-inline` instead sets the complete border on both inline edges. Dimensions, margins, padding, border components, and corner radii map independently; using one logical property does not automatically convert other physical declarations.

When physical and logical declarations target the same underlying side/component, the cascade resolves them according to the normal origin, importance, layer, specificity, and source-order rules. There is no special rule that logical always wins. Avoid setting both forms unless an intentional fallback/override pattern is clear.

# Examples

This card uses logical dimensions and spacing, so it can adapt to horizontal RTL and vertical writing without rewriting its box spacing. Its shadow stays physically down/right because that visual choice is intentional.

```css
.quote-card {
  inline-size: min(100%, 52rem);
  min-block-size: 12rem;
  margin-inline: auto;
  padding-block: 1.5rem;
  padding-inline: 1rem;
  border-inline-start: 0.25rem solid currentColor;
  border-start-start-radius: 0.75rem;
  box-shadow: 0.25rem 0.25rem 0.75rem rgb(0 0 0 / 15%);
}
```

# Common mistakes

- Reading `inline` as “horizontal” and `block` as “vertical”; vertical writing reverses those assumptions.
- Assuming `start` always means left or `block-start` always means top.
- Confusing an axis shorthand (`border-block`) with a one-edge shorthand (`border-block-start`) or component shorthand (`border-block-width`).
- Assuming padding permits negative values; margin does, padding does not.
- Assuming logical properties outrank physical properties in the cascade.
- Mixing physical and logical shorthand/longhand declarations without tracing which underlying sides and components they set or reset.
- Using logical corner names as if the first word were a physical top/bottom designation; both words are flow-relative.
- Forgetting that min/max constraints and percentage sizing retain the underlying property’s sizing rules.

# Knowledge checks with answers

1. **What does `inline-size` map to in horizontal versus vertical writing?** Usually width in horizontal writing and height in vertical writing; exact axes follow the writing mode.
2. **What is the value order for `margin-inline: 1rem 2rem`?** Inline-start then inline-end.
3. **Can padding be negative?** No. Logical padding follows physical padding’s nonnegative value rules.
4. **What does `border-block-width: 1px 3px` set?** Block-start border width to 1px and block-end border width to 3px.
5. **Does `border-inline-start` mean the left border?** Only in writing modes where inline-start maps to physical left; in horizontal RTL it maps to right.
6. **How does `border-start-end-radius` identify a corner?** It rounds the intersection of logical block-start and inline-end.
7. **If a later physical `margin-left` and a logical margin map to the same side, which wins?** The normal cascade decides; neither naming system has priority by itself.

# Sources

- [CSS Logical Properties and Values Level 1](https://www.w3.org/TR/css-logical-1/) — §§1–4: mapping model, dimensions, margin/padding/border shorthands and longhands, logical corners, and cascade mapping.
- [CSS Writing Modes Level 4](https://www.w3.org/TR/css-writing-modes-4/) — abstract block/inline directions and physical mappings.
- [CSS Box Model Level 3](https://www.w3.org/TR/css-box-3/) — margin, padding, border, and sizing behavior inherited by logical equivalents.
