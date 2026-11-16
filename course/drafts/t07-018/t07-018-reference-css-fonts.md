<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Fonts properties

# Scope and version

This reference explains all 24 supplied names in **CSS Fonts properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 22 supplied names have an MDN Baseline label, 2 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Font properties select families and faces, configure variation/feature axes, control synthesis, loading, optical sizing, and font metrics. Font availability and shaping depend on the user agent, platform, script, and loaded font files. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `font` | The font CSS shorthand property sets all the different properties of an element's font. Alternatively, it sets an element's font to a system font. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font) |
| `font-family` | The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-family) |
| `font-feature-settings` | The font-feature-settings CSS property controls advanced typographic features in OpenType fonts. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-feature-settings) |
| `font-kerning` | The font-kerning CSS property sets the use of the kerning information stored in a font. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-kerning) |
| `font-language-override` | The font-language-override CSS property controls the use of language-specific glyphs in a typeface. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-language-override) |
| `font-optical-sizing` | The font-optical-sizing CSS property sets whether text rendering is optimized for viewing at different sizes. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-optical-sizing) |
| `font-palette` | The font-palette CSS property allows specifying one of the many palettes contained in a color font that a user agent may use for the font. Users can also override the values in a palette or create a new palette by using the @font-palette-values at-rule. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-palette) |
| `font-size` | The font-size CSS property sets the size of the font. Changing the font size also updates the sizes of the font size-relative <length> units, such as em, ex, and so forth. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size) |
| `font-size-adjust` | The font-size-adjust CSS property adjusts the size of a font to match a chosen font metric, such as the height of lowercase letters, to a specified proportion of the font-size. This property is intended for adjusting fallback fonts to have similar metrics as the first-choice font. **Support snapshot:** Baseline 2024. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size-adjust) |
| `font-style` | The font-style CSS property sets whether a font should be styled with a normal, italic, or oblique face from its font-family. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-style) |
| `font-synthesis` | The font-synthesis CSS shorthand property lets you specify whether or not the browser may synthesize the bold, italic, small-caps, and/or subscript and superscript typefaces when they are missing in the specified font-family. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis) |
| `font-synthesis-small-caps` | The font-synthesis-small-caps CSS property lets you specify whether or not the browser may synthesize small-caps typeface when it is missing in a font family. Small-caps glyphs typically use the form of uppercase letters but are reduced to the size of lowercase letters. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis-small-caps) |
| `font-synthesis-style` | The font-synthesis-style CSS property lets you specify whether or not the browser may synthesize the oblique typeface when it is missing in a font family. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis-style) |
| `font-synthesis-weight` | The font-synthesis-weight CSS property lets you specify whether or not the browser may synthesize the bold typeface when it is missing in a font family. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis-weight) |
| `font-variant` | The font-variant CSS shorthand property allows you to set all the font variants for a font. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant) |
| `font-variant-alternates` | The font-variant-alternates CSS property controls the usage of alternate glyphs. These alternate glyphs may be referenced by alternative names defined in @font-feature-values. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-alternates) |
| `font-variant-caps` | The font-variant-caps CSS property controls the use of alternate glyphs used for small or petite capitals or for titling. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-caps) |
| `font-variant-east-asian` | The font-variant-east-asian CSS property controls the use of alternate glyphs for East Asian scripts, like Japanese and Chinese. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-east-asian) |
| `font-variant-emoji` | The font-variant-emoji CSS property specifies the default presentation style for displaying emojis. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-emoji) |
| `font-variant-ligatures` | The font-variant-ligatures CSS property controls which ligatures and contextual forms are used in the textual content of the elements it applies to. This leads to more harmonized forms in the resulting text. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-ligatures) |
| `font-variant-numeric` | The font-variant-numeric CSS property controls the usage of alternate glyphs for numbers, fractions, and ordinal markers. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric) |
| `font-variant-position` | The font-variant-position CSS property controls the use of alternate, smaller glyphs that are positioned as superscript or subscript. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-position) |
| `font-variation-settings` | The font-variation-settings CSS property provides low-level control over variable font characteristics by letting you specify the four letter axis names of the characteristics you want to vary along with their values. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings) |
| `font-weight` | The font-weight CSS property sets the weight (or boldness) of the font. The weights available depend on the font-family that is currently set. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight) |

# Cross-item comparison

`font-family` selects fallback order; `font-weight`, `font-stretch`, and `font-style` select face characteristics. `font-feature-settings` and `font-variation-settings` expose lower-level OpenType controls; prefer higher-level properties where available. `font-size-adjust` and metric overrides can stabilize fallback geometry.

| Item | How to interpret it |
| --- | --- |
| `font` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `font-family` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Provide a generic family at the end of `font-family`, and test complex scripts and fallback fonts rather than assuming the local font exists.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Using low-level feature settings when a high-level property exists.
- Assuming a requested weight exists and cannot be synthesized.
- Failing to include generic fallback families.
- Ignoring layout shift from late font loading.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `font`, `font-family`, `font-feature-settings`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
