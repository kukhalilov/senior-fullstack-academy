# React DOM components forms resource hints portals and preload APIs — Reference: React DOM input clipboard composition and drag event props

## Scope and version

This reference group covers React 19.3 input, clipboard, composition, and drag callbacks. Browser-specific payload and cancelability details remain relevant. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

This lesson names the React callback props for text composition, clipboard, and native drag-and-drop. Each `Capture` prop observes React's capture phase; its unsuffixed partner observes the bubble phase. Callbacks receive an event object; call `preventDefault()` only when the browser operation should be canceled, and call `stopPropagation()` only when ancestor React handlers should not observe it. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## Supplied names explained

### Input and text composition

`onBeforeInput` and `onBeforeInputCapture` observe an attempted text edit before it is applied where the browser and React support the event. The exact `beforeinput` payload and cancelability vary by input method and browser; do not use it as the sole cross-browser controlled-input mechanism. `onChange` is the usual React callback for synchronizing controlled text inputs (covered with forms).

`onCompositionStart`, `onCompositionStartCapture`, `onCompositionUpdate`, `onCompositionUpdateCapture`, `onCompositionEnd`, and `onCompositionEndCapture` mark input-method-editor composition. A user may type a sequence that is not yet committed; avoid treating every intermediate update as final text or replacing it in a way that disrupts the IME. Composition events also matter for East Asian and other input methods.

### Clipboard

`onCopy`, `onCopyCapture`, `onCut`, `onCutCapture`, `onPaste`, and `onPasteCapture` correspond to clipboard operations. The event's clipboard data is exposed through the native clipboard event interface. Browser permissions and user-gesture rules apply; a handler cannot assume clipboard reads/writes are universally available. Canceling the event can suppress the default copy/cut/paste operation, so do so only when providing an intentional replacement.

### Drag and drop

`onDrag`, `onDragCapture`, `onDragStart`, `onDragStartCapture`, `onDragEnter`, `onDragEnterCapture`, `onDragLeave`, `onDragLeaveCapture`, `onDragOver`, `onDragOverCapture`, `onDragEnd`, `onDragEndCapture`, `onDrop`, and `onDropCapture` cover the HTML Drag and Drop event sequence. Transfer data through the event's `dataTransfer`; browsers constrain when data can be read or written. To make an element a drop target, a handler commonly calls `preventDefault()` during `onDragOver`; otherwise the browser's default may reject dropping. `onDragEnd` runs on the source after completion/cancellation and should be used for cleanup, not as proof that a drop succeeded.

Drag events are not a universal touch interaction model. Provide keyboard-accessible alternatives and use Pointer Events or a dedicated interaction design where touch dragging is required.

## Common mistakes

- Replacing a controlled input's value during an unfinished IME composition.
- Assuming `onBeforeInput` is identical across browsers and input methods.
- Forgetting to cancel `onDragOver` when implementing a drop target.
- Reading clipboard or drag data outside the event's permitted lifecycle.
- Assuming a drag always ends in a successful drop.

## Cross-item comparison

Composition events describe text-entry state; clipboard events expose user clipboard operations; drag events model a source and a potential drop target. Only drag-over cancellation commonly enables drop acceptance; cancellation of clipboard events suppresses the browser default instead.

## Examples

```jsx
function DropTarget({ onFiles }) {
  return <div onDragOver={event => event.preventDefault()}
    onDrop={event => {
      event.preventDefault();
      onFiles(Array.from(event.dataTransfer.files));
    }}>
    Drop files here or choose them with the file picker.
  </div>;
}
```

Provide the promised file picker as a separate labeled input in production.

## Knowledge checks with answers

1. Why should code preserve intermediate IME text until composition is committed?
2. Which event commonly needs `preventDefault()` to accept a drop?
3. Does `onDragEnd` prove that the drop target accepted the item?

## Answers

1. The input method may still be constructing the final text; rewriting it can interrupt composition.
2. `onDragOver`.
3. No. It marks the end/cancellation of the source drag; use the target's `onDrop` to process an accepted drop.

## Sources

- [React common DOM props and events](https://react.dev/reference/react-dom/components/common)
- [React input component](https://react.dev/reference/react-dom/components/input)
