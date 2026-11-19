# CSS selectors at-rules cascade values and box model — Reference: Standard CSS units

## Scope and version

Unit names follow the pinned [MDN units inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/units.json) and [length unit reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length). A unit is only valid where the property's value grammar accepts its type. Browser support, device behavior, and writing mode can affect results.

## How this group fits the mental model

Units attach dimensions to numeric values. Absolute units have defined conversions; relative units resolve against fonts, root fonts, viewport, query containers, or line metrics. Angle, time, frequency, resolution, and grid-flex units are separate dimensions and cannot be substituted freely. A unit can be valid yet produce an undesirable responsive, accessibility, or print result.

## Supplied names explained

### Font-relative lengths

- `em` — Relative to the computed font size of the element for most properties; for `font-size` itself it is relative to the parent's computed font size.
- `rem` — Relative to the root element's font size; in the root element's own `font-size` declaration it is resolved against the initial font-size to avoid a self-reference. It is useful for root-based scales, but does not automatically make a design accessible or responsive.
- `ex` — Relative to the font's x-height, with UA/font fallback behavior when unavailable.
- `cap` — Relative to the font's capital-letter height.
- `ch` — Relative to the advance measure of the “0” glyph in the relevant font; it is a rough character-width measure, not a guaranteed column count.
- `ic` — Relative to the advance measure of the CJK water ideograph glyph in the relevant font.
- `lh` — Relative to the element's computed line height. In `line-height` and other font-affecting properties on that element, it instead resolves from the parent's computed metrics (or initial metrics when there is no parent), avoiding self-reference.
- `rcap`, `rch`, `rex`, `ric` — Root-element font-metric equivalents of `cap`, `ch`, `ex`, and `ic`; they use the root element's font metrics rather than the current element's.
- `rlh` — Root element's computed line-height-relative unit.

### Viewport-relative lengths

Viewport-relative units use the large viewport as the default (`vh`, `vw`, etc. are legacy spellings of the large variants). Small (`s`), large (`l`), and dynamic (`d`) families are available for width/height/inline/block/min/max dimensions. The small viewport assumes retractable browser UI is expanded; the large viewport assumes it is retracted; dynamic units can change as that UI expands or retracts, but the update cadence is user-agent-defined and can cause layout changes during scroll.

- `vh`, `vw` — 1% of the large viewport height/width; `vmin`/`vmax` choose the smaller/larger of its physical width and height.
- `vi`, `vb` — 1% of the large viewport's logical inline/block dimension, respecting writing mode.
- `vmin`, `vmax` — 1% of the smaller/larger large-viewport physical dimension; they correspond to `lvmin` and `lvmax`.
- `svh`, `svw`, `svi`, `svb`, `svmin`, `svmax` — Small viewport height, width, inline, block, minimum, and maximum variants.
- `lvh`, `lvw`, `lvi`, `lvb`, `lvmin`, `lvmax` — Large viewport variants.
- `dvh`, `dvw`, `dvi`, `dvb`, `dvmin`, `dvmax` — Dynamic viewport variants whose values are between corresponding small and large viewport sizes. They may update as browser UI changes, but do not assume a particular event-by-event update during scrolling.

### Container-query relative lengths

These resolve against the nearest eligible size query container for the relevant axis. If no eligible query container exists, the units fall back to the corresponding small viewport dimensions. Container units do not themselves create a query container; `container-type`/containment and the nearest-eligible-ancestor rules determine which box is used.

- `cqw`, `cqh` — 1% of the query container's width or height.
- `cqi`, `cqb` — 1% of its logical inline or block size.
- `cqmin`, `cqmax` — 1% of the smaller or larger of the query container's logical inline and block sizes; equivalently, the smaller/larger of `cqi` and `cqb`.

### Absolute lengths

- `px` — CSS reference pixel, not necessarily one physical display pixel.
- `in`, `cm`, `mm`, `Q`, `pt`, `pc` — Inch, centimeter, millimeter, quarter-millimeter, point, and pica. CSS fixes their ratios (`1in = 96px`, `1in = 2.54cm`, `1Q = 1/40cm`, `1pt = 1/72in`, `1pc = 12pt`); on screens they do not guarantee physical measurement.

### Angle, time, frequency, resolution, and grid units

- `deg`, `grad`, `rad`, `turn` — Degree, gradian, radian, and full-turn angle units.
- `s`, `ms` — Seconds and milliseconds.
- `Hz`, `kHz` — Cycles per second and kilohertz for frequency grammars.
- `dpi`, `dpcm`, `dppx`, `x` — Dots per inch, dots per centimeter, and dots per CSS pixel; `x` is an alias of `dppx` where the resolution grammar accepts it. Resolution is not the same as CSS-pixel size or the device's physical pixel dimensions.
- `fr` — Fraction of leftover space in a grid track-sizing context after non-flexible contributions; it is not a length and is not a general width unit.

## Cross-item comparison

Use `rem` when a root-level scale is intentional and `em` when a component should scale with its own text; nested `em` values can compound. Use `lh` when spacing should track line height, but verify font/line-height inheritance. `svh` avoids large dynamic UI expansion by sizing to the small viewport; `lvh` assumes the large viewport; `dvh` tracks browser UI and can resize during scrolling. Logical `vi/vb` and `cqi/cqb` adapt to writing mode, whereas `vw/vh` and `cqw/cqh` are physical axes. Absolute units convert predictably in CSS but are not physically exact on screens. `fr` allocates grid leftover space, while lengths consume a dimensional size.

## Examples

```css
.page { padding-inline: clamp(1rem, 4vi, 3rem); }
.dialog { max-block-size: 80dvh; }
.card-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); }
.reading-column { inline-size: 65ch; }
```

For full-height mobile layouts, test browser chrome behavior and safe-area insets; viewport units do not by themselves account for notches or home indicators. Choose logical axes when the layout should follow writing mode.

Primary definitions: [CSS Values and Units 4](https://drafts.csswg.org/css-values-4/) defines font, viewport, absolute, angle, time, frequency, and resolution units; [CSS Containment 3](https://drafts.csswg.org/css-contain-3/) defines container query length units and query-container selection; [CSS Grid Layout 2](https://drafts.csswg.org/css-grid-2/) defines `fr`; and [CSS Environment Variables 1](https://drafts.csswg.org/css-env-1/) defines environment values such as safe-area insets. These are living specifications; consult current browser compatibility data before relying on newer units.

## Common mistakes

- Assuming `1px` equals one hardware pixel or that `1in` is physically one inch on screen.
- Treating `ch` as an exact count of characters for arbitrary text/font combinations.
- Using nested `em` values without noticing compounding.
- Assuming `vh` always corresponds to the visible mobile viewport; compare small/large/dynamic variants.
- Forgetting query-container units need a suitable query container for intended behavior.
- Using physical viewport units where a writing-mode-aware logical dimension is required.
- Using `fr` outside grid track sizing.
- Mixing time, angle, frequency, resolution, and length values in calculations without compatible dimensional grammar.

## Knowledge checks with answers

1. **What is `1rem` relative to?** The root element's font size.
2. **Which viewport family tracks changing browser UI?** The dynamic `dv*` family.
3. **Is `65ch` guaranteed to fit exactly 65 arbitrary letters?** No; `ch` is based on a font's “0” advance measure.
4. **What does `1fr` represent?** A share of leftover space in grid track sizing, after non-flexible contributions.
5. **Are CSS absolute units physically exact on a screen?** No; their CSS conversions are defined but screen rendering maps CSS pixels to device pixels and physical scale.
