<!-- FACTUALLY REVIEWED: specification-backed; support snapshot preserved separately. -->

## Scope and version

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Basic User Interface properties

## How this group fits the mental model

Most CSS describes how content is laid out and painted. Basic UI properties sit at the boundary between a document and the browser’s interaction machinery: how a control is skinned, where a text caret appears, what pointer target is hit, whether a subtree can be interacted with, how text can be selected, and how an element signals resizing or window dragging. These declarations do not replace HTML semantics, keyboard behavior, accessibility names, or event handling. A visual change can still obscure a focus cue or make a control misleading, so preserve the browser’s usable interaction path and test keyboard, touch, pointer, zoom, writing modes, and assistive technology where relevant.

This lesson explains the 20 names assigned to this group. The grammar and behavior below follow CSS Basic User Interface Level 4’s 13 November 2026 Working Draft and CSS UI Level 3’s published Recommendation. Level 4 remains work in progress: a draft is not a browser support promise. The supplied MDN labels are a separate capture from 2026-11-16; they should be checked against target browsers before shipping. The draft marks applying `user-select` to `::before` and `::after` at risk.

## Supplied names explained

### A. Styling controls without changing their meaning

### `appearance`

`appearance` has the Level 4 grammar `none | auto | base | base-select | <compat-auto> | <compat-special>`, initial value `none`, applies to all elements, and is not inherited. It controls browser-provided widget appearance. `auto` requests the platform/browser widget treatment where applicable; `none` suppresses native decoration to permit author styling; `base` requests a customizable base appearance, while `base-select` is the select-specific base appearance in the draft. The compatibility productions preserve legacy widget keywords and are not a license to depend on every old keyword interoperably. The draft’s control-specific rules and decorative-versus-semantic effects matter: appearance changes rendering and does not remove HTML behavior, form participation, validation, role, or keyboard semantics. Rebuilding a native control after `none` means taking responsibility for the visible affordance and focus treatment. `appearance` is discrete, not smoothly interpolated.

### `accent-color`

Grammar: `auto | <color>`; initial `auto`; applies to all elements; inherited. `auto` delegates the accent choice to the user agent/platform. A color asks eligible native controls to use the author’s accent where that control’s native design uses an accent. It does not force every part of every control to that color. User agents may adapt the result for legibility and contrast; transparent colors are composited over the canvas system color by the Level 4 draft. It is a restrained way to theme browser controls while keeping their native interaction model, not a replacement for full custom styling.

## B. Text insertion caret

These properties affect the insertion marker in editable text, not the mouse pointer (`cursor`). They apply where a text caret can be rendered and are inherited as specified by the UI draft; support is not uniform for the newer shape and animation controls.

- `caret-color`: `auto | <color>`, initial `auto`. `auto` lets the user agent choose a visible caret color; a specified color requests one. Choose contrast against every editing background.
- `caret-animation`: `auto | manual`, initial `auto`. `auto` permits user-agent caret animation; `manual` disables UA-driven blink/fade behavior. It does not prevent author CSS animations from changing caret color. Avoid creating a flashing caret that harms readability or conflicts with reduced-motion/accessibility needs.
- `caret-shape`: `auto | bar | block | underscore`, initial `auto`. `auto` follows platform/context conventions; `bar` sits at the insertion point, `block` overlaps the next visible character (or follows the last visible character at the end), and `underscore` sits under the next visible character. Writing mode, direction, transforms, and glyph metrics affect orientation/placement.
- `caret`: shorthand grammar is `<'caret-color'> || <'caret-animation'> || <'caret-shape'>`. Each component may appear once in any order; omitted components reset to their initial values. Thus `caret: red` also resets animation and shape to `auto`. Longhands are clearer when only one aspect should change.

```css
.editor {
  caret-color: currentColor;
  caret-shape: bar;
  caret-animation: auto;
}
```

## C. Pointer affordance and hit testing

### `cursor`

Grammar: zero or more cursor images, each optionally followed by an X/Y hotspot, then one mandatory predefined fallback keyword: `[ <url> [<number> <number>]? , ]* <cursor-predefined>`. Initial `auto`; applies to all elements; inherited; animation is discrete. A URL image is tried in order. If it cannot be loaded or used, the next image is tried; the required final keyword is the fallback. Hotspots identify the pointer location relative to the image’s top-left; absent coordinates use the image’s intrinsic hotspot, or top-left if it has none. Out-of-range coordinates are clamped. Relative URLs resolve against the stylesheet.

