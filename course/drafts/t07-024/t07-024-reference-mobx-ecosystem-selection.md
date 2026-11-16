# Frontend state management Redux Toolkit and MobX comparisons — Reference: MobX model and React integration role

## Scope and version

This lesson explains the supplied MobX 6 concepts as a selection reference. Detailed annotations/signatures belong in t07-012 and the official MobX reference. [Observable state](https://mobx.js.org/observable-state.html) [Computeds](https://mobx.js.org/computeds.html) [React integration](https://mobx.js.org/react-integration.html)

## How this group fits the mental model

MobX uses observable reads to build a dependency graph. Mutations to observable state notify computed values and observers that depended on the changed values. The graph is dynamic: the reads in the latest tracked execution determine dependencies.

## Supplied names explained

- `MobX observable model` is a JavaScript object/class whose selected fields are observable. It can be a domain-oriented mutable model shared by components.
- `makeObservable` explicitly annotates members of an existing object/class as observable, computed, action, and related roles. It provides control over which members participate.
- `makeAutoObservable` infers common annotations for a class/object, reducing boilerplate. It is convenient for many store models but has inheritance/override and private-field limitations; use explicit annotation when needed.
- `observable` marks state fields/objects so MobX can track reads/writes. Observable collections and object properties can be tracked as well; identity and conversion behavior depend on configuration and data structure.
- `computed` marks a derived getter/value based on observables. It evaluates lazily, caches while observed, and recomputes when underlying observed values change. Prefer it over storing redundant derived state.
- `action` marks a state-changing function. MobX actions run as transactions so reactions do not observe intermediate partial updates; they define intentional mutation boundaries.
- `autorun` tracks observables read while its function executes and reruns the side-effect function when those dependencies change. It runs immediately and returns a disposer. Use sparingly and dispose it when the owner ends.
- `reaction` separates a tracked data expression from an effect that runs when that expression's result changes. It returns a disposer; use it for carefully scoped side effects, not ordinary React rendering.
- `observer` wraps a React component so observable properties read during rendering are tracked and the component rerenders when those dependencies change. Import from `mobx-react-lite` for function components in typical modern React usage.
- `MobX dynamic dependency graph` is the set of observable-to-computed/reaction/observer relationships discovered from reads during tracked executions. Conditional branches can change the graph on subsequent runs.
- `Computed value cache` is cached derived output while observed. When nobody observes a computed, it can suspend and later recompute; it is not necessarily a permanent memoized value.

## Cross-item comparison

`observable` stores mutable source state; `computed` derives; `action` changes state in a transaction; `autorun`/`reaction` trigger external side effects; `observer` connects observable reads to React rendering. Keep side-effect reactions distinct from component rendering subscriptions.

## Examples

```js
class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get doubled() {
    return this.count * 2;
  }

  increment() {
    this.count += 1;
  }
}
```

An `observer` component reading `store.doubled` reacts to `count` changes. Use `autorun` only when an external side effect must follow observable state, and dispose it.

## Common mistakes

- Reading observables outside a tracked observer/reaction and expecting automatic subscriptions.
- Using `autorun` where a computed value or direct React event handler is clearer.
- Forgetting to dispose reactions with a shorter lifetime than the application.
- Storing computed output separately and synchronizing it manually.
- Assuming a computed cache stays alive when unobserved.
- Mutating state outside intended actions when strict action enforcement is enabled.
- Wrapping a component in `observer` but never reading any observable during render.

## Knowledge checks with answers

1. What establishes MobX dependencies? Observable reads during a tracked execution.
2. What is the purpose of `computed`? Lazily derive/cache values from observables.
3. Which API marks a mutation boundary? `action`.
4. Which integration makes React rendering observe reads? `observer`.
5. What should happen to an `autorun` when its owner is destroyed? Dispose it.

## Sources

- [MobX observable state](https://mobx.js.org/observable-state.html)
- [MobX computeds](https://mobx.js.org/computeds.html)
- [MobX actions](https://mobx.js.org/actions.html)
- [MobX reactions](https://mobx.js.org/reactions.html)
- [MobX React integration](https://mobx.js.org/react-integration.html)
