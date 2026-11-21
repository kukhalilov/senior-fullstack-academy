
# Browser Fetch API, request cancellation, and response bodies — Reference: Request options and browser fetch behavior

# Scope and version

This lesson covers core `RequestInit` dictionary members from the WHATWG Fetch Living Standard and separately labels browser-specific extensions documented by MDN as checked 2026-11-16. The core dictionary includes method, headers, body, referrer, mode, credentials, cache, redirect, integrity, keepalive, signal, duplex, priority, and window. `attributionReporting`, `browsingTopics`, `privateToken`, and `targetAddressSpace` are not members of the current Fetch Standard dictionary; they are experimental or privacy/network extensions with limited or policy-dependent browser availability. Do not infer cross-browser support. See [WHATWG Fetch](https://fetch.spec.whatwg.org/), [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit), and [MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

# How this group fits the mental model

`RequestInit` expresses application intent, but the user agent applies origin, credentials, forbidden-header, redirect, cache, mixed-content, privacy, and network rules. A CORS preflight can be required before the actual request. The final response may be filtered, and a successful `fetch()` promise does not mean the response is readable or a successful HTTP status. These settings are not mechanisms to bypass server authorization or browser security.

# Supplied names explained

## Request and response initialization

- `RequestInit` — Dictionary accepted by `Request()` and `fetch()` to configure method, headers, body, policies, signal, and optional capabilities. At fetch time, explicit init values override corresponding Request fields.
- `RequestInit.method` — HTTP method, default GET. Fetch normalizes the method; forbidden methods and invalid tokens are rejected, and GET/HEAD cannot carry bodies.
- `RequestInit.headers` — Header collection/record/sequence. Browser-controlled forbidden headers cannot generally be set by page code; `no-cors` further limits names and values.
- `RequestInit.body` — Optional body bytes from string, Blob/File, buffer/view, FormData, URLSearchParams, or ReadableStream (where supported). GET/HEAD bodies are not allowed. Do not set multipart `Content-Type` manually when passing FormData because the browser must supply its boundary.
- `RequestInit.mode` — `cors` (default), `same-origin`, or `no-cors` for script-created requests. Although the enum also contains `navigate`, setting that value through `RequestInit` throws `TypeError`; navigation mode is browser-controlled. `same-origin` rejects cross-origin URLs; `no-cors` restricts method/headers and returns opaque data.
- `RequestInit.credentials` — `omit`, `same-origin` (default), or `include`; controls ambient credentials and whether response cookies are respected. Browser cookie/privacy rules can still limit credentials. Cross-origin credentialed responses require server CORS agreement and explicit origin, not `*`.
- `RequestInit.cache` — `default` follows HTTP cache freshness/validation; `no-store` bypasses cache lookup and storage; `reload` bypasses lookup but updates cache; `no-cache` revalidates a match before reuse; `force-cache` may reuse a stale match; `only-if-cached` uses a match or fails without network access. `only-if-cached` is constrained to `same-origin` mode. These modes control Fetch's HTTP-cache interaction, not every intermediary/service-worker/application cache.
- `RequestInit.redirect` — `follow` (default), `error`, or `manual`. Manual redirects do not expose cross-origin Location/status details to ordinary page JavaScript; a redirected manual request can yield an opaque redirect response.
- `RequestInit.referrer` — Referrer source/override, commonly `about:client`, an allowed URL, or empty to omit it; browser policy can reduce/strip it.
- `RequestInit.referrerPolicy` — Controls how much referrer information is sent. Values are `no-referrer`, `no-referrer-when-downgrade` (legacy), `same-origin`, `origin`, `strict-origin`, `origin-when-cross-origin`, `strict-origin-when-cross-origin`, `unsafe-url`, or the empty policy value; document policy and browser rules still apply. The modern default policy is `strict-origin-when-cross-origin` when no more specific policy overrides it.
- `RequestInit.integrity` — Subresource-integrity metadata. The browser verifies response bytes against the supplied supported digest and rejects a mismatch.
- `RequestInit.keepalive` — Allows a request to remain eligible while the initiating page unloads, subject to a 64 KiB combined in-flight keepalive-body budget per fetch group and other UA constraints. It is intended for small end-of-lifecycle requests; use `sendBeacon()` where response access is unnecessary.
- `RequestInit.signal` — AbortSignal used to cancel fetch and, where applicable, body consumption. Aborting does not prove server work was rolled back.
- `RequestInit.priority` — `high`, `low`, or `auto` scheduling hint; user-agent scheduling can differ and this is not an ordering or completion guarantee.
- `RequestInit.priority values (high, low, auto)` — `high` requests higher relative priority, `low` requests lower relative priority, and `auto` leaves selection to the user agent. It remains a hint rather than a guarantee that one request finishes first.
- `RequestInit.duplex` — Streaming-upload mode. When a ReadableStream is used as body, supporting implementations require `"half"`; this means sending the request before processing the response, not full-duplex exchange. Support is limited, so feature-detect and keep an alternative upload strategy.
- `RequestInit.window` — Browser-controlled association with a window; the only permitted script value is null, primarily for service-worker contexts that need to disassociate a request. It cannot route a fetch into an arbitrary window.
- `RequestInit.attributionReporting` — Chromium/browser-specific extension object indicating eligibility for Attribution Reporting source/trigger registration from a response. This privacy-sensitive feature is not in the current Fetch Standard dictionary and is not a general analytics shortcut; availability, policy, secure-context, and permission requirements must be checked.
- `RequestInit.attributionReporting.eventSourceEligible` — Boolean extension flag marking the request response as eligible to register an Attribution Reporting event source when set true.
- `RequestInit.attributionReporting.triggerEligible` — Boolean extension flag marking the request response as eligible to register an Attribution Reporting trigger when set true.
- `RequestInit.browsingTopics` — Browser-specific optional boolean asking that eligible Topics API data be included with the request under its privacy rules. It is not in the current Fetch Standard dictionary, is policy-controlled, and is not universally available.
- `RequestInit.privateToken` — Browser-specific extension for Private State Token operations, not in the current Fetch Standard dictionary. It has protocol and Permissions Policy constraints; it is not an ordinary token header. Feature-detect and follow the API-specific server protocol.
- `RequestInit.privateToken.operation values` — The documented operations are `token-request`, `token-redemption`, and `send-redemption-record`. The operation selects a protocol workflow and has required fields; this option is not a generic authentication token mechanism.
- `RequestInit.privateToken.issuers` — Array of issuer URLs used for `send-redemption-record`; the API documentation requires it for that operation and otherwise ignores it.
- `RequestInit.privateToken.refreshPolicy` — Redemption behavior when a non-expired record already exists: `none` reuses the record and is the default; `refresh` requests a new record. It applies only to `token-redemption`.
- `RequestInit.privateToken.version` — The documented protocol version field is currently required for this extension and currently supports value `1`; treat this as API-specific and recheck current documentation before use.
- `RequestInit.targetAddressSpace` — Experimental browser extension for the intended address-space category `local`, `loopback`, or `public`; it is not in the current WHATWG Fetch Standard's `RequestInit` dictionary. Local Network Access checks remain browser-enforced; this option does not grant permission or establish trust.
- `RequestInit.targetAddressSpace values (local, loopback, public)` — `local` targets a local network address, `loopback` targets the current device, and `public` targets a public address. These are experimental extension values; they do not bypass browser security or grant local-network permission.
- `ResponseInit` — Dictionary configuring a script-created Response's status, status text, and headers.
- `ResponseInit.status` — Numeric status, default 200; a constructed Response status must be in the inclusive 200–599 range. `Response.error()` is the separate way to create the synthetic status-0 error response.
- `ResponseInit.statusText` — Status phrase string, default empty. HTTP/2 and HTTP/3 do not use reason phrases as a reliable application contract.
- `ResponseInit.headers` — Headers for the constructed response; guard/validation rules still apply.

## Cross-origin rules and CORS

- `CORS mode` — Browser's cross-origin sharing protocol. A server response must explicitly permit the requesting origin and, when relevant, requested method/headers/credentials before script receives a readable CORS response.
- `same-origin mode` — Rejects a request whose origin differs from the request's origin; useful when cross-origin access is not intended.
- `no-cors mode` — Restrictive mode for requests whose result need not be read by page script. It permits only a narrow method/header set and returns an opaque response; it is not a CORS bypass.
- `CORS-safelisted request methods and headers` — Methods HEAD/GET/POST and a constrained set of headers/values can avoid preflight. Content-Type is limited to form-like media types and Range has specific restrictions; adding Authorization, custom headers, or a non-safelisted method usually triggers preflight.
- `CORS preflight request headers` — The browser sends OPTIONS with `Origin`, `Access-Control-Request-Method`, and when needed `Access-Control-Request-Headers` to ask permission before the actual operation. Application code does not manually synthesize this browser exchange.
- `CORS preflight cache` — Successful permission may be cached according to `Access-Control-Max-Age`, subject to browser-imposed caps; it is separate from the normal HTTP response cache.
- `CORS response header exposure` — Only CORS-safelisted response headers and names listed by `Access-Control-Expose-Headers` are visible to script; `Set-Cookie` remains forbidden to frontend script.
- `credentialed CORS requirements` — A credentialed cross-origin response must use an explicit matching `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, and appropriate cache variation such as `Vary: Origin`; wildcard origin is incompatible with credentials.
- `preflight does not send credentials` — A CORS preflight request is sent without credentials. The actual request may include credentials if the page requested it and the server's response authorizes them.
- `redirect mode manual opaque redirect` — With `redirect: "manual"`, a redirect can produce `opaqueredirect`; script does not receive ordinary readable redirect status/headers. This behavior protects cross-origin redirect details.

## Cache, persistence, streams, and response outcomes

- `HTTP cache modes` — The six modes differ in lookup, revalidation, and storage: `default` applies freshness rules; `no-store` skips lookup/storage; `reload` skips lookup but stores the response; `no-cache` revalidates a cache match; `force-cache` can reuse stale matches; and `only-if-cached` never goes to network and requires `same-origin` mode. They do not replace cache headers or control Cache Storage and all intermediaries.
- `keepalive body size limit` — The Fetch model limits the new body plus currently in-flight keepalive request bodies in a fetch group to 64 KiB; a request can fail when that aggregate is exceeded. Keep payloads small and do not treat this as a background job facility. [WHATWG Fetch](https://fetch.spec.whatwg.org/)
- `streaming request upload and duplex half` — A ReadableStream request body can send chunks without pre-buffering all bytes, but support is limited and `duplex: "half"` is required where the streaming-body design is implemented. Handle stream errors and abort; do not assume response processing overlaps request sending.
- `opaque response` — Filtered response (commonly from `no-cors`) exposes status 0, null body, and no readable headers. It is not evidence of successful network delivery.
- `HTTP error status handling` — Fetch normally fulfills for HTTP error statuses (including 4xx/5xx); check `ok`/`status` and apply endpoint semantics. It rejects for network/policy/abort failures.
- `ReadableStream response body` — `Response.body` is a byte stream. Reading incrementally can reduce memory use; it requires chunk decoding, cancellation, error handling, and awareness that parsing tokens/records may cross chunk boundaries.
- `single-use request and response bodies` — A body becomes disturbed/locked as it is consumed; a second body reader rejects. Clone before consumption only if two consumers are truly needed, noting that teeing can buffer.
- `fetch response body cancellation and reader locking` — A reader locks its stream; release the lock when done and cancel when abandoning early. Aborting the request can cancel the stream, while a manual reader must handle done/error/abort and release resources.

# Examples

```js
async function requestJson(url, signal) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: "example" }),
    credentials: "same-origin",
    cache: "no-store",
    signal
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

