# CSS layout flexbox grid positioning and responsive design — Reference: CSS Scrollbars Styling properties

# Scope and version

This lesson covers the two supplied properties, `scrollbar-color` and `scrollbar-width`, from CSS Scrollbars Styling Level 1, a Candidate Recommendation Snapshot. The module deliberately controls only scrollbar color and approximate width; platform scrollbar structure and pixel-perfect styling remain outside its scope. Browser, operating-system, forced-color, and overlay-scrollbar behavior can affect the result.

# How this group fits the mental model

Scrollbars communicate that content can be navigated and where the viewport sits within it. These properties let a page make a limited visual adjustment while leaving control of much of the native UI to the browser and operating system. They do not create scrolling or reserve/remove layout space; those behaviors are defined by overflow and platform scrollbar mode.

# Supplied names explained

| Exact supplied property | Full behavior |
| --- | --- |
| `scrollbar-color` | Grammar: `auto \| <color>{2}`. Initial `auto`; applies to scroll containers; inherited. With two colors, the first colors the thumb and the second the track. `auto` leaves selection to the user agent, which should respect platform conventions and may consider `color-scheme`. A UA may ignore a supplied color if the platform scrollbar cannot be customized. A value set on the root element applies to the viewport; unlike `overflow`, a value on `body` is not propagated to the viewport. |
| `scrollbar-width` | Grammar: `auto \| thin \| none`. Initial `auto`; applies to scroll containers; not inherited. `auto` uses the default width (which users or the OS may customize); `thin` requests a thinner scrollbar without specifying a pixel size; `none` hides the scrollbar UI but leaves the element scrollable. Root-element values apply to the viewport; `body` values do not propagate. |

Both properties accept CSS-wide keywords. The exact scrollbar shape, internal parts, animation, and platform layout are intentionally unspecified. Classic scrollbars may consume layout space while overlay scrollbars may appear above content; these two properties do not choose that platform mode.

# Cross-item comparison

`scrollbar-color` changes thumb/track color; `scrollbar-width` requests one of three standardized width modes rather than a numeric length. Neither offers fine styling of buttons, corners, track pieces, or exact dimensions. Browser-specific scrollbar pseudo-elements may expose more detail in particular engines, but are outside this standards-based inventory and do not provide a portable substitute.

`scrollbar-width: none` is not equivalent to disabling scrolling: touch, wheel, keyboard, or script may still scroll the content. Hiding the visible control can make scrollability undiscoverable, so prefer visible scrollbars and adequate interaction targets unless a separate, clear, accessible control exists.

# Examples

```css
.results {
  scrollbar-color: #536dfe #e8eaf6; /* thumb, then track */
  scrollbar-width: auto;
}

/* A compact rail may request thin scrollbars, without an exact pixel width. */
.compact-rail {
  overflow: auto;
  scrollbar-width: thin;
}
```

Check contrast against the actual background, and test with keyboard, touch, zoom, high-contrast/forced-color settings, and the target operating systems. The user agent may prioritize user settings or ignore custom colors.

# Common mistakes

- Reversing the color order: the first color is the thumb, the second the track.
- Expecting a numeric width such as `8px`; the standard grammar only has `auto`, `thin`, and `none`.
- Assuming `thin` has the same physical size on every platform.
- Assuming `none` disables scrolling; it hides scrollbar UI only.
- Setting these on `body` and expecting the viewport scrollbar to inherit/receive them; the spec specifically does not propagate these values from `body`.
- Removing scrollbar cues without another discoverable way to navigate overflow content.
- Assuming standards-based properties style every scrollbar part or override OS accessibility settings.

# Knowledge checks with answers

1. **In `scrollbar-color: red blue`, what is red?** The thumb; blue is the track.
2. **Can `scrollbar-width` take `12px`?** No. Its standard values are `auto`, `thin`, and `none`.
3. **Does `scrollbar-width: none` prevent scrolling?** No. It hides the scrollbar UI but leaves scrolling possible.
4. **Which element’s value is propagated to the viewport?** The root element’s value; a value on `body` is not propagated by this specification.
5. **Why might a declared scrollbar color not appear exactly?** Native structures differ and a user agent may ignore colors it cannot apply or may honor platform/user presentation.

# Sources

- [CSS Scrollbars Styling Module Level 1](https://www.w3.org/TR/css-scrollbars-1/) — §§1–3 and accessibility appendix: scope, grammar, inheritance, root/body viewport behavior, platform limits, and usability cautions.
- [CSS Overflow Module Level 3](https://www.w3.org/TR/css-overflow-3/) — scroll-container and scrollbar layout context.
- [CSS Color Adjustment Module Level 1](https://www.w3.org/TR/css-color-adjust-1/) — `color-scheme` context referenced by scrollbar color behavior.
