# React context composition state ownership and component architecture — Reference: Designing maintainable state structures

Sources: React 19.3 [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), and [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer).

## Scope and version

This reference concerns application state shape and transitions, not storage schemas or the useState/useReducer method inventory.

## Shape principles

Group related state that always changes together. Avoid contradictory state (e.g. `isSending` and `isSent` both true), redundant state that can be calculated from other values, duplicate entity data in multiple locations, and deep nesting that makes immutable updates error-prone. Store canonical item data once; store an identifier such as `selectedId` rather than a copied selected object that can become stale. A selected value can be looked up/derived during rendering.

Derive values during rendering when they are pure functions of props/state (`visibleItems`, `fullName`, totals). Do not add an Effect to synchronize a duplicate derived state; it adds a render and consistency problem. Memoization is a separate performance optimization when measured computation cost justifies it.

State transition modeling describes valid next states and events. A reducer can centralize coordinated transitions and make impossible combinations less likely. Use a discriminated status (`idle | submitting | success | error`) rather than several booleans that can conflict. Keep server data canonical and distinguish UI selections/drafts from server cache data.

## Example

Instead of storing `{items, selectedItemCopy, selectedIndex, filteredItems}`, store `{itemsById, itemIds, selectedId, query}`. Derive selected item and visible IDs from canonical values. If data is normalized, update one entity location and keep references consistent. The right shape depends on update patterns; do not normalize tiny local state mechanically.

## Cross-item comparison

| Risky state | Better representation |
|---|---|
| `isLoading`, `isSuccess`, `hasError` booleans | One status enum/state machine |
| Full selected entity copy + canonical collection | Selected ID + canonical collection |
| Stored filtered list | Derived filtered list |
| Deep mutable tree | Flat/normalized structure when update patterns warrant |

## Common mistakes

Storing values that can be derived; duplicating server/UI records; representing mutually exclusive states as independent booleans; over-normalizing tiny local state; and using a reducer to hide unclear data ownership.

## Knowledge checks with answers

1. **Why avoid contradictory state?** It admits combinations the UI should never display.
2. **Why store selected ID?** Canonical record remains in one place and cannot drift from a copied object.
3. **Where calculate filtered data?** During render, optionally memoized if performance warrants.
4. **When reducer?** Coordinated transitions whose validity benefits from centralized modeling.

## How this group fits the mental model

State shape determines which UI states are representable and how updates preserve a single source of truth.

## Supplied names explained

The exact inventory below lists grouping, consistency hazards, canonical storage, derived values, and transition modeling.

## Examples

The normalized item example stores canonical records once and derives selected/filtered views.

## Exact terms covered


### Exact terms covered

- `Group related state`
- `Avoid contradictory state`
- `Avoid redundant state`
- `Avoid duplicated state`
- `Avoid deeply nested state`
- `Store canonical item data once`
- `Store an identifier instead of a selected object copy`
- `Derive values during rendering`
- `State transition modeling`
- `Reducer for coordinated transitions`
