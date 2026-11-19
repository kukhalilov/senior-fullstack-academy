# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css overflow properties

# Scope and version

This lesson covers the 13 names assigned to **Experimental css overflow properties**: `max-lines`, `block-ellipsis`, `continue`, and ten physical/logical `overflow-clip-margin` longhands. All are defined in the current CSS Overflow Level 4 Editor’s Draft checked 2026-11-19. The document is work in progress; individual properties may have different implementation status, and a property’s appearance in a draft is not evidence of shipping browser support. The related `overflow-clip-margin` shorthand is covered in the main CSS Overflow reference.

# How this group fits the mental model

These properties extend two established ideas: where the browser clips painted overflow, and what happens to content beyond a line or fragmentation break. Clip-margin longhands adjust the **overflow clip edge**; they do not create a scroll mechanism or enlarge layout size. `max-lines`, `block-ellipsis`, and `continue` cooperate with the `line-clamp` shorthand and fragmentation model to determine where content stops, what marker appears, and whether remaining content is visually suppressed or discarded.

Treat each as a draft feature. The `overflow-clip-margin` longhands expand a current Level 4 proposal and are not necessarily supported wherever the base property exists. The line-control longhands are not a drop-in implementation-independent replacement for established clamping recipes. Verify actual target browsers and provide access to important content.

# Supplied names explained

| Exact supplied name | Role in the current draft | Important details |
| --- | --- | --- |
| `overflow-clip-margin-block` | Logical shorthand for block-start and block-end clip-margin controls. | Uses `<visual-box> || <length>` under the Level 4 draft’s restricted shorthand grammar. The visual-box sets the origin edge and length expands/shrinks the clip edge; logical sides follow writing mode. |
| `overflow-clip-margin-block-start` | Controls the block-start clip-edge offset. | Initial `0px`; draft accepts a visual-box and/or length. It maps with writing mode and only affects clipping geometry, not the box’s layout size. |
| `overflow-clip-margin-block-end` | Controls the block-end clip-edge offset. | Same grammar and distinction as block-start, on the opposite logical edge. |
| `overflow-clip-margin-inline` | Logical shorthand for inline-start and inline-end clip-margin controls. | Follows the inline axis, so direction/writing mode determine which physical sides it affects. It is not a scroll-padding property. |
| `overflow-clip-margin-inline-start` | Controls the inline-start clip-edge offset. | Same visual-box/length model, mapped to inline-start for the element’s writing mode and direction. |
| `overflow-clip-margin-inline-end` | Controls the inline-end clip-edge offset. | Same model at inline-end. Avoid assuming it always means physical right. |
| `overflow-clip-margin-top` | Controls the physical top clip-edge offset. | Physical-side longhand; it does not remap for vertical writing modes. |
| `overflow-clip-margin-right` | Controls the physical right clip-edge offset. | Physical-side longhand; contrast with logical inline-end, which changes mapping in RTL/vertical writing. |
| `overflow-clip-margin-bottom` | Controls the physical bottom clip-edge offset. | Physical-side longhand; contrast with logical block-end. |
| `overflow-clip-margin-left` | Controls the physical left clip-edge offset. | Physical-side longhand; contrast with logical inline-start. |
| `max-lines` | Sets a line-based clamp point or a forced break in a fragmentation container. | Draft value is a positive integer with optional `auto`; initial is `auto`. For line clamping, the point follows the Nth in-flow line box when a later clamp opportunity exists. It does not necessarily mean “show exactly N lines” when no eligible content follows. |
| `block-ellipsis` | Supplies a block-axis overflow marker at a clamp/region break. | Draft values: `no-ellipsis`, `ellipsis`, or a string. It affects the line immediately before a clamp/region break in the relevant formatting context; inherited behavior and formatting-context boundaries matter. An empty string acts like no ellipsis. |
| `continue` | Chooses how excess content after a clamp/break is handled. | Draft values: `normal`, `collapse`, or `discard`. `normal` keeps usual overflow handling; `collapse` creates a line-clamp container and visually suppresses later content; `discard` turns the box into a fragmentation container and does not render content after the first applicable break. `discard` is marked at risk in the draft. |

