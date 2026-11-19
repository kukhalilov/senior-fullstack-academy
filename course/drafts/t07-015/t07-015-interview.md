<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Interview questions and reasoning

# Core questions

1. How do `textContent`, `innerText`, and `innerHTML` differ?
2. What is the difference between event propagation and default-action cancellation?
3. How do `MutationObserver`, `IntersectionObserver`, and `ResizeObserver` differ?
4. What does an `AbortSignal` guarantee, and what does it not guarantee?
5. How do `localStorage` and `sessionStorage` differ in scope and lifetime?
6. Compare `history.pushState()` with the Navigation API.
7. What is the security boundary when inserting untrusted markup?
8. What does `dispatchEvent()` do, and what does it not simulate?

# Concise interview answers

1. `textContent` reads or writes descendant text without parsing markup. `innerText` is rendered-text-oriented and may need style/layout. `innerHTML` parses or serializes markup and is an injection-sensitive surface.
2. `preventDefault()` cancels a cancelable default action. `stopPropagation()` changes event travel. They solve independent problems.
3. Mutation observes selected DOM changes; intersection observes geometry relative to a root; resize observes an element’s box-size changes. Each is asynchronous and has a specific contract.
4. A signal communicates cancellation to APIs that honor it and can scope listeners. It cannot undo completed work or force non-cooperative work to stop.
5. `localStorage` is shared by same-origin documents and generally persists across browser restarts subject to policy. `sessionStorage` is scoped to a top-level browsing context and page session; an opener can cause an initial copy in some cases. Both store strings and may throw.
6. `pushState()` adds same-origin session history state and changes the URL without automatically loading/rendering the page. Navigation API centralizes eligible application navigation and exposes same-origin entries plus a `navigate` event, with commit/finish promises and enhanced interception.
7. Parsing untrusted input as HTML can create dangerous nodes. Prefer text; for intentional rich markup, use a supported sanitizer or a reviewed maintained sanitizer fallback. Sanitization does not make serialized output permanently trusted.
8. `dispatchEvent()` synchronously dispatches a synthetic untrusted event through listeners and the normal dispatch rules apply, including applicable default/activation behavior for that event. It does not create trusted user activation or reproduce the browser’s trusted-input and user-activation context.

# Deep follow-up answers

## Why is a `querySelectorAll()` result different from `childNodes`?

`querySelectorAll()` returns a static `NodeList`; it describes the matches at query time. `childNodes` is a live `NodeList`; it reflects later tree changes. Mutating a live collection while iterating can skip or revisit entries, so take a snapshot when stable iteration is required. The interface name alone does not tell you liveness.

## What is the order of event dispatch, and where does `currentTarget` fit?

For an event with a path through ancestors, capture listeners run from outer ancestors toward the target, then target listeners run, then bubble listeners run outward if the event bubbles. `target` identifies the dispatch target (with retargeting across shadow boundaries); `currentTarget` is the object whose listener is currently executing. `eventPhase` describes the phase. Propagation controls do not inherently cancel default actions. A listener added with `{ once: true }` is removed after invocation; `{ signal }` ties listener removal to an abort signal.

## How do composed events and shadow DOM affect delegation?

The composed path can cross a shadow boundary only for composed events, and retargeting can make `target` appear as the host outside a shadow tree. Delegation should use the appropriate path and component contract rather than assume every internal node is visible. `composedPath()` reports the dispatch path subject to closed-root encapsulation. Custom events default to non-bubbling and non-composed unless configured; set only the flags consumers need.

## Why can a MutationObserver callback observe more than one change?

Mutation records are queued and delivered together at a microtask checkpoint. A callback may receive several records, and mutations made while processing can queue later work. `takeRecords()` drains pending records; `disconnect()` stops observation and discards registrations. It is not a layout observer, so changes to computed geometry without DOM mutation are outside its contract.

## How do safe and unsafe Sanitizer API entry points differ?

Safe methods such as `setHTML()` apply a safe policy that removes XSS-unsafe constructs even if a custom configuration attempts to allow them. Unsafe-suffixed methods bypass that safety filtering and require explicit review of the sanitizer policy and resulting context. Availability remains uneven across browser versions. Sanitization does not, by itself, prevent DOM clobbering, application-specific script gadgets, server-side injection, or later unsafe reparsing of serialized output. Do not silently replace a missing safe method with raw `innerHTML`.

