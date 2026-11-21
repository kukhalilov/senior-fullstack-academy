# CSS selectors at-rules cascade values and box model — Reference: Additional data types in the current MDN CSS reference, checked 2026-11-19

## Scope and version

This supplement covers the 25 names assigned to `current-index-css-value-types` in the manifest. They were collected from the live [MDN CSS data types index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Data_types) as a supplement to the curriculum's pinned [MDN types snapshot](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/types.json). The live index is a useful reference, not an exhaustive inventory of every grammar production in every CSS module. A type name usually describes a reusable grammar category; it does not by itself establish browser support or a property context.

## How this group fits the mental model

CSS specifications use named types such as `<length>`, `<color>`, or `<content-position>` to define which tokens a property accepts. A type can be a keyword set, a numeric range, a compound grammar, or a calculation syntax. Types compose, and the consuming property supplies the meaning: `start` in an alignment property is not automatically the same as `start` in a timeline or anchor-positioning grammar. Treat the angle-bracket name as a map into the specification, then read the property grammar and behavior.

## Supplied names explained

- **`absolute-size`** — The absolute font-size keyword category (`xx-small`, `x-small`, `small`, `medium`, `large`, `x-large`, `xx-large`, and, in the current Fonts grammar, `xxx-large`). “Absolute” distinguishes this keyword scale from `larger`/`smaller`; it does not mean a physical length such as `cm`.
- **`alpha-value`** — The color-alpha component grammar: a number or percentage, with the color specifications defining range handling (computed alpha is clamped to [0, 1]). It is not a general opacity property type, and a percentage is not combined with a number as an interchangeable math operand in all contexts.
- **`axis`** — A scroll-driven animation axis choice, using `block`, `inline`, `x`, or `y` where that grammar applies. `block` and `inline` follow writing mode; `x` and `y` refer to physical axes. This name is context-specific, not a universal CSS “dimension” type.
- **`baseline-position`** — A baseline-alignment grammar, including `baseline` and the `first baseline` / `last baseline` forms where the alignment property accepts them. It is not interchangeable with `self-position` or `content-position`.
- **`box-edge`** — A reference edge/box choice used by specific geometry and positioning grammars. The allowed values depend on that grammar; do not assume every use accepts all of `content-box`, `padding-box`, `border-box`, and `margin-box`.
- **`calc-keyword`** — Numeric constants permitted inside CSS calculations: `e`, `pi`, `infinity`, `-infinity`, and `NaN`, with other specifications able to add context-specific keywords. These are calculation values, not generally usable as standalone property keywords; for example, use `calc(pi)` when a calculation is required.
- **`calc-sum`** — A CSS Values math-expression grammar used by calculation functions. It composes calculation values with addition and subtraction, obeying CSS dimensional type rules and whitespace requirements around `+` and `-`. It is a grammar production, not a property or literal token.
- **`color-interpolation-method`** — A color-interpolation grammar that selects an interpolation color space and, for cylindrical spaces, a hue interpolation strategy. It appears in features such as gradients and color mixing; the surrounding feature defines whether and how it is accepted.
- **`content-distribution`** — An alignment grammar for distributing free space among multiple alignment subjects, with values such as `space-between`, `space-around`, `space-evenly`, and `stretch` in applicable properties.
- **`content-position`** — An alignment grammar for positioning an alignment subject within its container, using values such as `center`, `start`, `end`, `flex-start`, or `flex-end` where allowed. The exact keyword set is property-specific.
- **`corner-shape-value`** — CSS Borders 4's corner profile grammar: `round`, `scoop`, `bevel`, `notch`, `square`, `squircle`, or `superellipse(<number>)`. It controls corner curvature for `corner-shape` properties and works with corner radii; it does not replace `border-radius`'s size.
- **`dashed-function`** — The invocation syntax for a CSS custom function whose name starts with `--`, such as `--negative(1em)`. It passes comma-separated arguments to a custom `@function`; it is not a custom property (`--name: value`) or a built-in function such as `var()`.
- **`generic-family`** — The generic font-family keyword category, including families such as `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `ui-serif`, `ui-sans-serif`, `ui-monospace`, `ui-rounded`, `emoji`, `math`, and `fangsong` in the current Fonts grammar. These names request a generic family; they do not identify one installed font file.
- **`hex-color`** — A hexadecimal color token with 3, 4, 6, or 8 hexadecimal digits after `#`. Three/four-digit forms duplicate each nibble; four/eight-digit forms include alpha. Hexadecimal CSS colors use sRGB and are not case-sensitive.
- **`hue`** — A hue component accepted by CSS color grammars, represented as an angle or number according to the particular function's syntax and interpretation rules. Do not assume one unitless-number interpretation applies to every color function.
- **`hue-interpolation-method`** — A hue-path choice for interpolation in cylindrical color spaces, such as `shorter`, `longer`, `increasing`, or `decreasing` hue travel, with the color space and surrounding interpolation grammar determining its effect.
- **`line-width`** — A non-negative border/outline width grammar using a length or the `thin`, `medium`, and `thick` keywords. The keyword widths are user-agent-defined relative widths, not fixed pixel constants.
- **`named-color`** — The predefined CSS color keyword set, including `rebeccapurple` and the legacy color names. These resolve to defined sRGB colors; `transparent` and system color keywords have separate grammar roles even though they also represent colors.
- **`overflow-position`** — An alignment modifier, `safe` or `unsafe`, that controls how an alignment subject is treated when it would overflow the alignment container. It modifies alignment behavior; it does not itself set `overflow` or create scrolling.
- **`position-area`** — The anchor-positioning area grammar used with `position-area` to select a grid-like region around an implicit anchor and the positioned element's containing block, using physical/logical sides and span forms. It is distinct from `position-try-fallbacks` and from the `anchor()` inset-value function.
- **`relative-size`** — The relative font-size keyword category `larger` and `smaller`, interpreted relative to the inherited font size. It is not the `<length-percentage>` type and does not name units such as `em`.
- **`self-position`** — An alignment grammar for positioning one alignment subject relative to its own alignment container, with values such as `center`, `start`, `end`, `self-start`, `self-end`, and `flex-start`/`flex-end` where supported by the consuming property.
- **`shape`** — A broad shape grammar used in newer shape-related properties. Its accepted alternatives and reference-box handling are defined by the consuming module; it is not synonymous with `<basic-shape>` or the `shape()` function.
- **`system-color`** — A user-agent/system color keyword category such as `Canvas`, `CanvasText`, `ButtonFace`, or `Highlight`. The browser maps these to platform or user-agent colors and user preferences, including high-contrast/forced-colors behavior where applicable; they are not fixed sRGB swatches like named colors.
- **`timeline-range-name`** — A named scroll/view timeline range such as `cover`, `contain`, `entry`, `entry-crossing`, `exit`, or `exit-crossing`, used in animation-range and timeline range-position grammars. It is not a custom timeline name; custom names use their own dashed identifier grammar.

