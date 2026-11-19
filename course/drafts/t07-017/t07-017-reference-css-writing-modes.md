# CSS layout flexbox grid positioning and responsive design — Reference: CSS Writing Modes properties

# Scope and version

This lesson covers exactly five supplied properties: `direction`, `text-combine-upright`, `text-orientation`, `unicode-bidi`, and `writing-mode`. CSS Writing Modes Level 4 defines horizontal and vertical writing, inline direction, glyph orientation, and bidi integration. The published specification is a Candidate Recommendation; check current browser behavior for the target language/script and do not treat every editorial note or edge case as equally interoperable.

# How this group fits the mental model

Keep three questions separate:

1. **Which way do lines and blocks flow?** `writing-mode` sets block-flow direction, such as horizontal lines stacking top-to-bottom or vertical lines stacking right-to-left.
2. **Which way does inline content progress?** `direction` sets inline base direction (`ltr` or `rtl`) and affects direction-sensitive layout. The Unicode Bidirectional Algorithm then handles mixed-direction runs.
3. **How are glyphs oriented inside vertical lines?** `text-orientation` controls upright/sideways presentation; `text-combine-upright` can compose a short horizontal run into a single upright unit.

These properties are not text-rotation shortcuts. A true vertical writing mode changes logical axes, line progression, baselines, and the mapping of logical properties to physical sides. Inline direction and writing mode together define the writing mode used by the layout model.

# Supplied names explained

| Exact supplied property | Values and detailed role |
| --- | --- |
| `writing-mode` | Values are `horizontal-tb`, `vertical-rl`, `vertical-lr`, `sideways-rl`, and `sideways-lr`; initial `horizontal-tb`; inherited. It sets line orientation and block flow: horizontal lines with blocks progressing top-to-bottom; vertical lines with blocks progressing right-to-left or left-to-right. In `sideways-*`, the writing mode is vertical but the typographic mode is horizontal. It establishes how block/inline and logical sides map to physical dimensions. Do not confuse vertical writing (vertical lines) with a vertical block-flow direction (top-to-bottom). |
| `direction` | `ltr \| rtl`; sets inline base direction. It affects ordering of inline content in concert with Unicode bidi processing, table column ordering, horizontal overflow direction, and default text alignment. In HTML, use the semantic `dir` attribute to express content direction so it works without CSS. It does not select horizontal versus vertical writing. |
| `text-orientation` | `mixed \| upright \| sideways`; initial `mixed`; inherited. In vertical writing, `mixed` follows script-sensitive vertical typography, `upright` keeps horizontal-script characters upright, and `sideways` typesets all text sideways (90° clockwise). It does not rotate an entire box; it orients glyphs/runs within vertical lines. It has no effect in horizontal typographic modes. In the draft, `upright` also makes the used `direction` LTR for bidi reordering, a notable mixed-direction edge case. |
| `text-combine-upright` | `none \| all \| digits <integer>?`; initial `none`; inherited; applies to non-replaced inline elements. In vertical writing, `all` attempts to compose consecutive typographic character units horizontally into one upright unit. `digits N` applies to each maximal run of ASCII digits no longer than N; omitted N defaults to 2, and values outside 2–4 are invalid. The result is fitted into a 1em square. This is commonly used for short numerals in Japanese tate-chu-yoko. Only qualifying plain-text runs combine; box boundaries can affect eligibility. It has no effect in horizontal writing. |
| `unicode-bidi` | `normal \| embed \| isolate \| bidi-override \| isolate-override \| plaintext`; initial `normal`; not inherited. Non-normal values create bidi scopes or override/isolate behavior; `plaintext` uses the paragraph’s content to determine base direction. This is a low-level control, not a replacement for correct language/direction markup. The Writing Modes spec recommends HTML authors avoid using it and use HTML’s `dir`, `<bdi>`, or `<bdo>` semantics where appropriate. |

CSS-wide keywords are also accepted. `writing-mode`, `direction`, and `text-orientation` work together to establish the writing context. `unicode-bidi` affects how inline boxes participate in Unicode reordering; it does not set the `direction` property. `text-combine-upright` is inherited, while the others in this inventory are not.

