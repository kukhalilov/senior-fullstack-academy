# HTML document structure metadata and semantic content elements — Exercises and worked solutions

## Goals

Build a semantic page shell, choose text and grouping elements by meaning, correct common conformance mistakes, and predict the browser's parsed structure.

The exercises use the current [WHATWG document syntax](https://html.spec.whatwg.org/multipage/syntax.html) and [element semantics](https://html.spec.whatwg.org/multipage/semantics.html).

## Worked example

Create an article page with a site header, navigation, main content, article title/byline, a section, a related note, a figure caption, and a footer. A clear version is:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Guide to backups — Northwind</title>
  </head>
  <body>
    <header>Northwind</header>
    <nav>Guides</nav>
    <main>
      <article>
        <header><h1>Backups</h1>By Lee</header>
        <section><h2>Recovery goals</h2>...</section>
        <figure><img src="backup.png" alt="Backup verification flow"><figcaption>Verification steps</figcaption></figure>
        <aside>Related: recovery testing</aside>
        <footer>Updated 2026-11-16</footer>
      </article>
    </main>
  </body>
</html>
```

The tags express page and article structure; CSS can change layout without changing those meanings. Replace placeholder text with complete content and ensure the image alternative matches the information conveyed.

## Exercises

1. Choose among `<article>`, `<section>`, and `<div>` for a blog post, a chapter within a long guide, and a wrapper used only for grid styling.
2. Mark up a three-step procedure and a glossary of two terms. Decide which list structures match their relationships.
3. A label should be strongly important; a keyboard key and console output appear in a sentence. Choose exact text-semantic elements.
4. A video needs subtitles and an image needs an alternative. Identify the elements and information needed.
5. Repair this structure: `<!doctype html><p>Intro<section><h3>Details</h2><p>Text</section>`. Explain both source problems and likely parsing effects.
6. Given `<button disabled="false">Save</button>`, predict whether it is disabled and show the enabled form.

## Progressive hints

1. Ask whether content could stand alone, forms a theme, or has no semantic role.
2. A procedure has meaningful sequence; a term-description set is not merely a two-column layout.
3. Importance, user input, and program output have separate semantics.
4. Timed captions use a text track; an image alternative conveys purpose, not filename.
5. Paragraphs close implicitly in some parse contexts, but heading end tags must match; write explicit valid nesting.
6. Boolean attributes are true by presence.

## Complete solutions

1. A post can be an `<article>`; a thematic chapter part can be `<section>` with a heading; a styling-only wrapper is `<div>`.
2. Use `<ol>` for the ordered steps. Use `<dl>` with `<dt>` terms and associated `<dd>` descriptions for a glossary.
3. Use `<strong>` for importance, `<kbd>` for the key, and `<samp>` for console output.
4. Use `<video>` with `<track kind="captions">` and a properly sourced text track. Use `<img alt="...">` with concise equivalent information, or `alt=""` if decorative.
5. Close the paragraph before sectioning content; close the `h3` with `</h3>`; then place a paragraph inside the section. HTML may repair the original paragraph nesting, but mismatched heading markup is a source defect and should not be relied on.
6. It is disabled because the `disabled` attribute is present. Remove the attribute entirely: `<button>Save</button>`.

## Tests and edge cases

- Validate the document with a conformance checker and inspect the browser DOM for parsing surprises.
- Check one meaningful `<main>`, useful document title/language, and a heading hierarchy that reflects content.
- Test links and controls with keyboard-only navigation and assistive technology; semantic tags alone do not guarantee all interaction works.
- Confirm image alternatives for informative, functional, and decorative images.
- Check caption association, table headers, embedded-context names, and content-model validity.
- Test current browser support before using `<selectedcontent>`; retain a native/fallback select path.
- Treat `data-*` values as untrusted input and keep secrets out of source and DOM attributes.

## Reflection questions

1. What user or content relationship made you choose each semantic element?
2. Which errors did the browser repair, and why should authors still fix them?
3. How would you separate a meaningful article structure from styling-only wrappers?
