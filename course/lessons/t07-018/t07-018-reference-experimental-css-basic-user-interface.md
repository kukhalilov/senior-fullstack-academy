
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Basic User Interface field-sizing properties

# Scope and version

This lesson covers the one inventoried property, `field-sizing`. Its current standard home is the CSS Form Control Styling Module Level 1, not CSS Basic User Interface: MDN’s “CSS Basic User Interface” guide grouping is an editorial topic label, while the property’s specification is CSS Form Control Styling. The current CSSWG Editor’s Draft is dated 8 October 2026; the latest W3C publication is a First Public Working Draft dated 25 March 2025. Both remain work in progress. MDN marks `field-sizing` Baseline 2026 (newly available since June 2026), but older browser versions and some control-specific behavior may differ. Check the compatibility table for the browsers you actually support.

The core idea: ordinary form controls often have a preferred size chosen by HTML and the browser, even when their content is short or long. `field-sizing` selects whether that preferred size remains fixed or the control’s intrinsic size follows its content. It applies to elements with a default preferred size, is non-inherited, has initial value `fixed`, computes as specified, and animates discretely. It is a sizing behavior, not a text-length limit, layout mode, resize handle, or substitute for responsive CSS constraints.

# How this group fits the mental model

With `field-sizing: fixed`, the host language’s default preferred size remains in force. With `field-sizing: content`, the browser derives intrinsic size from content instead of the host-language default preferred size. Think “let this control’s natural size follow what it displays,” then apply normal CSS min/max constraints to make that behavior usable in a layout. A width or height explicitly imposed in CSS can take control again, so content sizing is not a promise that a field will always keep growing.

This property complements rather than replaces HTML attributes. For text inputs, `size` ordinarily influences preferred width; for `<textarea>`, `rows` and `cols` influence preferred dimensions. In content mode, those default-preferred-size hints no longer determine the intrinsic size. HTML semantics such as input type, `maxlength`, labels, validation, keyboard behavior, and accessible names remain in place.

# Supplied names explained

## `field-sizing`

**Grammar:** `fixed | content`, plus CSS-wide keywords (`inherit`, `initial`, `revert`, `revert-layer`, `unset`). **Initial:** `fixed`. **Applies to:** elements with a default preferred size, as defined by the host language. **Inherited:** no. **Computed value:** as specified. **Animation:** discrete; switching values does not interpolate the geometry smoothly.

### `fixed`

The browser uses the host language’s default preferred size for applicable elements. For an element without a default preferred size, the current specification says `fixed` behaves the same as `content`; the property does not force every arbitrary element to an identical pixel size. `fixed` is the initial behavior and is the explicit choice when restoring normal form-control sizing.

### `content`

The user agent determines intrinsic size from the control’s content and ignores the host-language default preferred size. In HTML, the currently documented affected controls include text-entry `<input>` types (`email`, `number`, `password`, `search`, `tel`, `text`, `url`), file inputs (displayed filename), `<textarea>`, and `<select>`. The precise control coverage is defined through the host language and can evolve; do not infer that every form control or every custom widget is affected.

#### Text-entry inputs

- The field grows or shrinks to fit its value as the user types or edits, subject to available space and CSS sizing constraints.
- With no minimum width, an empty field can be only as wide as its insertion caret. Set a practical `min-inline-size`/`min-width` so it remains discoverable and usable before typing.
- A placeholder can make the field initially wide enough to display its text. Once the user types, the value’s intrinsic size can replace the placeholder-driven size.
- The HTML `size` attribute has no sizing effect in `content` mode; use CSS min/max sizing to set useful bounds instead.
- A `maxlength` limit caps how far the value (and consequently field size) can grow by limiting allowed characters. It is a content constraint, distinct from CSS `max-width`.

#### File inputs

Although the user does not type the filename into the input, the displayed selected filename changes as a file is selected. In content mode the control can shrink-wrap that displayed filename. Keep a maximum size so long filenames do not break the surrounding layout; users still need a way to identify the chosen file.

#### `<textarea>`

The textarea can grow with its text. It first grows in the inline direction until constrained; when it cannot continue growing horizontally, it can add rows in the block direction. At its applicable maximum constraints, it scrolls so the full value remains reachable. `rows` and `cols` no longer control its default preferred size in content mode. Min/max sizes are useful to bound growth; a fixed `width` or `height` can constrain or override the content-driven result. Test long unbroken strings, pasted text, zoom, and narrow viewports.

#### `<select>`

- A single-select dropdown can change width to fit the currently displayed selected option; it need not remain as wide as the longest option. Long options therefore can make the control’s size change when the selection changes.
- A listbox (`multiple` or an appropriate `size` value) can grow to display all options instead of requiring internal scrolling. In this mode, `size` still helps determine dropdown-versus-listbox presentation (the browser checks whether its value is `1`), but does not cap how many listbox options are shown.
- This can create a very tall control for a large option set. Add layout constraints and test interaction, particularly on small screens. A popup picker’s own rendered menu may be a native UI surface with separate sizing behavior; `field-sizing` principally describes the form control’s sizing.

### Constraints and interactions

`min-width`/`min-inline-size` and `max-width`/`max-inline-size` are usually the right tools to bound horizontal growth. Use block-axis constraints for textarea growth. The available containing-block space, box sizing, padding, borders, font metrics, writing mode, and intrinsic sizing rules all affect the rendered result. A fixed CSS width or height can reimpose a fixed size and defeat the expected content response; use `min-*` and `max-*` constraints when the goal is “grow until this limit.” Remember that width/height are physical axes while inline/block sizes adapt to writing mode.

