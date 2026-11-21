# React elements render purity reconciliation identity and keys — Interview questions and reasoning

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [Keeping Components Pure](https://react.dev/learn/keeping-components-pure), [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state), [`StrictMode`](https://react.dev/reference/react/StrictMode), [Fragment reference](https://react.dev/reference/react/Fragment), [React 19 release notes](https://react.dev/blog/2024/12/05/react-19), [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), and [React 19.3 release notes](https://react.dev/blog/2026/09/09/react-19-3).

## Core questions

1. What is a React element? How does it differ from a DOM node?
2. What causes a render, and does render mean DOM mutation?
3. Explain the render and commit phases.
4. Why must render be pure?
5. What does Strict Mode do in development?
6. Compare render, host DOM, and module dependency trees.
7. How does React preserve state between renders?
8. How do type, position, and key affect identity?
9. Why are stable list keys important?
10. When is an index key acceptable?
11. Why is a key unavailable as a child prop?
12. How can a key deliberately reset a form/editor?
13. What does React 19.3 Fragment refs add, and what does their ref point to?
14. How should current React lessons distinguish `key`, function-component `ref`, and `element.ref`?
15. Is replacing a child with a Fragment always state-preserving, regardless of nesting depth?

## Concise interview answers

1. An element is an immutable description of a UI node; a DOM node is a browser object.
2. Initial render and updates trigger calculations; parent/consumer updates can also propagate. Rendering can finish without host changes.
3. Render computes the next tree; reconciliation matches it to prior identity; commit applies necessary host changes.
4. React may repeat, pause, or discard work; purity makes those calculations safe and predictable.
5. It adds development-only checks such as extra render, Effect/ref callback cycles, and deprecated API checks.
6. Render tree is component relationships; host tree is actual DOM output; module tree is import dependency.
7. State is associated with a component identity at a position in the render tree.
8. Same type at the same position and same key generally preserves state; removal/type/key change resets it.
9. Stable keys let React match logical siblings across insertion, deletion, and reordering.
10. Only for stable lists where index and entity identity cannot diverge; otherwise use data IDs.
11. Key is reconciliation metadata; pass a separate prop if component code needs that value.
12. Change key based on the entity ID so a new entity mounts a fresh subtree.
13. An explicit `<Fragment ref={...}>` yields a `FragmentInstance` that supports group operations over its DOM children without a wrapper; shorthand fragments cannot take a ref.
14. `key` remains reconciliation metadata not passed as a component prop. Since React 19, function components can receive `ref` as a prop. Direct `element.ref` access is deprecated; class refs still target class instances.
15. No. React preserves state for a narrow set of one-level Fragment/array-to-child transitions; adding or removing nested Fragment layers can reset it. Consult the precise Fragment caveat rather than treating wrappers as universally transparent to identity.

## Deep follow-up answers

### Is all mutation forbidden in render?

No. Mutating a newly created local array/object is safe because it is not pre-existing shared state. Mutating props, state, context, or module-level shared values is not. The rule is about purity and externally observable changes, not syntax-level avoidance of every mutating operation.

### Does Strict Mode double rendering cause a production bug?

The extra invocation is a development check, not a production behavior contract. It reveals a real bug if rendering mutates shared state or performs side effects; production scheduling may also repeat or abandon work for other reasons. Make render pure rather than suppressing the check.

### Are keys a performance optimization only?

No. Keys determine sibling identity and therefore which state/DOM may be preserved. Correctness of stateful lists is the primary concern; avoiding unnecessary remounts is also beneficial.

## Scenario questions

1. **A render counter increases but DOM is unchanged.** Explain render calculation versus commit/no-op host update.
2. **Input value jumps between rows after reorder.** Explain index keys and stable entity keys.
3. **Changing a prop does not reset component state.** State is preserved for same identity; use controlled state or an intentional key boundary depending on desired ownership.
4. **Strict Mode repeats an API call from render.** The request is an impure render side effect; move it into the proper data/Effect/event mechanism and ensure cleanup/cancellation.
5. **A developer expects `props.key`.** Pass the identifier through another explicit prop.
6. **A developer wants to observe several sibling nodes without a wrapper.** In React 19.3 use explicit Fragment refs and a `FragmentInstance` method such as `observeUsing`, checking renderer support and cleanup.
7. **A refactor adds a nested Fragment around a stateful child and resets it.** Check the Fragment nesting depth: only specific one-level transitions preserve state; deeper structural changes can change identity.

## Tradeoffs and alternatives

Use stable keys for entities; use explicit key changes for reset boundaries; use controlled state when parent owns the value rather than relying on remount; and separate host-tree inspection from render/module graph diagnosis.

## Common weak answers

Avoid “React renders only when the DOM changes,” “keys are global IDs,” “render is synchronous and once,” “never mutate anything,” or “Strict Mode is the cause of the bug.”

## Self-check rubric

A strong explanation distinguishes description/calculation/commit, names the tree identity conditions, and ties keys to state correctness. Give one point for each; revisit answers that describe keys only as warnings/performance hints.
