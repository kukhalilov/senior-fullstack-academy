<!-- FACTUALLY REVIEWED: CSS Inline Level 3 editor's draft; stable legacy behavior distinguished. -->

## Scope and version

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Inline properties

This lesson covers the ten supplied CSS Inline names. The current CSS Inline Layout Level 3 Editor’s Draft reviewed here is dated 14 October 2026 and explicitly says it is work in progress. Some behavior, especially `text-box*` and `initial-letter`, is newer and must be checked against current browser support. `line-height` and `vertical-align` have long-standing definitions in published CSS 2.1; the detailed unified baseline model in Inline Level 3 is still draft text. The support labels in the inventory were captured separately on 2026-11-16 and are not proof that a draft definition is interoperable.

## How this group fits the mental model

Inline layout takes a flowing sequence of text and inline boxes, breaks it into line boxes, then aligns its contents along the block axis. A font supplies metrics and baseline positions; a glyph’s visible outline is not the same as its font metrics, the line box, or an element’s border box. This is why text may look visually off-center even when its CSS boxes are mathematically centered. The properties here control the line’s preferred height, baseline choice and offset, and font-metric trimming; they are especially sensitive to font fallback, writing mode, language/script, and formatting context.

Think of the process in this order: `line-height` contributes preferred line dimensions; baseline properties align glyphs and inline-level boxes; `vertical-align` combines baseline choice and shift; `text-box*` trims metric-derived space at block edges; `initial-letter` creates a special drop-cap inline box. These properties do not replace flex/grid alignment for block layout.

## Supplied names explained

### `line-height`

Grammar: `normal | <number> | <length-percentage>` (non-negative); initial `normal`; inherited. It sets a preferred line height used to calculate inline layout bounds and line boxes. On a block container, the value acts through its root inline box and establishes a preferred/minimum contribution, not a hard clipping height. `normal` uses font metrics chosen by the UA. A unitless number multiplies each element’s own used font size. A length computes to an absolute length; a percentage computes against the element’s computed font size.

The inheritance distinction matters: `line-height: 1.4` inherits the number, so a child at a different font size recalculates its line height; `1.4em` and `140%` compute to lengths on the parent and descendants inherit that length. Unitless values are usually preferable for scalable text. If line-height is smaller than glyph/fallback metrics, lines can overlap or overflow; it does not clip glyphs. In vertical writing modes the line axis follows writing mode, so do not assume a physical height.

### `vertical-align`

The Level 3 shorthand grammar is `[ first | last ] || <'alignment-baseline'> || <'baseline-shift'>`; initial `baseline`; non-inherited. It combines a baseline-source preference, baseline type, and post-alignment shift. Omitting components resets the associated longhands. On inline-level boxes it aligns relative to the line’s baseline context; on table cells legacy values also influence cell alignment. It does not vertically center arbitrary block content and is not a flex/grid alignment property.

Common values include `baseline`, `sub`, `super`, `text-top`, `text-bottom`, `middle`, `top`, and `bottom`, plus lengths/percentages, interpreted by the relevant longhands. Inline `middle` aligns the box’s midpoint relative to the parent baseline plus x-height-based offset, not the visual center of a line or container. For images and inline-blocks, `baseline` generally aligns their baseline (often the bottom edge for replaced inline content) to the surrounding text baseline. Line-height and neighboring inline content can change the resulting line box.

### `alignment-baseline`

Grammar: `baseline | <baseline-metric>`; initial `baseline`; not inherited. Applies in the draft to inline-level boxes, flex/grid items, table cells, and SVG text content elements. It selects which baseline of the box aligns with the corresponding baseline in its alignment context before any post-alignment shift. `baseline` uses the parent’s dominant baseline. Metric keywords include `text-bottom`, `alphabetic`, `ideographic`, `middle`, `central`, `mathematical`, `hanging`, and `text-top`. They refer to typographic metrics, not arbitrary pixel offsets. SVG may support legacy `text-before-edge`/`text-after-edge` aliases, but these aliases are not accepted in the `vertical-align` shorthand.

