# React function and class components JSX props and events — Reference: Choosing and mapping rendered output

Sources: React 19.3 [Conditional Rendering](https://react.dev/learn/conditional-rendering), [Rendering Lists](https://react.dev/learn/rendering-lists),.

## Scope and version

This chapter covers JavaScript-driven output selection. Reconciliation identity/key behavior is explained in detail in t07-003.

## Conditional rendering

Components use ordinary JavaScript control flow to choose nodes. An `if` can assign a variable or return early; a conditional return can choose a whole tree; `condition && <Node/>` conditionally evaluates the right side; `condition ? <A/> : <B/>` chooses between branches; return `null` when there should be no output. Expressions must evaluate to React nodes/values.

JavaScript operators retain their semantics. `&&` returns an operand, not a forced boolean. If `count` is 0, `{count && <Badge/>}` evaluates to 0 and React displays it; write `{count > 0 && ...}`. `false`, `true`, `null`, and `undefined` render no visible child, whereas numbers/strings render text. Keep branch expressions readable; extract a component or use early returns for complex conditions.

## List rendering

`Array.map()` transforms data to element descriptions. Each item rendered among siblings needs a stable key so React can match it across updates. Keys should come from data identity; index is only appropriate when order/membership are static; random render-time keys remount every item. Do not mutate the source list during render. Empty arrays render no children; filtering/sorting can be composed before mapping, but preserve stable IDs.

## Example

```jsx
function Notifications({ messages }) {
  if (messages.length === 0) return <p>No notifications</p>;
  return <ul>{messages.map(message =>
    <li key={message.id}>{message.text}</li>)}</ul>;
}
```

This uses an early conditional return and maps each item with stable identity. If the desired empty state is no output, return `null`; if a textual empty state helps users, render one explicitly.

## Comparison and common mistakes

Use `if`/early return for whole-subtree decisions, `&&` for a simple one-sided condition, and `?:` when both alternatives matter. Avoid nested ternaries that hide logic, the zero-`&&` trap, missing/unstable keys, array mutation, and using list index when children have state and can reorder.

## Knowledge checks with answers

1. **How render nothing?** Return `null` or another empty React node.
2. **Why can zero appear in `&&`?** The operator returns zero, which React renders as text.
3. **How generate list children?** Map data to nodes and provide stable sibling keys.
4. **What does an empty map render?** No child nodes.

## How this group fits the mental model

Ordinary JavaScript selects the element descriptions that a component returns during rendering.

## Supplied names explained

The exact inventory below lists each control-flow form, empty output convention, and array mapping/key concept declared for this group.

## Cross-item comparison

`if` is a statement outside JSX; `&&`/`?:` are expressions inside JSX; `map` transforms collections; keys supply sibling identity rather than changing rendered content.

## Examples

The notification example shows an early return followed by list mapping.

## Exact terms covered

### Exact terms covered

- `Conditional rendering with if`
- `Conditional rendering with conditional return`
- `Conditional rendering with &&`
- `Conditional rendering with ?: `
- `Returning null`
- `Array.map() for list rendering`
- `Keys on mapped elements`

## Common mistakes

Confusing falsy values with a forced boolean, rendering zero unintentionally, using unstable keys, mutating source data, and embedding complex nested branches that obscure the intended UI.
