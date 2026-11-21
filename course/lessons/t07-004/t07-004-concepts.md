# React function and class components JSX props and events — Core concepts and how they fit together

Sources: React 19.3 [Your First Component](https://react.dev/learn/your-first-component), [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [Conditional Rendering](https://react.dev/learn/conditional-rendering), [Rendering Lists](https://react.dev/learn/rendering-lists), [Responding to Events](https://react.dev/learn/responding-to-events), [`Component`](https://react.dev/reference/react/Component), [Common React DOM components](https://react.dev/reference/react-dom/components/common), and [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).

## Learning objectives

Define/combine function components, read JSX as JavaScript syntax, design props/children contracts, select conditional/list output, attach event callbacks correctly, and distinguish supported class components from recommended function components.

## Prerequisites

Know JavaScript functions, objects, arrays, exports/imports, event callbacks, and React elements/render behavior from t07-003.

## Core concepts

Function components are capitalized JavaScript functions invoked through JSX; composition nests children to form a page. Lowercase JSX names describe host tags. Components can be default or named exports. Extract a component when it creates a reusable or clearer boundary, not merely to minimize line count. Class components extend React's `Component`; `render()` returns nodes, `this.props` contains inputs, and `constructor(props)` calls `super(props)` when a constructor is needed. `static defaultProps` and `static contextType` are class APIs. Classes remain supported; functions are recommended for new components. Lifecycle/error-boundary behavior beyond this basics lesson has its own topic.

JSX is a syntax extension, not HTML. One JSX markup expression cannot contain adjacent top-level tags: wrap siblings in a parent or Fragment. Empty host tags self-close. Use `className` and `htmlFor`; `aria-*` and `data-*` retain their HTML hyphens. A `style` object uses camelCase CSS property names; numeric values normally get `px` except for unitless properties, and CSS classes are usually preferable for static styles. React 19 requires the modern JSX transform for its newer improvements, including ref-as-prop support. Literal strings use quotes; JavaScript expressions use braces. Spread attributes forward object fields in order, so later values override earlier ones. Children may be text, expressions, nested JSX, or comments in JSX's `{/* ... */}` form; HTML comment syntax is invalid in JSX.

Props are a read-only input object. Destructure in the parameter list and use default parameter values for absent/undefined props; `null` does not trigger a JavaScript default. Props can be any JavaScript value: strings, numbers, objects, arrays, functions, and elements. `children` is the conventional slot for nested JSX; named content props create additional slots. Prop forwarding with `{...props}` is convenient but can leak unsupported attributes or override intentional values on host tags; filter/compose explicitly where contracts matter. Props are distinct from component-local state.

Conditional output uses `if`, early/conditional returns, `&&`, and `?:`. JavaScript semantics still apply: `0 && <Badge/>` returns/render `0`. Return `null` for no output. Lists commonly use `Array.map()` to turn data into children, and each sibling needs a stable key (identity details in t07-003). Avoid mutating the input data while rendering.

Event handlers are functions passed as props (`onClick={handleClick}`), inline arrow callbacks, or custom callback props such as `onSave`. Do not call a handler during render (`onClick={handleClick()}`) unless the call intentionally computes a value (usually a mistake). React invokes event handlers with a synthetic event object. `currentTarget` is the element whose handler is executing; `target` may be a nested origin. Events generally bubble through the React tree; `onScroll` is the documented exception. `stopPropagation()` prevents further propagation; `preventDefault()` prevents browser default action. Capture handler names end in `Capture`. Event handlers are ordinary callbacks that can receive custom arguments via closures; no need to bind `this` in function components.

## Mechanisms and relationships

```text
component function/class + props → JSX/React nodes
props.children/named slots → composition content
branch/map → chosen child descriptions + keys
event prop → handler function reference → synthetic event/callback → parent behavior
```

## Worked examples

```jsx
function SearchForm({ initialQuery = '', onSearch, children }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch(initialQuery);
  }
  return <form onSubmit={handleSubmit}>
    <button type="submit">Search</button>
    {children}
  </form>;
}
```

`initialQuery` defaults only when missing/undefined; `onSearch` is a callback prop; nested JSX fills `children`; passing `handleSubmit` preserves the function for React to call later. Real search input state belongs in the state lesson.

## Misconceptions and edge cases

- JSX is not parsed as raw HTML and does not accept every HTML spelling.
- Props are not mutated by the child; pass a callback to request parent behavior.
- `defaultProps` on function components is not the preferred modern defaults pattern; destructuring defaults are clear.
- `&&` with a numeric zero can render zero.
- Inline handlers are valid; performance concerns are often premature and memoization is covered later.
- `preventDefault` and `stopPropagation` solve different problems.
- A callback prop is not automatically an event handler; it is a function contract chosen by the component API.
- Spread forwarding can pass `key`/`ref` or unsupported attributes incorrectly; special props require care.

## Knowledge checks with answers

1. **How is a custom component distinguished in JSX?** Its identifier starts uppercase.
2. **How do expressions enter JSX?** With curly braces.
3. **What does `children` contain?** Nested JSX/node values passed between the component tags.
4. **Difference between handler reference and call?** A reference is invoked after interaction; a call runs immediately during render.
5. **Difference between `preventDefault` and `stopPropagation`?** Prevent browser default versus stop event propagation.
