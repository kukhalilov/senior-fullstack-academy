# CSS selectors at-rules cascade values and box model — Reference: Selector syntax and structural building blocks

## Scope and version

Standard selector syntax from the current MDN selector index and [Selectors Level 4](https://www.w3.org/TR/selectors-4/). See [MDN selector structure](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors/Selector_structure) and [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity).

## How this group fits the mental model

Selectors answer “which elements?” before the cascade compares declarations. A selector's relationship structure, matching state, and specificity all matter, but specificity is only one cascade criterion.

## Supplied names explained

- **Type selectors** — Match elements by local name, such as `button`; they contribute a type-selector component to specificity.
- **Class selectors** — Match an element's class token using `.name`; they are reusable, but generated styling should not depend on unstable implementation class names.
- **ID selectors** — Match an `id` using `#name`; they have high specificity and IDs should be unique in the document.
- **Universal selectors** — `*` matches any element in its scope and contributes zero specificity.
- **Attribute selectors** — Match attribute presence or values using forms such as `[disabled]`, `[type="search"]`, and prefix/substring operators; flags can affect case sensitivity.
- **Nesting selector** — `&` refers to the parent selector in CSS nesting. Its specificity follows the nesting rule's maximum selector list specificity, similar to `:is()`.
- **Selector list** — Comma-separated selectors share a rule; one matching selector applies the declarations. A selector-list parse error can invalidate the list unless a forgiving-list pseudo-class is used.
- **Next-sibling combinator** — `+` matches the immediately following element sibling that meets the right-hand selector.
- **Subsequent-sibling combinator** — `~` matches later element siblings sharing the same parent, not only the next one.
- **Child combinator** — `>` matches direct element children.
- **Descendant combinator** — Whitespace matches descendants at any depth.
- **Column combinator** — `||` matches elements related by a table column; support and the exact layout context should be checked before use.
- **Namespace separator** — `|` separates a namespace prefix from a type or universal selector when namespaces are declared.
- **Pseudo-classes** — Colon-prefixed selectors that match elements in a state, structural position, or relationship without changing the DOM.
- **Pseudo-elements** — Double-colon selectors targeting a generated or special part associated with an element, such as a first line or marker.

## Cross-item comparison

`>` is direct-child, whitespace is any-depth descendant, `+` is the next element sibling, `~` is any later element sibling, and `||` is a table-column relationship. Class/attribute selectors commonly express reusable conditions; IDs are document identities and can create specificity pressure. Pseudo-classes match an element; pseudo-elements target an associated part.

## Examples

```css
article > h2 { margin-block-start: 0; }
input[type="search"]:focus-visible { outline-style: solid; }
label + input { inline-size: 100%; }
nav a ~ a { border-inline-start-style: solid; }
```

The first rule matches direct heading children, the second combines attribute and state, the third matches only an immediately following input, and the fourth matches later link siblings after a link within the same parent.

## Common mistakes

- Confusing descendant and child relationships.
- Assuming a selector list is a “closest match” list; it applies when any valid listed selector matches.
- Using IDs and deeply nested selectors for component styling, making later overrides fragile.
- Treating class names or data attributes as secure authorization signals.
- Assuming a column combinator or newer selector has broad support without checking.
- Forgetting that pseudo-elements are not ordinary DOM children and have property/placement restrictions.

## Knowledge checks with answers

1. **Does `A B` require B to be a direct child of A?** No; it matches any descendant.
2. **Which combinator means immediately next element sibling?** `+`.
3. **Does `*` increase specificity?** No; it contributes zero.
