# CSS layout flexbox grid positioning and responsive design — Reference: CSS Overflow properties

# Scope and version

This lesson covers exactly the 14 properties assigned to **CSS Overflow properties**. The captured 2026-11-16 MDN status set includes established Baseline properties, limited features, and experimental scroll/clamping features; those labels are per property and can overlap. `scroll-marker-group` and `scroll-target-group` are currently marked Limited availability and Experimental in MDN, while `scroll-axis-lock` is an Overflow Level 5 draft feature. The current Overflow Levels 3–5 Editor’s Drafts are work in progress. Related draft longhands of `overflow-clip-margin`, plus `block-ellipsis` and `continue`, are listed in the companion Experimental CSS Overflow lesson; they were added after checking the current Level 4 draft.

# How this group fits the mental model

Overflow handling compares a box’s content with its clipping boundary and, for scrollable values, its scrollport. Distinguish **paint clipping**, **scroll-container creation**, and **whether the user can reach the hidden content**. These are separate concerns. The choice affects formatting contexts, sticky positioning, scroll snapping, scroll chaining, keyboard access, and scrollbar layout.

Physical axes (`overflow-x`/`overflow-y`) mean horizontal/vertical. Logical axes (`overflow-inline`/`overflow-block`) follow writing mode. The `overflow` shorthand sets x then y, with a single value copied to both. The pair has computed-value interactions: if one axis is neither `visible` nor `clip`, `visible` on the other computes to `auto`, and `clip` computes to `hidden`. Check computed styles when mixing axis values.

# Supplied names explained

| Exact name | Role | Key values and behavior |
| --- | --- | --- |
| `overflow` | Shorthand for `overflow-x` and `overflow-y`, in that order. | One value sets both axes; two set x then y. `visible` paints outside; `hidden` clips and creates a scroll container that can still be scrolled programmatically; `clip` clips without scrolling and does not create a formatting context; `scroll` creates a scroll container even if currently not overflowing; `auto` behaves like scroll only when there is scrollable overflow. For block boxes, scrollable values establish an independent formatting context. |
| `overflow-x` | Controls overflow in the physical horizontal axis. | Uses `visible`, `hidden`, `clip`, `scroll`, or `auto`. It is independent of writing mode; if the design means inline/block direction, use logical properties. Combined values are subject to the cross-axis computed-value rules above. |
| `overflow-y` | Controls overflow in the physical vertical axis. | Same value family and distinctions as `overflow-x`, on the physical vertical axis. A vertical writing mode does not redefine this property’s physical meaning. |
| `overflow-inline` | Controls overflow in the logical inline axis. | Uses the same values as the other overflow longhands, but maps with writing mode. Useful for inline carousels that must work in RTL and vertical writing. |
| `overflow-block` | Controls overflow in the logical block axis. | Same values, mapped to the block axis. It does not always mean physical vertical. |
| `overflow-clip-margin` | Expands or adjusts the overflow clip edge. | Current Level 3/4 drafts define a visual-box origin (default padding box on ordinary elements) plus a length. It matters when clipping, notably with `overflow: clip`, and is not a way to make content scrollable. The newer physical/logical longhands are separated into the experimental companion lesson. |
| `-webkit-line-clamp` | Legacy prefixed line-clamping behavior. | The interoperable legacy recipe uses `display: -webkit-box`, `-webkit-box-orient: vertical`, `-webkit-line-clamp: N`, and clipping (`overflow: hidden`). It has historical quirks and remains specified for compatibility; do not assume it is identical to the newer unprefixed shorthand or that hidden content is exposed identically to assistive technology. |
| `line-clamp` | Unprefixed shorthand that limits block content by line count and controls the block ellipsis/continuation behavior. | The current Level 4 draft grammar includes a line count, optional `auto` and block-ellipsis choice, and an optional legacy behavior keyword. The basic feature is Limited availability in the captured MDN status. Use a fallback appropriate for your audience and provide a way to reveal essential truncated text. |
| `text-overflow` | Signals clipped inline content at the end(s) of a line; it does not create overflow or set the box size. | Established values are `clip` and `ellipsis`; current Level 4 draft grammar also explores custom strings, `fade`, and `fade()`. Usually pair it with a constrained inline size and a non-visible overflow value; `white-space: nowrap` is common for one-line labels. Its effect is at the inline edge, which can be left or right depending on direction/writing mode. Newer values require compatibility checks. |
| `scroll-behavior` | Controls non-user-triggered scrolling of a scroll container. | `auto` is instant; `smooth` requests UA-timed smooth scrolling for navigation, CSSOM scrolling APIs, and some scroll-snap operations. It does not control user wheel/touch scrolling, and the UA may ignore it. Respect reduced-motion preferences when authoring custom scrolling behavior. |
| `scrollbar-gutter` | Reserves layout space for classic scrollbars. | `auto` reserves space when a classic scrollbar is present; `stable` reserves the gutter even before overflow for applicable overflow values; `both-edges` mirrors a present inline-edge gutter on the opposite side. Overlay scrollbars do not consume a gutter under the current Level 3 draft, so this property may not change their layout. It reserves space; it does not force the scrollbar to be visible. |
| `scroll-marker-group` | Experimental Overflow Level 5 property that generates a scroll-marker-group pseudo-element for a scroll container. | Draft values include `none` or a position (`before`/`after`) with optional `links`/`tabs` interaction mode. The mode affects roles and keyboard behavior, not only appearance. It must be treated as a real navigation/tab interface: test focus, semantics, and input methods, and provide a supported fallback. MDN currently marks it Limited availability and Experimental. |
| `scroll-target-group` | Experimental Overflow Level 5 property that makes an element a group container for descendant scroll markers. | Draft values are `none` and `auto`. It can enable active-target styling such as `:target-current` for a table of contents. It is limited/experimental in current MDN data; do not make active-section navigation depend on it without a fallback. |
| `scroll-axis-lock` | Experimental Overflow Level 5 property controlling whether the UA may lock a scroll gesture on an axis. | Draft values are `auto` (the UA may lock) and `none` (must not lock); it applies to scroll containers, and a root value is applied to the document viewport. It is not interchangeable with `touch-action` or `overscroll-behavior`, which govern different parts of input/scroll behavior. |

