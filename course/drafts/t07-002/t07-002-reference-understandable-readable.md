<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: understandable readable

# Scope and version

This covers the six success criteria in WCAG 2.2 Guideline 3.1. They specify language metadata and ways to make specialized terms, abbreviations, and reading level understandable. Several are AAA and should not be silently counted in an AA target. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Readable content is not merely short or “plain language.” Correct language metadata lets user agents select pronunciation and language rules; explanations and expansions help readers interpret specialized vocabulary. The criteria distinguish the page’s default human language from localized passages and vocabulary support.

# Supplied names explained

- `3.1.1 Language of Page (A)` — The default human language of each web page is programmatically determinable, typically with the document’s `lang` attribute.
- `3.1.2 Language of Parts (AA)` — Human-language changes within content are programmatically determinable, except names, technical terms, words of indeterminate language, and words/phrases that have become part of the surrounding language.
- `3.1.3 Unusual Words (AAA)` — A mechanism is available for identifying specific definitions of words or phrases used in an unusual or restricted way, including idioms and jargon.
- `3.1.4 Abbreviations (AAA)` — A mechanism is available to identify the expanded form or meaning of abbreviations.
- `3.1.5 Reading Level (AAA)` — When text requires reading ability more advanced than lower secondary education after proper names and titles are removed, supplemental content or a version at a lower reading level is available, subject to its proper-name exception.
- `3.1.6 Pronunciation (AAA)` — A mechanism is available to identify the specific pronunciation of words where meaning is ambiguous without it.

# Cross-item comparison

3.1.1 declares the page language; 3.1.2 marks language changes inside it. They do not require marking every borrowed word that is commonly used in the surrounding language. 3.1.3–3.1.6 provide support for interpreting vocabulary, abbreviations, reading complexity, or pronunciation, and are AAA.

# Examples

Set `<html lang="en">` for an English page and mark a sentence in another language with its own `lang`. Expand an abbreviation at first use or provide a glossary where the AAA criterion requires a mechanism. A technical article can provide a plain-language summary to help readers who need support with its reading level.

# Common mistakes

- Setting `lang` only on the body or using a language tag that does not match the default content.
- Marking every loanword even where it has become part of the surrounding language.
- Assuming a browser translation tool is an author-provided mechanism for every AAA criterion.
- Confusing language metadata with a guarantee of easy prose.

# Knowledge checks with answers

1. **What is the difference between 3.1.1 and 3.1.2?** Page default language versus changes of language within content.
2. **Are 3.1.3 through 3.1.6 AA?** No; they are AAA.
3. **Must every foreign word be marked?** No; the criterion includes exceptions for terms incorporated into the surrounding language and other cases.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
