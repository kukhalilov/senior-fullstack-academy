# React context composition state ownership and component architecture — Reference: Choosing state and composition boundaries

Sources: React 19.3 [Managing State](https://react.dev/learn/managing-state), [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), and [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context).

## Scope and version

This reference turns state/composition principles into architecture decisions. Routing and server cache are separate domains.

## Ownership and lifetime decisions

Start by identifying who creates, changes, reads, and resets a value. Local state belongs to a component if its lifetime follows that component and no other consumer coordinates it. Lift state only to a boundary that truly coordinates multiple consumers. State lifetime and component boundary should align: moving a component can unintentionally reset local state, while hoisting too high can retain state longer than intended.

Separate UI state (open menu, focused tab, unsaved draft) from server data (authoritative resource, cache, invalidation, loading state). A feature boundary should group behavior/data that change together and expose a small interface. A presentation component primarily renders supplied values/callbacks; a behavior-owning component coordinates state and event transitions. They can be combined when separation would add needless complexity.

Avoid premature global state. Global/context/store reach increases coupling, consumer fan-out, test setup, and difficulty tracing updates. Keep one-directional flow: owner renders children with data; interaction sends callback/action upward; owner updates state; new render flows down. A reducer can improve traceability for coordinated transitions; external stores introduce their own rules and should solve an actual problem.

## Decision sequence

1. Is this value derivable from existing props/state? Calculate it.
2. Does one component own it? Keep it local.
3. Must siblings coordinate? Lift to closest common parent.
4. Do distant descendants read a shared value? Consider narrowly placed context or composition.
5. Does state require cross-route/server cache/selector/persistence/complex subscription? Evaluate a data framework or external store.
6. Which component boundary matches reset/lifetime semantics?

## Example

A search feature may keep input draft local to its form, send a query through a callback/Action, and use a router/server-data cache for results. A global context need not contain the draft, pending status, results cache, and every component option. Separate values according to ownership and lifetime.

## Cross-item comparison

Local state versus lifted state concerns coordination. Props versus context concerns propagation/dependency visibility. Context versus store concerns subscription and additional state infrastructure. Controlled versus uncontrolled concerns who owns a component's important value. Stored-derived versus render-derived concerns whether the value has an independent lifecycle (usually it does not).

## Common mistakes

Putting all state in one context; duplicating server state into local stores without invalidation strategy; lifting for hypothetical future reuse; binding architecture to one giant container component; and using “presentation” as a rule that components may never contain small local state.

## Knowledge checks with answers

1. **What is the first question for a state value?** Is it derived or independently owned?
2. **Why avoid app-wide state prematurely?** It widens coupling and makes updates harder to trace.
3. **Can presentation component own transient local UI state?** Yes, if that state belongs locally and improves clarity.

## How this group fits the mental model

Architecture makes ownership, lifetime, and update direction explicit across component boundaries.

## Supplied names explained

The exact inventory below covers boundary selection, state lifetime, UI/server distinction, component roles, global-state restraint, and unidirectional flow.

## Examples

The search feature separates draft input, server result cache, and pending operation by ownership.

## Exact terms covered


### Exact terms covered

- `State ownership decision`
- `Local state versus lifted state`
- `State lifetime and component boundary`
- `UI state versus server data`
- `Feature boundary`
- `Presentation component`
- `Behavior-owning component`
- `Avoid premature global state`
- `Traceable unidirectional data flow`