The complete Level 4 predefined keyword set is: `auto`, `default`, `none`, `context-menu`, `help`, `pointer`, `progress`, `wait`, `cell`, `crosshair`, `text`, `vertical-text`, `alias`, `copy`, `move`, `no-drop`, `not-allowed`, `grab`, `grabbing`, `e-resize`, `n-resize`, `ne-resize`, `nw-resize`, `s-resize`, `se-resize`, `sw-resize`, `w-resize`, `ew-resize`, `ns-resize`, `nesw-resize`, `nwse-resize`, `col-resize`, `row-resize`, `all-scroll`, `zoom-in`, and `zoom-out`. These are semantic hints with platform-dependent renderings, not guaranteed identical icons. `auto` chooses from context; `none` hides the cursor and can make pointer location hard to perceive. Do not communicate an action only through cursor shape.

### `pointer-events`

For HTML boxes the interoperable values are `auto | none`; initial `auto`; applies to all elements; inherited. `none` excludes the element’s own boxes from pointer hit testing, allowing a visually underlying target to be hit. A descendant can explicitly use `pointer-events: auto`; events targeted at such a descendant can still pass through ancestors in capture/bubble phases, including an ancestor with `none`. This changes pointer targeting, not keyboard focus, tab order, disabled state, activation semantics, text selection, or accessibility-tree exposure. SVG has additional values; their effects outside SVG are not defined by this UI specification. Use `disabled`, inertness, or application logic for actual non-interaction, according to the intended semantics.

## D. Selection and inertness

### `user-select`

Level 4 grammar: `auto | text | none | contain | all`; initial `auto`; applies to all elements (the draft also specifies pseudo-element applicability as at-risk); not inherited. The used-value algorithm makes `auto` behave based on the parent and editing context, which can look like inheritance in common cases. `text` permits selection; `none` suppresses ordinary selection; `all` makes selection of a portion select the whole element; `contain` confines a selection that starts inside to the element’s boundary in the draft. Browser behavior and support for `contain` vary. `none` is not a security or copy-protection mechanism: scripts, browser tools, accessibility tools, or user-agent overrides can still expose text. Keep selection available for prose and code unless there is a narrow interaction reason to suppress it.

### `interactivity`

Grammar: `auto | inert`; initial `auto`; applies to all elements; inherited; discrete. `auto` defers inertness to the host language. `inert` makes the element and its flat-tree descendants inert. Inert content is removed from ordinary hit testing and text selection, editable descendants behave non-editably, and the subtree should be skipped by find-in-page; inert nodes generally cannot receive focus and are not exposed to accessibility APIs. The host language can force inertness independently: CSS cannot use `auto` to undo the inert state of the page behind a modal dialog. Do not place important content in an inert subtree unless it is also visually obscured and users have another way to understand the page. For a single form control, `disabled` is usually the semantically appropriate mechanism. This CSS property is not a substitute for testing HTML’s `inert` attribute, modal dialog behavior, focus management, or the accessibility tree.

## E. Interest timing

`interest-delay-start` and `interest-delay-end` each accept `normal | <time>`, initial `normal`, apply to all elements, and inherit. `normal` asks the UA for platform-appropriate, non-zero timing; a time fixes that delay. Start controls the delay before an interest event after a user shows interest; end controls the delay before losing interest. These concepts are consumed by host-language features such as Interest Invokers; the CSS values do not themselves create an invoker or event source.

`interest-delay` is the shorthand: one time/keyword sets both longhands; with two values, the first sets start and the second end. For example, `interest-delay: 150ms 300ms` delays opening and gives a longer grace period before closing. Keep delays usable with keyboard and touch; do not rely on hover timing as the only way to reveal essential information. These properties are new Level 4 draft features, so feature-detect and provide a functional fallback.

## F. Outlines and visible focus

An outline is painted over/around a box without taking layout space or causing reflow. It contributes to ink overflow and can enclose multiple fragments of a multiline element. User agents commonly draw outlines for `:focus-visible`. Keyboard users may depend on that indicator: never remove it without an equally visible replacement. Outline stacking and transformed-outline rendering have implementation-defined/undefined aspects in the specification.

