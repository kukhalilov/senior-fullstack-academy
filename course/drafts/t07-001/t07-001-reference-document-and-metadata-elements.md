# HTML document structure metadata and semantic content elements — Reference: Document root and metadata elements

## Scope and version

Current HTML Living Standard, checked 2026-11-16. See [WHATWG document metadata](https://html.spec.whatwg.org/multipage/semantics.html) and the [MDN element index](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

The root identifies the document; the head supplies machine- and user-facing metadata/resources; the body contains rendered document content. Browsers may imply some shell elements when omitted, but authoring a clear skeleton is easier to inspect and maintain.

## Supplied names explained

- `<!DOCTYPE html>` — Selects standards mode for modern HTML documents. It is a doctype declaration, not an HTML element and not a version selector for HTML5.
- `<html>` — Document element containing the document. Set `lang` on it when the primary language is known; its contents conventionally include head and body.
- `<head>` — Holds document metadata and linked resources, not the page's main visible content. Certain metadata-related elements may be permitted in other contexts by their rules.
- `<title>` — Names the document, commonly shown in browser tabs, history, and search results. Provide a concise, page-specific title.
- `<base>` — Establishes the base URL and/or default target for relative URLs in the document. There is at most one effective base element; placement and timing affect URL resolution.
- `<link>` — Establishes a relationship to an external resource or document, commonly stylesheets, icons, canonical URLs, and preload hints. Its `rel`, `href`, and context determine meaning.
- `<meta>` — Represents metadata not expressed by another metadata element, including charset, viewport, description, and named metadata. A charset declaration should appear early and use UTF-8.
- `<style>` — Embeds CSS associated with the document. It belongs in metadata contexts unless a specific scoped rule applies; a style element is not a replacement for an external stylesheet when caching/reuse matters.
- `<body>` — Contains the document's body content. There is one body element in the conforming document structure; parser error recovery handles duplicates in source.

## Cross-item comparison

`<title>` describes the document's name; `<meta name="description">` supplies descriptive metadata; neither is a visible heading. `<link>` references a resource/relationship, while `<style>` embeds rules. `<!DOCTYPE html>` controls parsing mode and is not nested inside `<html>`.

## Examples

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account settings — Northwind</title>
    <link rel="stylesheet" href="/assets/site.css">
  </head>
  <body>Account settings</body>
</html>
```

The early charset declaration avoids decoding ambiguity. Viewport metadata is relevant to mobile layout; it does not itself make a page responsive.

## Common mistakes

- Treating the doctype as a declaration of a particular dated HTML version.
- Omitting a useful `lang` value or reusing the same generic title on every route.
- Placing visible content inside `<head>` because it happens to be hidden by a browser.
- Adding multiple base URLs and overlooking how the first effective one changes relative links.
- Assuming a viewport declaration fixes layout problems without responsive CSS.

## Knowledge checks with answers

1. **What does the HTML doctype do?** Selects standards-mode parsing; it does not choose a feature version.
2. **Which element names the browser tab?** `<title>`.
3. **When do you use `<link>` versus `<style>`?** Link an external resource/relationship with `<link>`; embed CSS rules with `<style>`.
