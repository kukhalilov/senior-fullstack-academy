# React DOM components forms resource hints portals and preload APIs — Reference: Resource and metadata component APIs

## Scope and version

This lesson covers React 19.3 eligible metadata and resource components. Browser fetching, CSP, and native element semantics remain browser-owned. [Components](https://react.dev/reference/react-dom/components)

## How this group fits the mental model

React can recognize selected rendered elements as document metadata or resource declarations and place eligible ones in the document head. This lets a component declare what it needs near the component that needs it. The browser still decides when and how to fetch resources; React's hoisting/deduplication is a rendering behavior, not a network-success guarantee. [Components](https://react.dev/reference/react-dom/components) [link](https://react.dev/reference/react-dom/components/link) [meta](https://react.dev/reference/react-dom/components/meta) [script](https://react.dev/reference/react-dom/components/script) [style](https://react.dev/reference/react-dom/components/style) [title](https://react.dev/reference/react-dom/components/title)

## Supplied names explained

### `<title>` and `<meta>`

`<title>` takes `title text-only children`; React places it in the document head; applications should ensure one meaningful page title at a time. `meta name prop`, `meta httpEquiv prop`, `meta charset prop`, `meta itemProp prop`, and `meta content prop` name the corresponding metadata attributes. A metadata element's role and validity depend on its attributes; do not combine mutually exclusive metadata forms. Eligible metadata can be hoisted and duplicate metadata may be deduplicated by React, but authoring conflicting values is still ambiguous application design.

### `<link>` and resource declarations

`<link rel=stylesheet precedence>` declares a stylesheet with React's stylesheet handling. The `precedence` prop is required for React to treat a stylesheet link as a managed stylesheet resource; its string value establishes ordering relative to other managed stylesheets. React can hoist and deduplicate compatible stylesheet resources and coordinate them with rendering/suspense. This does not mean CSS is instantly downloaded or applied.

`<link rel=preload as>` declares a fetch intended for an upcoming use; `as` identifies the destination resource type and must match its eventual use for browser reuse. `modulepreload` prepares a JavaScript module and dependencies. `link rel=modulepreload as` describes this case; follow the HTML link rules for applicable attributes. React's imperative `preload()` and `preloadModule()` APIs are covered separately.

### `<img>`

`<img>` is a browser image element. When React encounters an image early in rendering, it can prioritize its loading according to image/resource behavior; use `fetchPriority`, `loading`, `srcSet`, `sizes`, and `alt` according to their native purposes. A preload hint should match the chosen responsive image candidate when using `srcSet`/`sizes`. Do not assume every image should be eagerly fetched; lazy loading and browser prioritization remain relevant.

### `<script>`

React can hoist eligible async scripts and deduplicate by `src`. `async prop` marks asynchronous loading behavior. `script children prop` supplies inline script content; `script src prop` selects an external script. `script crossOrigin prop`, `script fetchPriority prop`, `script integrity prop`, `script noModule prop`, and `script nonce prop` map to browser security/loading controls. Inline scripts and external scripts have different constraints; do not supply both inline content and `src` as though both execute. Cross-origin, CSP, integrity, and execution-order behavior follows browser rules. React may leave certain scripts in place when moving them would change semantics.

### `<style>`

React can hoist eligible style resources and coordinate stylesheet ordering. `style children prop` supplies CSS text; `style href prop` identifies an external stylesheet resource; `style media prop`, `style nonce prop`, and `style title prop` express browser stylesheet metadata. `precedence prop` participates in React stylesheet ordering when used for a managed stylesheet. This is distinct from the `style` object prop used on ordinary elements for inline CSS declarations.

### React resource handling

`React hoisting eligible resources to document head` allows components to declare metadata and certain resources in place. `React deduplication for eligible resources` avoids repeating compatible declarations. `precedence prop` supplies an ordering group for managed stylesheets. React 19 introduced resource improvements and resource hint APIs; current details should be checked against React's current reference because eligibility differs by element and attributes. Never treat hoisting or deduplication as permission to render conflicting metadata or duplicate script side effects intentionally.

## Common mistakes

- Confusing a `<style>` resource component with an element's inline `style` object.
- Omitting stylesheet `precedence` and expecting React-managed ordering.
- Using a preload `as` value that does not match eventual resource usage.
- Assuming `fetchPriority` overrides browser policy or guarantees a fetch order.
- Expecting duplicate script execution to be prevented in every case; React's deduplication applies only to eligible resource declarations.
- Supplying both `src` and inline children as if a script would use both.

## Cross-item comparison

Metadata components describe the document; `<link>`, `<img>`, `<script>`, and `<style>` declare resources or executable/style content. React hoisting changes placement for eligible components while the browser remains responsible for loading, execution, and security.

## Examples

```jsx
function PageHead() {
  return <>
    <title>Account settings</title>
    <meta name="description" content="Manage your account settings." />
    <link rel="stylesheet" href="/account.css" precedence="app" />
  </>;
}
```

The stylesheet is managed by React because it has `precedence`; this does not guarantee network success.

## Knowledge checks with answers

1. What does `precedence` control for a managed stylesheet?
2. Is resource hoisting a guarantee that a request succeeds?
3. Why must preload `as` match actual use?
4. How does `<style>` differ from an inline `style` prop?

## Answers

1. Relative ordering among React-managed stylesheets.
2. No. The browser controls fetch success and timing.
3. The browser uses the destination type for fetch behavior and reuse compatibility.
4. `<style>` declares a stylesheet resource; the prop is an object of CSS declarations on an element.

## Sources

- [React DOM components](https://react.dev/reference/react-dom/components)
- [React link](https://react.dev/reference/react-dom/components/link)
- [React meta](https://react.dev/reference/react-dom/components/meta)
- [React script](https://react.dev/reference/react-dom/components/script)
- [React style](https://react.dev/reference/react-dom/components/style)
- [React title](https://react.dev/reference/react-dom/components/title)
- [React 19 release](https://react.dev/blog/2024/12/05/react-19)