# Cross-item comparison

| Need | Use | Do not substitute |
| --- | --- | --- |
| Set paragraph or component direction for Arabic/Hebrew or mixed-content context | HTML `dir="rtl"` / `dir="ltr"`; CSS `direction` when styling non-HTML content or a specific visual case | `unicode-bidi` override as a general RTL switch |
| Lay out vertical Japanese/Chinese/Mongolian content | Appropriate `writing-mode` plus script-appropriate `text-orientation` | Rotating a horizontal box with `transform` |
| Keep a short numeral upright inside vertical text | Narrowly scoped `text-combine-upright: digits 2` (or another required supported count) | Applying `all` broadly to arbitrary prose or long numbers |
| Isolate a mixed-direction inline token such as a user name or URL | Semantic HTML `<bdi>` or `dir="auto"` where suitable | Manual bidi overrides that can reorder surrounding text unexpectedly |

Logical properties (`margin-inline-start`, `inset-block-end`, `text-align: start`) follow the resulting axes; physical `left`, `top`, and similar values do not. For internationalized layouts, choose semantic direction first, then style in logical dimensions. Legacy SVG 1.1 values such as `lr`, `tb`, and `tb-rl` are obsolete outside legacy SVG attribute handling; use the modern CSS values in new stylesheets.

# Examples

This example uses the conventional CSS vertical mode for Japanese vertical text. The short date segment is scoped so only its digits combine. `writing-mode` also accepts sideways modes when the entire typographic flow should be rotated.

```html
<p class="vertical-note" lang="ja">
  <time datetime="2026-04-16" class="date">2026</time> 年の記録
</p>
```

```css
.vertical-note {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.date {
  text-combine-upright: digits 4;
}

.message {
  direction: rtl;
  text-align: start;
}
```

For HTML mixed-direction fragments, prefer markup such as `<bdi dir="auto">…</bdi>` so the fragment is isolated from surrounding text. Use CSS `unicode-bidi` only when its low-level behavior is specifically required and understood.

# Common mistakes

- Treating `direction: rtl` as equivalent to a vertical writing mode.
- Assuming vertical writing simply rotates Latin horizontal text; script-specific glyph orientation and line/block flow are separate.
- Using `direction` without correct language and semantic direction markup.
- Applying `unicode-bidi: bidi-override` to ordinary content; it can force visual ordering and harm reading/copying behavior.
- Using `unicode-bidi` instead of HTML `dir`, `<bdi>`, or `<bdo>` semantics.
- Applying `text-combine-upright: all` to long or arbitrary content; eligible run boundaries and compression rules matter.
- Assuming logical start/end always mean left/right or top/bottom.
- Applying `text-orientation` as if it affected glyphs in horizontal writing mode.

# Knowledge checks with answers

1. **Which property controls block-flow direction?** `writing-mode`.
2. **Which property controls inline base direction?** `direction`; in HTML, express document/content direction with `dir` where possible.
3. **What is the purpose of `text-orientation`?** It chooses glyph/run orientation in vertical writing, for example mixed script-sensitive orientation versus upright or sideways text.
4. **What does `text-combine-upright: digits 2` do?** It can compose a qualifying run of two ASCII digits horizontally into one upright unit in vertical writing.
5. **Should HTML authors usually set `unicode-bidi` directly?** No. The spec recommends HTML direction/isolation markup; CSS bidi controls are low-level and easy to misuse.
6. **Why can `margin-inline-start` map differently from `margin-left`?** Logical sides map through writing mode and direction; physical sides remain tied to the physical canvas.

# Sources

- [CSS Writing Modes Level 4](https://www.w3.org/TR/css-writing-modes-4/) — §§1–3, 5, 6, and 9: writing-mode values and axes, direction/bidi, glyph orientation, logical mapping, and text-combination grammar and run behavior.
- [HTML Standard](https://html.spec.whatwg.org/) — semantic `dir`, `<bdi>`, and `<bdo>` directionality handling.
- [Unicode Bidirectional Algorithm, UAX #9](https://www.unicode.org/reports/tr9/) — algorithm CSS uses for mixed-direction text.
