<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Exercises and worked solutions

# Goals

Practice selecting DOM APIs by their contracts, managing asynchronous lifetimes, safely handling markup, and enhancing navigation without breaking browser behavior. Each exercise includes a complete solution; attempt it before opening the answer.

# Worked example

**Task:** Render untrusted plain text as a list item, then remove it when its owning panel closes.

```js
function addMessage(list, text, signal) {
  const item = document.createElement("li");
  item.textContent = text;
  list.append(item);
  signal.addEventListener("abort", () => item.remove(), { once: true });
}

const panelLifetime = new AbortController();
addMessage(document.querySelector("#messages"), userSuppliedText, panelLifetime.signal);
// When closing the panel:
panelLifetime.abort();
```

The data is inserted as text rather than parsed as HTML. The abort signal scopes cleanup to the panel; in production, also handle an already-aborted signal if the function can be called after teardown.

# Exercises

## Exercise 1 — Event delegation and default actions

A dynamic list contains links and buttons. Explain why a single listener on the list can handle newly inserted buttons, then implement a delegated handler for `button[data-action="remove"]`. The handler must ignore clicks from outside the list and must not cancel unrelated link navigation.

## Exercise 2 — Choose an observation mechanism

A card’s dimensions change after a font loads. The card’s DOM attributes and children do not change. Which observer should report this? Describe one feedback loop to avoid and show how to stop observing when the card is removed.

## Exercise 3 — Cancel stale work

Search input triggers a fetch for every submitted query. A response for an older query must not replace newer results. Implement cancellation so the latest request supersedes the previous one. State what cancellation does not guarantee.

## Exercise 4 — Safe rich content with fallback

An application accepts user-provided comments as plain text. Implement a feature-detected path using `Element.setHTML()` if present, and a safe fallback. Explain why the fallback must not use raw `innerHTML`.

## Exercise 5 — Storage and cross-document updates

Two same-origin tabs show a preference stored in `localStorage`. Explain which tab receives the `storage` event after one tab calls `setItem`, and give a robust read/write strategy that handles unavailable storage and validates the stored value.

## Exercise 6 — Navigation enhancement

Describe how to progressively enhance eligible same-origin link navigation with the Navigation API while retaining ordinary navigation when unsupported or ineligible. Explain the purpose of `canIntercept`, the `committed` and `finished` promises, and why the API is not a universal replacement for links.

# Progressive hints

1. **Exercise 1:** `event.target` can be a nested icon. Find the nearest matching button, then verify the list contains it. Do not call `preventDefault()` unless you deliberately handle a cancelable default action.
2. **Exercise 2:** Match the signal to the question being asked: DOM structure, intersection, or element box size. An observer callback that changes the observed size can retrigger itself.
3. **Exercise 3:** Keep the current controller. Abort it before replacing it. Pass its signal to `fetch` and guard against errors caused by abort.
4. **Exercise 4:** The fallback can create a text node or assign `textContent`. The safe native method parses and sanitizes according to its safe contract; a generic string parser alone is not a sanitizer.
5. **Exercise 5:** The writing document does not receive its own storage event. Treat reads as fallible and stored data as untrusted.
6. **Exercise 6:** Feature-detect `window.navigation`; during the event, verify the navigation is interceptable and same-origin before calling `intercept()` synchronously.

# Complete solutions

## Exercise 1

```js
list.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button[data-action="remove"]');
  if (!button || !list.contains(button)) return;
  const row = button.closest("li");
  row?.remove();
});
```

The listener is attached to a stable ancestor, so it also sees bubbling clicks from descendants added later. `closest()` handles clicks on nested icon elements. The containment check prevents matching a button outside the list. Since this is a button action, no link default action needs cancellation; the handler leaves unrelated events alone.

## Exercise 2

Use `ResizeObserver`, since the question concerns an element’s box size, not DOM mutations or viewport intersection.

```js
const card = document.querySelector(".card");
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    updateDependentDecoration(entry.contentRect.width);
  }
});
observer.observe(card);

// Teardown when the owning view is disposed:
observer.unobserve(card);
observer.disconnect();
```

Avoid setting the same observed card’s width from its callback based on its current width. That can produce repeated deliveries or a resize-loop warning. If a size-dependent layout is required, make the update converge, schedule carefully, or use CSS layout features instead.

