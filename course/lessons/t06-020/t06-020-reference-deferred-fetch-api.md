
# Browser Fetch API, request cancellation, and response bodies — Reference: Deferred Fetch API and fetchLater quotas

# Scope and version

This lesson covers `window.fetchLater()` as specified by the current Fetch Standard and described by MDN checked 2026-11-16. It is experimental and not Baseline; use only after feature detection and quota/policy handling. See [WHATWG Fetch deferred fetching](https://fetch.spec.whatwg.org/#deferred-fetch), [MDN Window.fetchLater](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetchLater), [MDN DeferredRequestInit](https://developer.mozilla.org/en-US/docs/Web/API/DeferredRequestInit), and [Using Deferred Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Deferred_Fetch).

# How this group fits the mental model

Ordinary `fetch()` starts work now and gives script a promise for the response. `fetchLater()` records a request for browser-controlled later activation, usually when the page's fetch group ends or after an optional delay. Its purpose is a best-effort end-of-visit report whose payload can be updated before activation. The eventual response is intentionally discarded, so this is not a way to defer an ordinary data request while retaining the result.

# Supplied names explained

- `Window.fetchLater()` — Creates a deferred fetch from a URL/request and optional init; it returns synchronously with a `FetchLaterResult`, not a Promise for a response. The request activates at page/fetch-group termination or after the configured delay, whichever occurs first under browser scheduling. It is limited-availability and experimental.
- `DeferredRequestInit` — RequestInit-like dictionary accepted by fetchLater with the additional `activateAfter` delay. It otherwise configures method, headers, body, signal, credentials, and related Fetch options subject to deferred-fetch restrictions.
- `DeferredRequestInit.activateAfter` — Optional delay in milliseconds. A negative value throws `RangeError`; the browser may send at/after the requested time or earlier at page termination, and batching means actual transmission time is not an exact timer guarantee.
- `FetchLaterResult` — Result handle for the deferred request. It does not expose response status, headers, or body because the request can be sent after the document is gone.
- `FetchLaterResult.activated` — Read-only boolean initially false, later set true when the browser has sent/activated the request. It does not confirm server receipt, HTTP success, or application processing.
- `Deferred fetch response is not exposed` — The browser ignores the eventual response, including status, headers, and body. Use ordinary fetch when outcome or response data matters.
- `Deferred fetch activation on timeout or page termination` — The request is sent when the delay elapses or the fetch group terminates (for example, when the page closes or navigates), whichever condition occurs first. The user agent may also activate sooner when it expects to lose the opportunity to run scripts, such as after a long-hidden/background period. Scheduling and batching mean this is not an exact timer.
- `Deferred fetch abort behavior` — Pass an AbortSignal to cancel a deferred request while the document still controls it and before activation. Once sent—often after the page has gone—the request cannot be canceled from that destroyed context.
- `Deferred fetch ReadableStream body restriction` — A ReadableStream request body cannot be deferred. The browser needs a bounded payload it can retain and schedule.
- `Deferred fetch connect-src CSP requirement` — The destination is governed by Content Security Policy `connect-src`, like a fetch connection; a violation can block creation/use.
- `Deferred fetch Permissions Policy directives` — `deferred-fetch` controls the main quota delegation and `deferred-fetch-minimal` controls the shared minimal subframe quota. A blocked policy can surface as `QuotaExceededError`, so that exception does not prove arithmetic quota exhaustion alone.
- `Deferred fetch top-level traversable quota` — The current standard allocates 640 KiB to a top-level traversable (a browser tab), not independently to every document. The top-level document and same-origin nested documents share the available allocation; policy can reserve or delegate parts to cross-origin nested contexts. Quota counts the serialized URL, referrer, headers, and body, not just body bytes.
- `Deferred fetch top-level and subframe quotas` — By default 128 KiB of the tab allocation is reserved for delegation under `deferred-fetch-minimal`, leaving 512 KiB initially available to the top-level document's pool. Cross-origin subframes can receive 8 KiB by default or a 64 KiB reservation under `deferred-fetch` policy; reservations reduce the remaining shared pool and can be reclaimed in specified cases.
- `Deferred fetch per-origin quota` — Only 64 KiB of the top-level pool can be used concurrently for the same reporting/request origin; a request over quota can throw even when the document-wide total is not exhausted.

# Quota and lifecycle model

The API is suited to modest reporting payloads, not a durable job queue. A page can update/cancel registered deferred requests before activation, but after page teardown there is no JavaScript execution to inspect status or retry. The `activated` flag means sent by the browser, not delivered successfully. A process crash, device shutdown, network failure, browser policy, quota exhaustion, or permissions policy can still prevent useful delivery.

Quota is shared by scripts and frames and is allocated as frames are added. Third-party libraries can consume quota; catch `QuotaExceededError` defensively, especially when embedding analytics vendors. Permission Policy both restricts capability and delegates quota; do not interpret an exception as proof that the page simply sent too many bytes. Read the current [MDN quota guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Deferred_Fetch) before designing a quota-sensitive integration because allocations can evolve.

FetchLater requests are available only from a fully active secure-context window, require an HTTP(S) potentially trustworthy URL, are controlled by `connect-src`, and reject bodies whose length is unknown (including a `ReadableStream`). The request is not a service-worker background sync and its service-worker mode is disabled in the deferred-fetch algorithm. Use a server endpoint designed for idempotent, best-effort telemetry; never rely on the client to report a critical transaction outcome.

# Examples

```js
if (typeof window.fetchLater === "function") {
  try {
    const deferred = window.fetchLater("/telemetry/page-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentSummary),
      activateAfter: 30_000
    });

    // This only reports browser activation, not server delivery/success.
    console.log(deferred.activated);
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      queueInMemoryForNextPageVisit(currentSummary);
    } else {
      throw error;
    }
  }
}
```

The fallback in this example is only an in-memory next-visit hint; production code should choose a privacy-reviewed, bounded fallback and avoid duplicating data when both deferred and ordinary sends may occur. Do not repeatedly retry quota failures in a loop.

# Common mistakes

- Expecting a Promise or `Response` from `fetchLater()`.
- Treating `.activated` as proof that the server accepted the event.
- Setting `activateAfter` and assuming exact wall-clock execution.
- Trying to defer a ReadableStream body.
- Treating it as an alternative for a critical POST whose response determines UI state.
- Assuming all quotas are 640 KiB per origin; the quota includes document/subframe allocations and per-origin caps.
- Ignoring that quota can be restricted by Permissions Policy and still surface as `QuotaExceededError`.
- Forgetting the `connect-src` CSP requirement or secure/trustworthy URL restrictions.
- Assuming a request can be canceled after it has activated or after the page is gone.
- Assuming service workers will intercept the deferred request as ordinary fetches.
- Shipping without feature detection because a browser standard or MDN article exists.

# Cross-item comparison

| API | Activation/lifetime | Response | Appropriate use |
| --- | --- | --- | --- |
| `fetch()` | Starts now; caller awaits work | Promise exposes Response | Ordinary API/data request |
| Fetch `keepalive` | Starts now and may outlive page | Response is available while context remains | Small page-exit request where response handling may matter |
| `navigator.sendBeacon()` | Queues best-effort small send | No response | Small analytics when delivery confirmation is unnecessary |
| `window.fetchLater()` | Browser defers until timeout or fetch-group termination | No response ever exposed | Updateable end-of-visit report on supporting browsers |
| Background Sync/service-worker queue | Service-worker lifecycle and browser policy | Depends on application design | More durable retry design where supported; distinct API/complexity |

# Knowledge checks with answers

1. **What does `FetchLaterResult.activated` prove?** Only that the browser activated/sent the deferred request, not server receipt or success.
2. **Can the eventual status or response body be read?** No, it is discarded by design.
3. **Does `activateAfter: 1000` guarantee transmission exactly one second later?** No. The browser can activate at termination or batch/schedule transmission.
4. **Can you defer a ReadableStream body?** No.
5. **What is the default documented total quota?** 640 KiB per top-level traversable/tab, with delegated subframe reservations and a 64 KiB per-reporting-origin cap; policy can reduce or redistribute what a document can use.
6. **Does a `QuotaExceededError` always mean too many bytes were queued?** No. Permissions Policy restrictions can also produce the exception.

# Further reading

- [WHATWG Fetch deferred fetching](https://fetch.spec.whatwg.org/#deferred-fetch)
- [MDN Window.fetchLater](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetchLater)
- [MDN FetchLaterResult](https://developer.mozilla.org/en-US/docs/Web/API/FetchLaterResult)
- [MDN DeferredRequestInit](https://developer.mozilla.org/en-US/docs/Web/API/DeferredRequestInit)
- [MDN Using Deferred Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Deferred_Fetch)
- [Permissions-Policy: deferred-fetch](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/deferred-fetch)
