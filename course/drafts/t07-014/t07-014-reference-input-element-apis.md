<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: HTMLInputElement attributes, methods, and events

# Scope and version

This reference covers the assigned `HTMLInputElement` IDL properties, methods, and events from the current WHATWG HTML Living Standard. Property support and applicable input states vary; unsupported selection/picker operations can throw. See [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), and [MDN HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).

# How this group fits the mental model

The DOM interface exposes live control state and operations. Reflected properties may read/write content attributes, while value/checked properties can represent live user state distinct from their defaults. Methods can step values, inspect validity, show pickers, or manipulate text selection.

# Supplied names explained

- `accept` — Reflected file-type chooser hint for file inputs. It does not validate file contents.
- `alpha` — Current color input property reflecting alpha-channel selection. Browser support for the associated feature can vary.
- `alt` — Alternative text for image submit inputs.
- `autocomplete` — Reflected autofill hint/token string for the input.
- `capture` — Reflected HTML Media Capture hint, relevant to file inputs; `user` and `environment` request front- or outward-facing media capture when supported. It does not itself access a camera or guarantee a capture UI.
- `defaultChecked` — Reflects the input's default checkedness from markup/attribute; distinct from current `checked` after interaction.
- `checked` — Current checkbox/radio checkedness. Setting it changes the live state; it does not necessarily rewrite default checkedness.
- `colorSpace` — Current color input property for color-space behavior/serialization where supported.
- `dirName` — Reflected directionality-submission attribute name.
- `disabled` — Current disabled state, generally removing the control from interaction, validation candidacy, and successful submission.
- `form` — Read-only reference to the owning form, determined by ancestor or explicit `form` association; may be `null`.
- `files` — `FileList` of selected files for file inputs, or `null` when not a file input. User agent security prevents setting arbitrary local file paths.
- `formAction` — Resolved URL of submitter-specific action override.
- `formEnctype` — Submitter-specific body encoding override.
- `formMethod` — Submitter-specific submission method override.
- `formNoValidate` — Boolean indicating validation bypass for this submitter.
- `formTarget` — Submitter-specific response navigable target.
- `height` — Image submit input height.
- `indeterminate` — Script-set checkbox visual/state property independent of checkedness. It does not affect the submitted value and is not a third checked value.
- `list` — Read-only reference to the associated datalist, or `null` when no valid datalist is associated.
- `max` — Reflected upper bound string for applicable numeric/date/time states.
- `maxLength` — Reflected maximum text length in code units for applicable states; assigning invalid values can raise an exception according to the IDL rules.
- `min` — Reflected lower bound string for applicable states.
- `minLength` — Reflected minimum text length for applicable states.
- `multiple` — Boolean state allowing multiple selected files in the File Upload state or a comma-separated list of email addresses in the Email state. It does not apply to an input state that selects options; `<select multiple>` is a separate element feature.
- `name` — Reflected field name used by form submission and form named access.
- `pattern` — Reflected pattern string used for constraint validation on applicable text states.
- `placeholder` — Reflected empty-value hint; not a label.
- `readOnly` — Reflected read-only state for applicable text-entry types. It does not make the value trustworthy.
- `required` — Reflected required constraint.
- `size` — Reflected UI size hint for applicable text controls.
- `src` — Resolved source URL for image submit input.
- `step` — Reflected step string for applicable numeric/date/time controls.
- `type` — Reflected current input state. Setting can change available value semantics and clear/transform state according to type-change rules.
- `defaultValue` — Reflects the value attribute/default value. Current `value` may differ after user edits.
- `value` — Current value string. For file inputs, setting it to an empty string can clear selection but cannot choose an arbitrary file path. For checkbox/radio, it is the submitted value, not checkedness.
- `valueAsDate` — Gets/sets a Date representation for supported date/time-like states; returns `null` when empty or not representable. It is not supported for every type (notably `datetime-local`) and timezone conversion must be understood.
- `valueAsNumber` — Gets/sets the value as a number for numeric/date-time states; empty or invalid values generally map to `NaN`. Units depend on type (for date/time types often milliseconds relative to a defined epoch).
- `width` — Image submit input width.
- `stepUp()` — Increments an applicable control by its step (or supplied count). It can throw when the type/state cannot step or step is `any`; constraints and bounds affect results.
- `stepDown()` — Decrements an applicable control by its step (or supplied count), with the same applicability and exception considerations as `stepUp()`.
- `willValidate` — Read-only validation-candidate flag for the current input state.
- `validity` — Read-only `ValidityState` describing constraint failures.
- `validationMessage` — User-agent/localized message for the current validity state.
- `checkValidity()` — Returns whether the input is valid and fires `invalid` if not; does not itself present interactive browser UI.
- `reportValidity()` — Checks and requests browser reporting for an invalid input unless the event is canceled.
- `setCustomValidity()` — Sets/clears the custom error string; clear with an empty string.
- `labels` — Read-only `NodeList` of labels associated with this input, including explicit and implicit associations.
- `select()` — Selects the text in supported text-entry controls; not applicable to every input state.
- `selectionStart` — Start offset of selected text/caret for supported text-selection input states. Reading/writing unsupported types can throw.
- `selectionEnd` — End offset of selected text/caret for supported text-selection input states.
- `selectionDirection` — Direction (`forward`, `backward`, or `none`) of the current text selection where supported.
- `setRangeText()` — Replaces a range of text in a supported text-entry control and updates selection according to an optional selection mode. Unsupported types can throw.
- `setSelectionRange()` — Sets selection start/end/direction for supported text-entry types; throws for unsupported states.
- `showPicker()` — Opens a browser-provided picker for applicable types (date/time/color/file, depending on platform). It generally requires transient user activation and can throw when unsupported, disabled/readonly, or called in a disallowed context.
- `input event` — Fires as the user changes a value through interaction for controls that support it. Programmatically assigning `.value` does not itself fire `input`; dispatching a synthetic event is not equivalent to trusted user input.
- `change event` — Fires when a value change is committed according to that control's interaction model, often on blur/selection/commit rather than every keystroke. Exact timing differs by control type.

