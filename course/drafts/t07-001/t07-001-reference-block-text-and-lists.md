# HTML document structure metadata and semantic content elements — Reference: Block text and list elements

## Scope and version

Current HTML Living Standard. See [WHATWG grouping content](https://html.spec.whatwg.org/multipage/grouping-content.html) and [MDN elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

These elements group paragraphs, quotations, descriptions, figures, and ordered or unordered collections. Their meaning comes from the information relationship, not the default margins or display mode.

## Supplied names explained

- `<blockquote>` — Block-level quotation from another source. Use `cite` for a source URL when appropriate; visible attribution is usually separate content.
- `<dd>` — Description/details/value associated with preceding terms in a description list.
- `<div>` — Generic flow container with no inherent semantic meaning; use when no more specific element fits.
- `<dl>` — Description list of name-value groups, commonly terms and definitions or metadata labels and values.
- `<dt>` — Term/name in a description list. It may be followed by one or more associated `<dd>` elements.
- `<figcaption>` — Caption or legend for its parent `<figure>`, if present. It is optional and constrained in placement.
- `<figure>` — Self-contained content such as an illustration, diagram, code example, or quotation, optionally with a caption.
- `<hr>` — Thematic break between paragraph-level topics. It is not merely a decorative horizontal line.
- `<li>` — Item in an `<ol>`, `<ul>`, or `<menu>` list.
- `<menu>` — List of commands or items, represented similarly to an unordered list; it is not a deprecated menu bar widget.
- `<ol>` — Ordered list where sequence matters; `start`, `reversed`, and item `value` can affect numbering.
- `<p>` — Paragraph. It cannot contain arbitrary flow elements; the parser may implicitly close it when a block-level start tag appears.
- `<pre>` — Preformatted text whose whitespace is preserved in text rendering. Commonly used for source examples or other text where spacing is significant.
- `<ul>` — Unordered list when order is not materially significant.

## Cross-item comparison

Use `<ol>` when order carries meaning and `<ul>` when it does not. Use `<dl>` for term-description relationships, not as a general two-column layout. `<figure>` groups a self-contained item; `<figcaption>` labels it. `<blockquote>` marks a block quotation. `<div>` has no semantics; `<hr>` marks a thematic change.

## Examples

```html
<figure>
  <pre>dotnet test</pre>
  <figcaption>Run the solution's test suite.</figcaption>
</figure>

<dl>
  <dt>RTO</dt><dd>Target time to restore service.</dd>
  <dt>RPO</dt><dd>Maximum acceptable data-loss interval.</dd>
</dl>
```

Use a list for steps that must be followed in order and a list for unordered prerequisites when sequence does not matter.

## Common mistakes

- Using `<blockquote>` for indentation or a short inline quotation.
- Using `<p>` as a generic box around headings, lists, or other block content.
- Choosing `<ol>` because numbers look attractive even when order does not matter.
- Treating `<dl>` as a generic grid without term/value relationships.
- Omitting meaningful alternative text because an image is inside `<figure>`; the figure does not replace the image's text alternative.

## Knowledge checks with answers

1. **Which element groups a self-contained figure and optional caption?** `<figure>` with `<figcaption>`.
2. **When is `<hr>` appropriate?** When the content has a thematic break, not merely to draw a line.
3. **Can `<p>` contain a list?** No; paragraph content is phrasing content, and a list is flow content outside that model.
