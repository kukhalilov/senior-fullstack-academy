<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Ruby properties

# Scope and version

This reference covers the three supplied properties: `ruby-align`, `ruby-overhang`, and `ruby-position`. It uses the CSS Ruby Annotation Layout Module Level 1 Editor’s Draft dated 1 May 2026 as the current specification text. That document is work in progress; its latest published version is a 31 December 2022 Working Draft, also not a Recommendation. MDN lists `ruby-align` and `ruby-position` as Baseline 2024, with some support variations for `ruby-position`; `ruby-overhang` is Limited availability. Property-level support does not guarantee that every value or detail is interoperable.

There is a documentation inconsistency worth knowing: the current CSSWG draft and MDN’s formal syntax list `ruby-overhang: auto | spaces`, while parts of MDN’s examples and prose still show the older `none` keyword. This lesson follows the current draft’s grammar; do not copy `none` from those stale examples. Test the actual browser and reading mode you support.

# How this group fits the mental model

Ruby is inline annotation text associated with base text, often used for pronunciation or a short reading in East Asian typography. HTML’s `<ruby>` and `<rt>` markup establishes the base/annotation relationship; `<rp>` can provide parentheses or other fallback text for older user agents that do not display ruby. CSS controls where the annotation appears, how its content is distributed across the base, and whether a long annotation can extend into neighboring inline space.

Think in three separate stages: **structure and pairing** determine which annotation belongs to which base; **position** chooses the annotation side or writing-mode-specific arrangement; **alignment and overhang** distribute the annotation inside its box and govern possible overlap beyond it. The CSS Ruby layout model also handles spanning annotations, nested levels, line breaking, bidirectional ordering, and line spacing. These properties refine that model; they do not replace semantic markup or determine the language’s reading.

# Supplied names explained

## `ruby-position`

**Definition.** Positions ruby annotation containers relative to their associated base. Current grammar: `[ alternate || [ over | under ] ] | inter-character`, plus CSS-wide keywords. The initial value is `alternate`; it applies to ruby annotation containers, is inherited, computes to the specified keyword, and is discrete for animation.

- `over` places annotation on the line-over side of the base; `under` places it on the line-under side. These are writing-mode-relative sides, not always physical top and bottom: in vertical Japanese text, over is shown at the right and under at the left.
- `alternate` alternates different interlinear annotation levels between over and under. At the first level, `alternate` alone or combined with `over` behaves as over; `alternate under` behaves as under. At later levels, it switches to the opposite side of the previous interlinear level. If all preceding annotation levels are inter-character, it behaves as a first level.
- `inter-character` is the special arrangement used for annotations such as Bopomofo beside horizontal Traditional Chinese characters. In a vertical ruby container it behaves like `over`; otherwise the annotation is placed to the right of the base and its annotation children get a computed `writing-mode` of `vertical-rl`.

Only the annotation side is being chosen here. `ruby-position` does not align annotation characters or choose which base text they annotate. Values such as historical `left`, `right`, and `inline` are not in the current Level 1 grammar.

## `ruby-align`

**Definition.** Distributes and aligns ruby content within its ruby box. Grammar: `start | center | space-between | space-around`, plus CSS-wide keywords. The initial value is `space-around`; it applies to ruby bases, ruby annotations, ruby base containers, and ruby annotation containers; it is inherited; the computed value is the specified keyword.

- `start` aligns ruby content with the box’s logical start edge.
- `center` centers it in the box.
- `space-between` distributes available space using the text-justification opportunities; if there are no opportunities, it centers the content.
- `space-around` behaves like `space-between` but adds an extra opportunity whose space is split half before and half after the ruby content.

The current draft’s default ruby annotation style uses `text-justify: ruby`, whose justification opportunities are sensitive to script: adjacent CJK characters can provide opportunities, whereas adjacent Latin or Bopomofo characters do not. Thus `space-between` and `space-around` do not promise that every pair of glyphs is spread uniformly. Normally `ruby-align` changes alignment of content, not its box size or position; for inter-character annotations it can also affect the alignment of the box itself. The property’s names were revised over time: older `auto`, `distribute-letter`, and `distribute-space` values were replaced by the current alignment and distribution keywords.

## `ruby-overhang`

**Definition.** Controls whether an annotation container longer than its corresponding base container may extend into adjacent inline content. Current grammar: `auto | spaces`, plus CSS-wide keywords. Initial value `auto`; applies to ruby annotation containers; inherited; computed value is the specified keyword.

- `auto` permits overhang when the user agent determines it can occur. The amount and conditions are user-agent decisions, and overhang must not cause collisions with neighboring content, annotation boxes, or the relevant base contents.
- `spaces` prohibits overlap with adjacent boxes except over permitted adjacent spaces. The current draft’s definition includes preserved whitespace, no-break spaces, other space separators, and specified allowances around fullwidth opening/closing punctuation and middle dots unless those spaces were trimmed.

This is not a guaranteed collision-avoidance or line-spacing system. An annotation can still make a line crowded, and implementation support is limited. The property controls possible inline overhang; it does not make neighboring content reflow as if the annotation were a block or guarantee that a particular engine uses the same overhang distance.

# Cross-item comparison

