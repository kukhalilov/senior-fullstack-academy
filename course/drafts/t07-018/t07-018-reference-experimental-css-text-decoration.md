# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS text-decoration-skip properties

## Scope and version

This lesson covers the one supplied property, `text-decoration-skip`. Its history and current draft status need separating: CSS Text Decoration Level 3 deferred it for major changes; the current Level 4 Editor’s Draft proposes a new `none | auto` shorthand and related longhands, but calls that section a rough draft not yet vetted by the CSS Working Group. The latest published Level 4 Working Draft is dated 2022-05-04; it lists the 2020-05-06 draft as a previous version. The current Editor’s Draft is dated 2026-08-17. MDN marks the property deprecated. Sources checked on 2026-11-20.

## How this group fits the mental model

A text decoration is a line such as an underline, overline, or line-through. The line can originate on an ancestor and span or propagate across descendants. “Skipping” controls where such a line has gaps: around glyph ink, spaces, atomic inline objects, or parts of a descendant’s box. These are separate layout decisions.

The name `text-decoration-skip` has appeared in different forms. Older WebKit-oriented implementations accepted values such as `objects`, `spaces`, and `edges`; modern CSSWG work split the behavior into separate controls so each kind of skipping could cascade independently. The same property name now appears in the Level 4 draft as a proposed shorthand with different syntax. Treat these histories as distinct; do not assume that the new draft grammar describes an old prefixed implementation.

## Supplied names explained

This inventory contains one property: `text-decoration-skip`.

### Current Level 4 draft model

The 2026-08-17 CSS Text Decoration Level 4 Editor’s Draft gives this shorthand grammar:

```css
text-decoration-skip: none | auto;
```

It lists all elements as applicable, inheritance as yes, discrete animation, and computed/initial values as depending on the individual subproperties. `none` is intended to set all subproperties to `none`; `auto` is intended to set them to their initial values.

The section explicitly says it is a rough draft that has not yet been vetted by CSSWG. It even raises an unresolved web-compatibility question about what `none` should mean. This is an evolving proposal, not a stable declaration authors should ship. The values in the older MDN syntax examples (`objects`, `spaces`, `edges`, etc.) are not part of this current shorthand grammar.

### Proposed subproperties and what they control

The same Level 4 draft separates the behavior into these controls. Their definitions and edge cases are also draft material.

| Draft property | Main purpose | Draft values and behavior |
| --- | --- | --- |
| `text-decoration-skip-self` | Whether an element is skipped by, or receives, decorations originating from ancestors | `auto`, `skip-all`, `skip-underline`, `skip-overline`, `skip-line-through`, or `no-skip`. `auto` skips an atomic inline’s margin box; `skip-all` skips unconditionally; line-specific values skip only that decoration; `no-skip` lets the ancestor decoration cross an atomic inline or propagate normally through a non-atomic one. Initial `auto`; not inherited. |
| `text-decoration-skip-box` | Whether ancestor decorations cross a descendant’s box edges | `none` or `all`. `all` skips the descendant’s margin, border, and padding and draws only through its content area. It affects ancestor decorations only. Initial `none`; inherited. |
| `text-decoration-skip-spaces` | Whether decoration lines skip spaces | `none`, `all`, `start`, `end`, or `start end`/either component. `all` skips spacers, word separators, and adjacent letter/word spacing; `start` and `end` do this at line edges. The draft defines a spacer as a typographic character unit in Unicode General Category Zs except U+202F NARROW NO-BREAK SPACE. Initial `start end`; inherited. |
| `text-decoration-skip-ink` | Whether underlines and overlines break around glyph ink | `auto`, `none`, or `all`. `all` requires gaps around glyph ink; `none` keeps the lines continuous; `auto` allows a user agent to choose and asks it to consider script. Line-throughs remain continuous. Initial `auto`; inherited. |

CSSWG notes unresolved details here too: whether the spaces subproperty’s initial value should be `none` for web compatibility, and how ink-skipping should handle scripts. The shorthand’s `none` mapping is also underdefined: it says to set every subproperty to `none`, but `text-decoration-skip-self` has no `none` value (it offers `no-skip` instead). Keep these open issues visible rather than treating the table as a finalized interoperable API.

### Legacy values and compatibility history

MDN’s older syntax/examples for the deprecated property show the legacy values `none`, `objects`, `spaces`, `edges`, and `box-decoration`, plus `leading-spaces` and `trailing-spaces`; they may be combined in that legacy model. The terms describe skipping atomic inline objects, whitespace, decoration endpoints, or an element’s box decoration. The exact behavior depended on the implementation/version. The MDN page’s syntax examples do not match its own formal syntax section, which currently reflects the Level 4 `none | auto` grammar.

