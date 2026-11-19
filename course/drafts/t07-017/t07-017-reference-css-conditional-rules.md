# CSS layout flexbox grid positioning and responsive design — Reference: CSS Conditional Rules properties

# Scope and version

This lesson covers exactly the three assigned properties: `container`, `container-name`, and `container-type`. Container queries are specified across CSS Conditional Rules Levels 3–5. Level 3/4 define the established size and style query model; the current Level 5 Editor’s Draft (10 November 2026 in the version checked) adds `scroll-state` to `container-type` and defines scroll-state queries. Treat that addition as evolving draft behavior and check browser support independently.

# How this group fits the mental model

A media query asks about the page environment, such as viewport width. A container query asks about an eligible ancestor component. These properties create and name the ancestor context; the `@container` rule (an at-rule outside this property inventory) tests its size, style, or scroll state and applies styles to descendants. This lets a card respond to the space its host actually gives it.

There is no automatic “nearest element” query: CSS searches ancestors for a query container that both matches any requested name and supports the queried feature. A component cannot use its own container query to style itself based on its own size; place the container boundary on an ancestor of the styled element.

# Supplied names explained

| Exact supplied property | Grammar and behavior |
| --- | --- |
| `container-type` | Current Level 5 draft grammar: `normal \| [ [ size \| inline-size ] || scroll-state ]`; initial `normal`; applies to all elements; not inherited. `size` enables size queries on both axes and applies size + style containment and an independent formatting context. `inline-size` enables size queries on the container’s inline axis and applies inline-size + style containment and an independent formatting context. `scroll-state` enables scroll-state queries; it does not impose size containment. A container with `normal` is not a size or scroll-state query container, but can still be used for style queries. |
| `container-name` | `none \| <custom-ident>+`; initial `none`; applies to all elements; not inherited. Names are identifiers used to select a particular eligible ancestor in `@container`. `none`, `and`, `not`, and `or` are excluded as custom identifiers. Multiple names may be assigned. |
| `container` | Shorthand: `<'container-name'> [ / <'container-type'> ]?`; sets both name and type. If the type after `/` is omitted, the type is reset to its initial value `normal`. Use `container: card / inline-size` when both name and inline-size query capability are wanted. |

The Level 5 grammar permits combining `size` or `inline-size` with `scroll-state`. Scroll-state values and their styling relationship are still draft features. Size containment changes intrinsic sizing: content no longer determines the contained axis in the ordinary way, so an auto-sized size container may need an explicit size or other constraints. `inline-size` is common for responsive components because it contains only the axis commonly used for width adaptation while the block size can continue to follow content.

# Cross-item comparison

| Property choice | What descendants may query | Containment and cost |
| --- | --- | --- |
| `container-type: inline-size` | Inline/block size features on the inline axis (for example, `inline-size`). | Inline-size and style containment; independent formatting context. Usually the component default for width-responsive cards. |
| `container-type: size` | Size features on both axes. | Size and style containment; independent formatting context. Both dimensions need deliberate sizing. |
| `container-type: normal` plus `container-name` | Style query context (and naming); no size or scroll-state query capability. | Does not add size containment. |
| `container-type: scroll-state` | Draft scroll state such as snapped, stuck, scrollable, or scrolled. | Does not add size containment; draft support varies. |

Names do not create query capability on their own: a name identifies a candidate, while type determines which query it can answer. `container` is convenient but can reset a previously declared type to `normal` if the slash and type are omitted.

# Examples

The named host is an ancestor of the card being styled. It is sized by its parent, while the card adapts to the host’s inline size.

```css
.card-host {
  container: product-card / inline-size;
}

.product-card {
  display: block;
}

@container product-card (inline-size > 32rem) {
  .product-card {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 1rem;
  }
}
```

For a scroll-state feature from the Level 5 draft, declare a scroll-state container and query a descendant:

```css
.sticky-header {
  position: sticky;
  inset-block-start: 0;
  container-type: scroll-state;
}

@container scroll-state(stuck: block-start) {
  .sticky-header__shadow {
    opacity: 1;
  }
}
```

# Common mistakes

- Expecting `@container` to match when no ancestor supports the queried feature.
- Applying `container-type` to the same element whose own style is intended to respond; style a descendant instead.
- Assuming `container-name` alone enables size queries.
- Forgetting `container: name` resets type to its initial `normal` when the slash/type is omitted.
- Choosing `size` without considering that containment can remove content contribution to intrinsic size on both axes.
- Assuming `normal` blocks style queries; it remains eligible for style-query use.
- Treating `scroll-state` and its query syntax as finalized or widely implemented.
- Confusing container-relative sizing with viewport-relative media queries or container query units.

# Knowledge checks with answers

1. **What does `container-type` decide?** Which query features an element can provide and, for size queries, which containment effects apply.
2. **Does naming an element make it a size query container?** No. A suitable `container-type` is also needed.
3. **Why is `inline-size` commonly used for cards?** It enables inline-axis size queries while avoiding full block-axis size containment, so content can still determine block size.
4. **What happens to type in `container: card`?** The omitted type resets to `normal`; it does not preserve a separately declared `inline-size` or `size`.
5. **Can an element query its own size to style itself?** No. Container queries are evaluated against eligible ancestors and style descendants.
6. **What is the maturity of `container-type: scroll-state`?** It appears in the current CSS Conditional Level 5 Editor’s Draft and remains evolving draft functionality.

# Sources

- [CSS Conditional Rules Module Level 5, current Editor’s Draft](https://drafts.csswg.org/css-conditional-5/) — §§5.1–5.4 and 6.3: current property grammars, containment effects, named-container selection, shorthand reset behavior, and scroll-state query support.
- [CSS Conditional Rules Module Level 3](https://www.w3.org/TR/css-conditional-3/) — foundational conditional processing and size-query model.
- [CSS Containment Module Level 3](https://drafts.csswg.org/css-contain-3/) — containment effects and intrinsic-size implications.
