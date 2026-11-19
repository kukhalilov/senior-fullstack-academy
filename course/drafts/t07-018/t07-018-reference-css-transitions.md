<!-- GENERATED DRAFT: manual factual review replaces the shallow generated index; keep in drafts until curriculum release promotes it. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Transitions properties

# Scope and version

This reference audits the six supplied names: `transition`, `transition-behavior`, `transition-delay`, `transition-duration`, `transition-property`, and `transition-timing-function`. Level 1 contains the established transition model; its latest published version is a Working Draft dated 8 January 2026. Level 2 adds discrete-property control and `@starting-style`; its latest published Working Draft is dated 4 February 2026, and the current Editor’s Draft is dated 22 April 2026. Both modules identify their draft status, so check browser compatibility. The captured MDN inventory marks `transition-behavior` Limited availability; MDN’s current page still says it is not Baseline. Other listed properties are marked Baseline in the captured inventory, but that does not establish support for every easing syntax or every transitionable property.

All six properties apply to all elements, are not inherited, and are not themselves animatable. The shorthand’s initial/computed values are those of its component longhands. The detailed values below use the current CSS Transitions Level 1 and Level 2 grammars; CSS-wide cascade keywords are also accepted.

# How this group fits the mental model

A CSS transition is a temporary animated value between a property’s before-change and after-change computed styles when a style change occurs. The author chooses the property, how long it takes, when it starts, and how progress is eased. A transition does not create a repeating animation or define keyframes. It responds to a state change such as a class change, a selector becoming true, a stylesheet update, or insertion/removal from the rendered document.

For a transition to start, the property must be selected, the before and after values must differ and be transitionable, and the combined timing must permit a nonzero transition. Most values interpolate according to that property’s animation type. Properties whose animation type is discrete normally do not transition; Level 2’s `transition-behavior: allow-discrete` opts them in, and a discrete pair switches at 50% progress. Some values remain not animatable and are not made interpolable by that option.

Transitions are generated separately for longhand properties. Shorthands and `all` can select many longhands, so a broad declaration may animate more than intended. Prefer explicit property names. If an element is newly inserted or becomes rendered without a prior style to transition from, Level 2’s `@starting-style` can supply that starting style; it is also draft-era functionality whose support should be checked.

# Supplied names explained

## `transition-property`

**Grammar:** `none | <single-transition-property>#`, where `<single-transition-property>` is `all | <custom-ident>`. **Initial:** `all`. **Applies:** all elements. **Inherited:** no. **Computed:** `none` or a list of identifiers.

Selects which CSS properties may transition. `none` selects no property; `all` selects all transitionable properties. A `<custom-ident>` names a property, including a custom property where its animation type permits. Unrecognized names are retained in list matching but cannot themselves animate. A shorthand name selects its longhand sub-properties. A repeated property selected more than once uses the timing values associated with the last matching entry.

`all` does not mean that every changed style value smoothly interpolates: values must still be transitionable and other transition conditions must be met. Unregistered custom properties have discrete animation behavior; registered properties with a suitable syntax can have typed interpolation. Use explicit names to avoid accidentally transitioning layout, color, or other properties added by later styles.

## `transition-duration`

**Grammar:** `<time [0s,∞]>#`. **Initial:** `0s`. **Applies:** all elements. **Inherited:** no. **Computed:** a list of durations.

Sets how long each selected transition’s active interval lasts. Values are nonnegative time values such as `180ms` or `0.3s`; negative durations are invalid. `0s` makes the change immediate unless the delay/transition rules create a delayed completion. Durations form a comma-separated list paired by index with `transition-property` entries.

## `transition-delay`

**Grammar:** `<time>#`. **Initial:** `0s`. **Applies:** all elements. **Inherited:** no. **Computed:** a list of durations.

Sets the wait before each transition begins. Zero starts as soon as the style change is processed. A positive delay postpones the effect. A negative delay starts the transition immediately at a point partway through its play cycle; if the negative offset covers the whole duration, there may be no visible intermediate phase. Unlike duration, delay can be negative. It has its own comma-separated list and is matched to selected properties by index.

## `transition-timing-function`

**Grammar:** `<easing-function>#`. **Initial:** `ease`. **Applies:** all elements. **Inherited:** no. **Computed:** as specified.

