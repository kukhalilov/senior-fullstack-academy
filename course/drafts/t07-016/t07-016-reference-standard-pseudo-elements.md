# CSS selectors at-rules cascade values and box model — Reference: Standard pseudo-elements

## Scope and version

The assigned inventory is pinned in the lesson manifest and MDN's [selectors data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json). The behavior below was checked against [CSS Pseudo-Elements Level 4](https://drafts.csswg.org/css-pseudo-4/), the [CSS Form Control Styling draft](https://drafts.csswg.org/css-forms-1/), [WebVTT](https://www.w3.org/TR/webvtt1/), [CSS Shadow](https://drafts.csswg.org/css-shadow-parts/), [View Transitions Level 2](https://drafts.csswg.org/css-view-transitions-2/), and MDN's [current pseudo-element index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements) on 2026-11-19. A pseudo-element is a rendering target, not automatically a DOM child or accessible node; implementation support and allowed properties vary.

## How this group fits the mental model

Pseudo-elements extend selector matching to generated boxes, fragments, native control parts, highlights, media cues, shadow-tree slots, and view-transition snapshots. Their allowed properties and placement vary. Some permit a second pseudo-element, while many combinations are invalid. Generated content is presentation; essential information and interaction should remain available in semantic HTML and accessible name/state APIs.

## Supplied names explained

### Generated content and text fragments

- `::before` and `::after` create generated boxes before or after an element's content when `content` generates something other than `none`/`normal`; they are not DOM nodes. They can also be attached to pseudo-elements only in specifically allowed nesting patterns.
- `::first-letter` targets the typographic initial fragment under language, inline-formatting, and layout rules. Associated opening/closing punctuation can join it; it is not a first Unicode code-unit selector and may not exist when no qualifying formatted text exists.
- `::first-line` targets the first formatted line, whose contents can change with width, font, and layout.
- `::marker` targets the marker box of a list item (including elements styled as list items). It supports a restricted property set, including selected color, font, text, and `content` properties; it is not a general-purpose box.
- `::placeholder` targets placeholder text in supported form controls; preserve sufficient contrast and do not use placeholder as the only label.
- `::selection` targets the user's selected text. Only a defined set of properties applies (including color, background-color, text-decoration, text-shadow, and text-stroke-related properties); the user agent can constrain the result for readability.
- `::target-text` targets the text range highlighted by text-fragment navigation (for example a URL text directive such as `#:~:text=...`) when supported; it is distinct from the element targeted by an ordinary `#id` fragment.

### Native UI, media, and highlights

- `::backdrop` represents the backdrop rendered immediately below a top-layer element, such as a modal dialog or fullscreen element.
- The current MDN reference documents `::checkmark` inside the selected `<option>` of a customizable `<select>`, which opts in with `appearance: base-select`. The newer CSS Form Control Styling Level 1 editor draft also defines it for checked checkbox/radio controls under its basic-appearance model. Browser implementations and the draft scope differ, so check the exact control and engine; do not infer that ordinary native checkboxes expose a styleable checkmark.
- `::file-selector-button` targets the button part of a file-upload input; the actual file picker remains browser-controlled.
- `::picker-icon` targets the icon associated with a form-control picker, such as the closed-state arrow of a customizable `<select>`; availability depends on the control and supported base appearance.
- `::picker(select)` targets the popup picker of a customizable `<select>`. The control and picker opt into customizable-select styling with `appearance: base-select`; support and native behavior vary by browser.
- `::cue` targets WebVTT cue text, while `::cue(<selector>)` targets supported internal cue nodes such as `<b>`, `<i>`, `<u>`, `<c>`, `<v>`, `<lang>`, `<ruby>`, and `<rt>`. Cue selectors and permitted properties are restricted by WebVTT; they are not ordinary DOM selectors over the video page.
- `::details-content` targets the content part of a `<details>` disclosure for styling/animation when supported; do not hide necessary content based on an unsupported animation feature.
- `::grammar-error` and `::spelling-error` target UA-identified text ranges; browser exposure and styling support vary, and authors do not control the underlying proofing decisions.
- `::highlight(name)` targets a named range collection registered in the CSS Custom Highlight API (for example with `CSS.highlights.set(name, new Highlight(range))`). The name is a CSS identifier; only highlight-appropriate properties apply and custom highlights do not create DOM nodes.

