# React elements render purity reconciliation identity and keys — Interview questions and reasoning

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [Keeping Components Pure](https://react.dev/learn/keeping-components-pure), [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state), and [`StrictMode`](https://react.dev/reference/react/StrictMode).

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

## Tradeoffs and alternatives

Use stable keys for entities; use explicit key changes for reset boundaries; use controlled state when parent owns the value rather than relying on remount; and separate host-tree inspection from render/module graph diagnosis.

## Common weak answers

Avoid “React renders only when the DOM changes,” “keys are global IDs,” “render is synchronous and once,” “never mutate anything,” or “Strict Mode is the cause of the bug.”

## Self-check rubric

A strong explanation distinguishes description/calculation/commit, names the tree identity conditions, and ties keys to state correctness. Give one point for each; revisit answers that describe keys only as warnings/performance hints.
