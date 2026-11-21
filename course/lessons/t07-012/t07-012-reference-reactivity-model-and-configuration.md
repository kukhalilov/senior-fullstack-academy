
# MobX observables computeds actions reactions and React integration — Reference: Dependency tracking and behavior configuration

# Scope and version

This reference describes MobX 7.1.7's dependency model and configuration checks. MobX 7 requires Proxy support and removes the ES5 fallback, `configure({ useProxies })`, and `proxy: false` observable options. Configuration values are global to the MobX instance, so establish them at application startup. See [Configuration](https://mobx.js.org/configuration.html), [Understanding reactivity](https://mobx.js.org/understanding-reactivity.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX 7 releases](https://github.com/mobxjs/mobx/releases), and [MobX package metadata](https://www.npmjs.com/package/mobx).

# How this group fits the mental model

MobX's dependency graph is built from observable reads during tracked executions. Configuration can warn when code violates preferred state/action/derivation patterns. Strictness options are diagnostic aids and compatibility settings; they do not replace understanding the tracking rules.

# Supplied names explained

- `Observable dependency graph` — Runtime relationships between observable values and derivations/observers that read them. The graph changes as tracked executions read different values.
- `Tracked observable read` — Reading an observable property or computed while a tracked function is synchronously executing registers a dependency. Merely holding a reference to an observable object does not subscribe to all its fields.
- `Tracked function execution` — A MobX reactive context such as a computed, `autorun`, `reaction` expression, or `observer` render during which reads are collected. Actions are untracked; they do not add their internal reads to an enclosing reaction.
- `Dynamic dependency tracking` — After each tracked execution, MobX updates the dependency set to the observables actually read in that run. If a conditional branch changes, dependencies no longer used can be unsubscribed.
- `Reaction scheduling after action completion` — Reactions are not run in the middle of an outer action/transaction. They run after it completes, so they observe the completed state transition rather than intermediate writes. By default reactions run promptly/synchronously after the outer transaction.
- `Proxy requirement in MobX 7` — MobX 7 depends on native Proxy support to make plain objects and arrays observable and track dynamic property/array behavior.
- `No MobX 7 ES5 proxy fallback` — The legacy fallback implementation for engines without Proxy was removed. MobX 6 is the documented option when supporting such environments is mandatory.
- `MobX 7.1 Proxy requirement` — Verified for the MobX 7.1 line: MobX requires native Proxy to make plain objects and arrays observable, with no old ES5 fallback. Do not treat this as a different mechanism from the Proxy requirement above; it is the current-version checkpoint.
- `configure(options)` — Sets global MobX behavior. Call once near app setup, before creating stores/reactions where practical; changing global configuration midway can make reasoning and tests brittle.
- `configure.enforceActions` — Controls mutation enforcement. Documented modes are `'observed'` (default: observed state must be changed in actions), `'never'` (writes anywhere), and `'always'` (writes only in actions, including initialization). Strict mode surfaces unstructured writes early.
- `configure.computedRequiresReaction` — When true, warns/errors on reading computeds outside a reactive context. This helps discover expensive or unintentionally unobserved derivations; it may be too strict for some debugging or one-off reads.
- `configure.reactionRequiresObservable` — When true, warns if a reaction tracks no observable values. This catches reactions that cannot rerun because no dependency was discovered.
- `configure.observableRequiresReaction` — When true, warns when observable state is read outside a reactive context. This can reveal reads that do not subscribe to updates, but may report intentional inspection/logging.
- `configure.safeDescriptors` — Controls safe property descriptors used for observable annotations. Disabling it can enable certain testing/mocking patterns but weakens protections and is a specialized setting; do not turn it off as a routine fix.
- `Removed configure.useProxies option in MobX 7` — MobX 7 no longer accepts `configure({ useProxies: 'always' | 'never' | 'ifavailable' })`; Proxy is required. Remove old configuration during migration.
- `Removed observable option proxy: false in MobX 7` — Older APIs allowed an observable object/array without Proxy. MobX 7 removes that compatibility mode along with the fallback implementation.
- `MobX transaction` — A batching boundary around observable writes; reactions wait until the outermost transaction finishes. It is not an undo log or rollback mechanism.
- `MobX versus Redux state transition model` — MobX derives dependencies dynamically from observable reads and permits mutation through actions; Redux dispatches explicit actions through reducers and UI selectors explicitly declare reads. MobX often reduces ceremony; Redux makes transition/event paths more explicit. Both can be predictable when used with clear conventions.
- `configure.disableErrorBoundaries` — By default MobX catches and rethrows reaction exceptions so one failing reaction does not prevent other scheduled reactions; they do not propagate to the original causing code for `try/catch`. Disabling boundaries lets exceptions escape for debugging/tests but can leave MobX/application state unrecoverable; default is `false`.
- `configure.isolateGlobalState` — With multiple MobX instances, isolates one instance's internal state, useful for an encapsulated library; default `false` shares state (and requires compatible versions). Enable isolation intentionally when library and app state must remain separate.
- `configure.reactionScheduler` — Replaces the function that executes pending reactions; default immediately calls the supplied function. The docs suggest debugging or delaying updates to visualize them. A custom scheduler changes reaction timing, so ensure each scheduled function is eventually run.
- `configure observableRequiresReaction React 19.2 development caveat` — React 19.2 development behavior may read observable values while inspecting/rendering component output outside MobX's tracked render, which can trigger `observableRequiresReaction` diagnostics. Treat it as a dev-tooling interaction to investigate, not proof that production observer tracking is broken.
- `MobX 7.1 Proxy requirement` — MobX 7.1 uses Proxy-based observable objects and arrays and has no ES5 fallback; verify the deployment runtime supports native Proxy before selecting this major version.

