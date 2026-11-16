<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: Abort and DOM mutation observation APIs

# Scope and version

This lesson covers DOM AbortController/AbortSignal APIs and MutationObserver. Abort signals are cooperative cancellation: an API or callback must observe them. MutationObserver reports configured DOM tree/attribute/text changes asynchronously; it does not report layout or paint. See [WHATWG DOM](https://dom.spec.whatwg.org/), [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), and [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

# How this group fits the mental model

An `AbortController` is a cancellation source; its `signal` is passed to operations that support cancellation. A signal can also define a listener's lifetime. A `MutationObserver` is a queued observer: it watches a chosen node and options, accumulates `MutationRecord`s, and invokes a callback after synchronous mutations are processed.

# Supplied names explained

- `AbortController` — Controller object that can abort its associated signal once.
- `AbortController.signal` — Read-only AbortSignal controlled by this controller.
- `AbortController.abort()` — Aborts the signal, optionally with a reason; it notifies listeners and APIs observing that signal.
- `AbortSignal` — EventTarget representing an aborted/not-aborted state and reason.
- `AbortSignal.aborted` — Boolean that becomes true after abort.
- `AbortSignal.reason` — Value explaining abort; defaults to an AbortError DOMException when no reason is supplied.
- `AbortSignal.throwIfAborted()` — Throws the signal's reason if already aborted; otherwise returns normally.
- `AbortSignal.abort()` — Static factory returning an already-aborted signal with optional reason.
- `AbortSignal.timeout()` — Static factory returning a signal that aborts after the requested duration with a timeout reason. Timing is controlled by browser lifecycle/active-time rules; do not use it as a precise real-time clock.
- `AbortSignal.any()` — Static factory that aborts when any provided signal aborts, adopting the first abort reason.
- `MutationObserver` — Observer that asynchronously reports selected subtree, child-list, attribute, and character-data mutations.
- `MutationObserver.observe()` — Starts observing a target with options. At least one of `childList`, `attributes`, or `characterData` must be enabled; `subtree` extends observation to descendants.
- `MutationObserver.disconnect()` — Stops future observation and discards queued, undelivered records. Call `takeRecords()` first if those pending records matter.
- `MutationObserver.takeRecords()` — Returns and clears currently queued MutationRecords without waiting for callback delivery.
- `MutationRecord` — Record describing one mutation kind, target, added/removed nodes, and optional previous/old values.
- `MutationObserverInit.attributes` — Observes attribute changes. It is implied true when `attributeFilter` or `attributeOldValue` is provided, unless explicitly false (which can cause a TypeError).
- `MutationObserverInit.attributeFilter` — Limits observed attributes by name; use it to avoid irrelevant callbacks. It implies attributes observation unless explicitly disabled.
- `MutationObserverInit.attributeOldValue` — Requests previous attribute value in records; implies attributes observation unless explicitly disabled.
- `MutationObserverInit.characterData` — Observes text/comment node data changes.
- `MutationObserverInit.characterDataOldValue` — Requests prior character data in records and implies characterData unless explicitly disabled.
- `MutationObserverInit.childList` — Observes child insertion/removal changes.
- `MutationObserverInit.subtree` — Extends enabled observation types to descendants of the target; it does not make otherwise-disabled mutation types active by itself.

# Correct observation options

To watch added/removed children, use `{ childList: true }`. To watch descendants, add `subtree: true`. To watch selected attributes, provide `attributes: true` and `attributeFilter`; `attributeFilter` also implies attributes when not explicitly false. To capture prior values, set the matching `attributeOldValue` or `characterDataOldValue`. Incompatible combinations, such as explicitly disabling `attributes` while requesting attribute old values, throw `TypeError`.

Records are delivered asynchronously after mutations, typically at a microtask checkpoint. Several synchronous changes can be batched. Do not expect a record for every high-level user action; records describe DOM mutations. Attribute values can change and nodes can move again before the callback runs, so use the records for mutation facts, then inspect current DOM if you need the present state.

# Cancellation patterns

Use one controller for a lifecycle group: listeners, a fetch, and other abort-aware work that should end together. A controller is one-shot; after abort, make a new controller for a new lifecycle. A timeout signal is useful as a deadline; combine it with a component/navigation signal through `AbortSignal.any()`.

```js
const controller = new AbortController();
const timeout = AbortSignal.timeout(8_000);
const signal = AbortSignal.any([controller.signal, timeout]);

container.addEventListener("click", onClick, { signal: controller.signal });
fetch("/api/items", { signal }).then(handleResponse).catch(error => {
  if (signal.aborted) return;
  report(error);
});

// On teardown or route departure:
controller.abort(new DOMException("View removed", "AbortError"));
```

Cancellation prevents stale work only when every operation in the chain checks/uses the signal. If an API ignores it, code must still check before applying results.

# Mutation observer feedback loops

An observer callback that writes an observed attribute/child can cause another delivery. Guard against cycles, narrow the observation, and disconnect when done. Prefer application state/events for changes your own code already knows about; MutationObserver is useful for integrating with DOM changes made by external code or for synchronization across imperative boundaries.

# Examples

```js
const controller = new AbortController();
button.addEventListener("click", onClick, { signal: controller.signal });
fetch("/api/items", { signal: controller.signal });
// When the owning view is removed:
controller.abort();
```

The same signal can scope multiple abort-aware operations. Aborting asks participating operations to stop; it cannot undo work already completed or force an API that ignores the signal to cancel.

# Common mistakes

- Treating abort as forced thread interruption. It is a signal and APIs must cooperate.
- Reusing an already-aborted controller for a later operation.
- Forgetting rejected promises from aborted work and reporting normal errors for expected cancellation.
- Observing an entire document subtree with all options and creating large record queues.
- Expecting synchronous MutationObserver callbacks.
- Using MutationObserver to detect visibility, resize, or paint; use the relevant observer/API.
- Calling `disconnect()` before `takeRecords()` when pending records are needed.
- Setting `attributeOldValue` or `attributeFilter` while explicitly setting `attributes:false`.
- Failing to disconnect when a component/target is discarded.

# Cross-item comparison

| Need | API | Notes |
| --- | --- | --- |
| Cancel a related set of operations | `AbortController` + signal | One-shot; consumers must honor it |
| Cancel on timeout | `AbortSignal.timeout()` | Browser active-time behavior, not precision scheduling |
| Cancel when any cause occurs | `AbortSignal.any()` | First reason wins |
| Watch DOM child/attribute/text changes | `MutationObserver` | Queued and batched; narrow options |
| Watch visible intersection | `IntersectionObserver` | Not a MutationObserver job |
| Watch element box size | `ResizeObserver` | Not a MutationObserver job |

# Knowledge checks with answers

1. **Can one AbortController be reset after `abort()`?** No. Create a new controller for a new operation/lifetime.
2. **When does MutationObserver call its callback?** Asynchronously after queued mutation records are delivered, not inline with each mutation.
3. **Does `{ subtree: true }` alone observe descendants?** No; enable a mutation type such as childList, attributes, or characterData too.
4. **Why might `observe()` throw with `attributeFilter` and `attributes:false`?** The options request attribute details while explicitly disabling attribute observation.
5. **How do you preserve pending records before stopping an observer?** Call `takeRecords()`, then `disconnect()`.

# Further reading

- [WHATWG DOM: AbortSignal](https://dom.spec.whatwg.org/#interface-AbortSignal)
- [WHATWG DOM: Mutation observers](https://dom.spec.whatwg.org/#mutation-observers)
- [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