### `dominant-baseline`

Grammar: `auto | <baseline-metric>`; initial `auto`; inherited. It selects the default baseline used to align text inside an inline box and can set the default alignment baseline for participating boxes in other alignment contexts. `auto` generally chooses alphabetic in horizontal writing and sideways vertical text, and central for upright/mixed vertical text; SVG text has a related but distinct coordinate-origin rule. The metric keywords are `text-bottom`, `alphabetic`, `ideographic`, `middle`, `central`, `mathematical`, `hanging`, and `text-top`. Script and font baseline tables matter: do not assume the alphabetic baseline is suitable for every writing system.

### `baseline-source`

Grammar: `auto | first | last`; initial `auto`; not inherited. Applies to inline-level boxes establishing an independent formatting context when more than one baseline set is available, such as a multiline inline-block or inline flex container. `first` chooses the first baseline set and `last` the last. `auto` chooses last for inline-block and first for other cases in the current draft. It chooses which baseline source the box contributes; it does not move the content inside the box.

### `baseline-shift`

Grammar: `<length-percentage> | sub | super | top | center | bottom`; initial `0`; not inherited; percentage is relative to used `line-height`. It applies to inline-level boxes and SVG text content elements. Lengths and `sub`/`super` shift relative to the baseline-aligned position; positive length raises and negative lowers. `sub`/`super` use suitable font metrics when available and otherwise UA fallback offsets. `top`, `center`, and `bottom` align an inline box’s aligned subtree to the corresponding line-box bounds. The draft recommends using `vertical-align` for ordinary CSS and retaining the longhand mainly where it is needed independently or for SVG compatibility.

### `text-box-trim`

Grammar: `none | trim-start | trim-end | trim-both`; initial `none`; not inherited. It applies to block containers, multicolumn containers, and inline boxes. On block containers it trims half-leading at the first formatted line’s block-start and/or last formatted line’s block-end, using the selected text metrics. On inline boxes it trims content edges to the selected metric. It has no effect if the relevant formatted line is absent or intervening nonzero padding/border prevents the trim. It does not propagate through flex, grid, or table formatting contexts. Trimming changes box/line layout; it does not clip glyph ink that overflows.

### `text-box-edge`

Grammar: `auto | <text-edge>`; initial `auto`; inherited; applies to block containers and inline boxes. It chooses the font metrics used by `text-box-trim`. `auto` follows `line-fit-edge`, with the draft’s initial `leading` interpreted as `text` for this purpose. The edge vocabulary includes paired over/under metrics such as `text`, `ideographic`, and `ideographic-ink`, with `cap`, `ex`, and `alphabetic` available in the appropriate position. These are font-derived metrics; scripts and fallback fonts can produce different results. Although this property inherits, its initial `auto` copies the inherited `line-fit-edge` choice; do not simplify that to “text-box-edge itself inherits.”

### `text-box`

Grammar: `normal | <'text-box-trim'> || <'text-box-edge'>`; initial `normal`; not inherited. It is a shorthand for `text-box-trim` and `text-box-edge`. `normal` resets them to `none` and `auto`. Otherwise, if trim is omitted it sets `trim-both`, and if edge is omitted it sets `auto`. For example, `text-box: trim-both cap alphabetic` trims both block edges using cap-height above and alphabetic below (where the grammar/context supports that metric pair). Because omitted shorthand components reset, use explicit longhands when composing partial overrides across cascade layers.

```css
.heading {
  /* Feature-detect newer text metric trimming. */
  line-height: 1.2;
}

@supports (text-box: trim-both cap alphabetic) {
  .heading { text-box: trim-both cap alphabetic; }
}
```

The fallback retains normal line layout. Test the rendered result with the actual font stack, fallback glyphs, scripts, and writing modes; trimming Latin cap-height metrics is not a universal script-neutral spacing recipe.

### `initial-letter`

