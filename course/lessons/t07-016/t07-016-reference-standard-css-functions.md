# CSS selectors at-rules cascade values and box model — Reference: Standard CSS value functions

## Scope and version

The controlled names follow the pinned [MDN functions data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/functions.json), supplemented with `url()` from the [current MDN function index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Functions). The pinned data calls `param()` standard, but current MDN identifies it as experimental and the CSS Linked Parameters module remains a First Public Working Draft; it is therefore covered in the experimental-functions lesson. The `alpha()` function appears in CSS Color 5 draft text: treat its syntax and support as evolving even though the pinned data classifies it as standard. A name in this inventory is not a guarantee that every property accepts it or that implementations are interoperable. Check the consumer property grammar and target-browser compatibility.

## How this group fits the mental model

Value functions construct or transform a typed CSS value. They are not JavaScript calls: parsing, dimensional analysis, substitution, and evaluation follow CSS grammar and value processing. Functions may be nested, but each property constrains which result types are acceptable. Some are pure calculations; others refer to the environment, counters, images, fonts, or rendering pipeline.

## Supplied names explained

### Arithmetic and mathematical functions

- `abs()` — Absolute value of a numeric calculation.
- `acos()`, `asin()`, `atan()` — Inverse trigonometric operations with CSS angle/numeric dimensional rules.
- `atan2()` — Two-argument arctangent with quadrant information; the arguments are `y` then `x`, and both values must satisfy CSS calculation type rules.
- `cos()`, `sin()`, `tan()` — Trigonometric functions; angle inputs produce unitless numeric results.
- `exp()` — Exponential function.
- `hypot()` — Square root of the sum of squared numeric inputs.
- `log()` — Logarithm; optional base changes the logarithm base.
- `max()`, `min()` — Select the greatest or least of compatible comma-separated calculations. If limits passed to `clamp()` are inverted, its minimum wins.
- `clamp()` — Constrains a preferred value between lower and upper bounds; `clamp(min, preferred, max)`.
- `mod()` — Modulo with a result sign following the divisor; use `rem()` when remainder sign follows the dividend.
- `pow()` — Raises the first number to the second number's power.
- `rem()` — Remainder operation with the dividend's sign.
- `round()` — Rounds a value according to a strategy and optional interval.
- `sign()` — Returns -1, 0, or 1 according to the sign of its argument.
- `sqrt()` — Square root.
- `calc()` — Performs arithmetic on compatible CSS numeric values. Addition and subtraction require compatible types; multiplication and division follow CSS calculation type rules, so this is not arbitrary unit algebra. Parentheses and ordinary operator precedence apply.

### Values, variables, environment, and counters

- `attr()` — Reads an element attribute into a CSS value; typed forms have newer support considerations, and attribute values are not inherently safe trusted content.
- `env()` — Reads a user-agent/environment variable such as safe-area insets; an optional fallback can handle unavailable values.
- `var()` — Substitutes a custom property value, optionally using a fallback; fallback syntax is used when the custom property is missing/invalid at computed-value time, not as a general parse-time exception handler.
- `counter()` — Produces the representation of a named CSS counter.
- `counters()` — Produces representations of nested counters using a separator.
- `symbols()` — Constructs an anonymous counter style for a value accepting `<counter-style>`; it supports the cyclic, numeric, alphabetic, symbolic, and fixed systems, not the full descriptor set of a named `@counter-style` rule.

### Colors and color adjustment

- `color()` — Creates a color in a predefined color space or a registered custom color profile; it is useful for colors outside sRGB when the output device can represent them.
- `color-mix()` — Interpolates two colors in a chosen color space and, where relevant, hue direction. Percentages can be omitted; they are normalized when their sum exceeds 100%, while a sum below 100% affects the result alpha.
- `hsl()`, `hwb()`, `rgb()` — Construct colors in HSL, HWB, or RGB syntax; modern space-separated forms allow `none` channels and optional slash alpha. The legacy comma forms remain accepted; `hsla()` and `rgba()` are legacy aliases of `hsl()` and `rgb()`.
- `lab()`, `lch()`, `oklab()`, `oklch()` — Construct colors in perceptual Lab-family spaces, with rectangular or cylindrical coordinates.
- `light-dark()` — Selects one of two colors according to the resolved color scheme when the relevant `color-scheme` behavior applies.
- `alpha()` — CSS Color 5 defines the relative color form `alpha(from <color> / <alpha-value-or-none>)`, which preserves the origin color components and replaces its alpha channel. It is a draft-level feature; verify current implementation support.
- `palette-mix()` — Mixes font palettes in the CSS font color palette model where supported.

### Images, gradients, and shapes

