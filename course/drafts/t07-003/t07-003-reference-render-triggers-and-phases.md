# React elements render purity reconciliation identity and keys — Reference: Render triggers and the render-commit sequence

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit).

## Scope and version

This reference explains common render triggers and conceptual render/commit phases. Scheduling details are intentionally not presented as a fixed synchronous contract; React may batch, pause, repeat, or abandon work depending on renderer/features.

## Triggers

The initial render is initiated by the root/renderer. Later, a state update queues render work for the component and normally its descendants; parent renders also normally cause descendant calculations. Context updates and external-store subscriptions can also cause affected consumers to render (covered with their APIs elsewhere). A render is a calculation pass, not a direct DOM command. Memoization may skip some component calculations, but it does not change the meaning of render versus commit.

## Render and commit

During the render phase React calls components and computes a next render tree. This work should be pure and may be repeated or abandoned. Reconciliation compares the new output with prior child structure and identity. During commit, the host renderer applies the required changes: inserting/updating/removing DOM nodes, updating refs, and running commit-related lifecycle work as appropriate. If output does not require host changes, React can complete with no DOM mutation. A render can still have other framework work; “no-op commit” here means unchanged host output, not a promise about every internal effect.

Do not infer exact render counts from production behavior. Strict Mode intentionally adds development checks. Batching can combine multiple updates; a child may render because its parent rendered even if its own props are equivalent. Later memoization topics explain when rendering can be skipped. A component function being invoked is not evidence that the user saw a change.

## Example and comparison

If a counter updates from 1 to 2, React renders a new element description and commits the text update. If a component updates internal bookkeeping but returns the same host output, the component may have rendered while DOM remained unchanged. Render phase calculates; commit phase mutates host output.

## How this group fits the mental model

This group describes what causes React to calculate a new tree and when the renderer applies its differences to the host environment.

## Cross-item comparison

| Term | What it answers |
|---|---|
| Initial render | How the first tree is requested |
| Update render | Why React calculates a later tree |
| Render phase | What UI description should exist |
| Commit phase | Which host updates must be applied |
| No-op commit | Why render can finish without a DOM mutation |

## Examples

See the counter scenario above. Use React DevTools Profiler to inspect commits when investigating performance; do not treat console logging inside render as a precise production update counter.

## Common mistakes

Assuming render means paint; assuming every component call mutates DOM; assuming an update setter immediately changes the current function's state snapshot; and depending on a fixed number/order of render calls.

## Knowledge checks with answers

1. **What are two basic triggers?** Initial render and state updates (with other subscriptions/context triggers in their respective models).
2. **Can render work be repeated?** Yes, so render must be pure.
3. **What does commit do?** Applies necessary changes to the host tree.
4. **Does unchanged output mean no render happened?** No.

## Supplied names explained

The exact inventory below lists the render triggers/phases and host-update outcomes covered here.

## Exact terms covered

### Exact terms covered

- `Initial render`
- `Update render`
- `State update render trigger`
- `Parent render propagation`
- `Render phase`
- `Commit phase`
- `Host tree update`
- `No-op commit when output is unchanged`
- `Re-render does not imply DOM mutation`
