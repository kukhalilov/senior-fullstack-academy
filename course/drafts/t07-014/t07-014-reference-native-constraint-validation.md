<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Constraint validation flags and APIs

# Scope and version

This lesson covers the native Constraint Validation API in the WHATWG HTML Living Standard, with MDN's current validation guide. Browser validation improves feedback but can be bypassed and must not be the server's trust boundary. See [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), and [MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation).

# How this group fits the mental model

Constraints are browser-computed facts about a control's current value and attributes. `ValidityState` tells which rule failed; validation methods ask whether submission is allowed and optionally present feedback. Form/submitter flags can bypass automatic interactive checks, but do not alter the underlying validity rules or server obligations.

# Supplied names explained

- `ValidityState.badInput` — The browser cannot convert the user's entered value into the control's expected value representation, as may occur while editing a numeric control.
- `ValidityState.customError` — True when a nonempty custom validity message was set with `setCustomValidity()`.
- `ValidityState.patternMismatch` — The value violates the `pattern` regular expression for a supported text-like input state. Pattern matching applies to the whole value under HTML semantics; modern pattern compilation uses the Unicode Sets `v` flag.
- `ValidityState.rangeOverflow` — A value exceeds the applicable `max` constraint for a type with range semantics.
- `ValidityState.rangeUnderflow` — A value is below the applicable `min` constraint.
- `ValidityState.stepMismatch` — A value does not align to the allowed step from the type's step base. `step="any"` disables the step constraint for applicable numeric/date-time states.
- `ValidityState.tooLong` — A user-entered value exceeds `maxlength` under the control's length rules, measured in UTF-16 code units. Programmatically assigned values do not necessarily trigger the flag; always enforce size on the server.
- `ValidityState.tooShort` — A user-entered value is shorter than `minlength` under the constraint rules, measured in UTF-16 code units. A custom script must not rely on this as the only length guard.
- `ValidityState.typeMismatch` — A nonempty value does not match the syntax expected by a type such as email or URL. It does not prove the address exists or URL is safe.
- `ValidityState.valid` — True if no applicable validity flag is failing. A control can be barred from validation; inspect `willValidate` when deciding what a validity result means.
- `ValidityState.valueMissing` — A required value/selection is missing for a control where `required` applies.
- `willValidate` — Indicates whether the control is a candidate for constraint validation. Disabled, readonly in applicable states, hidden/button states, and other barred-from-validation rules affect this.
- `validity` — Read-only `ValidityState` object for the control, exposing the individual failure flags and aggregate `valid` result.
- `validationMessage` — User-agent message for the current validation state, localized by the browser; it may be empty when valid or not a candidate.
- `checkValidity()` — Checks the element/form's validity and returns boolean. For invalid candidates it fires `invalid` events; it does not itself display the browser's validation UI.
- `reportValidity()` — Performs validity checking and, if invalid events are not canceled, asks the browser to present problem feedback. Returns whether all relevant candidates are valid.
- `setCustomValidity()` — Sets a custom error message on supported controls. Pass an empty string to clear it; any nonempty string keeps `customError` true and blocks validity.
- `required` — Requires a value, checked checkbox/radio group member, or select selection under type-specific rules. A required radio group needs an appropriate member checked.
- `pattern` — Regular-expression constraint for applicable text states. It is interpreted as a whole-value match and compiled with modern Unicode Sets semantics; escape punctuation required by the `v`-mode grammar. Provide a visible explanation rather than exposing an opaque pattern error.
- `min` — Lower numeric/date/time bound. It can cause `rangeUnderflow` and also participates in the step base when relevant.
- `max` — Upper numeric/date/time bound; values above it can cause `rangeOverflow`.
- `step` — Permitted increment. Misalignment can cause `stepMismatch`; `any` permits any representable value. Default steps vary by input type.
- `minlength` — Minimum UTF-16 code-unit length constraint for supported text values. Browser behavior has user-edit edge cases; validate canonical data on the server.
- `maxlength` — Maximum UTF-16 code-unit length constraint for supported text values. It may limit user entry but is not a storage/resource limit for attacker-controlled requests.
- `novalidate` — Form attribute skipping interactive constraint validation during native form submission. Script calls to `checkValidity()` still inspect constraints.
- `formnovalidate` — Submitter attribute that skips interactive constraint validation for that submission only.
- `invalid event` — Event fired at a control when it fails validity checks during validation. It does not bubble normally; use capture or handle per-control events when observing the form. Canceling it can suppress browser reporting behavior.

# Cross-item comparison

`checkValidity()` is a boolean/event check; `reportValidity()` adds user-agent feedback. `novalidate` and `formnovalidate` suppress automatic interactive checks on submission; they do not make controls valid or disable explicit APIs. `setCustomValidity()` creates a persistent custom failure until cleared. Attribute constraints, custom constraints, and server validation should agree on domain rules.

# Examples

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" required>
<button type="submit">Send</button>
```

For custom business feedback:

```js
const input = document.querySelector('#email')
input.setCustomValidity(isAllowedDomain(input.value) ? '' : 'Use your organization email address.')
form.reportValidity()
```

Recompute/clear the custom message when the value changes; otherwise a stale nonempty message continues to block submission.

# Common mistakes

- Treating browser validation as a security control.
- Forgetting to clear `setCustomValidity` with the empty string.
- Assuming `checkValidity()` displays the browser message.
- Assuming `novalidate` disables explicit calls to validity methods.
- Relying on type=email to prove mailbox ownership or type=url to authorize a destination.
- Assuming `invalid` bubbles like `submit`.
- Using a complex `pattern` without explaining the accepted format.
- Assuming minlength/maxlength cover server, encoding, and storage limits.

# Knowledge checks with answers

1. What makes `customError` true? **A nonempty custom validity message.**
2. Which method requests browser feedback? **`reportValidity()`.**
3. Does `novalidate` prevent `checkValidity()` from checking controls? **No.**
4. Does a valid email syntax prove mailbox ownership? **No.**
5. How do you clear a custom error? **Call `setCustomValidity('')`.**

Sources: [MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [WHATWG form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html).
