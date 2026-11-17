<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Form elements, controls, and related elements

# Scope and version

This reference follows the WHATWG HTML Living Standard last updated 2026-11-14. `<selectedcontent>` and newer button invoker attributes belong to the current standard; browser support can lag the standard, so feature-test before relying on newer presentation behavior. See [form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [forms](https://html.spec.whatwg.org/multipage/forms.html), and [form-associated custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face-example).

# How this group fits the mental model

These elements create form ownership, data entry, labels, grouping, suggestions, and output/status semantics. “Form-associated” is a specific standard category, not a synonym for “useful in a form”: for example, `<selectedcontent>` is part of customizable-select presentation, while `<meter>` and `<progress>` display values and are not form-associated controls.

# Supplied names explained

- `<button>` — Activatable button with `submit`, `reset`, or `button` type. Inside a form, omitted/invalid type defaults to submit; set `type="button"` for a non-submitting control. Submit buttons can carry a submitted name/value and override form submission attributes. Current `command`/`commandfor` support declarative invoker commands in addition to form use.
- `<datalist>` — Supplies suggested options to an input through its `list` attribute. It does not restrict input to those suggestions and is not a replacement for a select when choices must be enumerated.
- `<fieldset>` — A listed, form-associated grouping element. It groups related controls and can be disabled as a group; a disabled fieldset generally disables descendants except descendants of its first `<legend>` child. Its `name` can identify it in the form and `form.elements` collections, but the fieldset itself does not contribute an entry to the submitted form data.
- `<form>` — Form submission owner with action, method, encoding, target, name, validation policy, and related attributes. Controls can belong by ancestry or a `form` attribute, even when rendered elsewhere in the DOM.
- `<input>` — Versatile single-control element whose `type` selects its state, UI, validation, value model, and submission behavior. Its `name` is used in the entry list; its `id` commonly associates a label.
- `<label>` — Associates caption text with a labelable control by explicit `for`/`id` or implicit nesting. Activating label text focuses/activates the labeled control. Do not nest unrelated interactive content inside it.
- `<legend>` — Caption for a `<fieldset>` grouping. The first legend child labels the fieldset and has special behavior for disabled fieldset descendants.
- `<meter>` — Displays a scalar measurement within a known range, such as disk usage. It is not a task-completion progress indicator; use `<progress>` for that.
- `<object>` — Embeds an external resource and is a listed form-associated element; it can be associated with a form and appears in its controls collection. Its primary purpose is embedded content, so it is not a substitute for ordinary data-entry controls.
- `<optgroup>` — Groups `<option>` items inside a select, often with a label and optional disabled state. It supports organization, not a nested form data object.
- `<option>` — Choice in `<select>` or suggestion within `<datalist>`. In a select, selectedness/value/label determine interaction and submitted entries. Without explicit value, text-derived value rules apply.
- `<output>` — Represents the result of a calculation or user action and may associate with controls via `for`. It is form-associated, listed, and labelable, but its name and value are not submitted with the form.
- `<progress>` — Shows task completion, with `value` and `max`; omit value for indeterminate progress. It communicates progress, not a measurement within a fixed domain.
- `<select>` — Selects one or multiple options, with behavior influenced by `multiple`, `size`, option selectedness, and current customizable-select features. Selected values participate in submission when the control is successful.
- `<selectedcontent>` — Element used with customizable-select presentation to display cloned content from the selected option inside the select's button. It is not a standalone replacement for `<option>` or a form-associated control; support/styling needs browser verification.
- `<textarea>` — Multiline text control. Its initial value comes from text content/default value, unlike `<input>`'s `value` attribute. `rows`, `cols`, `wrap`, and length constraints affect presentation/submission/validation.
- `form-associated custom elements` — Autonomous custom elements opt into native form behavior with `static formAssociated = true` and call `this.attachInternals()` once to obtain `ElementInternals`. The internals expose the form owner, labels, validation state/APIs, and `setFormValue(value, state?)` / `setValidity(flags, message, anchor?)`. The component implements form lifecycle callbacks when it needs to react to reassociation, disabled state, reset, or state restoration; ordinary custom elements do not automatically act as native controls.

# Cross-item comparison

`<input>`, `<select>`, and `<textarea>` are data-entry controls. `<button>` initiates an action; `<label>`, `<fieldset>`, and `<legend>` explain controls; `<datalist>` offers suggestions without enforcing them. `<output>`, `<progress>`, and `<meter>` communicate results/status/measurements; none contributes its displayed value to ordinary form submission. A form-associated custom element extends native control behavior only when its author implements the association contract.

# Examples

```html
<form id="booking" action="/bookings" method="post">
  <fieldset>
    <legend>Contact details</legend>
    <label>Email <input name="email" type="email" autocomplete="email" required></label>
  </fieldset>
  <label>Guests
    <select name="guests">
      <option value="1">One</option>
      <option value="2">Two</option>
    </select>
  </label>
  <button type="submit">Book</button>
</form>
```

# Common mistakes

- Forgetting that a button inside a form defaults to submitting.
- Using `<meter>` for task completion or `<progress>` for a static measurement.
- Treating a datalist as a whitelist.
- Using placeholder text instead of a label.
- Assuming every form-associated control must be a descendant of the form.
- Depending on `<selectedcontent>` presentation without checking target browser support.

# Knowledge checks with answers

1. What is `<datalist>` for? **Suggestions, not an enforced choice list.**
2. Which element describes a task's completion? **`<progress>`.**
3. What is special about the first `<legend>` in a disabled fieldset? **Its descendants are exempt from the disabled fieldset's descendant disabling rule.**
4. How can a control outside the form subtree be associated? **Use its `form` attribute with the form's ID.**
5. What lets a custom element participate in native form behavior? **The form-associated custom element opt-in and `ElementInternals` implementation.**
6. Does a named `<output>` contribute its displayed value to submitted form data? **No. It can be associated with a form and listed by form APIs, but its value is not submitted.**
7. Is `<selectedcontent>` a form-associated control? **No. It presents selected option content as part of customizable-select UI.**

Sources: [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face-example).
