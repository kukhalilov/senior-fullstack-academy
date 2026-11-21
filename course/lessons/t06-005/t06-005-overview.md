
# JavaScript promises, async functions, and event-loop scheduling — Big-picture orientation and mental model

# Problem and purpose

JavaScript often needs to wait for work such as a response, timer, or file operation without blocking the current call stack. Promises represent an outcome that may arrive later. Async functions let code express waits in a readable sequence. The event loop coordinates JavaScript jobs, browser tasks, microtasks, and rendering opportunities so asynchronous work can resume.

# Plain-language mental model

A Promise is a one-time delivery ticket. It starts pending and settles as fulfilled with a value or rejected with a reason. A `.then()` handler does not run inside the current call stack; it is scheduled for later. An async function pauses at `await` and resumes asynchronously when the awaited value settles. In browsers, promise reactions run as microtasks, which are drained at checkpoints between tasks. A task such as a timer callback runs in a later event-loop turn, and the browser may render at a suitable opportunity.

# How the parts fit together

1. **Create an outcome.** A Promise constructor runs its executor immediately; resolve/reject functions later settle it once.
2. **Transform outcomes.** `.then()` creates a new promise. A returned value fulfills that next promise; a thrown error rejects it; a returned promise/thenable is assimilated.
3. **Compose work.** Combinators coordinate many promises but do not cancel the underlying operations.
4. **Write sequential-looking async code.** An async function returns a promise. `await` suspends that function and resumes it through scheduled work.
5. **Understand scheduling.** Synchronous statements finish first. Promise reactions and `queueMicrotask()` callbacks are microtasks. Browser timers queue tasks; after a task, a microtask checkpoint runs before later tasks. HTML clamps delays below 4 ms when timer nesting exceeds five; timers are still subject to host scheduling.
6. **Keep browser policy separate.** Task sources, timers, and rendering are host/browser concepts. Node.js has a distinct event-loop model, outside this lesson.

# Concept map

| Need | Promise/scheduling tool | Main idea |
| --- | --- | --- |
| Represent success/failure later | Promise | One settlement with value or reason |
| Transform outcomes | `then`, `catch`, `finally` | Return/throw determines next promise |
| Coordinate several outcomes | `all`, `allSettled`, `any`, `race` | Different settlement rules; no automatic cancellation |
| Adapt sync functions | `Promise.try`, `withResolvers` | Consistent rejection capture or external settlement functions |
| Wait in async code | `async`/`await` | Suspend the async function, not the JavaScript thread |
| Place immediate deferred callback | Microtask | Runs at a microtask checkpoint before another task |
| Defer to another event-loop turn | Task, such as timer task | Lets other host work and possibly rendering proceed |

# End-to-end walkthrough

```js
console.log("start");

Promise.resolve().then(() => console.log("promise reaction"));
queueMicrotask(() => console.log("queued microtask"));
setTimeout(() => console.log("timer task"), 0);

console.log("end");
```

The synchronous lines print `start` then `end`. The already-fulfilled promise queues a reaction; `queueMicrotask()` queues another microtask after it, so the browser runs those in enqueue order at the checkpoint. The timer callback is a later task; zero delay does not mean immediate execution, and host task selection/rendering timing is not an exact stopwatch.

# When to use it and tradeoffs

Use promises to represent one eventual result and async functions to express dependent asynchronous steps. Use `Promise.all` only when all operations can proceed independently and failing as a group is acceptable; it does not stop siblings. Use `allSettled` when every outcome matters, `any` for first success, and `race` for first settlement. A long microtask chain can delay tasks and rendering; use task scheduling when yielding to browser work is part of the design.

# Recent version changes

ECMAScript 2024 added `Promise.withResolvers()`, which returns a promise with its associated resolve/reject functions. ECMAScript 2025 added `Promise.try()`, which invokes a callback immediately while converting a synchronous throw into rejection. Neither changes the browser event-loop model. See [ECMAScript Promise objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html).

# What later lessons cover

The concepts lesson develops settlement, thenable assimilation, chaining, async/await, and the jobs-versus-host-queues boundary. Reference lessons explain every supplied Promise, async syntax, and HTML scheduling name. Practice predicts order and handles failures; interview questions focus on composition, timing, and cancellation limits.

# Sources

- [ECMAScript 2026 Promise objects and jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [WHATWG HTML event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML timers and `queueMicrotask`](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
