# HTML document structure metadata and semantic content elements — Reference: HTML global content attributes

## Scope and version

This lesson covers the supplied global attributes for current HTML elements, including custom-element and microdata-related attributes. See [WHATWG global attributes](https://html.spec.whatwg.org/multipage/dom.html#global-attributes) and the [MDN global attributes reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes).

## How this group fits the mental model

Global attributes can appear on many HTML elements, but “global” does not mean harmless or appropriate everywhere. Each attribute has specific semantics, parsing, support, and accessibility consequences.

## Supplied names explained

- `accesskey` — Suggests a keyboard shortcut; conflicts with operating-system/browser shortcuts and accessibility expectations make it unsuitable as a casual navigation mechanism.
- `autocapitalize` — Hints how virtual keyboards should capitalize user input; it is not a validation rule.
- `autocorrect` — Hints whether automatic correction should be enabled for editable text; support and platform behavior vary.
- `autofocus` — Requests focus on page load or dialog opening; excessive use can disorient users and move focus unexpectedly.
- `class` — Space-separated class tokens used by CSS and scripts; do not treat class names as stable security or data contracts.
- `contenteditable` — Makes content editable, with enumerated values and inheritance; editing does not automatically provide persistence or a complete rich-text editor.
- `data-*` — Custom data attributes exposed through `HTMLElement.dataset`; use for non-sensitive data, not secrets or authoritative state.
- `dir` — Sets text direction (`ltr`, `rtl`, or `auto`) and affects bidi layout; direction is distinct from language.
- `draggable` — Declares whether an element participates in HTML drag-and-drop; keyboard/touch alternatives still matter.
- `enterkeyhint` — Hints the label/action displayed on a virtual keyboard's Enter key.
- `headingoffset` — Experimental/newer global attribute that participates in computed heading-level offsets in descendants. Its precise integer value and algorithm are defined by the current Living Standard, but implementation and accessibility-tool support are not yet dependable across target environments; check current browser support before using it.
- `headingreset` — Experimental/newer boolean global attribute that bounds heading-offset computation across descendants under the current algorithm. Do not assume screen readers or heading-navigation tools expose the computed result consistently.
- `hidden` — Indicates content not currently relevant for rendering; current states include hidden and hidden-until-found behavior. It is not a substitute for authorization.
- `id` — Unique identifier within the document, used by fragment links and relationships; duplicate IDs make references ambiguous.
- `inert` — Makes a subtree noninteractive and removes it from sequential focus/accessibility interaction while it remains in the DOM.
- `inputmode` — Hints which virtual keyboard layout is useful; it does not validate or constrain input.
- `is` — Names a customized built-in custom element, subject to custom-element registration and platform support.
- `itemid` — Microdata global attribute that supplies an item identifier in a microdata item.
- `itemprop` — Associates a property name/value with a microdata item.
- `itemref` — References additional elements that contribute properties to a microdata item.
- `itemscope` — Declares a microdata item scope.
- `itemtype` — Identifies the vocabulary/type for a microdata item, usually with `itemscope`.
- `lang` — Declares language for an element's content, inherited by descendants unless overridden; use valid language tags when known.
- `nonce` — Supplies a CSP nonce for selected inline resources; it must be unpredictable, per-response as appropriate, and not exposed carelessly.
- `popover` — Declares an element as a popover, with auto/manual/hint behavior under current HTML; it is not a general replacement for every dialog/menu pattern.
- `spellcheck` — Hints whether editable text should be checked for spelling/grammar; user agents and platforms may vary.
- `style` — Inline CSS declaration block; CSP and maintainability may favor classes and external stylesheets.
- `tabindex` — Controls focusability and sequential focus order; prefer natural order and `0`/`-1` patterns, and avoid positive values.
- `title` — Advisory information, often surfaced as a tooltip; it is not a reliable accessible label by itself.
- `translate` — Hints whether an element's text and attribute values should be translated.
- `writingsuggestions` — Hints whether writing suggestions should be enabled for editable content; user-agent support and behavior vary.
- `part` — Exposes selected shadow-tree parts for styling from an outer tree.
- `slot` — Assigns light-DOM content to a named slot in a shadow tree.
- `exportparts` — Re-exports part names through nested shadow boundaries for styling.

## Cross-item comparison

`lang` identifies language; `dir` identifies direction. `hidden` removes content from ordinary rendering while `inert` suppresses interaction/focus; neither enforces server-side access control. `class` is a general styling/selection token; `data-*` carries custom element data. `slot`, `part`, and `exportparts` handle component composition and styling across shadow boundaries.

## Examples

```html
<section lang="ar" dir="rtl">
  <p>مرحبا</p>
</section>
<div data-record-id="42">Open record</div>
```

The custom data value is visible to the client and must not contain a secret or be trusted as proof of authorization.

## Common mistakes

- Treating a hint (`inputmode`, `enterkeyhint`, `spellcheck`) as validation or guaranteed keyboard behavior.
- Using `title` as the only label or putting important instructions only in a hover tooltip.
- Using positive `tabindex` to force a visual order that diverges from DOM order.
- Assuming `hidden`, `inert`, or a `data-*` value enforces security.
- Reusing duplicate IDs or using `autofocus` on every route.
- Shipping `headingoffset`/`headingreset` without verifying browser, accessibility tree, and heading-navigation tooling support.
- Treating `autofocus`, `autocorrect`, `writingsuggestions`, or keyboard hints as commands that every user agent must follow; several are hints with platform-dependent behavior.

## Knowledge checks with answers

1. **Does `inputmode="numeric"` reject letters?** No; it hints a virtual keyboard layout.
2. **How do `slot` and `part` differ?** `slot` assigns content; `part` exposes shadow content for styling.
3. **What security rule applies to `data-*`?** It is client-visible and untrusted; never store secrets or authorize from it.