MDN Browser Compatibility Data records:
- Chrome supported the property from 57 through 63, but only the deprecated `ink` value; support was removed in Chrome 64.
- Safari has an unprefixed support record from 12.1 and a `-webkit-`-prefixed record from 7.
- Firefox is recorded as unsupported.
- The property is marked deprecated in the compatibility data.

These records do not make the old value set equivalent to the new draft shorthand. When maintaining an existing stylesheet, check the specific browser/version and prefix behavior instead of inferring semantics from the property name.

## Examples

### Practical replacement

For the common goal of keeping an underline from colliding with descending glyphs, use the focused `text-decoration-skip-ink` property rather than the deprecated umbrella property:

```css
a {
  text-decoration: underline;
  text-decoration-skip-ink: auto;
}
```

Its values are `auto`, `none`, and `all`, and MDN marks it Baseline widely available since March 2022. The commonly used `auto` lets the user agent skip ink where appropriate; `none` keeps underlines and overlines continuous; `all` requests skipping for all scripts. It does not control spaces, atomic objects, or box edges.

The following is only an illustration of the current Level 4 proposal; it is not recommended production CSS:

```css
/* Draft shorthand: 'auto' delegates to the proposed subproperty initials. */
.example {
  text-decoration-skip: auto;
}

/* More focused proposed controls; still draft and compatibility-sensitive. */
.example > img {
  text-decoration-skip-self: auto;
}

.example > span {
  text-decoration-skip-spaces: all;
}
```

A support query cannot prove that an implementation matches the evolving algorithm or behaves consistently across scripts. Test the actual decoration, inline descendants, whitespace, wrapping, and writing systems. Preserve understandable content and readable links if a visual line changes.

## Cross-item comparison

- `text-decoration-skip-ink` is the focused, widely supported control for ink gaps around underlines and overlines.
- `text-decoration-skip-self`, `text-decoration-skip-box`, and `text-decoration-skip-spaces` are separate proposed controls for ancestor propagation/atomic inlines, descendant box edges, and whitespace.
- `text-decoration-inset` adjusts line endpoints; it does not decide whether glyphs or spaces are skipped.
- `text-underline-position` and `text-underline-offset` move an underline; they do not disable or enable skipping.
- `text-decoration-skip`’s historical WebKit behavior and current Level 4 draft shorthand are not interchangeable. Use the specific supported feature that matches the goal.

## Common mistakes

- Copying the MDN legacy syntax values and assuming they are the current Level 4 grammar.
- Treating the draft shorthand as finalized because it has a property definition table.
- Assuming old Safari/WebKit or Chrome support implies the current subproperties and algorithms.
- Using `text-decoration-skip-ink` to control spaces, inline objects, or box edges.
- Forgetting that ink skipping affects underlines/overlines, while line-throughs stay continuous.
- Assuming `auto` is identical across scripts and browsers; the draft discusses different behavior for CJK text because ink-skipping can leave only fragments of an underline.
- Relying on a deprecated property when a focused replacement exists.

## Knowledge checks with answers

1. **What grammar does the current CSSWG Level 4 draft give the shorthand?** `none | auto`.
2. **Is that shorthand ready to rely on?** No. The section calls itself a rough draft not vetted by CSSWG and includes unresolved web-compatibility questions.
3. **What does `text-decoration-skip-ink` control?** Gaps where underlines or overlines cross glyph ink; it does not control spaces, objects, or box edges.
4. **What happened to the older multi-keyword behavior?** It survives in legacy/prefixed compatibility documentation, while standards work split the different effects into specific properties.
5. **Why must you check browser/version behavior?** The support records differ by engine, prefix, removed versions, and even supported value; old implementation support does not establish support for the current draft API.

## Sources

- [CSS Text Decoration Level 4 Editor’s Draft, §2.10](https://drafts.csswg.org/css-text-decor-4/#text-decoration-skipping) (current rough-draft shorthand and subproperties)
- [CSS Text Decoration Level 3 Editor’s Draft, changes since 2013 CR](https://drafts.csswg.org/css-text-decor-3/#changes-2013) (deferral to Level 4 and ink-skipping change)
- [CSS Text Decoration Level 4, published Working Draft](https://www.w3.org/TR/css-text-decor-4/) (published maturity/version context)
- [CSS Text Decoration Level 4, 2022-05-04 Working Draft](https://www.w3.org/TR/2022/WD-css-text-decor-4-20220504/) (dated published version)
- [MDN: `text-decoration-skip`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-skip) (deprecated status and legacy syntax examples)
- [MDN Browser Compatibility Data: `text-decoration-skip`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-decoration-skip.json) (engine, version, prefix, and deprecated status records)
- [MDN: `text-decoration-skip-ink`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-skip-ink) (focused replacement behavior/support)