Maps elapsed-time progress to the progress used to interpolate the property. The established CSS Easing Level 1 forms include the keywords `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `step-start`, and `step-end`, plus `cubic-bezier()` and `steps()` functions. `steps(<positive-integer>[, <step-position>]?)` divides progress into equal time intervals; `jump-none` requires at least two steps. Its position can be `jump-start`, `jump-end`, `jump-none`, or `jump-both`, with the `start`/`end` aliases. `cubic-bezier()` constrains its two x control points to the 0–1 range; y control points may go outside it, which can create overshoot. The default `ease` is not the same as linear progress.

CSS Easing Level 2’s Editor’s Draft also defines `linear()` with a list of number/percentage control points for custom piecewise-linear curves, for example `linear(0, 0.25 25%, 1)`. A point’s number is output progress and its percentage is input progress; omitted input percentages are distributed by the specification’s canonicalization rules. This function is newer than the Level 1 grammar; check target support if you use it. The transition timing function applies to the transition effect as a whole. Its list is comma-separated and paired by property index.

## `transition-behavior` — Level 2

**Grammar:** `normal | allow-discrete` (a comma-separated list in the property). **Initial:** `normal`. **Applies:** all elements. **Inherited:** no. **Computed:** as specified. **Support snapshot:** Limited availability / not Baseline in the captured/current MDN reference.

With `normal`, transitions start only for values with interpolable animation types. With `allow-discrete`, a property with discrete animation type may also receive a transition; the value switches at 50% progress instead of interpolating through intermediate values. The declaration does not turn an unsupported or not-animatable property into an interpolable one. It is useful for deliberate entry/exit patterns involving `display`, but property-specific discrete behavior still matters.

## `transition` shorthand

**Level 1 grammar:** `<single-transition>#`, where one item is `[ none | <single-transition-property> ] || <time> || <easing-function> || <time>`.

**Level 2 draft extension:** one item may additionally include `|| <transition-behavior-value>`.

**Initials:** those of all component properties. **Applies:** all elements. **Inherited:** no. **Computed:** as for the component longhands.

Sets property, duration, easing, delay, and (in Level 2) behavior in one comma-separated shorthand. The first time token is duration and the second time token is delay, regardless of their order relative to the property/easing tokens. Omitted components reset to their initial values; notably, `transition: opacity 200ms` resets transition behavior to `normal`. Each comma-separated item is its own transition description. A `none` property value cannot be combined with other transition items in the same declaration.

Examples:

```css
transition: opacity 180ms ease-out;
transition: opacity 180ms ease-out 40ms, transform 220ms cubic-bezier(.2, .8, .2, 1);
transition: display 180ms allow-discrete;
```

# Cross-item comparison

| Question | Answer |
| --- | --- |
| What changes? | `transition-property` selects the longhand(s) to observe. |
| How long is the interpolation? | `transition-duration` sets its nonnegative active duration. |
| When does it begin? | `transition-delay` offsets the start; negative values enter partway through. |
| How does the intermediate progress move? | `transition-timing-function` applies an easing curve or step function. |
| Can a discrete value switch as a transition? | `transition-behavior: allow-discrete` opts discrete-animation-type values in where supported; they flip at halfway progress. |
| What is the shorthand boundary? | `transition` resets omitted component values, including the Level 2 behavior subproperty. |

Transitions and CSS Animations solve different problems. A transition interpolates a state change between two style snapshots. A CSS Animation uses keyframes, can run without a state toggle, and can repeat. Both participate in the Web Animations model; transitions also expose `transitionrun`, `transitionstart`, `transitionend`, and `transitioncancel` events. `transitionrun` fires when the transition is created, `transitionstart` when its delay ends, `transitionend` when it completes, and `transitioncancel` if it is canceled. `transitionend` is not guaranteed if the transition is canceled or removed before completion. `TransitionEvent.propertyName` reports the expanded longhand name, `elapsedTime` excludes time spent in the delay, and `pseudoElement` identifies a transitioned pseudo-element (or is empty for a regular element).

During an active transition, its current value occupies the transition cascade origin, which has higher precedence than important declarations. Thus even `!important` can appear to lose while the transition is running; the underlying cascade value takes effect when the transition ends or is canceled.

## List matching and start conditions

The `transition-property` list determines how many transitions are considered. Each selected property uses the duration, delay, easing, and behavior value at the same list index. If a companion list is too short, its values repeat to provide enough entries; extra entries at the end are ignored. This lets a short duration list alternate, for example `transition-duration: 180ms, 300ms` across four properties as `180ms, 300ms, 180ms, 300ms`.

A transition usually needs an existing before-change style and a later style change. Level 2’s `@starting-style` handles elements newly inserted or newly rendered, which have no previous rendered style to use as the start. For exits to `display: none`, discrete opt-in permits the `display` value to switch at the end so opacity can fade first; for entries from `display: none`, it switches at the start and starting style provides the initial opacity. Check current browser support for the Level 2 features as a group rather than inferring it from Level 1 transition support.

Transitions may be retargeted or reversed while running; CSS shortens a reversing transition rather than necessarily starting a full-duration reverse from scratch. If the selected property is removed from the transition list, the transition is canceled. Code listening to completion should handle both `transitionend` and `transitioncancel`, filter by `event.propertyName`, and avoid assuming every property generated exactly one completion event.

# Examples

Put the transition on the stable/base rule so it works both when the state is entered and when it is reversed:

```css
.control {
  transition: transform 180ms ease-out;
}

.control:is(:hover, :focus-visible) {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .control { transition: none; }
}
```

