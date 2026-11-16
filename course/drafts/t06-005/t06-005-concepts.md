<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript promises, async functions, and event-loop scheduling — Core concepts and how they fit together

# Learning objectives

Explain pending/fulfilled/rejected and resolved/settled; trace thenable assimilation and promise chaining; choose a combinator based on its settlement rule; predict async/await behavior; and distinguish ECMAScript Promise jobs from browser tasks, microtasks, and rendering.

# Prerequisites

You should know functions, exceptions, callbacks, objects, and iterable values. A thenable is any object with a callable `then` property; it need not be a native Promise. A browser event loop coordinates script execution with events, timers, and rendering.

# Core concepts

## Promise state and resolution are related but different

A Promise has one of three states: pending, fulfilled with a value, or rejected with a reason. **Settled** means fulfilled or rejected. **Resolved** means its fate is locked: it may be fulfilled/rejected already, or it may be following another promise/thenable and still be pending. Calling resolve once with a thenable can therefore lock the promise while it remains pending. Subsequent attempts to settle the same promise have no effect.

The Promise constructor calls its executor synchronously and supplies resolve/reject functions. A thrown executor error rejects the promise. The first effective resolution wins; resolving to the promise itself rejects with a TypeError. A non-thenable value fulfills immediately at the state level, while reactions still run asynchronously.

## Thenable assimilation and chaining

Resolving with an object retrieves its `then` property. If callable, the Promise Resolution Procedure schedules a thenable job to invoke it with guarded resolving functions. This avoids trusting arbitrary thenables to settle more than once. A throwing `then` getter rejects during resolution; a throwing call to the thenable's `then` rejects unless already settled. Native promises are adopted, so the promise being resolved follows their eventual outcome.

`then(onFulfilled, onRejected)` creates a new promise. On fulfillment, the handler's return value resolves the new promise; a thrown error rejects it. A returned promise or thenable is assimilated. Missing handlers pass the prior value/reason through. `catch(handler)` is `then(undefined, handler)` in effect. `finally(cleanup)` waits for a returned thenable; if cleanup fulfills, the original value/reason continues, but if cleanup throws or rejects, the new promise rejects with that cleanup failure.

## Combinators differ in what wins

| Combinator | Fulfills when | Rejects when | Result |
| --- | --- | --- | --- |
| `Promise.all` | Every input fulfills | First input rejects | Values in input order |
| `Promise.allSettled` | Every input settles | Normally never for input outcomes | Status/value or status/reason records in input order |
| `Promise.any` | First input fulfills | All inputs reject | First fulfillment; otherwise `AggregateError` |
| `Promise.race` | First input settles fulfilled | First input settles rejected | Winning input's outcome |

All four accept iterables, normalize their elements through the Promise constructor's resolution, and return immediately with a promise. They do **not** cancel losing operations. Empty input has distinct behavior: `all`/`allSettled` fulfill with an empty array, `any` rejects with an empty `AggregateError`, and `race` remains pending.

`Promise.resolve()` adopts thenables and can return its input unchanged when it is already a Promise of the same constructor. `Promise.reject()` creates a rejected promise. `Promise.withResolvers()` returns `{ promise, resolve, reject }` for a capability whose settlement functions remain one-shot. `Promise.try(callback, ...args)` invokes the callback immediately, converting a synchronous throw to rejection and a returned value/thenable to a promise result; it is not a deferred callback scheduler.

## Async functions and await

Calling an async function always returns a Promise. A normal return value fulfills it; a thrown error rejects it. Even when the body returns an existing promise, the async function's returned promise is a distinct promise that follows that result.

`await value` applies Promise resolution to assimilate the value/thenable, suspends the current async function, and resumes it through a later continuation after the awaited promise settles. It does not block the JavaScript thread. A non-promise value is still awaited through a promise continuation, so code after `await` does not run synchronously in the same stack.

## ECMAScript jobs and browser event-loop queues

ECMAScript specifies Promise reaction jobs and calls the host hook `HostEnqueuePromiseJob`. ECMAScript does not define one universal browser/Node event loop. HTML defines how browser hosts enqueue Promise jobs as microtasks. `queueMicrotask()` also queues a browser microtask directly.

An HTML event loop has task queues associated with task sources and a separate microtask queue. The microtask queue is not itself a task queue. After a task finishes, the browser performs a microtask checkpoint, processing microtasks until the queue is empty, including microtasks queued by earlier microtasks. Thus an unbounded microtask chain can delay other tasks and a rendering opportunity.

