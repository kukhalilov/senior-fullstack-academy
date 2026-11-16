<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Core concepts and how they fit together

# Learning objectives

After this lesson, explain when `fetch()` fulfills or rejects, construct a request with browser policy in mind, consume a body without double-reading, distinguish CORS failures from HTTP responses, and coordinate cancellation without assuming it rolls back server work.

# Prerequisites

You should know JavaScript promises and `async`/`await`, basic HTTP request/response structure, URL origins, and `try`/`catch`. A response body can be understood as an asynchronous stream of bytes; detailed Streams API study is helpful but not required.

# Core concepts

## The request is policy plus data

`Request` combines URL, method, headers, body, signal, and settings such as mode, credentials, cache, redirect, referrer policy, integrity, priority, and keepalive. `RequestInit` can be supplied to `Request()` or directly to `fetch()`. When both a Request and fetch init specify the same field, the fetch-time init takes precedence. Browser-controlled headers are not freely writable, and body/method combinations are validated. A GET or HEAD request cannot carry a body in normal Fetch construction.

## A fulfilled promise is not a successful HTTP status

`fetch()` rejects for network errors and browser-level failures, including CORS denial and abort. It does not reject solely because status is 404 or 500. Treat `response.ok` as the conventional 200–299 check, then handle any endpoint-specific status semantics such as 202, 204, or 206 explicitly. `Response.error()` creates a synthetic network-error response object; it is not what a failed network `fetch()` hands to the page.

## Origin mode determines visibility

`same-origin` mode rejects cross-origin requests. `cors` mode uses CORS and exposes only permitted response metadata. `no-cors` is heavily restricted and yields an opaque response whose status is 0, headers are unavailable, and body is null; it does not make a cross-origin response readable. CORS is a server opt-in for browser script access, not authentication or a general CSRF defense. Credentialed CORS requires an explicit allowed origin and `Access-Control-Allow-Credentials: true`; wildcard origin is not valid with credentials.

## Bodies are streams with one consumption

`Request.body` and `Response.body` are streams. Convenience methods consume the stream to completion and materialize a result. Once disturbed/locked or consumed, the body cannot be read again; `bodyUsed` reflects consumption. `clone()` tees the body, so cloning must happen before consumption and may increase buffering when branches read at different speeds. Streaming lets an application process chunks with bounded memory, but requires explicit reader release/cancellation, decoding, and error handling.

Recent browser additions include byte-array readers (`Request.bytes()` and `Response.bytes()`, Baseline 2025) and `keepalive` request inspection (Baseline 2024). `textStream()` is a newer limited-availability API; feature-detect it and retain a `body.pipeThrough(new TextDecoderStream())` option where streaming text is required. See [MDN Request.bytes](https://developer.mozilla.org/en-US/docs/Web/API/Request/bytes), [MDN Response.bytes](https://developer.mozilla.org/en-US/docs/Web/API/Response/bytes), [MDN Request.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive), and [MDN Response.textStream](https://developer.mozilla.org/en-US/docs/Web/API/Response/textStream).

# Mechanisms and relationships

The browser first validates construction and policy, may perform a CORS preflight, sends/receives network data, applies redirects and integrity checks, then exposes a filtered `Response`. `response.url` is the final response URL after redirects; `redirected` indicates the response followed a redirect chain. A manual redirect can produce an `opaqueredirect` response that intentionally hides details. Caching modes control the HTTP cache interaction; they do not override server cache headers, service-worker logic, or intermediary caches.

An `AbortController` owns a signal. Passing it into `RequestInit.signal` makes fetch respond to abort; abort can also affect response-body consumption. The signal is cooperative: the server may already have received and acted on the request. Use request identity guards for stale UI updates and design server mutations to be idempotent or otherwise safe under retries/uncertain completion.

For end-of-visit reporting, `window.fetchLater()` provides a different lifecycle: it schedules a request for page termination or an optional activation delay and returns a `FetchLaterResult`, not the eventual response. Its quotas and Permissions Policy restrictions make it a specialized best-effort beacon mechanism. It is experimental and limited availability in current MDN data, so do not substitute it for a response-bearing API request. [MDN Using Deferred Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Deferred_Fetch)

Streaming upload has a separate capability boundary. A `ReadableStream` body requires `duplex: "half"` in implementations following that contract, and browser support remains uneven. “Half duplex” means the browser sends the request body before processing the response; it is not simultaneous full duplex. Do not promise progressive upload/response interleaving based on this option.

# Worked examples

```js
async function loadProfile(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
    signal
  });

  if (!response.ok) {
    throw new Error(`Profile request failed with HTTP ${response.status}`);
  }

  return response.json();
}
```

The JSON parse is body consumption and occurs once. A 404 reaches the `!ok` check; a network/CORS/abort failure rejects earlier. A 204 response has no JSON body, so the caller or helper must use an endpoint contract that permits no-content responses.

# Misconceptions and edge cases

- `fetch()` fulfillment does not mean an HTTP status is successful.
- `no-cors` does not bypass CORS to reveal a response; it intentionally hides it.
- Setting `credentials: "include"` does not force the server to accept cookies or make wildcard CORS valid.
- A request body is not available for GET/HEAD; body methods and `bodyUsed` are one-shot.
- Calling `clone()` after body consumption fails; cloning before reading may tee/buffer streams.
- Aborting does not undo server-side effects and does not guarantee every downstream operation stops.
- `keepalive` and `fetchLater()` are constrained page-lifecycle tools, not durable background-transfer systems; their semantics and quotas differ.
- `priority` is a hint, not a promise about scheduling.
- `RequestInit.window` is browser-controlled/internal and cannot be set to direct a fetch into a different window.
- `textStream()` and streaming request bodies are not equally supported everywhere; feature-detect exact methods and retain a supported fallback.
- A `Response` body can be null for responses such as 204 and opaque/error responses; do not assume every response has bytes.

# Knowledge checks with answers

1. **Does a 500 response reject fetch?** No. It fulfills with a `Response`; inspect `ok` or `status`.
2. **Can a `no-cors` page script read the cross-origin body?** No; the opaque response hides it.
3. **Can `response.json()` be followed by `response.text()`?** Not on the same consumed body. Clone before reading if two consumers truly are needed.
4. **Does abort prove the server did not execute a POST?** No. The client can stop waiting/reading, but server work may already have occurred.
5. **What does `duplex: "half"` promise?** It describes the request's duplex mode; it does not promise a full-duplex simultaneous exchange, and support must be checked.
6. **What does `fetchLater()` return?** A result indicating whether the deferred request has activated; the eventual response is ignored and never exposed.

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
