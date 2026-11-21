
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Will Change properties

# Scope and version

**Brief change history:** compared with the December 2015 Candidate Recommendation, the current text clarifies that unknown/future property names are harmless, matches property names ASCII case-insensitively, explicitly says `will-change` itself is not animatable, and specifies shorthand expansion. These clarify the same advisory-hint feature rather than introducing a new family of values.

# How this group fits the mental model

CSS animation and transition declarations describe a change. `will-change` is a separate, advisory hint that tells the browser what kind of change the author expects soon, so it may prepare in advance. It does not create, start, or animate that change, and it does not promise a compositor/GPU layer or any performance improvement. Browsers choose different optimizations based on the feature, device, current workload, and implementation. Measure first; a hint can cost memory and make rendering slower.

# Supplied names explained

## `will-change`

**Grammar:** `auto | <animateable-feature>#`, where `<animateable-feature>` is `scroll-position | contents | <custom-ident>`. The `#` means a comma-separated list with one or more entries. CSS-wide keywords are also accepted. **Initial:** `auto`. **Applies:** all elements. **Inherited:** no. **Computed value:** specified value. **Animation type:** not animatable in the CSSWG definition.

- `auto` expresses no special author intent; the user agent uses its usual heuristics. It is the initial value and the appropriate cleanup value.
- `scroll-position` says the element’s scroll position is expected to change soon. A browser may prepare a larger rendered range around the visible scroll window. It is a hint, not a request to eagerly render the entire scroller.
- `contents` says the element’s contents may change frequently. A browser may avoid or reduce caching of the element’s rendered contents. The hint conceptually covers descendants too, so use it on a small, low-level subtree. Declarative animations are often optimized automatically; this value is mainly relevant to content-changing scripts where the browser can take advantage of it.
- A `<custom-ident>` names a CSS property expected to change, such as `transform`, `opacity`, `clip-path`, or `left, top`. If it names a shorthand, the hint applies to the longhands that shorthand expands into. Property identifiers match built-in property names ASCII case-insensitively. Unknown/future property names are valid but have no effect in browsers that do not recognize them. A custom property name has no effect under this specification.

The `<custom-ident>` cannot be `will-change`, `none`, `all`, `auto`, `scroll-position`, or `contents`, and follows the normal exclusions for CSS custom identifiers. `none` is therefore not a valid will-change value; use `auto` to express no hint. Multiple hints are comma-separated, not space-separated: `will-change: transform, opacity` is valid, while `will-change: transform opacity` is invalid.

# Cross-item comparison

| Tool | What it does | What it does not do |
| --- | --- | --- |
| `will-change: transform` | Hints that a transform change is expected; a browser may prepare early. | Does not set `transform`, force GPU acceleration, or guarantee lower frame time. |
| `transition` / CSS Animations | Defines how an actual property change proceeds over time. | Does not provide a reliable manual optimization guarantee. Browsers already optimize animations where possible. |
| Browser default heuristics (`will-change: auto`) | Let the engine decide when and how to optimize based on its own knowledge. | Do not guarantee that every author-observed bottleneck can be predicted. |

Prefer simpler animated properties such as `transform` and `opacity` when they fit the visual design, but profile real devices: their performance is not a universal guarantee, and other effects or layout work can still be expensive. Use `will-change` only when measurement identifies a real issue and a hint helps in the target browser.

# Examples

## Prepare ahead of an interaction

When an input announces a later animation, an earlier pointer/focus signal can give the browser some preparation time. The actual animation still comes from the class change; the hint does not start it.

```html
<button id="toggle" aria-expanded="false" aria-controls="panel">Open panel</button>
<div id="panel" class="panel">Panel content</div>
```

```css
.panel {
  transform: translateX(-1rem);
  transition: transform 180ms ease;
}
.panel.is-open { transform: translateX(0); }

@media (prefers-reduced-motion: reduce) {
  .panel { transition-duration: 0.01ms; }
}
```

```js
const button = document.querySelector("#toggle");
const panel = document.querySelector("#panel");

button.addEventListener("click", () => {
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  panel.classList.toggle("is-open", open);
});

function clearHint(event) {
  if (event.target === panel && event.propertyName === "transform") {
    panel.style.willChange = "auto";
  }
}

function prepareHint() {
  panel.style.willChange = "transform";
}
button.addEventListener("pointerenter", prepareHint);
button.addEventListener("focus", prepareHint);
panel.addEventListener("transitionend", clearHint);
panel.addEventListener("transitioncancel", clearHint);
```

