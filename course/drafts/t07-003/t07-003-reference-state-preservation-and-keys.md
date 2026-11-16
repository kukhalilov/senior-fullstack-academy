# React elements render purity reconciliation identity and keys — Reference: State identity, preservation, reset, and list keys

Sources: React 19.3 [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

## Scope and version

This reference covers identity-based state preservation and sibling keys. State APIs are introduced in t07-005; this lesson explains how tree identity affects their storage.

## State belongs to a render-tree identity

React associates state with a component identity at a position in the render tree. If a component remains at the same position with the same type and compatible key, React preserves its state across renders. State is not stored in the JSX variable or the function's local variables; each rendered instance has isolated state.

If a component is removed, its state is discarded. If another component type occupies that position, React destroys the old subtree and creates the new one. A changed key deliberately creates a new identity, resetting state even if type/position stay the same. A key can therefore act as a reset boundary for forms/editors when switching entities. Avoid changing a key accidentally on every render.

## Keys identify siblings

Keys let React match a child to its previous identity among siblings when children are inserted, deleted, or reordered. Stable data-derived keys (for example `item.id`) preserve the correct item's local state. Index keys are only safe when list order and membership are static and items have no stateful identity; insertion/deletion/reorder can attach state to a different logical item. Random keys generated during render force remounting, losing state and causing unnecessary DOM work.

Keys are scoped to one sibling set, not globally unique. Duplicate sibling keys make matching ambiguous and lead to warnings/incorrect reuse. A key is special metadata and is not passed as `props.key`; if child logic needs the ID, pass it separately (`itemId={item.id}`). A keyed Fragment can give a group identity; shorthand fragments cannot receive a key.

## Example: reorder and reset

```jsx
{tasks.map(task => <TodoRow key={task.id} task={task} />)}
```

If a task is moved, React can match its `TodoRow` by stable key and preserve the row's state. Replacing the key with array index associates state with positions, potentially showing one task's edit state on another. To reset an editor when `documentId` changes, use a deliberate key such as `<Editor key={documentId} documentId={documentId} />`.

## How this group fits the mental model

Keys and type refine a child's identity within the render tree; identity determines whether state continues or is recreated.

## Cross-item comparison

Stable keys preserve logical sibling identity across reordering. Index keys encode position, not entity identity. Random keys encode no stable identity at all. Changing a key intentionally resets component state.

## Common mistakes

Using an array index for reorderable stateful lists; calling `Math.random()` for keys; assuming keys are globally unique; expecting a key value in child props; changing keys to silence warnings; and expecting state to survive component removal/type changes.

## Knowledge checks with answers

1. **What scopes a key?** Siblings under the same parent.
2. **Why does a random key reset state?** Every render produces a new child identity.
3. **Does `key` become a normal prop?** No; pass the value separately if needed.
4. **When can a key intentionally reset a subtree?** When the conceptual entity changes, such as switching the edited document.

## Supplied names explained

The exact inventory below includes state-position rules, preservation/reset causes, explicit identity boundaries, and list-key practices.

## Examples

See the `TodoRow` and `Editor` examples above for preservation during reorder and intentional reset on entity change.

## Exact terms covered


### Exact terms covered

- `State associated with render-tree position`
- `State preservation at the same position`
- `State reset when a component is removed`
- `State reset when component type changes`
- `State reset when key changes`
- `Explicit key as identity boundary`
- `Sibling keys`
- `Stable data-derived keys`
- `Index keys`
- `Random keys generated during render`
- `Keys are scoped to siblings`
- `Key is not passed as a component prop`

