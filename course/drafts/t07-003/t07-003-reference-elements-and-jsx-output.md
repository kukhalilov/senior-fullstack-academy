# React elements render purity reconciliation identity and keys — Reference: React element descriptions and output values

Sources: React 19.3 [`createElement`](https://react.dev/reference/react/createElement), [Render and Commit](https://react.dev/learn/render-and-commit),.

## Scope and version

This reference covers React's element/node values and how they become rendered output. JSX syntax transformation details belong in the component/JSX lesson (t07-004); root/rendering modes belong in t07-021.

## Element description

A React element is an immutable object describing a type and its props/children. It is not a DOM node, component instance, or rendered pixels. The type can be a host tag, a component, or a special type such as `Fragment`. Props hold input data; children are passed through the children prop/convention. `key` and `ref` are special fields with reconciliation/instance-reference semantics; they are not ordinary `element.props.key`/`element.props.ref` in current React element behavior. Treat created elements and props as immutable; development may shallow-freeze them to help catch mutation.

`createElement(type, props, ...children)` is the explicit alternative to JSX. `type` must be a valid React element type. `props` may be an object or null (treated like an empty object); extra children arguments populate children and take precedence over a `children` value in props when supplied. Keys are coerced to strings. React recommends treating returned elements as opaque and rendering them rather than inspecting implementation details.

## React nodes and fragments

A React node is a value React can render: an element, string, number, portal, iterable/array of nodes, or an empty value such as `null`, `undefined`, `true`, or `false` (which render nothing). Arrays can contain adjacent nodes; each list child that requires sibling matching needs a key. A `Fragment` groups multiple children without creating a host wrapper. Fragment shorthand is JSX syntax; an explicit `Fragment` can carry a key when mapping groups.

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

## Cross-item comparison

| Value | Meaning |
|---|---|
| React element | Immutable description of one typed UI node |
| React node | Any renderable value, including elements, text, arrays, portals, or empty values |
| DOM node | Browser host object created/managed by React DOM |
| `key` | Sibling identity metadata for reconciliation |
| `ref` | Special reference mechanism; not an ordinary component prop |

## Common mistakes

Mutating an element/props; assuming an element is already mounted; reading `key` inside child props; confusing `ReactNode` with `ReactElement`; expecting boolean values to render text; and allowing `0 && <Thing/>` to display zero.

## Knowledge checks with answers

1. **Does `createElement` update the DOM?** No, it creates a description.
2. **What can a React node be besides an element?** Text, numbers, arrays, portals, and empty values among other supported nodes.
3. **What does Fragment add to DOM?** No wrapper host element.
4. **Why can `0 && <p/>` show `0`?** JavaScript returns the left operand when falsy, and React renders numeric zero.

## How this group fits the mental model

Elements are the values components calculate during render; the renderer later reconciles them into a host tree.

## Supplied names explained

The exact inventory below covers the element fields, node category, Fragment, explicit creation API, and JSX expression declared for this unit.

## Examples

Compare `createElement('button', { key: id }, label)` with JSX `<button key={id}>{label}</button>`: both describe a host element; neither directly creates the browser button at that point.

## Exact terms covered


### Exact terms covered

- `React element`
- `Element type`
- `Element props`
- `Element children`
- `Element key`
- `Element ref`
- `Element immutability`
- `React node`
- `Fragment`
- `createElement(type, props, ...children)`
- `JSX element expression`

