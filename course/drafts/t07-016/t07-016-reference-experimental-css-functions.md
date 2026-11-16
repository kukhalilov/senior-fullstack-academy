# CSS selectors at-rules cascade values and box model — Reference: Experimental CSS value functions

## Scope and version

These names are the experimental subset in the pinned [MDN CSS functions data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/functions.json). Several relate to evolving anchor positioning, sizing, scroll/view timelines, generated content, and legacy image reuse. Verify grammar and support in the relevant specifications and target browser matrix.

## How this group fits the mental model

Experimental functions produce typed values that participate in layout, timelines, counters, or rendering. Their result depends on a context that may not exist, such as a positioned anchor, named timeline, target element, or paint worklet. A function can parse successfully while still being unresolved, unsupported, or unsuitable in a particular property.

## Supplied names explained

- **`anchor()`** — Reads an anchor element's positional coordinate for an inset property, using an optional side and fallback. It depends on anchor relationships, positioning context, and fallback behavior defined by CSS Anchor Positioning.
- **`anchor-size()`** — Reads a named anchor's size along a logical/physical axis for a sizing value; it is not a general measurement of any DOM element.
- **`calc-size()`** — Performs calculations involving intrinsic sizing keywords while preserving their special sizing behavior; it has a specialized grammar and is not interchangeable with `calc()` for arbitrary values.
- **`element()`** — References a rendered element as an image in supported contexts/implementations; it has limited and non-interoperable support, plus rendering-cycle concerns.
- **`leader()`** — Produces leader patterns for paged-media/string layout contexts, such as dot leaders connecting table-of-contents text and page numbers; implementation support is limited.
- **`scroll()`** — References a scroll progress timeline associated with a scroller and axis for animation-timeline contexts; timeline selection and axis are context-sensitive.
- **`target-counter()`** — Generates a target element's counter value, commonly for paged-media cross-references; it is not a general DOM query.
- **`target-counters()`** — Generates nested counter values from a target element using a separator, typically for hierarchical paged-media references.
- **`target-text()`** — Retrieves text associated with a target for generated content in paged/cross-reference contexts; it is not a safe arbitrary text-extraction API.
- **`view()`** — References a view progress timeline associated with an element's visibility progression through a scrollport; it may accept axis/inset configuration and requires an applicable timeline context.

## Cross-item comparison

`anchor()` and `anchor-size()` read geometric data from an anchor relationship; `calc-size()` combines intrinsic sizing with arithmetic. `scroll()` and `view()` refer to distinct scroll-driven timelines: one tracks scroll-container progress, the other an element's view/visibility progress. `target-counter()`, `target-counters()`, and `target-text()` support generated cross-references, especially paged media, rather than scripting queries. `element()` reuses rendered element imagery and carries implementation limitations; `leader()` fills typographic space in paged output.

## Examples

```css
/* Illustrative anchor sizing; the positioned element needs a valid anchor. */
.tooltip {
  position: absolute;
  inline-size: anchor-size(--trigger inline, 12rem);
  inset-block-start: anchor(--trigger bottom, 0);
}

/* Illustrative scroll-driven animation timeline. */
.progress { animation-timeline: scroll(root block); }

/* Cross-reference output is primarily a paged-media pattern. */
@media print {
  a::after { content: " (page " target-counter(attr(href), page) ")"; }
}
```

These examples are schematic; support, valid contexts, and exact grammar must be checked for the implementation target. Provide meaningful non-animated and non-generated-content fallbacks.

## Common mistakes

- Using `anchor()` or `anchor-size()` without establishing the intended anchor and positioning relationship.
- Confusing scroll progress with view progress.
- Assuming `calc-size()` behaves like ordinary numeric arithmetic over any intrinsic keyword.
- Treating target functions as DOM accessors or exposing sensitive page text.
- Depending on `element()` or paged-media functions in interactive UI without a fallback.
- Assuming experimental status means standardized semantics and interoperable support are settled.

## Knowledge checks with answers

1. **What relationship does `anchor()` require?** A valid CSS anchor reference and consuming positioning context.
2. **How do `scroll()` and `view()` differ?** They refer to scroll-container progress versus an element's view progression.
3. **Are `target-text()` and `target-counter()` JavaScript query functions?** No; they are generated-content value functions for target references.
