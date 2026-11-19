# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Generated Content properties

## Scope and version

This reference covers the two assigned properties, `content` and `quotes`. CSS 2.1 defines the long-established generated-content baseline, especially `content` with `::before`/`::after` and the quote-insertion values. The current [CSS Generated Content Level 3 Editor’s Draft](https://drafts.csswg.org/css-content-3/) was dated 21 October 2026 when checked. Its status section calls it a “very rough draft” that is “not ready for implementation”; its expanded element-replacement, alternative-text, leaders, cross-reference, named-string, and elemental-content features must therefore be treated as proposals, not a production baseline. The draft specifically lists counters in `content` alternative text as at-risk. [CSS Pseudo-Elements Level 4](https://drafts.csswg.org/css-pseudo-4/) and [CSS Lists and Counters Level 3](https://drafts.csswg.org/css-lists-3/) define adjacent pseudo-element and counter behavior. A property name in the CSS Snapshot or MDN index does not establish support for every value in this draft.

CSS 2.1’s `quotes` initial value was user-agent-dependent; the Level 3 Editor’s Draft changes the initial value to `auto`, which selects punctuation based on content language. Keep this specification revision and implementation support separate.

## How this group fits the mental model

`content` controls generated content in the CSS rendering model. In the established pattern, a pseudo-element such as `::before`, `::after`, or `::marker` has its own box and CSS content, while the document’s HTML text and DOM tree remain unchanged. The property can emit strings, images, counters, attribute-derived text, and quote tokens. A newer editor’s draft also proposes replacing an element’s rendered content, supplying speech alternative text, copying descendants, and adding paged-media publishing functions.

`quotes` does not insert text by itself. It defines the opening/closing string pairs used by `open-quote` and `close-quote`; those values are inserted by `content`. Quote nesting depth follows generated quote tokens, not just the DOM nesting depth. The HTML `<q>` element is semantic markup for an actual quotation, and user agents insert its quotation punctuation. Use it when appropriate instead of manually duplicating the punctuation.

## Supplied names explained

| Property | Current draft value/initial | Inheritance and applicability | Animation |
| --- | --- | --- | --- |
| `content` | `normal | none | [<content-replacement> | <content-list>] [ / <alt-text> ]?`; initial `normal` | Not inherited; draft says all elements, tree-abiding pseudo-elements, and page-margin boxes | Discrete |
| `quotes` | `auto | none | [<string> <string>]+`; initial `auto` | Inherited; all elements | Discrete |

All CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`, `revert-layer`) are accepted. The value table above follows the current Content Level 3 draft. Its `quotes` grammar also contains the placeholder token `bikeshed-this` for a possible language-inheritance behavior; that is an unresolved editorial placeholder, not an authoring value to use.

### `content`: generated and replaced content

#### Established behavior

In the CSS 2.1 baseline, `content` applies to `::before` and `::after`; a declaration such as `p.note::before { content: "Note: "; }` creates an inline generated box before the paragraph’s document-tree content. Current pseudo-element syntax uses `::before` and `::after`; the older single-colon spellings remain compatibility aliases. Generated boxes participate in layout and can be styled like other boxes, but they are not child nodes in the DOM and do not become HTML that is parsed again.

The established value families are:

- `normal` and `none`: for `::before`/`::after`, `normal` computes as `none`; the pseudo-element is not generated. `none` likewise suppresses the pseudo-element.
- `<string>`: inserts text. CSS escapes can include a line feed such as `"\A"`, but the result is still governed by `white-space` and text-layout rules.
- `<uri>`/`url()` image references and, in modern CSS, values in the CSS `<image>` family. An image may be an external image or a generated image such as a gradient. Resource loading, image fallback, and support belong to CSS Images and the relevant image syntax.
- `counter(name[, style])` and `counters(name, separator[, style])`: emit a counter value or the nested values joined by a separator. Counter creation, scope, style systems, and sequencing are defined by CSS Lists and Counters; this reference does not replace that module.
- `attr(name)`: emits an attribute value as text in the legacy generated-content model. Newer CSS Values drafts extend `attr()` with types and fallback syntax, but those are separately versioned and support-dependent. Attribute text is not parsed as HTML markup.
- `open-quote`, `close-quote`, `no-open-quote`, and `no-close-quote`: insert the quote pair selected by `quotes`, or adjust quote depth without inserting visible punctuation (details below).

The modern CSS Images `<image>` family can include `url()`, gradients, `image-set()`, `image()`, `cross-fade()`, and `element()` as specified by CSS Images. The appearance and support of each remain specific to that image type; listing an image function here does not make it a feature defined by `content` itself.

#### Draft extensions; do not assume deployment

The current Content Level 3 Editor’s Draft expands the grammar substantially. The following are names and forms in that draft, with its rough status kept explicit:

| Draft value or function | Draft purpose and boundary |
| --- | --- |
| `<content-replacement>` with an `<image>` | Replaces the rendered contents of an element or pseudo-element with an image, suppressing normal children; this is distinct from inserting an image inline in a `content-list`. The draft contains unresolved compatibility notes for `::before`/`::after`. |
| `contents` | Uses the originating element’s descendants as the content source. The draft prevents the same descendants from being consumed repeatedly by the element, `::before`, and `::after`; on other pseudo-elements it can resolve to nothing if already used. This proposal has editorial questions and is not a stable replacement for DOM restructuring. |
| Slash alternative text: `content: <visual-content> / <alt-text>` | Proposes alternative text for generated or replaced visual content, intended for speech/braille output instead of the visual form. `<alt-text>` is a list of strings, counters, or attribute values. Accessibility mapping and implementation support must be verified; this does not replace HTML text, labels, or established accessible-name mechanisms. |
| `<symbolic-glyph>` such as `disclosure-open` and `disclosure-closed` | Uses a predefined symbolic counter-style glyph, chiefly for markers such as a disclosure triangle. The draft limits this to predefined symbolic styles because user-agent-specific symbols cannot be directly copied from arbitrary authored counter styles. |
| `leader(dotted | solid | space | <string>)` | Proposes repeating leaders between content, especially in paged-media tables of contents. The algorithm has special rules for alignment, wrapping, and when no full leader fits. It is a draft feature, not a general replacement for layout techniques or page-generation support. |
| `target-counter()`, `target-counters()`, `target-text()` | Proposed cross-reference functions for pulling a target’s counter, nested counters, or text. The draft restricts targets to fragment links in the same document and leaves some error handling unresolved. |
| `string-set` and `string()` | Proposed named strings for paged media. `string-set` captures a value; `string()` selects the page’s `first`, `start`, `last`, or `first-except` value for margin content. These are not among the two assigned properties and remain draft publishing features. |
| `content()` | Proposed function for extracting an element’s content into a named string or other generated context. Its semantics are still in the rough draft; do not rely on it in ordinary browser UI. |

The `content` property’s context matters. In the draft, `normal` computes to `contents` on an ordinary element and page-margin box, to `none` on `::before`/`::after`, and remains `normal` on `::marker`, `::placeholder`, and `::file-selector-button`. `none` behaves like `normal` on ordinary elements but suppresses a pseudo-element. A `<content-list>` has no effect on ordinary elements; on pseudo-elements and page-margin boxes it replaces that box’s contents. A list contributes its items in order; images create replaced inline boxes and textual items create anonymous inline text runs. A single image in a list is interpreted as content replacement. These are draft rules and should not be mistaken for uniformly implemented behavior.

CSS generated text does not mutate or extend the document tree. It cannot be queried as DOM child text, and it is not reparsed as markup. Generated text may be selectable or announced in some environments, but the CSS Generated Content draft notes that a CSS accessibility mapping is still incomplete. Keep required instructions, state, warnings, and control labels in semantic HTML and accessible-name mechanisms. Use pseudo-element content for decoration or redundant presentation, and test accessibility behavior with the target browser/assistive-technology combinations.

### `quotes`: quote systems and nesting

`quotes` is inherited. The current draft’s initial `auto` lets the user agent choose typographically appropriate quote pairs from the element’s content language (or its own language if it has no parent); the Unicode CLDR is one source of locale conventions. This avoids hardcoding English punctuation in multilingual content. Set `lang` correctly in HTML so language-sensitive quotation behavior has the right input. `quotes: none` makes generated open/close quote values produce no visible punctuation, but quote-depth accounting still occurs.

A custom quote list is one or more **pairs** of strings, written in opening/closing order. Pair one is used at the outermost quote depth, pair two at the first nested depth, and so on; if nesting is deeper than the list, the final pair is reused. For example:

```css
:lang(en) > q { quotes: "“" "”" "‘" "’"; }
:lang(fr) > q { quotes: "« " " »" "‹ " " ›"; }
```

The four `content` quote values affect depth as follows:

- `open-quote` inserts the current opening string, then increments quote depth.
- `close-quote` decrements quote depth and inserts the matching closing string. A close that would take the depth below zero is ignored at rendering time.
- `no-open-quote` increments depth without visible punctuation.
- `no-close-quote` decrements depth without visible punctuation; it is useful when an open quote is repeated for each paragraph but only the final paragraph should close visibly.

Quote depth is independent of source-element nesting and follows generated quote occurrences in the flattened tree. `quotes` only affects these generated quote tokens; it does not rewrite literal quote characters already present in text.

The HTML `<q>` element represents phrasing content quoted from another source. HTML says the user agent inserts its quotation punctuation, so do not place duplicate quotation punctuation immediately inside or around `<q>`. Use the `cite` attribute for a quotation source URL where useful. `<q>` is optional—literal punctuation can be correct—and should not be used for sarcasm or merely naming a word.

## Cross-item comparison

| Need | Use | Why |
| --- | --- | --- |
| Semantic document wording, labels, warnings, or instructions | HTML text and semantic elements | Present in the source tree; not dependent on generated-content parsing or support. |
| Add a decorative or redundant label before/after an existing box | `content` on `::before`/`::after` | Creates a styled pseudo-element without changing DOM text. |
| Style a list marker | `content` on `::marker` plus CSS Lists marker rules | Marker behavior is defined with list and counter properties; it is not the same as ordinary `::before` content. |
| Select local quote punctuation by language | `quotes` plus `open-quote`/`close-quote`, or semantic HTML `<q>` | `quotes` defines pairs; quote tokens insert them; `<q>` provides quotation semantics and UA punctuation. |
| Create numbering or cross references | CSS Lists counters for ordinary numbering; Content Level 3 target functions only in supported paged-media tooling | Counter mechanics and proposed cross-reference extraction belong to different modules and support stages. |
| Replace all rendered element content with an image or add CSS alt text | Content Level 3 `content-replacement` / slash-alt syntax | Working-draft proposals; preserve HTML fallback and verify browser and accessibility support first. |

## Examples

Add a nonessential visual prefix while retaining the actual message in HTML:

```html
<p class="note">The server retries the request once.</p>
```

```css
.note::before {
  content: "Note: ";
  font-weight: 700;
}
```

Use semantic quotation markup and rely on language-aware user-agent punctuation:

```html
<p lang="en">The report quotes <q>measure twice</q>.</p>
```

Set custom nested quote pairs only when the design intentionally overrides locale defaults:

```css
:lang(en) > q { quotes: "“" "”" "‘" "’"; }
:lang(en) > q::before { content: open-quote; }
:lang(en) > q::after  { content: close-quote; }
```

The previous rule is illustrative; browsers already commonly style `<q>` with quote pseudo-elements, so author rules can override the user-agent stylesheet. Avoid applying both literal punctuation and generated quote marks.

Illustrative draft-only syntax for an icon with an alternative string (feature support and accessibility mapping vary):

```css
.external-link::after {
  content: url("external.svg") / "opens an external site";
}
```

Do not make this image or alternative string the only indication that a link leaves the site; provide an equivalent in semantic content where required.

## Common mistakes

1. **Assuming `content` is a DOM editing API.** It changes generated rendering; it does not create HTML nodes or update source text.
2. **Putting indispensable wording only in pseudo-elements.** CSS may be disabled, overridden, unsupported in a modality, or mapped differently by assistive technology.
3. **Using `content` on a normal element as if it prepended text.** In the established CSS 2.1 model it applies to `::before`/`::after`; newer element replacement/content-list behavior is draft-specific.
4. **Treating a draft’s long value grammar as a shipping feature list.** The October 2026 Content Level 3 draft explicitly says it is not ready for implementation.
5. **Confusing `content: none` and `content: normal` across contexts.** Their computed/effective results depend on whether the target is a normal element, pseudo-element, marker, or page-margin box.
6. **Forgetting quote-depth changes from invisible tokens.** `no-open-quote` and `no-close-quote` change nesting even though they insert no glyph; unbalanced closes below depth zero are ignored.
7. **Adding punctuation inside `<q>`.** The user agent supplies quotation punctuation; duplicate quote characters create visible duplicates.
8. **Hardcoding English quotation marks across languages.** Use `quotes: auto` and correct HTML `lang`, or provide localized pairs intentionally.
9. **Assuming `quotes: none` removes semantic quotation or resets depth.** It suppresses generated marks; it does not turn prose into an unquoted string or reset quote accounting.
10. **Treating an empty alt string as safe for essential information.** In the draft slash syntax an empty alternative is for genuinely decorative content; it can silence the visual generated content in speech output.

## Knowledge checks with answers

1. **Does `content: "Hi"` append a DOM text node?** No. It affects CSS-generated rendering; the document tree is unchanged.
2. **What is the stable use of `content`?** Primarily generated content on `::before`/`::after`, with counter and quote features defined by the relevant CSS modules; modern draft extensions are separately status-labeled.
3. **What is the difference between `open-quote` and `no-open-quote`?** Both increase quote depth; the first inserts the opening string selected by `quotes`, the second inserts no visible string.
4. **What happens if a custom `quotes` list has fewer pairs than the nesting depth?** The final pair is reused for deeper levels.
5. **Does `quotes: none` reset nesting depth?** No. It suppresses the visible open/close quote strings; quote tokens still maintain depth.
6. **What does `quotes: auto` use to select punctuation?** The user agent chooses a typographically appropriate system based on content language, using locale data such as CLDR where appropriate.
7. **Can slash alternative text in `content` safely replace an HTML button label?** No. It is a rough-draft generated-content feature with variable support and does not replace semantic source text or an established accessible name.
8. **Should an author add literal quote marks inside `<q>`?** No. HTML specifies that the user agent inserts the punctuation for the quotation; duplicate punctuation should not be included.

## Sources

- [CSS Generated Content Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-content-3/) — current rough-draft grammar, `content`, alternative text, `quotes`, quote tokens, and proposed paged-media functions.
- [CSS 2.1, generated content](https://www.w3.org/TR/CSS2/generate.html) — long-established `content`/`quotes` baseline and pseudo-element behavior; some sections have been superseded by newer modules.
- [CSS Pseudo-Elements Module Level 4](https://drafts.csswg.org/css-pseudo-4/) — `::before`, `::after`, pseudo-element box generation, and pseudo-element relationships.
- [CSS Lists and Counters Module Level 3](https://drafts.csswg.org/css-lists-3/) — markers, counter functions, and numbering mechanics referenced by `content`.
- [CSS Values and Units Module Level 5](https://drafts.csswg.org/css-values-5/) — current early-exploration draft of `attr()` types and fallbacks; not a browser-support promise.
- [CSS Images Module Level 4](https://drafts.csswg.org/css-images-4/) — image values such as `image()`, `image-set()`, `cross-fade()`, `element()`, and gradients.
- [HTML Living Standard: the `q` element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-q-element) — quotation semantics and user-agent-inserted punctuation.