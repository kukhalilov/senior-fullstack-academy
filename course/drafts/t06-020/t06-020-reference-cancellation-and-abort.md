<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Reference: AbortController, AbortSignal, and cancellation

# Scope and version

This reference covers cancellation primitives used with Fetch and other abort-aware APIs. It follows the current DOM and Fetch standards checked 2026-11-16. `AbortSignal.any()` and `timeout()` are now broadly available in current browsers; verify older targets. See [WHATWG DOM AbortSignal](https://dom.spec.whatwg.org/#interface-AbortSignal), [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), and [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

# How this group fits the mental model

`AbortController` is the capability holder: code with the controller may request cancellation. `AbortSignal` is the read-only notification channel passed to operations. Any API must opt in to honoring that signal. Aborting is cooperative and time-sensitive: it can reject a pending Fetch/body read, but cannot undo server work already received or reverse an operation that completed.

# Supplied names explained

- `AbortController` — Creates one associated signal and provides the ability to abort operations that receive it.
- `AbortController.prototype.abort` — Aborts the controller's signal once with an optional reason; the default reason is an `AbortError` DOMException. Later calls do not replace the first reason.
- `AbortController.prototype.signal` — The `AbortSignal` to pass into `fetch`, event listeners, or another abort-aware API.
- `AbortSignal` — Read-only event-target signal describing cancellation state/reason and allowing composition/timeouts.
- `AbortSignal.abort` — Static factory returning an already-aborted signal with an optional reason; use when an operation should reject immediately without constructing a controller.
- `AbortSignal.any` — Static factory combining signals; the result aborts when the first input signal aborts and adopts that reason. An already-aborted input makes the resulting signal already aborted.
- `AbortSignal.timeout` — Static factory that aborts after an active-time delay, not necessarily exact elapsed wall-clock time; time can pause in a suspended worker or a document stored in the back-forward cache. It signals cancellation but does not retry or guarantee server rollback.
- `AbortSignal.prototype.aborted` — Boolean that becomes true after the signal aborts; it never returns to false.
- `AbortSignal.prototype.reason` — First abort reason, or undefined before abort. Code may use a custom Error or sentinel reason.
- `AbortSignal.prototype.throwIfAborted` — Throws the signal's reason immediately if aborted; useful at async operation boundaries before expensive work.
- `AbortSignal.prototype.onabort` — Event-handler property for the `abort` event. Prefer `addEventListener("abort", handler, { once: true })` where multiple listeners or lifecycle removal are needed.
- `AbortError` — Common DOMException name used when Fetch or another abort-aware API rejects due to abort. Custom abort reasons can cause the rejection reason/name to differ, so compare against the signal or handle the operation contract rather than hard-code only this name.

# Cancellation patterns

## One operation per controller

Create a controller for one coherent lifetime: a search query, route transition, dialog, or upload. Abort the previous query before creating the next controller. Pass the signal as `RequestInit.signal`. If the operation has multiple stages, pass the same signal into each supporting stage so cancellation propagates.

## Combine caller cancellation with a deadline

```js
async function fetchWithDeadline(url, callerSignal, milliseconds = 8_000) {
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, AbortSignal.timeout(milliseconds)])
    : AbortSignal.timeout(milliseconds);
  return fetch(url, { signal });
}
```

The resulting signal preserves the reason from the signal that aborts first. Catch abort/deadline failures separately from network/HTTP errors. A deadline is a client-side patience limit, not a server timeout contract.

## Handle already-aborted signals and stale completion

Adding an abort listener after a signal already aborted does not replay the event. Check `signal.aborted` or call `throwIfAborted()` before starting work. For UI races, use both abort and a request identity guard: some work can finish just before cancellation or ignore the signal.

```js
let activeController;
let sequence = 0;

async function load(query) {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const thisSequence = ++sequence;

  try {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (thisSequence === sequence && !controller.signal.aborted) render(result);
  } catch (error) {
    if (!controller.signal.aborted) showError(error);
  }
}
```

# Cancellation and request/body lifecycle

Aborting while waiting for headers rejects the fetch promise. Aborting after headers can also make a pending body read reject. If the body is being read manually, stop the reader or allow signal propagation to cancel the response stream; do not leave a reader locked indefinitely. A response may have arrived and the server may have committed a change before the client observes the abort. For mutations, use idempotency keys, operation status queries, or compensating actions when the application needs a reliable outcome.

The `abort` event fires once. Signals are reusable for notification but are not resettable: create a new controller for the next independent lifetime. Aborting is not a substitute for clearing timers, removing resources from application registries, or cleaning up APIs that do not accept signals.

# Examples

Tie listeners and a request to a component lifetime:

```js
const lifetime = new AbortController();
button.addEventListener("click", onClick, { signal: lifetime.signal });
const responsePromise = fetch("/api/data", { signal: lifetime.signal });

// When the component is disposed:
lifetime.abort(new DOMException("View closed", "AbortError"));
```

Passing a signal to `addEventListener` removes the listener when aborted. The custom reason becomes the signal's reason; code should not assume every rejection is exactly a default-created `AbortError`.

# Common mistakes

- Reusing an aborted controller for a later request.
- Creating a new controller but forgetting to pass its signal.
- Assuming abort means the server never received or processed the request.
- Assuming `timeout()` counts exact wall-clock time while a page is suspended.
- Adding an abort listener after the signal is already aborted and expecting it to fire immediately.
- Treating every `AbortError` as a user cancel; timeout and programmatic cancellation can use similar error names.
- Ignoring abort errors and hiding unrelated network failures with a broad empty catch.
- Assuming APIs without a signal option will automatically stop when Fetch is aborted.
- Catching a cancellation but still rendering stale results without an identity check.

# Cross-item comparison

| Need | API | Key property |
| --- | --- | --- |
| User/component requests cancellation | `AbortController` | Mutable authority; one-shot abort |
| Operation observes cancellation | `AbortSignal` | Read-only status/reason/event |
| Deadline | `AbortSignal.timeout()` | Active-time deadline, cooperative |
| Cancel on any of several causes | `AbortSignal.any()` | First reason wins |
| Already-canceled operation | `AbortSignal.abort()` | Creates a pre-aborted signal |
| Prevent stale UI result | Signal plus request identity | Cancellation alone may race/ be ignored |

# Knowledge checks with answers

1. **Can you reset a signal after abort?** No; create a new controller.
2. **Does `AbortSignal.timeout(5000)` guarantee five seconds of wall-clock elapsed time in every lifecycle state?** No; it measures active time and can pause while contexts are suspended.
3. **What reason does `AbortSignal.any()` use?** The reason from the first input signal to abort.
4. **Does abort roll back a POST already processed by the server?** No; it only communicates client-side cancellation.
5. **Why check `signal.aborted` before registering a listener?** Abort events are not replayed for a signal that already aborted.

# Further reading

- [WHATWG DOM AbortSignal](https://dom.spec.whatwg.org/#interface-AbortSignal)
- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
