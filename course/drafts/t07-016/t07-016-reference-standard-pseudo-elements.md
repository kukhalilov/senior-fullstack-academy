# CSS selectors at-rules cascade values and box model — Reference: Standard pseudo-elements

## Scope and version

The exact inventory is pinned in the lesson manifest and MDN's [selectors data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json). Consult [Selectors Level 4](https://www.w3.org/TR/selectors-4/) and the live [MDN selector reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors/Selector_structure) for syntax and compatibility. Pseudo-elements are associated rendering targets, not ordinary child elements.

## How this group fits the mental model

Pseudo-elements extend selector matching to generated boxes, fragments, native control parts, highlights, media cues, shadow-tree slots, and view-transition snapshots. Their allowed properties and placement vary. Some permit a second pseudo-element, while many combinations are invalid. Generated content is presentation; essential information and interaction should remain available in semantic HTML and accessible name/state APIs.

## Supplied names explained

### Generated content and text fragments

- `::before` and `::after` create generated boxes as first/last child-like content of a selected element when `content` generates something; they are not DOM nodes.
- `::first-letter` targets the typographic first letter/initial punctuation fragment under the language and layout rules; it does not simply select the first character code unit.
- `::first-line` targets the first formatted line, whose contents can change with width, font, and layout.
- `::marker` targets a list item's marker box; supported properties are restricted compared with ordinary boxes.
- `::placeholder` targets placeholder text in supported form controls; preserve sufficient contrast and do not use placeholder as the only label.
- `::selection` targets user-selected text; support is intentionally limited to a defined set of properties.
- `::target-text` targets text fragments identified through text-fragment navigation where available.

### Native UI, media, and highlights

- `::backdrop` represents the backdrop rendered immediately below a top-layer element, such as a modal dialog or fullscreen element.
- `::checkmark` targets a checkmark part of a customizable native picker/control where supported; do not assume ordinary checkboxes expose it.
- `::file-selector-button` targets the button part of a file-upload input; the actual file picker remains browser-controlled.
- `::picker-icon` targets a picker icon in customizable select controls where supported.
- `::picker()` targets a picker popup associated with a control using the specified picker type; it is subject to customizable-control support and UA behavior.
- `::cue` targets WebVTT cues in media; `::cue()` targets cues satisfying the supported cue selector syntax. Cue styling has a restricted grammar and property set.
- `::details-content` targets the content part of a `<details>` disclosure for styling/animation when supported; do not hide necessary content based on an unsupported animation feature.
- `::grammar-error` and `::spelling-error` target UA-identified text ranges; browser exposure and styling support vary, and authors do not control the underlying proofing decisions.
- `::highlight()` targets a named custom highlight registered through the CSS Custom Highlight API; its name is an identifier and only highlight-appropriate styles apply.

### Shadow DOM and view transitions

- `::part()` exposes a shadow-tree part explicitly named by a component via its `part` attribute; only exposed parts are styleable from outside, and `exportparts` can forward names through nested shadow hosts.
- `::slotted()` targets assigned elements matched by its restricted compound-selector argument in a slot's shadow stylesheet; it does not select arbitrary descendants inside assigned content.
- `::view-transition` represents the root pseudo-element for a document view transition snapshot tree.
- `::view-transition-group()` targets a named transition group; the argument is a transition name.
- `::view-transition-image-pair()` targets the old/new snapshot pair for a named transition group.
- `::view-transition-old()` and `::view-transition-new()` target the old and new snapshot images for a named group. These are transition snapshots, not the source DOM nodes.

## Cross-item comparison

`::before`/`::after` generate presentation boxes; `::marker` represents list marker styling; `::part()` and `::slotted()` cross a shadow boundary under distinct exposure rules. `::selection`, `::highlight(name)`, spelling/grammar pseudo-elements, and media cues style ranges or timed text rather than whole elements. View-transition pseudo-elements address a temporary snapshot tree. Native picker pseudo-elements style implementation parts only where the customizable control feature exists. Pseudo-elements often have restricted properties, so inspect the relevant reference instead of assuming every CSS property applies.

## Examples

```css
/* Decorative content: the accessible text still comes from the heading. */
.external-link::after { content: " ↗"; }

/* Style a named programmatic highlight. */
::highlight(search-result) { background: gold; color: black; }

/* Expose only a deliberate component part across the shadow boundary. */
my-control::part(label) { font-weight: 600; }

/* A view-transition name links the element to its snapshot group. */
.hero { view-transition-name: hero; }
::view-transition-old(hero) { animation: 180ms ease-out both fade-out; }
```

If a user must understand or act on the generated content, put that information in semantic content or accessible state. Check browser support and reduced-motion preferences before relying on view-transition effects.

## Common mistakes

- Assuming generated content is a semantic DOM node or safe place for required text.
- Forgetting that `::slotted()` matches assigned elements only and has restricted selector syntax.
- Treating `::part()` as unrestricted access to all shadow-tree internals.
- Assuming native picker internals are consistent or styleable in every browser.
- Styling a view-transition snapshot as though it were the live source element.
- Expecting arbitrary properties to work on `::marker`, `::selection`, `::cue`, or highlight pseudo-elements.
- Using `::placeholder` instead of a persistent label.

## Knowledge checks with answers

1. **Does `::before` add an element to the DOM tree?** No; it generates a CSS box when its `content` creates one.
2. **How does `::part()` differ from `::slotted()`?** Parts are explicitly exposed internal component targets; slotted selects assigned elements from within a shadow stylesheet.
3. **Should essential text live only in `::after`?** No; generated decoration may be absent from semantic/accessible content and should not carry required meaning.
4. **What do view-transition pseudo-elements represent?** Temporary old/new rendered snapshots organized in a transition pseudo-element tree.
