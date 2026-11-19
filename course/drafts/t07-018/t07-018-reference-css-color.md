# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Color properties

## Scope and version

This lesson covers all six assigned names: `color`, `color-scheme`, `dynamic-range-limit`, `forced-color-adjust`, `opacity`, and `print-color-adjust`. The current [CSS Color Level 4 Editor’s Draft](https://drafts.csswg.org/css-color-4/) was updated 2026-11-18; [CSS Color Level 5](https://drafts.csswg.org/css-color-5/) was updated 2026-11-14; the HDR Level 1 Editor’s Draft identifies itself as a June 7, 2026 work in progress; and Color Adjustment Level 1 is a Candidate Recommendation Snapshot dated October 30, 2026. The [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) is a status overview, not a support promise. Syntax and browser support are separate questions; test each function and property value in target browsers.

### How the color modules evolved

Earlier CSS and HTML relied on a small sRGB-oriented set of keywords and RGB/HSL notation. CSS Color 3 standardized alpha-capable RGB/HSL forms and opacity. Color 4 modernized color syntax, added HWB and perceptual Lab/Oklab families, wide-gamut and XYZ spaces, and formalized interpolation and gamut mapping. Color 5 adds color transformations and context-aware/dynamic functions plus ICC profiles and CMYK; the HDR draft adds HDR color spaces, headroom-aware color, and output-range control. This short history identifies the meaningful jumps; it is not a complete history of every CSS release.

## How this group fits the mental model

First choose a color value, then understand where it is interpreted. A color can be an sRGB value, a wider-gamut color, an HDR color, a system color that follows the user’s interface palette, or a derived value. The `color` property supplies foreground text color and `currentColor`; other paint properties can use that current color. The `color-scheme`, forced-colors, print, and HDR properties let the page describe its capabilities or set limits while leaving important control to the user agent and device.

`opacity` is different from an alpha component inside one color. It composites the already-painted element and descendants as a group. A color’s alpha changes that color; opacity changes the whole group.

## Supplied names explained

The property definitions’ core metadata is summarized here; specifications also define parsing, computed/used-value processing, and interpolation details.

| Property | Value and initial value | Inheritance and applicability | Animation |
| --- | --- | --- | --- |
| `color` | `<color>`; initial `CanvasText` | Inherited; all elements and text | By computed-value type |
| `color-scheme` | `normal` or supported scheme list with optional `only`; initial `normal` | Inherited; all elements and text | Discrete |
| `dynamic-range-limit` | `standard`, `constrained`, `no-limit`, or mix; initial `no-limit` | Inherited; all elements | By `dynamic-range-limit-mix()` |
| `forced-color-adjust` | `auto`, `none`, `preserve-parent-color`; initial `auto` | Inherited; all elements and text | Not animatable |
| `opacity` | `<number>` or `<percentage>`; initial `1` | Not inherited; all elements | By computed-value type |
| `print-color-adjust` | `economy`, `exact`; initial `economy` | Inherited; all elements | Discrete |

For `opacity`, percentages map to the `[0, 1]` range and the computed value is clamped to that range. For the color-adjustment properties, `color-scheme`, and `dynamic-range-limit`, use the property-specific sections below for the exact policy and caveats; inheritance does not mean a value changes every authored color.

### `color`: foreground color and the `<color>` value space

`color` sets the primary foreground color for an element’s text, including text decoration, and supplies the used `currentColor` value. It is inherited; the current initial value is the system color `CanvasText`. Many properties default to `currentColor` (for example, border colors), which is why changing text color can change related edges unless they have their own color specified.

The `<color>` type accepts the following families. This is the standards inventory in the cited drafts; implementations may support subsets of newer syntax.

CSS Color 4’s complete set of 148 opaque named colors is: `aliceblue`, `antiquewhite`, `aqua`, `aquamarine`, `azure`, `beige`, `bisque`, `black`, `blanchedalmond`, `blue`, `blueviolet`, `brown`, `burlywood`, `cadetblue`, `chartreuse`, `chocolate`, `coral`, `cornflowerblue`, `cornsilk`, `crimson`, `cyan`, `darkblue`, `darkcyan`, `darkgoldenrod`, `darkgray`, `darkgreen`, `darkgrey`, `darkkhaki`, `darkmagenta`, `darkolivegreen`, `darkorange`, `darkorchid`, `darkred`, `darksalmon`, `darkseagreen`, `darkslateblue`, `darkslategray`, `darkslategrey`, `darkturquoise`, `darkviolet`, `deeppink`, `deepskyblue`, `dimgray`, `dimgrey`, `dodgerblue`, `firebrick`, `floralwhite`, `forestgreen`, `fuchsia`, `gainsboro`, `ghostwhite`, `gold`, `goldenrod`, `gray`, `green`, `greenyellow`, `grey`, `honeydew`, `hotpink`, `indianred`, `indigo`, `ivory`, `khaki`, `lavender`, `lavenderblush`, `lawngreen`, `lemonchiffon`, `lightblue`, `lightcoral`, `lightcyan`, `lightgoldenrodyellow`, `lightgray`, `lightgreen`, `lightgrey`, `lightpink`, `lightsalmon`, `lightseagreen`, `lightskyblue`, `lightslategray`, `lightslategrey`, `lightsteelblue`, `lightyellow`, `lime`, `limegreen`, `linen`, `magenta`, `maroon`, `mediumaquamarine`, `mediumblue`, `mediumorchid`, `mediumpurple`, `mediumseagreen`, `mediumslateblue`, `mediumspringgreen`, `mediumturquoise`, `mediumvioletred`, `midnightblue`, `mintcream`, `mistyrose`, `moccasin`, `navajowhite`, `navy`, `oldlace`, `olive`, `olivedrab`, `orange`, `orangered`, `orchid`, `palegoldenrod`, `palegreen`, `paleturquoise`, `palevioletred`, `papayawhip`, `peachpuff`, `peru`, `pink`, `plum`, `powderblue`, `purple`, `rebeccapurple`, `red`, `rosybrown`, `royalblue`, `saddlebrown`, `salmon`, `sandybrown`, `seagreen`, `seashell`, `sienna`, `silver`, `skyblue`, `slateblue`, `slategray`, `slategrey`, `snow`, `springgreen`, `steelblue`, `tan`, `teal`, `thistle`, `tomato`, `turquoise`, `violet`, `wheat`, `white`, `whitesmoke`, `yellow`, and `yellowgreen`. Names are ASCII case-insensitive, and all resolve to sRGB; `grey`/`gray`, `aqua`/`cyan`, and `fuchsia`/`magenta` are aliases by value. `transparent` (transparent black) and `currentColor` are separate special values, not entries in that opaque-name list. These names are standardized for compatibility; the spec warns that their intuitive ordering and naming are inconsistent, so design tokens are often clearer. In quirks mode, a separate legacy `<quirky-color>` rule permits certain hashless hexadecimal tokens in a limited set of color properties; it is not valid modern authoring syntax.

CSS Color 4’s complete system-color keyword set is `AccentColor`, `AccentColorText`, `ActiveText`, `ButtonBorder`, `ButtonFace`, `ButtonText`, `Canvas`, `CanvasText`, `Field`, `FieldText`, `GrayText`, `Highlight`, `HighlightText`, `LinkText`, `Mark`, `MarkText`, `SelectedItem`, `SelectedItemText`, and `VisitedText`. Their used colors depend on the user agent’s active scheme or forced palette. The specification’s expected legible pairings include `Canvas` with `CanvasText`, link colors, or visited/active text; `ButtonFace`/`ButtonText`; `Field`/`FieldText`; `Mark`/`MarkText`; `Highlight`/`HighlightText`; `SelectedItem`/`SelectedItemText`; and `AccentColor`/`AccentColorText`. `ButtonBorder` is intended for borders against `Canvas`, `ButtonFace`, or `Field`; `GrayText` is expected to remain readable over the backgrounds, possibly at lower contrast. Other combinations are not guaranteed to have sufficient contrast. The 23 legacy system-color keywords are `ActiveBorder`, `ActiveCaption`, `AppWorkspace`, `Background`, `ButtonHighlight`, `ButtonShadow`, `CaptionText`, `InactiveBorder`, `InactiveCaption`, `InactiveCaptionText`, `InfoBackground`, `InfoText`, `Menu`, `MenuText`, `Scrollbar`, `ThreeDDarkShadow`, `ThreeDFace`, `ThreeDHighlight`, `ThreeDLightShadow`, `ThreeDShadow`, `Window`, `WindowFrame`, and `WindowText`. User agents must still accept and map them to modern keywords, but authors must not use them. The mappings are respectively to `ButtonBorder` (ActiveBorder, InactiveBorder, ThreeDDarkShadow, ThreeDHighlight, ThreeDLightShadow, ThreeDShadow, WindowFrame), `Canvas` (ActiveCaption, AppWorkspace, Background, InactiveCaption, InfoBackground, Menu, Scrollbar, Window), `ButtonFace` (ButtonHighlight, ButtonShadow, ThreeDFace), `CanvasText` (CaptionText, InfoText, MenuText, WindowText), and `GrayText` (InactiveCaptionText).

| Syntax family | What it represents |
| --- | --- |
| Named colors, `transparent`, system colors, `currentColor` | Named colors and the short keyword forms resolve to sRGB. System colors such as `Canvas`, `CanvasText`, `LinkText`, and `ButtonText` adapt to the active user-agent color scheme; they are semantic palette values, not fixed RGB constants. `currentColor` refers to the element’s foreground color. |
| Hex: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` | sRGB channels, with optional alpha. Short forms duplicate each digit: `#abc` equals `#aabbcc`; the final byte/nibble in 4/8 digit forms is alpha. |
| `rgb()` / `rgba()`, `hsl()` / `hsla()`, `hwb()` | sRGB-based color syntax. `rgb()`/`rgba()` and `hsl()`/`hsla()` support modern space-separated syntax with optional `/ alpha` and legacy comma syntax; `rgba()`/`hsla()` are aliases. `hwb()` uses modern space-separated syntax only. Modern RGB channels can mix numbers and percentages; modern HSL saturation/lightness accept numbers or percentages (legacy comma forms require percentages); HWB whiteness/blackness use percentages. |
| `lab()`, `lch()`, `oklab()`, `oklch()` | Perceptual spaces. Lab/LCH use the CIE Lab model and D50 reference white; Oklab/OKLCH use the Oklab model and D65. LCH and OKLCH are polar forms with hue angles. They can express colors outside a particular display’s gamut. |
| `color(<space> …)` predefined SDR spaces | CSS Color 4 defines `srgb`, `srgb-linear`, `display-p3`, `display-p3-linear`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz`, `xyz-d50`, and `xyz-d65`. `*-linear` is linear-light; white points differ by space (for example, ProPhoto RGB and Lab use D50 while sRGB/P3/Rec.2020 use D65). This matters for color conversion and interpolation. |
| HDR functions and spaces | CSS Color HDR Level 1 adds `rec2100-pq`, `rec2100-hlg`, and `rec2100-linear` to `color()`, plus `ictcp()`, `jzazbz()`, `jzczhz()`, and the `color-hdr()` function (the spec grammar production is named `<hdr-color()>`). CSS Color 5 defines `alpha()` for relative colors, which the HDR draft also includes in the color-function grammar. ICtCp and Jzazbz/JzCzhz are device-independent HDR-oriented spaces; `alpha()` extracts or changes an origin color’s alpha; `color-hdr()` interpolates between two colors at distinct HDR-headroom values, in absolute D65 XYZ, based on available headroom without exposing that value to script. These are draft-defined, not a browser-support guarantee. |
| CSS Color 5 functions | The current Level 5 draft adds relative color syntax (`from <color>` with component keywords and math), `color-mix()`, `light-dark()`, `contrast-color()`, ICC-profile custom spaces via `@color-profile`, and `device-cmyk()`. These are draft features and must be checked individually for browser support. |

Colors may be valid but outside the output device’s gamut. For SDR colors destined for an RGB display or 8-bit canvas, the current Color 4 draft lets an implementation choose among three defined gamut-mapping algorithms. All use a relative-colorimetric intent, leave in-gamut colors unchanged, and aim for constant-lightness, constant-hue chroma reduction in Oklch; a particular result is not necessarily a parser error. The same draft treats photographic images differently: preserving relationships between neighboring pixels may require a perceptual rendering intent that can also change in-gamut colors. Interpolation space matters too: mixing in gamma-encoded sRGB can differ from a perceptual space such as Oklab. `color-mix()` defaults to Oklab; polar spaces use a hue interpolation method (`shorter` by default, or `longer`, `increasing`, `decreasing`). Mix percentages normalize to a total of 100%; omitted weights share the remainder, sums below 100% also multiply the result alpha by that sum, and a total of zero yields transparent. Interpolation premultiplies alpha, and missing components can be carried forward when the paired component is missing.

Relative color syntax derives channels from an origin color, for example `rgb(from rebeccapurple r g calc(b * 0.7))`. It works with modern color syntax, not legacy comma syntax; omitted alpha inherits the origin alpha, while an explicit alpha expression can change it. `alpha(from <color> / <alpha-value>)` is a concise draft form when only alpha needs changing. Relative colors operate in the destination function’s space, and out-of-gamut intermediate components are not necessarily clipped during the calculation. The modern `device-cmyk()` syntax takes four CMYK components as numbers from 0 to 1 or percentages from 0% to 100%, optionally followed by `/ alpha`; out-of-range component values are clamped at computed-value time. The legacy four-number syntax is retained. The function is not colorimetric by itself: a valid `@color-profile device-cmyk` ICC profile may supply a Lab conversion, otherwise the specification’s naive conversion to sRGB is required. Neither path guarantees a particular print result without a matching device, ink, paper, and profile. CSS Color 5’s current at-risk list is specifically custom color spaces, `@color-profile`, `device-cmyk()`, and relative alpha colors; “at-risk” is a W3C process status for possible implementation/interoperability difficulty, not a prediction that the feature will be dropped. Treat all Editor’s Draft syntax as subject to change and verify implementations.

`contrast-color(<color>)` in the current draft returns black or white, whichever gives maximum contrast for text over the supplied solid background; if tied, it returns white. The exact contrast algorithm is user-agent-defined. Although the draft describes the selected color as providing guaranteed contrast, the function does not let an author choose or assert a project-specific WCAG threshold, and contrast alone does not guarantee legibility. Measure the final pair and test the actual text, size, weight, and surrounding content when a defined accessibility threshold is required.

The Color 5 `@color-profile` at-rule has three descriptors: `src` (profile URL), `rendering-intent` (initial `relative-colorimetric`; alternatives `absolute-colorimetric`, `perceptual`, and `saturation`), and `components` (ordered component identifiers for the profile). `CSSColorProfileRule` exposes read-only `name`, `src`, `renderingIntent`, and `components` strings through CSSOM. These are working-draft additions; check support and loading constraints before depending on them. Do not confuse a calibrated ICC profile declared with `@color-profile` and used by `color(--profile …)` with uncalibrated `device-cmyk()`.

### `color-scheme`: coordinate with the user’s light/dark preference

`color-scheme` tells the browser which schemes an element and its descendants are designed to support. Its initial value is `normal`; it is inherited. `normal` follows the page scheme. `light` and `dark` declare supported schemes, in preference order when both are listed. The UA selects the used scheme using this support and the user’s preference. The `only` modifier marks sole support and forbids overriding that declared scheme to satisfy an overriding color-scheme preference (for example, `color-scheme: only light`). The draft grammar also reserves `<custom-ident>` for future compatibility, but explicitly says it has no meaning today; authors should not use arbitrary identifiers. `color-scheme` does not automatically recolor the author’s entire stylesheet.

The used scheme affects browser-provided surfaces and controls, including default form-control and scrollbar colors, system colors, `light-dark()`, and—on the root element—the canvas surface and viewport scrollbars. A `<meta name="color-scheme" content="light dark">` can advertise support before CSS is available and reduce a flash of the wrong default canvas/control colors. A component can set `color-scheme: dark` so its own native controls match a dark panel. User agents are not required to implement every named preference, so `color-scheme: dark` alone is not a substitute for testing or authored theme styles.

Use the page-level `<meta name="color-scheme">` when possible so the page scheme and `prefers-color-scheme` behavior agree. A `:root { color-scheme: light dark; }` declaration is the CSS alternative. `color-scheme` chiefly affects browser-controlled UI, system colors, and scheme-aware functions; the author still needs to style their own surfaces and text for each theme. Embedded documents receive the embedding element’s scheme as their preference.

### `dynamic-range-limit`: constrain HDR output range

The HDR Level 1 draft defines `dynamic-range-limit` as an inherited property applying to all elements. Its initial value is `no-limit`. `standard` caps the highest displayed luminance at HDR reference white (CSS white); `constrained` permits some HDR above reference white for comfortable mixed SDR/HDR viewing; `no-limit` permits a much higher peak, with the exact peak unspecified. The property controls rendering policy; it does not convert the authored color or reveal a numeric screen capability.

The draft also defines `dynamic-range-limit-mix(<limit> <percentage>, …)`. It accepts one or more `standard`, `constrained`, `no-limit`, or nested mixed limits; percentages normalize to 100%, and values are mixed in stops above HDR reference white. The computed result remains a symbolic limit/mix rather than exposing actual device headroom. The draft currently gives animation as interpolation using this mix function. Like the HDR color syntax, this is a developing feature and must be support-tested.

### `forced-color-adjust`: preserve accessibility-driven forced palettes

This inherited property accepts `auto` (initial), `none`, or `preserve-parent-color`. In forced-colors mode, `auto` allows the browser to replace author colors with a user-selected high-contrast palette. `none` opts that element out of those automatic color substitutions; use it only when the author-provided colors have been deliberately adjusted for the user’s contrast needs. It is not a general dark-mode switch.

`preserve-parent-color` is mainly for embedded SVG: in forced-colors mode, when the SVG’s `color` inherits from its parent, it computes to the parent’s used color while otherwise behaving like `none`. This lets SVG artwork preserve its own palette but still receive the surrounding text color where inherited. The specification expects user-agent stylesheets to apply this value to SVG roots and `auto` to `foreignObject` descendants. The property does not make inaccessible hard-coded color combinations safe; keep focus, boundaries, status, and contrast perceivable in forced-colors mode.

### `print-color-adjust`: a hint for output-device adjustments

This inherited property accepts `economy` (initial) or `exact`. `economy` permits the user agent to simplify print or other output styling—for example, omit backgrounds or change light text to a dark ink-friendly color. `exact` asks the user agent to preserve specified colors/styles because they carry meaning, such as alternating row colors in printed directions. It remains a hint: an explicit user preference takes precedence, and it cannot guarantee the printer, paper, or browser reproduces a screen color exactly. The root element’s value propagates to the document viewport; setting it on HTML `body` alone does not perform that propagation. The older `color-adjust` shorthand is deprecated; set `print-color-adjust` directly.

### `opacity`: composite a whole painted group

`opacity` accepts a number or percentage; percentages map to `[0, 1]`. Initial value is `1`; it is not inherited. The computed value is clamped to `[0, 1]`. Values below `1` composite the element—including its descendants—as one group and create a stacking context. Thus a child cannot become fully opaque by setting its own opacity to `1` when an ancestor group is translucent. At `0`, the group is invisible but still occupies layout space and remains in the document; opacity does not change hit testing or signal that the content is unavailable to assistive technology. Use separate interaction and accessibility state when content should be unavailable.

Use an alpha color when only one paint should be translucent; use `opacity` when the whole rendered subtree should blend with what is behind it. This avoids unintentionally fading text, icons, borders, and child controls together.

## Cross-item comparison

| Need | Property/mechanism | What it controls |
| --- | --- | --- |
| Text’s foreground and default `currentColor` | `color` | One inherited foreground color, including system and wide-gamut color values. |
| Native controls/scrollbars and declared light/dark support | `color-scheme` | The UA’s used color scheme for browser-provided surfaces and related system colors. |
| Respect or deliberately adapt to forced high-contrast colors | `forced-color-adjust` | Whether UA forced-color substitutions apply to a subtree. |
| Let print/save output optimize ink or preserve meaningful style | `print-color-adjust` | A user-overridable hint for output-device adjustments. |
| Make a single color translucent | The color’s `/ alpha` component | Only that paint value. |
| Make the element and all descendants translucent together | `opacity` | Post-paint group compositing and stacking context. |
| Bound HDR rendering intensity | `dynamic-range-limit` | A draft HDR output-luminance policy, not an RGB color conversion. |

## Examples

Declare both schemes and let native controls follow the user preference, while providing authored foreground/background values for the page itself:

```css
:root {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root { color: #f4f4f5; background: #18181b; }
}
```

Keep text opaque while making only a background fill translucent:

```css
.notice { background-color: rgb(30 64 175 / 75%); color: white; }
```

By contrast, `opacity: .75` on `.notice` would also fade its text and every descendant.

Use a wide-gamut color with an sRGB fallback when a supporting browser/display can show it:

```css
.accent { color: #e11d48; }
@supports (color: color(display-p3 1 0 0)) {
  .accent { color: color(display-p3 1 0.12 0.34); }
}
```

For a deliberately contrast-aware black/white choice, use the draft function only with a fallback and validate the resulting design:

```css
.label { color: white; }
@supports (color: contrast-color(white)) {
  .label { color: contrast-color(var(--label-background)); }
}
```

Use the scheme-aware `light-dark()` function when the same component needs paired values, and choose an explicit interpolation space when mixing:

```css
.card {
  color-scheme: light dark;
  color: light-dark(#202124, #f1f3f4);
  border-color: color-mix(in oklch shorter hue, currentColor 30%, transparent);
}
```

On an HDR-capable implementation, `color-hdr()` can describe SDR and HDR endpoints. The numeric headroom values are stops above HDR reference white; the user agent selects/interpolates for the current output headroom:

```css
.hdr-highlight {
  color: color-hdr(
    color(rec2100-linear 0.9 1.0 0.8) 0,
    color(rec2100-linear 1.8 2.0 1.5) 2
  );
}
```

For alpha-only derivation from an existing color, the draft relative-alpha form avoids restating its color channels:

```css
.overlay { background: alpha(from var(--surface-color) / 70%); }
```

Bound an HDR image gallery so multiple HDR images can be viewed together without demanding each element’s maximum range:

```css
.photo-grid img { dynamic-range-limit: constrained; }
```

## Common mistakes

1. **Thinking every color number means sRGB.** `color(display-p3 ...)`, Lab/Oklab, and HDR `rec2100-*` values use different spaces and transfer functions.
2. **Assuming out-of-gamut means invalid.** A color can be valid yet need gamut mapping on a particular output device.
3. **Treating `opacity` like an alpha channel.** Opacity composites descendants as a group; per-color alpha affects one paint value.
4. **Using `contrast-color()` as an accessibility guarantee.** Its exact black/white selection algorithm is UA-defined and may not satisfy a project’s required contrast threshold.
5. **Using `forced-color-adjust: none` broadly.** It can defeat a user’s high-contrast palette; use only for components whose colors are deliberately adapted.
6. **Expecting `print-color-adjust: exact` to override the user.** User print preferences remain stronger than the author hint.
7. **Assuming `color-scheme` themes authored CSS.** It primarily coordinates UA surfaces and scheme-dependent values; author CSS still needs a theme strategy.
8. **Treating HDR limits as device telemetry.** The HDR draft intentionally does not expose actual device headroom as a script-readable value, partly to limit fingerprinting.
9. **Using color as the only status signal.** Pair color with text, shape, pattern, or another perceptible cue.

## Knowledge checks with answers

1. **What does `currentColor` mean?** The element’s used foreground color from `color`, reused by other properties that accept a color.
2. **What differs between alpha in `rgb(... / .5)` and `opacity: .5`?** The first makes that color translucent; the second composites the entire element subtree at half opacity.
3. **What does `color-scheme: light dark` promise?** It declares the schemes the element supports so the UA can select its native UI colors; it does not theme every author color.
4. **Must `color(display-p3 1 0 0)` display as P3 red on every screen?** No. The color can be valid while outside the output device’s gamut, so it is gamut-mapped for that device.
5. **Can `print-color-adjust: exact` force a printer to preserve backgrounds?** No. It is an author hint, and explicit user output preferences take precedence.
6. **When should `forced-color-adjust: none` be used?** Only where the author is deliberately supplying colors that meet the user’s contrast needs.
7. **What does `dynamic-range-limit: standard` mean in the HDR draft?** The highest displayed luminance is limited to HDR reference white (CSS white); it does not itself alter the CSS color value.

## Source map

- [CSS Color Module Level 4, current Editor’s Draft](https://drafts.csswg.org/css-color-4/): `color`, `opacity`, color syntaxes, color spaces, interpolation, and gamut mapping.
- [CSS Color Module Level 5](https://drafts.csswg.org/css-color-5/): relative colors, `color-mix()`, `light-dark()`, `contrast-color()`, custom ICC color profiles, and `device-cmyk()`.
- [CSS Color HDR Module Level 1](https://drafts.csswg.org/css-color-hdr-1/): HDR `color()` spaces and `dynamic-range-limit`.
- [CSS Color Adjustment Module Level 1](https://drafts.csswg.org/css-color-adjust/): `color-scheme`, `forced-color-adjust`, and `print-color-adjust`.
- [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/): specification status context.
