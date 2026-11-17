<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: Advanced core APIs, diagnostics, and observable interoperation

# Scope and version

This reference covers public MobX 7.1.7 core APIs that are low-level, diagnostic, or interoperation-oriented. The official API marks many as advanced and says most application code should not need them. Their presence here is for recognition and deliberate use, not a recommendation to build ordinary state management around internals. See [API reference](https://mobx.js.org/api.html), [Collection utilities](https://mobx.js.org/collection-utilities.html), [Intercept & Observe](https://mobx.js.org/intercept-and-observe.html), [Custom observables](https://mobx.js.org/custom-observables.html), and [Understanding reactivity](https://mobx.js.org/understanding-reactivity.html).

# How this group fits the mental model

The core model remains observable reads feeding computeds and reactions. These APIs inspect that graph, adapt nonstandard data sources, observe low-level changes, or manipulate collections through a generic interface. The lower-level an API is, the more responsibility it gives application code for lifecycle, transaction semantics, correctness, and version compatibility.

# Supplied names explained

- `onReactionError(handler)` — Registers a global listener for errors thrown by reactions. Use for diagnostics or monitoring; reaction-local `onError` is more appropriate when handling one specific effect.
- `intercept(target, listener)` — The official API intercepts changes before they are applied and returns a disposer. It is an advanced hook; exact change records and cancellation behavior are target/change-type specific, so consult the focused API reference before implementing an interceptor.
- `observe(target, listener)` — Low-level observer invoked after mutations on a single observable target/property; not deep. It returns a disposer, may optionally invoke immediately for supported observable kinds, and fires per mutation even inside `transaction`. MobX recommends `reaction` instead in ordinary application code.
- `onBecomeObserved(observable, property?, listener)` — Runs when an observable or property transitions from unobserved to observed. It can lazily start a resource such as a timer or subscription; pair it with the unobserved callback and guard repeated observation cycles.
- `onBecomeUnobserved(observable, property?, listener)` — Runs when no derivation observes the target. It can release work started on observation. Do not assume it means the containing object was garbage-collected.
- `MobX collection utilities values(collection)` — Returns an array of values for observable arrays, objects, Sets, or Maps. The generic collection utilities support observable arrays, objects, and Maps reactively without depending on the concrete collection type; Set values have their own tracking caveat in MobX docs.
- `MobX collection utilities keys(collection)` — Returns an array of keys for observable arrays, objects, or Maps; generic utility reads participate in MobX tracking.
- `MobX collection utilities entries(collection)` — Returns an array of `[key, value]` pairs for observable arrays, objects, or Maps; generic utility reads participate in MobX tracking.
- `MobX collection utilities set(collection, key, value)` — Generic reactive update for an observable array, object, or Map; an object of key/value pairs can also be supplied for multiple updates. Prefer the collection's native or MobX-specific method when it communicates intent more clearly.
- `MobX collection utilities remove(collection, key)` — Generic deletion/removal helper for an observable array, object, or Map. Array removal uses splicing semantics.
- `MobX collection utilities has(collection, key)` — Checks for an observable property or collection entry while tracking membership where supported.
- `MobX collection utilities get(collection, key)` — Reads a value by key using the generic collection API; for observable objects, it can track a key before it is added, as shown in the official example.
- `isObservable(value)` — Broad runtime predicate for MobX observable values. It is intended for diagnostics/interoperation, not as a routine branch in domain logic.
- `isObservableProp(object, propertyName)` — Checks whether a particular property is observable.
- `isObservableArray(array)` — Identifies MobX observable arrays.
- `isObservableObject(object)` — Identifies MobX observable objects.
- `isObservableSet(set)` — Identifies MobX observable Sets.
- `isObservableMap(map)` — Identifies MobX observable Maps.
- `isBoxedObservable(value)` — Identifies values created by `observable.box`.
- `isAction(function)` — Checks whether a function has been marked as a MobX action.
- `isComputed(boxedComputed)` — Checks whether a standalone boxed computed value was created by `computed(fn)`.
- `isComputedProp(object, propertyName)` — Checks whether a property is annotated as computed.
- `spy(eventListener)` — Attaches a global listener to MobX internal events for debugging and tooling; it can expose application activity, so do not leave broad logging enabled without a reason. It returns a disposer.
- `getDebugName(value, property?)` — Returns MobX's generated or assigned debug name for an observable, reaction, or property.
- `getDependencyTree(value, property?)` — Inspects which observables a reaction/computed currently depends on. Treat the returned tree as diagnostic data, not a stable application contract.
- `getObserverTree(value, property?)` — Inspects which reactions/computeds currently observe an observable. Like dependency trees, it is intended for debugging tools.
- `createAtom(name, onBecomeObserved?, onBecomeUnobserved?)` — Creates the primitive MobX tracking node used to bridge a custom data source into the reactive graph. The optional callbacks mark first observation and loss of all observers; this low-level extension point is for library authors.
- `Atom.reportObserved()` — Called when a custom atom-backed value is read during a tracked derivation. It registers the current derivation as a dependent and reports whether the atom is observed.
- `Atom.reportChanged()` — Called after the custom source changes to invalidate dependent derivations. Omitting it leaves observers stale; calling it for unchanged values causes unnecessary work.
- `getAtom(value, property?)` — Returns the internal atom associated with a MobX observable or property. Useful for diagnostics and advanced extensions, not for business logic.
- `untracked(worker)` — Executes a callback without adding its observable reads to the surrounding derivation. Actions already run untracked; prefer the higher-level API that expresses the actual state/effect boundary.
- `transaction(worker)` — Synchronously batches observable writes so reactions wait for the outermost transaction to finish. It nests, returns the callback's result, and does not roll back on exceptions. Prefer `action` or `runInAction` because they also express a state-changing boundary.
- `MobX advanced APIs are low-level and rarely needed` — The official documentation labels these APIs advanced. Reach for computed/reaction/action APIs first, and use low-level hooks only when an integration or diagnostic need cannot be expressed clearly at that level.

# Cross-item comparison

Use `reaction` to synchronize an external system with selected observable values; use `observe` only when exact low-level mutation events are required and per-mutation behavior is intended. Use `intercept` only when a library-level mutation guard/normalizer is unavoidable; validating before mutation is easier to reason about. Use `onBecomeObserved`/`onBecomeUnobserved` for demand-driven resource lifetimes. Use `createAtom` only to adapt a custom source to MobX tracking. Generic collection helpers and introspection predicates are useful at library/debug boundaries; ordinary domain code should use direct collection APIs and known model types.

Transactions delay reactions but do not make a sequence atomic with rollback. Low-level observers can see each mutation during a transaction, so replacing `reaction` with `observe` changes semantics materially. Debug trees and spy events expose implementation details that can vary across MobX versions; do not persist or parse them as a stable public data format.

# Examples

Track a changing external source only while it is observed:

```ts
import { createAtom, autorun } from 'mobx'

class Clock {
  private value = new Date()
  private timer: ReturnType<typeof setInterval> | undefined
  private atom = createAtom(
    'Clock',
    () => { this.timer = setInterval(() => this.tick(), 1000) },
    () => { clearInterval(this.timer); this.timer = undefined },
  )

  get currentTime() {
    this.atom.reportObserved()
    return this.value
  }

  private tick() {
    this.value = new Date()
    this.atom.reportChanged()
  }
}

const clock = new Clock()
const dispose = autorun(() => console.log(clock.currentTime))
// Later, dispose() stops tracking; the atom's unobserved callback clears its timer.
```

For ordinary user input, validate before writing to the store rather than attaching `intercept` to every mutation path. If a low-level observer is genuinely required, always keep and invoke the returned disposer.

# Common mistakes

- Using `observe` as a drop-in replacement for `reaction`; it sees individual low-level mutations, does not deep-track, and does not respect transactions.
- Using `intercept` for ordinary validation instead of validating at the command/input boundary.
- Forgetting to dispose a spy, observer, interceptor, atom-backed resource, or reaction.
- Building application behavior around internal debug-tree/spy event shapes.
- Assuming `transaction` provides rollback, isolation from all observers, or an asynchronous transaction spanning `await`.
- Calling `reportChanged()` before updating a custom value, or forgetting it after a real change.
- Using collection helpers when direct `Map`/array/object methods would be clearer.

# Knowledge checks with answers

1. Why is `reaction` usually preferred over `observe`? **It tracks selected derived values, respects transaction semantics, and reacts to values rather than every low-level mutation.**
2. How does a custom atom notify MobX of a read and a write? **Call `reportObserved()` during tracked reads and `reportChanged()` after the underlying value changes.**
3. Does `transaction()` undo writes if the callback throws? **No; it only batches reactions until synchronous completion.**
4. What should happen to an `intercept` or `spy` registration when its owner is done? **Call its returned disposer.**
5. Are debug-tree objects a stable serialization format? **No; they are diagnostic views of the current reactive graph.**

Sources: [MobX API reference](https://mobx.js.org/api.html), [Collection utilities](https://mobx.js.org/collection-utilities.html), [Intercept & Observe](https://mobx.js.org/intercept-and-observe.html), [Custom observables](https://mobx.js.org/custom-observables.html), [Understanding reactivity](https://mobx.js.org/understanding-reactivity.html), [Reactions](https://mobx.js.org/reactions.html).
