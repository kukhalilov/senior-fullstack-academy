# CSS layout flexbox grid positioning and responsive design — Reference: CSS Overflow properties

# Scope and version

This lesson explains all 14 supplied properties in **CSS Overflow properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 8 names have an MDN Baseline label, 4 have Limited availability, and 3 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Overflow compares a box’s content with its scrollport or clip edge. Values determine whether excess content is visible, clipped, or scrollable; scroll containers then participate in wheel/touch navigation, scroll snapping, scrollbar allocation, and scroll chaining. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `-webkit-line-clamp` | Legacy prefixed line-clamping property. Its interoperable legacy behavior requires display: -webkit-box or -webkit-inline-box, -webkit-box-orient: vertical, and overflow: hidden; prefer the unprefixed line-clamp when its support meets the project need. Legacy behavior requires the WebKit box/orientation combination and overflow clipping; prefer line-clamp when its support is sufficient. **MDN support snapshot:** Legacy WebKit-compatible behavior; see line-clamp compatibility. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp) |
| `line-clamp` | The line-clamp CSS property allows limiting of the contents of a block to the specified number of lines. Optionally, it also allows inserting content into the last line to indicate that content was truncated. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp) |
| `overflow` | The overflow CSS shorthand property sets the desired behavior when content does not fit in the element's padding box (overflows) in the horizontal and/or vertical direction. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow) |
| `overflow-block` | The overflow-block CSS property sets what shows when content overflows the block start and block end edges of a box. This may be nothing, a scroll bar, or the overflow content. **MDN support snapshot:** Baseline 2025. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-block) |
| `overflow-clip-margin` | The overflow-clip-margin CSS property determines how far outside its bounds an element with overflow: clip may be painted before being clipped. The bound defined by this property is called the overflow clip edge of the box. **MDN support snapshot:** Limited availability. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-clip-margin) |
| `overflow-inline` | The overflow-inline CSS property sets what shows when content overflows the inline start and end edges of a box. This may be nothing, a scroll bar, or the overflow content. **MDN support snapshot:** Baseline 2025. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-inline) |
| `overflow-x` | The overflow-x CSS property sets what shows when content overflows a block-level element's left and right edges. This may be nothing, a scroll bar, or the overflow content. This property may also be set by using the overflow shorthand property. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-x) |
| `overflow-y` | The overflow-y CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content. This property may also be set by using the overflow shorthand property. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-y) |
| `scroll-axis-lock` | Draft CSS Overflow property that tells the user agent whether it may lock a scroll gesture on the element to one axis. The proposed values are auto and none; it applies to scroll containers and is not a stable cross-browser baseline. It is a proposal, not a replacement for touch-action or overscroll-behavior. **MDN support snapshot:** W3C Editor’s Draft; experimental and support varies; MDN marks it experimental. [MDN/spec](https://drafts.csswg.org/css-overflow-5/) |
| `scroll-behavior` | The scroll-behavior CSS property sets the behavior for a scrolling box when scrolling is triggered by the navigation or CSSOM scrolling APIs. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior) |
| `scroll-marker-group` | The scroll-marker-group CSS property controls whether a scroll container element has a ::scroll-marker-group pseudo-element generated. If present, the property also specifies whether the scroll marker group should be placed before or after the contents of the scroll group container in the default visual and tab order. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-marker-group) |
| `scroll-target-group` | The scroll-target-group CSS property specifies whether an element is a scroll marker group container. **MDN support snapshot:** Limited availability; MDN marks it experimental. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-target-group) |
| `scrollbar-gutter` | The scrollbar-gutter CSS property allows authors to reserve space for the scrollbar, preventing unwanted layout changes as the content grows while also avoiding unnecessary visuals when scrolling isn't needed. **MDN support snapshot:** Baseline 2024. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter) |
| `text-overflow` | The text-overflow CSS property sets how hidden overflow content is signaled to users. **MDN support snapshot:** Baseline. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow) |

# Cross-item comparison

`overflow: hidden` clips and creates a scroll container that can still be scrolled programmatically; `clip` clips without creating a scroll container. `overflow-x/y` use physical axes, while block/inline longhands follow writing mode. `line-clamp` limits visible lines; the prefixed legacy recipe has special dependencies. Scroll marker properties create navigation affordances and are still limited/draft features.

# Examples

For a decorative horizontal carousel, provide a keyboard-accessible alternative navigation method and visible focus. Use `overflow: auto` so content remains reachable when it does not fit; avoid clipping essential content.

```css
.carousel { overflow-x: auto; overflow-y: hidden; scroll-snap-type: inline mandatory; }
.carousel > * { scroll-snap-align: start; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `overflow: hidden` and `overflow: clip` behave identically for programmatic scrolling and formatting contexts.
- Clipping focus rings or content without an alternate way to reach it.
- Treating scroll markers as stable, universally supported UI.
- Assuming line clamping preserves all hidden text in every assistive-technology experience.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `-webkit-line-clamp`, `line-clamp`, `overflow`, `overflow-block`, `overflow-clip-margin`, `overflow-inline`, `overflow-x`, `overflow-y`, `scroll-axis-lock`, `scroll-behavior`, `scroll-marker-group`, `scroll-target-group`, `scrollbar-gutter`, `text-overflow`. Each has an individual definition and support link above.
2. **What should be checked beyond this concise description?** Full grammar, applicable boxes, inheritance, computed behavior, interactions, and the target browser compatibility data.
3. **What is the MDN status label’s date?** The local reference capture is dated 2026-11-16; consult current compatibility data for future production decisions.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 4 draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
- [CSS Display Level 4 draft](https://drafts.csswg.org/css-display-4/)
- [CSS Anchor Positioning Level 1 draft](https://drafts.csswg.org/css-anchor-position-1/)
