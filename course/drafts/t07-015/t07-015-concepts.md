<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to explain how markup becomes a live object tree; distinguish DOM mutation, event dispatch, observer delivery, storage, and navigation; choose an API family for a concrete task; and identify the security and lifecycle boundary that affects that choice.

# Prerequisites

You should be comfortable with JavaScript values, functions, promises, arrays, and basic HTML elements. You should know that the browser runs JavaScript on an event loop and that an origin is the security boundary formed from scheme, host, and port. No framework is required.

# Core concepts

HTML parsing creates a `Document` and a tree of nodes. `Document`, `Node`, and `Element` expose different views: a document owns the tree and factories/selectors; nodes represent tree positions/content; elements add names, attributes, selectors, geometry, and HTML behavior. A DOM node is an object with identity, not just the markup string that produced it. Moving a node moves that same object; cloning creates a distinct subtree.

The DOM has synchronous tree mutation rules, but the browser's style, layout, paint, and accessibility updates are separate rendering work. Repeatedly reading layout-sensitive geometry after writes can force synchronous layout. Batch reads and writes where performance matters, and use observers for their actual contract rather than polling.

# Mechanisms and relationships

The browser parses markup into a document tree, then script mutates object relationships synchronously. Event dispatch runs through a defined path and may trigger a browser default action after listeners return. Observer records are delivered later according to their own queueing rules. Those mechanisms are distinct: a DOM write does not imply that a mutation observer has already run, and an event listener does not imply that rendering has happened. Storage and navigation interact with documents but are separate browser-managed state systems.

# Collections and values

Some collections are live (for example `childNodes`, `children`, and many HTML collections), so they reflect later DOM changes. Selector methods such as `querySelectorAll()` return a static NodeList snapshot. Text content and markup are also distinct: `textContent` reads/writes text descendants; `innerText` reflects rendered text and can require layout; `innerHTML` parses/serializes markup and therefore crosses a security boundary.

Attributes are strings with presence semantics. Boolean HTML attributes are true by being present, even if written `disabled="false"`; DOM properties may expose booleans. Namespaced XML/SVG attributes need namespace-aware APIs. `classList` is a token-set view, not a replacement for every attribute operation.

# Events: dispatch, default actions, and lifetimes

An event has a target, current target, phase, and flags such as `bubbles`, `cancelable`, and `composed`. A normal tree event may travel capture → target → bubble. `preventDefault()` only cancels a cancelable event's default action; `stopPropagation()` stops later propagation; `stopImmediatePropagation()` also prevents later listeners on that current target. A listener's `once`, `passive`, and `signal` options affect listener behavior/lifetime, not event trust.

Events can cross a shadow boundary only when composed; `composedPath()` reveals the dispatch path as exposed to the listener. Retargeting means `event.target` may differ across boundaries. Synthetic `dispatchEvent()` events are untrusted and run synchronously; they do not recreate trusted user activation or every activation behavior.

# Mutation and abort observers

`MutationObserver` batches selected DOM mutation records and delivers them asynchronously at a microtask checkpoint. Configure only the mutations needed; broad subtree observation can produce high volume. `takeRecords()` drains pending records and `disconnect()` ends observation. It does not report style or rendered geometry changes.

`AbortController` owns an `AbortSignal`. Aborting can communicate cancellation to APIs that accept a signal, and a signal can scope event listener lifetime through `addEventListener({signal})`. `AbortSignal.timeout()` and `AbortSignal.any()` create useful derived signals in modern platforms. Abort signals communicate cancellation; the operation must honor them.

# Storage and classic session history

`localStorage` is shared by same-origin documents and persists across browser restarts subject to browser policy; `sessionStorage` is scoped to a top-level browsing context and page session, with nuanced opener-copy behavior. Both hold string key/value pairs, run synchronously, may throw (such as on security or quota failures), and are subject to user clearing/partitioning policies. Do not store credentials or assume confidentiality from client-side storage.

`storage` events notify other relevant same-origin documents when a storage area changes; the document that performed the write does not receive that event. `History.pushState()` and `replaceState()` update same-origin session history state/URL without loading a document. `popstate` reports traversal to a history entry, not the original push/replace operation. `hashchange` is for fragment changes and is not fired by `pushState()`/`replaceState()` merely because their URL differs by a fragment.

