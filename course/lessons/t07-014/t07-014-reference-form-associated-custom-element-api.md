
# HTML forms controls validation and form submission — Reference: Form-associated custom element APIs

# Scope and version

This reference explains the current form-associated custom element hooks and form-specific `ElementInternals` API in the WHATWG HTML Standard. It covers browser form ownership, submission, validation, labels, disabled state, reset, and restoration. A custom element supplies those integrations only when the author opts in and implements the behavior. See [WHATWG custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html#form-associated-custom-elements), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), and [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals).

# How this group fits the mental model

A normal custom element is just an element from the form's point of view; it does not automatically submit a value or join native constraint validation. A form-associated custom element opts into the browser's form lifecycle, then uses `ElementInternals` as its bridge: one value for submission, optional state for restoration, validation flags/message, label associations, and lifecycle callbacks for changes the browser controls.

# Supplied names explained

- `static formAssociated = true` — Declares the custom element definition as form-associated. This enables form ownership and the related callbacks/internals behavior. It does not implement a usable control by itself.
- `HTMLElement.attachInternals()` — Call from the custom element instance (normally its constructor) to obtain its `ElementInternals`. A given element can attach its internals only once; calling it in an unsupported context or more than once throws.
- `ElementInternals.form` — Read-only current form owner, or `null` when the element has no owner. The `form` attribute can associate a form-associated custom element outside the form's DOM subtree.
- `ElementInternals.labels` — Read-only list of associated `<label>` elements. Label association does not create the component's internal accessible interaction automatically.

# Submission value and restored state

`ElementInternals.setFormValue(value, state?)` sets what the browser submits and, optionally, what it can later restore. `value` can be a string, `File`, `FormData`, or `null`; `null` means the custom element contributes no entry. A `FormData` value allows a component to contribute multiple name/value entries. The optional `state` can also be a string, `File`, `FormData`, or `null`; when omitted, the submission value also becomes the state.

Submission value and state can differ. For example, a date widget may accept `03/15/2019` as the user's representation (`state`) but submit normalized `2019-03-15` (`value`). The browser may later call `formStateRestoreCallback(state, mode)` with that state. Do not treat browser restoration or autofill as guaranteed.

# Constraint validation API

- `ElementInternals.setValidity(flags, message, anchor?)` sets the control's standard validation flags and message. Supported flags are `valueMissing`, `typeMismatch`, `patternMismatch`, `tooLong`, `tooShort`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, and `customError`. An empty flags object means valid. Supply a useful message when invalid; `anchor` is an optional internal element the browser may use to direct the user to the problem.
- `ElementInternals.willValidate` reports whether the host is a candidate for constraint validation.
- `ElementInternals.validity` exposes the host's `ValidityState` flags and aggregate `valid` property.
- `ElementInternals.validationMessage` exposes its current validation message.
- `ElementInternals.checkValidity()` checks the constraints and fires `invalid` if they fail; it does not itself request native feedback UI.
- `ElementInternals.reportValidity()` checks constraints and asks the user agent to report an invalid control unless the `invalid` event is canceled.

The host can take part in form validation, but the component author remains responsible for keeping validity synchronized with its internal value and clearing old errors when the value becomes valid.

# Form lifecycle callbacks

| Callback | When it runs | What the component should do |
| --- | --- | --- |
| `formAssociatedCallback(form)` | The browser changes the form owner; the argument is the new form or `null`. | Update any component behavior that depends on the current owner. |
| `formDisabledCallback(disabled)` | Effective disabled state changes, including through a disabled ancestor `<fieldset>`. | Disable/ignore the internal interactive control. The host already receives native disabled behavior; do not set its own `disabled` attribute inside this callback. |
| `formResetCallback()` | The owning form resets. | Restore the component's own default value/state; the platform cannot infer a component-specific default. |
| `formStateRestoreCallback(state, mode)` | The browser restores control state or applies autofill when it chooses to do so. | Restore the state. `mode` is `"restore"` for restoration or `"autocomplete"` for autofill. |

These are custom-element reactions queued by the browser. Avoid assuming they run at arbitrary intermediate points in another DOM algorithm.

# Cross-item comparison

`ElementInternals.form` and `labels` connect the host to the surrounding form and labels; `setFormValue()` and `setValidity()` connect component state to browser submission and validation. The four `form*Callback` hooks notify the component about owner, disabled, reset, and restoration changes. The submission value is the server-facing entry; the optional state is the browser-restorable representation. These functions provide platform integration, while keyboard behavior and accessible widget semantics remain component responsibilities.

# Examples

```js
class RatingInput extends HTMLElement {
  static formAssociated = true
  #internals
  #value = ""
  defaultValue = ""

  constructor() {
    super()
    this.#internals = this.attachInternals()
  }

  set value(value) {
    this.#value = value
    this.#internals.setFormValue(value)
    this.#internals.setValidity(value ? {} : { valueMissing: true }, value ? "" : "Choose a rating.")
  }

  formResetCallback() {
    this.value = this.defaultValue
  }

  formStateRestoreCallback(state, mode) {
    this.value = state
  }
}

customElements.define("rating-input", RatingInput)
```

This only sketches form plumbing. A real component needs a visible and programmatic label, role/state semantics, keyboard interaction, focus handling, and a way to update `value` when the user operates it. If `formDisabledCallback` is implemented, use it to keep internal controls in sync with effective disabled state.

# Common mistakes

- Assuming a custom element submits just because it has a `name` attribute; it must be form-associated and set a non-null submission value.
- Setting only the submitted value when the user's original representation needs to be restored later.
- Forgetting to clear validity flags after the user corrects a value.
- Expecting native form reset to reset private component state without `formResetCallback()`.
- Setting the host's own `disabled` attribute from `formDisabledCallback`, which can prevent a fieldset-disabled host from becoming enabled when the fieldset is re-enabled.
- Treating `formStateRestoreCallback` as a guaranteed autofill event.
- Assuming `ElementInternals.labels` gives the shadow-tree control its accessible name without implementing appropriate widget semantics.
- Assuming form association alone produces an accessible, keyboard-operable widget.

# Knowledge checks with answers

1. What must a custom element declare to opt in? **`static formAssociated = true`, then call `attachInternals()` on its instance.**
2. How can one custom element contribute more than one submitted entry? **Pass a `FormData` object to `setFormValue()`.**
3. Why pass a second argument to `setFormValue()`? **To preserve a restorable user state that can differ from the normalized value sent to the server.**
4. How does a component block native form submission for invalid data? **Set validity flags and a message with `setValidity()`; clear them when the value becomes valid.**
5. Which callback handles a disabled fieldset? **`formDisabledCallback(disabled)` receives the effective disabled-state change.**
6. Which callback handles a form reset? **`formResetCallback()`; the component restores its own default.**
7. What are the two `formStateRestoreCallback` modes? **`"restore"` and `"autocomplete"`.**
8. Does form association alone make the component accessible? **No. The author must still implement an accessible name/role/state, focus behavior, and keyboard interaction.**

Sources: [WHATWG custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html#form-associated-custom-elements), [WHATWG form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals), [MDN ElementInternals.setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue).
