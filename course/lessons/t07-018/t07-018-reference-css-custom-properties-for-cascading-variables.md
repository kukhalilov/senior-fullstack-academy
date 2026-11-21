# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Custom Properties for Cascading Variables properties

# Scope and version

This reference covers the one supplied inventory name, `--*`: the open-ended family of author-defined CSS custom properties. The core model is in the published CSS Custom Properties for Cascading Variables Level 1 Candidate Recommendation Snapshot. Typed registration is defined separately by the CSS Properties and Values API Level 1; the current Editor’s Draft checked 2026-11-19 is work in progress. The CSS Snapshot 2026 describes specification maturity, not browser adoption.

# How this group fits the mental model

A custom property stores a CSS token sequence under a case-sensitive name beginning with two hyphens. It participates in the cascade and normally inherits. `var()` substitutes its value into another property value at computed-value time. It is not JavaScript-style textual replacement: it cannot construct property names, selectors, or arbitrary pieces of a CSS token.

By default, the browser does not understand or validate the sequence as a color, length, or other type when the custom property is declared. The consuming property validates the result after substitution. `@property` or `CSS.registerProperty()` can opt a custom property into a declared syntax, inheritance behavior, initial value, and typed animation.

# Supplied names explained

| Exact inventory name | Definition and practical consequences |
| --- | --- |
| `--*` | Any valid dashed identifier except the reserved name `--`. Applies to all elements and pseudo-elements; inherits by default; names and values are case-sensitive. The value accepts a permissive CSS declaration-value token sequence, including values that would not be valid for any built-in property. Its initial state is the guaranteed-invalid value, not an empty string. Unregistered values are not generally typed, and their animations flip discretely rather than interpolating. |

# Examples

## Defining and consuming values

```css
:root {
  --brand: rebeccapurple;
  --space: 1rem;
}

.button {
  color: var(--brand, navy);
  padding-inline: var(--space);
}
```

The `var()` grammar is `var(<custom-property-name>, <fallback>?)`. The first comma separates the name from the fallback; additional commas belong to the fallback. A nested `var()` is how to express a second fallback, for example `var(--primary, var(--secondary, navy))`. A bare comma can express an empty fallback. The fallback is used when the referenced property has its guaranteed-invalid value, including when it was not supplied or was invalidated by a dependency cycle. It is not a general recovery mechanism for a value that exists but is rejected by the consuming property’s grammar.

The distinction can be surprising:

```css
:root { --text-color: 20px; }
p { color: blue; color: var(--text-color); }
```

The second `color` declaration survives parsing because `var()` makes its grammar unknown at that stage. After substitution it is invalid at computed-value time, so it does **not** restore the earlier `color: blue` declaration; the property behaves as unset (inherited or initial according to that property). Validate token contracts at component boundaries and choose fallbacks that are valid for the consuming property.

# Cross-item comparison

## Cascade, inheritance, and invalid values

- The custom property is cascaded on each element. Its value is resolved before it is inherited; descendants inherit the parent’s computed custom-property value unless they specify their own.
- `--brand` and `--Brand` are distinct names. Preserve case in CSSOM; access custom properties through their literal name with methods such as `getPropertyValue()` rather than camel-cased property access.
- `initial` resets an unregistered custom property to the guaranteed-invalid value. `unset` acts like `inherit` for an unregistered custom property because it inherits by default. Normal cascade controls including `inherit`, `revert`, and `revert-layer` remain available.
- `!important` on a custom-property declaration affects its cascade priority but is stripped from the stored token value.
- A reference cycle among custom properties declared on the same element invalidates every property in that cycle. References in `var()` fallback arguments also count when building the dependency graph.
- A `var()` can appear inside a shorthand. The shorthand’s longhands remain pending substitution until the value is resolved; CSSOM serialization of those pending values can be empty rather than revealing the original shorthand.
- An unregistered custom property retains URL tokens until substitution into a consuming property, so a relative URL can resolve in the stylesheet context where it is used. A registered property with `<url>` syntax computes a relative URL to an absolute URL against the stylesheet where its registered value appears. This difference matters when moving tokens between stylesheets.
- User agents must limit substitution expansion to defend against exponential token-stream growth; excessively expanded values become invalid at computed-value time.

# Typed registration: related CSS and JavaScript APIs

Registration is a related mechanism, not a second kind of `--*` name. `@property` registers in CSS; `CSS.registerProperty()` registers from JavaScript. A registration names one custom property and can declare `syntax`, `inherits`, and `initial-value`. In the current API draft, the ordinary descriptors are optional and their defaults preserve unregistered behavior; an initial value must parse against the declared syntax. A universal `syntax: "*"` accepts any valid token stream and can retain the guaranteed-invalid initial value. Registrations are global to the document’s registered-property set, so use collision-resistant names in component internals.

