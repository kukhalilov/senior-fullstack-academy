<!-- GENERATED DRAFT: factual review replaces the automated draft; keep this file in drafts until the curriculum release process promotes it. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Text Decoration properties

# Scope and version

This reference audits all 14 names frozen in the lesson inventory: `text-decoration`, `text-decoration-color`, `text-decoration-inset`, `text-decoration-line`, `text-decoration-skip-ink`, `text-decoration-style`, `text-decoration-thickness`, `text-emphasis`, `text-emphasis-color`, `text-emphasis-position`, `text-emphasis-style`, `text-shadow`, `text-underline-offset`, and `text-underline-position`. It distinguishes the stable Level 3 model from additions in the CSS Text Decoration Level 4 Editor’s Draft. Level 4 is explicitly a work in progress; its `text-decoration-inset` definition is draft material, not a promise of interoperable browser support. The captured MDN inventory had no Baseline label for `text-decoration-inset`; check current browser data before using it.

The values below give each property’s property-specific grammar and initial value. Unless noted, CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, and `revert-layer`) are also accepted. “Applies to all elements” is the specification’s applicability rule; the visual effect still requires relevant text and boxes. A property’s existence in a draft or reference page does not establish implementation support.

# How this group fits the mental model

Typesetting first shapes text into glyphs and lines. Text decoration then paints lines, emphasis marks, and shadows around that rendered text. This is why a decoration is not equivalent to a border, background, or extra DOM element: it follows text fragments and writing modes, and some decorations originate on one box while being painted across descendants.

There are two different descendant mechanisms. Most decoration longhands do not inherit. A line such as an ancestor’s underline is instead propagated through the box tree and keeps the originating element’s color, style, and thickness across descendants. A child cannot cancel that ancestor’s line by declaring `text-decoration: none`; it can originate its own lines. By contrast, `text-shadow` and emphasis properties are inherited values. Keep this distinction in mind when nested markup looks surprising.

The stable Level 3 set provides line selection and appearance, underline placement, emphasis marks, and text shadows. The Level 4 draft adds more controls, including line thickness, underline offset, endpoint inset, and a rework of skip controls. Do not treat every Level 4 draft section as settled: the draft itself marks some skip-property text as rough or not vetted.

# Supplied names explained

## Line decorations

### `text-decoration-line`

**Level 3 grammar:** `none | [ underline || overline || line-through || blink ]`. **Level 4 Editor’s Draft additionally lists:** `spelling-error | grammar-error`. **Initial:** `none`. **Applies:** all elements. **Inherited:** no; decorations it originates are propagated to eligible descendants.

Selects which line decoration(s) the element originates. `underline`, `overline`, and `line-through` can be combined; `none` neither creates nor suppresses an ancestor’s propagated decoration. `blink` is retained by the spec grammar, but conforming user agents may simply not blink, and the spec deprecates it in favor of CSS Animations.

The `spelling-error` and `grammar-error` values are Level 4 draft additions, not a portable way to ask every browser to underline arbitrary author-selected text. They request UA-defined, platform-dependent indicators; the UA controls their appearance and may disregard author color/style/position controls for them. These are not substitutes for semantic spell-check state or accessible error messages.

Line decorations apply to non-replaced inline boxes. They can cross inline descendants but are not propagated into out-of-flow descendants or the contents of atomic inline-level boxes such as inline-blocks. A descendant’s text color does not recolor an ancestor-originated underline. Line decorations are propagated through the box tree, not inherited as a CSS value; `display: contents` therefore has a special limitation described by the spec.

### `text-decoration-color`

**Grammar:** `<color>`. **Initial:** `currentcolor`. **Applies:** all elements. **Inherited:** no.

Sets the color of lines originating from this element. Because the decoration retains its originating box, assigning a different `color` to a nested span does not necessarily change an ancestor’s underline. Use an explicit decoration color when the line must differ from the originating text color.

### `text-decoration-style`

**Grammar:** `solid | double | dotted | dashed | wavy`. **Initial:** `solid`. **Applies:** all elements. **Inherited:** no.

Chooses the drawing style of underlines, overlines, and line-throughs originating from the element. Like color, the value affects all decorations originating there, even when they cross descendants. “Wavy” is a line shape, not an animation.

### `text-decoration-thickness`

**Grammar:** `auto | from-font | <length-percentage> | <line-width>`. **Initial:** `auto`. **Applies:** all elements. **Inherited:** no.

