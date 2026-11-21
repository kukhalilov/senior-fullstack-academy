# CSS selectors at-rules cascade values and box model — Reference: Experimental pseudo-classes in the pinned MDN index

## Scope and version

This lesson covers names categorized as experimental in the pinned [MDN selectors inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json). Their specifications have different statuses: some are defined in an editor draft, some are at risk or experimental, and one was removed. The [current MDN pseudo-class index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes) is a discovery index, not a promise of shipping support. Sources and browser status were checked on 2026-11-19.

## How this group fits the mental model

These selectors extend structural, navigational, temporal, or immersive-state matching. Their syntax may be standardized, proposed, or implemented only in experiments. Treat them as progressive enhancement: ordinary content and core interaction must continue to work when the selector is unsupported.

## Supplied names explained

- **`:blank`** — The form-control form is an experimental selector for empty user-input controls; its proposed rules account for controls that submit no value when unchecked and exclude action buttons. The paged-media `@page :blank` form selects a blank printed page. These are separate contexts; neither is a general whitespace-only element test. MDN reports no browser support for the form-control form, and the Selectors draft marks the feature at risk.
- **`:current`** — Temporal pseudo-class for an element currently presented (or an applicable ancestor) in a host-language-defined timeline, such as WebVTT cue playback. `:past` and `:future` refer to timed items entirely before or after it. Without a timeline supplied by the host language, these selectors do not match.
- **`:local-link` and `:local-link(n)`** — The no-argument form matches a hyperlink whose absolute target URL equals the current document URL after fragment identifiers are removed. The draft functional form accepts a non-negative path depth: `:local-link(0)` compares origins, while larger numbers also require matching path segments. This is a proposed URL relationship test, not a trust or authorization check; MDN reports no browser support.
- **`:target-current`** — Matches the active scroll marker in its scroll-marker group. A marker can be a generated `::scroll-marker` or an element designated through `scroll-target-group`; this is not the URL-fragment `:target` state. The related `:target-before` and `:target-after` names are listed in the adjacent current-index inventory.
- **`:target-within`** — A formerly defined pseudo-class for an element that is a fragment target or contains one; it was removed from the specification. A replacement that includes both the target itself and its ancestors is `:is(:target, :has(:target))`; its support must itself be checked.
- **`:xr-overlay`** — Matches the DOM overlay element for the duration of an immersive AR/VR session that uses the WebXR DOM Overlays feature. It does not mean any element participating in an XR scene; support depends on the WebXR environment.

## Cross-item comparison

The form-control `:blank` checks a control value, while `:empty` checks an element's children; the paged-media `:blank` selects blank pages. `:current` is a host-language timeline state, while `:target-current` marks the active scroll marker and `:target` follows the URL fragment. Bare `:local-link` matches the exact document URL after fragments are ignored; `:local-link(n)` expresses progressively broader path matching. `:xr-overlay` targets the WebXR DOM overlay element, not an arbitrary overlay or popover.

## Examples

Because these entries have limited or unsettled support, keep the baseline independent of them. A guarded enhancement can use feature queries:

```css
/* Baseline styling does not depend on :blank. */
textarea { border-color: gray; }

/* Illustrative only: MDN currently reports no browser support. */
@supports selector(textarea:blank) {
  textarea:blank { border-color: darkorange; }
}
```

`:blank` is form-control-specific, so it cannot match a `div` or arbitrary empty element. A feature query checks whether the selector syntax is accepted; it does not guarantee a useful implementation or matching behavior. Keep a complete fallback, and use application-managed state when empty-control feedback is required today.

## Common mistakes

- Equating experimental catalog status with broad implementation support.
- Treating `:blank` as a drop-in replacement for `:empty` without checking whitespace and element behavior.
- Using `:local-link` as an authorization or trust signal.
- Confusing `:target-current` with the ordinary fragment selector `:target`.
- Building essential user feedback only with temporal or XR-specific selectors.
- Treating `:target-current` as limited to generated pseudo-elements; authored marker elements can also match when designated by the scroll-marker model.
- Assuming `@supports selector(:blank)` proves that the selector has interoperable behavior.

## Knowledge checks with answers

1. **Does `:current` mean the selected navigation link?** No; it is for the current item in a time-based presentation context.
2. **Can `:local-link` establish that a destination is safe?** No; same-site relationships do not establish trust or authorization.
3. **How should an experimental selector be introduced?** Preserve a complete baseline, verify target support, and add the selector as an optional enhancement with a fallback.
4. **Can `:blank` style an arbitrary empty container?** No. Its form-control form is for user-input controls; the separate paged-media form is used with `@page`.
5. **What does `:local-link(0)` mean in the Selectors Level 5 draft?** It matches a link target with the same URL origin; it does not prove that the target is safe.
6. **Does `@supports selector(textarea:blank)` guarantee that a browser implements the intended matching?** No. It checks syntax support, not the quality or interoperability of the behavior.

### Full syntax inventory

- `:blank` (form-control and paged-media contexts)
- `:current`
- `:local-link`
- `:local-link(n)`
- `:target-current`
- `:target-within`
- `:xr-overlay`