- `outline-width`: `auto | <line-width>`; initial `medium`; non-inherited; applies to all elements. `<line-width>` includes non-negative lengths and the width keywords `thin`, `medium`, `thick`; `auto` lets the UA choose (especially useful for focus indication).
- `outline-style`: accepts border-style line values plus `auto`; initial `none`; non-inherited. `none` means no outline is drawn even if width/color are set. `auto` leaves the focus-outline presentation to the UA. Border-like styles include `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `inset`, and `outset` (as well as `hidden`/`none` syntax); not every style has the same useful rendering for outlines.
- `outline-color`: `auto | <color>`; initial `auto`; non-inherited. With `outline-style: auto`, `auto` represents the UA accent; otherwise it resolves to `currentColor` in the Level 4 draft. The old `invert` value is not part of the current grammar.
- `outline-offset`: `<length> | inset`; initial `0`; non-inherited. Positive lengths move the outline outward; negative lengths move it inward. `inset` is the new draft keyword and computes as the keyword. It can overlap content or be clipped when moved inward, so inspect focus rings at zoom and in dense layouts.
- `outline`: shorthand for `outline-width`, `outline-style`, and `outline-color`; accepts those components in any order, and resets omitted components. It deliberately does not include `outline-offset`, so offset cascades independently. `outline: none` removes the visual indicator; reserve it for a design with a reliable replacement.

```css
:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
```

## G. User resizing

`resize` accepts `none | both | horizontal | vertical | block | inline`; initial `none`; non-inherited; applies to scroll containers, with user agents permitted to offer resizing for some replaced elements. Physical directions stay horizontal/vertical; logical `block` and `inline` follow writing mode. Resizing can change the element’s inline style width/height, and author `!important` sizing can make the gesture appear ineffective. `resize` controls a user resizing affordance; it does not itself create scrollable overflow, and `overflow`/scroll behavior is a separate concern. Test whether the resize handle is available and usable on each target platform.

## H. Installed-app window dragging

`window-drag` accepts `none | move`; initial `none`; inherited; applies to all elements in the Level 4 Working Draft. `move` lets a region of an installed web application’s window initiate a native window move. While that gesture moves the window, the UA suppresses ordinary pointer/mouse/drag events for the moved region. This is not a general way for a normal web page to move a browser window, and it does not replace explicit controls. Mark interactive controls inside a draggable title region as non-draggable, and test the installed-app shell and platform behavior. The feature is new and experimental; do not assume universal availability.

## Cross-item comparison

## Choosing the right mechanism

| Need | Mechanism | What it does not do |
| --- | --- | --- |
| Theme native checkboxes/radios/progress controls lightly | `accent-color` | Does not recolor every native control part |
| Replace widget decoration | `appearance` | Does not erase the control’s semantics or behavior |
| Show insertion position while editing | `caret-*` | Does not style the mouse pointer |
| Change pointer feedback | `cursor` | Does not make an action accessible or implement it |
| Let pointer input pass through a visual overlay | `pointer-events` | Does not disable focus or keyboard activation |
| Make a subtree non-interactive | `interactivity: inert` or HTML inertness | Does not provide modal focus management by itself |
| Suppress selection in a small UI affordance | `user-select` | Does not protect content from copying |
| Preserve a visible keyboard location | `outline*` and `:focus-visible` | Does not consume layout space like a border |
| Offer a resize handle | `resize` | Does not guarantee all devices expose one |

## Examples

The outline and caret examples above demonstrate two distinct interaction cues. A CSS declaration that parses is not a guarantee that the browser exposes the same affordance on every platform.

## Common mistakes

- Treating pointer hit testing as disabled semantics.
- Removing focus indication without replacement.
- Using selection suppression as copy protection.
- Treating a Working Draft property as broadly available.
- Assuming native-control styling changes HTML semantics.

## Feature detection and debugging

`@supports (property: value)` can check whether the browser parses a declaration, for example `@supports (caret-shape: block) { ... }`. Parsing support is not proof that every interaction detail works as intended. Check computed styles, use real pointer and keyboard interaction, test system contrast/theme and zoom, and consult current compatibility data for each target browser. Progressive enhancement should leave core controls and content usable when a draft property is ignored.

## Knowledge checks with answers

1. Why is `pointer-events: none` not a disabled-state implementation? It changes pointer hit testing only; keyboard focus and semantics remain.
2. What happens to omitted components in `caret` and `outline`? Shorthands reset their longhands to their initial values.
3. Does `interactivity: auto` override a modal dialog’s host-language inertness? No. `auto` defers to the host language.
4. Why is `user-select: none` not copy protection? It only controls ordinary selection behavior and can be overridden or bypassed.
5. Why preserve a focus outline? Users navigating by keyboard need a visible indication of current focus.

## Sources

- [CSS Basic User Interface Module Level 4, 13 November 2026 Working Draft](https://drafts.csswg.org/css-ui-4/)
- [CSS Basic User Interface Module Level 3, published specification](https://www.w3.org/TR/css-ui-3/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