For cross-origin use, the API must also permit the origin/method/headers in CORS. The client cannot fix a missing server policy by switching to `no-cors`.

# CORS decision and preflight example

A JSON POST with `Content-Type: application/json` and an `Authorization` header is not CORS-safelisted, so the browser usually sends OPTIONS first. The server must allow the origin, POST method, and requested headers in the preflight response; if credentials are included, the actual response must also satisfy credentialed-CORS rules. A CORS rejection is deliberately surfaced to JavaScript as a generic fetch rejection rather than exposing the underlying response details.

# Common mistakes

- Using `mode: "no-cors"` and expecting JSON/body/status access.
- Setting `credentials: "include"` with `Access-Control-Allow-Origin: *`.
- Assuming CORS is server authentication or a protection against every CSRF attack.
- Manually sending OPTIONS instead of letting Fetch perform preflight.
- Setting multipart `Content-Type` by hand for FormData and breaking its boundary.
- Treating `cache: "no-store"` as a guarantee about every proxy/service-worker cache.
- Depending on priority as a hard schedule guarantee.
- Treating keepalive as a reliable background upload queue.
- Assuming `duplex: "half"` means simultaneous two-way streaming.
- Treating `targetAddressSpace` as a permission to reach a local device.
- Ignoring the specialized privacy permissions/policies for Attribution Reporting, Topics, or Private State Token options.
- Checking only status without accounting for opaque response status 0 or no-content bodies.