- `circle()`, `ellipse()`, `inset()`, `polygon()`, `rect()`, `xywh()` — Define basic shapes for clipping, motion, or shape-outside contexts; each has its own coordinate and corner grammar.
- `conic-gradient()`, `linear-gradient()`, `radial-gradient()` — Generate color-transition images along angular, linear, or radial geometry.
- `repeating-conic-gradient()`, `repeating-linear-gradient()`, `repeating-radial-gradient()` — Repeat a gradient’s color-stop pattern to fill its gradient image; the stop positions and repeating interval determine the visible pattern.
- `image()` — Provides an image value with directionality and fallback-color syntax; it is not the same as HTML `<img>` loading semantics.
- `image-set()` — Selects among image resources based on resolution/type support for density-aware images.
- `cross-fade()` — Creates an image by blending image or color inputs with optional percentages. Current CSS Images syntax supports a list; some implementations retain an older two-image-plus-percentage syntax, and MDN marks support as limited, so check the exact syntax for target browsers.
- `paint()` — Invokes a registered CSS Paint Worklet to produce an image; the worklet must be registered through the CSS Painting API, and browser support is limited.
- `url()` — Produces a URL value for a property grammar that accepts one. Relative URL resolution and resource fetching are determined by the stylesheet/resource context, the consuming property, and applicable security policies.

### Filters and image effects

Filter functions are applied in listed order when a filter property contains a function list; `none` is the identity value.

- `blur()` — Applies a Gaussian blur amount.
- `brightness()` — Scales image brightness.
- `contrast()` — Adjusts image contrast; `1` or `100%` leaves the input unchanged, values between zero and one reduce contrast, and values above one increase it. It does not choose an accessible foreground color.
- `drop-shadow()` — Applies a shadow following the input’s alpha silhouette, unlike a box shadow based on the border box. It does not accept box-shadow’s spread or inset keywords.
- `grayscale()` — Converts the input toward grayscale by the specified amount.
- `hue-rotate()` — Rotates input colors around a hue axis.
- `invert()` — Inverts input colors by a specified amount.
- `opacity()` — Adjusts alpha opacity of the filtered image.
- `saturate()` — Scales color saturation.
- `sepia()` — Applies a sepia tone by the specified amount.

### Transforms and easing

- `matrix()` — Represents a 2D affine transformation matrix.
- `matrix3d()` — Represents a 4×4 3D transformation matrix.
- `perspective()` — Sets perspective distance for a 3D transform function; placement in the transform list matters.
- `rotate()`, `rotateX()`, `rotateY()`, `rotateZ()`, `rotate3d()` — Rotate in 2D or around 3D axes.
- `scale()`, `scaleX()`, `scaleY()`, `scaleZ()`, `scale3d()` — Scale along 2D/3D axes.
- `skew()`, `skewX()`, `skewY()` — Apply skew transforms.
- `translate()`, `translateX()`, `translateY()`, `translateZ()`, `translate3d()` — Translate along 2D/3D axes; percentages generally refer to the transformed element's reference box.
- `cubic-bezier()` — Defines an easing curve from two control points. The x coordinates must be in [0, 1]; y coordinates may exceed that range, allowing overshoot.
- `steps()` — Defines a discrete easing with a positive integer step count and optional jump position (`jump-start`, `jump-end`, `jump-none`, or `jump-both`); `jump-none` requires at least two steps.
- `linear()` — Defines a piecewise linear easing function using output progress values and optional input-progress positions. Repeated or omitted positions follow the easing specification’s normalization rules.

### Layout and font-related functions

- `fit-content()` — Clamps a requested size between intrinsic minimum and maximum contributions and available space. It is distinct from the no-argument `fit-content` keyword; the function is valid in grid track sizing and applicable box sizing properties.
- `minmax()` — Defines lower and upper track sizing bounds in Grid track-size grammar; it is not a generic length function. A `<flex>` value cannot be the minimum, and if the maximum is smaller than the minimum the maximum is ignored.
- `repeat()` — Repeats a fixed or auto-repeated track pattern in Grid track-list grammar; it is not a generic value function. `auto-fill`/`auto-fit` have placement and definite-size constraints.
- `layer()` — In `@import`, places the imported stylesheet into a named cascade layer (or an anonymous layer when empty); it is not a general value for declarations.
- `path()` — Defines an SVG path data value for properties that accept a path, with coordinate semantics tied to its consuming property.
- `ray()` — Defines ray geometry for motion-path contexts, including angle, size, and containment options.

## Cross-item comparison

CSS values are typed, and functions are accepted only where the receiving property grammar permits their result type. `rgba()` and `hsla()` are legacy color function spellings; modern `rgb()` and `hsl()` syntaxes also represent alpha and support legacy comma forms. `url()` creates a URL value; it does not itself determine whether a consuming property will fetch or accept that resource.

