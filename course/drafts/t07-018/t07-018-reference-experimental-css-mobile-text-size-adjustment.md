# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS text-size-adjust properties

## Scope and version

This lesson covers the single supplied property, `text-size-adjust`. The current CSS Mobile Text Size Adjustment Level 1 Editor’s Draft is dated 2026-01-14. It is a discussion draft; its default-adjustment sections say they need significant refinement, and the phrase “small device” is explicitly undefined. The linked W3C TR publication address currently returns 404, so this lesson treats the Editor’s Draft as work in progress and checks browser behavior separately. Sources checked on 2026-11-20.

## How this group fits the mental model

Some mobile browsers can enlarge text on pages that were laid out for a much wider desktop viewport. The goal is to make wrapped text readable without requiring sideways scrolling on every line. This behavior is often called text inflation or text autosizing.

`text-size-adjust` is a hint controlling that browser adjustment. It does not set the page viewport, choose a device’s zoom level, or replace responsive layout. It matters only in a user agent that implements and uses text inflation; other browsers may ignore it. A responsive viewport and readable layout are the main design controls. This property can be useful for carefully tested exceptions, but disabling the browser’s help globally can make legacy content difficult to read.

## Supplied names explained

### Exact grammar and descriptors

The CSSWG Editor’s Draft defines:

```css
text-size-adjust: auto | none | <percentage [0,∞]>;
```

CSS-wide keywords (`inherit`, `initial`, `revert`, `revert-layer`, and `unset`) are also accepted through the general CSS property rules.

| Descriptor | CSSWG Editor’s Draft |
| --- | --- |
| Initial | `auto` |
| Applies to | All elements |
| Inherited | Yes |
| Percentages | See the behavior below |
| Computed value | Specified keyword or percentage |
| Animation | By computed value |

The property is inherited. For example, a parent’s`none` affects descendants unless a descendant overrides it; `auto` on a child can restore the user agent’s default adjustment for that child where the browser supports the feature.

### Values

- **`auto`**: when a renderer applies text adjustment on a small device, use its default adjustment behavior. The exact algorithm and the definition of “small device” are not fully specified in the current draft.
- **`none`**: do not perform this text-size adjustment on a small device. It does not disable browser page zoom.
- **A non-negative percentage**: do not use the default inflation algorithm for the affected content; multiply the computed `font-size` by this percentage instead. `100%` therefore means no size change and is equivalent to`none` in the draft. `150%` means 1.5 times the corresponding font size, not “add 150%.” Negative percentages are invalid.

The percentage rule concerns this adjustment feature. It is not a general font-size scaling property for every desktop browser context, and it does not promise that every engine implements percentage values consistently.

### What the draft says about automatic inflation

The draft describes a renderer enlarging text in small-device contexts when a wide page is scaled down to fit a phone-sized display. It says that the adjustment should account for a minimum readable text size and the width of the text block and device. It also lists conditions that suppress default adjustment, including short text blocks, fixed-height blocks, fixed-width inline blocks, and non-wrapping content.

These algorithm details are explicitly unfinished in the draft: it says they need significant refinement and verification, and that it is unclear how precisely the specification should define the behavior. The draft also acknowledges that “small device” has no clear definition. Treat the algorithm as explanatory context, not as a guarantee that browsers follow those exact heuristics.

## Cross-item comparison

This assigned group contains only `text-size-adjust`, so there is no within-group comparison. Related controls such as `font-size`, viewport configuration, and browser zoom are discussed below because they are distinct mechanisms, not members of this supplied group.

## Examples

Use both spellings when targeting WebKit-based mobile browsers and current unprefixed implementations:

```css
/* Allow a supporting browser's default text adjustment. */
body {
  -webkit-text-size-adjust: auto;
  text-size-adjust: auto;
}

/* A narrowly scoped exception, only after testing readability. */
.legacy-widget {
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
}
```

The prefixed declaration is a compatibility measure, not a separate standards value set. Do not disable inflation for an entire site without testing actual devices, text zoom, responsive layout, and accessibility needs. If author styling needs a specific font size, use `font-size`; do not misuse `text-size-adjust` as a substitute.

