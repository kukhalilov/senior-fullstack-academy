# React elements render purity reconciliation identity and keys — Reference: Render purity and development checks

Sources: React 19.3 [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) and [`StrictMode`](https://react.dev/reference/react/StrictMode).

## Scope and version

This reference covers the purity contract and Strict Mode's development checks. Effects, refs, and event handlers are discussed further in t07-006 and t07-004.

## Purity as a render contract

A pure component calculation returns the same output for the same props, state, and context, and does not change values that existed before it ran. Props, state, and context should be treated as read-only. Mutating a shared object or module-level variable during render makes the result depend on call order and can break repeated/concurrent calculations.

Local mutation of a fresh object created during that render is safe: no other code can observe the pre-mutation value, and the calculation still depends only on inputs. For example, create an array with `const rows = [];` and push derived items into it, but do not push into `props.items`. This distinction avoids the inaccurate rule “never mutate anything.”

Side effects belong outside render. An event handler is appropriate for work caused by a particular user action. An Effect synchronizes with an external system after commit when that synchronization is needed. Avoid using Effects simply to derive values that can be calculated during render. A pure render lets React safely repeat, pause, or discard calculations.

## Strict Mode checks

`<StrictMode>` enables extra development-only behavior for its subtree: an extra render to detect impure code, an extra Effect setup/cleanup cycle to reveal missing cleanup, an extra ref-callback cycle, and checks for deprecated APIs. It accepts no props. Checks do not run the same way in production, and exact development logs are not an application contract. If a render is incorrect when invoked twice, fix the mutation/side effect instead of suppressing Strict Mode.

Strict Mode can wrap the whole app or a subtree. A subtree-only boundary may have nuanced behavior because React avoids development sequences that could not occur in production without the parent; the official reference documents these caveats. Test resource setup/cleanup idempotently and ensure subscriptions, timers, and connections are cleaned up.

## Example

```js
function ShoppingList({ products }) {
  const visible = products.filter(product => product.inStock);
  return <ul>{visible.map(product => <li key={product.id}>{product.name}</li>)}</ul>;
}
```

`filter` creates a new array; the component does not mutate the input. By contrast, sorting `products` in place would mutate a pre-existing prop and make render impure. Use `products.toSorted(...)` where supported or copy before sorting.

## Comparison and common mistakes

Pure calculation has no externally visible side effect; local mutation of a newly created container is just a construction detail. Event handlers respond to user actions; Effects synchronize external systems; render describes UI. Common errors include incrementing a module counter during render, mutating props/state, opening a connection in render, assuming Strict Mode duplicates production behavior, and removing Strict Mode to hide a cleanup bug.

## Knowledge checks with answers

1. **Is pushing into a newly allocated local array impure?** No, if it is not shared and depends only on render inputs.
2. **Why does Strict Mode render more than once in development?** To expose code that incorrectly relies on one render execution.
3. **Where does a click-triggered side effect belong?** In the event handler.
4. **Where does ongoing external synchronization belong?** In an Effect with correct cleanup when needed.

## How this group fits the mental model

Purity makes the render phase repeatable; Strict Mode is a development-time probe for violations and cleanup errors.

## Supplied names explained

The exact inventory below covers pure calculation, read-only inputs, safe local construction, side-effect boundaries, and Strict Mode's extra development invocation.

## Cross-item comparison

Render purity is a component contract; Strict Mode is a tool that helps reveal violations; neither guarantees a particular production render count.

## Examples

The list example shows safe derived allocation. Replace any in-place sorting/mutation of props with a copy/new value.

## Exact terms covered

- `Pure component calculation`
- `Same inputs produce the same output`
- `Read-only props during render`
- `Read-only state during render`
- `Read-only context during render`
- `No mutation of pre-existing values during render`
- `Local mutation of newly created values`
- `Side effects outside render`
- `Strict Mode development double invocation`

## Common mistakes

Treating every local mutation as impure; mutating props/state; relying on one render invocation; using Strict Mode as a production render guarantee; and suppressing it instead of fixing missing cleanup.
