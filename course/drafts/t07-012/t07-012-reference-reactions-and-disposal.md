<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: Reactive side-effect APIs

# Scope and version

This lesson covers MobX 7.1.7 reaction APIs and disposal. These APIs are powerful but should be used sparingly; React bindings already create reactions internally. MobX 7.0.4 added `[Symbol.dispose]` support to reaction disposers where Explicit Resource Management is available. See [Reactions](https://mobx.js.org/reactions.html), [MobX API reference](https://mobx.js.org/api.html), and [MobX releases](https://github.com/mobxjs/mobx/releases).

# How this group fits the mental model

A reaction observes selected observable reads and causes an effect. Use it to synchronize state with an external system, such as local storage, a logging service, or a subscription. Do not use reactions as an indirect way to calculate more observable state; computeds are for derived values. Every long-lived reaction needs an explicit owner and disposer.

# Supplied names explained

- `autorun(effect, options?)` — Runs the effect immediately and again whenever any observable/computed value read synchronously in the effect changes. Its dependency set is recalculated each run. It has no separate data and effect functions, so every tracked read in the effect controls reruns.
- `reaction(expression, effect, options?)` — Tracks only the expression/data function's synchronous reads and runs the effect when the produced value changes according to its equality option. It does not run the effect initially by default; `fireImmediately` changes that. Reads performed only inside the effect do not become tracked dependencies.
- `when(predicate, effect?, options?)` — Observes a predicate until it becomes true, then runs an optional effect once and disposes itself. If no effect is supplied it returns a promise that resolves when the condition becomes true; the promise can be cancelled, and timeout/abort behavior is configurable.
- `IReactionDisposer` — Function returned by `autorun`, `reaction`, and effect-form `when`; call it to stop tracking and prevent future side effects. Treat it as an owned resource and dispose on teardown.
- `IReactionDisposer[Symbol.dispose]()` — Explicit Resource Management hook on the disposer in supported MobX versions/runtimes. It lets a `DisposableStack` or `using` scope dispose a reaction, but ordinary function invocation remains the portable cleanup method.
- `Reaction AbortSignal option` — Pass an `AbortSignal` as the reaction option `signal` to dispose when the signal aborts. The promise-form `when` rejects with a MobX abort error when cancelled through its signal.
- `Reaction dependency tracking` — Dependencies are observable/computed values read synchronously during a tracked effect/expression. Reads after `await`, `setTimeout`, or another asynchronous boundary are not tracked by that initial run.
- `Reaction cleanup and disposal` — Call the returned disposer when the consumer is no longer needed. A reaction that reads an observable owned elsewhere can keep its closure and associated objects alive; failing to dispose may leak memory or continue external work.
- `Reaction equals option` — For `reaction`, a comparer can decide whether the expression's new value differs enough to run the effect. The default compares values according to MobX's default comparer; structural or custom comparisons have their own cost and semantics.
- `Reaction delay option` — `delay` in milliseconds throttles autorun/reaction effect execution. It does not mean “debounce latest value” in every sense; understand scheduling and coalescing behavior for the chosen API.
- `Reaction fireImmediately option` — For `reaction`, runs the effect after the initial expression evaluation as well as later changes. Default is false. It is distinct from autorun, whose effect runs initially.
- `Reaction scheduler option` — Custom scheduler controls when a rerun is invoked, for example by enqueueing it later. The scheduler must eventually call the supplied run function and should not create uncontrolled duplicate scheduling.
- `Reaction effects only for external synchronization` — Design guideline: reactions should cause side effects at the boundary of the observable model. If the result is another value derived from observable state, define a computed. If the cause is a specific user event, invoke the effect directly from that event.

# Cross-item comparison

`autorun` tracks all reads in one function and fires immediately. `reaction` separates the tracked expression from the effect, giving more control over when side effects run. `when` is a one-shot condition waiter. Use the narrowest semantics that match the requirement; broad autoruns can accidentally subscribe to extra state.

Disposal and cancellation are related but distinct. Calling a disposer stops future tracking and effects. An `AbortSignal` provides a standard lifecycle trigger for disposal. Neither mechanism reverses an external operation already completed by an effect.

# Examples

```ts
import { reaction } from 'mobx'

const dispose = reaction(
  () => store.preferences.theme,
  theme => localStorage.setItem('theme', theme),
  { fireImmediately: true, delay: 50 },
)

window.addEventListener('pagehide', dispose, { once: true })
```

This intentionally observes only the theme expression. The initial write happens because `fireImmediately` is enabled. A component-owned reaction should instead be disposed in its effect cleanup.

Wait for a condition once:

```ts
await when(() => store.connection.status === 'ready', { timeout: 5000 })
```

The promise rejects if the timeout expires. Provide an abort signal or call its cancellation method when the waiting task ends early.

# Common mistakes

- Using `autorun` when the dependency set should be narrow and explicit.
- Expecting reads after async boundaries to be tracked.
- Reading an observable only inside an action called from the effect; actions are untracked.
- Creating a reaction that updates another observable to derive a value, causing feedback loops.
- Forgetting disposal when a reaction outlives the state it observes.
- Assuming `reaction` runs initially without `fireImmediately`.
- Assuming a delay option cancels external work or guarantees a particular debounce policy.
- Assuming disposer cleanup rolls back side effects already performed.

# Knowledge checks with answers

1. Which API tracks all reads in its effect? **`autorun`.**
2. Which API separates a tracked expression from its effect? **`reaction`.**
3. What happens if you omit the effect from `when`? **It returns a promise that resolves when the predicate becomes true.**
4. What should happen to a component-owned reaction during unmount? **Call its disposer.**
5. Should a reaction calculate a derived observable total? **Usually no; use a computed.**

Sources: [Reactions](https://mobx.js.org/reactions.html), [MobX API reference](https://mobx.js.org/api.html), [MobX releases](https://github.com/mobxjs/mobx/releases).
