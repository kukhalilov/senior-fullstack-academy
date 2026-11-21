# CSS selectors at-rules cascade values and box model — Reference: Standard pseudo-classes

## Scope and version

The assigned names come from the pinned MDN data inventory in the [manifest](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json), checked against [Selectors Level 4](https://www.w3.org/TR/selectors-4/), the [HTML Living Standard](https://html.spec.whatwg.org/multipage/semantics-other.html#pseudo-classes), the [CSS Pseudo-Elements draft](https://drafts.csswg.org/css-pseudo-4/), and [MDN's current pseudo-class index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes) on 2026-11-19. A name being specified does not guarantee interoperable browser support. Experimental and newer index additions are covered in the adjacent experimental/current-index lessons.

## How this group fits the mental model

Pseudo-classes select existing elements based on link state, user interaction, form state, document structure, shadow-DOM context, media playback, or navigation transitions. They do not create a new DOM node. Most can be combined with ordinary selectors; several accept arguments whose grammar affects matching and specificity. State may change without a DOM mutation, so browser DevTools and accessibility behavior matter.

## Supplied names explained

### Interaction, links, and forms

- `:active` applies during the host language's activation behavior and, for CSS boxes, while a pointing device is held down. It is transient; keyboard activation details depend on the host language and browser.
- `:any-link` matches links with `href`, whether visited or not.
- `:autofill` matches a form control whose value was populated by the browser; styling can be constrained by browser privacy and UA rules.
- `:checked` matches checked checkboxes/radios and selected options where applicable.
- `:default` matches the form control that is the default in its group/form, such as a default submit button or initially selected option.
- `:disabled` matches controls disabled by their own state or applicable ancestor semantics; `:enabled` matches enabled controls that support disabledness.
- `:focus` matches the element receiving focus; `:focus-visible` applies when the UA determines a visible focus indication is appropriate; `:focus-within` also matches an ancestor containing the focused element.
- `:hover` matches while a pointing device indicates hover; touch devices may have no useful persistent hover state.
- `:in-range` and `:out-of-range` match range-constrained controls whose current value is respectively within or outside the constraint.
- `:indeterminate` matches controls in an indeterminate state, such as a checkbox set through script or a radio group with no selected member.
- `:invalid` / `:valid` reflect constraint-validation state; `:user-invalid` / `:user-valid` additionally depend on user interaction timing as defined by the UA.
- `:optional` / `:required` reflect whether a supported form control has the required constraint.
- `:placeholder-shown` matches an input/textarea currently displaying its placeholder rather than a value.
- `:read-only` / `:read-write` reflect whether the user can edit the element under HTML/CSS editing rules; they are not substitutes for authorization.
- `:visited` matches visited links, but browsers restrict which styles and information can be exposed to prevent history sniffing; use only privacy-safe color-like styling.
- `:link` matches a link that has not been visited; together with `:visited`, it represents the two privacy-constrained history states of a link.
- `:open` matches elements currently in an open state where the pseudo-class applies, including relevant native disclosure, picker, and popover interfaces.
- `:popover-open` matches an element whose popover is showing.

### Document structure and relationships

- `:root` matches the document root element (the `html` element in HTML).
- `:empty` matches an element with no element or non-empty content-node children; comments do not count. Selectors Level 4 allows document-whitespace-only text, while deployed engines and older guidance have differed, so test whitespace-only cases in target browsers.
- `:first-child`, `:last-child`, and `:only-child` test position among element siblings.
- `:first-of-type`, `:last-of-type`, and `:only-of-type` test position among siblings of the same element type.
- `:nth-child()` and `:nth-last-child()` select positions among element siblings from the beginning/end. Their `An+B` formula supports forms such as `odd`, `even`, `3n+1`, and `-n+3`; the optional `of <selector-list>` filters which siblings are counted before positions are assigned.
- `:nth-of-type()` and `:nth-last-of-type()` count only same-type siblings from the beginning/end.
- `:is()` matches any argument selector and takes the maximum argument specificity; its forgiving selector list can ignore invalid arguments.
- `:where()` matches like `:is()` but contributes zero specificity, including its arguments.
- `:not()` matches elements not matched by its selector list; its specificity is the maximum argument specificity, not an extra pseudo-class weight.
- `:has()` matches an element when a relative selector anchored to it finds a qualifying related element; nested `:has()` and pseudo-elements as arguments are invalid unless another specification explicitly permits one. Selectors can express ancestor/relationship conditions; keep them understandable and measure performance in the actual page rather than assuming every `:has()` is slow.
- `:scope` represents the scoping root for a selector evaluation; its identity depends on the API or stylesheet context.
- `:dir()` matches based on resolved text direction (`ltr` or `rtl`), including inherited directionality.
- `:lang()` matches based on language information, including language-range matching and inherited language context.
- `:target` matches the element identified by the document URL fragment.
- `:defined` matches custom elements after definition and elements that are not unresolved custom elements.
- `:state()` matches a custom element's exposed custom state when the element uses the corresponding custom-state mechanism; it is not a general attribute query.

### Shadow DOM, fullscreen, and document UI

- `:host` matches a shadow host from within its shadow tree; it only has meaning in a shadow context.
- `:host()` matches a shadow host that also matches the supplied selector argument.
- `:host-context()` was historically used in shadow stylesheets to match a host based on it or an outside ancestor, but it has been removed from the current CSS Shadow Module draft. Treat it as legacy, check target-engine support, and prefer inherited custom properties or explicit component attributes for theming.
- `:has-slotted` matches a `<slot>` with assigned content rather than fallback content; even one assigned whitespace text node is enough. It applies in stylesheets in a shadow tree and has limited browser availability.
- `:fullscreen` matches an element currently presented in fullscreen mode.
- `:modal` matches a dialog or other element currently in a modal state, such as a modal dialog opened with the relevant platform API.

### Media playback and view transitions

- `:buffering` matches a playable element that cannot continue because it is obtaining media data; it still matches `:playing` while buffering.
- `:muted` matches a media element whose audio is muted.
- `:paused`, `:playing`, `:seeking`, and `:stalled` match the corresponding media playback conditions; they are stateful and may change asynchronously. `:stalled`, like `:buffering`, can also match while `:playing` matches.
- `:volume-locked` matches media whose volume is not user-adjustable through the usual controls.
- `:picture-in-picture` matches an element currently presented in picture-in-picture mode.
- `:active-view-transition` matches the document while a view transition is active.
- `:active-view-transition-type()` matches an active transition having one of the specified transition types; argument matching uses the transition type identifiers.
- `:current` matches the current item, or its relevant ancestors, in time-based content such as WebVTT cue trees.
- `:future` matches items after the current item in that time-based context.
- `:past` matches items entirely before the current item in that time-based context.
- `:first` matches the first page in paged media; it does not mean the first DOM child. The companion [experimental pseudo-class reference](t07-016-reference-experimental-pseudo-classes.md) covers the separately inventoried `:blank` page and input variants.
- `:left` and `:right` select left/right page boxes in paged media, with interpretation tied to page progression and writing direction.

## Cross-item comparison

Use `:is()` to reduce repeated selector lists while retaining the most specific argument's weight; use `:where()` when the same match should be easy to override. Use `:nth-child(... of S)` when counting among a filtered set; `:nth-of-type()` always filters by element type. `:focus` expresses focus itself; `:focus-visible` expresses the UA's focus-indication heuristic. Form validity pseudo-classes reflect constraint validation, while `:user-valid` and `:user-invalid` avoid presenting a result as user-confirmed before interaction. `:active` is pointer/keyboard activation state, not a permanent selected state. `:host*` and `:has-slotted` require shadow-tree context. Media and transition pseudo-classes represent live platform state rather than stable document structure. `:buffering` and `:stalled` can overlap `:playing`; `:host-context()` is legacy because it was removed from the current CSS Shadow draft.

## Examples

```css
/* Low-specificity defaults are straightforward to override. */
:where(.form) :is(input, select, textarea) { inline-size: 100%; }

/* Count only enabled rows while targeting the third one. */
tr:nth-child(3 of :not([hidden])) { font-weight: 700; }

/* Relational matching: highlight a field wrapper containing an invalid control. */
.field:has(:user-invalid) { border-inline-start: 0.25rem solid crimson; }

/* A media-state selector is a visual cue, not a replacement for controls. */
video:playing { outline-color: green; }
```

The examples illustrate selector mechanics. Provide equivalent text, focus, and status cues where the styling communicates state; do not rely on color alone.

## Common mistakes

- Treating pseudo-classes as if they insert or expose a DOM node.
- Assuming `:empty` ignores whitespace-only text nodes.
- Forgetting `:is()` and `:not()` take argument-list specificity while `:where()` has zero specificity.
- Confusing position among all siblings with position among same-type siblings.
- Using `:visited` to reveal history or styling properties beyond browser-permitted privacy-safe values.
- Assuming every media, view-transition, shadow, or newer form pseudo-class is available in every browser; check compatibility, especially for `:has-slotted` and draft additions.
- Using `:has()` without considering readability; measure actual performance instead of assuming its cost from syntax alone.
- Treating client-side validity or disabled styling as server-side validation or authorization.

## Knowledge checks with answers

1. **Does `:where(.a, #b)` add ID specificity?** No; `:where()` contributes zero specificity for itself and its arguments.
2. **What does `:nth-child(2 of .item)` count?** The second sibling matching `.item`, not necessarily the second child overall. `:nth-child(-n+3)` selects the first three element siblings.
3. **Can a page read which links match `:visited` to reconstruct browser history?** Browsers restrict observable visited styling to prevent this privacy leak.
4. **What context is required for `:host`?** A shadow tree stylesheet matching its host.
5. **Is `:disabled` an authorization check?** No. It affects interaction/presentation; enforce access and validation on trusted application/server boundaries.
6. **Do `:buffering` and `:playing` exclude one another?** No. A playable element can match both while it buffers.
7. **Does `:host-context()` remain in the current CSS Shadow draft?** No. It was removed; treat existing implementations as legacy and use explicit theming inputs such as inherited custom properties.
8. **Does the current `:empty` definition permit whitespace-only text?** Selectors Level 4 permits document-whitespace-only children, though browser behavior has historically differed; check compatibility for the target engines.
