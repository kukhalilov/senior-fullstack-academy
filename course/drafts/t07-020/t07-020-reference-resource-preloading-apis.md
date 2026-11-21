# React DOM components forms resource hints portals and preload APIs — Reference: React DOM resource loading APIs

## Scope and version

This lesson describes React DOM 19.3 resource hint APIs and their browser-dependent effects across client and server rendering. [React DOM](https://react.dev/reference/react-dom)

## How this group fits the mental model

React DOM resource APIs emit browser resource hints from application code. They express intent; the browser may ignore, reprioritize, or deduplicate hints, and a hint does not guarantee a successful fetch. Frameworks may already manage these hints, so avoid redundant calls. These functions are exported by `react-dom` and work in browser rendering; in server-side rendering or Server Components, each hint only takes effect when called during component rendering or in an async context that originates from component rendering. Calls from other server contexts are ignored. In the browser, they may be called while rendering, in Effects, or in event handlers. [React DOM](https://react.dev/reference/react-dom)

## Supplied names explained

### Selecting the hint

| API | Intent | Key distinction |
|---|---|---|
| `prefetchDNS(href)` | Resolve a host name early | DNS only; useful for a likely future origin |
| `preconnect(href)` | Resolve and establish an early connection | More work than DNS; use for a likely cross-origin request |
| `preload(href, options)` | Fetch a resource needed soon | Requires `as`; use for a resource with high confidence of near-term use |
| `preloadModule(href, options)` | Preload an ESM module without evaluating it | Requires `as: "script"`; module-specific |
| `preinit(href, options)` | Fetch and initialize a script or stylesheet | Can execute a script or make stylesheet available early; stronger side effect than preload |
| `preinitModule(href, options)` | Fetch and evaluate an ESM module | Requires `as: "script"`; code runs after download |

### Options and matching

For `preload`, `as` is required and can be `audio`, `document`, `embed`, `fetch`, `font`, `image`, `object`, `script`, `style`, `track`, `video`, or `worker`. Options can include `crossOrigin`, `referrerPolicy`, `integrity`, `type`, `nonce`, `fetchPriority`, and image-only `imageSrcSet` and `imageSizes`. `crossOrigin` is required when `as` is `fetch`. A cross-origin fetch commonly needs a matching `crossOrigin` mode to be reused by the eventual request. The URL and relevant attributes should match the eventual resource or the browser may fetch twice.

`preloadModule` and `preinitModule` use module script semantics and require an options object with `as: "script"`; it may also include `crossOrigin`, `integrity`, `nonce`, and `fetchPriority`. `preinit` requires `as: "script"` or `as: "style"`; for stylesheets, `precedence` is also required and accepts `reset`, `low`, `medium`, or `high` to determine React's managed ordering. Script options can include `crossOrigin`, `integrity`, `nonce`, and `fetchPriority`. Do not call a preinit API casually: script initialization can execute code.

`prefetchDNS` is usually appropriate for a likely third-party host but offers no benefit for an already-connected same-origin host. `preconnect` consumes network resources, so reserve it for origins likely to be used soon; it gives no benefit for the already-connected origin serving the page. `fetchPriority` is a browser hint, not a guarantee. Responsive image hints should align `imageSrcSet`/`imageSizes` with the rendered image's candidate selection.

## Cross-item comparison

These APIs progress from low-cost origin preparation (`prefetchDNS`, then `preconnect`), to fetching a known resource (`preload`, `preloadModule`), to fetching and initializing a resource (`preinit`, `preinitModule`). Choose the least work that meets the need.

## Examples

```jsx
import { preconnect, preload } from 'react-dom';

function ProductPage() {
  preconnect('https://images.example');
  preload('/hero.avif', { as: 'image', fetchPriority: 'high' });
  return <img src="/hero.avif" alt="Product" fetchPriority="high" />;
}
```

Only hint resources that are likely to be used; ensure responsive images and credentials match the actual request. On the server, put calls in a component render or render-originating async context or no hint is emitted.

## Common mistakes

- Treating hints as commands or guarantees.
- Using preload without the correct `as` destination.
- Mismatching credentials/CORS mode, URL, type, or responsive image candidate.
- Preconnecting to many origins and consuming connection resources.
- Using `preinit` when fetching without execution/initialization was intended.
- Duplicating hints already emitted by a framework or React resource component.

## Knowledge checks with answers

1. Which API performs DNS lookup only?
2. What required option identifies a `preload` destination?
3. Why is `preinit` stronger than `preload`?
4. Does `fetchPriority` guarantee network order?

## Answers

1. `prefetchDNS`.
2. `as`.
3. It initializes the resource; for scripts this can execute code, while preload only fetches for later use.
4. No, it is a hint to the browser scheduler.

## Sources

- [prefetchDNS](https://react.dev/reference/react-dom/prefetchDNS)
- [preconnect](https://react.dev/reference/react-dom/preconnect)
- [preload](https://react.dev/reference/react-dom/preload)
- [preloadModule](https://react.dev/reference/react-dom/preloadModule)
- [preinit](https://react.dev/reference/react-dom/preinit)
- [preinitModule](https://react.dev/reference/react-dom/preinitModule)
