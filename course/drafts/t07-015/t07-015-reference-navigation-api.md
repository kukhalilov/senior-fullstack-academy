<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: Modern Navigation API and history entries

# Scope and version

This reference covers the WHATWG HTML Navigation API as checked 2026-11-16. MDN marks the core API Baseline 2026, newly available since January 2026, but some subfeatures may vary and older browsers are not covered. Use feature detection and ordinary URL links as the fallback. See [WHATWG Navigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html), [MDN Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API), [MDN Navigation](https://developer.mozilla.org/en-US/docs/Web/API/Navigation), and [MDN NavigateEvent](https://developer.mozilla.org/en-US/docs/Web/API/NavigateEvent).

# How this group fits the mental model

The Navigation API centralizes same-origin navigation state and events for the current browsing context. It can initiate a navigation, inspect eligible history entries, observe a navigation, and intercept an eligible navigation to render a same-document application view. It does not expose arbitrary cross-origin session history, replace server routing, or make client-only routes usable without ordinary URLs.

The API can coexist with `history`, `location`, anchors, and forms. Progressive enhancement preserves standard browser behavior for unsupported browsers, cross-origin transitions, downloads, and cases the API cannot intercept.

# Supplied names explained

- `Window.navigation` — Read-only global property exposing the window's `Navigation` object.
- `Navigation` — EventTarget for navigation actions, same-origin history entries, and navigation lifecycle events.
- `Navigation.activation` — Information about the most recent cross-document navigation that activated the current document. It stays tied to that activation through same-document routes.
- `Navigation.canGoBack` — Whether there is a previous eligible same-origin entry in this API's history list; this can be false even if the browser tab has a cross-origin prior entry.
- `Navigation.canGoForward` — Whether a next eligible entry exists in the API's same-origin list.
- `Navigation.currentEntry` — Current `NavigationHistoryEntry`, or null when no active current entry is available.
- `Navigation.transition` — Current in-progress `NavigationTransition`, or null when none is in progress.
- `Navigation.entries()` — Returns a new array of the contiguous same-origin history entries available to this browsing context. It is not the browser's entire tab history.
- `Navigation.updateCurrentEntry()` — Updates serialized Navigation API state for the current entry and fires `currententrychange`; it does not itself navigate or render a new page.
- `Navigation.navigate()` — Starts navigation to a URL and returns a `NavigationResult` containing `committed` and `finished` promises. Options can include state, info, and history behavior.
- `Navigation.reload()` — Reloads the current location, optionally associating state/info under the API's rules; it returns the navigation result promises.
- `Navigation.traverseTo()` — Traverses to an entry identified by its stable `key`, if the target remains in the eligible history list.
- `Navigation.back()` — Traverses one eligible entry backward; inspect `canGoBack` for UI affordances and handle rejected promises/cancellation.
- `Navigation.forward()` — Traverses one eligible entry forward.
- `Navigation navigate() history behavior values auto/push/replace` — The `history` option accepts `auto`, `push`, or `replace`; these select whether navigation creates/replaces an entry according to the API's navigation rules. They do not mean an arbitrary cross-origin route can be converted to same-document content.
- `NavigationResult.committed` — Promise resolving when the current entry/URL commit occurs; it can reject if precommit/navigation fails.
- `NavigationResult.finished` — Promise resolving when navigation handlers finish, or rejecting on navigation failure/cancellation.
- `navigate event` — Fires for many navigation types and is the central interception point. It is not universal: location-bar/new-document and browser-UI cases can be outside interception, and download/cross-origin cases are not generally interceptable.
- `navigatesuccess event` — Fires when a managed navigation completes successfully.
- `navigateerror event` — Fires when a managed navigation fails; handle it or the result promise rejection to present recovery UI.
- `currententrychange event` — Fires when current entry changes or its state is updated. Its `NavigationCurrentEntryChangeEvent` includes `from` and a navigation type (null for `updateCurrentEntry`).
- `NavigationHistoryEntry` — Object representing one entry in the exposed navigation list.
- `NavigationHistoryEntry.url` — Absolute URL for the entry; can be null when cross-document referrer policy intentionally hides that URL.
- `NavigationHistoryEntry.key` — User-agent generated stable slot key for traversal. Replacement can reuse the slot key.
- `NavigationHistoryEntry.id` — User-agent generated unique entry identity; useful to associate cache records with that specific entry.
- `NavigationHistoryEntry.index` — Index in `navigation.entries()`, or -1 if the entry is not in that list.
- `NavigationHistoryEntry.sameDocument` — Whether this entry belongs to the same `Document` as the current document.
- `NavigationHistoryEntry.getState()` — Returns a fresh deserialization/clone of that entry's Navigation API state. It is distinct from `history.state`.
- `dispose event` — Fires on a `NavigationHistoryEntry` after it is no longer in the history list; release entry-specific resources when appropriate.
- `NavigationDestination` — Immutable snapshot of the destination for a navigation event/transition.
- `NavigationDestination.url` — Destination URL.
- `NavigationDestination.key` — Destination entry's key for traversal; empty for navigation types without an existing traversed entry.
- `NavigationDestination.id` — Destination entry's unique identity when traversing; otherwise empty.
- `NavigationDestination.index` — Destination index for traversals; otherwise -1.
- `NavigationDestination.sameDocument` — Describes whether the original destination was a same-document navigation. Interception does not rewrite this historical fact.
- `NavigationDestination.getState()` — Reads deserialized destination state when one exists for traverse, push/replace, or reload under the corresponding API rules; may return undefined.
- `NavigationTransition` — Object describing an in-progress navigation from an entry to a destination.
- `NavigationTransition.navigationType` — One of `push`, `replace`, `reload`, or `traverse`.
- `NavigationTransition.from` — Entry from which the active navigation began.
- `NavigationTransition.to` — Destination object for the active navigation.
- `NavigationTransition.committed` — Promise for URL/current-entry commitment, after precommit handlers.
- `NavigationTransition.finished` — Promise that settles with the eventual success/error lifecycle.
- `NavigationActivation` — Snapshot of the cross-document navigation that activated this document.
- `NavigationActivation.from` — Prior entry when same-origin information is available; may be null.
- `NavigationActivation.entry` — Entry corresponding to this document at activation time.
- `NavigationActivation.navigationType` — Activation type: `push`, `replace`, `reload`, or `traverse`.
- `NavigateEvent` — Event object for `navigate`; it inherits Event fields and carries destination, origin/action, interception, and cancellation context.
- `NavigateEvent.navigationType` — `push`, `replace`, `reload`, or `traverse`.
- `NavigateEvent.destination` — `NavigationDestination` snapshot for the target.
- `NavigateEvent.canIntercept` — Whether this navigation is eligible to be intercepted. Check it before calling `intercept()`.
- `NavigateEvent.userInitiated` — Whether a user action initiated the navigation; not a general authorization signal.
- `NavigateEvent.hashChange` — Whether the navigation is a fragment navigation.
- `NavigateEvent.signal` — AbortSignal that aborts when the navigation is canceled/superseded; use it to cancel route data work.
- `NavigateEvent.formData` — FormData for a POST form navigation, otherwise null; sensitive values must be handled carefully.
- `NavigateEvent.downloadRequest` — Requested download filename when navigation represents a download, otherwise null. Downloads should not be converted into ordinary route rendering.
- `NavigateEvent.info` — Arbitrary info passed by the initiating Navigation API method; user/browser initiated navigation generally has no such value. Do not treat it as trusted identity.
- `NavigateEvent.hasUAVisualTransition` — Whether the browser performed a visual transition before event dispatch; synchronous DOM update can be important for the expected visual experience.
- `NavigateEvent.sourceElement` — Initiating link, area, submit button, or form element when applicable; can be null.
- `NavigateEvent.intercept()` — During synchronous event dispatch, converts an eligible navigation to same-document handling. It requires a trusted event and `canIntercept`; it can register precommit and main handlers and control focus/scroll behavior.
- `NavigateEvent.intercept precommitHandler` — Runs after event dispatch but before URL/current-entry commit. A rejected promise aborts the navigation. It is only allowed for cancelable events.
- `NavigateEvent.intercept handler` — Runs after commit; its returned promise signals navigation work completion and causes success/error lifecycle reporting.
- `NavigateEvent.intercept focusReset` — Controls focus reset; default behavior resets focus after handlers, while `manual` leaves focus responsibility to the app.
- `NavigateEvent.intercept scroll` — Controls browser scrolling; `manual` suppresses automatic navigation scrolling, while the default allows normal fragment/restoration behavior.
- `NavigateEvent.scroll()` — Explicitly invokes browser navigation scroll behavior once the navigation has committed and before automatic post-transition scrolling has already occurred.
- `Navigate API same-origin entry visibility` — Only entries from the current browsing context and same-origin contiguous history are exposed; cross-origin entries and embedded browsing contexts are excluded.
- `Navigation API progressively enhanced alongside classic links` — Keep real `href` values and server routes. Detect `window.navigation`; intercept only eligible app routes, leaving downloads, external URLs, and unsupported browsers to native behavior.

# State, lifetime, and cancellation

Navigation API state is serialized using structured serialization rules. Store small serializable route state, not DOM nodes, functions, or secrets. Each `getState()` produces a new deserialized value for object state, so object identity comparisons do not work. The `key` identifies a reusable history slot; `id` identifies a particular entry. Use `id` for per-entry caches and `key` for traversal targets.

`navigate()` and traversal methods are asynchronous. Handle both promise outcomes; an aborted navigation can reject. In a `navigate` handler, connect data fetching to `event.signal` so starting another navigation or pressing Stop cancels obsolete work. Avoid a route handler that consumes a POST form and then silently drops its `formData` or submitter intent.

`intercept()` must run during the synchronous `navigate` event dispatch. A cross-origin destination, download request, or untrusted synthetic event is not an eligible SPA route. Use `precommitHandler` for checks that must succeed before committing URL/history; use `handler` for rendering after commit. Preserve focus and scroll behavior intentionally, and ensure route failure leaves a recoverable interface.

# Example: progressive enhancement

```js
if ("navigation" in window) {
  navigation.addEventListener("navigate", event => {
    if (!event.canIntercept || event.downloadRequest !== null) return;

    const destination = new URL(event.destination.url);
    if (destination.origin !== location.origin || !destination.pathname.startsWith("/app/")) return;

    event.intercept({
      async handler() {
        const response = await fetch(destination, { signal: event.signal });
        if (!response.ok) throw new Error(`Route failed: ${response.status}`);
        render(await response.json());
      }
    });
  });
}
```

The actual anchor still needs a real URL and the server must serve it on direct load. The app also needs a deliberate policy for POST forms, error recovery, scroll, focus, authentication redirects, and resource cleanup.

# Examples

```js
if ("navigation" in window) {
  navigation.addEventListener("navigate", event => {
    if (!event.canIntercept || event.downloadRequest !== null) return;
    const url = new URL(event.destination.url);
    if (url.origin !== location.origin) return;
    event.intercept({ handler: () => renderRoute(url) });
  });
}
```

This is progressive enhancement for eligible same-origin navigations. Production routing must also handle failures, preserve scroll/focus expectations, and leave ordinary links usable when interception is unavailable.

# Common mistakes

- Treating `navigation.entries()` as every entry in the browser tab. It is a constrained same-origin list.
- Calling `intercept()` asynchronously after awaiting data. It must be called synchronously while the event dispatch is active.
- Intercepting every event without checking `canIntercept`, `downloadRequest`, origin, or route ownership.
- Forgetting the `navigate` event's abort signal and allowing obsolete route requests/rendering to race.
- Comparing `NavigationHistoryEntry.getState()` objects by identity or assuming state aliases classic `history.state`.
- Using `key` and `id` interchangeably. The key represents a history slot; id is unique to one entry.
- Ignoring `committed`/`finished` rejection and showing success for a route that failed.
- Removing ordinary links or server routing because modern browsers support Navigation API. Older browsers, no-JS users, crawlers, external URLs, and non-interceptable navigations still need correct behavior.
- Treating `NavigateEvent.info` or `userInitiated` as authentication/security evidence.
- Forgetting to restore focus/scroll or provide a failure route when intercepting browser navigation.

# Cross-item comparison

| Mechanism | Best fit | Main caveat |
| --- | --- | --- |
| Anchor/form navigation | Default page transitions and progressive enhancement | Full document navigation may cost more, but browser semantics remain strong |
| `history.pushState()` | Legacy/manual same-document URL-state integration | Does not fetch or render, and observing all routes can be awkward |
| Navigation API | Central same-origin SPA navigation and lifecycle handling | Requires feature detection and only exposes/intercepts eligible entries |
| `NavigationHistoryEntry.key` | Traverse to a history slot | A replace navigation can retain the slot key |
| `NavigationHistoryEntry.id` | Associate data with one specific entry | Different when a slot is replaced by a new entry |
| `NavigateEvent.intercept()` | Replace an eligible navigation with app rendering | Must be synchronous and only works when `canIntercept` is true |

# Knowledge checks with answers

1. **Can the Navigation API show the full tab history including cross-origin pages?** No. Its entry list is limited to same-origin entries in the current browsing context.
2. **When must `intercept()` be called?** Synchronously during the `navigate` event dispatch, after checking that the event can be intercepted and is trusted.
3. **What is the difference between `committed` and `finished`?** `committed` resolves after the URL/current-entry change; `finished` resolves when navigation handling completes successfully.
4. **When is a `precommitHandler` useful?** For asynchronous checks that must pass before URL/history commit; rejection aborts navigation.
5. **Why keep real `href` values?** They support direct loads, unsupported browsers, no-JavaScript use, external navigation, and normal browser semantics.
6. **Can navigation state contain secrets?** No. It is client-side history state and may persist across reload/session restoration; treat it as exposed and untrusted.

# Further reading

- [WHATWG HTML: Navigation API and session history](https://html.spec.whatwg.org/multipage/nav-history-apis.html)
- [MDN: Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
- [MDN: Navigation](https://developer.mozilla.org/en-US/docs/Web/API/Navigation)
- [MDN: NavigationHistoryEntry](https://developer.mozilla.org/en-US/docs/Web/API/NavigationHistoryEntry)
- [MDN: NavigateEvent](https://developer.mozilla.org/en-US/docs/Web/API/NavigateEvent)
