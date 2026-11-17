<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser Fetch API, request cancellation, and response bodies — Exercises and worked solutions

# Goals

Practice handling HTTP errors separately from network failures, validating response contracts, avoiding duplicate body consumption, composing cancellation, reasoning about CORS, and selecting streaming or keepalive behavior safely.

# Worked example

```js
async function getJson(url, { signal } = {}) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal
  });

  if (response.status === 204) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

The helper has an explicit no-content contract. Other non-2xx responses are converted to application errors. Network, CORS, and abort failures reject before the status checks and should be handled by the caller. The body is consumed once. [WHATWG Fetch](https://fetch.spec.whatwg.org/)

# Exercises

## Exercise 1 — Distinguish HTTP and transport failures

Write a helper that returns parsed JSON for 2xx, returns `null` for 204, throws an error that includes the status for other HTTP responses, and preserves a network/abort rejection. Explain why a 404 does not enter `catch` unless your code throws.

## Exercise 2 — Two consumers of a response

You need to log a small JSON response as text and also parse it. Write the correct clone/read order. Explain why this is inappropriate for large streaming bodies and how you would instead parse once and log selected fields.

## Exercise 3 — Latest search wins

Implement a search function that aborts the previous request, handles only the current result, ignores only its own abort, and still reports network or HTTP failures. Include a race guard beyond AbortController.

## Exercise 4 — Predict CORS behavior

A page sends a cross-origin POST with `Content-Type: application/json`, `Authorization`, and `credentials: "include"`. List the browser/server requirements and explain what the page sees if the preflight or actual CORS check fails. Explain why changing `mode` to `no-cors` is not a fix.

## Exercise 5 — Large response body

Read a large UTF-8 text response incrementally and stop early if the user cancels. Use a reader, decode chunks safely across byte boundaries, and release/cancel resources. State when `Response.textStream()` is a simpler but less compatible option.

## Exercise 6 — Streaming upload and keepalive decision

You have a 400 MiB file upload and a 2 KiB analytics event sent on page close. Decide whether to use a streamed Fetch request with `duplex`, `keepalive`, `sendBeacon`, or a normal upload. Explain browser support and size/lifetime boundaries.

## Exercise 7 — Deferred end-of-visit telemetry

Feature-detect `window.fetchLater()` and queue a small POST report with an activation delay and `AbortSignal`. Handle quota/policy failure. Explain what `.activated` proves, when the response is available, and how the default quota is allocated.

# Progressive hints

1. **Exercise 1:** Inspect status after `await fetch`; only call `json()` for responses whose body contract contains JSON.
2. **Exercise 2:** `clone()` before either branch consumes the body.
3. **Exercise 3:** Abort first, then create a controller; use an incrementing sequence or controller identity check before rendering.
4. **Exercise 4:** The custom content type and Authorization trigger preflight. Credentialed actual access needs explicit origin and credentials permission.
5. **Exercise 5:** Use `TextDecoderStream` to preserve decoding across byte chunks; cancel on early exit and release the reader lock in `finally`.
6. **Exercise 6:** Keepalive is for a small request and has a 64 KiB budget. A large upload should remain an explicit upload flow; streaming support is not universal.
7. **Exercise 7:** `fetchLater()` is secure-context/window-only and experimental. It returns a synchronous result handle, not a promise/response. Catch `QuotaExceededError` and do not treat activation as delivery confirmation.

# Complete solutions

## Exercise 1

```js
async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(`Request failed: HTTP ${response.status}`);
  return response.json();
}
```

The `fetch()` promise fulfills when an HTTP response is exposed, including for 404/500. The helper creates an application error after inspecting that response. Network, CORS, and abort failures reject `fetch()` itself and are left intact for the caller to distinguish.

## Exercise 2

```js
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const copy = response.clone(); // before consuming either body
const [rawText, data] = await Promise.all([copy.text(), response.json()]);
log(rawText);
useData(data);
```

This duplicates body consumption and may tee/buffer; use only for bounded diagnostics, taking care not to log secrets. Usually parse once and log selected safe fields. For large bodies, process one stream path instead of maintaining two branches.

## Exercise 3

```js
let active;
let generation = 0;

