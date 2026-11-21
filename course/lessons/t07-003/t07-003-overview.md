# React elements render purity reconciliation identity and keys — Big-picture orientation and mental model

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [Keeping Components Pure](https://react.dev/learn/keeping-components-pure), [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state), and [`createElement`](https://react.dev/reference/react/createElement).

## Problem and purpose

React's UI model is easier to reason about once you distinguish the descriptions your code creates from the screen React updates. Rendering is a calculation; commit is the renderer applying necessary host changes. Component identity and keys determine whether state follows a component through updates or is reset. Current version notes also matter: React 19 passes refs to function components as props, and React 19.3 stabilizes Fragment refs for working with sibling DOM nodes without a wrapper.

## Plain-language mental model

A React element is an immutable instruction-like description: “render this type with these props and children.” It is not a DOM element and creating it does not display anything. React calls components to calculate a tree, compares that result with the previous tree, and commits the required changes. The render can run without changing the DOM.

## How the parts fit together

```text
initial root render or state update → component render calculations
   → next render tree → reconciliation/matching → commit host changes (if needed)
```

The render tree describes component relationships. The host DOM tree contains browser nodes, often with different shape because components disappear into output and fragments add no host wrapper. The module dependency tree describes imports and is a separate graph. State belongs to an identity at a position in the render tree; type and key influence whether React treats a new description as the same component.

## Concept map

JSX and `createElement` create elements. A parent render may call child components again, but that does not imply a DOM mutation. React's render phase must be pure because work can be repeated or abandoned. The commit phase applies changes and is where the host renderer updates nodes. Keys help React match sibling elements across list changes; the key is special reconciliation metadata and is not passed as an ordinary component prop. React 19 function components may receive `ref` as a prop; React 19.3 explicit Fragment refs provide a `FragmentInstance` that can work across a group of DOM children.

## End-to-end walkthrough

On the initial render React calculates the tree and commits it. A state update queues another render. Components calculate a new tree from current props/state/context. React reconciles children by type, position, and keys; unchanged host output can yield a no-op commit. If a keyed child moves, a stable data key helps React preserve its identity/state with the correct item. If its key or type changes, React treats it as a different identity and resets state.

## When to use it and tradeoffs

Use stable data-derived keys for lists whose items may be inserted, removed, or reordered. Use a deliberate key change to reset a subtree's state when a conceptual entity changes. Avoid random keys and array indexes when item identity can move. Keep render calculations pure; perform side effects in event handlers or Effects as appropriate. Strict Mode adds development-only checks to reveal impurities and missing cleanup.

## What later lessons cover

The reference chapters explain element values, React 19 ref semantics and React 19.3 Fragment refs, render triggers and phases, purity/Strict Mode, UI trees/reconciliation, and state preservation/keys. Practice and interview lessons analyze render logs, state movement, ref version changes, and deliberate reset behavior.
