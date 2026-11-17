<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Exercises and worked solutions

# Goals

Build a correct native form by reasoning about labels, control types, autofill grammar, constraint validation, entry-list construction, submitter behavior, and server trust. The exercises join together the separately enumerated elements, attributes, state APIs, and submission rules.

# Worked example

Scenario: a checkout form has billing and shipping addresses, a card number, optional delivery instructions, and two submit buttons: “Save for later” and “Place order.” A rushed implementation uses placeholders instead of labels, `type=number` for the card number, an arbitrary `autocomplete="zip"`, disables every field while submitting, and reads the values from `form.elements` as though that collection were the exact request body.

This mixes distinct browser models. Use persistent labels; preserve card digits as text; use standardized autofill names and section groups; ensure the chosen submitter is included and can override submission behavior; and construct data from the successful-control rules or `FormData`, not by assuming all listed controls submit. Regardless of browser constraints, the server validates and authorizes the order.

# Exercises

1. **Control design:** Choose native element/type, `name`, label, `required`, and useful autocomplete/inputmode hints for email, phone, card number, card expiration, postal code, and delivery notes. Explain choices where numeric-looking text is not a number.
2. **Autofill grammar:** Write autocomplete values for two different addresses (billing and shipping) each with a street line and city. Add one telephone field scoped as a work contact. Identify token ordering and field applicability constraints.
3. **Labels:** Repair a form with duplicate IDs, labels pointing at class names, placeholder-only instructions, and a checkbox whose text cannot be clicked. Explain each repair.
4. **Validation:** A form requires a username of 4–20 characters matching an allowed pattern, plus an optional note up to 100 characters. Specify native constraints, identify what happens when the note is absent, and add a custom cross-field rule that can be cleared when the values become valid.
5. **Submission APIs:** Compare `form.submit()` with `form.requestSubmit(button)`. Predict constraint-validation, submit-event, submitter name/value, and submitter override behavior.
6. **Successful controls:** Given a form with a disabled field, an unnamed field, unchecked checkbox, two checked same-name checkboxes, a selected option, a non-submitter button, and two submit buttons, describe which entries appear when the second submit button is activated.
7. **FormData:** Show how to read duplicate values, include the submitter, modify outgoing entries, and observe entry-list construction. Explain why `form.elements` and `FormData` answer different questions.
8. **Files and encoding:** Design a file upload form that supports multiple images, limits accept hints to image types, and sends file data. Explain why `accept` is not validation and what `multipart/form-data` changes.
9. **Security boundary:** Identify which checks must run server-side when client validation passes. Include file uploads, prices, user identity, and unexpected fields.
10. **Review:** Inspect a real form using keyboard navigation and a screen reader. Verify labels, grouping, validity feedback, required state, focus behavior, mobile keyboard hints, and operation without JavaScript.
11. **Form-associated custom element:** A reusable rating control must submit a normalized value, preserve the user's display state for restoration, participate in native validation, react to disabled fieldsets and reset, and associate with external labels. Name the opt-in, internals APIs, and lifecycle callbacks it needs.

# Progressive hints

