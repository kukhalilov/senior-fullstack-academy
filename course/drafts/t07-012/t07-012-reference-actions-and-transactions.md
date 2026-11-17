<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: State-changing actions and transactional boundaries

# Scope and version

This lesson covers MobX 7.1.7 actions, transactions, and async state writes. Actions group synchronous writes; work after `await` is a later tick and needs its own action boundary. MobX 7 uses modern decorators only and replaces namespaced exports such as `action.bound` and `flow.bound` with named exports `actionBound` and `flowBound`. See [Actions](https://mobx.js.org/actions.html), [Decorators](https://mobx.js.org/enabling-decorators.html), and [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html).

# How this group fits the mental model

Actions mark where observable state changes. They create transaction boundaries so reactions see completed state rather than intermediate writes. For async processes, each continuation that writes state must be action-wrapped. Computeds derive data; actions change it.

# Supplied names explained

- `action annotation` — Annotation marking a method or function as a state-changing action. It groups writes in a transaction and makes the write boundary visible to strict action enforcement.
- `action(fn)` — Higher-order function wrapping a callback as an action. Useful for event callbacks or a promise handler that must write observables.
- `action(name, fn)` — Named version of the callback wrapper. The name improves debugging/spy-event output; behavior otherwise matches `action(fn)`.
- `@action method decorator` — Modern Stage 3 decorator for a method that mutates state. MobX 7 supports `@action` with modern decorator configuration; legacy decorator transpilation must be migrated.
- `@action.bound legacy decorator (removed in MobX 7)` — MobX 6 decorator spelling that combined action behavior and `this` binding; MobX 7 removes it. Use the named `actionBound` annotation/decorator or `{ autoBind: true }` with `makeAutoObservable` when inferred actions and flows should be bound.
- `actionBound annotation/decorator` — MobX 7 named export that marks a method as an action and binds it to the instance. It replaces the removed `action.bound` namespace property; in a modern decorator class, use `@actionBound`.
- `@observable accessor property decorator` — Modern observable property form relevant to action-model classes: `@observable accessor value = 0`. It uses Stage 3 decorators, and accessor properties are non-enumerable/non-own.
- `@computed getter decorator` — Modern getter decorator for a pure derivation, often paired with actions in a decorated class. Do not decorate a mutating method as computed.
- `runInAction(fn)` — Executes the callback immediately as a temporary action. Commonly wraps state writes after `await`, because the original async action's transaction ended when its synchronous segment returned.
- `transaction(action)` — Runs a callback in a transaction so reactions wait until it completes. Actions already provide transaction semantics; use the explicit helper for low-level batching when appropriate, not as a replacement for clear domain action boundaries.
- `flow(generatorFunction)` — Wraps a generator-based async process so each continuation is handled as an action. Use `yield` for promises instead of `await`. The returned process behaves like a promise and can be cancelled through its flow task interface.
- `flowBound annotation/decorator` — MobX 7 named export that marks a generator method as a flow and binds it to its instance. It replaces removed `flow.bound`; `{ autoBind: true }` with `makeAutoObservable` can also bind inferred methods.
- `@flow.bound legacy decorator (removed in MobX 7)` — Historical MobX 6 spelling replaced by the `flowBound` named export in MobX 7.
- `flowResult(promise)` — TypeScript helper that casts a flow's returned value to the promise type it has at runtime. TypeScript may otherwise infer the generator's untransformed return type.
- `makeObservable action annotation` — Explicit annotation entry such as `{ save: action }` passed to `makeObservable`, declaring a member a state-changing action.
- `makeAutoObservable action inference` — Inference marks ordinary functions as `autoAction`; at runtime this special action determines whether to behave as a derivation or action based on calling context. It is not an annotation to apply manually.
- `makeAutoObservable flow inference` — Generator methods are inferred as flows, unless a transpiler configuration prevents generator detection; specify `flow` explicitly if inference does not occur.
- `enforceActions configuration` — `configure({ enforceActions })` controls permitted observable mutations. Current docs list `'observed'` as default, `'never'` for unrestricted writes, and `'always'` for action-only writes, including creation. `'observed'` permits writes outside actions while a state value has not yet been observed. Prefer explicit actions for nontrivial shared state.
- `Action transaction boundary` — The outermost action/transaction batches writes; dependent reactions run after it completes, not between each mutation. Nested actions join the same outer transaction.
- `State mutation outside an action` — A write to an observable outside an action. With strict enforcement it warns or errors according to configuration; even when permitted, actions make mutation ownership easier to reason about.
- `MobX 7 removal of legacy decorators` — MobX 7 requires standard Stage 3 decorators or no decorators. Migrate old TypeScript `experimentalDecorators` setups; with modern decorators, disable/remove that legacy flag and add `accessor` to observable fields.
- `MobX 6-to-7 replacement of namespaced annotation exports` — MobX 7 removed namespaced annotation properties for tree-shaking. Replace `action.bound` with `actionBound` and `flow.bound` with `flowBound`; the underlying action/flow semantics remain.
- `MobX 7 removed action.bound namespaced export` — The named `actionBound` annotation replaces `action.bound` both in annotation maps and as a Stage 3 method decorator `@actionBound`; MobX 7 also removes the legacy decorator proposal.
- `MobX 7 removed flow.bound namespaced export` — The named `flowBound` annotation replaces `flow.bound` both in annotation maps and as a Stage 3 generator-method decorator `@flowBound`.
- `@action.bound legacy decorator (removed in MobX 7)` — Historical MobX 6 spelling removed in MobX 7. Use named `@actionBound` in a Stage 3 decorator class, or `{ autoBind: true }` with `makeAutoObservable` for inferred methods.
- `@flow.bound legacy decorator (removed in MobX 7)` — Historical MobX 6 spelling removed in MobX 7. Use named `@flowBound` for a Stage 3 generator method decorator, or `{ autoBind: true }` when inference is appropriate.

# Cross-item comparison

Use `action` for a synchronous state-changing operation. Use `runInAction` for a focused write callback, especially after an `await`. Use `flow` for a generator-based async process whose yielded continuations should each be actions. Plain `async`/`await` remains valid, but wrap each later write in `runInAction` or an action handler. A MobX transaction is a batching boundary, not rollback: if code throws after partial mutations, MobX does not automatically restore the prior state.

`actionBound` and `flowBound` are current named exports. The MobX 6 `action.bound` and `flow.bound` spellings are removed, as are their legacy decorator forms; MobX 7 modern decorators use `@actionBound` and `@flowBound`. `makeAutoObservable(..., {}, { autoBind: true })` is often simpler when all inferred actions/flows should be bound.

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

Sources: [Actions](https://mobx.js.org/actions.html), [Decorators](https://mobx.js.org/enabling-decorators.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html).
