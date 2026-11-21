# CSS selectors at-rules cascade values and box model — Reference: Additional pseudo-elements in the current MDN index, checked 2026-11-16

## Scope and version

The names below are present in MDN's live [pseudo-element index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements) checked 2026-11-16, but absent from the curriculum's pinned MDN data commit. The [CSS Multi-column Level 2](https://drafts.csswg.org/css-multicol-2/), [CSS Overflow Level 5](https://drafts.csswg.org/css-overflow-5/), and [CSS Pseudo-Elements Level 4](https://drafts.csswg.org/css-pseudo-4/) pages used here are CSSWG Editor's Drafts and can change. In particular, the draft makes `::search-text` optional to implement; an MDN index entry or accepted syntax does not guarantee implementation or cross-browser behavior.

## How this group fits the mental model

These pseudo-elements expose browser-generated fragments or controls that are not ordinary authored DOM children. They enable styling of multicolumn fragments, generated scroll controls, or user-agent search highlights. Since the browser owns these boxes and their lifecycle, styling must preserve native operation and accessibility.

## Supplied names explained

- **`::column`** — Represents each column box of a multicolumn container; it is not an authored wrapper around that column's content and cannot select one column by index. The current Level 2 draft says the pseudo-element has no contents, covers the column's available inline size and the container content box in the block axis, but excludes the gaps/rules. Styling is tightly restricted to `scroll-margin`, `scroll-snap-align`, and `scroll-snap-stop`; it can have a `::scroll-marker` sub-pseudo-element. These details are draft behavior, not a claim of broad implementation.
- **`::scroll-button()`** — Generates one of up to four direction-specific buttons for its originating scroll container: `block-start`, `inline-start`, `inline-end`, and `block-end`, resolved using writing mode. The draft also defines physical aliases (`up`, `down`, `left`, `right`) and convenience selectors `prev`/`next`; `*` selects all four. Buttons are focusable and activatable by default and scroll about one page in their direction. `:disabled` matches a button when that direction cannot scroll. The generated control still needs meaningful `content`/accessible naming, visible focus, and a fallback when unsupported.
- **`::search-text`** — Represents text identified by the user agent's find-in-page feature; it is not a search API, and the page author does not choose the query or matching algorithm. The CSS Pseudo draft says this pseudo-element is optional because some user agents cannot express their find highlighting through the highlight-pseudo-element model. `:current::search-text` can represent the currently focused match when supported. The highlight pseudo-element property restrictions apply; don't assume it accepts arbitrary layout styling.

## Cross-item comparison

`::column` represents the geometry of a multicolumn column, not its content subtree. `::scroll-button()` creates a generated interactive control, unlike a purely decorative `::before`/`::after`; preserve its operation, naming, focus visibility, and disabled state. `::search-text` is a UA-owned highlight for user search, while `::highlight(name)` targets an author-registered range. All three are pseudo-elements, not selectable DOM nodes. For each feature, implementation and supported styling are separate questions from the draft's definition.

## Examples

```css
/* ::column accepts scroll-snap and scroll-margin properties in the draft. */
@supports selector(::column) {
  .article::column { scroll-snap-align: start; }
}

/* Illustrative only: verify support and accessible-name behavior in browsers. */
@supports selector(::scroll-button(inline-start)) {
  .carousel::scroll-button(inline-start) { content: "Previous"; }
  .carousel::scroll-button(inline-end) { content: "Next"; }
}

/* Preserve legibility of user-agent find-in-page matches. */
::search-text { background-color: #ffec80; color: #111; }
```

These examples are feature demonstrations. `@supports selector(...)` tests whether a selector parses; it does not test the full rendering, focus, accessibility, or action behavior. Exact syntax and generated-control behavior must be checked in target browsers. Do not replace semantic controls or tested accessible names with generated content alone; preserve usable fallback navigation and readable find-result contrast.

## Common mistakes

- Assuming a pseudo-element can be queried or manipulated as a real DOM element.
- Using `::scroll-button()` without verifying generated labels, keyboard handling, focus order, and disabled behavior.
- Depending on experimental scroll/column pseudo-elements for essential content access.
- Treating `::search-text` as a search API or assuming an author can control which text the browser highlights.
- Treating `::column` as a content wrapper or assuming ordinary visual properties such as `color` apply to it; its draft property set is unusually narrow.
- Assuming a parsing support query proves that a generated scroll button works accessibly or that find-in-page highlights can be styled.
- Applying unrestricted layout styles to a highlight pseudo-element when its property set is intentionally limited.

## Knowledge checks with answers

1. **Does `::column` correspond to an HTML child?** No; it represents a generated column fragment.
2. **What is special about `::scroll-button()`?** It generates a browser-operated scroll control rather than a merely decorative pseudo-element.
3. **Who controls the text matched by `::search-text`?** The user agent's find-in-page feature and the user's query.

## Sources and maturity

- [CSS Multi-column Layout Module Level 2 Editor's Draft](https://drafts.csswg.org/css-multicol-2/), §4.8: `::column` box geometry, contents, allowed properties, and the `::scroll-marker` sub-pseudo-element.
- [CSS Overflow Module Level 5 Editor's Draft](https://drafts.csswg.org/css-overflow-5/), §§3.2–3.3: direction arguments, scroll behavior, `:disabled`, and focus-order behavior for generated buttons.
- [CSS Pseudo-Elements Module Level 4 Editor's Draft](https://drafts.csswg.org/css-pseudo-4/), §3.1: `::search-text`, optional implementation, and combination with `:current`.
- [MDN pseudo-element reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements): current index entries; index presence does not establish engine support.