### Shadow DOM and view transitions

- `::part()` exposes a shadow-tree part explicitly named by a component via its `part` attribute; only exposed parts are styleable from outside, and `exportparts` can forward names through nested shadow hosts.
- `::slotted()` targets assigned elements matched by its restricted compound-selector argument in a slot's shadow stylesheet; it does not select arbitrary descendants inside assigned content.
- `::view-transition` represents the root pseudo-element for a document view transition snapshot tree.
- `::view-transition-group()` targets a named transition group; the argument is a transition name.
- `::view-transition-image-pair()` targets the old/new snapshot pair for a named transition group.
- `::view-transition-old()` and `::view-transition-new()` target the old and new snapshot images for a named group. These are transition snapshots, not the source DOM nodes.

## Cross-item comparison

`::before`/`::after` generate presentation boxes; `::marker` represents list marker styling; `::part()` and `::slotted()` cross a shadow boundary under distinct exposure rules. `::selection`, `::highlight(name)`, `::target-text`, spelling/grammar states, and `::cue()` all deal with text ranges but have different owners and APIs. `::selection`, `::highlight(name)`, spelling/grammar pseudo-elements, and media cues style ranges or timed text rather than whole elements. View-transition pseudo-elements address a temporary snapshot tree. Native picker pseudo-elements style implementation parts only where the customizable control feature exists. Pseudo-elements often have restricted properties, so inspect the relevant reference instead of assuming every CSS property applies. The View Transitions Level 2 draft adds `::view-transition-group-children()` for nested transition-group structure; it is covered with newer pseudo-element additions, not in this pinned lesson inventory.

## Examples

```css
/* Decorative content: the accessible text still comes from the heading. */
.external-link::after { content: " ↗"; }

/* Style a named programmatic highlight. */
::highlight(search-result) { background: gold; color: black; }

/* Opt into the customizable select picker before styling its parts. */
select,
::picker(select) { appearance: base-select; }
option::checkmark { color: seagreen; }

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
- Assuming native picker internals are consistent or styleable in every browser; customizable select parts require the `base-select` appearance opt-in.
- Using `::checkmark` for a checkbox or radio button; it is the selected option checkmark in a customizable select.
- Confusing `::target-text` text-fragment highlighting with the ordinary element selected by `:target`.
- Styling a view-transition snapshot as though it were the live source element.
- Expecting arbitrary properties to work on `::marker`, `::selection`, `::cue`, or highlight pseudo-elements.
- Using `::placeholder` instead of a persistent label.

## Knowledge checks with answers

1. **Does `::before` add an element to the DOM tree?** No; it generates a CSS box when its `content` creates one.
2. **How does `::part()` differ from `::slotted()`?** Parts are explicitly exposed internal component targets; slotted selects assigned elements from within a shadow stylesheet.
3. **Should essential text live only in `::after`?** No; generated decoration may be absent from semantic/accessible content and should not carry required meaning.
4. **What do view-transition pseudo-elements represent?** Temporary old/new rendered snapshots organized in a transition pseudo-element tree.
5. **Does `::target-text` select the element named by `#section`?** No. It styles a text range identified by text-fragment navigation; `:target` selects the element indicated by an ordinary fragment identifier.
6. **Does `::checkmark` have only a customizable-select meaning in every current specification?** No. MDN documents the selected-option use, while the newer CSS Forms editor draft also defines checked checkbox/radio uses under its basic-appearance model; implementation support must be checked.
7. **What must be true before styling `::picker(select)` and `option::checkmark`?** The customizable select and its picker must opt into `appearance: base-select`, and the target browser must support the relevant control feature.

### Full syntax inventory

- `::after`
- `::backdrop`
- `::before`
- `::checkmark`
- `::cue`
- `::cue()`
- `::details-content`
- `::file-selector-button`
- `::first-letter`
- `::first-line`
- `::grammar-error`
- `::highlight()`
- `::marker`
- `::part()`
- `::picker-icon`
- `::picker()`
- `::placeholder`
- `::selection`
- `::slotted()`
- `::spelling-error`
- `::target-text`
- `::view-transition`
- `::view-transition-group()`
- `::view-transition-image-pair()`
- `::view-transition-new()`
- `::view-transition-old()`
