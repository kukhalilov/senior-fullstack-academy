# CSS selectors at-rules cascade values and box model — Reference: Experimental pseudo-classes in the pinned MDN index

## Scope and version

This lesson covers only names categorized as experimental in the pinned [MDN selectors inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json). Compare with the [current MDN pseudo-class index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes): indexed status is not a promise of shipping support, and status/category can evolve. Verify current specifications and browser compatibility when evaluating any of these names.

## How this group fits the mental model

These selectors extend structural, navigational, temporal, or immersive-state matching. Their syntax may be standardized, proposed, or implemented only in experiments. Treat them as progressive enhancement: ordinary content and core interaction must continue to work when the selector is unsupported.

## Supplied names explained

- **`:blank`** — This name has two distinct specifications: the experimental form-control pseudo-class matches an empty input/textarea value, while the paged-media pseudo-class matches a blank printed page under `@page`. It is not a general whitespace-only element test and has no broad implementation support for the form-control form.
- **`:current`** — Temporal media pseudo-class for the element being presented (or its applicable ancestor) in a timed sequence, such as WebVTT cues. `:past` and `:future` are defined relative to this current timed item.
- **`:local-link`** — Matches a link whose absolute URL is the same as the current document URL. It is not a test for same-origin or same-site destinations; MDN reports no browser support.
- **`:target-current`** — Matches the active `::scroll-marker` pseudo-element in a scroll-marker group that is currently scrolled to. It is not the URL-fragment `:target` state.
- **`:target-within`** — A formerly defined pseudo-class for an element that is a fragment target or contains one; it was removed from the specification. The proposed replacement is `:has(:target)`, whose support must itself be checked.
- **`:xr-overlay`** — Matches an element participating in an immersive XR overlay context. It has no meaningful effect outside supported immersive presentation environments.

## Cross-item comparison

The form-control `:blank` checks empty input value, while `:empty` checks an element's child-node state; the paged-media `:blank` selects blank pages. `:current` is temporal media state, while `:target-current` marks the active generated scroll marker and `:target` is the URL-fragment state. `:local-link` means a link to the same document. `:xr-overlay` is a specialized environment state, not a general overlay/popover selector.

## Examples

Because these entries have limited or unsettled support, keep the baseline independent of them. A guarded enhancement can use feature queries:

```css
/* Baseline remains useful even when the selector is unsupported. */
.empty-message { display: block; }

@supports selector(:blank) {
  .empty-message:blank { opacity: 0.7; }
}
```

The exact feature-query behavior should be verified in the browsers being targeted; a fallback class or application-managed state may be more reliable.

## Common mistakes

- Equating experimental catalog status with broad implementation support.
- Treating `:blank` as a drop-in replacement for `:empty` without checking whitespace and element behavior.
- Using `:local-link` as an authorization or trust signal.
- Confusing `:target-current` with the ordinary fragment selector `:target`.
- Building essential user feedback only with temporal or XR-specific selectors.

## Knowledge checks with answers

1. **Does `:current` mean the selected navigation link?** No; it is for the current item in a time-based presentation context.
2. **Can `:local-link` establish that a destination is safe?** No; same-site relationships do not establish trust or authorization.
3. **How should an experimental selector be introduced?** Preserve a complete baseline, verify target support, and add the selector as an optional enhancement with a fallback.
