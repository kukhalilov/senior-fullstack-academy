# architecture interviews tradeoffs requirements and constraints — Problem: Explain the browser critical rendering path

## Goals

Trace a navigation from response bytes to pixels, identify what blocks the first useful render, and recommend changes whose effects can be measured.

## Worked example

An interviewer gives you a product page with a slow stylesheet, a classic script in the document head that reads and changes the DOM, a web font, and a large hero image referenced only from CSS. The heading above the fold appears late.

Start by clarifying the target: do we care about the first content, the largest content element, or interaction readiness? Ask for a performance trace and the device/network profile. Then tell the causal story rather than listing optimizations.

1. The browser receives HTML and parses it into the DOM. A preload scanner may discover some linked resources while parsing, but it cannot discover a CSS background image until it has fetched and parsed the stylesheet.
2. CSS is fetched and parsed into the CSSOM. CSS can block rendering because the browser needs applicable style rules to know what the page should look like. A stylesheet can also delay a later classic script when that script may inspect computed styles.
3. A classic script in the head without `async` or `defer` pauses HTML parsing while it is fetched and executed. If it reads DOM nodes that have not been parsed, it may see incomplete markup; if it changes the DOM or styles, that work can affect rendering. `defer` downloads in parallel and runs after parsing in document order; `async` runs when ready and does not preserve order, so it is suitable only for independent scripts.
4. DOM and CSSOM information are combined into the render tree for visible content. The browser computes style, performs layout (geometry), paints drawing instructions into layers, and composites layers into the displayed frame. Not every later change repeats every stage: a color change may repaint; a geometry change can require layout and paint; transforms often can be composited, depending on the browser and page.
5. The hero image matters to the visible result and may be the largest contentful paint candidate. If its URL is hidden in a late stylesheet, discovery and transfer start late. A real trace can show whether the delay is discovery, connection/transfer, decode, or main-thread work.

You could move nonessential scripts out of the parser-blocking path, use `defer` when document order is required, split or inline only the truly critical CSS, and expose the hero resource early with suitable markup and responsive image selection. Avoid blindly making every resource high priority: competing downloads can delay the actual LCP resource. Verify changes in a waterfall and with field or lab metrics. The critical rendering path is a dependency graph, not a fixed sequence of all downloads.

## Exercises

1. A page has a small inline stylesheet, a large below-the-fold image, and an analytics script marked `async`. Which resources are plausible first-render blockers and why?
2. A team changes the hero from an HTML `<img>` to a CSS background. What discovery and semantic tradeoffs should be checked?
3. A performance trace shows fast HTML and CSS delivery but a long main-thread task before paint. Which part of the investigation changes?
4. Explain why `async` and `defer` are not interchangeable for two scripts that depend on each other.

## Progressive hints

1. Separate network discovery/transfer from parsing, execution, layout, and paint.
2. Ask whether the browser can discover a resource from the HTML before it processes CSS or JavaScript.
3. A resource can be fast but still be on the dependency path; a long script can block progress even after download completes.
4. Preserve execution order for dependent scripts; `defer` preserves document order, while `async` does not.

## Complete solutions

1. The inline CSS is immediately available and is not a network wait. The below-the-fold image is not normally required for the initial viewport. Async analytics does not block HTML parsing, although its execution can still consume main-thread time at an inconvenient moment. Confirm with a trace rather than assuming.
2. CSS background discovery may wait for stylesheet download and parsing; an `<img>` is discoverable in parsed HTML and offers `alt`, intrinsic dimensions, `srcset`, and `sizes`. Backgrounds are appropriate for decorative imagery. For meaningful content, preserve an accessible text alternative and choose the representation based on content semantics, cropping, and responsive behavior.
3. Investigate JavaScript execution, long tasks, style recalculation, forced synchronous layout, and hydration or rendering work. Faster network delivery will not fix main-thread contention. Use a performance profile and reduce, defer, split, or simplify the work that actually blocks the target paint.
4. `async` executes each script as soon as it is ready, so their order can vary. `defer` executes after parsing and keeps document order. Use module/dependency loading or explicit coordination when the dependency is more complex.

## Tests and edge cases

- Confirm whether the target is First Contentful Paint, Largest Contentful Paint, or interaction readiness; optimizing one can harm another.
- Check mobile CPU and network conditions, cache-cold and cache-warm runs, and real-user distributions as well as a local run.
- Give images dimensions or an aspect ratio to limit layout shifts; compressing an image alone does not solve late discovery.
- Avoid preload hints for resources that are not truly critical, duplicate fetches, and high-priority competition.
- A CSS change can make a stylesheet noncritical only if the initial visible content remains correct without it.
- Server-rendered HTML can display content before client hydration, but hydration JavaScript can still affect responsiveness and correctness.
- A render trace differs by browser, device, cache state, and page; describe the dependency model and verify the observed path.

## Reflection questions

1. Which evidence would distinguish a late-discovered hero from a quickly downloaded hero decoded late?
2. Why can removing a render-blocking stylesheet create a faster but visibly incorrect first frame?
3. What would you explain differently if the interviewer asks about input latency instead of initial rendering?

## Sources

- [web.dev: Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path)
- [MDN: Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
