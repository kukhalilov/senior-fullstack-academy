
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS View Transitions properties

# Scope and version

This lesson audits the three inventoried properties: `view-transition-name`, `view-transition-class`, and `view-transition-scope`. They are CSS controls for the View Transition API, not a standalone animation trigger. The current CSS View Transitions Level 1 Editor’s Draft defines the basic transition model and `view-transition-name`. Level 2 is a work-in-progress Editor’s Draft that adds `view-transition-class`, scoped and nested transitions, and automatic naming proposals. Treat Level 2 behavior as evolving and check current support before depending on it. In the captured MDN status, `view-transition-class` is Baseline 2025, `view-transition-name` is Baseline 2025, and `view-transition-scope` is Limited availability and marked experimental; Baseline is not a promise for older browsers or all versions.

# How this group fits the mental model

A view transition is a short-lived visual bridge between two rendered states. The browser captures an old view, lets the application update the DOM or navigate, captures a new view, and exposes snapshot layers as CSS pseudo-elements. The actual DOM remains the source of truth; the snapshots are temporary visual representations. CSS names determine which parts get separate snapshot groups and how those groups can be styled. The API or an opted-in navigation starts the process.

For a same-document update, call `document.startViewTransition(() => updateDOM())`; feature-detect it and perform `updateDOM()` directly as the fallback. Cross-document transitions use navigation and CSS opt-in (Level 2 draft; support varies). A named element can be paired from old to new state even when the actual DOM node changes: the name represents a visual role, not object identity. Unnamed content is part of the root snapshot by default.

The basic pseudo-element tree is `::view-transition` → `::view-transition-group(name)` → `::view-transition-image-pair(name)` → `::view-transition-old(name)` and/or `::view-transition-new(name)`. The old/new nodes represent images, not live interactive DOM. The default transition cross-fades the old and new views. Style the group for geometry/positioning and the old/new snapshots for their visual animation; usually leave the image-pair isolation alone.

# Supplied names explained

## `view-transition-name`

**Level 1 grammar:** `none | <custom-ident>`. **Level 2 Editor’s Draft additions:** automatic naming keywords such as `auto` and `match-element` are described in the work-in-progress draft; support and exact behavior are not implied by the Level 1 grammar. Initial value: `none`. Applies to all elements; not inherited; computed value as specified; animation type discrete.

`none` does not create a separate named snapshot. The element can still appear inside an ancestor’s snapshot. A `<custom-ident>` makes the element participate under that name so CSS can address its pseudo-elements and the browser can pair old/new visual states under the same name. The name must be unique among elements discovered by a particular transition; duplicate simultaneously discovered names cause that transition to abort/skip (the `ViewTransition.ready` promise rejects for same-document transitions). A name can be reused in independent scopes when the scoped-transition rules keep the elements out of the same discovery set. Do not treat the name as a globally unique identifier across the whole application.

In the Level 2 draft, `auto` uses the element’s `id` when present and otherwise supplies an automatic identity; this may support cross-document pairing when the same ID is present in both documents. `match-element` is based on element identity and is intended for same-document matching. These are evolving draft features; explicit stable names remain the clearest interoperable baseline.

Names also have rendering consequences while set: the element can establish a stacking context, be flattened in 3D, and form a backdrop root. This can affect filters, blending, transforms, clipping, and stacking even outside the instant the transition is visible. Keep names scoped to the elements that really need independent snapshot treatment, and remove/avoid persistent names where those side effects are undesirable.

## `view-transition-class`

**Level 2 grammar:** `none | <custom-ident>+`. Initial value: `none`. Applies to all elements; not inherited; computed value as specified; animation type discrete. This is a styling label for named view-transition pseudo-elements, not a capture switch and not a replacement for `view-transition-name`.

An element may have several class identifiers. Different elements can share them, while still using distinct `view-transition-name` values. Select the matching snapshots with class selectors in the named pseudo-element functions, for example `::view-transition-group(*.card-motion)`. The special value `none` cannot be mixed into the identifier list. These are tree-scoped identifiers, not DOM `class` attributes. If the same view-transition name exists in both states, the class list captured for the new state is used; old-state classes matter when there is no corresponding named element in the new state. Since Level 2 is still a draft, provide direct per-name pseudo-element rules as a fallback when class selection is not supported.

## `view-transition-scope`

**Level 2 grammar:** `none | all`. Initial value: `none`. Applies to all elements; not inherited; computed value as specified; animation type discrete. It controls discovery boundaries for named elements. `none` adds no boundary. `all` limits discovery to that element and its flat-tree descendants for transitions originating outside that scope. Starting an element-scoped transition implicitly scopes its root for that transition’s lifetime.

This permits repeated names inside independently scoped components while preventing one component’s transition from accidentally capturing another component’s same-named element. It does not make duplicate names safe when both instances are discovered by the same transition. Scope changes discovery only; it does not itself start a transition, alter the DOM, or guarantee nested transitions work in every browser. Because this property is experimental/limited-support in the captured reference, use it as progressive enhancement and keep a non-transition fallback.

# Cross-item comparison

| Property | Creates/identifies snapshots? | Reusable across elements? | Main purpose |
| --- | --- | --- | --- |
| `view-transition-name` | Yes; associates a rendered element with a named snapshot group and pairs old/new visual states. | Names must be unique within one transition’s discovery set; Level 2 scopes can isolate sets. | Participation and pairing. |
| `view-transition-class` | No; only annotates pseudo-elements already created for named snapshots. | Yes; one class can select many named elements, and an element can have multiple classes. | Shared styling rules for named pseudo-elements. |
| `view-transition-scope` | No; changes which names a transition can discover. | Enables repeated names only across distinct discovery sets. | Component isolation for scoped transitions. |

