# React context composition state ownership and component architecture — Reference: Component boundaries and composition patterns

Sources: React 19.3 [Passing Props](https://react.dev/learn/passing-props-to-a-component), and [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context).

## Scope and version

This reference covers component decomposition and composition contracts. It does not enumerate all component/JSX syntax or every design-system pattern.

## Decomposition and relationships

Component decomposition separates UI into cohesive units with clear inputs/responsibilities. Composition arranges a parent-child component relationship into a render tree. Prefer components whose reusable interface expresses useful behavior/content rather than mirroring every DOM tag. Component extraction helps when it names a concept, creates a reusable contract, or localizes behavior; unnecessary wrapper components add indirection without owning data, semantics, layout, or reuse.

## Content slots

`children` is the common content slot: parent passes nested JSX, wrapper decides where it appears. Named content props such as `header`, `actions`, or `emptyState` express multiple labeled slots. Passing JSX as a prop is useful for configurable regions, but keep slot APIs understandable. A layout wrapper that accepts `children` need not know the content's internal details; this composition can avoid threading every descendant setting through intermediate components.

Component specialization supplies different props/slots to a generic component to create a focused variant (e.g. generic `Button` configured as destructive action). A reusable component interface should expose stable semantic inputs/callbacks and keep implementation details private. Prefer composition to a component with dozens of booleans that create invalid combinations.

## Example

```jsx
function PageShell({ title, actions, children }) {
  return <main>
    <header><h1>{title}</h1>{actions}</header>
    <section>{children}</section>
  </main>;
}

<PageShell title="Invoices" actions={<CreateInvoiceButton />}>
  <InvoiceTable invoices={invoices} />
</PageShell>
```

PageShell owns layout semantics; parent supplies action/content composition. The shell does not need to know table internals.

## Cross-item comparison

| Approach | Strength | Cost |
|---|---|---|
| Explicit props | Visible local dependencies | Can become repetitive through many intermediates |
| `children` slot | Flexible composition | Only one unnamed primary region |
| Named content props | Clear multiple slots | Larger component API |
| Generic booleans | Quick variants | Invalid combinations/complex branching |

## Common mistakes

Extracting a wrapper with no reason; passing many obscure JSX slots; making generic abstractions too early; coupling layout to child internals; and using prop forwarding as an undocumented public interface.

## Knowledge checks with answers

1. **What does a content slot solve?** Lets a parent supply UI while a wrapper controls placement.
2. **When use a named prop instead of children?** Several semantically distinct content regions.
3. **Why avoid unnecessary wrappers?** They add hierarchy without a responsibility/interface benefit.

## How this group fits the mental model

Composition defines where behavior and content boundaries live; slots keep wrappers independent from supplied child details.

## Supplied names explained

The exact inventory below covers decomposition, parent/child composition, children/JSX slots, specialization, reuse, and wrapper restraint.

## Examples

The PageShell example uses one primary child region and a named actions region.

## Exact terms covered


### Exact terms covered

- `Component decomposition`
- `Component composition`
- `Parent-child component relationship`
- `Children as a content slot`
- `Named content props`
- `Passing JSX as a prop`
- `Component specialization`
- `Reusable component interface`
- `Avoiding unnecessary wrapper components`

