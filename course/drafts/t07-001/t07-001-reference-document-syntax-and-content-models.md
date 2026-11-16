# HTML document structure metadata and semantic content elements — Reference: Document syntax, content categories, and parsing concepts

## Scope and version

This lesson follows the current [WHATWG syntax](https://html.spec.whatwg.org/multipage/syntax.html), [DOM/content categories](https://html.spec.whatwg.org/multipage/dom.html), and [element index](https://html.spec.whatwg.org/multipage/indices.html). It distinguishes conformance from parser recovery.

## How this group fits the mental model

Syntax determines how source becomes tokens. Content models describe where elements may occur. The parser attempts to produce a DOM even from many errors, but successful rendering does not prove the source conforms or has the intended semantics.

## Supplied names explained

- **HTML document skeleton** — A doctype, root element, metadata head, and body content. Some tags can be omitted by rules, but explicit structure improves readability.
- **Character encoding declaration** — Early metadata, normally UTF-8, that tells the parser how to decode bytes; declare it near the start of the document.
- **Void elements** — Elements with no end tag and no children in HTML syntax, such as `img` or `br`; a self-closing slash does not create XML-style closure for ordinary HTML elements.
- **Raw text elements** — Elements such as `script` and `style` whose contents are parsed with special raw-text rules; delimiters and escaping need care.
- **Escapable raw text elements** — Elements such as `textarea` and `title` with special text parsing where character references are processed; source is not parsed as normal nested markup.
- **Optional start tags** — Start tags that may be omitted in specific contexts by the syntax rules; omission is conditional, not a general license to remove tags.
- **Optional end tags** — End tags that may be omitted under defined conditions; explicit tags are often clearer and safer for edits.
- **Boolean attributes** — Attributes whose true state is presence and false state is absence; textual values like `false` do not turn them off.
- **Quoted attribute values** — Attribute values enclosed in single or double quotes; robust for whitespace and clearer in templates.
- **Unquoted attribute values** — Allowed only under restricted syntax without whitespace or disallowed characters; quoting is the safer default.
- **Character references** — Escaped representations such as `&amp;` for characters that would otherwise be parsed as markup or ambiguous text.
- **Comments** — Source annotations introduced by `<!--` and ended by `-->`; avoid the `--` sequence and do not place sensitive information in comments.
- **DOCTYPE and standards mode** — The modern doctype triggers standards mode; missing or legacy doctypes may trigger quirks behavior.
- **Metadata content** — Category for metadata-oriented elements generally found in the head, with context-specific exceptions.
- **Flow content** — Broad category for most elements used in the body document flow.
- **Sectioning content** — Elements that define thematic sections and affect sectioning semantics, including article, aside, nav, and section.
- **Heading content** — Elements that define section headings, including the six heading levels and hgroup.
- **Phrasing content** — Text and inline-level semantic content permitted in paragraph-like contexts.
- **Embedded content** — Elements that import another resource or vocabulary into the document, such as image, media, iframe, SVG, and MathML.
- **Interactive content** — Elements intended for user interaction, with membership sometimes conditional on attributes.
- **Palpable content** — Category used to identify content that is substantial and perceivable, subject to context-specific rules.
- **Script-supporting elements** — Script and template, which support scripting and may appear in otherwise constrained locations.
- **Transparent content model** — A child-content rule that depends on the parent context where the transparent element appears.
- **Foreign content for SVG and MathML** — Embedded SVG/MathML uses foreign namespaces and parsing rules with integration points back to HTML.
- **HTML parser error recovery** — Defined algorithms that repair many malformed inputs; recovery behavior should not be used as an authoring strategy.
- **DOM tree construction** — Parser phase that inserts, closes, or reparents nodes according to insertion modes and token context.
- **Custom data attributes and HTMLElement.dataset** — `data-*` attributes expose string values through a camel-cased `dataset` mapping; values remain client-controlled and visible.

## Cross-item comparison

Content categories can overlap and are not visual display categories. Content models state what children a particular element permits. Parser recovery describes what browsers do with bad input, not what authors should write. Void elements differ from normal elements whose end tags happen to be optional. Foreign-content rules explain why SVG/MathML cannot be treated as ordinary HTML text.

## Examples

```html
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Syntax sample</title></head>
  <body>
    <p>Use &amp; to write an ampersand in text.</p>
    <ul><li>One</li><li>Two</li></ul>
  </body>
</html>
```

The doctype is first; metadata encoding is early; list items are children of a list. Real source should be tested by inspecting both the source and browser DOM when parsing behavior is relevant.

## Common mistakes

- Self-closing ordinary HTML elements as if the parser followed XML rules.
- Assuming every attribute is boolean or that `false` means absent.
- Depending on malformed nesting and parser repair to create a desired DOM.
- Treating content categories as mutually exclusive CSS display classes.
- Assuming a `data-*` value is private or safe to use as an authorization decision.
- Confusing source view with the DOM after script mutation and tree construction.

## Knowledge checks with answers

1. **Does `<div/>` necessarily close a div in HTML?** No; the slash does not make an ordinary HTML element self-closing.
2. **What does a transparent content model mean?** Permitted children depend on the element's surrounding context.
3. **Do content categories tell you how an element is displayed?** No; they describe semantic/structural groupings, not CSS layout.
