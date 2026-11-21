# React context composition state ownership and component architecture — Reference: Context placement and alternatives

Sources: React 19.3 [`useContext`](https://react.dev/reference/react/useContext), [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Passing Props](https://react.dev/learn/passing-props-to-a-component), and [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components).

## Scope and version

This reference decides where context belongs relative to props/composition/external stores. Exact context API mechanics are in t07-005; external library APIs are excluded.

## Choose the data-flow mechanism

Props provide explicit data flow from parent to child. Use them for direct relationships or when intermediates legitimately configure content. Composition can eliminate prop drilling: a parent can pass a prepared child element through a wrapper that does not need to understand the child's data. Context is useful for distant descendants that need the same value (theme, locale, current user, feature environment) without every intermediate forwarding it.

Provider placement determines scope. A consumer reads the closest matching provider above it; a provider returned by a component does not affect that same component’s `useContext` call. Without a matching provider, the value is the context’s `createContext` default (an explicit `undefined` provider value does not fall back to the default). Put a provider around the smallest subtree that needs the value, close to its owner.

Consumers subscribe to the context value. React compares old and new provider values with `Object.is`; consumers of that context receive the fresh value even when wrapped in `memo`. A new object/function created for `value` on every parent render therefore changes by identity and can fan out updates. Split unrelated contexts, keep stable values where correct, and measure before optimizing. Context does not replace state ownership: state still lives somewhere, often in the provider-owning component or a reducer. There is no universal update-frequency cutoff where context becomes wrong; use an external store when its subscription/selector capabilities match concrete requirements.

Context versus external state store: context propagates a value through a React subtree and subscribes its consumers. An external store can add a store lifecycle, fine-grained subscriptions/selectors, derived state, devtools/persistence/middleware conventions, or cross-root coordination depending on library. Choose according to measured update needs and required capabilities; context alone is not automatically slow, and an external store alone is not automatically better.

## Decision example

For a page title used by one child, use a prop. For a section wrapper that only lays out prepared content, use `children`. For theme used by dozens of distant controls within a theme boundary, context is reasonable. For normalized entities shared across routes with cache invalidation and selectors, use the routing/server-data cache or a suitable external store rather than one giant context object.

## Cross-item comparison

| Mechanism | Dependency visibility | Best fit |
|---|---|---|
| Props | Explicit at each edge | Direct parent-child data |
| Composition | Parent supplies UI subtree | Wrappers/layouts need flexible content |
| Context | Implicit consumer subscription | Distant subtree-wide value |
| External store | Store API/subscription explicit by library | Broad shared/cached state needs |

## Common mistakes

Creating a provider at app root without need; using context for one immediate child; passing every value through a context to avoid reading props; assuming context is a server cache; and replacing prop drilling with a mutable singleton.

## Knowledge checks with answers

1. **What value does a consumer read?** The closest matching provider above it, or the context default if none exists.
2. **Can a component read a provider that it returns?** No; that provider is below the component’s own read.
3. **How does React detect a changed context value?** It compares old and new values with `Object.is`.
4. **Does `memo` stop a context consumer receiving a changed value?** No.
5. **How can composition avoid drilling?** Pass a prepared child/slot through a wrapper.
6. **When consider an external store?** When its concrete subscription, selector, persistence, or cross-tree capabilities solve measured needs.

## How this group fits the mental model

Context is a propagation/subscription boundary that complements state ownership and component composition.

## Supplied names explained

The inventory below lists distant values, provider placement, nearest-provider/default behavior, subscription/update identity, `memo` interaction, explicit props, composition, and store comparisons.

## Examples

The theme, title, and normalized entity examples show different data-flow choices.

## Exact terms covered

### Exact terms covered

- `Context for distant shared values`
- `Provider placement`
- `Context consumer subscription`
- `Context value update fan-out`
- `Props for explicit data flow`
- `Composition as an alternative to prop drilling`
- `Context versus prop passing`
- `Context versus external state store`
- `Closest matching provider supplies context value`
- `Context default value applies only when no matching provider exists`
- `A component cannot read the provider it returns from its own render`
- `Context value changes compare with Object.is`
- `memo does not block fresh context values for consumers`
