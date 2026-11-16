# Frontend state management Redux Toolkit and MobX comparisons — Big-picture orientation and mental model

## Problem and purpose

State management is the choice of where changing information lives, who owns updates, and which parts of the UI should react. Many applications need only React state and URL state. Others need a shared client store or a server-data cache. Redux Toolkit and MobX solve different parts of that problem: Redux uses explicit actions/reducers and inspectable transitions; MobX tracks observable reads and updates dependents automatically. [React managing state](https://react.dev/learn/managing-state) [Redux Toolkit usage](https://redux.js.org/toolkit/usage/usage-guide) [MobX](https://mobx.js.org/observable-state.html)

## Plain-language mental model

Think of state as information with a home and a lifetime. A typing draft may belong to one form. A selected tab may belong in the URL. A list returned by a server belongs to a server-data cache with freshness rules. A logged-in user preference shared across distant features may belong in a client store. Moving every value into one global store makes ownership unclear; keeping every shared value local creates duplication and synchronization problems.

Redux Toolkit records explicit events that transform serializable state. MobX makes model fields observable; components/reactions that read them become dependent and update when those values change. Both still require clear state boundaries, validation, tests, and lifecycle decisions.

## How the parts fit together

```text
Changing information
├── transient to one component ── local React state
├── share among nearby components ── lift state / props / composition
├── share by subtree ── Context or store provider
├── encoded in navigation ── URL params/search state
├── owned by backend ── request/cache/revalidation layer (RTK Query is one option)
└── shared client-owned domain state ── Redux Toolkit or MobX when justified
```

## Concept map

- **Ownership:** decide who changes the value and how long it should survive.
- **Sharing:** colocate first; lift state or use Context/store when consumers require it.
- **Derivation:** calculate view values from source state rather than storing duplicates.
- **Server data:** manage loading, errors, freshness, subscriptions, and invalidation.
- **Client state:** model user intent/preferences and transitions independently of server cache.
- **Tool choice:** explicit event history and serializable reducers (Redux) versus observable models and dynamic dependencies (MobX).

## End-to-end walkthrough

A task list has one temporary text field, a filter reflected in the URL, server-owned tasks, and a preference shared across the app. Keep the text draft local. Store the filter in search params so links and refresh preserve it. Use a server-data cache such as RTK Query if Redux is already the chosen client store and the data lifecycle fits. Put a shared client-owned preference in a global store only if many distant features need coordinated access. Derive visible tasks from the task list and filter rather than saving another `visibleTasks` copy.

## When to use it and tradeoffs

Start with React state and URL state. Add Redux Toolkit when explicit action history, predictable centralized transitions, or a shared client store is valuable. Add RTK Query when API data fetching/caching should be integrated with Redux. Choose MobX when mutable observable models and automatic fine-grained dependency tracking fit the team's design. Do not choose based only on popularity or the size of the app; choose based on actual sharing, data ownership, debugging style, and team conventions.

## What later lessons cover

Reference lessons map state categories and React sharing choices, locate Redux Toolkit/RTK Query and MobX in the ecosystem, and compare migration and selection tradeoffs. Full API semantics live in t07-011 and t07-012.

## What is covered elsewhere

This topic does not repeat the full method/option catalog for Redux Toolkit or MobX; see [Redux Toolkit details](../t07-011/) and [MobX details](../t07-012/) in the course.
