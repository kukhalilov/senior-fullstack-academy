# HTML document structure metadata and semantic content elements — Reference: Sectioning and heading elements

## Scope and version

Current HTML Living Standard. See [WHATWG sectioning elements](https://html.spec.whatwg.org/multipage/sections.html) and [MDN elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

Sectioning and heading elements describe the organization of body content. They help navigation and accessibility when their meaning reflects the content; CSS can style them independently.

## Supplied names explained

- `<address>` — Provides contact information for the nearest article or body ancestor. It is not a general postal-address wrapper for arbitrary addresses.
- `<article>` — A self-contained composition that could be independently distributed or reused, such as a post, comment, or news item.
- `<aside>` — Content tangentially related to nearby content, often a sidebar or pull quote. Its relationship should be meaningful rather than purely visual.
- `<footer>` — Footer for the nearest sectioning-content ancestor or the body. It can contain authorship, related links, or copyright; it is not itself sectioning content.
- `<header>` — Introductory or navigational aids for a page or section. A nested header is not automatically a page-wide banner landmark.
- `<h1>` — A level-one heading. Use for the document's primary heading or another level-one heading when the hierarchy supports it.
- `<h2>` — A level-two heading for a subsection beneath the relevant level-one context.
- `<h3>` — A level-three heading beneath a level-two context.
- `<h4>` — A level-four heading beneath a level-three context.
- `<h5>` — A level-five heading beneath a level-four context.
- `<h6>` — A level-six heading beneath a level-five context; HTML defines no lower numeric heading element.
- `<hgroup>` — Groups one heading with related subtitle, alternative title, or tagline paragraphs. It should not be used as a generic layout wrapper.
- `<main>` — Contains the dominant content of the document. It should be unique and not nested inside sectioning content, header, footer, or nav contexts prohibited by the standard.
- `<nav>` — A section whose purpose is navigation links. Not every collection of links needs to be a navigation landmark.
- `<section>` — A thematic grouping of content, typically with a heading. Prefer `<div>` if no thematic grouping is intended.
- `<search>` — Represents a part of a document containing search or filtering controls. It supplies semantics, not a built-in search implementation.

## Cross-item comparison

`<article>` is independently meaningful; `<section>` is a thematic part; `<aside>` is tangential; `<nav>` is specifically navigational. `<header>` and `<footer>` describe introductory/ending content for their nearest applicable scope, but are not sectioning elements. Heading levels encode hierarchy rather than font size. The obsolete automatic-outline myth does not excuse skipped or arbitrary heading levels.

## Examples

```html
<main>
  <article>
    <header><h1>Choosing a database</h1>By Mina</header>
    <section><h2>Read patterns</h2>...</section>
    <aside><h2>Related guide</h2>Indexes</aside>
    <footer>Updated 2026-11-16</footer>
  </article>
</main>
```

## Common mistakes

- Using `<section>` solely to gain a CSS hook; use classed `<div>` for a generic wrapper.
- Marking every group of links as `<nav>` or placing unrelated page sections inside `<aside>`.
- Assuming `<header>` always means the global site header or `<footer>` always means the global footer.
- Choosing heading tags by default size and creating a misleading hierarchy.
- Assuming `<search>` performs filtering or automatically creates a particular widget.

## Knowledge checks with answers

1. **When is `<article>` a better fit than `<section>`?** When the composition is independently meaningful/reusable.
2. **Is `<footer>` sectioning content?** No; it is scoped to the nearest sectioning element or body.
3. **Does `<search>` implement search?** No; it marks the semantic region containing search/filter controls.
