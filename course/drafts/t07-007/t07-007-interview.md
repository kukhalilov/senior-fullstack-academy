# React context composition state ownership and component architecture — Interview questions and reasoning

Sources: React 19.3 [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), [Managing State](https://react.dev/learn/managing-state), and [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer).

## Core questions

1. Where should state live?
2. What is the closest common parent principle?
3. Compare controlled and uncontrolled components.
4. What is state colocation?
5. How do props, composition, and context differ?
6. When is prop drilling actually a problem?
7. How should a selected entity be represented?
8. Why avoid redundant/contradictory state?
9. When would you use a reducer?
10. When introduce an external state library?
11. How do UI state and server data differ?
12. What makes data flow traceable?
13. How does context select a provider and propagate changed values?

## Concise interview answers

1. At the lowest owner that needs to coordinate consumers and matches the intended lifetime.
2. Lift shared state to the nearest ancestor containing all consumers, then pass value/callbacks.
3. Controlled value is authoritative from parent; uncontrolled value lives locally; hybrid can support both with a clear mode contract.
4. Keep state near its consumers to limit coupling and update fan-out.
5. Props are explicit direct data flow; composition passes content through wrappers; context is subtree-wide subscription for distant descendants.
6. When repeated pass-through burdens intermediates or many consumers need the same value; it is not automatically bad.
7. Store canonical collection once plus selected ID, derive selected object.
8. They allow invalid combinations and synchronization drift.
9. For complex coordinated transitions represented as actions.
10. When requirements like broad shared subscriptions/selectors/persistence/devtools or cross-route coordination justify its conventions.
11. UI state is local interaction/draft; server data is authoritative and needs caching/invalidation semantics.
12. One-way owner→props/context→event callback→owner update→render flow.
13. A consumer reads the closest provider above it or the default if none exists. Provider changes are compared with `Object.is`; consumers receive fresh values even through `memo`. A returned provider cannot affect a `useContext` call in the same component.

## Deep follow-up answers

### Is context a global store?

No. Context provides values from a provider through a subtree and subscribes consumers. It does not automatically provide selectors, cache invalidation, persistence, or external state lifetime. Context can carry state controlled by a provider, but ownership still belongs to a component/store.

### When should a component be controlled?

When a parent must coordinate it with siblings, reset it, validate it, or persist its value. An isolated reusable widget may own local state. Hybrid APIs are flexible but need stable controlled/uncontrolled mode semantics.

### Why avoid storing selected object copies?

The copy can become stale when canonical data changes. Store the identity key and derive the selected record. A snapshot copy is valid only if snapshot semantics are intentional and named.

## Scenario questions

1. **Two accordion panels must coordinate.** Lift active ID to accordion parent and make panels controlled.
2. **Four wrappers pass a value to one descendant.** Consider composition slot or narrowly scoped context; compare explicitness and consumer count.
3. **A root context causes every consumer to update.** Split by concern/frequency, narrow provider, stabilize value where useful, or use store selectors for justified high-frequency state.
4. **Status booleans allow loading and success simultaneously.** Replace with one discriminated status/reducer transition model.
5. **Server results are copied into global context and go stale.** Use a server-data cache/invalidation strategy; keep local UI state separate.

## Tradeoffs and alternatives

Compare local state, lifted state, context, reducer, composition, and external store by ownership, update fan-out, explicitness, and infrastructure cost. Avoid architectural maximalism: the smallest mechanism that supports required coordination is usually easiest to maintain.

## Common weak answers

Avoid “all state belongs in Redux/context,” “prop drilling is always bad,” “controlled components cannot have local state,” “context equals store,” or “useReducer is always best.”

## Self-check rubric

A strong answer traces ownership/lifetime, identifies canonical data, selects a propagation method, and names tradeoffs. Give one point for each; revisit answers that pick a library before describing the coordination need.
