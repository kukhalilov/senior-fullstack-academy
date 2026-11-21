# CSS selectors at-rules cascade values and box model — Reference: CSS Box Model and Related Sizing Properties

## Scope and version

The controlled inventory is from the pinned [MDN properties data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/properties.json). Box sizing fundamentals are described in [MDN's box model guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction) and [box-sizing reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-sizing). The inventory combines established box-model properties with newer sizing features: MDN currently marks [`column-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-height), [`column-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-wrap), and [`frame-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/frame-sizing) as experimental and limited availability. Check compatibility for each property rather than treating this combined reference group as a uniform support baseline.

## How this group fits the mental model

The box model separates content, padding, border, and margin. This lesson focuses on sizing, padding, and margin; border styling is covered in the CSS backgrounds-and-borders reference, and the full logical sizing and spacing names are enumerated in the CSS logical-properties reference. Width/height and min/max constraints interact with intrinsic sizing, aspect ratio, writing mode, and layout algorithms. A computed dimension is not always the outer rendered size.

## Supplied names explained

### Primary dimensions and sizing constraints

- **`width`** — Sets the preferred physical horizontal dimension, subject to its applicability and the current layout algorithm; it is not the writing-mode-relative inline size in every writing mode. Lengths/percentages and intrinsic sizing keywords are interpreted by the sizing algorithm, and `box-sizing` determines which box a quantitative size targets.
- **`height`** — Sets the preferred physical vertical dimension, subject to its applicability and layout context. A fixed or otherwise constrained height can leave content overflowing. Percentage height generally needs a definite containing-block height to resolve as a percentage; otherwise it often behaves as `auto`, with layout-specific exceptions.
- **`min-width` / `min-height`** — Establish lower bounds. Their initial value is `auto`, whose used minimum can reflect intrinsic content in flex/grid layout; the exact automatic minimum depends on the item, its overflow, and track/layout conditions.
- **`max-width` / `max-height`** — Establish upper bounds. They constrain the preferred size, but if a minimum-size constraint exceeds the maximum, sizing rules prioritize the minimum rather than guaranteeing the max value.
- **`aspect-ratio`** — Supplies a preferred width-to-height ratio used to transfer size between dimensions when sizing rules leave an automatic dimension to determine. Intrinsic ratios of replaced elements and min/max constraints also participate; the ratio does not override two definite dimensions.
- **`box-sizing`** — Selects how applicable quantitative sizing values map to the box: `content-box` targets the content box, while `border-box` targets the border box. It does not include margins, and non-quantitative intrinsic sizing keywords are not generally converted by this property.

### Padding and margin

- **`padding`** — One-to-four-value shorthand for the four physical padding sides; padding sits between content and border and cannot be negative. Percentage padding on every side, including top and bottom, is based on the containing block's inline size.
- **`padding-top`, `padding-right`, `padding-bottom`, `padding-left`** — Set individual physical padding edges; use logical padding for writing-mode-aware layout.
- **`margin`** — One-to-four-value shorthand for physical margins; margins can be negative or `auto`. Percentage margins on every side are based on the containing block's inline size. Adjoining block-axis margins may collapse instead of adding.
- **`margin-top`, `margin-right`, `margin-bottom`, `margin-left`** — Set individual physical margin edges; auto-margin distribution, percentage resolution, and collapse depend on formatting context. Vertical collapse applies to eligible block margins, not flex/grid items or absolutely positioned boxes; mixed positive/negative groups combine their largest positive and most negative values.

### Intrinsic placeholders, multicolumn dimensions, and frames

- **`contain-intrinsic-size`** — Provides placeholder intrinsic sizes for size-contained content (including `content-visibility: auto` use cases), reducing layout collapse while content is skipped. It supports physical-axis values and `auto` forms; with `auto`, the browser can reuse a remembered size from when content was rendered, while an author-provided estimate covers the pre-render case. Inaccurate estimates can cause shifts when real content appears.
- **`contain-intrinsic-width`, `contain-intrinsic-height`** — Physical-axis components of intrinsic placeholder size for size containment; use logical equivalents where writing mode should control the axis.
- **`contain-intrinsic-inline-size`, `contain-intrinsic-block-size`** — Logical-axis placeholder intrinsic sizes, adapting to writing mode.
- **`column-width`** — Sets a preferred multicolumn column width; actual count and width depend on available inline size, gaps, and constraints.
- **`column-height`** — Experimental Multi-column Level 2 property accepting `auto` or a non-negative length. A length fixes each column's block size and changes overflow/fragmentation behavior; it can be combined with `column-wrap` to arrange overflow columns in rows.
- **`column-wrap`** — Experimental Multi-column Level 2 property with `auto`, `nowrap`, and `wrap`. `nowrap` places overflow columns in the inline direction; `wrap` makes additional rows in the block direction. `auto` resolves to `wrap` when `column-height` is a length and to `nowrap` when it is `auto`.
- **`frame-sizing`** — Experimental, limited-availability property for `<iframe>` sizing: `content-width`, `content-height`, `content-inline-size`, or `content-block-size` makes the corresponding iframe dimension adopt the embedded document's layout size; `auto` (initial) leaves the iframe size unaffected. The embedded document must opt in with `<meta name="responsive-embedded-sizing">` for security/privacy. Logical inline/block direction follows the iframe's writing mode. The embedded document can call `Window.requestResize()` to report a changed content size; the property does not implement the opt-in or resize reporting by itself.

## Cross-item comparison

`width`/`height` express physical dimensions; `inline-size`/`block-size` and their min/max forms are writing-mode-aware alternatives covered in the separate logical-properties inventory. Physical margin/padding sides have analogous logical forms there. `min-*` and `max-*` constrain the preferred size, but a larger minimum can defeat a smaller maximum and neither property alone determines overflow handling. `aspect-ratio` transfers sizing between dimensions when the algorithm leaves a dimension automatic; it does not override two definite dimensions. Padding is inside the border, margin is outside it, and percentages for both resolve from the containing block's inline size. Vertical adjoining margins may collapse in block layout; they do not collapse in flex/grid layout. `contain-intrinsic-size` supplies estimates or remembered sizes for skipped/contained content, while width/height size the actual box. `column-width` influences column count/width; `column-height` and `column-wrap` are experimental Level 2 controls for fixed-height columns and overflow rows. With `column-wrap: auto`, a length `column-height` resolves to wrapping; `auto` height resolves to no wrapping. `frame-sizing` is experimental and applies to iframes only after the embedded document opts into size sharing.

## Examples

```css
.card {
  box-sizing: border-box;
  inline-size: min(100%, 42rem);
  min-block-size: 12rem;
  aspect-ratio: 16 / 9;
  padding: 1.25rem;
  margin-inline: auto;
}

.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 24rem;
}

/* Percentage padding, including block-side padding, uses the containing
   block's inline size; vertical margins may collapse in block layout. */
.callout { padding-block: 5%; margin-block: 1rem; }
```

The second rule estimates the skipped item's size; choose estimates from realistic content and monitor layout shifts. Do not add a fixed aspect ratio when content height must remain intrinsic without considering overflow/cropping.

## Common mistakes

- Adding padding/border to a declared `content-box` width without accounting for the larger outer size.
- Assuming `border-box` includes margin, or that it can always keep the border box at the requested size when padding and borders alone exceed it.
- Assuming `max-width` alone handles an item's minimum intrinsic size.
- Assuming percentage top/bottom padding or margins are percentages of the containing block's height; they are based on its inline size.
- Using `height` where `min-height` or content-driven sizing is safer.
- Ignoring vertical margin collapse when measuring spacing.
- Using physical sides in a layout that must work under right-to-left or vertical writing modes.
- Setting placeholder intrinsic sizes far from real content and causing layout shifts.
- Assuming multicolumn `column-height`/`column-wrap` or `frame-sizing` are broadly available.
- Expecting frame sizing without the embedded document's explicit size-sharing opt-in.
- Expecting `frame-sizing` to update continuously without the embedded document reporting a new size with `Window.requestResize()`.
- Treating experimental `column-height`, `column-wrap`, or `frame-sizing` as broadly supported stable CSS.

## Knowledge checks with answers

1. **Does `border-box` include margin?** No; it includes content, padding, and border.
2. **Why might a flex item refuse to shrink below its text width?** Its automatic minimum size may preserve intrinsic content size; an explicit appropriate minimum may be needed.
3. **What is the purpose of contain-intrinsic sizing with skipped content?** Reserve an estimated size to avoid collapse while actual content is not rendered.
4. **Does `aspect-ratio` override explicit width and height unconditionally?** No; it is a preferred ratio used according to sizing rules and constraints.

## Sources and maturity

- [Pinned MDN CSS property data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/properties.json) defines the controlled property names. The adjacent [CSS logical-properties inventory](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values) covers writing-mode-aware counterparts; borders are covered by the CSS backgrounds-and-borders inventory.
- [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) groups specifications by stability, not browser adoption. The [CSS Box Sizing Level 3 Working Draft](https://www.w3.org/TR/css-sizing-3/) is the basis for preferred/min/max dimensions, aspect-ratio transfer, and box-sizing behavior.
- [CSS Box Sizing Level 4 Editor's Draft](https://drafts.csswg.org/css-sizing-4/) is exploratory work in progress that includes newer sizing and intrinsic-size behavior and the `frame-sizing` proposal. Treat its additions as draft features.
- [CSS Containment Level 2 Editor's Draft](https://drafts.csswg.org/css-contain-2/) describes intrinsic placeholders and remembered sizes used when content is skipped.
- [CSS Multi-column Level 2 Editor's Draft](https://drafts.csswg.org/css-multicol-2/) defines `column-height` and `column-wrap`; MDN marks these as experimental with limited availability.
- [CSS Box Model Level 4 Editor's Draft](https://drafts.csswg.org/css-box-4/) describes padding, margin, and physical box edges; [MDN's margin-collapsing guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Margin_collapsing) explains the principal collapse cases and negative-margin arithmetic.
- Current MDN references for [`padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/padding), [`frame-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/frame-sizing), [`column-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-height), and [`column-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-wrap) provide the current author-facing syntax and feature status.
