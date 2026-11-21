# React context composition state ownership and component architecture — Core concepts and how they fit together

Sources: React 19.3 [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [`useContext`](https://react.dev/reference/react/useContext), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), [Managing State](https://react.dev/learn/managing-state), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), and [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer).

## Learning objectives

Choose component boundaries and composition slots; place state by ownership; make controlled/uncontrolled decisions; design minimal canonical state; choose props/context/reducer/store; and preserve traceable unidirectional flow.

## Prerequisites

Know component props, children, state/reducer/context hooks, Effects, and render-tree identity from t07-003 through t07-006.

## Core concepts

Decompose UI into components around cohesive responsibilities and reusable interfaces. Component composition uses parent-child relationships; `children`, named content props, and JSX passed as props let a parent supply structure/content. Specialization configures a generic component for a focused use. Avoid unnecessary wrappers that add no ownership, behavior, semantics, or useful layout boundary.

State belongs to the component that owns the interaction/data lifecycle. Independent state stays local. Shared state moves to the closest common parent that coordinates consumers; that parent is the single source of truth and passes controlled values and callbacks down. A controlled component's important value is parent-provided; an uncontrolled component maintains local state; hybrid interfaces may accept a controlled prop with a local default. State colocation keeps state near consumers and limits rerender fan-out. Prop drilling is repeated pass-through through components that do not use the value; it is sometimes acceptable because it keeps dependencies explicit.

Shape state so impossible combinations are hard to represent. Group values that change together; avoid contradictory flags, redundant derived fields, duplicated item objects, and deep nested structures. Store canonical item data once and an identifier for the selected item. Derive filtered/sorted/full-name values during render rather than syncing duplicate state with Effects. Use a reducer to make coordinated transitions explicit when update logic is distributed/complex; avoid adding a reducer for trivial independent values.

Context supplies a value to distant descendants through a provider and subscribes consumers. A consumer reads the closest provider above it, or the context default if no provider exists; a provider returned by the same component is below that component’s read. Provider values compare with `Object.is`, and `memo` does not block a consumer receiving a changed context value. Provider placement matters: place it around the smallest subtree that shares the value. Context reduces prop drilling but hides dependencies and can fan updates out to consumers of that context. Props are explicit and locally traceable. Composition can avoid prop drilling when an intermediate wrapper can pass a prepared child element. An external state store adds store/subscription/selector/derivation/side-effect conventions; it is distinct from context and should be introduced based on real requirements (cross-tree coordination, persistence, devtools, selectors, or frequent updates), not team fashion.

Distinguish UI state (open tab, draft field, selected local item) from server data (authoritative entities, caching, invalidation, loading/error). Do not duplicate server data into unrelated global UI state without a clear synchronization strategy. Keep feature boundaries cohesive; presentation components render supplied values/callbacks, behavior-owning components coordinate state/effects/data. Preserve traceable one-way flow: state owner → props/context → user event/callback → owner update → next render.

## Mechanisms and relationships

```text
independent consumers → local state
coordinating siblings → closest common parent state → controlled props/callbacks
distant subtree readers → narrowly placed context provider
wrapper flexibility → children/named JSX slots
complex transitions → reducer; broad subscription needs → evaluate external store
```

## Worked examples

An accordion that allows one open panel stores `activePanelId` in the accordion parent. Panels receive `isActive` and `onShow`. A selected contact view stores `selectedId`, looks up the canonical contact, and derives display data; it does not store a second stale contact object. A generic page shell accepts `children` rather than passing each content detail through layout components.

## Misconceptions and edge cases

- State does not need to live at the app root to be shared.
- Context is not automatically a better solution than prop drilling.
- Lifting too high can create broad coupling and rerenders; lift only to the coordinating ancestor.
- Controlled means the parent owns the value, not that the child has no local transient state.
- A reducer is a transition organization tool, not an async side-effect engine.
- Context does not replace server cache architecture.
- Avoid storing derivable values or both a selected object and its canonical list unless snapshot semantics are intentional.
- Composition is often clearer than making a wrapper aware of every descendant option.

## Knowledge checks with answers

1. **Where lift shared state?** The closest common parent that coordinates consumers.
2. **What is state colocation?** Keep state near the components that use/coordinate it.
3. **When use context?** Distant descendants need a shared value and explicit passing is cumbersome.
4. **Why store an ID instead of selected object copy?** One canonical entity prevents stale duplicates.
5. **When consider external store?** Actual shared subscription/coordination requirements beyond simple local/prop/context patterns.