Sets the stroke thickness of lines originating from the element. `auto` lets the UA choose an appropriate thickness and may use font metrics. `from-font` uses the first available font’s preferred underline-width metric when present, otherwise behaves as `auto`. A length is a fixed thickness; a percentage is a percentage of the used `font-size`. The `<line-width>` alternative also accepts `thin`, `medium`, and `thick` (as well as a length). The UA should round the rendered width to a device-pixel value and ensure at least one device pixel. The Level 4 draft notes that line thickness is not fully defined by CSS in every detail, so rendering can vary.

### `text-decoration` shorthand

**Grammar:** `<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>`. **Initials:** the initial values of those four longhands. **Applies/inheritance:** as the longhands.

One declaration sets line, thickness, style, and color; omitted components reset to their initial values. The shorthand does **not** reset `text-underline-position`, `text-underline-offset`, `text-decoration-inset`, or `text-decoration-skip-ink`. Prefer it for a complete line style when a later declaration should not accidentally preserve an earlier color/style/thickness. Example: `text-decoration: underline 0.12em wavy tomato;`.

### `text-decoration-skip-ink`

**Grammar:** `auto | none | all`. **Initial:** `auto`. **Applies:** all elements. **Inherited:** yes.

Controls whether underlines and overlines are interrupted where they cross glyph ink. `auto` lets the UA decide and should account for script; `all` requires skipping glyph ink plus a small clearance around it; `none` requires continuous lines. It does not interrupt line-throughs. It affects decorations originating from this element, including across descendants, and is not a constituent of `text-decoration`.

The Level 4 draft places this in a broader proposed family of skip controls and says parts of that section are rough and not yet vetted. Treat the three-value `text-decoration-skip-ink` property as the supplied, established name; do not claim that the draft’s separate `text-decoration-skip`, `-self`, `-box`, or `-spaces` properties are equivalent stable replacements. Script and font matter: automatically skipping ink can leave ideographic underlines fragmented, so test representative multilingual content.

### `text-decoration-inset` — Level 4 draft

**Draft grammar:** `<length-percentage>{1,2} | auto`. **Draft initial:** `0`. **Applies:** all elements. **Inherited:** no.

Adjusts the start and end of line decorations originating on the element. A positive value moves an endpoint inward and trims the line; a negative value extends it outward. One value applies to both ends; two values set start then end. Percentages use the decorating box’s total inline size with `box-decoration-break: slice`, or each fragment’s inline size with `clone`. It does not adjust an ancestor’s decoration. The draft’s `auto` value is intended to keep adjacent identical underlines from visually merging, which is useful in scripts where underlining can serve as punctuation.

This property appears in the Level 4 Editor’s Draft, whose status warns it is discussion material that may change. Its inclusion here is for recognition and informed evaluation, not as a recommendation to rely on it in production without checking current implementation data and providing a fallback.

## Underline placement

### `text-underline-position`

**Level 3 grammar:** `auto | under || [ left | right ]`. **Level 4 Editor’s Draft adds:** `from-font`. **Initial:** `auto`. **Applies:** all elements. **Inherited:** yes.

Positions underlines originating from the element; it also defines the zero position from which `text-underline-offset` is measured. `auto` delegates placement to the UA, which must place it at or below the alphabetic baseline. `from-font` (Level 4 draft) requests the first available font’s preferred underline offset and falls back to `auto`; `under` places it under the text content, usually avoiding descenders but not guaranteeing no collision. `left` and `right` choose a side in vertical typographic modes and behave as `auto` in horizontal modes. If a side is given alone, `auto` is implied. Language and writing direction matter; avoid forcing Western baseline assumptions on CJK or vertical text. This property is inherited independently and is not reset by `text-decoration`.

### `text-underline-offset`

**Grammar:** `auto | <length-percentage>`. **Initial:** `auto`. **Applies:** all elements. **Inherited:** yes.

Moves underlines originating from the element away from their zero position. `auto` lets the UA choose; if `text-underline-position: from-font` has a usable font metric, the offset must be zero. Positive values move outward from the text; negative values move inward. Lengths inherit as fixed values, while percentages resolve against used `font-size` and remain relative as they inherit. It affects the element’s own underline, not an underline originating on an ancestor, and does not change line box layout. A large offset can still collide with adjacent lines or other content visually.

## Emphasis marks

### `text-emphasis-style`

