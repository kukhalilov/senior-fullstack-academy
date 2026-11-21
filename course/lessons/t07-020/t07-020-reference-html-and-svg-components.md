# React DOM components forms resource hints portals and preload APIs — Reference: Built-in browser component families

## Scope and version

The supplied items are `HTML built-in components`, `SVG built-in components`, `Custom HTML elements`, and `Custom elements using the is attribute`. React DOM supports the browser's built-in HTML and SVG tags; their native definitions/content models are taught in the HTML topic. This lesson focuses on React's component mapping and the important custom-element boundary. [React DOM Components](https://react.dev/reference/react-dom/components)

## How this group fits the mental model

Lowercase JSX tags represent host/browser elements. React supports the native tag families and applies shared DOM props/events plus element-specific React behavior for forms and resources. Custom element names use a dash and follow the platform's custom-element conventions. A customized built-in uses an ordinary built-in tag with `is`.

## Supplied names explained

- `HTML built-in components` are React DOM renderings of browser HTML tags, including document/metadata, semantic sections, text, lists, forms, media, interactive, table, and embedded content. React does not replace their native content models, accessibility semantics, or browser methods. Native tag definitions are enumerated in the HTML reference; React's DOM component index confirms support for all built-ins. [React DOM Components](https://react.dev/reference/react-dom/components)
- `SVG built-in components` are browser SVG tags rendered through JSX inside SVG context. React follows DOM-oriented camelCase prop names where required while the SVG vocabulary and graphics semantics remain those of the browser. The current React component index enumerates its built-in SVG family. [React DOM Components](https://react.dev/reference/react-dom/components)
- `Custom HTML elements` are custom elements whose tag name contains a dash, such as `<my-element>`. React recognizes this form and applies custom-element attribute/property rules; use the element's documented public contract and lifecycle. React 19 improved SSR and property/event support. [React DOM Components](https://react.dev/reference/react-dom/components) [React 19](https://react.dev/blog/2024/12/05/react-19)
- `Custom elements using the is attribute` are customized built-in elements. When a built-in browser tag has an `is` attribute, React treats it as a custom element for its custom-element handling. This is distinct from a dash-named autonomous custom element. [React DOM Components](https://react.dev/reference/react-dom/components)

## Cross-item comparison

Native HTML and SVG elements use built-in browser semantics and usually serialize standard props as attributes. Dash-named custom elements are autonomous custom elements. A built-in tag with `is` is a customized built-in. For custom elements, attributes are string markup; DOM properties can carry arbitrary JavaScript values when React recognizes the property on the instance. [React DOM Components](https://react.dev/reference/react-dom/components)

## Examples

```jsx
function Chart({ points }) {
  return <svg viewBox="0 0 100 100" role="img" aria-label="Trend chart">
    <polyline points={points} fill="none" />
  </svg>;
}
```

The SVG element is still an SVG host component; `role`/`aria-label` are accessibility props. A custom element can receive both attributes and properties, but property forwarding depends on its class instance:

```jsx
<my-chart points={points} onseries-select={handleSelect} />
```

Confirm the exact event case/dash and whether `points` is an attribute or a property in that custom element's API. [React DOM Components](https://react.dev/reference/react-dom/components)

## Common mistakes

- Assuming React components change native HTML/SVG content-model rules.
- Using a dash in a tag name for a normal custom React component instead of defining a Web Component.
- Assuming arbitrary non-string custom-element props are always assigned as properties.
- Confusing a dash-named autonomous custom element with a built-in customized through `is`.
- Assuming React's support for a tag provides its accessibility semantics automatically; those come from correct native markup and attributes.

## Knowledge checks with answers

1. **What does a lowercase JSX tag generally represent?** A browser host element rendered by React DOM.
2. **How does React identify a custom HTML element?** A dash-containing tag name; a built-in can also be customized with `is`.
3. **Do React host components replace native HTML content models?** No.
4. **What is the attribute/property distinction for custom elements?** Attributes are serialized markup strings; properties are JavaScript instance values.
5. **Which topic contains the native definitions of all standard tags?** The HTML element reference; this lesson covers React DOM integration.

