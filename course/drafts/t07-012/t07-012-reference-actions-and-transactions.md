<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: State-changing actions and transactional boundaries

# Scope and version

This lesson covers MobX 7.1.7 actions, transactions, and async state writes. Actions group synchronous writes; work after `await` is a later tick and needs its own action boundary. MobX 7 uses modern decorators only; the older decorator proposal is not supported. See [Actions](https://mobx.js.org/actions.html), [Decorators](https://mobx.js.org/enabling-decorators.html), and [MobX package metadata](https://www.npmjs.com/package/mobx).

# How this group fits the mental model

Actions mark where observable state changes. They create transaction boundaries so reactions see completed state rather than intermediate writes. For async processes, each continuation that writes state must be action-wrapped. Computeds derive data; actions change it.

# Supplied names explained

- `action annotation` — Annotation marking a method or function as a state-changing action. It groups writes in a transaction and makes the write boundary visible to strict action enforcement.
- `action(fn)` — Higher-order function wrapping a callback as an action. Useful for event callbacks or a promise handler that must write observables.
- `action(name, fn)` — Named version of the callback wrapper. The name improves debugging/tracing output; behavior otherwise matches `action(fn)`.
- `@action method decorator` — Modern Stage 3 decorator for a method that mutates state. MobX 7 supports `@action` with modern decorator configuration; legacy decorator transpilation must be migrated.
- `@action.bound method decorator` — Historical legacy decorator syntax that bound `this` and marked a method as an action. Do not use this old decorator proposal with MobX 7. For explicit annotation use `action.bound` in `makeObservable`; for inferred models use `{ autoBind: true }` with `makeAutoObservable` or use a class-field arrow callback when appropriate.
- `@observable accessor property decorator` — Modern observable property form relevant to action-model classes: `@observable accessor value = 0`. It uses Stage 3 decorators, and accessor properties are non-enumerable/non-own.
- `@computed getter decorator` — Modern getter decorator for a pure derivation, often paired with actions in a decorated class. Do not decorate a mutating method as computed.
- `runInAction(fn)` — Executes the callback immediately as a temporary action. Commonly wraps state writes after `await`, because the original async action's transaction ended when its synchronous segment returned.
- `transaction(action)` — Runs a callback in a transaction so reactions wait until it completes. Actions already provide transaction semantics; use the explicit helper for low-level batching when appropriate, not as a replacement for clear domain action boundaries.
- `flow(generatorFunction)` — Wraps a generator-based async process so each continuation is handled as an action. Use `yield` for promises instead of `await`. The returned process behaves like a promise and can be cancelled through its flow task interface.
- `flow.bound annotation` — Annotation that binds a flow method's `this` to its instance. With `makeAutoObservable`, `{ autoBind: true }` also binds inferred actions and flows.
- `flowResult(promise)` — TypeScript helper that casts a flow's returned value to the promise type it has at runtime. TypeScript may otherwise infer the generator's untransformed return type.
- `makeObservable action annotation` — Explicit annotation entry such as `{ save: action }` passed to `makeObservable`, declaring a member a state-changing action.
- `makeAutoObservable action inference` — Automatic inference of ordinary methods as auto-actions. Auto-actions determine whether to behave as an action based on calling context; they are not an annotation to apply manually.
- `makeAutoObservable flow inference` — Generator methods are inferred as flows, unless a transpiler configuration prevents generator detection; specify `flow` explicitly if inference does not occur.
- `enforceActions configuration` — `configure({ enforceActions })` controls permitted observable mutations. Current docs list `'observed'` as default, `'never'` for unrestricted writes, and `'always'` for action-only writes including initialization. Prefer explicit actions for nontrivial shared state.
- `Action transaction boundary` — The outermost action/transaction batches writes; dependent reactions run after it completes, not between each mutation. Nested actions join the same outer transaction.
- `State mutation outside an action` — A write to an observable outside an action. With strict enforcement it warns or errors according to configuration; even when permitted, actions make mutation ownership easier to reason about.
- `MobX 7 removal of legacy decorators` — MobX 7 requires standard Stage 3 decorators or no decorators. Migrate old TypeScript `experimentalDecorators` setups; with modern decorators, disable/remove that legacy flag and add `accessor` to observable fields.

# Cross-item comparison

Use `action` for a synchronous state-changing operation. Use `runInAction` for a focused write callback, especially after an `await`. Use `flow` for a generator-based async process whose yielded continuations should each be actions. Plain `async`/`await` remains valid, but wrap each later write in `runInAction` or an action handler. A MobX transaction is a batching boundary, not rollback: if code throws after partial mutations, MobX does not automatically restore the prior state.

`action.bound` as an annotation is still a member annotation, while `@action.bound` is a legacy decorator spelling and should not be confused with Stage 3 `@action`. `makeAutoObservable(..., {}, { autoBind: true })` is often simpler when all inferred actions/flows should be bound.

# Examples

```ts
import { makeAutoObservable, runInAction } from 'mobx'

class ProfileStore {
  profile: Profile | null = null
  status = 'idle'
  constructor() { makeAutoObservable(this) }

  async load() {
    this.status = 'loading'
    const profile = await fetchProfile()
    runInAction(() => {
      this.profile = profile
      this.status = 'ready'
    })
  }
}
```

Generator alternative:

```ts
class ProfileStore {
  profile: Profile | null = null
  constructor() { makeAutoObservable(this) }
  *load() {
    const profile: Profile = yield fetchProfile()
    this.profile = profile
  }
}
```

The inferred `flow` handles generator continuations as actions. If tooling obscures generator detection, annotate `load: flow` with `makeObservable`.

# Common mistakes

- Assuming the pre-`await` action remains open for the entire promise lifetime.
- Updating observable state after `await` without an action when `enforceActions` is enabled.
- Expecting transactions to roll back on exceptions.
- Marking a pure lookup/filter method as an action, which makes its reads untracked when invoked during a derivation.
- Treating `@action.bound` legacy syntax as MobX 7 Stage 3 syntax.
- Assuming TypeScript knows generator decoration changes the return type without `flowResult`.
- Letting generators go through a transpiler that erases syntax required for flow inference without explicit annotation.

# Knowledge checks with answers

1. When do reactions run for a multi-write action? **After the outermost transaction completes.**
2. Why wrap code after `await` in `runInAction`? **It runs in a later JavaScript tick, after the original synchronous transaction ended.**
3. How does `flow` differ from `async`/`await` in MobX? **It wraps generator continuations as action steps; yielded promises resume inside flow's managed process.**
4. Does a transaction roll back writes after an exception? **No; it batches reactions but does not provide rollback.**
5. Which decorator mode does MobX 7 support? **Standard Stage 3 decorators, not the legacy TypeScript decorator proposal.**

Sources: [Actions](https://mobx.js.org/actions.html), [Decorators](https://mobx.js.org/enabling-decorators.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX package metadata](https://www.npmjs.com/package/mobx).