# Cross-item comparison

`defaultValue`/`defaultChecked` represent reset defaults; `value`/`checked` expose current state. `valueAsNumber` and `valueAsDate` convert typed values when meaningful but do not replace the canonical string serialization. `input` reflects ongoing edits; `change` reflects a committed change according to the control. Selection APIs apply only to text-selectable types; `showPicker()` is a privileged user-facing operation with activation and state requirements.

# Examples

```js
const quantity = document.querySelector('#quantity')
quantity.stepUp()
if (!quantity.checkValidity()) {
  quantity.reportValidity()
}

const fileInput = document.querySelector('#upload')
console.log([...fileInput.files].map(file => file.name))
```

For custom text errors:

```js
email.setCustomValidity(isAllowed(email.value) ? '' : 'Enter an allowed address.')
```

# Common mistakes

- Treating `defaultValue` as the user's current entry or `value` as the reset default.
- Assuming `.value = ...` dispatches `input`/`change` events.
- Confusing checkbox `value` with `checked`.
- Treating `indeterminate` as a submitted third state.
- Calling selection methods on number/date/email inputs without checking applicability.
- Calling `showPicker()` outside a user gesture or while disabled.
- Assuming `files` lets script read arbitrary disk paths.
- Using `valueAsDate` for `datetime-local` or ignoring timezone conversion.

# Knowledge checks with answers

1. What is the difference between `defaultChecked` and `checked`? **Reset default versus current live checkedness.**
2. Does setting `.value` fire an `input` event? **No.**
3. Does `indeterminate` change submitted checkbox data? **No; submitted data still depends on checkedness.**
4. What does `showPicker()` generally require? **A supported control and an allowed context, commonly transient user activation.**
5. Which API changes text selection? **`setSelectionRange()` or `setRangeText()` on supported text-entry states.**
6. What can make `showPicker()` throw even for a supported input type? **The input may be immutable, the call may lack transient user activation, or the document may be in a disallowed cross-origin context (with the standard's historical file/color exceptions).**

Sources: [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).
