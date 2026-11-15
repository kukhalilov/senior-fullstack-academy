# React DOM components forms resource hints portals and preload APIs — Reference: React DOM focus keyboard and mouse event props

## Scope and version

This lesson covers focus, keyboard, and mouse event props documented for React DOM 19.3. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

React event props use `onX` for bubble-phase callbacks and `onXCapture` for capture-phase callbacks, except boundary events such as mouse enter/leave that have no Capture form. React's `onFocus` and `onBlur` bubble, unlike their native counterparts in common browser event models, which makes delegated focus handling practical. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## Supplied names explained

### Focus

`onFocus`, `onFocusCapture`, `onBlur`, and `onBlurCapture` observe focus entering or leaving an element/subtree. Use `event.relatedTarget` when determining the element focus moved to/from, while accounting for null values and browser/security boundaries. A parent can use bubbling `onBlur` to detect focus leaving a composite widget by checking whether the next target remains inside its DOM subtree.

### Keyboard

`onKeyDown`, `onKeyDownCapture`, `onKeyPress`, `onKeyPressCapture`, `onKeyUp`, and `onKeyUpCapture` receive keyboard events. Prefer `onKeyDown`/`onKeyUp`; `onKeyPress` is deprecated in the web platform and has inconsistent semantics for non-character keys. Inspect `key` for interpreted key meaning and `code` for physical key position; they answer different questions. Respect browser defaults for text editing and standard controls unless the interface intentionally replaces them.

### Mouse

`onMouseDown`, `onMouseDownCapture`, `onMouseMove`, `onMouseMoveCapture`, `onMouseUp`, `onMouseUpCapture`, `onMouseOut`, and `onMouseOutCapture` expose mouse movement and button events. `onMouseEnter` and `onMouseLeave` describe boundary transitions and have no Capture counterparts. For keyboard, touch, and pen support, do not build an interaction solely from mouse callbacks; prefer semantic controls and pointer events when appropriate.

## Cross-item comparison

Focus events describe focus movement, keyboard events describe key actions, and mouse events describe mouse input. Pointer events from the adjacent reference group are preferable when pen and touch must share the interaction model.

## Examples

```jsx
function FocusBoundary({ children }) {
  return <div onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      console.log('Focus left the region');
    }
  }}>{children}</div>;
}
```

## Event phase and defaults

Capture callbacks run from ancestors toward the target; bubble callbacks run from the target toward ancestors. `currentTarget` is the node whose callback is currently running; `target` is the origin (which may be a descendant). `preventDefault()` requests cancellation of a cancelable browser action. `stopPropagation()` affects traversal but does not cancel the action. React event callbacks do not automatically make a generic element focusable or keyboard-operable.

## Common mistakes

- Using deprecated `onKeyPress` for general keyboard handling.
- Comparing `event.target` with a parent when `currentTarget` is the intended node.
- Assuming `onFocus`/`onBlur` do not bubble in React.
- Suppressing browser keyboard defaults without replacing expected behavior.
- Implementing controls with mouse handlers only.

## Knowledge checks with answers

1. Which event property identifies the current handler's node?
2. Why is `onKeyPress` usually a poor choice?
3. Does `stopPropagation()` cancel a browser default?

## Answers

1. `currentTarget`.
2. It is deprecated and does not represent all keys consistently.
3. No; use `preventDefault()` for a cancelable default action.

## Sources

- [React common DOM props and events](https://react.dev/reference/react-dom/components/common)
- [React DOM components](https://react.dev/reference/react-dom/components)
