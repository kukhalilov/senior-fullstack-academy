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
4. A scroll rail uses mandatory snap points around tall cards and has large gaps between targets. Explain which content remains freely scrollable, where in-between content can become inaccessible, and propose safer behavior.
5. A reusable card layout changes based on the width of its sidebar slot. Explain why a viewport media query may be the wrong condition.
6. An engineer sees a `scroll-marker-group` example and wants to ship it universally. Explain how to evaluate the feature and provide a fallback.
7. A translated page uses RTL and vertical writing modes, but its spacing is reversed incorrectly. Identify the class of properties to prefer.

# Progressive hints

1. Grid track and item automatic minimums can use min-content contributions.
2. Ask if one or two axes need coordinated shared tracks; wrapping and gaps consume space.
3. Absolute positioning does not reserve room for the badge.
4. Distinguish an oversized snap area (which allows free scrolling while it covers the snapport) from content between widely spaced snap areas; check whether targets cover the actual content and whether mandatory snapping is necessary.
5. The component needs the host’s size, not necessarily the device viewport.
6. Check exact spec maturity and browser support; keep ordinary links and native scrolling.
7. Inline/block axes map through writing mode.

# Complete solutions

1. A long URL contributes a large min-content width. Use `minmax(0, 1fr)` for the flexible track and `min-inline-size: 0` plus `overflow-wrap: anywhere` on the relevant content box. This permits shrinkage and readable wrapping instead of hiding text.
2. Flexbox is suitable if the toolbar is a one-dimensional sequence that may wrap. Give controls an intentional basis or `flex` value, use a gap, and test min-content labels. If controls must align to shared rows and columns, grid may fit better.
3. Absolute positioning removes the badge from normal flow. Reserve room, put the badge in a non-overlapping grid area, or allow the card to grow at zoom. Test translated labels and focus indicators; a media query alone is not a substitute for content constraints.
4. CSS Scroll Snap explicitly allows free scrolling within a snap area larger than the snapport. The more dangerous case is mandatory snapping to small or widely separated targets such as headings: content between target areas can become inaccessible. Use targets whose areas cover long content, prefer `proximity` or no snapping where mandatory stops do not help, and test keyboard, touch, zoom, and tall content.
5. A viewport media query measures the viewport, not the card’s available host size. Establish a named inline-size query container and query it from descendants, while accounting for the containment behavior of the chosen container type.
6. `scroll-marker-group` is a CSS Overflow Level 5 draft/limited feature in this captured set. Its draft defines `links` mode as navigation/link semantics and `tabs` mode as tablist/tab semantics, with different focus behavior and inactive-panel accessibility-tree behavior. Keep ordinary links and native scroll functional, use enhancement only where supported, and test the generated controls with keyboard and assistive technology before relying on either mode.
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
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) — mandatory-snap accessibility risks, oversized snap areas, and escape behavior.
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
