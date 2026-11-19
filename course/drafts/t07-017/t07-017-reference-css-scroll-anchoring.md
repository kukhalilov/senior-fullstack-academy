# CSS layout flexbox grid positioning and responsive design — Reference: CSS Scroll Anchoring properties

# Scope and version

This lesson covers the single supplied property `overflow-anchor`. Scroll Anchoring Level 1 has a published Working Draft and a newer Editor’s Draft (30 September 2026 in the version checked). The feature aims to reduce disruptive viewport movement when layout changes above the visible content; draft details and browser support should be checked separately. The property is an opt-out control, not a general layout-shift prevention system.

# How this group fits the mental model

Imagine reading halfway down a page when an image above the text finishes loading. If the page’s scroll offset stayed fixed, the paragraph you were reading could jump downward. Scroll anchoring can select a visible descendant as an anchor and adjust the scroll offset to keep that content in approximately the same place. Authors should reserve space for late content first; opt out only where the browser’s chosen anchor causes a demonstrated problem.

# Supplied names explained

| Exact supplied property | Grammar and effect |
| --- | --- |
| `overflow-anchor` | `auto \| none`; initial `auto`; applies to all elements; not inherited; computed value is the specified keyword; discrete animation. `auto` leaves the element potentially eligible for anchor selection for scrolling boxes created by it or an ancestor. `none` makes the element and descendants in that anchoring context ineligible. A nested scroll container establishes its own scrolling box and can anchor again unless it also opts out. |

The browser chooses the anchor; authors do not nominate a specific node through this property. The draft’s selection rules prioritize certain nodes, including editable focused content and find-in-page matches, then examine visible descendants. Anchoring is suppressed in situations where adjustments would conflict with other scroll behavior. In particular, if the scroll container is snapped to an element, anchoring adjustments are limited to those allowed by scroll snap re-snapping.

# Cross-item comparison

`overflow-anchor: none` affects anchor eligibility; it does not freeze layout, prevent image/font loading shifts, or disable scrolling and scroll snapping. Prevent predictable shifts by supplying image dimensions/aspect ratios, reserving ad/embed space, and avoiding late insertion above the reading position. Use a narrow opt-out only for a component whose own anchoring behavior is known to be harmful.

# Examples

```css
/* First reserve space for content whose size is known. */
.article-image {
  width: 100%;
  aspect-ratio: 16 / 9;
}

/* Narrow opt-out for a virtualized region after confirming it causes bad jumps. */
.virtualized-log {
  overflow-anchor: none;
}
```

The declaration does not mean all descendants can later re-enable anchoring. The spec says `none` excludes the subtree from the relevant ancestor’s anchor candidate selection; nested scroll containers may independently anchor their own scrolling boxes.

# Common mistakes

- Disabling anchoring globally to conceal missing reserved dimensions or late layout shifts.
- Expecting to choose which descendant becomes the anchor; selection is a user-agent algorithm.
- Treating `overflow-anchor: none` as inherited CSS; the property is not inherited, but its exclusion effect applies to the subtree for relevant ancestor scrollers.
- Assuming descendants can set `auto` to opt back into an ancestor scroller’s excluded subtree; the draft says that is not possible (nested scroll containers have their own anchoring context).
- Confusing scroll anchoring with scroll snapping or `scroll-behavior`.
- Assuming anchor adjustments can violate a snap position; when snapped, adjustments are constrained by re-snapping rules.
- Treating the Editor’s Draft as a browser-support guarantee.

# Knowledge checks with answers

1. **What problem does scroll anchoring try to reduce?** A visible reading position jumping when layout changes elsewhere in the scrollable content.
2. **What does `overflow-anchor: none` do?** It excludes the element and relevant descendants from anchor selection for ancestor-created scrolling boxes.
3. **Can a descendant’s `auto` restore its eligibility for an ancestor scroller?** No; the draft says an excluded subtree cannot turn anchoring back on for that ancestor. A nested scroll container may anchor its own scrolling box.
4. **What should be tried before opting out?** Reserve dimensions/space for late-loading content and fix avoidable layout shifts.
5. **How does scroll snapping constrain anchoring?** If a container is snapped, anchoring adjustments are limited to positions allowed by re-snapping.

# Sources

- [CSS Scroll Anchoring Module Level 1, current Editor’s Draft](https://drafts.csswg.org/css-scroll-anchoring/) — anchor selection, priority candidates, suppression, snap interaction, and `overflow-anchor` grammar/effect; work in progress.
- [CSS Scroll Anchoring Module Level 1, published Working Draft](https://www.w3.org/TR/css-scroll-anchoring-1/) — published draft baseline and status.
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) — re-snapping behavior that constrains anchoring in snapped containers.
