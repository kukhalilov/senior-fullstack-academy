# CSS layout flexbox grid positioning and responsive design — Reference: CSS Anchor Positioning properties

# Scope and version

This lesson explains all 8 supplied properties in **CSS Anchor Positioning properties** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. 8 names have an MDN Baseline label, 0 have Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it. Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Anchor positioning relates an out-of-flow positioned box to a named anchor box, allowing popovers and tooltips to follow their trigger without script measuring coordinates. Fallback options handle available space, but the anchor relationship, containing block, and scope must be correct. The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `anchor-name` | The anchor-name CSS property enables defining an element as an anchor element by giving it one or more identifying anchor names. Each name can then be set as the value of a positioned element's position-anchor property to associate it with the anchor. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-name) |
| `anchor-scope` | The anchor-scope CSS property can be used to limit the scope in which a positioned element can be associated with anchor elements to a particular subtree. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-scope) |
| `position-anchor` | The position-anchor CSS property specifies the default anchor element for a positioned element. This default is used by position-area and position-try, and by anchor functions (anchor() and anchor-size()) when no <anchor-name> argument is provided to those functions. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor) |
| `position-area` | The position-area CSS property enables an anchor-positioned element to be positioned relative to the edges of its associated anchor element by placing the positioned element on one or more tiles of an implicit 3x3 grid, where the anchoring element is the center cell. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-area) |
| `position-try` | The position-try CSS shorthand property corresponds to the position-try-order and position-try-fallbacks properties. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try) |
| `position-try-fallbacks` | The position-try-fallbacks CSS property enables you to specify a list of one or more alternative position try fallback options for anchor-positioned elements to be placed relative to their associated anchor elements. When the element would otherwise overflow its inset-modified containing block, the browser will try placing the positioned element in these different fallback positions, in the order provided, until it finds a value that stops it from overflowing its container or the viewport. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks) |
| `position-try-order` | The position-try-order CSS property allows you to prioritize the position-try-fallbacks option applied to an anchor-positioned element when it first renders, based on which option creates the most space around the element in the given direction. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-order) |
| `position-visibility` | The position-visibility CSS property enables conditionally hiding an anchor-positioned element depending on, for example, whether it is overflowing its containing element or the viewport. **MDN support snapshot:** Baseline 2026. [MDN/spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-visibility) |

# Cross-item comparison

`anchor-name` exports names; `position-anchor` selects a default anchor; `anchor-scope` limits name visibility; `position-area` places a box in a logical tile around the anchor; `position-try-fallbacks` and `position-try-order` handle alternative placement; `position-try` combines the latter; `position-visibility` provides anchor/overflow conditions. Anchor functions also exist but are outside this manifest.

# Examples

Position a non-modal tooltip relative to its button, provide flip fallback styles for viewport edges, and keep dismissal, focus, and accessible description behavior in HTML/ARIA.

```css
.trigger { anchor-name: --trigger; }
.tip { position: fixed; position-anchor: --trigger; position-area: block-end; position-try-fallbacks: flip-block; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming an anchor name is globally visible across every scope.
- Forgetting anchor positioning applies to positioned boxes and is not a replacement for interaction semantics.
- Hard-coding viewport coordinates instead of considering writing mode and fallback.
- Assuming every target browser supports the full feature set identically.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `anchor-name`, `anchor-scope`, `position-anchor`, `position-area`, `position-try`, `position-try-fallbacks`, `position-try-order`, `position-visibility`. Each has an individual definition and support link above.
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