**Grammar:** `none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>`. **Initial:** `none`. **Applies:** text. **Inherited:** yes.

Chooses an emphasis mark for each typographic character unit where marks are drawn. A shape without a fill keyword defaults to `filled`; `filled` or `open` alone chooses `circle` in horizontal typographic modes and `sesame` in vertical modes. Shape names select dot, circle, double circle, triangle, or sesame. A `<string>` supplies a custom mark; authors should use no more than one character, and UAs may truncate or ignore longer strings. Font coverage can affect glyph appearance; UAs may synthesize or choose a font for marks. In vertical typographic modes, marks remain upright.

Level 3 excludes Unicode separators, most punctuation, and control/unassigned characters from marks, with exceptions; do not simplify that rule to “every character gets a mark” or “all punctuation is skipped.” Level 4 proposes a separately configurable skip property, but that section is explicitly brainstorming and not yet settled.

### `text-emphasis-color`

**Grammar:** `<color>`. **Initial:** `currentcolor`. **Applies:** text. **Inherited:** yes.

Sets the foreground color of emphasis marks. `currentcolor` resolves from the element’s inherited/current text color, so marks track text color unless this property is explicitly set.

### `text-emphasis-position`

**Grammar:** `[ over | under ] && [ right | left ]?`. **Initial:** `over right`. **Applies:** text. **Inherited:** yes.

Positions marks relative to text. `over` and `under` select the side appropriate to the writing system; `right` or `left` selects the side for vertical text and is not a physical-side instruction in horizontal text. CSS does not select a culturally correct placement based solely on language, so choose it using the content’s writing convention. Emphasis marks may affect line layout when extra room is needed; they can interact with ruby annotations.

### `text-emphasis` shorthand

**Grammar:** `<'text-emphasis-style'> || <'text-emphasis-color'>`. **Initial/applicability/inheritance:** as its longhands.

Sets `text-emphasis-style` and `text-emphasis-color` together; omitted components reset to their initial values. It deliberately does **not** reset `text-emphasis-position`, which inherits independently so language-appropriate placement can remain consistent while shape or color changes. Example: `text-emphasis: filled sesame #b42318;`.

Emphasis marks are typographic notation, not semantic emphasis and not a replacement for `<em>`, `<strong>`, ruby readings, or an accessible explanation. Do not make them the sole way to communicate importance.

## Shadows

### `text-shadow`

**Level 3 grammar:** `none | [ <color>? && [ <length>{2} <length [0,∞]>? ] ] #`. **Initial:** `none`. **Applies:** text. **Inherited:** yes.

Adds one or more comma-separated shadows to text and its text decorations. Each shadow requires horizontal and vertical `<length>` offsets, optionally adds a nonnegative blur length, and may include a color in either order with the lengths. The first listed shadow is painted above later shadows. It does not affect layout or enlarge the scrollable overflow region; visual ink can extend beyond the text. Unlike `box-shadow`, the traditional outer text shadow follows glyph outlines rather than a rectangular element box. A shadow is not a reliable focus indicator or a substitute for sufficient text contrast.

The current Level 4 Editor’s Draft shows additional text-shadow controls such as inset and spread, but these are draft extensions and are not included in the stable Level 3 grammar stated above. Do not copy those newer tokens into production CSS without checking current engine support and the latest spec status.

# Cross-item comparison

| Need | Use | Important boundary |
| --- | --- | --- |
| Choose underline/overline/strike-through | `text-decoration-line` or `text-decoration` | A child cannot cancel an ancestor-originated propagated line with `none`. |
| Style the line | `text-decoration-color`, `-style`, `-thickness` | They configure lines from their decorating box; they do not behave like inherited text color/style. |
| Move or trim the line | `text-underline-position`, `text-underline-offset`, draft `text-decoration-inset` | Position/offset control underline location; inset adjusts endpoints and remains draft-only. |
| Keep underline from crossing glyphs | `text-decoration-skip-ink` | Only overlines and underlines are ink-skipped; line-through stays continuous. |
| Add script-aware typographic marks | `text-emphasis-*` | Mark style/color shorthand does not set position; marks are not semantic markup. |
| Add a displaced/blurred copy of glyphs | `text-shadow` | Inherited visual paint; no layout space; Level 4 inset/spread additions remain draft. |

