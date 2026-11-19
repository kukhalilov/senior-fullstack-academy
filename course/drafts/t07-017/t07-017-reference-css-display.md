# CSS layout flexbox grid positioning and responsive design — Reference: CSS Display properties

# Scope and version

This lesson explains all 5 supplied property names in **CSS Display properties**. The MDN support labels were rechecked on 2026-11-19: `display`, `order`, and `visibility` are Baseline; `reading-flow` and `reading-order` are Limited availability and marked Experimental. Labels can overlap. In addition, `display: grid-lanes`/`inline-grid-lanes` and `visibility: force-hidden` are defined in current CSS Working Group drafts and should be treated as emerging syntax. A listed value or draft definition does not guarantee support in a target browser or embedded webview. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Display establishes an element's outer participation and the layout model for its children. It controls box generation as well as flow, flex, grid, table, and emerging grid-lanes models; it is not just a visibility toggle. `order` changes layout order for flex/grid items, while the experimental `reading-flow`/`reading-order` pair can separately define reading and sequential navigation order. `visibility` hides generated boxes without normally removing their allocated space. The overview and concepts lessons explain the surrounding layout model; this catalog connects each supplied property to its exact role and important values.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
| `display` | Selects the box-generation and formatting roles: commonly an outer `block`/`inline` role plus an inner `flow`, `flow-root`, `flex`, `grid`, or `table` model, with list-item, internal table/ruby, legacy, `contents`, and `none` forms. The multi-keyword syntax makes outer and inner roles explicit (for example, `inline flex`); browsers also accept common legacy single-keyword forms such as `inline-flex`. CSS Grid 3 drafts `grid-lanes`/`inline-grid-lanes` for masonry-like lane placement; treat those as experimental and keep a fallback. `none` removes the element and descendants from box generation; `contents` removes the element's principal box while its contents still generate boxes, with accessibility-tree behavior requiring care. **MDN support snapshot:** Baseline for core `display` behavior. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display) · [CSS Display 4](https://drafts.csswg.org/css-display-4/) · [CSS Grid 3](https://drafts.csswg.org/css-grid-3/) |
| `order` | An integer (initial value `0`) that controls the layout order of flex and grid items; ties use order-modified document order. It changes visual layout placement, not DOM/source order by itself. If a parent uses a non-`normal` `reading-flow` value, `order` also participates in some `flex-*` and `grid-*` reading-flow calculations. **MDN support snapshot:** Baseline. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order) · [CSS Display 4](https://drafts.csswg.org/css-display-4/) |
| `reading-flow` | On a block, flex, or grid container, controls the reading/navigation sequence without changing visual layout or paint order. Values include `normal`, `source-order`, `flex-visual`, `flex-flow`, `grid-rows`, `grid-columns`, and `grid-order`; some values apply only to the corresponding layout. `reading-flow` must be non-`normal` for child `reading-order` values to participate. The current Editor's Draft defines speech/reading and sequential focus behavior, but assistive-technology support and browser interoperability must be tested. **MDN support snapshot:** Limited availability; Experimental. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/reading-flow) · [CSS Display 4](https://drafts.csswg.org/css-display-4/) |
| `reading-order` | An integer ordinal (initial value `0`) for a direct block-level, flex-item, or grid-item child of a reading-flow container. Lower numbers are read/navigated first; ties follow the parent's `reading-flow`. It changes reading and sequential-navigation order, not visual placement. Positive `tabindex` values are not a substitute and may be overridden by these rules. **MDN support snapshot:** Limited availability; Experimental. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/reading-order) · [CSS Display 4](https://drafts.csswg.org/css-display-4/) |
| `visibility` | `visible` shows generated boxes; `hidden` hides them but descendants can explicitly restore `visible`; `collapse` removes table rows/columns from layout where supported (and has special flex/ruby behavior); `force-hidden` is a new draft value that hides the element and descendants regardless of descendant `visibility`. The draft defines `force-hidden`, but MDN's current compatibility reference does not list it as broadly supported. Table-collapse behavior and spanning cells still vary across engines. **MDN support snapshot:** Baseline for established values; `force-hidden` remains draft-only. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/visibility) · [CSS Display 4](https://drafts.csswg.org/css-display-4/) |

# Cross-item comparison

`display: none` removes boxes; `visibility: hidden` keeps their layout allocation; `visibility: collapse` has specialized row/column and flex behavior; `force-hidden` would also prevent descendants from restoring visibility. `order` affects flex/grid layout placement but does not itself reorder the DOM or default focus sequence. `reading-flow` maps a container's layout pattern to a reading/navigation sequence, and `reading-order` assigns child ordinal groups. Preserve a sensible source order as the fallback and test keyboard navigation, speech output, and assistive technology before using these experimental properties.

# Examples

Use semantic source order for a card list, then choose grid for two-dimensional placement. Avoid reordering a meaningful process visually unless the sequential reading and focus order stay understandable.

```css
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 1rem; }
```

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

- Assuming `display: none` is equivalent to `visibility: hidden`; the former removes the box from layout and rendering.
- Using `order` to disguise incorrect DOM order.
- Assuming `visibility: hidden` removes allocated space.
- Using emerging reading-flow features without checking keyboard and assistive-technology behavior.
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** `display`, `order`, `reading-flow`, `reading-order`, and `visibility`. Each has an individual definition and support link above.
2. **What should be checked beyond this concise description?** Full grammar, applicable boxes, inheritance, computed behavior, interactions, and the target browser compatibility data.
3. **How do `reading-flow` and `reading-order` differ?** `reading-flow` selects the container's reading/navigation pattern; `reading-order` groups individual direct children within it. Neither changes visual layout.
4. **What is the latest status check date?** MDN support labels were rechecked on 2026-11-19; recheck the target-browser compatibility table before deployment.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 4 draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
- [CSS Display Level 4 draft](https://drafts.csswg.org/css-display-4/)
- [CSS Grid Layout Level 3 draft](https://drafts.csswg.org/css-grid-3/)
- [CSS Anchor Positioning Level 1 draft](https://drafts.csswg.org/css-anchor-position-1/)