A timer callback is a task from a timer task source. A timeout delay is not a promise that execution occurs at that exact instant; a callback runs only after its threshold and when the host selects its task. `setInterval()` can schedule repeated timer tasks; clear methods cancel active timers but cannot undo an already-running callback. The browser may update rendering at a suitable opportunity; there is no guarantee that each task is followed by a visible frame.

`queueMicrotask(callback)` and `Promise.resolve().then(callback)` both defer a callback to a microtask checkpoint in browsers, but callback exceptions differ: a thrown error from a promise reaction rejects the promise returned by `then`; an exception from `queueMicrotask` is reported as an uncaught exception. Choose by whether a promise chain/result is useful.

## Unhandled rejection reporting

If a rejection has no handler when the host checks for unhandled rejections, the host may report it. A handler attached later may cause a separate handled-later notification. These notifications are host policy and observability, not extra Promise states. Attach rejection handling at an intentional boundary rather than relying on a particular console message or process policy.

# Mechanisms and relationships

```text
current synchronous stack
  └─ resolve/reject changes promise state or queues assimilation work
       └─ Promise reaction jobs (HTML maps these to microtasks)
            └─ microtask checkpoint drains until empty
                 └─ a later task is selected from a host task queue
                      └─ browser may reach a rendering opportunity
```

The ordering is constrained at boundaries: current synchronous JavaScript runs to completion; Promise reactions do not interrupt it; a browser checkpoint drains queued microtasks before the next normal task. Relative selection among different task queues and the timing of rendering are host-controlled.

# Worked examples

## Chaining recovers and continues

```js
const result = Promise.reject(new Error("offline"))
  .catch(error => `handled: ${error.message}`)
  .then(message => `${message}!`);

result.then(console.log); // later logs "handled: offline!"
```

The catch handler returns a value, so the next promise fulfills and the chain continues.

## Browser ordering

```js
const order = [];
Promise.resolve().then(() => order.push("promise"));
queueMicrotask(() => order.push("microtask"));
setTimeout(() => order.push("timer"), 0);
order.push("sync");
```

After the current stack, the browser reaches a checkpoint: `"promise"` then `"microtask"` are appended in queue order. The timer task appends `"timer"` in a later turn. The immediate synchronous append happens first.

# Misconceptions and edge cases

- **Resolved means fulfilled.** A promise can be resolved to a still-pending thenable.
- **The Promise executor is asynchronous.** It runs synchronously during construction.
- **A `.then()` handler runs immediately when the promise is fulfilled.** It is scheduled as a later job/microtask.
- **Returning a promise from `.then()` nests it.** The next promise adopts/assimilates its outcome.
- **`finally()` replaces the prior result with its callback's value.** A fulfilling cleanup preserves the original value/reason; a failing cleanup replaces it with rejection.
- **`Promise.race()` cancels losers.** It only determines the returned promise's first settlement.
- **`Promise.any()` rejects on the first rejection.** It waits for a fulfillment or for all inputs to reject.
- **`Promise.try()` defers the callback.** It calls the callback synchronously and converts its result/throw into a promise outcome.
- **`await` blocks the event loop.** It suspends one async function while other work can proceed.
- **Microtasks and tasks are synonyms.** HTML treats the microtask queue separately from task queues.
- **`setTimeout(fn, 0)` runs immediately after the current line.** It queues future task work after a delay threshold and host scheduling.
- **The browser renders after every microtask/task.** Rendering opportunities are host-controlled; long microtask chains may delay them.
- **Node and browser use the exact same event-loop phases.** Node phases are outside this browser scheduling lesson.

# Knowledge checks with answers

1. **Can a resolved promise still be pending?** Yes, if it has locked onto a pending promise/thenable.
2. **When does a Promise constructor executor run?** Synchronously during construction.
3. **Which combinator gives the first successful result?** `Promise.any`; it rejects only if all inputs reject.
4. **Does `Promise.race` stop other operations?** No; cancellation must be handled separately.
5. **What happens after a browser task finishes?** A microtask checkpoint drains the microtask queue before another normal task is processed.
6. **Does `await 1` continue synchronously?** No; it suspends and resumes asynchronously after promise resolution.
7. **How does a thrown `queueMicrotask` callback differ from a thrown promise handler?** It is reported as an uncaught exception; the promise handler's throw rejects its returned promise.

# Sources

- [ECMAScript 2026 Promise objects and jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript 2026 async functions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [WHATWG HTML event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML timers and microtasks](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
