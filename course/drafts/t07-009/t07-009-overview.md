# React DOM rendering modes hydration and host integration — Big-picture orientation and mental model

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React DOM static APIs](https://react.dev/reference/react-dom/static), [Suspense](https://react.dev/reference/react/Suspense), and [Render and Commit](https://react.dev/learn/render-and-commit).

## Problem and purpose

React components describe UI; a renderer turns that description into a host tree. For a browser application, the host is the DOM. An application may create that tree in the browser, produce HTML on a server, or generate static output during a build. These choices affect first response, interactivity, runtime needs, and how the browser starts managing the markup.

## Plain-language mental model

Server rendering sends HTML so the browser can display meaningful content before the full client application is ready. Hydration reuses compatible server HTML and attaches React’s event handling and update behavior. Client rendering creates the UI tree in the browser. Streaming sends completed HTML progressively, often around Suspense boundaries. Static prerendering waits until output is available and saves it for later delivery.

## How the parts fit together

```text
components → renderer → host output
server renderer → HTML response → browser displays markup
                               → client hydrates compatible boundaries
client renderer → browser DOM + React updates
static prerender → saved HTML served later (no per-request React render)
```

React’s APIs provide rendering primitives; frameworks decide how requests, routes, data, caching, bundling, and deployment integrate them. An API being available in React does not mean every runtime or framework exposes it directly.

## Concept map

The component tree describes logical UI; the host tree contains environment-specific objects such as DOM elements. Server HTML is a snapshot of output. Hydration requires the initial client render to agree with that snapshot. Suspense boundaries can define fallback and progressive reveal units. Streaming improves response progression when supported by the runtime; it is different from build-time static generation.

## End-to-end walkthrough

A framework renders a product page on the server and sends HTML. The browser can display its content while JavaScript downloads. React then hydrates the page: it associates component behavior with the matching existing markup. A review section that is not ready may be represented by a Suspense fallback, and the server may stream the completed section later. If client and server generated different initial text because one used a local timezone and the other UTC, hydration reports a mismatch; the application should make the input deterministic or defer browser-only output until after hydration.

## When to use it and tradeoffs

Client rendering fits highly interactive authenticated tools when HTML-before-JavaScript offers little value or the host owns the tree. Server rendering can improve early content delivery but introduces server execution, data, and hydration coordination. Static output suits stable content that can be generated ahead of time. Streaming can improve progressive delivery but requires stream-capable runtime and thoughtful fallbacks. None of these modes alone guarantees good accessibility, search visibility, or performance.

## What later lessons cover

References separate renderer and host concepts, client/server/hydration behavior, streaming and Suspense, static/runtime constraints, and mode selection. A separate topic inventories exact React DOM method names.

## Version notes

React 18 introduced streaming server rendering with Suspense and selective hydration. React 19 added static prerender APIs that wait for suspended content. React 19.2 added partial prerender/resume and briefly batches server Suspense boundary reveals; it also made Web Streams server APIs available in Node, while React still recommends Node Streams for Node SSR. Framework integrations commonly hide low-level calls. Server Components are a separate model covered elsewhere.