async function search(query) {
  active?.abort();
  const controller = new AbortController();
  active = controller;
  const mine = ++generation;
  try {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (mine === generation && !controller.signal.aborted) render(result);
  } catch (error) {
    if (!controller.signal.aborted) reportError(error);
  } finally {
    if (active === controller) active = undefined;
  }
}
```

The sequence check prevents an obsolete completion from updating UI even if cancellation races with completion or a downstream step is non-cooperative. The catch does not hide HTTP failures because the helper throws them; it suppresses only the current controller's abort.

## Exercise 4

The JSON Content-Type and Authorization header make the request non-safelisted, so the browser normally sends an OPTIONS preflight with requested method/headers. The server must allow the origin, POST method, and requested headers. Because credentials are included, the actual response must use an explicit matching `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`; `*` is invalid for credentialed CORS. The preflight itself is sent without credentials. A failed check appears to JavaScript as a generic fetch rejection, not a readable response/status. `no-cors` only produces an opaque result with no readable body/status/headers and restricts headers/methods, so it cannot satisfy this use case. [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## Exercise 5

```js
async function consumeText(url, signal, onChunk) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body) return;

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (signal?.aborted) break;
      if (onChunk(value) === false) {
        await reader.cancel("consumer stopped early");
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

The decoder preserves multi-byte characters split between underlying byte chunks. A signal passed to fetch aborts the response stream, but the callback can also stop voluntarily. `Response.textStream()` offers a direct decoded stream on supporting browsers; it remains limited availability, so feature-detect it and use a decoding pipeline fallback where needed. [MDN ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)

## Exercise 6

Use an ordinary upload flow for the 400 MiB file, with progress/UI, resumability where required, retries, server-side limits, and explicit cancellation. A streaming request body can reduce client buffering, but request-stream support and `duplex: "half"` are uneven and do not provide full duplex; it is not automatically the best upload architecture. A 2 KiB best-effort event can use `navigator.sendBeacon()` if no response is needed, or `fetch(..., { keepalive: true })` when method/headers/response access matter. Keepalive is constrained by a 64 KiB budget and browser lifecycle/policy, so it is not a durable queue. [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)

## Exercise 7

```js
function queueReport(report, signal) {
  if (typeof window.fetchLater !== "function") return null;
  try {
    return window.fetchLater("/telemetry/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      activateAfter: 30_000,
      signal
    });
  } catch (error) {
    if (error.name === "QuotaExceededError") return null;
    throw error;
  }
}
```

The returned `FetchLaterResult` is synchronous; `.activated` only says the browser invoked the request. No response is exposed, so this is appropriate only for best-effort telemetry. The current standard allocates 640 KiB per top-level traversable/tab, with 128 KiB initially reserved for delegated minimal subframe quota and a 64 KiB cap per reporting origin. Quota is shared and policy-controlled; older browsers may not implement this experimental API. The signal can cancel a still-pending request before activation.

# Tests and edge cases

- Server returns 204 with no body; helper must not call `json()`.
- Server returns 404 JSON; helper throws a status error rather than treating it as network rejection.
- Server returns malformed JSON with 200; parsing rejects and is handled separately.
- Abort before headers; fetch rejects with the signal reason.
- Abort after headers while a reader is active; body reading is canceled/rejected and the reader lock is released.
- Search A resolves after search B; only B may render.
- CORS preflight denies Authorization; JavaScript receives rejection and cannot inspect the preflight response.
- `mode: "no-cors"` is tested to confirm the returned response remains opaque.
- Stream chunk divides a multibyte UTF-8 character; decoded text must remain correct.
- Keepalive payload or aggregate budget is exceeded; handle rejection rather than assuming delivery.
- Browser lacks `textStream` or streaming request support; the fallback path remains correct.
- `fetchLater` is unavailable, the document is not active/secure, the URL is untrustworthy, or quota/policy rejects the request; feature detection and a best-effort fallback prevent it from becoming a required workflow.

# Reflection questions

1. When should an HTTP status become an exception in your application abstraction?
2. Why is cloning a response not the same as reading it twice without cost?
3. Which safeguards prevent an aborted-but-late request from rendering stale data?
4. Which CORS settings belong on the client and which must be set by the server?
5. What delivery guarantees do you need before choosing keepalive or sendBeacon?

# Further reading

- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
