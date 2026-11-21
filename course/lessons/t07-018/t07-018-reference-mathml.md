
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: MathML properties

# Scope and version

This reference covers the two supplied CSS properties `math-style` and `math-depth`. Their behavior is specified in MathML Core, which defines the browser-oriented core of MathML and is currently a W3C Candidate Recommendation Snapshot dated 24 June 2025. The MathML 4.0 document is a separate Working Draft; do not silently treat every feature in that broader draft as part of MathML Core. Check the current MathML Core text and target browsers before relying on new behavior.

The properties are general CSS properties that MathML Core uses for mathematical layout. Their behavior becomes meaningful through MathML layout rules and the MathML user-agent stylesheet. This reference does not catalog MathML elements, all font properties, or the separately inventoried `math-shift`; it explains how the two assigned properties cooperate with `font-size: math`, MathML display style, and script depth.

# How this group fits the mental model

Mathematical notation has nested presentation styles. A large display equation may use a full-size summation sign and limits above and below, while the same expression inside a paragraph or nested fraction may use a more compact layout. Nested scripts and fractions also need progressively smaller glyphs, with the scale guided by a mathematical font when it provides an OpenType MATH table.

`math-style` communicates whether MathML descendants should use normal or compact mathematical layout. `math-depth` tracks the current nesting depth used when a `font-size: math` value is computed. They are related but not interchangeable: compact style can trigger automatic depth increments when `math-depth` is `auto-add`, while depth controls font scaling only when the font size uses the MathML `math` value. Neither property changes the mathematical meaning or source structure of an expression. Use semantic MathML elements for fractions, scripts, roots, and operators; CSS controls their presentation.

# Supplied names explained

## `math-style`

**Definition.** The grammar is `normal | compact` plus CSS-wide keywords. The initial value is `normal`; it applies to all elements, is inherited, computes to its specified keyword, and is not animatable. MathML Core uses it on MathML layout descendants to choose between ordinary mathematical layout and a more compact logical height.

**`normal`.** Use the usual mathematical layout rules for the expression’s context. Operators marked as large operators may receive their larger form when their MathML layout context calls for it; movable limits can remain above/below an operator; and fractions and radicals use normal vertical gaps/shifts from the math font’s MATH table where applicable.

**`compact`.** Descendant math layout attempts to reduce logical height. In MathML Core this includes several distinct changes, not merely reducing line-height:

- If a descendant has `font-size: math` and `math-depth: auto-add`, the compact style can increase its computed math depth and scale down its font size.
- Operators whose MathML operator properties mark them `largeop` do not follow the normal rule that enlarges them.
- Under/over scripts attached to an operator marked `movablelimits` are laid out as subscript/superscript positions instead of movable limits above/below.
- Fractions and radicals use the specified smaller vertical gaps and shifts from the OpenType MATH table when that font data is available.

These rules explain the common, but not absolute, correspondence: inline mathematics tends to be compact and display mathematics tends to be normal. They do not say that every inline formula is visually smaller or every display formula uses a particular font size. MathML structure, operator data, fonts, and author styles still matter.

**Connection to MathML attributes and defaults.** MathML Core’s user-agent stylesheet maps the MathML `<math display="block">` presentational hint to block math display and normal math style, and `<math display="inline">` to inline math display and compact math style. CSS can override these defaults. The MathML `displaystyle` attribute is a presentational hint mapping `true` to `normal` and `false` to `compact`; it is not a separate CSS property. If a formula looks unexpectedly compact, inspect both the computed CSS and the MathML display/displaystyle context.

## `math-depth`

**Definition.** The grammar is `auto-add | add(<integer>) | <integer>` plus CSS-wide keywords. The initial value is `0`; it applies to all elements, is inherited, computes to an integer, and is not animatable. Its mathematical purpose is to track an element’s depth relative to the formula’s top-level container.

**Value behavior.** The current computed-depth algorithm is:

- `auto-add`: increase the inherited depth by one when the inherited `math-style` is `compact`; otherwise keep the inherited depth.
- `add(n)`: add integer `n` to the inherited depth. Positive values deepen; negative values move back toward a shallower depth.
- an integer such as `0`, `1`, or `-1`: set the depth to that absolute integer rather than adding it to the inherited depth.

The distinction between `add(1)` and `1` matters. If the parent depth is already 2, `add(1)` computes to 3, while `1` resets the computed depth to 1. `auto-add` is context-sensitive; it does not mean “always add one” and does not increment merely because an element is nested in the DOM.

**Connection to `font-size: math`.** The depth value affects font size when the specified `font-size` is `math`, a value defined by MathML Core. The resulting scale is based on the difference between inherited and computed depth. The specification uses a default per-level scale factor of 0.71, with special scale factors from the inherited first available font’s OpenType MATH table when present. Moving back to a shallower depth applies the inverse scale. If `font-size` is a normal CSS length or keyword instead of `math`, changing `math-depth` alone does not automatically scale that font size.

MathML Core’s user-agent stylesheet uses `font-size: math` for MathML layout and applies automatic depth behavior in relevant nested constructs. This is why changing the property manually can affect nested scripts/fractions in native MathML, but ordinary HTML does not acquire mathematical scaling just because a CSS declaration exists. The MathML `scriptlevel` presentational attribute maps to `math-depth` changes; in MathML Core, `+n` and `-n` map to `add(n)` and `add(-n)`, while a bare unsigned integer sets an absolute depth.

# Cross-item comparison

