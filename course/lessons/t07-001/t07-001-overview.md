# HTML document structure metadata and semantic content elements — Big-picture orientation and mental model

## Problem and purpose

HTML gives a web document its structure, meaning, and relationships. Browsers parse it into a DOM tree, accessibility APIs expose semantic roles and names, search systems interpret content, and CSS/JavaScript attach presentation and behavior. Good HTML starts with the content and user purpose; it does not merely choose tags that look convenient.

## Plain-language mental model

Think of HTML as a labeled outline and data model for one page. The document shell identifies the language and metadata. The body contains landmarks and content sections. Headings describe hierarchy; lists describe collections; inline elements distinguish emphasis, code, quotations, and dates. Images and media have alternatives and controls. Attributes refine a particular element. The browser parses tokens into a tree and repairs many syntax mistakes, so the resulting DOM may differ from the source text.

## How the parts fit together

Start with a doctype and document root. Put encoding, title, viewport, stylesheets, and other metadata in the head. In the body, choose landmarks and sectioning elements based on their meaning. Use content models and category rules to check nesting. Add global attributes only when their behavior is understood. CSS controls appearance; JavaScript should enhance the structure without replacing native semantics unnecessarily. The [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/) is the normative current standard; [MDN's element index](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) is a practical reference.

## Concept map

| Question | HTML model |
|---|---|
| What is this page? | Document root, metadata, title, language, encoding |
| What is the main content? | Landmarks, sectioning, heading hierarchy |
| What kind of content is this? | Text semantics, lists, figures, tables, media |
| Where may it appear? | Content categories and element content models |
| What does the browser do with source? | Tokenization, tree construction, error recovery, DOM |
| How is behavior refined? | Element-specific and global attributes |

## End-to-end walkthrough

For an article page, declare `<!DOCTYPE html>`, set `<html lang="en">`, and include charset and a useful `<title>` in `<head>`. In `<body>`, use a site `<header>`, primary `<nav>`, one `<main>`, and an `<article>` with a heading, byline, paragraphs, a `<figure>` with an informative image alternative, and a `<footer>` for article metadata. A related sidebar can be an `<aside>`. The result communicates roles before CSS exists, works with keyboard and assistive technology, and remains understandable if a stylesheet fails.

## When to use it and tradeoffs

Use a semantic element when its defined meaning matches the content. Use `<div>` or `<span>` when no more specific meaning applies. Semantic markup improves interoperability and accessibility, but tag choice alone does not guarantee an accessible page: names, focus behavior, contrast, and interaction still matter. Native controls generally provide behavior that custom markup must recreate carefully. The current `<selectedcontent>` element participates in customizable select markup, but browser support remains limited; feature-detect it and consult the reference lesson before depending on it.

## What later lessons cover

References cover the exact current document elements, semantic groups, global attributes, and syntax/content models. Practice assembles and audits a document. Interview questions compare semantically similar markup and explain parsing. Form-control details, DOM APIs, ARIA, and CSS have separate topics to avoid duplicating their complete inventories.
