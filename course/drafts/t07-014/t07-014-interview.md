<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Interview questions and reasoning

# Core questions

1. What responsibilities does the browser take on when a native form is submitted?
2. What makes a control successful, and why can `form.elements` differ from submitted data?
3. Compare `submit()` and `requestSubmit()` precisely.
4. How do `type`, `autocomplete`, and `inputmode` differ?
5. How do form-level and submitter-level attributes interact?
6. What do native constraint validation APIs do, and what are their limits?
7. How do labels establish a control's accessible name and activation behavior?
8. Explain the autocomplete token grammar and the purpose of `section-*`.
9. How should repeated names, checkboxes, and file inputs be represented with `FormData`?
10. What does native form progressive enhancement mean?
11. Why is client-side validation not a security control?
12. When are `dirname`, `formdata`, `invalid`, and `submit` useful?

# Concise interview answers

1. The browser resolves the form owner and submitter, performs applicable interactive validation, dispatches submit processing, builds an ordered entry list from successful controls, applies an encoding, and navigates/submits according to method, action, target, and related attributes. JavaScript can intercept or augment steps.
2. Submission filters by name, disabled state, checkedness/selection, control type, and whether a submit button is the chosen submitter, among other rules. The live `form.elements` collection lists associated controls; it is not a filtered serialized payload.
3. `submit()` directly invokes submission without interactive validation or a `submit` event and without a submit button as submitter. `requestSubmit(button)` behaves like activating that submitter, running validation unless bypassed, firing the event when appropriate, exposing the submitter, and applying its overrides.
4. `type` selects semantics, control UI, value rules, and applicable constraints. `autocomplete` describes the real-world data and grouping for autofill. `inputmode` hints at an on-screen keyboard. They are independent and do not replace one another.
5. A submitter can override the form's action, method, encoding, validation behavior, and target via the corresponding `form*` attributes. These affect the submission only when that submitter is used.
6. `checkValidity()` checks and returns a boolean, firing `invalid` on invalid candidates; `reportValidity()` additionally asks the browser to present feedback if the invalid event is not canceled. `setCustomValidity()` adds or clears a custom error. These checks can be bypassed and do not validate authorization or server business rules.
7. A `<label>` explicitly associates via `for` matching a unique control `id`, or implicitly by containing the labeled control. It provides a persistent name and platform label activation behavior. Placeholder text is not an equivalent persistent label.
8. Tokens can include an optional leading `section-*`, optional `shipping`/`billing`, a standardized field name, optional contact qualifier plus contact field, and optional trailing `webauthn` where allowed. Section values let the user agent distinguish groups like multiple addresses. Order and control applicability matter.
9. `FormData` preserves repeated entries; use `getAll(name)` rather than assuming one value. Use the submitter-aware constructor when submit-button data matters. File controls contribute file entries when successful. `formdata` can inspect or modify the constructed data.
10. Core controls and browser submission work without application JavaScript. Scripts can add validation, async feedback, or interception while retaining a usable native fallback where the product requires it.
11. Users can alter DOM state, disable checks, craft requests directly, or call APIs that bypass interactive constraints. The server must authenticate, authorize, validate, and enforce domain rules independently.
12. `dirname` adds direction metadata to submitted data; `formdata` observes/modifies the entry list; `invalid` handles failed controls (often with capture because it does not bubble); `submit` intercepts a normal valid submission and exposes its submitter.

# Deep follow-up answers

**How do you choose between `type=number` and a numeric keyboard hint?** Use number when the value is mathematically numeric and spinbutton semantics are useful. Use text plus `inputmode="numeric"` for digit strings such as IDs, card numbers, and postal codes, where leading zeroes or exact characters matter. Validate the desired format separately.

**What is the difference between a control's default and current value?** Elements such as input and textarea have default content/attributes and current value state. User edits set a dirty-value flag, so later changes to the default do not necessarily replace the current value. `defaultValue`/`defaultChecked` represent defaults, while `value`/`checked` represent current state. Select selection is driven by option selectedness.

**Why can `minlength` surprise developers?** It does not imply `required`. Empty optional values remain allowed; length constraints are also affected by dirty/user-edit rules in the specification. Pair it with `required` when empty is forbidden and repeat all critical checks server-side.

**What makes `pattern` easy to get wrong?** It applies to supported text-like states, uses the HTML pattern compilation semantics (currently Unicode Sets `v` mode), and checks the whole value rather than searching for a substring. Attribute escaping and regex escaping are separate concerns; test the exact markup and accepted Unicode set.

**Why are submitter-aware APIs important?** Multiple submit buttons can represent different operations, destinations, encodings, or validation policies. The submitter determines which button name/value and overrides apply. Code that calls `form.submit()` or serializes controls manually can silently discard this intent.

