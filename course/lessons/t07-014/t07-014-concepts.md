
# HTML forms controls validation and form submission — Core concepts and how they fit together

# Learning objectives

You should be able to design labeled native forms, select appropriate input states and attributes, explain constraint validation and its limitations, predict which controls enter the submission entry list, choose a method and encoding, and distinguish `submit()` from `requestSubmit()`.

# Prerequisites

Know basic HTML elements/attributes, browser events, HTTP GET and POST, DOM objects, and the difference between client-side convenience checks and server-side trust.

# Core concepts

**A form is a submission owner.** A `<form>` groups controls and defines submission settings. Controls can be associated with a form through ancestry or a `form` attribute referencing the form's ID, so visual nesting and form ownership are not always the same. A control's `name` is central to submission; `id` supports label association and scripting, not the submitted field name.

**Semantic controls describe intent.** `<input>` provides many type states; `<select>`, `<textarea>`, and buttons serve distinct interaction models. `<fieldset>` and `<legend>` communicate related controls. `<label>` gives a control an accessible name and a larger activation target. `datalist` supplies suggestions but does not constrain values to its options. `output`, `progress`, and `meter` represent results/status/measurements rather than ordinary submitted fields.

**Type, autofill, and keyboard are distinct.** The input `type` selects control semantics, keyboard, and browser validation rules. `autocomplete` describes the data concept such as email, name, shipping, or billing so autofill can help. `inputmode` hints the virtual keyboard on touch devices. `type=tel` does not validate a telephone number; `type=email` provides syntax validation, not proof of a deliverable mailbox.

**Constraint validation is browser assistance.** Attributes such as `required`, `pattern`, `min`, `max`, `step`, `minlength`, and `maxlength` set constraints. `ValidityState` reports which constraint is violated; `checkValidity()` tests and dispatches `invalid` events, while `reportValidity()` also presents browser feedback. `setCustomValidity('')` clears a custom error; any nonempty message keeps the control invalid. `novalidate` on a form or `formnovalidate` on a submitter bypasses interactive validation. Server validation is still required.

**Successful controls become entries.** The browser constructs an ordered entry list from controls that are successful for that submission. The current submitter matters. Unnamed or disabled controls are generally omitted; unchecked checkbox/radio controls are omitted; selected options and files are handled according to their control semantics. A submit button's `name=value` appears when that button is the submitter. `FormData(form, submitter)` can capture the same idea in script.

**Submission combines action, method, and encoding.** GET puts encoded entries into the URL and is appropriate for safe/idempotent retrieval, not secrets or state changes. POST sends data in the body. `application/x-www-form-urlencoded` is the usual default; `multipart/form-data` is appropriate for files; `text/plain` is mainly useful for debugging. A button/input submitter can override form settings through `formaction`, `formmethod`, `formenctype`, `formnovalidate`, and `formtarget`.

**Programmatic submit APIs differ.** `requestSubmit()` behaves like activating a submit button: validation, submitter selection, submit event, and overrides apply. `submit()` directly submits and skips interactive validation and the submit event. `reset()` restores default values, not necessarily empty values; `form.reset()` can be shadowed if a control uses a conflicting name/id, so avoid names such as `reset` for controls.

# Mechanisms and relationships

The browser first identifies the form and submitter, applies validation rules unless bypassed, then builds the entry list and fires associated events. A `submit` event is a form-level event; `input` fires as a value is edited and `change` behavior depends on control/type and commitment. A `formdata` event lets script inspect/modify the entry list when FormData is constructed or native submission prepares data. Cancelling `submit` prevents default navigation, but a script must then handle errors, pending state, and successful completion.

Attributes can apply at multiple layers. Form-level `method`/`action` establish defaults; the submitter can override selected parts. `disabled` removes a control from interaction and submission and usually from validation; `readonly` prevents user editing but preserves submission and has different validation behavior. `aria-required` communicates semantics to assistive technology but does not impose native required validation.

# Worked examples

```html
<form action="/search" method="get">
  <label for="query">Search products</label>
  <input id="query" name="q" type="search" required>
  <button type="submit" name="scope" value="all">Search all</button>
  <button type="submit" name="scope" value="saved" formaction="/saved-search">
    Search saved items
  </button>
</form>
```

The activated button is the submitter; its `scope` value is included and the second button overrides the action. The browser's GET submission is visible in the URL and should not carry secrets.

# Misconceptions and edge cases

- “A label's `id` is submitted.” Submission uses `name=value` entries.
- “Every visible field is submitted.” Successful-control rules omit many controls, including disabled and unchecked controls.
- “Client validation makes input trustworthy.” Requests can be forged or browser checks bypassed.
- “`readonly` and `disabled` are equivalent.” Readonly values are usually submitted; disabled controls generally are not.
- “`submit()` is a scripted version of clicking the button.” Use `requestSubmit()` for validation/events/submitter semantics.
- “`type=email` validates real email ownership.” It checks a browser-defined syntax constraint only.
- “Placeholder text is a label.” It disappears and is not a reliable accessible name.
- “`datalist` enforces an allowed list.” It suggests values; it does not validate membership.

# Knowledge checks with answers

1. What identifies a submitted field? **Its `name`, subject to successful-control rules.**
2. What does `requestSubmit()` preserve that `submit()` skips? **Interactive validation, the submit event, and submitter behavior.**
3. Does `aria-required` create native validation? **No; use the `required` attribute for native constraint validation.**
4. Which encoding is typically used for file uploads? **`multipart/form-data`.**
5. Does `maxlength` replace server length validation? **No.**

Sources: [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation), [HTMLFormElement requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit).
