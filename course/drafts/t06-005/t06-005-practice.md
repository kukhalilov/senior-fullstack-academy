<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript promises, async functions, and event-loop scheduling — Exercises and worked solutions

# Goals

Predict synchronous versus deferred execution, select a Promise combinator based on its success/failure rule, reason about thenable/async adoption, and use timer/microtask scheduling without assuming exact clock timing.

# Worked example

Trace the order without running the snippet:

```js
const log = [];
async function step() {
  log.push("inside");
  await 0;
  log.push("resumed");
}

const done = step().then(() => log.push("then"));
log.push("after call");
```

`step()` begins synchronously and logs `inside`. The await suspends it; the caller then logs `after call`. At a later microtask checkpoint, the async function resumes and logs `resumed`, then fulfillment schedules the `.then()` reaction, which logs `then`. The order is `inside`, `after call`, `resumed`, `then`.

# Exercises

## 1. Combinator choice

For each requirement, select `Promise.all`, `Promise.allSettled`, `Promise.any`, or `Promise.race`: (a) fail if any required operation fails; (b) collect every outcome; (c) use the first successful mirror; (d) stop waiting for the first success or failure. State whether the chosen combinator cancels losing operations.

## 2. Chain recovery

Create a rejected promise, recover to the string `"fallback"` with `catch`, then transform it to `"fallback!"`. Explain why the final promise fulfills.

## 3. Promise.try timing

Log before and after a `Promise.try()` call whose callback logs and returns a value. Predict whether the callback's log is synchronous. Repeat with a callback that throws and handle the resulting rejection.

## 4. Thenable adoption

Create an object whose `then(resolve)` calls `resolve("first")` and then `resolve("second")`. Return it from an async function. Predict the awaited value and explain why the second call has no effect.

## 5. Microtask and task ordering

Schedule a Promise reaction, call `queueMicrotask`, schedule a zero-delay timer, and log synchronously. Predict the guaranteed order. Which part depends on host scheduling or rendering?

## 6. Resolver ownership

## 7. Timer cancellation boundary and nesting

An application schedules a timer with a 1 ms delay. A later callback calls `clearTimeout(id)`. Explain why clearing can prevent a handler only while its timer ID remains active, why it cannot retract a handler task already queued, and when HTML imposes a 4 ms minimum delay. Does that minimum apply to every timer?

Use `Promise.withResolvers()` to create a promise and settle it from a later timer callback. Explain why sharing `resolve`/`reject` widely can make state ownership unclear.

# Progressive hints

1. Match the named requirement to the result rule: every, all outcomes, first fulfillment, or first settlement.
2. `catch()` returns a new promise; returning a normal value fulfills that next promise.
3. `Promise.try()` invokes its callback before returning.
4. Promise resolution accepts the first effective resolve/reject call and adopts thenables.
5. Current synchronous code completes first; queued microtasks run at the checkpoint; timer work is a later task.
6. The resolver functions belong to one promise capability and are one-shot, but code can still call them from unexpected places.
7. Timer clearing removes the active ID; the timer algorithm queues a task after its timeout steps. The 4 ms clamp applies after timer nesting level exceeds five, for a requested delay below 4 ms.

# Complete solutions

## 1. Combinator choice

- (a) `Promise.all`: all must fulfill; any rejection rejects the aggregate.
- (b) `Promise.allSettled`: wait for every result and collect ordered status records.
- (c) `Promise.any`: first fulfillment wins; it rejects with an aggregate error only if all reject.
- (d) `Promise.race`: first settlement of either kind wins.

None automatically cancels the other operations. If cancellation is required, the operations need a separate cancellation design.

## 2. Chain recovery

```js
const result = Promise.reject("offline")
  .catch(() => "fallback")
  .then(value => `${value}!`);
```

The catch handler returns an ordinary string, so its derived promise fulfills with `"fallback"`. The next handler transforms that value, so `result` fulfills with `"fallback!"`.

## 3. Promise.try timing

```js
console.log("before");
const value = Promise.try(() => {
  console.log("callback");
  return 7;
});
console.log("after");
value.then(result => console.log(result));
```

The first three log entries are `before`, `callback`, `after`; the fulfillment reaction logs `7` later. If the callback throws, `Promise.try()` returns a rejected promise, and a rejection handler can recover or report it.

```js
Promise.try(() => { throw new Error("failed"); })
  .catch(error => console.log(error.message)); // later logs "failed"
```

## 4. Thenable adoption

```js
const thenable = {
  then(resolve) {
    resolve("first");
    resolve("second");
  },
};

async function result() { return thenable; }
result().then(console.log); // later logs "first"
```

The async function adopts the thenable. Its guarded resolving functions permit only the first effective settlement.

## 5. Microtask and task ordering

```js
const log = [];
Promise.resolve().then(() => log.push("promise"));
queueMicrotask(() => log.push("microtask"));
setTimeout(() => log.push("timer"), 0);
log.push("sync");
```

The guaranteed sequence in a browser is `sync`, `promise`, `microtask`, then `timer`, assuming this is the only work that appends to `log`. The Promise reaction and explicit microtask are ordered by when they were queued. The timer becomes a future task; host task selection controls its exact timing, and a rendering opportunity is separate.

## 6. Resolver ownership

```js
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve("finished"), 0);
promise.then(console.log); // later logs "finished"
```

`resolve` and `reject` settle the same promise once. If unrelated components can call them, it becomes harder to reason about who owns completion and which outcome wins.

## 7. Timer cancellation boundary and nesting

`clearTimeout(id)` removes the ID from the shared timer-ID map. If it is removed before the timeout algorithm finishes and queues its handler task, the timer steps can stop. If the handler task has already been queued, clearing the ID does not remove that queued task; and no clear method can interrupt a callback already executing. HTML sets a timer's effective timeout to at least 4 ms when its nesting level is greater than five and its requested timeout is below 4 ms. The nesting level applies across nested `setTimeout()` and `setInterval()` calls; it is not a minimum for every timer.

# Tests and edge cases

- Empty `Promise.all([])` and `Promise.allSettled([])` fulfill with `[]`.
- Empty `Promise.any([])` rejects with `AggregateError`; empty `Promise.race([])` remains pending.
- A thenable may call resolve/reject multiple times; only the first effective call matters.
- A thenable's `then` getter or invocation may throw; the adopting promise rejects unless already resolved.
- A thrown Promise handler rejects the promise returned by `then`; it does not change the promise that was already settled.
- A fulfilled `finally` callback preserves the prior value; a throwing/rejecting cleanup changes the result to rejection.
- Async code before the first `await` runs synchronously.
- Awaiting a non-promise still resumes asynchronously.
- A timer callback cannot run in the current stack and may run later than its requested delay.
- A recursively replenished microtask queue can prevent tasks/rendering from progressing.
- A host may report an unhandled rejection before a later handler is attached; do not depend on exact reporting timing.

# Reflection questions

1. Which Promise combinator matches the business rule, not just the number of inputs?
2. What code runs before a Promise returned from an async function can be awaited?
3. How can you distinguish an ECMAScript Promise job from an HTML task?
4. When does choosing a microtask harm responsiveness?
5. Which component owns the resolving functions in your design?

# Sources

- [ECMAScript 2026 Promise objects and jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [WHATWG HTML event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML timers and microtasks](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
