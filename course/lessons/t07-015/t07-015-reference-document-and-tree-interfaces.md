
# Browser DOM events storage observers and navigation APIs — Reference: Document and node tree interfaces

# Scope and version

This reference covers document creation/querying and core DOM tree interfaces in the current WHATWG DOM Standard, checked 2026-11-19 (last updated 2026-11-15). It focuses on node identity, ownership, tree movement, namespaces, and collections. See [WHATWG DOM](https://dom.spec.whatwg.org/) and [MDN Document](https://developer.mozilla.org/en-US/docs/Web/API/Document).

# How this group fits the mental model

The DOM is a tree of objects. `Document` is the root-level document interface and provides factories, queries, import/adoption, and hit testing. `Node` defines common identity, ownership, relationship, and mutation operations. Specialized node types such as text, comments, attributes, doctypes, and fragments add their own meaning. DOM methods move or clone node objects; they do not merely edit source text.

# Supplied names explained

- `Document` — The document node and entry point for parsing results, factories, selectors, and document-specific APIs.
- `Document() constructor` — Creates a new, initially empty XML `Document`; ordinary webpages generally use their parser-created document instead.
- `Document.URL` and `Document.documentURI` — Read-only serialized document URL values; document URL can change during the lifetime of a document.
- `Document.compatMode` — Reports `"BackCompat"` for quirks mode and `"CSS1Compat"` otherwise; it is a compatibility-mode signal, not a standards-compliance score.
- `Document.characterSet` — Encoding label associated with the document.
- `Document.charset` and `Document.inputEncoding` — Legacy aliases of `characterSet`; prefer the canonical property.
- `Document.contentType` — MIME type associated with the document.
- `Document.doctype` — The document's `DocumentType`, or null when no doctype node exists.
- `Document.documentElement` — The root Element of the document, or null if it has none.
- `Document.createElement()` — Creates an HTML-namespace element in an HTML document. Custom element names may invoke upgrade/constructor behavior according to registry and options. `ElementCreationOptions.is` requests a customized built-in element; `ElementCreationOptions.customElementRegistry` selects a registry, and the two options are mutually exclusive.
- `Document.createElementNS()` — Creates an element in a specified namespace, commonly used for SVG/MathML or XML. Namespace and qualified name are separate concepts.
- `Document.createTextNode()` — Creates a text node; text is not parsed as markup.
- `Document.createComment()` — Creates a comment node that is not rendered as page text.
- `Document.createDocumentFragment()` — Creates a lightweight detached container. Appending it moves its children into the destination and empties the fragment.
- `Document.createAttribute()` — Creates a detached Attr node. Prefer `setAttribute()` for ordinary element attribute updates.
- `Document.createAttributeNS()` — Creates a detached attribute with an explicit namespace and qualified name.
- `Document.createCDATASection()` — Creates a CDATASection in an XML document; HTML documents do not support CDATA sections through this method.
- `Document.createProcessingInstruction()` — Creates an XML processing instruction; its target must be valid and its data cannot contain the `?>` terminator.
- `Document.createEvent()` — Legacy event factory retained for compatibility. Prefer `new Event(...)`, `new CustomEvent(...)`, or the relevant event constructor.
- `Document.getElementById()` — Finds the element with the matching ID in the document tree; IDs should be unique.
- `Document.getElementsByClassName()` — Returns a live HTMLCollection of matching descendant elements; class matching is token-based and all requested tokens must match.
- `Document.getElementsByTagName()` — Returns a live HTMLCollection of elements with the requested tag name; HTML documents normalize the argument, which can matter for SVG casing.
- `Document.getElementsByTagNameNS()` — Returns a live collection matched by namespace URI and local name.
- `Document.getElementsByName()` — Returns a live NodeList of elements with the requested `name`; it is not restricted to form controls.
- `Document.querySelector()` — Returns the first matching descendant for a CSS selector, or null.
- `Document.querySelectorAll()` — Returns a static NodeList snapshot of matching descendants.
- `Document.createNodeIterator()` — Creates a forward/backward node traversal cursor with a root, node-type mask, and optional filter; see the dedicated traversal lesson for `NodeIterator` semantics.
- `Document.createTreeWalker()` — Creates a filtered tree-navigation cursor; unlike NodeIterator, its `FILTER_REJECT` result prunes a subtree.
- `Document.createRange()` — Creates a live `Range` initially collapsed at the start of this document; range boundary points can track later tree mutations and can select/extract content.
- `Document.importNode()` — Clones a node into the target document, adopting the clone into that document; custom-element cloning/upgrading details depend on options/registry. `ImportNodeOptions.customElementRegistry` supplies a registry where needed, and `ImportNodeOptions.selfOnly` controls whether descendants are also copied (default false).
- `Document.adoptNode()` — Moves the existing node into this document, changing its `ownerDocument`; it does not clone.
- `Document.elementFromPoint()` — Returns the topmost element at viewport-relative coordinates, subject to hit-testing/visibility rules.
- `Document.elementsFromPoint()` — Returns hit-tested elements at viewport coordinates in top-to-bottom order.
- `Node` — Base interface for DOM tree nodes, including documents, elements, text, comments, and fragments.
- `Node.nodeType` — Numeric constant identifying node kind; prefer `instanceof`/element checks when they communicate intent more clearly.
- `Node.ELEMENT_NODE`, `Node.ATTRIBUTE_NODE`, `Node.TEXT_NODE`, `Node.CDATA_SECTION_NODE`, `Node.PROCESSING_INSTRUCTION_NODE`, `Node.COMMENT_NODE`, `Node.DOCUMENT_NODE`, `Node.DOCUMENT_TYPE_NODE`, and `Node.DOCUMENT_FRAGMENT_NODE` — Constants for the corresponding node types; `Attr` nodes are not children in the ordinary document tree.
- `Node.ENTITY_REFERENCE_NODE`, `Node.ENTITY_NODE`, and `Node.NOTATION_NODE` — Legacy node-type constants retained for compatibility; these node kinds are not produced in modern DOM trees.
- `Node.baseURI` — Read-only resolved base URL for the node, which can depend on document URL and applicable `<base>` state.
- `Node.nodeName` — Node-type-dependent name, such as an element tag name or `#text`.
- `Node.nodeValue` — The value for `Attr` and character data for CharacterData nodes; null for types such as `Element` and `Document`. Element text is usually handled with `textContent`.
- `Node.textContent` — Returns descendant text for `Element`/`DocumentFragment`, the value/data for `Attr`/CharacterData, and null for `Document`/`DocumentType`. Setting it replaces children with text for elements/fragments and updates value/data for Attr/CharacterData; it never parses HTML.
- `Node.parentNode` — Parent node or null when detached/root.
- `Node.parentElement` — Parent when that parent is an Element, otherwise null.
- `Node.hasChildNodes()` — Returns whether the node currently has any children.
- `Node.childNodes` — Live NodeList including element, text, and comment children; whitespace in markup often creates text nodes.
- `Node.firstChild` — First child node of any node type or null.
- `Node.lastChild` — Last child node of any node type or null.
- `Node.nextSibling` — Next sibling node, possibly whitespace text/comment, or null.
- `Node.previousSibling` — Previous sibling node, possibly whitespace text/comment, or null.
- `Node.isConnected` — Whether the node is connected, through its root, to a document.
- `Node.ownerDocument` — Document that owns the node; null for a Document node itself.
- `Node.appendChild()` — Moves the given node to the end of this parent's children and returns the inserted node. A DocumentFragment contributes its children.
- `Node.insertBefore()` — Moves a node before a reference child; null reference means append. The reference must belong to this parent.
- `Node.removeChild()` — Removes and returns a child; throws if it is not a child.
- `Node.replaceChild()` — Replaces one child with another and returns the removed child.
- `Node.contains()` — Tests inclusive descendant relationship, including the node itself.
- `Node.cloneNode()` — Clones this node shallowly or deeply. It copies attributes/descendant nodes as requested but does not clone listeners registered with `addEventListener()` or arbitrary JS state.
- `Node.normalize()` — Merges adjacent Text nodes and removes empty Text nodes in the subtree.
- `Node.getRootNode()` — Returns the root node; `{composed:true}` can cross a shadow boundary to a shadow-including root.
- `Node.compareDocumentPosition()` — Returns bit flags describing ordering/containment/disconnectedness of two nodes; interpret flags with constants rather than numeric literals.
- `Node.isEqualNode()` — Tests structural equality of node type, values, and descendants, not object identity.
- `Node.isSameNode()` — Legacy alias for JavaScript object identity (`===`); prefer direct identity comparison.
- `Node.DOCUMENT_POSITION_DISCONNECTED`, `Node.DOCUMENT_POSITION_PRECEDING`, `Node.DOCUMENT_POSITION_FOLLOWING`, `Node.DOCUMENT_POSITION_CONTAINS`, `Node.DOCUMENT_POSITION_CONTAINED_BY`, and `Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` — Bit constants used to interpret `compareDocumentPosition()`; disconnected-node relative order may be implementation-specific.
- `Node.lookupPrefix()`, `Node.lookupNamespaceURI()`, and `Node.isDefaultNamespace()` — Namespace lookup helpers; they inspect namespace declarations in the relevant node context and may return null/false.
- `GetRootNodeOptions.composed` — Boolean option for `getRootNode()`; when true, the result can cross a shadow boundary to the shadow-including root.
- `DocumentFragment` — Detached node container whose children can be moved together. A shadow root also derives from DocumentFragment but has a host and different lifecycle/serialization behavior.
- `Text` — CharacterData node containing text. In HTML parsing, adjacent character data may normalize or be represented in ways that differ from source formatting.
- `Comment` — CharacterData node for markup comments; not rendered as normal text.
- `DocumentType` — Node describing document type/name/public/system identifiers, commonly the HTML doctype.
- `Attr` — Attribute node exposing name, namespace, and value when used through attribute-node APIs; most applications use element attribute methods instead.

# Tree operations and object identity

Appending a node that already has a parent moves it; the old parent loses it. Use `cloneNode(true)` when a separate copy is intended. A DocumentFragment insertion moves its children, so after insertion the fragment itself is empty. A node can exist detached from the document; selectors on `document` will not find it until connected, but it remains a usable object.

Avoid mutating a live `childNodes` collection while iterating forward by index: removals shift later entries and can skip nodes. Iterate a snapshot (`[...parent.childNodes]`) or use a safe traversal strategy. Query selector results are static, so rerun the query if current matches are needed after mutation.

`ownerDocument` is not the same as connectivity. A detached node still has an owner document. `adoptNode()` changes ownership and moves the node; `importNode()` creates an owned clone. This distinction matters when moving nodes between documents, realms, and custom-element registries.

# Collections and selectors

`childNodes` is live and includes text/comment nodes; `children` is an Element-only live collection. `querySelectorAll()` is static. `getElementById()` and selector queries operate in the relevant tree/document scope; shadow DOM needs queries from its root. CSS selectors passed to query methods must be valid selector syntax; escape dynamic identifiers with `CSS.escape()` rather than concatenating arbitrary user strings.

# Namespaces and creation

In an HTML document, `createElement('div')` creates an HTML element. `createElementNS()` is necessary for namespace-sensitive content such as SVG. An SVG `<circle>` created with the wrong namespace may look like an element named circle but will not have SVG behavior. Qualified names can include prefixes, but the namespace URI carries the namespace identity.

The core `Document` interface also exposes legacy aliases and XML-oriented factories. Use `createAttributeNS()` for namespace-sensitive Attr nodes; use `createCDATASection()` and `createProcessingInstruction()` only with XML documents. `createEvent()` is historical and should not be used in new code. `Document()` constructs an empty XML document and is not a replacement for parsing HTML.

# Examples

```js
const list = document.querySelector("#results");
const fragment = document.createDocumentFragment();
for (const label of ["Alpha", "Beta"]) {
  const item = document.createElement("li");
  item.textContent = label;
  fragment.append(item);
}
list.append(fragment);
```

The fragment is a convenient staging parent; appending it moves its children into the list, leaving the fragment empty. The nodes retain their identity and the text is not parsed as markup.

# Common mistakes

- Treating `childNodes` as element-only and being surprised by whitespace text nodes.
- Assuming `querySelectorAll()` is live; it is a static snapshot.
- Assuming `cloneNode(true)` copies event listeners, JavaScript properties, canvas pixels, or framework state. It does not generally clone those.
- Forgetting append/insert operations move existing nodes instead of duplicating them.
- Mutating a live collection during forward index iteration and accidentally skipping entries.
- Using `createElement()` for SVG or MathML and getting an element in the wrong namespace.
- Passing unescaped user input into a selector string.
- Confusing a node's `ownerDocument` with `isConnected`.
- Assuming an `Attr` object is necessary for normal attribute setting; `setAttribute()` is simpler for common cases.

# Cross-item comparison

| Need | API | Result/behavior |
| --- | --- | --- |
| Find one ID | `getElementById()` | One matching element or null |
| Find by CSS selector | `querySelector()` | First match or null |
| Snapshot all selector matches | `querySelectorAll()` | Static NodeList |
| Read every child node | `childNodes` | Live NodeList including text/comments |
| Read element children | `children` | Live HTMLCollection of elements |
| Move node across documents | `adoptNode()` | Same object, new owner document |
| Copy node into document | `importNode()` | New clone owned by destination document |
| Create ordinary HTML element | `createElement()` | HTML namespace in HTML document |
| Create namespaced element | `createElementNS()` | Element in supplied namespace |

# Knowledge checks with answers

1. **Why can `childNodes[0]` be a text node?** Whitespace/newlines between tags are character data nodes.
2. **Does appending an existing node duplicate it?** No, it moves it from its old parent.
3. **Does `cloneNode(true)` copy `addEventListener()` listeners?** No.
4. **Which query collection is static: `childNodes` or `querySelectorAll()`?** `querySelectorAll()` is static; `childNodes` is live.
5. **How should SVG elements be created?** Use `createElementNS()` with the SVG namespace.

# Further reading

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [MDN Document](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [MDN Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)
- [MDN DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)
