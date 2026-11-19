<!-- GENERATED DRAFT: manual factual review replaces the shallow generated index; keep in drafts until curriculum release promotes it. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS animation-timeline properties

# Scope and version

This lesson audits the one inventoried property, `animation-timeline`, and the timeline syntaxes it accepts. The latest published W3C CSS Animations Level 2 draft is a Working Draft dated 2 June 2023; the current CSSWG Editor’s Draft is dated 18 August 2026 and is work in progress. In CSS Animations Level 1, keyframe animations normally use the clock-based document timeline. Level 2 adds explicit timeline selection, including scroll/view progress timelines defined by the Scroll-driven Animations module. MDN marks the property Baseline 2026, but older browser versions and some subfeatures can still differ.

One current documentation inconsistency matters: the CSS Animations Level 2 Editor’s Draft includes `<single-animation-timeline>` in the `animation` shorthand grammar, so the shorthand can set a timeline in implementations following that syntax. The current MDN `animation-timeline` prose still calls it reset-only and says a value cannot be set in the shorthand; MDN’s separate `animation` page lists it as a shorthand component. The robust cross-browser pattern is to write `animation-timeline` after the `animation` shorthand. If using the newer shorthand form, check support for that exact syntax.

# How this group fits the mental model

`@keyframes` describes what changes. `animation-timeline` answers when the animation progresses. By default, `auto` uses the document’s time-based `DocumentTimeline`, so elapsed time advances keyframes. Setting a scroll/view timeline instead makes the current scroll position determine progress: scroll down to advance and up to reverse. The selected timeline does not supply keyframes, choose the animated CSS properties, or start a keyframe animation by itself.

The animation target needs an animation (`animation-name` or `animation` shorthand) and a timeline. A named scroll/view timeline is defined on a scroller/subject and then referenced by name; anonymous `scroll()` and `view()` functions are compact alternatives. See the companion [Scroll-Driven Animations lesson](t07-018-reference-experimental-scroll-driven-animations.md) for timeline construction, named-range math, `timeline-scope`, and full property interactions. `animation-timeline` is the connector between that model and a CSS keyframe animation.

# Supplied names explained

## `animation-timeline`

**Grammar:** `<single-animation-timeline>#`, where a single value is `auto | none | <dashed-ident> | <scroll()> | <view()>`. The `#` means one or more comma-separated values. CSS-wide keywords are also accepted. **Initial:** `auto`. **Applies:** all elements. **Inherited:** no. **Computed value:** a list whose items are `none`, `auto`, a case-sensitive CSS identifier, or a computed `scroll()`/`view()` function. **Animation type:** not animatable.

### `auto`

Uses the default document timeline, which advances with elapsed document time. Omitting `animation-timeline` has this same effect. It is not an alias for scroll progress.

### `none`

Associates the animation with no timeline, so it does not progress and no animation effect is shown. This is distinct from `auto`, which keeps normal time-based playback.

### `<dashed-ident>`

References an in-scope named scroll or view progress timeline declared using `scroll-timeline-name`/`scroll-timeline` or `view-timeline-name`/`view-timeline`. Authored names use the `<dashed-ident>` syntax and begin with `--`, for example `--page-scroll`. Names are case-sensitive. If no matching timeline exists, that animation has no associated timeline; it does **not** fall back to `auto`. Named lookup and local scope behavior follow the current Scroll-driven Animations draft; see the companion lesson before reusing names across components.

### `scroll()` anonymous scroll progress timeline

**Syntax:** `scroll([ <scroller> || <axis> ]?)`. The `<scroller>` is `nearest` (default: nearest ancestor scroll container with a scrollable axis), `root` (document viewport), or `self` (the animated element’s own box). The `<axis>` is `block` (default), `inline`, `x`, or `y`. Block/inline are logical and follow writing mode; x/y are physical. If the selected source has no scrollable range in the selected axis, the timeline is inactive. The `||` means scroller and axis can be written in either order, such as `scroll(root block)` or `scroll(inline nearest)`.

### `view()` anonymous view progress timeline

**Syntax:** `view([ <axis> || <view-timeline-inset> ]?)`. It tracks the visibility of the animated element (the subject) through its nearest ancestor scroll container that can scroll on the selected axis. The axis defaults to `block`; unlike `scroll()`, `view()` has no scroller selector. An inset is `auto` or one/two `<length-percentage>` values; it adjusts the start/end edges of the effective scrollport. `auto` uses the corresponding `scroll-padding` value, commonly zero. Positive values inset the edge and negative values outset it. If the subject/scroll range is unavailable or the view range collapses, the timeline is inactive.

# Lists, keyframes, and shorthand interactions

`animation-timeline` is a comma-separated list coordinated by index with `animation-name`. With fewer timeline values than animation names, values repeat in order; extra timeline values are ignored. For example, the first timeline drives the first named animation, the second timeline drives the second, and so on. An explicit `none` entry leaves the matching animation without a timeline.

```css
.item {
  animation-name: reveal, color-shift;
  animation-duration: 1ms, 3s;
  animation-timeline: view(), auto;
}
```

Here `reveal` follows the item’s view progress while `color-shift` remains time-based. The order of the comma-separated values matters.

The `animation` shorthand resets an omitted timeline to `auto`. In current CSS Animations Level 2 draft syntax, the shorthand may also contain a timeline component, but older/partial implementations can reject it or the whole shorthand. Put a separate `animation-timeline` declaration after the shorthand for the most predictable cascade. `animation-range-start` and `animation-range-end` are reset-only subproperties; use the separate `animation-range` declaration after the shorthand as well.

