# CSS selectors at-rules cascade values and box model — Reference: Additional pseudo-classes in the current MDN index, checked 2026-11-16

## Scope and version

These names appear in the live [MDN pseudo-class index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes) but are absent from the curriculum's pinned MDN data snapshot. The normative descriptions below distinguish selectors defined by a work-in-progress specification from browser support: the current [Selectors Level 5 Editor's Draft](https://drafts.csswg.org/selectors-5/) explicitly says it is for discussion and may change, and [CSS Overflow Level 5](https://drafts.csswg.org/css-overflow-5/) is also an Editor's Draft. An MDN index entry or draft definition does not establish interoperable implementation.

## How this group fits the mental model

These newer selectors expose heading semantics, interest-invoker state, and scroll-marker position. They let CSS reflect state already defined by the document language or browser. They do not create heading structure, interest behavior, or scroll controls by themselves. Treat all six entries here as evolving features, test the exact selector in target browsers, and retain a usable baseline that does not depend on them.

## Supplied names explained

- **`:heading`** — In Selectors Level 5, matches an element with a heading level according to the host document language. HTML's ordinary h1–h6 elements are examples; matching is semantic, not a test for the literal tag name. A heading level can differ from the type selector, so `h1:heading(3)` can match an `h1` whose exposed heading level is 3. An ARIA `role="heading"` alone does not necessarily give an element a host-language heading level.
- **`:heading()`** — Matches heading-level values listed as comma-separated integers, such as `:heading(1, 3)`. It is **not** `An+B` and does not count siblings. It accepts a list of integer levels, not a general selector list. Both `:heading` and `:heading()` have class-level specificity in the current draft.
- **`:interest-source`** — Matches an interest-source element only while the user is currently showing interest in it. The host language defines eligible sources, their links to targets, and what input shows interest. The Selectors draft's HTML example uses `interestfor`; merely having that attribute does not make the source match.
- **`:interest-target`** — Matches the associated interest target of a source that currently matches `:interest-source`; an element pointed to by an inactive source does not match. These are selectors for non-primary interest interactions (for example hover or long-press); they do not supply activation, dismissal, focus handling, or modal behavior.
- **`:target-after`** — In CSS Overflow Level 5, matches scroll markers following the active marker in the same scroll-marker group, according to flat-tree order. It does not mean “after the URL fragment target.”
- **`:target-before`** — Matches scroll markers preceding the active marker in the same group, according to flat-tree order. The related `:target-current` selects the active marker. This is distinct from `:target`, which matches the element targeted by the document URL.

## Cross-item comparison

`:heading()` compares semantic heading levels against an explicit integer list, whereas `:nth-child(An+B)` counts sibling positions. Interest source and target selectors correspond to the active and associated sides of a host-language-defined relationship. `:target-before`, `:target-current`, and `:target-after` form a positional set around the active scroll marker; they do not describe URL-fragment matching, which is `:target`.

## Examples

```css
/* Consistent heading rhythm across native heading levels. */
:heading { text-wrap: balance; }

/* Explicit semantic heading levels, not a sibling-count formula. */
:heading(1, 2) { margin-block-start: 2em; }

/* Optional state styling for interest invokers. */
button:interest-source { outline: 2px solid currentColor; }

/* Optional navigation progress styling. */
::scroll-marker:target-before { opacity: 0.55; }
::scroll-marker:target-current { font-weight: 700; }
::scroll-marker:target-after { opacity: 1; }
```

These examples require parser and implementation support, correct host-language semantics, and (for scroll markers) a scroll-marker group. `@supports selector(:heading(1))` or `@supports selector(:interest-source)` can test parsing, but parsing support alone does not guarantee that the feature works interoperably. Keep headings, invoker behavior, and navigation functional without these selectors; verify runtime behavior in target browsers and provide tested fallbacks.

## Common mistakes

- Assuming `:heading` matches every ARIA heading role; native heading semantics remain the robust baseline.
- Reading `:heading()` as an `An+B` child-position or heading-level formula; it takes explicit integer levels in the current draft.
- Treating interest pseudo-classes as a replacement for accessible popover/focus behavior.
- Using target-before/after with ordinary anchors; these selectors are specific to scroll markers.
- Assuming experimental selectors are Baseline or supported merely because they appear in the live index.

## Knowledge checks with answers

1. **What does `:heading(1, 3)` match in the current draft?** Elements whose host-language heading levels are 1 or 3; it does not count siblings or accept `An+B`.
2. **What does `:target-current` identify in this selector family?** The active scroll marker; before/after select generated markers on either side.
3. **Do interest selectors implement popover dismissal and focus management?** No; they style browser-managed interest state, while interaction semantics still need correct markup and behavior.

## Sources and maturity

- [Selectors Level 5 Editor's Draft](https://drafts.csswg.org/selectors-5/) (27 August 2026), especially sections 4.1 and 8. It defines interest and heading selectors but is explicitly work in progress.
- [CSS Overflow Module Level 5 Editor's Draft](https://drafts.csswg.org/css-overflow-5/) (16 September 2026), especially section 3.1.7. It defines before/current/after relative to one marker group and flat-tree order; the entire document is explicitly work in progress.
- [MDN pseudo-class reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes), for the current index and its category notes. MDN's index is a reference, not a support guarantee.
