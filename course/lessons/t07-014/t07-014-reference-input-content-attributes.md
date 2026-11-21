
# HTML forms controls validation and form submission — Reference: Input element content attributes

# Scope and version

This covers the current `input` content-attribute inventory in the WHATWG HTML Living Standard, checked 2026-11-19. Applicability depends on the input type; many attributes are ignored or inapplicable on other states. See [WHATWG input](https://html.spec.whatwg.org/multipage/input.html) and [MDN input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input).

# How this group fits the mental model

Content attributes configure initial/default state and behavior in markup. DOM IDL properties can reflect or expose live state, and are not always identical to the original content attribute. Check the input state before assuming an attribute has an effect.

# Supplied names explained

- `accept` — File-type chooser hint for `type=file`, expressed as file extensions, MIME types, or media categories. It is not a security validation; inspect uploaded bytes and enforce policy on the server.
- `alpha` — Current color-state attribute allowing alpha/transparency to be set where supported. Browser UI support may lag the standard.
- `alt` — Alternative text for `type=image`, describing the submit image/action for users who cannot see it. It is not a tooltip substitute.
- `autocomplete` — Autofill token list that can enable/disable autofill and identify the semantic data field. Tokens may include section and shipping/billing context; correct tokens improve browser/password-manager assistance.
- `capture` — HTML Media Capture extension for file inputs; with a suitable `accept` value it hints that new media may be captured using a user-facing (`user`) or outward-facing (`environment`) camera/microphone. It is a hint, not a guarantee, has limited browser support, and does not replace the user's ability to choose or the server's file checks.
- `checked` — For checkbox/radio, markup default checkedness. The live `checked` property tracks current checkedness; the `defaultChecked` property reflects the default. Changing the attribute after interaction does not necessarily change current state.
- `colorspace` — Current color-state attribute selecting the serialized color space (such as the defined standard color spaces). Do not assume the picker exposes every color space consistently across browsers.
- `dirname` — Adds a companion submitted entry containing the directionality (`ltr`/`rtl`) of the control's value. Useful when preserving text direction for user-entered text.
- `disabled` — Makes the control non-interactive and generally excludes it from constraint validation and form submission. Disabled controls do not behave like readonly controls.
- `form` — Associates an input with a form element by ID, even when it is not a descendant. If omitted, the nearest ancestor form is its owner.
- `formaction` — Submitter override URL for the form action, applicable to submit and image inputs.
- `formenctype` — Submitter override for POST body encoding, applicable to submit/image input states.
- `formmethod` — Submitter override for form submission method, applicable to submit/image inputs; current standard includes get, post, and dialog semantics where applicable.
- `formnovalidate` — Submitter override that bypasses interactive constraint validation for that submission. It does not validate the data elsewhere.
- `formtarget` — Submitter override for the navigable target that receives the submission response.
- `height` — Rendered image height for `type=image`, in CSS pixels when used as the dimension attribute.
- `list` — ID reference to a `<datalist>` supplying suggestions for compatible input types. Suggestions do not restrict values.
- `max` — Upper bound for supported numeric/date/time states; participates in range-overflow validation and affects range defaults. Meaning is type-dependent.
- `maxlength` — Maximum length constraint for applicable text-entry states, measured in UTF-16 code units under HTML's rules. It can constrain user editing; do not use it as a substitute for server limits.
- `min` — Lower bound for supported numeric/date/time states; participates in range-underflow validation and affects range defaults.
- `minlength` — Minimum length constraint for applicable text-entry states. Browser validation behavior accounts for user input; server validation is still required.
- `multiple` — For `input`, permits multiple selected files in the file-upload state or a comma-separated list of email addresses in the email state. It does not apply to `<select>`; that element has its own `multiple` attribute and selection behavior.
- `name` — Name used to construct form-data entries and expose controls through `form.elements`. Without a name, a control commonly contributes no entry; names should be unique where the server expects distinct fields.
- `pattern` — Regular-expression constraint on supported text-like states (text, search, tel, URL, email, and password). HTML compiles it using JavaScript's Unicode Sets `v` flag and matches the whole value, as if anchored at both ends; it is not a substring search. When `multiple` applies to email, the list's values are checked under the standard's rules. Invalid regular-expression syntax does not create an active pattern constraint. Provide clear visible instructions and a meaningful title that describes the format; validate independently on the server.
- `placeholder` — Short hint shown when the value is empty. It disappears during entry and is not a label or accessible-name replacement.
- `popovertarget` — Current invoker attribute targeting a popover element by ID for applicable button-like input states. It connects declarative activation to the browser popover API.
- `popovertargetaction` — Chooses whether the target popover is toggled, shown, or hidden for applicable invoker controls. It has no effect without a valid target and popover relationship.
- `readonly` — Prevents user editing for applicable text-like states while preserving focus and submission. Readonly controls are generally barred from constraint validation; it does not protect a value from client modification.
- `required` — Requires a value/selection for applicable states and contributes `valueMissing` validation. It does not apply uniformly to hidden/button states and does not replace server validation.
- `size` — Preferred visible character width for text-like controls; for some types it has different state-specific meaning. It is a presentation hint, not a data-length constraint.
- `src` — Image URL for `type=image`. Use an appropriate `alt` value; image loading behavior and CSP policy also matter.
- `step` — Allowed numeric/date/time increment for applicable types and participates in step-mismatch validation. The base value and scale are state-dependent; it is not merely a UI spinner increment.
- `switch` — Current boolean attribute for checkbox state. When present, the checkbox represents a two-state switch and user agents may expose switch semantics; indeterminate state has no effect. Browser support and presentation vary, so check target browsers and retain a clear accessible label.
- `type` — Selects the input state and thus UI, value model, applicable attributes, validation, and submission behavior. Missing/invalid values fall back according to the standard, typically to text state.
- `value` — Default/current value depending on state and whether the live DOM property has been changed. For checkbox/radio it is the submitted value when checked; for file inputs scripts cannot set an arbitrary chosen file path.
- `width` — Rendered image width for `type=image`, in CSS pixels when used as the dimension attribute.

# Cross-item comparison

`min`, `max`, and `step` define numeric/date/time range and increments; `minlength`, `maxlength`, and `size` relate to text entry but size is visual width, not a character constraint. `checked` sets a checkbox/radio default, while the live `checked` property reflects user interaction. `form*` attributes on a submitter override the form's default submission configuration. `accept` and `list` guide the UI but do not enforce trusted data.

# Examples

```html
<label for="upload">Choose an image</label>
<input id="upload" name="photo" type="file" accept="image/*" required>

<label for="amount">Quantity</label>
<input id="amount" name="quantity" type="number" min="1" max="20" step="1" value="1">
```

The first chooser hint does not guarantee the uploaded file is an image; the server must inspect and validate it. The second field uses quantity semantics and a step of one.

# Common mistakes

- Treating `accept` as upload validation or `list` as a whitelist.
- Using placeholder as the only label.
- Confusing `size` with `maxlength`.
- Assuming `checked` always equals current checkedness after user interaction.
- Assuming `readonly` prevents tampering or `disabled` values are submitted.
- Applying `formaction`/`formmethod` to a non-submitter input and expecting an override.
- Assuming `pattern` performs server validation or matches only a substring.

# Knowledge checks with answers

1. Does `accept="image/*"` prove an uploaded file is an image? **No; it guides the chooser only.**
2. Which attribute controls visible text width rather than maximum characters? **`size`.**
3. What does `dirname` submit? **A companion direction value for the text.**
4. Which attribute selects the input state? **`type`.**
5. Can a client script set an arbitrary local file path using `value`? **No.**
6. Does `capture="environment"` guarantee that a rear-camera capture UI opens? **No. It is a user-agent hint from HTML Media Capture; device support and picker behavior vary.**

Sources: [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [MDN input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [W3C HTML Media Capture](https://www.w3.org/TR/html-media-capture/).
