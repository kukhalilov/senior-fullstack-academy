
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Scroll-Driven Animations properties

# Scope and version

This lesson audits all 11 supplied properties: `animation-range`, `animation-range-start`, `animation-range-end`, `scroll-timeline`, `scroll-timeline-name`, `scroll-timeline-axis`, `view-timeline`, `view-timeline-name`, `view-timeline-axis`, `view-timeline-inset`, and `timeline-scope`. The latest published W3C version is a Working Draft dated 6 June 2023; the current CSSWG Editor’s Draft is dated 25 September 2026 and is work in progress. MDN marks the inventoried features Baseline 2026 in the captured references, but `timeline-scope` notes that some parts have varying support. Check each required feature on the browsers you ship.

Briefly, compared with the 2023 published draft, the current Editor’s Draft changes named-timeline lookup to nearest-ancestor/last-in-tree-order rules, adds `timeline-scope: all`, changes names to `<dashed-ident>` (so they begin with `--`), and removes the former `scroll-timeline-attachment` and `view-timeline-attachment` proposals in favor of `timeline-scope`. The earlier `getCurrentTime()` proposal was also removed; do not use these older APIs/properties as current syntax.

# How this group fits the mental model

An ordinary CSS animation advances with clock time. A scroll-driven animation replaces that clock with progress derived from a scroller or an element moving through a scrollport. Scroll forward and it advances; scroll backward and it reverses. The animation’s keyframes still describe the visual change; the timeline decides which point in that animation is active at the current scroll position.

There are two different timelines:

- **Scroll progress:** a scroll container moves from its startmost to endmost scroll position. This is useful for a reading progress indicator or an effect tied to the whole scroller.
- **View progress:** one subject box enters, passes through, and leaves the nearest relevant scrollport. Each subject has its own timeline. This is useful for revealing or emphasizing each item as it passes through a page or nested scroller.

The core property group defines and names those timelines and narrows the part of a timeline to which an animation is attached. A companion property, `animation-timeline` (covered in its assigned lesson), connects the animation to a timeline. The `animation` shorthand and animation fill/timing properties still matter. Properties alone do not start an animation if there is no keyframe animation attached.

Scroll-driven is **not** scroll-triggered: a scroll-triggered animation starts because a scroll threshold is crossed but then advances by clock time. Progress-driven animations track the scroll continuously and can reverse. Scroll-trigger features are a separate CSS Animations Level 2 area.

# Supplied names explained

## Shared property rules

All the inventoried longhands apply to all elements and are not inherited. Timeline name, axis, and range properties are not themselves animatable; `view-timeline-inset` is animatable by computed value type in the current draft. CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, `revert-layer`) also apply. A declared timeline exists only if its source/subject and axis can produce an active timeline; a syntactically valid declaration may therefore have no visible effect.

Names use `<dashed-ident>` syntax, so authored names begin with `--` (for example, `--reading`). A `none` name creates no named timeline. Timeline names are case-sensitive identifiers; use one spelling consistently. The name longhands are coordinated list properties: entries pair with their corresponding axis/inset entries by index, shorter component lists repeat to match the base name list, and surplus entries are ignored according to CSS list-matching rules.

| Property | Initial value | Computed value | Animation type |
| --- | --- | --- | --- |
| `scroll-timeline-name`, `view-timeline-name` | `none` | List of identifiers or `none` | Not animatable |
| `scroll-timeline-axis`, `view-timeline-axis` | `block` | List of specified axis keywords | Not animatable |
| `scroll-timeline` | `none` name, `block` axis | As for its longhands | Not animatable |
| `view-timeline` | `none` name, `block` axis, `auto` inset | As for its longhands | Name/axis not animatable; inset by computed value type |
| `view-timeline-inset` | `auto` | List of start/end pairs, each `auto` or computed `<length-percentage>` | By computed value type |
| `timeline-scope` | `none` | `none`, `all`, or list of identifiers | Not animatable |
| `animation-range-start`, `animation-range-end` | `normal` | List of `normal` or timeline-range name plus percentage | Not animatable |
| `animation-range` | `normal` for both longhands | As for its longhands | Not animatable |

