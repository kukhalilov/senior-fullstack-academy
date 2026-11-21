# HTML document structure metadata and semantic content elements — Reference: Interactive, customizable-select, and Web Component elements

## Scope and version

Current HTML Living Standard checked 2026-11-17. The customizable-select `<selectedcontent>` element is standardized but marked limited availability by MDN. See [WHATWG interactive elements](https://html.spec.whatwg.org/multipage/interactive-elements.html), [WHATWG selectedcontent](https://html.spec.whatwg.org/multipage/form-elements.html), and [MDN selectedcontent](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/selectedcontent).

## How this group fits the mental model

These elements provide native disclosure/dialog behavior or composition points for reusable components. Native semantics can reduce custom scripting, but behavior and browser support still need testing.

## Supplied names explained

- `<details>` — Disclosure widget whose content is shown or hidden; a `<summary>` supplies its visible label. Its `open` state and toggle behavior are native.
- `<dialog>` — Dialog box that can be modal or nonmodal. Modal display uses the dialog APIs and affects focus/inertness; provide a meaningful accessible name and a way to close it.
- `<selectedcontent>` — In customizable-select markup, its required parent is the first-child `<button>` inside `<select>`. The browser clones the selected `<option>` content into it, replacing that clone when selection changes; later script mutations to the option's descendants do not necessarily synchronize automatically. It has limited browser availability and older parsers may discard the new structure, so test target browsers and keep an appropriate fallback.
- `<summary>` — Caption/legend for a `<details>` disclosure. It should be the first summary child to label the disclosure.
- `<slot>` — Placeholder in a shadow tree where assigned light-DOM content is rendered; named slots match a `slot` attribute. It is a Web Component composition point.
- `<template>` — Holds inert document-fragment content that is not rendered until cloned/instantiated by script or a component.

## Cross-item comparison

`<details>` provides a native disclosure; `<dialog>` presents a dialog interaction and can be modal; neither is merely a styled container. `<template>` holds inert markup for later use, while `<slot>` marks where component-provided content appears. `<selectedcontent>` is a specialized customizable-select display mechanism and should not be confused with a general custom dropdown.

## Examples

```html
<details>
  <summary>Shipping options</summary>
  Standard shipping takes three to five days.
</details>

<select>
  <button><selectedcontent></selectedcontent></button>
  <option value="small">Small</option>
  <option value="large">Large</option>
</select>
```

The customizable select sample needs feature/support checks and accessible interaction testing. A native select without customized structure remains the robust fallback.

The mirrored subtree is a clone, not a live reference to the `<option>` node. Frameworks that update option descendants after initial rendering must account for the stale clone behavior documented for this feature.

## Common mistakes

- Placing arbitrary interactive controls inside summary and assuming all input behavior remains intuitive.
- Opening a modal dialog without focus management, accessible naming, or a close path.
- Treating a template as rendered content or assuming its descendants are active before insertion.
- Forgetting slot fallback/assignment behavior when composing a custom element.
- Depending on `<selectedcontent>` without a browser-support strategy or assuming its mirrored clone always stays synchronized with arbitrary DOM mutations.
- Assuming every browser preserves customizable-select child markup during HTML parsing; older implementations may remove nontraditional children.

## Knowledge checks with answers

1. **Which element labels a details disclosure?** `<summary>`.
2. **What makes dialog modality important?** It changes interaction/focus behavior beyond visual presentation.
3. **What is the key support caveat for selectedcontent?** It is standardized but not Baseline/limited availability; verify target browsers.
