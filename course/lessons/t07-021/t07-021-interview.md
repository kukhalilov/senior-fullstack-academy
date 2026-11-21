# React client hydration server streaming and static rendering APIs — Interview questions and reasoning

Use the [React client API reference](https://react.dev/reference/react-dom/client), [server API reference](https://react.dev/reference/react-dom/server), and [static API reference](https://react.dev/reference/react-dom/static) to support runtime-specific choices.

## Core questions

1. When should `createRoot` be used instead of `hydrateRoot`?
2. What is the difference between streaming SSR and static prerender?
3. How do Node and Web Stream APIs differ in React DOM rendering?
4. What conditions cause hydration mismatch?
5. What does a Suspense boundary contribute to server rendering?
6. Which output is intended for hydration: `renderToString` or `renderToStaticMarkup`?

## Concise interview answers

1. Use `createRoot` for client-owned/empty content; `hydrateRoot` for matching React server HTML.
2. Streaming sends shell and later content progressively; static prerender waits for suspended content and produces complete output.
3. They use different stream interfaces. React recommends dedicated Node functions in Node and Web Stream functions in Web Stream runtimes.
4. Server and initial client output differ due to data, environment, dates/randomness, locale, or invalid nesting.
5. It defines a subtree that may show fallback and resolve separately in streaming output.
6. `renderToString` can produce hydration-oriented output; `renderToStaticMarkup` is non-interactive and not for hydration.

## Deep follow-up answers

1. Hydration is a consistency contract and adopts existing DOM; it should be chosen based on how the container was rendered, not whether it happens to contain child nodes. `createRoot`'s first render replaces its contents.
2. A prerender result may be represented as a stream but still waits. Streaming's advantage is incremental delivery; prerender's contract is complete content before the response/artifact is finalized.
3. Web `ReadableStream` and Node pipeable streams are different types. `renderToReadableStream`/`resume` are Web APIs; `renderToPipeableStream`/`resumeToPipeableStream` are Node APIs. Static prerender has parallel runtime-specific methods.
4. Share the initial server data snapshot and avoid nondeterministic/environment-specific work in render. Better diagnostics do not mean React can infer which value is correct.
5. Boundaries let the server and browser coordinate independently ready content; excessive or poorly placed boundaries can fragment loading UX.
6. The legacy string APIs are limited. For robust Suspense and streaming use current streaming or static APIs appropriate to the goal.

## Scenario questions

1. Existing server HTML flashes away after startup. Which likely API was used incorrectly?
2. A static page is delivered with a spinner for every suspended region despite waiting being acceptable. Which rendering family should be considered?
3. A request closes while the server is still rendering. What resource cleanup matters?
4. A localized date differs during hydration. How do you make initial output consistent?

## Tradeoffs and alternatives

- Client rendering is simpler for embedded/client-only UI but delays content until JavaScript runs.
- Hydration reuses server output but needs deterministic initial render and extra client work.
- Streaming can improve incremental delivery but needs stream-aware transport, shell/error handling, and thoughtful Suspense boundaries.
- Static prerender yields complete output but waits for suspended content.
- String APIs are simpler for limited integrations but sacrifice streaming and Suspense capabilities.

## Common weak answers

- “Hydration renders the HTML again.” It adopts existing markup and attaches React behavior.
- “Any stream API works in Node.” Web and Node stream interfaces differ; dedicated APIs matter.
- “Prerender is streaming because it returns a stream.” It waits before completion.
- “React fixes hydration mismatches.” Recovery exists but consistency should be designed.
- “SSR means the page works without JavaScript.” Progressive enhancement requires deliberate native behavior.

## Self-check rubric

Score 0–2 each: (a) chooses root based on markup provenance; (b) accurately compares streaming and prerender; (c) maps APIs to runtime; (d) diagnoses mismatch sources; (e) explains Suspense/selective hydration; (f) distinguishes static and hydratable output. A strong response scores 10–12 and describes a concrete failure mode for each choice.
