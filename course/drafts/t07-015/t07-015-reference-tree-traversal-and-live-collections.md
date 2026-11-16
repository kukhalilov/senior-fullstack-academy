<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: DOM traversal, filters, and live collection interfaces

# Scope and version

This lesson covers DOM traversal objects and array-like collections in the DOM Standard checked 2026-11-16. These APIs complement CSS selectors: selectors find elements, while traversal can visit text/comment nodes and filter or prune a walk. See [WHATWG DOM traversal](https://dom.spec.whatwg.org/#traversal), [MDN selection and traversal](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Selection_and_traversal_on_the_DOM_tree), and the references for [NodeIterator](https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator), [TreeWalker](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker), and [NodeFilter](https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter).

# How this group fits the mental model

`NodeIterator` and `TreeWalker` are live traversal cursors rooted at a node. `whatToShow` cheaply masks node types before an optional filter decides whether a node appears in the traversal view. A `NodeIterator` is a mostly linear forward/backward cursor. A `TreeWalker` exposes parent/child/sibling movement and uses `FILTER_REJECT` to prune a subtree. Collections such as `NodeList` and `HTMLCollection` expose array-like access but are not interchangeable: some are live, some are static, and each interface has its own methods.

# Supplied names explained

- `NodeIterator` — Cursor that visits nodes in tree order from a root; useful for linear scans including text and comments.
- `NodeIterator.root` — Root node that bounds its traversal.
- `NodeIterator.referenceNode` — Current reference node around which the iterator's pointer is positioned.
- `NodeIterator.pointerBeforeReferenceNode` — Boolean indicating which side of the reference node the iterator's logical pointer occupies; this affects next/previous behavior.
- `NodeIterator.whatToShow` — Bitmask of node types to expose. Nodes excluded by this mask are not returned.
- `NodeIterator.filter` — Optional callback/object filter applied to eligible node types; `FILTER_SKIP` and `FILTER_REJECT` both omit the node while continuing through descendants.
- `NodeIterator.nextNode()` — Advances and returns the next accepted node, or null at the end.
- `NodeIterator.previousNode()` — Moves backward and returns the previous accepted node, or null at the beginning.
- `TreeWalker` — Filtered traversal view with navigation among parent, child, sibling, and document-order nodes.
- `TreeWalker.root` — The fixed traversal root.
- `TreeWalker.currentNode` — Mutable cursor location; assigning a node changes where traversal methods continue.
- `TreeWalker.whatToShow` — Node-type bitmask used before the filter.
- `TreeWalker.filter` — Optional filter object/function. `FILTER_REJECT` prunes descendants; `FILTER_SKIP` omits only this node and continues into children.
- `TreeWalker.parentNode()` — Moves to and returns the nearest accepted ancestor, without moving above the root.
- `TreeWalker.firstChild()` — Moves to the first accepted descendant child in the filtered view.
- `TreeWalker.lastChild()` — Moves to the last accepted descendant child in the filtered view.
- `TreeWalker.previousSibling()` — Moves to the previous accepted sibling in the filtered view.
- `TreeWalker.nextSibling()` — Moves to the next accepted sibling in the filtered view.
- `TreeWalker.previousNode()` — Moves to the previous accepted node in tree order.
- `TreeWalker.nextNode()` — Moves to the next accepted node in tree order.
- `NodeFilter` — Constants and callback result vocabulary used by iterator/walker filters.
- `NodeFilter.SHOW_ALL` — Bitmask selecting all node types.
- `NodeFilter.SHOW_ELEMENT` — Selects Element nodes before filter evaluation.
- `NodeFilter.SHOW_TEXT` — Selects Text nodes before filter evaluation.
- `NodeFilter.SHOW_COMMENT` — Selects Comment nodes before filter evaluation.
- `NodeFilter.FILTER_ACCEPT` — Include the node in the traversal result.
- `NodeFilter.FILTER_REJECT` — Exclude the node; for `TreeWalker`, also prune its descendants. For `NodeIterator`, it does not prune descendants.
- `NodeFilter.FILTER_SKIP` — Exclude only the node and continue into descendants.
- `NodeList.length` — Number of nodes exposed by the list at the time it is read; for live lists, this can change after DOM mutation.
- `NodeList.item()` — Returns the indexed node or null; bracket indexing is also common.
- `NodeList.forEach()` — Invokes a callback for each list entry; do not assume every NodeList is static.
- `NodeList.entries()` — Returns an iterator of index/node pairs.
- `NodeList.keys()` — Returns an iterator of indices.
- `NodeList.values()` — Returns an iterator of nodes.
- `HTMLCollection.length` — Current number of matching elements; common HTML collections are live.
- `HTMLCollection.item()` — Returns the indexed element or null.
- `HTMLCollection.namedItem()` — Returns an element by matching `id` or eligible `name`, or null; bracket named-property access has legacy quirks.
- `DocumentFragment.getElementById()` — Finds an element by ID within the fragment subtree, including a ShadowRoot-like fragment scope.
- `DocumentFragment.querySelector()` — Finds the first matching descendant element in the fragment.
- `DocumentFragment.querySelectorAll()` — Returns a static NodeList of matching descendants.
- `Element.getElementsByClassName()` — Returns a live HTMLCollection of descendant elements matching all requested class tokens.
- `Element.getElementsByTagName()` — Returns a live HTMLCollection of descendant elements with the requested qualified name; HTML case normalization can surprise with SVG names.
- `Element.getElementsByTagNameNS()` — Returns a live collection filtered by namespace URI and local name, useful where namespace and case matter.

# Choosing traversal versus selectors

Use `querySelector()`/`querySelectorAll()` when the task is to select elements by CSS relationships. Use `NodeIterator` when processing a linear sequence of node types, such as text nodes for a transformation. Use `TreeWalker` when the algorithm needs to navigate the filtered tree or prune subtrees. Prefer selectors for routine UI code because they are easier to read and usually match element-oriented intent.

`whatToShow` is applied before the filter, so a filter cannot accept node types hidden by the bitmask. In `TreeWalker`, a rejected element prunes all descendants; use `FILTER_SKIP` when the wrapper should be omitted but its descendants should remain traversable. These semantics differ from NodeIterator, where skip and reject both continue traversal into children.

# Live, static, and mutation-safe iteration

`querySelectorAll()` returns a static snapshot; many `getElementsBy*` results, `children`, and `childNodes` are live. A live collection reflects mutations while it is held. Removing entries while iterating forward by numeric index can skip the next item. Snapshot first (`[...collection]`) when the algorithm should process the original set, or iterate backward when removal is the only mutation. `NodeIterator` and `TreeWalker` are traversal cursors, not snapshots: mutations to the tree can affect subsequent traversal.

`NodeList` is an interface name, not a promise of liveness. `childNodes` is live, while selector results are static. `HTMLCollection` is generally live and has legacy named-property behavior; use explicit indices/iteration for predictable algorithms.

# Examples

Collect visible text nodes below an article while skipping script/style subtrees:

```js
const walker = document.createTreeWalker(
  article,
  NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  node => {
    if (node.nodeType === Node.ELEMENT_NODE &&
        ["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.nodeName)) {
      return NodeFilter.FILTER_REJECT;
    }
    return node.nodeType === Node.TEXT_NODE
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP;
  }
);

const textNodes = [];
for (let node = walker.nextNode(); node; node = walker.nextNode()) {
  textNodes.push(node);
}
```

The element type must be included in `whatToShow` for the filter to reject those subtrees. To traverse only text nodes without pruning wrappers, use `NodeFilter.SHOW_TEXT` and accept text nodes. To mutate while scanning, snapshot nodes first so the traversal cursor's response to mutation does not become an accidental part of the algorithm.

# Common mistakes

- Assuming all `NodeList` objects share the same liveness semantics.
- Treating `FILTER_REJECT` as identical in both interfaces: it prunes subtrees only for TreeWalker.
- Forgetting that `whatToShow` filters node types before the callback runs.
- Using `getElementsByTagName()` to find camel-case SVG names in HTML without considering HTML lowercasing; use namespace-aware matching.
- Removing from a live collection while iterating forward and skipping entries.
- Expecting a TreeWalker filter to expose nodes whose types were excluded by its bitmask.
- Using `namedItem()` or named property access as a stable application data map; IDs/names and legacy lookup rules can collide.
- Choosing a traversal cursor for a simple selector query and making the code harder to maintain.

# Cross-item comparison

| Need | API | Behavior |
| --- | --- | --- |
| One CSS-matching element | `querySelector()` | First descendant or null |
| Stable list of CSS matches | `querySelectorAll()` | Static NodeList snapshot |
| Descendants by tag/class | `getElementsBy*()` | Usually live HTMLCollection |
| Linear walk through selected node types | `NodeIterator` | Forward/backward cursor; reject does not prune |
| Navigate/filter a tree shape | `TreeWalker` | Cursor with parent/child/sibling steps; reject prunes |
| Reproducible work set before mutation | Spread/snapshot a collection | Static JS array of object references |

# Knowledge checks with answers

1. **What happens when TreeWalker returns `FILTER_SKIP` for a wrapper?** The wrapper is omitted but its descendants remain traversable.
2. **What happens when TreeWalker returns `FILTER_REJECT`?** The node and its subtree are omitted.
3. **Does NodeIterator use reject to prune descendants?** No. For NodeIterator, `FILTER_REJECT` and `FILTER_SKIP` both omit the node and continue through descendants.
4. **Is every NodeList live?** No. Liveness is specific to the API returning it.
5. **Why can removing from a live HTMLCollection during forward iteration skip matches?** Indices shift after removal; snapshot or iterate in a mutation-safe direction.

# Further reading

- [WHATWG DOM traversal](https://dom.spec.whatwg.org/#traversal)
- [MDN selection and traversal on the DOM tree](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Selection_and_traversal_on_the_DOM_tree)
- [MDN NodeIterator](https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator)
- [MDN TreeWalker](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
- [MDN NodeFilter](https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter)
- [MDN NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
- [MDN HTMLCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)
