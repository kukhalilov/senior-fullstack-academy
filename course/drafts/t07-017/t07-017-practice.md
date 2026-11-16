# CSS layout flexbox grid positioning and responsive design — Exercises and worked solutions

# Goals

Diagnose the formatting model, reason about intrinsic sizing, choose flex or grid, preserve content reachability, apply logical and responsive constraints, and separate stable properties from evolving drafts.

# Worked example

```css
.dashboard { display: grid; grid-template-columns: minmax(0, 1fr) 18rem; gap: 1rem; }
.dashboard__main { min-inline-size: 0; overflow-wrap: anywhere; }
@media (max-width: 50rem) { .dashboard { grid-template-columns: 1fr; } }
```

The grid coordinates two columns. The zero track minimum and item minimum allow the main column to shrink; wrapping protects against an unbroken token. The media query stacks columns at a viewport threshold. A reusable dashboard embedded in variable regions could use a named container query instead.

# Exercises

1. A grid’s main column overflows because it contains a long URL. Explain the intrinsic sizing cause and fix it without clipping the text.
2. A toolbar has one row on desktop but should wrap into readable groups on narrow screens. Choose flexbox or grid and specify the relevant sizing/alignment concerns.
3. A card badge is absolutely positioned and overlaps the title at 200% zoom. Diagnose the missing constraint and propose a more robust design.
4. A scroll rail uses mandatory snap points around tall cards. Explain how this can harm access and propose safer behavior.
5. A reusable card layout changes based on the width of its sidebar slot. Explain why a viewport media query may be the wrong condition.
6. An engineer sees a `scroll-marker-group` example and wants to ship it universally. Explain how to evaluate the feature and provide a fallback.
7. A translated page uses RTL and vertical writing modes, but its spacing is reversed incorrectly. Identify the class of properties to prefer.

# Progressive hints

1. Grid track and item automatic minimums can use min-content contributions.
2. Ask if one or two axes need coordinated shared tracks; wrapping and gaps consume space.
3. Absolute positioning does not reserve room for the badge.
4. Snap is a user-agent preference; a tall item may not provide reachable snap positions if overly constrained.
5. The component needs the host’s size, not necessarily the device viewport.
6. Check exact spec maturity and browser support; keep ordinary links and native scrolling.
7. Inline/block axes map through writing mode.

# Complete solutions

1. A long URL contributes a large min-content width. Use `minmax(0, 1fr)` for the flexible track and `min-inline-size: 0` plus `overflow-wrap: anywhere` on the relevant content box. This permits shrinkage and readable wrapping instead of hiding text.
2. Flexbox is suitable if the toolbar is a one-dimensional sequence that may wrap. Give controls an intentional basis or `flex` value, use a gap, and test min-content labels. If controls must align to shared rows and columns, grid may fit better.
3. Absolute positioning removes the badge from normal flow. Reserve room, put the badge in a non-overlapping grid area, or allow the card to grow at zoom. Test translated labels and focus indicators; a media query alone is not a substitute for content constraints.
4. Mandatory snapping can make intermediate content difficult to reach, especially when a card exceeds the scrollport. Use proximity or remove snapping where appropriate, ensure continuous scroll remains available, and test keyboard, touch, zoom, and tall content.
5. A viewport media query measures the viewport, not the card’s available host size. Establish a named inline-size query container and query it from descendants, while accounting for the containment behavior of the chosen container type.
6. `scroll-marker-group` is a CSS Overflow Level 5 draft/limited feature in this captured set. Keep native scroll and document links functional, use feature enhancement only where supported, and verify generated marker focus/roles with assistive technology in targets.
7. Prefer logical margin, padding, sizing, border, and inset properties where appropriate. Confirm each element’s writing mode; do not assume that inline means horizontal or block means vertical.

# Tests and edge cases

Test minimum and maximum content; long URLs and unbreakable identifiers; empty/late-loading content; 200% and 400% zoom; RTL and vertical writing; translated labels; keyboard focus and scroll reachability; nested scroll containers; tall snap targets; browser support fallbacks; print fragmentation; and reduced-motion preferences for any animated layout transitions. Inspect computed styles and containing blocks in DevTools.

# Reflection questions

- What formatting context owns each box?
- Which intrinsic minimum or containing block explains the observed size?
- Is alignment acting on items, tracks, lines, or distributed content?
- Can every overflowed item still be reached?
- Is the responsive condition tied to the viewport or to a named component host?
- What behavior remains when a draft property is ignored?

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
