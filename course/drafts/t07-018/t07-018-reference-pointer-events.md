<!-- GENERATED DRAFT: manual factual review replaces the shallow generated index; keep in drafts until curriculum release promotes it. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Pointer Events direct-manipulation property (`touch-action`)

# Scope and version

This reference audits the single CSS property in this lesson’s frozen inventory: `touch-action`. Despite the inventory group’s former plural title, this is not the CSS `pointer-events` property; that separate hit-testing property is inventoried under Basic User Interface. `touch-action` is defined by Pointer Events, a hardware-agnostic event model for mouse, pen, and touch, and controls which direct-manipulation panning/zooming behaviors the user agent may handle.

The current published Pointer Events Level 3 Recommendation is dated 30 June 2026 and supersedes Level 2. Its core value grammar is narrower than the living WHATWG Compatibility Standard’s additional compatibility values. The current interoperable author-facing syntax therefore includes direction-specific pan values and `pinch-zoom`, but MDN warns that not every part is implemented in every browser; check target support. The property was widely available in the captured MDN support data, while that general label does not guarantee each newer token works everywhere.

# How this group fits the mental model

When a user drags or pinches on a surface, the browser must decide whether to scroll or zoom the viewport, or leave the gesture to the application’s pointer handlers. `touch-action` declares that policy in CSS before the gesture begins. It is a permission/constraint on browser panning and zooming, not a way to select an event target, disable a control, cancel a pointer event, or prevent every browser default action.

The browser evaluates the hit-tested element and relevant ancestors together. For panning, the constraints are checked up to the nearest inclusive scroll container; for zooming, they are checked up to the top-level document. A behavior must be allowed by each relevant value. Once the browser has started handling a gesture, changing the CSS cannot renegotiate that in-progress gesture. This early, declarative decision lets the browser arbitrate input before JavaScript’s event handlers run and can avoid relying on late event cancellation.

# Supplied names explained

## `touch-action`

**Pointer Events Level 3 grammar:** `auto | none | [ pan-x || pan-y ] | manipulation`.

**Current compatibility grammar:** `auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation`.

**Initial:** `auto`. **Applies:** elements except non-replaced inline elements, table rows, row groups, table columns, and column groups; in practical terms, it applies to elements supporting both `width` and `height`. **Inherited:** no. **Computed value:** as specified. **Animation:** not animatable. CSS-wide keywords are accepted.

The direction-specific values and `pinch-zoom` are specified by the WHATWG Compatibility Standard as additions for web compatibility. `pan-left pan-right` is invalid when `pan-x` expresses the same allowed horizontal direction; similarly `pan-up pan-down` is represented by `pan-y`. The two axis groups, and the optional `pinch-zoom`, can be combined where the grammar permits. `manipulation` is a keyword shorthand for permitting horizontal and vertical panning plus continuous/pinch zoom while disallowing multi-activation zoom behaviors such as double-tap zoom. It is equivalent to `pan-x pan-y pinch-zoom` in the compatibility syntax.

### What each value allows

- **`auto`** leaves the browser’s default panning and zooming behavior available. It does not promise that every gesture will be consumed; device, platform, and browser policy still determine how gestures are recognized.
- **`none`** forbids browser-handled viewport panning and zooming that begins on the element. It does not prevent text selection, link activation, form controls, or JavaScript events.
- **`pan-x` / `pan-y`** allow browser panning that starts along the corresponding horizontal or vertical axis. The gesture’s axis is locked once the browser takes over, though a pan may reverse direction within that axis.
- **`pan-left`, `pan-right`, `pan-up`, `pan-down`** constrain the direction in which scrolling begins. The names describe the scrolling/panning direction, not simply the direction the finger moves: for example, a screen scroll upward is commonly initiated by dragging a finger downward.
- **`pinch-zoom`** allows multi-finger viewport zoom (and associated multi-finger panning as documented by the compatibility definition) while author code handles the constrained single-finger pan directions.
- **`manipulation`** permits panning and continuous zooming while ruling out multi-activation zoom gestures such as double-tap-to-zoom. Historically this could avoid a click delay, but do not rely on a particular delay change as a guaranteed consequence on modern devices.

### Gesture arbitration and timing

For a direct-manipulation pointer such as a finger or stylus on a touch-sensitive display, the browser checks the target’s coordinate-space permissions and relevant ancestors. CSS transforms can rotate an element’s axes relative to the screen, so “horizontal” in the element’s coordinate space need not match the screen’s horizontal axis. Panning checks the chain from the hit-tested element to the nearest inclusive scroll container. Zooming checks the chain through the top-level document. A nested element cannot grant a behavior disallowed by a relevant ancestor.

The browser decides whether it will handle a gesture at its start. Changing `touch-action` inside `pointerdown` or during a gesture will not stop or change the browser’s current pan/zoom action. If the browser takes over a pointer stream for a direct-manipulation action, the Pointer Events model suppresses the active event stream and may dispatch `pointercancel`; application code should handle cancellation and release any drag state. This is distinct from using `preventDefault()` to cancel a pointer event: canceling pointer events cannot veto viewport panning/zooming.

