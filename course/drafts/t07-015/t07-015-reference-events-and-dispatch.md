<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: DOM event targets, event objects, and dispatch methods

# Scope and version

This reference covers WHATWG DOM event targets, event construction/dispatch, listener options, event phases, cancellation, shadow composition, and delegation. It describes DOM event mechanics, not React's synthetic event layer. See [WHATWG DOM events](https://dom.spec.whatwg.org/) and [MDN EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

# How this group fits the mental model

An EventTarget keeps listeners. An event object carries information and flags. Dispatch invokes matching listeners synchronously through a path (capture, target, bubble where applicable), while a default action may occur after dispatch unless canceled. Propagation and default-action cancellation are separate controls.

# Supplied names explained

- `EventTarget` — Base interface for objects that can receive and dispatch events.
- EventTarget() constructor — Creates an EventTarget with its own listener list; a directly constructed EventTarget is not attached to a DOM tree and does not acquire a browser default action automatically.
- `EventTarget.addEventListener()` — Registers a callback/listener object for a type, optionally with capture, once, passive, and abort signal behavior. Re-adding the same type/callback/capture combination does not create a duplicate listener.
- `EventTarget.removeEventListener()` — Removes a matching listener; callback identity, type, and capture flag must match. A different anonymous function does not remove the original.
- `EventTarget.dispatchEvent()` — Synchronously dispatches an untrusted event and returns false only when a cancelable event was canceled. It does not emulate a trusted user gesture.
- `AddEventListenerOptions.capture` — Registers for capture phase; affects listener matching/removal.
- `EventListenerOptions.capture` — Base option shared by add/remove listener dictionaries; the legacy boolean third argument is shorthand for this capture setting.
- `AddEventListenerOptions.once` — Removes the listener after its first invocation.
- `AddEventListenerOptions.passive` — Declares that the listener will not cancel the default action. Calling `preventDefault()` from a passive listener has no effect (and may warn).
- `AddEventListenerOptions.signal` — Removes the listener when the supplied AbortSignal aborts; useful for lifecycle cleanup.
- `Event` — Base event object with type, target/current target, propagation, cancellation, and trust state.
- `Event.type` — Event type string, such as `click` or a custom name.
- `Event.target` — Original/retargeted event target as exposed at the current boundary; shadow DOM can retarget it.
- `Event.currentTarget` — Object whose listener is currently running; becomes null outside listener dispatch.
- `Event.eventPhase` — Numeric phase constant: NONE, CAPTURING_PHASE, AT_TARGET, or BUBBLING_PHASE.
- `Event.NONE`, `Event.CAPTURING_PHASE`, `Event.AT_TARGET`, and `Event.BUBBLING_PHASE` — Numeric eventPhase constants for outside dispatch, capture, target, and bubble phases.
- `Event.bubbles` — Whether the event participates in bubbling beyond the target; many events do not bubble.
- `Event.cancelable` — Whether `preventDefault()` can cancel this event's default action.
- `Event.composed` — Whether the event can cross a shadow DOM boundary, subject to retargeting and composed path rules.
- `Event.defaultPrevented` — True after a successful cancellation of a cancelable event.
- `Event.isTrusted` — True for browser-generated trusted events; false for events dispatched by script. It is not an authentication/authorization signal.
- `Event.timeStamp` — Event creation timestamp in the relevant time origin's high-resolution timing model; do not assume it is a wall-clock Unix timestamp.
- `Event.srcElement` — Legacy alias for `target`; use `target` in new code.
- `Event.cancelBubble` — Legacy propagation-control alias related to `stopPropagation()`; use the method for clarity.
- `Event.returnValue` — Legacy cancellation property; use `preventDefault()` and `defaultPrevented` instead.
- `Event.initEvent()` — Legacy event initializer retained for compatibility; constructors are the normal way to create events and initialization after dispatch has begun is not useful.
- `Event.preventDefault()` — Requests cancellation of the default action when cancelable and not passive. It does not stop propagation.
- `Event.stopPropagation()` — Stops further traversal to later targets; other listeners on the current target can still run.
- `Event.stopImmediatePropagation()` — Stops further propagation and prevents later listeners on the current target.
- `Event.composedPath()` — Returns the event's exposed propagation path, with shadow-boundary visibility rules.
- `CustomEvent` — Event subtype carrying an application-provided `detail` value.
- `CustomEvent.detail` — The supplied detail value; it is not automatically deep-cloned or validated.
- `CustomEvent() constructor` — Constructs a CustomEvent with optional `CustomEventInit` fields including detail, bubbles, cancelable, and composed.
- `CustomEvent.initCustomEvent()` — Legacy initializer retained for compatibility; use the constructor and `CustomEventInit` for new code.
- `Event() constructor` — Constructs an Event with optional `EventInit` fields; script-created events are untrusted.
- `EventInit` — Initialization dictionary containing `bubbles`, `cancelable`, and `composed` booleans, defaulting false.
- `CustomEventInit` — EventInit plus a `detail` value, default null.
- `EventListener` and `EventListener.handleEvent()` — Listener callback contract; listeners can be functions or objects whose `handleEvent(event)` method is called with the listener object as `this`.
- `Capture phase` — Dispatch travels from outer path ancestors toward the target, invoking capture listeners.
- `Target phase` — Listeners on the target run; capture listeners on target and non-capture listeners may both apply according to dispatch rules.
- `Bubble phase` — After target, events with `bubbles=true` travel outward through ancestors to invoke non-capture listeners.
- `Event delegation` — Attach one listener to a stable ancestor and inspect the event target/path to handle descendant interactions; account for nested matching elements and shadow retargeting.
- `Cancelable event` — An event whose default action can be canceled with `preventDefault()` unless the listener is passive.
- `Composed event` — An event allowed to cross a shadow boundary; event.target may be retargeted and composedPath visibility is boundary-dependent.
- `AbortSignal event-listener option` — The `signal` option ties a listener to an abortable lifetime; aborting removes the listener.