# Cross-item comparison

Automatic dependency tracking avoids maintaining selector dependency lists but makes reads the hidden subscription declaration. Redux's explicit selector/action model makes those connections visible in code and DevTools, but requires more structure. MobX's strict configuration options can make its implicit model more observable by flagging writes/reads outside intended boundaries.

`enforceActions` checks mutation boundaries; the `*RequiresReaction` options check tracking contexts. They address different problems. A transaction batches reactions but does not validate business rules, roll back changes, or guarantee a specific order among independent reactions.

# Examples

```ts
import { configure } from 'mobx'

configure({
  enforceActions: 'observed',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
})
```

Use these settings as guardrails and adjust only when a legitimate usage requires it. A test suite may intentionally inspect observables outside reactions; prefer an explicit test setup or narrow exception rather than weakening the whole application by default.

# Common mistakes

- Assuming MobX tracks reads after `await` or in callbacks that execute after the tracked function returns.
- Assuming an action's internal reads become the dependency set of a reaction that called it.
- Interpreting every strict-mode warning as a runtime correctness failure rather than a cue to inspect the boundary.
- Changing `configure` per feature or test without restoring global state.
- Expecting transaction batching to roll back partial writes or order independent reactions.
- Keeping `useProxies` or `proxy: false` after upgrading to MobX 7.
- Disabling `safeDescriptors` to work around a design issue instead of understanding the descriptor constraint.

# Knowledge checks with answers

1. When does MobX collect observable dependencies? **During synchronous execution of a tracked computation/reaction/render.**
2. What does `enforceActions: 'observed'` mean? **Observed observable state must be mutated through actions; unobserved setup state can be initialized outside actions.**
3. What does `reactionRequiresObservable` detect? **A reaction that read no observable dependency and therefore cannot react to changes.**
4. Are independent reactions guaranteed to run in a chosen order? **No; do not make one reaction depend on another's ordering.**
5. How do MobX 7 apps support no-Proxy environments? **They cannot use MobX 7 there; the docs identify MobX 6 for that compatibility requirement.**

Sources: [Configuration](https://mobx.js.org/configuration.html), [Understanding reactivity](https://mobx.js.org/understanding-reactivity.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX 7 releases](https://github.com/mobxjs/mobx/releases), [MobX package metadata](https://www.npmjs.com/package/mobx).
