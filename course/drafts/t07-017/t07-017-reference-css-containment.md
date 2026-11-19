# CSS layout flexbox grid positioning and responsive design — Reference: CSS Containment properties

# Scope and version

This lesson covers `contain`, its Level 2 Editor’s Draft value `inline-size`, `content-visibility`, and the related inventory item `contentvisibilityautostatechange event`. The current Level 2 Editor’s Draft checked is dated 15 October 2026; its newer additions are marked draft-only below. The last published Level 2 Working Draft dates to 2022. CSS Containment Level 3 is currently an empty placeholder; do not treat it as a separate source of active containment features. Support labels captured from MDN on 2026-11-16 describe browser availability at that date and do not guarantee support in every engine or embedded webview.

# How this group fits the mental model

Containment is a contract about which effects can cross an element boundary. It can change sizing, formatting, clipping, stacking, and which work a browser may defer. It is not merely a performance hint: choosing containment that conflicts with a component’s actual content can change layout or clip descendants. `content-visibility` builds on these containment rules to let the browser skip some work for content that is not currently relevant.

# Supplied names explained

| Exact supplied name | Values and behavior |
| --- | --- |
| `contain` | Published Level 2 grammar: `none \| strict \| content \| [ size || layout || style || paint ]`; current Level 2 Editor’s Draft adds `inline-size` as an alternative to `size`: `[ size \| inline-size ]`. Initial `none`; non-inherited; applies generally to elements, with specified box-type exceptions. `size` sizes the containment box without examining descendants; draft `inline-size` contains inline-axis intrinsic sizing while leaving block-axis sizing content-dependent. `layout` isolates internal layout, creates an independent formatting context, containing blocks for absolute/fixed descendants, and a stacking context; `style` confines effects such as counters/quotes; `paint` clips descendant ink/scrollable overflow to the paint containment edge (respecting `overflow-clip-margin`) and also creates containing blocks/stacking context. `content` is shorthand for `layout paint style` and deliberately omits size containment. `strict` includes size as well. `none` adds no containment through this property, though other properties can independently turn containment on. Treat `inline-size` as an evolving Level 2 draft value, not a cross-browser guarantee. |
| `content-visibility` | `visible \| auto \| hidden`; initial `visible`; non-inherited; applies where size containment can apply. In the published 2022 draft it is not animatable; the current Level 2 Editor’s Draft makes its animation type discrete, with special interpolation behavior between `hidden` and another value. `visible` has no effect. `hidden` always skips its contents; skipped content is unavailable to find-in-page, tab navigation, selection, and focus, similar to `display: none` for those user-agent features, while containment also affects layout. `auto` turns on layout, style, and paint containment; when the element is not relevant to the user, it skips its contents and also has size containment while skipped. Unlike `hidden`, `auto` content remains available to find-in-page, tab order, selection, and focus. Relevance includes proximity to the viewport, focus, selection, top-layer placement, and (in the current draft) capture in a view transition. For accessibility-tree exposure, the specification requires the user agent to avoid exposing a visual/accessibility mismatch; when that cannot be done without the skipped layout work, it must omit skipped contents from the accessibility tree. The browser should skip as much layout/painting work as possible; the amount of work avoided and performance benefit are implementation- and page-dependent. |
| `contentvisibilityautostatechange` event | The current Level 2 Editor’s Draft spelling (older published text used `...statechanged`) is dispatched on an element using `content-visibility: auto` when it becomes or stops being relevant to the user. The associated `ContentVisibilityAutoStateChangeEvent` exposes the read-only boolean `skipped`, true when the target starts skipping its contents and false when it stops; the init dictionary’s `skipped` member defaults to false. Use it to deprioritize expensive updates, not to keep semantically important DOM content stale indefinitely; skipped content remains relevant to users and assistive technology. |

# Cross-item comparison

`contain` lets an author choose the isolation dimensions explicitly. The draft `inline-size` value is narrower than `size`: content can still determine the block-axis size. `content-visibility: auto` applies layout/style/paint containment continuously and uses size containment when the contents are skipped; its relevance test considers viewport proximity and user interactions such as focus, selection, top-layer placement, and view-transition capture. `content-visibility: hidden` skips unconditionally and removes the contents from user-agent navigation/interaction features. `visible` does neither.

Skipping content can make an element’s size behave as if empty, which may shift page geometry and scrollbar position. The `contain-intrinsic-size` shorthand and longhands provide estimates or remembered sizes for this case; they are covered in the CSS box-model reference (t07-016). They do not render the skipped contents or guarantee an exact placeholder before the browser has a remembered size.

# Examples

For long, independent article sections, `auto` may reduce off-screen rendering work. Reserve a reasonable estimate so the document does not collapse while the section is skipped. Measure the actual page; this pattern is not a guaranteed speedup.

```css
.article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 30rem;
}
```

The event can be used to reduce work while a section is skipped and resume it when rendered, while keeping the DOM and essential semantic updates current:

```js
section.addEventListener("contentvisibilityautostatechange", (event) => {
  scheduleNonessentialWork({ deprioritized: event.skipped });
});
```

# Common mistakes

- Treating `contain: content` and `contain: strict` as equivalent; only `strict` includes size containment.
- Treating the current draft `contain: inline-size` value as stable or as full two-axis size containment.
- Forgetting that layout/paint containment can change containing blocks, stacking, formatting, or clipping.
- Applying paint containment to a component whose shadows, menus, or other descendants must escape its bounds.
- Treating `content-visibility: auto` like `display: none`; auto content remains available to user-agent features, and focus/selection can make it relevant.
- Treating `content-visibility: hidden` as an accessibility-safe way to defer work; hidden descendants are removed from user-agent navigation and accessibility exposure.
- Assuming `auto` guarantees a speedup or never causes layout shifts; profile and provide an intrinsic-size estimate when needed.
- Using `contentvisibilityautostatechanged` to indefinitely defer semantic or assistive-technology updates.
- Confusing `content-visibility` with `contain-intrinsic-size`; the latter supplies sizing estimates, not visibility or containment behavior.
- Copying the old `contentvisibilityautostatechanged` spelling from the published 2022 text when targeting the current Level 2 Editor’s Draft’s `contentvisibilityautostatechange` event.

# Knowledge checks with answers

1. **Which `contain` keyword applies layout, paint, and style containment but not size containment?** `content`.
2. **Does `content-visibility: auto` remove skipped content from find-in-page and tab navigation?** No. Unlike `hidden`, its skipped content remains available to those user-agent features.
3. **When is `contentvisibilityautostatechange` useful?** When work can be deprioritized while a section is skipped and resumed when it becomes relevant; essential semantic updates must remain current.
4. **Why might an off-screen section cause a scrollbar jump when skipped?** Size containment means its content no longer determines its size; a `contain-intrinsic-size` estimate can reserve space.

# Sources

- [CSS Containment Module Level 2](https://www.w3.org/TR/css-contain-2/) — §§2–4: containment types, `content-visibility`, state event, restrictions, and accessibility implications.
- [CSS Containment Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-contain-2/) — current `inline-size`, animation, event spelling, relevance, skipped rendering, and accessibility updates; editor’s draft, not a browser-support promise.
- [CSS Sizing Level 4](https://www.w3.org/TR/css-sizing-4/) — `contain-intrinsic-size`, detailed in course lesson t07-016.
- [CSS Containment Module Level 3](https://drafts.csswg.org/css-contain-3/) — currently an empty placeholder; active Level 3 proposals were moved to other specifications.
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) — browser compatibility should be checked against the target deployment matrix.
