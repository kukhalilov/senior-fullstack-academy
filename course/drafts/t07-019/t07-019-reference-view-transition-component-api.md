# React API reference React hooks components context and resources — Reference: View Transition component props and behavior

## Scope and version

This lesson explains every supplied `<ViewTransition>` prop and related concept in React 19.3: `name`, `enter`, `exit`, `update`, `share`, `default`, `onEnter`, `onExit`, `onShare`, `onUpdate`, Transition Types, View Transition Classes, and Web Animations API integration. React coordinates browser View Transitions for React updates; a framework/router may own navigation integration. [ViewTransition](https://react.dev/reference/react/ViewTransition) [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)

## How this group fits the mental model

The browser captures a visual transition between old and new UI. React decides which mounted/unmounted/shared boundaries participate and starts the browser transition at a point aligned with its commit. A `<ViewTransition>` marks a boundary; a React Transition, Suspense reveal, or deferred update determines when a change is eligible. CSS classes or JavaScript callbacks customize the animation, while stable names let a visual element be matched across trees.

## Supplied names explained

- `name prop` identifies the shared-element transition name. It accepts a string or object. Use a custom name only when matching an element across different tree locations; React generates a unique name automatically for ordinary transitions. Custom names must not collide among simultaneously mounted boundaries. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `enter prop` controls animation for content entering the rendered tree. It accepts `auto`, `none`, a CSS class name, or an object keyed by Transition Type and `default`. An enter animation only runs when React coordinates an eligible transition and the boundary is eligible for enter detection (not hidden behind earlier DOM nodes). [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `exit prop` configures animation for content leaving the tree. It accepts the same values as `enter`. React keeps the old visual representation available for the browser transition even though the next React tree no longer contains it. The configured class must define a meaningful animation; React does not invent duration or motion design. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `update prop` configures animation when a boundary remains but its content changes or its geometry changes due to an immediate sibling. It accepts the same values as `enter`. Use this for an element whose visual change should be animated without being treated as an enter/exit. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `share prop` configures the shared-element case: a named visual identity exits one location and enters another in the same Transition. It has precedence over separate enter/exit behavior for the matched shared transition. A fallback shown between removal and insertion prevents a pair from forming. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `default prop` supplies a default configuration when a transition type-specific value is not provided. Its default is `auto` (the browser default animation); use `none` to opt out except for explicitly configured triggers. Per-type entries can specialize a named transition cause. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `onEnter prop` receives a View Transition instance and an array of transition type strings when an entering animation starts. Return a cleanup function to cancel/clean up animation work. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `onExit prop` runs for a leaving boundary and receives the transition instance and type strings. The callback can coordinate the Web Animations API; return cleanup for work React must cancel. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `onShare prop` runs for a matched shared element transition and receives the instance and type strings. It takes precedence over `onEnter`/`onExit` for the shared case. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `onUpdate prop` runs when an existing boundary updates within a transition and receives the instance and type strings. As with the other callbacks, clean up manually created animation work through the returned cleanup. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `Transition Types` are string causes attached with `addTransitionType` while starting a Transition. A boundary's configuration can select different classes/callback behavior by type; types are metadata for animation selection, not priority levels or authorization. Multiple types can be collected, and they reset after each commit (so a Suspense fallback may receive them while the later reveal does not). [addTransitionType](https://react.dev/reference/react/addTransitionType) [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `View Transition Classes` are CSS class names React applies to identify transition phases, letting CSS define keyframes and pseudo-element behavior. The browser View Transition pseudo-elements and CSS animation system remain relevant; account for reduced-motion preferences in CSS because React does not automatically disable motion. [ViewTransition](https://react.dev/reference/react/ViewTransition)
- `Web Animations API integration` lets callbacks drive `ViewTransitionInstance` animation methods and return cleanup. Prefer React's callbacks for JavaScript customization; do not separately call `document.startViewTransition` for the same React update, since React owns coordination and can interrupt other active transitions. [ViewTransition](https://react.dev/reference/react/ViewTransition)

## Cross-item comparison

`enter` and `exit` style a boundary's lifetime changes; they are only detected at the relevant top level before other DOM output. `update` styles a continuing boundary whose content/geometry changes. `share` styles a visual identity matched across locations and takes precedence for that case. `default` supplies a fallback, while type-specific values select by the cause attached through Transition Types. Callback props are for imperative animation integration; CSS classes are usually simpler and easier to maintain. [ViewTransition](https://react.dev/reference/react/ViewTransition)

## Examples

```jsx
function ProductImage({ product }) {
  return <ViewTransition name={`product-${product.id}`}>
    <img src={product.image} alt={product.name} />
  </ViewTransition>;
}

function selectProduct(id) {
  startTransition(() => {
    addTransitionType('product-navigation');
    setSelectedId(id);
  });
}
```

This is illustrative: matching boundaries must be mounted in the old/new trees with the same unique name, and the update must be in a supported transition. Define matching CSS/configuration for `product-navigation`. Do not assume a direct synchronous setter triggers the animation. Add a `prefers-reduced-motion` rule because React does not automatically disable motion. [ViewTransition](https://react.dev/reference/react/ViewTransition) [addTransitionType](https://react.dev/reference/react/addTransitionType)

## Common mistakes

- Calling the browser's `document.startViewTransition` around updates React already coordinates.
- Reusing a custom name for two simultaneously mounted boundaries.
- Placing an entering/exiting `<ViewTransition>` after other DOM nodes in the same returned tree; enter/exit detection requires the boundary before DOM output.
- Expecting immediate urgent state updates to activate ViewTransition by default.
- Assuming React automatically respects reduced-motion preferences.
- Using a JavaScript callback without returning cleanup for manually started animation work.
- Treating Transition Types as scheduling priority or as persistent global state.
- Expecting `share` to match unrelated content without stable unique names.

## Knowledge checks with answers

1. **Which prop configures a matched moving element?** `share`.
2. **Which prop handles an existing boundary whose content changes?** `update`.
3. **How can a transition cause select styling?** Add a Transition Type within `startTransition`, then configure the relevant type.
4. **Does React automatically honor reduced-motion settings?** No; CSS should implement the preference.
5. **Who coordinates `document.startViewTransition` for a React `<ViewTransition>` update?** React; do not start a competing browser transition manually.

