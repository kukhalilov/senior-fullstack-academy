# CSS selectors at-rules cascade values and box model — Reference: Standard CSS units

## Scope and version

Unit names follow the pinned [MDN units inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/units.json) and [length unit reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length). A unit is only valid where the property's value grammar accepts its type. Browser support, device behavior, and writing mode can affect results.

## How this group fits the mental model

Units attach dimensions to numeric values. Absolute units have defined conversions; relative units resolve against fonts, root fonts, viewport, query containers, or line metrics. Angle, time, frequency, resolution, and grid-flex units are separate dimensions and cannot be substituted freely. A unit can be valid yet produce an undesirable responsive, accessibility, or print result.

## Supplied names explained

### Font-relative lengths

- `em` — Relative to the computed font size of the element for most properties; for `font-size` itself it is relative to the parent's computed font size.
- `rem` — Relative to the root element's font size (with document-mode details); useful for scalable root-based spacing/type systems.
- `ex` — Relative to the font's x-height, with UA/font fallback behavior when unavailable.
- `cap` — Relative to the font's capital-letter height.
- `ch` — Relative to the advance measure of the “0” glyph in the relevant font; it is a rough character-width measure, not a guaranteed column count.
- `ic` — Relative to the advance measure of the CJK water ideograph glyph in the relevant font.
- `lh` — Relative to the computed line height of the element; on the `line-height` property itself it uses the special parent-based rule.
- `rcap`, `rch`, `rex`, `ric` — Root-element equivalents of `cap`, `ch`, `ex`, and `ic`.
- `rlh` — Root element's computed line-height-relative unit.

### Viewport-relative lengths

Each viewport family has small (`s`), large (`l`), and dynamic (`d`) variants for width/height/inline/block/max/min dimensions. Dynamic units track changing browser UI, potentially causing repeated resizing during scroll; small units represent the small viewport and large units the large viewport.

- `vh`, `vw` — 1% of the large viewport height/width; `vmin`/`vmax` choose the smaller/larger dimension.
- `vi`, `vb` — 1% of the large viewport's logical inline/block dimension, respecting writing mode.
- `vmin`, `vmax` — 1% of the smaller/larger large-viewport dimension.
- `svh`, `svw`, `svi`, `svb`, `svmin`, `svmax` — Small viewport height, width, inline, block, minimum, and maximum variants.
- `lvh`, `lvw`, `lvi`, `lvb`, `lvmin`, `lvmax` — Large viewport variants.
- `dvh`, `dvw`, `dvi`, `dvb`, `dvmin`, `dvmax` — Dynamic viewport variants that update with dynamic browser chrome; can affect layout while scrolling.

### Container-query relative lengths

These resolve against the relevant eligible query container; without one, fallback behavior uses the small viewport dimensions as specified.

- `cqw`, `cqh` — 1% of the query container's width or height.
- `cqi`, `cqb` — 1% of its logical inline or block size.
- `cqmin`, `cqmax` — 1% of its smaller or larger eligible dimension.

### Absolute lengths

- `px` — CSS reference pixel, not necessarily one physical display pixel.
- `in`, `cm`, `mm`, `Q`, `pt`, `pc` — Inch, centimeter, millimeter, quarter-millimeter, point, and pica. CSS defines fixed conversion ratios among these units; on screens they do not guarantee physical measurement.

### Angle, time, frequency, resolution, and grid units

- `deg`, `grad`, `rad`, `turn` — Degree, gradian, radian, and full-turn angle units.
- `s`, `ms` — Seconds and milliseconds.
- `Hz`, `kHz` — Cycles per second and kilohertz for frequency grammars.
- `dpi`, `dpcm`, `dppx`, `x` — Dots per inch, dots per centimeter, dots per CSS pixel, and resolution multiplier; `x` is an alias of `dppx` in resolution contexts.
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
