<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: Viewport and element size observer interfaces

# Scope and version

This reference covers the current Intersection Observer and Resize Observer specifications as checked 2026-11-19. Delivery is asynchronous and entries describe observer snapshots, not a general rendering-complete signal. Current Intersection Observer also defines visibility tracking (`trackVisibility`, `delay`, and `isVisible`); this more expensive capability may be unavailable or vary across browsers, so feature-detect it and verify target support. See [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver), [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), and [WHATWG HTML](https://html.spec.whatwg.org/multipage/).

# How this group fits the mental model

IntersectionObserver answers whether a target intersects a root region under configured margins/thresholds. ResizeObserver answers when an observed element's content/border/device-pixel box sizes change. They avoid continuous scroll/resize polling but do not promise an exact callback for every frame or tell whether pixels were painted to a physical display.

# Supplied names explained

- `IntersectionObserver` — Observes intersection changes for targets relative to a viewport or ancestor root and calls a callback with queued entries.
- `IntersectionObserver() constructor` and `IntersectionObserverCallback` — The constructor receives one callback and shared observer options; the callback receives a sequence of entries and the observer.
- `IntersectionObserver.root` — Read-only root node, or null for the implicit root. `IntersectionObserver.rootMargin` — Normalized root offsets. `IntersectionObserver.scrollMargin` — Normalized nested scroll-container offsets. `IntersectionObserver.thresholds` — Sorted configured thresholds. `IntersectionObserver.delay` — Effective minimum per-target notification interval. `IntersectionObserver.trackVisibility` — Whether visibility tracking is enabled.
- `IntersectionObserver.observe()` — Starts observing a target Element; an initial observation is processed asynchronously even if no threshold transition has occurred yet.
- `IntersectionObserver.unobserve()` — Stops observing one target.
- `IntersectionObserver.disconnect()` — Stops observing all targets.
- `IntersectionObserver.takeRecords()` — Returns and clears pending intersection entries without waiting for callback delivery.
- `IntersectionObserverEntry` — Snapshot record for one target at an observation time. `IntersectionObserverEntry() constructor` takes `IntersectionObserverEntryInit`, whose required fields are time, rootBounds, boundingClientRect, intersectionRect, isIntersecting, isVisible, intersectionRatio, and target.
- `IntersectionObserverEntryInit.time`, `IntersectionObserverEntryInit.rootBounds`, `IntersectionObserverEntryInit.boundingClientRect`, `IntersectionObserverEntryInit.intersectionRect`, `IntersectionObserverEntryInit.isIntersecting`, `IntersectionObserverEntryInit.isVisible`, `IntersectionObserverEntryInit.intersectionRatio`, and `IntersectionObserverEntryInit.target` — The eight required members used to construct an entry.
- `IntersectionObserverEntry.boundingClientRect` — Target rectangle from the corresponding geometry measurement.
- `IntersectionObserverEntry.intersectionRatio` — Intersection area divided by target bounding-box area, in the range 0–1 (with special zero-area rules).
- `IntersectionObserverEntry.intersectionRect` — Rectangle representing the visible intersection region after clipping.
- `IntersectionObserverEntry.isIntersecting` — Whether target and root intersect or are edge-adjacent under the API algorithm; it is not equivalent to “visibly painted to a person.”
- `IntersectionObserverEntry.isVisible` — Result of the visibility algorithm, meaningful when visibility tracking is enabled; it still is not a general guarantee of human perception or ad viewability.
- `IntersectionObserverEntry.rootBounds` — Root intersection rectangle, or null in cases where root geometry is unavailable/hidden by policy.
- `IntersectionObserverEntry.target` — Observed element.
- `IntersectionObserverEntry.time` — High-resolution timestamp associated with the observation.
- `IntersectionObserverInit.root` — Root element or Document; null uses the viewport.
- `IntersectionObserverInit.rootMargin` — CSS-like margins expanding/shrinking the root intersection rectangle; percentages resolve relative to root width per spec behavior.
- `IntersectionObserverInit.scrollMargin` — Margins applied to nested scroll-container clip rectangles along the path between root and target, adjusting intersection computation for nested scrolling.
- `IntersectionObserverInit.threshold` — One threshold or array of thresholds at which callbacks are queued as ratio crosses values; sorted by API processing, constrained to 0–1, and defaults to 0.
- `IntersectionObserverInit.delay` — Minimum milliseconds between notifications for a target; when `trackVisibility` is true, the specification raises values below 100 ms to 100 ms.
- `IntersectionObserverInit.trackVisibility` — Requests visibility tracking, which is more computationally expensive than intersection-only tracking.
- ResizeObserver() constructor and `ResizeObserverCallback` — The constructor takes a callback; each delivery provides a sequence of `ResizeObserverEntry` objects and the observer.
- `ResizeObserver` — Observes selected element box-size changes.
- `ResizeObserver.observe()` — Starts observing a target with optional `ResizeObserverOptions.box`: `content-box` (default), `border-box`, or `device-pixel-content-box`. The chosen box controls which changes trigger notification, not which size properties the entry exposes; observing the same target again replaces its prior observation choice.
- `ResizeObserverBoxOptions` — Enum values `content-box`, `border-box`, and `device-pixel-content-box`.
- `ResizeObserverOptions.box` — Selects the observed box and defaults to `content-box`.
- `ResizeObserver.unobserve()` — Stops observing one target.
- `ResizeObserver.disconnect()` — Stops observing all targets.
- `ResizeObserverEntry` — Snapshot of a target and box sizes for a delivery.
- `ResizeObserverEntry.borderBoxSize` — Frozen sequence of logical inline/block sizes for the content box plus padding/border; sequence shape accommodates fragmented elements.
- `ResizeObserverEntry.contentBoxSize` — Frozen sequence of logical inline/block sizes for the content box, accommodating fragments.
- `ResizeObserverEntry.devicePixelContentBoxSize` — Frozen sequence of content box sizes in integral device pixels before transforms; its computation depends on browser pixel snapping and can be more expensive, where supported.
- `ResizeObserverSize.inlineSize` and `.blockSize` — Logical inline and block dimensions of a reported box; use these instead of assuming physical width/height.
- `ResizeObserverEntry.contentRect` — Legacy physical-axis DOMRectReadOnly view of the content box; newer code should use box-size sequences and account for logical axes.
- `ResizeObserverEntry.target` — Observed element whose size is described.

# Intersection thresholds and margins

An observer callback is queued when the threshold index, `isIntersecting` state, or (when enabled) `isVisible` state changes. Threshold `0` is common for “near view” lazy loading; a list of thresholds can report coarse progress. Large target-to-root size differences and zero-area targets affect ratios. `rootMargin` changes the root rectangle, while `scrollMargin` adjusts clipping rectangles for nested scroll containers; they are not interchangeable. For a cross-origin target in an implicit-root observer, the standard restricts geometry exposure and ignores margins to limit information leakage; `rootBounds` may be null.

Intersection does not prove the target is unobscured, legible, or actually seen. The newer `trackVisibility`/`isVisible` path asks the user agent to apply a conservative visibility algorithm; it is more expensive, throttled by at least 100 ms, and has uneven implementation availability. It still does not replace product-specific viewability rules. `isIntersecting` continues to describe geometry; inspect `isVisible` when visibility tracking was requested. Use `loading="lazy"` for native image/iframe loading where appropriate instead of reimplementing it.

# Resize delivery and feedback loops

The observer reports logical box dimensions; inline/block axes depend on writing mode. `ResizeObserverSize.inlineSize` is the logical inline dimension; `ResizeObserverSize.blockSize` is the logical block dimension; entries return frozen sequences to accommodate fragmented elements, though the current Level 1 definition returns a single size corresponding to the first column in multicolumn layout. The observation box controls notification triggers; every entry still exposes all three box-size sequences. CSS transforms do not themselves trigger observations. Non-replaced inline elements do not generate observations; SVG graphics elements report their bounding box rather than CSS content/border boxes. If the callback changes an observed element's size, another delivery may occur. A cycle can trigger a browser resize-loop error and defer notifications. Make callback writes idempotent, compare sizes, and avoid measuring-and-mutating recursively. Use the observation box matching the requirement; device-pixel content box can be costly/unsupported and is useful for pixel-aligned canvas work.

# Lifecycle and performance

Reuse observers when targets share options; each target can be unobserved independently. Call `disconnect()` when the feature ends. `takeRecords()` can synchronously drain pending entries before disconnect. Avoid expensive layout reads/writes inside callbacks; use entry snapshots instead of rereading geometry unnecessarily.

# Examples

```js
const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) loadNextPage();
}, { rootMargin: "400px" });
observer.observe(sentinel);
// When the list view is disposed:
observer.disconnect();
```

The positive root margin starts work before the sentinel reaches the visible viewport. The callback is asynchronous and can receive multiple entries; avoid assuming one callback per scroll event.

# Common mistakes

- Polling `getBoundingClientRect()` on every scroll when intersection is the real question.
- Treating `intersectionRatio === 1` as proof the target is visible to a human or unobscured.
- Misusing `rootMargin` for nested scroll clipping that should use `scrollMargin`.
- Expecting exact callback timing before or after paint; the observer reports queued changes.
- Writing dimensions in a ResizeObserver callback without guarding against repeated size changes.
- Assuming `contentRect` uses logical inline/block axes; it is a legacy physical-axis rectangle.
- Forgetting to disconnect/unobserve removed targets.
- Assuming `takeRecords()` invokes the callback; it returns records directly and clears the queue.
- Using IntersectionObserver instead of native lazy-loading where the browser already supports the desired behavior.

# Cross-item comparison

| Question | Observer | Main data |
| --- | --- | --- |
| Is target crossing a viewport/root threshold? | IntersectionObserver | Ratio, intersection rectangle, root bounds |
| Did the target's content/border box change size? | ResizeObserver | Logical box-size sequences |
| Did the DOM tree/attributes/text mutate? | MutationObserver | MutationRecord list |

# Knowledge checks with answers

1. **Does `isIntersecting` guarantee an unobscured target?** No.
2. **What does `rootMargin` change?** The root intersection rectangle; `scrollMargin` applies through nested scroll-container clipping.
3. **Why avoid writing size on every ResizeObserver callback?** The write may trigger another observation and create a feedback loop.
4. **What is preferred over `contentRect` for logical sizing?** `contentBoxSize`/`borderBoxSize` inlineSize and blockSize values.
5. **How can pending entries be retrieved before cleanup?** Call `takeRecords()` before `disconnect()`.

# Further reading

- [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [MDN IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)
- [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [MDN ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
- [W3C Intersection Observer Editor’s Draft](https://w3c.github.io/IntersectionObserver/)
- [W3C Resize Observer specification](https://www.w3.org/TR/resize-observer/)
