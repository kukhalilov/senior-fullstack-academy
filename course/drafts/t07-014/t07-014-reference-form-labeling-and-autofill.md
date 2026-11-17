<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Label association, autocomplete, and input modality

# Scope and version

This lesson covers native HTML labeling, autofill metadata, virtual-keyboard hints, text-entry hints, and direction submission. The token inventory follows the WHATWG HTML Living Standard last updated 2026-11-14. User agents decide whether and how to offer autofill; markup communicates meaning and does not guarantee a particular UI. See [WHATWG form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), and [MDN input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input).

# How this group fits the mental model

A label gives a control a human-readable name and a larger activation target. `autocomplete` describes the meaning and grouping of data so browsers and password managers can make useful suggestions. `inputmode`, `enterkeyhint`, `autocapitalize`, and `autocorrect` influence text entry without changing the submitted value's validation rules. These are complementary hints; none is a security boundary or a promise that a device will display a specific keyboard or suggestion.

# Supplied names explained

- `Explicit label association using for and id` — A `<label for="email">` associates with the labelable element whose `id` is exactly `email`. IDs should be unique. The label's `for` value is not a CSS selector; it is a single ID reference.
- `Implicit label association by nesting` — Wrapping a labelable control inside `<label>` creates an implicit association. Explicit association is often easier to style and maintain. A label must not contain a second labelable descendant besides its labeled control.
- `Labelable elements` — The native labelable set is button, input except `type=hidden`, meter, output, progress, select, textarea, and form-associated custom elements. A custom element opts into form association and labeling through the platform mechanisms; its `ElementInternals.labels` exposes associated labels.
- `autocomplete=on` — Allows browser-managed completion with heuristics when no more specific field name is provided. It does not force a suggestion.
- `autocomplete=off` — Requests that the user agent not remember or suggest values. Browsers may prioritize user security/usability behavior, especially for credentials, so it is not a reliable way to suppress password managers.
- `section-* autocomplete token` — An optional leading token groups related controls into distinct autofill scopes. The suffix is an author-chosen identifier, such as `section-shipping2`; it is not a fixed vocabulary. It must precede the other autocomplete tokens.
- `shipping autocomplete token` — Marks an address/contact value as part of shipping details. It appears after an optional section token and before the field name.
- `billing autocomplete token` — Marks an address/contact value as billing details, in the same token position as `shipping`.
- `name` — Full name as one value. It differs from component tokens such as `given-name` and `family-name`.
- `honorific-prefix` — Prefix/title such as Dr. or Ms.
- `given-name` — Given/first name.
- `additional-name` — Additional or middle name(s).
- `family-name` — Family/last name.
- `honorific-suffix` — Suffix such as Jr. or a professional honorific.
- `nickname` — A nickname or familiar name.
- `username` — Account identifier used to sign in.
- `new-password` — New password being created or changed; browsers may offer password generation.
- `current-password` — Existing account password for authentication.
- `one-time-code` — A one-time verification code, commonly delivered out of band.
- `organization-title` — The person's title or role within an organization.
- `organization` — Organization/company name.
- `street-address` — Complete street address in one field; line breaks may be used.
- `address-line1` — First address line, often street number and street name.
- `address-line2` — Second address line, often apartment/unit details.
- `address-line3` — Third address line when the local address format needs it.
- `address-level4` — Finest-grained administrative locality level used by some countries; meanings vary by address system.
- `address-level3` — Third administrative level, such as a district or suburb depending on the country.
- `address-level2` — Second administrative level, commonly a city/town, but country formats differ.
- `address-level1` — Broadest sub-country administrative area, often a state, province, or region.
- `country` — Country/territory code in the user agent's canonical format (typically ISO 3166-1 alpha-2).
- `country-name` — Human-readable country/territory name.
- `postal-code` — Postal/ZIP code, whose format is country-dependent.
- `cc-name` — Cardholder name as a whole.
- `cc-given-name` — Cardholder given name.
- `cc-additional-name` — Cardholder additional/middle name.
- `cc-family-name` — Cardholder family name.
- `cc-number` — Payment-card account number; treat it as sensitive and do not log it casually.
- `cc-exp` — Payment-card expiration as one date value.
- `cc-exp-month` — Payment-card expiration month component.
- `cc-exp-year` — Payment-card expiration year component.
- `cc-csc` — Card security code. It is sensitive authentication data and must not be stored after authorization, even encrypted, under PCI DSS; collect it only when needed for authorization. Browser autofill availability varies. See [PCI SSC guidance](https://www.pcisecuritystandards.org/faqs/are-merchants-allowed-to-request-card-verification-codes-values-from-cardholders/).
- `cc-type` — Payment-card network/type, where known.
- `transaction-currency` — Currency code for the transaction, conventionally a three-letter ISO 4217 code.
- `transaction-amount` — Amount of the transaction in that currency.
- `language` — Preferred language.
- `bday` — Full birth date.
- `bday-day` — Day component of birth date.
- `bday-month` — Month component of birth date.
- `bday-year` — Year component of birth date.
- `sex` — Sex value as represented by the form; request only when needed and explain the intended meaning because this is personal data.
- `url` — A URL associated with the person, such as a website.
- `photo` — URL for a photograph associated with the person.
- `home` — Contact qualifier indicating a home contact point. It precedes a contact field token.
- `work` — Contact qualifier indicating a work contact point.
- `mobile` — Contact qualifier indicating a mobile contact point.
- `fax` — Contact qualifier indicating a fax contact point.
- `pager` — Contact qualifier indicating a pager contact point.
- `tel` — Telephone number, including country/area portions as applicable.
- `tel-country-code` — Telephone country calling code.
- `tel-national` — Telephone number excluding the country calling code.
- `tel-area-code` — Area/city code component.
- `tel-local` — Local subscriber number.
- `tel-local-prefix` — Prefix portion of a local subscriber number.
- `tel-local-suffix` — Suffix portion of a local subscriber number.
- `tel-extension` — Telephone extension.
- `email` — Email address.
- `impp` — Instant-messaging protocol endpoint, such as a URI for a supported messaging protocol.
- `webauthn autocomplete token` — Optional final token after a valid autofill field name; hints that conditional WebAuthn public-key credentials may be offered when the user interacts with an input or textarea. It does not itself start authentication or replace WebAuthn API calls.
- `inputmode values` — The standardized values are `inputmode=none`, `inputmode=text`, `inputmode=decimal`, `inputmode=numeric`, `inputmode=tel`, `inputmode=search`, `inputmode=email`, and `inputmode=url`. They hint at an appropriate virtual keyboard; they do not select the control type, impose syntax, or guarantee a device keyboard layout. `inputmode=none` asks the user agent not to display a virtual keyboard.
- `autocapitalize inheritance` — `autocapitalize=off` and `autocapitalize=none` request no autocapitalization; `autocapitalize=on` and `autocapitalize=sentences` request sentence capitalization; `autocapitalize=words` requests word capitalization; `autocapitalize=characters` requests uppercase entry. Values inherit from the form owner for applicable controls when not set directly; otherwise the user agent uses a default. Input types email, URL, and password do not have autocapitalization enabled by this attribute. This remains a hint.
- `autocorrect inheritance` — `autocorrect=on` permits automatic correction at the user agent's discretion; `autocorrect=off` disallows automatic correction. A missing control value inherits the form owner's value for inheriting controls; the default is on. URL, email, and password input types are not autocorrect-enabled by the attribute. Browser and input-method behavior still varies.
- `enterkeyhint values` — `enterkeyhint=enter`, `enterkeyhint=done`, `enterkeyhint=go`, `enterkeyhint=next`, `enterkeyhint=previous`, `enterkeyhint=search`, and `enterkeyhint=send` hint the action label/icon for the virtual keyboard's enter key. They do not submit, navigate, or otherwise execute that action by themselves.
- `dirname direction submission` — On supported text controls, `dirname="field.direction"` adds a second submitted entry containing the control's computed `ltr` or `rtl` direction. It is useful when text direction matters to the server; it does not change the control's `dir` attribute or replace bidi-safe rendering.

# Token order and control applicability

Autocomplete is a whitespace-separated token grammar, not a free-form phrase. A typical value is `section-checkout shipping address-line1`. A contact value can add a qualifier before the contact field, for example `section-checkout billing work email`. The optional `webauthn` credential token goes at the end and is valid only on input and textarea. `on` and `off` are standalone field-name values; do not combine them with a section or field token. The field token must be appropriate for the control type, and user agents can ignore inappropriate metadata.

The standard's list is finite and exact; do not invent variants such as `first-name`, `zip`, or `card-number`. Use the standardized tokens (`given-name`, `postal-code`, `cc-number`) even if the visible label uses local wording. Token recognition is ASCII case-insensitive, but lowercase spelling is conventional and easiest to audit.

# Labeling and accessible interaction

The label's text should communicate the purpose of the field. Activating a label follows platform behavior (typically focusing or activating its labeled control), and assistive technology can use the association to expose a name. Placeholder text is not a replacement: it disappears during entry and is not a robust persistent label. A `title` or `aria-label` may name a control in some designs, but this lesson's native `<label>` association is usually the clearest visible and interactive pattern. Do not put unrelated buttons or links inside a label because activation can become confusing.

When a control has multiple labels, its `labels` collection reflects those associated label elements; form-associated custom elements expose it through `ElementInternals.labels`. For repeated fields, give every control a unique ID and point each explicit label to exactly one control. Group related controls with fieldset/legend when the set needs a shared caption; each member still needs its own label.

# Choosing the hints

Use the input `type` that matches the data and its native semantics first. Then add an `autocomplete` field token when the value has a standardized meaning. Choose `inputmode` only when the data entry keyboard needs a hint that differs from the type's usual keyboard. For example, a numeric account code is usually text with `inputmode="numeric"`, because `type="number"` represents a quantity and can expose increment/decrement semantics or reject leading zeros. Use `enterkeyhint="next"` for a multi-field sequence only when the application actually manages focus progression. Do not make correctness depend on any of these hints.

`autocapitalize="none"` can reduce unwanted capitalization in email/account fields, but `type="email"` and the `email` autocomplete token carry stronger purpose semantics. Text autocorrection may be undesirable for names, addresses, codes, or identifiers, so opt out only when correction would corrupt valid data; preserve user choice where practical.

# Examples

```html
<label for="email">Email address</label>
<input id="email" name="email" type="email"
       autocomplete="section-account email"
       inputmode="email" autocapitalize="none"
       enterkeyhint="next" required>

<fieldset>
  <legend>Shipping address</legend>
  <label for="street">Street address</label>
  <textarea id="street" name="street"
            autocomplete="section-delivery shipping street-address"></textarea>
  <label for="city">City</label>
  <input id="city" name="city" autocomplete="section-delivery shipping address-level2">
</fieldset>
```

The `section-account` and `section-delivery` tokens scope separate data groups. The first field requests an email keyboard and account email autofill semantics. Actual keyboard and autofill presentation remain under user-agent control.

```html
<label for="account-code">Account code</label>
<input id="account-code" name="accountCode" type="text"
       inputmode="numeric" autocomplete="off" autocapitalize="characters">
```

This remains text so leading zeroes and nonnumeric formats are preserved; the keyboard hint is not validation. If the code has a fixed allowed format, add suitable validation separately and verify it on the server.

# Common mistakes

- Using a placeholder as the only label removes persistent instructions and weakens accessibility.
- A label's `for` must exactly equal the control's unique `id`; a missing/duplicate ID can associate incorrectly.
- Treating `autocomplete` as guaranteed autofill, or `autocomplete="off"` as a password-manager prohibition, assumes control the page does not have.
- Combining `on`/`off` with field tokens creates an invalid token sequence. Likewise, put `section-*` first and `webauthn` last.
- Replacing `type="text"` with `type="number"` just to get a numeric keyboard can change meaning, lose leading zeros, and introduce spinbutton behavior. `inputmode` is the keyboard hint.
- A field token is meaningful only when appropriate to the control. An autocomplete hint does not enforce a format or validate business rules.
- Asking for birth date, sex, payment data, or other sensitive information without a clear need increases privacy risk. Collect the minimum necessary and handle it carefully.
- `enterkeyhint="next"` is a presentation hint, not a focus-management script. Implement and test any custom focus behavior deliberately.
- `dirname` adds another submitted name/value pair. Ensure the server understands and safely handles it, including duplicate or attacker-controlled names.
- A label is not an error message. Associate validation feedback programmatically as well as visually; the detailed accessible error patterns are in the accessibility topic.

# Cross-item comparison

Choose the mechanism that conveys the intended meaning; these attributes are not interchangeable.

| Need | Use | Does not do |
| --- | --- | --- |
| Visible, clickable field name | `<label>` with `for`/`id`, or wrapping label | Validate the entered value |
| Tell browser what data a field represents | `autocomplete` standardized tokens | Guarantee saved data is available or filled |
| Suggest an on-screen keyboard | `inputmode` | Change type or validate |
| Hint capitalization/correction | `autocapitalize`, `autocorrect` | Reliably rewrite data in every browser |
| Hint enter-key presentation | `enterkeyhint` | Perform the hinted action |
| Include text direction in submission | `dirname` | Make the server trust the submitted direction |

# Knowledge checks with answers

1. **Can a page force the browser to autofill a field?** No. It can provide standardized autocomplete metadata; the user agent and user decide whether to offer or apply values.
2. **Does `inputmode="numeric"` make a value numeric or reject letters?** No. It hints at a virtual keyboard. Choose a meaningful `type` and validate the value separately.
3. **Can a form-associated custom element be labeled?** Yes. It is in the current standard's labelable elements category; its `ElementInternals.labels` exposes labels.
4. **Where does `webauthn` go in an autocomplete value?** It is the optional final token after a valid field name and is only valid on input and textarea; an actual credentials API request is still needed.
5. **What does `dirname` add?** A second submitted entry containing computed text direction under the supplied field name.

# Practice

1. Write labeled controls for a registration name, email, new password, and confirmation password. Add exact autocomplete tokens and explain which fields require separate sections, if any.
2. Model a billing and shipping address without collisions in autofill. Include two distinct `section-*` identifiers and appropriate address-level tokens.
3. A numeric-looking membership number may start with zero and contain letters. Choose `type`, `inputmode`, autocomplete, and validation strategy; explain why `type=number` is a poor fit.
4. Add a telephone field that requests mobile contact autofill and a phone keyboard. Which token order is valid?
5. Add a username/password sign-in form that can offer either saved password autofill or conditional passkey UI. State where `webauthn` belongs and which additional API is needed to actually authenticate.
6. Inspect a form with keyboard-only and screen-reader testing. Verify label activation, accessible names, focus order, error association, and that mobile keyboards remain usable.

# Worked solutions

1. Use separately labeled controls such as `<input name="name" autocomplete="name">`, `<input type="email" name="email" autocomplete="email">`, `<input type="password" name="password" autocomplete="new-password">`, and a separately named confirmation control that also uses `autocomplete="new-password"`. Use `inputmode="email"`/`autocapitalize="none"` on the email field only if helpful for target devices. These are one account-creation task, so they do not need separate `section-*` tokens; use distinct section tokens when the same form contains distinct datasets such as billing and shipping addresses.
2. For example, use `autocomplete="section-bill billing address-line1"` and `autocomplete="section-bill billing address-level2"` for billing, then `autocomplete="section-ship shipping address-line1"` and `autocomplete="section-ship shipping address-level2"` for shipping. The suffixes `bill` and `ship` are author-chosen group names; `billing`, `shipping`, and the address field names are standardized tokens. Match actual field semantics and do not assume every country has the same address structure.
3. Use `type="text"`, a stable field name, and `inputmode="numeric"` if a numeric keyboard is convenient. There is no standard autofill token for an arbitrary membership identifier, so omit `autocomplete` or choose an intentional autocomplete policy. Apply a precise format constraint only when the identifier format is known (for example, a `pattern` and explanatory help text), and validate/canonicalize it on the server. `type="number"` is wrong because arithmetic is not meaningful and leading zeros/letters may be significant.
4. `<input type="tel" autocomplete="mobile tel" inputmode="tel">` uses the optional contact qualifier before the `tel` field name. A section token may precede it, such as `section-profile mobile tel`. The user agent can ignore the keyboard/autofill hints.
5. Use `autocomplete="username webauthn"` on the username field and `autocomplete="current-password"` on the password field; `webauthn` is the optional final token and is valid on input/textarea. Conditional passkey sign-in still requires a WebAuthn `navigator.credentials.get()` request with a server-issued challenge and server-side credential verification. The autocomplete token only supplies a browser hint; it does not start authentication.
6. A useful repeatable check is: Tab to every control and confirm a visible focus indicator and logical order; activate each explicit/wrapping label and confirm it focuses/toggles the intended control; inspect each accessible name and group name in a screen reader; submit invalid and valid values and verify the error is visible, programmatically associated, announced, and focus can reach the invalid control; inspect mobile keyboard and enter-key hints on target devices; and repeat with autofill or scripting disabled where practical. Record actual browser/assistive-technology combinations because hint UI and announcements vary.

# Further reading

- [WHATWG HTML: Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
- [WHATWG HTML: The label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element)
- [WHATWG HTML: Input](https://html.spec.whatwg.org/multipage/input.html)
- [WHATWG HTML: Form control infrastructure and dirname](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html)
- [WHATWG HTML: Autocapitalization, autocorrection, and input modalities](https://html.spec.whatwg.org/multipage/interaction.html)
- [MDN: `<input>` reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input)
- [PCI SSC: Card verification code handling](https://www.pcisecuritystandards.org/faqs/are-merchants-allowed-to-request-card-verification-codes-values-from-cardholders/)

# Key takeaways

Use real labels for names, exact autocomplete tokens for standardized meanings, and input modality attributes only as device hints. The standardized autofill field names, section grouping, and contact qualifiers form a grammar whose order matters. Browsers retain control over suggestions and keyboards, so the form must remain understandable and correct when every hint is ignored.
