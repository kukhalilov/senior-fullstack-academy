# React performance transitions deferred values profiling and compiler — Reference: Manual memoization APIs and constraints

Sources: React 19.3 [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), and [`useCallback`](https://react.dev/reference/react/useCallback).

## Scope and version

Manual memoization asks React to reuse work when inputs compare equal. It is a performance optimization: application behavior must remain correct if a cache is recomputed or discarded. Use it after identifying repeated expensive work or a meaningful identity-sensitive boundary.

## How this group fits the mental model

These APIs reduce repeated React-side work when stable inputs permit reuse. They do not replace correct data flow, algorithmic improvements, or measurement.

## Supplied names explained

### `memo(Component, arePropsEqual?)`

Wrap a component to let React skip rendering when props are unchanged. The optional comparator receives previous and next props; returning `true` asserts they produce equivalent output and behavior. By default each prop is compared with `Object.is`. State and context changes still cause updates. A memoized component may still render for other React reasons, and memoization is not a guarantee.

### `arePropsEqual(previousProps, nextProps)`

Custom comparison callback for `memo`. It must return true only when every prop is equivalent for rendering and behavior. In particular, functions must be compared: a changed callback may close over different parent state. Deep comparisons can be slower than rendering and can become unexpectedly expensive as data grows. Prefer default comparison unless a measured case justifies a correct, bounded comparator.

### `useMemo(calculateValue, dependencies)`

Cache a calculation result between renders while dependencies remain unchanged. The calculation should be pure. React compares dependencies using `Object.is`; list length/order must stay constant. Include every reactive value read by the calculation. Development Strict Mode may call calculations more than once to expose impurity. Do not use this as persistent state or for required side effects.

### `useCallback(fn, dependencies)`

Cache a function identity until dependencies change. This is useful when a stable callback lets a memoized child skip work or when an API requires stable identity. Include all reactive values captured by `fn`. It is equivalent in intent to `useMemo(() => fn, dependencies)`, but clearer for functions.

### Dependency list comparison with `Object.is`

React compares each dependency position with `Object.is`. `NaN` compares equal to itself; `-0` and `+0` differ. Objects and functions compare by identity. Recreating an object in the component body makes it a new dependency every render; move creation into the calculation or stabilize the true inputs when measurement supports it. Never omit reactive reads just to force a cache.

### Memoization is a performance optimization, not a guarantee

The program must produce correct output without relying on a specific cache lifetime. React may discard cached values, including in cases such as development edits or initial suspension, and future features may use caches for other purposes. Store durable or semantically meaningful state in state, a ref, or an external data owner as appropriate.

### Custom comparator correctness

Comparators need to include all props and behavior-affecting values. A comparator that ignores a callback can make a child retain a callback with a stale closure. Test representative prop changes and benchmark comparison cost. Returning true means React may reuse the previous rendered result.

### New object identity breaks shallow prop equality

`<Child options={{ mode: 'compact' }} />` creates a new object each parent render, so the default shallow comparison sees changed props. Consider passing primitive fields, creating the object inside the child, or memoizing it only if measurement demonstrates benefit. A new function prop has the same identity issue.

### Memoization cache may be discarded by React

Treat caches as optional acceleration. Correctness must not depend on object identity remaining stable forever, a calculation executing exactly once, or a memoized component never rendering. React Compiler and future React behavior may alter optimization boundaries.

### Avoid memoization without measured benefit

Measure the interaction first. A cache adds dependency reasoning, comparator work, and maintenance. Cheap components may cost less than the cache; unstable dependencies may prevent reuse; broad deep comparisons may create worse pauses. Optimize algorithms and data flow before adding cache layers.

## Cross-item comparison

| API | What may be reused | Typical reason | Common cost |
|---|---|---|---|
| `memo` | Component rendering result | Stable props allow expensive child work to be skipped | Comparison and boundary complexity |
| `useMemo` | Calculated value | Calculation is costly and dependencies are stable | Cache/dependency maintenance |
| `useCallback` | Function identity | Stable callback matters to a consumer | Captured dependency reasoning |

## Examples

```jsx
const Chart = memo(function Chart({ points, onSelect }) {
  return <ExpensiveChart points={points} onSelect={onSelect} />;
});

function Dashboard({ rawPoints }) {
  const points = useMemo(() => normalize(rawPoints), [rawPoints]);
  const onSelect = useCallback(id => openRecord(id), []);
  return <Chart points={points} onSelect={onSelect} />;
}
```

This only helps if `normalize` or `Chart` is measurably costly and `rawPoints` is stable. If `rawPoints` is reconstructed every render, its identity defeats the cache. If `openRecord` depends on reactive values, those values belong in the callback dependency list.

## Common mistakes

- Using a memoized value to hold data that must persist as part of program semantics.
- Adding `[]` while a callback reads changing props or state.
- Omitting function props from a custom comparator.
- Assuming `memo` prevents updates from context or local state.
- Optimizing render counts without checking user-visible latency.
- Performing side effects inside `useMemo` calculations.

## Knowledge checks with answers

1. **How are dependencies compared?** Position by position with `Object.is`.
2. **When is a custom comparator safe?** When it correctly checks every behavior-relevant prop and its cost is measured.
3. **Can memoization carry correctness?** No; caches are optimization details.
4. **Why can an inline object defeat `memo`?** Its identity changes on each parent render.

### Exact terms covered

- `memo(Component, arePropsEqual?)`
- `arePropsEqual(previousProps, nextProps)`
- `useMemo(calculateValue, dependencies)`
- `useCallback(fn, dependencies)`
- `Dependency list comparison with Object.is`
- `Memoization is a performance optimization, not a guarantee`
- `Custom comparator correctness`
- `New object identity breaks shallow prop equality`
- `Memoization cache may be discarded by React`
- `Avoid memoization without measured benefit`