## Scroll progress timeline properties

### `scroll-timeline-name`

**Grammar:** `[ none | <dashed-ident> ]#`. **Initial:** `none`. Names one or more scroll progress timelines associated with the element that is the scroll source. The `#` means comma-separated list. The named timeline is referenced by the same dashed name in `animation-timeline`.

### `scroll-timeline-axis`

**Grammar:** `[ block | inline | x | y ]#`. **Initial:** `block`. Chooses the source scroller’s axis. `block` and `inline` are logical axes and respond to writing mode; `x` and `y` select physical horizontal and vertical axes. The selected axis must have scrollable range or the timeline is inactive.

### `scroll-timeline`

**Grammar:** `[ <'scroll-timeline-name'> <'scroll-timeline-axis'>? ]#`. This shorthand sets the name and axis together; initial component values are `none` and `block`. When both are written, name comes first, then axis: `scroll-timeline: --reading block`. It is declared on the scroll source. The current draft lists the property for all elements, but an element without a usable scroll container/scrollable axis cannot provide an active timeline.

An anonymous scroll progress timeline is an alternative when you do not need naming: `animation-timeline: scroll([ <scroller> || <axis> ]?)`. Its scroller is `nearest` (default), `root` (document viewport), or `self`; its axis is `block` (default), `inline`, `x`, or `y`. The `scroll()` function belongs to `animation-timeline`, not to `scroll-timeline`.

Progress is conceptually current scroll offset divided by the available scroll range (scrollable overflow size minus scroll container size). If there is no scrollable range, the timeline is inactive. In right-to-left or other writing modes, a physical x/y choice does not make the scroll origin equal to a naïve `scrollLeft`/`scrollTop` assumption.

## View progress timeline properties

### `view-timeline-name`

**Grammar:** `[ none | <dashed-ident> ]#`. **Initial:** `none`. Names one or more view progress timelines associated with the element whose principal box is the subject. A different descendant animation can consume that named timeline if timeline lookup reaches it.

### `view-timeline-axis`

**Grammar:** `[ block | inline | x | y ]#`. **Initial:** `block`. Selects the axis along which the subject’s visibility changes. If the nearest relevant scroll container is not scrollable in that axis, the timeline is inactive.

### `view-timeline-inset`

**Grammar:** `[ [ auto | <length-percentage> ]{1,2} ]#`. **Initial:** `auto`. It adjusts the effective scrollport visibility range used to calculate when the subject enters and exits. `auto` uses the corresponding `scroll-padding` value (which is commonly zero if not set). A positive length/percentage moves the relevant edge inward; a negative value moves it outward. One value applies to both start and end; two values set start and end separately. Percentages are relative to the corresponding dimension of the relevant scrollport. This changes timeline geometry; it does not move or resize the element.

### `view-timeline`

**Grammar:** `[ <'view-timeline-name'> [ <'view-timeline-axis'> || <'view-timeline-inset'> ]? ]#`. This shorthand sets name, axis, and inset; the name is first, then axis and inset may appear in either order. Component initial values are `none`, `block`, and `auto`. Example: `view-timeline: --chapter block 10% 15%`.

An anonymous view timeline is an alternative: `animation-timeline: view([ <axis> || <view-timeline-inset> ]?)`. It always uses the nearest ancestor scroll container that can scroll on the selected axis; unlike `scroll()`, there is no root/nearest/self scroller argument. Default axis is `block`; the optional inset adjusts the visibility range.

A view timeline’s `cover` range runs from the position where the subject’s start edge meets the visibility range’s end edge through to where the subject’s end edge meets its start edge. A subject taller/wider than the scrollport can have different `contain` behavior than a smaller subject. The view timeline is inactive if its subject box or relevant scroll range is absent, if its start and end positions collapse to the same point, or in cases such as viewport view timelines in paged media. Transforms are ignored when computing the subject’s view range; use its untransformed principal box as the mental model.

