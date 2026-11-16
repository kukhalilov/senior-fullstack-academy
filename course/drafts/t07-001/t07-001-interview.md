# HTML document structure metadata and semantic content elements — Interview questions and reasoning

## Core questions

These semantics and parsing behaviors follow the [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/).

1. What does the doctype do, and is it an HTML version declaration?
2. How does HTML source become the DOM, and why can they differ?
3. When would you use `<article>`, `<section>`, `<aside>`, or `<div>`?
4. What is the difference between `<strong>`, `<b>`, `<em>`, and `<i>`?
5. How do void elements differ from elements with optional tags?
6. Are HTML content categories the same as CSS display values?
7. Why is `<table>` usually wrong for layout?
8. What do `<picture>` and `<source>` do, and which element provides image alternative text?
9. How should a team use global attributes such as `tabindex`, `hidden`, and `data-*` safely?
10. What is `<selectedcontent>`, and what should you verify before adopting it?

## Concise interview answers

1. The modern doctype selects standards mode; it is not a dated HTML version declaration.
2. The parser tokenizes and applies tree-construction/error-recovery rules, which can insert, close, or reparent nodes.
3. Choose from meaning: independent composition, thematic grouping, tangential material, or generic wrapper with no applicable semantic element.
4. `<strong>` conveys importance; `<b>` draws attention. `<em>` conveys stress emphasis; `<i>` marks a different voice or convention.
5. Void elements cannot have child content or end tags. Optional-tag rules allow omission only under specified contexts.
6. No. Categories describe element/content relationships and can overlap; CSS display is a presentation property.
7. Tables represent row/column relationships in data. CSS layout should handle visual placement without asserting false table semantics.
8. `<picture>` and `<source>` select resource candidates; the nested `<img>` renders and provides `alt` semantics.
9. Preserve natural focus order; `hidden`/`inert` affect rendering/interaction, not access control; `data-*` is client-visible and untrusted.
10. It mirrors the selected option inside customizable select markup. It is in the current standard but has limited browser availability, so test support and fallback.

## Deep follow-up answers

**Does semantic HTML automatically make a page accessible?** It supplies useful roles and relationships, but accessible names, focus order, keyboard behavior, contrast, alternative text, and error handling remain author responsibilities. A semantic element used incorrectly can still confuse users.

**Is the old HTML5 outline algorithm a reason to use `<h1>` everywhere?** No. Use a clear heading hierarchy. Sectioning elements do not automatically make arbitrary heading levels equivalent across browsers and assistive technology.

**What is the difference between parser recovery and conformance?** Recovery is browser behavior that attempts to produce a usable tree from malformed input. Conformance is what authors should write for predictable, interoperable results.

**How do `hidden` and `inert` differ?** `hidden` suppresses ordinary rendering; `inert` leaves content in the document but disables interaction and focus behavior within the subtree. Neither prevents a server from returning data or replaces authorization.

**Is `<selectedcontent>` safe to deploy as a baseline control?** Not without checking the target-browser matrix. The standard defines its role in customizable selects and MDN currently marks it limited availability; keep a fallback and test accessibility behavior.

## Scenario questions

1. A page has six headings styled only with CSS on generic containers. What semantics and navigation problems may result?
2. A form uses `data-user-role="admin"` to decide whether a save button is enabled. What is wrong with this security model?
3. A paragraph contains a section and nested paragraphs. What will the parser likely do, and how should the source be rewritten?
4. Product asks for a reusable card. How do you decide among article, section, and div?

## Tradeoffs and alternatives

Native elements provide built-in semantics and behavior but may not match every custom interaction; custom controls require recreating keyboard, focus, and accessibility behavior. Rich semantic markup improves document structure but should not overclaim relationships. HTML Living Standard describes conformance; MDN adds practical compatibility notes, which are essential for newer features.

## Common weak answers

- “Semantic tags are better for SEO” without describing the user or machine-readable relationship.
- “HTML5 outline handles heading levels automatically.”
- “The page renders, so the markup is valid.”
- “Use `<div>` everywhere and style roles visually.”
- “The client attribute says this user is an administrator.”

## Self-check rubric

Score from 0 (missing) to 2 (clear and correct): source/DOM distinction; semantics; heading/content model; attributes; accessibility consequences; parser behavior; compatibility awareness. A strong answer scores at least 10/12 and gives concrete markup examples.
