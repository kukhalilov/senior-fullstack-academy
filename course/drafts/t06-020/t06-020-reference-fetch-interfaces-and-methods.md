<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Reference: Fetch API interfaces, constructors, and methods

# Scope and version

This reference explains the supplied Request, Response, Headers, and global fetch items against the WHATWG Fetch Standard checked 2026-11-16. Some newer readers and properties have limited browser support; check the exact member rather than inferring support from the base interface. The living standard is authoritative for algorithms; MDN compatibility data helps evaluate deployments. See [WHATWG Fetch](https://fetch.spec.whatwg.org/), [MDN Request](https://developer.mozilla.org/en-US/docs/Web/API/Request), [MDN Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), [MDN Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers), and [MDN textStream](https://developer.mozilla.org/en-US/docs/Web/API/Response/textStream).

# How this group fits the mental model

`Request` is a normalized, immutable-in-most-respects description plus a one-shot body stream. `fetch()` performs the browser-controlled operation and returns a promise for a filtered `Response`. Response metadata and body have separate lifetimes: status is available before the body is fully read, and each body consumer drains the stream. `Headers` applies normalization and guards that prevent script from setting certain browser-controlled or unsafe fields.

# Supplied names explained

## Sending and constructing requests

- `fetch` — Global operation accepting a URL/string or `Request`, plus optional init overrides; fulfills with a `Response` for HTTP statuses and rejects on network/policy/abort failures.
- `Request` — Interface describing a request. It is available in windows and workers; it does not itself send network traffic.
- `Request.prototype.constructor` — The `Request` constructor function used to create normalized request objects with `new Request(input, init)`.
- `Request.prototype.clone` — Creates a request copy before its body is consumed. Stream bodies are teed; unequal reader speeds can cause buffering.
- `Request.prototype.cache` — Resolved cache mode (`default`, `no-store`, `reload`, `no-cache`, `force-cache`, or `only-if-cached`); some combinations constrain mode/redirect.
- `Request.prototype.credentials` — Credential mode (`omit`, `same-origin`, `include`) governing ambient credentials and whether `Set-Cookie` is respected; it does not expose cookies to script.
- `Request.prototype.destination` — Browser-computed resource destination, usually empty for fetches initiated by script; not a caller-controlled routing/security field.
- `Request.prototype.duplex` — Duplex mode for streaming request bodies. In implementations that support request streams it is commonly `"half"`; reading this property is not uniformly supported. See [MDN Request.duplex](https://developer.mozilla.org/en-US/docs/Web/API/Request/duplex).
- `Request.prototype.integrity` — Subresource Integrity metadata used to verify fetched bytes; a mismatch rejects with a network error.
- `Request.prototype.isHistoryNavigation` — Boolean indicating a request associated with a history navigation; browser-controlled metadata, not ordinary app state.
- `Request.prototype.isReloadNavigation` — Boolean indicating a reload navigation request; browser-controlled and generally false for script-created requests.
- `Request.prototype.keepalive` — Whether this request may outlive the initiating page's unload, subject to strict total/body-size limits and browser policy. It is intended for small completion/telemetry requests, not background uploads. [MDN documents Baseline 2024 support.](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive)
- `Request.prototype.mode` — Cross-origin mode (`cors`, `same-origin`, `no-cors`, or browser-controlled `navigate`); `no-cors` produces an opaque response and restricts method/headers.
- `Request.prototype.referrer` — Serialized referrer that will be sent after policy processing; browser may reduce or omit it.
- `Request.prototype.referrerPolicy` — Policy governing referrer disclosure, subject to browser defaults and security rules.
- `Request.prototype.redirect` — Redirect handling mode: follow, error, or manual. Manual cross-origin redirects are deliberately opaque in window contexts.
- `Request.prototype.targetAddressSpace` — Target address-space classification where exposed (`local`, `loopback`, or `public`); support and Local Network Access policy are evolving. Do not treat a caller value as authorization.
- `Request.prototype.arrayBuffer` — Consumes the request body and resolves to an `ArrayBuffer`; fails if null/used/locked or decoding/streaming fails.
- `Request.prototype.blob` — Consumes the body into a `Blob`, using the request's available media type metadata where applicable.
- `Request.prototype.bytes` — Consumes the body into a `Uint8Array`; a newer convenience reader with broader support since 2025, but still check older targets. [MDN Request.bytes](https://developer.mozilla.org/en-US/docs/Web/API/Request/bytes).
- `Request.prototype.formData` — Consumes and parses the body as `FormData`; the content type and encoding must be supported and the body can be consumed only once.
- `Request.prototype.json` — Consumes and parses JSON body text; parsing errors reject, and it returns the parsed value rather than a special JSON type.
- `Request.prototype.text` — Consumes the whole body and decodes as UTF-8 text.
- `Request.prototype.textStream` — Limited-availability streaming UTF-8 text reader; returns chunks as they decode, and rejects/throws when the body is locked or disturbed. Feature-detect this exact method. [MDN Request.textStream](https://developer.mozilla.org/en-US/docs/Web/API/Request/textStream).
- `Request.prototype.body` — ReadableStream of request bytes, or null when no body exists. Reading it locks/disturbs the body like any other stream consumer.
- `Request.prototype.bodyUsed` — True when the body has been disturbed/consumed; it does not mean a server received it.
- `Request.prototype.headers` — Request `Headers` object subject to request guard and forbidden-header rules.
- `Request.prototype.method` — Normalized HTTP method string. Methods such as GET/HEAD cannot have a body under Fetch request construction rules.
- `Request.prototype.signal` — Signal associated with the request; aborted requests reject and body consumption can also abort.
- `Request.prototype.url` — Serialized request URL after normalization; it may differ from the original relative string.

## Receiving and creating responses

- `Response` — Filtered response interface returned by Fetch or constructed by script; its type controls visible headers/body.
- `Response.error` — Static factory for an error response with network-error semantics and status 0. A failed `fetch()` rejects instead of fulfilling with this object.
- `Response.json` — Static factory serializing data into a response with JSON content type and optional status/statusText/headers. Serialization can throw for values such as circular objects or `undefined`.
- `Response.redirect` — Static factory for a redirect response; accepts a URL and a permitted redirect status (301, 302, 303, 307, or 308), otherwise throws.
- `Response.prototype.constructor` — The `Response` constructor function used to create a response from a body and `ResponseInit`.
- `Response.prototype.clone` — Copies response metadata and tees the body before consumption; as with Request cloning, a slow branch can increase buffering.
- `Response.prototype.arrayBuffer` — Consumes the response body to completion into an `ArrayBuffer`.
- `Response.prototype.blob` — Consumes the response body into a `Blob`.
- `Response.prototype.bytes` — Consumes the response body to a `Uint8Array`; Baseline 2025 per MDN. [MDN Response.bytes](https://developer.mozilla.org/en-US/docs/Web/API/Response/bytes).
- `Response.prototype.formData` — Consumes/parses a supported form-encoded or multipart body as FormData; a mismatch or malformed body rejects.
- `Response.prototype.json` — Consumes and parses the body as JSON. It does not check HTTP status for you.
- `Response.prototype.text` — Consumes and decodes the whole body as UTF-8 text.
- `Response.prototype.textStream` — Limited-availability streaming UTF-8 reader for a response; useful for incremental text parsing, but check support. A `TextDecoderStream` over `body` is an alternative. [MDN Response.textStream](https://developer.mozilla.org/en-US/docs/Web/API/Response/textStream).
- `Response.prototype.body` — ReadableStream of response bytes, or null for a null-body/filtered response such as opaque responses.
- `Response.prototype.bodyUsed` — Indicates the response body has been consumed/disturbed.
- `Response.prototype.headers` — Headers visible under response type filtering. CORS responses expose only safelisted/exposed headers; `Set-Cookie` is never readable from browser script.
- `Response.prototype.ok` — True only for status 200–299 inclusive; endpoint semantics may treat some 2xx values, such as 202 or 204, differently.
- `Response.prototype.redirected` — True when the response URL list indicates a redirect occurred; it is not a signal that the redirect was safe or expected.
- `Response.prototype.status` — HTTP status code; opaque/error responses expose 0. Fetch does not reject merely for non-2xx HTTP status.
- `Response.prototype.statusText` — Status message, often empty in HTTP/2/HTTP/3 contexts; do not branch on phrases such as “OK”.
- `Response.prototype.type` — Response exposure kind: `basic`, `cors`, `opaque`, `opaqueredirect`, or `error`; it determines which metadata/body script can inspect.
- `Response.prototype.url` — Final response URL after redirects, or an empty string for response types that hide it.

## Header collections

- `Headers` — Normalized header-name/value collection with a guard depending on request/response context.
- `Headers.prototype.constructor` — Creates a Headers collection from iterable/record/another Headers; names are case-insensitive and values are normalized.
- `Headers.prototype.append` — Adds a value where the header semantics permit; some repeated fields combine, while `Set-Cookie` has special handling.
- `Headers.prototype.delete` — Removes a named header if the guard permits it.
- `Headers.prototype.get` — Returns a normalized value or null. Multiple values may be combined for ordinary headers; use `getSetCookie()` for separate cookie field values in environments where allowed.
- `Headers.prototype.getSetCookie` — Returns an array of `Set-Cookie` values, avoiding invalid comma splitting. Browser response filtering still prevents page JavaScript from reading `Set-Cookie`; this is useful in contexts where the header is exposed, such as server runtimes.
- `Headers.prototype.has` — Tests whether a permitted header name exists.
- `Headers.prototype.set` — Replaces values for a permitted name; invalid names/values throw and guarded headers may be ignored or rejected.
- `Headers.prototype.entries` — Returns an iterator of normalized name/value pairs.
- `Headers.prototype.forEach` — Calls a callback for each visible pair.
- `Headers.prototype.keys` — Returns an iterator of visible header names.
- `Headers.prototype.values` — Returns an iterator of visible header values.
- `Headers.prototype[Symbol.iterator]` — Iterates name/value pairs, equivalent to the collection's entries iteration.

# Body lifetime, decoding, and response filtering

Choose exactly one body-consumption approach. Convenience methods wait until completion and buffer the decoded/materialized result. For large bodies, read `body` incrementally, decode bytes with `TextDecoderStream` where needed, and cancel/release the reader when stopping early. `clone()` is not free: Fetch tees streams and may buffer data for a slower/unread branch.

A `basic` response is same-origin filtered; a `cors` response exposes only safelisted plus explicitly exposed headers; `opaque` and `opaqueredirect` have status 0, null body, and hidden headers. `error` is a synthetic response object, not a fulfilled network failure. These distinctions explain why a successful `fetch()` promise can still give an unreadable opaque response and why a body method can fail after headers were received.

# Examples

```js
async function readJson(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json(); // one consumption
}

async function readUtf8Incrementally(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const textStream = typeof response.textStream === "function"
    ? response.textStream()
    : response.body.pipeThrough(new TextDecoderStream());
  for await (const chunk of textStream) consumeTextChunk(chunk);
}
```

The fallback assumes a non-null readable body and a supported `TextDecoderStream`; a complete implementation handles null bodies, aborts, and parser state spanning chunk boundaries.

# Common mistakes

- Calling `response.json()` without checking the endpoint status or no-content contract.
- Assuming `fetch()` rejects on 404/500.
- Calling multiple body readers on the same Request/Response.
- Cloning large bodies and leaving one branch unread, allowing buffering.
- Expecting `no-cors` to make an opaque body available.
- Splitting a combined header on commas when values such as `Set-Cookie` contain commas.
- Assuming `Headers.getSetCookie()` exposes cookies to page JavaScript.
- Assuming `Request.prototype.duplex` or `textStream()` has universal support because the name appears in the standard/docs.
- Treating `Response.redirected` as a security validation; validate the destination/redirect policy independently.

# Cross-item comparison

| Need | Method/property | Tradeoff |
| --- | --- | --- |
| Parse bounded JSON | `Response.json()` | Convenient, buffers full body, parse may reject |
| Read bytes | `Response.bytes()` / `arrayBuffer()` | Materializes the full body |
| Process text incrementally | `textStream()` or `body` + decoder | Lower buffering; more stream/error state |
| Inspect HTTP success | `Response.ok` / `status` | Must be checked explicitly |
| Copy request/response | `clone()` | Tees stream and can buffer; clone before consumption |
| Read separate cookie fields | `Headers.getSetCookie()` | Not exposed to browser page scripts for network responses |
| Observe no-cors result | `Response.type` | Opaque metadata/body remains hidden |

# Knowledge checks with answers

1. **What does `fetch()` do for a 404?** It normally fulfills with a Response whose status is 404 and `ok` is false.
2. **Why can `Response.clone()` increase memory use?** Its tee can buffer data while one branch reads more slowly or is not read.
3. **Can page code read a cross-origin Set-Cookie through `getSetCookie()`?** No; browser forbidden response-header filtering still applies.
4. **What is `textStream()` for?** Incremental UTF-8 text chunks; it is limited-availability and should be feature-detected.
5. **What does status 0 mean?** It can indicate a filtered opaque/opaqueredirect response or synthetic error response; it is not a normal HTTP status exposed to script.

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- [MDN Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [MDN Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
- [MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
