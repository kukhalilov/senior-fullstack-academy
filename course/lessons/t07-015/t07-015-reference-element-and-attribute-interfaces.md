
# Browser DOM events storage observers and navigation APIs — Reference: Element querying, attributes, classes, and content APIs

# Scope and version

This reference covers generic Element APIs from WHATWG DOM and HTML integration, including selection, attributes, classes, tree convenience methods, geometry, scrolling, fullscreen, and shadow-root attachment. The DOM/HTML standards were checked 2026-11-19. CSSOM View's current Editor's Draft was checked 2026-11-19 for scrolling/visibility signatures and is work in progress; browser support can differ, so feature-detect newer options and return behavior. See [WHATWG DOM](https://dom.spec.whatwg.org/), [CSSOM View Editor's Draft](https://drafts.csswg.org/cssom-view/), and [MDN Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).

# How this group fits the mental model

`Element` is a specialized Node with a namespace-qualified element name, attributes, child-element views, selector APIs, layout-related queries, and convenience mutations. Its methods can either operate on node objects or parse strings as markup; these are different security and correctness paths.

# Supplied names explained

- `Element` — Base interface for document elements and the main API surface for attributes, selectors, and element-specific behavior.
- `Element.tagName` — Qualified name, usually uppercase for HTML elements in HTML documents; namespace/localName are more suitable for exact comparisons across XML/SVG contexts.
- `Element.localName` — Namespace-local element name without a prefix; in HTML documents it is normally lowercase.
- `Element.namespaceURI` — Namespace URI identifying the element's vocabulary, such as HTML or SVG.
- `Element.prefix` — Namespace prefix or null; prefixes are not the namespace identity itself.
- `Element.assignedSlot` — Slot element receiving this light-DOM node, or null when it is not assigned; see the shadow-root lesson.
- `Element.slot` — Name of the slot to which this light-DOM element is assigned; it reflects the `slot` attribute.
- `Element.part` — `DOMTokenList` view of the `part` attribute, used to expose selected shadow-tree styling hooks.
- `Element.id` — Reflects the `id` content attribute as a string; uniqueness is an author responsibility.
- `Element.className` — Reflects the class attribute as a string for ordinary HTML elements. On `SVGElement`, it can be an `SVGAnimatedString`; use attribute methods when interoperating with SVG class values.
- `Element.classList` — Live `DOMTokenList` view of class tokens with token-safe mutation helpers.
- `Element.attributes` — Live NamedNodeMap of attribute nodes; use attribute APIs for typical code instead of depending on map ordering.
- `Element.children` — Live HTMLCollection of child elements only.
- `Element.childElementCount` — Number of child elements, excluding text/comments.
- `Element.firstElementChild` — First child element or null.
- `Element.lastElementChild` — Last child element or null.
- `Element.nextElementSibling` — Next sibling element, skipping text/comments.
- `Element.previousElementSibling` — Previous sibling element, skipping text/comments.
- `Element.matches()` — Tests whether this element matches a CSS selector.
- `Element.webkitMatchesSelector()` — Legacy vendor-prefixed alias of `matches()` retained for compatibility; use the standard method.
- `Element.closest()` — Searches this element then ancestors up to the tree boundary for the nearest selector match.
- `Element.querySelector()` — Returns the first matching descendant or null.
- `Element.querySelectorAll()` — Returns a static NodeList snapshot of matching descendants.
- `Element.getAttribute()` — Returns an attribute's string value or null when absent. In HTML documents, attribute names are ASCII case-insensitive.
- `Element.getAttributeNS()` — Returns the value identified by namespace URI and local name, or null; use this for namespaced XML/SVG attributes.
- `Element.getAttributeNames()` — Returns an array of attribute names present on the element.
- `Element.setAttribute()` — Sets/creates a string-valued attribute. Boolean HTML attributes are true by presence; setting the string `"false"` still means present/true.
- `Element.setAttributeNS()` — Sets an attribute using a namespace URI and qualified name; namespace/prefix combinations are validated and invalid combinations throw.
- `Element.removeAttribute()` — Removes an attribute if present.
- `Element.removeAttributeNS()` — Removes the attribute identified by namespace URI and local name.
- `Element.toggleAttribute()` — Adds/removes a boolean-style attribute and returns its resulting presence; optional force controls desired state.
- `Element.hasAttribute()` — Tests attribute presence, not whether its textual value is truthy.
- `Element.hasAttributes()` — Returns whether any attributes are present.
- `Element.hasAttributeNS()` — Tests presence using namespace URI and local name.
- `Element.getAttributeNode()` — Returns the Attr node for a named attribute or null; low-level API.
- `Element.getAttributeNodeNS()` — Returns the Attr node by namespace/local name, or null; use it only when the attribute node itself is needed.
- `Element.setAttributeNode()` — Attaches/replaces an Attr node, subject to ownership/in-use errors. Prefer `setAttribute()` for ordinary string updates.
- `Element.setAttributeNodeNS()` — Attaches a namespaced Attr node; use `setAttributeNS()` when no Attr object is otherwise needed.
- `Element.removeAttributeNode()` — Removes and returns an Attr node; throws if it is not an attribute of this element.
- `Element.insertAdjacentElement()` — Legacy relative-insertion method. Inserts an element at one of four positions and returns the inserted element, or null when the requested outer position has no parent.
- `Element.insertAdjacentText()` — Legacy relative-insertion method. Inserts a text node at one of four positions; its argument is text, not parsed markup.
- `Element.insertAdjacentHTML()` — Parses a string and inserts the resulting markup at a relative position. It is an HTML injection sink; do not pass untrusted strings. Prefer Sanitizer API safe methods or a maintained sanitizer.
- `Element.before()` — Inserts nodes or strings before the element; strings become Text nodes.
- `Element.after()` — Inserts nodes or strings after the element; strings become Text nodes.
- `Element.append()` — Appends nodes or strings inside the element; strings become Text nodes.
- `Element.prepend()` — Prepends nodes or strings inside the element; strings become Text nodes.
- `Element.replaceWith()` — Replaces the element with nodes or text arguments.
- `Element.remove()` — Removes this element from its parent if one exists.
- `Element.replaceChildren()` — Replaces children using nodes/strings; strings become Text nodes.
- `Element.getBoundingClientRect()` — Returns a viewport-relative union rectangle including padding and border; values can change with scrolling/layout.
- `Element.getBoxQuads()` — Returns a `DOMQuad` per relevant box fragment in the current CSSOM View Editor's Draft. The API is not uniformly implemented; feature-detect it and treat the draft details as work in progress.
- `GeometryUtils.convertQuadFromNode()`, `GeometryUtils.convertRectFromNode()`, and `GeometryUtils.convertPointFromNode()` — Current CSSOM View Editor's Draft coordinate-conversion methods shared with `Element`; they convert geometry from another node's coordinate space and have limited implementation support.
- `Element.getClientRects()` — Returns per-fragment rectangles, useful for inline elements spanning lines.
- `Element.clientHeight` — Inner height including padding but excluding borders, margins, and horizontal scrollbar.
- `Element.clientWidth` — Inner width including padding but excluding borders, margins, and vertical scrollbar.
- `Element.clientTop` — Width of the top border, with special scrollbar/layout behavior depending on writing mode and platform.
- `Element.clientLeft` — Width of the left border, with special scrollbar/layout behavior depending on direction/platform.
- `Element.scrollHeight` — Height of the content/scroll area including overflowed content; its precise measurement follows CSSOM View rounding rules.
- `Element.scrollWidth` — Width of the content/scroll area including overflowed content.
- `Element.scrollTop` — Vertical scroll offset; can be fractional, negative for some reverse-flow layouts, and may change during smooth scrolling.
- `Element.scrollLeft` — Horizontal scroll offset; direction/writing-mode behavior matters, including RTL.
- `Element.scrollTo()` — Scrolls this element's scrolling box to coordinates/options; it is an alias of `scroll()` and current MDN documents a Promise result with an `interrupted` flag.
- `Element.scrollBy()` — Scrolls by a relative offset/options; current MDN documents a Promise result with an `interrupted` flag.
- `Element.scroll()` — Coordinate/options scrolling method on the element; current MDN documents a Promise result with an `interrupted` flag.
- `Element.scrollIntoView()` — Scrolls ancestor containers so the element becomes visible, optionally controlling block/inline alignment, behavior, and which container moves; current MDN documents a Promise result with an `interrupted` flag.
- `ScrollOptions.behavior` — Selects `"auto"`, `"instant"`, or `"smooth"`; `auto` follows applicable CSS scroll behavior.
- `ScrollToOptions.left` and `ScrollToOptions.top` — Optional horizontal and vertical target coordinates; coordinate overloads provide the same values positionally.
- `ScrollIntoViewOptions.block` and `ScrollIntoViewOptions.inline` — Logical alignment values `"start"`, `"center"`, `"end"`, or `"nearest"` for the block and inline axes.
- `ScrollIntoViewOptions.container` — Current CSSOM View Editor's Draft option, `"all"` (default) or `"nearest"`, limiting which scrolling ancestor containers are affected; feature-detect because it is newer than widely deployed options.
- `ScrollResult.interrupted` — Boolean in the Promise result documented for current scroll methods; true when that operation was interrupted, such as by another scroll.
- `Element.moveBefore()` — Moves a child node before a reference node while preserving state for supported stateful elements; unlike remove+insert, it is designed for state-preserving moves and has hierarchy/reference constraints.
- `Element.checkVisibility()` — Reports whether the element is expected to be rendered/visible under selected checks; it is not a guarantee of perceptibility or that the element is unobscured.
- `CheckVisibilityOptions.checkOpacity` and `CheckVisibilityOptions.opacityProperty` — Opt into checking for zero opacity; the latter is the newer spelling in the current CSSOM View Editor's Draft.
- `CheckVisibilityOptions.checkVisibilityCSS` and `CheckVisibilityOptions.visibilityProperty` — Opt into checking CSS visibility; the latter is the newer spelling in the current CSSOM View Editor's Draft.
- `CheckVisibilityOptions.contentVisibilityAuto` — Opts into checking whether an ancestor's `content-visibility: auto` skips rendering its contents.
- `Element.currentCSSZoom` — Effective CSS zoom value in the element's rendering context; it is read-only and newer than the classic geometry properties.
- `Element.setPointerCapture()` — Captures subsequent pointer events for a pointer ID to this element until release/cancellation; useful when a drag leaves its original hit target.
- `Element.hasPointerCapture()` — Tests whether this element currently owns capture for a pointer ID.
- `Element.releasePointerCapture()` — Releases capture for a pointer ID; pointer cancellation/loss events still require handling.
- `Element.requestPointerLock()` / `Element.requestPointerLock(options)` — Requests exclusive pointer movement. The current Pointer Lock standard reports success/failure through document-level `pointerlockchange` and `pointerlockerror` events; the Promise-returning form described by current MDN is a proposal and is not yet consistently implemented. Requires transient user activation and an active document; iframe sandboxing/policy can restrict it.
- `PointerLockOptions.unadjustedMovement` — When true, requests raw movement without platform pointer acceleration; support and permission can vary, so handle failure.
- `pointerlockchange` and `pointerlockerror` — Document events for Pointer Lock state changes and request errors in the current standard.
- `Element.requestFullscreen()` / `Element.requestFullscreen(options)` — Requests fullscreen presentation and returns a Promise that fulfills when the transition completes or rejects. It is subject to transient user activation, Permissions Policy, and user-agent decisions; handle rejection and observe fullscreen state/events.
- `FullscreenOptions.navigationUI` — `"auto"`, `"show"`, or `"hide"` controls whether browser navigation UI remains visible in fullscreen; the user agent may constrain the result.
- `FullscreenOptions.screen` — A `ScreenDetailed` target for selecting a display; availability depends on the Window Management API and permission/support.
- `FullscreenOptions.keyboardLock` — `"none"` or `"browser"` requests keyboard-lock behavior integrated with fullscreen; support is evolving and the browser must retain a way to exit.
- `Element.attachShadow()` — Creates/attaches a shadow root under options such as `mode` (`open` or `closed`); some shadow features/options have constraints and browser support varies. It can throw when the element cannot host a root or already has one.
- `Element.shadowRoot` — Returns the open shadow root or null. Closed roots are not exposed through this property, though code holding the returned root can still use it.
- `Element.customElementRegistry` — Returns the registry associated with this element, or null; it is relevant to scoped custom-element registries.
- `DOMTokenList` — Token-list interface used by classList and other token-valued attributes; whitespace token rules apply.
- `DOMTokenList.length` — Number of tokens in the current ordered token set.
- `DOMTokenList.item()` — Returns a token by index, or null when the index is outside the list; bracket indexing is also supported.
- `DOMTokenList.add()` — Adds one or more tokens, throwing for invalid empty/whitespace-containing tokens.
- `DOMTokenList.remove()` — Removes named tokens.
- `DOMTokenList.toggle()` — Toggles a token, or forces presence/absence with a boolean second argument; returns resulting presence.
- `DOMTokenList.replace()` — Replaces one token with another and returns whether the old token existed.
- `DOMTokenList.contains()` — Tests token membership.
- `DOMTokenList.value` — Serialized token string; assigning replaces the token list subject to parsing rules.
- `DOMTokenList.supports()` — Checks whether a token is supported by the associated attribute. It throws `TypeError` when that attribute defines no supported-token set; `classList` is such an attribute.
- `DOMTokenList.entries()`, `DOMTokenList.keys()`, `DOMTokenList.values()`, `DOMTokenList.forEach()`, and `DOMTokenList[Symbol.iterator]` — Iteration methods supplied by the interface's iterable declaration; iteration yields tokens in list order.

# Attributes: presence, values, and namespaces

`setAttribute('disabled', 'false')` still sets a present boolean attribute. For boolean state, use the property or remove the attribute. Attribute APIs store strings; they do not validate application meaning. A string-safe setter is not a URL policy: validate URL schemes/destinations separately before rendering links or resource URLs.

HTML element attribute names are normalized/case-insensitive in HTML documents; XML and namespaced content follow different case/namespace rules. Use namespace-aware Node APIs for XML/SVG attributes when required. `attributes` is live; do not assume stable enumeration order for business logic.

# Mutations and security

Prefer node methods (`append`, `replaceChildren`) and `textContent` for plain text. `insertAdjacentHTML()` parses arbitrary markup and is a security-sensitive sink; Trusted Types can help enforce a policy but does not supply a correct sanitizer by itself. The current safe Sanitizer API provides context-aware insertion methods where implemented; see the companion Sanitizer API lesson.

# Geometry and scrolling

Geometry methods report layout snapshots in CSS pixels. `getBoundingClientRect()` is viewport-relative, so scrolling changes its top/left values. `getClientRects()` can return multiple fragments. Reads after writes may force style/layout work; batch reads before writes when measuring many elements. `scrollIntoView()` may scroll multiple ancestors and the viewport according to options/CSS, so test nested scroll containers and reduced-motion preferences.

# Examples

```js
const button = document.querySelector("button[data-action]");
if (button?.hasAttribute("disabled")) {
  button.removeAttribute("disabled");
}
button?.classList.toggle("is-active", true);
```

Boolean HTML attributes are controlled by presence: `disabled="false"` still disables a button. Use the reflected boolean property or remove the attribute to enable it.

# Common mistakes

- Treating `getAttribute()` null as an empty string or as a boolean value; absence is distinct from a present empty attribute.
- Setting a boolean attribute to the text `"false"` and expecting it to be disabled.
- Building CSS selectors with unescaped user-controlled IDs.
- Assuming `children` and `attributes` are static snapshots; they are live collections.
- Using `insertAdjacentHTML()` with user input because it is shorter than node construction.
- Treating `getBoundingClientRect()` values as document coordinates; account for scrolling when converting.
- Calling `requestFullscreen()` without user activation or ignoring its rejected Promise.
- Assuming `shadowRoot` reveals a closed root.
- Using classList tokens with whitespace or empty strings.

# Cross-item comparison

| Operation | Node-safe API | Parses HTML? |
| --- | --- | --- |
| Insert plain string | `append()` / `before()` / `textContent` | No; string becomes text |
| Insert markup string | Sanitizer safe APIs where supported | Yes, with safe filtering |
| Legacy relative markup insert | `insertAdjacentHTML()` | Yes; unsafe unless controlled |
| Read element geometry | `getBoundingClientRect()` | No; returns viewport-relative rectangle |
| Read inline fragments | `getClientRects()` | No; returns a list of rectangles |
| Add a class | `classList.add()` | No; token validation applies |
| Set an attribute | `setAttribute()` | No; stores a string and does not validate URL/security semantics |

# Knowledge checks with answers

1. **Does `setAttribute('hidden', 'false')` show the element?** No. The boolean attribute is present, so it is true.
2. **Does `append('<b>hi</b>')` create a bold element?** No. It inserts a Text node. `insertAdjacentHTML()` parses markup but is an injection sink.
3. **Why does `getBoundingClientRect().top` change after scrolling?** Its coordinates are relative to the viewport.
4. **Can `Element.shadowRoot` return a closed root?** No; it returns null for a closed root.
5. **What must happen after `requestFullscreen()`?** Handle Promise fulfillment/rejection and observe fullscreen state/events; permission/activation can prevent entry.

# Further reading

- [WHATWG DOM](https://dom.spec.whatwg.org/)
- [WHATWG HTML dynamic markup insertion](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [MDN Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [MDN DOMTokenList](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList)
