# React effects refs imperative handles and external systems — Big-picture orientation and mental model

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect), [`useRef`](https://react.dev/reference/react/useRef), [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Problem and purpose

React owns rendering, but applications still interact with systems outside React: sockets, browser APIs, third-party widgets, DOM measurements, timers, or network lifecycles. Effects synchronize committed UI with those systems; refs retain mutable values or host nodes without causing a render.

## Plain-language mental model

An Effect is a setup/cleanup cycle tied to a committed component and its reactive dependencies. When dependencies change, React cleans up the old synchronization using old values, then establishes the new one. A ref is a stable mutable box whose `current` changes do not request rendering. A DOM ref provides imperative access; an imperative handle exposes a deliberately narrow API to a parent.

## How the parts fit together

```text
render/commit → useEffect setup (after commit)
              → dependency change: cleanup(old) → setup(new)
              → removal: cleanup
useLayoutEffect: after DOM commit, before repaint
useInsertionEffect: specialized style insertion before layout Effects
```

## Concept map

Use event handlers for work caused by a specific interaction. Calculate values from props/state during render. Use Effects to synchronize with an external system React does not own. `useEffect` is the default; `useLayoutEffect` is for visual measurement/mutation before repaint and can hurt performance; `useInsertionEffect` is for CSS-in-JS library authors. Effects run only on the client. Strict Mode performs an extra development setup/cleanup cycle to stress-test cleanup.

## End-to-end walkthrough

A chat room Effect connects after commit using `serverUrl` and `roomId`; its cleanup disconnects. If either dependency changes, React disconnects the old room before connecting to the new one. For a layout tooltip, a DOM ref can be measured in `useLayoutEffect` before paint; normal synchronization should remain in `useEffect`. A `useRef` value can retain an interval ID or DOM node without rerendering.

## When to use it and tradeoffs

Effects are an escape hatch for synchronization, not a general place to mirror props into state or derive values. Every setup should have matching cleanup where the external resource requires it. Async results need cancellation or stale-result guards. Prefer declarative props/state and framework data APIs when available. Imperative refs are useful sparingly when a parent needs a focused command such as focus/scroll.

## What later lessons cover

References detail the Effect dependency lifecycle, timing variants, refs/DOM access, imperative handles (including React 19 ref props), and design/Strict Mode checks. Practice covers subscriptions, stale network results, visual measurement, and avoiding unnecessary Effects.

## Version notes

In React 19, function components can receive `ref` as a prop; new function components no longer need `forwardRef`. `forwardRef` remains relevant to React 18 and earlier and is planned for future deprecation. See [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) and [`forwardRef`](https://react.dev/reference/react/forwardRef).
