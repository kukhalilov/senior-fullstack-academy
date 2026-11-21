
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: MathML math-shift properties

## Scope and version

This lesson covers the one supplied property, `math-shift`, defined by MathML Core’s CSS extensions for mathematical layout. MathML Core is a browser-oriented subset of MathML with detailed rendering rules. The latest W3C-published snapshot available on 19 November 2026 is a Candidate Recommendation Snapshot dated 24 June 2025; the specification’s Editor’s Draft continues to evolve. MDN labels `math-shift` Baseline 2025, newly available since December 2025. For older browsers and specialized MathML content, verify the exact current compatibility table and rendered output.

The feature is most meaningful when the element participates in MathML Core layout, especially MathML script structures such as `<msup>`, `<msubsup>`, and `<mmultiscripts>`. Although its formal applicability is all elements, an ordinary HTML element or HTML `<sup>` does not automatically become a MathML script layout box just because it has `math-shift` set.

## How this group fits the mental model

An equation is not just text with smaller characters raised above a baseline. A mathematical font can provide layout constants, glyph metrics, and spacing rules so that superscripts avoid collisions with the base and remain visually balanced. A math renderer combines those font metrics with minimum clearances and baseline constraints; it does not simply apply a fixed CSS `top` offset.

`math-shift` selects which of two superscript-raising constants MathML Core uses in the script-placement calculation. It is one part of a wider system: `math-style` affects display/compact mathematical style and may affect sizing/layout decisions; `math-depth` helps derive script font sizes; the MathML structure identifies which children are bases, subscripts, superscripts, accents, or limits. These controls are related but not interchangeable.

## Supplied names explained

### `math-shift`

**Grammar:** `normal | compact`, plus CSS-wide keywords. **Initial:** `normal`. **Applies to:** all elements. **Inherited:** yes. **Percentages:** not applicable. **Computed value:** specified keyword. **Animation:** not animatable. **Media:** visual.

| Value | Effect in MathML Core |
| --- | --- |
| `normal` | The default. When laying out a superscript, use the font’s `SuperscriptShiftUp` MATH constant as one input to the placement calculation. |
| `compact` | Use the font’s `SuperscriptShiftUpCramped` MATH constant as that input. It is generally smaller than the normal constant, giving a more compact (“cramped” in TeX terminology) superscript placement. |

This value is inherited. A compact setting can therefore affect superscript layout in descendant MathML content until another declaration changes it. MathML Core’s user-agent stylesheet also sets it in specific script contexts to reproduce mathematical style rules. For example, `msub` and `msubsup` set it to `compact` on their second child, while script structures with prescripts apply rules based on child position. These defaults are part of MathML rendering; authors usually do not need to recreate the entire UA stylesheet.

The property does not specify an offset in CSS pixels, set the superscript’s `font-size`, or guarantee that the final superscript will move by a visibly smaller amount. In the `<msup>` algorithm, the chosen MATH constant is one of several lower bounds: the final shift is the maximum of it, a minimum-clearance condition below the superscript, and a baseline-drop constraint on the base. Other constraints can dominate, so changing the constant may have no visible effect in a particular formula.

The values `normal` and `compact` describe the script-placement mode for mathematical layout. Do not confuse `compact` here with `math-style: compact`: `math-style` controls a separate mathematical display/size mode, while `math-shift` selects the superscript shift parameter.

## Examples

### Compare normal and compact superscript placement

```html
<math>
  <msup class="normal-shift">
    <mi>x</mi><mn>2</mn>
  </msup>
  <msup class="compact-shift">
    <mi>x</mi><mn>2</mn>
  </msup>
</math>
```

```css
.normal-shift {
  math-shift: normal;
}

.compact-shift {
  math-shift: compact;
}
```

The second superscript will generally be placed using the cramped shift constant. It may appear lower/closer to the base, but the font’s MATH table and MathML Core’s other clearance constraints determine the final layout. Use a math font with suitable OpenType MATH data for high-quality equations; fallback rendering may not match a dedicated math font.

### A compact context containing another superscript

```html
<math>
  <msup>
    <mi>x</mi>
    <mrow class="compact-context">
      <msup><mi>y</mi><mn>2</mn></msup>
    </mrow>
  </msup>
</math>
```

```css
.compact-context {
  math-shift: compact;
}
```

