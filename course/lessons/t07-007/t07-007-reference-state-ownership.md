# React context composition state ownership and component architecture — Reference: State ownership and sharing

Sources: React 19.3 [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components), [Managing State](https://react.dev/learn/managing-state).

## Scope and version

This reference covers choosing the state owner and controlled/uncontrolled interfaces. Exact state Hook semantics are in t07-005; identity/reset rules are in t07-003.

## Local, shared, and lifted state

Local component state is best when one component owns and uses it. Independent state values in sibling components should remain independent. Shared state is one value that multiple components must coordinate; lift it to the closest common parent, remove competing child copies, then pass value and callbacks down. The parent becomes the single source of truth. State colocation means keeping state close to its consumers to reduce coupling and update fan-out. Lift only as high as coordination requires.

Controlled components receive the value and change callback from a parent, allowing parent synchronization/reset/validation. Uncontrolled components keep important value locally and expose less control. A hybrid may accept an optional controlled value and a default for local use; such APIs must define controlled/uncontrolled mode consistently and avoid switching modes during lifetime. Many controls combine modes: the parent controls selected value while the component owns focus/hover state. React’s controlled/uncontrolled labels describe a useful design spectrum, not an enforced binary; a component can own some values locally while receiving others through props.

Prop drilling means passing data through intermediates that do not use it. It is not inherently wrong; explicit props are often easiest to trace. If many distant components need the same value, context may help; if a wrapper can accept a child element, composition may remove pass-through entirely. Do not lift unrelated state into a global/root owner just to avoid props.

## Example

For a one-open-panel accordion, the parent owns `activePanelId` and passes `isActive={activePanelId === panel.id}` plus `onShow={() => setActivePanelId(panel.id)}`. Panels are controlled. For a standalone disclosure widget, its own `isOpen` can be local/uncontrolled. A hybrid API can accept `open` and `onOpenChange`, or a `defaultOpen` for local mode, but must distinguish absence from explicit false.

## Cross-item comparison

| Pattern | State owner | Coordination |
|---|---|---|
| Local/uncontrolled | Component | Isolated behavior |
| Controlled | Parent | Parent coordinates multiple consumers |
| Hybrid | Parent if controlled, otherwise component | Flexible but more complex contract |
| Lifted shared | Closest common ancestor | One source of truth |

## Common mistakes

Duplicating same value in siblings; lifting to app root unnecessarily; passing setters instead of semantic callbacks where that leaks implementation; switching controlled mode mid-use; and treating every prop pass-through as a reason for context.

## Knowledge checks with answers

1. **Where state siblings coordinate?** Closest common parent.
2. **What makes a component controlled?** Parent supplies authoritative value and change path.
3. **Can uncontrolled component still accept callbacks?** Yes; uncontrolled describes value ownership, not absence of events.
4. **Why keep state local?** Clear ownership and smaller update surface.

## How this group fits the mental model

State ownership determines which component is the source of truth and how updates flow through props/callbacks.

## Supplied names explained

The exact index below includes local/shared/lifted ownership, common parent, controlled/uncontrolled/hybrid, colocation, and prop drilling.

## Examples

The accordion and disclosure examples demonstrate controlled parent ownership and local widget ownership.

## Exact terms covered


### Exact terms covered

- `Local component state`
- `Independent state ownership`
- `Shared state`
- `Lifting state up`
- `Closest common parent`
- `Single source of truth`
- `Controlled component`
- `Uncontrolled component`
- `Controlled and uncontrolled component hybrid`
- `State colocation`
- `Prop drilling`