## Cross-item comparison

`absolute-size` and `relative-size` are font-size keyword categories, not physical units. `hex-color`, `named-color`, and `system-color` are different ways to express a color; `alpha-value` is a channel component. `content-distribution`, `content-position`, `self-position`, and `baseline-position` all relate to alignment but have different grammars and roles. `box-edge` chooses a geometric reference boundary, while `position-area` identifies an anchor-positioning region. `shape` is not automatically `<basic-shape>`; neither is interchangeable with `shape()`. `dashed-function` is a custom-function call, not a custom property. Type names can overlap conceptually while remaining distinct productions.

## Examples

```css
.panel {
  color: CanvasText;                 /* system-color */
  border: thick solid #336699cc;     /* line-width and hex-color with alpha */
  justify-content: space-between;   /* content-distribution */
  align-items: first baseline;       /* baseline-position */
}

@function --double(--n <number>) returns <number> {
  result: calc(var(--n) * 2);
}
```

These examples illustrate specific property/function contexts, not universal validity of the values in every declaration. Check the module grammar and support for the actual target property. Test system colors in relevant user-preference modes, alignment under different writing modes, and font-family choices with real fallback stacks.

## Common mistakes

- Treating every reference-index type as a standalone property or literal value.
- Reading “absolute” in `absolute-size` as a physical unit; these are font-size keywords.
- Treating `calc-keyword` constants as ordinary keywords outside calculations.
- Assuming alignment categories accept the same keywords because their meanings sound similar.
- Assuming a `box-edge` or `position-area` keyword set is universal across modules.
- Treating generic font-family keywords as named installed fonts or assuming `system-ui` equals a particular OS font file.
- Treating `<shape>`, `<basic-shape>`, `shape()`, and corner-shape values as synonyms.
- Treating an MDN type index as a maturity or browser-compatibility statement.

## Knowledge checks with answers

1. **Does `relative-size` mean the `em` unit?** No. It is the `larger`/`smaller` font-size keyword category; `em` is a length unit.
2. **Why can `space-between` be valid for one alignment property but not another?** The consuming property's grammar chooses which alignment subtypes and keywords it accepts.
3. **How does a system color differ from a named color?** A system color is mapped by the user agent to platform/user-preference colors; named colors have fixed sRGB definitions.
4. **Is `dashed-function` a custom property?** No. It is a call to a custom CSS function whose name starts with `--`; custom properties store values and are referenced with `var()`.
5. **Can `<shape>` be substituted wherever `<basic-shape>` or `shape()` is accepted?** No. Their productions and consuming-property support must be checked separately.

Primary definitions: [CSS Values and Units 4](https://drafts.csswg.org/css-values-4/), [CSS Color 4](https://drafts.csswg.org/css-color-4/), [CSS Box Alignment 3](https://drafts.csswg.org/css-align-3/), [CSS Fonts 4](https://drafts.csswg.org/css-fonts-4/), [CSS Shapes 1](https://drafts.csswg.org/css-shapes-1/), [CSS Borders 4](https://drafts.csswg.org/css-borders-4/), [CSS Custom Functions and Mixins 1](https://drafts.csswg.org/css-mixins-1/), [CSS Anchor Positioning 1](https://drafts.csswg.org/css-anchor-position-1/), and [Scroll-driven Animations 1](https://drafts.csswg.org/scroll-animations-1/). These module links are living drafts; consult their current status and browser compatibility data before use.
