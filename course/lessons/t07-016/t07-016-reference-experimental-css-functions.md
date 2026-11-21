# CSS selectors at-rules cascade values and box model — Reference: Emerging and Draft CSS Value Functions

## Scope and version

This group covers names marked experimental in the pinned [MDN CSS functions data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/functions.json), plus `param()` because current MDN labels it experimental and the linked-parameters specification is a First Public Working Draft. The label describes an evolving or draft-level feature set, not identical browser availability: MDN now marks `anchor()` and `anchor-size()` Baseline 2026, while the CSS Anchor Positioning module remains a Working Draft. Check each function’s current compatibility and valid property context.

## How this group fits the mental model

These evolving functions produce typed values that participate in layout, timelines, counters, or rendering. Their result depends on a context that may not exist, such as a positioned anchor, named timeline, target element, or paint worklet. A function can parse successfully while still being unresolved, unsupported, or unsuitable in a particular property.

## Supplied names explained

- **`anchor()`** — With syntax `anchor(<anchor-name>? <anchor-side>, <length-percentage>?)`, resolves an anchor edge or side to a length in an inset value on an absolutely positioned box. The side includes physical/logical edge keywords, `inside`, `outside`, `center`, a percentage, or start/end variants; it may use the default anchor or a named one and may supply a fallback. Naming an anchor in the function does not itself establish the association: use `position-anchor` or the HTML `anchor` attribute. Physical side keywords must match the inset axis. MDN marks it Baseline 2026, but the module remains a Working Draft.
- **`anchor-size()`** — With syntax `anchor-size(<anchor-name>? <anchor-size>, <length-percentage>?)`, resolves an associated anchor’s `width`, `height`, `block`, `inline`, `self-block`, or `self-inline` size as a length. It is allowed in sizing, inset, and margin properties on an anchor-positioned element; its optional fallback applies if the requested anchor cannot resolve. Naming an anchor does not establish the association. MDN marks it Baseline 2026, but the module remains a Working Draft.
- **`calc-size()`** — Calculates from a sizing basis such as `auto`, `min-content`, or another allowed size and exposes that basis as the `size` keyword in the calculation. It preserves intrinsic-size behavior and enables specified transitions between intrinsic sizing keywords and lengths subject to basis/interpolation restrictions, but unlike `calc()` it is not itself a `<length>`; only properties whose grammar accepts it can use it. MDN marks it experimental and limited availability.
- **`element()`** — Produces a live `<image>` from an element selected by ID; changes to the source can update the image. The current specification has restrictions on rendered sources and replaced-element descendants. MDN marks it experimental and limited availability; Firefox’s `-moz-element()` implementation is prefixed, so do not assume the unprefixed form works.
- **`leader()`** — In generated `content`, inserts a repeating leader string (`dotted`, `solid`, `space`, or a custom string) that visually connects the content before and after it. The CSS Generated Content Level 3 Editor’s Draft is explicitly very rough and not ready for implementation; support is limited.
- **`scroll()`** — Creates an anonymous scroll-progress timeline for `animation-timeline`; optional arguments select a scroller (`root`, `nearest`, or `self`) and an axis (`block`, `inline`, `x`, or `y`). The selected scroll container must be scrollable on that axis for the timeline to be active; the default scroller and axis are `nearest` and `block`.
- **`target-counter()`** — In generated content, formats a counter value associated with a referenced target, optionally choosing a counter style. It takes a URL or string target and counter name, with an optional counter style. The current draft supports fragment references within the same document; missing IDs and external-document URLs are errors. It is intended for references such as page or section numbers, not for querying arbitrary DOM state.
- **`target-counters()`** — Generates the target’s nested counter values, joined with a supplied separator and optionally formatted with a counter style; it supports hierarchical references such as section numbering. Like `target-counter()`, the current draft restricts these references to fragment targets in the same document.
- **`target-text()`** — Uses text from a referenced target in generated content, with forms for the target’s content or selected generated/first-letter content. It is a content-generation feature, not a JavaScript DOM query API; the current draft limits targets to fragment references in the same document.
- **`view()`** — Creates an anonymous view-progress timeline for `animation-timeline`, tracking the subject element’s passage through the nearest ancestor scroll container that is scrollable on the selected axis. The default axis is `block`; optional insets adjust the visibility range, and the default inset is `auto`.