Because the property is inherited, the nested mathematical script can use compact shift behavior in that context. In real equations, MathML’s own user-agent rules often establish such contexts automatically for structures such as scripts and cramped subformulas. Use author rules only when a deliberate refinement is needed and test the exact MathML structure.

## Distinguish related mechanisms

| Mechanism | What it controls | What it does not do |
| --- | --- | --- |
| `math-shift` | Which superscript-shift constant MathML Core uses in script placement | Does not set font size or a literal pixel offset |
| `math-style` | Mathematical display/compact mode and associated layout behavior | Does not select the superscript shift constant by itself |
| `math-depth` | Script nesting depth used to compute MathML font sizing | Does not directly position superscripts |
| OpenType MATH table | Font-specific constants, glyph information, and math layout data used by the renderer | Does not supply markup structure or author CSS rules |
| HTML `<sup>` / `vertical-align: super` | Ordinary text superscript styling and alignment | Does not invoke MathML Core’s structured equation layout or its MATH-table-based script algorithm |

The property is a CSS extension specified by MathML Core. Legacy MathML attributes such as `displaystyle` and `scriptlevel` are mapped to related CSS properties by MathML Core for compatibility, but they are separate controls; their presence does not mean `math-shift` is an attribute or HTML feature.

## Common mistakes

- Assuming `compact` means “reduce the superscript font size.” MathML font sizing is handled through mechanisms such as `math-depth`; `math-shift` chooses a placement constant.
- Treating `math-shift` as a pixel offset. It selects an input to the algorithm; the final shift also respects collision and baseline constraints.
- Expecting the compact result to be visibly lower in every case. A different constraint may determine the final position, and font metrics vary.
- Assuming `math-style: compact` and `math-shift: compact` are synonyms. They control different dimensions of mathematical layout.
- Setting `math-shift` on an ordinary HTML `<sup>` and expecting MathML behavior. Use MathML structures when MathML’s algorithm and semantics are needed.
- Assuming every font has complete OpenType MATH data. MathML Core defines fallback options, but recommends a math font with appropriate MATH features for quality; fallback metrics may render less well.
- Manually duplicating MathML Core’s user-agent stylesheet rules without accounting for element structure, accents, prescripts, and inheritance.
- Treating the property as a general-purpose way to reposition arbitrary symbols or subscripts. Its specified role is superscript placement within MathML script layout.

## Knowledge checks with answers

1. **What values does `math-shift` accept?** `normal` and `compact`, plus CSS-wide keywords.
2. **Which MATH constants are selected?** `normal` selects `SuperscriptShiftUp`; `compact` selects `SuperscriptShiftUpCramped`.
3. **Does the selected constant alone determine the final shift?** No. MathML Core also enforces superscript clearance and baseline constraints.
4. **Does compact change superscript font size?** No. Script sizing is handled separately, including by `math-depth` and math font behavior.
5. **How is `math-style` different?** It controls mathematical display/compact style, whereas `math-shift` chooses the superscript shift parameter.
6. **Why does inheritance matter?** A compact context can affect nested MathML script layout in descendants unless overridden.
7. **Does an HTML `<sup>` use this property’s MathML algorithm?** No. It uses ordinary HTML/CSS superscript behavior rather than MathML Core’s structured script layout.
8. **What is the current support status?** MDN marks the feature Baseline 2025, but older browser versions and MathML/font combinations should still be checked.

## Cross-item comparison

This inventory group has one property. The essential comparisons are with `math-style` (display/compact mathematical mode), `math-depth` (script scaling), and OpenType MATH constants (font-provided layout inputs). Correct MathML script layout depends on the markup structure, the relevant CSS properties, and font metrics working together.

## Sources

- [MathML Core, W3C Candidate Recommendation Snapshot, 24 June 2025](https://www.w3.org/TR/mathml-core/) — property grammar and metadata, superscript algorithm, automatic MathML stylesheet behavior, font MATH constants, and fallback notes.
- [MathML Core Editor’s Draft](https://w3c.github.io/mathml-core/) — current evolving draft.
- [MDN `math-shift`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/math-shift) — current syntax, examples, Baseline status, and browser compatibility.
- [OpenType Specification: MATH table](https://learn.microsoft.com/en-us/typography/opentype/spec/math) — definition of font math table constants and glyph data used by mathematical layout.