`calc()` combines compatible numeric values; `min()`/`max()` compare, and `clamp()` bounds. `mod()` and `rem()` differ for negative operands. Color construction functions choose a color space, while `color-mix()` interpolates existing colors. Gradient functions generate image values; basic-shape functions generate geometric values. `filter` and `backdrop-filter` consume filter functions such as `blur()`, `contrast()`, and `drop-shadow()`, while the `transform` property consumes transform functions such as `rotate()` and `translate()`. The individual `translate`, `rotate`, and `scale` properties are separate properties, not function forms. `minmax()` and `repeat()` are constrained to grid track-list grammar; `fit-content()` can appear in applicable grid and box-sizing contexts. `counter()` renders generated counter text but does not create semantic content. `var()` substitution does not validate a value against every later property grammar.

## Examples

```css
.card {
  inline-size: clamp(18rem, calc(40vw - 2rem), 42rem);
  color: color-mix(in oklch, navy 75%, white);
  background-image: repeating-linear-gradient(135deg, #eee 0 8px, white 8px 16px);
  filter: drop-shadow(0 0.5rem 1rem rgb(0 0 0 / 20%));
  transform: translateY(calc(-1 * var(--offset, 0px))) rotate(2deg);
}

.layout { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

When building calculated values, keep units compatible and inspect computed output. Provide static or simpler fallbacks when a newer function is not supported.

## Common mistakes

- Assuming every function is accepted by every property because its name is valid CSS.
- Mixing incompatible dimensions in `calc()` or supplying invalid argument counts.
- Reversing `mod()` and `rem()` behavior for negative values.
- Treating a `var()` fallback as protection against every type/grammar error.
- Confusing `drop-shadow()` with `box-shadow()` or expecting identical clipping behavior.
- Assuming percentages in transforms, shapes, gradients, and sizing all resolve against the same reference box.
- Expecting percentage-valued `color-mix()` inputs below 100% to be normalized to fully opaque colors.
- Treating values read by `attr()` as trusted without considering how an attribute can affect the consuming property; `attr()` does not execute arbitrary JavaScript.
- Treating experimental, draft-level, or specialized functions as broadly interoperable.
- Using the current `cross-fade()` grammar while assuming every browser implements that syntax; legacy implementations differ.
- Assuming `alpha()` or `param()` is broadly available because an older pinned inventory labels it standard.

## Knowledge checks with answers

1. **Which function bounds a preferred value between limits?** `clamp(minimum, preferred, maximum)`.
2. **Which differs in negative-number sign behavior: `mod()` or `rem()`?** Both are distinct; modulo follows divisor sign, remainder follows dividend sign.
3. **Is `minmax()` valid as any CSS property value?** No, it is defined for grid track sizing contexts.
4. **Does `var(--x, red)` recover if `--x` exists but makes the consuming property invalid?** Not generally; fallback is for missing/invalid custom property substitution, not arbitrary downstream property invalidity.

## Sources and maturity

- [Pinned MDN CSS function data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/functions.json) defines the baseline inventory; the current [MDN function index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Functions) includes `url()` and provides current function groupings.
- The [CSS Values and Units Level 4 specification](https://www.w3.org/TR/css-values-4/) defines common calculation functions, compatible numeric types, and URL notation. The exploratory [Level 5 draft](https://drafts.csswg.org/css-values-5/) is work in progress.
- [CSS Color 4](https://www.w3.org/TR/css-color-4/) defines established color functions; [CSS Color 5](https://www.w3.org/TR/css-color-5/) remains a Working Draft and contains the evolving `alpha()` syntax.
- [CSS Images 3](https://drafts.csswg.org/css-images-3/) and [CSS Images 4](https://drafts.csswg.org/css-images-4/) define image and gradient functions; syntax and implementation status differ for `cross-fade()`.
- The [CSS Shapes draft](https://drafts.csswg.org/css-shapes/) defines basic-shape functions; [CSS Easing 1](https://www.w3.org/TR/css-easing-1/) and [Easing 2](https://drafts.csswg.org/css-easing-2/) define timing functions.
- [Transforms 1](https://www.w3.org/TR/css-transforms-1/) and the [Transforms 2 draft](https://drafts.csswg.org/css-transforms-2/) define transform functions; the [Motion Path draft](https://drafts.csswg.org/motion-1/) defines `ray()` and path-related behavior.
- [CSS Grid 2](https://www.w3.org/TR/css-grid-2/) defines grid track functions such as `minmax()`; [Filter Effects 1](https://www.w3.org/TR/filter-effects-1/) defines filter functions.
- The [CSS Linked Parameters Level 1 First Public Working Draft](https://drafts.csswg.org/css-link-params-1/) defines `param()` for linked resources. Current MDN [`param()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/param) marks it experimental; it is covered in the experimental-functions lesson, not the established-function inventory.