## Browser support and platform differences

MDN marks the property Experimental and Limited availability. The current MDN Browser Compatibility Data records:

- Chrome: unprefixed support from 54; Edge: unprefixed from 79 (with an earlier `-webkit-` entry); Chrome-based mobile entries mirror their desktop/engine data.
- Safari desktop: no unprefixed support is recorded. Safari on iOS has `-webkit-text-size-adjust` from iOS 1.
- Firefox desktop: no unprefixed support is recorded. Firefox for Android has historical `-webkit-` and `-moz-` entries.

These compatibility entries indicate that the property/value parses or is implemented in those browser versions; they do not mean all those browsers automatically inflate text in the same circumstances. Whether default inflation runs depends on the engine, platform, viewport/layout, user settings, and implementation heuristics.

MDN’s formal definition panel gives an implementation-specific initial value: `auto` for smartphone browsers that support inflation and`none` for other browsers, where the behavior is not modifiable. The CSSWG property table’s initial value is `auto`. Read the first as practical behavior for implementations without an inflation system, not as a change to the property’s spec initial value.

## Related controls and common use

- A responsive `<meta name="viewport">` affects how the layout viewport is sized; it is not a text-size-adjust value.
- Browser page zoom and user text scaling are user controls. Do not assume `text-size-adjust: none` disables them.
- `font-size` sets authored text size directly.
- `font-size-adjust` compensates for differences in fallback-font metrics; it is unrelated to mobile text inflation.
- `text-size-adjust: 100%` is equivalent to`none` according to the current draft, while `auto` delegates to browser behavior.

For modern responsive pages, set an appropriate viewport, let content reflow, and use readable type sizes. Apply`none` or a percentage only when you have a concrete layout problem, and verify the experience on the target mobile browsers with user zoom enabled.

## Common mistakes

- Assuming the property enlarges text in every browser; it is ignored where the inflation feature is absent.
- Treating `text-size-adjust` as a viewport setting, zoom control, or general replacement for `font-size`.
- Reading `150%` as “increase by 150%”; the draft multiplies the computed font size by 1.5.
- Using`none` globally without checking mobile readability and text zoom.
- Assuming `auto` has one universal algorithm; the spec leaves significant behavior to implementations and does not define “small device.”
- Forgetting inheritance when a parent sets`none`.
- Confusing the unprefixed property and the historical `-webkit-`/`-moz-` compatibility spellings.
- Treating browser compatibility data as proof that an engine’s automatic inflation algorithm is uniform or fully standardized.

## Knowledge checks with answers

1. **What is the initial value in the CSSWG property table?** `auto`.
2. **What does`none` disable?** The user agent’s text-size adjustment/inflation behavior for the affected content on a small device; it does not disable page zoom.
3. **What does `text-size-adjust: 100%` mean in the draft?** Use the authored computed font size without the default inflation adjustment; it is equivalent to`none`.
4. **Is `150%` a 150% increase?** No. The percentage is a multiplier, so 150% means 1.5 times the computed `font-size`.
5. **Why is this not a substitute for responsive design?** It only hints about text inflation in supporting engines; it does not make the layout reflow or ensure the behavior exists.
6. **Why are the exact autosizing rules uncertain?** The current Editor’s Draft explicitly says its algorithm needs substantial refinement and does not define “small device.”

## Sources

- [CSS Mobile Text Size Adjustment Level 1 Editor’s Draft, §3](https://drafts.csswg.org/css-size-adjust/#adjustment-control) (grammar, descriptors, and values)
- [CSS Mobile Text Size Adjustment Level 1 Editor’s Draft, §§2–2.3](https://drafts.csswg.org/css-size-adjust/#default-size-adjustment) (default algorithm and explicit refinement gaps)
- [MDN: `text-size-adjust` CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-size-adjust) (value guidance, implementation-specific initial behavior, and support caveat)
- [MDN Browser Compatibility Data: `text-size-adjust`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-size-adjust.json) (engine versions and prefixed support)
- [MDN: `font-size-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size-adjust) (distinct fallback-font metric feature)
