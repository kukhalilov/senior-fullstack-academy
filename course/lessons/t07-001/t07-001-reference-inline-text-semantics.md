# HTML document structure metadata and semantic content elements — Reference: Inline text and ruby annotation elements

## Scope and version

Current HTML Living Standard. See [WHATWG text-level semantics](https://html.spec.whatwg.org/multipage/text-level-semantics.html) and [MDN elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

Text-level elements express relationships inside prose: emphasis, code, quotations, definitions, dates, edits, bidirectional text, and annotations. Their semantics matter even when CSS changes their default appearance.

## Supplied names explained

- `<a>` — A hyperlink when `href` is present; without `href`, it can be a placeholder for where a link might otherwise go. Link text should describe its destination or action.
- `<abbr>` — Marks an abbreviation or acronym; an optional `title` may provide an expansion, but visible first-use explanation is often clearer.
- `<b>` — Draws attention to text without asserting extra importance or stress emphasis.
- `<bdi>` — Isolates a span whose direction is unknown or variable, preventing its bidirectional text from affecting surrounding text.
- `<bdo>` — Overrides text direction for its contents using a required `dir` value; use only when a deliberate override is needed.
- `<br>` — A line break that is part of the content, such as an address line or poem; not a spacing/layout tool.
- `<cite>` — Title of a creative work, not generally the person who authored it.
- `<code>` — Fragment of computer code. It does not execute or validate the code.
- `<data>` — Associates machine-readable value with human-readable content through `value`.
- `<dfn>` — Marks the defining instance of a term; its surrounding context identifies the term being defined.
- `<em>` — Stress emphasis whose placement can change a sentence's meaning; nested emphasis can increase stress.
- `<i>` — Text in an alternate voice or mood, technical term, idiom, or other conventional span, not simply “make italic.”
- `<kbd>` — User input such as keyboard keys or spoken commands.
- `<mark>` — Text highlighted because it is relevant in a reference context, such as a search match.
- `<q>` — Short inline quotation whose quotation marks are normally supplied by the user agent.
- `<rp>` — Fallback punctuation around ruby annotations for user agents that do not display ruby annotations.
- `<rt>` — Ruby annotation text, often pronunciation or transliteration.
- `<ruby>` — Groups base text and ruby annotations, commonly used for pronunciation guidance in East Asian typography.
- `<s>` — Content that is no longer accurate or relevant but is not an edit deletion; use edit semantics when documenting a change.
- `<samp>` — Sample output from a computer program or system.
- `<small>` — Side comments or small print, such as legal or copyright text; CSS font size alone is not its meaning.
- `<span>` — Generic phrasing container with no inherent semantic meaning.
- `<strong>` — Strong importance, seriousness, or urgency; visual boldness is a default, not the definition.
- `<sub>` — Subscript for typographic convention, such as a chemical formula; not a general positioning tool.
- `<sup>` — Superscript for typographic convention, such as a footnote marker or exponent.
- `<time>` — Represents a date, time, duration, or valid machine-readable value using `datetime` when appropriate.
- `<u>` — Non-textual annotation, such as marking a proper name in Chinese text; avoid using it as an ambiguous underline style.
- `<var>` — Variable or placeholder in a mathematical expression or programming context.
- `<wbr>` — Optional line-break opportunity within a word or string when a line otherwise cannot fit.
- `<rb>` — Ruby base-text segment used to associate base text with ruby annotations; modern authoring can often omit it.
- `<rtc>` — Ruby text container for annotation groups, including parallel annotations; support and exact ruby layout need consideration.

## Cross-item comparison

`<em>` adds stress emphasis; `<strong>` adds importance; `<b>` draws attention without either claim; `<i>` signals an alternate voice/convention. `<s>` says content is no longer accurate; `<del>` records an edit. `<code>`, `<kbd>`, `<samp>`, and `<var>` distinguish code, user input, program output, and variables. `<bdi>` isolates direction; `<bdo>` overrides it.

## Examples

```html
<p><strong>Warning:</strong> this command deletes the selected data.</p>
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd>; the program prints <samp>Saved</samp>.</p>
<p>For water, use H<sub>2</sub>O; for area, use m<sup>2</sup>.</p>
<p><ruby>漢<rt>かん</rt><rp>(</rp><rt>kan</rt><rp>)</rp></ruby></p>
```

## Common mistakes

- Choosing elements solely for italic/bold/underline appearance.
- Using `<br>` repeatedly to create vertical spacing.
- Treating `<cite>` as an author byline or `<data>` as a place to hide sensitive values.
- Forgetting that a linked element needs a meaningful destination and accessible name.
- Using `<s>` for a tracked deletion or `<del>` for a stale fact without edit semantics.
- Assuming a `<title>` tooltip or `<abbr title>` is reliably available to touch and keyboard users.

## Knowledge checks with answers

1. **Which pair distinguishes user input and program output?** `<kbd>` and `<samp>`.
2. **How does `<bdi>` differ from `<bdo>`?** Isolation versus explicit direction override.
3. **Which element marks changing stress that affects meaning?** `<em>`.
