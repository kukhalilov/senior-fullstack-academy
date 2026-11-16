# CSS selectors at-rules cascade values and box model — Reference: Standard CSS Box Model and Box Sizing properties

## Scope and version

The property inventory is from the pinned [MDN properties data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/properties.json). Box sizing fundamentals are described in [MDN's box model guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction) and [box-sizing reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-sizing). Consult the current references for [`column-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-height), [`column-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-wrap), [`frame-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/frame-sizing), and [`contain-intrinsic-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain-intrinsic-size); these newer properties have limited or context-dependent support.

## How this group fits the mental model

The box model separates content, padding, border, and margin. Width/height and min/max constraints interact with intrinsic sizing, aspect ratio, writing mode, and layout algorithms. Most names below operate on a physical width/height axis; logical sizing properties are the writing-mode-aware alternative. A computed dimension is not always the outer rendered size.

## Supplied names explained

### Primary dimensions and sizing constraints

- **`width`** — Sets the preferred physical inline dimension in horizontal writing modes; box-sizing determines whether it describes content or border box. It accepts sizing keywords and intrinsic sizing forms under its grammar.
- **`height`** — Sets the preferred physical block dimension in horizontal writing modes; content can overflow when a constrained height is too small.
- **`min-width` / `min-height`** — Establish lower bounds. Auto minimums in flex/grid contexts may reflect intrinsic content and prevent expected shrinking.
- **`max-width` / `max-height`** — Establish upper bounds; they can constrain a preferred width/height and interact with min constraints according to sizing rules.
- **`aspect-ratio`** — Supplies a preferred width-to-height ratio used when one or both dimensions are automatic; replaced elements can also have intrinsic ratios.
- **`box-sizing`** — Selects the box used for specified width/height: `content-box` or `border-box`.

### Padding and margin

- **`padding`** — Shorthand for the four physical padding sides; padding is inside the border and cannot be negative.
- **`padding-top`, `padding-right`, `padding-bottom`, `padding-left`** — Set individual physical padding edges; use logical padding for writing-mode-aware layout.
- **`margin`** — Shorthand for physical margins; margins can be negative and vertical adjoining margins may collapse in block formatting contexts.
- **`margin-top`, `margin-right`, `margin-bottom`, `margin-left`** — Set individual physical margin edges; block-axis margin collapse and auto-margin behavior depend on formatting context.

### Intrinsic placeholders, multicolumn dimensions, and frames

- **`contain-intrinsic-size`** — Provides placeholder intrinsic sizes for size-contained content (including content-visibility use cases), reducing layout collapse while content is skipped. It may accept one/two dimensions and auto forms; inaccurate estimates can cause layout shifts when real content appears.
- **`contain-intrinsic-width`, `contain-intrinsic-height`** — Physical-axis components of intrinsic placeholder size for size containment; use logical equivalents where writing mode should control the axis.
- **`contain-intrinsic-inline-size`, `contain-intrinsic-block-size`** — Logical-axis placeholder intrinsic sizes, adapting to writing mode.
- **`column-width`** — Sets a preferred multicolumn column width; actual count and width depend on available inline size, gaps, and constraints.
- **`column-height`** — Newer multicolumn property used with balancing/wrapping behavior to define a column height in applicable implementations; support is limited, and it changes fragmentation behavior.
- **`column-wrap`** — Controls whether multicolumn columns can wrap into additional rows/sets under the newer multicolumn model; support is limited and interactions with `column-height` matter.
- **`frame-sizing`** — Newer sizing behavior for replaced elements such as `<iframe>`: `content-width`, `content-height`, `content-block-size`, or `content-inline-size` can size the frame from the embedded document's corresponding content layout dimension. The embedded document must opt in with `<meta name="responsive-embedded-sizing">`; `auto` is the default. It does not bypass cross-origin rules, and support remains limited.

## Cross-item comparison

`width`/`height` express physical dimensions; `inline-size`/`block-size` are logical equivalents. `min-*` and `max-*` constrain the preferred size but do not guarantee overflow behavior. `aspect-ratio` helps derive an automatic dimension rather than overriding every explicit constraint. Padding increases the content-to-border-box size under `content-box`; margin remains outside and may collapse vertically. `contain-intrinsic-size` supplies estimates for skipped/contained content, while `width`/`height` size the actual box. `column-width` influences column count/width; `column-height` sets the column block dimension and `column-wrap` controls whether overflow columns form additional rows or continue in the inline direction. With `column-wrap: auto`, a length `column-height` resolves to wrapping; `auto` height resolves to no wrapping. `frame-sizing` concerns replaced/embedded content and requires the embedded document's opt-in for responsive content sizing; it does not apply to ordinary boxes.

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
```

The second rule estimates the skipped item's size; choose estimates from realistic content and monitor layout shifts. Do not add a fixed aspect ratio when content height must remain intrinsic without considering overflow/cropping.

## Common mistakes

- Adding padding/border to a declared `content-box` width without accounting for the larger outer size.
- Assuming `max-width` alone handles an item's minimum intrinsic size.
- Using `height` where `min-height` or content-driven sizing is safer.
- Ignoring vertical margin collapse when measuring spacing.
- Using physical sides in a layout that must work under right-to-left or vertical writing modes.
- Setting placeholder intrinsic sizes far from real content and causing layout shifts.
- Assuming multicolumn `column-height`/`column-wrap` or `frame-sizing` are broadly available.
- Treating embedded frame sizing as safe without coordinating opt-in and origin/embedding behavior.

## Knowledge checks with answers

1. **Does `border-box` include margin?** No; it includes content, padding, and border.
2. **Why might a flex item refuse to shrink below its text width?** Its automatic minimum size may preserve intrinsic content size; an explicit appropriate minimum may be needed.
3. **What is the purpose of contain-intrinsic sizing with skipped content?** Reserve an estimated size to avoid collapse while actual content is not rendered.
4. **Does `aspect-ratio` override explicit width and height unconditionally?** No; it is a preferred ratio used according to sizing rules and constraints.