## Exercise 3

```js
let currentSearch;

async function search(query) {
  currentSearch?.abort();
  const controller = new AbortController();
  currentSearch = controller;

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const results = await response.json();
    if (currentSearch === controller && !controller.signal.aborted) {
      renderResults(results);
    }
  } catch (error) {
    if (!controller.signal.aborted) reportSearchError(error);
  } finally {
    if (currentSearch === controller) currentSearch = undefined;
  }
}
```

The signal allows fetch to reject when aborted and the identity guard prevents an obsolete completion from rendering. Cancellation does not undo a request already processed by the server, guarantee that every downstream operation honors the signal, or roll back side effects already completed.

## Exercise 4

```js
function renderComment(target, comment) {
  if (typeof target.setHTML === "function") {
    target.setHTML(comment);
  } else {
    target.textContent = comment;
  }
}
```

For plain text, `textContent` is the correct fallback and preserves the requirement safely. Raw `innerHTML` parses input as markup and may create executable or otherwise dangerous DOM. If product requirements require formatted rich text in browsers without the native API, use a maintained sanitizer with a reviewed policy; do not silently weaken the fallback. Sanitizer API support remains uneven, so feature detection is necessary. [HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)

## Exercise 5

The tab that performs the write does not receive the `storage` event; other relevant same-origin documents may receive it. Handle storage access failures and validate the string:

```js
const allowed = new Set(["compact", "comfortable"]);

function readView() {
  try {
    const value = localStorage.getItem("view");
    return allowed.has(value) ? value : "comfortable";
  } catch {
    return "comfortable";
  }
}

function saveView(value) {
  if (!allowed.has(value)) return;
  try {
    localStorage.setItem("view", value);
  } catch {
    // Keep the in-memory preference; persistence is optional.
  }
}

window.addEventListener("storage", event => {
  if (event.key !== "view") return;
  try {
    if (event.storageArea !== window.localStorage) return;
  } catch {
    return; // Storage may be blocked in this document.
  }
  applyView(allowed.has(event.newValue) ? event.newValue : "comfortable");
});
```

Storage availability can vary with policy, privacy mode, origin, and quota. Stored content is input and should be validated. [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)

## Exercise 6

```js
if ("navigation" in window) {
  navigation.addEventListener("navigate", event => {
    if (!event.canIntercept || event.downloadRequest !== null) return;
    const destination = new URL(event.destination.url);
    if (destination.origin !== location.origin || !destination.pathname.startsWith("/app/")) return;

    event.intercept({
      handler: async () => renderRoute(destination)
    });
  });
}
```

`canIntercept` reports whether this navigation can be intercepted under the API’s rules; it does not replace application policy checks. Interception must be initiated synchronously during event dispatch. The returned navigation result distinguishes `committed` (the navigation became current) from `finished` (its work completed). Handle rejection, loading/focus/scroll behavior, and route failures. Cross-origin navigation, downloads, and other ineligible cases remain browser navigations. Keep real links so keyboard use, open-in-new-tab, copy-link, refresh, and unsupported browsers still work. [WHATWG Navigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html), [MDN Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)

# Tests and edge cases

- Click a nested icon inside a delegated button; ensure the button action still runs.
- Click an unrelated link inside the list; verify the handler does not cancel its default navigation.
- Remove the observed card and verify its observer is disconnected by its owner.
- Let an older request resolve after a newer request; verify it cannot overwrite current results.
- Pass `<img src=x onerror=alert(1)>` as a comment; with the text fallback it must display as characters.
- Disable or deny storage and verify the interface still renders with a default preference.
- Open two same-origin tabs; verify the writing tab updates locally and the other tab responds to `storage`.
- Test navigation interception with a normal eligible link and with a download or cross-origin destination; retain browser behavior in the latter cases.

# Reflection questions

1. Which API contract told you to choose each observer?
2. Why is cancellation not equivalent to transaction rollback?
3. If rich HTML is essential, what policy and fallback would you review before release?
4. Which user-visible expectations can be lost by intercepting links carelessly?
5. Which state belongs in the URL, Web Storage, or only in memory, and why?

# Further reading

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG HTML dynamic markup insertion](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Navigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html)
