
# Browser DOM events storage observers and navigation APIs — Reference: Web storage and classic session history APIs

# Scope and version

This reference covers Web Storage, its cross-document event, classic `History`, fragment changes, and URL utilities. APIs and behavior were checked against the current HTML and URL Living Standards on 2026-11-19. Storage policy, quota, and partitioning vary by user agent and user settings. See [WHATWG HTML Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html), [WHATWG navigation/history](https://html.spec.whatwg.org/multipage/nav-history-apis.html), [WHATWG URL](https://url.spec.whatwg.org/), [MDN Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage), and [MDN History](https://developer.mozilla.org/en-US/docs/Web/API/History).

# How this group fits the mental model

Web Storage is a synchronous, origin-scoped string key/value shelf. Classic History manipulates the current browsing context's session history and same-document state. URL/URLSearchParams parse and edit structured URLs. They serve different purposes and have different persistence, security, and navigation effects.

# Supplied names explained

- `localStorage` — Storage area for the document's origin that generally persists across sessions. Access can throw when blocked or unavailable; data may be cleared or partitioned by browser policy.
- `sessionStorage` — Storage area scoped to the origin and top-level browsing context's page session. Same-origin frames in that tab can share it; a newly opened context may initially copy opener state, then diverge.
- `Storage.length` — Number of keys in the storage area at the time read.
- `Storage.key()` — Returns the key at a numeric index or null when out of range. Enumeration order is not a business-order guarantee.
- `Storage.getItem()` — Gets the string for a key or null when missing. Use this method when a stored value could collide with prototype/property names.
- `Storage.setItem()` — Stores a string value and can throw `QuotaExceededError` or security-related exceptions. Values are converted to strings by the API; serialize structured data deliberately.
- `Storage.removeItem()` — Removes one key if present.
- `Storage.clear()` — Removes all keys in that storage area. Avoid clearing data owned by unrelated features sharing the origin.
- `StorageEvent` — Event delivered to other documents when a storage area changes; the source document does not receive its own write event.
- `StorageEvent.key` — Changed key; null for a `clear()` operation.
- `StorageEvent.oldValue` — Prior string value; null if the key was newly added or `clear()` occurred.
- `StorageEvent.newValue` — New string value; null when a key was removed or `clear()` occurred.
- `StorageEvent.url` — URL of the document that performed the change.
- `StorageEvent.storageArea` — Storage object affected (local or session storage), or null in some cases.
- StorageEvent() constructor and `StorageEventInit` — Constructs a synthetic storage event with optional key/oldValue/newValue/url/storageArea and inherited event flags; dispatching one does not change storage.
- `StorageEvent.initStorageEvent()` — Legacy initializer retained for compatibility; use the constructor for new code.
- `storage event` — Cross-document notification for storage changes subject to same-origin/storage-area rules. It is not a lock or transaction protocol; simultaneous writes can race.
- `History.length` — Number of entries in the session history list for this browsing context; it does not expose all URLs.
- `History.state` — State associated with the current history entry, structured-cloned by history APIs. Treat it as client-visible, untrusted, and serializable data.
- `History.scrollRestoration` — `auto` lets the browser restore scroll position during traversals; `manual` transfers that responsibility to the application.
- `History.pushState()` — Adds a same-document history entry with state and optional same-origin URL. It does not fetch the URL or fire `popstate` immediately.
- `History.replaceState()` — Replaces the current same-document entry's state/URL without adding a new entry or performing a fetch.
- `History.back()` — Asynchronously traverses one entry backward; the result is observed through navigation events such as `popstate`, not a return value.
- `History.forward()` — Asynchronously traverses one entry forward.
- `History.go()` — Traverses by a relative index; zero reloads the current page. Out-of-range requests may do nothing.
- `popstate event` — Fires when history traversal activates a same-document entry; its `state` can be null, including for entries without application state. It is not fired by `pushState()`/`replaceState()` at the time they are called. Browser timing/state restoration requires care.
- PopStateEvent() constructor, `PopStateEventInit`, `PopStateEvent.state`, and `PopStateEvent.hasUAVisualTransition` — Synthetic-event initialization fields and state snapshot for the activated entry; `hasUAVisualTransition` signals that the browser performed a visual transition before dispatch, so feature-detect it.
- `hashchange event` — Fires when fragment navigation changes the document URL's fragment. `pushState()`/`replaceState()` do not trigger it merely because they changed a hash.
- HashChangeEvent() constructor, `HashChangeEventInit`, `HashChangeEvent.oldURL`, and `HashChangeEvent.newURL` — Event constructor/dictionary plus previous and current URL strings for a fragment-change event.
- `URL` — Parses/resolves URL components with standards-based normalization; use `new URL(input, base)` and validate allowed protocols/hosts for security-sensitive links.
- URL() constructor — Parses an absolute URL or resolves a relative URL against a base; invalid input throws `TypeError`.
- `URL.parse()` and `URL.canParse()` — Static helpers returning a parsed URL or null, and a parseability boolean; newer support can vary, so feature-detect.
- `URL.href`, `URL.toJSON()`, `URL.origin`, `URL.protocol`, `URL.username`, `URL.password`, `URL.host`, `URL.hostname`, `URL.port`, `URL.pathname`, `URL.search`, `URL.searchParams`, and `URL.hash` — Stringifier/serialization, origin, and mutable or read-only component views. `searchParams` is live with the URL; changing it can normalize query encoding.
- `URLSearchParams` — Encodes/decodes a query parameter list. `append()` preserves repeated keys, `set()` replaces them, `getAll()` returns all values, and automatic serialization can normalize encoding/order.
- URLSearchParams() constructor — Builds an ordered name/value list from a query string, pair sequence, or record; string input uses form-style decoding.
- `URLSearchParams.size` — Number of name/value pairs, including duplicate names.
- URLSearchParams.append(), URLSearchParams.delete(), URLSearchParams.get(), URLSearchParams.getAll(), URLSearchParams.has(), URLSearchParams.set(), and URLSearchParams.sort() — Mutate or query pairs; optional value arguments for `delete`/`has` are newer and may need compatibility checks. `set()` keeps one value, while `append()` preserves duplicates.
- URLSearchParams.entries(), URLSearchParams.keys(), URLSearchParams.values(), URLSearchParams.forEach(), URLSearchParams[Symbol.iterator], and URLSearchParams.toString() — Iterate pairs in list order or serialize using `application/x-www-form-urlencoded` rules (spaces become `+`).

# Storage failure and security model

Storage is not guaranteed to be available or durable. Access to `window.localStorage`/`sessionStorage` itself can throw in restricted contexts, and writes can fail due to quota. Wrap access in error handling and keep the application usable when persistence fails. It is synchronous, so avoid large data or high-frequency writes on the main thread.

All stored values are client-controlled. Do not store secrets, access tokens, authorization decisions, or data that would grant privileges if edited. JSON parsing does not validate schemas; parse, validate, handle version migrations, and consider prototype-pollution-prone merge patterns. Storage can be cleared, partitioned, or shared among same-origin features.

# History behavior

`pushState()` and `replaceState()` update the active same-document history entry and optionally its URL; they do not cause a network fetch. The URL must be same-origin. State must be structured serializable and may be persisted by the browser, so keep it small and non-sensitive. Traversals such as Back/Forward trigger `popstate` when a different same-document entry becomes active, even if its state is null. The event may occur before the browser finishes restoring persisted user state such as scroll/form values; apps should avoid assuming the entire page is already settled.

For new SPA routing, compare this API with the modern Navigation API lesson. Classic history remains widely used and can still be appropriate, but it has no single central event for every eligible navigation and does not expose entry identity/list in the same-origin, app-focused way.

# URL and query handling

Use `URL` to parse a complete URL rather than concatenating strings. `URLSearchParams` is an ordered list of pairs, so duplicate keys are allowed. `get()` returns the first matching value; `getAll()` is needed for repeated values. `set()` replaces all values for a name with one; `append()` adds another. Query parameters are not automatically trustworthy input and may be exposed in history, logs, and referrers.

# Examples

```js
try {
  const raw = sessionStorage.getItem("preferred-view");
  const view = raw === "compact" ? "compact" : "comfortable";
  renderView(view);
} catch {
  renderView("comfortable"); // storage may be unavailable
}
```

Storage reads can fail under browser policy, and stored strings should be validated before use. For shareable or restorable navigation state, prefer a URL parameter or route over hidden storage.

# Common mistakes

- Assuming `localStorage` is a secure secret store. Any script running in the origin can read it.
- Assuming a storage write always succeeds or has unlimited quota.
- Using `clear()` to remove one feature's keys.
- Expecting the writing document to receive its own `storage` event.
- Treating `storage` events as a transactional cross-tab lock; races remain possible.
- Expecting `pushState()` to fetch/render the new route or fire `popstate` immediately.
- Expecting `hashchange` after `pushState()` changes the fragment.
- Putting nonserializable or large values into history state.
- Trusting state/query/storage input as authorization or schema-valid data.
- Concatenating URL strings instead of parsing and validating protocol/origin.
- Treating URLSearchParams as a map with only one value per name.

# Cross-item comparison

| Need | API | Lifetime/scope |
| --- | --- | --- |
| Small same-origin persistent strings | `localStorage` | Across sessions, subject to browser policy |
| Small same-origin tab-session strings | `sessionStorage` | Top-level browsing context page session |
| Share write notification with other documents | `storage` event | Cross-document; not source document |
| Add same-document URL/state entry | `pushState()` | Session history entry, no fetch |
| Replace current URL/state | `replaceState()` | Current entry only |
| Observe browser Back/Forward traversal | `popstate` | Traversal event, not push/replace event |
| Parse or edit query pairs | `URL` + `URLSearchParams` | URL data; repeated values supported |

# Knowledge checks with answers

1. **Does `localStorage` protect a value from JavaScript in the same origin?** No; any same-origin script can read it.
2. **Does a page get a `storage` event for its own write?** No.
3. **Does `pushState()` fetch the new URL?** No; it updates session history/URL state only.
4. **Which URLSearchParams method retains multiple values?** `append()` adds duplicates; use `getAll()` to retrieve them.
5. **What should happen if storage is unavailable?** Catch access/write failures and preserve app functionality without persistence.

# Further reading

- [WHATWG HTML Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG HTML session history](https://html.spec.whatwg.org/multipage/nav-history-apis.html)
- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [MDN Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
- [MDN History](https://developer.mozilla.org/en-US/docs/Web/API/History)
- [MDN URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
