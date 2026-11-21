# React DOM components forms resource hints portals and preload APIs — Reference: React event objects, event interfaces, properties, and methods

## Scope and version

This lesson covers React DOM's event object contract and each event interface listed in the current React 19.3 common-component reference. React exposes a React event object (often called a SyntheticEvent) that conforms to the DOM event interface while normalizing some browser differences. Specialized interfaces expose browser-defined fields. The React event-to-native-event mapping is not a stable public contract; read `nativeEvent` only when a browser API requires it. [React common components](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

A callback receives two useful views of an interaction. The React event object describes the event as React dispatches it through the React tree. Its `target` is where the event originated; `currentTarget` is the DOM element whose callback is running. `nativeEvent` is the underlying browser event, whose target, phase, name, and dispatch details can differ. Use React's documented values for React behavior and the native object only for native-only data.

`preventDefault()` asks the browser to cancel a cancelable default such as navigation or text insertion. `stopPropagation()` stops further event traversal through the React tree. They solve different problems. Neither method prevents other handlers already run in an earlier phase, and `stopPropagation()` does not cancel a browser default.

## Supplied names explained

### React event object properties and methods

The common properties are `bubbles`, `cancelable`, `currentTarget`, `defaultPrevented`, `eventPhase`, `isTrusted`, `target`, and `timeStamp`. `nativeEvent` exposes the underlying DOM event. The values of `currentTarget`, `eventPhase`, `target`, and `type` reflect React's event dispatch contract; they need not equal the corresponding `nativeEvent` values.

The standard methods are `preventDefault()` and `stopPropagation()`. React also exposes `isDefaultPrevented()` and `isPropagationStopped()` to query whether the corresponding method was called. `persist()` and `isPersistent()` remain for compatibility with React Native; they are not needed to retain a React DOM event because modern React DOM does not pool these event objects.

React event dispatch generally follows capture then bubble through React ancestry. Exceptions matter: `onScroll` does not bubble; React makes some browser events such as `onFocus`, `onBlur`, `onLoad`, `onError`, `onCancel`, `onClose`, and `onToggle` bubble through its event system. `onMouseEnter`/`onMouseLeave` and `onPointerEnter`/`onPointerLeave` are boundary events without Capture variants. Check the handler reference for the exact event rather than assuming native bubbling.

### Event interfaces and distinguishing fields

| Interface | Important interface fields | Typical React handlers |
|---|---|---|
| `Event` | Shared event fields such as `bubbles`, `cancelable`, `currentTarget`, `defaultPrevented`, `eventPhase`, `isTrusted`, `target`, `timeStamp` | Generic event handlers such as `onSubmit`, `onReset`, `onScroll`, `onSelect`, `onLoad`, and `onError` |
| `AnimationEvent` | `animationName`, `elapsedTime`, `pseudoElement` | `onAnimationStart`, `onAnimationIteration`, `onAnimationEnd` |
| `ClipboardEvent` | `clipboardData` | `onCopy`, `onCut`, `onPaste` |
| `CompositionEvent` | `data` | `onCompositionStart`, `onCompositionUpdate`, `onCompositionEnd` |
| `DragEvent` | `dataTransfer` | `onDragStart`, `onDragOver`, `onDrop` |
| `FocusEvent` | `relatedTarget` | `onFocus`, `onBlur` |
| `InputEvent` | `data`, `inputType`, `isComposing` | `onBeforeInput` |
| `KeyboardEvent` | `altKey`, `charCode`, `ctrlKey`, `code`, `key`, `keyCode`, `locale`, `location`, `metaKey`, `repeat`, `shiftKey`, `which` | `onKeyDown`, deprecated `onKeyPress`, `onKeyUp` |
| `MouseEvent` | `altKey`, `button`, `buttons`, `clientX`, `clientY`, `ctrlKey`, `metaKey`, `pageX`, `pageY`, `relatedTarget`, `screenX`, `screenY`, `shiftKey` | click, mouse, and auxiliary-click handlers |
| `PointerEvent` | mouse-event fields plus `height`, `isPrimary`, `pointerId`, `pointerType`, `pressure`, `tangentialPressure`, `tiltX`, `tiltY`, `twist`, `width` | pointer down/move/up/cancel and capture handlers |
| `TouchEvent` | `altKey`, `changedTouches`, `ctrlKey`, `metaKey`, `shiftKey`, `targetTouches`, `touches` | touch start/move/end/cancel handlers |
| `TransitionEvent` | `elapsedTime`, `propertyName`, `pseudoElement` | `onTransitionEnd` |
| `UIEvent` | `detail` | the generic UI event interface where applicable |
| `WheelEvent` | `deltaMode`, `deltaX`, `deltaY`, `deltaZ` | `onWheel` |