# Cross-item comparison

| Option/design | Use | Important limit |
| --- | --- | --- |
| `mode: "cors"` | Read authorized cross-origin responses | Server must opt in; preflight can apply |
| `mode: "same-origin"` | Make cross-origin access fail closed | Does not configure server routing |
| `mode: "no-cors"` | Restricted request where opaque result suffices | Response cannot be read |
| `credentials: "include"` | Send credentials cross-origin when appropriate | Needs explicit CORS permission; consider CSRF |
| `cache: "no-store"` | Avoid normal browser HTTP-cache reuse/storage | Does not control all intermediary/application caches |
| `keepalive: true` | Small request during unload | Tight budget; no durable execution guarantee |
| streamed body + `duplex: "half"` | Incremental upload where implemented | Limited support; not full duplex |

# Knowledge checks with answers

1. **Why does a JSON POST often preflight?** Its Content-Type is not a CORS-safelisted media type, and custom headers such as Authorization also trigger preflight.
2. **Can JavaScript read the result of `no-cors`?** Not the body/status/headers; the result is opaque.
3. **Does a preflight send cookies?** No; the preflight itself is sent without credentials.
4. **What does `duplex: "half"` mean?** Streaming upload mode where the browser sends the entire request before processing the response; it is not full duplex.
5. **Does `targetAddressSpace: "local"` grant access to a LAN host?** No. Browser Local Network Access/security checks still govern the request.
6. **Why can a 503 response fulfill fetch?** An HTTP response was received; status policy is application-level and must be checked.

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)
- [MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN HTTP access control (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
