# CSS selectors at-rules cascade values and box model — Reference: Selector syntax and structural building blocks

## Scope and version

Selector syntax was checked against [Selectors Level 4](https://www.w3.org/TR/selectors-4/) and the [CSS Nesting Module Level 1](https://www.w3.org/TR/css-nesting-1/) on 2026-11-19. See [MDN selector structure](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors/Selector_structure), [attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity), and [column combinator support](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Column_combinator).

## How this group fits the mental model

Selectors answer “which elements?” before the cascade compares declarations. A selector's relationship structure, matching state, and specificity all matter, but specificity is only one cascade criterion.

## Supplied names explained

- **Type selectors** — Match elements by local name, such as `button`; they contribute a type-selector component to specificity.
- **Class selectors** — Match an element's class token using `.name`; they are reusable, but generated styling should not depend on unstable implementation class names.
- **ID selectors** — Match an ID using `#name`; HTML requires IDs to be unique within an element tree, although a duplicate ID still causes the selector to match every matching element. IDs have high specificity.
- **Universal selectors** — `*` matches any element in its scope and contributes zero specificity.
- **Attribute selectors** — Match attribute presence (`[attr]`), exact value (`=`), whitespace-separated token (`~=`), exact-or-hyphen-prefix (`|=`), prefix (`^=`), suffix (`$=`), or substring (`*=`). The `i` flag requests ASCII-insensitive matching; `s` requests case-sensitive matching. Empty values never match with `^=`, `$=`, or `*=`. Default name/value case behavior depends on the document language.
- **Nesting selector** — `&` refers to the parent selector in CSS nesting. Its specificity follows the nesting rule's maximum selector list specificity, similar to `:is()`.
- **Selector list** — Comma-separated selectors share a rule; any matching selector applies the declarations. An invalid selector in an ordinary list invalidates that whole list; forgiving lists are used by specific functional pseudo-classes such as `:is()` and `:where()`, not by every function.
- **Next-sibling combinator** — `+` matches the immediately following element sibling that meets the right-hand selector.
- **Subsequent-sibling combinator** — `~` matches later element siblings sharing the same parent, not only the next one.
- **Child combinator** — `>` matches direct element children.
- **Descendant combinator** — Whitespace matches descendants at any depth.
- **Column combinator** — `||` matches cells related to a table column (for example `col.selected || td`). It is at-risk in Selectors Level 4, experimental in MDN, and currently has no browser support.
- **Namespace separator** — In type/universal selectors, `ns|E`, `*|E`, and `|E` mean a declared namespace, any namespace, and no namespace; unprefixed type selectors use the default namespace if declared, otherwise any namespace. Attribute names can also be namespace-qualified; default namespaces do not apply to attributes. Do not confuse namespace `|` with the attribute value operator `[lang|=en]`.
- **Pseudo-classes** — Colon-prefixed selectors that match elements in a state, structural position, or relationship without changing the DOM.
- **Pseudo-elements** — Double-colon selectors targeting an associated special part, such as a first line, marker, shadow part, or generated content; they are not ordinary DOM children.

## Selector structure, specificity, and syntax gotchas

A **simple selector** is one condition (type, universal, class, ID, attribute, or pseudo-class). A **compound selector** joins simple selectors with no combinator and matches one element against all conditions; any type or universal selector must come first and only one may appear. A **complex selector** joins compounds with combinators. Whitespace is itself the descendant combinator, so `article .card` differs from `article.card`. Selector identifiers can use CSS escapes when names contain characters that cannot appear directly in an identifier; in JavaScript-generated selectors, use `CSS.escape()` for an identifier value rather than hand-building escape sequences.

Selector keywords and syntax are ASCII case-insensitive, but case sensitivity of element names, attribute names, and attribute values follows the document language; HTML and XML therefore differ. The `i` and `s` attribute flags explicitly control value comparison.

Specificity is commonly written as `(IDs, classes/attributes/pseudo-classes, types/pseudo-elements)`. An ID contributes `(1,0,0)`, a class/attribute/ordinary pseudo-class `(0,1,0)`, and a type/pseudo-element `(0,0,1)`. Universal selectors and combinators contribute zero. Functional pseudo-classes can have special rules: `:is()`, `:not()`, and `:has()` use the most specific argument; `:where()` contributes zero. The nesting selector `&` takes the maximum specificity of its parent selector list, like `:is()`, even if a lower-specificity parent selector is the one that matched.

Universal selector namespace forms `ns|*`, `*|*`, and `|*` select any element in the named, any, or no namespace, respectively. Attribute namespace examples include `[svg|href]`, `[*|href]`, and `[|href]`; the prefix must be declared with `@namespace`. For element selectors, a default namespace also affects compounds that have no explicit type selector. Ordinary selector lists are unforgiving: a single invalid selector invalidates the rule's selector list.

CSS nesting permits a nested selector without `&` as a descendant relationship; `&:hover` explicitly joins the parent element to its hover state, while `> .item` is a relative child selector. Nesting is CSS syntax rather than textual preprocessor concatenation: `&Bar` is not a way to concatenate a class name.

### Full syntax inventory

- Simple selectors
- Compound selectors
- Complex selectors
- CSS identifier escapes
- CSS.escape() for dynamic selector identifiers
- Selector-list error handling
- Forgiving selector lists
- Attribute selector presence [attr]
- Attribute selector exact-value operator =
- Attribute selector whitespace-token operator ~=
- Attribute selector hyphen-prefix operator |=
- Attribute selector prefix operator ^=
- Attribute selector suffix operator $=
- Attribute selector substring operator *=
- Attribute selector case-insensitive flag i
- Attribute selector case-sensitive flag s
- Attribute selector empty-substring behavior
- Namespaced attribute selectors
- Default namespace behavior
- Type selector namespace forms ns|E, *|E, and |E
- Universal selector namespace forms ns|*, *|*, and |*
- Selector primitive specificity
- Zero specificity of universal selectors and combinators
- Nesting selector specificity
- Implicit descendant in CSS nesting
- CSS nesting is not textual concatenation
- Column combinator current browser support

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
