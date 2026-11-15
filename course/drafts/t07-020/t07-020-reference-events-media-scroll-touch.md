# React DOM components forms resource hints portals and preload APIs — Reference: React DOM media scroll selection touch and transition event props

## Scope and version

This reference covers React DOM 19.3 media, scroll, selection, touch, CSS transition, and wheel event props. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

These React callback props correspond to media lifecycle, scrolling, text selection, touch, CSS transition, and wheel events. Each listed `Capture` callback uses React's capture phase; the unsuffixed counterpart uses bubble phase. A capture prop can observe traversal even when the native event does not bubble, subject to React's event implementation. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## Supplied names explained

### Media lifecycle

`onAbort`, `onAbortCapture`, `onCanPlay`, `onCanPlayCapture`, `onCanPlayThrough`, `onCanPlayThroughCapture`, `onDurationChange`, `onDurationChangeCapture`, `onEmptied`, `onEmptiedCapture`, `onEncrypted`, `onEncryptedCapture`, `onEnded`, `onEndedCapture`, `onLoadedData`, `onLoadedDataCapture`, `onLoadedMetadata`, `onLoadedMetadataCapture`, `onLoadStart`, `onLoadStartCapture`, `onPause`, `onPauseCapture`, `onPlay`, `onPlayCapture`, `onPlaying`, `onPlayingCapture`, `onProgress`, `onProgressCapture`, `onRateChange`, `onRateChangeCapture`, `onResize`, `onResizeCapture`, `onSeeked`, `onSeekedCapture`, `onSeeking`, `onSeekingCapture`, `onStalled`, `onStalledCapture`, `onSuspend`, `onSuspendCapture`, `onTimeUpdate`, `onTimeUpdateCapture`, `onVolumeChange`, `onVolumeChangeCapture`, and `onWaiting`, `onWaitingCapture` expose media events. They report media element state changes, not guaranteed playback success. Autoplay policy, codecs, network conditions, and user activation remain browser-controlled.

### Scroll, selection, touch, transitions, and wheel

`onScroll` and `onScrollCapture` observe scrolling. React's `onScroll` does not bubble like most React event props; attach it to the scrolling element or use capture intentionally. `onSelect` and `onSelectCapture` observe selection changes, including relevant editable controls. `onTouchStart`, `onTouchStartCapture`, `onTouchMove`, `onTouchMoveCapture`, `onTouchEnd`, `onTouchEndCapture`, `onTouchCancel`, and `onTouchCancelCapture` expose touch events; passive-listener/browser scrolling rules mean cancellation behavior is constrained. Prefer Pointer Events for a unified mouse/pen/touch interaction unless touch-specific semantics are needed.

`onTransitionEnd` and `onTransitionEndCapture` observe CSS transition completion; transitions may not run or may be canceled, so do not rely on them as the only way to finish application state. `onWheel` and `onWheelCapture` observe wheel input, which may represent trackpad scrolling or other device gestures. Avoid canceling wheel defaults unless implementing a deliberate alternative.

## Common mistakes

- Treating `onCanPlayThrough` as a promise that media will never stall.
- Listening for scroll on an ancestor with bubble-phase `onScroll` and expecting propagation.
- Assuming CSS transition end always fires (zero duration, cancellation, or property changes can prevent it).
- Blocking touch or wheel defaults without a complete accessible alternative.

## Cross-item comparison

Media events report playback/resource state; scroll and wheel report movement input; touch events expose touch contacts; transition events report CSS transitions. Their defaults and bubbling behavior differ, so attach handlers and cancel defaults according to the specific event.

## Examples

```jsx
function VideoStatus() {
  return <video controls onEnded={() => console.log('Playback ended')} />;
}
```

## Knowledge checks with answers

1. Which listed event is a React non-bubbling exception?
2. Does `onCanPlayThrough` guarantee uninterrupted playback?
3. Why can a transition-end callback fail to occur?

## Answers

1. `onScroll`.
2. No. Buffering, network, codec, or playback conditions may change.
3. A transition may not start, may be canceled, or may have no effective duration.

## Sources

- [React common DOM props and events](https://react.dev/reference/react-dom/components/common)
- [React DOM components](https://react.dev/reference/react-dom/components)