# Cross-item comparison

`hidden` and `clip` are not synonyms: `hidden` still permits programmatic scrolling and creates a scroll container; `clip` forbids scrolling and does not itself create a new formatting context. `scroll` may expose a scrollbar even without overflow; `auto` only does so when needed, subject to platform scrollbar presentation. Neither clipping value is a safe way to discard essential information.

`text-overflow` handles inline-end clipping in a line; `line-clamp` limits block-axis lines. Neither property alone guarantees that truncated content is available to every user. `scroll-behavior` controls certain script/navigation scrolling, not direct user gestures. `scrollbar-gutter` reserves space for classic scrollbar layout shifts. Scroll marker properties instead define navigation controls and their interaction model; they are separate, experimental Overflow Level 5 features.

# Examples

For a horizontal carousel, preserve scroll access and keyboard-operable controls. The second declaration provides a graceful default where newer logical overflow syntax is unsupported; verify actual compatibility targets.

```css
.carousel {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-gutter: stable;
}

.single-line-label {
  max-inline-size: 20rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

Smooth behavior should not be the only way to reach content, and the carousel needs visible focus and another understandable way to navigate its items. Avoid placing essential controls inside a clipped region.

# Common mistakes

- Treating `overflow: hidden` and `overflow: clip` as equivalent for scripting, formatting contexts, and sticky ancestors.
- Assuming `overflow: hidden` makes content unreachable to every mechanism; script can still scroll it even though direct user scrolling is suppressed.
- Mixing x/y values without checking computed-value interactions between `visible`, `clip`, `auto`, and `hidden`.
- Expecting `text-overflow: ellipsis` to create a constrained box or wrap/clamp multiple lines by itself.
- Using line clamping for essential information without a disclosure mechanism or a reading experience that exposes the complete content.
- Assuming `scrollbar-gutter: stable` creates visible space with overlay scrollbars or forces a scrollbar to appear.
- Assuming `scroll-behavior: smooth` affects user-initiated scrolling or is guaranteed to be honored.
- Treating experimental scroll-marker modes as decoration; the draft distinguishes links and tabs keyboard/semantic behavior.
- Treating experimental Overflow Level 5 properties as Baseline features because MDN documents them.

# Knowledge checks with answers

1. **A script calls `scrollTo()` on a box with `overflow: hidden`. Can it move?** Yes, hidden content can be programmatically scrolled, even though direct user scrolling is suppressed. `clip` forbids scrolling.
2. **Does `overflow: clip` create a block formatting context?** No. Combine it with `display: flow-root` if both clipping and a new formatting context are intended.
3. **Why can `text-overflow: ellipsis` appear to do nothing?** The box needs inline content actually overflowing a constrained line and overflow must be non-visible. The property does not create the size constraint or force text onto one line.
4. **Will `scroll-behavior: smooth` animate a user’s wheel scroll?** No. It applies to certain navigation/API/snap-triggered scrolls; direct user scrolling is not controlled by it.
5. **Will `scrollbar-gutter: stable` reserve room with overlay scrollbars?** Under the current specification, overlay scrollbars do not consume a gutter, so there may be no layout change.
6. **Why are scroll markers more than visual indicators?** Their draft `links` and `tabs` modes define roles and keyboard interaction; those semantics must be considered, and support is limited/experimental.

# Sources

- [CSS Overflow Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-overflow-3/) — overflow values, scroll containers, axis interactions, clip/hidden distinction, `text-overflow`, `scroll-behavior`, and `scrollbar-gutter`.
- [CSS Overflow Module Level 4, current Editor’s Draft](https://drafts.csswg.org/css-overflow-4/) — line clamping, legacy syntax, expanded `text-overflow`, and overflow-clip-margin longhands; work in progress.
- [CSS Overflow Module Level 5, current Editor’s Draft](https://drafts.csswg.org/css-overflow-5/) — `scroll-axis-lock`, scroll marker properties and keyboard/semantic modes; work in progress.
- [CSSOM View](https://drafts.csswg.org/cssom-view/) — scrolling APIs and their relationship to scroll containers.
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) and [CSS Overscroll Behavior Module Level 1](https://www.w3.org/TR/css-overscroll-1/) — related but separate scrolling controls.
- [MDN `overflow`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow), [`line-clamp`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp), [`scroll-marker-group`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-marker-group), and [`scroll-target-group`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-target-group) — current guides and compatibility information.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity snapshot, not an implementation table.
