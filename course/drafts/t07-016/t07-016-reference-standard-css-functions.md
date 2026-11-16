# CSS selectors at-rules cascade values and box model — Reference: Standard CSS value functions

## Scope and version

The names below follow the pinned [MDN functions inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/functions.json). Compare it with the [current MDN function reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Functions): function inventories evolve, and a name can be standardized before broad implementation. Consult the relevant CSS module and target-browser compatibility information. The CSS type expected by a property determines which function is valid in that position.

## How this group fits the mental model

Value functions construct or transform a typed CSS value. They are not JavaScript calls: parsing, dimensional analysis, substitution, and evaluation follow CSS grammar and value processing. Functions may be nested, but each property constrains which result types are acceptable. Some are pure calculations; others refer to the environment, counters, images, fonts, or rendering pipeline.

## Supplied names explained

### Arithmetic and mathematical functions

- `abs()` — Absolute value of a numeric calculation.
- `acos()`, `asin()`, `atan()` — Inverse trigonometric operations with CSS angle/numeric dimensional rules.
- `atan2()` — Two-argument arctangent preserving quadrant information; argument order and compatible numeric types matter.
- `cos()`, `sin()`, `tan()` — Trigonometric functions; angle inputs produce unitless numeric results.
- `exp()` — Exponential function.
- `hypot()` — Square root of the sum of squared numeric inputs.
- `log()` — Logarithm; optional base changes the logarithm base.
- `max()`, `min()` — Select the greatest/least compatible value among comma-separated calculations.
- `clamp()` — Constrains a preferred value between lower and upper bounds; `clamp(min, preferred, max)`.
- `mod()` — Modulo with a result sign following the divisor; use `rem()` when remainder sign follows the dividend.
- `pow()` — Raises the first number to the second number's power.
- `rem()` — Remainder operation with the dividend's sign.
- `round()` — Rounds a value according to a strategy and optional interval.
- `sign()` — Returns -1, 0, or 1 according to the sign of its argument.
- `sqrt()` — Square root.
- `calc()` — Performs arithmetic across compatible CSS numeric types with dimensional checking and operator precedence.

### Values, variables, environment, and counters

- `attr()` — Reads an element attribute into a CSS value; typed forms have newer support considerations, and attribute values are not inherently safe trusted content.
- `env()` — Reads a user-agent/environment variable such as safe-area insets; an optional fallback can handle unavailable values.
- `var()` — Substitutes a custom property value, optionally using a fallback; fallback syntax is used when the custom property is missing/invalid at computed-value time, not as a general parse-time exception handler.
- `counter()` — Produces the representation of a named CSS counter.
- `counters()` — Produces representations of nested counters using a separator.
- `symbols()` — Constructs a counter-style value for use in properties accepting that type; it does not declare a named `@counter-style` rule.

### Colors and color adjustment

- `color()` — Creates a color in a named color space, with optional profile handling.
- `color-mix()` — Interpolates colors in a chosen color space and hue method, optionally with percentages.
- `hsl()`, `hwb()`, `rgb()` — Construct colors in HSL, HWB, or RGB syntax; modern forms support space-separated channels and optional alpha.
- `lab()`, `lch()`, `oklab()`, `oklch()` — Construct colors in perceptual Lab-family spaces, with rectangular or cylindrical coordinates.
- `light-dark()` — Selects one of two colors according to the resolved color scheme when the relevant `color-scheme` behavior applies.
- `alpha()` — Extracts/sets an alpha component in supported color-mix-related grammar contexts; verify exact function grammar and support before use.
- `contrast()` — Filter function that increases or decreases contrast in the filtered image; 100% (or 1) leaves contrast unchanged, lower values reduce it, and higher values increase it. It does not select an accessible foreground color; use a contrast-color function only where that separate function is supported.
- `palette-mix()` — Mixes font palettes in the CSS font color palette model where supported.

### Images, gradients, and shapes

- `circle()`, `ellipse()`, `inset()`, `polygon()`, `rect()`, `xywh()` — Define basic shapes for clipping, motion, or shape-outside contexts; each has its own coordinate and corner grammar.
- `conic-gradient()`, `linear-gradient()`, `radial-gradient()` — Generate color-transition images along angular, linear, or radial geometry.
- `repeating-conic-gradient()`, `repeating-linear-gradient()`, `repeating-radial-gradient()` — Repeat gradient color-stop patterns across the remaining gradient line/area.
- `image()` — Provides an image value with source/fallback and orientation-related syntax in applicable contexts; it is not the same as HTML `<img>` loading semantics.
- `image-set()` — Selects among image resources based on resolution/type support for density-aware images.
- `cross-fade()` — Blends multiple image values using weights; syntax and interoperability should be checked for current CSS Images implementations.
- `paint()` — Invokes a registered CSS Paint Worklet to produce an image, subject to worklet availability/security and support.
- `url()` — References an external resource using a URL token; fetching, origin, CSP, and resource type rules still apply.

### Filters and image effects

- `blur()` — Applies a Gaussian blur amount.
- `brightness()` — Scales image brightness.
- `drop-shadow()` — Applies a shadow following the alpha silhouette of the input image, unlike a rectangular box shadow.
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
- `cubic-bezier()` — Defines a cubic Bézier timing function; x control points must be in [0,1].
- `steps()` — Defines a stepped timing function with a step count and optional jump position.
- `linear()` — Defines a piecewise linear timing function with optional stop positions.

### Layout and font-related functions

- `fit-content()` — Produces a fit-content size bounded by available space and intrinsic size contributions in applicable sizing grammars.
- `minmax()` — Defines lower/upper track sizing bounds in grid track-size grammar; it is not a generic length function.
- `layer()` — Refers to a cascade layer in contexts that accept a layer name/function, notably layer-qualified imports; it is not a numeric style value.
- `param()` — References a parameter in a context supporting parameterized functions, such as the relevant font function model; availability is specialized.
- `path()` — Defines an SVG path data value for properties that accept a path, with coordinate semantics tied to its consuming property.
- `ray()` — Defines ray geometry for motion-path contexts, including angle, size, and containment options.

## Cross-item comparison

`calc()` combines compatible units; `min()`/`max()` compare, and `clamp()` bounds. `mod()` and `rem()` differ for negative operands. Color construction functions choose a color space, while `color-mix()` interpolates existing colors. Gradient functions generate image values; basic-shape functions generate geometric values. `filter()` properties consume filter functions such as `blur()` and `drop-shadow()`, while transforms use transform functions such as `rotate()` and `translate()`. `minmax()` is constrained to grid track sizing; `fit-content()` can appear in sizing contexts. `counter()` renders generated counter text but does not create semantic content. `var()` substitution does not validate a value against every later property grammar.

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
- Using untrusted attribute values as security-sensitive content via `attr()`.
- Treating experimental or specialized functions as broadly interoperable.

## Knowledge checks with answers

1. **Which function bounds a preferred value between limits?** `clamp(minimum, preferred, maximum)`.
2. **Which differs in negative-number sign behavior: `mod()` or `rem()`?** Both are distinct; modulo follows divisor sign, remainder follows dividend sign.
3. **Is `minmax()` valid as any CSS property value?** No, it is defined for grid track sizing contexts.
4. **Does `var(--x, red)` recover if `--x` exists but makes the consuming property invalid?** Not generally; fallback is for missing/invalid custom property substitution, not arbitrary downstream property invalidity.
