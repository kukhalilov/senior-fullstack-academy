# End-to-end browser navigation and web request lifecycle — Reference: Response delivery to pixels and React interactivity

## Scope and version

This lesson explains the browser’s main rendering dependencies and React hydration relationship. Exact scheduling varies by browser and resource; inspect real traces.

## How this group fits the mental model

The HTML response is input, not the final page. The browser discovers resources, constructs document/style structures, runs scripts, computes layout, and paints. React hydration adds event behavior to compatible server markup; it does not eliminate parsing or rendering work.

## Supplied names explained

- `HTML parser and preload scanner` — The parser builds document structure and discovers subresources. Browsers may scan ahead to find fetchable resources while parsing; parser behavior and priority heuristics are implementation details.
- `DOM tree construction` — HTML tokens are turned into a node tree representing the document. Scripts and malformed markup can affect parsing and when resources are discovered.
- `CSSOM construction` — Stylesheets are parsed into structures used to resolve applicable rules. CSS can block rendering because the browser needs style information to compute appearance.
- `Render tree` — A conceptual representation of visible styled content used in layout/paint; it is not identical to the DOM because non-rendered nodes and pseudo-elements differ.
- `Layout and paint` — Layout computes geometry; paint records visual drawing operations. Changes can trigger style recalculation, layout, paint, or compositing depending on property and browser.
- `JavaScript parse compile and execute` — The browser processes scripts and executes them. Scripts can consume main-thread time and delay parsing, rendering, or interaction; module/defer/async behavior affects ordering.
- `Render-blocking stylesheet` — A stylesheet can delay first rendering while the browser determines styles. Reduce unnecessary critical CSS and avoid loading unrelated styles on the critical path.
- `Parser-blocking script` — A classic script encountered by the parser can pause parsing while it is fetched/executed, subject to attributes and browser behavior. Use script loading strategy deliberately.
- `Critical rendering path` — The set and ordering of work needed to render initial pixels. Optimize resource discovery, critical CSS, script behavior, and above-the-fold content based on measurement.
- `Largest Contentful Paint (LCP)` — A user-centric loading metric measuring when the largest qualifying content element is rendered in the viewport. It is not simply server response time.
- `First Input Delay (FID) and Interaction to Next Paint (INP)` — FID measured delay before the browser begins processing a first interaction and is a legacy field metric; INP measures interaction responsiveness across the page lifecycle and is the current Core Web Vitals responsiveness metric as checked. Do not use FID as a proxy for all interaction latency.
- `React hydration` — React attaches client behavior to server-rendered HTML. The initial client output should match the server markup; event behavior and subsequent updates then run on the client.
- `Hydration mismatch` — A difference between server HTML and the initial client render. Non-deterministic time, locale, random values, or browser-only state can cause it; correct the source of divergence rather than suppressing every warning.
- `Streaming HTML and Suspense boundary` — A server renderer can send portions of HTML progressively around boundaries when the runtime/framework supports it. Streaming changes delivery timing but does not guarantee all dependencies are fast or hydration complete.

## Cross-item comparison

Parsing builds DOM and discovers work; CSSOM plus DOM inform the rendered view; layout/paint produce visible output. JavaScript can delay the main thread. LCP concerns loading of prominent content; INP concerns interaction responsiveness. Streaming can deliver HTML earlier, while hydration still attaches client behavior and must agree with server output.

## Examples

If LCP is delayed by a hero image discovered late through CSS, make the resource easier to discover or prioritize appropriately. If the page paints but input is delayed, inspect long JavaScript tasks and hydration work. If hydration reports a timestamp mismatch, make the initial value deterministic or render a stable placeholder until client data is available.

## Common mistakes

- Equating `DOMContentLoaded` or API response time with visual readiness.
- Treating all CSS or JavaScript as equally critical.
- Claiming streaming automatically improves LCP or INP.
- Using browser-only storage to produce server/client initial markup that cannot match.
- Continuing to report FID as the current Core Web Vitals responsiveness metric.

## Knowledge checks with answers

1. Which metric represents prominent content loading: LCP or INP? LCP.
2. What must hydration’s initial client render generally match? The server-rendered markup.
3. Why can a small API response still lead to slow interaction? Main-thread JavaScript and hydration can delay input handling.

### Sources

- [MDN: Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [MDN: How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)
- [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
- [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp)
- [web.dev: INP](https://web.dev/articles/inp)