**Does `autocomplete="off"` disable credential managers?** It is a standardized request about automatic completion, but user agents may prioritize credential/security behavior and offer password managers. The page cannot guarantee suppression of user-controlled browser features.

**How would you process a `FormData` event?** It fires after the form entry list is constructed. Read or alter `event.formData` for deliberate additions/deletions, preserve duplicate entries where meaningful, and ensure client changes are validated again at the server. It is not a trust boundary.

# Scenario questions

1. A form has two submit buttons with distinct `formaction` values. How should JavaScript preserve the chosen operation when intercepting submission?
2. A form has repeated `tag` checkboxes. What APIs preserve all selected values?
3. A required control is invalid but the form's `invalid` handler does not run through event bubbling. What event behavior explains this?
4. A form uses a disabled fieldset but one input inside its first legend remains interactive. Explain the exception.
5. A form includes a named file input with `accept="image/*"`. Which server checks are still necessary?
6. A user changes a hidden price field and submits successfully. Which layer must reject the changed price and how should it derive the correct one?

## Scenario model answers

1. Read the actual `SubmitEvent.submitter`, preserve that submitter when constructing `FormData(form, submitter)`, and respect its `formaction`, `formmethod`, `formenctype`, `formnovalidate`, and `formtarget` overrides when implementing the scripted request. Do not infer the operation from whichever button happens to be first or from a stale click handler; submit can also be initiated by keyboard or script.
2. Use `FormData.getAll("tag")` or iterate `FormData` entries; do not convert it to a plain object that collapses duplicate names. An unchecked checkbox contributes no entry.
3. `invalid` does not bubble. Attach to each relevant control or use a capturing listener on the form/document; `checkValidity()` and interactive validation can dispatch it for invalid candidates.
4. A disabled fieldset disables descendant controls except descendants of its first `legend` element child. The exception is based on that first legend, not any later legend or arbitrary caption.
5. Treat `accept="image/*"` as picker guidance only. The server must authenticate/authorize, enforce count and byte limits, inspect actual content rather than trust filename/MIME metadata, safely decode/process/store it, and reject disallowed content. Apply malware scanning and content-disposition/download policy as appropriate to the product.
6. The server must ignore the submitted price as authority and derive the amount from trusted catalog, promotion, tax, currency, and inventory rules at transaction time. It must also authorize the purchase and handle stale prices or inventory changes explicitly; a hidden field is user-controlled input.

# Tradeoffs and alternatives

- Native browser validation provides consistent baseline feedback and semantic constraints; custom validation enables domain-specific messaging but must preserve accessibility and can accidentally replace native behavior.
- Native navigation/submission is robust and works without JavaScript; interception supports richer async UX but needs pending, failure, duplicate-submit, and fallback handling.
- `FormData` preserves browser entry-list semantics and file values; manual serialization may be useful for a custom protocol but must intentionally recreate submitter, repeated-name, disabled, and file rules.
- A single `street-address` field supports international variation; multiple address-line/city fields can improve workflows where the destination schema requires them. Do not assume one country's address hierarchy fits all.
- Browser autofill can reduce typing and errors; the page can only provide accurate metadata and allow the user to control suggestions.

# Common weak answers

- “`form.elements` is what gets posted.” It includes controls that may not be successful entries.
- “`submit()` clicks the default button.” It skips interactive validation and the submit event and does not select a button submitter.
- “`type=number` is for any digits.” It represents a numeric quantity, not arbitrary digit strings.
- “Autocomplete is just a browser guess.” Standard field tokens communicate semantic intent and can scope multiple related datasets.
- “HTML validation secures the endpoint.” The request can be forged; server validation and authorization are mandatory.
- “A hidden input is trustworthy because users cannot see it.” Hidden data is editable and must be treated as untrusted.
- “`accept` prevents invalid file uploads.” It is a picker hint; server-side inspection and limits remain necessary.
- “A custom error is permanent.” Clear it with `setCustomValidity('')` once the condition is corrected.

# Self-check rubric

Score 0–2 on each: (a) form-owner/submitter model, (b) successful controls and entry list, (c) API differences, (d) attribute override behavior, (e) validation and its limits, (f) label/autofill/input hint semantics, and (g) server trust boundary. A strong answer scores 12–14 and explains what the browser decides versus what the server must enforce; 8–11 indicates sound basics with gaps in submission details; below 8, revisit the reference lessons and practice scenarios.

Sources: [WHATWG HTML forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG HTML input](https://html.spec.whatwg.org/multipage/input.html), [WHATWG form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), [MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation), [MDN HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
