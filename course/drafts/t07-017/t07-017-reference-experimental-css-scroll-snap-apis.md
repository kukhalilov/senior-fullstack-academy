# CSS layout flexbox grid positioning and responsive design — Reference: Experimental CSS Scroll Snap APIs and state queries

# Scope and version

This lesson accounts for every assigned name in the experimental Scroll Snap API/state-query inventory: two event types, `SnapEvent` and its initialization dictionary, two event data attributes, four proposed event-handler names, one current draft container query, and the five superseded selector proposals. CSS Scroll Snap Level 2 and CSS Conditional Level 5 are Editor’s Drafts. Their text and implementation status can change; the pseudo-class family is explicitly being dropped, while the snapped state query is the current draft direction. Do not infer browser support from the specification text.

# How this group fits the mental model

CSS Scroll Snap Level 1 lets the browser choose a resting target. The Level 2 draft adds two ways to expose that state: events for script that needs to react, and a CSS container state query for styling descendants. The event API is an observation mechanism; it does not make scrolling happen or change which target the browser chooses. The selector names below remain part of the assigned historical inventory because they appear in the Level 2 draft, but the draft says they are being dropped.

# Supplied names explained

| Exact supplied name | Meaning and status |
| --- | --- |
| `scrollsnapchange` | Draft event fired when the realized snap target changes, at the end of the scrolling operation and before `scrollend`, or after a layout snap that changes the target. It targets the scrolling element or `Document`. |
| `scrollsnapchanging` | Draft event fired during scrolling when the eventual snap target changes. Its target is a preview: further input may change the eventual target before scrolling ends. The draft also accounts for layout changes that lead to a snap change. |
| `SnapEvent` | Draft interface extending `Event`, constructed with an event type and optional `SnapEventInit`. It exposes nullable, read-only `snapTargetBlock` and `snapTargetInline` properties. |
| `SnapEventInit` | Draft dictionary extending `EventInit`, with optional nullable `Node` values `snapTargetBlock` and `snapTargetInline`, used to initialize a `SnapEvent`. |
| `snapTargetBlock` | Nullable read-only `Node` for the target associated with the event in the block axis. When the snap target is a pseudo-element, the value is its owning element. It represents the realized target for `scrollsnapchange` and the eventual target for `scrollsnapchanging`. |
| `snapTargetInline` | Same API shape as `snapTargetBlock`, for the inline axis. It can be null when no target applies on that axis. |
| `onscrollsnapchange` | Draft event-handler content/IDL attribute corresponding to `scrollsnapchange`, listed in the Scroll Snap 2 appendix. That appendix says its handler material should move to the HTML event-handler specification, so treat it as a draft proposal. |
| `onscrollsnapchanging` | Draft event-handler content/IDL attribute corresponding to `scrollsnapchanging`; same appendix caveat applies. |
| `onsnapchanged` | Draft `GlobalEventHandlers` IDL handler alias listed in the Scroll Snap 2 appendix for `SnapEvent`s; the appendix says this section should move to HTML. Prefer `addEventListener("scrollsnapchange", ...)` when implementing against an environment that supports the event. |
| `onsnapchanging` | Draft `GlobalEventHandlers` IDL handler alias listed for `SnapEvent`s; the appendix says this section should move to HTML. Prefer `addEventListener("scrollsnapchanging", ...)` where supported. |
| `@container scroll-state(snapped: none \| x \| y \| block \| inline \| both)` | Current draft CSS query for a scroll-state container’s snap state. `none` means no axis is snapped; `x`/`y` are physical axes; `block`/`inline` are logical axes; `both` means both axes. A scroll-state query container is needed, for example with `container-type: scroll-state`. The condition styles descendants of the matching container. |
| `:snapped` | Proposed Level 2 pseudo-class intended to match a snap target regardless of axis. The current Level 2 draft explicitly says this pseudo-class is being dropped in favor of a container state query. Do not teach or ship it as the current approach. |
| `:snapped-x` | Proposed selector for the target snapped on the physical horizontal axis; part of the selector family the draft says is being dropped. |
| `:snapped-y` | Proposed selector for the target snapped on the physical vertical axis; part of the selector family the draft says is being dropped. |
| `:snapped-inline` | Proposed selector for a target snapped on the logical inline axis; part of the dropped selector family. |
| `:snapped-block` | Proposed selector for a target snapped on the logical block axis; part of the dropped selector family. |

