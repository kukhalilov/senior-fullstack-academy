# CSS layout flexbox grid positioning and responsive design — Big-picture orientation and mental model

# Problem and purpose

CSS layout turns a document’s boxes into a readable arrangement that adapts to available space, content, language, input method, and user settings. A layout is not a pile of coordinates: it is a set of formatting rules that respond to intrinsic content and constraints.

# Plain-language mental model

Imagine arranging bookshelves. Normal flow places boxes in a predictable sequence; flexbox arranges a row or column and shares space; grid creates row-and-column tracks; positioned layout anchors selected boxes to a containing block; overflow determines what happens when content does not fit. Responsive CSS changes constraints when the viewport or a component’s own container changes. The browser repeatedly computes these relationships as content and available space change.

CSS has independently evolving modules, not one monolithic annual release. This set uses the CSS Snapshot 2026 for the specification landscape, a local capture of the supplied 189-name inventory, and dated MDN descriptions/support labels. A Baseline label is not a promise for every browser or embedded webview; a W3C draft is not evidence of interoperable implementation. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How the parts fit together

1. The browser creates boxes from document elements and their computed `display` values.
2. A formatting context places boxes: flow, flex, grid, table, or another model.
3. Intrinsic sizes and constraints negotiate dimensions; min/max sizes and available space can change an apparently simple fraction or percentage.
4. Alignment distributes items, tracks, or free space on axes defined by layout and writing mode.
5. Positioning, stacking, clipping, and scrolling determine overlap and reachability.
6. Viewport and container conditions adapt the design while preserving content order and accessibility.

# Concept map

| Need | Primary model | Key question |
| --- | --- | --- |
| Sequential document content | Normal flow | Does content wrap, expand, and reflow naturally? |
| A one-dimensional control or item row | Flexbox | Which axis is primary, and how is free space shared? |
| Two-dimensional shared rows and columns | Grid | Which tracks are explicit, and how should intrinsic content size them? |
| Content that exceeds a box | Overflow and scrolling | Is it clipped, reachable, or a scroll container? |
| A local overlay or sticky item | Positioned layout | What is its containing block and scrollport? |
| Responsive component behavior | Container queries and fluid constraints | Does it respond to its own available inline size? |
| Internationalized layout | Writing modes and logical properties | Are dimensions expressed in inline/block axes? |

# End-to-end walkthrough

For a product page, keep semantic content in source order. Use grid for the overall content/sidebar relationship and a container query to collapse the sidebar when the component narrows. Within a row of actions, flexbox handles alignment and gaps. A badge can be positioned within a card’s containing block. A horizontal media rail can remain scrollable with snap points, but its content must still be reachable by keyboard and touch. At each step inspect intrinsic minimums, zoom, RTL/vertical writing modes, focus order, and narrow containers.

# When to use it and tradeoffs

Use normal flow for prose; flexbox when one axis is primary; grid when both axes and shared tracks matter; positioning for overlays and defined offsets; multicol for flowing text fragments. Prefer fluid constraints and container-aware rules over device-specific coordinate assumptions. More capable layouts bring sizing and source-order edge cases; test real content rather than only empty boxes.

# What later lessons cover

The concepts lesson builds the box, sizing, alignment, positioning, scrolling, and responsive mental model before the reference list. The 22 reference lessons explain every exact property in the manifest and mark experimental names. Practice and interview lessons ask you to diagnose layouts rather than memorize isolated declarations.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
