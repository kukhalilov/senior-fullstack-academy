
# MobX observables computeds actions reactions and React integration — Interview questions and reasoning

# Core questions

1. Explain MobX's observable, computed, action, and reaction cycle.
2. How does MobX determine a computed or observer's dependencies?
3. What makes a computed different from a reaction?
4. Why are actions useful beyond enforcing style?
5. How should async methods update MobX state after an await?
6. Compare `makeObservable` and `makeAutoObservable`.
7. What are the differences between `observable`, `observableRef`, and `observableShallow` in current MobX 7?
8. When should a reaction be disposed, and what leaks if it is not?
9. How does `observer` integrate with React rendering?
10. What changed in MobX 7 that can affect older applications?
11. How can React Compiler produce stale output for observed MobX components?
12. Compare MobX's state model with Redux's.

# Concise interview answers

1. Observables hold source state; computeds derive values; actions group writes; reactions/observers respond to tracked dependencies.
2. It records observable reads made synchronously while a tracked computation executes, and updates that dependency set after each run.
3. A computed returns a pure derived value; a reaction performs an external side effect when selected data changes.
4. Actions batch intermediate writes from reactions, identify mutation boundaries, and support strict enforcement.
5. Each post-await continuation is a new tick; wrap writes in `runInAction`, action handlers, or use `flow`.
6. `makeObservable` explicitly annotates the target in place; `makeAutoObservable` infers common annotations but does not support inheritance.
7. `observable` deeply enhances convertible values; `observableRef` tracks field replacement only; `observableShallow` observes collection changes without recursively observing members. MobX 7 replaced the MobX 6 namespaced spellings.
8. Dispose when the owner ends; otherwise a reaction may retain closures, continue external effects, and keep state alive.
9. `observer` tracks observable property reads during component render and schedules that component when a dependency changes.
10. MobX 7 requires Proxy, removes the ES5 fallback/configuration and legacy decorators, replaces namespaced modifier exports with named exports, removes `trace` and several deprecated React binding helpers, and retains the core reactive model.
11. Compiler memoization uses static dependencies and stable object identity, which can reuse stale JSX while MobX mutates observable contents in place.
12. MobX infers dependencies from reads and supports action-bounded mutation; Redux dispatches explicit actions through pure reducers and components read through selectors.

# Deep follow-up answers

**Why do reactions not always run in the middle of a write?** Actions are transactions. MobX waits until the outermost action completes so derivations and side effects observe a consistent completed state. This is batching, not rollback.

**Why can a component fail to update even though it received a store?** A reference alone is not a tracked read. The component must be wrapped in `observer` and dereference the observable property during its synchronous render. A non-observer child receiving an observable object will not subscribe just because the object was passed as a prop.

**How do you choose between `runInAction` and `flow`?** `runInAction` is a clear local wrapper for writes after an await. `flow` expresses the whole async process as a generator whose yielded continuations are actions and can be cancelled as a flow task. Use the style that keeps the write boundaries understandable and integrates with the project's TypeScript/transpiler setup.

**When should you use a reaction?** Use it when an observable change should automatically synchronize an external system and no direct event boundary is a better fit. Do not use it to derive observable state or to make one reaction depend on another's ordering.

**What is the MobX 7 compatibility decision?** Use MobX 7 for current Proxy-capable runtimes and modern decorator or annotation-based code. If no-Proxy engines or legacy decorators are requirements, official configuration guidance points to MobX 6; a major upgrade requires addressing those breaking changes first.

# Scenario questions

1. A component receives `store` but doesn't rerender when `store.profile.name` changes. What would you inspect first?
2. A computed getter writes `filteredItems` back to the store. What modeling change would you propose?
3. A reaction logs only the initial value, despite later changes. How could an action or async boundary explain the missing dependency?
4. A class method fetches data and writes state after await under `enforceActions: 'always'`. Give two correct approaches.
5. A large React app enables React Compiler and MobX 7. What build integration or directive decisions are needed?
6. An app needs to support a browser without Proxy and uses legacy decorators. What should its MobX upgrade plan consider?

# Tradeoffs and alternatives

- MobX: concise mutable models, automatic fine-grained tracking, and computed properties; implicit dependencies and runtime instrumentation need disciplined debugging.
- Redux Toolkit: explicit event/action and reducer flow, predictable serialized state and DevTools history; more explicit setup and selector composition.
- React local state: best for small ephemeral UI details; less suitable for shared domain models with many derived values.
- `makeAutoObservable`: minimal annotation overhead; inference and inheritance limitations.
- Manual `makeObservable`: explicit and predictable annotations; more declarations to maintain.
- `autorun`: convenient broad tracking; can subscribe to unintended reads.
- `reaction`: precise expression/effect separation; requires careful equality and lifecycle handling.

# Common weak answers

- “MobX tracks the whole object when passed as a prop.” Tracking comes from property reads inside an observer's tracked render.
- “An action wraps a promise through completion.” The action covers its synchronous transaction, not later promise continuations.
- “Computed and reaction are both caches.” Computeds derive values; reactions cause effects.
- “Reactions always run in creation order.” MobX does not guarantee ordering among independent reactions.
- “MobX 7 is just MobX 6 with a new number.” It removes the Proxy fallback and legacy decorators, and drops other deprecated compatibility paths.
- “The React Compiler only improves observed components.” Its static memoization can conflict with MobX's runtime tracking unless configured appropriately.

# Self-check rubric

Score 0–2 for each: (a) trace observable reads to dependencies, (b) distinguish derivation from side effects, (c) explain transaction behavior, (d) handle post-await writes, (e) manage reaction lifecycle, (f) explain React observation, and (g) state MobX 7 migration constraints. A strong answer scores 11–14 and supports the choice with a concrete scenario; 7–10 indicates good basic vocabulary but limited edge-case reasoning; below 7, revisit the concept and API references.

Sources: [Observable state](https://mobx.js.org/observable-state.html), [Actions](https://mobx.js.org/actions.html), [Computeds](https://mobx.js.org/computeds.html), [Reactions](https://mobx.js.org/reactions.html), [React integration](https://mobx.js.org/react-integration.html), [Configuration](https://mobx.js.org/configuration.html), [React Compiler](https://mobx.js.org/react-compiler.html).
