# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Ruby ruby-merge properties

## Scope and version

This lesson covers the one supplied name, `ruby-merge`, in the CSS Ruby family. It distinguishes the current CSSWG Editor’s Draft from the latest published Working Draft and from browser implementation status. Sources were checked on 2026-11-20.

## How this group fits the mental model

Ruby is short text attached alongside base text. In Japanese, furigana over a kanji word is a familiar example; ruby can also provide pronunciation or a brief annotation in other writing systems. The base and annotation are separate content with a relationship between them. HTML `<ruby>` and `<rt>` express that content relationship; CSS controls how the paired content is laid out.

A useful mental picture is a sequence of columns. Each column pairs a base unit with its annotation. A longer pronunciation may need more inline width than its base character. With independent columns, that extra width can push neighboring bases apart. For a compound word, readers may instead expect the annotation to be treated as a group across the word. `ruby-merge` describes how the annotation container shares that space.

## Supplied names explained

### `ruby-merge`: exact property definition

The current CSS Ruby Annotation Layout Module Level 1 Editor’s Draft (1 May 2026) defines:

```css
ruby-merge: separate | merge | auto;
```

Its initial value is `separate`; it applies to interlinear ruby annotation containers; it inherits; percentages do not apply; the computed value is the specified keyword; and animation is by computed value type. These are specification rules, not proof that a browser implements the property. The latest published CSS Ruby Level 1 document is the 2022-12-31 Working Draft; it lists the 2021-12-02 document as a previous version. The current editor’s draft contains ongoing work. Treat the editor’s draft as changeable.

### The three behaviors

### `separate`

Each ruby column gets enough inline space for the wider of its base and annotation. A long reading can therefore widen its own column and affect the spacing of nearby base text. This is the initial behavior and is useful when each annotation should stay aligned with its own base unit.

### `merge`

Within one ruby segment on one line, annotation boxes are concatenated and laid out as one anonymous annotation box spanning their associated base boxes. This resembles group ruby: the annotation is aligned across the compound base rather than forcing every short annotation to occupy only its own base column. The visual alignment may place annotation characters over a neighboring base; that is part of the shared-space model.

Line breaking still matters. If the associated bases split across lines, annotations remain with their respective bases; the result then behaves like separate ruby for the split portion. This does not rewrite the HTML pairing or turn the annotations into a single text node.

### `auto`

The user agent may choose how to distribute annotation space. The intended result is the same as `separate` when every annotation fits over its own base; if some annotation is wider, the browser may share space to avoid inserting extra spacing between bases. Exact distribution is deliberately left to the implementation, so do not expect pixel-identical output between engines.

## Cross-item comparison

`ruby-align` controls distribution/alignment inside ruby boxes, `ruby-position` controls block-axis placement, and `ruby-merge` controls how annotations share inline space across related bases. They solve different layout questions.

## Choosing the behavior

Use `separate` when per-character alignment is the priority and added base spacing is acceptable. Consider `merge` when annotations belong visually to a compound word and should read as one group. `auto` expresses that preference without prescribing the browser’s exact overlap/alignment algorithm. These choices affect presentation; they do not establish the semantic meaning or correctness of the annotation.

`ruby-align` answers a different question: how base and annotation content is distributed/aligned inside the relevant ruby boxes. With merged annotations, alignment is handled at the annotation container; individual annotation-level alignment no longer controls that merged run. `ruby-position` controls placement on the block axis (for example, over or under horizontal text). Neither property substitutes for `ruby-merge`.

## Examples

A minimal illustration, where supported:

```html
<ruby class="separate">無<rt>む</rt>常<rt>じょう</rt></ruby>
<ruby class="merged">無<rt>む</rt>常<rt>じょう</rt></ruby>
<ruby class="automatic">無<rt>む</rt>常<rt>じょう</rt></ruby>
```

