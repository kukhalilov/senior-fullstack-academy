# CSS selectors at-rules cascade values and box model — Reference: Standard CSS at-rules

## Scope and version

The inventory is pinned in [MDN's at-rule data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/at-rules.json) and profiled by the [CSS Snapshot](https://www.w3.org/TR/css-2026/). At-rule availability and grammar can vary by browser and by CSS module maturity; check the relevant specification and compatibility data for the actual use case.

## How this group fits the mental model

At-rules begin with `@` and control stylesheet parsing, define descriptor-based resources, group rules under conditions, or establish named structures such as layers and keyframes. They are not declarations and do not all have the same block grammar. Their placement can affect parsing and cascade behavior.

## Supplied names explained

### Stylesheet encoding, imports, and namespaces

- **`@charset`** — Declares the stylesheet character encoding using a constrained syntax and must occur at the beginning of the stylesheet (aside from a possible byte-order mark); web delivery encoding is generally established by transport metadata.
- **`@import`** — Imports another stylesheet and must precede ordinary style rules and most other at-rules, with defined exceptions such as charset/layer ordering. It supports layer, supports, and media qualifiers; network and render-blocking consequences matter.
- **`@namespace`** — Declares namespace prefixes for namespaced selectors and must appear before style rules that depend on it.

### Conditional and scoping groups

- **`@media`** — Applies enclosed rules when a media query matches, including viewport/device features and user preferences such as reduced motion.
- **`@supports`** — Applies rules when a declaration or selector feature query is supported; syntactic support does not prove a feature is bug-free or semantically suitable.
- **`@container`** — Applies rules based on a named or nearest eligible query container's size or supported style/state conditions; the container must establish the relevant query context.
- **`@scope`** — Restricts selector matching to a scope root and optional limit; scope proximity participates late in the cascade after specificity.
- **`@layer`** — Establishes cascade layers and their order. Normal declarations favor later layers; important declarations reverse layer order. Normal unlayered rules outrank layered normal rules.

### Font, counters, and page output

- **`@font-face`** — Defines a downloadable or locally available font face through descriptors such as family, source, style, weight, and unicode range; descriptors are not ordinary style declarations.
- **`@font-feature-values`** — Defines author-friendly names for OpenType feature values used by supported font feature settings; its nested rules are feature-specific.
- **`@font-palette-values`** — Defines a named color palette configuration for a color font, using descriptors such as its font family and palette overrides.
- **`@counter-style`** — Defines a named counter formatting system from symbols and related descriptors, allowing numbering systems beyond built-in styles.
- **`@page`** — Defines page-box settings for paged/printed output, including page size, orientation/marks/bleed and page-margin boxes; print support varies.

### Animation, registration, and startup styles

- **`@keyframes`** — Defines intermediate states for an animation name. Keyframe declarations describe animated property values; they do not directly select elements.
- **`@property`** — Registers a custom property with syntax, inheritance, and initial-value behavior, enabling typed interpolation and better-defined computed-value behavior. Registration constraints apply, including requirements for an initial value in cases specified by the feature.
- **`@starting-style`** — Supplies a starting style for elements entering a rendered state where a prior style would otherwise be unavailable, often enabling entry transitions. It does not replace transition definitions or reduced-motion handling.
- **`@view-transition`** — Configures a document view transition, including navigation/type behavior where supported. It complements the View Transition API and transition pseudo-elements; provide a usable non-animated state.

## Cross-item comparison

`@media`, `@supports`, `@container`, and `@scope` all wrap style rules but test different things: environment, feature support, query-container state, and selector subtree. `@layer` changes cascade grouping rather than asking a runtime condition. `@font-face`, `@counter-style`, and `@font-palette-values` define named resources with descriptors. `@keyframes` defines animation endpoints; `@starting-style` gives an entering element a before-state. `@import` loads another stylesheet and has ordering/network implications, whereas most grouping at-rules organize rules already in the stylesheet.

## Examples

```css
@layer reset, components, utilities;

@import url("tokens.css") layer(tokens);

@media (prefers-reduced-motion: no-preference) {
  @supports (transition-behavior: allow-discrete) {
    .dialog { transition: opacity 180ms, display 180ms allow-discrete; }
    @starting-style { .dialog[open] { opacity: 0; } }
  }
}

@container card (inline-size > 36rem) {
  .card__body { display: grid; grid-template-columns: 1fr 1fr; }
}
```

In production, keep imports in their legal position and ensure the container is established. Feature queries should pair with a functional fallback rather than being treated as a compatibility guarantee.

## Common mistakes

- Putting `@import` after ordinary rules and expecting it to load.
- Confusing feature detection in `@supports` with complete compatibility or correct runtime behavior.
- Writing `@container` rules without an eligible query container.
- Assuming normal and important layer ordering are the same.
- Treating descriptors inside resource at-rules as ordinary declarations that work anywhere.
- Assuming `@scope` raises specificity; proximity is a distinct later tie-breaker.
- Defining animation keyframes but forgetting the element still needs an animation declaration and reduced-motion behavior.
- Using `@starting-style` without a valid transition or without considering the non-transition initial state.

## Knowledge checks with answers

1. **Which at-rule tests whether a property/selector feature is recognized?** `@supports`; it does not prove full compatibility.
2. **What must exist for a size query in `@container`?** An eligible ancestor query container, typically established with a `container-type` or shorthand declaration.
3. **Does a later normal layer always beat an earlier important layer?** No; importance is resolved before layer ordering, and important declarations reverse layer order within their origin.
4. **What do descriptors configure?** A particular resource/rule such as a font face or counter style, rather than arbitrary elements.