Grammar: `normal | <number [1,∞]> <integer [1,∞]>? | <number [1,∞]> && [drop | raise]?`; initial `normal`; not inherited. Applies to eligible first inline-level content, including `::first-letter`, inside `::marker`, or a first inline-level child meeting the draft’s first-child conditions. `normal` leaves text ordinary. The first number is the size in line heights; optional sink controls how many lines it drops. `raise` means sink 1; `drop` means sink equal to the size rounded down to a positive integer; omitted sink defaults to drop. Example: `initial-letter: 3` creates a three-line dropped initial; `initial-letter: 3 1` raises it across three lines. A non-integral size aligns at the top only in the current draft. It only takes effect at the start of the first line; bidi reordering or earlier inline content can make its used value normal. Floats/non-static positioning make it inapplicable by changing display, and behavior in ruby containers is undefined in the draft. Script-sensitive alignment, punctuation included by `::first-letter`, and typography need real visual testing.

## Cross-item comparison

| Goal | Property | Key distinction |
| --- | --- | --- |
| Set preferred line box contribution | `line-height` | A unitless value scales again at descendants; lengths do not. |
| Choose the default text baseline in a box | `dominant-baseline` | Inherited; governs the box’s internal/default baseline context. |
| Choose which baseline a box presents | `alignment-baseline` | Non-inherited; selects that box’s alignment metric. |
| Choose first or last baseline set | `baseline-source` | Matters when a formatting context supplies multiple baseline sets. |
| Shift after baseline alignment | `baseline-shift` | Longhand; `vertical-align` is the normal CSS shorthand. |
| Trim font-metric whitespace at block edges | `text-box*` | Draft feature; changes layout edges, not glyph ink. |
| Create a drop/raised initial | `initial-letter` | Specialized first-line inline layout, not a generic float or margin. |

`vertical-align` is the shorthand that coordinates `alignment-baseline`, `baseline-source`, and `baseline-shift`. These are not independent knobs with identical defaults: setting the shorthand can reset omitted longhands.

## Examples

Align an icon with text using a deliberate inline baseline adjustment, and keep a unitless line-height for text that scales:

```css
body { line-height: 1.5; }
.icon { vertical-align: middle; }
```

For layout-level centering of a heading beside an icon, use a flex/grid alignment model rather than relying on `vertical-align`.

## Common mistakes

- Treating glyph outlines, font metrics, line boxes, and border boxes as the same geometry.
- Using `vertical-align: middle` as a general-purpose container-centering rule.
- Forgetting that unitless `line-height` inherits as a number while lengths and percentages compute to lengths.
- Setting `vertical-align` and assuming omitted shorthand components preserve old longhand values.
- Assuming `text-box-trim` clips overflowing glyphs or propagates through flex/grid/table.
- Applying Latin cap/alphabetic edge trimming blindly to all scripts and fallback fonts.
- Assuming `initial-letter` applies to any arbitrary inline element regardless of first-line position.
- Treating Editor’s Draft behavior or a Baseline label as proof that all detailed behavior is interoperable.

## Knowledge checks with answers

1. Why is `line-height: 1.4` usually more scalable than `line-height: 1.4em` on a parent? The number is inherited and multiplied by each descendant’s own font size; the em value computes to a length before inheritance.
2. What is the difference between `dominant-baseline` and `alignment-baseline`? The former supplies a box’s default/internal baseline choice and inherits; the latter chooses a particular box’s baseline for alignment and does not inherit.
3. Does `vertical-align: middle` center an element in its parent block? No. It is inline baseline alignment (with special table-cell behavior); use flex/grid for container centering.
4. What does `text-box: trim-both cap alphabetic` control? It trims both relevant block edges using font-derived cap and alphabetic metrics where supported and applicable.
5. Why should a text-box trim rule have a fallback? The current unified Inline Level 3 definition is an Editor’s Draft and support/behavior may vary.

## Sources

- [CSS Inline Layout Module Level 3 Editor’s Draft, 14 October 2026](https://drafts.csswg.org/css-inline-3/)
- [CSS 2.1 Recommendation: line-height and vertical-align](https://www.w3.org/TR/CSS21/visudet.html)
- [CSS Box Alignment Module Level 3](https://www.w3.org/TR/css-align-3/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
