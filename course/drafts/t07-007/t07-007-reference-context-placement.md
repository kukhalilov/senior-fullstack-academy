# React context composition state ownership and component architecture — Reference: Context placement and alternatives

Sources: React 19.3 [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Passing Props](https://react.dev/learn/passing-props-to-a-component), and [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components).

## Scope and version

This reference decides where context belongs relative to props/composition/external stores. Exact context API mechanics are in t07-005; external library APIs are excluded.

## Choose the data-flow mechanism

Props provide explicit data flow from parent to child. Use them for direct relationships or when intermediates legitimately configure content. Composition can eliminate prop drilling: a parent can pass a prepared child element through a wrapper that does not need to understand the child's data. Context is useful for distant descendants that need the same value (theme, locale, current user, feature environment) without every intermediate forwarding it.

Provider placement determines scope. Put a provider around the smallest subtree that needs the value, close to its owner. Broad root providers can hide dependencies and enlarge the set of consumers affected by value changes. Context consumer subscription means consumers update when their provider value changes; separate unrelated contexts or values by update frequency to control fan-out. Context does not replace state ownership: state still lives somewhere, often in the provider-owning component or a reducer.

Context versus external state store: context propagates a value through a React subtree and works well for low/medium-frequency shared values. An external store adds a store lifecycle, subscriptions/selectors, derived state, devtools/persistence/middleware conventions, or cross-root coordination depending on library. Choose one when actual requirements justify it; context alone is not automatically slow, and external store alone is not automatically better.

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

1. **What does provider placement control?** Which subtree can read/subscribe to the value.
2. **How can composition avoid drilling?** Pass a prepared child/slot through a wrapper.
3. **When external store?** When real store-level subscription, selectors, persistence, cross-tree coordination, or tooling needs exceed context.

## How this group fits the mental model

Context is a propagation/subscription boundary that complements state ownership and component composition.

## Supplied names explained

The inventory below lists distant values, provider placement, subscriptions/fan-out, explicit props, composition, and store comparisons.

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
