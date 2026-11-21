# React function and class components JSX props and events — Reference: Function components and composition

Sources: React 19.3 [Your First Component](https://react.dev/learn/your-first-component) and [Passing Props](https://react.dev/learn/passing-props-to-a-component).

## Scope and version

This reference covers function components and composition. JSX syntax and props details are in sibling references; state and render purity are covered in t07-005 and t07-003.

## Definition and invocation

A function component is a JavaScript function whose name starts uppercase and which returns React nodes. React calls it through an element expression such as `<Profile />`; component invocation as JSX creates an element description and lets React control invocation. Calling `Profile()` manually bypasses normal component boundaries and is usually incorrect, especially for Hooks (covered elsewhere). Capitalized component identifiers distinguish custom components from lowercase host-tag identifiers such as `button` or `section`.

Composition nests components: a parent returns child component elements, and children render their own output. A `PageLayout` can compose `Header`, `Sidebar`, and `Content`; small components can be extracted to share UI or clarify responsibilities. A component may be nested as a child of another, but define component functions at module scope in most cases: defining a component inside another component creates a new component type each render and can reset state.

Modules can export one default component or multiple named components. Use a default export when a file's primary public component is clear; use named exports for multiple utilities/components and explicit import names. Export style is a module-system choice, not a React rendering behavior.

## Example

```jsx
function PageLayout({ children }) {
  return <main className="page"><Header />{children}</main>;
}

export default function ProductPage() {
  return <PageLayout><ProductDetails /></PageLayout>;
}
```

The parent composes children without manually calling the component functions. The `children` content is supplied as JSX and rendered inside the layout.

## Comparisons and mistakes

| Form | Meaning |
|---|---|
| `<Profile />` | React element describing a component instance |
| `Profile()` | Ordinary direct JS call; generally bypasses React's component model |
| `<button>` | Host tag because identifier is lowercase |
| `<Button>` | Custom component because identifier is capitalized |

Avoid lowercase custom component names, manually invoking components, defining stateful component types inside render, and extracting components solely to make files shorter without a useful boundary.

## Knowledge checks with answers

1. **Why capitalize component names?** JSX uses capitalization to distinguish custom components from host tags.
2. **Who invokes a component element?** React during rendering.
3. **When should a component be extracted?** For reuse or a clearer responsibility/interface boundary.
4. **Does default versus named export alter React identity?** No; it is JavaScript module organization.

## How this group fits the mental model

Components are reusable render-tree nodes that compose element descriptions from props and child nodes.

## Supplied names explained

The inventory below covers component definition/invocation, naming, parent/child composition, extraction, and module export forms.

## Examples

The layout example demonstrates a parent/child hierarchy and composition through `children`.

## Common mistakes

Directly calling component functions can break Hook rules and React scheduling; use JSX or `createElement` to express elements.

## Exact terms covered

### Exact terms covered

- `Function component`
- `Component definition`
- `Component invocation as JSX`
- `Capitalized component identifiers`
- `Lowercase host-tag identifiers`
- `Component composition`
- `Parent component`
- `Child component`
- `Nested components`
- `Component extraction`
- `Default export`
- `Named export`

## Cross-item comparison

A parent composes children with JSX; direct JS calls bypass React-managed component invocation.
