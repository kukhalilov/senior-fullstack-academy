<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Form, button, select, and textarea attributes

# Scope and version

This reference covers the assigned form/control attributes in the WHATWG HTML Living Standard. Attributes are state-specific; unsupported use may be ignored. New button command/popover attributes are part of current browser standards, but support and target behavior should be feature-tested. See [forms](https://html.spec.whatwg.org/multipage/forms.html), [form elements](https://html.spec.whatwg.org/multipage/form-elements.html), and [input](https://html.spec.whatwg.org/multipage/input.html).

# How this group fits the mental model

The form establishes defaults and owns controls. A submitter can override where/how submission happens. Select/option determine choices; textarea attributes define multiline editing and serialization. Some button attributes also invoke platform commands or popovers, independently of submitting.

# Supplied names explained

- `form.accept-charset` — Character encoding declaration for form submission. Current HTML permits UTF-8; modern forms should use UTF-8 rather than legacy encoding assumptions.
- `form.action` — URL that processes submission. The submitter's `formaction` can override it. An empty/missing action submits to the current document URL under browser rules.
- `form.autocomplete` — Form-level autofill hint, commonly on/off; controls can have their own autocomplete tokens. It is guidance and does not guarantee browser behavior.
- `form.enctype` — Encoding for POST form data: URL-encoded by default, `multipart/form-data` for files, and `text/plain` mainly for debugging. A submitter can override it.
- `form.enctype=application/x-www-form-urlencoded` — Default form encoding: names and values are percent-encoded into a URL-encoded representation. It is not the multipart file-upload format.
- `form.enctype=multipart/form-data` — Multipart encoding with boundaries, suitable for file parts and mixed text/file entries.
- `form.enctype=text/plain` — Plain text name/value encoding with minimal formatting guarantees; generally useful for diagnostics, not robust production protocols.
- `form.method` — Submission method, usually GET or POST; GET appends entries to the URL, POST puts data in the body, and `dialog` closes a containing dialog rather than sending a request.
- `form.method=get` — Sends the encoded entry list in the action URL's query component. Avoid for secrets or large/sensitive payloads because URLs can appear in history, logs, and referrers.
- `form.method=post` — Sends the entry list in the request body using the selected encoding. POST does not itself guarantee privacy, authorization, or CSRF protection; use HTTPS and server controls.
- `form.method=dialog` — When the form is inside a dialog, submission closes the dialog and sets its return value from the submitter when applicable rather than performing a network navigation.
- `form.name` — Name identifying the form in legacy named access and scripting. Prefer DOM references/IDs for robust code; avoid collisions with form properties.
- `form.novalidate` — Disables interactive constraint validation for submissions from that form. It does not make values valid or bypass server validation.
- `form.rel` — Space-separated link-type annotations for the relationship created by form navigation, such as `noopener`/`noreferrer` where applicable. It is not an authorization control.
- `form.target` — Browsing context/navigable where the response is displayed, such as `_self` or `_blank`; consider opener/privacy implications.
- `form.autocapitalize` — Provides an autocapitalization hint inherited by applicable form controls that do not specify their own value. The platform may ignore the request.
- `form.autocorrect` — Provides an autocorrection hint inherited by applicable controls. This affects editing assistance, not the underlying form data validation or a guaranteed platform behavior.
- `form-associated form attribute` — The `form="id"` attribute on a form-associated control explicitly sets its form owner even if it is outside that form's subtree. The referenced ID must identify a form in the same document.
- `button.disabled` — Disables user interaction and generally bars the button from validation/submission as appropriate; a disabled submit button cannot be activated as submitter.
- `button.form` — Associates the button with a form by ID, including when it is outside the form subtree. Its IDL `form` property reflects the resolved form owner; the content attribute is an ID reference.
- `button.formaction` — Submitter-specific action URL replacing the form's `action` for this activation.
- `button.formenctype` — Submitter-specific encoding replacing the form's `enctype` for this activation.
- `button.formmethod` — Submitter-specific `get`, `post`, or `dialog` method replacing the form's method.
- `button.formnovalidate` — Skips interactive constraint validation for a submission activated by this button; server validation remains required.
- `button.formtarget` — Submitter-specific target browsing context replacing the form's target.
- `button.name` — Name used for the submitter's entry when that button is activated. Other submit buttons' names are not included.
- `button.type` — Selects auto, submit, reset, or non-submitting button behavior. In ordinary form use, auto defaults to submit unless button invoker/select rules apply; explicitly set `type="button"` for ordinary non-submit controls.
- `button type Auto state (missing/invalid value)` — Missing/invalid type state, not a valid explicit `type="auto"` keyword. A button in a form normally acts as submitter, except when used as a command invoker or in a select context; set a type explicitly to make intent clear.
- `button.type=submit` — Activates form submission and becomes the submitter, so its name/value and override attributes apply.
- `button.type=reset` — Resets resettable form controls to their defaults; avoid unexpected reset behavior in application forms.
- `button.type=button` — A button with no built-in submit/reset behavior; script or command behavior may still be attached.
- `button.value` — Value paired with the submitter's name in the entry list.
- `button.command` — Declarative invoker command specifying an action for the target element identified by `commandfor`. A button with a command relationship is not implicitly a submit button through the Auto state.
- `button.command=toggle-popover` — Toggles the target popover between shown and hidden.
- `button.command=show-popover` — Shows the target popover.
- `button.command=hide-popover` — Hides the target popover.
- `button.command=close` — Closes the target dialog.
- `button.command=request-close` — Requests that the target dialog close, allowing its cancelable close-request flow.
- `button.command=show-modal` — Opens the target dialog as a modal dialog.
- `custom --command keywords` — A command value beginning with `--` dispatches a `command` event to the target; application code defines its effect. It is not one of the standard built-in actions.
- `button.commandfor` — Targets an element by ID for the button's command. It supports declarative invocation patterns and is distinct from form association.
- `button.popovertarget` — Targets a popover element for a button to toggle/show/hide it declaratively.
- `button.popovertargetaction` — Selects the popover action (toggle/show/hide) when `popovertarget` is used; omitted behavior defaults according to the HTML popover invoker rules.
- `button.popovertargetaction=toggle` — Toggles the targeted popover; this is the default action when omitted.
- `button.popovertargetaction=show` — Shows the targeted popover.
- `button.popovertargetaction=hide` — Hides the targeted popover.
- `button.autofocus` — Requests focus when the page/dialog/popover is loaded/shown under focus rules. Only one autofocus target should be chosen carefully; automatic focus can disorient users.
- `select.autocomplete` — Provides autofill metadata for the selected value. The field token must make sense for a select, and browsers may offer no autofill UI.
- `select.autofocus` — Requests automatic focus under autofocus rules; multiple competing autofocus targets and surprise focus changes are problematic.
- `select.disabled` — Disables interaction and excludes the select from submission and constraint validation. A disabled optgroup can also disable its options.
- `select.form` — Associates a select with a form by ID even when it is outside the form's subtree.
- `select.multiple` — Allows more than one option to be selected. The control exposes a collection of selected options and may render as a listbox; submission includes one entry per selected option.
- `select.name` — Key used for the selected option entries during submission. Without a name, selected values are not submitted under a field key.
- `select.required` — Requires a selection under the select's placeholder-label-option rules. A first empty option can act as the placeholder label option for a single-select control.
- `select.size` — Preferred number of visible option rows; affects whether the control presents as a listbox rather than a compact dropdown.
- `option.disabled` — Makes this option unavailable for selection; an option inside a disabled optgroup is also disabled. Disabled options are not successful selected entries.
- `option.selected` — In markup, sets default selectedness; the live `selected` property reflects current selected state. `defaultSelected` represents the default state. A select's selection rules can update other options when it is single-select.
- `option.label` — Human-readable label used for option presentation when provided; otherwise text content provides the label. The submitted value is controlled separately by `value` or text-derived rules.
- `option.value` — Value submitted when this option is selected; if omitted, the option's text content supplies its value under option text rules.
- `textarea.autocapitalize` — Overrides inherited autocapitalization editing hint for this textarea.
- `textarea.autocorrect` — Overrides inherited autocorrection editing hint for this textarea; behavior remains platform dependent.
- `textarea.autofocus` — Requests focus under autofocus processing rules.
- `textarea.dirname` — Adds a companion submission entry with the text's directionality, analogous to input `dirname`.
- `textarea.disabled` — Prevents user interaction, excludes its value from submission, and bars it from constraint validation.
- `textarea.form` — Associates this textarea with a form by ID, even if it is outside that form's subtree.
- `textarea.inputmode` — Hint for the virtual keyboard appropriate for this multiline text value; it does not change validity or value type.
- `textarea.name` — Key by which the textarea's value is submitted. It is omitted from serialized form data when no name is present.
- `textarea.maxlength` — Maximum text length under the HTML length rules; it can constrain editing and validation but does not replace server-side limits.
- `textarea.minlength` — Minimum text length constraint; browser constraint validation can report too-short values when applicable.
- `textarea.placeholder` — Short hint displayed while empty. It does not replace a persistent label.
- `textarea.readonly` — Prevents user editing while keeping the value focusable and generally submitted. It is not a tamper-proof lock.
- `textarea.required` — Requires a nonempty textarea value for constraint validation when the control is eligible for validation.
- `textarea.rows` — Preferred visible number of text rows; presentation hint, not a maximum line count.
- `textarea.cols` — Preferred visible width in average character columns; presentation hint, not a character limit.
- `textarea.wrap` — Controls line-wrapping/submission behavior; `soft` is typical and `hard` can add line breaks in submitted data when a `cols` value is present.
- `textarea.wrap=soft` — Visual wrapping does not add wrap-created line breaks to the submitted value.
- `textarea.wrap=hard` — Hard wrapping adds line breaks to the submitted value as required by the algorithm; a valid `cols` value is required for hard-wrap behavior.
- `textarea.spellcheck` — Hint controlling browser spellchecking for the text control; user agent/user preferences may affect behavior.
- `textarea.autocomplete` — Autofill metadata for the textarea value, where meaningful to the user agent.
- `textarea.enterkeyhint` — Hints the virtual keyboard's enter key label/icon; it does not itself perform submission or another action.

# Cross-item comparison

`form.method`/`form.action`/`form.enctype` set submission defaults; `button.type` decides whether the button submits at all; submitter overrides then selectively replace form defaults. `button.command`/`commandfor` and `button.popovertarget` control declarative invoker behavior and do not mean form submission. `textarea.rows`/`cols` shape presentation; `minlength`/`maxlength` constrain value length.

# Examples

```html
<form action="/reports" method="post" enctype="multipart/form-data" autocomplete="on">
  <label for="notes">Notes</label>
  <textarea id="notes" name="notes" rows="5" cols="50" maxlength="2000" required></textarea>
  <button type="submit" name="intent" value="save">Save</button>
  <button type="submit" name="intent" value="preview" formaction="/reports/preview" formnovalidate>
    Preview draft
  </button>
</form>
```

The second submitter changes the action and bypasses browser validation for that submission; the server must still validate any persisted data.

# Common mistakes

- Forgetting a button defaults to submit inside a form.
- Assuming all submit buttons' names are included; only the activated submitter is.
- Treating `novalidate` or `formnovalidate` as data validation.
- Treating `rows`/`cols` as content constraints.
- Assuming `readonly` prevents programmatic changes or secure client data.
- Confusing `commandfor` target with the form owner set by the `form` attribute.
- Relying on autofocus for every form or modal.

# Knowledge checks with answers

1. What does `formmethod="dialog"` do inside a dialog? **Closes the dialog through form submission semantics instead of sending an HTTP request.**
2. Which submit button's name/value is submitted? **The activated submitter's.**
3. Does `textarea.rows` limit input to that many lines? **No.**
4. What is the difference between `form` and `commandfor` on a button? **`form` sets form ownership; `commandfor` targets an element for a declarative command.**
5. Does readonly mean secure against client modification? **No.**

Sources: [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html).