`animation-duration` and timing functions still affect how keyframes map to timeline progress. On finite scroll-driven timelines, the current drafts allow `animation-duration: auto` to fit the available attachment range; `1ms` is also commonly used as a nonzero duration while the scroll timeline, not the clock, drives progress. `animation-fill-mode`, delay, direction, iteration count, and play state continue to affect the effect. See their own lessons for full grammars and edge cases.

# Cross-item comparison

| Value | Progress comes from | Best mental model |
| --- | --- | --- |
| `auto` | Elapsed time on the document timeline | Traditional CSS keyframe animation. |
| `<dashed-ident>` | A named scroll or view progress timeline | Reuse a named source, including across related elements within its scope. |
| `scroll()` | A selected scroll container and axis | Follow the container’s overall scroll progress. |
| `view()` | The animated subject passing through its nearest applicable scrollport | Follow one element’s entry, passage, and exit. |
| `none` | No timeline | Disable progression of this animation. |

Scroll-driven animations progress continuously with scroll and reverse when the user scrolls backward. Scroll-triggered animations are different: a threshold triggers a time-driven animation. The latter belongs to CSS animation trigger features, not to `animation-timeline` itself.

# Examples

## Progressive scroll-linked reading bar

```html
<div class="reader">
  <div class="scroller"><article>Long article content…</article></div>
  <div class="reading-bar" aria-hidden="true"></div>
</div>
```

```css
.reader { timeline-scope: --reading; }
.scroller {
  block-size: 24rem;
  overflow: auto;
  scroll-timeline: --reading block;
}
.scroller article { min-block-size: 80rem; }

@keyframes fill-bar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* No animation is applied in browsers without the required syntax. */
@supports (animation-timeline: scroll()) {
  .reading-bar {
    transform-origin: left;
    animation: fill-bar 1ms linear both;
    animation-timeline: --reading;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-bar { display: none; }
}
```

The named timeline is placed on the scroller; `timeline-scope` on their shared ancestor makes it visible to the sibling bar. The bar is decorative and hidden from assistive technology. If reading progress is important to users, expose it with a semantic progress indicator and ensure unsupported browsers still get a usable alternative. `@supports` checks syntax acceptance, not every detail of runtime behavior.

## Reveal subjects as they enter

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: translateY(0); }
}

@supports (animation-timeline: view()) {
  .chapter > * {
    animation: reveal 1ms linear both;
    animation-timeline: view(block 10% 10%);
    animation-range: entry;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chapter > * { animation: none; }
}
```

Each child follows its own view progress through its nearest scroll container, and `entry` attaches the keyframes to its entering segment. Content remains present without the effect; do not make important text invisible until scrolling.

# Common mistakes

- Confusing the keyframes (`animation-name`) with the timeline (`animation-timeline`); both are needed for a CSS keyframe animation.
- Using `none` when you mean the default clock timeline (`auto`), or expecting a missing named timeline to fall back to `auto`.
- Forgetting that `scroll()` defaults to the nearest scroller and block axis; a nested scroll container can silently become the source.
- Using `view()` for whole-container progress or `scroll()` when each subject needs its own entry/exit progress.
- Selecting a physical/logical axis that has no scrollable range, producing an inactive timeline.
- Setting a name on the source but referring to a different spelling/case or outside its current lookup scope.
- Writing `animation-timeline` before a later `animation` shorthand that resets it to `auto`.
- Assuming support for `animation-timeline` proves support for every named range, `view()` inset, or shorthand timeline component.
- Treating scroll-driven motion as a one-way scroll trigger; it follows position in both directions.
- Hiding semantic content in keyframes or forgetting `prefers-reduced-motion` and unsupported-browser fallbacks.
- Trusting the conflicting MDN shorthand sentence without checking the current CSSWG Level 2 grammar and browser support for the exact syntax.

# Knowledge checks with answers

1. **What does `auto` choose?** The clock-based document timeline; it is also the initial/default value.
2. **What does `none` do?** Leaves the animation without a timeline, so it does not progress.
3. **What is the difference between `scroll()` and `view()`?** `scroll()` follows a chosen container’s overall scroll progress; `view()` follows the animated subject’s movement through its nearest applicable scrollport.
4. **What happens if a named timeline cannot be found?** That animation has no associated timeline; it does not revert to `auto`.
5. **How do multiple values match multiple animations?** By list position with `animation-name`; short lists repeat and extra timeline values are ignored.
6. **Why put the property after `animation`?** The shorthand resets an omitted timeline to `auto`; a separate declaration after it avoids that reset. Current Level 2 shorthand syntax can set a timeline, but support must be checked.
7. **Is `animation-timeline` itself animated?** No. It selects the timeline; the CSS properties named in the associated keyframes are what animate.

# Sources

- [CSS Animations Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-animations-2/) — current `animation-timeline` definition, shorthand grammar, and its relationship to CSSAnimation/Web Animations; work in progress.
- [W3C CSS Animations Level 2 Working Draft](https://www.w3.org/TR/css-animations-2/) — latest published version (2 June 2023), older than the current Editor’s Draft.
- [Scroll-driven Animations Module Level 1 Editor’s Draft](https://drafts.csswg.org/scroll-animations-1/) and [W3C Working Draft](https://www.w3.org/TR/scroll-animations-1/) — anonymous/named scroll and view timeline definitions.
- [MDN: `animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) — syntax, value examples, compatibility, and shorthand guidance; its reset-only prose conflicts with the current Level 2 shorthand grammar.
- [MDN: `animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation) — constituent and reset-only shorthand properties, timeline support caveat, and compatibility guidance.
- [MDN: CSS scroll-driven animations timelines guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines) — practical named/anonymous timeline usage and fallbacks.
