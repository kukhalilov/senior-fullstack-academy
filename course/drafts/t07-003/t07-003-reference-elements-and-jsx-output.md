# React elements render purity reconciliation identity and keys — Reference: React element descriptions and output values

Sources: React 19.3 [`createElement`](https://react.dev/reference/react/createElement), [React 19 release notes](https://react.dev/blog/2024/12/05/react-19), [React 19.3 release notes](https://react.dev/blog/2026/09/09/react-19-3), and [Fragment reference](https://react.dev/reference/react/Fragment).

## Scope and version

This reference covers React's element/node values and how they become rendered output. JSX syntax transformation details belong in the component/JSX lesson (t07-004); root/rendering modes belong in t07-021.

## Element description

A React element is an immutable object describing a type and its props/children. It is not a DOM node, component instance, or rendered pixels. The type can be a host tag, a component, or a special type such as `Fragment`. Props hold input data; children are passed through the children prop/convention. `key` remains special reconciliation metadata and is not available as `element.props.key`. Since React 19, function components can receive `ref` through their props; class refs still refer to the class instance. React 19 deprecated reading `element.ref`, and the upgrade guide directs users toward `element.props.ref`. The `createElement` reference page still describes the returned element's `ref` separately from `props`, so do not build application logic around inspecting React element internals; use `ref` in the component's props where React 19 supports it. Treat created elements and props as immutable; development may shallow-freeze them to help catch mutation.

`createElement(type, props, ...children)` is the explicit alternative to JSX. `type` must be a valid React element type. `props` may be an object or null (treated like an empty object); extra children arguments populate children and take precedence over a `children` value in props when supplied. Keys are coerced to strings. React recommends treating returned elements as opaque and rendering them rather than inspecting implementation details.

## React nodes and fragments

A React node is a value React can render: an element, string, number, portal, iterable/array of nodes, or an empty value such as `null`, `undefined`, `true`, or `false` (which render nothing). Arrays can contain adjacent nodes; each list child that requires sibling matching needs a key. A `Fragment` groups multiple children without creating a host wrapper. Fragment shorthand is JSX syntax; an explicit `Fragment` can carry a key when mapping groups. In React 19.3, stable Fragment refs let an explicit `<Fragment ref={...}>` receive a `FragmentInstance` without adding a DOM wrapper. The instance offers `addEventListener`, `removeEventListener`, and `dispatchEvent` on first-level DOM children; `focus`, `focusLast`, and `blur` across nested children; `observeUsing`/`unobserveUsing` for IntersectionObserver or ResizeObserver; and `getClientRects`, `getRootNode`, `compareDocumentPosition`, and `scrollIntoView` for inspection/positioning. The `<>...</>` shorthand cannot receive a ref. This API is supported by React DOM and should be verified for the renderer/version in use.

Conditional output is ordinary JavaScript: return a node, choose between nodes, or return an empty value. Be cautious with `&&`: if the left operand is `0`, JavaScript returns `0`, which React renders as text. Use an explicit boolean comparison when zero is a possible value. An element expression can be created repeatedly; React reconciliation, not object identity alone, determines UI identity.

## Example

```js
import { createElement, Fragment } from 'react';

const description = createElement(
  Fragment,
  null,
  createElement('h2', null, 'Profile'),
  createElement('p', null, 'Ready'),
);
```

This creates descriptions but does not display them until returned/rendered through a React root or renderer. The fragment contributes a grouping in the React tree without a wrapper element in the host DOM.

React 19.3 Fragment ref example:

```jsx
import { Fragment, useRef } from 'react';

function Headings({ posts }) {
  const groupRef = useRef(null);
  return (
    <Fragment ref={groupRef}>
      {posts.map(post => <h2 key={post.id}>{post.title}</h2>)}
    </Fragment>
  );
}
```

After commit, `groupRef.current` is a `FragmentInstance` rather than one DOM node. Use its narrow documented methods only when a group-level DOM operation is needed; explicit Fragment syntax is required because shorthand does not accept props.

## Cross-item comparison

| Value | Meaning |
|---|---|
| React element | Immutable description of one typed UI node |
| React node | Any renderable value, including elements, text, arrays, portals, or empty values |
| DOM node | Browser host object created/managed by React DOM |
| `key` | Sibling identity metadata for reconciliation; not passed as a normal prop |
| `ref` | React 19 function-component prop; `element.ref` introspection is deprecated; class refs still refer to instances |
| `Fragment ref` | React 19.3 `FragmentInstance` API over Fragment children, with no DOM wrapper |

## Common mistakes

Mutating an element/props; assuming an element is already mounted; reading `key` inside child props; relying on deprecated `element.ref` access; expecting shorthand Fragment to accept a ref; confusing `ReactNode` with `ReactElement`; expecting boolean values to render text; and allowing `0 && <Thing/>` to display zero.

## Knowledge checks with answers

1. **Does `createElement` update the DOM?** No, it creates a description.
2. **What can a React node be besides an element?** Text, numbers, arrays, portals, and empty values among other supported nodes.
3. **What does Fragment add to DOM?** No wrapper host element. In React 19.3, an explicit Fragment may also receive a ref that resolves to a FragmentInstance.
4. **Why can `0 && <p/>` show `0`?** JavaScript returns the left operand when falsy, and React renders numeric zero.

## How this group fits the mental model

Elements are the values components calculate during render; the renderer later reconciles them into a host tree.

## Supplied names explained

The inventory names the element's type, props, children, key, and ref; distinguishes the broad renderable category `React node` from the narrower `React element`; and lists the explicit `createElement` call and JSX expression. It also names each `FragmentInstance` operation so the API surface is auditable without asking the generator to discover additional methods.

## Examples

Compare `createElement('button', { key: id }, label)` with JSX `<button key={id}>{label}</button>`: both describe a host element; neither directly creates the browser button at that point. For a function component in React 19, pass its ref through the component's `ref` prop; keep element objects opaque instead of inspecting undocumented/internal fields.

## Exact terms covered

- `React element`
- `Element type`
- `Element props`
- `Element children`
- `Element key`
- `Element ref`
- `Element immutability`
- `React node`
- `Fragment`
- `React 19 ref as a function-component prop`
- `React 19.3 Fragment refs`
- `FragmentInstance`
- `FragmentInstance.addEventListener`
- `FragmentInstance.removeEventListener`
- `FragmentInstance.dispatchEvent`
- `FragmentInstance.focus`
- `FragmentInstance.focusLast`
- `FragmentInstance.blur`
- `FragmentInstance.observeUsing`
- `FragmentInstance.unobserveUsing`
- `FragmentInstance.getClientRects`
- `FragmentInstance.getRootNode`
- `FragmentInstance.compareDocumentPosition`
- `FragmentInstance.scrollIntoView`
- `createElement(type, props, ...children)`
- `JSX element expression`

