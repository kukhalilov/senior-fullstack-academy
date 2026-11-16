<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Interview questions and reasoning

# Core questions

1. What does the `fetch()` promise represent, and when does it fulfill?
2. Why does fetch fulfill for 404/500, and where should HTTP policy live?
3. How are request and response bodies consumed, cloned, and streamed?
4. What can CORS modes reveal to JavaScript?
5. What does abort cancel, and what does it not guarantee?
6. Compare `RequestInit.credentials`, `mode`, and `headers`.
7. What is a preflight and when is it sent?
8. When are streaming uploads, `duplex`, `keepalive`, or `textStream()` appropriate?

# Concise interview answers

1. `fetch()` returns a promise that normally fulfills with a filtered `Response` after response headers are available; the body is consumed separately. Network, policy/CORS, and abort failures reject.
2. HTTP error statuses are valid responses. The application checks `response.ok`/`status` and maps endpoint semantics to errors/results.
3. Bodies are streams with one consumer. Convenience methods consume to completion; clone before reading to tee. Streaming is incremental but requires explicit lifecycle/error management.
4. Same-origin/basic and successful CORS responses expose permitted metadata. `no-cors` produces an opaque response with status 0, null body, and hidden headers; it is not a bypass.
5. Abort communicates cancellation to an operation that honors the signal and can cancel body reads. It cannot roll back server-side effects already processed or guarantee downstream work stops.
6. `mode` governs cross-origin handling; `credentials` governs ambient credentials/cookie acceptance; `headers` describes request metadata subject to forbidden-header and CORS-safelisted constraints.
7. The browser sends an OPTIONS request to ask whether a non-safelisted cross-origin method/header combination is allowed, then sends the actual request only if permitted.
8. Streaming upload can reduce buffering but support and `duplex: "half"` are limited; keepalive is for small requests that may outlive page unload; `textStream()` supports incremental UTF-8 where available and needs a fallback. None is a durable background transfer facility.

# Deep follow-up answers

## Why does fetch not reject on 404?

Fetch separates transport/security success from application-level HTTP success. Receiving a 404 means an HTTP response was produced, so `fetch()` fulfills with its status, headers, and body (subject to response filtering). This allows callers to distinguish 404, 401, 409, 429, 500, and other server outcomes. A reusable API client may choose to throw when `!response.ok`, but that policy is an application wrapper, not native Fetch behavior.

## What makes body consumption one-shot?

Request and Response bodies are streams. Reading locks/disturbs a stream and consumes it. Calling `json()` and then `text()` on the same response fails. `clone()` tees the stream before consumption; each branch can be read separately, but if one branch is slower or unread, data may be buffered for it. For large data, parse once and derive diagnostics from selected fields or stream through a single pipeline.

## Explain CORS without calling it an access-control system for your server

CORS is a browser mechanism controlling whether frontend JavaScript can send certain cross-origin requests and read their responses. The same-origin policy and CORS response headers govern browser exposure. A simple/safelisted request may be sent directly; other methods/headers/content types cause a preflight. CORS is not a replacement for authentication, authorization, input validation, or CSRF defense: the server still receives requests from non-browser clients and some cross-origin requests can be sent without script being allowed to read the response.

## What is the credentialed CORS rule?

For a credentialed cross-origin response, the server must return a matching explicit `Access-Control-Allow-Origin`, not `*`, and `Access-Control-Allow-Credentials: true`. The preflight itself is sent without credentials, while the actual request can include them if Fetch was configured to do so. The server should vary caches by Origin when responses differ. Credentials include browser-managed cookies and other ambient credentials; they are not equivalent to a manually attached bearer token.

## How do request streaming and duplex mode work?

A `ReadableStream` body can avoid materializing the entire upload in memory. Where supported, `duplex: "half"` is required. Half-duplex means the browser sends the request before processing the response; it does not promise to read the response concurrently with upload. Browser support differs, intermediaries/server APIs may buffer, and the stream must handle cancellation/failure. Treat it as a progressive capability, not a universal upload guarantee.

## Why is keepalive not equivalent to a background sync queue?

