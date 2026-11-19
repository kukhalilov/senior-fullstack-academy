# CSS layout flexbox grid positioning and responsive design — Reference: CSS Scroll Snap properties

# Scope and version

This lesson covers exactly the 25 assigned properties in **CSS Scroll Snap properties**. The captured MDN pages from 2026-11-16 mark the Level 1 properties Baseline Widely available; still check exact browser versions, since a Baseline property label is not proof that every edge case is identical. CSS Scroll Snap Level 1 is the established property model. The current Level 2 Editor’s Draft adds `scroll-initial-target` and snap-change events with a `SnapEvent` interface. Its proposed `:snapped` selector family is explicitly being dropped in favor of CSS Conditional Level 5 scroll-state container queries. These additions are work in progress and are covered in companion experimental lessons where assigned.

# How this group fits the mental model

Scroll snapping gives the browser preferred resting positions during scrolling. The container establishes a **snapport** (the effective viewing region), each child can contribute a **snap area**, and the UA chooses a snap position using the declared axes/strictness plus input, direction, and other scroll priorities. It is not a script-defined animation timeline and does not mean every gesture must stop at the nearest child.

`scroll-snap-type` belongs on the scroll container. `scroll-snap-align` belongs on snap targets. `scroll-padding` adjusts the container’s snapport, often to account for fixed or sticky UI; `scroll-margin` expands or contracts the target’s snap area. These geometry properties do not change normal layout size or margins. Logical properties follow writing mode; physical sides stay physical.

# Supplied names explained

| Exact name | Role | Values, axis mapping, and practical details |
| --- | --- | --- |
| `scroll-snap-type` | Enables snapping on a scroll container and chooses axis plus strictness. | `none` disables; otherwise choose `x`, `y`, `block`, `inline`, or `both`, optionally with `mandatory` or `proximity` (default proximity). `x`/`y` are physical; `block`/`inline` follow writing mode. `mandatory` is stricter but still does not override the UA’s need to keep content navigable, especially for oversized snap areas. |
| `scroll-snap-align` | Aligns a child’s snap area against the snapport. | Each axis accepts `none`, `start`, `end`, or `center`; one value applies to both axes, two are block then inline. If no axis has a usable alignment, the box supplies no snap position on that axis. Logical start/end are not fixed to physical left/top. |
| `scroll-snap-stop` | Controls whether a fling may pass over an eligible snap position. | `normal` permits the UA to pass over positions according to normal snap selection; `always` asks it not to pass over that position during scrolling. It does not choose axes or alignment and does not force every item to be a target. |
| `scroll-padding` | Shorthand for the scroll container’s optimal viewing region offsets. | One-to-four values use physical top/right/bottom/left expansion. Values are `auto` or nonnegative lengths/percentages; percentages resolve against the scrollport. `auto` lets the UA choose an offset, commonly zero, and can account for obscured regions. This affects snapping/scroll-into-view geometry, not layout padding. |
| `scroll-padding-block` | Logical block-start/end scrollport offsets. | One value sets both block edges; two set start then end. Accepts `auto` or nonnegative lengths/percentages. |
| `scroll-padding-block-start` | Inset of the snapport’s block-start edge. | Logical edge; follows writing mode. Useful for a persistent header only when the header actually obscures that edge. |
| `scroll-padding-block-end` | Inset of the snapport’s block-end edge. | Logical block-end offset, with the same grammar and scrollport-relative percentages. |
| `scroll-padding-inline` | Logical inline-start/end scrollport offsets. | One value sets both; two set start then end. It follows inline direction, so it adapts to RTL and vertical writing. |
| `scroll-padding-inline-start` | Inset of the snapport’s inline-start edge. | Logical inline edge; do not assume it maps to physical left. |
| `scroll-padding-inline-end` | Inset of the snapport’s inline-end edge. | Logical opposite edge; do not assume it maps to physical right. |
| `scroll-padding-top` | Physical top inset of the snapport. | `auto` or a nonnegative length/percentage; physical side regardless of writing mode. |
| `scroll-padding-right` | Physical right inset of the snapport. | Same grammar as other scroll-padding sides; use logical inline properties for direction-aware components. |
| `scroll-padding-bottom` | Physical bottom inset of the snapport. | Same grammar; do not confuse it with block-end in vertical writing. |
| `scroll-padding-left` | Physical left inset of the snapport. | Same grammar; do not confuse it with inline-start in RTL. |
| `scroll-margin` | Shorthand that expands target-side scroll area outsets on physical sides. | One-to-four values follow top/right/bottom/left margin shorthand order. Values are lengths (negative values are allowed); it changes the snap area/scroll target geometry, not layout margins. |
| `scroll-margin-block` | Logical block-start/end outsets on the target’s snap area. | One value sets both edges; two set start then end. Lengths can be negative. |
| `scroll-margin-block-start` | Block-start outset of the target’s snap area. | Logical side follows writing mode and changes snap geometry only. |
| `scroll-margin-block-end` | Block-end outset of the target’s snap area. | Logical opposite edge; not necessarily physical bottom. |
| `scroll-margin-inline` | Logical inline-start/end outsets on the target’s snap area. | One value sets both edges; two set start then end. Length-only; adapts to direction/writing mode. |
| `scroll-margin-inline-start` | Inline-start outset of the target’s snap area. | Logical edge; use rather than physical left for direction-aware layouts. |
| `scroll-margin-inline-end` | Inline-end outset of the target’s snap area. | Logical edge; use rather than physical right for direction-aware layouts. |
| `scroll-margin-top` | Physical top outset of the target’s snap area. | Length-only and physical. The snap area is based on the transformed border box’s axis-aligned bounding box, then expanded by these outsets. |
| `scroll-margin-right` | Physical right outset of the target’s snap area. | Length-only and physical. |
| `scroll-margin-bottom` | Physical bottom outset of the target’s snap area. | Length-only and physical. |
| `scroll-margin-left` | Physical left outset of the target’s snap area. | Length-only and physical. |

