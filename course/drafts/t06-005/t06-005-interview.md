<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript promises, async functions, and event-loop scheduling — Interview questions and reasoning

# Core questions

1. What are a Promise's states, and how is “resolved” different from “fulfilled”?
2. When does a Promise constructor executor run?
3. How do Promise resolution and thenable assimilation work?
4. How does a handler's return/throw affect a `.then()` chain?
5. What does `.finally()` preserve, and when can it change the outcome?
6. How do `Promise.all`, `allSettled`, `any`, and `race` differ?
7. Does a Promise combinator cancel the operations it did not select?
8. What does `Promise.try()` do, and is its callback deferred?
9. What does `Promise.withResolvers()` return?
10. How do async functions and `await` interact with promises?
11. What is the difference between an ECMAScript Promise job and a browser task?
12. How do microtasks relate to tasks and rendering?
13. What is an unhandled rejection?

# Concise interview answers

1. States are pending, fulfilled, rejected. Resolved means fate-locked and may still be pending while following another promise/thenable.
2. Synchronously during construction.
3. Resolving to a thenable retrieves its `then`, schedules guarded assimilation, and adopts its eventual result; only one settlement wins.
4. A returned value fulfills the next promise, a thrown error rejects it, and a returned thenable is adopted.
5. A fulfilling cleanup preserves the original value/reason; a throwing or rejected cleanup makes the derived promise reject with the cleanup failure.
6. `all` requires all fulfill; `allSettled` collects all; `any` returns first fulfillment; `race` returns first settlement of either kind.
7. No. Cancellation must be designed at the operation level.
8. It calls the callback synchronously and wraps return/throw as a promise outcome.
9. An object containing a promise and its associated `resolve`/`reject` functions.
10. Async calls return a Promise; `await` suspends that function and resumes later with a value or thrown rejection reason.
11. A Promise job is an ECMAScript scheduling abstraction; a browser task is an HTML host event-loop unit.
12. Browser microtasks drain at checkpoints between tasks; rendering opportunities are separately scheduled.
13. A rejected promise without a handler at the host's reporting point; notification and late handling are host-defined.

# Deep follow-up answers

## Why does a resolved promise sometimes remain pending?

Resolve can lock a promise to another promise or thenable. The outer promise can no longer be independently rejected, but it remains pending until the adopted outcome settles. This distinction prevents treating “resolution happened” as “value is available.”

## Why do thenable jobs avoid direct trust in a thenable?

A thenable is user-controlled code. Its `then` may call callbacks more than once, throw, or settle in surprising order. The Promise resolution procedure uses guarded resolving functions and scheduled assimilation so the adopting promise settles at most once and follows the thenable's eventual outcome.

## Why does a thrown `.then()` handler not reject the original promise?

Promise chaining creates a new promise for the handler's result. The original promise has already settled. A throw rejects the derived promise, allowing each link in the chain to transform or recover from an outcome independently.

## Why is `Promise.all` not a cancellation primitive?

It determines when the aggregate promise fulfills or rejects. It does not own the underlying operations' cancellation mechanics. After one input rejects, other operations can continue and cause side effects. Design cancellation at the request/work layer when necessary.

## What is the precise `Promise.try()` timing distinction?

The callback runs during the call to `Promise.try()`. The returned Promise represents its value/thenable or captures a synchronous throw as rejection. `Promise.resolve().then(callback)` instead queues the callback as a Promise reaction job. Use the former for sync/async outcome unification and the latter when deferred execution is intended.

## What work runs before an async function returns its Promise?

The async function executes synchronously from entry until its first await or completion. At an await, it suspends and returns control; continuation resumes asynchronously after the awaited outcome. The Promise returned by the async call is distinct from a promise returned by its body, though it adopts that promise's outcome.

## Why are browser task and microtask queues separate?

HTML defines microtasks for work that must run at checkpoints before the event loop selects another normal task. Promise reaction jobs are mapped into that browser queue. Tasks represent host events such as timers. The checkpoint drains until empty, so excess microtasks can starve tasks and rendering. Task-source queue selection and rendering remain host-controlled.

# Scenario questions

1. **Three writes may all succeed independently, and every result must be displayed.** Use `Promise.allSettled`; it reports each status in input order.
2. **One of several mirrors should satisfy a request.** Use `Promise.any`, but decide separately how unnecessary operations should be stopped.
3. **A callback sometimes throws before returning a Promise.** `Promise.try(callback)` captures the synchronous throw and adopts a returned thenable.
4. **A UI update is scheduled in a long Promise chain.** Check whether microtasks starve the next rendering opportunity; yield through an appropriate task/rendering strategy if responsiveness is needed.
5. **A zero-delay timer runs “late.”** It only becomes eligible after its delay threshold; current code, microtasks, task selection, and host scheduling can postpone it.
6. **A Promise is rejected and logged despite a nearby catch.** Trace whether the catch is attached to the same chain and whether a derived Promise is left unobserved.
7. **A callback passed to `queueMicrotask()` throws.** The host reports an uncaught exception; unlike a `.then()` handler, there is no derived Promise to reject.

# Tradeoffs and alternatives

| Requirement | Mechanism | Tradeoff |
| --- | --- | --- |
| All dependencies required | `Promise.all` | Fast failure, but other work continues |
| Need all outcomes | `Promise.allSettled` | Waits for slowest input |
| First successful result | `Promise.any` | Rejections are retained if every attempt fails |
| First result of any state | `Promise.race` | Early rejection can win; losers continue |
| Wrap sync/async callback result | `Promise.try` | Callback remains synchronous at entry |
| Run callback in a microtask | Promise reaction or `queueMicrotask` | Runs before next task; long chains can starve host work |
| Yield to later host work | Timer task | Delay is not precise and callback may be throttled/delayed |

# Common weak answers

- “Resolved means fulfilled.” It can be locked to a pending thenable.
- “Promise callbacks run immediately when the state changes.” Reactions run later as jobs.
- “`Promise.all` cancels the others.” It does not.
- “`race` returns the first success.” It returns the first settlement; `any` returns first success.
- “`finally` always returns its callback's value.” It preserves the prior outcome unless cleanup fails.
- “`Promise.try` is just a shorter `.then()`.” Its callback runs immediately; a `.then()` callback is scheduled.
- “`await` blocks JavaScript.” It suspends one async function.
- “Every async function begins later.” Its synchronous prefix runs immediately.
- “Browsers have one FIFO queue for all callbacks.” HTML separates task queues and a microtask queue.
- “A zero timer always runs before paint.” Timer eligibility and rendering are host-scheduled.
- “Unhandled rejection is a Promise method.” Reporting belongs to the host.

# Self-check rubric

Award one point for each skill you can demonstrate without notes:

- Distinguish pending, settled, resolved, fulfilled, and rejected.
- Explain executor timing and one-shot settlement.
- Explain thenable assimilation and callback guards.
- Trace return/throw/finally through a chain.
- Choose among all four combinators and explain empty input.
- Explain `Promise.try` versus a queued reaction.
- Explain `withResolvers` ownership.
- Trace an async function before and after `await`.
- Distinguish jobs, browser microtasks, tasks, and timer sources.
- Explain microtask checkpoint and rendering limits.
- Describe host unhandled-rejection reporting without assuming a universal policy.

Nine to eleven points indicates readiness; revisit the weak area before using these rules to debug production scheduling.

# Sources

- [ECMAScript 2026 Promise objects and jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript 2026 async functions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [WHATWG HTML event loop](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML timers and microtasks](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
