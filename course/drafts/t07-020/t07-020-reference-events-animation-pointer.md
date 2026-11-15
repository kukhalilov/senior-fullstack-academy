# React DOM components forms resource hints portals and preload APIs — Reference: React DOM animation and pointer event props

## Scope and version

This is the React 19.3 event prop reference group; React event callback behavior is layered on browser events. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

React event props are callback props. The suffix `Capture` selects React's capture phase; the unsuffixed callback runs in the bubble phase (except enter/leave events, which do not have capture variants). Handlers receive React event objects exposing the relevant native event interface plus `preventDefault()` and `stopPropagation()`. `preventDefault` cancels a browser default when cancelable; it does not stop propagation. `stopPropagation` does not cancel a default action. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## Supplied names explained

### Animation events

`onAnimationStart`, `onAnimationStartCapture`, `onAnimationIteration`, `onAnimationIterationCapture`, `onAnimationEnd`, and `onAnimationEndCapture` correspond to CSS animation lifecycle events. They report an animation event, not React transition lifecycle. A canceled animation may not reach its normal end; inspect `animationName`, `elapsedTime`, and `pseudoElement` on the native event when needed. Capture handlers observe the event on the way down the React tree; bubble handlers observe it on the way up.

### Pointer events

`onPointerDown`, `onPointerDownCapture`, `onPointerMove`, `onPointerMoveCapture`, `onPointerUp`, `onPointerUpCapture`, `onPointerCancel`, `onPointerCancelCapture`, `onPointerOut`, `onPointerOutCapture`, `onGotPointerCapture`, `onGotPointerCaptureCapture`, `onLostPointerCapture`, and `onLostPointerCaptureCapture` expose Pointer Events. The native event can identify `pointerId`, `pointerType`, `isPrimary`, pressure, and contact geometry when supported. Pointer capture directs subsequent pointer events to the capture element until release or cancellation; it does not make the pointer physically remain over that element.

`onPointerEnter` and `onPointerLeave` have no Capture variants. They represent boundary entry/exit and React synthesizes their propagation through the React tree; unlike `onPointerOver`/`onPointerOut`, they do not repeatedly fire while traversing descendants. Use pointer events when mouse, pen, and touch should share a model, while preserving browser touch-action and cancellation behavior.

### Mouse activation and auxiliary buttons

`onClick`, `onClickCapture`, `onDoubleClick`, `onDoubleClickCapture`, `onAuxClick`, `onAuxClickCapture`, `onContextMenu`, and `onContextMenuCapture` cover activation, non-primary button activation, and context-menu requests. `onMouseDown`, `onMouseDownCapture`, `onMouseMove`, `onMouseMoveCapture`, `onMouseUp`, `onMouseUpCapture`, `onMouseOut`, and `onMouseOutCapture` are in the focus/keyboard/mouse reference lesson. `onMouseEnter` and `onMouseLeave` likewise have no Capture forms and describe boundaries rather than every over/out movement.

## Cross-item comparison

Animation events report CSS animation lifecycle; pointer events unify mouse, pen, and touch; click and auxiliary mouse events represent activation. Pointer and mouse boundary events differ from movement events, and boundary callbacks have no Capture variant.

## Examples

```jsx
function DragHandle() {
  return <button onPointerDown={event => event.currentTarget.setPointerCapture(event.pointerId)}>
    Move item
  </button>;
}
```

Capture should be paired with an intentional drag interaction and released/cleaned up on pointer completion or cancellation.

## Choosing and debugging

Prefer a semantic button for activation; a click handler alone does not give a generic element keyboard behavior or accessibility semantics. Avoid assuming one physical action maps to one click: keyboard activation, assistive technology, and pointer input can all activate controls. Do not use mouse events as a substitute for pointer events if pen/touch matter. To diagnose ordering, log event type, target/currentTarget, phase, and defaultPrevented; avoid retaining pooled-event workarounds because modern React DOM event objects are not pooled.

## Common mistakes

- Treating `preventDefault()` as propagation control.
- Expecting `onPointerEnterCapture` or `onMouseLeaveCapture`; these props do not exist.
- Assuming pointer capture means hover or hit-testing continues normally.
- Using `onClick` on a non-interactive element without keyboard and semantic support.
- Assuming every browser/device supports every pointer field identically.

## Knowledge checks with answers

1. Which callbacks have no Capture counterpart?
2. What is the difference between canceling a default and stopping propagation?
3. Why can pointer capture change the target of subsequent pointer events?

## Answers

1. `onPointerEnter`, `onPointerLeave`, `onMouseEnter`, and `onMouseLeave`.
2. `preventDefault()` cancels a cancelable browser default; `stopPropagation()` prevents further event traversal.
3. Capture routes subsequent events for that pointer to the capturing element until release/cancel.

## Sources

- [React common DOM props and events](https://react.dev/reference/react-dom/components/common)
- [React DOM components](https://react.dev/reference/react-dom/components)