- **`param()`** — With syntax `param(<param-spec>, <declaration-value>?)`, passes a named value to an external CSS-aware resource, such as an SVG, through the `link-parameters` property, a URL fragment directive, or a `url()` modifier. The linked resource can consume the value through the corresponding environment-variable mechanism. This is a specialized, experimental proposal, not a font-parameter function.

## Cross-item comparison

`anchor()` reads an anchor edge for inset positioning; `anchor-size()` reads an anchor dimension in sizing, inset, or margin contexts. Both require a valid anchor relationship even though their support is now Baseline 2026 in current MDN. `calc-size()` operates on intrinsic sizing values rather than ordinary lengths. `scroll()` tracks a scroll container’s scroll progress, whereas `view()` tracks a subject box’s passage through a scrollport. The target functions and `leader()` create generated content rather than querying the DOM; their CSS Generated Content module remains a rough draft. `param()` passes values to linked resources, and `element()` uses an element as a live image source; neither is a general scriptable DOM API.

## Examples

```css
/* Illustrative anchor sizing; name the source and associate the tooltip. */
.trigger { anchor-name: --trigger; }
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  inline-size: anchor-size(--trigger inline, 12rem);
  inset-block-start: anchor(--trigger bottom, 0);
}

/* Illustrative scroll-driven animation timeline. */
.progress { animation-timeline: scroll(root block); }

/* View-progress animation, and a same-document paged cross-reference. */
.item { animation: reveal auto linear; animation-timeline: view(block 0% 100%); }
@media print {
  a::after { content: " (page " target-counter(attr(href url), page) ")"; }
}

/* Parameterize a linked SVG that reads env(--accent). */
.logo { background-image: url("logo.svg" param(--accent, rebeccapurple)); }
```

These examples are schematic; support, valid contexts, and exact grammar must be checked for the implementation target. Provide meaningful non-animated and non-generated-content fallbacks.

## Common mistakes

- Using `anchor()` or `anchor-size()` without establishing the intended anchor and positioning relationship.
- Confusing scroll progress with view progress.
- Assuming `calc-size()` behaves like ordinary numeric arithmetic over any intrinsic keyword.
- Treating target functions as DOM accessors or exposing sensitive page text.
- Depending on `element()` or paged-media functions in interactive UI without a fallback.
- Assuming experimental status means standardized semantics and interoperable support are settled.
- Assuming Baseline 2026 support makes the anchor-positioning specification final or guarantees support in older browsers.
- Naming an anchor inside `anchor()` or `anchor-size()` without establishing the positioned element’s anchor association.
- Using `calc-size()` where the consuming property grammar accepts only a length.
- Treating `param()` as a font function or as a mechanism for arbitrary DOM/resource access.

## Sources and maturity

- The [CSS Anchor Positioning Level 1 Working Draft](https://drafts.csswg.org/css-anchor-position-1/) defines `anchor()` and `anchor-size()` contexts, association, axes, and fallbacks. Current MDN marks both functions Baseline 2026; Baseline describes recent cross-browser availability, not specification maturity.
- The [CSS Box Sizing Level 4 Editor’s Draft](https://drafts.csswg.org/css-sizing-4/) defines `calc-size()`; current [MDN compatibility notes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size) mark it experimental and limited availability.
- The [CSS Images Level 4 Editor’s Draft](https://drafts.csswg.org/css-images-4/) defines `element()`; current [MDN compatibility notes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/element) mark it experimental and limited availability.
- The [Scroll-driven Animations Level 1 Editor’s Draft](https://drafts.csswg.org/scroll-animations-1/) defines `scroll()` and `view()` as anonymous timeline values for `animation-timeline`.
- The [CSS Generated Content Level 3 Editor’s Draft](https://drafts.csswg.org/css-content-3/) describes `leader()` and target-based generated content; it explicitly states that the draft is very rough and not ready for implementation.
- The [CSS Linked Parameters Level 1 First Public Working Draft](https://drafts.csswg.org/css-link-params-1/) defines `param()` use with `link-parameters`, URL fragment directives, and URL modifiers; it is work in progress. Current [MDN `param()` documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/param) marks the feature experimental and describes browser compatibility limits.

## Knowledge checks with answers

1. **What relationship does `anchor()` require?** A valid CSS anchor reference and consuming positioning context.
2. **How do `scroll()` and `view()` differ?** They refer to scroll-container progress versus an element's view progression.
3. **Are `target-text()` and `target-counter()` JavaScript query functions?** No; they are generated-content value functions for target references.