The property’s name is historical: its scope includes all direct-manipulation pointer inputs that permit panning and zooming, not only touch. Ordinary mouse input does not use these viewport gesture defaults. The property does not cascade into an embedded browsing context; put the policy in the document inside the iframe whose gestures need control.

## Cross-item comparison

| Goal | Mechanism | What it controls |
| --- | --- | --- |
| Permit or constrain browser panning/zooming for pointer gestures | `touch-action` | Direct-manipulation gesture defaults, decided before event handlers. |
| Choose an element during pointer hit testing | `pointer-events` | Whether/how an element can be a pointer hit-test target; it does not grant or prohibit native scroll/zoom policy. |
| Cancel a cancelable event’s default action | `preventDefault()` on the relevant event | That event’s cancelable default action; it cannot cancel the browser’s pan/zoom decision once a pointer gesture is taken over. |
| Control scroll chaining or overscroll behavior | `overscroll-behavior` | Boundary/scroll-chain behavior; it is not a substitute for the initial direct-manipulation permission declared by `touch-action`. |

# Examples

Allow the page to scroll vertically and zoom while a carousel uses horizontal pointer movement for its own drag behavior:

```css
.carousel {
  touch-action: pan-y pinch-zoom;
}
```

For a custom drawing surface, browser pan/zoom can be disabled only over the interaction area. Keep the region as small as practical, provide other ways to perform the task, and retain browser zoom access elsewhere:

```css
.drawing-surface {
  touch-action: none;
}
```

For a horizontally scrollable element that should retain native vertical page scrolling and pinch zoom, `pan-y pinch-zoom` is the common policy. If instead the browser should provide all native panning and zooming, keep the default `auto` and implement only the custom behavior that does not conflict with it.

The policy must be present before the gesture starts. A reactive style update in `pointerdown` is too late to change which side owns that gesture. If the gesture has a custom drag lifecycle, treat `pointercancel` as a legitimate browser hand-off, not as a successful `pointerup`.

# Common mistakes

- Confusing `touch-action` with CSS `pointer-events`; one controls native gesture behavior, the other affects hit testing.
- Setting `touch-action: none` on the whole page or application. It can remove browser zoom and scrolling affordances, harming users who depend on them.
- Trying to change `touch-action` from `auto` to `none` inside `pointerdown`. The decision for the current gesture has already been made.
- Assuming the property is inherited. It is not; the browser independently checks applicable ancestors as part of gesture arbitration.
- Applying it to a non-replaced inline `<span>` or a table row and expecting it to work. Make the interaction surface an applicable box, commonly `inline-block` or `block` with dimensions.
- Assuming `none` disables text selection, clicks, links, or form controls. Its defined effect is about browser viewport panning and zooming.
- Assuming `pan-x` means “the finger must move toward screen-right,” or that a gesture may switch axes after the browser takes over.
- Treating the Level 3 core grammar as the complete modern grammar; `pan-left/right/up/down` and `pinch-zoom` are additional compatibility values. Conversely, do not assume every browser supports every syntax token equally.
- Forgetting the iframe boundary or the role of transformed coordinate spaces when debugging nested or rotated gesture regions.
- Failing to clear pointer-drag state on `pointercancel` when the browser takes over scrolling or zooming.

# Knowledge checks with answers

1. **What does `touch-action: none` disable?** Browser-handled viewport panning and zooming starting on the element; it does not disable pointer events, text selection, links, or controls.
2. **Why does changing it during `pointerdown` not take effect for that finger?** The user agent determines gesture handling at the start and ignores relevant changes for the duration of that gesture.
3. **Why can a child’s `pan-x` still fail to enable horizontal panning?** A relevant ancestor’s `touch-action` must also permit the behavior; the browser evaluates the ancestor chain.
4. **What is the practical difference between `pan-y` and `pan-y pinch-zoom` on a carousel?** The first permits browser vertical panning; the second also explicitly permits multi-finger viewport zoom.
5. **How is the compatibility value `manipulation` represented by the expanded grammar?** `pan-x pan-y pinch-zoom`, while also excluding multi-activation zoom behavior such as double-tap zoom.
6. **Why should `none` be narrowly scoped?** It may disable browser zoom and direct-manipulation scrolling in that region; that can remove important user controls.

# Sources

- [Pointer Events Level 3 Recommendation](https://www.w3.org/TR/pointerevents3/) — §§8.1–8.3: property definition, scope, ancestor/scroll-container algorithm, timing, values, and interaction with pointer-event suppression.
- [WHATWG Compatibility Standard](https://compat.spec.whatwg.org/) — §3.5.1: expanded direction and `pinch-zoom` values, and `manipulation` alias.
- [MDN: `touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) — current formal syntax, applicability, compatibility note, examples, and accessibility warning.
- [Pointer Events Level 2 Recommendation](https://www.w3.org/TR/pointerevents2/) — brief history of the original property grammar before Level 3.
- [CSS Overflow Level 3](https://www.w3.org/TR/css-overflow-3/) — scroll-container terminology used by the panning algorithm.
