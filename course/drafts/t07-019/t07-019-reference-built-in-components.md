# React API reference React hooks components context and resources — Reference: Built-in React components and Fragment refs

## Scope and version

This lesson covers all built-in component and Fragment ref names supplied in this group for React 19.3: grouping, profiling, suspense, development checks, hidden activity, transitions, and the `FragmentInstance` methods. React Native and third-party components are outside this web-oriented API boundary. [Built-in React Components](https://react.dev/reference/react/components) [React versions](https://react.dev/versions)

## How this group fits the mental model

Built-in components let React coordinate special behavior around a subtree. They are not DOM tags: React interprets their props and applies behavior to descendant UI. A Fragment groups children without a wrapper; Suspense coordinates pending rendering; Activity preserves hidden UI state while cleaning up Effects; ViewTransition coordinates transition animation; StrictMode and Profiler support development checks and measurement.

## Supplied names explained

- `<Fragment>` groups multiple children without adding a DOM wrapper. Explicit syntax supports `key` and, in current React 19.3, `ref`; shorthand does not accept these props. [Fragment](https://react.dev/reference/react/Fragment)
- `<>...</>` is Fragment shorthand. It is convenient for unkeyed/unreferenced grouping. Use `<Fragment key={...}>` or `<Fragment ref={...}>` when those props are needed. [Fragment](https://react.dev/reference/react/Fragment)
- `<Profiler>` measures rendering performance of a wrapped tree through an `onRender` callback. Profiling can add overhead and production profiling requires an appropriately configured build. Use measurements to locate cost, not to infer causation from a single number. [Profiler](https://react.dev/reference/react/Profiler)
- `<Suspense>` displays `fallback` while descendant rendering suspends through a supported integration, such as `use(Promise)` or lazy component loading. It is a rendering/loading boundary, not a general promise detector for every fetch started in an Effect. Boundary placement determines how much UI is replaced and whether nested content can reveal progressively. [Suspense](https://react.dev/reference/react/Suspense)
- `<StrictMode>` enables additional development-only checks, including checks designed to reveal impure rendering and missing Effect cleanup. These checks do not run as extra behavior in production. Code should remain correct under repeated development setup and render checks. [StrictMode](https://react.dev/reference/react/StrictMode)
- `<Activity>` preserves the state of a subtree while controlling visibility. `mode` is `visible` or `hidden` (default `visible`); hidden content is visually hidden, Effects are cleaned up, and children can still receive lower-priority renders. Revealing restores state and recreates Effects. A subtree that renders only raw text has no DOM node to hide, so hidden mode produces no text output. [Activity](https://react.dev/reference/react/Activity)
- `<ViewTransition>` marks a subtree for browser View Transition animations when React performs relevant transition/Suspense updates. It has `name`, `enter`, `exit`, `update`, `share`, `default`, and lifecycle callback props, covered in the next reference. Immediate updates do not automatically animate; React coordinates the browser transition and applications should not independently call `document.startViewTransition` for the same React update. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `FragmentInstance` is the object passed to an explicit Fragment ref. Its methods act on the Fragment's first-level DOM children (with focus traversal through descendants); it avoids adding a wrapper node. A Fragment ref is not a single DOM element, and methods can have no useful target if there are no compatible child nodes. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.addEventListener` adds the listener to first-level DOM children; the options follow the DOM listener contract. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.removeEventListener` removes listeners from first-level DOM children using matching event type, listener, and relevant options, as in DOM event APIs. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.dispatchEvent(event)` dispatches an event on the Fragment's children; if the event bubbles it can reach the DOM parent. It returns `true` unless `preventDefault()` was called, otherwise `false`. Do not treat it as dispatch on a synthetic wrapper node. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.focus(options?)` focuses the first focusable descendant, searching nested children depth-first. Optional `FocusOptions` can include `preventScroll`. It returns `undefined`. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.focusLast(options?)` focuses the last focusable descendant, traversing nested children depth-first and then in reverse. It returns `undefined` and does not implement a complete keyboard-navigation pattern. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.blur` blurs focused content within the Fragment's descendant set. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.observeUsing` starts observation of the Fragment's DOM children with an `IntersectionObserver` or `ResizeObserver` instance. One observer can be attached to each first-level DOM child. Disconnect it during cleanup using `unobserveUsing` or the observer's lifecycle as appropriate. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.unobserveUsing` stops observation with the supplied observer for the Fragment's DOM children. Pass the observer that was registered. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.getClientRects()` returns bounding rectangles of all first-level DOM children, allowing group geometry to be measured without creating a wrapper. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.getRootNode(options?)` returns the root node containing the Fragment's parent DOM node, matching `Node.getRootNode()`. The optional object has a `composed` boolean; the result can be a `Document`, `ShadowRoot`, or the `FragmentInstance` itself when it has no parent DOM node. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.compareDocumentPosition(otherNode)` compares the Fragment's position with another DOM node and returns the DOM position bitmask. Empty Fragments and Fragments with portal children include `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC`. [Fragment](https://react.dev/reference/react/Fragment)
- `FragmentInstance.scrollIntoView(alignToTop?)` scrolls its children into view. Omitted/`true` aligns the first child to the top; `false` aligns the last child to the bottom. Unlike `Element.scrollIntoView`, this method takes a boolean rather than a `ScrollIntoViewOptions` object and returns `undefined`. [Fragment](https://react.dev/reference/react/Fragment)

## Cross-item comparison

`<Fragment>` groups without DOM; `<Activity>` adds a managed visibility/effect lifecycle while retaining state. `<Suspense>` handles pending rendering; `<Activity>` handles hidden versus visible work. `<StrictMode>` diagnoses development problems; `<Profiler>` reports render measurements. `<ViewTransition>` animates selected React-coordinated changes; it is not a replacement for CSS transitions on every state update. [Components](https://react.dev/reference/react/components) [Activity](https://react.dev/reference/react/Activity) [ViewTransition](https://react.dev/reference/react/ViewTransition)

## Examples

```jsx
function ProductRows({ products }) {
  return products.map(product => (
    <Fragment key={product.id}>
      <dt>{product.name}</dt>
      <dd>{product.price}</dd>
    </Fragment>
  ));
}
```

The explicit Fragment is required because the group needs a stable list key. It does not add a `<div>` to the definition list. For a hidden editor that should retain local form state, use `<Activity mode={open ? 'visible' : 'hidden'}><Editor /></Activity>`; ensure subscriptions and timers live in properly cleaned-up Effects. [Fragment](https://react.dev/reference/react/Fragment) [Activity](https://react.dev/reference/react/Activity)

## Common mistakes

- Expecting `<>...</>` to accept `key` or `ref`.
- Treating a Fragment ref as one DOM node; its instance operates across child nodes.
- Assuming Suspense catches arbitrary data fetching in Effects.
- Using hidden Activity as if it unmounted children or stopped all rendering.
- Expecting Strict Mode's development-only extra checks in production.
- Profiling a tiny sample and treating it as representative production performance.
- Adding ViewTransition while using immediate updates and expecting every update to animate.

## Knowledge checks with answers

1. **Does a Fragment add a DOM wrapper?** No.
2. **Can shorthand Fragment accept a key or ref?** No; use explicit `<Fragment>`.
3. **What happens to Activity Effects when hidden?** They are cleaned up; state is retained.
4. **What does Suspense replace while a supported descendant suspends?** The nearest boundary's fallback.
5. **What does a Fragment ref expose?** A `FragmentInstance` whose methods operate on Fragment child DOM nodes.

