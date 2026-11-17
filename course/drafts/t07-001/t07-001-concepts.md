# HTML document structure metadata and semantic content elements — Core concepts and how they fit together

## Learning objectives

Explain source-to-DOM parsing, choose semantic elements from content intent, distinguish content categories from visual layout, describe valid document structure, and recognize where browser error recovery can hide invalid markup.

## Prerequisites

Know basic text, files, URLs, and browser navigation. CSS appearance, form-control APIs, DOM interfaces, and ARIA authoring are covered in separate topics.

The source-to-DOM and semantic model follows the [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/dom.html) and its [syntax rules](https://html.spec.whatwg.org/multipage/syntax.html).

## Core concepts

**A document is a tree, not a formatted string.** HTML parsing tokenizes source and runs tree-construction rules. Implied elements, optional tag closures, foster parenting around tables, and error recovery can produce a DOM different from the literal source. Inspect the DOM when debugging; do not assume malformed source is interpreted like XML.

**Semantics are contracts.** `<nav>` identifies a navigation region; `<main>` identifies the page's principal content; `<article>` represents a self-contained composition; `<section>` groups thematic content, usually with a heading. `<div>` has no special meaning. These elements do not dictate visual styles, and styling a `<div>` to look like a heading does not make it a heading.

**Headings communicate hierarchy.** Use `<h1>` through `<h6>` for actual headings and choose levels from the document outline, not font size. The current standard defines newer `headingoffset` and `headingreset` attributes, but browser and assistive-technology support is not uniform; conventional heading levels remain the reliable interoperable choice unless the target environment is verified. `<hgroup>` groups a heading with related subtitle/tagline paragraphs. It is not a replacement for a semantic section.

**Content categories help determine placement.** Metadata, flow, sectioning, heading, phrasing, embedded, interactive, palpable, and script-supporting categories overlap; they are not a simple inheritance tree. An element can belong to more than one category. The content model for a particular parent determines which children are conforming. Transparent content models inherit restrictions from the context. SVG and MathML enter foreign-content parsing rules.

**Voidness and optional tags are syntax rules.** Void elements have no end tag and cannot contain children. Some non-void start or end tags may be omitted under precise conditions. A boolean attribute is true by presence, so `disabled="false"` is still present and true. Quote attribute values; unquoted values cannot contain whitespace or ambiguous syntax.

**Attributes carry state and relationships.** `id`, `class`, `lang`, `dir`, `hidden`, `inert`, `tabindex`, and other global attributes apply broadly but can have behavior and accessibility consequences. `data-*` exposes custom data through `HTMLElement.dataset`; it is not a secure place for secrets. Element-specific attributes and content models still govern.

## Mechanisms and relationships

The document shell gives the browser parsing mode and metadata. The parser builds a DOM, then CSS and scripts interact with it. Semantics help user agents expose a useful accessibility tree; that tree is not identical to the DOM. Content categories help explain which structures can be nested, while conformance rules define what authors should write. Error recovery improves resilience but does not make every tree predictable or maintainable.

## Worked examples

### Section versus article

Use `<article>` for content that could be distributed or understood independently, such as a post or comment. Use `<section>` for a thematic part of a larger work. They are not visual alternatives. A comments area can be a section containing individual comment articles.

### Boolean attributes and parsing

`<input disabled>` and `<input disabled="disabled">` both set the boolean attribute. `<input disabled="false">` also sets it; remove the attribute to enable the control. Likewise, `<p>one<p>two` causes the parser to close the first paragraph when a second paragraph start tag is encountered. Write explicit, readable markup instead of relying on optional-tag edge cases.

### Text semantics

`<strong>` denotes importance; `<b>` draws attention without adding importance. `<em>` marks stress emphasis; `<i>` marks a different voice or technical term. Their default italic/bold appearance is not their meaning.

## Misconceptions and edge cases

- HTML is error-tolerant but should still conform to the content model.
- A tag's default display style is not its semantic role.
- The old HTML5 “outline algorithm” did not make heading levels irrelevant; use a clear heading hierarchy.
- `<header>` and `<footer>` are not automatically page-wide landmarks when nested inside sectioning content.
- `hidden` and `inert` differ: hidden content is not rendered; inert content remains present but is not interactive/focusable and is excluded from interaction.
- `aria-*` does not create native behavior, and global `tabindex` can create harmful focus order.
- `<selectedcontent>` is a standardized customizable-select element with limited browser availability; it clones selected option content, has a narrow permitted parent, and may not automatically reflect later DOM mutations within the option.
- SVG/MathML elements follow foreign-content integration rules; HTML casing and attribute parsing assumptions do not uniformly apply inside them.

## Knowledge checks with answers

1. **Why can the DOM differ from source?** HTML tree construction inserts, closes, or reparents nodes according to parsing rules and error recovery.
2. **Is `<section>` a generic styling wrapper?** No; it is a thematic section. Use `<div>` when no semantic element fits.
3. **Does `disabled="false"` disable a control?** Yes. A boolean attribute is true when present.
4. **Does `<h1>` always have to be the only top-level heading?** Use a logical heading hierarchy; do not rely on sectioning elements to magically renumber headings.
5. **What makes `<selectedcontent>` a support risk?** It is in the current standard but MDN marks it limited availability; test target browsers.
