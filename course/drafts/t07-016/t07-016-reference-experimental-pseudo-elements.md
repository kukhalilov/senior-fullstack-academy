# CSS selectors at-rules cascade values and box model — Reference: Experimental pseudo-elements in the pinned MDN index

## Scope and version

This list is limited to the entries categorized as experimental in the pinned [MDN selector inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/selectors.json). Check the current specification and target-browser status before use; a name's presence in the index does not imply interoperable implementation.

## How this group fits the mental model

These pseudo-elements expose timed-media regions or scroll-driven navigation markers. They can create useful styling hooks where the platform generates UI, while leaving ownership and exact lifecycle behavior with the browser.

## Supplied names explained

- **`::cue-region`** — Targets a WebVTT cue region used to position/group captions or subtitles. Its styling model is limited and depends on media/cue support.
- **`::cue-region()`** — Targets cue regions satisfying the supported cue-region selector argument. The argument grammar is not a general CSS selector list; consult the applicable WebVTT/CSS definition and compatibility data.
- **`::scroll-marker`** — Represents a marker generated for a scroll container's snap/navigation content, where the scroll-marker feature is implemented. It is associated with CSS-generated navigation, not a DOM list item.
- **`::scroll-marker-group`** — Represents a group of generated scroll markers for a scroll container; its position and behavior depend on the relevant scroll-marker specification and implementation.

## Cross-item comparison

The cue-region selectors style timed text regions provided by media tracks. Scroll marker pseudo-elements expose navigation UI derived from scrollable content and scroll-related CSS. Neither family should be required for basic captions, access to content, or navigation; ensure the baseline remains understandable without these generated parts.

## Examples

Keep the underlying media captions and content usable even if these experimental selectors are ignored:

```css
/* Baseline caption styling uses the broadly established cue hook. */
video::cue { color: white; background-color: black; }

/* Optional scroll-navigation styling should be tested behind support checks. */
@supports selector(::scroll-marker) {
  .gallery::scroll-marker { scroll-margin-inline: 1rem; }
}
```

The second example illustrates progressive enhancement only; verify the syntax, generated box model, accessibility exposure, and support for the intended target browsers before adopting it.

## Common mistakes

- Assuming the scroll-marker proposal has the same support or syntax as established list markers.
- Using generated scroll controls without checking keyboard and assistive-technology exposure.
- Treating cue-region selectors as ordinary element selectors.
- Depending on browser-generated markers instead of providing usable baseline navigation.

## Knowledge checks with answers

1. **What kind of content does `::cue-region` address?** A WebVTT cue region in timed media.
2. **Are scroll markers DOM nodes authored by the developer?** No; they are generated pseudo-elements associated with the scroll-marker feature.
3. **What should be checked before shipping these selectors?** Current specification syntax, browser support, generated behavior, and keyboard/accessibility behavior.