# Cross-item comparison

The central distinction is container versus target: `scroll-padding` modifies the **snapport**; `scroll-margin` modifies a child’s **snap area**. Increasing scroll padding can move the resting alignment away from an obscuring toolbar. Increasing scroll margin makes a target eligible/aligned earlier or with more breathing room. Neither reserves layout space or changes the target’s actual margin box.

Physical `x`/`y` and top/right/bottom/left values are useful when the interface is intentionally tied to physical orientation. Logical `block`/`inline` and start/end sides are safer for components that must support writing modes and RTL. `scroll-snap-stop` only constrains whether an eligible target may be passed; `scroll-snap-type` still defines the snap container and strictness.

The browser retains control over snap selection and scrolling behavior. It may skip positions when a user gesture is large, when a snap area is larger than the snapport, or when required to make content reachable. Avoid `mandatory` snapping if a tall card or zoomed layout could trap the user between inaccessible regions. Provide keyboard/scroll controls and test focus visibility.

Level 2 adds more than a property: `scroll-initial-target` can request an initial target, and `scrollsnapchange`/`scrollsnapchanging` events with `SnapEvent` expose snap-target changes. The Level 2 draft says its proposed `:snapped` selector family is being dropped in favor of a container state query approach. The current CSS Conditional Level 5 Editor’s Draft defines a `snapped` scroll-state feature queried with `@container`; it requires a scroll-state query container (for example, `container-type: scroll-state`). These are evolving draft features; do not infer their support from Level 1 Baseline properties.

# Examples

This horizontal rail keeps content freely scrollable while preferring each card’s inline start. Scroll padding leaves room for an overlaying control; target scroll margin adds a small cushion. For interfaces with tall content or unusual zoom, `proximity` is safer than strict mandatory snapping.

```css
.rail {
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scroll-padding-inline: 1rem;
}

.rail > article {
  scroll-snap-align: start;
  scroll-margin-inline: 0.25rem;
}
```

# Common mistakes

- Assuming the browser must stop at every nearest snap point or uses a specific duration/momentum curve.
- Applying `scroll-snap-type` to a child instead of the scroll container.
- Confusing the container snapport (`scroll-padding`) with the target snap area (`scroll-margin`).
- Using `mandatory` when a large snap area or zoomed page can make intermediate content difficult to reach.
- Treating scroll margins/padding as layout margins/padding; they do not alter normal box sizing.
- Assuming physical `x`/`y` or top/right/bottom/left automatically follows writing mode.
- Treating `scroll-snap-stop: always` as a universal guarantee that every scroll input lands on every item.
- Treating Level 2 `scroll-initial-target` or snap events as stable just because Level 1 properties are widely available; likewise, do not present the dropped `:snapped` selectors as the current styling direction.

# Knowledge checks with answers

1. **What is the difference between `scroll-padding` and `scroll-margin`?** Padding adjusts the scroll container’s snapport; margin adjusts the target’s snap area. Neither changes normal layout dimensions.
2. **What do two values in `scroll-snap-align: start center` mean?** First block-axis alignment (`start`), then inline-axis alignment (`center`).
3. **Why can `scroll-snap-type: both mandatory` still allow a large item to scroll through?** The UA must preserve a usable way to reach content, including within snap areas larger than the snapport; snapping is not an unconditional scripted lock.
4. **Does `scroll-snap-stop: always` define the snap axis?** No. `scroll-snap-type` defines the axis and strictness; stop controls passing over a particular eligible position.
5. **Why use `scroll-padding-block-start` instead of `scroll-padding-top`?** It expresses the logical block-start edge and maps correctly when writing mode changes.
6. **Are `scrollsnapchange` and `SnapEvent` Level 1 properties?** No. They are related Level 2 draft event/API features, distinct from the 25 property inventory here.

# Sources

- [CSS Scroll Snap Module Level 1, published specification](https://www.w3.org/TR/css-scroll-snap-1/) — snapport/snap area model, property grammars, snap selection, and oversized-area/reachability behavior.
- [CSS Scroll Snap Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-scroll-snap-2/) — `scroll-initial-target`, snap events and `SnapEvent`; it states that the proposed `:snapped` selectors are being dropped in favor of a container state query.
- [CSS Conditional Rules Module Level 5, current Editor’s Draft](https://drafts.csswg.org/css-conditional-5/) — current draft definition of the `snapped` scroll-state container feature and its values.
- [CSS Overflow Module Level 3](https://drafts.csswg.org/css-overflow-3/) — scroll-container and scrollport concepts.
- [CSS Positioning Module Level 3](https://drafts.csswg.org/css-position-3/) — sticky/fixed interface interactions with scrolling containers.
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) — individual syntax and compatibility tables for the assigned names.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity snapshot, not an implementation table.