`keepalive` lets a request remain eligible when its initiating page unloads, but body bytes and outstanding requests are constrained and user-agent termination/network failure remain possible. It provides no durable retry schedule or confirmation that delivery completed after the page disappears. Use a small telemetry payload, `sendBeacon()` when no response is needed, or a service-worker/background synchronization design where its lifecycle and support suit the requirement.

## What are the latest body-reader additions and their support implications?

`Request.bytes()` and `Response.bytes()` return a `Uint8Array` after consuming the body and are Baseline 2025 per MDN. `textStream()` on Request/Response supplies incremental UTF-8 text but remains limited availability/experimental in MDN docs checked 2026-11-16. A `ReadableStream` with `TextDecoderStream` is the composable fallback when supported. Feature-detect the method and test the actual browser matrix. [MDN Response.bytes](https://developer.mozilla.org/en-US/docs/Web/API/Response/bytes), [MDN Response.textStream](https://developer.mozilla.org/en-US/docs/Web/API/Response/textStream).

# Scenario questions

1. Your API returns 401 JSON. How do you preserve its error body while producing a useful client error without trying to read the body twice?
2. A request works in Postman but fails in the browser. What CORS/preflight facts do you inspect first?
3. A 202 response has no final resource representation yet. Why should you not blindly call `response.json()`?
4. A response is 200 but `response.json()` rejects. List plausible causes distinct from fetch/network rejection.
5. A user clicks Cancel after the server has received a payment request. What can the client truthfully report, and what server protocol is needed to know final outcome?
6. A page wants a cross-origin asset but does not need to read it. When might no-cors be useful, and why is it still not readable by script?
7. A large streaming upload must work on browsers without Fetch upload streams. What fallback/product design do you propose?

# Tradeoffs and alternatives

| Requirement | Fetch design | Alternative/boundary |
| --- | --- | --- |
| Standard JSON API request | `fetch`, check status, parse once | Application wrapper can map HTTP errors |
| Upload progress events for broad legacy targets | Fetch lacks the traditional XHR upload progress event model | XHR may fit this specific need |
| Incremental response parsing | Read `Response.body` or supported `textStream()` | Convenience `.text()`/`.json()` buffers complete body |
| Small telemetry during unload | `sendBeacon()` or constrained `keepalive` Fetch | Neither gives a durable job/guaranteed delivery |
| Cancel obsolete UI request | `AbortController` plus identity guard | Abort cannot undo server-side mutation |
| Cross-origin data read | CORS-enabled request/server response | `no-cors` returns opaque data, not a readable workaround |

# Common weak answers

- “Fetch throws when the server returns an error.” It rejects on network/policy/abort failures; HTTP 4xx/5xx normally fulfill.
- “CORS is fixed by setting `no-cors`.” That hides the response and restricts the request.
- “Abort means the server did nothing.” It only signals client cancellation; the server may have committed work.
- “Every body parser can be called after another.” The stream is one-shot; clone before consuming if justified.
- “The response body is ready when headers arrive.” Body consumption can still be pending, fail, or be canceled.
- “CORS authenticates requests.” It controls browser script access, not server authentication/authorization.
- “`keepalive` guarantees a request completes after tab close.” It is constrained and not durable.
- “`duplex: "half"` means full duplex.” It specifically does not promise simultaneous bidirectional processing.
- “CORS response headers are all visible.” Only exposed/safelisted headers are visible; cookies remain hidden.
- “`Response.ok` means my endpoint operation is semantically complete.” It only means 2xx; 202/204 and domain-specific statuses need explicit handling.

# Self-check rubric

Give yourself 0 (incorrect), 1 (mostly right but misses a condition), or 2 (precise with a consequence) in each area:

- Separate fetch promise rejection, HTTP status, and body parse/stream failure.
- Explain CORS modes, safelisted requests, preflight, credentials, and opaque responses.
- Treat body streams as one-shot and explain clone buffering.
- Describe abort as cooperative client cancellation, not server rollback.
- Choose cache, redirect, referrer, integrity, priority, keepalive, and duplex options only for a defined use case.
- Name the support caveat and fallback for recent/limited APIs such as streaming upload and textStream.
- State an upload or telemetry strategy whose delivery and progress guarantees match product needs.

A strong answer distinguishes browser behavior from application policy and identifies what the server must configure. If any dimension is 0, redo the corresponding reference exercise before continuing.

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN HTTP CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)