## Timeline name lookup: `timeline-scope`

**Grammar:** `none | all | <dashed-ident>#`. **Initial:** `none`. **Computed:** `none`, `all`, or the ordered name list. The current draft resolves names globally by default using tree-order rules; the matching timeline may be on the element, an ancestor, or elsewhere in tree order. `timeline-scope` creates a local boundary so names defined by the scoped element or its flat-tree descendants are visible only to that subtree. Put `timeline-scope: --reading` on an ancestor that contains both the named timeline source and the element whose animation refers to `--reading`; this permits sibling or cousin wiring and local reuse in separate components. `all` scopes all eligible descendant timeline names within that subtree, while respecting nested scopes. `none` makes no scope change.

When multiple timelines with the same name are candidates, the current draft uses nearest-ancestor/last-in-tree-order lookup. Names should be unique within a component scope unless reuse is deliberate. If one element defines the same name for both scroll and view timelines, the later name declaration takes precedence; in a name conflict between timeline kinds, scroll progress timelines take precedence. Avoid such conflicts rather than relying on obscure precedence.

`timeline-scope` works only with named timelines. It does not affect anonymous `scroll()` or `view()` timelines. The current Level 1 draft has the `all` value and updated lookup behavior; test those details across target browsers. The scope boundaries use the flat tree and a nested scope declaration can constrain names more locally.

## Related Web Animations API

The module also defines `ScrollTimeline` and `ViewTimeline` JavaScript objects. A `ScrollTimeline` is constructed with a `source` element (or `null` for the document viewport) and an optional `axis` (`block` by default); it exposes `source` and `axis`. A `ViewTimeline` takes a required `subject` plus optional `axis` and `inset`, and exposes its subject, source, and start/end scroll offsets. Both inherit `currentTime`, which reports progress as a percentage and is `null` while the timeline is inactive; view offsets are also `null` while inactive. These objects can be supplied as the timeline when creating a Web Animations `Animation` or calling `Element.animate()`. CSS declarations and these objects are two ways to describe the same scroll-progress model; choose the imperative API when JavaScript must construct or control the animation. These APIs are draft-defined, so feature-detect them independently of the CSS properties.

## Animation attachment ranges

### `animation-range-start` and `animation-range-end`

Each longhand has grammar `[ normal | <length-percentage> | <timeline-range-name> <length-percentage>? ]#`; each is non-inherited, applies to all elements, starts with `normal`, and is not animatable. Start and end are coordinated with the corresponding `animation-name` list. `normal` means the natural start or end of the attached timeline. A length/percentage identifies a point measured from the start of the full timeline. A named range plus optional percentage measures from that subrange’s start; omitted percentage is `0%` for start and `100%` for end. Percentages are relative to the named range if present, otherwise to the full timeline.

The current view progress range names are:

| Name | Interval along subject motion |
| --- | --- |
| `cover` | Entire view progress timeline, from beginning to end of its traversal through the visibility range. |
| `contain` | Interval in which the subject is fully within the visibility range, or fully covers it when the subject is larger. |
| `entry` | Portion while the subject enters; from the start of `cover` to the start of `contain`. |
| `exit` | Portion while it leaves; from the end of `contain` to the end of `cover`. |
| `entry-crossing` | Portion while the subject crosses the visibility range’s end edge. |
| `exit-crossing` | Portion while the subject crosses the visibility range’s start edge. |
| `scroll` | Full scroll range of the scroller underlying a view progress timeline in the current draft. Verify implementation support before relying on it. |

`animation-range-start` sets where keyframes mapped to 0% attach; `animation-range-end` sets where keyframes mapped to 100% attach and can truncate the active interval. Valid offsets can also extend the attachment range beyond a default interval. Use the diagram in your head: timeline gives the long road, a named range selects a segment, and percentages choose points within that segment.

### `animation-range`

