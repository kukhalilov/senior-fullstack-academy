<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: HTMLFormElement properties, collections, and named access

# Scope and version

This reference covers the `HTMLFormElement` interface and the live collections it exposes in the current WHATWG HTML Living Standard, checked 2026-11-19. It complements the separate lessons on submission algorithms, `FormData`, validation, and control APIs. See [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html) and [MDN HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).

# How this group fits the mental model

A form element is both a submission configuration object and a live view over controls whose form owner is that form. The collection answers “which listed controls belong here?”; it is not the submission payload. Named properties are a legacy convenience and can collide with methods, so use explicit collections and IDs for predictable code.

# Supplied names explained

- `HTMLFormElement()` constructor — The HTML interface exposes the special HTML element constructor used as `super()` when defining a customized built-in element that extends `HTMLFormElement`. Calling `new HTMLFormElement()` directly throws; create an ordinary form with `document.createElement("form")`.
- `acceptCharset` — Reflects `accept-charset`. The current standard accepts UTF-8 for form submission; the historical plural interface does not imply arbitrary encodings are supported.
- `action` — Reflects the submission URL, resolved as a URL by the platform. An empty/missing value follows the standard's current document URL behavior.
- `autocomplete` — Reflects the form's `on`/`off` autofill default for descendant/form-owned controls; individual controls can specify their own field tokens or policy.
- `enctype` and `encoding` — `enctype` reflects the selected entry-list encoding; `encoding` is a legacy alias. The default is URL-encoded, `multipart/form-data` carries files, and `text/plain` is not a robust production format.
- `method` — Reflects the submission method (`get`, `post`, or `dialog` state); missing/invalid values use the standard default. `dialog` is for a form associated with a dialog and does not issue an HTTP request.
- `name` — Names the form in `document.forms`; it does not become a request field.
- `noValidate` — Reflects `novalidate`, bypassing interactive validation during submission, not explicit calls to validation methods or server checks.
- `target` — Names the navigable that receives a submission response; it does not affect script-created `fetch()` requests.
- `rel` and `relList` — Reflect the form's link relationship tokens that apply to form-created navigations. `relList` is a live `DOMTokenList`.
- `elements` — A live `HTMLFormControlsCollection` of listed form-associated controls owned by this form. Image submit inputs are excluded for historical reasons. `fieldset` and `output` may appear here even though they do not contribute ordinary name/value entries; `object` is also listed.
- `length` — Current number of entries in `elements`; it changes as controls are associated or removed.
- Indexed access — `form[index]` retrieves a listed control at that index, equivalent to collection indexing; it is not a stable identifier if the collection changes.
- Named access — `form[nameOrId]` can return a matching listed control or `RadioNodeList` when several match. Legacy named access can shadow built-in properties/methods. Prefer `form.elements.namedItem("field")` or `form.elements["field"]` and avoid control names/IDs such as `submit`, `reset`, `action`, `method`, `elements`, or `length`.
- `document.forms` — A live `HTMLCollection` of forms in the document; lookup can use index, `id`, or `name`, but `document.getElementById()` is clearer for a unique ID.
- Form named property masking — HTML's legacy override-built-ins behavior exposes names/IDs as properties. It can make `form.submit` resolve to a control instead of the method, so `form.submit()` may fail. Use non-conflicting control names, or invoke the prototype method deliberately when legacy markup cannot be changed.

# Cross-item comparison

`form.elements` follows form ownership rather than DOM nesting and is live. `FormData(form)` instead snapshots successful entries under submission rules. Disabled/unnamed controls and unchecked choices can be in `elements` but absent from `FormData`; image buttons are excluded from `elements` even though a selected image submitter contributes coordinates during actual submission. `HTMLFormControlsCollection.namedItem()` can return a `RadioNodeList` for multiple matching names/IDs.

# Examples

```js
const form = document.querySelector("#profile-form")
const email = form.elements.namedItem("email")

if (email instanceof RadioNodeList) {
  console.log(email.length) // several controls share the name/id
} else {
  console.log(email?.value)
}

console.log(form.length) // same count as the live form.elements collection
```

If the form has a control named `submit`, `form.submit` may be that control rather than the function. Use `requestSubmit()` for normal scripted submission so validation, `submit`, and submitter semantics run.

# Common mistakes

- Treating `form.elements` as a serialized list of submitted entries.
- Assuming a visually nested control belongs to the nearest form when its `form` attribute points elsewhere.
- Relying on named access as a type-safe map.
- Naming a control `submit` or `reset` and shadowing a method.
- Assuming `acceptCharset` provides broad legacy encoding selection.
- Assuming `form.target` or `form.rel` configures a `fetch()` call.

# Knowledge checks with answers

1. Is `form.elements` live or a submission snapshot? **It is a live collection of listed associated controls.**
2. Can `fieldset` appear in `form.elements` but not in `FormData`? **Yes; it is listed but not submittable.**
3. What is `encoding` relative to `enctype`? **A legacy alias.**
4. Why can `form.submit()` stop working after adding an input named `submit`? **Legacy named property access can shadow the method.**
5. What is the safer lookup for a named control? **`form.elements.namedItem(name)` or indexed collection access.**

Inventory names covered: HTMLFormElement() constructor; HTMLFormElement.acceptCharset; HTMLFormElement.action; HTMLFormElement.autocomplete; HTMLFormElement.enctype; HTMLFormElement.encoding; HTMLFormElement.method; HTMLFormElement.name; HTMLFormElement.noValidate; HTMLFormElement.target; HTMLFormElement.rel; HTMLFormElement.relList; HTMLFormElement.elements; HTMLFormElement.length; HTMLFormElement indexed access; HTMLFormElement named access; document.forms; form named property masking.

Sources: [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [MDN HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement), [MDN HTMLFormControlsCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection).
