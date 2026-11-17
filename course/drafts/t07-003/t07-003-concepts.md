# React elements render purity reconciliation identity and keys — Core concepts and how they fit together

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [Keeping Components Pure](https://react.dev/learn/keeping-components-pure), [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state), and [`StrictMode`](https://react.dev/reference/react/StrictMode).

## Learning objectives

Distinguish elements from DOM nodes; trace render triggers, render, reconciliation, and commit; explain purity and Strict Mode; compare React, DOM, and module trees; and predict state preservation/reset from type, position, and key.

## Prerequisites

Know JavaScript functions/objects/arrays, JSX basics, components and props. Component kinds, event handlers, state APIs, and rendering modes receive deeper treatment in neighboring lessons.

## Core concepts

An element is a description with type, props, children, key, and possibly ref. JSX compiles to element creation; `createElement(type, props, ...children)` is the explicit API. Elements and props are immutable after creation. In React 19, function components receive `ref` as a prop (`element.ref` access is deprecated); `key` remains special metadata and is not a normal child prop. `ReactNode` is a broader set of renderable values: elements, strings, numbers, arrays, portals, and empty nodes such as `null`, `undefined`, booleans. Fragments group children without adding a host wrapper. React 19.3 made explicit Fragment refs stable: a Fragment ref points to a `FragmentInstance` that can focus/observe/measure its child nodes without adding a wrapper.

The initial root render and state updates trigger renders; a parent render generally propagates calculation to descendants unless an optimization boundary applies (covered later). Rendering means calling components to calculate output, not changing the DOM. React reconciles the new description with the previous one, then commits necessary host changes. If the output is unchanged, a re-render can produce no host mutation. The browser DOM update is only the commit outcome, not a count of component function calls.

Render functions should be pure: same props/state/context yield the same result and do not mutate pre-existing data or cause side effects. Local mutation of a newly created object/array is fine because it is not shared prior state. Read props, state, and context; do not mutate them. Event handlers and Effects are separate effect locations. Strict Mode in development may invoke render code an extra time and re-run Effects/ref callbacks to expose impurity or missing cleanup; these checks are not a production render guarantee and should not be “fixed” by suppressing the wrapper.

The render tree models component instances/relationships; the host DOM tree is the actual browser output; the module dependency tree models imports. Reconciliation matches children and determines component/host identity. State is associated with a component's render-tree position and identity, not a variable inside the function. Same type at the same position generally preserves state; removal, type change, or key change resets it. A key is scoped among siblings, helps matching on reorder, and is not passed as a normal prop.

## Mechanisms and relationships

```text
React element descriptions → render tree → reconcile child identities
render calculation (pure/repeatable) → commit host tree mutations (possibly none)
position + type + key → component identity → state preserved or reset
```

## Worked examples

Given `<Counter key={user.id} user={user} />`, changing `user.name` preserves identity if the key/type/position remain stable. Changing `user.id` changes the key and resets the subtree state. In a list, using `key={index}` after deleting the first item can cause the second item's previous component state to be reused for the first position. A stable `key={item.id}` tracks the logical item.

## Misconceptions and edge cases

- Creating JSX does not mutate the DOM.
- A render call does not guarantee a host DOM change.
- State setters queue work; they do not synchronously rewrite the current render's state variable.
- Strict Mode's extra development checks are not production behavior to depend on.
- Keys are not global IDs; they distinguish siblings within a parent.
- A key is not available as `props.key`; pass a separate prop if child code needs the value.
- In React 19, a function component can use its `ref` prop; older guidance that treats refs as never being props is outdated. Avoid introspecting `element.ref`, which is deprecated.
- Fragment shorthand cannot receive a ref. React 19.3 Fragment refs require explicit `<Fragment ref={...}>` and provide a `FragmentInstance`, not a single DOM node.
- Random keys generated during render force remounts and state loss.
- Local mutation of freshly created values is compatible with purity; mutating props/state or shared objects is not.

## Knowledge checks with answers

1. **Element versus DOM node?** An element is a React description; a DOM node is a host object in the browser tree.
2. **Does a rerender imply DOM mutation?** No; reconciliation may find the host output unchanged.
3. **Why does React ask for pure render?** It can repeat or abandon calculations safely.
4. **What makes list state follow the right item?** Stable sibling keys derived from item identity.
5. **What resets component state?** Removal, type change, or a changed key/identity boundary.
6. **What changed for Fragment refs in React 19.3?** An explicit Fragment can receive a ref to a `FragmentInstance` operating across its DOM children without a wrapper.
