<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: Text, markup, parsing, and serialization surfaces

# Scope and version

This lesson covers DOM text and markup properties, ranges/selections, parsing/serialization APIs, and Trusted Types values, checked against the current DOM, HTML, Selection API, and CSSOM View sources on 2026-11-19. Current HTML includes the `getHTML()` serialization API with optional declarative shadow-root serialization; the standard status does not guarantee support in every target browser. See [WHATWG DOM](https://dom.spec.whatwg.org/), [WHATWG dynamic markup insertion](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html), [Selection API](https://w3c.github.io/selection-api/), and [CSSOM View](https://drafts.csswg.org/cssom-view/).

# How this group fits the mental model

There are three different operations: reading/writing text, parsing HTML/XML strings into nodes, and serializing nodes back to strings. Text APIs do not interpret markup; parser/sink APIs do. Serialization does not sanitize content and does not preserve every hidden/runtime property. A sanitized node tree serialized to a string must be treated as untrusted if parsed again.

# Supplied names explained

- `innerHTML` — Gets markup for an element's descendants or parses/replaces them on assignment. The setter is an injection sink and does not sanitize by default. Templates parse into template contents; ShadowRoot has its own innerHTML behavior.
- `outerHTML` — Gets serialized markup including the element or replaces the element with parsed markup on assignment. Setting can be a Trusted Types sink and is unsafe for untrusted strings without a correct policy.
- `Element.getHTML()` — Serializes an element's subtree and can include declarative shadow roots according to options. It is a serializer, not a sanitizer.
- `ShadowRoot.getHTML()` — Serializes a shadow root's children using its host as parsing/serialization context; nested roots follow options.
- `GetHTMLOptions.serializableShadowRoots` — When true, serializes nested roots marked serializable. Default false leaves shadow roots out.
- `GetHTMLOptions.shadowRoots` — Explicit array of shadow roots to serialize regardless of their serializable flag; this can expose component internals, so decide deliberately.
- `textContent` — Gets descendant text or replaces children with a text node when set. It does not apply CSS visibility/layout and does not parse tags.
- `innerText` — Gets rendered/visually relevant text and may trigger layout; setting it performs text-oriented replacement with line-break processing. It is not identical to `textContent`.
- `insertAdjacentHTML()` — Parses HTML relative to the element at `beforebegin`, `afterbegin`, `beforeend`, or `afterend`. It is an injection sink; use safe Sanitizer methods or a reviewed sanitizer for untrusted content.
- `Range` — Represents a live boundary-point selection in a DOM tree; it can span nodes and is adjusted as the tree mutates.
- `Range()` — Creates a live range initially collapsed at the associated document's start.
- `Range.selectNode()` — Selects a node and its contents by placing range boundaries immediately before and after it.
- `Range.selectNodeContents()` — Selects all children of a node without selecting the node itself.
- `Range.deleteContents()` — Deletes the selected portion and collapses the range according to the algorithm.
- `Range.extractContents()` — Removes selected content and returns it in a DocumentFragment; partially selected ancestor structure may be cloned into the fragment.
- `Range.cloneContents()` — Returns a cloned DocumentFragment of selected content without removing it.
- `Range.insertNode()` — Inserts a node at the range start, splitting a Text node when needed.
- `Range.surroundContents()` — Wraps selected content in a node, but throws if the range partially contains a non-Text node; it is not a general rich-text wrapping shortcut.
- `Range.startContainer`, `Range.startOffset`, `Range.endContainer`, `Range.endOffset`, and `Range.collapsed` — Read-only boundary-point state inherited from AbstractRange; offsets count character-data units for text-like nodes and child positions for container nodes.
- `Range.setStart()`, `Range.setEnd()`, `Range.setStartBefore()`, `Range.setStartAfter()`, `Range.setEndBefore()`, and `Range.setEndAfter()` — Set range boundary points; setting an endpoint before the current start or after the current end can collapse the range according to the live-range rules.
- `Range.commonAncestorContainer` — Nearest node that contains both boundary-point containers.
- `Range.START_TO_START`, `Range.START_TO_END`, `Range.END_TO_END`, and `Range.END_TO_START` — Numeric constants accepted by `compareBoundaryPoints()` to select which endpoints are compared.
- `Range.compareBoundaryPoints()` — Compares boundary points using one of the constants; the numeric result indicates ordering.
- `Range.cloneRange()` — Creates a distinct live Range with the same boundary points; later mutation adjusts both independently.
- `Range.detach()` — Historical no-op retained for compatibility; ranges do not need explicit detachment in current DOM.
- `Range.isPointInRange()`, `Range.comparePoint()`, and `Range.intersectsNode()` — Test a boundary point or node against the range; invalid roots/offsets have defined false/exception behavior.
- `Range.createContextualFragment()` — Parses input as HTML/XML in the range's context and returns a DocumentFragment. It is an injection sink, not a sanitizer; use Trusted Types and sanitization where untrusted input is possible.
- `Range.getClientRects()` and `Range.getBoundingClientRect()` — CSSOM View geometry snapshots for selected fragments and their union; detached ranges can return an empty list/zero rectangle.
- `Range.toString()` — Stringifies the range's contained text; it does not serialize markup.
- `StaticRange` and `StaticRangeInit.startContainer`, `StaticRangeInit.startOffset`, `StaticRangeInit.endContainer`, and `StaticRangeInit.endOffset` — Constructor-created boundary snapshot that does not adjust when the tree mutates, unlike live Range.
- `StaticRange()` — Constructs a static boundary range from a `StaticRangeInit` dictionary; endpoints must be valid in one tree and offsets within the corresponding node lengths.
- `Selection` — User/document selection state, typically exposed by `window.getSelection()`. It can contain ranges depending on platform and selection mode.
- `Selection.anchorNode`, `Selection.anchorOffset`, `Selection.focusNode`, and `Selection.focusOffset` — Describe the selection's directed anchor/focus endpoints; null nodes or zero offsets can represent an empty/out-of-document selection.
- `Selection.isCollapsed`, `Selection.rangeCount`, `Selection.type`, and `Selection.direction` — Report whether endpoints coincide, the exposed range count, `None`/`Caret`/`Range`, and selection direction (`none`/`forward`/`backward`). Browser selection behavior still has platform-specific edges.
- `Selection.getRangeAt()` — Returns a selected Range at an index; indexes can be invalid and shadow-boundary behavior may require newer selection APIs.
- `Selection.addRange()` — Associates a range with the document selection; the current Selection API model has at most one associated range, so adding a second does not create a portable multi-range selection.
- `Selection.removeRange()` — Removes a specific range; throws if it is not the associated range.
- `Selection.removeAllRanges()` — Clears the selection and usually fires `selectionchange`.
- `Selection.empty()` — Legacy alias of `removeAllRanges()`.
- `Selection.collapse()` — Collapses selection to a caret at a node/offset, or clears it when node is null.
- `Selection.setPosition()` — Legacy alias of `collapse()`.
- `Selection.collapseToStart()` and `Selection.collapseToEnd()` — Collapse to the corresponding endpoint; an empty selection can throw.
- `Selection.extend()` — Moves the focus endpoint while retaining the anchor, changing the selected extent.
- `Selection.setBaseAndExtent()` — Sets anchor/focus endpoints directly and preserves direction.
- `Selection.selectAllChildren()` — Selects all contents of the given node.
- `Selection.deleteFromDocument()` — Deletes selected contents when the selection is valid in the document tree.
- `Selection.containsNode()` — Tests full or optional partial inclusion of a node in the current selection.
- `Selection.getComposedRanges()` and `GetComposedRangesOptions.shadowRoots` — Produces StaticRange snapshots adjusted across shadow boundaries, with explicitly supplied roots controlling which shadow-tree boundaries remain exposed.
- `Selection.modify()` — Text-command selection movement/extension API in the Selection API specification; granularity and browser support vary, so avoid depending on inconsistent commands for critical editing behavior.
- `Selection.toString()` — Stringifies selected rendered text; it is not an HTML serializer.
- `DOMParser.parseFromString()` — Parses a string as HTML or XML MIME type into a separate Document. HTML parsing yields a largely inert document for script execution, but event handlers/resources or nodes later inserted into an active document still require security care; XML parse errors yield parser-error documents.
- `XMLSerializer.serializeToString()` — Serializes a node tree to XML text. It does not guarantee the output is a safe HTML fragment or preserve all runtime state.
- `TrustedHTML` — Trusted Types wrapper for HTML strings accepted by protected HTML sinks under Trusted Types enforcement. It records passage through an application policy; it does not mean the content is inherently safe or that policy logic is correct.

# Plain text versus parsed markup

For user-generated text, prefer `textContent` or `createTextNode()`. A string like `"<img onerror=...>"` remains text. `innerHTML`, `outerHTML`, and `insertAdjacentHTML()` invoke HTML parsing, so they can create active elements, event-handler attributes, unsafe URLs, or application gadgets. Escaping text manually is error-prone because parsing context matters.

The current Sanitizer API offers context-aware safe methods such as `Element.setHTML()` and `Document.parseHTML()`, but browser support is limited. If a target lacks these methods, use a maintained sanitizer and a safe node insertion path. Trusted Types can enforce that strings pass through policy at configured sinks, but the policy must itself sanitize correctly.

# Serialization and shadow DOM

`getHTML()` can serialize selected declarative shadow roots; by default it serializes none. `serializableShadowRoots: true` includes roots marked serializable, while `shadowRoots` explicitly names roots even if not marked. This is useful for declarative-shadow-DOM output but can reveal component internals and still produces a string that may be unsafe to parse. Neither `innerHTML` nor `getHTML()` is a complete snapshot of live runtime state: listeners, JS properties, canvas pixels, selection, and many control states have separate behavior.

# Ranges and selections

Ranges store boundary points (node plus offset), not a durable string index. DOM mutations can adjust those boundaries. A range can select portions of text and elements, which is why `extractContents()` may clone ancestor wrappers and `surroundContents()` has restrictions. Selection APIs affect the user's visible selection/caret and should be used with keyboard and assistive-technology behavior in mind.

# Examples

```js
const message = document.createElement("p");
message.textContent = userProvidedText;
container.append(message);
```

If the requirement is to display the exact characters a user entered, text insertion avoids an HTML parsing sink. If rich markup is required, use an appropriate sanitizer and preserve the trust boundary.

# Common mistakes

- Treating `innerHTML` output as sanitized because it came from the DOM.
- Choosing `innerText` for a fast text read and forcing layout unnecessarily.
- Assuming `textContent` excludes hidden/script/style descendant text; it returns descendant text regardless of rendered visibility.
- Treating `DOMParser` as a sanitizer. It parses; it does not establish a safe-to-insert policy.
- Assuming scripts run when parsed in a detached HTML document, then overlooking danger when parsed nodes are later inserted into an active document.
- Using `Range.surroundContents()` for partially selected inline markup and encountering `InvalidStateError`.
- Assuming `getHTML()` serializes shadow roots without options or sanitizes them.
- Assuming `TrustedHTML` is safe without reviewing the policy that produced it.
- Serializing sanitized markup and reparsing it elsewhere without sanitizing again in the new context.

# Cross-item comparison

| API | Interprets input as markup? | Typical purpose |
| --- | --- | --- |
| `textContent` | No | Read/write descendant text |
| `innerText` | No | Rendered-text view with layout-aware behavior |
| `innerHTML` | Yes when assigned | Legacy subtree markup read/write |
| `insertAdjacentHTML()` | Yes | Legacy relative markup insertion |
| Sanitizer safe methods | Yes, sanitized | Context-aware rich markup insertion |
| `DOMParser` | Yes, detached parse | Inspect/transform parsed document |
| `XMLSerializer` | Serializes node tree | Produce XML text |
| `TrustedHTML` | Not itself | Typed value for Trusted Types sink policy |

# Knowledge checks with answers

1. **Which API should display the literal string `<b>hello</b>`?** `textContent`; it inserts text rather than parsing tags.
2. **Does `DOMParser.parseFromString()` make markup safe to insert?** No. Parsing into a separate document is not a sanitization policy.
3. **When does `innerText` risk layout work?** When reading rendered text because it depends on CSS/rendered layout.
4. **Does `getHTML()` include all shadow roots by default?** No; pass the appropriate serializable flag or explicit roots.
5. **What does TrustedHTML prove?** Only that a value is marked by Trusted Types policy machinery; safety depends on the policy.

# Further reading

- [WHATWG DOM](https://dom.spec.whatwg.org/)
- [WHATWG dynamic markup insertion and serialization](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [MDN DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [MDN Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [MDN Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