# Navigation API: modern same-origin navigation coordination

`window.navigation` centralizes application-initiated navigation, current/same-origin history entries, and a `navigate` event. `navigate()` and `reload()` return a result with `committed` and `finished` promises. `back()`, `forward()`, and `traverseTo(key)` traverse known entries. State is structured-serialized and accessed through `getState()`; it is separate from classic `history.state`.

The API deliberately exposes a constrained history list: entries are from the current browsing context and same-origin-contiguous, not every cross-origin entry in the tab. `NavigateEvent.intercept()` can replace eligible navigation with a same-document application transition. It must be called synchronously during dispatch; it requires `canIntercept` and a trusted event. Downloads, cross-origin transitions, and some browser-UI/new-document navigations are not suitable for interception. Keep links, URLs, fallback rendering, and feature detection.

# Observers and rendering signals

`IntersectionObserver` asynchronously reports intersection relative to a root and configured thresholds; it is not a pixel-perfect scroll event. `ResizeObserver` reports observed box-size changes and can create resize loops if its callback writes dimensions that retrigger itself. Observer entries contain snapshots for a delivery; disconnect when the observation is no longer needed.

Choose observers by question: MutationObserver asks “what DOM changed?”, IntersectionObserver asks “what is intersecting a root?”, and ResizeObserver asks “what size is this element?” None directly reports paint completion. Avoid using observers as a reason to mutate the same inputs indefinitely.

# Security model for markup

Plain text should normally enter through `textContent` or node creation. HTML parsing sinks interpret input as markup. The current HTML Living Standard provides a family of context-aware sanitizer methods: safe methods remove script-capable/unsafe markup even if a custom allow configuration mentions it; unsafe-suffixed methods require an explicitly understood policy and, by default, do not sanitize dangerous content. The Sanitizer API is not Baseline across all major browsers as checked 2026-11-16.

The default sanitizer is narrower than the safe baseline and also removes comments and `data-*` attributes. Custom allowlists need careful review. Sanitization does not automatically prevent DOM clobbering, application script gadgets, server-side XSS, or future unsafe reparsing. If sanitized DOM is serialized to a string, treat that string as untrusted and sanitize again at its insertion context.

# Worked examples

Suppose a dialog is removed after a successful save. Create one `AbortController` for the dialog’s lifetime, pass its signal to the save request and event listeners, and abort it when the dialog closes. After the response, create a paragraph, assign its untrusted message through `textContent`, and append it. This avoids parsing text as HTML and makes late callbacks easier to stop. If layout visibility is needed, observe the element with `ResizeObserver`; do not infer dimensions from a mutation record.

# Misconceptions and edge cases

- Confusing DOM mutation with rendering: changing a node is synchronous; layout/paint scheduling is separate.
- Assuming an event handler means a default action was canceled: only `preventDefault()` on a cancelable event does that.
- Assuming the latest Navigation API state object is the same as `history.state`: they are separate serialization/state systems.
- Assuming observers are synchronous callbacks: their deliveries are queued and batched according to each observer's processing model.
- Assuming a sanitizer makes any later use safe: its guarantees apply to the sanitized insertion/parsing context, not an arbitrary serialized-and-reparsed string.

# Knowledge checks with answers

1. **Why can `innerText` be slower than `textContent`?** It reflects rendered text and can require style/layout information; `textContent` reads the text descendants.
2. **Does `stopPropagation()` cancel a link's navigation?** No. It controls event travel; default action cancellation uses `preventDefault()` on a cancelable event.
3. **Does `storage` fire in the same document that called `setItem()`?** No; it is delivered to other relevant documents, not the source document.
4. **Can Navigation API inspect cross-origin tab entries?** No; its entry list is constrained to same-origin history for the current browsing context.
5. **Does a safe Sanitizer API method preserve an unsafe event-handler attribute because an allowlist names it?** No; safe methods remove XSS-unsafe constructs regardless of that allowlist.

# Further reading

- [WHATWG DOM](https://dom.spec.whatwg.org/)
- [WHATWG HTML Sanitizer API and insertion algorithms](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [WHATWG HTML Navigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html)
- [MDN HTML Sanitizer API support and semantics](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
