# Frontend state management Redux Toolkit and MobX comparisons — Reference: Built-in React sharing choices

## Scope and version

This reference covers the supplied built-in React choices and state behavior. It does not replace the detailed Hook reference in t07-005. [React managing state](https://react.dev/learn/managing-state) [Choosing state structure](https://react.dev/learn/choosing-the-state-structure)

## How this group fits the mental model

React gives a local state model and several ways to share it. Choose state placement before adding a third-party store; state should have one owner and derived values should remain derived.

## Supplied names explained

- `useState` holds local state for a component instance and schedules a render when updated. Use it for simple independent values; initializer/update functions should be pure. State is a snapshot for a given render.
- `useReducer` holds state updated through a reducer function and dispatched actions. It suits related transitions that benefit from a centralized state-transition function; it does not itself make state global.
- `Context` passes a value through a subtree without manually threading it through every intermediate component. It is useful for values needed broadly in a subtree; frequent context value changes can rerender consumers, and Context does not provide server-cache invalidation.
- `Props` are explicit inputs passed from a parent to a child. They make ownership and dependencies visible and are often simpler than shared stores for direct relationships.
- `Lifting state up` moves a value to the closest common parent when multiple children must coordinate. The parent becomes the owner and passes values/handlers down.
- `Composition instead of prop drilling` rearranges component boundaries so an owner can pass already-built children/slots rather than forwarding unrelated data through many layers. It can reduce coupling, but does not solve genuinely shared state across distant features.
- `React state snapshot` means each render and its event handlers see the state values for that render. Calling a setter requests a later render; it does not mutate the local variable immediately.
- `Render-time derived value` is calculated from props/current state during render rather than stored separately. It avoids synchronization bugs; memoize only when measurement or referential stability needs justify it.

## Cross-item comparison

`Props` make parent-child data flow explicit; `Lifting state up` centralizes sibling coordination; `Context` shares through a subtree; `Composition` changes component structure to avoid unnecessary forwarding. `useState` and `useReducer` differ mainly in how transition logic is expressed, not in whether state is local or global.

## Examples

```jsx
function FilteredList({ items }) {
  const [filter, setFilter] = useState('all');
  const visible = items.filter(item => filter === 'all' || item.kind === filter);
  return <List items={visible} onFilterChange={setFilter} />;
}
```

`visible` is derived; storing it in state would require synchronizing it whenever `items` or `filter` changes.

## Common mistakes

- Expecting state setters to update the current render's variable.
- Using Context as a universal database/cache.
- Lifting state higher than necessary.
- Duplicating a derived value in state.
- Using a reducer when a simple setter is clearer or using scattered setters when related transitions need one reducer.
- Assuming composition eliminates every need for shared state.

## Knowledge checks with answers

1. Does `useReducer` make state global? No, the Hook's component owns its state.
2. When is Context useful? Sharing a value through a subtree without forwarding props at every layer.
3. Why calculate `visible` during render? It is derived from existing source values.
4. What does a state snapshot mean? A render's handlers see that render's values until a new render occurs.

## Sources

- [React managing state](https://react.dev/learn/managing-state)
- [Choosing state structure](https://react.dev/learn/choosing-the-state-structure)