**Grammar:** `[ <'animation-range-start'> <'animation-range-end'>? ]#`. This shorthand sets both longhands. An item can contain up to four space-separated pieces: start range and optional offset, then end range and optional offset. Items are comma-separated for multiple animations and coordinate by index with `animation-name`; shorter range lists repeat and extras are ignored. If the start includes a named range and end is omitted, the end defaults to the same range at `100%`; otherwise an omitted longhand resets to its initial `normal`.

Examples and their meaning:

```css
animation-range: entry;                  /* entry 0% through entry 100% */
animation-range: entry exit;             /* entry 0% through exit 100% */
animation-range: entry 10% exit 90%;     /* trim both ends of those ranges */
animation-range: 20% 80%;                /* 20% to 80% of the entire timeline */
animation-range: entry 10% 90%;          /* entry 10% through 90% of the timeline */
```

`animation-range` restricts the animation attachment interval; it does not redefine the source scroller or the view visibility range. Use `view-timeline-inset` to change where visibility progress begins/ends, and `animation-range` to select which part of that progress drives the keyframes. With fill modes `backwards`, `forwards`, or `both`, endpoint keyframe styles can persist before/after the active interval; without fill, styles apply only during the active interval.

The current CSS Animations Level 2 draft allows a timeline component in the `animation` shorthand; when omitted, the shorthand resets `animation-timeline` to `auto`. The `animation-range-start` and `animation-range-end` longhands are reset-only subproperties of that shorthand. To avoid accidentally restoring the time-based document timeline or normal attachment range, put separate `animation-timeline` and `animation-range` declarations after `animation` (or use timeline syntax inside the shorthand only after checking browser support).

# Cross-item comparison

| Question | Scroll progress timeline | View progress timeline |
| --- | --- | --- |
| What supplies progress? | A scroller’s position from start to end. | A subject box’s passage through a scrollport’s visibility range. |
| Named source declarations | `scroll-timeline-name` / `scroll-timeline-axis` / `scroll-timeline` on the scroll source. | `view-timeline-name` / `view-timeline-axis` / `view-timeline-inset` / `view-timeline` on the subject. |
| Anonymous alternative | `animation-timeline: scroll([nearest|root|self] [axis])`. | `animation-timeline: view([axis] [inset])`; nearest applicable ancestor scroller is always used. |
| Typical use | Reading progress, scroll-linked scene effect, horizontal carousel progress. | Entry/exit reveal for a particular heading, card, or section. |
| Common inactive case | No scrollable distance on the selected axis. | No usable subject/scrollport or collapsed visibility progress range. |

Use named timelines and `timeline-scope` when the source and animated element are not in the normal descendant lookup relationship. Use anonymous functions for a compact local effect where the nearest scroller is exactly the desired source.

# Examples

## A named scroll progress bar driven by a sibling scroller

```html
<section class="reader">
  <div class="progress" aria-hidden="true"><span></span></div>
  <div class="scroller">
    <article><h1>Chapter</h1><p>Long content…</p></article>
  </div>
</section>
```

```css
.reader { timeline-scope: --reading; }
.scroller {
  block-size: 24rem;
  overflow: auto;
  scroll-timeline: --reading block;
}
.scroller article { min-block-size: 80rem; }
.progress > span {
  display: block;
  inline-size: 100%;
  block-size: 0.25rem;
  background: rebeccapurple;
  transform-origin: left;
  animation: fill 1ms linear both;
  animation-timeline: --reading;
  animation-range: 0% 100%;
}
@keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .progress { display: none; } }
```

The `reader` scope exposes the named timeline to the sibling progress indicator. The scroller must actually have scrollable content. The `1ms` is a conventional nonzero duration for the keyframe effect; scroll progress, not that millisecond clock, determines the current animation progress. The progress bar is decorative and hidden from assistive technology; provide a real text or semantic progress indicator if users need the value.

## Reveal each subject during its own entry range

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.chapter > * {
  animation: reveal 1ms linear both;
  animation-timeline: view(block 10% 10%);
  animation-range: entry 0% entry 100%;
}

