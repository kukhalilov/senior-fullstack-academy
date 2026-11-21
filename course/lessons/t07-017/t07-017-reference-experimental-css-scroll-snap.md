# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css scroll snap properties

# Scope and version

This lesson explains the single assigned property `scroll-initial-target`. It is defined by the CSS Scroll Snap Level 2 Editor’s Draft, dated 25 February 2026 in the version checked for this audit. The document is work in progress and explicitly asks readers to treat it as such; the property is not a broadly established production feature. Browser support must be checked separately and tested in the actual target browsers.

# How this group fits the mental model

Ordinary scroll snapping chooses preferred resting positions during a scrolling operation. `scroll-initial-target` addresses a different moment: the initial scroll position when a scroll container first appears. It lets an element inside the container be selected as the starting destination, without script. It does not set future snap points, disable user scrolling, or replace fragment navigation.

# Supplied names explained

| Exact supplied property | Grammar and behavior |
| --- | --- |
| `scroll-initial-target` | `none \| nearest`; initial value `none`; applies to all elements; not inherited; computed value is the specified keyword. `none` means the element is not an initial target. `nearest` makes it a potential initial target for its nearest scroll-container ancestor. If more than one eligible element targets a given scroll container, the draft says the user agent should choose the first in tree order. The selected target determines the initial scroll position using scroll-into-view behavior with `block: start` and `inline: nearest`. |

The property is placed on the intended target, not on the scrolling container. The container association is derived from the target’s nearest scroll-container ancestor. If the container’s initial position could also be set by a content-distribution property such as `place-content`, the draft gives precedence to `scroll-initial-target`. If the target arrives after first layout, the user agent should still scroll to it unless there is reason to believe the user is no longer interested in that initial position.

# Cross-item comparison

`scroll-initial-target` selects one possible starting destination. `scroll-snap-align` describes how a target’s snap area aligns during later snapping. `scroll-padding` and `scroll-margin` shape snap geometry. These properties solve related but distinct parts of the scroll experience; assigning one does not imply that the others are enabled.

# Examples

This example asks a horizontally scrolling story rail to begin at a chosen card. The `overflow-x` and snap properties show the established scroll container and later snap behavior; the initial-target declaration is the experimental part.

```css
.story-rail {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

.story-rail > article {
  flex: 0 0 85%;
  scroll-snap-align: start;
}

.story-rail > article.is-current {
  scroll-initial-target: nearest;
}
```

Avoid relying on this draft behavior as the only way to reach meaningful content. Keep a sensible DOM order, allow direct user scrolling, and provide ordinary links where navigation to a section matters.

# Common mistakes

- Putting the property on the scroll container instead of the intended descendant target.
- Assuming `nearest` means nearest geometric target; it associates the element with its nearest scroll-container ancestor.
- Assuming multiple targets are resolved by proximity or source importance; the draft specifies first in tree order as the recommended selection.
- Confusing the initial destination with the alignment used during later snap operations.
- Assuming the browser should override a user who has already begun scrolling; the draft explicitly allows the UA to preserve the user's apparent intent.
- Treating a CSS Working Group Editor’s Draft as a stable browser feature.

# Knowledge checks with answers

1. **What values does the property accept?** `none` and `nearest`; its initial value is `none`.
2. **Where is it declared?** On a potential target element; it is associated with that target’s nearest scroll-container ancestor.
3. **What if several elements are eligible for the same container?** The draft says the UA should select the first in tree order.
4. **Does it define later snap alignment?** No. `scroll-snap-align` describes snap alignment; `scroll-initial-target` affects the initial scroll position.
5. **What happens if the target appears after first layout?** The UA should still scroll to it unless it has reason to believe the user no longer wants that initial position.

# Sources

- [CSS Scroll Snap Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-scroll-snap-2/) — §§3.1–3.1.4 define grammar, selection, initial scroll-into-view alignment, `place-content` precedence, and late-arriving targets; the status section identifies the document as work in progress.
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) — established scroll container, snapport, snap area, and later snap behavior.
- [MDN: `scroll-initial-target`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-initial-target) — captured availability information; check the current compatibility table before use.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity overview; not a browser compatibility table.