For a newly inserted dialog or popover, Level 2’s `@starting-style` can define the entry start values. Here `display` switches discretely while opacity interpolates:

```css
.notice {
  display: none;
  opacity: 0;
  transition: opacity 180ms ease, display 180ms allow-discrete;
}

.notice.is-visible {
  display: block;
  opacity: 1;

  @starting-style {
    opacity: 0;
  }
}
```

The nested `@starting-style` syntax is shown in current CSS Transitions Level 2. If supporting browsers without it, make the content visible through a non-animated fallback; do not leave it inaccessible because an entry transition is unsupported.

CSS Display’s current draft says the `display` box remains rendered through the fade when going to `none`, and switches from `none` at the start when becoming visible. However, the element is inert when its underlying value is `none` after ignoring animation and transition cascade origins. Do not assume a visually fading-out item remains interactive or available to assistive technology; coordinate CSS state with focus and semantic visibility.

# Common mistakes

- Expecting `transition-duration` by itself to create a transition. A selected property must change between styles and be transitionable; the duration must be nonzero.
- Writing a transition only on a temporary `:hover` or open-state rule and expecting the reverse transition to use the same timing after that rule stops matching. Put shared timing on the stable base rule.
- Using `transition: all` and unintentionally transitioning layout, color, or future properties. Select the exact longhands needed.
- Putting a negative value in `transition-duration`; only `transition-delay` accepts negative times.
- Assuming all comma-separated transition lists must be equal length. The property list controls the number of transitions; companion lists repeat or are truncated.
- Assuming a discrete value will interpolate. It normally does not transition; `allow-discrete` enables a midpoint switch where supported, not smooth intermediate values.
- Forgetting that a later `transition` shorthand resets omitted `transition-behavior` to `normal`.
- Treating `linear()` from Easing Level 2 or every Level 2 transition feature as a universal-support guarantee.
- Assuming a negative delay means “wait less than zero”; it makes the transition look as though it started earlier and may leave little or no visible transition.
- Depending only on `transitionend`. A removed/canceled transition does not produce that completion event; handle `transitioncancel` where event lifecycle matters.
- Expecting `transitionend` for every property named under `all`, or forgetting a shorthand can expand to multiple longhands.
- Using transitions for meaningful content visibility without checking reduced-motion preferences, focus management, and the state exposed to assistive technology.

# Knowledge checks with answers

1. **Why might `display: none` change instantly even when the element has a transition?** It is discrete by default. Level 2 `transition-behavior: allow-discrete` can opt it in so it changes at the discrete switch point; it does not make `display` continuously interpolable.
2. **What happens to `transition-delay: -100ms`?** The transition begins immediately as though up to 100ms of its active timeline has elapsed, capped at its duration; if the offset consumes the whole duration, there may be no visible transition.
3. **If there are four property names but two duration values, what durations are used?** The two-value duration list repeats until it matches the property list, in order.
4. **Why define shared transition timing on the base rule?** Both state entry and exit can use that declaration; a declaration that exists only in one state may not be present on the reverse change.
5. **How can a newly inserted element transition from opacity zero?** Supply a starting style with Level 2’s `@starting-style` and select the property with a nonzero duration.
6. **Can `!important` override an active transition’s displayed value?** The transition origin has higher cascade precedence while the transition is active, so the transition’s current value can temporarily win.
7. **What event should code account for if a transition is canceled?** `transitioncancel`; `transitionend` will not fire when the transition is removed before completion.

# Sources

- [CSS Transitions Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-transitions-1/) and [published Level 1 Working Draft](https://www.w3.org/TR/css-transitions-1/) — property grammar, defaults, list matching, transition start/reversal, cascade integration, event lifecycle, and current document status.
- [CSS Transitions Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-transitions-2/) and [published Working Draft](https://www.w3.org/TR/css-transitions-2/) — discrete behavior, shorthand extension, `@starting-style`, transition events and Level 2 draft status.
- [CSS Easing Functions Level 1](https://www.w3.org/TR/css-easing-1/) — standard cubic Bézier and step functions and keywords.
- [CSS Easing Functions Level 2 Editor’s Draft](https://drafts.csswg.org/css-easing-2/) — `linear()` function; work-in-progress status is kept separate from the Level 1 grammar.
- [CSS Display Module Level 4](https://drafts.csswg.org/css-display-4/) — discrete `display` transition behavior at entry and exit, used with `allow-discrete`.
- [CSS Cascade Level 5](https://drafts.csswg.org/css-cascade-5/) — active transitions’ cascade precedence.
- [Media Queries Level 5](https://drafts.csswg.org/mediaqueries-5/) — `prefers-reduced-motion` media feature used by the example.
- [CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api-1/) — typed registered custom-property context for interpolation.
- [MDN: `transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition), [`transition-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior), [`transition-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-delay), [`transition-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-duration), [`transition-property`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-property), and [`transition-timing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-timing-function) — author-facing formal definitions, current compatibility data, and practical guidance.
