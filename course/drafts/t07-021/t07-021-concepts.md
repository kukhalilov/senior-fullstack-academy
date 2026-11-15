# React client hydration server streaming and static rendering APIs — Core concepts and how they fit together

## Learning objectives

Choose client rendering versus hydration; distinguish Node and Web stream APIs; explain streaming, static prerendering, strings, Suspense, selective hydration, mismatch handling, and progressive enhancement; and choose an output method that matches the desired runtime and interactivity.

## Prerequisites

Know what a React element tree, browser DOM, JavaScript bundle, Promise, and Suspense boundary are. A **root** is React's top-level connection to a DOM container. **Hydration** is attaching React to matching server-generated HTML. **Streaming** sends output incrementally through a stream. [Client APIs](https://react.dev/reference/react-dom/client) [Server APIs](https://react.dev/reference/react-dom/server)

## Core concepts

### Rendered HTML has a purpose

The same component tree can produce different kinds of output. Client roots produce and update a live browser DOM. Server HTML is an initial representation that may later hydrate. Static output is a completed document fragment or page without an expectation that it will receive React interactivity. The API name and import path indicate the job: `react-dom/client`, `react-dom/server`, or `react-dom/static`.

### Client rendering and hydration are not interchangeable

`createRoot(container)` establishes a root for client-owned UI. Its first render replaces the container's existing contents. `hydrateRoot(container, reactNode)` expects existing HTML generated for that React tree; it preserves that initial markup while React attaches behavior and reconciles it. The root should be created once and retained for later `root.render` calls and `root.unmount()`.

Hydration assumes the server's initial render and the client's initial render agree. Sources of mismatch include variable values like current time/random numbers, server/client branching, different data, locale formatting, and invalid HTML nesting. React 19 improves development diagnostics with a focused hydration mismatch diff, but better diagnostics do not make inconsistent output safe. [React 19](https://react.dev/blog/2024/12/05/react-19)

### Streaming versus static completion

Streaming renderers can send a shell before all Suspense-delayed content is ready, then send later parts as they resolve. The shell should remain useful; each Suspense boundary marks work that can be delayed and revealed later. In the browser, React can hydrate ready portions selectively rather than waiting for every component. User interaction with a not-yet-hydrated boundary can influence hydration priority.

Static prerenderers wait for suspended content to finish and then produce the complete static output. They can use stream-shaped return values, but they are not progressive-response streaming: the point is to wait before completing. `resume` and `resumeToPipeableStream` continue output prepared by the corresponding prerender flow; they are not generic continuation APIs for arbitrary rendered trees. [Static APIs](https://react.dev/reference/react-dom/static) [Server APIs](https://react.dev/reference/react-dom/server)

### Runtime determines stream API

Web Streams use `ReadableStream` and are supported by browsers, Deno, and modern edge environments. Node.js has its own Node stream API. React documents `renderToReadableStream` and `resume` for Web Stream environments, and `renderToPipeableStream` and `resumeToPipeableStream` for Node streams. Some Web Stream methods also work in Node for compatibility, but current React guidance recommends the dedicated Node methods there for performance. Static output has corresponding Web Stream and Node stream APIs. [Server APIs](https://react.dev/reference/react-dom/server) [Static APIs](https://react.dev/reference/react-dom/static)

### String output is a constrained fallback

`renderToString` creates an HTML string intended for hydration-compatible output. It does not stream and has limited behavior when a component suspends. `renderToStaticMarkup` creates non-interactive static HTML and should not be treated as hydration output. The stream and prerender APIs provide more complete support for Suspense and progressively/fully awaited content according to their mode.

### Progressive enhancement

Server-rendered HTML can expose readable content and native links/forms before the client bundle loads. A function Action or JavaScript-only event behavior may need the client runtime, while ordinary HTML form semantics can provide a fallback if designed with an action URL and server handling. Progressive enhancement is a design property of the page, not automatic behavior guaranteed by calling a particular renderer.

## Mechanisms and relationships

| Need | API family | Output and ownership |
|---|---|---|
| Empty browser container | `createRoot` | Client-owned interactive DOM |
| Matching server HTML | `hydrateRoot` | Existing markup becomes interactive |
| Progressive server response | Streaming server renderer | Incremental stream; Suspense can split readiness |
| Complete HTML after suspense resolves | Static prerender renderer | Waits for content; no progressive content stream |
| Non-streaming legacy integration | String renderer | HTML string with limitations |

## Worked examples

### Empty client container

```jsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

Use this when the container is intended for client rendering. Retain `root` if the host later needs to unmount it.

### Matching server HTML

```jsx
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('root'), <App />);
```

The server and client need the same initial data and compatible markup. The example assumes the container already contains React-generated server HTML. [Client APIs](https://react.dev/reference/react-dom/client)

## Misconceptions and edge cases

- `createRoot` does not attach to server HTML; it clears and replaces existing children on initial render.
- Hydration expects markup from the same initial React tree; it is not a general HTML parser.
- Static `prerender` waits; a stream return type does not imply progressive delivery.
- `renderToStaticMarkup` output is not intended to hydrate.
- A Suspense boundary provides a coordination boundary, not a guarantee every loading state is useful.
- Server rendering alone does not guarantee a page works before JavaScript; forms, links, errors, and loading need deliberate design.
- Web Stream and Node stream functions are not interchangeable return types.

## Knowledge checks with answers

1. **When do you use `hydrateRoot`?** When the container already has HTML generated for the same React tree and should become interactive.
2. **Why not call `createRoot` on server HTML?** Its initial render replaces existing container contents instead of hydrating them.
3. **Does static prerender stream content as it becomes ready?** No; it waits for suspended content and returns complete output.
4. **Which server stream API is the dedicated Node choice?** `renderToPipeableStream`, with `resumeToPipeableStream` for resumed prerender output.
5. **Why can hydration fail despite both renders using React?** Initial inputs/environment/markup may differ; React version alone does not guarantee identical output.
