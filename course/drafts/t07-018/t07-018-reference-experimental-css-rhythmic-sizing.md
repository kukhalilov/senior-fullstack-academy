<!-- GENERATED DRAFT: manually fact-checked against linked CSSWG and W3C sources; remains in drafts pending overall curriculum release. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS rhythmic-sizing draft properties

## Scope and version

This lesson covers the one supplied property, `line-height-step`, from CSS Rhythmic Sizing Module Level 1. The current published W3C document is a Working Draft dated 17 February 2026; it is work in progress. The current CSSWG Editor’s Draft may change. MDN currently marks the feature Experimental and reports that no browsers support it. Do not rely on it for production layout without checking current implementation data.

The neighboring `block-step` properties are part of the same module but are not in this lesson’s inventory group. `line-height-step` adjusts line boxes; block-step properties adjust block-level box sizes. CSS Line Grid is another related proposal for baseline-grid alignment, not another name for this property.

## How this group fits the mental model

Typography often needs a vertical rhythm: a repeated distance between text baselines, much like ruled paper. A paragraph’s ordinary line boxes can have different heights because of larger text, fallback fonts, inline content, or vertical alignment. A grid can be disrupted when even one line is taller than the intended baseline interval.

`line-height` sets the line-height contribution used to form line boxes. `line-height-step` is a second-stage adjustment: after the line box height is calculated from its inline content, the property can round that result up to a multiple of one chosen step length. It does not set `line-height`, font size, or a fixed height for the whole paragraph. The line box is enlarged by the needed amount, with the extra space divided equally over and under the original line box so its contents remain centered within the stepped height.

## Supplied names explained

### `line-height-step`

**Grammar:** `<length [0,∞]>`, plus CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, and `revert-layer`). **Initial:** `0`. **Applies to:** block containers. **Inherited:** yes. **Percentages:** not applicable. **Computed value:** absolute length. **Animation:** by computed value type.

The value is the vertical step interval. A value of `0` disables the adjustment. A positive value asks each resulting line box in the block container to occupy a height that is an integer multiple of that interval, rounded upward to the nearest multiple. Negative lengths are invalid. The property takes a length, not a unitless multiplier and not a percentage; use an absolute or font-relative CSS length such as `24px`, `1.5rem`, or `1.5em` as appropriate.

For example, with a 24px step:

- A line box that would otherwise be 20px high is increased to 24px; 4px of additional space is distributed as 2px above and 2px below.
- A line box that would otherwise be 27px high is increased to 48px; the 21px difference is distributed as 10.5px on each side.
- A line box already exactly 48px high needs no added space.

The calculation is applied to the line-box height after inline-level content has contributed to it. A large inline image, a superscript, a fallback font with taller metrics, or a `vertical-align` effect can therefore cause a line to consume an additional whole step. The property’s adjustment does not change the alignment points used by `vertical-align`, except for values that align relative to the line box.

The property is inherited. Setting it on `:root` can give descendants a shared interval, but each element’s actual line boxes still depend on its own content and font metrics. The draft notes that the ordinary use is to keep the natural `line-height` below the step: if the natural line box is already larger than one interval, it must occupy two or more steps.

## Examples

### Establish a shared text interval

```css
:root {
  --text-step: 1.5rem;
  line-height-step: var(--text-step);
}

body {
  font-size: 1rem;
  line-height: 1.35;
}

h1 {
  font-size: 2rem;
  line-height: 1.15;
}
```

The inherited step is 1.5rem. A normal paragraph line that naturally fits within one step is expanded to the one-step grid. A heading line whose metrics require more height is rounded upward to a larger multiple; its text is centered in the added space. This can help align text runs across columns, but it also changes whitespace around lines, so inspect the page visually.

### Why an inline object can add a whole step

```css
article {
  --rhythm: 24px;
  line-height-step: var(--rhythm);
  line-height: 1.25;
}

article img.inline-icon {
  height: 30px;
  vertical-align: middle;
}
```

If the image makes a particular line box taller than the text alone, the line box may round up to another multiple. The property is not a crop or a way to cap the inline image’s contribution. If the resulting gap is undesirable, size or align the object, or opt that content out with `line-height-step: 0` on an appropriate nested block container where the property applies.

## How it differs from related tools

