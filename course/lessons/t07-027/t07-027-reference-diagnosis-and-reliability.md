# End-to-end browser navigation and web request lifecycle — Reference: Trace and debug the complete request path

## Scope and version

Use multiple signals to diagnose user-visible behavior. Browser timing APIs expose only defined information, and cross-origin restrictions can limit detail.

## How this group fits the mental model

A symptom such as “slow page” can originate in browser policy, network setup, an intermediary, server work, response transfer, or rendering. A good diagnosis narrows the boundary with a repeatable measurement before changing architecture.

## Supplied names explained

- `Browser Performance panel waterfall` — A timeline of navigation and resource requests, with redirects, cache information, protocol, timing, and dependencies. Compare runs and inspect the critical resource rather than summing unrelated rows blindly.
- `Resource Timing API` — Browser timing entries for resource requests. Cross-origin timing details may be restricted unless the response permits them; browser cache and connection reuse affect available values.
- `DNS timing versus connection timing` — DNS measures name resolution; connection timing reflects connection setup phases according to the timing API. A zero or absent duration can mean reuse or unavailable detail, not necessarily no network work.
- `Server distributed trace span` — A timed operation within a server trace, such as middleware, database query, or downstream call. Correlate spans with the browser request where possible.
- `Correlation and trace context` — Identifiers and context propagated across services so related work can be joined. Validate trust and avoid exposing sensitive data in trace baggage.
- `HTTP status versus browser console error` — A status is an HTTP response; a console error may describe policy, transport, script, or response-exposure failure. Inspect network and server evidence to identify which occurred.
- `Timeout at each network boundary` — Browser, proxy, load balancer, server, database, and downstream client can each have timeouts. Set budgets deliberately and avoid retry storms when layers disagree.
- `Retry safety and idempotency` — Retries can duplicate effects if the request may already have committed. Use idempotent semantics or stable operation keys for side effects and bound retry behavior.
- `Payload size and compression` — Transfer bytes and compression affect network time and CPU. Measure compressed and uncompressed sizes and avoid compressing already-compressed formats without benefit.
- `Main-thread long task` — A long task delays event processing and rendering on the main thread. Profile script execution and split or move suitable computation when evidence supports it.
- `Cold cache versus warm cache` — Cold runs have less reusable state; warm runs may benefit from caches, DNS, and connections. Report which state a benchmark represents.
- `Synthetic versus real-user measurement` — Synthetic tests use controlled environments; real-user measurements reflect actual devices, networks, and page contexts. Use both to understand reproducibility and user impact.

## Cross-item comparison

The browser waterfall shows client-visible sequence; server traces explain work after arrival. Cold/warm comparisons reveal reuse. Synthetic tests help isolate changes; field measurements reveal actual user distributions. Use status and console messages as clues, not interchangeable evidence.

## Examples

For a slow navigation, collect a cold and warm Performance trace, record the protocol/cache source, inspect DNS/connect/TLS only when present, then correlate the request with a server trace. If server time is low but LCP is high, inspect render-blocking resources and long tasks. If OPTIONS fails, inspect preflight separately from the actual method.

## Common mistakes

- Adding timing percentages across overlapping or nested spans.
- Treating missing timing detail as zero work.
- Retrying a side effect after timeout without idempotency.
- Optimizing a synthetic lab score while real-user data worsens.
- Logging raw tokens, session IDs, or personal data in trace attributes.

## Knowledge checks with answers

1. What should a zero connection duration suggest? Possibly reuse or missing timing detail; verify context before concluding.
2. What does a browser waterfall plus server trace provide? Client-visible sequence and application-side duration boundaries.
3. Why test both cold and warm cache? They represent different user and deployment states.

### Sources

- [Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp)
- [web.dev: INP](https://web.dev/articles/inp)
- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
