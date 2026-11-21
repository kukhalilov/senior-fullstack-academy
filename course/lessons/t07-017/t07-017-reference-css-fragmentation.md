# CSS layout flexbox grid positioning and responsive design — Reference: CSS Fragmentation properties

# Scope and version

This lesson covers the six core properties—`box-decoration-break`, `break-after`, `break-before`, `break-inside`, `orphans`, and `widows`—plus the three legacy aliases `page-break-after`, `page-break-before`, and `page-break-inside`. CSS Fragmentation Level 3 defines page, column, and region fragmentation; its 2018 Candidate Recommendation marked region values at-risk. The values remain in the current published text, but region fragmentation is not a broadly available layout context. User agents can relax break preferences when a layout cannot satisfy all constraints.

# How this group fits the mental model

A fragmentainer is a finite container that receives part of a continuous flow: a printed page, a multicol column, or (in the draft model) a region. Fragmentation chooses where to split content while trying to honor forced breaks, avoidance requests, widow/orphan line counts, and content fit. Avoidance is a preference, not permission to overflow an entire page or make content unreachable.

Break-before/after govern the boundaries around boxes; break-inside governs splits within a box; widows/orphans influence line-level breaks; box-decoration-break controls how visual decoration is drawn on the resulting fragments. The first set influences fragmentation decisions; the last affects fragment painting/box appearance.

# Supplied names explained

## Break controls

| Exact supplied property | Values and behavior |
| --- | --- |
| `break-before` | `auto`, generic `avoid`, page values `avoid-page`, `page`, `left`, `right`, `recto`, `verso`, column values `avoid-column`, `column`, and region values `avoid-region`, `region`. Initial `auto`; non-inherited. Applies to block-level boxes, grid/flex items, table row groups/rows and other normal-flow boxes as specified; it does not force a break before an absolutely positioned box. `auto` adds no constraint; avoid values discourage a break; forced values require a break in the named fragmentation context. |
| `break-after` | Same grammar and core behavior as `break-before`, applied after the generated box. Break values on the first/last in-flow child can propagate to the parent, subject to layout-mode-specific rules. |
| `break-inside` | `auto`, `avoid`, `avoid-page`, `avoid-column`, and draft `avoid-region`; initial `auto`; non-inherited. It adds a constraint against splitting the principal box. It cannot prohibit every break in all situations. |
| `page-break-before`, `page-break-after`, `page-break-inside` | Legacy page-break aliases retained for compatibility. `page-break-before`/`after` accept `auto`, `always`, `avoid`, `left`, and `right`; `always` maps to a forced page break. `page-break-inside` accepts `auto` and `avoid`. Use the modern `break-*` properties for new code; these aliases express page behavior and do not provide the modern column/region value families. |

`page` only has an effect in paginated layout; `column` only in a multicol context; region values apply only to region flows. `left`, `right`, `recto`, and `verso` force one or two page breaks as necessary to place the next page on the requested side of a spread. The legacy aliases are kept for existing stylesheets; prefer modern `break-*` properties in new CSS.

When constraints conflict, forced break values take precedence over avoidance. The position and type of competing forced breaks also matter; a forced page break is not the same as a forced column break. Avoidance can be relaxed if necessary to make progress and fit content.

## Line-count controls

| Exact supplied property | Values and behavior |
| --- | --- |
| `orphans` | Positive integer; initial `2`; inherited. Sets the minimum number of lines of a block container’s inline formatting context to remain at the bottom of a fragment before a break. Zero and negative values are invalid and the declaration is ignored. |
| `widows` | Positive integer; initial `2`; inherited. Sets the minimum number of lines of that block to appear at the top of the next fragment after a break. Zero and negative values are invalid and ignored. |

If the block has fewer lines than the requested count, the draft says keep all of its lines together where possible. These requirements participate in break optimization and can be relaxed when content/fragmentainer size makes them impossible.

## Fragment decoration

| Exact supplied property | Values and behavior |
| --- | --- |
| `box-decoration-break` | `slice \| clone`; initial `slice`; non-inherited; applies to all elements; discrete. `slice` treats the box as continuous and then cuts it at breaks: no new border/padding is inserted at the cut and backgrounds are positioned as if the box were unbroken. `clone` independently wraps every fragment with border, padding, background, radius, and shadow. Cloned margins on block-level boxes are truncated as defined by the draft. |

For inline content split across lines, whether an edge counts as the broken edge follows the parent’s inline progression direction. This is subtle in RTL and mixed-direction text.

# Cross-item comparison

Use `break-before: page` for a hard print-section start; `break-before: avoid-page` only discourages a page break at that boundary. Use `break-inside: avoid-page` to try to keep a small card together, but avoid it on a box taller than a page. `orphans`/`widows` are line-count controls, not box-level keep-together rules. `box-decoration-break: clone` repeats decoration but does not itself prevent fragmentation.

# Examples

```css
@media print {
  h2 {
    break-after: avoid-page;
  }

  .short-callout {
    break-inside: avoid-page;
    box-decoration-break: clone;
  }

  p {
    orphans: 3;
    widows: 3;
  }
}
```

Check the generated PDF/print result: rules can be relaxed, font metrics change line counts, and a callout taller than a page must split or overflow regardless of avoidance.

# Common mistakes

- Treating `avoid` as an absolute prohibition or forced break as applying to every fragmentation context.
- Confusing `break-before`/`break-after` (between boxes) with `break-inside` (within a box).
- Expecting `column` to work in print pages or `page` to create a column break.
- Assuming `orphans` and `widows` count DOM elements; they count formatted lines in an inline formatting context.
- Setting `orphans: 0` or `widows: 0`; those declarations are invalid.
- Expecting `box-decoration-break: clone` to keep a box together.
- Assuming region values describe a broadly implemented layout system; region fragmentation was marked at-risk and the context is not broadly available.
- Forgetting that RTL parent direction changes which inline fragment edge is considered broken for decoration.

# Knowledge checks with answers

1. **Which property requests no split inside a small card?** `break-inside: avoid` or a context-specific value such as `avoid-page`; it is a preference and may be relaxed.
2. **What does `break-before: column` do outside multicol?** Nothing; column values only affect multicol fragmentation.
3. **What do widows and orphans count?** Lines at the top and bottom of adjacent fragments, respectively.
4. **Can widow/orphan constraints always be satisfied?** No. The algorithm can relax constraints when required by content and fragmentainer size.
5. **What changes between `slice` and `clone`?** Slice paints one continuous box cut at fragment boundaries; clone paints each fragment with its own decoration.
6. **Does `box-decoration-break: clone` avoid page breaks?** No; it only changes how decoration is drawn when a break occurs.

# Sources

- [CSS Fragmentation Module Level 3](https://www.w3.org/TR/css-break-3/) — §§2–5: fragmentainers, break properties/values, optimization, widows/orphans, and box-decoration-break.
- [CSS Multi-column Layout Module Level 1](https://www.w3.org/TR/css-multicol-1/) — column fragmentation context.
- [CSS Writing Modes Level 4](https://www.w3.org/TR/css-writing-modes-4/) — inline progression and writing-direction mapping.