| Tool | Main job | Scope |
| --- | --- | --- |
| `line-height` | Sets the line-height contribution and preferred line spacing | Inline formatting / line construction |
| `line-height-step` | Rounds each resulting line-box height upward to a multiple of a length | Block containers; inherited |
| `block-step` family | Adjusts a block-level box’s outer size to a step using insertion/alignment/rounding controls | Block-level boxes; separate properties in the same draft module |
| `line-grid` | Establishes or aligns content against a baseline grid | Related CSS Line Grid proposal |
| Manual spacing tokens | Approximate a consistent rhythm through known margins, line heights, and component sizing | Broadly usable fallback, but not the same per-line algorithm |

The property may be used alone for a softer rhythm described by the specification or alongside explicit block-step and line-grid controls when a design needs stricter alignment. These related modules have their own draft status and implementation support; adopting one does not make the others available.

## Practical use and fallback

1. Choose the interval from the intended baseline distance, and make body line-height comfortably smaller than it.
2. Check headings, superscripts, inline icons/images, mixed fonts, fallback glyphs, and languages with different font metrics. Each can enlarge a line box and make it jump to another multiple.
3. Check margins and block spacing too. Stepping line boxes alone does not make every heading, image, or neighboring block land on one page-wide grid.
4. Test a range of font sizes, zoom levels, writing modes, and content lengths. The draft property is unsupported in current browsers according to MDN, so examples may have no effect outside a future/experimental implementation.
5. For a dependable current design, define a spacing scale with custom properties; use unitless `line-height` values and explicit component margins/padding; test actual font metrics; and adjust those tokens for headings and inline media. This produces a controlled approximation, not automatic per-line rounding.

## Common mistakes

- Treating `line-height-step` as another way to set `line-height`. It adjusts the calculated line-box height after inline content contributes.
- Thinking it rounds down or to the nearest multiple. The current draft rounds upward.
- Assuming the specified step is the height of every line. It is a unit; lines can occupy multiple units.
- Forgetting that tall inline content or font fallback can push a line into the next multiple and create visible extra space.
- Assuming inheritance means every descendant’s line layout will be identical. Each block container still lays out its own content and font metrics.
- Using a negative length or a percentage. The property grammar accepts a zero-or-positive length only.
- Confusing line-box stepping with block-box stepping or baseline-grid snapping. They solve related but different parts of the layout problem.
- Treating the W3C Working Draft as a browser implementation promise. MDN currently reports no browser support.
- Using `line-height-step` as an accessibility substitute for adequate line spacing. Readability and zoom behavior still need testing.

## Knowledge checks with answers

1. **What does the length represent?** The repeated line-box height interval, not a fixed line height or multiplier.
2. **What happens when a natural line box is 27px and the step is 24px?** The resulting line box is 48px; the 21px increase is split equally above and below the original line box.
3. **What does the initial value `0` do?** It disables step adjustment.
4. **Can a line box be taller than one step?** Yes. It is rounded up to a larger integer multiple when its natural height exceeds the interval.
5. **Why might an inline image create a large gap?** Its contribution can enlarge the natural line box past a step boundary, causing upward rounding to the next multiple.
6. **How is this different from `block-step`?** `line-height-step` adjusts line boxes within a block container; block-step properties adjust block-level box sizes.
7. **Can this be relied on in current browsers?** No; MDN currently reports no browser support. Use a manual spacing system as a fallback.

## Cross-item comparison

This group contains one property. Its important comparisons are with `line-height`, which contributes to the line-box calculation; the separate `block-step` family, which sizes block-level boxes; and `line-grid`, which concerns baseline-grid alignment. They are related tools, not aliases.

## Sources

- [CSS Rhythmic Sizing Module Level 1, W3C Working Draft, 17 February 2026](https://www.w3.org/TR/css-rhythm-1/) — current published property grammar, metadata, rounding algorithm, centering behavior, related block-step features, and changes since the 2014 First Public Working Draft.
- [CSS Rhythmic Sizing Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-rhythm/) — current evolving source and issue context.
- [MDN `line-height-step`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height-step) — secondary property summary and current support status.
- [CSS Inline Layout Module Level 3](https://drafts.csswg.org/css-inline-3/) — related line-box construction and inline layout context.
- [CSS Line Grid Module Level 1](https://www.w3.org/TR/css-line-grid-1/) — related baseline-grid model; a separate module.