# Cross-item comparison

The three clip-margin shorthands/longhands (`overflow-clip-margin-block`, `overflow-clip-margin-inline`, and the physical/logical edge properties) change the clip boundary only. They do not affect scrollport sizing, scroll snapping, or content flow. The base `overflow-clip-margin` property and its clip-edge behavior are covered in the main Overflow lesson; this lesson records the newer longhand inventory from the Level 4 draft.

`max-lines` selects a clamp/break point, `block-ellipsis` marks the interruption, and `continue` determines the treatment of content beyond it. The `line-clamp` shorthand combines line limit and marker/continuation controls; `-webkit-line-clamp` retains a legacy compatibility mode whose behavior is intentionally quirky. `continue: collapse` preserves suppressed content in the document and accessibility tree under the draft model; `continue: discard` does not render content after the fragmentation break. Neither should be used without checking keyboard behavior and assistive-technology output.

# Examples

The following illustrates draft grammar only. Use it for experiments behind a support check, not as a guarantee that the target browser implements every declaration.

```css
.experimental-excerpt {
  max-lines: 3;
  block-ellipsis: " Read more";
  continue: collapse;
}

.focus-decoration {
  overflow: clip;
  overflow-clip-margin-inline: 0.25rem;
}
```

For user-facing truncation, pair any supported visual clamp with a real control that exposes the complete text. Do not assume a marker string alone provides an accessible disclosure action.

# Common mistakes

- Treating the current Editor’s Draft as a stable Recommendation or support guarantee.
- Assuming the new clip-margin logical longhands work in every browser that supports the base `overflow-clip-margin` property.
- Confusing clip-margin with `scroll-padding` or `scroll-margin`; those affect scroll snap/target geometry, not paint clipping.
- Assuming a clip margin adds layout space or makes clipped content scrollable.
- Assuming `max-lines: N` must visibly produce N lines even if no clamp opportunity follows the Nth line.
- Treating `block-ellipsis` as the same feature as inline `text-overflow`.
- Treating `continue: collapse` and `continue: discard` as equivalent; one visually suppresses content, the other discards after a fragmentation break.
- Treating line-clamp or visual clipping as a complete accessibility pattern.

# Knowledge checks with answers

1. **What does `overflow-clip-margin-inline-start` change?** The clip edge’s inline-start geometry under the draft model. It does not add layout size or allow scrolling.
2. **When will a clip-margin block/inline property map to a different physical side?** When the element’s writing mode and/or direction changes; logical properties follow those axes.
3. **Why might `max-lines: 3` not visibly clamp a three-line element?** A clamp point must occur after the third in-flow line box; if no eligible content/opportunity follows it, the draft specifies no line-based clamp point.
4. **How do `collapse` and `discard` differ?** `collapse` visually suppresses content after the clamp while keeping it in the document/accessibility model described by the draft; `discard` stops rendering content after a fragmentation break.
5. **Is `block-ellipsis` a click-to-expand control?** No. It inserts a string/ellipsis marker; functionality and access to the full text need separate design.

# Sources

- [CSS Overflow Module Level 4, current Editor’s Draft](https://drafts.csswg.org/css-overflow-4/) — overflow-clip-margin longhand inventory/grammar, `max-lines`, `block-ellipsis`, `continue`, line-clamp grammar and legacy compatibility. Work in progress; `continue: discard` is marked at risk.
- [CSS Overflow Module Level 3, current Editor’s Draft](https://drafts.csswg.org/css-overflow-3/) — base overflow clip-edge model and distinction between clipping and scrolling.
- [CSS Break Module Level 3](https://drafts.csswg.org/css-break-3/) — fragmentation containers and break behavior.
- [CSS Logical Properties and Values Level 1](https://www.w3.org/TR/css-logical-1/) — logical axis mapping versus physical top/right/bottom/left sides.
- [MDN CSS Overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_overflow) and [line-clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp) — established behavior, current compatibility and legacy syntax notes.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity snapshot, not an implementation table.