1. Ask whether arithmetic on the value makes sense. Card numbers, postal codes, telephone numbers, and identifiers are text even when they contain digits. Use `email`, `tel`, card and address autocomplete field names where applicable.
2. A complete token sequence is `section-*`, then `shipping` or `billing`, then the field name. Contact qualifiers such as `work` precede a contact field. The form owner, field type, and user agent affect whether autofill is offered.
3. `for` points to one unique `id`. A wrapping `<label>` is an alternative. Placeholder is a hint, not the persistent name.
4. `required`, `minlength`, `maxlength`, and `pattern` cover native cases; `setCustomValidity('')` clears a previous custom error. Do not assume `minlength` alone rejects an empty optional value.
5. User-triggered normal submission generally follows validation and submit-event processing. The direct `submit()` method bypasses interactive validation and the submit event; `requestSubmit()` behaves like activating a submitter.
6. Successful controls are filtered by submission rules. Disabled/unnamed/unchecked controls are not included; repeated names can create multiple entries. Only the submitter contributes its name/value and overrides.
7. `FormData.getAll(name)` retains repeated values; its constructor can take a submitter. The `formdata` event exposes the constructed data for adjustment.
8. The form's `enctype` must be `multipart/form-data` for the standard multipart file upload encoding. `accept` only guides the picker.
9. The browser is controlled by the user; every request and uploaded byte is untrusted.
10. Test without relying on visual appearance alone. A native form should still submit through ordinary browser behavior absent client scripting.
11. A form-associated custom element requires the static `formAssociated = true` opt-in and `attachInternals()`. `ElementInternals.setFormValue(normalizedValue, userState)` separates server-ready data from restorable UI state; `setValidity(flags, message, anchor)` integrates constraints and user feedback. `formDisabledCallback(disabled)` updates internal interaction when the host/fieldset's effective disabled state changes, `formResetCallback()` restores the component's default, and `formStateRestoreCallback(state, mode)` restores browser-provided state. `ElementInternals.labels` exposes external associated labels, but the author must still provide an accessible role, name, focus model, and keyboard interaction. Ordinary custom elements do not get these behaviors automatically.

# Complete solutions

1. Use labeled `type=email` with `autocomplete=email` and `inputmode=email`; `type=tel` with `autocomplete=tel` and `inputmode=tel`; card number as `type=text` with `autocomplete=cc-number` and a numeric keyboard hint if useful; expiration as an appropriate text/date representation with `cc-exp` or separate `cc-exp-month`/`cc-exp-year`; postal code as text with `postal-code`; notes as textarea with a name and an explicit label. `accept`/autocomplete/inputmode are hints and do not establish trust. Avoid collecting card security code unless the payment flow requires it; never store it after authorization.
2. For example: `section-bill billing address-line1`, `section-bill billing address-level2`, `section-ship shipping address-line1`, and `section-ship shipping address-level2`. A work telephone uses `work tel`, optionally prefixed with a section and `shipping`/`billing` only if it belongs to that address/contact scope. Tokens are whitespace-separated and their order is part of the grammar. Do not use invented aliases such as `zip`.
3. Give every target a unique ID and set the visible label's `for` to it, or wrap the control. Replace placeholder-only naming with persistent labels; keep placeholders for examples only. Put checkbox text inside an associated label so the text activates the checkbox. If more context is needed, group controls with fieldset/legend and associate help/error text as described in the accessibility lessons.
4. Use a required username with `minlength="4"`, `maxlength="20"`, and an appropriately escaped HTML pattern for the allowed characters. Pattern syntax is the HTML Unicode Sets (`v`) regular-expression mode and matches the entire value; test escaping and Unicode behavior. The note can have `maxlength="100"`; since it is optional, empty is allowed, and `minlength` would only constrain a nonempty user-entered value under the standard's rules. For a cross-field rule, set a useful nonempty message on the affected control with `setCustomValidity(message)`, then call `setCustomValidity('')` as soon as the condition is satisfied; otherwise a stale custom error keeps the control invalid.
5. `form.submit()` invokes the form submission algorithm directly and does not run interactive constraint validation or fire the `submit` event. It has no submitter, so submit-button `name`/`value` and overrides are absent. `form.requestSubmit(button)` acts like activating that submit button: it validates unless validation is bypassed, dispatches `submit` when valid, sets `SubmitEvent.submitter`, and applies the button's `formaction`, `formmethod`, `formenctype`, `formnovalidate`, and `formtarget` overrides. Calling `requestSubmit()` without an argument uses the form as the submitter behavior requires, rather than selecting an arbitrary button.
6. Disabled and unnamed controls are excluded; unchecked checkbox is excluded; both checked same-name checkboxes produce two entries; the selected named option contributes its value; ordinary non-submitter button is excluded; only the activated second submit button contributes its name/value and any overrides. Exact output still depends on each control's name, form owner, type state, and successful-control rules.
7. `new FormData(form, submitButton)` builds the entry list including that submitter where supported; `getAll('tag')` reads every repeated value. Listen for `formdata` to inspect or append/delete entries after construction. `form.elements` is a live collection of associated listed controls (including controls associated by the `form` attribute); it does not filter to successful entries, serialize names/values, or represent the exact request payload.
8. Use `<form method="post" enctype="multipart/form-data">` and `<input type="file" name="images" accept="image/*" multiple>`. The accept hint guides the file picker but a caller can send arbitrary content. The server must enforce count, byte size, actual file signature/content handling, authorization, storage policy, and malware/content-processing requirements. Multipart encoding transmits text and file parts with boundaries rather than URL-encoded text pairs.
9. Authenticate identity from trusted server context, authorize the action/resource, validate every field and relationship, derive price/tax/stock from trusted server data, reject or explicitly handle unknown fields, enforce upload count/size/type based on inspected content, protect cookie-authenticated mutations against CSRF as appropriate, rate-limit, and avoid logging secrets or sensitive payment values. Client validity is UX and can be bypassed.
10. Verify persistent names, logical grouping, keyboard order, focusable error recovery, announced required/invalid/error state, responsive layout, supported hint behavior, and native submission with JavaScript disabled. Test invalid and valid values, network failure, repeated entries, and disabled states.

