
# MobX observables computeds actions reactions and React integration — Big-picture orientation and mental model

# Problem and purpose

MobX is a state-management system for JavaScript and TypeScript that makes state reactive. You mark values observable, define computations from them, and let MobX track which computation reads which values. When relevant state changes, only dependent computed values, reactions, and observed React components are scheduled to update. The dependency graph is discovered at runtime from actual reads rather than declared in a selector map.

This topic covers MobX 7's core model and React integration. MobX 7.1.7 is the latest core package checked on 2026-11-17. The concepts remain familiar from MobX 6, but the major release removed the no-Proxy fallback, legacy decorators, namespaced modifier exports, `trace`, and older React binding APIs including `Provider`/`inject`, `useLocalStore`, and renderer-specific batching helpers. If a project must run in an environment without Proxy, MobX 6 is the documented compatibility branch.

# Plain-language mental model

Imagine a spreadsheet. Observable state is the set of input cells. A computed is a formula whose result is cached while its inputs stay unchanged. An observer or reaction is a consumer that records which cells it read; when one of those cells changes, MobX updates the dependent consumer. An action is a transaction boundary around writes: observers do not see intermediate states halfway through a multi-step operation.

The key rule is: what was read while the tracked function ran? MobX subscribes to observable properties read synchronously during that execution. Conditional branches can change the dependency set dynamically. A value that is available to a component but never dereferenced inside its observer render is not a dependency of that render.

# How the parts fit together

1. Create observable state with `observable`, `makeObservable`, or `makeAutoObservable`.
2. Mark derivable values as computeds (or let `makeAutoObservable` infer getters). Computeds are lazy and cached while observed and unchanged.
3. Change state in actions. An outer action batches changes so reactions run after the transaction completes.
4. Use reactions for effects that synchronize with something outside the state model; dispose of them when their lifetime ends.
5. Wrap React components that read observables with `observer` from `mobx-react-lite` for function components or `mobx-react` when class component support is needed.

`makeAutoObservable` is concise, but has boundaries: it cannot be used on classes with a superclass or classes intended for subclassing. `makeObservable` gives explicit annotation control. Modern Stage 3 decorators are supported with current TypeScript/Babel setup; MobX 7 no longer supports legacy decorators.

# Concept map

```text
observable state ──read during tracking──> computed / observer / reaction
       ▲                                          │
       └──────────── action transaction ─────────┘
                                                  │
                            changed dependency -> rerun affected consumer
```

In React, `observer(Component)` makes the render function a tracked consumer. Read observable properties inside that render (or a tracked computed it calls). MobX does not need the component to manually list dependencies. With React Compiler, however, static memoization can conflict with MobX's mutable-identity model: the official `mobx-react-plugin` can wrap components and insert the `'use no memo'` directive so the compiler does not reuse stale JSX.

# End-to-end walkthrough

Suppose a store has observable `items` and `filter`. A computed getter derives `visibleItems` from those fields. An observer list component reads `store.visibleItems` while rendering. When an action toggles one item's completion, MobX batches the write, invalidates the computed, recomputes it when demanded, and schedules the list component because that render used the changed observable dependency. Another component that reads only `store.title` need not rerender.

If a state change should save data to local storage, an `autorun` or `reaction` can synchronize the external system and return a disposer. But a user pressing a submit button should normally call the network operation directly from the event handler; indirect reactions are best for automatic synchronization where cause/effect is genuinely state-driven.

# When to use it and tradeoffs

MobX fits domain models with nested mutable state, derived properties, and consumers that benefit from fine-grained automatic tracking. It can reduce selector and immutable-update boilerplate. The tradeoff is that dependencies are implicit: a misplaced read, missing `observer`, or untracked async read can make behavior surprising. Actions and strict configuration help make writes discoverable.

Compared with Redux, MobX uses mutable observable objects and dynamic read tracking; Redux emphasizes explicit action dispatch, reducer transitions, and selector-driven subscriptions. Neither model is universally superior. Choose based on team reasoning style, auditability needs, state shape, tooling, and framework architecture.

# What later lessons cover

The concepts lesson explains tracking and transactions. References cover observable creation, computeds, actions and async flows, reactions and disposal, React observation, and configuration/version constraints. Practice builds a reactive model and UI; interview questions focus on implicit versus explicit dependencies and lifecycle tradeoffs.

For larger applications, MobX's official guidance also discusses separating domain stores from UI state, sharing stores through a root store and React context, preserving one in-memory instance per domain entity, and keeping transport concerns testable. These are opinionated architectural patterns, not required framework APIs.

Sources: [MobX observable state](https://mobx.js.org/observable-state.html), [MobX actions](https://mobx.js.org/actions.html), [MobX React integration](https://mobx.js.org/react-integration.html), [MobX configuration](https://mobx.js.org/configuration.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html), [MobX package metadata](https://www.npmjs.com/package/mobx).
