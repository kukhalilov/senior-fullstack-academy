# React DOM rendering modes hydration and host integration — Interview questions and reasoning

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React DOM static APIs](https://react.dev/reference/react-dom/static), and [Suspense](https://react.dev/reference/react/Suspense).

## Core questions

Be prepared to distinguish client rendering, server rendering, hydration, streaming, and static output, and explain how React primitives relate to framework-managed routing and deployment.

## Concise interview answers

Hydration attaches React behavior to matching server HTML. Streaming delivers available HTML incrementally. Static prerendering creates reusable output ahead of requests. Client rendering creates the host tree in the browser. Select based on freshness, interactivity, privacy, runtime support, and measured user needs.

## Deep follow-up answers

### How can server-rendered markup improve perceived startup?

The browser can parse and display HTML before the client bundle finishes loading. Interactivity still waits for client JavaScript and hydration unless native browser behavior handles the action. SSR also adds server capacity, data, caching, and output-consistency concerns.

### What causes hydration mismatch?

The initial client output differs from server markup, often due to time/randomness, locale/timezone, invalid nesting, inconsistent data, or browser-only checks. Compare actual initial inputs and correct determinism instead of hiding the warning.

### Compare streaming and static prerendering.

Static prerendering computes complete reusable output ahead of time and needs a freshness strategy. Streaming renders at runtime and can send ready regions early, but needs a compatible stream runtime and deployment path. Frameworks may combine approaches.

### Does server rendering mean Server Components?

No. Server rendering can produce HTML for ordinary component trees. Server Components add a distinct component execution and serialization model. Keep these concepts separate when discussing framework architectures.

## Answering framework

Start with the user requirement: first content, interactivity, freshness, personalization, availability, and privacy. Describe the data and rendering lifecycle, then mention deployment/runtime support and how you would test early markup, hydration, caching, and fallback behavior.

## Scenario questions

### Product page with slow reviews

Keep ready product details outside a narrow Suspense boundary around reviews. Stream the response if supported; reserve stable space for a fallback and verify that real deployment proxies flush chunks.

### Private account balances

Never place per-user balances in a shared static artifact or incorrectly keyed cache. Authorize the request and use private/no-store or correctly partitioned caching as the threat and product requirements demand.

### Timezone-dependent text

Render the same deterministic initial text on server and client, commonly with an explicit timezone. Apply local formatting after hydration if that is the product requirement.

## Tradeoffs and alternatives

Client rendering is simple for browser-owned interactive surfaces. SSR provides early HTML and request personalization. Static output is cacheable when content is stable. Streaming can reveal partial output progressively. Framework constraints may determine which combinations are supported.

## Common weak answers

- “SSR makes every page faster.”
- “The server HTML is already interactive.”
- “Hydration mismatch is only a harmless warning.”
- “Streaming is the same as static generation.”
- “Static content is safe to cache even when it contains user data.”

## Self-check rubric

An effective answer explains the output lifecycle, interactivity timing, data freshness/privacy, mismatch risks, runtime constraints, and an observable way to validate the choice.

## Senior-level signals

Discusses cache isolation, failure modes, streaming behavior through infrastructure, progressive enhancement, deterministic rendering, and the distinction between React renderer APIs and framework lifecycle integration.