Because `field-sizing` is non-inherited, applying it to a form or wrapper does not automatically switch its descendants. Select the controls you intend to change. Feature detection can check syntax, but it does not guarantee identical behavior across control types.

# Cross-item comparison

| Mechanism | What it controls | Relationship to `field-sizing: content` |
| --- | --- | --- |
| HTML `size`, `rows`, `cols` | Default preferred dimensions for specific controls | Their preferred-size role is ignored in content mode (with the noted select presentation nuance). |
| CSS `width`/`height` | Explicit size constraints | Can override or constrain the content-driven intrinsic result. |
| CSS `min-*`/`max-*` | Lower/upper layout bounds | Usually complements content sizing and limits runaway growth. |
| HTML `maxlength` | Maximum number of accepted characters for applicable inputs | Indirectly limits possible content-driven growth; it does not set a CSS size. |
| `resize` | User-operated manual resizing affordance on eligible boxes | Separate property; does not make a control automatically follow text. |
| JavaScript measuring text and setting dimensions | Script-controlled sizing | Often unnecessary for supported controls; can introduce measurement, font-loading, IME, and accessibility bugs. |

# Examples

## Grow text inputs within useful limits

```html
<label for="tag">Tag</label>
<input id="tag" name="tag" type="text" maxlength="80" placeholder="Add a tag">
```

```css
#tag {
  field-sizing: content;
  min-inline-size: 8ch;
  max-inline-size: min(32ch, 100%);
}
```

The minimum prevents an empty input from collapsing to its caret. The maximum keeps a long value from forcing the page wider. The `maxlength` cap is a product/data rule, not a visual width setting.

## Let a message field grow, then scroll at a limit

```html
<label for="message">Message</label>
<textarea id="message" name="message" rows="3"></textarea>
```

```css
#message {
  field-sizing: content;
  min-inline-size: 16rem;
  max-inline-size: 100%;
  min-block-size: 3lh;
  max-block-size: 12lh;
  overflow: auto;
}
```

The `lh` unit ties the bounds to line height. Confirm that the textarea wraps naturally and that content remains reachable once it reaches its maximum block size.

## Restore host-language preferred sizing

```css
input.search-box { field-sizing: content; }
input.search-box.compact { field-sizing: fixed; }
```

`fixed` restores the standard preferred sizing path; it does not guarantee a particular physical width across platforms.

# Common mistakes

- Assuming `content` means unlimited growth; containing space and CSS size constraints still apply.
- Omitting a minimum width and getting an almost invisible empty text input.
- Setting a fixed `width`/`height` and expecting the field to continue resizing naturally.
- Assuming `size`, `rows`, or `cols` still determine the content-mode preferred size.
- Confusing `maxlength` (allowed characters) with `max-width` (layout bound).
- Expecting every form control or custom widget to support content sizing; the host language defines applicable controls.
- Forgetting that a single-select dropdown may resize as selected options change, and that a listbox may expose all options at once.
- Assuming the property inherits from a wrapper or animates smoothly between values.
- Treating a successful `@supports (field-sizing: content)` check as proof that every control type behaves identically.
- Replacing labels or accessible names with placeholders while trying to make a small input look self-explanatory.

# Knowledge checks with answers

1. **What are the two property values?** `fixed` and `content`; the initial value is `fixed`.
2. **What does `content` change conceptually?** It asks the user agent to derive the applicable control’s intrinsic size from content instead of its host-language default preferred size.
3. **Why might an empty text input become tiny?** Without a minimum size, the content-derived inline size can shrink to the insertion caret; set a useful `min-inline-size` or `min-width`.
4. **Do `rows` and `cols` still set a textarea’s preferred size in content mode?** No. Content mode ignores the host-language preferred size those attributes normally provide.
5. **How do you limit growth without disabling content sizing?** Use appropriate `min-*` and `max-*` CSS constraints; avoid a fixed size when the goal is content-responsive sizing.
6. **Does `maxlength` set the control’s width?** No. It limits accepted characters and can indirectly cap growth.
7. **Can a dropdown’s width change when a different option is chosen?** Yes; in content mode it can fit the currently displayed selected option.
8. **Is `field-sizing` inherited?** No. Apply it directly to the controls that should use it.
9. **What is the property's specification maturity?** It is defined in CSS Form Control Styling Level 1, a work-in-progress module; MDN reports Baseline 2026, but check exact browser support.
10. **Does the property replace native semantics or JavaScript validation?** No. It changes sizing behavior only.

# Sources

- [CSS Form Control Styling Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-forms-1/) — current property grammar, initial/inheritance/applicability metadata, intrinsic sizing rules, and proposal status; work in progress.
- [W3C CSS Form Control Styling Level 1 First Public Working Draft](https://www.w3.org/TR/css-forms-1/) — latest published version (25 March 2025), also explicitly a draft.
- [MDN: `field-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing) — current control-specific effects, formal definition, examples, support label, and compatibility data; page last modified 10 November 2026.
- [WHATWG HTML: input, textarea, and select](https://html.spec.whatwg.org/multipage/forms.html) — host-language controls and the `size`, `rows`, `cols`, `multiple`, and `maxlength` behavior referenced here.
- [MDN: `min-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-width), [MDN: `max-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/max-width), and [MDN: `resize`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/resize) — comparison of CSS bounds and manual resize behavior.
