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
- `FormData` — Web API representing an ordered list of form entries, including strings and `File` objects, with duplicate names preserved. Its constructor and all collection methods are detailed below. Sending it with `fetch` uses multipart form data; do not manually set the boundary-bearing `Content-Type` header. Use `.getAll()` when names may repeat.
- `formdata event` — Event fired after the form's entry list is constructed, exposing the `FormData` object so script can inspect/add/delete entries. It does not replace the submit event or server validation.
- `submit event` — Form-level event fired when submission is initiated through user action or `requestSubmit()`, after validation succeeds (or bypass rules apply). Call `preventDefault()` to stop native navigation and handle the entire async/error experience yourself.
- `form.elements` — `HTMLFormControlsCollection` of listed controls associated with the form, including controls associated via the `form` attribute. Named controls can interact with legacy named access; avoid property-name collisions and prefer explicit selectors.
- `form.length` — Number of controls in the form's elements collection. It is not the number of successful submitted entries.
- `HTMLFormElement.submit()` — Direct submission method that bypasses interactive constraint validation and does not dispatch the `submit` event or identify a submit button as submitter. A named control can shadow this method through legacy named property access; avoid names that collide with form APIs.
- `HTMLFormElement.requestSubmit()` — Requests submission as if a submit button were activated. It runs validation, dispatches `submit`, and can use an explicit submitter whose override attributes/name/value apply. If no submitter is passed, the form itself is treated as the submitter context.
- `HTMLFormElement.reset()` — Resets controls to their default values/checkedness/selections, not necessarily blank. Dispatches the reset event, which can be canceled. A named control can shadow the method; avoid names colliding with methods/properties.
- `HTMLFormElement.checkValidity()` — Checks validity for all validation candidates owned by the form, fires `invalid` events on failures, and returns whether all are valid. It does not show the browser's validation UI.
- `HTMLFormElement.reportValidity()` — Checks form validity and requests browser reporting for invalid controls unless their `invalid` event is canceled; returns success/failure.

# FormData and collection APIs

| API | What it does |
| --- | --- |
| `FormData() constructor` — `new FormData(form?, submitter?)` | Creates an entry list. If `form` is provided, it uses that form's current successful controls and fires its `formdata` event. An optional submitter adds that submit button's entry; it must be a submit button owned by the form or the constructor throws. Without a form, the object starts empty. |
| `FormData.append()` | Appends a new string/File entry, preserving existing entries with the same name. A `Blob`/`File` may be used for the value; the optional filename controls its reported filename where applicable. |
| `FormData.delete()` | Removes all entries with that name. |
| `FormData.get(name)` | Returns the first matching value, or `null` if absent. |
| `FormData.getAll()` | Returns all matching values in their entry order, or an empty array. |
| `FormData.has()` | Reports whether at least one entry has that name. |
| `FormData.set()` | Replaces the existing values with that name with one value, or appends one if absent. Use `append()` when repeated values are intentional. |
| `FormData.entries()` / `FormData.keys()` / `FormData.values()` | Return iterators over entries, names, or values in entry order. The default `FormData` iterator (the `FormData iterator`) is equivalent to `entries()`, so `for...of formData` yields `[name, value]` pairs. |
| `FormData.forEach(callback, thisArg?)` | Calls the callback once per entry in order, with `(value, name, formData)`. |
| FormDataEvent() constructor | Creates a synthetic event with an explicitly supplied `FormData` object. Dispatching a synthetic event does not run the browser's native entry-list construction algorithm. |
| `FormDataEvent.formData` | Read-only reference to the constructed `FormData` object on a `formdata` event. Its entries can be inspected or modified by the handler. |
| SubmitEvent() constructor | Creates a synthetic submit event and can be given a `submitter` in its init dictionary. Dispatching it does not submit the form or run native validation; use `requestSubmit()` to request actual form submission. |
| `SubmitEvent.submitter` | The submit button that initiated the submission, or `null` when there was no button submitter. Use it to preserve which operation the user selected. |
| `HTMLCollection.item(index)` | Returns the listed form control at a zero-based position in the collection, or `null` when there is no item at that index. `HTMLFormControlsCollection` inherits this indexed-collection API. |
| `HTMLFormControlsCollection.namedItem()` | `HTMLFormControlsCollection.namedItem(name)` finds a listed form control by matching `name` or `id`; returns an element, a `RadioNodeList` when multiple controls match, or `null`. It is a lookup API, not the serialized data list. |

Duplicate names are a list-shaped data model, not a plain object. Converting `FormData` directly into an object can lose earlier values; use `getAll()` or iterate entries when duplicates matter.

# Cross-item comparison

`submit()` bypasses the validation/event/submitter path; `requestSubmit()` follows it. GET is for safe retrieval and places data in the URL; POST uses a body but is not inherently confidential or safe. URL-encoded data handles ordinary fields; multipart is needed for files; plain text is mostly debugging. `FormData.get()` returns only the first same-name entry, `getAll()` returns all, `append()` preserves duplicates, and `set()` replaces them. `form.elements` and `namedItem()` expose controls, while `FormData` exposes the filtered serialized entries.

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
6. What does `new FormData(form, submitter)` add beyond `new FormData(form)`? **It includes the specified submit button's name/value entry, if it has one.**
7. Which method preserves an existing same-name entry, `append()` or `set()`? **`append()`; `set()` replaces the same-name values.**
8. What does `get()` return when several entries share a name? **Only the first; use `getAll()` for all of them.**
9. What does `form.elements.namedItem(name)` return for multiple matching controls? **A `RadioNodeList`, not the serialized form entries.**
10. Which callback argument order does `FormData.forEach()` use? **`(value, name, formData)`.**
11. Does dispatching `new SubmitEvent("submit")` make the browser submit the form? **No. It only dispatches a synthetic event; `requestSubmit()` requests the native validation and submission path.**
12. What does `form.elements.item(index)` return for an out-of-range index? **`null`.**

Sources: [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WHATWG FormData interface](https://xhr.spec.whatwg.org/#interface-formdata), [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData), [MDN form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form).