The Level 1 syntax strings support the universal `*` token stream or types `<angle>`, `<color>`, `<custom-ident>`, `<image>`, `<integer>`, `<length>`, `<length-percentage>`, `<number>`, `<percentage>`, `<resolution>`, `<string>`, `<time>`, `<transform-function>`, `<transform-list>`, and `<url>`. `|` separates alternatives, `+` means a space-separated list, and `#` means a comma-separated list. For example, `syntax: "<length> | <percentage>"` accepts either type. The current Editor’s Draft also proposes a compact `@property --name <type>: <initial-value>;` form; it is newer draft syntax and should not be confused with the established block form.

```css
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.meter { transform: scaleX(var(--progress)); transform-origin: left; }
```

```js
CSS.registerProperty({
  name: "--accent",
  syntax: "<color>",
  inherits: true,
  initialValue: "rebeccapurple",
});
```

The registration’s syntax is parsed at computed-value time. It lets the browser interpolate supported typed values such as a color or length instead of flipping an unregistered token stream. A second valid registration can conflict: the latest valid `@property` registration in stylesheet order wins among rules, while a JavaScript registration takes precedence over a stylesheet registration for the same name. Duplicate or malformed registrations should be treated as errors to resolve, not as a reliable override pattern.

`CSS.registerProperty()` requires `name`; its current draft defaults `syntax` to `"*"` and `inherits` to `true`, with `initialValue` omitted by default. Invalid names or syntax throw `SyntaxError`; attempting a duplicate JavaScript registration throws `InvalidModificationError`. A supplied initial value must parse against the declared syntax and be computationally independent (for example `0px` is suitable for `<length>`, while `3em` depends on font size). CSSOM represents a parsed `@property` rule with `CSSPropertyRule`, whose read-only attributes are `name`, `syntax`, `inherits`, and `initialValue`.

# Common mistakes

- Treating `var()` as text replacement or trying to use it for a property name, selector, or media-query condition.
- Expecting the fallback to run when a defined value has the wrong grammar for the consuming property.
- Expecting a failed `var()` declaration to reveal an earlier declaration in the cascade; computed-value-time invalidation has already discarded that fallback candidate.
- Assuming custom property names are case-insensitive, or that unregistered custom properties are typed.
- Using `--` by itself as a property name; it is reserved.
- Assuming registered custom properties inherit like unregistered ones; the registration controls inheritance.
- Forgetting that `@property` has a document-wide registration effect and that syntax and initial value must agree.
- Assuming an unregistered custom property interpolates smoothly in transitions; its token sequence is not understood as a typed value.

# Knowledge checks with answers

1. **Why is `color: var(--x)` not rejected when `--x: 20px` is present?** The declaration grammar is deferred until `var()` substitution. It then becomes invalid at computed-value time, and the earlier cascaded color is not restored.
2. **What does `var(--x, red, blue)` use as its fallback?** The complete token sequence `red, blue`; only the first comma separates the name and fallback.
3. **Are `--Brand` and `--brand` the same property?** No. Custom-property names are case-sensitive.
4. **What is the initial value of an unregistered custom property?** The guaranteed-invalid value, which causes `var()` to use a valid fallback or makes the consuming declaration invalid.
5. **How does registration change a custom property?** It adds a syntax contract, controlled inheritance, an initial value, and typed computed-value/animation behavior through `@property` or `CSS.registerProperty()`.
6. **Can a custom property cycle be fixed by putting the reference in `var()`’s fallback?** No. Fallback references also participate in cycle detection; all properties in the cycle become invalid at computed-value time.

# Sources

- [CSS Custom Properties for Cascading Variables Module Level 1](https://www.w3.org/TR/css-variables-1/) — §§2–4: name/value model, guaranteed-invalid initial state, inheritance, cycles, `var()` substitution, shorthand handling, serialization, and security limits.
- [CSS Properties and Values API Level 1, current Editor’s Draft](https://drafts.css-houdini.org/css-properties-values-api-1/) — §§2–4 and 6: registration, syntax/inheritance/initial-value descriptors, `CSS.registerProperty()`, registration precedence, and `CSSPropertyRule`. Work in progress.
- [CSS Properties and Values API Level 1, published Working Draft](https://www.w3.org/TR/css-properties-values-api-1/) — published 2024 snapshot for comparison; when it differs, the lesson labels newer Editor’s Draft syntax and behavior explicitly.
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties) — practical syntax and compatibility guidance.
- [CSSOM](https://drafts.csswg.org/cssom/) — literal-name access to custom properties through CSS declaration APIs.
