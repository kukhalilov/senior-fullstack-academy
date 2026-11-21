# End-to-end browser navigation and web request lifecycle — Problem: Trace a slow product-page navigation

## Goals

Separate browser, network, server, transfer, and rendering costs. Build an investigation plan tied to evidence and prioritize the user-visible critical path.

## Worked example

A warm navigation reuses a connection and serves static assets from cache. The product API returns in 120 ms, but LCP is 3.8 seconds. The highest-value investigation is likely around resource discovery, CSS/JavaScript blocking, image loading, and main-thread work—not another optimization to the already-fast API.

## Exercises

1. List which waterfall rows you would inspect first and why.
2. Explain why DNS/connect/TLS timing may be absent in a warm run.
3. Identify what a server trace can and cannot explain about LCP.
4. Propose one experiment for a render-blocking stylesheet and one for a long JavaScript task.
5. Define how you would compare cold and warm runs without confusing the result.

## Progressive hints

1. Inspect redirects, protocol, cache source, and the LCP element’s request.
2. Connection and DNS state can be reused; missing timing may also be restricted.
3. Server spans account for server-side work, not all browser parsing/rendering.
4. Use trace evidence to identify critical dependencies and long tasks.
5. Record device, cache state, viewport, network conditions, and repeated results.

## Complete solutions

Capture representative cold and warm traces using the browser Performance panel. Confirm the final URL and redirect chain, negotiated protocol, which assets came from browser/service-worker/CDN caches, and whether connection setup occurred. Identify the LCP element and its discovery/priority path. Correlate the API request with server spans, separating queueing, middleware, database, and downstream time. Since the API is 120 ms but LCP is 3.8 seconds, inspect CSS that delays rendering, JavaScript that blocks parsing or main-thread responsiveness, and whether the LCP image is discovered late or oversized. Change one factor at a time, such as making the critical image discoverable earlier or deferring noncritical script, then compare field and synthetic measurements. Do not infer that the server is fast from a single warm response or claim that all time is client-side without tracing the rest of the request path.

## Tests and edge cases

- Compare cold and warm cache with identical browser/device conditions.
- Include a slow network and CPU-throttled run to reveal resource and main-thread sensitivity.
- Test a logged-in personalized page separately from a public page because caching differs.
- Check mobile viewport because the LCP element may differ from desktop.
- Verify a change improves real-user experience and does not break hydration or accessibility.

## Reflection questions

1. Which result would change your priority: high server span duration or a long main-thread task?
2. What parts of a browser trace can be hidden by cross-origin timing policy?
3. Which metric best captures prominent content loading, and which describes responsiveness?

### Sources

- [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)
- [Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp)
