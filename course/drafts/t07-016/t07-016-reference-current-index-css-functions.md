# CSS selectors at-rules cascade values and box model — Reference: Additional functions in the current MDN CSS reference, checked 2026-11-16

## Scope and version

These names appeared in MDN's live [CSS value-function index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Functions) when checked on 2026-11-16 but were absent from the curriculum's pinned MDN data commit. They extend rather than replace the pinned list. Their standardization and browser support differ; check each current reference and CSS module before use.

## How this group fits the mental model

CSS's function vocabulary grows across math, grid, color, font, shape, conditional, and tree-counting features. A function's presence in a reference is not a support guarantee, and context is important: `repeat()` is grid syntax; font alternate functions belong in font-variant-alternates; tree-counting functions inspect the element tree; and experimental functions may be accepted only in selected browsers.

## Supplied names explained

### Color and dynamic-range values

- **`contrast-color()`** — Returns a color chosen to maximize contrast against a supplied base color, using the function's candidate-color algorithm. It is not the filter function `contrast()`, which changes the image contrast. Verify its support and do not use it as a substitute for testing actual text/background combinations against accessibility requirements.
- **`device-cmyk()`** — Constructs a device-dependent CMYK color, optionally with a fallback color for output environments that cannot represent it. It is chiefly relevant to print/color-managed workflows; screen conversion may differ by output device.
- **`dynamic-range-limit-mix()`** — Mixes dynamic-range-limit values with percentages for HDR rendering behavior. It controls luminance-range policy, not ordinary color interpolation or image opacity.

### Conditional and mathematical functions

- **`if()`** — Selects a value based on supported style, media, or feature conditions in CSS conditional-value grammar. It is not a general JavaScript expression language; branch values must satisfy the consuming property's grammar, and support is evolving.
- **`progress()`** — Computes normalized progress of a value between a start and end value, returning a number from 0 to 1 according to its math-function definition. Units/dimensions must be compatible; a zero-width interval and direction matter.
- **`random()`** — Produces a pseudo-random value within a specified range in grammars that support it. Its optional sharing/stream controls determine which declarations reuse a random result; do not use it for security, cryptography, or application data.

### Grid, shape, font, and tree functions

- **`repeat()`** — Repeats a grid track-list fragment, including fixed repetitions and auto-repeat forms such as `auto-fill`/`auto-fit`; its grammar is specific to grid track sizing.
- **`shape()`** — Defines a basic shape from a command sequence, including move/line/curve-style operations in the supported shape grammar. It can express path-like CSS geometry; syntax and interpolation support vary.
- **`superellipse()`** — Defines a superellipse curve value for corner-shape and related geometry, controlling how rounded/squircle-like corners curve between edges.
- **`sibling-count()`** — Returns the element's total number of siblings, including the element itself, for CSS calculations where the function is accepted.
- **`sibling-index()`** — Returns the element's one-based position among its siblings for CSS calculations where the function is accepted; tree/shadow context affects which siblings are considered.
- **`stylistic()`** — Requests a font-specific stylistic alternate set by an OpenType feature value, through `font-variant-alternates`.
- **`styleset()`** — Requests a named/numbered set of stylistic alternates for a coherent group of glyphs through `font-variant-alternates`.
- **`character-variant()`** — Requests font-specific character variants, potentially selecting alternate glyph forms for individual characters.
- **`swash()`** — Requests a font's swash glyph alternate, commonly a decorative terminal or flourish.
- **`ornaments()`** — Requests ornamental glyph alternates, such as fleurons, when available in the chosen font.
- **`annotation()`** — Requests annotation glyph alternates, such as circled or inverted forms, when available in the font.
- **`type()`** — Declares or references a value type in CSS linked-parameter/custom-function grammar. It is specialized syntax, not a standalone color/length value.

## Cross-item comparison

`contrast-color()` chooses a contrasting color; `contrast()` modifies an image's contrast. `device-cmyk()` targets device-dependent print colors; `dynamic-range-limit-mix()` combines HDR range-policy values. `progress()` normalizes a numeric position; `random()` generates a chosen pseudo-random stream value. `repeat()` composes grid tracks; `shape()` and `superellipse()` describe geometry. Font alternate functions select font-provided glyph forms rather than drawing shapes. `sibling-index()` and `sibling-count()` derive values from tree position/count and should not be confused with `:nth-child()`, which selects elements. `if()` conditionally chooses typed CSS values; it does not perform arbitrary script.

## Examples

```css
/* Established grid use of repeat(). */
.grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* A font alternate only works when the selected font provides the glyph set. */
.title { font-variant-alternates: stylistic(ornate-title); }

/* A contrasting color is a convenience, not an accessibility audit. */
.badge { color: contrast-color(var(--badge-background)); }
```

The last two examples are support-dependent. Keep a fallback declaration, verify syntax in target browsers, and inspect actual contrast after compositing/transparency. Experimental functions should not carry essential application behavior.

## Common mistakes

- Confusing `contrast-color()` with the established image filter `contrast()`.
- Assuming a generated contrast choice automatically meets WCAG for all font sizes, opacity, or composited backgrounds.
- Treating `random()` as secure randomness or expecting a fresh value on every paint.
- Using `repeat()` outside grid track-list grammar.
- Assuming font alternate names exist in every font or that an unsupported font feature has a visible fallback glyph.
- Confusing sibling-count functions with selector matching or accessibility order.
- Treating a live MDN index as a single standard maturity level; check status and browser support for each item.

## Knowledge checks with answers

1. **Which function changes image contrast and which chooses a contrasting color?** `contrast()` is a filter; `contrast-color()` returns a color relative to a base color.
2. **Can `random()` be used to generate passwords?** No; it is a presentation value feature, not a cryptographic API.
3. **Where is `repeat()` valid?** In grid track-list syntax.
4. **What does `sibling-index()` return?** A one-based sibling position in contexts where the function is supported.
