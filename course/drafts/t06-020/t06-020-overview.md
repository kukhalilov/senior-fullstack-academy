<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Big-picture orientation and mental model

# Problem and purpose

Fetch is the browser API for constructing HTTP requests, sending them asynchronously, and consuming responses. It is also the common request/response primitive used by workers and other web platform features. Understanding Fetch means understanding both the JavaScript promises and the browser’s network/security rules: CORS, credentials, cache, redirects, request/response streams, and cancellation.

# Plain-language mental model

Think of a request as a one-use package with a URL, method, headers, optional body, and policy settings. `fetch()` hands that package to the browser and returns a promise. That promise usually fulfills when response headers are available, not after the whole body has been consumed. The body is a stream: choose one consumer (`json()`, `text()`, `bytes()`, `blob()`, `formData()`, or a stream reader) and process it once. A second read needs a clone made before either copy is consumed, and cloning a stream can buffer data if one branch falls behind.

The browser may reject a request before an HTTP response is exposed—for example because of a network failure, abort, mixed-content/security policy, or CORS failure. But an HTTP 404 or 500 is still an HTTP response, so the promise fulfills; application code must inspect `response.ok` or `status`.

# How the parts fit together

1. Build a URL and optional `Request` with `RequestInit`.
2. Browser policy resolves origin, mode, credentials, referrer, cache, redirect, integrity, and related settings.
3. `fetch()` starts the operation and returns a promise for a `Response`.
4. The browser resolves/rejects that promise according to Fetch’s network and security rules.
5. Check status/type/headers, then consume the body exactly once or stream it incrementally.
6. Use an `AbortSignal` to communicate cancellation and handle partial work, stale UI responses, or stream failure.

This separation prevents a common bug: treating “the fetch promise fulfilled” as “the server reported success and the complete body is ready.”

# Concept map

| Layer | Main objects | Main question |
| --- | --- | --- |
| Request description | `Request`, `RequestInit`, `Headers` | What is being requested, and under which browser policies? |
| Network orchestration | `fetch()` and `Promise` | Did the browser expose a response or reject the operation? |
| Response metadata | `Response.status`, `ok`, `type`, `headers` | Was there an HTTP response, and what can script inspect? |
| Body | one-shot methods or `ReadableStream` | How should bytes be decoded/processed, and how much memory is needed? |
| Lifetime | `AbortController`, `AbortSignal` | Can obsolete work be stopped and cleanup coordinated? |
| Origin security | CORS, credentials, forbidden headers | Is the browser allowed to send/expose this cross-origin operation? |

# End-to-end walkthrough

A search page starts one request per submitted query. Before a new request it aborts the previous controller; the new signal is passed to `fetch()`. If the browser exposes a response, the handler checks `ok` before parsing JSON. It catches abort separately from a real network failure and verifies that this request still represents the latest query before updating the UI. If the body is very large, it can read `response.body` incrementally, but then it owns reader cancellation, decoding, and stream cleanup. A cross-origin API must return CORS headers permitting the page’s origin; adding an `Authorization` header may trigger an OPTIONS preflight first.

# When to use it and tradeoffs

Use Fetch for promise-based requests, interoperable `Request`/`Response` objects, body streaming, and shared browser request policy. Use XHR when a legacy API or upload-progress event model is specifically required; use `navigator.sendBeacon()` for small, fire-and-forget telemetry when no response is needed. `fetchLater()` can defer a small request to the end of a page visit or a timeout on supporting browsers, but it is experimental, quota-limited, and never provides the eventual response. [MDN Window.fetchLater](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetchLater) Fetch does not provide automatic retries, application-level timeout policy beyond signals, HTTP-status exceptions, or permission to bypass browser origin rules. Streaming reduces buffering but increases lifecycle and parsing complexity; convenience body methods are simpler for bounded responses.

# What later lessons cover

The concept lesson separates promise, HTTP, origin, and stream semantics. Reference lessons explain every `Request`, `Response`, and `Headers` item; cancellation composition; `RequestInit`, CORS, cache, redirects, credentials, keepalive, and streaming-upload behavior; and deferred Fetch quotas/activation. Practice implements robust requests and stream handling. Interview questions cover status/error boundaries, CORS, one-shot bodies, and cancellation races.

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
