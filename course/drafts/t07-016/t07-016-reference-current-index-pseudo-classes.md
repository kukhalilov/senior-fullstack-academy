# CSS selectors at-rules cascade values and box model — Reference: Additional pseudo-classes in the current MDN index, checked 2026-11-16

## Scope and version

These names appear in the live [MDN pseudo-class index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes) checked 2026-11-16, but not in the curriculum's pinned MDN data commit. Browser support and maturity differ: in particular, the target-relative selectors remain experimental, and interest-invoker selectors depend on evolving HTML/CSS features. This supplements the pinned selector inventory.

## How this group fits the mental model

These newer selectors expose heading semantics, popover interest state, and scroll-marker position. They let CSS reflect state already tracked by the document or browser. They do not create semantic heading structure, popover behavior, or scroll controls by themselves.

## Supplied names explained

- **`:heading`** — Matches heading elements (`h1` through `h6`) as a semantic group. It does not match arbitrary elements with `role="heading"` solely because of that ARIA role; author semantic HTML remains important.
- **`:heading()`** — Matches heading elements by an `An+B` formula applied to heading level, for example selecting every second heading level. The argument is not a general selector list.
- **`:interest-source`** — Matches an element acting as the source of active interest in an interest invoker relationship, such as the relevant interactive invoker while its target is shown through interest behavior.
- **`:interest-target`** — Matches an element currently shown as the target of an interest invoker relationship. The selector reflects active platform state; it does not manage dismissal, focus, or modal semantics.
- **`:target-after`** — Matches scroll-marker pseudo-elements after the currently active scroll marker in a scroll-marker group. It is valid only for generated scroll markers/designated scroll targets and remains limited availability.
- **`:target-before`** — Matches scroll-marker pseudo-elements before the active marker. It is likewise specific to scroll-marker groups and should be progressively enhanced.

## Cross-item comparison

`:heading` targets native heading elements as a set; `:heading(An+B)` filters them by heading level. Interest source and target selectors correspond to opposite sides of a platform-managed invoker relationship. `:target-before`, `:target-current`, and `:target-after` form a positional set around the active scroll marker; they do not describe URL fragment matching, which is `:target`.

## Examples

```css
/* Consistent heading rhythm across native heading levels. */
:heading { text-wrap: balance; }

/* A heading-level pattern, not a child index. */
:heading(2n) { margin-block-start: 2em; }

/* Optional state styling for interest invokers. */
button:interest-source { outline: 2px solid currentColor; }

/* Optional navigation progress styling. */
::scroll-marker:target-before { opacity: 0.55; }
::scroll-marker:target-current { font-weight: 700; }
::scroll-marker:target-after { opacity: 1; }
```

These examples require feature support and correct platform markup. Keep headings, popovers, and navigation functional without these selectors; use `@supports selector(...)` and a tested fallback when shipping experimental behavior.

## Common mistakes

- Assuming `:heading` matches every ARIA heading role; native heading semantics remain the robust baseline.
- Reading `:heading()` as a child-position formula instead of a heading-level formula.
- Treating interest pseudo-classes as a replacement for accessible popover/focus behavior.
- Using target-before/after with ordinary anchors; these selectors are specific to scroll markers.
- Assuming experimental selectors are Baseline or supported merely because they appear in the live index.

## Knowledge checks with answers

1. **Does `:heading()` count sibling elements?** No; its formula selects heading levels.
2. **What does `:target-current` identify in this selector family?** The active scroll marker; before/after select generated markers on either side.
3. **Do interest selectors implement popover dismissal and focus management?** No; they style browser-managed interest state, while interaction semantics still need correct markup and behavior.