| Question | `math-style` | `math-depth` |
| --- | --- | --- |
| What does it represent? | Normal versus compact math layout for descendants | Nesting depth used by mathematical font sizing |
| Initial value | `normal` | `0` |
| Inherited? | Yes | Yes |
| What happens in compact context? | Changes operator, limit, spacing, and related math-layout decisions | `auto-add` may add one to the inherited depth |
| Does it alone guarantee smaller glyphs? | No; scaling requires the MathML `font-size: math` behavior and a depth change | No; it tracks depth, but only `font-size: math` uses that depth for scaling |
| MathML presentational-hint connection | `displaystyle` maps to `normal`/`compact` | `scriptlevel` maps to absolute/additive depth |

Setting `math-style: compact` does not directly set `font-size`; it influences layout and the `auto-add` rule. Setting `math-depth: 2` does not mean “multiply font size by two”; it places the element at depth 2. The browser computes `font-size: math` from the depth transition and mathematical font data.

# Examples

```html
<math class="inline-equation">
  <msup><mi>x</mi><mn>2</mn></msup>
  <mo>+</mo>
  <msup><mi>y</mi><mn>2</mn></msup>
  <mo>=</mo>
  <msup><mi>z</mi><mn>2</mn></msup>
</math>

<math class="display-equation" display="block">
  <mfrac>
    <mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow>
    <mrow><mi>c</mi><mo>+</mo><mi>d</mi></mrow>
  </mfrac>
</math>
```

```css
/* Demonstrate the presentation distinction while leaving MathML structure intact. */
.inline-equation {
  math-style: compact;
}

.display-equation {
  display: block math;
  math-style: normal;
}

/* A focused override: deepen this MathML subtree relative to its parent. */
.deeper-script {
  math-depth: add(1);
}

/* An absolute reset, useful only when an intentional reset is needed. */
.reset-math-depth {
  math-depth: 0;
}
```

MathML user-agent rules already choose styles based on the root formula’s display mode, so ordinary author code usually does not need to restate those defaults. The snippets demonstrate overrides, not a replacement for semantic structure or a claim that all MathML implementations render identically. Check the computed `math-style`, `math-depth`, and `font-size`, then compare a nested fraction or script in both inline and display contexts.

# Common mistakes

- Treating `math-style: compact` as a synonym for `font-size: smaller`; it changes mathematical layout rules and only participates in automatic scaling through `math-depth` and `font-size: math`.
- Assuming `math-depth` is a simple DOM nesting counter. It follows explicit, additive, and style-dependent rules; the MathML layout model controls where automatic increments occur.
- Confusing `math-depth: 1` with `math-depth: add(1)`. The first resets to absolute depth 1; the second increments the inherited depth.
- Claiming every change in depth scales a normal `font-size: 16px`. MathML scaling is triggered when the specified size is `math`.
- Assuming the scale factor is always exactly 0.71 per level. That is the default component; an OpenType MATH table can contribute script and scriptscript scale factors.
- Using either property to repair incorrectly structured markup. A fraction should be represented by MathML fraction structure, not by visual CSS positioning of text.
- Assuming HTML `<span>` and MathML descendants necessarily respond identically. The properties apply broadly in CSS, but the mathematical layout behavior depends on MathML Core’s math boxes, user-agent rules, and the MathML context.
- Treating inline/display conventions as absolute rules. MathML Core maps root display hints to defaults, but author CSS and nested MathML rules can change them.
- Confusing the MathML `displaystyle` and `scriptlevel` attributes with CSS property names. They are MathML attributes that act as presentational hints for the corresponding CSS behavior.
- Treating MathML Core’s Candidate Recommendation status or an MDN Baseline label as a guarantee of identical rendering or assistive-technology behavior in every browser.

# Knowledge checks with answers

1. **What changes when a MathML subtree becomes compact?** Descendant layout aims for reduced logical height: auto-added math depth can scale `font-size: math`, large operators are not enlarged by the normal rule, movable limits can become scripts, and fraction/radical spacing uses compact math-font constants.
2. **A child inherits depth 2. What do `math-depth: 1` and `math-depth: add(1)` compute?** The first sets depth to 1; the second computes depth 3.
3. **Will `math-depth: add(1)` shrink a child whose font size is explicitly `20px`?** Not through the MathML depth-scaling algorithm; that algorithm applies when the specified `font-size` is `math`.
4. **Why can the same summation look different in inline and display MathML?** MathML Core’s root display defaults select compact versus normal math style, which affects operator sizing and movable limits among other layout decisions.
5. **Which property says “use a compact mathematical layout,” and which tracks scale depth?** `math-style` selects normal/compact layout; `math-depth` supplies the depth used by `font-size: math`.
6. **Should a developer set these properties on every expression?** Usually not. Native MathML’s user-agent stylesheet supplies context-sensitive defaults; override them only for an intentional presentation change and test across target browsers.

# Sources

- [MathML Core, W3C Candidate Recommendation Snapshot](https://www.w3.org/TR/mathml-core/) — §§2.1.6, 4.3 and 4.5; MathML attributes, user-agent defaults, `math-style`, `math-depth`, and `font-size: math`.
- [MathML 4.0 Working Draft](https://www.w3.org/TR/2026/WD-mathml4-20261008/) — separate broader draft; do not conflate its scope or maturity with MathML Core.
- [MDN: `math-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/math-style) and [MDN: `math-depth`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/math-depth) — cross-check and compatibility entry points.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification status versus implementation context.
