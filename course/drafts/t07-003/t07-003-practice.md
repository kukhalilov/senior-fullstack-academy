# React elements render purity reconciliation identity and keys — Exercises and worked solutions

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [Keeping Components Pure](https://react.dev/learn/keeping-components-pure), and [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

## Goals

Predict renders versus DOM commits, preserve pure calculations, distinguish tree types, and choose keys that match logical identity.

## Worked example

An editable list uses `key={index}`. After deleting row zero, the text typed in the next row appears under the wrong item. The index still identifies the same position, but not the same entity. Replace it with a stable data ID and verify insert/delete/reorder behavior.

## Exercises

### 1. Does rendering imply DOM mutation?

`Parent` renders, its child returns the same `<span>Ready</span>` output, and no host property changes. Did React render? Did the DOM necessarily mutate?

**Solution:** The component may have been called and reconciled. The unchanged host output can result in no DOM mutation. Do not equate function invocation with commit changes or browser paint.

### 2. Find the impurity

```js
function List({ items }) {
  items.sort();
  return items.map(item => <li key={item.id}>{item.name}</li>);
}
```

**Solution:** `sort()` mutates the pre-existing prop array during render. Copy first (`const sorted = [...items].sort(...)`) or use `toSorted` where supported. Local mutation of a new array would be safe.

### 3. Compare three trees

`Shop` renders `ProductList`, which imports `formatPrice` and produces `ul/li` DOM. Identify each relationship.

**Solution:** `Shop → ProductList` is render-tree composition. `ul/li` is host DOM output. `ProductList` importing `formatPrice` belongs to the module dependency tree. The formatter is not a visual child.

### 4. Diagnose state moving to the wrong row

Rows are keyed by index and can reorder. Why does a row's open/closed state appear on another item?

**Solution:** The key encodes list position; reconciliation matches the position to the prior component identity. Use a stable item ID as key so state follows the logical item. Test a reorder and insertion at the beginning.

### 5. Reset a form on entity change

An editor should preserve local draft while props update for the same document, but reset when the selected document changes.

**Solution:** Keep the component type/position/key stable for the same document. Set `key={document.id}` at the editor boundary so a new document creates a new identity and resets subtree state. Ensure the key is stable for each document, not random.

### 6. Strict Mode logs twice

An engineer increments a module-level counter in the component body and sees it increment twice in development. What should change?

**Solution:** The module mutation is an impure render side effect. Remove it or move event-driven behavior to an event handler and external synchronization to a correctly cleaned-up Effect. Strict Mode's extra development render reveals the bug; do not depend on a single render count.

### 7. Key is missing from props

`function Row(props) { console.log(props.key); }` logs undefined despite `<Row key={id}/>`.

**Solution:** `key` is special React metadata, not a normal prop. Pass `rowId={id}` separately if the component needs it.

### 8. Conditional displays a zero

`{unreadCount && <Badge/>}` displays `0` when there are no unread items.

**Solution:** JavaScript's `&&` returns the left falsy operand; React renders numeric zero. Write `{unreadCount > 0 && <Badge/>}` or a ternary returning `null`.

## Progressive hints

For each case ask: is the issue element creation, render calculation, reconciliation, commit, or identity? Is a value pre-existing/shared? Does the key represent the entity or current position?

## Complete solutions

Each exercise includes the diagnosis and correction. Confirm behavior by changing inputs, reordering lists, and testing in Strict Mode and a production build where relevant.

## Tests and edge cases

Test stateful list reorder/insert/delete, changed key and type, conditional removal/remount, duplicate keys, no-op host output, input immutability, Strict Mode Effects/ref cleanup, and numeric conditional rendering.

## Reflection questions

Which data identity does each key encode? Is render deterministic for its inputs? Which tree are you debugging? Does a visible DOM change actually occur, or only a component render?
