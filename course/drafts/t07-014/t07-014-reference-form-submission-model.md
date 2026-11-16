<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Form submission and entry-list APIs

# Scope and version

This reference covers native submission and entry-list construction under the current WHATWG HTML Living Standard. Form submission can navigate, submit to a server, or close a dialog; scripted interception changes who must manage feedback and errors. See [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), and [MDN form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form).

# How this group fits the mental model

The browser turns a form's successful controls into an ordered list of name/value entries, taking the active submitter into account. It then encodes that list according to the method and enctype, dispatches relevant events, and performs navigation or dialog behavior unless script cancels the default action.

# Supplied names explained

- `application/x-www-form-urlencoded` — Default-style form encoding, percent-encoding names/values into a URL query for GET or request body for POST. Spaces are encoded using form URL-encoding rules. It is not appropriate for binary file payloads.
- `multipart/form-data` — Multipart body encoding that can include file data and ordinary text fields. Use for native file uploads; when using `fetch` with `FormData`, normally let the browser set the boundary-containing Content-Type header.
- `text/plain` — Human-readable-ish form body encoding mainly useful for debugging. It is not a robust production interchange format.
- `GET form submission` — Serializes entries into the action URL's query component and navigates. Use for safe retrieval/search where sharing/bookmarking the URL is useful; do not put secrets or state-changing operations in GET.
- `POST form submission` — Sends encoded entries in a request body to the action. POST does not itself provide confidentiality; use HTTPS and server protections.
- `Submitter override attributes` — Submit button/input attributes that selectively override form defaults: action, method, enctype, target, or validation bypass. The chosen submitter is part of the submission context.
- `Successful controls` — Controls that contribute entries for this submission: they generally need a name, be enabled, and satisfy type-specific rules. Unchecked boxes/radios and inactive submit buttons do not contribute; selected options and chosen files contribute according to their states.
- `Entry list construction` — Browser algorithm that walks form-associated submittable controls in tree order, creates name/value entries, includes the submitter where relevant, and fires `formdata` after constructing the data. Duplicate names are allowed and yield multiple entries.
- `FormData` — Web API representing multipart-style key/value entries, including File objects. `new FormData(form)` serializes current successful controls; `new FormData(form, submitter)` can include a particular submitter's entry. Use `.getAll()` when names may repeat.
- `formdata event` — Event fired after the form's entry list is constructed, exposing the `FormData` object so script can inspect/add/delete entries. It does not replace the submit event or server validation.
- `submit event` — Form-level event fired when submission is initiated through user action or `requestSubmit()`, after validation succeeds (or bypass rules apply). Call `preventDefault()` to stop native navigation and handle the entire async/error experience yourself.
- `form.elements` — `HTMLFormControlsCollection` of listed controls associated with the form, including controls associated via the `form` attribute. Named controls can interact with legacy named access; avoid property-name collisions and prefer explicit selectors.
- `form.length` — Number of controls in the form's elements collection. It is not the number of successful submitted entries.
- `HTMLFormElement.submit()` — Direct submission method that bypasses interactive constraint validation and does not dispatch the `submit` event or identify a submit button as submitter. A named control can shadow this method through legacy named property access; avoid names that collide with form APIs.
- `HTMLFormElement.requestSubmit()` — Requests submission as if a submit button were activated. It runs validation, dispatches `submit`, and can use an explicit submitter whose override attributes/name/value apply. If no submitter is passed, the form itself is treated as the submitter context.
- `HTMLFormElement.reset()` — Resets controls to their default values/checkedness/selections, not necessarily blank. Dispatches the reset event, which can be canceled. A named control can shadow the method; avoid names colliding with methods/properties.
- `HTMLFormElement.checkValidity()` — Checks validity for all validation candidates owned by the form, fires `invalid` events on failures, and returns whether all are valid. It does not show the browser's validation UI.
- `HTMLFormElement.reportValidity()` — Checks form validity and requests browser reporting for invalid controls unless their `invalid` event is canceled; returns success/failure.

# Cross-item comparison

`submit()` bypasses the validation/event/submitter path; `requestSubmit()` follows it. GET is for safe retrieval and places data in the URL; POST uses a body but is not inherently confidential or safe. URL-encoded data handles ordinary fields; multipart is needed for files; plain text is mostly debugging. `FormData` is useful to inspect or enhance entry data while native navigation can remain the fallback.

# Examples

```js
const form = document.querySelector('form')
const saveButton = form.querySelector('[name="intent"][value="save"]')

form.addEventListener('submit', event => {
  event.preventDefault()
  const data = new FormData(form, event.submitter)
  send(data)
})

form.requestSubmit(saveButton)
```

If the handler cancels native submission, it now owns pending state, errors, duplicate submissions, and success behavior. For a normal POST form with a file input, set the form to `multipart/form-data` and keep a useful non-script fallback.

# Common mistakes

- Calling `submit()` to trigger validation or a submit handler.
- Assuming `FormData.get(name)` returns all duplicate-name entries; use `getAll` for that.
- Expecting unchecked checkbox values or every submit button to appear.
- Setting multipart `Content-Type` manually for a FormData fetch and omitting the browser-generated boundary.
- Putting passwords/tokens in a GET query string.
- Treating POST as encrypted without HTTPS.
- Assuming `form.length` equals submitted field count.
- Forgetting `preventDefault()` also means your code owns the full user feedback lifecycle.

# Knowledge checks with answers

1. Which API fires validation and `submit`? **`requestSubmit()`.**
2. Which method puts submitted data in the URL? **GET form submission.**
3. What encoding supports files? **`multipart/form-data`.**
4. How do you retrieve repeated entries? **`FormData.getAll(name)`.**
5. What is reset's target state? **Each control's default value/state, not universally empty.**

Sources: [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form).
