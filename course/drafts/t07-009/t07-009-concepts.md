# React DOM rendering modes hydration and host integration — Core concepts and how they fit together

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React DOM static APIs](https://react.dev/reference/react-dom/static), [Suspense](https://react.dev/reference/react/Suspense), and [Render and Commit](https://react.dev/learn/render-and-commit).

## Learning objectives

Explain how React renderers map components to hosts; compare client rendering, server rendering, hydration, streaming, and static output; reason about Suspense boundaries; diagnose hydration mismatch causes; and separate React primitives from framework lifecycle responsibilities.

## Prerequisites

Know components, render purity, Suspense basics, and browser DOM behavior. Server rendering does not change the rule that React components must be pure.

## Core concepts

React elements and components form a logical tree. A renderer interprets that tree for a host environment. React DOM targets browser markup; other renderers can target different hosts. The component tree is not identical to the resulting host tree: fragments, portals, components, and Suspense structure do not always correspond one-to-one with DOM elements.

Client rendering starts with a browser-owned root and creates host nodes from React output. Server rendering runs components in a server runtime and produces HTML. HTML can be displayed before client JavaScript, but it has no React event handlers until hydrated (and may have limited native browser behavior depending on markup). Hydration attaches React behavior to compatible existing markup rather than clearing and rebuilding it. Initial output must match across server and client.

Hydration mismatches commonly arise from time, random values, locale/timezone formatting, browser-only APIs, invalid nesting, data that changed between server and client, or nondeterministic iteration. Correct the source by sharing a stable snapshot, rendering deterministic markup, or deferring truly browser-specific UI. React warns about differences in development, but attribute mismatches are not guaranteed to be patched. `suppressHydrationWarning` is a one-level escape hatch for an unavoidable text/attribute difference and does not patch mismatched text; it does not repair underlying disagreement.

Streaming server rendering allows the server to write available HTML before all suspended content is ready. Suspense boundaries define regions that can render fallback content and reveal later content when available. Browser hydration can prioritize parts the user interacts with, subject to framework and runtime implementation. Streaming means transport-level progressive delivery; it is not the same as static generation or a guarantee that all content arrives immediately.

Static prerendering waits for content according to the chosen API and emits HTML that can be saved and served later. It suits content that does not need a fresh render per request. Streaming can produce earlier bytes while waiting on slower sections. A resumable prerender workflow can split generation from later stream completion where supported. Node.js streams and Web Streams differ in interface; choose the API compatible with the deployment runtime or use a framework that handles it.

Progressive enhancement means useful content or native behavior remains available before the full client bundle loads when product design allows. Server-rendered HTML can contribute to it, but interactive controls and forms still need correct semantics and server-side handling. Client code may enhance behavior after hydration.

Frameworks coordinate route selection, data loading, caching, errors, headers, streaming, and client bundles. React DOM API references describe primitives, not a complete production request lifecycle. Follow framework guidance for its rendering mode and avoid mixing ownership of the same root.

## Mechanisms and relationships

```text
client render: React → browser host tree
server render: React on server → HTML bytes
hydrate: existing server HTML + client component tree → interactive React-managed host
stream: HTML bytes delivered progressively across ready boundaries
static prerender: complete output generated ahead of serving
```

## Worked examples

If a server renders `new Date().toLocaleString()` using one timezone and the client renders using another, the first client tree may not match the HTML. Instead, format with an explicit timezone and stable data, or render browser-local formatting after hydration. For a slower recommendation panel, a Suspense fallback can let the rest of the page stream earlier, provided the framework supports the data/render integration.

## Misconceptions and edge cases

- Server rendering is not hydration; one produces HTML, the other attaches client behavior.
- Hydration should reuse matching markup, not intentionally clear it.
- Server-rendered output does not automatically make an application a Server Components application.
- Streaming requires compatible runtime output and response handling.
- Static output may be stale if content changes and no regeneration/revalidation strategy exists.
- Browser-only APIs cannot be assumed during server rendering.
- React rendering API knowledge is not enough to configure a framework’s route cache or deployment runtime.

## Knowledge checks with answers

1. **What does hydration do?** Connects client React behavior to compatible server-produced markup.
2. **What must initially agree?** Server markup and client’s initial rendered output.
3. **What does streaming change?** When response portions can be delivered, not necessarily how often they update.
4. **Who typically owns route/cache integration?** The application framework or server integration.


## System-design view: rendering is part of the request path

Choose rendering per user journey and operating constraint. Server rendering can return useful HTML earlier, but adds server capacity, data-fetch latency, and cache/privacy decisions; static output shifts work to build or revalidation time but may be stale; client rendering depends on JavaScript delivery and browser work. Streaming can release ready portions sooner but still needs a compatible host and carefully chosen boundaries. Hydration requires the initial client render to agree with server markup. Keep personalized HTML out of shared caches unless the cache key and authorization model are correct. Treat initial HTML, JavaScript chunks, API data, and CDN cache as one release graph. [React DOM server APIs](https://react.dev/reference/react-dom/server) · [React Suspense](https://react.dev/reference/react/Suspense).