Decorations may extend through inline descendants and split across lines; atomic inline content and out-of-flow descendants form boundaries. `box-decoration-break` changes how fragmented decorating boxes handle endpoint insets in the Level 4 draft. Test with nested inline markup, superscripts/subscripts, mixed font sizes, RTL and vertical writing, CJK glyphs, ruby, and line wrapping rather than judging only a single Latin word.

# Examples

```css
/* A link remains identifiable without color alone; keyboard focus stays visible. */
a {
  color: #075985;
  text-decoration: underline 0.08em solid currentColor;
  text-underline-offset: 0.15em;
}
a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

/* Position can be localized for the content's writing system. */
:lang(ja), :lang(ko) { text-underline-position: under right; }
:lang(zh) { text-underline-position: under left; }

/* Traditional East Asian emphasis marks: position remains independently set. */
.important-cjk {
  text-emphasis: filled sesame #9f1239;
  text-emphasis-position: over right;
}

/* Multiple shadows are layered in listed order; keep the text itself readable. */
.decorative-title {
  text-shadow: 0 1px 0 white, 0 3px 8px rgb(0 0 0 / 35%);
}
```

The examples use stable, broadly established declarations. The `text-decoration-inset` draft property is intentionally omitted; if evaluating it, isolate it behind `@supports (text-decoration-inset: 1px)` and retain a usable baseline appearance.

# Common mistakes

- Treating decoration as inherited text styling. Line decorations propagate through boxes, while most line longhands are non-inherited; `text-shadow` and emphasis values are inherited.
- Expecting `text-decoration: none` on a child to remove an ancestor’s underline. It only means the child does not originate another line.
- Assuming a descendant’s `color` or `text-decoration-color` recolors a line originating on an ancestor.
- Assuming `text-decoration` resets underline placement, skip-ink, or inset. Its defined components are line, thickness, style, and color.
- Using `text-decoration-skip-ink: all` without checking script-specific results, or expecting it to break a line-through.
- Treating `text-decoration-inset` or Level 4 inset/spread text shadows as mature interoperable features merely because an Editor’s Draft defines syntax.
- Hard-coding underline placement without considering writing mode, language, font metrics, superscripts, descenders, or line spacing.
- Replacing semantic markup or accessible error reporting with visual emphasis, wavy lines, or shadows alone.

# Knowledge checks with answers

1. **Why does a nested span remain underlined after it sets `text-decoration: none`?** The ancestor originates a decoration that propagates through eligible descendant boxes; `none` does not suppress that ancestor decoration.
2. **Which four longhands does `text-decoration` reset, and what does it leave alone?** It sets line, thickness, style, and color, resetting omitted components to their initials. It does not reset underline position/offset, skip-ink, or draft inset.
3. **What is the inheritance difference between line decoration and `text-shadow`?** Line decorations propagate through the box tree from a decorating box; `text-shadow` is an inherited property value.
4. **What does `text-emphasis` omit?** It sets style and color, but not inherited `text-emphasis-position`.
5. **Does ink skipping break a line-through?** No. `text-decoration-skip-ink` applies to underlines and overlines; line-through remains continuous.
6. **Is `text-decoration-inset` safe to assume in browsers?** No. It is defined in a Level 4 Editor’s Draft and support must be verified independently.

# Sources

- [CSS Text Decoration Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-text-decor-3/) — stable Level 3 properties, decoration propagation, emphasis, shadow and painting behavior.
- [CSS Text Decoration Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-text-decor-4/) — current draft additions and explicit draft status; used cautiously for inset, thickness/offset details, and skip-ink behavior.
- [CSS Backgrounds and Borders Module Level 3](https://drafts.csswg.org/css-backgrounds-3/) — definition of `<line-width>` keywords reused by the text-decoration-thickness grammar.
- [Published CSS Text Decoration Level 3 Candidate Recommendation](https://www.w3.org/TR/css-text-decor-3/) — published status/historical cross-check.
- [MDN: text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration), [text-decoration-line](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-line), [text-decoration-color](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-color), [text-decoration-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-style), and [text-decoration-thickness](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-thickness) — author-facing property descriptions and support metadata.
- [MDN: text-decoration-skip-ink](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-skip-ink), [text-decoration-inset](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-inset), [text-underline-position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-underline-position), and [text-underline-offset](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-underline-offset) — author-facing details and support metadata.
- [MDN: text-emphasis](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis), [text-emphasis-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-style), [text-emphasis-color](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-color), [text-emphasis-position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-emphasis-position), and [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-shadow) — author-facing descriptions and support metadata.
