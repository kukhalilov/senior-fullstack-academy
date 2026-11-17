<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: All current input type states

# Scope and version

This is the full current `input` type-state inventory in the WHATWG HTML Living Standard last updated 2026-11-14. Picker UI and mobile keyboards vary by browser/locale, but state semantics and submission/validation rules are standardized. See [WHATWG input](https://html.spec.whatwg.org/multipage/input.html) and [MDN input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input).

# How this group fits the mental model

The `type` attribute selects an input state, not merely its visual style. It changes value sanitization, validation, keyboard hints, picker UI, applicable attributes, and sometimes whether the control is submitted or validated.

# Supplied names explained

- `type=hidden` — Non-rendered control for a value submitted with the form. It is not secret; users can inspect/change it. It does not participate in ordinary constraint validation.
- `type=text` — Single-line plain text, default state. Supports common text constraints such as `required`, `pattern`, `minlength`, and `maxlength`.
- `type=search` — Search-query text control, often with browser-specific search UI/clear affordances. Value and validation largely follow text behavior.
- `type=tel` — Telephone-number text control that may request a telephone keyboard. It intentionally does not define a universal phone-number syntax.
- `type=url` — URL text control with browser syntax validation for nonempty values and URL-oriented keyboard hints. It does not prove the destination is safe, reachable, or allowed by the application.
- `type=email` — Email-address control with browser syntax checking; `multiple` permits a comma-separated list. It does not verify mailbox existence or ownership.
- `type=password` — Text entry whose display is obscured by the browser. Obscuring characters is not encryption; use HTTPS and secure server handling.
- `type=date` — Date-only value, serialized as a normalized date string when supported. The localized picker/display can vary; do not parse localized visual text as the submitted value.
- `type=month` — Year-and-month value without a day. The UI varies; its value uses a normalized year-month representation.
- `type=week` — ISO week-year and week value. Week-year boundaries differ from calendar-year intuition; use the standardized value representation.
- `type=time` — Time-of-day value with optional seconds/fraction according to constraints. It represents a time, not a time zone or date.
- `type=datetime-local` — Local date and time without a time-zone offset. The server must define how to interpret timezone/locale context.
- `type=number` — Numeric control for numbers where a spinbutton/range-like numeric UI is appropriate. It is unsuitable for digit strings such as postal codes or card numbers; use text when leading zeroes/formatting are meaningful.
- `type=range` — Slider for choosing an approximate numeric value within bounds. It has default range behavior and is not ideal when exact values matter without a complementary numeric input.
- `type=color` — Color control with a normalized serialized color value. Current HTML adds `alpha` for alpha-channel selection and `colorspace` for color-space choice; UI support varies. Invalid/default behavior is defined by the standard, so do not assume all browsers expose advanced color UI identically.
- `type=checkbox` — Boolean or independently selectable choice. Only checked controls contribute a value; omitted `value` defaults to `on`. The `switch` content attribute requests two-state switch semantics/presentation; when present, indeterminate state has no effect. Support and appearance vary by browser. Group related choices with labels and names according to whether they represent one set or independent flags.
- `type=radio` — One-of-many choice. Radios with the same form owner and name form a group; only the checked member is submitted. Provide labels and a sensible initial/default selection when required.
- `type=file` — File picker. The `accept` attribute is a chooser hint, not server validation; the HTML Media Capture `capture` hint may request a camera/microphone choice on supported devices. The `files` property exposes selected File objects; `multiple` allows several. Use POST and `multipart/form-data` for native file submission.
- `type=submit` — Submit button state for an input, with optional name/value and form-override attributes. The activated submitter can affect the form request and entry list.
- `type=image` — Image submit button. It submits coordinate data for the click and can include an image source/alternative text; provide accessible `alt` text and understand coordinate submission.
- `type=reset` — Button that restores controls to their default values. It can surprise users and is often unnecessary in production forms.
- `type=button` — Generic button with no intrinsic form-submit/reset action. Use for scripted commands and label it clearly.

# Cross-item comparison

Choose by meaning: `email`/`url` provide semantic browser constraints; `tel` only hints telephone input; `number` models numeric quantities, while `text` preserves digit-string semantics; `date`, `month`, `week`, `time`, and `datetime-local` model distinct temporal values. Checkbox supports independent booleans; radio expresses one choice in a named group. Submit/image buttons are submitters; reset/button are not submissions.

# Examples

```html
<label for="birth-date">Birth date</label>
<input id="birth-date" name="birthDate" type="date" autocomplete="bday">

<label for="postal-code">Postal code</label>
<input id="postal-code" name="postalCode" type="text" inputmode="numeric" autocomplete="postal-code">
```

The second field remains text because postal codes are identifiers, not quantities; `inputmode` requests a numeric keyboard without imposing numeric parsing.

# Common mistakes

- Using `type=number` for values where leading zeros or symbols matter.
- Treating client `email`/`url` validation as proof of deliverability or safety.
- Assuming `datetime-local` includes a timezone.
- Trusting `accept` to validate uploaded file content.
- Forgetting unchecked checkbox/radio controls are omitted from submission.
- Assuming a browser will display identical color/date pickers everywhere.

# Knowledge checks with answers

1. Which type should represent a postal code? **Usually text, with an optional inputmode hint.**
2. Does `type=tel` validate a standard phone format? **No universal phone syntax is imposed.**
3. Does `datetime-local` include an offset? **No.**
4. What does `accept` do for file inputs? **Hints the file picker; server-side checks remain necessary.**
5. When is a checkbox value included? **When it is checked and otherwise successful.**
6. What changes when a checkbox has the `switch` attribute? **It represents a two-state switch; the underlying checkedness/submission model remains checkbox-like, and indeterminate state has no effect. Browser UI/support can vary.**

Sources: [WHATWG input](https://html.spec.whatwg.org/multipage/input.html), [MDN input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html).
