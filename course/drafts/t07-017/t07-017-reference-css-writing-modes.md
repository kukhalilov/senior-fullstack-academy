# CSS layout flexbox grid positioning and responsive design — Reference: CSS Writing Modes properties

# Scope and version

This lesson explains all 5 supplied properties in **CSS Writing Modes properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 5 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Writing mode determines the direction and orientation of inline and block flow. Direction sets inline base direction for text, while text orientation and combination affect glyph presentation; bidi controls interact with the Unicode Bidirectional Algorithm and should be used sparingly. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `direction` | The direction CSS property sets the direction of text, table and grid columns, and horizontal overflow. Use rtl for languages written from right to left (like Hebrew or Arabic), and ltr for those written from left to right (like English and most other languages). **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/direction) |
| `text-combine-upright` | The text-combine-upright CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-combine-upright) |
| `text-orientation` | The text-orientation CSS property sets the orientation of the text characters in a line. It only affects text in vertical mode (when writing-mode is not horizontal-tb). It is useful for controlling the display of languages that use vertical script, and also for making vertical table headers. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-orientation) |
| `unicode-bidi` | The unicode-bidi CSS property, together with the direction property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The unicode-bidi property overrides this algorithm and allows the developer to control the text embedding. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/unicode-bidi) |
| `writing-mode` | The writing-mode CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which text flows. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/writing-mode) |

# Cross-item comparison

`writing-mode` establishes block-flow orientation; `direction` sets inline base direction; `text-orientation` handles glyph orientation in vertical text; `text-combine-upright` combines short runs upright in vertical layout; `unicode-bidi` controls embedding/isolation behavior. Logical properties resolve against these axes.

# Examples

Test a localized component with `writing-mode: vertical-rl` and RTL text to reveal assumptions in physical margins, alignment, and icon orientation.

```css
.vertical-label { writing-mode: vertical-rl; text-orientation: mixed; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Using `direction` as a replacement for correct language and Unicode text.
- Setting `unicode-bidi` without understanding embedding/isolation effects.
- Assuming vertical text is simply horizontal text rotated.
- Mapping logical properties to physical edges without checking writing mode.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `direction`, `text-combine-upright`, `text-orientation`, `unicode-bidi`, `writing-mode`. Each has an individual definition and support link above.
2. **What should be checked beyond this concise description?** Full grammar, applicable boxes, inheritance, computed behavior, interactions, and the target browser compatibility data.
3. **What is the MDN status label’s date?** The local reference capture is dated 2026-11-16; consult current compatibility data for future production decisions.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 4 draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
- [CSS Display Level 4 draft](https://drafts.csswg.org/css-display-4/)
- [CSS Anchor Positioning Level 1 draft](https://drafts.csswg.org/css-anchor-position-1/)