# Tests and edge cases

- Submit with Enter from a text field and compare the activated default submitter with an explicit button click.
- Call `submit()` and `requestSubmit()` separately; observe validation, `submit`, submitter, and navigation/network effects.
- Use empty optional values, user-entered too-short values, and script-assigned values to understand length-validation edge cases.
- Test pattern characters needing HTML attribute escaping and Unicode behavior under the `v` flag.
- Include duplicate names, controls outside the form with a `form` attribute, disabled fieldset descendants, unchecked controls, and multiple files.
- Confirm the server rejects altered prices, forged user IDs, mismatched files, extra fields, and invalid cross-field combinations.
- Test browsers with autofill disabled and devices that ignore keyboard hints; the form must still work.

# Reflection questions

1. Which parts of browser validity are useful feedback, and which server checks remain mandatory?
2. Why is `form.elements` not the outgoing entry list?
3. What changes when a submitter has `formnovalidate` or `formaction`?
4. Why are telephone and postal values usually text rather than numbers?
5. Which sensitive values should be avoided in logs and persistent storage?

## Reflection model answers

1. Browser constraints such as `required`, type syntax, length, range, and pattern checks give immediate and accessible feedback. The server must still authenticate, authorize, validate every submitted value and cross-field rule, enforce business invariants, and reject forged or stale data.
2. `form.elements` is a live collection of associated controls, including controls that are disabled, unnamed, unchecked, or not the submitter. The outgoing entry list filters by submission rules, preserves duplicate names and files, and depends on the submitter and form state.
3. `formnovalidate` on the chosen submitter bypasses interactive constraint validation for that submission. `formaction` overrides the form's action URL for that submitter. Other submitter overrides can similarly affect method, encoding, or target.
4. Telephone numbers and postal codes are identifiers/text: arithmetic is not meaningful, leading zeroes and punctuation can matter, and valid formats vary by locale. Use text-like controls with `tel`/`postal-code` autocomplete and `inputmode` hints where useful.
5. Avoid logging passwords, one-time codes, full payment-card data, security codes, authentication tokens, and unnecessary personal data. Do not persist a card verification code after authorization; redact sensitive request bodies and restrict access to logs.

Sources: [WHATWG HTML forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [WHATWG form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), [MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation), [MDN form reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form), [PCI SSC card verification code guidance](https://www.pcisecuritystandards.org/faqs/are-merchants-allowed-to-request-card-verification-codes-values-from-cardholders/).
