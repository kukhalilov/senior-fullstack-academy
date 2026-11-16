# React context composition state ownership and component architecture — Big-picture orientation and mental model

Sources: React 19.3 [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure), [Managing State](https://react.dev/learn/managing-state), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Problem and purpose

Component architecture is largely the work of deciding where data lives, who can change it, and how other components receive it. Sound choices keep interfaces explicit, updates coordinated, and state free of conflicting copies.

## Plain-language mental model

Keep state at the lowest component that needs to coordinate its consumers. If two siblings must stay synchronized, lift the shared value to their closest common parent and pass it down with callbacks. Use context when distant descendants need a shared value and explicit props would create tedious pass-through. Use composition to let wrappers receive content without knowing its details.

## How the parts fit together

```text
UI components → local state where used
shared interaction → closest common parent owns one source of truth
deep shared read → context provider → subscribed consumers
wrapper/layout → children or named JSX slots supplied by parent
```

State shape matters: group values that change together; avoid contradictions, redundant/duplicated copies, and unnecessarily deep nesting. Store canonical item data once and selected IDs rather than copied objects. Derive display values during render. Use a reducer when coordinated transitions become complex; introduce an external store/library only when actual sharing/coordination needs justify its conventions.

## Concept map

Controlled components receive important values and callbacks from a parent. Uncontrolled components own local state. Hybrids can let a caller control a value while providing a local default. Props expose direct data flow; context removes intermediate pass-through but broadens consumer update fan-out and hides dependencies. External stores add explicit subscription/derivation patterns and should solve a concrete scale/coordination problem.

## End-to-end walkthrough

An accordion with independent panels can keep each open flag local. If only one panel may be open, the common parent owns `activePanelId` and passes controlled values/onChange callbacks to each panel. If distant components need the current theme, context can provide it. A layout wrapper can accept `children` and never know whether the content is a form or chart. The canonical list remains in one state location; selected item is an ID; filtered/sorted views are derived.

## When to use it and tradeoffs

Choose local state first; lift only when components coordinate; context for distant subtree values; composition when wrappers need flexible content; reducers for complex transitions; external stores for explicit shared subscriptions beyond a convenient subtree. Avoid premature global state: it raises coupling, update fan-out, and debugging effort.

## What later lessons cover

References explain composition, ownership, state shape, context placement, and architecture decisions. Exercises apply those choices to forms, accordions, selections, server data, and component boundaries.
