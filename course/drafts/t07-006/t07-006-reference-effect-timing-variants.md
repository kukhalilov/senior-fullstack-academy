# React effects refs imperative handles and external systems — Reference: Effect timing variants

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), and [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect).

## Scope and version

This reference compares effect timing after commit and around browser repaint. Effects are client-only; server rendering does not run them.

## `useEffect`: default synchronization

`useEffect` runs after a component commits. React generally lets the browser paint before non-interaction Effects, though interaction-related scheduling can vary; do not use it when a visual correction must happen before paint. It is the default for subscriptions, network synchronization, and external widgets. Avoid blocking the paint unnecessarily.

## `useLayoutEffect`: measure before repaint

`useLayoutEffect(setup, dependencies?)` runs after DOM commit and before the browser repaints. It is appropriate when you must read layout (for example, `getBoundingClientRect`) and synchronously update position/state to prevent visible flicker. It blocks repaint and can hurt performance, so prefer `useEffect` when possible. It does nothing during server rendering; for server-rendered UI, render a layout-independent initial state or defer client-only content appropriately.

## `useInsertionEffect`: library-specific style injection

`useInsertionEffect(setup, dependencies?)` runs before layout Effects so CSS-in-JS libraries can inject styles before layout measurement. Most application code should use `useEffect` or `useLayoutEffect` instead. Refs are not attached yet; state updates are unsupported; DOM update timing may be before or after its execution, so do not read/mutate DOM under assumptions. Cleanup/setup interleaving is specialized. It is not an earlier general-purpose lifecycle hook.

All variants have setup, optional cleanup, dependencies compared with `Object.is`, and no server execution. Strict Mode adds an extra development setup/cleanup cycle where applicable. Effects must be correctly mirrored.

## Comparison table

| Hook | Timing/role | Typical user |
|---|---|---|
| `useEffect` | After commit, non-layout synchronization | Application code/default |
| `useLayoutEffect` | After DOM commit, before repaint | Layout measurement/visual correction |
| `useInsertionEffect` | Before layout Effects; style insertion | CSS-in-JS library authors |

## Examples

Use layout effect to measure a tooltip and adjust its position before paint. Use normal Effect to subscribe to a WebSocket. Use insertion effect only in a style library that must insert generated rules before a component's layout Effects read computed styles.

## Common mistakes

Using layout effect for every subscription; using insertion effect as “faster useEffect”; expecting refs/DOM to be ready in insertion effect; assuming effects run during SSR; and reading layout in an Effect after paint then accepting a flicker when layout effect is required.

## Knowledge checks with answers

1. **Which hook is the default?** `useEffect`.
2. **Which runs before repaint?** `useLayoutEffect`.
3. **Who should use insertion effect?** CSS-in-JS library authors with a style injection need.
4. **Do any Effects run on server?** No.

## How this group fits the mental model

The variants synchronize at different moments around a committed host tree; choose the narrow timing needed by the external system.

## Cross-item comparison

`useEffect` is post-commit; layout effect blocks repaint to measure/correct; insertion effect supports style injection before layout effects.

## Exact terms covered

### Exact terms covered

- `useLayoutEffect(setup, dependencies?)`
- `useInsertionEffect(setup, dependencies?)`
- `useEffect timing after commit`
- `useLayoutEffect timing before browser repaint`
- `useInsertionEffect before layout Effects`
- `useLayoutEffect for layout measurement`
- `useInsertionEffect for CSS-in-JS libraries`
- `Effects do not run during server rendering`

## Supplied names explained

The exact inventory below names each timing variant, execution boundary, supported use case, and server-rendering limitation described above.
