# CSS selectors at-rules cascade values and box model — Reference: Additional pseudo-elements in the current MDN index, checked 2026-11-16

## Scope and version

The names below are present in MDN's live [pseudo-element index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements) checked 2026-11-16, but absent from the curriculum's pinned MDN data commit. New overflow and multicolumn pseudo-elements are experimental/limited availability; `::search-text` represents UA find-in-page highlighting and has its own browser support constraints.

## How this group fits the mental model

These pseudo-elements expose browser-generated fragments or controls that are not ordinary authored DOM children. They enable styling of multicolumn fragments, generated scroll controls, or user-agent search highlights. Since the browser owns these boxes and their lifecycle, styling must preserve native operation and accessibility.

## Supplied names explained

- **`::column`** — Represents each column fragment in a multicolumn layout. It can expose styling for generated column boxes; it is not an authored wrapper or a selector for an element's columns by DOM index.
- **`::scroll-button()`** — Generates a button for scrolling its originating scroll container in a specified direction, where the CSS Overflow feature is supported. It is browser-generated UI, so verify enabled/disabled states, accessible naming, keyboard interaction, and browser support.
- **`::search-text`** — Targets text ranges matched by the user agent's find-in-page search. Authors do not control the query or matching algorithm; style only within the properties allowed for highlight pseudo-elements.

## Cross-item comparison

`::column` represents content fragmentation output. `::scroll-button()` creates a generated interactive control, unlike a purely decorative `::before`/`::after`; do not hide or make its operation inaccessible. `::search-text` is a UA-owned highlight for user search, while `::highlight(name)` targets an author-registered range. All three are pseudo-elements, not selectable DOM nodes.

## Examples

```css
/* Experimental column fragment styling. */
@supports selector(::column) {
  .article::column { color: inherit; }
}

/* Browser-generated carousel controls require the matching overflow setup. */
@supports selector(::scroll-button(inline-start)) {
  .carousel::scroll-button(inline-start) { content: "Previous"; }
  .carousel::scroll-button(inline-end) { content: "Next"; }
}

/* Preserve legibility of user-agent find-in-page matches. */
::search-text { background-color: #ffec80; color: #111; }
```

These examples are feature demonstrations; exact selector syntax and generated control behavior must be checked in the target browsers. Do not replace semantic controls or custom accessible names with generated content alone.

## Common mistakes

- Assuming a pseudo-element can be queried or manipulated as a real DOM element.
- Using `::scroll-button()` without verifying generated labels, keyboard handling, focus order, and disabled behavior.
- Depending on experimental scroll/column pseudo-elements for essential content access.
- Treating `::search-text` as a search API or assuming an author can control which text the browser highlights.
- Applying unrestricted styles to a highlight pseudo-element when its property set is intentionally limited.

## Knowledge checks with answers

1. **Does `::column` correspond to an HTML child?** No; it represents a generated column fragment.
2. **What is special about `::scroll-button()`?** It generates a browser-operated scroll control rather than a merely decorative pseudo-element.
3. **Who controls the text matched by `::search-text`?** The user agent's find-in-page feature and the user's query.