## What is special about Navigation API interception?

The API exposes same-origin-contiguous entries for the current browsing context, not a complete cross-origin tab history. A `navigate` event is not necessarily interceptable; check `canIntercept`, destination, download intent, and application policy. `intercept()` must be called synchronously in the event dispatch. For an intercepted same-document navigation, its handler promise participates in navigation completion; `committed` and `finished` can settle according to the navigation lifecycle. Do not await them as universal signals: for ordinary cross-document navigation, non-intercepted reloads, and some non-navigation responses, the returned promises never settle. Keep real URLs and handle failure, focus, scroll, refresh, and unsupported browsers.

# Scenario questions

1. A third-party widget mutates its own subtree and your app must react. Why might a `MutationObserver` be reasonable, and what makes a broad observer risky?
2. A floating toolbar should appear as an article enters a scroll container. Why use `IntersectionObserver` rather than polling scroll position? What does the callback not guarantee?
3. A preference should survive refresh but is not sensitive. How do you handle `localStorage` failures and synchronize another same-origin tab?
4. A page route changes after clicking a link, but browser Back does not restore the previous view. What state-transition and history responsibilities may be missing?
5. The native Sanitizer API is absent in a supported browser. What safe options remain?
6. A ResizeObserver callback writes a width derived from its own observed width and browser reports a resize loop. Explain the causal cycle and two possible remedies.

# Tradeoffs and alternatives

| Need | Suitable API | Alternative or boundary |
| --- | --- | --- |
| Show literal untrusted text | `textContent` | Construct nodes for structured output |
| Insert rich untrusted HTML | Safe Sanitizer API method when available | Maintained sanitizer library and reviewed policy; never raw-string fallback |
| React to DOM changes you do not control | `MutationObserver` | Prefer explicit component callbacks when you own the producer |
| Detect proximity to a viewport/root | `IntersectionObserver` | Scroll handling for continuous position/gesture behavior, carefully throttled |
| Detect element box changes | `ResizeObserver` | CSS layout/container queries where the behavior is purely presentational |
| Persist small non-sensitive strings | Web Storage | IndexedDB for larger structured async data; URL for shareable route state |
| Enhance same-origin route navigation | Navigation API where supported | Ordinary links and form submissions as baseline |
| Cancel work with shared lifetime | `AbortController` / `AbortSignal` | Explicit cleanup when an API has no abort support |

# Common weak answers

- “`stopPropagation()` stops the link.” It affects propagation, not the default navigation; cancellation uses `preventDefault()` on a cancelable event.
- “MutationObserver watches the page.” It watches configured DOM mutations, not paint, computed style, or all rendered changes.
- “Abort guarantees the server stops.” It only communicates cancellation; completed or non-cooperative work may continue.
- “`sessionStorage` lasts until the tab closes, no exceptions.” Its details depend on browsing context/session semantics and policy; opener copy behavior and browser restoration complicate a simplistic statement.
- “`pushState()` loads the route.” It only changes session history state and URL; application code must render, and `popstate` handles traversal.
- “The Navigation API can intercept every navigation.” Eligibility is constrained; cross-origin, downloads, and some browser-initiated transitions remain outside interception.
- “Sanitized means trusted forever.” Safety is context-specific; serialization followed by reparsing reopens a trust boundary.
- “All NodeLists are live” or “all are static.” Liveness is API-specific.

# Self-check rubric

Score each dimension from 0 to 2: **0** = incorrect or absent; **1** = mostly right but misses a condition; **2** = precise answer plus a practical consequence.

- Distinguish propagation, cancellation, trusted events, and default actions.
- Explain DOM identity, tree ownership, and static/live collection behavior.
- Match each observer to its documented signal and name its lifecycle/feedback risk.
- Describe cancellation as cooperative and explain how to guard stale results.
- Distinguish storage/session history/navigation scopes and failure conditions.
- Explain HTML parsing risk and sanitizer limitations accurately.
- Preserve ordinary links, browser controls, and progressive enhancement when discussing routing.

A strong answer names the relevant contract, states a boundary or failure mode, and gives a concrete design choice. If any dimension scores 0, revisit the corresponding reference lesson and redo its exercise without hints.

# Further reading

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG HTML Sanitizer and dynamic markup insertion](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Navigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html)
- [MDN Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