@media (prefers-reduced-motion: reduce) {
  .chapter > * { animation: none; }
}
```

Each child gets its own anonymous view progress timeline through its nearest scroll container. Insets shrink the effective visibility range; the named `entry` attachment range then maps the keyframes only to the entry portion. This example is decorative; text remains visible and understandable when animation is disabled. Avoid hiding important text at the `from` keyframe if unsupported browsers or reduced-motion settings would leave it hidden.

# Common mistakes

- Confusing “scroll-driven” progress with a “scroll-triggered” time animation.
- Setting a timeline but forgetting to attach the keyframe animation with `animation-timeline`.
- Writing `animation-timeline` or `animation-range` before a later `animation` shorthand that resets omitted timeline/range values.
- Assuming the viewport is the source when a nearer nested scroller exists; choose the scroller intentionally and verify the axis.
- Choosing `x` or `y` when the scroller has no scrollable range there, or forgetting that logical `block`/`inline` axes depend on writing mode.
- Expecting a timeline to be active when the content fits without overflow, the subject has no principal box, or start and end coincide.
- Using `view()` where the effect should follow the entire container scroll, or `scroll()` where each subject needs its own entry/exit progress.
- Treating `animation-range` as a way to resize the scrollport. Use `view-timeline-inset` for the visibility area.
- Assuming `contain` always means “fully inside”; an oversized subject can cover the visibility range instead.
- Assuming `animation-duration` is the scroll rate. Scroll position controls progress; animation timing/easing and iteration settings still shape keyframe interpolation.
- Reusing names across components without `timeline-scope`, then resolving the wrong named timeline due to lookup order.
- Expecting `timeline-scope` to expose anonymous `scroll()` / `view()` timelines.
- Treating Baseline 2026 as a guarantee for every old browser or for every newer timeline-range/lookup behavior.
- Making content invisible or inaccessible until the user scrolls. Motion must remain optional and should respect reduced-motion preferences.

# Knowledge checks with answers

1. **What is the difference between scroll and view progress?** Scroll progress follows the scroller’s start-to-end offset; view progress tracks one subject box through its scrollport.
2. **Why might `animation-timeline: scroll()` be inactive?** Its selected source/axis may not have scrollable range; the `self` source also must be a scroll container in that axis.
3. **What does `timeline-scope` solve?** It makes a named timeline discoverable to descendants of a chosen ancestor, such as an animated sibling of the timeline source. It cannot scope anonymous timelines.
4. **When is `entry` different from `cover`?** `cover` spans the subject’s entire passage; `entry` covers only its entering portion before it is fully contained (or covers the visibility range if oversized).
5. **Which property changes the effective scrollport visibility edges?** `view-timeline-inset`; `animation-range` chooses an attachment segment on the resulting timeline.
6. **Why should separate timeline declarations come after `animation`?** The shorthand resets an omitted timeline to `auto`, and its reset-only range subproperties to `normal`; later declarations restore the intended scroll timeline and attachment range.
7. **Does a scroll-driven animation play only forward?** No. Its progress follows scroll position, so scrolling backward reverses progress and related animation events can occur in reverse boundary order.

# Sources

- [Scroll-driven Animations Module Level 1 Editor’s Draft](https://drafts.csswg.org/scroll-animations-1/) — latest working text for timelines, all inventoried properties, ranges, scoping, and current draft changes.
- [W3C Scroll-driven Animations Working Draft](https://www.w3.org/TR/scroll-animations-1/) — latest published version (6 June 2023); older than the current Editor’s Draft.
- [MDN CSS scroll-driven animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) — concepts, syntax, and implementation guidance.
- [MDN: `scroll-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-timeline), [MDN: `view-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline), [MDN: `view-timeline-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline-inset), [MDN: `timeline-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-scope), and [MDN: `animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range) — property syntax, definitions, and support details.
- [MDN: `animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline), [MDN: `scroll()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/scroll), and [MDN: `view()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/view) — required companion timeline selection syntax.
- [CSS Animations Level 2](https://drafts.csswg.org/css-animations-2/) — related animation timeline/shorthand model and distinction from trigger functionality.
