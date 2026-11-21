# React function and class components JSX props and events — Reference: JSX syntax and JavaScript embedding

Sources: React 19.3 [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces), [`createElement`](https://react.dev/reference/react/createElement), [Common React DOM components and styles](https://react.dev/reference/react-dom/components/common), and [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).

## Scope and version

JSX is a syntax extension transformed by tooling into React element creation. It is not a string template and is not parsed as HTML by the browser; JSX is a syntax extension distinct from the React library. React 19 requires the modern JSX transform for its newer JSX improvements, including ref-as-prop support, so check the framework/compiler configuration when upgrading. Build configuration determines the transform; the output here concerns source syntax.

## Structure and naming

One JSX markup expression cannot contain adjacent top-level tags; wrap siblings in one parent or a Fragment (`<>...</>` shorthand) without a host wrapper. An ordinary JavaScript expression can also return an array of nodes, with keys where sibling identity requires them. Use explicit `<Fragment>` when a key is needed. Empty host elements must self-close (`<img />`). Nested JSX becomes children. Text between tags becomes text children; JavaScript values/expressions enter through `{expression}`. In JSX comments use `{/* comment */}`.

Host tag names begin lowercase; component identifiers are capitalized. JSX attributes use React/DOM conventions, not necessarily HTML source spelling: use `className` and `htmlFor`. The `aria-*` and `data-*` spellings retain their HTML hyphens. A `style` attribute expects a JavaScript object with camelCase property names and string/numeric values, not a CSS string; numeric values normally receive `px` except for unitless properties. A CSS class via `className` is generally preferable for static styles. String attributes use quotes (`title="Search"`); expression attributes use braces (`tabIndex={0}`). A spread attribute (`{...props}`) copies enumerable properties into the element's props at that point in order; later explicit attributes override earlier spread values, and later spread values can override earlier explicit ones. Avoid forwarding arbitrary objects to host elements.

JSX expressions can contain JavaScript expressions, but statements such as `if` cannot be placed directly inside braces; compute a value or use a conditional expression. Whitespace handling differs from HTML source intuition. Attribute names/events follow React conventions, and custom components can accept arbitrary prop names. JSX children can be text, expression values, or nested JSX. JSX is not HTML: tags must be balanced, elements closed, attributes use JS values, and special names differ.

## Example

```jsx
const card = (
  <section className="card" style={{ marginTop: 8 }}>
    <h2>{title}</h2>
    {/* The content is nested JSX. */}
    <Content {...contentProps} aria-label="Details" />
  </section>
);
```

The outer section is the single root. `title` is a JavaScript expression; `style` is an object; `Content` is a component because its name is capitalized. The explicit `aria-label` follows the spread and therefore overrides a same-named forwarded field.

## Common mistakes

Using `class`/`for` for the corresponding React DOM names; incorrectly converting `aria-*`/`data-*` to camelCase; forgetting a closing/self-closing tag; returning adjacent roots without a wrapper/Fragment; writing CSS as a string in `style`; assuming every numeric style gets `px`; putting an `if` statement inside braces; using HTML comments; and spreading untrusted/unfiltered props onto a DOM element.

## Knowledge checks with answers

1. **Why one root?** A JSX expression must produce one expression value; Fragment groups siblings.
2. **How insert a variable?** Curly-brace expression.
3. **What is `style`?** A JavaScript style object, not an HTML style string.
4. **How do spread order and explicit props interact?** Later values override earlier same-named properties.
5. **Does `style={{ marginTop: 8 }}` mean eight CSS pixels?** Yes; React DOM appends `px` for this length property. Unitless properties are exceptions.
6. **Should `aria-label` be written `ariaLabel`?** No. ARIA and data attributes keep the HTML hyphenated spelling.

## How this group fits the mental model

JSX syntax builds the immutable element descriptions returned by component render calculations.

## Supplied names explained

The index below includes the exact JSX constructs, attribute conventions, expression syntax, child forms, and HTML distinction declared for this lesson.

## Cross-item comparison

Quoted strings represent literal strings; braces evaluate JavaScript; nested JSX represents child nodes; spread syntax forwards object properties.

## Exact terms covered

### Exact terms covered

- `JSX syntax extension`
- `Single root element`
- `Fragment shorthand <>...</>`
- `Explicit Fragment <Fragment>`
- `Self-closing JSX element`
- `JSX attribute`
- `className`
- `htmlFor`
- `aria-* and data-* JSX naming exception`
- `style object`
- `React 19 new JSX transform requirement`
- `Curly-brace JavaScript expression`
- `String attribute value`
- `Expression attribute value`
- `Spread attributes {...props}`
- `Text children`
- `Nested JSX children`
- `JavaScript comment in JSX`
- `JSX is not HTML`

## Examples

The card example demonstrates element expressions, attributes, style objects, comments, and spread order.
