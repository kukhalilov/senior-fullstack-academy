# Frontend state management Redux Toolkit and MobX comparisons — Reference: Decision criteria and migration tradeoffs

## Scope and version

This is a decision reference for the supplied Redux/MobX comparisons, not a universal benchmark. Compare current versions and the team's application constraints; full product APIs are in t07-011 and t07-012. [React state management](https://react.dev/learn/managing-state) [Redux Toolkit](https://redux.js.org/toolkit/usage/usage-guide) [MobX React](https://mobx.js.org/react-integration.html)

## How this group fits the mental model

Select the store only after identifying ownership, lifetime, and whether data is server-owned or client-owned. A state library is a programming model and tooling choice; it does not define the backend's authority or remove cache/error lifecycle work.

## Supplied names explained

- `Explicit action and reducer transition` describes Redux: an action names an event and a reducer deterministically computes the next state. This makes state history and replay/inspection easier when state is serializable.
- `Automatic observable dependency tracking` describes MobX: reads during tracked execution create subscriptions and changed observables trigger dependents. This reduces explicit selector wiring but makes understanding the current dependency graph important.
- `Normalized serializable client state` stores entities by stable ID and references between them, with serializable plain data. It helps avoid duplication and supports Redux tooling; it is a modeling strategy, not required for every small state object.
- `Server-data cache lifetime` defines how long remote responses remain reusable, when subscribers keep them alive, and when they become stale or invalid. Choose a cache designed for server data rather than treating backend responses as ordinary client UI state.
- `Cache invalidation strategy` maps a mutation to affected cached data. RTK Query tags offer one mechanism; framework loaders/cache tags and manual request state have different rules.
- `Developer tooling and action history` considers Redux DevTools/action inspection, MobX tracing/observable inspection, logs, and team debugging workflows. Neither tool's history necessarily provides full server-side audit logs.
- `Team familiarity and conventions` affects code review, consistency, onboarding, and maintenance. A theoretically elegant model that no one can debug is a poor fit.
- `Incremental migration from legacy Redux` replaces older handwritten store patterns with Redux Toolkit gradually, often slice-by-slice while preserving behavior and tests. Do not rewrite business logic and state architecture simultaneously without checkpoints.
- `State library selection criteria` include number/distance of consumers, update model, async/server-data needs, devtools, serialization, React integration, TypeScript needs, bundle/runtime constraints, team experience, and migration cost.
- `Redux Toolkit versus MobX` compares explicit serializable event transitions and action history with mutable observable models and dynamic dependency tracking. Redux is often easier to inspect as a sequence; MobX often requires less explicit subscription/selectors.
- `RTK Query versus handwritten request state` compares endpoint/cache/subscription/invalidation automation with custom async state implemented using Redux actions/thunks. RTK Query reduces repeated cache plumbing for common API patterns; handwritten logic provides control but requires handling dedupe, lifetime, stale data, errors, and invalidation.

## Cross-item comparison

| Need/preference | Redux Toolkit + RTK Query | MobX |
|---|---|---|
| State changes | Explicit action/reducer | Observable model/action |
| View dependency | Selector/subscription | Tracked observable reads |
| History/debugging | Action history and serializable state | Observable inspection/reaction tracing |
| Server data | Optional RTK Query API cache | Usually pair with a fetch/cache approach; MobX alone is not a query cache |
| Migration from existing Redux | Strong fit through Toolkit modernization | Requires changing state model and consumers |

## Examples

For a legacy Redux reducer, first wrap its behavior in a `createSlice` and preserve action/state tests. Only after state transitions are stable should you decide whether backend reads should move to RTK Query. For MobX, introduce an observable store behind one feature boundary, wrap its React consumer in `observer`, and keep the server-data cache decision explicit.

## Common mistakes

- Choosing based on “Redux is verbose” or “MobX is magical” without a concrete workload.
- Calling RTK Query and MobX interchangeable server cache solutions.
- Normalizing every tiny state object before it creates a real duplication problem.
- Migrating store shape, async logic, and UI boundaries at once without tests.
- Expecting action histories to record backend truth or cross-client events.
- Ignoring serialization requirements for persistence, DevTools, or hydration.
- Applying one state library to URL state, server cache, form drafts, and local hover flags.

## Knowledge checks with answers

1. What is Redux's primary update model? Explicit actions and reducers.
2. What is MobX's primary subscription model? Dynamic tracking of observable reads.
3. Is MobX itself a server-data query cache? No.
4. Why migrate incrementally? Preserve behavior and isolate regressions.
5. What should drive tool choice? State ownership/lifetime, data needs, debugging, team conventions, and constraints.

## Sources

- [React managing state](https://react.dev/learn/managing-state)
- [Redux Toolkit usage](https://redux.js.org/toolkit/usage/usage-guide)
- [RTK Query overview](https://redux.js.org/toolkit/rtk-query/overview)
- [MobX observable state](https://mobx.js.org/observable-state.html)
- [MobX reactions](https://mobx.js.org/reactions.html)
- [MobX React integration](https://mobx.js.org/react-integration.html)