| Question | Property | What it controls | What it does not control |
| --- | --- | --- | --- |
| On which side/level does the reading appear? | `ruby-position` | Annotation placement, including alternate levels and inter-character mode | Base/annotation pairing or within-box alignment |
| How is the reading spread in its box? | `ruby-align` | Start, center, and justification-based distribution | The annotation side or whether it overlaps neighbors |
| May a long reading extend past adjacent inline boxes? | `ruby-overhang` | Whether and where inline overhang is permitted | A fixed overhang amount or general line-height/spacing |

The non-inventory property `ruby-merge` is related but distinct: it controls how annotation space is shared across multiple bases, such as compound readings. It does not replace semantic HTML grouping, and overhang between related ruby bases is also affected by merge behavior. Do not treat this lesson’s three names as an exhaustive list of every CSS Ruby property.

# Examples

```html
<p lang="ja">
  <ruby class="reading">漢<rp>（</rp><rt>かん</rt><rp>）</rp></ruby>
  <ruby class="reading">字<rp>（</rp><rt>じ</rt><rp>）</rp></ruby>
</p>
```

```css
/* The default is alternate; use explicit over when the desired side must be clear. */
ruby.reading {
  ruby-position: over;
  ruby-align: center;
  ruby-overhang: auto;
}

/* Spaced text between inline neighbors limits overhang into non-space text. */
ruby.strict-reading {
  ruby-overhang: spaces;
}

/* Traditional Chinese inter-character reading in horizontal writing. */
ruby.zhuyin {
  ruby-position: inter-character;
}
```

The `<rp>` contents are fallback punctuation for user agents that do not support ruby; they are not the reading itself. Use the `<rt>` annotation for that. Compare the result in horizontal and vertical writing, with both short and long annotations, adjacent ruby and non-ruby text, and the actual fonts and browser engines used by readers. Give lines enough `line-height` or surrounding block space: ruby annotation can overflow the ordinary line box when the line metrics do not leave room.

# Common mistakes

- Treating ruby as arbitrary superscript text. Use semantic `<ruby>` and `<rt>` markup so the association remains available to parsers and assistive technologies.
- Assuming `ruby-position: over` always means physically above. It means the writing mode’s line-over side.
- Assuming `alternate` means “use the opposite side” for every annotation. At the first level it defaults to over; alternation depends on earlier interlinear levels.
- Using `inter-character` as a synonym for `over`. In horizontal text it changes the annotation layout to a vertical inter-character form; in vertical text it behaves like over.
- Expecting `ruby-align: space-between` to put identical gaps between every glyph. Justification opportunities depend on script and `text-justify` behavior.
- Assuming the initial value of `ruby-align` is `center`; it is `space-around` in the current specification.
- Copying `ruby-overhang: none` from stale MDN example text. Current CSSWG and MDN formal syntax use `spaces` for the restrictive option.
- Treating `ruby-overhang: auto` as a fixed distance or as permission to collide annotations with adjacent text.
- Assuming these properties fix insufficient line-height or provide a general text collision engine.
- Confusing ruby layout with a pronunciation dictionary: CSS positions the supplied annotation but does not generate or validate the reading.
- Assuming Baseline status for two properties makes the limited-availability `ruby-overhang` equally supported.

# Knowledge checks with answers

1. **Which property places the annotation below a Japanese base in horizontal writing?** `ruby-position: under`; in vertical writing, “under” follows the writing mode’s line-under side rather than meaning physical bottom.
2. **How does `alternate` behave for the first annotation level?** It behaves like `over` unless combined with `under`; at later levels it alternates relative to the previous interlinear level.
3. **Why can Latin readings look centered with `ruby-align: space-between`?** The default ruby justification behavior does not create justification opportunities between adjacent Latin characters, so the content is centered when no opportunities exist.
4. **What is the current restrictive `ruby-overhang` value?** `spaces`. The old `none` value appears in some stale MDN examples but is absent from the current CSSWG grammar.
5. **Does `ruby-overhang: spaces` mean the annotation may never cross its ruby container edge?** It may overhang over permitted spaces; it must not overlap other adjacent boxes.
6. **Which HTML element contains the reading and which one supplies legacy fallback punctuation?** `<rt>` contains the ruby text; `<rp>` supplies fallback punctuation for user agents that lack ruby support.
7. **Which property decides how several bases share a spanning annotation?** `ruby-merge` is the related property for sharing annotation space; it is not one of the three names in this reference.

# Sources

- [CSS Ruby Annotation Layout Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-ruby-1/) — 1 May 2026 work in progress; property grammars and definitions, ruby box model, alignment and overhang behavior, layout interactions, and change history.
- [CSS Ruby Annotation Layout Module Level 1 published Working Draft](https://www.w3.org/TR/css-ruby-1/) — 31 December 2022 published snapshot; draft status and older version comparison.
- [HTML Living Standard: ruby, rt, and rp](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-ruby-element) — semantic structure and fallback use of `<rp>`.
- [MDN: `ruby-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-align) and [MDN: `ruby-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-position) — property summaries, formal definitions, and compatibility entry points.
- [MDN: `ruby-overhang`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-overhang) — compatibility information and an example of why examples must be checked against the formal syntax and current specification.
- [CSS Writing Modes Level 3](https://www.w3.org/TR/css-writing-modes-3/) — logical line directions and vertical-writing context.
- [CSS Text Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-text-4/) — text justification concepts used by ruby distribution.
