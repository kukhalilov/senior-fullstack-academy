# React DOM components forms resource hints portals and preload APIs — Reference: Resource and metadata component APIs

## Scope and version

This lesson covers React 19.3 eligible metadata and resource components. Browser fetching, CSP, and native element semantics remain browser-owned. [Components](https://react.dev/reference/react-dom/components)

## How this group fits the mental model

React can recognize selected rendered elements as document metadata or resource declarations and place eligible ones in the document head. This lets a component declare what it needs near the component that needs it. The browser still decides when and how to fetch resources; React's hoisting/deduplication is a rendering behavior, not a network-success guarantee. [Components](https://react.dev/reference/react-dom/components) [link](https://react.dev/reference/react-dom/components/link) [meta](https://react.dev/reference/react-dom/components/meta) [script](https://react.dev/reference/react-dom/components/script) [style](https://react.dev/reference/react-dom/components/style) [title](https://react.dev/reference/react-dom/components/title)

## Supplied names explained

### `<title>` and `<meta>`

`<title>` accepts text-only children and React places it in the document head, except when it is inside SVG or has `itemProp`. Render one title at a time; React places every simultaneous title in the head and browser/search behavior is undefined. The text should be a single string, number, or object with `toString`. The `meta name prop`, `meta httpEquiv prop`, `meta charset prop`, and `meta itemProp prop` are mutually exclusive: specify exactly one. The `meta charset prop` only accepts `utf-8`. With `itemProp`, the `<meta>` stays in the React tree instead of moving to the head. The `meta content prop` supplies the metadata value or directive behavior. React hoists `<meta>` to the head except when `itemProp` is present. Do not assume React deduplicates metadata or use conflicting tags.

### `<link>` and resource declarations

`<link>` requires `rel` and supports `href`, `crossOrigin`, `referrerPolicy`, `fetchPriority`, `hrefLang`, `integrity`, and `type`. For `rel="stylesheet"`, `precedence`, `media`, and `title` apply; `disabled`, `onLoad`, or `onError` disables React’s special stylesheet treatment. For `rel="preload"` or `"modulepreload"`, `as` is the resource type and image hints may use `imageSrcSet`/`imageSizes`; `crossOrigin` is required when `as="fetch"`. For icons, `sizes` applies. `blocking="render"` is not recommended because Suspense gives React finer control. Most links are hoisted to `<head>`; `itemProp`, `onLoad`, or `onError` opt out. A stylesheet requires `precedence` for React-managed treatment; it suspends while loading and duplicate stylesheets with the same `href` are deduplicated. `disabled`, `onLoad`, or `onError` also opts out of that special treatment. Managed stylesheet props are immutable after rendering, and React may leave the node after unmount. `rel="preload"` declares a fetch for an upcoming use; `as` must match its eventual destination. `modulepreload` prepares an ESM module and dependencies. React’s imperative preload APIs are covered separately.

### `<img>`

`<img>` supports `alt`, `crossOrigin`, `decoding`, `fetchPriority`, `height`, `loading`, `onError`, `onLoad`, `referrerPolicy`, `sizes`, `src`, `srcSet`, `useMap`, and `width`, in addition to common props. Use empty `alt` for decorative images; provide dimensions to reserve layout space. Do not pass an empty `src`, children, or `dangerouslySetInnerHTML`. During server rendering, React automatically emits an image preload hint by default for eligible images. `loading="lazy"` or `fetchPriority="low"` opts out, as do images inside `<picture>`/`<noscript>` and data URLs. A preload hint for a responsive image must match the chosen source candidate. During a ViewTransition update React waits up to 500 ms for visible images; `loading="lazy"` or an `onLoad` handler opts out, while `fetchPriority="low"` alone does not.

### `<script>`

React can move an external script to `<head>` and deduplicate it only when it has both `src` and `async={true}`; the async requirement makes moving it safe. Supported props include `async`, `type`, `crossOrigin`, `fetchPriority`, `integrity`, `noModule`, `nonce`, and `referrer`; external source uses `src`, while inline source uses string `children`. Do not provide both. Inline scripts are not moved or deduplicated. `onLoad` and `onError` let the component manage loading and disable React’s special script treatment. For a hoisted script, React ignores prop changes after rendering and may leave the element after unmount. `blocking` is discouraged; `defer` is incompatible with streaming server-rendered components. Browser CSP, integrity, and execution-order behavior still apply.

### `<style>`

React hoists and deduplicates a `<style>` resource only when both `href` and `precedence` are provided. `style children prop` supplies CSS text; `style href prop` identifies the stylesheet for deduplication; `style media prop`, `style nonce prop`, and `style title prop` express browser stylesheet metadata. `precedence prop` orders the managed stylesheet alongside other `<link>` and `<style>` resources. `blocking="render"` is not recommended. React may suspend while an external stylesheet resource loads; an inline stylesheet does not trigger Suspense. When `precedence` is used, React drops extraneous props beyond `href` and `precedence`; managed props become immutable after rendering, and React may retain the style node after its rendering component unmounts. This is distinct from the `style` object prop used on ordinary elements for inline CSS declarations.

### React resource handling

`React hoisting eligible resources to document head` lets components declare metadata and resources near the content that uses them. `React deduplication for eligible resources` applies to the documented resource types and matching rules, such as stylesheet links with the same `href` and external async scripts with the same `src`; do not infer metadata deduplication. `precedence prop` supplies an ordering group for managed stylesheets. React 19 introduced resource improvements and preload APIs; exact eligibility differs by element and attributes. Never treat hoisting or deduplication as permission to render conflicting metadata or duplicate script side effects intentionally.

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
