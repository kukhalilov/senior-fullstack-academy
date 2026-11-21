# End-to-end performance engineering for web applications — Reference: Browser loading, rendering, and interaction performance

## Scope and version

This lesson connects browser and React measurement. User-centric metrics and browser scheduling evolve; use current field guidance and representative devices.

## How this group fits the mental model

The browser owns the final rendering and interaction path. React is one contributor among network discovery, CSS, image/font delivery, JavaScript execution, layout, paint, and hydration. Profile the whole page before optimizing component render counts.

## Supplied names explained

- `Critical rendering path` — The work and dependencies needed to render initial pixels. Resource discovery, CSS, and scripts can block or delay it.
- `Largest Contentful Paint (LCP)` — The render time of the largest eligible visible content element. It reflects important loading work, not just API or server timing.
- `Interaction to Next Paint (INP)` — A field metric for interaction responsiveness across a page visit, reflecting input delay, processing, and presentation delay. Use interaction traces to find long tasks and rendering work.
- `Cumulative Layout Shift (CLS)` — A measure of unexpected visual layout movement. Reserve image/ad space and avoid inserting content above existing content without user intent.
- `Resource discovery and priority` — How and when the browser learns about resources and schedules their fetches. A late-discovered LCP image may load after less important work.
- `Render-blocking CSS` — Stylesheets can delay rendering while style information is needed. Inline or prioritize only truly critical CSS and remove unnecessary dependencies from the first view.
- `JavaScript parse and execution cost` — Code consumes download, parsing, compilation, and execution resources. Reduce unused code and avoid main-thread work that blocks input.
- `Long task` — A long period of main-thread work that delays event handling and rendering. Identify its source in a performance trace before splitting or moving work.
- `Main-thread contention` — Multiple tasks compete for the main thread that coordinates script, input, and rendering. More asynchronous requests do not fix CPU-bound main-thread work.
- `React Profiler commit duration` — Time React spends rendering and committing updates in the profiled tree. It does not include every network, browser layout, or server stage.
- `Unnecessary render versus expensive render` — A render can occur without meaningful cost, while an expensive render may be necessary. Optimize measured expensive work rather than suppressing every render.
- `React hydration cost` — Client work that attaches behavior to server markup and may process boundaries. Server rendering can improve early HTML but hydration has its own CPU and consistency cost.
- `Code splitting and route chunking` — Divide JavaScript so a route need not load all code initially. Additional chunks add requests and loading coordination; balance startup bytes against later navigation cost.
- `Image and font payload optimization` — Choose suitable dimensions/formats and font subsets/loading behavior. Large or late critical images/fonts can delay rendering or shift layout.
- `Real User Monitoring (RUM) versus synthetic test` — RUM records real user/device/network distributions; synthetic tests provide controlled repeatability. Use both because one shows impact and the other helps isolate changes.

## Cross-item comparison

LCP is loading, INP is responsiveness, and CLS is visual stability. React Profiler isolates React work; browser traces reveal broader rendering and resource work. Synthetic tests aid comparison, while RUM shows actual user distributions.

## Examples

If LCP is a product hero image, inspect when it is discovered and whether it competes with scripts. If INP is poor after typing, inspect long tasks, expensive React updates, and synchronous storage. If CLS is high, identify layout shifts and reserve stable space.

## Common mistakes

- Optimizing render count without measuring commit time or user impact.
- Assuming server-rendered HTML means the page is interactive.
- Reporting a synthetic score as a real-user percentile.
- Preloading many assets and causing bandwidth competition.

## Knowledge checks with answers

1. Which metric focuses on interaction responsiveness? INP.
2. What does React Profiler omit? Network, server, and many browser rendering costs outside React.
3. Why optimize resource discovery? Critical resources discovered late start late and delay the experience.

### Sources

- [React Profiler](https://react.dev/reference/react/Profiler)
- [React useTransition](https://react.dev/reference/react/useTransition)
- [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [web.dev Web Vitals](https://web.dev/articles/vitals)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [INP](https://web.dev/articles/inp)
