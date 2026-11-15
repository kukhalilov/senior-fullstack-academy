# React client hydration server streaming and static rendering APIs — Big-picture orientation and mental model

## Problem and purpose

React can render a UI in a browser, produce initial HTML on a server, or generate static HTML ahead of time. The key choice is what the output is for: an interactive client-owned tree, existing server markup that must become interactive, HTML streamed while content becomes ready, or completed static HTML that waits for suspended work. React has separate entry points because these jobs have different runtimes and guarantees. [Client APIs](https://react.dev/reference/react-dom/client) [Server APIs](https://react.dev/reference/react-dom/server) [Static APIs](https://react.dev/reference/react-dom/static)

## Plain-language mental model

Think of HTML as a snapshot of the UI. `createRoot` asks React to create and manage a new browser snapshot. `hydrateRoot` tells React, “this browser DOM already represents the same React tree; attach behavior and reconcile it.” Server renderers create the snapshot using Node streams, Web Streams, or a string. Static prerenderers wait until the snapshot is complete instead of sending parts as they arrive.

Hydration is a consistency contract: the initial client render must agree with the server HTML. If it does not, React may discard and regenerate a part or all of the affected tree. It is not a generic “render existing HTML” operation.

## How the parts fit together

```text
Need interactive UI in browser?
├── Empty/client-owned container ── createRoot ── root.render
└── React HTML already in container ── hydrateRoot

Need HTML before client JavaScript?
├── Stream progressively ── server stream APIs + Suspense boundaries
├── Wait for all content then output ── static prerender APIs
└── Need legacy non-streaming string ── renderToString / renderToStaticMarkup
```

The renderer's output mode and runtime are separate decisions. Node has Node.js Streams; modern edge runtimes and browsers use Web Streams. Some Web Stream APIs also exist in Node for compatibility, but React recommends dedicated Node stream APIs there because they perform better. [Server APIs](https://react.dev/reference/react-dom/server) [Static APIs](https://react.dev/reference/react-dom/static)

## Concept map

- **Client root:** owns rendering updates and lifecycle in a browser DOM container.
- **Hydration:** attaches React to matching server-generated HTML and later handles mismatches.
- **Streaming SSR:** sends a shell and later content in chunks; Suspense boundaries allow selective/progressive work.
- **Static prerender:** waits for suspended content and returns a completed static stream; it does not progressively stream content as it loads.
- **String rendering:** compatibility path for environments without streams, with limited Suspense/streaming behavior.

## End-to-end walkthrough

An application server renders `<App />` to HTML. The response sends that HTML to a browser, so content can appear before the client bundle is ready. The browser loads the matching JavaScript and calls `hydrateRoot(container, <App />)`. React compares the initial client tree with the server DOM, attaches event behavior, and takes ownership. Later state changes update the same root. If the client uses a different locale-dependent date or random value on the first render, the initial output may mismatch; make the initial data deterministic or provide the server snapshot to the client.

For a client-only tool with an empty container, use `createRoot` and then `root.render`. Calling it on server HTML clears that markup; it does not hydrate it. When an integration removes the host container, `root.unmount()` lets React clean up its tree.

## When to use it and tradeoffs

- Choose **hydration** when HTML was generated for this React tree and interactivity should attach without replacing the initial markup.
- Choose **client rendering** when the container is empty or its content should be replaced by a client-owned app.
- Choose **streaming** when progressive response delivery matters and the runtime supports the corresponding stream API.
- Choose **static prerendering** when complete output should wait for suspended content, such as a build-time static page.
- Choose **string APIs** only when a non-streaming interface is required; they have less functionality and are legacy-compatible.

## What later lessons cover

The reference set covers each client root API, Web Stream and Node stream server APIs, string renderers, static prerender APIs, and the behaviors that cross them: streaming, selective hydration, Suspense, mismatch handling, progressive enhancement, and runtime support.

## Version context

React 19 added the `react-dom/static` entry point and prerender APIs, plus resume APIs that continue prerendered output. React 19 removed older `renderToNodeStream` APIs; use current environment-specific server APIs. [React 19](https://react.dev/blog/2024/12/05/react-19)

## What is covered elsewhere

Form Actions and DOM components belong to t07-020; framework routing, server component implementation, and deployment decisions belong to later topics.