```css
.separate { ruby-merge: separate; } /* independent columns */
.merged { ruby-merge: merge; } /* share annotation space on a line */
.automatic { ruby-merge: auto; } /* let the user agent choose */
```

The three elements show the same base/annotation content under each keyword. Test with actual language content, font metrics, writing mode, and line width. A style that looks right on one short word can behave differently when it wraps.

## Markup, whitespace, and accessibility boundaries

Use HTML ruby markup to express the base/annotation pairing. The CSS property changes layout, not the content model. The CSS Ruby spec defines pairing and ruby segment construction, including how annotations correspond to bases; ambiguous or unintended pairing cannot be repaired merely by choosing `merge`. Provide meaningful language metadata where useful and ensure pronunciation text is correct. When annotation meaning is essential, test the reading experience with the assistive technologies used by your audience; CSS does not define how each screen reader announces ruby.

Whitespace and line breaks can change ruby segmentation and therefore which annotations can share a line. In particular, `merge` operates within a ruby segment and its cross-line behavior preserves association with the corresponding bases. When the behavior matters, inspect the DOM and test the exact wrapping case instead of assuming that visually adjacent `<ruby>` elements will merge together.

## Support and production use

MDN’s CSS ruby layout guide currently says that no browsers support `ruby-merge` (and likewise identifies `ruby-overhang` as unsupported). The property is therefore not a production-safe cross-browser control today. It may be ignored, leaving browser default ruby layout. If the visual grouping is essential, choose a tested markup/layout approach with an acceptable fallback and verify the target browsers and assistive technology. Recheck compatibility data before shipping because support can change independently of specification text.

Do not confuse “defined in a specification” with “implemented,” “Baseline,” or “interoperable.” The spec explains the intended model; current support data determines whether a target browser can use it.

## Common mistakes

- Writing `collapse` or `group` as a value. The current grammar is exactly `separate | merge | auto`.
- Assuming `merge` permanently combines ruby bases and annotation text in the DOM.
- Assuming annotations can drift away from their associated bases when a line break splits the ruby segment.
- Treating `auto` as a specified deterministic algorithm. It intentionally leaves the choice to the user agent.
- Expecting `ruby-align` or `ruby-position` to control the same dimension as `ruby-merge`.
- Depending on this property without a fallback despite current browser support being absent.

## Knowledge checks with answers

1. **What is the initial value?** `separate`.
2. **What is the practical distinction between `merge` and `auto`?** `merge` requests the grouped annotation layout within a line; `auto` lets the user agent decide, with separate behavior when all annotations fit and shared space permitted when they do not.
3. **What happens if merged ruby wraps across lines?** Annotations remain with their corresponding bases; the split portion behaves like separate ruby.
4. **Does `ruby-merge` change what text is paired with what base?** No. Pairing is part of the ruby content model; this property controls annotation layout.
5. **Can this be relied on across current major browsers?** No. MDN currently reports no browser support.

## Sources

- [CSS Ruby Annotation Layout Module Level 1 Editor’s Draft, §4.2](https://drafts.csswg.org/css-ruby-1/#propdef-ruby-merge) (property grammar and descriptor table)
- [CSS Ruby Annotation Layout Module Level 1 Editor’s Draft, §3.1.1](https://drafts.csswg.org/css-ruby-1/#inline-axis-interlinear-layout) (inline-axis layout)
- [CSS Ruby Annotation Layout Module Level 1 published Working Draft](https://www.w3.org/TR/css-ruby-1/) (published specification status and layout model)
- [CSS Ruby Annotation Layout Module Level 1, 2022-12-31 Working Draft](https://www.w3.org/TR/2022/WD-css-ruby-1-20221231/) (dated published version cited by the current TR page)
- [MDN: CSS ruby layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Ruby_layout) (current browser-support statement)
- [W3C International: Ruby styling](https://www.w3.org/International/articles/ruby/styling.en.html) (jukugo ruby context and engine support discussion)
- [HTML Standard: ruby element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-ruby-element) (HTML ruby semantics)
