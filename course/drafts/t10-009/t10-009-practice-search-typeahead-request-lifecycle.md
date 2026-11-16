# architecture interviews tradeoffs requirements and constraints — Problem: Trace a search-as-you-type request end to end

## Goals

Explain the full lifecycle of a typeahead search request, keep visible results consistent with the latest query, and account for keyboard access, failures, privacy, and server limits.

## Worked example

A user types `ca`, then `cat` before the first request returns. The `cat` response arrives first, followed by the older `ca` response. A correct design must not replace the current suggestions with stale results.

### Client input and scheduling

When a user edits the input, the browser dispatches an `input` event. In React, the event handler updates controlled input state immediately so the typed text stays responsive. The application may normalize whitespace and wait for a short debounce interval before querying; debounce reduces duplicate requests but adds latency, so choose it from product and measurement needs. Define behavior for empty or too-short queries instead of sending every keystroke.

When a query is eligible, the client starts an HTTP request. It can cancel an obsolete request with a fresh `AbortController`, and it should also guard state updates with a request sequence or current-query check. Cancellation saves some client/network work when it is timely; it does not prove the server never received or began processing the request. The UI must be correct even if responses race.

```js
let activeController;
let requestId = 0;

async function loadSuggestions(query) {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const id = ++requestId;

  try {
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const items = await response.json();
    if (id === requestId) renderSuggestions(items);
  } catch (error) {
    if (error.name !== 'AbortError' && id === requestId) showSearchError();
  }
}
```

The server validates length and syntax, applies authentication and authorization to every result, limits page size and request rate, and uses a query strategy/index appropriate to the product's matching semantics. A prefix lookup, full-text search, and fuzzy search have different costs and ranking behavior. Never assume client-side filtering is an authorization boundary. Encode data in the UI; do not treat returned suggestions as trusted HTML.

### Response and accessible interaction

Represent `idle`, `loading`, `success-with-results`, `success-empty`, and `error` states explicitly. Keep old results only if the design labels them as stale; otherwise clear or mark them while loading. For a listbox popup, maintain DOM focus in the text input, support Arrow keys to move the active option, Enter to select, Escape to dismiss, and normal text editing. Announce useful state changes without flooding a live region on every character.

Use a semantic label and the correct combobox pattern when implementing a custom popup. `aria-expanded` reflects whether the popup is open; `aria-controls` points to the popup; `aria-activedescendant` identifies the active option when focus stays on the input. `aria-autocomplete` describes the behavior for assistive technologies; it does not implement autocomplete. A native search input or `<datalist>` may be a better choice when its behavior meets product needs.

## Exercises

1. Draw the flow from keypress through input state, debounce, HTTP request, API validation, query, response, and rendered option.
2. The user types `dog`, then clears the input while the request is in flight. Define the expected behavior if the response arrives afterward.
3. A results endpoint is fast in local testing but expensive under a bot that submits 100 requests per second. Where must protections live?
4. Explain a keyboard interaction sequence for opening suggestions, selecting the second option, and dismissing the list.

## Progressive hints

1. Client cancellation and stale-result protection solve related but distinct problems.
2. A zero-length query is a state transition, not just another successful empty result.
3. The server owns authorization, validation, rate limits, and query-cost bounds.
4. The active suggestion is not necessarily the DOM-focused element. Choose and implement one coherent focus model.

## Complete solutions

1. The input event updates local state immediately. A debounce may schedule work. The client sends a parameterized request; the API validates and authorizes it, executes an indexed query with a bounded result count, and returns structured data. The client rejects stale results and renders loading, empty, error, or suggestion state. Selection may navigate or populate a form according to the product contract.
2. Increment the request generation and abort the old request. Clear the popup and return to idle (or a documented recent-search state). If the server still responds, the generation check prevents the result from reopening the suggestions for an empty query.
3. Enforce rate and concurrency limits on the server or gateway, cap query size and result count, require appropriate authorization, use timeouts/cancellation, and monitor cost and error rates. Client debounce is a usability optimization and cannot protect a public endpoint by itself.
4. Focus begins on the labeled input. Down Arrow opens the list and sets the active option; another Arrow Down moves to option two while DOM focus remains on the input and `aria-activedescendant` points to that option. Enter selects and applies the defined result action. Escape closes the list without unexpectedly destroying the typed value. Test Tab and pointer behavior too.

## Tests and edge cases

- Out-of-order success, request failure, timeout, abort, malformed response, and retry.
- Clearing the query, query below minimum length, Unicode input, whitespace normalization, and rapid composition/IME input.
- Equal suggestion labels with distinct identifiers, empty results, maximum result count, and a result removed before selection.
- Keyboard-only use, screen reader announcement behavior, focus restoration, popup dismissal, and mobile touch selection.
- Authorization changes between query and selection; every selected item must be validated again by the operation that uses it.
- Sensitive queries in logs, analytics, browser history, caches, and referrer data; collect and retain only what the product needs.
- The signal may abort response-body consumption as well as the fetch; handle `AbortError` without surfacing it as a user-facing failure.

## Reflection questions

1. When is a request-generation guard needed even if you call `abort()`?
2. Which product requirements determine whether to debounce, throttle, or query on submit?
3. What should a system-design interviewer hear about search ranking and authorization boundaries?

## Sources

- [MDN: AbortController.abort](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
- [MDN: ARIA combobox role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role)
- [MDN: aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