This illustrates hint timing, not a universally faster recipe. A pointer entering or keyboard user focusing the trigger sets the hint before activation; the transition completion/cancellation clears it. The browser is not guaranteed a particular preparation interval. If the change can begin before there is useful lead time, or reduced motion makes the transition effectively instantaneous, skip the hint; do not leave it set indefinitely. Production code should also clear it when the component is removed and account for repeated/reversed transitions.

## Compact values

```css
.scrolling-results { will-change: scroll-position; }
.live-counter { will-change: contents; }
.moving-card { will-change: transform, opacity; }
.moving-card { will-change: auto; } /* remove the author hint when no longer needed */
```

Each hint should correspond to a real near-future change. The browser is still free to ignore a hint or choose a different implementation strategy.

# Side effects, lifecycle, and performance

The property is advisory for optimization, but the specification requires some observable side effects to occur early: if a non-initial value of a named property would create a stacking context, `will-change` must create one; if it would establish an absolute- or fixed-position containing block, `will-change` must establish that too. For example, `will-change: opacity` can create a stacking context even while `opacity: 1`; `will-change: transform` can affect positioned descendants. A rendering change such as a different text anti-aliasing strategy may also be applied early to avoid a sudden difference later. These effects can alter z-index relationships, fixed descendants, paint order, or text appearance before the anticipated property actually changes.

Too many hinted elements or properties can consume substantial memory and cause more rendering work, slow the page, or exhaust device resources. A broad rule such as `* { will-change: transform, opacity }` is harmful. Keep `contents` and `scroll-position` hints on a small subtree/scroll container near the leaves of the DOM; they can lead browsers to prepare or redraw much more content than a local property hint. A permanently declared hint says the element is perpetually about to change, so the browser may retain costly preparation. If the change is episodic, add the hint with enough lead time and remove it after the change using `auto` or by removing the declaration. Declarative animated properties are already treated as needing animation optimizations; placing `will-change` inside `@keyframes` is unnecessary.

## Animation metadata discrepancy

The current MDN formal-definition table labels the animation type “discrete.” The CSSWG Level 1 property definition says “not animatable” and its change history states this was deliberately changed from older text. Use the normative module’s current “not animatable” definition; do not teach `will-change` itself as something that can be transitioned. The property it names may of course be animated independently.

# Common mistakes

- Adding `will-change` before profiling or because an animation “might be slow.” Treat it as a last resort for a measured problem.
- Assuming it means GPU acceleration. The browser may make no change at all and the layer strategy is implementation-dependent.
- Adding the hint in the same instant as the expensive change and expecting enough preparation time. Use an earlier signal when possible, or remove the hint if there is no useful lead time.
- Leaving a temporary hint on after the transition/interaction has ended.
- Setting it on every element or a large ancestor, which can magnify work and memory use.
- Forgetting that it can create a stacking context or containing block before the named property changes.
- Writing space-separated custom identifiers, using a forbidden keyword as an identifier, or using `none` instead of `auto`.
- Assuming an unknown property name or a custom property makes the browser optimize that effect.
- Treating MDN’s “discrete” metadata as stronger than the CSSWG property definition, which says the property is not animatable.

# Knowledge checks with answers

1. **Does `will-change: transform` perform a transform?** No. It hints that a transform change may happen soon; the actual change must be declared elsewhere.
2. **Does it guarantee a GPU layer?** No. User agents may ignore the hint or choose among different strategies.
3. **Why can `will-change: opacity` alter the page before opacity changes?** The specified non-initial opacity value creates a stacking context, and the spec requires that side effect to occur when hinted.
4. **How do you remove an active hint?** Set it to `auto` or remove the declaration after the change ends.
5. **Can a shorthand be used?** Yes; the expected change covers all longhands expanded by that shorthand.
6. **Is `will-change` itself animatable?** No in CSS Will Change Level 1. The property named in its value can be animated independently.
7. **When should the hint be added?** Only after profiling demonstrates a need, shortly before a likely change but early enough for preparation; remove it when that period ends.

# Sources

- [CSS Will Change Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-will-change/) — formal grammar, metadata, optimizations, side effects, shorthand/custom-property rules, and author guidance; work in progress.
- [MDN: `will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change) — syntax, examples, current compatibility and author guidance. Its animation-type table currently conflicts with the spec’s explicit “not animatable” definition.
- [MDN: Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) — how a hinted stacking-context-creating property affects stacking.
- [MDN: CSS performance optimization](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) — performance profiling context and rendering costs.