Think of the name as the snapshot identity, the class as a shared styling tag, and the scope as the discovery boundary. They complement one another; none replaces starting the transition through an API or navigation.

# Examples

```html
<button id="next">Show next photo</button>
<figure class="gallery-photo">
  <img src="photo-1.jpg" alt="Mountain lake at sunrise">
  <figcaption>Mountain lake</figcaption>
</figure>
```

```css
.gallery-photo { view-transition-name: gallery-photo; }
.gallery-photo { view-transition-class: gallery-card; }

::view-transition-old(gallery-photo) { animation: 180ms ease-out both fade-out; }
::view-transition-new(gallery-photo) { animation: 240ms ease-in both fade-in; }
::view-transition-group(*.gallery-card) { animation-timing-function: ease-in-out; }

@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) { animation-duration: 1ms; }
}
```

```js
function showNextPhoto() {
  // Update the image and caption together so the UI remains correct without motion.
  const update = () => {
    document.querySelector("img").src = "photo-2.jpg";
    document.querySelector("img").alt = "Forest waterfall";
    document.querySelector("figcaption").textContent = "Forest waterfall";
  };

  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(update);
  } else {
    update();
  }
}

document.querySelector("#next").addEventListener("click", showNextPhoto);
```

The demo uses a single explicit name, so it does not need scoped discovery. A repeated card list could apply a shared `view-transition-class` for styling, while each card still needs its own distinct name unless each transition is deliberately scoped. For newly inserted elements, consult the View Transitions API and its `@starting-style` integration; a before-state does not exist automatically. Keep focus, accessibility state, and semantic content correct independently of the snapshot animation. The animation is decorative and should be skipped or reduced when appropriate.

# Version and feature boundary

| Feature | Specification boundary | Practical interpretation |
| --- | --- | --- |
| Explicit `view-transition-name`, snapshot groups and pseudo-element model | Level 1 | Core naming model; verify browser support for the API and CSS features you use. |
| `view-transition-class` | Level 2 | Shared pseudo-element styling hook; feature-detect by support and keep per-name CSS fallback. |
| `view-transition-scope` and element-scoped transitions | Level 2 | Isolates component discovery and repeated names; experimental/limited support in the captured MDN reference. |
| `auto` / `match-element` naming | Level 2 Editor’s Draft | Draft convenience; do not assume it is part of the Level 1 grammar or interoperable. |
| Cross-document navigation transitions and transition types | Level 2 | Separate navigation lifecycle; same-origin and browser restrictions may apply. Confirm current support and origin conditions. |

The Level 2 draft is broader than these three inventoried properties. It also describes cross-document navigation, selective transitions/types, nested groups, and API extensions. These are relevant context, not additional properties silently added to this lesson’s frozen inventory.

# Common mistakes

- No transition starts: CSS declarations do not trigger one. Verify the API call or navigation opt-in and ensure the update happens in the transition callback.
- The whole page cross-fades: the target may lack a non-`none` name, or the pseudo-element selector may not match. Inspect the generated view-transition tree in browser developer tools.
- A transition aborts: look for duplicate names inside one transition’s discovery scope and inspect `ViewTransition.ready` rejection.
- A reused name works in one component but collides in another: names are unique per discovery set; use intentionally isolated scopes only where supported.
- The class style does nothing: `view-transition-class` does not capture an element; the element also needs a name, and the pseudo-element selector must use the class syntax supported by the browser.
- Motion causes focus or interaction confusion: snapshots are visual images, not live replacement content. Update the actual DOM once, preserve focus/semantics, and do not make the animation necessary to understand state.
- A transition changes stacking or 3D composition: a non-`none` name can create rendering boundaries. Check stacking contexts, flattened 3D transforms, backdrop roots, clipping, filters, and blend modes.
- Feature unsupported: update content normally first. Feature-detect APIs and CSS separately; support for a JavaScript method does not prove support for each Level 2 property or selector.

# Knowledge checks with answers

1. **Does `view-transition-name` launch a transition?** No. It labels participating rendered elements when a transition is started through the API or navigation mechanism.
2. **What is the difference between name and class?** A name participates in and pairs snapshots; a class is a shared styling hook for pseudo-elements already generated by named elements.
3. **Can two elements use the same name?** Only if they cannot both be discovered by the same transition. Otherwise the transition is aborted/skipped; scoped discovery can isolate repeated names where implemented.
4. **Does `view-transition-class` alone capture an element?** No; it does not replace a non-`none` name.
5. **What does `view-transition-scope: all` do?** It limits name discovery to the element’s subtree for transitions originating outside that boundary; it neither triggers a transition nor makes collisions safe within one discovery set.
6. **Why feature-detect and update without animation?** View transitions are progressive visual enhancement. The content update must remain correct on browsers without the relevant API/property support and for users who reduce motion.

# Sources

- [CSS View Transitions Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-view-transitions-1/) — the core snapshot and pseudo-element model; work in progress.
- [CSS View Transitions Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-view-transitions-2/) — `view-transition-class`, `view-transition-scope`, automatic names, and broader Level 2 work; work in progress.
- [MDN: `view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name), [MDN: `view-transition-class`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-class), and [MDN: `view-transition-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-scope) — syntax, formal definitions, examples, and compatibility.
- [MDN: `Document.startViewTransition()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) and [Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) — same-document trigger, lifecycle, fallback, and cross-document context.
- [MDN: CSS view transitions guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/View_transitions) — related properties, at-rules, selectors, pseudo-elements, and interfaces.
