
# JavaScript promises, async functions, and event-loop scheduling — Reference: Jobs, microtasks, and host event-loop queues

# Scope and version

This reference separates ECMAScript Promise jobs from the browser event-loop model defined by HTML. HTML maps Promise jobs and `queueMicrotask()` callbacks to the microtask queue. It covers timer scheduling and rendering opportunities, not Node.js event-loop phases. See [ECMAScript jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html), [HTML event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops), and [HTML timers/microtasks](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html).

# How this group fits the mental model

The JavaScript call stack runs synchronously to completion. ECMAScript specifies Promise jobs and delegates their scheduling to the host. In an HTML browser, Promise reaction jobs and explicit microtasks are processed at a microtask checkpoint. Later tasks come from host task sources such as timers. Rendering happens at browser-controlled opportunities, not at a fixed point after each callback.

# Supplied names explained

## ECMAScript and HTML scheduling terms

- `Promise reaction job` — ECMAScript job that runs a `then`, `catch`, or `finally` reaction after the relevant promise settles. It does not interrupt the current synchronous stack.
- `HostEnqueuePromiseJob` — ECMAScript host hook used to schedule Promise jobs. ECMAScript defines the job but delegates when/how it runs; HTML hosts enqueue it as a microtask.
- `HTML event loop` — Browser/HTML model coordinating tasks, microtasks, script execution, and rendering for an agent. An event loop need not correspond one-to-one with an operating-system thread.
- `Task` — HTML unit of host work with steps and a task source. Event handlers, timers, and other host callbacks often run as tasks.
- `Microtask` — HTML term for callback work queued through the microtask algorithm. It is processed during a checkpoint, separately from normal task selection.
- `Microtask queue` — Per-event-loop queue drained by the checkpoint. It is not itself a task queue; callbacks added while draining are also processed before the checkpoint ends.
- `Microtask checkpoint` — Algorithm that repeatedly runs queued microtasks until none remain, then performs required cleanup/reporting steps. An endless stream of microtasks can starve tasks and browser rendering.
- `Task queue` — HTML concept: a set of tasks associated with task sources, not one universal FIFO queue. The event loop selects a runnable task queue; tasks from a given source preserve required ordering.
- `Timer task source` — HTML task source used for `setTimeout()` and `setInterval()` callbacks after their timeout conditions are met.
- `Queue a microtask` — HTML algorithm that enqueues one microtask on the surrounding agent's microtask queue.
- `Rendering opportunity` — A point when a browser may update a window's rendering. It is driven by user-agent scheduling and display conditions; it is not guaranteed after every task or at an exact interval.

## Timer and microtask APIs

- `queueMicrotask()` — Browser global method that queues a callback in the microtask queue. It returns no promise; callback exceptions are reported as uncaught exceptions.
- `setTimeout()` — Schedules one callback as a timer task after at least the requested delay; the callback can run later due to synchronous work, other queues, throttling, or rendering work. A zero delay still means a future task.
- `clearTimeout()` — Removes the ID from the shared timeout/interval ID map. Clear it before its timer initialization completes if you need to prevent its handler from being queued; once the timer task has been queued, removing the ID does not retract that task. It cannot interrupt a callback already running. Either clear method can clear either timer kind.
- `setInterval()` — Schedules a callback repeatedly through timer tasks. Actual callback spacing can exceed the requested interval; avoid assuming precise cadence or that callbacks run concurrently.
- `clearInterval()` — Removes an active interval ID and prevents further scheduled runs; it cannot stop a callback already executing. It can also clear a timeout ID under the shared HTML timer-ID map.

HTML clamps a timer delay below 4 ms to 4 ms when the timer nesting level is greater than five. Nesting level applies to nested calls to either timer method and to repeating intervals; it is not a universal minimum delay for every timer.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| ECMAScript job vs HTML task | Language-level scheduled computation versus host event-loop unit |
| Promise job vs HTML microtask | ECMAScript job concept versus HTML queue entry used by browser hosts |
| Microtask queue vs task queues | Drained at checkpoints versus selected for normal event-loop tasks |
| `queueMicrotask()` vs `Promise.resolve().then()` | Direct microtask callback with uncaught exception reporting versus Promise reaction whose throw rejects a derived Promise |
| `setTimeout()` vs `queueMicrotask()` | Later timer task versus next microtask checkpoint |
| Timer threshold vs rendering time | A timer can become eligible after its delay; rendering remains a separate browser opportunity |

# Examples

```js
const order = [];
Promise.resolve().then(() => {
  order.push("promise job");
  queueMicrotask(() => order.push("nested microtask"));
});
queueMicrotask(() => order.push("direct microtask"));
setTimeout(() => order.push("timer task"), 0);
order.push("synchronous");
```

The synchronous entry is first. At the browser checkpoint, the Promise reaction runs, followed by the direct microtask; the nested microtask is appended and runs before the checkpoint ends. The timer callback runs in a later task turn.

```js
const timerId = setTimeout(() => console.log("not started if cleared in time"), 0);
clearTimeout(timerId);
```

Clearing an active timer before its timer steps queue the handler task prevents the handler from being queued. Clearing after the task is queued does not retract that task; clearing also cannot stop code after that callback has already begun.

# Common mistakes

- Saying ECMAScript specifies a browser-style microtask queue; ECMAScript specifies jobs and calls a host hook.
- Saying microtasks are a special class of normal HTML task queue; HTML keeps the microtask queue separate.
- Assuming all timer/event tasks share one strict FIFO queue; task queues are selected by the event loop, while each source has its own ordering constraints.
- Assuming a `setTimeout(fn, 0)` callback interrupts current code or runs before microtasks.
- Treating a timer's requested delay as an exact execution time.
- Assuming clearing a timer can interrupt a callback already executing.
- Assuming one rendering update follows each microtask checkpoint; rendering opportunity is independently scheduled.
- Scheduling recursive microtasks indefinitely and expecting tasks or rendering to proceed.
- Assuming `queueMicrotask()` returns a promise or turns a thrown exception into rejection.
- Treating `setInterval` as precise or as concurrent callback execution.

# Knowledge checks with answers

1. **Does the browser run a Promise reaction in the current synchronous stack?** No; it runs during a later microtask checkpoint.
2. **Is the microtask queue one of HTML's task queues?** No, it is separate.
3. **Are task queues globally FIFO across all task sources?** No; the event loop selects among runnable queues while preserving source-specific ordering.
4. **Does `setTimeout(fn, 0)` mean immediate execution?** No; it schedules a future timer task after the effective threshold and host scheduling. Deeply nested timers with a delay below 4 ms are clamped to 4 ms.
5. **Can microtasks queued by another microtask run in the same checkpoint?** Yes, the checkpoint drains until empty.
6. **Does every checkpoint cause a render?** No; rendering opportunities are browser-controlled.
7. **When does `clearTimeout` prevent a handler from running?** It removes the active timer ID; call it before the timer algorithm queues the handler task. It cannot retract a task already queued or interrupt a running callback.

# Further reading

- [ECMAScript Promise jobs and host hook](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [WHATWG HTML event-loop model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML timers and `queueMicrotask`](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