The exact query inventory string is `@container scroll-state(snapped: none | x | y | block | inline | both)`; the vertical bars separate alternative values and are not literal text to place in a declaration.

# Cross-item comparison

Use `scrollsnapchanging` when code needs an early indication of where the current operation is likely to land; do not treat it as a committed selection. Use `scrollsnapchange` for the realized changed target. Both events can expose separate block and inline targets. The CSS `snapped` query is for declarative styling of descendants based on a scroll-state container. The dropped pseudo-class proposal would have styled the snap target itself, which is a different styling relationship.

The two event-handler spellings for each event are distinct draft names in the supplied inventory: `onscrollsnapchange` / `onscrollsnapchanging` are listed as event handler attributes, while `onsnapchanged` / `onsnapchanging` are listed as `GlobalEventHandlers` IDL attributes. The Scroll Snap draft flags this appendix for relocation to HTML, so do not assume all four are implemented or interchangeable. The event type strings for `addEventListener` remain `scrollsnapchange` and `scrollsnapchanging`.

# Examples

The state query styles a child of a horizontal snap container when that container has a snapped target on its inline axis. The exact selector query spelling and support remain experimental.

```css
.carousel {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  container-type: scroll-state;
}

@container scroll-state(snapped: inline) {
  .carousel-card {
    outline-color: rebeccapurple;
  }
}
```

Script can inspect the changed target through the draft event interface:

```js
const carousel = document.querySelector(".carousel");

carousel?.addEventListener("scrollsnapchange", (event) => {
  if (event instanceof SnapEvent) {
    console.log(event.snapTargetInline);
  }
});
```

For production code, feature-detect and test the target environments; keep the content and navigation usable when the query or event is unavailable.

# Common mistakes

- Using `scrollsnapchanging` as if it announced a final, irreversible selection.
- Assuming `scrollsnapchange` only fires after a user gesture; the draft also covers target changes caused by layout snaps.
- Assuming a snap event bubbles or can be cancelled; the draft says SnapEvents do not bubble except when targeted at `Document`, and they are not cancellable.
- Treating `snapTargetBlock` and `snapTargetInline` as non-null element references; they are nullable `Node`s, and a pseudo-element target is represented by its owning element.
- Styling the scroll container as if the `snapped` query directly selects the snap target; container queries style descendants of the query container.
- Presenting `:snapped` and its four axis variants as current; the Scroll Snap 2 draft says this selector approach is being dropped.
- Assuming draft event-handler aliases have stable HTML integration; the Scroll Snap appendix itself says the section should be moved to HTML.
- Treating the draft query syntax or API as widely supported without checking current implementation data.

# Knowledge checks with answers

1. **Which event reports the target that the current scroll operation is expected to reach?** `scrollsnapchanging`; subsequent user input may change that target.
2. **Which event reports the changed, realized snap target?** `scrollsnapchange`.
3. **What do the two SnapEvent target attributes represent?** The nullable snap targets for the block and inline axes, respectively; pseudo-element targets map to their owning element.
4. **What is the current draft direction for CSS styling of snapped state?** A `snapped` scroll-state container query; the proposed `:snapped` selector family is being dropped.
5. **Where does the condition’s style apply?** To descendants of the query container, not directly to the container itself.
6. **Can a SnapEvent be cancelled or normally bubble?** No; it is not cancellable and does not bubble, except when its target is `Document`.

# Sources

- [CSS Scroll Snap Module Level 2, current Editor’s Draft](https://drafts.csswg.org/css-scroll-snap-2/) — §§4–5 and Appendix A: dropped `:snapped` direction, event timing, target semantics, `SnapEvent`/`SnapEventInit`, and draft handler attributes.
- [CSS Conditional Rules Module Level 5, current Editor’s Draft](https://drafts.csswg.org/css-conditional-5/) — §§5.1, 5.4, and 6.3.3: scroll-state query containers, `@container`, and the `snapped` feature values.
- [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) — snap containers, eligible targets, and browser-selected snap positions.
- [DOM Standard](https://dom.spec.whatwg.org/) — event propagation and cancellation model referenced by the draft IDL.
