
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Inline Layout draft properties

## Scope and version

This lesson covers the inventory item `initial-letter-align` from CSS Inline Layout Module Level 3. The latest CSSWG Editor’s Draft, dated 14 October 2026, defines the property, but explicitly describes that document as work in progress. The latest published W3C document is a 18 December 2024 Working Draft. Treat the exact behavior as evolving and check current browser support before shipping. The specification marks `initial-letter-wrap` at risk; that note does not apply to `initial-letter-align`.

The property has a narrow purpose: it chooses the two typographic alignment points used when laying out an initial letter (often a drop cap). It does not create a drop cap, choose how many lines it spans, or generally align ordinary inline content. The companion `initial-letter` property creates and sizes/positions the special initial letter; this property tells the layout which typographic edges or baselines should line up.

## How this group fits the mental model

A paragraph’s first line and a large opening letter do not necessarily share the same font size, glyph shape, or script. Aligning the big glyph by its font-size box can make it look too high or low. Instead, CSS needs an upper (“over”) and lower (“under”) reference point for the initial letter, and matches them to corresponding points derived from the surrounding text’s root inline box.

For Latin text, a familiar choice is the cap-height at the top and the alphabetic baseline at the bottom. Other writing systems use different typographic reference lines. Choosing suitable metrics helps the initial letter sit with the text rather than merely matching arbitrary rectangular edges. Actual quality also depends on font metrics being available and correct.

## Supplied names explained

The sole supplied name is `initial-letter-align`. It chooses typographic alignment references for initial-letter layout.

```css
initial-letter-align: [ border-box? [ alphabetic | ideographic | hanging | leading ]? ]!;
```

The `!` in CSS value-definition notation means the bracketed group is required; it is not typed into CSS. `border-box` may appear before an optional alignment keyword. The alignment keyword itself is optional, so the valid forms include:

```css
initial-letter-align: alphabetic;
initial-letter-align: ideographic;
initial-letter-align: hanging;
initial-letter-align: leading;
initial-letter-align: border-box;
initial-letter-align: border-box alphabetic;
```

The property also accepts the CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, and `revert-layer`) under the module’s general rules. The initial value is `alphabetic`; the property is inherited; percentages do not apply; its computed value is the specified keyword or keywords; animation is discrete.

It applies only to the certain inline-level boxes used as initial letters, `::first-letter`, and inside-positioned `::marker` boxes, subject to the specification’s applicability rules. Do not expect it to align an arbitrary enlarged `<span>` unless that box is actually participating as an initial letter.

### Alignment choices

| Value | Reference points used for the initial letter | When it can make sense |
| --- | --- | --- |
| `alphabetic` | Cap-height and alphabetic baselines of the surrounding text | Latin-like typography and scripts whose relevant font metrics use these references; this is the initial value. |
| `ideographic` | Ideographic-ink-over and ideographic-ink-under baselines | Han-derived typography, including suitable Chinese, Japanese, Korean, or Yi content. |
| `hanging` | Hanging and alphabetic baselines | Typography that needs the hanging baseline at the top and alphabetic baseline at the bottom, including some Indic typesetting. |
| `leading` | The surrounding text’s over/under half-leading edges: ascent/descent combined with half-leading | Designs that align to the line-gap edges; the draft notes this can be useful in certain Indic typesetting. |
| `border-box` | The initial-letter box’s line-over and line-under border edges | When the box edges, rather than content-derived font metrics, should be the alignment points. It can be followed by one of the four keywords to specify that alignment choice explicitly. |

Without `border-box`, the draft normally derives the initial letter’s alignment from its contents: an atomic inline uses its content-box edges; otherwise, Han, Hangul, Kana, or Yi characters select ideographic ink baselines; otherwise cap-height and alphabetic baselines are used. The draft contains a repeated Han/Hangul/Kana/Yi condition in the following numbered branch, where context suggests a different script condition may have been intended. Do not infer or teach an automatic `hanging` selection from that apparent editorial error. Explicitly choosing a value is clearer when a design requires it.

The draft also proposes user-agent default styles based on language and script tags: common Chinese/Japanese/Korean/Yi language tags use `ideographic`; several Indic language tags use `hanging`; Latin and Cyrillic script tags use `alphabetic`; Han script tags use `ideographic`. These are draft UA-style recommendations, not a substitute for checking the actual implementation and content language. Correct alignment is not currently expressible for every script: the draft calls out missing OpenType metrics for scripts such as Hebrew and Thai.

### Using it with `initial-letter`

A minimal conceptual example is:

```css
p::first-letter {
  initial-letter: 3;
  initial-letter-align: alphabetic;
}

[lang|="ja"] p::first-letter {
  initial-letter-align: ideographic;
}
```