These interfaces inherit standard fields from their parent DOM interfaces; the table highlights the specialized fields useful for choosing an interface. For example, `KeyboardEvent.key` is the interpreted key value while `code` describes physical key position; `MouseEvent.button` describes the changed button while `buttons` is a bitmask of currently pressed buttons; `PointerEvent.pointerId` identifies the active pointer and `pointerType` distinguishes mouse, pen, and touch. Browser support and exact values remain platform-defined. Deprecated keyboard fields such as `charCode`, `keyCode`, and `which` are retained for compatibility; new logic should prefer `key` and `code`.

## Examples

### Worked examples

### Distinguish the event source from the handler node

```jsx
function List({ children }) {
  return <ul onClick={event => {
    if (event.target instanceof Element && event.target.closest('button')) {
      console.log('A button inside this list was activated');
    }
  }}>{children}</ul>;
}
```

`target` may be a nested element. `currentTarget` would be the `<ul>` while its handler runs. A semantic button should still own the activation behavior.

### Choose a keyboard property for the task

```jsx
function Search({ onSubmit }) {
  return <input onKeyDown={event => {
    if (event.key === 'Enter' && !event.isComposing) onSubmit();
  }} />;
}
```

`key` represents the interpreted key and `isComposing` prevents treating an unfinished IME composition as a committed Enter action. Do not depend on deprecated `keyCode` or `which` for new code.

## Cross-item comparison

React event objects combine shared event state and controls, while the specialized interfaces add event-family data: `AnimationEvent` describes CSS animation, `ClipboardEvent` exposes clipboard data, `PointerEvent` includes pointer identity/contact properties, and `WheelEvent` reports deltas. Read the narrowest interface for the event at hand; the browser still defines many field values and support details.

## Common mistakes

- Confusing `target` with `currentTarget` in delegated handlers.
- Assuming the React event name or `currentTarget` exactly matches `nativeEvent`.
- Calling `stopPropagation()` when the actual requirement is to cancel a browser default.
- Assuming `onScroll` bubbles or that all native non-bubbling events behave identically in React.
- Using deprecated keyboard fields instead of `key` and `code`.
- Treating `persist()` as necessary for asynchronous use of a React DOM event.
- Assuming every interface field has the same support or interpretation on every device.

## Knowledge checks with answers

1. **Which property names the node whose handler is running?** `currentTarget`.
2. **Which property identifies the origin node?** `target`.
3. **What is the difference between `preventDefault()` and `stopPropagation()`?** The former cancels a cancelable browser default; the latter stops React-tree event traversal.
4. **Which two keyboard fields distinguish interpreted meaning from physical key location?** `key` and `code`.
5. **Should React DOM code call `persist()` to prevent event pooling?** No; modern React DOM does not pool events.

## Sources

- [React common components and event object](https://react.dev/reference/react-dom/components/common)
- [DOM Standard: Event](https://dom.spec.whatwg.org/#interface-event)
- [UI Events specification](https://www.w3.org/TR/uievents/)
- [Pointer Events specification](https://www.w3.org/TR/pointerevents/)
- [Input Events specification](https://www.w3.org/TR/input-events-2/)
- [HTML Drag and Drop API](https://html.spec.whatwg.org/multipage/dnd.html)
