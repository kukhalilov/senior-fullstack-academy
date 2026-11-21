# CSS selectors at-rules cascade values and box model — Reference: Experimental and draft pseudo-elements in the pinned MDN index and newer CSS editor drafts

## Scope and version

This lesson starts with the names categorized as experimental in the pinned [MDN selector inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json) and adds pseudo-elements introduced in newer editor drafts that are not yet covered by that snapshot. Sources were checked on 2026-11-19 against the [WebVTT specification](https://www.w3.org/TR/webvtt1/), [CSS Overflow Level 5](https://drafts.csswg.org/css-overflow-5/), [CSS Pseudo-Elements Level 4](https://drafts.csswg.org/css-pseudo-4/), and [CSS Form Control Styling Level 1](https://drafts.csswg.org/css-forms-1/). These drafts can change, and their listed names do not imply interoperable support. The current MDN index additions **::column**, **::scroll-button()**, and **::search-text** are covered in the adjacent [current-index pseudo-element reference](t07-016-reference-current-index-pseudo-elements.md).

## How this group fits the mental model

Pseudo-elements expose generated rendering targets that do not have ordinary author-created DOM nodes. Some are generated only when a related property or control state enables them; others are host-language features such as WebVTT regions. Their generated boxes can participate in layout, focus, navigation, and accessibility semantics in specification-specific ways. Treat each proposal as a distinct feature, preserve semantic HTML and usable fallback behavior, and test the exact browser versions and assistive technologies that matter to the application.

## Supplied names explained

### WebVTT cue regions

- **::cue-region** — Matches WebVTT cue-region objects associated with a video’s text track, not an HTML element region. Region styling uses the same permitted property set as ::cue; applying it to a non-video element has no effect under WebVTT.
- **::cue-region(#id)** — Selects regions whose WebVTT region identifier matches the given ID. The argument is not a general CSS selector: WebVTT defines matching for an ID selector only. This is distinct from ::cue(selector), which targets supported inline cue nodes.

WebVTT regions are subareas of the video viewport used to group and position cues, often for scrolling captions. A cue must refer to a declared region by its WebVTT region ID; a cue without a region is rendered independently. Regions have their own width, line count, anchors, and scroll mode. Region support is browser-dependent, so ordinary cue styling and accessible captions remain the baseline.

### Scroll navigation markers

- **::scroll-marker** — A potential marker generated on an originating content element when its content is not none and its nearest scroll-container ancestor establishes a marker group. Activating the marker scrolls to its originating element. It is not a list-item bullet.
- **::scroll-marker-group** — A generated group container on a scroll container when scroll-marker-group is not none. The property can place the group before or after the scroller and select links or tabs interaction mode; a browser provides the relevant focus and navigation behavior.

The CSS Overflow Level 5 editor draft also specifies scroll-target-group for grouping authored links that already target scroll positions, and :target-current, :target-before, and :target-after for active-marker states. These names are covered in their separate pseudo-class/property inventories. Scroll markers can provide a table of contents, carousel pagination, or tab-like navigation, but generated UI must remain understandable and operable with keyboard and assistive technology. The specification is still an editor draft; support may be partial and can change.

### Newer pseudo-elements in CSS editor drafts

- **::view-transition-group-children(name)** — Added by View Transitions Level 2. It is generated as a container for descendant transition groups when nested view-transition groups are established. It lets authors preserve effects such as clipping or transforms across a nested snapshot tree; it is not the old or new snapshot itself.
- **::interest-button** — Proposed by CSS Pseudo-Elements Level 4 as an optional generated affordance for showing interest in an originating element. It is intentionally not focusable and is omitted from the accessibility tree, so never make it the only way to discover or activate important content. The host language controls what showing interest does.
- **::first-letter::prefix and ::first-letter::suffix** — At-risk sub-pseudo-elements in CSS Pseudo-Elements Level 4 for punctuation associated with a typographic first letter. They are nested under ::first-letter, not independent pseudo-elements, and their exact creation can depend on inline layout and user-agent handling.

### Newer form-control pseudo-elements in CSS Forms Level 1

The following names are in the CSS Form Control Styling Level 1 editor draft. They describe internal control parts; they are not a portable contract for every native widget. Availability can depend on the control type, its appearance mode, the user agent, and evolving specification status.

- **::slider-thumb** — The user-adjustable thumb of slider-like controls such as range inputs; it is typically rendered as a circular handle.
- **::slider-track** — The full track containing progressed and unprogressed portions.
- **::slider-fill** — The progressed portion of the track. For indeterminate progress, the draft requires an inline size of zero.
- **::field-content** — The editable-text part of text fields, textareas, and other controls when the user agent exposes it. Its relationship with placeholder content and autofill remains under active specification discussion.
- **::reveal-icon** — A user-agent-provided control that temporarily reveals obscured sensitive text, when the browser provides one. The user agent can remove it to reduce accidental disclosure; do not treat it as the only secure reveal mechanism.
- **::clear-icon** — A user-agent-provided control that clears an input when activated. The draft suppresses it for appearance: textfield.
- **::step-control** — The container for increment/decrement buttons in a number input.
- **::step-up** — The number-input button that increments the value.
- **::step-down** — The number-input button that decrements the value.
- **::field-component** — A date/time input component holding one localized part, such as month, day, or year. The parts and ordering vary with locale and host-language control structure.
- **::field-separator** — A user-agent-provided separator between localized date/time components, when such a part exists.
- **::color-swatch** — The color-display part of a color input.

These names belong to the draft inventory even where current browsers expose older vendor-specific pseudo-elements instead. Do not assume a standard-looking name is implemented, or that a control’s internal part tree matches another engine. Check the relevant control-specific draft and actual support before relying on styling.

## Cross-item comparison

WebVTT cue regions belong to the media text-track rendering model. Scroll markers are generated navigation targets grouped by a scroll container; their intended interaction resembles links or tabs, depending on the draft mode. Form-control pseudo-elements expose browser-owned widget parts and depend on a control’s supported appearance model. View-transition group children exist only in a nested temporary snapshot tree. The interest button is intentionally not a keyboard/accessibility control. The ::first-letter::prefix/suffix names are sub-pseudo-elements of typography. These families have different origins and support status; no single fallback strategy covers all of them.

## Examples

The WebVTT region argument is an ID selector, as defined by WebVTT:

    video::cue-region(#captions) {
      color: white;
      background-color: rgb(0 0 0 / 85%);
    }

The scroll-marker example follows the CSS Overflow Level 5 draft structure. Its support query checks both the property and selector syntax; it still does not replace browser testing or accessible navigation review.

    @supports (scroll-marker-group: after) and selector(.gallery > article::scroll-marker) {
      .gallery {
        scroll-marker-group: after;
      }

      .gallery > article::scroll-marker {
        content: "";
        inline-size: 1rem;
        block-size: 1rem;
        border-radius: 50%;
        background: gray;
      }

      .gallery > article::scroll-marker:target-current {
        background: black;
      }
    }

Provide a semantic fallback such as a list of ordinary links to each section; a feature query tests whether the browser accepts syntax, not whether every behavior and accessibility detail is complete.

## Common mistakes

- Assuming a CSS editor-draft name has shipped or is interoperable because it appears in a reference index.
- Treating ::cue-region(#id) as accepting arbitrary class, attribute, or relational selectors; WebVTT defines ID matching only.
- Applying ::scroll-marker to the scroll container instead of the elements that should become scroll targets, or forgetting that the container must generate a marker group.
- Treating ::scroll-marker-group as an ordinary author-created list rather than a generated group with draft-defined interaction semantics.
- Using generated markers as the only navigation path or omitting keyboard and screen-reader review.
- Assuming form-control internals, localized date/time ordering, or native picker support are identical across engines.
- Using ::interest-button as an accessible or keyboard-focusable control; the draft explicitly excludes it from both.
- Treating ::first-letter::prefix or ::first-letter::suffix as stable, independent selectors; the draft marks these features at risk.
- Expecting @supports selector(...) to prove complete feature behavior, visual correctness, or assistive-technology support.

## Knowledge checks with answers

1. **What does ::cue-region(#captions) match?** A WebVTT region with the matching region ID on the video’s text track; the argument is not a general selector list.
2. **What enables generated ::scroll-marker boxes?** A marker’s computed content must generate a box and its nearest scroll container must establish a non-none scroll-marker-group.
3. **Can a generated marker replace semantic links or a keyboard-tested navigation interface?** No. Preserve a complete content/navigation baseline and verify the generated interaction in supported browsers and assistive technology.
4. **What does ::view-transition-group-children(name) represent?** A nested transition-group container in the Level 2 snapshot tree, used to preserve group-level effects such as clipping.
5. **Should ::interest-button be the only way to reveal or activate a feature?** No. The draft makes it non-focusable and absent from the accessibility tree.
6. **Are the CSS Forms Level 1 control-part names guaranteed to work on every browser’s native widgets?** No. They are draft hooks whose implementation depends on browser, control, and appearance mode.

### Full syntax inventory

- ::cue-region
- ::cue-region()
- ::scroll-marker
- ::scroll-marker-group
- ::view-transition-group-children()
- ::interest-button
- ::first-letter::prefix
- ::first-letter::suffix
- ::slider-thumb
- ::slider-track
- ::slider-fill
- ::field-content
- ::reveal-icon
- ::clear-icon
- ::step-control
- ::step-up
- ::step-down
- ::field-component
- ::field-separator
- ::color-swatch