Here `initial-letter: 3` requests a three-line drop initial under the Level 3 draft; `initial-letter-align` selects its alignment references. The language selector is only an example of author intent, not a universal language-detection or support guarantee. The user agent may have defaults, and authors should test real text in the target writing mode and fonts.

A box-edge variant is:

```css
p::first-letter {
  initial-letter: 3;
  initial-letter-align: border-box alphabetic;
  padding-block: 0.08em;
  border-block: 1px solid currentColor;
}
```

Use `border-box` deliberately: it makes the initial letter box’s border edges the alignment points, so padding and borders can affect where those points lie. Without it, the content/font alignment points are used; padding and borders still affect the box and its exclusion area, but the draft says they do not change vertical alignment or font sizing. Note that Level 3 excludes `vertical-align` from the properties applying to a non-atomic inline initial letter; it is not a general substitute for this property.

## Examples

A Latin drop cap can use alphabetic metrics; Japanese content can choose ideographic metrics when that matches its typeface and intended alignment; a bordered initial can use its box edges. The examples above show these choices. Apply the practical checks below to each design.

1. Decide whether the design needs a real initial letter (drop, raised, or sunken) rather than just a larger first glyph. If so, `initial-letter` establishes that layout behavior.
2. Identify the content’s writing system, language, and font metrics. Do not assume alphabetic baselines are visually correct for every script.
3. Choose an alignment mode for the intended typographic references. Use `border-box` only when the box edges are the intended references.
4. Test the actual font, glyph (including descenders and punctuation), writing mode, and paragraph line-height. Initial-letter layout can protrude beyond ordinary line boxes and influence how surrounding lines wrap.
5. Verify support in current browsers. Keep the opening text readable and the page layout acceptable if the draft feature is ignored; avoid making essential meaning or access to content depend on the decorative initial-letter layout.

## Common mistakes

- **“This property makes a drop cap.”** No. `initial-letter` creates the initial-letter layout; this property chooses its alignment points.
- **“`alphabetic` means align the glyph’s bottom to the CSS element box.”** It uses typographic cap-height/alphabetic baseline references, not a generic element rectangle.
- **“All scripts have usable metrics.”** No. The draft documents gaps in font/OpenType metrics and notes that some scripts cannot currently be aligned correctly with the available metrics.
- **“A language tag guarantees the browser’s default.”** The ED proposes UA rules, but implementations and font data must be checked; author CSS can set the intended value explicitly.
- **“`border-box alphabetic` is the same as `alphabetic`.”** The former uses the box’s border edges as the alignment points; the latter uses content-derived typographic points.
- **“The at-risk label for `initial-letter-wrap` applies to every initial-letter property.”** It is specifically attached to `initial-letter-wrap` in this draft.
- **“`vertical-align` can fix an initial-letter alignment problem.”** The draft gives initial letters their own alignment model and excludes `vertical-align` for non-atomic inline initial letters.

## Knowledge checks with answers

1. **What does this property control?** The over/under alignment points used to size and position an initial letter relative to the surrounding text.
2. **What property creates and sizes the special initial letter?** `initial-letter`; this property complements it.
3. **What does `leading` align to?** The surrounding text’s over/under half-leading edges, derived from ascent/descent and half-leading.
4. **When does `border-box` matter?** When the initial letter’s line-over/line-under border edges should be the alignment references instead of content-derived font metrics.
5. **Why might a Japanese example use `ideographic`?** It selects ideographic ink-over/ink-under baselines, which are suitable typographic references for that writing system when supported by the font and implementation.
6. **Can the property guarantee good Hebrew or Thai alignment?** No. The draft notes missing OpenType metrics for these scripts.
7. **What does the draft’s at-risk notice name?** `initial-letter-wrap`, not `initial-letter-align`.

## Cross-item comparison

This inventory group contains no second property to compare. The useful distinction is with the companion `initial-letter` property, which creates/sizes/positions the typographic initial, and with `vertical-align`, which is not the mechanism for non-atomic initial letters in this model. Ordinary `font-size` enlargement is only a visual approximation and does not create the special wrapping/layout behavior.

## Sources

- [CSS Inline Layout Module Level 3 Editor’s Draft, 14 October 2026](https://drafts.csswg.org/css-inline-3/) — current evolving grammar, property definition, default-style proposal, and metric caveats.
- [CSS Inline Layout Module Level 3, W3C Working Draft, 18 December 2024](https://www.w3.org/TR/css-inline-3/) — latest published snapshot; still a Working Draft.
- [MDN `initial-letter-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter-align) — secondary reference; older page, so use the current CSSWG specification for exact syntax and status.
