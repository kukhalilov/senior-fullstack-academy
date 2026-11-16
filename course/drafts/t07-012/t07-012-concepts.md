<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Core concepts and how they fit together

# Learning objectives

You should be able to explain MobX's observable/computed/action/reaction cycle, predict dependencies from synchronous reads, distinguish computed derivation from side effects, choose an observable creation style, handle async mutations correctly, connect observable state to React, and identify MobX 7 migration constraints.

# Prerequisites

Know JavaScript objects, functions, getters, promises, React component rendering, and the idea of derived values. Decorators and TypeScript class fields are optional; MobX can be used without decorator syntax.

# Core concepts

**Observable state is the source data.** `observable` annotations, observable collections, and boxed values let MobX track reads and writes. `makeObservable` annotates selected members on an existing object. `makeAutoObservable` infers annotations for a convenient class/factory model: own properties become observable, getters computed, setters actions, functions auto-actions, and generator functions flows. It cannot be used with inheritance. Values are deeply enhanced by default where applicable; `observable.ref` tracks replacement without converting the assigned value, `observable.shallow` tracks collection changes without recursively making contents observable, and `observable.struct` ignores structurally equal assignments. Choose the annotation according to the value's semantics, not just habit.

Observable plain objects, arrays, maps, and sets are supported. MobX 7 requires `Proxy` for plain objects and arrays and removes the ES5 fallback. For keyed collections with dynamic keys, `observable.map` is generally safer than endlessly adding keys to an observable object; MobX caches descriptors and documents memory risks for unstable property names. Class instances are not automatically made observable merely by nesting them; their own constructor should initialize annotations.

**Computed values are pure derivations.** A computed getter depends on the observables it reads. It evaluates lazily, caches while observed, and suspends when it has no observers. It should not mutate state or perform effects. Keep values derivable from observables out of stored state to prevent synchronization bugs. A getter that takes arguments is a method, not a computed value; it can still have reads tracked by an enclosing reaction, but its output is not memoized as one computed result.

**Actions are write boundaries.** An action marks code that mutates observable state and runs within a transaction. Reactions do not see intermediate values before the outermost action completes. Actions are untracked: observable reads inside an action invoked by a reaction do not become that reaction's dependencies. `enforceActions` controls whether writes outside actions are allowed; `'observed'` is the documented default, `'never'` relaxes it, and `'always'` requires actions even during creation.

**Async work crosses transaction boundaries.** Each synchronous tick is one transaction. Code after `await` executes later and must also be an action. Wrap the post-await writes in `runInAction`, use action-wrapped promise handlers, or use `flow` with a generator and `yield`. `makeAutoObservable` infers generator functions as flows when the transpiler preserves detection; explicitly annotate if needed. `flowResult` helps TypeScript reflect that a decorated generator returns a promise. Current `mobx-react-plugin` can transform async class/object methods into generator flows at build time, subject to its documented integration.

**Reactions synchronize outward.** `autorun` tracks everything read in its effect and runs immediately once. `reaction` tracks only its data expression and invokes its effect when that result changes; it does not fire initially unless `fireImmediately` is true. `when` waits for a predicate and can run an effect once or return a promise. Reactions should usually perform external effects, not calculate more observable state; use computed values for derivation. Always dispose long-lived reactions or bind their lifetime to a clear owner.

**React observation is render-time tracking.** `observer` subscribes a component to observables dereferenced during its own render. Passing an observable object to a non-observer child does not make that child reactive. Read properties as late as possible, inside the component responsible for rendering them, or convert values to plain data before passing to third-party components. React UI-only transient state may remain in React state; domain state shared across components is a stronger MobX fit.

# Mechanisms and relationships

An action changes an observable. MobX invalidates dependent computeds and schedules observers/reactions after the outer transaction. Computeds can feed other computeds and reactions, forming a dynamic dependency graph. When a conditional changes which properties are read, the graph updates to match the latest tracked execution. MobX tracks synchronous reads only; reads after an `await`, timer, or unrelated callback are outside the original tracking context.

In React, an observed component is a MobX consumer, while React itself remains responsible for scheduling and committing the render. A component may read nested fields, but only if the access occurs during tracked render. React Compiler's static memoization can cache JSX based on object identity and conflict with MobX's in-place observable updates; the MobX React plugin excludes observed components/hooks from compilation with `'use no memo'` unless configured otherwise.

# Worked examples

```ts
import { makeAutoObservable, runInAction } from 'mobx'

class Catalog {
  items: Item[] = []
  query = ''
  status: 'idle' | 'loading' | 'ready' | 'error' = 'idle'

  constructor() { makeAutoObservable(this) }

  get visibleItems() {
    const normalized = this.query.toLowerCase()
    return this.items.filter(item => item.name.toLowerCase().includes(normalized))
  }

  async load() {
    this.status = 'loading'
    try {
      const items = await fetchItems()
      runInAction(() => {
        this.items = items
        this.status = 'ready'
      })
    } catch {
      runInAction(() => { this.status = 'error' })
    }
  }
}
```

The method before `await` and the later `runInAction` are separate transaction boundaries. If `load` is inferred as an action by `makeAutoObservable`, that action ends when its synchronous portion returns the promise; the explicit later action is still needed.

# Misconceptions and edge cases

- “MobX tracks every value a component can reach.” It tracks observable reads during the tracked synchronous execution only.
- “Computed values are just memoized functions.” They are observable derivations with dependency lifecycle and should be pure.
- “An action makes async code one transaction.” Each post-await tick needs its own action boundary.
- “A reaction is a good way to derive any value.” Computeds are for derivation; reactions are for external effects.
- “A new object value is automatically deeply observable.” Primitives and class instances are not converted; annotation/enhancement rules matter.
- “MobX 7 supports old environments through `useProxies: 'never'`.” That fallback and option are removed; MobX 6 is needed for no-Proxy environments.
- “React Compiler can memoize MobX observer components safely.” Static memoization can produce stale JSX from stable observable object identities; follow official plugin guidance.

# Knowledge checks with answers

1. What decides a reaction's dependencies? **Observable/computed values read synchronously during its tracked function.**
2. Why prefer a computed over a reaction for a derived count? **A computed models a pure value; a reaction is for an external side effect.**
3. What happens after an `await` in an async action? **Later observable writes occur in a new tick and need an action such as `runInAction` or `flow`.**
4. What changed in MobX 7 for older runtimes? **The Proxy-free ES5 fallback and `configure({ useProxies })` were removed.**
5. Why can React Compiler conflict with MobX? **It may memoize output using static dependencies while observable objects change contents without changing identity.**

Sources: [Observable state](https://mobx.js.org/observable-state.html), [Actions](https://mobx.js.org/actions.html), [Computeds](https://mobx.js.org/computeds.html), [Reactions](https://mobx.js.org/reactions.html), [MobX configuration](https://mobx.js.org/configuration.html), [MobX and React Compiler](https://mobx.js.org/react-compiler.html).
