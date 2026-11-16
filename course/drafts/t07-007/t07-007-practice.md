# React context composition state ownership and component architecture — Exercises and worked solutions

Sources: React 19.3 [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), and [Managing State](https://react.dev/learn/managing-state).

## Goals

Place state according to ownership, shape it to avoid inconsistencies, choose props/composition/context, and distinguish UI state from server data.

## Worked example

An accordion has two panels, but only one may be open. Local panel state allows both open. Lift `activePanelId` to the accordion parent, pass each panel a controlled `isActive`, and pass an `onShow` callback. Parent coordinates one source of truth.

## Exercises

### 1. Keep independent state local

Two separate search inputs on a dashboard do not coordinate. Where should their query state live?

**Solution:** In each input/search feature locally. Sharing state without shared behavior adds coupling. Lift only if another component must coordinate/reset/read the same query.

### 2. Lift coordinated state

Two tabs must show the same selected customer. Design ownership.

**Solution:** Move `selectedCustomerId` to their closest common parent and pass value/callbacks. Keep customer records canonical elsewhere; derive selected customer by ID.

### 3. Fix contradictory state

State has `isLoading`, `isSuccess`, `isError`, all booleans. What is wrong?

**Solution:** It permits impossible combinations. Use a single status such as `idle | loading | success | error`, with separate error payload only when status is error. Model valid transitions.

### 4. Reduce duplicate data

State stores `products`, a copied `selectedProduct`, and `selectedIndex`; edits can make these disagree.

**Solution:** Store canonical products once and `selectedProductId`. Derive selected item from the collection; derive index if genuinely needed. If the UI intentionally snapshots the selected item, name/model that semantics explicitly.

### 5. Choose composition or context

A layout passes a complex `invoice` through four components that never inspect it; only the final content renders it.

**Solution:** Consider passing a prepared child/slot through the layout so intermediate components do not need the invoice. If many distant consumers independently read a shared value, context may be appropriate. Choose based on relationships, not number of prop levels alone.

### 6. Place a provider

Only one feature subtree needs a locale override. Should provider wrap the whole app?

**Solution:** Place it around the smallest feature subtree needing the override, unless a broader app-level locale is truly global. Narrow placement reduces hidden dependency surface and update fan-out.

### 7. Separate UI state and server data

A feature keeps an open menu, unsaved form draft, list of server results, and request cache in one root context.

**Solution:** Keep menu local; form draft with form/feature owner; server results with the router/data cache; pending/error alongside the operation where it is handled. Share only what needs coordination and use a store/data library for concrete cross-route cache requirements.

### 8. Decide whether a reducer/store is needed

A component has three independent booleans, then grows into a multi-step workflow with many legal transitions and shared consumers.

**Solution:** A reducer can model coordinated transitions. If state must be shared across distant areas with selectors/persistence/devtools, evaluate an external store or framework data layer. Do not add global state before a requirement exists.

## Progressive hints

For each value ask who changes it, who reads it, how long it should live, whether it is derived, and whether multiple consumers must coordinate. Then select the narrowest owner/propagation mechanism.

## Complete solutions

Each exercise explains a concrete architecture. Validate the design by tracing one user action from event through owner update to dependent render.

## Tests and edge cases

Test coordinated sibling updates, independent widget isolation, controlled/uncontrolled mode boundaries, provider override, derived selection after list edits, server cache invalidation, state reset/unmount lifetimes, and reducer legal transitions.

## Reflection questions

Can a reviewer identify the single source of truth? Is any state duplicated? Would composition remove intermediate coupling? What is the reset/lifetime boundary? Does context/store solve a real coordination need?