# Dispatch path and ordering

The browser constructs an event path from the target through relevant ancestors and shadow hosts. Capture listeners run down the path, then target listeners, then bubble listeners if the event bubbles. At target, capture and non-capture listeners are both meaningful; do not infer exact ordering from a simplified diagram alone. `currentTarget` identifies the listener's object; `target` identifies the original/retargeted target.

Listeners run synchronously during dispatch. Exceptions are reported by the platform and do not make `dispatchEvent()` a promise. If an event listener queues a microtask, that later work is separate from the current dispatch/default-action flow.

# Cancellation and propagation

Use `preventDefault()` to stop a cancelable browser action such as link navigation or form submission. Use propagation methods only when ancestor listeners must not receive the event. Most code should let propagation continue and handle intent at a suitable boundary. Passive listeners are useful for high-frequency scroll/touch listeners when cancellation is unnecessary; they cannot cancel.

# Shadow DOM and custom events

Events crossing a shadow boundary may be retargeted so outside listeners do not see internal nodes as their target. `composedPath()` exposes only the path permitted to the listener. For a custom event intended for outside consumers, set `{ bubbles: true, composed: true }` deliberately; defaults are false. `detail` can hold any JavaScript value, so define a stable shape and do not assume consumers treat it as trusted.

# Event delegation

Delegation reduces listener count for many repeated descendants and supports descendants added later. Check that the matched element is within the intended container (for example `container.contains(match)`) and understand that `target` may be a text node or retargeted element. For shadow DOM, use composedPath and component events instead of reaching into private internals.

# Examples

```js
list.addEventListener("click", event => {
  const button = event.target.closest("button[data-id]");
  if (!button || !list.contains(button)) return;
  selectItem(button.dataset.id);
});
```

Delegation lets one listener handle descendants added later. The containment check prevents a matching button outside the intended list from being treated as one of its controls.

# Common mistakes

- Calling `preventDefault()` to stop a parent handler; use propagation control only when needed.
- Calling `stopPropagation()` to stop a link/form default action; use `preventDefault()`.
- Forgetting a listener is passive and expecting cancellation to work.
- Removing a listener with a newly created function rather than the same callback reference.
- Assuming all events bubble or cross shadow roots.
- Treating `isTrusted` as a permission check; script can dispatch some events, but trust is not user identity.
- Creating a synthetic `click` and assuming it grants transient user activation for fullscreen, clipboard, or popup APIs.
- Setting custom event flags by default without considering component encapsulation.
- Assuming `dispatchEvent()` is asynchronous or waits for handlers.

# Cross-item comparison

| Goal | API/flag | Effect |
| --- | --- | --- |
| Cancel browser default | `preventDefault()` | Only for cancelable, non-passive event |
| Stop later targets | `stopPropagation()` | Current target listeners may continue |
| Stop current and later listeners | `stopImmediatePropagation()` | Strong ordering intervention |
| Receive ancestors-to-target | `capture: true` | Capture-phase callback |
| Tie listener to component lifetime | `signal` | Abort removes it |
| Cross shadow boundary | `composed: true` | Allows path to cross; target may be retargeted |

# Knowledge checks with answers

1. **What does `dispatchEvent()` return?** False if a cancelable event was canceled; otherwise true. Dispatch is synchronous.
2. **Can a passive listener cancel a scroll default?** No.
3. **Does `stopPropagation()` stop other listeners on the same current target?** No; `stopImmediatePropagation()` does.
4. **What flags should a cross-component custom event consider?** Usually deliberate `bubbles: true` and `composed: true` if outside ancestors must receive it; the detail contract must also be explicit.
5. **How is a listener removed on component teardown without storing every callback?** Pass an AbortSignal in `{signal}` and abort the controller on teardown.

# Further reading

- [WHATWG DOM: Events](https://dom.spec.whatwg.org/#events)
- [MDN EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [MDN Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- [MDN CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
