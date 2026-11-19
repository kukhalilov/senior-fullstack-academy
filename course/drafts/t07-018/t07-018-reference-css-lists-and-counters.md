# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Lists and Counters properties

## Scope and version

This reference explains the seven assigned properties: `counter-increment`, `counter-reset`, `counter-set`, `list-style`, `list-style-image`, `list-style-position`, and `list-style-type`. The current [CSS Lists and Counters Level 3 Editor’s Draft](https://drafts.csswg.org/css-lists-3/) was dated 28 April 2026 when checked. It is work in progress; this lesson reports the draft's current definitions and explicitly distinguishes them from established native list behavior. CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, and `revert-layer`) are accepted by all seven properties.

Counter-style names and formatting algorithms belong to the related [CSS Counter Styles Level 3](https://drafts.csswg.org/css-counter-styles-3/) module. The `::marker` pseudo-element and `content` are adjacent interfaces, not extra properties in this assigned inventory. Do not infer browser support for every draft detail from a spec definition.

## How this group fits the mental model

Start with semantic HTML lists. `<ol>`, `<ul>`, and `<li>` express ordered or unordered list structure; browsers supply useful marker and numbering behavior. CSS then styles those markers. A list item is any element whose `display` is `list-item`; it generates a `::marker` pseudo-element and participates in the implicit `list-item` counter. A paragraph can be made a list item, but it does not thereby gain HTML list semantics for assistive technology or document structure.

Use the `list-style-*` family to select the marker image or text style and place it inside or outside the item’s principal content. Use CSS counters when the numbering is a presentation feature that the HTML list model cannot express. A counter is a named, scoped numeric tracker: `counter-reset` creates it, `counter-increment` changes it by a delta, `counter-set` assigns its value, and `counter()` or `counters()` outputs it. Counter state has no visible effect until output by generated content or a marker.

Keep essential numbering and hierarchy understandable when CSS is disabled or unavailable. Generated marker text can be visually customized, but it is not a substitute for meaningful list structure or explicit content when that information is essential.

## Supplied names explained

The property metadata below follows the current Lists Level 3 draft. Counter properties interpolate by computed-value type; list-style longhands animate discretely. The shorthand follows its component properties.

| Exact name | Value grammar | Initial | Inherited | Applies to |
| --- | --- | --- | --- | --- |
| `counter-reset` | `none` or one or more `<counter-name> <integer>?` / `reversed(<counter-name>) <integer>?` pairs | `none` | No | All elements |
| `counter-increment` | `none` or one or more `<counter-name> <integer>?` pairs | `none` | No | All elements |
| `counter-set` | `none` or one or more `<counter-name> <integer>?` pairs | `none` | No | All elements |
| `list-style-type` | `<counter-style> | <string> | none` | `disc` | List items |
| `list-style-image` | `<image> | none` | `none` | List items |
| `list-style-position` | `inside | outside` | `outside` | Yes | List items |
| `list-style` | `<'list-style-position'> || <'list-style-image'> || <'list-style-type'>` | Each longhand’s initial value | Each longhand’s rule | List items |

The `<integer>` is signed. An omitted integer means `0` for reset and set, and `1` for increment. `counter-set` and `counter-increment` can instantiate a counter on the element if no same-named counter is there; `counter-set` starts from zero and assigns the requested value, while increment starts at zero and applies the requested delta. `none` means the property makes no change. `counter-reset: none` creates no counters.

### Marker style and placement

- **`list-style-type`** selects the textual marker when `content` on `::marker` is `normal` and no valid `list-style-image` supplies the marker. It accepts a predefined or custom `<counter-style>`, a literal CSS string, or `none`. The CSS Counter Styles Level 3 draft's named predefined set is grouped as follows: numeric `decimal`, `decimal-leading-zero`, `arabic-indic`, `armenian`, `upper-armenian`, `lower-armenian`, `bengali`, `cambodian`, `khmer`, `cjk-decimal`, `devanagari`, `georgian`, `gujarati`, `gurmukhi`, `hebrew`, `kannada`, `lao`, `malayalam`, `mongolian`, `myanmar`, `oriya`, `persian`, `lower-roman`, `upper-roman`, `tamil`, `telugu`, `thai`, and `tibetan`; alphabetic `lower-alpha`, `lower-latin`, `upper-alpha`, `upper-latin`, `lower-greek`, `hiragana`, `hiragana-iroha`, `katakana`, and `katakana-iroha`; symbolic `disc`, `circle`, `square`, `disclosure-open`, and `disclosure-closed`; fixed `cjk-earthly-branch` and `cjk-heavenly-stem`; complex `japanese`, `japanese-formal`, `korean-hangul`, `korean-hanja`, `korean-hanja-formal`, `simp-chinese`, `simp-chinese-formal`, `trad-chinese`, `trad-chinese-formal`, `ethiopic-numeric`, and `nko-ordinal`. This is the module's named predefined set, not a list of all custom names; I18N's ready-made counter-style collection adds rules for world languages. Which glyphs display well still depends on fonts and user-agent support. Custom named styles come from `@counter-style`; `symbols()` creates an anonymous counter style where supported.
- **`list-style-image`** chooses an image from the CSS `<image>` family or `none`. An invalid image supplies no marker image, allowing the marker type to be used. The draft gives the marker image a default object size of 1em square when no size is specified. This is not an HTML `img` and does not carry a text alternative; retain another visible cue if a marker communicates meaning.
- **`list-style-position`** chooses `inside` or `outside`. `inside` places the marker as an inline item at the beginning of the list item’s contents, so wrapped lines align with the content. `outside` places it outside the principal content box, on the inline-start side for the item’s writing mode; the marker occupies a gutter and wrapped lines align with the content. Exact outside-marker interactions with floats, overflow, and painting have areas the draft still leaves undefined or user-agent-dependent.
- **`list-style`** sets the type, image, and position longhands together. The `||` grammar permits the components in any order, each at most once. Omitted components reset to their initial values; a shorthand is one declaration, so it overwrites the prior values of all three longhands. `none` is ambiguous because it is valid for both type and image: assign it to whichever of those is not otherwise supplied. Thus `list-style: none` turns off both; `list-style: none disc` sets image to none and type to disc; `list-style: none url(marker.svg)` sets type to none and image to the URL. Repeating a component is invalid.

The `::marker` pseudo-element gives direct control over marker content and styling. When its `content` is not `normal`, that content takes precedence over the list-style marker source. Otherwise a valid image marker is used; failing that, the list-style type is used. Only list items generate a marker box. CSS Lists Level 3 says a restricted set of properties applies to `::marker`; check that module for its current allowlist rather than assuming every property can style it. The shorthand and the three longhands still apply to the originating list item, not to `::marker` itself.

### Counter operations and resolution order

Counter properties are not inherited CSS properties. Counter objects and their scopes are nevertheless carried through the document tree according to CSS Lists’ counter rules. For each element or pseudo-element, the relevant resolution sequence is: inherit existing counters; instantiate counters with `counter-reset`; apply increments; apply explicit assignments with `counter-set`; then resolve counter output. This order explains why a reset and an increment can both affect a value on the same element.

- **`counter-reset`** instantiates a new counter of each name at the specified starting value, default `0`. If the same name is already active from an ancestor, this creates a nested counter with the same name rather than changing the ancestor’s counter. `reversed(name)` creates a reversed counter; without an explicit starting number, the initial value is calculated from the increments and sets in its scope at layout time. Use a reset at the scope boundary where a new sequence should begin.
- **`counter-increment`** adds the specified signed integer to the current counter. The default increment is `1`, so negative values count down and `0` leaves the named counter unchanged. Listing multiple name/value pairs increments multiple counters on the same element. If a counter does not yet exist there, the property creates it from zero and then increments it.
- **`counter-set`** assigns the specified value instead of adding to it; its default value is `0`. It can create a missing counter from zero and then assign. When a name occurs more than once in one value, each increment is processed in order, while only the last set value takes effect.
- **`counter(name, style?)`** outputs the innermost counter with that name. **`counters(name, separator, style?)`** outputs every same-named active counter from outermost to innermost, joined by the separator. Both default to the `decimal` counter style. If the requested counter has not been instantiated at the output point, the function first creates one at zero. Counter functions are defined in Lists Level 3; the selected style is defined by Counter Styles Level 3.

Counters are self-nesting. A nested list can create a new `list-item` counter in each list scope; `counter(list-item)` returns the innermost number, while `counters(list-item, ".")` can display the full nested path. A later sibling’s reset can create a new scope that obscures the earlier same-named counter. Counter computations follow the cascade: two separate declarations of `counter-reset` do not accumulate their names—one winning declaration replaces the other—so put all resets that must coexist in the same value.

Every list item automatically increments its implicit `list-item` counter. This increment still occurs when `counter-increment` names some other counter or is `none`. If the declaration explicitly names `list-item`, its specified increment replaces the implicit default increment for that item; `counter-increment: list-item 0` is the explicit way to suppress that automatic increment. HTML ordered-list attributes such as `start`, `reversed`, and `li[value]` participate in the browser’s native list numbering behavior; prefer them when they express the required list semantics.

An element that generates no box—such as `display: none`, or a pseudo-element suppressed by `content: none`—cannot create, set, or increment counters. `visibility: hidden` still generates a box and therefore does not by itself prevent counter effects. User agents may clamp counter values beyond implementation limits. The draft leaves behavior for counter changes in descendants of replaced elements undefined due to interoperability differences.

## Cross-item comparison

| Requirement | Prefer | Difference |
| --- | --- | --- |
| Ordinary ordered steps or numbered lists | Semantic `<ol>` with native numbering | The markup expresses ordered-list semantics and supports HTML list controls such as `start`, `reversed`, and `li[value]`. |
| Ordinary unordered list | Semantic `<ul>` and native marker | The list structure remains meaningful without CSS. |
| Change standard marker text or symbol | `list-style-type` | Chooses a predefined/custom counter style, string marker, or no type marker. |
| Use a graphical marker | `list-style-image` with a useful type fallback | Supplies an image marker; it has no inherent text alternative. |
| Choose marker gutter versus inline flow | `list-style-position` | Changes marker placement and wrapping behavior. |
| Set all three list marker controls | `list-style` | Shorthand resets omitted components and has the dual-`none` parsing rule. |
| Build chapter numbering or multiple nested sequences | `counter-reset`, `counter-increment`, `counter-set`, and `counter()`/`counters()` | CSS-controlled presentation sequences with explicit scope and output; they do not create semantic HTML lists. |

## Examples

Use a native ordered list, then customize its marker while retaining its HTML semantics:

```html
<ol class="steps">
  <li>Collect the request.</li>
  <li>Validate its fields.</li>
  <li>Persist the result.</li>
</ol>
```

```css
.steps {
  list-style: upper-roman outside;
}

.steps::marker {
  color: rebeccapurple;
  font-weight: 700;
}
```

Create a nested visual chapter sequence where the HTML is headings rather than list items:

```html
<article class="book">
  <h2>Getting started</h2>
  <h3>Install the tools</h3>
  <h3>Run the application</h3>
  <h2>Build the feature</h2>
</article>
```

```css
.book { counter-reset: chapter; }
.book h2 {
  counter-increment: chapter;
  counter-reset: section;
}
.book h2::before {
  content: "Chapter " counter(chapter) ". ";
}
.book h3 {
  counter-increment: section;
}
.book h3::before {
  content: counter(chapter) "." counter(section) " ";
}
```

Here the headings remain headings, while the visual numbers come from CSS. If those numbers are essential when style sheets are unavailable, include the numbering in the source content or otherwise ensure equivalent accessible output.

## Common mistakes

1. **Replacing semantic list markup with CSS counters.** Counters draw numbering; they do not convey list semantics. Use `<ol>` or `<ul>` for an actual list.
2. **Forgetting the implicit `list-item` counter.** List items already have automatic numbering machinery; ordinary lists rarely need hand-written reset/increment rules.
3. **Assuming counters are inherited properties.** Counter objects participate in their own tree-scoped propagation rules; `counter-increment` itself is not inherited.
4. **Expecting repeated declarations to merge.** The cascade picks one winning declaration per property. Combine all desired names into one `counter-reset`, `counter-increment`, or `counter-set` value.
5. **Confusing reset, increment, and set.** Reset creates a nested counter at a starting value; increment adds a delta; set assigns a value. Their processing order matters.
6. **Using `counter()` when nested values are needed.** `counter()` returns only the innermost same-named counter; `counters()` returns the active chain joined by a separator.
7. **Forgetting the dual meaning of `none` in `list-style`.** The shorthand resolves it to the otherwise-unspecified image/type component; a single `none` disables both.
8. **Expecting `list-style-image` to always win.** It is used only when the marker’s `content` is `normal`, and an invalid image leaves no image marker so the type marker can be used.
9. **Treating the image marker as accessible text.** Images have no inherent text alternative in this property; do not make the image the sole carrier of meaning.
10. **Assuming hidden means absent for counters.** `display:none` suppresses counter effects because there is no box; `visibility:hidden` still creates a box.
11. **Misunderstanding reversed-counter initialization.** If a reversed counter has no explicit start, its initial value is calculated from the counter activity in its scope; it is not simply assumed to start at zero.
12. **Treating custom marker output as automatic user-facing text.** Marker layout and assistive-technology exposure vary; keep important instructions and content in the document.

## Knowledge checks with answers

1. **What does `counter-reset: chapter` do?** It creates a new `chapter` counter at zero in the current scope.
2. **What is the difference between `counter-increment: chapter -1` and `counter-set: chapter -1`?** The first subtracts one from the current value; the second assigns negative one.
3. **Which function outputs all nested counters with the same name?** `counters(name, separator, style?)`; `counter(name, style?)` returns only the innermost one.
4. **Why can two `counter-reset` declarations on the same selector fail to initialize two counters?** They are separate declarations of the same property; the cascade selects the winner. Put both names in one declaration.
5. **When does `list-style-image` appear instead of the type marker?** When marker `content` remains `normal` and the image value is valid; otherwise the type marker is used if available.
6. **What does `list-style: none` set?** Both `list-style-image` and `list-style-type` to `none`.
7. **What happens to counter increments on a `display:none` element?** The element has no generated box, so it cannot set, reset, or increment counters.
8. **Does `visibility:hidden` prevent counter increments?** No. The element still generates a box.

## Sources

- [CSS Lists and Counters Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-lists-3/) — list items, markers, all seven properties, marker placement, counter lifecycle/scope, reversed and implicit list-item counters, and output functions.
- [CSS Counter Styles Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-counter-styles-3/) — predefined and custom counter styles, `@counter-style`, descriptors, and `symbols()`.
- [CSS Generated Content Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-content-3/) — interaction between generated content and counters; explicitly a very rough draft, not ready for implementation.
- [HTML Standard: ordered lists](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element) — native ordered-list semantics and list attributes.
